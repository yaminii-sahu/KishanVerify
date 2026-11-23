import React, { useState, useEffect, useRef } from 'react';
import { 
  Volume2, 
  Play, 
  Pause, 
  Square, 
  Gauge, 
  ChevronDown, 
  ChevronUp, 
  Globe, 
  Sparkles,
  Info,
  CheckCircle2
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { generateClientAudioScript, SpokenScriptResult } from '../utils/audioScriptGenerator';

export interface AudioSummaryPlayerProps {
  checkType: 'loan' | 'msp';
  approvedAmount?: number;
  disbursedAmount?: number;
  difference?: number;
  bankName?: string;
  crop?: string;
  quantity?: number;
  rate?: number;
  expectedPayment?: number;
  actualPayment?: number;
  procurementCenter?: string;
  autoPlayAllowed?: boolean;
}

export const AudioSummaryPlayer: React.FC<AudioSummaryPlayerProps> = ({
  checkType,
  approvedAmount,
  disbursedAmount,
  difference,
  bankName,
  crop,
  quantity,
  rate,
  expectedPayment,
  actualPayment,
  procurementCenter,
  autoPlayAllowed = false,
}) => {
  const { language: appLang } = useLanguage();
  const [selectedLang, setSelectedLang] = useState<'hi' | 'en'>(appLang === 'hi' ? 'hi' : 'en');
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [activeSentenceIndex, setActiveSentenceIndex] = useState<number>(-1);
  const [isTranscriptOpen, setIsTranscriptOpen] = useState<boolean>(false);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const currentSentenceRef = useRef<number>(-1);

  // Sync with app language changes if user hasn't explicitly changed
  useEffect(() => {
    setSelectedLang(appLang === 'hi' ? 'hi' : 'en');
  }, [appLang]);

  // Generate script
  const scriptData: SpokenScriptResult = generateClientAudioScript({
    checkType,
    language: selectedLang,
    approvedAmount,
    disbursedAmount,
    difference,
    bankName,
    crop,
    quantity,
    rate,
    expectedPayment,
    actualPayment,
    procurementCenter,
  });

  // Stop speech when unmounting or parameters change
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Check auto-read setting
  useEffect(() => {
    const autoReadPref = localStorage.getItem('kisanverify_auto_read_audio');
    if (autoReadPref === 'true' && autoPlayAllowed) {
      const timer = setTimeout(() => {
        handlePlay();
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [selectedLang]);

  const speakSentence = (index: number) => {
    if (!window.speechSynthesis || index >= scriptData.sentences.length) {
      setIsPlaying(false);
      setIsPaused(false);
      setActiveSentenceIndex(-1);
      currentSentenceRef.current = -1;
      return;
    }

    currentSentenceRef.current = index;
    setActiveSentenceIndex(index);

    const textToSpeak = scriptData.sentences[index];
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utteranceRef.current = utterance;

    utterance.rate = playbackRate;
    utterance.lang = selectedLang === 'hi' ? 'hi-IN' : 'en-IN';

    // Try finding matching voice
    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find(v => 
      selectedLang === 'hi'
        ? (v.lang.includes('hi') || v.name.toLowerCase().includes('hindi'))
        : (v.lang.includes('en-IN') || v.lang.includes('en'))
    );
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.onend = () => {
      if (currentSentenceRef.current === index) {
        speakSentence(index + 1);
      }
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis utterance notice', e);
      setIsPlaying(false);
      setIsPaused(false);
      setActiveSentenceIndex(-1);
    };

    window.speechSynthesis.speak(utterance);
  };

  const handlePlay = () => {
    if (!window.speechSynthesis) return;

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    window.speechSynthesis.cancel();
    setIsPlaying(true);
    setIsPaused(false);
    speakSentence(0);
  };

  const handlePause = () => {
    if (window.speechSynthesis && isPlaying) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      setIsPlaying(false);
    }
  };

  const handleStop = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setIsPaused(false);
    setActiveSentenceIndex(-1);
    currentSentenceRef.current = -1;
  };

  const handleSpeedChange = (rate: number) => {
    setPlaybackRate(rate);
    if (isPlaying) {
      // Restart current sentence at new speed
      const cur = currentSentenceRef.current;
      window.speechSynthesis.cancel();
      speakSentence(cur >= 0 ? cur : 0);
    }
  };

  const handleLangToggle = (lang: 'hi' | 'en') => {
    handleStop();
    setSelectedLang(lang);
  };

  const progressPercent = scriptData.sentences.length > 0 && activeSentenceIndex >= 0
    ? Math.round(((activeSentenceIndex + 1) / scriptData.sentences.length) * 100)
    : 0;

  return (
    <div className="bg-cream-surface rounded-2xl border border-warm-border p-4 shadow-soft space-y-3">
      {/* Player Top Bar */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors shadow-soft ${
            isPlaying ? 'bg-forest text-white animate-pulse' : 'bg-tint text-forest'
          }`}>
            <Volume2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-charcoal flex items-center gap-1.5">
              <span>{selectedLang === 'hi' ? 'ऑडियो सारांश सुनें' : 'Listen to Audio Summary'}</span>
              <span className="text-[10px] font-semibold text-forest bg-forest/10 px-2 py-0.5 rounded-full">
                {selectedLang === 'hi' ? 'शांत व सम्मानजनक' : 'Calm & Neutral'}
              </span>
            </h4>
            <p className="text-[11px] text-muted">
              {selectedLang === 'hi'
                ? 'वैधानिक नियमों एवं अंतर का 45 सेकंड का स्पष्ट वाचन'
                : '45-second spoken reconciliation with phonetic numbers'}
            </p>
          </div>
        </div>

        {/* Language Selector inside Player */}
        <div className="flex items-center gap-1 bg-cream rounded-xl p-1 border border-warm-border/80">
          <button
            type="button"
            onClick={() => handleLangToggle('hi')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              selectedLang === 'hi'
                ? 'bg-forest text-white shadow-soft'
                : 'text-charcoal hover:text-forest'
            }`}
          >
            हिन्दी
          </button>
          <button
            type="button"
            onClick={() => handleLangToggle('en')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              selectedLang === 'en'
                ? 'bg-forest text-white shadow-soft'
                : 'text-charcoal hover:text-forest'
            }`}
          >
            English
          </button>
        </div>
      </div>

      {/* Progress Bar (Visible while playing or paused) */}
      {(isPlaying || isPaused || activeSentenceIndex >= 0) && (
        <div className="space-y-1">
          <div className="w-full h-1.5 bg-warm-border rounded-full overflow-hidden">
            <div
              className="h-full bg-forest transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-muted font-medium px-0.5">
            <span>
              {selectedLang === 'hi' ? `वाक्य ${activeSentenceIndex + 1} / ${scriptData.sentences.length}` : `Sentence ${activeSentenceIndex + 1} of ${scriptData.sentences.length}`}
            </span>
            <span>{progressPercent}%</span>
          </div>
        </div>
      )}

      {/* Player Controls Bar */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-warm-border/60">
        <div className="flex items-center gap-2">
          {/* Main Play / Pause Button */}
          {!isPlaying ? (
            <button
              type="button"
              onClick={handlePlay}
              className="px-4 py-2 rounded-xl bg-forest hover:bg-forest-dark text-white text-xs font-bold shadow-soft flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>{selectedLang === 'hi' ? 'सुनें' : 'Listen'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handlePause}
              className="px-4 py-2 rounded-xl bg-forest hover:bg-forest-dark text-white text-xs font-bold shadow-soft flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            >
              <Pause className="w-3.5 h-3.5" />
              <span>{selectedLang === 'hi' ? 'रोकें' : 'Pause'}</span>
            </button>
          )}

          {/* Stop Button */}
          {(isPlaying || isPaused || activeSentenceIndex >= 0) && (
            <button
              type="button"
              onClick={handleStop}
              className="p-2 rounded-xl bg-cream hover:bg-tint text-charcoal border border-warm-border text-xs shadow-soft transition-all active:scale-95 cursor-pointer"
              title={selectedLang === 'hi' ? 'बंद करें' : 'Stop'}
            >
              <Square className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Speed Toggles */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-semibold text-muted hidden sm:inline">Speed:</span>
          {[0.75, 1.0, 1.25].map((speed) => (
            <button
              key={speed}
              type="button"
              onClick={() => handleSpeedChange(speed)}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                playbackRate === speed
                  ? 'bg-forest/15 text-forest border border-forest/30'
                  : 'bg-cream text-muted hover:text-charcoal border border-warm-border/60'
              }`}
            >
              {speed}x
            </button>
          ))}
        </div>

        {/* Transcript Toggle */}
        <button
          type="button"
          onClick={() => setIsTranscriptOpen(!isTranscriptOpen)}
          className="px-2.5 py-1.5 rounded-xl bg-cream hover:bg-tint border border-warm-border/80 text-[11px] font-semibold text-charcoal flex items-center gap-1 transition-colors cursor-pointer"
        >
          <span>{selectedLang === 'hi' ? 'लिखित प्रति' : 'Transcript'}</span>
          {isTranscriptOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {/* Transcript Drawer with Sentence Highlighting */}
      {isTranscriptOpen && (
        <div className="p-3.5 rounded-xl bg-cream/70 border border-warm-border/70 space-y-2 text-xs text-charcoal leading-relaxed animate-in fade-in duration-150">
          <div className="flex items-center justify-between text-[11px] font-bold text-muted border-b border-warm-border/50 pb-1.5">
            <span>{selectedLang === 'hi' ? 'बोला जाने वाला सारांश' : 'Spoken Summary Transcript'}</span>
            <span className="text-[10px] font-medium text-forest">
              {selectedLang === 'hi' ? 'लाइव वाक्य हाइलाइट' : 'Live sentence sync'}
            </span>
          </div>

          <div className="space-y-1.5 pt-1">
            {scriptData.sentences.map((sentence, idx) => {
              const isActive = activeSentenceIndex === idx;
              return (
                <p
                  key={idx}
                  className={`p-2 rounded-lg transition-all ${
                    isActive
                      ? 'bg-forest/15 text-forest font-semibold border-l-3 border-forest shadow-soft'
                      : 'text-charcoal/80'
                  }`}
                >
                  {sentence}
                </p>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
