import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  Upload,
  Camera,
  FolderLock,
  FileText,
  Image as ImageIcon,
  Eye,
  Download,
  Trash2,
  Edit2,
  Search,
  Grid,
  List,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  X,
  HardDrive,
  Calendar,
  Lock,
  ExternalLink
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { 
  fetchDocumentsApi, 
  uploadDocumentApi, 
  updateDocumentApi, 
  deleteDocumentApi, 
  deleteAllDocumentsApi 
} from '../services/api';

const CATEGORIES = ['All', 'Identity', 'Land', 'Bank', 'Insurance', 'Scheme', 'Other'] as const;

export const DocumentsPage: React.FC = () => {
  const { t, language } = useLanguage();
  const { farmer } = useAuth();
  const navigate = useNavigate();

  const [documents, setDocuments] = useState<any[]>([]);
  const [storage, setStorage] = useState<{
    used_bytes: number;
    used_formatted: string;
    quota_bytes: number;
    quota_formatted: string;
    usage_percent: number;
  }>({
    used_bytes: 0,
    used_formatted: '0 B',
    quota_bytes: 52428800,
    quota_formatted: '50 MB',
    usage_percent: 0,
  });

  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Upload modal & state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadCategory, setUploadCategory] = useState<string>('Land');
  const [uploadNote, setUploadNote] = useState('');
  const [uploadExpiry, setUploadExpiry] = useState('');
  const [uploadMaskedId, setUploadMaskedId] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Edit modal
  const [editingDoc, setEditingDoc] = useState<any | null>(null);
  const [editName, setEditName] = useState('');
  const [editNote, setEditNote] = useState('');
  const [editExpiry, setEditExpiry] = useState('');

  // Preview modal
  const [previewDoc, setPreviewDoc] = useState<any | null>(null);

  // Delete all modal
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);

  // Toast
  const [toast, setToast] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const res = await fetchDocumentsApi(farmer.farmerId, activeCategory, searchQuery);
      if (res && res.documents) {
        setDocuments(res.documents);
        if (res.storage) setStorage(res.storage);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, [activeCategory, searchQuery]);

  // Client-side file validation
  const handleFileSelect = (file: File) => {
    setUploadError(null);
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(pdf|jpe?g|png)$/i)) {
      setUploadError(language === 'hi' 
        ? 'केवल PDF, JPG और PNG फ़ाइलें स्वीकृत हैं।' 
        : 'Only PDF, JPG, and PNG files are accepted.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError(language === 'hi' 
        ? 'फ़ाइल का आकार 5 MB से कम होना चाहिए।' 
        : 'File size must be under 5 MB.');
      return;
    }
    setSelectedFile(file);
    setShowUploadModal(true);
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(20);
    setUploadError(null);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('category', uploadCategory);
    if (uploadNote) formData.append('note', uploadNote);
    if (uploadExpiry) formData.append('expiry_date', uploadExpiry);
    if (uploadMaskedId) formData.append('masked_id', uploadMaskedId);

    try {
      setUploadProgress(60);
      await uploadDocumentApi(formData, farmer.farmerId);
      setUploadProgress(100);
      showToast(language === 'hi' ? 'दस्तावेज़ सफलतापूर्वक सहेजा गया!' : 'Document saved successfully!');
      setShowUploadModal(false);
      setSelectedFile(null);
      setUploadNote('');
      setUploadExpiry('');
      setUploadMaskedId('');
      loadDocuments();
    } catch (err: any) {
      setUploadError(err.response?.data?.detail || 'Upload failed. Please verify the file and try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (docUuid: string) => {
    if (!window.confirm(language === 'hi' ? 'क्या आप इस दस्तावेज़ को हटाना चाहते हैं?' : 'Are you sure you want to delete this document?')) {
      return;
    }
    try {
      await deleteDocumentApi(docUuid, farmer.farmerId);
      showToast(language === 'hi' ? 'दस्तावेज़ हटा दिया गया' : 'Document deleted');
      loadDocuments();
    } catch (err) {
      console.error(err);
      alert('Delete failed');
    }
  };

  const handleDeleteAll = async () => {
    try {
      await deleteAllDocumentsApi(farmer.farmerId);
      setShowDeleteAllModal(false);
      showToast(language === 'hi' ? 'सभी निजी दस्तावेज़ हटा दिए गए' : 'All personal documents deleted');
      loadDocuments();
    } catch (err) {
      console.error(err);
      alert('Failed to delete data');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDoc) return;
    try {
      await updateDocumentApi(editingDoc.doc_uuid, {
        original_name: editName,
        note: editNote,
        expiry_date: editExpiry,
      }, farmer.farmerId);
      showToast(language === 'hi' ? 'दस्तावेज़ अपडेट हो गया' : 'Document updated');
      setEditingDoc(null);
      loadDocuments();
    } catch (err) {
      console.error(err);
      alert('Update failed');
    }
  };

  const getDownloadUrl = (docUuid: string) => {
    return `/api/v1/documents/${docUuid}/download?farmer_id=${farmer.farmerId}`;
  };

  const getPreviewUrl = (docUuid: string) => {
    return `/api/v1/documents/${docUuid}/preview?farmer_id=${farmer.farmerId}`;
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-forest text-white px-5 py-2.5 rounded-full shadow-dropdown text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top duration-200">
          <CheckCircle2 className="w-4 h-4 text-tint" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-warm-border">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/farmer')}
            className="w-9 h-9 rounded-full bg-cream-surface border border-warm-border flex items-center justify-center text-charcoal hover:bg-tint transition-colors shadow-soft"
            aria-label="Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-charcoal tracking-tight flex items-center gap-2">
              <FolderLock className="w-6 h-6 text-forest" />
              <span>{language === 'hi' ? 'मेरे दस्तावेज़ (वॉल्ट)' : 'My Documents Vault'}</span>
            </h1>
            <p className="text-xs text-muted mt-0.5">
              {language === 'hi' 
                ? 'कृषि अभिलेखों, भूमि रिकॉर्ड और पहचान पत्रों के लिए सुरक्षित निजी वॉल्ट' 
                : 'Secure personal vault for land titles, subsidy applications, and identity proofs'}
            </p>
          </div>
        </div>

        {/* Upload Action Buttons */}
        <div className="flex items-center gap-2">
          {/* File Picker Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-forest hover:bg-forest-dark text-white font-bold text-xs shadow-soft transition-all active:scale-98 min-h-[42px]"
          >
            <Upload className="w-4 h-4" />
            <span>{language === 'hi' ? 'दस्तावेज़ अपलोड करें' : 'Upload Document'}</span>
          </button>

          {/* Camera Button on Phone/Tablet */}
          <button
            onClick={() => cameraInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-3 py-2.5 rounded-xl bg-cream-surface border border-warm-border text-forest hover:bg-tint font-bold text-xs shadow-soft transition-all active:scale-98 min-h-[42px]"
            title="Scan / Take photo with Camera"
          >
            <Camera className="w-4 h-4" />
            <span className="hidden sm:inline">{language === 'hi' ? 'कैमरा' : 'Camera'}</span>
          </button>
        </div>
      </div>

      {/* Hidden File Inputs */}
      <input 
        ref={fileInputRef}
        type="file" 
        accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/*" 
        className="hidden" 
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileSelect(file);
          e.target.value = '';
        }} 
      />
      <input 
        ref={cameraInputRef}
        type="file" 
        accept="image/*" 
        capture="user"
        className="hidden" 
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileSelect(file);
          e.target.value = '';
        }} 
      />

      {/* Privacy Notice Banner */}
      <div className="bg-[#EBF2DE] border border-[#CAD8B6] rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-soft">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-forest text-white flex items-center justify-center shrink-0 mt-0.5">
            <Lock className="w-4 h-4 text-tint" />
          </div>
          <div>
            <p className="text-xs sm:text-sm font-bold text-charcoal">
              {language === 'hi' ? 'दस्तावेज़ केवल आपके लिए निजी हैं' : 'Documents are completely private to you'}
            </p>
            <p className="text-[11px] sm:text-xs text-[#4F6244] mt-0.5 leading-snug">
              {language === 'hi' 
                ? 'फ़ाइलें सर्वर पर कूटलेखित हैं और सार्वजनिक रूप से सुलभ नहीं हैं। संवेदनशील पहचान संख्याएं स्वतः मास्क्ड रहती हैं।' 
                : 'Stored outside the public web root with isolated ownership checks. Sensitive identification numbers remain masked.'}
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowDeleteAllModal(true)}
          className="text-xs font-semibold text-status-discrepancy-text hover:underline shrink-0"
        >
          {language === 'hi' ? 'मेरा डेटा हटाएं' : 'Delete all my data'}
        </button>
      </div>

      {/* Storage Usage Meter */}
      <div className="bg-cream-surface rounded-2xl p-4 sm:p-5 border border-warm-border shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-10 h-10 rounded-xl bg-tint text-forest flex items-center justify-center shrink-0">
            <HardDrive className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-[200px]">
            <div className="flex items-center justify-between text-xs font-bold text-charcoal mb-1">
              <span>{language === 'hi' ? 'वॉल्ट संग्रहण उपयोग' : 'Vault Storage Usage'}</span>
              <span>{storage.used_formatted} / {storage.quota_formatted} ({storage.usage_percent}%)</span>
            </div>
            <div className="w-full h-2 rounded-full bg-warm-border overflow-hidden">
              <div 
                className="h-full bg-forest rounded-full transition-all duration-300" 
                style={{ width: `${Math.max(2, storage.usage_percent)}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-muted">
          <span>{documents.length} {language === 'hi' ? 'दस्तावेज़ सुरक्षित' : 'Documents Stored'}</span>
        </div>
      </div>

      {/* Filter Chips & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Category Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all min-h-[36px] ${
                  isActive
                    ? 'bg-forest text-white shadow-soft'
                    : 'bg-cream-surface text-muted border border-warm-border hover:bg-tint/40'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Search & Grid/List Toggle */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-60">
            <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'hi' ? 'खोजें...' : 'Search documents...'}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-cream-surface border border-warm-border text-xs text-charcoal placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-olive min-h-[38px]"
            />
          </div>

          <div className="flex items-center rounded-xl bg-cream-surface border border-warm-border p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-forest text-white' : 'text-muted hover:text-charcoal'}`}
              aria-label="Grid view"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-forest text-white' : 'text-muted hover:text-charcoal'}`}
              aria-label="List view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Loading & Empty States */}
      {loading ? (
        <div className="py-16 text-center text-muted text-xs">
          <div className="w-8 h-8 border-2 border-forest border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p>{language === 'hi' ? 'दस्तावेज़ लोड हो रहे हैं...' : 'Loading vault documents...'}</p>
        </div>
      ) : documents.length === 0 ? (
        <div className="bg-cream-surface rounded-2xl p-10 border border-warm-border text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-tint text-forest flex items-center justify-center mx-auto shadow-soft">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-charcoal">
            {language === 'hi' ? 'कोई दस्तावेज़ नहीं मिला' : 'No Documents Found'}
          </h3>
          <p className="text-xs text-muted max-w-sm mx-auto">
            {language === 'hi' 
              ? 'अपने आधार, खसरा, बैंक पासबुक या बीमा कागजात सुरक्षित रूप से अपलोड करें।' 
              : 'Upload your Aadhaar, land khasra, passbook or insurance policy for instant verification across schemes.'}
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-5 py-2.5 rounded-xl bg-forest text-white text-xs font-bold shadow-soft hover:bg-forest-dark transition-all"
          >
            {language === 'hi' ? 'पहला दस्तावेज़ अपलोड करें' : 'Upload First Document'}
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc) => {
            const isPdf = doc.mime_type.includes('pdf');
            return (
              <div 
                key={doc.doc_uuid}
                className="bg-cream-surface rounded-2xl p-4 border border-warm-border hover:border-olive hover:shadow-card transition-all flex flex-col justify-between space-y-3 shadow-soft group"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-tint text-forest text-[10px] font-bold">
                      {doc.category}
                    </span>
                    {doc.masked_id && (
                      <span className="font-mono text-[11px] font-semibold text-muted bg-cream px-2 py-0.5 rounded-md">
                        {doc.masked_id}
                      </span>
                    )}
                  </div>

                  {/* Icon & Name */}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-tint/80 text-forest flex items-center justify-center shrink-0">
                      {isPdf ? <FileText className="w-5 h-5 text-status-discrepancy-text" /> : <ImageIcon className="w-5 h-5 text-forest" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-charcoal truncate" title={doc.original_name}>
                        {doc.original_name}
                      </h4>
                      <p className="text-[11px] text-muted mt-0.5">
                        {doc.size_formatted} • {doc.uploaded_at}
                      </p>
                    </div>
                  </div>

                  {/* Note / Expiry */}
                  {doc.note && (
                    <p className="text-xs text-charcoal/80 bg-cream p-2.5 rounded-xl text-[11px] leading-snug line-clamp-2">
                      {doc.note}
                    </p>
                  )}

                  {doc.expiry_date && (
                    <div className="flex items-center gap-1.5 text-[11px] text-muted">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Expires: {doc.expiry_date}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-warm-border">
                  <button
                    onClick={() => setPreviewDoc(doc)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-forest hover:text-forest-dark"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{language === 'hi' ? 'देखें' : 'Preview'}</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <a
                      href={getDownloadUrl(doc.doc_uuid)}
                      download={doc.original_name}
                      className="w-8 h-8 rounded-lg hover:bg-tint text-muted hover:text-forest flex items-center justify-center transition-colors"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => {
                        setEditingDoc(doc);
                        setEditName(doc.original_name);
                        setEditNote(doc.note || '');
                        setEditExpiry(doc.expiry_date || '');
                      }}
                      className="w-8 h-8 rounded-lg hover:bg-tint text-muted hover:text-forest flex items-center justify-center transition-colors"
                      title="Edit details"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(doc.doc_uuid)}
                      className="w-8 h-8 rounded-lg hover:bg-status-discrepancy-bg text-muted hover:text-status-discrepancy-text flex items-center justify-center transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* LIST VIEW */
        <div className="bg-cream-surface rounded-2xl border border-warm-border divide-y divide-warm-border shadow-soft overflow-hidden">
          {documents.map((doc) => {
            const isPdf = doc.mime_type.includes('pdf');
            return (
              <div 
                key={doc.doc_uuid}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-tint/20 transition-colors"
              >
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-tint/80 text-forest flex items-center justify-center shrink-0">
                    {isPdf ? <FileText className="w-5 h-5 text-status-discrepancy-text" /> : <ImageIcon className="w-5 h-5 text-forest" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-charcoal truncate">
                        {doc.original_name}
                      </h4>
                      <span className="px-2 py-0.5 rounded-full bg-tint text-forest text-[10px] font-bold">
                        {doc.category}
                      </span>
                      {doc.masked_id && (
                        <span className="font-mono text-[10px] text-muted bg-cream px-1.5 py-0.5 rounded">
                          {doc.masked_id}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted truncate mt-0.5">
                      {doc.size_formatted} • {doc.uploaded_at} {doc.note ? `• ${doc.note}` : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => setPreviewDoc(doc)}
                    className="px-3 py-1.5 rounded-lg bg-tint text-forest font-bold text-xs hover:bg-olive hover:text-white transition-colors"
                  >
                    {language === 'hi' ? 'देखें' : 'Preview'}
                  </button>
                  <a
                    href={getDownloadUrl(doc.doc_uuid)}
                    download={doc.original_name}
                    className="w-8 h-8 rounded-lg hover:bg-tint text-muted hover:text-forest flex items-center justify-center transition-colors"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => {
                      setEditingDoc(doc);
                      setEditName(doc.original_name);
                      setEditNote(doc.note || '');
                      setEditExpiry(doc.expiry_date || '');
                    }}
                    className="w-8 h-8 rounded-lg hover:bg-tint text-muted hover:text-forest flex items-center justify-center transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(doc.doc_uuid)}
                    className="w-8 h-8 rounded-lg hover:bg-status-discrepancy-bg text-muted hover:text-status-discrepancy-text flex items-center justify-center transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ============================================================== */}
      {/* UPLOAD MODAL                                                   */}
      {/* ============================================================== */}
      {showUploadModal && selectedFile && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-charcoal/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-cream-surface rounded-t-3xl sm:rounded-2xl p-6 border border-warm-border shadow-dropdown space-y-4 max-h-[90dvh] overflow-y-auto animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-warm-border pb-3">
              <h3 className="text-base font-bold text-charcoal">
                {language === 'hi' ? 'दस्तावेज़ विवरण दर्ज करें' : 'Save Document to Vault'}
              </h3>
              <button 
                onClick={() => {
                  setShowUploadModal(false);
                  setSelectedFile(null);
                }}
                className="w-8 h-8 rounded-full hover:bg-tint flex items-center justify-center text-muted"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {uploadError && (
              <div className="p-3 rounded-xl bg-status-discrepancy-bg text-status-discrepancy-text text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            <form onSubmit={handleUploadSubmit} className="space-y-3.5 text-xs">
              <div className="p-3 rounded-xl bg-cream border border-warm-border">
                <p className="font-semibold text-charcoal truncate">{selectedFile.name}</p>
                <p className="text-[11px] text-muted">{(selectedFile.size / 1024).toFixed(1)} KB • {selectedFile.type || 'Document'}</p>
              </div>

              <div>
                <label className="block font-semibold text-charcoal mb-1">
                  {language === 'hi' ? 'श्रेणी' : 'Category'}
                </label>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-cream border border-warm-border text-charcoal font-medium focus:ring-1 focus:ring-olive"
                >
                  {CATEGORIES.filter(c => c !== 'All').map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-charcoal mb-1">
                  {language === 'hi' ? 'मास्क्ड संदर्भ आईडी (वैकल्पिक)' : 'Masked ID / Reference (Optional)'}
                </label>
                <input
                  type="text"
                  value={uploadMaskedId}
                  onChange={(e) => setUploadMaskedId(e.target.value)}
                  placeholder="e.g. XXXX-XXXX-8921 or KH-142/1"
                  className="w-full px-3 py-2.5 rounded-xl bg-cream border border-warm-border text-charcoal placeholder:text-muted focus:ring-1 focus:ring-olive"
                />
              </div>

              <div>
                <label className="block font-semibold text-charcoal mb-1">
                  {language === 'hi' ? 'विवरण या नोट (वैकल्पिक)' : 'Note or Description (Optional)'}
                </label>
                <input
                  type="text"
                  value={uploadNote}
                  onChange={(e) => setUploadNote(e.target.value)}
                  placeholder="e.g. Patan Khasra copy 2025"
                  className="w-full px-3 py-2.5 rounded-xl bg-cream border border-warm-border text-charcoal placeholder:text-muted focus:ring-1 focus:ring-olive"
                />
              </div>

              <div>
                <label className="block font-semibold text-charcoal mb-1">
                  {language === 'hi' ? 'समाप्ति तिथि (यदि लागू हो)' : 'Expiry Date (If applicable)'}
                </label>
                <input
                  type="text"
                  value={uploadExpiry}
                  onChange={(e) => setUploadExpiry(e.target.value)}
                  placeholder="e.g. 31 Dec 2026"
                  className="w-full px-3 py-2.5 rounded-xl bg-cream border border-warm-border text-charcoal placeholder:text-muted focus:ring-1 focus:ring-olive"
                />
              </div>

              {isUploading && (
                <div className="space-y-1">
                  <div className="w-full h-2 rounded-full bg-warm-border overflow-hidden">
                    <div 
                      className="h-full bg-forest rounded-full transition-all duration-300" 
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-muted text-center">{language === 'hi' ? 'सुरक्षित वॉल्ट में सहेज रहे हैं...' : 'Securing into vault...'}</p>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowUploadModal(false);
                    setSelectedFile(null);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-cream border border-warm-border font-semibold text-charcoal"
                >
                  {language === 'hi' ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-5 py-2.5 rounded-xl bg-forest hover:bg-forest-dark text-white font-bold shadow-soft disabled:opacity-50"
                >
                  {isUploading ? 'Uploading...' : (language === 'hi' ? 'वॉल्ट में जोड़ें' : 'Add to Vault')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* EDIT MODAL                                                     */}
      {/* ============================================================== */}
      {editingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-cream-surface rounded-2xl p-6 border border-warm-border shadow-dropdown space-y-4">
            <div className="flex items-center justify-between border-b border-warm-border pb-3">
              <h3 className="text-base font-bold text-charcoal">
                {language === 'hi' ? 'दस्तावेज़ संपादित करें' : 'Edit Document Details'}
              </h3>
              <button 
                onClick={() => setEditingDoc(null)}
                className="w-8 h-8 rounded-full hover:bg-tint flex items-center justify-center text-muted"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-charcoal mb-1">
                  {language === 'hi' ? 'फ़ाइल का नाम' : 'File Name'}
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-cream border border-warm-border text-charcoal font-medium focus:ring-1 focus:ring-olive"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-charcoal mb-1">
                  {language === 'hi' ? 'नोट या विवरण' : 'Note'}
                </label>
                <input
                  type="text"
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-cream border border-warm-border text-charcoal placeholder:text-muted focus:ring-1 focus:ring-olive"
                />
              </div>

              <div>
                <label className="block font-semibold text-charcoal mb-1">
                  {language === 'hi' ? 'समाप्ति तिथि' : 'Expiry Date'}
                </label>
                <input
                  type="text"
                  value={editExpiry}
                  onChange={(e) => setEditExpiry(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-cream border border-warm-border text-charcoal placeholder:text-muted focus:ring-1 focus:ring-olive"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingDoc(null)}
                  className="px-4 py-2.5 rounded-xl bg-cream border border-warm-border font-semibold text-charcoal"
                >
                  {language === 'hi' ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-forest hover:bg-forest-dark text-white font-bold shadow-soft"
                >
                  {language === 'hi' ? 'सहेजें' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* PREVIEW MODAL                                                  */}
      {/* ============================================================== */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-charcoal/60 backdrop-blur-xs">
          <div className="w-full max-w-3xl h-[85vh] bg-cream-surface rounded-2xl border border-warm-border shadow-dropdown flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-warm-border bg-cream shrink-0">
              <div className="flex items-center gap-2.5 truncate">
                <FileText className="w-4 h-4 text-forest shrink-0" />
                <span className="font-bold text-sm text-charcoal truncate">{previewDoc.original_name}</span>
                <span className="text-xs text-muted">({previewDoc.size_formatted})</span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={getDownloadUrl(previewDoc.doc_uuid)}
                  download={previewDoc.original_name}
                  className="px-3 py-1.5 rounded-lg bg-forest text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-soft hover:bg-forest-dark transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </a>
                <button 
                  onClick={() => setPreviewDoc(null)}
                  className="w-8 h-8 rounded-full hover:bg-tint flex items-center justify-center text-muted"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content iframe / img */}
            <div className="flex-1 bg-neutral-900 overflow-auto flex items-center justify-center p-2">
              {previewDoc.mime_type.includes('pdf') ? (
                <iframe 
                  src={getPreviewUrl(previewDoc.doc_uuid)}
                  title={previewDoc.original_name}
                  className="w-full h-full rounded border-0 bg-white"
                />
              ) : (
                <img 
                  src={getPreviewUrl(previewDoc.doc_uuid)}
                  alt={previewDoc.original_name}
                  className="max-w-full max-h-full object-contain"
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* DELETE ALL CONFIRMATION MODAL                                  */}
      {/* ============================================================== */}
      {showDeleteAllModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/50 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-cream-surface rounded-2xl p-6 border border-warm-border shadow-dropdown space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-status-discrepancy-bg text-status-discrepancy-text flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-charcoal">
              {language === 'hi' ? 'सभी दस्तावेज़ हटाएं?' : 'Delete All Personal Data?'}
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              {language === 'hi' 
                ? 'यह आपके सभी अपलोड किए गए निजी दस्तावेज़ों को सर्वर से हमेशा के लिए हटा देगा। यह क्रिया पूर्ववत नहीं की जा सकती।' 
                : 'This will permanently purge all uploaded files and records from your private vault. This action cannot be undone.'}
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setShowDeleteAllModal(false)}
                className="w-full py-2.5 rounded-xl bg-cream border border-warm-border font-semibold text-xs text-charcoal"
              >
                {language === 'hi' ? 'रद्द करें' : 'Cancel'}
              </button>
              <button
                onClick={handleDeleteAll}
                className="w-full py-2.5 rounded-xl bg-status-discrepancy-text text-white font-bold text-xs shadow-soft"
              >
                {language === 'hi' ? 'हाँ, सब हटाएं' : 'Yes, Delete All'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
