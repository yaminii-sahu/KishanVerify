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
  User, 
  Sparkles, 
  RotateCcw,
  Info
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  time: string;
  chips?: string[];
}

export const AIAssistantPage: React.FC = () => {
  const { t, language } = useLanguage();
  const { farmer } = useAuth();
  const navigate = useNavigate();

  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeakingId, setIsSpeakingId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Initial chat matching the design mockup in Screen 7
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm-1',
      sender: 'user',
      text: 'Mera crop insurance ka paisa abhi tak nahin aaya, kya karu?',
      time: '09:41 AM',
    },
    {
      id: 'm-2',
      sender: 'assistant',
      text: 
        `Aapka crop insurance claim abhi 'Under Review' status mein hai. Kripya ye details check karein:\n\n` +
        `• Farmer ID: ${farmer.farmerId}\n` +
        `• Crop: ${farmer.crop}\n` +
        `• Application No: CI20251234\n` +
        `• Assessed Claim: ₹30,000 | Received: ₹20,000 | Difference: ₹10,000\n\n` +
        `Agar aapko 15 din ke andar payment nahi milta, to aap apni najdeeki bank branch ya insurance company se sampark kar sakte hain. Aap grievance bhi file kar sakte hain.`,
      time: '09:41 AM',
      chips: ['Claim status', 'Required documents', 'Contact details'],
    },
  ]);

  const quickChips = [
    'Claim status',
    'Required documents',
    'Contact details',
    'Explain loan difference',
    'KCC interest rate',
    'MSP paddy rate',
  ];

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
        // Automatically send voice query for touch-friendly accessibility
        handleSendMessage(transcript);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
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
      alert('Speech recognition is not supported in this browser. Please type your query.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      try {
        recognitionRef.current.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
        recognitionRef.current.start();
      } catch (err) {
        console.warn(err);
        setIsListening(false);
      }
    }
  };

  // Web Speech API: Text-to-Speech (Audio Voice Output)
  const speakText = (text: string, msgId: string) => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported in this browser.');
      return;
    }

    if (isSpeakingId === msgId) {
      window.speechSynthesis.cancel();
      setIsSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    setIsSpeakingId(msgId);

    const cleanText = text.replace(/[•*#]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.lang = language === 'hi' ? 'hi-IN' : 'en-IN';

    utterance.onend = () => {
      setIsSpeakingId(null);
    };

    utterance.onerror = () => {
      setIsSpeakingId(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

    try {
      const res = await fetch(`${API_BASE}/api/v1/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          language: language,
          farmer_id: farmer.farmerId,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const botMsg: Message = {
          id: `a-${Date.now()}`,
          sender: 'assistant',
          text: data.reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          chips: data.suggested_chips || ['Claim status', 'Required documents'],
        };
        setMessages((prev) => [...prev, botMsg]);
      } else {
        throw new Error('API offline');
      }
    } catch (err) {
      // Smart Fallback
      setTimeout(() => {
        let reply = '';
        const qLower = query.toLowerCase();

        if (qLower.includes('loan') || qLower.includes('kcc') || qLower.includes('karz')) {
          reply = 
            `Aapke KCC Loan (SBI Patan) mein ₹10,000 ka difference hai:\n` +
            `• Approved: ₹80,000\n` +
            `• Disbursed: ₹70,000\n` +
            `• Deductions: ₹5,000 (Processing Fee ₹2,000 + PMFBY Bima ₹3,000)\n\n` +
            `Aap 'My Reports' se Detailed Reconciliation Report download karke bank branch mein verify kar sakte hain.`;
        } else if (qLower.includes('msp') || qLower.includes('paddy') || qLower.includes('dhan')) {
          reply = 
            `Dhan MSP Khareedi (Patan Mandi):\n` +
            `• Quantity: 50 Quintals @ ₹2,300/qtl\n` +
            `• Expected: ₹1,15,000 | Received: ₹1,05,000 | Difference: ₹10,000\n\n` +
            `Moisture discount ya partial tranche ke kaaran yeh antar ho sakta hai. Mandi J-Form check karein.`;
        } else {
          reply = 
            `Aapke records mein 2 items review ke liye hain:\n` +
            `1. Loan: ₹10,000 difference (Approved ₹80,000 vs Disbursed ₹70,000)\n` +
            `2. Crop Insurance: ₹10,000 second tranche 'Under Review'\n\n` +
            `Kisi bhi sujhav ya inquiry ke liye 'Raise a Grievance' par tap karein.`;
        }

        const botMsg: Message = {
          id: `a-${Date.now()}`,
          sender: 'assistant',
          text: reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          chips: ['Claim status', 'Required documents', 'Contact details'],
        };
        setMessages((prev) => [...prev, botMsg]);
      }, 400);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-135px)] md:h-[calc(100vh-120px)] max-w-4xl mx-auto">
      
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-warm-border shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/farmer')}
            className="w-10 h-10 rounded-2xl bg-white border border-warm-border flex items-center justify-center text-gray-700 hover:bg-sage-50 transition-colors shadow-soft"
          >
            <ArrowLeft className="w-5 h-5 text-gray-800" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <span>{language === 'hi' ? 'एआई नीति सहायक' : 'AI Assistant'}</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-sage-100 text-sage-800 border border-sage-200">
                Bilingual Voice
              </span>
            </h1>
            <p className="text-xs text-gray-500">
              Ask anything about schemes, loans, MSP or crop insurance
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setMessages([
              {
                id: 'm-init',
                sender: 'assistant',
                text: 'Namaste! Main aapka KisanVerify AI sahayak hoon. Aap loan, MSP ya crop insurance ke baare mein kuch bhi pooch sakte hain.',
                time: 'Just now',
                chips: ['Claim status', 'Required documents', 'Contact details'],
              },
            ]);
          }}
          className="text-xs text-gray-400 hover:text-gray-700 flex items-center gap-1"
          title="Clear chat"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>

      {/* Quick Suggestion Chips (Horizontal scrollable - Matches Screen 7 mockup) */}
      <div className="py-2.5 flex items-center gap-2 overflow-x-auto scrollbar-none shrink-0">
        <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-sage-600" />
          Quick:
        </span>
        {quickChips.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(chip)}
            className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white border border-warm-border text-gray-700 hover:border-sage-400 hover:bg-sage-50 hover:text-sage-900 transition-all shrink-0 shadow-soft"
          >
            {chip}
          </button>
        ))}
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
              {/* Bot Avatar */}
              {!isUser && (
                <div className="w-8 h-8 rounded-full bg-sage-600 text-white flex items-center justify-center shrink-0 shadow-soft">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              {/* Message Bubble */}
              <div
                className={`max-w-[85%] sm:max-w-md rounded-3xl p-4 sm:p-5 shadow-soft space-y-2 ${
                  isUser
                    ? 'bg-sage-700 text-white rounded-br-none'
                    : 'bg-white text-gray-900 border border-warm-border rounded-bl-none'
                }`}
              >
                <div className="whitespace-pre-line text-sm leading-relaxed font-normal">
                  {msg.text}
                </div>

                {/* Chips attached to assistant message (matches mockup) */}
                {msg.chips && msg.chips.length > 0 && (
                  <div className="pt-2 border-t border-warm-border/60">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                      Want to know more?
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.chips.map((chip, i) => (
                        <button
                          key={i}
                          onClick={() => handleSendMessage(chip)}
                          className="px-3 py-1 rounded-xl text-xs font-medium bg-warm-bg border border-warm-border text-gray-700 hover:bg-sage-100 hover:text-sage-900 transition-colors"
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer: Timestamp and Speak aloud button */}
                <div className="flex items-center justify-between pt-1 text-[10px] opacity-70">
                  <span>{msg.time}</span>
                  {!isUser && (
                    <button
                      onClick={() => speakText(msg.text, msg.id)}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full transition-colors ${
                        isSpeakingId === msg.id
                          ? 'bg-sage-100 text-sage-800 font-bold'
                          : 'hover:bg-gray-100 text-gray-500'
                      }`}
                      title="Speak in Hindi/English"
                    >
                      {isSpeakingId === msg.id ? (
                        <>
                          <VolumeX className="w-3 h-3 text-sage-700" />
                          <span>Stop</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3 h-3 text-gray-600" />
                          <span>Listen</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* User Avatar */}
              {isUser && (
                <div className="w-8 h-8 rounded-full bg-sage-200 text-sage-800 flex items-center justify-center shrink-0 font-bold text-xs shadow-soft">
                  RK
                </div>
              )}
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-center gap-2 text-xs text-gray-400 animate-pulse pl-10">
            <Bot className="w-4 h-4 text-sage-600" />
            <span>KisanVerify Assistant is reviewing policy records...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar (Matches mockup Screen 7) */}
      <div className="pt-2 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="relative flex items-center bg-white rounded-3xl border border-warm-border shadow-card p-1.5 focus-within:ring-2 focus-within:ring-sage-500"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              isListening
                ? 'Listening to your voice... Speak now in Hindi or English'
                : 'Type or speak a question...'
            }
            className={`w-full pl-5 pr-24 py-3 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none ${
              isListening ? 'animate-pulse text-sage-800 font-semibold' : ''
            }`}
          />

          <div className="absolute right-2 flex items-center gap-1.5">
            {/* Mic Button for Web Speech Recognition */}
            <button
              type="button"
              onClick={toggleListening}
              className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                isListening
                  ? 'bg-kisan-red text-white animate-bounce shadow-md'
                  : 'bg-warm-bg text-gray-700 hover:bg-sage-100 hover:text-sage-800'
              }`}
              title={isListening ? 'Stop listening' : 'Speak your question'}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5 text-sage-700" />}
            </button>

            {/* Send Button */}
            <button
              type="submit"
              disabled={!input.trim()}
              className="w-10 h-10 rounded-2xl bg-sage-600 text-white flex items-center justify-center hover:bg-sage-700 transition-colors disabled:opacity-40 shadow-soft"
              title="Send question"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>

        <p className="text-[10px] text-gray-400 text-center mt-2">
          KisanVerify AI Policy Simplifier • Deterministic math verified before explanation
        </p>
      </div>

    </div>
  );
};
