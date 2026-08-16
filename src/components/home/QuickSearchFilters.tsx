'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { Stethoscope, MapPin, Calendar } from 'lucide-react';

interface QuickSearchFiltersProps {
  className?: string;
}

export default function QuickSearchFilters({ className = '' }: QuickSearchFiltersProps) {
  const locale = useLocale();
  const router = useRouter();
  const isAr = locale === 'ar';
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const filters = [
    {
      id: 'specialty',
      label: isAr ? 'التخصص' : 'Specialty',
      icon: Stethoscope,
      queryParam: 'specialty',
    },
    {
      id: 'location',
      label: isAr ? 'الموقع' : 'Location',
      icon: MapPin,
      queryParam: 'city',
    },
    {
      id: 'earliest',
      label: isAr ? 'أقرب موعد' : 'Earliest appointment',
      icon: Calendar,
      queryParam: 'sort=earliest',
    },
  ];

  const handleFilterClick = (filterId: string, queryParam: string) => {
    setActiveFilter(prev => prev === filterId ? null : filterId);
    router.push(`/search?${queryParam}`);
  };

  return (
    <div className={`w-full max-w-2xl mx-auto dir-auto ${className}`} dir={isAr ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-center gap-2 sm:gap-3 overflow-x-auto py-1 scrollbar-none">
        {filters.map((filter) => {
          const Icon = filter.icon;
          const isSelected = activeFilter === filter.id;

          return (
            <button
              key={filter.id}
              type="button"
              onClick={() => handleFilterClick(filter.id, filter.queryParam)}
              aria-pressed={isSelected}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all min-h-[40px] shrink-0 border cursor-pointer font-cairo select-none ${
                isSelected
                  ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <Icon className={`h-4 w-4 ${isSelected ? 'text-white' : 'text-teal-600'}`} />
              <span>{filter.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
