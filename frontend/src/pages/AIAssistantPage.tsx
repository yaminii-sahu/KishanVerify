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
import { sendAiChatApi } from '../services/api';
import farmerAvatarImg from '../assets/illustrations/farmer-avatar.svg';

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

  // Initial chat matching the design mockup in Screen 7 & Image A Screen 4
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
        `Aapka crop insurance claim abhi "Under Review" status mein hai. Kripya ye details check karein:\n\n` +
        `• Farmer ID: ${farmer.farmerId}\n` +
        `• Crop: ${farmer.crop}\n` +
        `• Application No: CI20251234\n\n` +
        `Agar aapko 15 din tak payment nahi milta, to aap apni najdeeki bank branch ya insurance company se sampark kar sakte hain. Aap grievance bhi file kar sakte hain.`,
      time: '09:41 AM',
      chips: ['Claim status', 'Required documents', 'Contact details'],
    },
  ]);

  const quickChips = [
    'Claim status',
    'Required documents',
    'Contact details',
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

    try {
      const response = await sendAiChatApi(textToSend, language, farmer.farmerId);

      const botMsg: Message = {
        id: `a-${Date.now()}`,
        sender: 'assistant',
        text: response.reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        chips: ['Claim status', 'Required documents', 'Contact details'],
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch {
      // Deterministic bilingual fallback
      setTimeout(() => {
        let reply = '';
        const qLower = textToSend.toLowerCase();

        if (qLower.includes('loan') || qLower.includes('karz') || qLower.includes('rin')) {
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
      }, 300);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100dvh-135px)] md:h-[calc(100dvh-130px)] max-w-4xl mx-auto">
      
      {/* Top Header */}
      <div className="hidden md:flex items-center justify-between pb-3 border-b border-warm-border shrink-0">
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
            </h1>
            <p className="text-xs text-muted">
              Ask anything about your schemes, loans, MSP or crop insurance.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setMessages([
              {
                id: 'm-init',
                sender: 'assistant',
                text: 'Namaste! Main aapka KisanVerify AI sahayak hoon. Aap loan, MSP ya crop insurance ke baare mein pooch sakte hain.',
                time: 'Just now',
                chips: ['Claim status', 'Required documents', 'Contact details'],
              },
            ]);
          }}
          className="text-xs text-muted hover:text-charcoal flex items-center gap-1 min-h-[36px]"
          title="Clear chat"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
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
                className={`max-w-[85%] sm:max-w-md rounded-2xl p-4 sm:p-5 shadow-soft space-y-2 ${
                  isUser
                    ? 'bg-forest text-white rounded-br-sm'
                    : 'bg-cream-surface text-charcoal border border-warm-border rounded-bl-sm'
                }`}
              >
                <div className="whitespace-pre-line text-xs sm:text-sm leading-relaxed">
                  {msg.text}
                </div>

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
                  src={farmerAvatarImg} 
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
            <span>KisanVerify Assistant is thinking...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Suggestion Chips (Image A & Image B) */}
      <div className="py-2 flex items-center gap-2 overflow-x-auto scrollbar-none shrink-0">
        <span className="text-[11px] font-bold text-muted uppercase tracking-wider shrink-0">
          Want to know more?
        </span>
        {quickChips.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(chip)}
            className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-cream-surface border border-warm-border text-charcoal hover:bg-tint/50 transition-all shrink-0 shadow-soft min-h-[36px]"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Input Bar with Circular Green Mic (Image A & Image B) */}
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
            placeholder={isListening ? 'Listening to speech...' : 'Type or speak a question...'}
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

    </div>
  );
};
