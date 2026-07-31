'use client';

import { useState, useRef, useEffect, useId } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { Search, Stethoscope, MapPin, Activity, AlertCircle, User, Sparkles } from 'lucide-react';
import { City, Specialty } from '@/types';
import { symptomMappings, SEARCH_DISCLAIMER_AR, SEARCH_DISCLAIMER_EN } from '@/data/mock/symptom-specialty-map';
import { mockDoctors } from '@/data/mock/doctors';

interface SearchBarProps {
  specialties: Specialty[];
  cities: City[];
  initialQuery?: string;
  initialSpecialty?: string;
  initialCity?: string;
  initialService?: string;
}

interface SuggestionItem {
  id: string;
  type: 'symptom' | 'specialty' | 'doctor';
  title_ar: string;
  title_en: string;
  specialtySlug?: string;
  doctorSlug?: string;
}

export default function SearchBar({ 
  specialties, 
  cities,
  initialQuery = '',
  initialSpecialty = '',
  initialCity = '',
  initialService = 'clinic'
}: SearchBarProps) {
  const locale = useLocale();
  const isRtl = locale === 'ar';
  const router = useRouter();

  const [query, setQuery] = useState(initialQuery);
  const [selectedSpecialty, setSelectedSpecialty] = useState(initialSpecialty);
  const [selectedCity, setSelectedCity] = useState(initialCity);
  const [selectedService, setSelectedService] = useState(initialService);

  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = useId();

  // Generate suggestions based on query
  const getSuggestions = (): SuggestionItem[] => {
    if (!query.trim()) {
      // Popular defaults when query is empty
      const defaultSymptoms: SuggestionItem[] = symptomMappings.slice(0, 3).map(s => ({
        id: s.id,
        type: 'symptom',
        title_ar: s.symptom_ar,
        title_en: s.symptom_en,
        specialtySlug: s.specialty_slug
      }));
      return defaultSymptoms;
    }

    const q = query.toLowerCase().trim();
    const list: SuggestionItem[] = [];

    // 1. Symptoms
    symptomMappings.forEach(s => {
      if (s.symptom_ar.toLowerCase().includes(q) || s.symptom_en.toLowerCase().includes(q)) {
        list.push({
          id: s.id,
          type: 'symptom',
          title_ar: s.symptom_ar,
          title_en: s.symptom_en,
          specialtySlug: s.specialty_slug
        });
      }
    });

    // 2. Specialties
    specialties.forEach(spec => {
      if (spec.name_ar.toLowerCase().includes(q) || spec.name_en.toLowerCase().includes(q) || spec.slug.includes(q)) {
        list.push({
          id: `spec-${spec.id}`,
          type: 'specialty',
          title_ar: spec.name_ar,
          title_en: spec.name_en,
          specialtySlug: spec.slug
        });
      }
    });

    // 3. Doctors
    mockDoctors.forEach(doc => {
      if (doc.name_ar.toLowerCase().includes(q) || doc.name_en.toLowerCase().includes(q)) {
        list.push({
          id: `doc-${doc.id}`,
          type: 'doctor',
          title_ar: doc.name_ar,
          title_en: doc.name_en,
          doctorSlug: doc.slug,
          specialtySlug: specialties.find(s => s.id === doc.specialty_id)?.slug
        });
      }
    });

    return list.slice(0, 8); // Max 8 suggestions
  };

  const suggestions = getSuggestions();

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectSuggestion = (item: SuggestionItem) => {
    if (item.type === 'doctor' && item.doctorSlug) {
      setIsOpen(false);
      router.push(`/doctors/${item.doctorSlug}`);
      return;
    }

    setQuery(isRtl ? item.title_ar : item.title_en);
    if (item.specialtySlug) {
      setSelectedSpecialty(item.specialtySlug);
    }
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) {
      if (e.key === 'ArrowDown') {
        setIsOpen(true);
        setHighlightedIndex(0);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter') {
      if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
        e.preventDefault();
        handleSelectSuggestion(suggestions[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsOpen(false);

    const queryParams: string[] = [];
    if (query.trim()) {
      queryParams.push(`q=${encodeURIComponent(query.trim())}`);
    }
    if (selectedSpecialty) {
      queryParams.push(`specialty=${encodeURIComponent(selectedSpecialty)}`);
    }
    if (selectedCity) {
      queryParams.push(`city=${encodeURIComponent(selectedCity)}`);
    }
    if (selectedService) {
      queryParams.push(`service=${encodeURIComponent(selectedService)}`);
    }

    const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
    router.push(`/search${queryString}`);
  };

  const groupedSuggestions = {
    symptoms: suggestions.filter(s => s.type === 'symptom'),
    specialties: suggestions.filter(s => s.type === 'specialty'),
    doctors: suggestions.filter(s => s.type === 'doctor')
  };

  return (
    <div ref={containerRef} className="w-full max-w-5xl mx-auto bg-teal-600 rounded-3xl p-1.5 shadow-xl border-4 border-teal-600 relative z-30">
      <form onSubmit={handleSearchSubmit} className="bg-white rounded-[22px] p-3 md:p-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center">
        
        {/* Field 1: Free Text Autocomplete (What are you looking for?) */}
        <div className="flex-1 min-w-[220px] relative px-3 py-2 border-b md:border-b-0 border-slate-100 rtl:border-l-0 rtl:md:border-r ltr:md:border-l">
          <label htmlFor="search-query-input" className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wide text-right rtl:text-right ltr:text-left">
            {isRtl ? 'ماذا تبحث؟ (عرض، تخصص، اسم طبيب)' : 'What are you looking for?'}
          </label>
          <div className="flex items-center gap-2 mt-0.5">
            <Search className="h-4 w-4 text-slate-400 flex-shrink-0" />
            <input
              id="search-query-input"
              ref={inputRef}
              type="text"
              role="combobox"
              aria-expanded={isOpen}
              aria-controls={listboxId}
              aria-autocomplete="list"
              aria-haspopup="listbox"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setIsOpen(true);
                setHighlightedIndex(-1);
              }}
              onFocus={() => setIsOpen(true)}
              onKeyDown={handleKeyDown}
              placeholder={isRtl ? 'أدخل ألم الركبة، د. فراس، العظام...' : 'Search knee pain, Dr. Firas, Orthopedics...'}
              className="w-full bg-transparent border-0 text-slate-800 text-sm font-extrabold focus:outline-none focus:ring-0 p-0 text-right rtl:text-right ltr:text-left"
              autoComplete="off"
            />
          </div>

          {/* Autocomplete Dropdown Panel */}
          {isOpen && (
            <div 
              id={listboxId}
              role="listbox"
              className="absolute left-0 right-0 top-full mt-3 bg-white rounded-2xl border border-slate-100 shadow-2xl overflow-hidden z-50 max-h-[380px] overflow-y-auto text-right rtl:text-right ltr:text-left"
            >
              {suggestions.length === 0 ? (
                <div className="p-4 text-xs font-semibold text-slate-400 text-center">
                  {isRtl ? 'لا يوجد اقتراحات مطابقة. اضغط بحث لعرض الأطباء.' : 'No suggestions found. Press Search to view results.'}
                </div>
              ) : (
                <div className="p-2 space-y-3 font-cairo">
                  
                  {/* Category 1: Symptoms */}
                  {groupedSuggestions.symptoms.length > 0 && (
                    <div>
                      <span className="block px-3 py-1 text-[10px] font-black text-slate-400 uppercase tracking-wider bg-slate-50 rounded-lg">
                        🏥 {isRtl ? 'مشاكل صحية وأعراض' : 'Health Concerns'}
                      </span>
                      {groupedSuggestions.symptoms.map((item) => {
                        const globalIdx = suggestions.findIndex(s => s.id === item.id);
                        const isHighlighted = globalIdx === highlightedIndex;

                        return (
                          <div
                            key={item.id}
                            role="option"
                            aria-selected={isHighlighted}
                            onClick={() => handleSelectSuggestion(item)}
                            className={`px-3 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between cursor-pointer transition-colors ${
                              isHighlighted ? 'bg-teal-50 text-teal-700' : 'hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              <Sparkles className="h-3.5 w-3.5 text-teal-600" />
                              <span>{isRtl ? item.title_ar : item.title_en}</span>
                            </span>
                            <span className="text-[10px] bg-teal-100/60 text-teal-800 px-2 py-0.5 rounded font-extrabold">
                              {isRtl ? 'عرض صحي' : 'Symptom'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Category 2: Specialties */}
                  {groupedSuggestions.specialties.length > 0 && (
                    <div>
                      <span className="block px-3 py-1 text-[10px] font-black text-slate-400 uppercase tracking-wider bg-slate-50 rounded-lg">
                        🩺 {isRtl ? 'تخصصات طبية' : 'Specialties'}
                      </span>
                      {groupedSuggestions.specialties.map((item) => {
                        const globalIdx = suggestions.findIndex(s => s.id === item.id);
                        const isHighlighted = globalIdx === highlightedIndex;

                        return (
                          <div
                            key={item.id}
                            role="option"
                            aria-selected={isHighlighted}
                            onClick={() => handleSelectSuggestion(item)}
                            className={`px-3 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between cursor-pointer transition-colors ${
                              isHighlighted ? 'bg-teal-50 text-teal-700' : 'hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              <Stethoscope className="h-3.5 w-3.5 text-blue-600" />
                              <span>{isRtl ? item.title_ar : item.title_en}</span>
                            </span>
                            <span className="text-[10px] bg-blue-100/60 text-blue-800 px-2 py-0.5 rounded font-extrabold">
                              {isRtl ? 'تخصص' : 'Specialty'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Category 3: Doctors */}
                  {groupedSuggestions.doctors.length > 0 && (
                    <div>
                      <span className="block px-3 py-1 text-[10px] font-black text-slate-400 uppercase tracking-wider bg-slate-50 rounded-lg">
                        👨‍⚕️ {isRtl ? 'أطباء معتمدون' : 'Doctors'}
                      </span>
                      {groupedSuggestions.doctors.map((item) => {
                        const globalIdx = suggestions.findIndex(s => s.id === item.id);
                        const isHighlighted = globalIdx === highlightedIndex;

                        return (
                          <div
                            key={item.id}
                            role="option"
                            aria-selected={isHighlighted}
                            onClick={() => handleSelectSuggestion(item)}
                            className={`px-3 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between cursor-pointer transition-colors ${
                              isHighlighted ? 'bg-teal-50 text-teal-700' : 'hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              <User className="h-3.5 w-3.5 text-emerald-600" />
                              <span>{isRtl ? item.title_ar : item.title_en}</span>
                            </span>
                            <span className="text-[10px] bg-emerald-100/60 text-emerald-800 px-2 py-0.5 rounded font-extrabold">
                              {isRtl ? 'طبيب' : 'Doctor'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Non-diagnostic Disclaimer */}
                  <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-150 text-[10px] font-semibold text-amber-800 flex items-start gap-1.5 mt-2">
                    <AlertCircle className="h-3.5 w-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <span>{isRtl ? SEARCH_DISCLAIMER_AR : SEARCH_DISCLAIMER_EN}</span>
                  </div>

                </div>
              )}
            </div>
          )}
        </div>

        {/* Field 2: Where? (City / Governorate Selector) */}
        <div className="flex-1 min-w-[160px] flex items-center gap-3 px-3 py-2 border-b md:border-b-0 border-slate-100 rtl:border-l-0 rtl:md:border-r ltr:md:border-l">
          <MapPin className="h-4 w-4 text-slate-400 flex-shrink-0" />
          <div className="flex-1 text-right rtl:text-right ltr:text-left">
            <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wide">
              {isRtl ? 'أين؟ (المدينة)' : 'Where? (City)'}
            </span>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full bg-transparent border-0 text-slate-800 text-sm font-extrabold focus:outline-none focus:ring-0 p-0 cursor-pointer text-right rtl:text-right ltr:text-left"
            >
              <option value="">{isRtl ? 'كل المحافظات' : 'All governorates'}</option>
              {cities.map((city) => (
                <option key={city.id} value={city.slug}>
                  {isRtl ? city.name_ar : city.name_en}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Field 3: Service Type */}
        <div className="flex-1 min-w-[160px] flex items-center gap-3 px-3 py-2">
          <Activity className="h-4 w-4 text-slate-400 flex-shrink-0" />
          <div className="flex-1 text-right rtl:text-right ltr:text-left">
            <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wide">
              {isRtl ? 'نوع الخدمة' : 'Service Type'}
            </span>
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="w-full bg-transparent border-0 text-slate-800 text-sm font-extrabold focus:outline-none focus:ring-0 p-0 cursor-pointer text-right rtl:text-right ltr:text-left"
            >
              <option value="clinic">{isRtl ? 'زيارة عيادة' : 'Clinic Visit'}</option>
              <option value="online">{isRtl ? 'استشارة عن بعد' : 'Teleconsultation'}</option>
              <option value="hospital">{isRtl ? 'مستشفى' : 'Hospital'}</option>
              <option value="medical-tourism">{isRtl ? 'سياحة علاجية' : 'Medical Tourism'}</option>
            </select>
          </div>
        </div>

        {/* Search Submit Button */}
        <button
          type="submit"
          className="bg-teal-700 hover:bg-teal-800 text-white font-black px-8 py-3.5 rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer text-sm font-cairo"
        >
          <Search className="h-4.5 w-4.5" />
          <span>{isRtl ? 'ابحث الآن' : 'Search Now'}</span>
        </button>

      </form>
    </div>
  );
}
