import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardCheck, Landmark, Bot, FileText, ArrowRight, ArrowLeft } from 'lucide-react';

export const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  const steps = [
    {
      icon: ClipboardCheck,
      title: 'Check Your Entitlements',
      titleHi: 'अपनी पात्रता जांचें',
      description: 'Know which government schemes, loans, subsidies and insurance you are eligible for based on your land and crop.',
      descriptionHi: 'अपनी ज़मीन और फसल के आधार पर जानें कि आप किन सरकारी योजनाओं, ऋणों और सब्सिडी के पात्र हैं।',
    },
    {
      icon: Landmark,
      title: 'Verify Every Rupee',
      titleHi: 'हर रुपये का सत्यापन',
      description: 'Compare approved vs disbursed loan amounts and expected MSP payments. We calculate exact differences instantly.',
      descriptionHi: 'स्वीकृत और वितरित ऋण राशि तथा एमएसपी भुगतान की तुलना करें। हम तुरंत सही अंतर की गणना करते हैं।',
    },
    {
      icon: Bot,
      title: 'Voice AI Assistant',
      titleHi: 'आवाज से पूछें',
      description: 'Ask questions by typing or speaking in simple Hindi or English. Get transparent, policy-backed answers.',
      descriptionHi: 'सरल हिंदी या अंग्रेजी में बोलकर या लिखकर सवाल पूछें। नीति-सम्मत और स्पष्ट उत्तर पाएं।',
    },
    {
      icon: FileText,
      title: 'Download Formal Reports',
      titleHi: 'रिपोर्ट डाउनलोड करें',
      description: 'Generate clean PDF discrepancy reports with arithmetic breakdowns ready for bank officials or grievance submission.',
      descriptionHi: 'बैंक अधिकारियों या शिकायत दर्ज करने हेतु संपूर्ण हिसाब के साथ औपचारिक पीडीएफ रिपोर्ट डाउनलोड करें।',
    },
  ];

  const current = steps[step];
  const Icon = current.icon;

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
    <div className="min-h-screen bg-warm-bg flex flex-col justify-between p-6 max-w-md mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between pt-2">
        {/* Step dots */}
        <div className="flex items-center gap-1.5">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === step ? 'w-6 bg-sage-600' : 'w-2 bg-sage-200'
              }`}
            />
          ))}
        </div>

        <button
          onClick={() => navigate('/farmer')}
          className="text-xs font-semibold text-gray-500 hover:text-gray-900 px-3 py-1.5 rounded-full hover:bg-white"
        >
          Skip
        </button>
      </div>

      {/* Main Illustration & Text Card */}
      <div className="my-auto py-8 text-center flex flex-col items-center">
        {/* Rounded circular illustration badge */}
        <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-sage-100 border-4 border-white shadow-card flex items-center justify-center relative mb-8">
          <div className="w-36 h-36 rounded-full bg-white flex items-center justify-center shadow-soft">
            <Icon className="w-20 h-20 text-sage-600 stroke-[1.6]" />
          </div>
          {/* Decorative grain sprig badge */}
          <div className="absolute -top-1 -right-1 w-12 h-12 rounded-full bg-sage-600 text-white flex items-center justify-center font-bold text-xs shadow-md">
            ✓
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-3">
          {current.title}
        </h2>
        <p className="text-sm text-gray-600 leading-relaxed max-w-xs">
          {current.description}
        </p>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center gap-4 pb-4">
        {step > 0 ? (
          <button
            onClick={handleBack}
            className="flex-1 h-12 py-3 px-6 rounded-2xl bg-white border border-warm-border text-gray-700 font-semibold text-sm shadow-soft hover:bg-warm-bg transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        ) : (
          <button
            onClick={() => navigate('/splash')}
            className="flex-1 h-12 py-3 px-6 rounded-2xl bg-white border border-warm-border text-gray-700 font-semibold text-sm shadow-soft hover:bg-warm-bg transition-colors"
          >
            Cancel
          </button>
        )}

        <button
          onClick={handleNext}
          className="flex-1 h-12 py-3 px-6 rounded-2xl bg-sage-600 hover:bg-sage-700 text-white font-semibold text-sm shadow-card flex items-center justify-center gap-2 transition-all transform active:scale-98"
        >
          <span>{step === steps.length - 1 ? 'Get Started' : 'Next'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
