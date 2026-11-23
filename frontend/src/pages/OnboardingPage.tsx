import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import clipboardChecklistImg from '../assets/illustrations/clipboard-checklist.svg';

export const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: 'Check Your Entitlements',
      titleHi: 'अपनी पात्रता जांचें',
      description: 'Know which government schemes, loans, subsidies and insurance you are eligible for.',
      descriptionHi: 'अपनी ज़मीन और फसल के आधार पर जानें कि आप किन सरकारी योजनाओं, ऋणों और सब्सिडी के पात्र हैं।',
    },
    {
      title: 'Verify Your Money',
      titleHi: 'अपने पैसे का सत्यापन करें',
      description: 'Compare approved vs disbursed loan amounts and expected MSP payments. We calculate exact differences instantly.',
      descriptionHi: 'स्वीकृत और वितरित ऋण राशि तथा एमएसपी भुगतान की तुलना करें। हम तुरंत सही अंतर की गणना करते हैं।',
    },
    {
      title: 'Ask in Your Language',
      titleHi: 'अपनी भाषा में पूछें',
      description: 'Ask questions by typing or speaking in simple Hindi or English. Get transparent, policy-backed answers.',
      descriptionHi: 'सरल हिंदी या अंग्रेजी में बोलकर या लिखकर सवाल पूछें। नीति-सम्मत और स्पष्ट उत्तर पाएं।',
    },
    {
      title: 'Track and Download Reports',
      titleHi: 'रिपोर्ट ट्रैक और डाउनलोड करें',
      description: 'Generate clean PDF discrepancy reports with arithmetic breakdowns ready for bank officials or grievance submission.',
      descriptionHi: 'बैंक अधिकारियों या शिकायत दर्ज करने हेतु संपूर्ण हिसाब के साथ औपचारिक पीडीएफ रिपोर्ट डाउनलोड करें।',
    },
  ];

  const current = steps[step];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      navigate('/farmer');
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-cream flex flex-col justify-between p-6 max-w-md mx-auto">
      {/* Top Header: 4 Dots & Skip Button (Image B Screen 2) */}
      <div className="flex items-center justify-between pt-2">
        {/* Step dots */}
        <div className="flex items-center gap-2">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === step ? 'w-6 bg-saffron' : 'w-2 bg-tint'
              }`}
            />
          ))}
        </div>

        <button
          onClick={() => navigate('/farmer')}
          className="text-xs font-bold text-muted hover:text-charcoal px-3 py-1.5 rounded-full hover:bg-cream-surface min-h-[36px]"
        >
          Skip
        </button>
      </div>

      {/* Main Clipboard Illustration & Text Card (Image B Screen 2) */}
      <div className="my-auto py-6 text-center flex flex-col items-center">
        {/* Clipboard with checklist artwork */}
        <div className="w-56 h-56 rounded-full bg-tint/60 border border-warm-border flex items-center justify-center relative mb-6 shadow-soft p-4">
          <img 
            src={clipboardChecklistImg} 
            alt="Check entitlements illustration" 
            className="w-full h-full object-contain"
          />
        </div>

        <h2 className="text-2xl font-bold text-charcoal tracking-tight mb-2">
          {current.title}
        </h2>
        <p className="text-xs sm:text-sm text-muted leading-relaxed max-w-xs">
          {current.description}
        </p>
      </div>

      {/* Bottom Action Controls: Back (outlined) and Next (green) - Image B Screen 2 */}
      <div className="flex items-center gap-3 pb-4">
        {step > 0 ? (
          <button
            onClick={handleBack}
            className="flex-1 h-[50px] py-3 px-5 rounded-xl border border-warm-border bg-cream-surface text-charcoal font-bold text-sm shadow-soft hover:bg-tint/40 transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        ) : (
          <div className="flex-1" />
        )}

        <button
          onClick={handleNext}
          className="flex-1 h-[50px] py-3 px-5 rounded-xl bg-forest hover:bg-forest-dark text-white font-bold text-sm shadow-soft transition-all flex items-center justify-center gap-2 active:scale-98"
        >
          <span>{step === steps.length - 1 ? 'Get Started' : 'Next'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
