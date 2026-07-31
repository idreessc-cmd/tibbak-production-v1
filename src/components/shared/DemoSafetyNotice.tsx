'use client';

import React from 'react';

interface DemoSafetyNoticeProps {
  locale?: string;
  className?: string;
}

export function DemoSafetyNotice({ locale = 'ar', className = '' }: DemoSafetyNoticeProps) {
  const isAr = locale === 'ar';
  const noticeAr = 'نسخة تجريبية للعرض فقط — جميع البيانات افتراضية، ويُمنع إدخال بيانات مرضى أو ملفات طبية حقيقية.';
  const noticeEn = 'Demonstration version only — all displayed data is fictional. Do not enter real patient or medical information.';

  return (
    <div 
      className={`bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs px-3.5 py-2 rounded-lg flex items-center gap-2 select-none ${className}`}
      role="note"
      aria-label="Demo Safety Notice"
    >
      <svg className="w-4 h-4 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>{isAr ? noticeAr : noticeEn}</span>
    </div>
  );
}
