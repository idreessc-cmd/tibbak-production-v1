'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { Doctor, Specialty, City } from '@/types';
import { isDoctorFavorite, toggleDoctorFavorite } from '@/lib/favorites';
import { getEffectiveDoctorPrice } from '@/lib/offers';
import { 
  Heart, Star, MapPin, Calendar, ShieldCheck, Stethoscope, Award, Tag, Sparkles 
} from 'lucide-react';

interface DoctorResultCardProps {
  doctor: Doctor;
  specialty?: Specialty;
  city?: City;
}

export default function DoctorResultCard({ doctor, specialty, city }: DoctorResultCardProps) {
  const locale = useLocale();
  const router = useRouter();
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
    e.stopPropagation();
    const newState = toggleDoctorFavorite(doctor.id);
    setIsFav(newState);
  };

  const handleCardClick = () => {
    router.push(`/doctors/${doctor.slug}`);
  };

  const doctorName = isAr ? doctor.name_ar : doctor.name_en;
  const doctorTitle = isAr ? doctor.title_ar : doctor.title_en;
  const specialtyName = specialty ? (isAr ? specialty.name_ar : specialty.name_en) : '';
  const cityName = city ? (isAr ? city.name_ar : city.name_en) : '';

  const { basePrice, effectivePrice, hasActiveOffer, discountPercentage, offerEndDate } = effectivePriceInfo;

  return (
    <article 
      onClick={handleCardClick}
      className="group relative bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-teal-500/50 transition-all p-3.5 sm:p-4 cursor-pointer font-cairo dir-auto select-none overflow-hidden"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <div className="flex items-start gap-3 sm:gap-4">
        
        {/* Doctor Avatar Container */}
        <div className="relative shrink-0">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 font-extrabold text-xl sm:text-2xl shadow-xs group-hover:scale-105 transition-transform overflow-hidden">
            {doctor.title_ar.includes('د.') || doctor.title_en.includes('Dr.') ? (
              <Stethoscope className="h-8 w-8 text-teal-600" />
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
              <ShieldCheck className="h-3.5 w-3.5" />
            </div>
          )}
        </div>

        {/* Doctor Info Body */}
        <div className="flex-1 min-w-0 space-y-1.5">
          
          {/* Top Row: Name + Favorite Heart Button */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="text-sm sm:text-base font-black text-slate-900 leading-tight group-hover:text-teal-700 transition-colors">
                  {doctorName}
                </h3>
                {doctor.isSponsored && (
                  <span className="bg-amber-100 text-amber-900 font-extrabold text-[10px] px-2 py-0.5 rounded-full">
                    {isAr ? 'موصى به' : 'Sponsored'}
                  </span>
                )}
                {hasActiveOffer && (
                  <span className="inline-flex items-center gap-1 bg-rose-600 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-full shadow-xs animate-pulse">
                    <Sparkles className="h-3 w-3" />
                    <span>{isAr ? `عرض خاص -${discountPercentage}%` : `Special Offer -${discountPercentage}%`}</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-semibold line-clamp-1 mt-0.5">
                {doctorTitle} {specialtyName ? `• ${specialtyName}` : ''}
              </p>
            </div>

            {/* Favorite Heart Button (Isolated Click Event) */}
            <button
              type="button"
              onClick={handleFavoriteClick}
              aria-label={isFav ? (isAr ? 'إزالة من المفضلة' : 'Remove from favorites') : (isAr ? 'إضافة للمفضلة' : 'Add to favorites')}
              className={`p-2 rounded-xl transition-all shrink-0 cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center ${
                isFav 
                  ? 'bg-rose-50 text-rose-600 scale-110' 
                  : 'bg-slate-100/80 text-slate-400 hover:text-rose-500 hover:bg-slate-100'
              }`}
            >
              <Heart className={`h-5 w-5 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>
          </div>

          {/* Rating + Location Row */}
          <div className="flex items-center gap-3 text-xs text-slate-600 flex-wrap font-medium">
            {/* Rating */}
            <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200/60 font-bold text-amber-900">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span>{doctor.rating.toFixed(1)}</span>
              <span className="text-[10px] text-amber-700 font-normal">({doctor.reviews_count})</span>
            </div>

            {/* Location */}
            {cityName && (
              <div className="flex items-center gap-1 text-slate-500 font-semibold">
                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                <span className="truncate">{cityName}</span>
              </div>
            )}

            {/* Experience */}
            <div className="flex items-center gap-1 text-slate-500 font-semibold hidden sm:flex">
              <Award className="h-3.5 w-3.5 text-slate-400" />
              <span>{doctor.experience_years} {isAr ? 'سنوات خبرة' : 'yrs exp'}</span>
            </div>
          </div>

          {/* Offer Expiry Banner (Active Offer Only) */}
          {hasActiveOffer && offerEndDate && (
            <div className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-100 px-2.5 py-0.5 rounded-md inline-flex items-center gap-1">
              <Tag className="h-3 w-3 text-rose-500" />
              <span>
                {isAr 
                  ? `العرض متاح حتى ${offerEndDate.split('T')[0]}` 
                  : `Offer valid until ${offerEndDate.split('T')[0]}`}
              </span>
            </div>
          )}

          {/* Bottom Row: Consultation Fee + Next Appointment */}
          <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
            {/* Fee */}
            <div className="flex items-baseline gap-1 font-cairo">
              <span className="text-slate-500 font-medium text-[11px]">{isAr ? 'الكشفية:' : 'Fee:'}</span>

              {hasActiveOffer ? (
                <div className="flex items-baseline gap-1.5">
                  <span className="text-rose-600 font-black text-sm">{effectivePrice}</span>
                  <span className="text-rose-700 font-bold text-[11px]">{isAr ? 'دينار' : 'JOD'}</span>
                  <span className="text-slate-400 line-through text-[11px] font-semibold">{basePrice} {isAr ? 'د.أ' : 'JOD'}</span>
                </div>
              ) : (
                <div className="flex items-baseline gap-1">
                  <span className="text-teal-700 font-black text-sm">{basePrice}</span>
                  <span className="text-teal-800 font-bold text-[11px]">{isAr ? 'دينار' : 'JOD'}</span>
                </div>
              )}
            </div>

            {/* Next Available Date */}
            {doctor.first_available_date && (
              <div className="flex items-center gap-1 text-teal-800 font-bold bg-teal-50/80 border border-teal-100 px-2 py-1 rounded-lg text-[11px]">
                <Calendar className="h-3 w-3 text-teal-600" />
                <span>{isAr ? 'أقرب موعد:' : 'Earliest:'} {doctor.first_available_date}</span>
              </div>
            )}
          </div>

        </div>

      </div>
    </article>
  );
}

