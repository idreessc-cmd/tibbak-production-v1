'use client';

import { useLocale } from 'next-intl';
import { Specialty, City } from '@/types';
import MobileFilterDrawer from './MobileFilterDrawer';
import MobileHeroSearch from '@/components/home/MobileHeroSearch';

interface MobileSearchResultHeaderProps {
  totalCount: number;
  specialties: Specialty[];
  cities: City[];
  currentQueries: {
    q?: string;
    specialty?: string;
    city?: string;
    fees?: string;
    sort?: string;
  };
  onFilterChange: (filters: Record<string, string | undefined>) => void;
}

export default function MobileSearchResultHeader({
  totalCount,
  specialties,
  cities,
  currentQueries,
  onFilterChange,
}: MobileSearchResultHeaderProps) {
  const locale = useLocale();
  const isAr = locale === 'ar';

  const activeSpecialty = specialties.find(s => s.slug === currentQueries.specialty);
  const activeCity = cities.find(c => c.slug === currentQueries.city);

  const activeChips: { key: string; label: string }[] = [];

  if (currentQueries.q) {
    activeChips.push({ key: 'q', label: `${isAr ? 'البحث:' : 'Search:'} ${currentQueries.q}` });
  }
  if (activeSpecialty) {
    activeChips.push({ key: 'specialty', label: `${isAr ? 'التخصص:' : 'Specialty:'} ${isAr ? activeSpecialty.name_ar : activeSpecialty.name_en}` });
  }
  if (activeCity) {
    activeChips.push({ key: 'city', label: `${isAr ? 'المدينة:' : 'City:'} ${isAr ? activeCity.name_ar : activeCity.name_en}` });
  }
  if (currentQueries.fees) {
    const feeLabels: Record<string, string> = {
      under_20: isAr ? 'أقل من 20 دينار' : 'Under 20 JOD',
      '20_40': isAr ? '20 - 40 دينار' : '20 - 40 JOD',
      above_40: isAr ? 'أكثر من 40 دينار' : 'Above 40 JOD',
    };
    activeChips.push({ key: 'fees', label: feeLabels[currentQueries.fees] || currentQueries.fees });
  }

  const handleRemoveChip = (keyToRemove: string) => {
    const newQueries = { ...currentQueries, [keyToRemove]: undefined };
    onFilterChange(newQueries);
  };

  return (
    <div className="md:hidden space-y-3 bg-white p-4 border-b border-slate-200/80 font-cairo dir-auto" dir={isAr ? 'rtl' : 'ltr'}>
      
      {/* Mobile Search Input */}
      <MobileHeroSearch />

      {/* Filter Button & Count Banner */}
      <div className="flex items-center justify-between gap-2 pt-1">
        <MobileFilterDrawer
          specialties={specialties}
          cities={cities}
          currentFilters={currentQueries}
          onApplyFilters={(newFilters) => onFilterChange(newFilters)}
        />

        <div className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-2 rounded-xl">
          <span>
            {isAr ? `النتائج (${totalCount})` : `Results (${totalCount})`}
          </span>
        </div>
      </div>

      {/* Active Filter Chips */}
      {activeChips.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
          {activeChips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={() => handleRemoveChip(chip.key)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-extrabold bg-teal-50 text-teal-800 border border-teal-100 hover:bg-teal-100 transition-colors cursor-pointer"
            >
              <span>{chip.label}</span>
              <span className="text-teal-600 font-black">×</span>
            </button>
          ))}

          <button
            type="button"
            onClick={() => onFilterChange({})}
            className="text-[11px] font-extrabold text-slate-500 hover:text-slate-700 underline px-1 cursor-pointer"
          >
            {isAr ? 'مسح الكل' : 'Clear all'}
          </button>
        </div>
      )}

    </div>
  );
}
