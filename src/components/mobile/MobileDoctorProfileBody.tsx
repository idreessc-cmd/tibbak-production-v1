'use client';

import { useLocale } from 'next-intl';
import { Doctor, Specialty, City, Hospital } from '@/types';
import { Link } from '@/i18n/routing';
import { 
  User, Award, Stethoscope, Languages, Building2, MapPin, Star, CheckCircle
} from 'lucide-react';

interface MobileDoctorProfileBodyProps {
  doctor: Doctor;
  specialty?: Specialty;
  city?: City;
  hospital?: Hospital | null;
}

export default function MobileDoctorProfileBody({
  doctor,
  specialty,
  city,
  hospital,
}: MobileDoctorProfileBodyProps) {
  const locale = useLocale();
  const isAr = locale === 'ar';

  const bio = isAr ? doctor.bio_ar : doctor.bio_en;
  const title = isAr ? doctor.title_ar : doctor.title_en;
  const specialtyName = specialty ? (isAr ? specialty.name_ar : specialty.name_en) : '';
  const cityName = city ? (isAr ? city.name_ar : city.name_en) : '';
  const address = isAr ? doctor.address_ar : doctor.address_en;

  return (
    <div className="md:hidden p-4 space-y-4 font-cairo dir-auto text-slate-800" dir={isAr ? 'rtl' : 'ltr'}>
      
      {/* 1. Bio & About Card */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-2">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
          <User className="h-4 w-4 text-teal-600" />
          <h2 className="text-sm font-black text-slate-900">
            {isAr ? 'نبذة عن الطبيب' : 'About the Doctor'}
          </h2>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed font-semibold pt-1">
          {bio}
        </p>
      </div>

      {/* 2. Qualifications & Experience Card */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
          <Award className="h-4 w-4 text-teal-600" />
          <h2 className="text-sm font-black text-slate-900">
            {isAr ? 'الشهادات والخبرات' : 'Qualifications & Experience'}
          </h2>
        </div>

        <div className="space-y-2 text-xs font-semibold text-slate-700">
          <div className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <span className="w-2 h-2 rounded-full bg-teal-600 mt-1.5 shrink-0"></span>
            <div>
              <h3 className="font-bold text-slate-900">{isAr ? 'اللقب والتخصص العلمي:' : 'Scientific Title:'}</h3>
              <p className="text-slate-600 text-[11px] mt-0.5">{title}</p>
            </div>
          </div>

          <div className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <span className="w-2 h-2 rounded-full bg-teal-600 mt-1.5 shrink-0"></span>
            <div>
              <h3 className="font-bold text-slate-900">{isAr ? 'سنوات الخبرة:' : 'Years of Experience:'}</h3>
              <p className="text-slate-600 text-[11px] mt-0.5">
                {isAr ? `أكثر من ${doctor.experience_years} سنة خبرة متميزة` : `Over ${doctor.experience_years} years of practice`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Services & Focus Areas Card */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
          <Stethoscope className="h-4 w-4 text-teal-600" />
          <h2 className="text-sm font-black text-slate-900">
            {isAr ? 'التخصص والخدمات الطبية' : 'Services & Specialty'}
          </h2>
        </div>

        <div className="space-y-2.5">
          <div className="flex flex-wrap gap-1.5">
            {specialtyName && (
              <span className="bg-teal-50 text-teal-800 px-3 py-1 rounded-lg text-xs font-extrabold border border-teal-100">
                {specialtyName}
              </span>
            )}
            <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg text-[11px] font-bold">
              {isAr ? 'استشارات سريرية' : 'Clinical Consultations'}
            </span>
            <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg text-[11px] font-bold">
              {isAr ? 'تشخيص ومتابعة دورية' : 'Diagnostics & Follow-up'}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-1.5 pt-1 text-[11px] font-semibold text-slate-600">
            <div className="flex items-center gap-1.5">
              <CheckCircle className="h-3.5 w-3.5 text-teal-600 shrink-0" />
              <span>{isAr ? 'الفحص الطبي السريري الشامل' : 'Full Clinical Examination'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle className="h-3.5 w-3.5 text-teal-600 shrink-0" />
              <span>{isAr ? 'إصدار التقارير الطبية الرسمية' : 'Official Medical Reports'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Spoken Languages Card */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-2">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
          <Languages className="h-4 w-4 text-teal-600" />
          <h2 className="text-sm font-black text-slate-900">
            {isAr ? 'اللغات الناطقة' : 'Languages Spoken'}
          </h2>
        </div>
        <div className="flex items-center gap-2 pt-1">
          <span className="bg-slate-100 text-slate-800 text-[11px] font-extrabold px-3 py-1 rounded-lg">العربية (Arabic)</span>
          <span className="bg-slate-100 text-slate-800 text-[11px] font-extrabold px-3 py-1 rounded-lg">English (الإنجليزية)</span>
        </div>
      </div>

      {/* 5. Hospital Affiliation (if present) */}
      {hospital && (
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
            <Building2 className="h-4 w-4 text-teal-600" />
            <h2 className="text-sm font-black text-slate-900">
              {isAr ? 'المستشفى / المركز الطبي' : 'Hospital Affiliation'}
            </h2>
          </div>
          <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100">
            <div>
              <h3 className="text-xs font-black text-slate-900">
                {isAr ? hospital.name_ar : hospital.name_en}
              </h3>
              <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                {cityName}
              </p>
            </div>
            <Link
              href={`/hospitals/${hospital.slug}`}
              className="text-[11px] font-bold text-teal-600 hover:underline bg-white px-2.5 py-1 rounded-lg border border-slate-200"
            >
              {isAr ? 'عرض الملف' : 'View Profile'}
            </Link>
          </div>
        </div>
      )}

      {/* 6. Location & Timings Card */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
          <MapPin className="h-4 w-4 text-teal-600" />
          <h2 className="text-sm font-black text-slate-900">
            {isAr ? 'موقع العيادة ومواعيد العمل' : 'Clinic Location & Hours'}
          </h2>
        </div>

        <div className="space-y-2 text-xs font-semibold">
          <p className="text-slate-600 text-[11px] leading-relaxed">
            {address}
          </p>

          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1.5 text-[11px]">
            <div className="flex justify-between font-bold text-slate-800">
              <span>{isAr ? 'السبت - الأربعاء:' : 'Sat - Wed:'}</span>
              <span className="text-teal-700">09:00 AM - 05:00 PM</span>
            </div>
            <div className="flex justify-between font-bold text-slate-800">
              <span>{isAr ? 'الخميس:' : 'Thu:'}</span>
              <span className="text-teal-700">09:00 AM - 01:00 PM</span>
            </div>
          </div>
        </div>
      </div>

      {/* 7. Patient Reviews Card */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-amber-500 fill-amber-400" />
            <h2 className="text-sm font-black text-slate-900">
              {isAr ? 'تقييمات المرضى' : 'Patient Reviews'}
            </h2>
          </div>
          <span className="text-xs font-bold text-slate-500">
            {doctor.rating.toFixed(1)} / 5 ({doctor.reviews_count})
          </span>
        </div>

        <div className="space-y-2 pt-1 text-xs font-semibold text-slate-600">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-slate-800">{isAr ? 'مريض معتمد' : 'Verified Patient'}</span>
              <div className="flex items-center gap-0.5 text-amber-400">
                ★ ★ ★ ★ ★
              </div>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              {isAr 
                ? 'تعامل راقي جداً واهتمام دقيق بالتفاصيل الطبية. أنصح بشدة بالزيارة.'
                : 'Extremely professional and attentive to medical details. Highly recommended.'}
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
