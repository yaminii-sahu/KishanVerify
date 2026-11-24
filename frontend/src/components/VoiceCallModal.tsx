import React, { useState, useEffect, useRef } from 'react';
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Languages,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  Building2,
  FileText,
  Clock,
  Sparkles,
  Send,
  CheckCircle,
  XCircle,
  ExternalLink,
} from 'lucide-react';
import {
  sendVoiceTurnApi,
  VoiceTurnResult,
  recordVoiceConsentApi,
} from '../services/api';

interface VoiceCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  language?: 'hi' | 'en';
  initialContext?: Record<string, any>;
}

interface MessageTurn {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  phoneticText?: string;
  time: string;
  card?: Record<string, any>;
  confirmationAction?: Record<string, any>;
}

export const VoiceCallModal: React.FC<VoiceCallModalProps> = ({
  isOpen,
  onClose,
  language: initialLang = 'hi',
  initialContext,
}) => {
  const [lang, setLang] = useState<'hi' | 'en'>(initialLang);
  const [callState, setCallState] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [audioPlaybackEnabled, setAudioPlaybackEnabled] = useState(true);
  const [messages, setMessages] = useState<MessageTurn[]>([]);
  const [manualInput, setManualInput] = useState('');
  const [sessionId, setSessionId] = useState<string>(() => `vcall-${Date.now().toString(36)}`);
  const [pendingConfirmation, setPendingConfirmation] = useState<Record<string, any> | null>(null);
  const [suggestedPhrases, setSuggestedPhrases] = useState<string[]>([]);
  const [showPersonDirectory, setShowPersonDirectory] = useState(false);
  const [consentAcknowledged, setConsentAcknowledged] = useState(true);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const isHi = lang === 'hi';

  // Auto-scroll transcript
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, callState]);

  // Handle initialization on open
  useEffect(() => {
    if (isOpen) {
      const newSess = `vcall-${Date.now().toString(36)}`;
      setSessionId(newSess);
      setPendingConfirmation(null);
      setErrorBanner(null);

      // Welcome message
      const welcomeText = isHi
        ? 'नमस्ते रमेश कुमार जी! मैं किसानवेरीफाई एआई कॉल सहायक हूँ। आप अपने ऋण, धान एमएसपी भुगतान, फसल बीमा या योजनाओं के बारे में पूछ सकते हैं।'
        : 'Namaste Ramesh Kumar! I am your KisanVerify AI call assistant. Ask me about your loan, MSP paddy payment, PMFBY claim, or eligible schemes.';

      const initialTurn: MessageTurn = {
        id: 'msg-0',
        sender: 'agent',
        text: welcomeText,
        phoneticText: isHi
          ? 'नमस्ते रमेश कुमार जी! मैं किसानवेरीफाई एआई कॉल सहायक हूँ।'
          : 'Namaste Ramesh Kumar! I am your KisanVerify AI call assistant.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages([initialTurn]);
      setSuggestedPhrases(
        isHi
          ? ['ऋण का अंतर क्या है?', 'धान का एमएसपी भुगतान', 'फसल बीमा दावा स्थिति', 'सहायता अधिकारी से बात']
          : ['What is my loan difference?', 'MSP paddy payment', 'Crop insurance claim status', 'Talk to an officer']
      );

      // Record consent
      recordVoiceConsentApi(newSess, true);

      // Auto speak greeting if audio enabled
      if (audioPlaybackEnabled) {
        speakText(welcomeText, isHi ? 'hi-IN' : 'en-IN');
      }
    } else {
      stopListening();
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    }
  }, [isOpen, lang]);

  // Web Speech Synthesis (Text to Speech)
  const speakText = (text: string, voiceLang: string) => {
    if (!audioPlaybackEnabled || typeof window === 'undefined' || !window.speechSynthesis) {
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/₹/g, isHi ? ' रुपये ' : ' rupees ').replace(/[•\*#_]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = voiceLang;
      utterance.rate = 0.95; // slightly slower for rural clarity

      utterance.onstart = () => {
        setCallState('speaking');
      };

      utterance.onend = () => {
        setCallState('idle');
      };

      utterance.onerror = () => {
        setCallState('idle');
      };

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('TTS speech error:', e);
      setCallState('idle');
    }
  };

  // Web Speech Recognition (Speech to Text)
  const startListening = () => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrorBanner(
        isHi
          ? 'आपके ब्राउज़र में वॉइस रिकॉग्निशन समर्थित नहीं है। कृपया नीचे लिखकर संदेश भेजें।'
          : 'Speech recognition is not supported in this browser. Please type your query below.'
      );
      return;
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      const recognition = new SpeechRecognition();
      recognition.lang = isHi ? 'hi-IN' : 'en-IN';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setCallState('listening');
        setErrorBanner(null);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript && transcript.trim()) {
          handleUserSpeech(transcript.trim());
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setCallState('idle');
        if (event.error === 'not-allowed') {
          setErrorBanner(
            isHi
              ? 'माइक्रोफ़ोन अनुमति अस्वीकृत है। कृपया ब्राउज़र सेटिंग में माइक्रोफ़ोन चालू करें।'
              : 'Microphone permission denied. Please allow microphone access in settings.'
          );
        }
      };

      recognition.onend = () => {
        if (callState === 'listening') {
          setCallState('idle');
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.warn('Recognition start error:', e);
      setCallState('idle');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
    setCallState('idle');
  };

  // Process user speech turn
  const handleUserSpeech = async (speechText: string) => {
    stopListening();
    if (!speechText.trim()) return;

    const userTurn: MessageTurn = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: speechText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userTurn]);
    setCallState('thinking');

    try {
      const historyPayload = messages.slice(-6).map((m) => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text,
      }));

      const res: VoiceTurnResult = await sendVoiceTurnApi({
        session_id: sessionId,
        farmer_id: 'FV12345',
        user_speech_text: speechText,
        language: lang,
        history: historyPayload,
        current_record_context: initialContext,
        confirmation_pending: pendingConfirmation || undefined,
      });

      const agentTurn: MessageTurn = {
        id: `agent-${Date.now()}`,
        sender: 'agent',
        text: res.agent_speech_text,
        phoneticText: res.agent_speech_phonetic,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        card: res.action_card,
        confirmationAction: res.confirmation_requested ? res.confirmation_action : undefined,
      };

      setMessages((prev) => [...prev, agentTurn]);

      if (res.confirmation_requested) {
        setPendingConfirmation(res.confirmation_action || null);
      } else {
        setPendingConfirmation(null);
      }

      if (res.suggested_quick_phrases && res.suggested_quick_phrases.length > 0) {
        setSuggestedPhrases(res.suggested_quick_phrases);
      }

      // Voice out
      speakText(res.agent_speech_phonetic || res.agent_speech_text, isHi ? 'hi-IN' : 'en-IN');
    } catch (err) {
      console.error('Call turn error:', err);
      const fallbackMsg = isHi
        ? 'माफ़ कीजिए, संपर्क में समस्या आई है। कृपया दोबारा कहें या नीचे दिए गए विकल्पों में से चुनें।'
        : 'Sorry, connection issue. Please speak again or select from the quick options below.';
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'agent',
          text: fallbackMsg,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setCallState('idle');
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualInput.trim()) {
      const text = manualInput.trim();
      setManualInput('');
      handleUserSpeech(text);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="voice-call-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 sm:p-4 animate-in fade-in duration-200"
    >
      <div className="bg-[#FAF9F5] dark:bg-stone-900 border border-[#556B2F]/20 dark:border-stone-700 w-full max-w-2xl h-[95vh] sm:h-[680px] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Top Header Bar */}
        <div className="bg-[#556B2F] text-white px-4 py-3 flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-lg text-white">
                <Phone className="w-5 h-5 text-white animate-pulse" />
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-[#556B2F] rounded-full"></span>
            </div>
            <div>
              <h2 id="voice-call-title" className="font-semibold text-base sm:text-lg flex items-center gap-1.5 leading-tight">
                {isHi ? 'किसानवेरीफाई कॉल सहायता' : 'KisanVerify Call Support'}
                <span className="bg-[#6B8E23] text-white text-[10px] px-1.5 py-0.5 rounded font-mono font-normal">
                  AI ASSISTANT
                </span>
              </h2>
              <p className="text-xs text-white/80">
                {isHi ? 'रामेश्वर कुमार (पाटन) • सुरक्षित व सत्यापित' : 'Ramesh Kumar (Patan) • Grounded & Verified'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Language Switcher */}
            <button
              onClick={() => setLang(lang === 'hi' ? 'en' : 'hi')}
              className="bg-white/10 hover:bg-white/20 text-white text-xs px-2.5 py-1.5 rounded-lg flex items-center space-x-1 transition-colors"
              title={isHi ? 'Change language' : 'भाषा बदलें'}
            >
              <Languages className="w-3.5 h-3.5" />
              <span className="font-semibold">{lang === 'hi' ? 'English' : 'हिंदी'}</span>
            </button>

            {/* Audio speaker mute toggle */}
            <button
              onClick={() => {
                setAudioPlaybackEnabled(!audioPlaybackEnabled);
                if (audioPlaybackEnabled && window.speechSynthesis) {
                  window.speechSynthesis.cancel();
                }
              }}
              className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg transition-colors"
              title={audioPlaybackEnabled ? 'Mute speaker' : 'Unmute speaker'}
            >
              {audioPlaybackEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-amber-200" />}
            </button>

            {/* End Call Button */}
            <button
              onClick={onClose}
              className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-colors flex items-center"
              title={isHi ? 'कॉल समाप्त करें' : 'End Call'}
            >
              <PhoneOff className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* AI Disclosure Banner */}
        <div className="bg-[#EAEFE4] dark:bg-stone-800/80 border-b border-[#556B2F]/20 px-3 py-1.5 text-xs text-[#3E5224] dark:text-stone-300 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#556B2F] shrink-0" />
            <span className="truncate">
              {isHi
                ? 'कृत्रिम बुद्धिमत्ता (AI) सहायता: सभी उत्तर आपके आधिकारिक किसानवेरीफाई डेटा से सत्यापित हैं।'
                : 'AI Voice Support: All responses are grounded in your verified KisanVerify records.'}
            </span>
          </div>
          <button
            onClick={() => setShowPersonDirectory(!showPersonDirectory)}
            className="text-[#556B2F] dark:text-stone-200 font-semibold hover:underline flex items-center gap-1 shrink-0 ml-2"
          >
            <Building2 className="w-3 h-3" />
            {isHi ? 'मानव अधिकारी' : 'Talk to Person'}
          </button>
        </div>

        {/* Error / Warning Alert Banner */}
        {errorBanner && (
          <div className="bg-amber-50 dark:bg-amber-950/60 border-b border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 px-3 py-1.5 text-xs flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errorBanner}</span>
            </div>
            <button onClick={() => setErrorBanner(null)} className="font-bold ml-2">
              ×
            </button>
          </div>
        )}

        {/* Human Support Directory Drawer */}
        {showPersonDirectory && (
          <div className="bg-white dark:bg-stone-800 border-b border-stone-200 dark:border-stone-700 p-3 text-xs space-y-2 animate-in slide-in-from-top duration-150">
            <div className="flex justify-between items-center font-bold text-[#556B2F] dark:text-stone-100">
              <span className="flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5" />
                {isHi ? 'निकटतम सहायता केंद्र व संपर्क' : 'Local Offices & Contacts'}
              </span>
              <button onClick={() => setShowPersonDirectory(false)} className="text-stone-500 hover:text-stone-800">
                ✕
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <div className="bg-[#FAF9F5] dark:bg-stone-900 p-2 rounded border border-stone-200 dark:border-stone-700">
                <div className="font-semibold text-stone-800 dark:text-stone-200">
                  {isHi ? 'भारतीय स्टेट बैंक (एसबीआई) पाटन' : 'SBI Patan Block Branch'}
                </div>
                <div className="text-stone-600 dark:text-stone-400">
                  {isHi ? 'दूरी: 2.5 किमी • फोन: 1800 1234' : 'Distance: 2.5 km • Phone: 1800 1234'}
                </div>
              </div>
              <div className="bg-[#FAF9F5] dark:bg-stone-900 p-2 rounded border border-stone-200 dark:border-stone-700">
                <div className="font-semibold text-stone-800 dark:text-stone-200">
                  {isHi ? 'कृषि उपज मंडी समिति, पाटन' : 'Patan Mandi Samiti'}
                </div>
                <div className="text-stone-600 dark:text-stone-400">
                  {isHi ? 'दूरी: 3.0 किमी • हेल्पडेस्क: 1800 180 1551' : 'Distance: 3.0 km • Desk: 1800 180 1551'}
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                setShowPersonDirectory(false);
                handleUserSpeech(isHi ? 'मुझे अधिकारी से कॉलबैक चाहिए' : 'I want a callback from an officer');
              }}
              className="w-full bg-[#556B2F] text-white py-1.5 rounded text-xs font-semibold hover:bg-[#435424] transition-colors"
            >
              {isHi ? '📞 नोडल अधिकारी से कॉलबैक का अनुरोध करें' : '📞 Request a Call Back from Nodal Officer'}
            </button>
          </div>
        )}

        {/* Live Conversation Transcript Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-gradient-to-b from-[#FAF9F5] to-white dark:from-stone-900 dark:to-stone-950">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                  msg.sender === 'user'
                    ? 'bg-[#556B2F] text-white rounded-br-sm'
                    : 'bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 border border-stone-200 dark:border-stone-700 rounded-bl-sm'
                }`}
              >
                <div className="flex items-center justify-between gap-3 mb-1 text-[10px] opacity-75">
                  <span className="font-semibold uppercase tracking-wider">
                    {msg.sender === 'user' ? (isHi ? 'आप' : 'You') : isHi ? 'किसानवेरीफाई' : 'KisanVerify'}
                  </span>
                  <span>{msg.time}</span>
                </div>
                <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                {/* Agent replay audio button */}
                {msg.sender === 'agent' && (
                  <button
                    onClick={() => speakText(msg.phoneticText || msg.text, isHi ? 'hi-IN' : 'en-IN')}
                    className="mt-2 text-xs text-[#556B2F] dark:text-[#8FA866] hover:underline flex items-center gap-1 font-semibold"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    {isHi ? 'दोबारा सुनें' : 'Listen again'}
                  </button>
                )}
              </div>

              {/* Synchronized Action Card */}
              {msg.card && (
                <div className="w-[85%] mt-2 bg-[#F4F6F0] dark:bg-stone-800/90 border border-[#556B2F]/30 rounded-xl p-3 text-xs shadow-sm space-y-2">
                  <div className="flex justify-between items-center font-bold text-[#3E5224] dark:text-stone-200">
                    <span className="flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-[#556B2F]" />
                      {msg.card.title}
                    </span>
                    {msg.card.link && (
                      <a
                        href={msg.card.link}
                        className="text-[#556B2F] dark:text-[#8FA866] flex items-center gap-0.5 hover:underline font-semibold"
                      >
                        {isHi ? 'विवरण देखें' : 'View Details'}
                        <ExternalLink className="w-3 h-3 ml-0.5" />
                      </a>
                    )}
                  </div>

                  {msg.card.type === 'loan_card' && (
                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                      <div className="bg-white dark:bg-stone-900 p-1.5 rounded">
                        <span className="text-stone-500">{isHi ? 'स्वीकृत राशि' : 'Approved'}:</span>
                        <div className="font-bold">₹{msg.card.approved?.toLocaleString('en-IN')}</div>
                      </div>
                      <div className="bg-white dark:bg-stone-900 p-1.5 rounded">
                        <span className="text-stone-500">{isHi ? 'वितरित राशि' : 'Disbursed'}:</span>
                        <div className="font-bold">₹{msg.card.disbursed?.toLocaleString('en-IN')}</div>
                      </div>
                      <div className="bg-amber-50 dark:bg-amber-950/40 p-1.5 rounded col-span-2 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800">
                        <span className="font-semibold">{isHi ? 'कुल अंतर' : 'Difference'}: </span>
                        ₹{msg.card.difference?.toLocaleString('en-IN')} (₹{msg.card.unexplained?.toLocaleString('en-IN')} {isHi ? 'अव्याख्यायित' : 'unexplained'})
                      </div>
                    </div>
                  )}

                  {msg.card.type === 'msp_card' && (
                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                      <div className="bg-white dark:bg-stone-900 p-1.5 rounded">
                        <span className="text-stone-500">{isHi ? 'अपेक्षित भुगतान' : 'Expected'}:</span>
                        <div className="font-bold">₹{msg.card.expected?.toLocaleString('en-IN')}</div>
                      </div>
                      <div className="bg-white dark:bg-stone-900 p-1.5 rounded">
                        <span className="text-stone-500">{isHi ? 'प्राप्त भुगतान' : 'Received'}:</span>
                        <div className="font-bold">₹{msg.card.actual?.toLocaleString('en-IN')}</div>
                      </div>
                    </div>
                  )}

                  {msg.card.type === 'claim_card' && (
                    <div className="grid grid-cols-3 gap-1.5 text-[11px] pt-1">
                      <div className="bg-white dark:bg-stone-900 p-1.5 rounded">
                        <span className="text-stone-500">{isHi ? 'दावा' : 'Assessed'}:</span>
                        <div className="font-bold">₹{msg.card.assessed?.toLocaleString('en-IN')}</div>
                      </div>
                      <div className="bg-white dark:bg-stone-900 p-1.5 rounded">
                        <span className="text-stone-500">{isHi ? 'प्राप्त' : 'Received'}:</span>
                        <div className="font-bold">₹{msg.card.received?.toLocaleString('en-IN')}</div>
                      </div>
                      <div className="bg-white dark:bg-stone-900 p-1.5 rounded">
                        <span className="text-stone-500">{isHi ? 'लंबित' : 'Pending'}:</span>
                        <div className="font-bold text-amber-600">₹{msg.card.pending?.toLocaleString('en-IN')}</div>
                      </div>
                    </div>
                  )}

                  {msg.card.type === 'mandi_card' && (
                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                      <div className="bg-white dark:bg-stone-900 p-1.5 rounded">
                        <span className="text-stone-500">{isHi ? 'मॉडल भाव' : 'Modal Price'}:</span>
                        <div className="font-bold text-emerald-700">₹{msg.card.modal_price}/क्विं.</div>
                      </div>
                      <div className="bg-white dark:bg-stone-900 p-1.5 rounded">
                        <span className="text-stone-500">{isHi ? 'एमएसपी बेंचमार्क' : 'MSP Benchmark'}:</span>
                        <div className="font-bold">₹{msg.card.msp_benchmark}/क्विं.</div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Pending Action Confirmation Buttons */}
              {msg.confirmationAction && (
                <div className="w-[85%] mt-2 p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-xl space-y-2">
                  <div className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    {isHi ? 'कार्रवाई की पुष्टि आवश्यक है' : 'Action Confirmation Required'}
                  </div>
                  <p className="text-xs text-amber-800 dark:text-amber-300">
                    {isHi
                      ? 'क्या आप चाहते हैं कि मैं इसे आधिकारिक रूप से दर्ज करूँ? हाँ या ना कहें, या बटन दबाएं:'
                      : 'Do you want me to record this officially? Say yes or no, or tap below:'}
                  </p>
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => handleUserSpeech(isHi ? 'हाँ, दर्ज करें' : 'Yes, proceed')}
                      className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      {isHi ? 'हाँ, दर्ज करें (Yes)' : 'Yes, Proceed'}
                    </button>
                    <button
                      onClick={() => handleUserSpeech(isHi ? 'नहीं, रद्द करें' : 'No, cancel')}
                      className="flex-1 bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 text-stone-800 dark:text-stone-200 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      {isHi ? 'नहीं, रहने दें (No)' : 'No, Cancel'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Typing / Thinking Indicator */}
          {callState === 'thinking' && (
            <div className="flex items-center space-x-2 text-stone-500 dark:text-stone-400 text-xs py-1">
              <Sparkles className="w-4 h-4 text-[#556B2F] animate-spin" />
              <span>{isHi ? 'किसानवेरीफाई रिकॉर्ड्स की जांच कर रहा है...' : 'Verifying your records...'}</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Phrase Chips */}
        {suggestedPhrases.length > 0 && (
          <div className="px-3 py-2 bg-stone-100/90 dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 flex items-center gap-1.5 overflow-x-auto shrink-0 scrollbar-none">
            <span className="text-[11px] font-semibold text-stone-500 whitespace-nowrap">
              {isHi ? 'सुझाव:' : 'Suggest:'}
            </span>
            {suggestedPhrases.map((phrase, idx) => (
              <button
                key={idx}
                onClick={() => handleUserSpeech(phrase)}
                className="bg-white dark:bg-stone-800 text-[#3E5224] dark:text-stone-300 border border-[#556B2F]/30 hover:bg-[#556B2F] hover:text-white dark:hover:bg-[#556B2F] text-xs px-2.5 py-1 rounded-full whitespace-nowrap transition-colors shadow-2xs font-medium"
              >
                {phrase}
              </button>
            ))}
          </div>
        )}

        {/* Bottom Interactive Voice Bar */}
        <div className="p-3 bg-white dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 shrink-0 space-y-2">
          {/* Central Animated Mic Orb */}
          <div className="flex items-center justify-center gap-4">
            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={callState === 'listening' ? stopListening : startListening}
                aria-label={
                  callState === 'listening'
                    ? isHi
                      ? 'सुनना बंद करें'
                      : 'Stop listening'
                    : isHi
                    ? 'बोलने के लिए दबाएं'
                    : 'Tap to speak'
                }
                className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-300 transform active:scale-95 ${
                  callState === 'listening'
                    ? 'bg-emerald-600 ring-8 ring-emerald-200 animate-pulse'
                    : callState === 'thinking'
                    ? 'bg-amber-600 ring-4 ring-amber-200'
                    : callState === 'speaking'
                    ? 'bg-[#556B2F] ring-6 ring-[#6B8E23]/40'
                    : 'bg-[#556B2F] hover:bg-[#435424]'
                }`}
              >
                {callState === 'listening' ? (
                  <Mic className="w-6 h-6 animate-bounce" />
                ) : (
                  <Mic className="w-6 h-6" />
                )}
              </button>

              <span className="text-[11px] font-semibold mt-1 text-stone-600 dark:text-stone-400">
                {callState === 'listening'
                  ? isHi
                    ? 'सुन रहा हूँ... बोलिए'
                    : 'Listening... speak now'
                  : callState === 'thinking'
                  ? isHi
                    ? 'समीक्षा जारी...'
                    : 'Thinking...'
                  : callState === 'speaking'
                  ? isHi
                    ? 'बोल रहा हूँ...'
                    : 'Speaking...'
                  : isHi
                  ? 'बोलने के लिए दबाएं'
                  : 'Tap to speak'}
              </span>
            </div>
          </div>

          {/* Fallback Type Input Bar */}
          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <input
              type="text"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder={
                isHi
                  ? 'या यहाँ टाइप करें (उदा. ऋण में कितना अंतर है?)...'
                  : 'Or type here (e.g. loan difference)...'
              }
              className="flex-1 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-[#556B2F]"
            />
            <button
              type="submit"
              disabled={!manualInput.trim()}
              className="bg-[#556B2F] hover:bg-[#435424] disabled:opacity-50 text-white px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
