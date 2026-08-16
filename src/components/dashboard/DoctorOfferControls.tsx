'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { Doctor } from '@/types';
import { 
  DoctorOffer, 
  getDoctorLocalOffer, 
  saveDoctorLocalOffer, 
  getEffectiveDoctorPrice, 
  validateDoctorOffer 
} from '@/lib/offers';
import { Tag, Sparkles, AlertCircle, Check, RefreshCw, Percent, DollarSign } from 'lucide-react';

interface DoctorOfferControlsProps {
  doctor: Doctor;
}

export default function DoctorOfferControls({ doctor }: DoctorOfferControlsProps) {
  const locale = useLocale();
  const isAr = locale === 'ar';

  const basePrice = doctor.consultation_fee_jod;

  const [enabled, setEnabled] = useState(false);
  const [type, setType] = useState<'percentage' | 'fixed'>('percentage');
  const [value, setValue] = useState<number>(15);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load existing local offer on mount
  useEffect(() => {
    const existing = getDoctorLocalOffer(doctor.id);
    if (existing) {
      setEnabled(existing.enabled);
      setType(existing.type);
      setValue(existing.value);
      setStartDate(existing.startDate || '');
      setEndDate(existing.endDate || '');
    } else if (doctor.offer_enabled) {
      setEnabled(true);
      setType(doctor.offer_type || 'percentage');
      setValue(doctor.offer_value || 15);
      setStartDate(doctor.offer_start_date || '');
      setEndDate(doctor.offer_end_date || '');
    }
  }, [doctor]);

  const currentOffer: DoctorOffer = {
    enabled,
    type,
    value: Number(value) || 0,
    startDate: startDate ? new Date(startDate).toISOString() : undefined,
    endDate: endDate ? new Date(endDate).toISOString() : undefined,
  };

  // Run Safety Validation
  const validation = validateDoctorOffer(currentOffer, basePrice);

  // Run Live Price Calculation Preview
  const previewPrice = getEffectiveDoctorPrice(doctor, currentOffer);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validation.isValid) return;

    saveDoctorLocalOffer(doctor.id, currentOffer);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleReset = () => {
    const resetOffer: DoctorOffer = {
      enabled: false,
      type: 'percentage',
      value: 0,
      startDate: undefined,
      endDate: undefined,
    };
    setEnabled(false);
    setType('percentage');
    setValue(0);
    setStartDate('');
    setEndDate('');
    saveDoctorLocalOffer(doctor.id, resetOffer);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-6 font-cairo dir-auto" dir={isAr ? 'rtl' : 'ltr'}>
      
      {/* Header Banner */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
            <Tag className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-900">
              {isAr ? 'إدارة العروض الترويجية والخصومات (عرض توضيحي)' : 'Manage Promotional Offers & Discounts (Demo)'}
            </h2>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              {isAr ? `الكشفية الأساسية: ${basePrice} دينار` : `Base Consultation Fee: ${basePrice} JOD`}
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <span className={`px-3 py-1 rounded-full text-xs font-black ${
          enabled && validation.isValid
            ? 'bg-rose-100 text-rose-900 border border-rose-200'
            : 'bg-slate-100 text-slate-600'
        }`}>
          {enabled && validation.isValid
            ? (isAr ? 'العرض مفعل' : 'Offer Active')
            : (isAr ? 'العرض غير مفعل' : 'Offer Inactive')}
        </span>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        
        {/* Enable / Disable Switch */}
        <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-200/70">
          <div>
            <label htmlFor="offer-toggle" className="text-xs font-black text-slate-900 block cursor-pointer">
              {isAr ? 'تفعيل العرض الترويجي' : 'Enable Promotional Offer'}
            </label>
            <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
              {isAr ? 'عند التفعيل، سيظهر السعر المخفض في بطاقة البحث وملف الطبيب.' : 'When active, discounted fee will be visible on doctor cards and profile.'}
            </p>
          </div>
          <button
            type="button"
            id="offer-toggle"
            onClick={() => setEnabled(!enabled)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
              enabled ? 'bg-teal-600' : 'bg-slate-300'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                enabled ? (isAr ? '-translate-x-5' : 'translate-x-5') : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Offer Controls Grid */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 transition-all ${enabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
          
          {/* Offer Type Select */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              {isAr ? 'نوع العرض' : 'Offer Type'}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType('percentage')}
                className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl border text-xs font-extrabold transition-all cursor-pointer ${
                  type === 'percentage'
                    ? 'bg-teal-50 border-teal-600 text-teal-800'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Percent className="h-3.5 w-3.5" />
                <span>{isAr ? 'نسبة مئوية (%)' : 'Percentage (%)'}</span>
              </button>

              <button
                type="button"
                onClick={() => setType('fixed')}
                className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl border text-xs font-extrabold transition-all cursor-pointer ${
                  type === 'fixed'
                    ? 'bg-teal-50 border-teal-600 text-teal-800'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <DollarSign className="h-3.5 w-3.5" />
                <span>{isAr ? 'مبلغ ثابت (دينار)' : 'Fixed Price (JOD)'}</span>
              </button>
            </div>
          </div>

          {/* Offer Value Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              {type === 'percentage'
                ? (isAr ? 'نسبة الخصم (%)' : 'Discount Percentage (%)')
                : (isAr ? 'سعر الكشفية بعد العرض (دينار)' : 'Promotional Price (JOD)')}
            </label>
            <input
              type="number"
              min="0"
              max={type === 'percentage' ? 99 : basePrice - 1}
              value={value}
              onChange={(e) => setValue(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-black text-slate-900 focus:outline-hidden focus:border-teal-600"
            />
          </div>

          {/* Start Datetime */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              {isAr ? 'تاريخ ووقت بداية العرض' : 'Start Date & Time'}
            </label>
            <input
              type="datetime-local"
              value={startDate.slice(0, 16)}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-hidden focus:border-teal-600"
            />
          </div>

          {/* End Datetime */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              {isAr ? 'تاريخ ووقت نهاية العرض' : 'End Date & Time'}
            </label>
            <input
              type="datetime-local"
              value={endDate.slice(0, 16)}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-hidden focus:border-teal-600"
            />
          </div>

        </div>

        {/* Validation Errors Box (Requirement 5) */}
        {!validation.isValid && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3.5 text-xs font-bold text-rose-800 space-y-1">
            <div className="flex items-center gap-1.5 text-rose-700 font-extrabold">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{isAr ? 'قيود السلامة والتحقق:' : 'Validation Errors:'}</span>
            </div>
            {Object.values(validation.errors).map((err, idx) => (
              <p key={idx} className="text-[11px] text-rose-700 pr-5 rtl:pr-5 ltr:pl-5">
                • {err}
              </p>
            ))}
          </div>
        )}

        {/* Live Preview Box */}
        <div className="bg-gradient-to-r from-teal-900 to-slate-900 text-white rounded-2xl p-4 space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-xs border-b border-teal-800/80 pb-2">
            <span className="font-extrabold flex items-center gap-1.5 text-teal-300">
              <Sparkles className="h-4 w-4" />
              {isAr ? 'معاينة حية لظهور السعر للمريض' : 'Live Patient Price Preview'}
            </span>
            {previewPrice.hasActiveOffer && (
              <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                {isAr ? `خصم ${previewPrice.discountPercentage}%` : `${previewPrice.discountPercentage}% OFF`}
              </span>
            )}
          </div>

          <div className="flex items-baseline justify-between pt-1">
            <span className="text-xs text-slate-300 font-semibold">{isAr ? 'الكشفية النهائية للمريض:' : 'Final Consultation Fee:'}</span>
            {previewPrice.hasActiveOffer ? (
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-black text-rose-400">{previewPrice.effectivePrice} JOD</span>
                <span className="text-xs text-slate-400 line-through font-bold">{previewPrice.basePrice} JOD</span>
              </div>
            ) : (
              <span className="text-lg font-black text-teal-300">{previewPrice.basePrice} JOD</span>
            )}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>{isAr ? 'إعادة التعيين' : 'Reset Offer'}</span>
          </button>

          <button
            type="submit"
            disabled={!validation.isValid}
            className={`inline-flex items-center gap-2 font-black px-6 py-2.5 rounded-xl text-xs shadow-xs transition-all cursor-pointer ${
              validation.isValid
                ? 'bg-teal-600 hover:bg-teal-700 text-white'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            {saveSuccess ? (
              <>
                <Check className="h-4 w-4 text-emerald-300" />
                <span>{isAr ? 'تم الحفظ بنجاح!' : 'Saved Successfully!'}</span>
              </>
            ) : (
              <span>{isAr ? 'حفظ العرض الترويجي' : 'Save Offer Settings'}</span>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
