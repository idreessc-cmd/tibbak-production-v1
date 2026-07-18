'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { Search, Stethoscope, MapPin, Building2, User } from 'lucide-react';
import { City, Specialty, Hospital } from '@/types';

interface SearchBarProps {
  specialties: Specialty[];
  cities: City[];
  hospitals: Hospital[];
}

export default function SearchBar({ specialties, cities, hospitals }: SearchBarProps) {
  const locale = useLocale();
  const isRtl = locale === 'ar';
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedHospital, setSelectedHospital] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const queryParams = [];
    if (searchQuery.trim()) {
      queryParams.push(`search=${encodeURIComponent(searchQuery.trim())}`);
    }
    if (selectedSpecialty) {
      queryParams.push(`specialty=${encodeURIComponent(selectedSpecialty)}`);
    }
    if (selectedCity) {
      queryParams.push(`city=${encodeURIComponent(selectedCity)}`);
    }
    if (selectedHospital) {
      queryParams.push(`hospital=${encodeURIComponent(selectedHospital)}`);
    }

    const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
    router.push(`/doctors${queryString}`);
  };

  return (
    <div className="w-full max-w-5xl mx-auto bg-white rounded-3xl shadow-2xl border border-gray-100 p-5 sm:p-7 glassmorphism animate-fade-in relative z-20">
      
      {/* Booking Form Layout */}
      <form onSubmit={handleSearch} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          {/* Specialty Dropdown */}
          <div className="flex flex-col space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 px-1">
              <Stethoscope className="h-3.5 w-3.5 text-teal-600" />
              <span>{isRtl ? 'التخصص الطبي' : 'Specialty'}</span>
            </label>
            <div className="relative">
              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm font-medium rounded-2xl py-3 px-4 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all appearance-none cursor-pointer"
              >
                <option value="">{isRtl ? 'كل التخصصات' : 'All Specialties'}</option>
                {specialties.map((spec) => (
                  <option key={spec.id} value={spec.slug}>
                    {isRtl ? spec.name_ar : spec.name_en}
                  </option>
                ))}
              </select>
              <div className={`absolute ${isRtl ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 border-l border-slate-200 ${isRtl ? 'pl-2 border-r-0 pr-0' : 'pl-2'} flex items-center`}>
                <span className="text-[10px]">▼</span>
              </div>
            </div>
          </div>

          {/* Doctor Name Search */}
          <div className="flex flex-col space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 px-1">
              <User className="h-3.5 w-3.5 text-teal-600" />
              <span>{isRtl ? 'اسم الطبيب' : 'Doctor Name'}</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isRtl ? 'مثال: أحمد، سارة...' : 'e.g. Ahmed, Sara...'}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm font-medium rounded-2xl py-3 px-4 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
              />
            </div>
          </div>

          {/* City Dropdown */}
          <div className="flex flex-col space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 px-1">
              <MapPin className="h-3.5 w-3.5 text-teal-600" />
              <span>{isRtl ? 'المدينة / المحافظة' : 'City / Governorate'}</span>
            </label>
            <div className="relative">
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm font-medium rounded-2xl py-3 px-4 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all appearance-none cursor-pointer"
              >
                <option value="">{isRtl ? 'كل المدن' : 'All Cities'}</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.slug}>
                    {isRtl ? city.name_ar : city.name_en}
                  </option>
                ))}
              </select>
              <div className={`absolute ${isRtl ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 border-l border-slate-200 ${isRtl ? 'pl-2 border-r-0 pr-0' : 'pl-2'} flex items-center`}>
                <span className="text-[10px]">▼</span>
              </div>
            </div>
          </div>

          {/* Hospital Dropdown */}
          <div className="flex flex-col space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 px-1">
              <Building2 className="h-3.5 w-3.5 text-teal-600" />
              <span>{isRtl ? 'المستشفى' : 'Hospital'}</span>
            </label>
            <div className="relative">
              <select
                value={selectedHospital}
                onChange={(e) => setSelectedHospital(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm font-medium rounded-2xl py-3 px-4 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all appearance-none cursor-pointer"
              >
                <option value="">{isRtl ? 'كل المستشفيات' : 'All Hospitals'}</option>
                {hospitals.map((hosp) => (
                  <option key={hosp.id} value={hosp.slug}>
                    {isRtl ? hosp.name_ar : hosp.name_en}
                  </option>
                ))}
              </select>
              <div className={`absolute ${isRtl ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 border-l border-slate-200 ${isRtl ? 'pl-2 border-r-0 pr-0' : 'pl-2'} flex items-center`}>
                <span className="text-[10px]">▼</span>
              </div>
            </div>
          </div>

        </div>

        {/* Submit Search Button */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="w-full md:w-auto bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-bold px-10 py-3.5 rounded-2xl transition-all shadow-lg hover:shadow-teal-500/10 flex items-center justify-center gap-2"
          >
            <Search className="h-5 w-5" />
            <span className="text-base">{isRtl ? 'ابحث الآن' : 'Search Now'}</span>
          </button>
        </div>
      </form>

    </div>
  );
}
