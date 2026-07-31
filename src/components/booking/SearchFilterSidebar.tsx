'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';
import { useSearchParams } from 'next/navigation';
import { SlidersHorizontal, ArrowUpDown, ShieldCheck, Video, X } from 'lucide-react';
import { City, Specialty } from '@/types';

interface SearchFilterSidebarProps {
  specialties: Specialty[];
  cities: City[];
}

export default function SearchFilterSidebar({ specialties, cities }: SearchFilterSidebarProps) {
  const locale = useLocale();
  const isRtl = locale === 'ar';
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Load initial values from searchParams
  const [selectedSpecialty, setSelectedSpecialty] = useState(searchParams.get('specialty') || '');
  const [selectedCity, setSelectedCity] = useState(searchParams.get('city') || '');
  const [selectedGender, setSelectedGender] = useState(searchParams.get('gender') || '');
  const [selectedFees, setSelectedFees] = useState(searchParams.get('fees') || '');
  const [selectedSort, setSelectedSort] = useState(searchParams.get('sort') || 'ranking');
  const [insurance, setInsurance] = useState(searchParams.get('insurance') === 'true');
  const [online, setOnline] = useState(searchParams.get('online') === 'true');
  const [experience, setExperience] = useState(searchParams.get('experience') || '');
  const [rankFilter, setRankFilter] = useState(searchParams.get('rank') || '');

  // Keep state in sync with URL changes
  useEffect(() => {
    setSelectedSpecialty(searchParams.get('specialty') || '');
    setSelectedCity(searchParams.get('city') || '');
    setSelectedGender(searchParams.get('gender') || '');
    setSelectedFees(searchParams.get('fees') || '');
    setSelectedSort(searchParams.get('sort') || 'ranking');
    setInsurance(searchParams.get('insurance') === 'true');
    setOnline(searchParams.get('online') === 'true');
    setExperience(searchParams.get('experience') || '');
    setRankFilter(searchParams.get('rank') || '');
  }, [searchParams]);

  const applyFilters = (newParams: Record<string, string | boolean | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    Object.entries(newParams).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '' && value !== false) {
        params.set(key, String(value));
      } else {
        params.delete(key);
      }
    });

    router.push(`${pathname}?${params.toString()}`);
  };

  const clearAllFilters = () => {
    const isDemo = searchParams.get('demo') === '1';
    router.push(isDemo ? `${pathname}?demo=1` : pathname);
    setIsMobileOpen(false);
  };

  const filterContent = (
    <div className="space-y-6 font-cairo text-right rtl:text-right ltr:text-left">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <h3 className="font-black text-slate-800 text-base flex items-center gap-2">
          <SlidersHorizontal className="h-4.5 w-4.5 text-teal-600" />
          <span>{isRtl ? 'فلاتر التصفية' : 'Search Filters'}</span>
        </h3>
        <button 
          onClick={clearAllFilters}
          className="text-xs font-bold text-teal-600 hover:text-teal-700 transition-colors cursor-pointer"
        >
          {isRtl ? 'إعادة تعيين الكل' : 'Clear all'}
        </button>
      </div>

      {/* Sort Option */}
      <div className="space-y-2">
        <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 block">
          <ArrowUpDown className="h-3.5 w-3.5 text-teal-600" />
          <span>{isRtl ? 'ترتيب حسب' : 'Sort by'}</span>
        </label>
        <select
          value={selectedSort}
          onChange={(e) => {
            setSelectedSort(e.target.value);
            applyFilters({ sort: e.target.value });
          }}
          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-extrabold focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-slate-800 cursor-pointer"
        >
          <option value="ranking">{isRtl ? 'الأنسب (الظهور الأولوية)' : 'Most Relevant'}</option>
          <option value="rating">{isRtl ? 'الأعلى تقييمًا' : 'Highest Rated'}</option>
          <option value="earliest_date">{isRtl ? 'أقرب موعد متاحة' : 'Earliest Available'}</option>
          <option value="fees_asc">{isRtl ? 'السعر من الأقل للأعلى' : 'Price: Low to High'}</option>
          <option value="fees_desc">{isRtl ? 'السعر من الأعلى للأقل' : 'Price: High to Low'}</option>
          <option value="experience">{isRtl ? 'الأكثر خبرة' : 'Most Experienced'}</option>
        </select>
      </div>

      {/* Specialty Filter */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
          {isRtl ? 'التخصص الطبي' : 'Specialty'}
        </label>
        <select
          value={selectedSpecialty}
          onChange={(e) => {
            setSelectedSpecialty(e.target.value);
            applyFilters({ specialty: e.target.value });
          }}
          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-extrabold focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-slate-800 cursor-pointer"
        >
          <option value="">{isRtl ? 'جميع التخصصات' : 'All Specialties'}</option>
          {specialties.map((spec) => (
            <option key={spec.id} value={spec.slug}>
              {isRtl ? spec.name_ar : spec.name_en}
            </option>
          ))}
        </select>
      </div>

      {/* City Filter */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
          {isRtl ? 'المدينة / المحافظة' : 'City / Governorate'}
        </label>
        <select
          value={selectedCity}
          onChange={(e) => {
            setSelectedCity(e.target.value);
            applyFilters({ city: e.target.value });
          }}
          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-extrabold focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-slate-800 cursor-pointer"
        >
          <option value="">{isRtl ? 'جميع المدن' : 'All Cities'}</option>
          {cities.map((city) => (
            <option key={city.id} value={city.slug}>
              {isRtl ? city.name_ar : city.name_en}
            </option>
          ))}
        </select>
      </div>

      {/* Fast Checkbox Toggles */}
      <div className="space-y-3 pt-2 border-t border-slate-100">
        
        {/* Accepts Insurance */}
        <label className="flex items-center gap-3 text-xs font-bold text-slate-700 cursor-pointer hover:text-teal-600 transition-colors">
          <input
            type="checkbox"
            checked={insurance}
            onChange={(e) => {
              setInsurance(e.target.checked);
              applyFilters({ insurance: e.target.checked });
            }}
            className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 h-4 w-4"
          />
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>{isRtl ? 'يقبل التأمين الصحي' : 'Accepts Insurance'}</span>
          </div>
        </label>

        {/* Teleconsultation */}
        <label className="flex items-center gap-3 text-xs font-bold text-slate-700 cursor-pointer hover:text-teal-600 transition-colors">
          <input
            type="checkbox"
            checked={online}
            onChange={(e) => {
              setOnline(e.target.checked);
              applyFilters({ online: e.target.checked });
            }}
            className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 h-4 w-4"
          />
          <div className="flex items-center gap-1.5">
            <Video className="h-4 w-4 text-purple-600" />
            <span>{isRtl ? 'استشارة عن بعد (أونلاين)' : 'Teleconsultation'}</span>
          </div>
        </label>

      </div>

      {/* Experience Filter */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
          {isRtl ? 'سنوات الخبرة' : 'Years of Experience'}
        </label>
        <select
          value={experience}
          onChange={(e) => {
            setExperience(e.target.value);
            applyFilters({ experience: e.target.value });
          }}
          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-extrabold focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-slate-800 cursor-pointer"
        >
          <option value="">{isRtl ? 'أي خبرة' : 'Any Experience'}</option>
          <option value="5_plus">{isRtl ? 'أكثر من 5 سنوات' : '5+ Years'}</option>
          <option value="10_plus">{isRtl ? 'أكثر من 10 سنوات' : '10+ Years'}</option>
          <option value="20_plus">{isRtl ? 'أكثر من 20 سنة' : '20+ Years'}</option>
        </select>
      </div>

      {/* Doctor Rank filters */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
          {isRtl ? 'رتب الأطباء وشارات الاعتماد' : 'Badges & Ranks'}
        </label>
        <select
          value={rankFilter}
          onChange={(e) => {
            setRankFilter(e.target.value);
            applyFilters({ rank: e.target.value });
          }}
          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-extrabold focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-slate-800 cursor-pointer"
        >
          <option value="">{isRtl ? 'جميع الأطباء' : 'All ranks'}</option>
          <option value="vip">{isRtl ? 'إعلان VIP (ظهور أول)' : 'VIP Priority'}</option>
          <option value="premium">{isRtl ? 'أطباء مميزون (Premium)' : 'Premium tier'}</option>
          <option value="verified">{isRtl ? 'أطباء موثقون (Verified)' : 'Verified doctors'}</option>
        </select>
      </div>

      {/* Gender Filter */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
          {isRtl ? 'الجنس' : 'Gender'}
        </label>
        <div className="flex flex-col gap-2 pt-1">
          {['', 'male', 'female'].map((g) => (
            <label key={g} className="flex items-center gap-3 text-xs font-bold text-slate-700 cursor-pointer hover:text-teal-600 transition-colors">
              <input
                type="radio"
                name="gender"
                checked={selectedGender === g}
                onChange={() => {
                  setSelectedGender(g);
                  applyFilters({ gender: g });
                }}
                className="text-teal-600 focus:ring-teal-500 h-4 w-4 border-slate-300"
              />
              <span>
                {g === '' 
                  ? (isRtl ? 'الكل' : 'All Genders')
                  : (g === 'male' ? (isRtl ? 'أطباء ذكور' : 'Male doctors') : (isRtl ? 'طبيبات إناث' : 'Female doctors'))
                }
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Fee Range Filter */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
          {isRtl ? 'سعر الكشفية' : 'Consultation Fees'}
        </label>
        <select
          value={selectedFees}
          onChange={(e) => {
            setSelectedFees(e.target.value);
            applyFilters({ fees: e.target.value });
          }}
          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-extrabold focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-slate-800 cursor-pointer"
        >
          <option value="">{isRtl ? 'أي سعر' : 'Any price'}</option>
          <option value="under_20">{isRtl ? 'أقل من 20 دينار' : 'Under 20 JOD'}</option>
          <option value="20_40">{isRtl ? '20 - 40 دينار' : '20 - 40 JOD'}</option>
          <option value="above_40">{isRtl ? 'أكثر من 40 دينار' : 'Above 40 JOD'}</option>
        </select>
      </div>

    </div>
  );

  return (
    <>
      {/* Mobile Drawer Trigger Button (< 1024px) */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="w-full bg-white border border-slate-200 hover:border-teal-500 py-3 px-4 rounded-2xl text-slate-800 text-xs font-extrabold flex items-center justify-between shadow-sm cursor-pointer font-cairo"
        >
          <span className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-teal-600" />
            <span>{isRtl ? 'تصفية الفلاتر والخيارات' : 'Filter Results'}</span>
          </span>
          <span className="bg-teal-50 text-teal-700 px-2 py-0.5 rounded-lg text-[10px]">
            {isRtl ? 'تعديل' : 'Modify'}
          </span>
        </button>
      </div>

      {/* Mobile Slide-Over Drawer Sheet */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex justify-end bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-xs bg-white h-full p-6 overflow-y-auto shadow-2xl space-y-6 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
                <span className="text-sm font-black text-slate-800 font-cairo">{isRtl ? 'خيارات التصفية' : 'Search Filters'}</span>
                <button onClick={() => setIsMobileOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                  <X className="h-5 w-5" />
                </button>
              </div>
              {filterContent}
            </div>

            <button
              onClick={() => setIsMobileOpen(false)}
              className="w-full bg-teal-600 text-white font-extrabold py-3 rounded-2xl text-xs font-cairo shadow-md"
            >
              {isRtl ? 'تطبيق الفلاتر والإغلاق' : 'Apply Filters'}
            </button>
          </div>
        </div>
      )}

      {/* Desktop Persistent Sidebar (>= 1024px) */}
      <div className="hidden lg:block bg-white rounded-3xl border border-slate-100 p-6 shadow-sm sticky top-24">
        {filterContent}
      </div>
    </>
  );
}
