'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Doctor, Specialty, City } from '@/types';
import { isDoctorFavorite, toggleDoctorFavorite } from '@/lib/favorites';
import { 
  Heart, Star, MapPin, Calendar, ShieldCheck, Stethoscope, ArrowLeft, ArrowRight, CalendarCheck
} from 'lucide-react';

import { getEffectiveDoctorPrice } from '@/lib/offers';
import { Sparkles } from 'lucide-react';

interface MobileDoctorProfileTopProps {
  doctor: Doctor;
  specialty?: Specialty;
  city?: City;
  onBookClick?: () => void;
}

export default function MobileDoctorProfileTop({
  doctor,
  specialty,
  city,
  onBookClick,
}: MobileDoctorProfileTopProps) {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const [isFav, setIsFav] = useState(false);
  const [effectivePriceInfo, setEffectivePriceInfo] = useState(() => getEffectiveDoctorPrice(doctor));

  useEffect(() => {
    setIsFav(isDoctorFavorite(doctor.id));

    const updateOffer = () => {
      setIsFav(isDoctorFavorite(doctor.id));
      setEffectivePriceInfo(getEffectiveDoctorPrice(doctor));
    };

    window.addEventListener('tibbak_favorites_updated', updateOffer);
    window.addEventListener('tibbak_offer_updated', updateOffer);
    return () => {
      window.removeEventListener('tibbak_favorites_updated', updateOffer);
      window.removeEventListener('tibbak_offer_updated', updateOffer);
    };
  }, [doctor]);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const newState = toggleDoctorFavorite(doctor.id);
    setIsFav(newState);
  };

  const doctorName = isAr ? doctor.name_ar : doctor.name_en;
  const doctorTitle = isAr ? doctor.title_ar : doctor.title_en;
  const specialtyName = specialty ? (isAr ? specialty.name_ar : specialty.name_en) : '';
  const cityName = city ? (isAr ? city.name_ar : city.name_en) : '';

  const { basePrice, effectivePrice, hasActiveOffer, discountPercentage, offerEndDate } = effectivePriceInfo;

  return (
    <div className="md:hidden bg-white border-b border-slate-200/80 p-4 space-y-4 font-cairo dir-auto" dir={isAr ? 'rtl' : 'ltr'}>
      
      {/* Top Header Bar: Back Button + Favorite Button */}
      <div className="flex items-center justify-between">
        <Link
          href="/search"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-full transition-colors"
        >
          {isAr ? <ArrowRight className="h-3.5 w-3.5" /> : <ArrowLeft className="h-3.5 w-3.5" />}
          <span>{isAr ? 'نتائج البحث' : 'Back to Search'}</span>
        </Link>

        {/* Favorite Heart Button */}
        <button
          type="button"
          onClick={handleFavoriteClick}
          aria-label={isFav ? (isAr ? 'إزالة من المفضلة' : 'Remove from favorites') : (isAr ? 'إضافة للمفضلة' : 'Add to favorites')}
          className={`p-2 rounded-full transition-all shrink-0 cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center border ${
            isFav 
              ? 'bg-rose-50 text-rose-600 border-rose-200 scale-105' 
              : 'bg-white text-slate-400 border-slate-200 hover:text-rose-500'
          }`}
        >
          <Heart className={`h-5 w-5 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>
      </div>

      {/* Main Profile Info Row */}
      <div className="flex items-start gap-3.5">
        
        {/* Doctor Photo / Avatar */}
        <div className="relative shrink-0">
          <div className="w-20 h-20 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 font-extrabold text-2xl shadow-xs overflow-hidden">
            {doctorTitle.includes('د.') || doctorTitle.includes('Dr.') ? (
              <Stethoscope className="h-9 w-9 text-teal-600" />
            ) : (
              <span>{doctorName.charAt(0)}</span>
            )}
          </div>

          {/* Verified Badge */}
          {doctor.is_verified && (
            <div 
              className="absolute -bottom-1 -right-1 bg-teal-600 text-white rounded-full p-0.5 border-2 border-white shadow-xs"
              title={isAr ? 'طبيب معتمد ومتحقق منه' : 'Verified Doctor'}
            >
              <ShieldCheck className="h-4 w-4" />
            </div>
          )}
        </div>

        {/* Name, Specialty & Rating */}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h1 className="text-base font-black text-slate-900 leading-tight">
              {doctorName}
            </h1>
            {doctor.isSponsored && (
              <span className="bg-amber-100 text-amber-900 font-extrabold text-[10px] px-2 py-0.5 rounded-full">
                {isAr ? 'موصى به' : 'Sponsored'}
              </span>
            )}
            {hasActiveOffer && (
              <span className="inline-flex items-center gap-1 bg-rose-600 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-full shadow-xs animate-pulse">
                <Sparkles className="h-3 w-3" />
                <span>{isAr ? `خصم ${discountPercentage}%` : `${discountPercentage}% OFF`}</span>
              </span>
            )}
          </div>

          <p className="text-xs font-bold text-teal-700">
            {specialtyName}
          </p>

          <p className="text-[11px] text-slate-500 font-semibold line-clamp-1">
            {doctorTitle}
          </p>

          {/* Rating + Location */}
          <div className="flex items-center gap-2 text-xs flex-wrap pt-0.5">
            <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60 font-bold text-amber-900">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span>{doctor.rating.toFixed(1)}</span>
              <span className="text-[10px] text-amber-700 font-normal">({doctor.reviews_count})</span>
            </div>

            {cityName && (
              <div className="flex items-center gap-1 text-slate-500 font-semibold text-[11px]">
                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                <span>{cityName}</span>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Key Decision Stats Bar: Fee & Availability */}
      <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs font-cairo">
        {/* Price / Fee */}
        <div className="flex flex-col items-start px-2">
          <span className="text-slate-500 font-medium text-[11px]">{isAr ? 'سعر الكشفية:' : 'Consultation Fee:'}</span>
          {hasActiveOffer ? (
            <div className="space-y-0.5">
              <div className="flex items-baseline gap-1 font-black text-rose-600 text-sm">
                <span>{effectivePrice}</span>
                <span className="text-[11px] font-bold text-rose-700">{isAr ? 'دينار' : 'JOD'}</span>
                <span className="text-slate-400 line-through text-[11px] font-semibold">{basePrice} {isAr ? 'د.أ' : 'JOD'}</span>
              </div>
              {offerEndDate && (
                <div className="text-[9px] font-bold text-rose-700">
                  {isAr ? `متاح حتى ${offerEndDate.split('T')[0]}` : `Valid until ${offerEndDate.split('T')[0]}`}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-baseline gap-1 font-black text-teal-700 text-sm">
              <span>{basePrice}</span>
              <span className="text-[11px] font-bold text-teal-800">{isAr ? 'دينار' : 'JOD'}</span>
            </div>
          )}
        </div>

        {/* Earliest Available Date */}
        <div className="flex flex-col items-start px-2 border-r rtl:border-r-0 rtl:border-l border-slate-200">
          <span className="text-slate-500 font-medium text-[11px]">{isAr ? 'أقرب موعد:' : 'Earliest Date:'}</span>
          <div className="flex items-center gap-1 font-bold text-slate-800 text-[11px] mt-0.5">
            <Calendar className="h-3.5 w-3.5 text-teal-600" />
            <span>{doctor.first_available_date || (isAr ? 'متوفر اليوم' : 'Available today')}</span>
          </div>
        </div>
      </div>

      {/* Primary Action Button (Book / Request Consultation) */}
      <div className="pt-1">
        <button
          type="button"
          onClick={onBookClick}
          className="w-full bg-teal-600 hover:bg-teal-700 text-white font-extrabold py-3 px-4 rounded-xl text-xs shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer font-cairo"
        >
          <CalendarCheck className="h-4 w-4" />
          <span>{isAr ? 'طلب حجز / استشارة طبية' : 'Book / Request Consultation'}</span>
        </button>
      </div>

    </div>
  );
}
