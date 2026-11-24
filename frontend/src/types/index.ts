export type Role = 'farmer' | 'admin' | 'guest';

export type SupportedLanguage = 
  | 'en' 
  | 'hi' 
  | 'mr' 
  | 'gu' 
  | 'pa' 
  | 'bn' 
  | 'or' 
  | 'ta' 
  | 'te' 
  | 'kn' 
  | 'ml';

export type Language = SupportedLanguage | string;

export interface User {
  id: string;
  name: string;
  phone: string;
  role: Role;
  farmerId?: string;
}

export interface FarmerProfile {
  id: string;
  farmerId: string;
  name: string;
  nameHi: string;
  phone: string;
  village: string;
  district: string;
  state: string;
  landAreaAcres: number;
  crop: string;
  category: string; // "Small Farmer", "Marginal Farmer", "Large Farmer"
  bankName: string;
  accountNumberMasked: string;
  kccActive: boolean;
  avatarUrl?: string;
}

export type VerificationStatus = 
  | 'Verified' 
  | 'Needs Review' 
  | 'Possible Discrepancy' 
  | 'Under Review';

export interface LoanVerificationData {
  bankName: string;
  loanAccountRef: string;
  loanType: string;
  approvedAmount: number;
  disbursedAmount: number;
  interestRate: number;
  deductions: number;
  repayments?: number;
  loanDate: string;
}

export interface LoanVerificationResult {
  id: string;
  status: VerificationStatus;
  approvedAmount: number;
  disbursedAmount: number;
  deductions: number;
  difference: number;
  isFlagged: boolean;
  statusLabel: string;
  statusLabelHi: string;
  reasons: string[];
  reasonsHi: string[];
  explanation: string;
  explanationHi: string;
  arithmeticBreakdown: {
    label: string;
    amount: number;
  }[];
  date: string;
}

export interface MSPVerificationData {
  crop: string;
  quantityQuintals: number;
  mspRatePerQuintal: number;
  actualPaymentReceived: number;
  procurementCenter?: string;
  paymentDate: string;
}

export interface MSPVerificationResult {
  id: string;
  crop: string;
  quantityQuintals: number;
  mspRate: number;
  expectedPayment: number;
  actualPayment: number;
  difference: number;
  status: VerificationStatus;
  isFlagged: boolean;
  reasons: string[];
  reasonsHi: string[];
  explanation: string;
  explanationHi: string;
  date: string;
}

export interface InsuranceVerificationData {
  insuranceRef: string;
  crop: string;
  season: string;
  premiumPaid: number;
  claimAmountExpected: number;
  amountReceived: number;
  claimStatus: string;
  filingDate: string;
}

export interface InsuranceVerificationResult {
  id: string;
  insuranceRef: string;
  crop: string;
  claimAmountExpected: number;
  amountReceived: number;
  difference: number;
  status: VerificationStatus;
  isFlagged: boolean;
  reasons: string[];
  reasonsHi: string[];
  explanation: string;
  explanationHi: string;
  date: string;
}

export interface Scheme {
  id: string;
  title: string;
  titleHi: string;
  category: 'Subsidy' | 'Insurance' | 'Loan';
  description: string;
  descriptionHi: string;
  benefits: string;
  benefitsHi: string;
  eligibilityStatus: 'Eligible' | 'Possibly Eligible' | 'Not Eligible';
  deadline: string;
  documentsRequired: string[];
  applicationUrl?: string;
  state: string;
}

export interface Grievance {
  id: string;
  grievanceRef: string;
  farmerId: string;
  farmerName: string;
  issueType: 'Loan Discrepancy' | 'MSP Payment Delay' | 'Insurance Claim Issue' | 'Scheme Eligibility';
  description: string;
  status: 'Open' | 'In Progress' | 'Resolved' | 'Escalated';
  date: string;
  attachmentName?: string;
  resolutionNotes?: string;
}

export interface ReportItem {
  id: string;
  title: string;
  titleHi: string;
  reportType: 'Loan Verification' | 'MSP Payment' | 'Insurance Claim' | 'Scheme Eligibility';
  referenceId: string;
  date: string;
  status: VerificationStatus;
  fileSize: string;
  downloadUrl?: string;
}

export interface AdminStats {
  totalRecords: number;
  verifiedCount: number;
  discrepanciesCount: number;
  pendingComplaints: number;
}

export interface AdminCase {
  id: string;
  farmerName: string;
  farmerId: string;
  district: string;
  recordType: 'Loan' | 'MSP' | 'Insurance' | 'Scheme';
  expectedAmount: number;
  actualAmount: number;
  difference: number;
  status: VerificationStatus;
  date: string;
  notes?: string;
}
