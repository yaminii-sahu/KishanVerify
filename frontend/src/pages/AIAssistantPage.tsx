import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Bot, 
  Mic, 
  MicOff, 
  Send, 
  Volume2, 
  VolumeX, 
  RotateCcw,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Cpu,
  ArrowRight,
  Phone
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { sendAiChatApi, fetchAiStatusApi, AiChatResponse } from '../services/api';
import { VoiceCallModal } from '../components/VoiceCallModal';
import farmerAvatarImg from '../assets/illustrations/farmer-avatar.svg';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  time: string;
  chips?: string[];
  mode?: 'live' | 'offline';
  provider?: string;
  actionLink?: string;
  actionLabel?: string;
  sources?: string[];
}

export const AIAssistantPage: React.FC = () => {
  const { t, language } = useLanguage();
  const { farmer } = useAuth();
  const navigate = useNavigate();

  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeakingId, setIsSpeakingId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isVoiceCallOpen, setIsVoiceCallOpen] = useState(false);
  const [aiStatus, setAiStatus] = useState<{
    provider_configured: boolean;
    mode: 'live' | 'offline';
    provider: string;
    model: string;
  }>({
    provider_configured: false,
    mode: 'offline',
    provider: 'gemini',
    model: 'gemini-1.5-flash',
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Initial greeting
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm-init',
      sender: 'assistant',
      text: language === 'hi'
        ? `नमस्ते ${farmer.name || 'किसान'} जी! मैं आपका किसानवेरीफाई एआई सहायक हूँ।\n\nआप अपनी योजनाओं, ऋण अंतर, एमएसपी भुगतान या फसल बीमा दावे के बारे में पूछ सकते हैं।`
        : `Namaste ${farmer.name || 'Farmer'}! I am your KisanVerify transparency guide.\n\nAsk me anything about your eligible schemes, loan differences, MSP crop procurement, or crop insurance claims.`,
      time: 'Just now',
      chips: [
        'Eligible schemes',
        'Loans I can apply for',
        'Loan difference',
        'Claim status',
        'MSP status',
      ],
      mode: 'offline',
      provider: 'template-fallback',
      sources: ['KisanVerify Citizen Guide'],
      actionLink: '/farmer',
      actionLabel: language === 'hi' ? 'डैशबोर्ड देखें' : 'View Dashboard',
    },
  ]);

  // Load AI configuration status
  useEffect(() => {
    fetchAiStatusApi().then((status) => {
      setAiStatus(status);
    });
  }, []);

  const quickChips = [
    language === 'hi' ? 'पात्र योजनाएं' : 'Eligible schemes',
    language === 'hi' ? 'उपलब्ध ऋण' : 'Loans I can apply for',
    language === 'hi' ? 'ऋण अंतर' : 'Loan difference',
    language === 'hi' ? 'दावा स्थिति' : 'Claim status',
    language === 'hi' ? 'एमएसपी स्थिति' : 'MSP status',
    language === 'hi' ? 'आवश्यक दस्तावेज़' : 'Required documents',
    language === 'hi' ? 'मंडी भाव' : 'Mandi prices',
    language === 'hi' ? 'मौसम पूर्वानुमान' : 'Weather forecast',
    language === 'hi' ? 'सहायता संपर्क' : 'Contact details',
  ];

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    if (typeof messagesEndRef.current?.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Web Speech API: Initialize SpeechRecognition (Speech-to-Text)
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
        handleSendMessage(transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [language]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Web Speech API: Text-to-Speech synthesis
  const speakText = (text: string, msgId: string) => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeakingId === msgId) {
      window.speechSynthesis.cancel();
      setIsSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();

    const cleanText = text
      .replace(/[•\*\#]/g, '')
      .replace(/₹/g, 'rupaye ')
      .replace(/\|/g, ', ');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.rate = 0.95;

    utterance.onend = () => setIsSpeakingId(null);
    utterance.onerror = () => setIsSpeakingId(null);

    setIsSpeakingId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = (queryText || input).trim();
    if (!textToSend) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Build history of recent turns for conversation context
    const historyPayload = messages.slice(-8).map((m) => ({
      role: m.sender === 'user' ? 'user' : 'assistant',
      content: m.text,
    }));

    try {
      const response: AiChatResponse = await sendAiChatApi(
        textToSend,
        language,
        farmer.farmerId,
        historyPayload
      );

      const botMsg: Message = {
        id: `a-${Date.now()}`,
        sender: 'assistant',
        text: response.reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        chips: response.suggested_chips || ['Eligible schemes', 'Loan difference', 'Claim status'],
        mode: response.mode || (response.provider === 'gemini' ? 'live' : 'offline'),
        provider: response.provider,
        actionLink: response.action_link,
        actionLabel: response.action_label,
        sources: response.source_documents,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error('Failed to get AI response:', err);
      // Fallback safeguard
      const fallbackMsg: Message = {
        id: `a-${Date.now()}`,
        sender: 'assistant',
        text: language === 'hi'
          ? 'माफ़ कीजिए, सर्वर से संपर्क नहीं हो पाया। कृपया नीचे दिए गए विकल्पों में से चुनें या पुनः प्रयास करें।'
          : "I'm sorry, I could not reach the server right now. Please select one of the options below or try again.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        chips: ['Eligible schemes', 'Loan difference', 'Claim status'],
        mode: 'offline',
        provider: 'template-fallback',
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100dvh-135px)] md:h-[calc(100dvh-130px)] max-w-4xl mx-auto pb-20 md:pb-0">
      
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-warm-border shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/farmer')}
            className="w-9 h-9 rounded-full bg-cream-surface border border-warm-border flex items-center justify-center text-charcoal hover:bg-tint transition-colors shadow-soft"
            aria-label="Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-charcoal tracking-tight flex items-center gap-2">
              <span>{language === 'hi' ? 'एआई सहायक' : 'AI Assistant'}</span>
              
              {/* Operational Mode Pill */}
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                aiStatus.mode === 'live' 
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                  : 'bg-sage-100 text-sage-800 border border-sage-200'
              }`}>
                {aiStatus.mode === 'live' ? (
                  <>
                    <Sparkles className="w-3 h-3 text-emerald-600" />
                    <span>Live AI</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3 h-3 text-sage-600" />
                    <span>Offline Rule Engine</span>
                  </>
                )}
              </span>
            </h1>
            <p className="text-xs text-muted">
              {language === 'hi' 
                ? 'सरकारी नीतियों और अपने सत्यापित खातों पर कुछ भी पूछें'
                : 'Ask anything about your schemes, loans, MSP or crop insurance'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsVoiceCallOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-forest hover:bg-forest-dark text-white text-xs font-bold shadow-soft transition-all active:scale-95"
            title={language === 'hi' ? 'एआई कॉल सहायता शुरू करें' : 'Start AI Voice Call'}
          >
            <Phone className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'कॉल सहायता' : 'Call Support'}</span>
          </button>

          <button
            onClick={() => {
              setMessages([
                {
                  id: 'm-reset',
                  sender: 'assistant',
                  text: language === 'hi'
                    ? 'नमस्ते! किसानवेरीफाई सहायक में आपका स्वागत है। आप योजनाओं, ऋण अंतर, एमएसपी या फसल बीमा के बारे में पूछ सकते हैं।'
                    : 'Namaste! Welcome back to KisanVerify assistant. Ask me anything about your schemes, loans, MSP, or insurance claims.',
                  time: 'Just now',
                  chips: ['Eligible schemes', 'Loan difference', 'Claim status', 'MSP status'],
                  mode: 'offline',
                },
              ]);
            }}
            className="text-xs text-muted hover:text-charcoal flex items-center gap-1 min-h-[36px]"
            title="Reset chat"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-end gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {/* Bot Avatar on Left */}
              {!isUser && (
                <div className="w-8 h-8 rounded-full bg-tint text-forest flex items-center justify-center shrink-0 shadow-soft border border-warm-border">
                  <Bot className="w-4 h-4" strokeWidth={2} />
                </div>
              )}

              {/* Message Bubble */}
              <div
                className={`max-w-[85%] sm:max-w-md rounded-2xl p-4 sm:p-5 shadow-soft space-y-2.5 ${
                  isUser
                    ? 'bg-forest text-white rounded-br-sm'
                    : 'bg-cream-surface text-charcoal border border-warm-border rounded-bl-sm'
                }`}
              >
                {/* Assistant Answered-By Indicator */}
                {!isUser && (
                  <div className="flex items-center justify-between border-b border-warm-border/60 pb-1.5 text-[10px]">
                    <span className="inline-flex items-center gap-1 font-medium text-muted">
                      {msg.mode === 'live' ? (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span>Answered by: Live AI</span>
                        </>
                      ) : (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-sage-500" />
                          <span>Answered by: Offline mode</span>
                        </>
                      )}
                    </span>
                    {msg.provider && (
                      <span className="text-[9px] uppercase tracking-wider text-muted font-mono">
                        {msg.provider}
                      </span>
                    )}
                  </div>
                )}

                <div className="whitespace-pre-line text-xs sm:text-sm leading-relaxed">
                  {msg.text}
                </div>

                {/* Direct Action Navigation Link if Available */}
                {!isUser && msg.actionLink && (
                  <div className="pt-1">
                    <button
                      onClick={() => navigate(msg.actionLink!)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-forest text-white text-xs font-semibold hover:bg-forest-dark transition-all shadow-soft active:scale-95"
                    >
                      <span>{msg.actionLabel || (language === 'hi' ? 'विवरण देखें' : 'View Details')}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Statutory Sources Attribution */}
                {!isUser && msg.sources && msg.sources.length > 0 && (
                  <div className="pt-1 flex flex-wrap items-center gap-1 text-[10px] text-muted">
                    <span className="font-semibold text-charcoal/80">Source:</span>
                    {msg.sources.map((src, i) => (
                      <span key={i} className="bg-cream border border-warm-border px-1.5 py-0.5 rounded text-[10px]">
                        {src}
                      </span>
                    ))}
                  </div>
                )}

                {/* Footer: Timestamp & Audio Speak Out */}
                <div className={`flex items-center justify-between pt-1 text-[10px] ${isUser ? 'text-white/70' : 'text-muted'}`}>
                  <span>{msg.time}</span>
                  {!isUser && (
                    <button
                      onClick={() => speakText(msg.text, msg.id)}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full hover:bg-tint/60 transition-colors"
                      aria-label="Listen to message aloud"
                    >
                      {isSpeakingId === msg.id ? (
                        <>
                          <VolumeX className="w-3.5 h-3.5 text-forest" />
                          <span className="text-forest font-semibold">Stop</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5 text-muted" />
                          <span>Listen</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* User Avatar on Right */}
              {isUser && (
                <img 
                  src={farmer.avatarUrl || farmerAvatarImg} 
                  alt="Farmer" 
                  className="w-8 h-8 rounded-full object-cover shrink-0 border border-warm-border"
                />
              )}
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-center gap-2 text-muted text-xs p-2">
            <Bot className="w-4 h-4 text-forest animate-pulse" />
            <span>KisanVerify Assistant is evaluating deterministic facts...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Suggestion Chips */}
      <div className="py-2 flex items-center gap-2 overflow-x-auto scrollbar-none shrink-0">
        <span className="text-[11px] font-bold text-muted uppercase tracking-wider shrink-0">
          {language === 'hi' ? 'सुझाव:' : 'Quick options:'}
        </span>
        {quickChips.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(chip)}
            className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-cream-surface border border-warm-border text-charcoal hover:bg-tint/60 hover:border-forest/40 transition-all shrink-0 shadow-soft min-h-[36px]"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Input Bar with Circular Green Mic */}
      <div className="pt-2 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2 bg-cream-surface rounded-full border border-warm-border px-3 py-1.5 shadow-soft focus-within:ring-2 focus-within:ring-olive transition-all min-h-[52px]"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isListening ? 'Listening to speech...' : (language === 'hi' ? 'यहाँ अपना प्रश्न लिखें या बोलें...' : 'Type or speak a question...')}
            className="flex-1 bg-transparent px-3 py-2 text-xs sm:text-sm font-medium text-charcoal placeholder-muted focus:outline-none"
          />

          {input.trim() ? (
            <button
              type="submit"
              className="w-10 h-10 rounded-full bg-forest hover:bg-forest-dark text-white flex items-center justify-center shadow-soft transition-all shrink-0 active:scale-95"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={toggleListening}
              className={`w-10 h-10 rounded-full flex items-center justify-center shadow-soft transition-all shrink-0 active:scale-95 ${
                isListening
                  ? 'bg-status-discrepancy-text text-white animate-pulse'
                  : 'bg-forest hover:bg-forest-dark text-white'
              }`}
              aria-label="Speak into microphone"
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5 text-tint" />}
            </button>
          )}
        </form>
      </div>

      {/* Voice Call Support Modal */}
      <VoiceCallModal
        isOpen={isVoiceCallOpen}
        onClose={() => setIsVoiceCallOpen(false)}
        language={language === 'hi' ? 'hi' : 'en'}
      />

    </div>
  );
};
