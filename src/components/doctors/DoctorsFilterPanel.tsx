'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';
import { useSearchParams } from 'next/navigation';
import { SlidersHorizontal, ArrowUpDown, ShieldCheck, Video, Calendar } from 'lucide-react';
import { City, Specialty } from '@/types';

interface FilterPanelProps {
  specialties: Specialty[];
  cities: City[];
}

export default function DoctorsFilterPanel({ specialties, cities }: FilterPanelProps) {
  const t = useTranslations('doctors');
  const locale = useLocale();
  const isRtl = locale === 'ar';
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Load initial values from searchParams
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedSpecialty, setSelectedSpecialty] = useState(searchParams.get('specialty') || '');
  const [selectedCity, setSelectedCity] = useState(searchParams.get('city') || '');
  const [selectedGender, setSelectedGender] = useState(searchParams.get('gender') || '');
  const [selectedFees, setSelectedFees] = useState(searchParams.get('fees') || '');
  const [selectedSort, setSelectedSort] = useState(searchParams.get('sort') || 'ranking');

  // Checkbox filters
  const [insurance, setInsurance] = useState(searchParams.get('insurance') === 'true');
  const [available, setAvailable] = useState(searchParams.get('available') === 'true');
  const [online, setOnline] = useState(searchParams.get('online') === 'true');
  const [experience, setExperience] = useState(searchParams.get('experience') || '');

  // Keep state in sync with URL searchParams changes
  useEffect(() => {
    setSearch(searchParams.get('search') || '');
    setSelectedSpecialty(searchParams.get('specialty') || '');
    setSelectedCity(searchParams.get('city') || '');
    setSelectedGender(searchParams.get('gender') || '');
    setSelectedFees(searchParams.get('fees') || '');
    setSelectedSort(searchParams.get('sort') || 'ranking');
    setInsurance(searchParams.get('insurance') === 'true');
    setAvailable(searchParams.get('available') === 'true');
    setOnline(searchParams.get('online') === 'true');
    setExperience(searchParams.get('experience') || '');
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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters({ search });
  };

  const clearAllFilters = () => {
    router.push(pathname);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-6 space-y-6 shadow-sm sticky top-24">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
          <SlidersHorizontal className="h-4.5 w-4.5 text-teal-600" />
          <span>{isRtl ? 'فلاتر البحث' : 'Search Filters'}</span>
        </h3>
        <button 
          onClick={clearAllFilters}
          className="text-xs font-semibold text-teal-600 hover:text-teal-700 transition-colors"
        >
          {isRtl ? 'إعادة تعيين' : 'Reset All'}
        </button>
      </div>

      {/* Search Input */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          {isRtl ? 'اسم الطبيب أو الكلمة المفتاحية' : 'Doctor Name or Keyword'}
        </label>
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isRtl ? 'بحث باسم الطبيب...' : 'Search by name...'}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800"
          />
          <button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors">
            {isRtl ? 'بحث' : 'Find'}
          </button>
        </form>
      </div>

      {/* Specialty Filter */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('specialty')}</label>
        <select
          value={selectedSpecialty}
          onChange={(e) => {
            setSelectedSpecialty(e.target.value);
            applyFilters({ specialty: e.target.value });
          }}
          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800 cursor-pointer"
        >
          <option value="">{t('filter_all_specialties')}</option>
          {specialties.map((spec) => (
            <option key={spec.id} value={spec.slug}>
              {isRtl ? spec.name_ar : spec.name_en}
            </option>
          ))}
        </select>
      </div>

      {/* City Filter */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('city')}</label>
        <select
          value={selectedCity}
          onChange={(e) => {
            setSelectedCity(e.target.value);
            applyFilters({ city: e.target.value });
          }}
          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800 cursor-pointer"
        >
          <option value="">{t('filter_all_cities')}</option>
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
        <label className="flex items-center gap-3 text-sm text-slate-700 font-medium cursor-pointer hover:text-teal-600 transition-colors">
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

        {/* Online Consultations */}
        <label className="flex items-center gap-3 text-sm text-slate-700 font-medium cursor-pointer hover:text-teal-600 transition-colors">
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
            <Video className="h-4 w-4 text-sky-600" />
            <span>{isRtl ? 'استشارة مرئية عن بعد' : 'Online Consultations'}</span>
          </div>
        </label>

        {/* Available Today */}
        <label className="flex items-center gap-3 text-sm text-slate-700 font-medium cursor-pointer hover:text-teal-600 transition-colors">
          <input
            type="checkbox"
            checked={available}
            onChange={(e) => {
              setAvailable(e.target.checked);
              applyFilters({ available: e.target.checked });
            }}
            className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 h-4 w-4"
          />
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-teal-600" />
            <span>{isRtl ? 'متاح للحجز اليوم' : 'Available Today'}</span>
          </div>
        </label>

      </div>

      {/* Experience Filter */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{isRtl ? 'سنوات الخبرة' : 'Years of Experience'}</label>
        <select
          value={experience}
          onChange={(e) => {
            setExperience(e.target.value);
            applyFilters({ experience: e.target.value });
          }}
          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800 cursor-pointer"
        >
          <option value="">{isRtl ? 'أي خبرة' : 'Any Experience'}</option>
          <option value="5_plus">{isRtl ? 'أكثر من 5 سنوات' : '5+ Years'}</option>
          <option value="10_plus">{isRtl ? 'أكثر من 10 سنوات' : '10+ Years'}</option>
          <option value="20_plus">{isRtl ? 'أكثر من 20 سنة' : '20+ Years'}</option>
        </select>
      </div>

      {/* Gender Filter */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('filter_gender')}</label>
        <div className="flex flex-col gap-2.5">
          {['', 'male', 'female'].map((g) => (
            <label key={g} className="flex items-center gap-3 text-sm text-slate-700 font-medium cursor-pointer hover:text-teal-600 transition-colors">
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
                  ? (isRtl ? 'جميع الأجناس' : 'All Genders')
                  : (g === 'male' ? t('gender_male') : t('gender_female'))
                }
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Fee Range Filter */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('filter_fees')}</label>
        <select
          value={selectedFees}
          onChange={(e) => {
            setSelectedFees(e.target.value);
            applyFilters({ fees: e.target.value });
          }}
          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800 cursor-pointer"
        >
          <option value="">{t('fees_any')}</option>
          <option value="under_20">{t('fees_under_20')}</option>
          <option value="20_40">{t('fees_20_40')}</option>
          <option value="above_40">{t('fees_above_40')}</option>
        </select>
      </div>

      {/* Sort Option */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
          <ArrowUpDown className="h-3.5 w-3.5 text-teal-600" />
          <span>{t('sort_by')}</span>
        </label>
        <select
          value={selectedSort}
          onChange={(e) => {
            setSelectedSort(e.target.value);
            applyFilters({ sort: e.target.value });
          }}
          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800 cursor-pointer"
        >
          <option value="ranking">{t('sort_ranking')}</option>
          <option value="rating">{t('sort_rating')}</option>
          <option value="experience">{t('sort_experience')}</option>
          <option value="fees_asc">{t('sort_fees_asc')}</option>
          <option value="fees_desc">{t('sort_fees_desc')}</option>
        </select>
      </div>

    </div>
  );
}
