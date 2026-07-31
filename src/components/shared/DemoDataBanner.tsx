'use client';

import { useLocale } from 'next-intl';
import { AlertTriangle } from 'lucide-react';

interface DemoDataBannerProps {
  compact?: boolean;
}

export default function DemoDataBanner({ compact = false }: DemoDataBannerProps) {
  const locale = useLocale();
  const isRtl = locale === 'ar';

  const textAr = 'هذه نسخة تجريبية وتستخدم بيانات وهمية. لا تُستخدم لتقديم تشخيص أو استشارة طبية حقيقية.';
  const textEn = 'This is a demonstration using fictional data. It is not used to provide real medical diagnosis or consultation.';

  if (compact) {
    return (
      <div 
        role="status" 
        aria-live="polite" 
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-extrabold bg-amber-50 text-amber-800 border border-amber-200"
      >
        <AlertTriangle className="h-3 w-3 text-amber-600 flex-shrink-0" />
        <span>{isRtl ? 'نسخة تجريبية' : 'Demo Mode'}</span>
      </div>
    );
  }

  return (
    <div 
      role="alert" 
      className="bg-gradient-to-r from-amber-50 to-amber-100/50 border border-amber-200 text-amber-900 rounded-2xl p-4 flex items-start gap-3 shadow-sm select-none"
    >
      <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
      <div className="text-right rtl:text-right ltr:text-left">
        <h4 className="font-extrabold text-xs sm:text-sm text-amber-800 font-cairo">
          {isRtl ? 'بيئة تجريبية وبيانات توضيحية' : 'Demonstration & Simulated Data'}
        </h4>
        <p className="text-[11px] sm:text-xs text-amber-700 mt-1 leading-relaxed font-semibold font-cairo">
          {isRtl ? textAr : textEn}
        </p>
      </div>
    </div>
  );
}
