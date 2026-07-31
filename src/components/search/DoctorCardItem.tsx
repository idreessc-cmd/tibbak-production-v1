'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { Doctor, Specialty, City } from '@/types';
import { MapPin, Award, CheckCircle, Star, ShieldCheck, Video, Calendar, Bookmark, BookmarkCheck } from 'lucide-react';
import { isDemoMode, appendDemoParam } from '@/lib/demo/demo-context';

interface DoctorCardItemProps {
  doctor: Doctor;
  specialty?: Specialty;
  city?: City;
  isRtl: boolean;
}

export default function DoctorCardItem({ doctor, specialty, city, isRtl }: DoctorCardItemProps) {
  const [isSaved, setIsSaved] = useState(false);
  const searchParams = useSearchParams();
  const isDemo = isDemoMode(searchParams);
  const doctorProfileHref = appendDemoParam(`/doctors/${doctor.slug}`, isDemo);

  // Mock accepted insurance names for verified / boosted doctors
  const mockInsurances = [
    isRtl ? 'الشرق العربي للتأمين' : 'gig Jordan Insurance',
    isRtl ? 'النيوتن للتأمين الصحي' : 'Newton Insurance',
    isRtl ? 'الأولى للتأمين' : 'First Insurance'
  ];

  return (
    <div 
      className={`bg-white rounded-3xl border p-5 md:p-6 flex flex-col md:flex-row gap-5 relative transition-all hover:shadow-md font-cairo text-right rtl:text-right ltr:text-left ${
        doctor.subscriptionPlan === 'vip' ? 'border-2 border-amber-300 shadow-xs' : 'border-slate-100'
      }`}
    >
      {/* Rank / Sponsored Badges */}
      <div className="absolute top-4 left-4 flex items-center gap-1.5 z-10">
        {doctor.isSponsored && (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black bg-rose-600 text-white shadow-xs">
            {isRtl ? 'إعلان' : 'Sponsored'}
          </span>
        )}
        {doctor.subscriptionPlan === 'vip' && (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black bg-amber-500 text-white shadow-xs">
            ★ {isRtl ? 'باقة VIP' : 'VIP Plan'}
          </span>
        )}
        {doctor.subscriptionPlan === 'professional' && (
          <span className="inline-flex items-center gap-1 text-teal-800 font-extrabold bg-teal-50 border border-teal-150 px-3 py-1 rounded-xl">
            {isRtl ? 'باقة مهنية' : 'Professional'}
          </span>
        )}
      </div>

      {/* Left: Avatar & Rating */}
      <div className="flex flex-col items-center md:items-start text-center md:text-right gap-2.5 flex-shrink-0">
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 text-3xl font-black shadow-xs relative">
          {doctor.name_en.split(' ').pop()?.charAt(0)}
          {doctor.is_verified && (
            <span className="absolute -bottom-1 -right-1 bg-blue-500 text-white p-1.5 rounded-full border-2 border-white shadow-xs" title={isRtl ? 'طبيب موثق' : 'Verified Doctor'}>
              <CheckCircle className="h-3.5 w-3.5 fill-white text-blue-500" />
            </span>
          )}
        </div>

        {/* Rating summary */}
        <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-xl">
          <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
          <span className="text-xs font-black text-slate-800">{doctor.rating}</span>
          <span className="text-[10px] text-slate-400 font-semibold">({doctor.reviews_count} {isRtl ? 'تقييم' : 'reviews'})</span>
        </div>
      </div>

      {/* Middle: Details */}
      <div className="flex-1 space-y-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-slate-900 text-lg hover:text-teal-600 transition-colors">
              <Link href={doctorProfileHref}>
                {isRtl ? doctor.name_ar : doctor.name_en}
              </Link>
            </h3>
            {doctor.is_verified && (
              <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-extrabold border border-blue-100">
                {isRtl ? 'موثق' : 'Verified'}
              </span>
            )}
          </div>

          <p className="text-xs font-black text-teal-600 mt-0.5">
            {specialty ? (isRtl ? specialty.name_ar : specialty.name_en) : ''}
          </p>

          <p className="text-xs text-slate-500 font-semibold mt-1 leading-relaxed">
            {isRtl ? doctor.title_ar : doctor.title_en}
          </p>
        </div>

        {/* Key Attributes */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-2 border-t border-slate-100 text-xs font-semibold text-slate-600">
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-slate-400" />
            <span>{city ? (isRtl ? city.name_ar : city.name_en) : ''}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Award className="h-3.5 w-3.5 text-slate-400" />
            <span>{isRtl ? `خبرة ${doctor.experience_years} سنة` : `${doctor.experience_years} yrs exp`}</span>
          </div>
        </div>

        {/* Insurance Companies Badges */}
        {(doctor.subscriptionPlan === 'vip' || doctor.subscriptionPlan === 'professional' || doctor.is_verified) && (
          <div className="space-y-1 pt-1">
            <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">
              {isRtl ? 'التأمينات المقبولة:' : 'Accepted Insurance:'}
            </span>
            <div className="flex flex-wrap gap-1">
              {mockInsurances.map((ins, idx) => (
                <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-100">
                  <ShieldCheck className="h-3 w-3 text-emerald-600" />
                  <span>{ins}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Teleconsultation badge */}
        {doctor.organicSortOrder % 2 === 1 && (
          <div className="pt-0.5">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-purple-50 text-purple-800 border border-purple-100">
              <Video className="h-3 w-3 text-purple-600" />
              <span>{isRtl ? 'استشارة مرئية أونلاين متوفرة' : 'Teleconsultation Available'}</span>
            </span>
          </div>
        )}
      </div>

      {/* Right: Booking Summary Actions */}
      <div className="flex flex-col justify-between items-center md:items-end text-center md:text-right md:border-l md:border-slate-100 md:pl-5 md:rtl:border-l-0 md:rtl:border-r md:rtl:pl-0 md:rtl:pr-5 gap-3 flex-shrink-0 min-w-[170px]">
        <div>
          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">{isRtl ? 'سعر الكشفية' : 'Consultation Fee'}</span>
          <div className="text-2xl font-black text-teal-600 mt-0.5">
            {doctor.consultation_fee_jod} <span className="text-xs font-bold text-slate-500">{isRtl ? 'د.أ' : 'JOD'}</span>
          </div>
          
          <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 mt-1.5 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-100">
            <Calendar className="h-3 w-3 text-emerald-600" />
            <span>{isRtl ? `أول موعد: ${doctor.first_available_date}` : `Earliest: ${doctor.first_available_date}`}</span>
          </div>
        </div>

        <div className="space-y-2 w-full pt-2">
          {/* Primary CTA */}
          <Link
            href={doctorProfileHref}
            className="block w-full text-center bg-teal-600 hover:bg-teal-700 text-white font-extrabold py-3 px-4 rounded-2xl transition-all text-xs shadow-xs"
          >
            {isRtl ? 'عرض الملف والحجز' : 'View profile and book'}
          </Link>

          {/* Secondary Action: Save for Comparison */}
          <button
            type="button"
            onClick={() => setIsSaved(!isSaved)}
            className={`w-full py-2 px-3 rounded-xl text-[11px] font-bold transition-colors flex items-center justify-center gap-1.5 border cursor-pointer ${
              isSaved 
                ? 'bg-amber-50 text-amber-800 border-amber-200' 
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {isSaved ? (
              <>
                <BookmarkCheck className="h-3.5 w-3.5 text-amber-600 fill-amber-500" />
                <span>{isRtl ? 'محفوظ للمقارنة' : 'Saved for comparison'}</span>
              </>
            ) : (
              <>
                <Bookmark className="h-3.5 w-3.5 text-slate-400" />
                <span>{isRtl ? 'حفظ للمقارنة' : 'Save for comparison'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
