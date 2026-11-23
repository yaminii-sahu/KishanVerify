try:
    import fitz  # PyMuPDF
except ImportError:
    fitz = None
import re
import io
from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from typing import Optional
from PIL import Image

try:
    import pytesseract
except ImportError:
    pytesseract = None

router = APIRouter(prefix="/ocr", tags=["Document OCR & Parsing"])

class LoanOCRExtractResponse(BaseModel):
    bank_name: Optional[str] = None
    loan_account_ref: Optional[str] = None
    approved_amount: Optional[float] = None
    disbursed_amount: Optional[float] = None
    interest_rate: Optional[float] = None
    deductions: Optional[float] = None
    loan_date: Optional[str] = None
    loan_type: Optional[str] = None
    confidence: float = 0.0
    raw_text_snippet: Optional[str] = None

@router.post("/extract-loan", response_model=LoanOCRExtractResponse)
async def extract_loan_document(file: UploadFile = File(...)):
    """
    Extracts financial parameters from an uploaded KCC / Loan Sanction Letter or Bank Statement.
    Uses PyMuPDF for text PDFs and Tesseract OCR for scanned images/pages.
    Returns null for any field that cannot be identified from the document.
    """
    allowed_exts = ('.pdf', '.png', '.jpg', '.jpeg', '.txt')
    if not file.filename.lower().endswith(allowed_exts):
        raise HTTPException(status_code=400, detail="Only PDF, PNG, JPG, or JPEG files are supported.")

    contents = await file.read()
    if len(contents) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File size exceeds the 5 MB limit.")

    raw_text = ""

    # 1. PyMuPDF text extraction for PDFs
    if file.filename.lower().endswith('.pdf'):
        if fitz is not None:
            try:
                doc = fitz.open(stream=contents, filetype="pdf")
                for page in doc:
                    page_text = page.get_text()
                    raw_text += page_text + "\n"

                # If PDF text layer is empty and pytesseract is available, OCR the first page
                if not raw_text.strip() and pytesseract is not None:
                    try:
                        first_page = doc[0]
                        pix = first_page.get_pixmap()
                        img = Image.open(io.BytesIO(pix.tobytes("png")))
                        raw_text = pytesseract.image_to_string(img)
                    except Exception:
                        pass
            except Exception as e:
                raw_text = contents.decode("utf-8", errors="ignore")
        else:
            raw_text = contents.decode("utf-8", errors="ignore")
    elif file.filename.lower().endswith(('.png', '.jpg', '.jpeg')):
        # 2. Image OCR via Tesseract if available
        if pytesseract is not None:
            try:
                img = Image.open(io.BytesIO(contents))
                raw_text = pytesseract.image_to_string(img)
            except Exception:
                raw_text = ""
    else:
        raw_text = contents.decode("utf-8", errors="ignore")

    res = LoanOCRExtractResponse()
    fields_found = 0

    if not raw_text.strip():
        return res

    res.raw_text_snippet = raw_text.strip()[:300]

    # --- Heuristic Parsing Rules ---
    # Bank Name
    known_banks = [
        "State Bank of India", "SBI", "Punjab National Bank", "PNB",
        "HDFC Bank", "ICICI Bank", "Bank of Baroda", "Chhattisgarh Rajya Gramin Bank",
        "Canara Bank", "Union Bank of India", "Durg District Central Cooperative Bank"
    ]
    for b in known_banks:
        if re.search(r'\b' + re.escape(b) + r'\b', raw_text, re.IGNORECASE):
            res.bank_name = "State Bank of India" if b.upper() == "SBI" else b
            fields_found += 1
            break

    # Loan Type
    if re.search(r'\b(Kisan Credit Card|KCC|Crop Loan)\b', raw_text, re.IGNORECASE):
        res.loan_type = "Crop Loan (KCC)"
        fields_found += 1
    elif re.search(r'\b(Term Loan|Agricultural Term Loan)\b', raw_text, re.IGNORECASE):
        res.loan_type = "Term Loan"
        fields_found += 1

    # Loan Account Ref
    acc_match = re.search(r'(?:Loan\s*(?:A/c|Account(?:\s*Number)?|Ref)|A/c\s*No\.?|Account\s*Number)\s*[:\-]?\s*([A-Za-z0-9\*\-]{6,25})', raw_text, re.IGNORECASE)
    if acc_match:
        raw_acc = acc_match.group(1).strip()
        # If captured word is 'Number', ignore
        if raw_acc.lower() != 'number':
            # Mask middle digits if not already masked
            if len(raw_acc) >= 8 and not '*' in raw_acc:
                res.loan_account_ref = raw_acc[:4] + "****" + raw_acc[-4:]
            else:
                res.loan_account_ref = raw_acc
            fields_found += 1

    # Sanctioned / Approved Amount
    sanction_match = re.search(r'(?:Sanction(?:ed)?|Approved|Loan)\s*(?:Amount|Limit)?\s*[:\-]?\s*(?:₹|Rs\.?|INR)?\s*([0-9,]+(?:\.[0-9]{1,2})?)', raw_text, re.IGNORECASE)
    if sanction_match:
        try:
            val = float(sanction_match.group(1).replace(',', ''))
            if val > 0:
                res.approved_amount = val
                fields_found += 1
        except ValueError:
            pass

    # Disbursed Amount
    disbursed_match = re.search(r'(?:Disbursed|Credited|Released|Net\s*Disbursal)\s*(?:Amount)?\s*[:\-]?\s*(?:₹|Rs\.?|INR)?\s*([0-9,]+(?:\.[0-9]{1,2})?)', raw_text, re.IGNORECASE)
    if disbursed_match:
        try:
            val = float(disbursed_match.group(1).replace(',', ''))
            if val > 0:
                res.disbursed_amount = val
                fields_found += 1
        except ValueError:
            pass

    # Interest Rate
    roi_match = re.search(r'(?:Interest\s*Rate|ROI|Rate\s*of\s*Interest)\s*[:\-]?\s*([0-9]+(?:\.[0-9]+)?)\s*%', raw_text, re.IGNORECASE)
    if roi_match:
        try:
            res.interest_rate = float(roi_match.group(1))
            fields_found += 1
        except ValueError:
            pass

    # Deductions
    ded_match = re.search(r'(?:Total\s*Deductions?|Deduction(?:s)?|Processing\s*Fee\s*\+\s*Insurance)\s*[:\-]?\s*(?:₹|Rs\.?|INR)?\s*([0-9,]+(?:\.[0-9]{1,2})?)', raw_text, re.IGNORECASE)
    if ded_match:
        try:
            res.deductions = float(ded_match.group(1).replace(',', ''))
            fields_found += 1
        except ValueError:
            pass

    # Loan Date
    date_match = re.search(r'(?:Sanction\s*Date|Dated|Date)\s*[:\-]?\s*([0-9]{4}[-/][0-9]{2}[-/][0-9]{2}|[0-9]{2}[-/][0-9]{2}[-/][0-9]{4})', raw_text, re.IGNORECASE)
    if date_match:
        raw_date = date_match.group(1)
        # Normalize to YYYY-MM-DD
        if '/' in raw_date:
            parts = raw_date.split('/')
            if len(parts[0]) == 4:
                res.loan_date = f"{parts[0]}-{parts[1]}-{parts[2]}"
            else:
                res.loan_date = f"{parts[2]}-{parts[1]}-{parts[0]}"
        else:
            res.loan_date = raw_date
        fields_found += 1

    # Confidence calculation: ratio of found fields out of 7 critical fields
    res.confidence = round(min(fields_found / 5.0, 1.0), 2)

    return res
