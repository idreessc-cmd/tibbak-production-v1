'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { usePathname } from '@/i18n/routing';
import { Specialty, City } from '@/types';
import { X, SlidersHorizontal, Check, RefreshCw } from 'lucide-react';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';

interface MobileFilterDrawerProps {
  specialties: Specialty[];
  cities: City[];
  currentFilters: {
    specialty?: string;
    city?: string;
    fees?: string;
    sort?: string;
  };
  onApplyFilters: (newFilters: { specialty?: string; city?: string; fees?: string; sort?: string }) => void;
}

export default function MobileFilterDrawer({
  specialties,
  cities,
  currentFilters,
  onApplyFilters,
}: MobileFilterDrawerProps) {
  const locale = useLocale();
  const pathname = usePathname();
  const isAr = locale === 'ar';
  const [isOpen, setIsOpen] = useState(false);

  // Lock body scroll when drawer is open & handle Escape key
  useBodyScrollLock(isOpen, () => setIsOpen(false));

  // Automatically close filter drawer on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const [selectedSpecialty, setSelectedSpecialty] = useState(currentFilters.specialty || '');
  const [selectedCity, setSelectedCity] = useState(currentFilters.city || '');
  const [selectedFees, setSelectedFees] = useState(currentFilters.fees || '');
  const [selectedSort, setSelectedSort] = useState(currentFilters.sort || 'ranking');

  const activeFiltersCount = [
    selectedSpecialty,
    selectedCity,
    selectedFees,
    selectedSort !== 'ranking' ? selectedSort : ''
  ].filter(Boolean).length;

  const handleApply = () => {
    onApplyFilters({
      specialty: selectedSpecialty || undefined,
      city: selectedCity || undefined,
      fees: selectedFees || undefined,
      sort: selectedSort || undefined,
    });
    setIsOpen(false);
  };

  const handleReset = () => {
    setSelectedSpecialty('');
    setSelectedCity('');
    setSelectedFees('');
    setSelectedSort('ranking');
    onApplyFilters({});
    setIsOpen(false);
  };

  return (
    <>
      {/* Filter Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold bg-white border border-slate-200 hover:border-slate-300 text-slate-700 shadow-xs transition-all cursor-pointer font-cairo shrink-0 min-h-[40px]"
      >
        <SlidersHorizontal className="h-4 w-4 text-teal-600" />
        <span>{isAr ? 'فلترة نتائج الأطباء' : 'Filter Results'}</span>
        {activeFiltersCount > 0 && (
          <span className="w-5 h-5 rounded-full bg-teal-600 text-white text-[10px] font-black flex items-center justify-center">
            {activeFiltersCount}
          </span>
        )}
      </button>

      {/* Bottom Sheet Backdrop & Drawer Container */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex flex-col justify-end bg-slate-900/60 backdrop-blur-xs dir-auto animate-in fade-in duration-200" 
          dir={isAr ? 'rtl' : 'ltr'}
          onClick={() => setIsOpen(false)}
        >
          <div 
            className="w-full max-h-[88dvh] bg-white rounded-t-3xl border-t border-slate-100 shadow-2xl flex flex-col font-cairo animate-in slide-in-from-bottom duration-300 overflow-hidden pb-[calc(1rem+env(safe-area-inset-bottom))]"
            onClick={(e) => e.stopPropagation()}
          >
            
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-5 w-5 text-teal-600" />
                <h2 className="text-base font-black text-slate-900">
                  {isAr ? 'فلترة وفرز النتائج' : 'Filter & Sort Doctors'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label={isAr ? 'إغلاق الفلترة' : 'Close Filter Drawer'}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Drawer Body (Scrollable) */}
            <div className="p-5 space-y-6 overflow-y-auto overscroll-contain flex-1">
              
              {/* 1. Sorting */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-800 uppercase tracking-wider block">
                  {isAr ? 'ترتيب حسب:' : 'Sort By:'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'ranking', label: isAr ? 'الأكثر ملاءمة' : 'Recommended' },
                    { id: 'rating', label: isAr ? 'التقييم الأعلى' : 'Highest Rating' },
                    { id: 'fees_asc', label: isAr ? 'السعر الأقل' : 'Lowest Fee' },
                    { id: 'fees_desc', label: isAr ? 'السعر الأعلى' : 'Highest Fee' },
                    { id: 'earliest_date', label: isAr ? 'أقرب موعد' : 'Earliest Date' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSelectedSort(s.id)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold text-center border transition-all cursor-pointer ${
                        selectedSort === s.id
                          ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Specialty Filter */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-800 uppercase tracking-wider block">
                  {isAr ? 'التخصص الطبي:' : 'Medical Specialty:'}
                </label>
                <select
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-teal-500 font-cairo"
                >
                  <option value="">{isAr ? 'جميع التخصصات' : 'All Specialties'}</option>
                  {specialties.map((spec) => (
                    <option key={spec.id} value={spec.slug}>
                      {isAr ? spec.name_ar : spec.name_en}
                    </option>
                  ))}
                </select>
              </div>

              {/* 3. City / Location Filter */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-800 uppercase tracking-wider block">
                  {isAr ? 'المدينة / المحافظة:' : 'City / Location:'}
                </label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-teal-500 font-cairo"
                >
                  <option value="">{isAr ? 'جميع المدن' : 'All Cities'}</option>
                  {cities.map((city) => (
                    <option key={city.id} value={city.slug}>
                      {isAr ? city.name_ar : city.name_en}
                    </option>
                  ))}
                </select>
              </div>

              {/* 4. Consultation Fee Range Filter */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-800 uppercase tracking-wider block">
                  {isAr ? 'سعر الكشفية (بالدينار):' : 'Consultation Fee (JOD):'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: '', label: isAr ? 'الكل' : 'Any' },
                    { id: 'under_20', label: isAr ? 'أقل من 20' : 'Under 20 JOD' },
                    { id: '20_40', label: isAr ? '20 - 40' : '20 - 40 JOD' },
                    { id: 'above_40', label: isAr ? 'أكثر من 40' : 'Above 40 JOD' },
                  ].map((fee) => (
                    <button
                      key={fee.id}
                      type="button"
                      onClick={() => setSelectedFees(fee.id)}
                      className={`px-2 py-2 rounded-xl text-xs font-bold text-center border transition-all cursor-pointer ${
                        selectedFees === fee.id
                          ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {fee.label}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Drawer Footer Actions */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/80 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center justify-center gap-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-extrabold px-4 py-3 rounded-xl text-xs transition-colors cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>{isAr ? 'إعادة تعيين' : 'Reset'}</span>
              </button>

              <button
                type="button"
                onClick={handleApply}
                className="flex items-center justify-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white font-extrabold px-4 py-3 rounded-xl text-xs shadow-xs transition-colors cursor-pointer"
              >
                <Check className="h-4 w-4" />
                <span>{isAr ? 'تطبيق الفلاتر' : 'Apply Filters'}</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
