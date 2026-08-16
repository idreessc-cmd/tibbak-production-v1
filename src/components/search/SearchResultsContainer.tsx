'use client';

import { useRef, useEffect, useState } from 'react';
import { useRouter } from '@/i18n/routing';
import { Doctor, Specialty, City } from '@/types';
import DoctorResultCard from './DoctorResultCard';
import SearchEmptyState from './SearchEmptyState';
import MobileSearchResultHeader from '@/components/mobile/MobileSearchResultHeader';
import SearchFilterSidebar from '@/components/booking/SearchFilterSidebar';
import SearchBar from '@/components/home/SearchBar';
import { RefreshCw } from 'lucide-react';

interface SearchResultsContainerProps {
  doctors: Doctor[];
  specialties: Specialty[];
  cities: City[];
  headerTitle: string;
  currentQueries: Record<string, string | undefined>;
  isRtl: boolean;
}

export default function SearchResultsContainer({
  doctors,
  specialties,
  cities,
  headerTitle,
  currentQueries,
  isRtl,
}: SearchResultsContainerProps) {
  const router = useRouter();
  const resultsRef = useRef<HTMLDivElement>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Auto scroll & smooth transition indicator when currentQueries change
  useEffect(() => {
    setIsUpdating(true);
    const timer = setTimeout(() => setIsUpdating(false), 300);

    if (resultsRef.current) {
      const topOffset = resultsRef.current.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: Math.max(0, topOffset), behavior: 'smooth' });
    }

    return () => clearTimeout(timer);
  }, [currentQueries]);

  const handleFilterChange = (newFilters: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    const queryString = params.toString();
    router.push(`/search${queryString ? `?${queryString}` : ''}`);
  };

  return (
    <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 space-y-4 font-cairo" ref={resultsRef}>
      
      {/* Mobile-Only Top Search & Filter Bar */}
      <MobileSearchResultHeader
        totalCount={doctors.length}
        specialties={specialties}
        cities={cities}
        currentQueries={currentQueries}
        onFilterChange={handleFilterChange}
      />

      {/* Desktop Search Bar Container (Desktop Only) */}
      <div className="hidden md:block bg-white p-3.5 rounded-3xl border border-slate-200/80 shadow-xs">
        <SearchBar 
          specialties={specialties}
          cities={cities}
          initialQuery={currentQueries.q || ''}
          initialSpecialty={currentQueries.specialty || ''}
          initialCity={currentQueries.city || ''}
          initialService={currentQueries.service || 'clinic'}
        />
      </div>

      {/* Desktop Header Summary Banner (Desktop Only) */}
      <div className="hidden md:flex bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs justify-between items-center">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {headerTitle}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-1">
            {isRtl 
              ? `تم العثور على ${doctors.length} طبيب معتمد`
              : `Found ${doctors.length} verified doctors`
            }
          </p>
        </div>

        {Object.keys(currentQueries).length > 0 && (
          <button
            type="button"
            onClick={() => handleFilterChange({})}
            className="inline-flex items-center gap-1.5 text-xs font-extrabold text-teal-600 hover:text-teal-700 bg-teal-50 px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
          >
            <RefreshCw className="h-4 w-4" />
            <span>{isRtl ? 'إعادة تعيين الكل' : 'Clear all filters'}</span>
          </button>
        )}
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Desktop Sidebar (Desktop Only) */}
        <div className="hidden lg:block lg:col-span-1">
          <SearchFilterSidebar
            specialties={specialties}
            cities={cities}
          />
        </div>

        {/* Doctor Cards / Empty State Area */}
        <div className="lg:col-span-3 space-y-3">
          {doctors.length === 0 ? (
            <SearchEmptyState onClearFilters={() => handleFilterChange({})} />
          ) : (
            <div className={`space-y-3 transition-opacity duration-200 ${isUpdating ? 'opacity-70' : 'opacity-100'}`}>
              {doctors.map((doc) => {
                const spec = specialties.find(s => s.id === doc.specialty_id);
                const city = cities.find(c => c.id === doc.city_id);

                return (
                  <DoctorResultCard
                    key={doc.id}
                    doctor={doc}
                    specialty={spec}
                    city={city}
                  />
                );
              })}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
