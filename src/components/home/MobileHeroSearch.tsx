'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { Search } from 'lucide-react';

interface MobileHeroSearchProps {
  className?: string;
}

export default function MobileHeroSearch({ className = '' }: MobileHeroSearchProps) {
  const locale = useLocale();
  const router = useRouter();
  const isAr = locale === 'ar';
  const [query, setQuery] = useState('');

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const targetUrl = query.trim() ? `/search?q=${encodeURIComponent(query.trim())}` : '/search';
    router.push(targetUrl);
  };

  return (
    <div className={`w-full max-w-2xl mx-auto dir-auto ${className}`} dir={isAr ? 'rtl' : 'ltr'}>
      <form 
        onSubmit={handleSearch}
        className="relative flex items-center bg-white rounded-2xl border-2 border-slate-200 focus-within:border-teal-500 shadow-xs transition-all p-1.5"
      >
        <div className="flex items-center justify-center pl-3 pr-2 text-slate-400">
          <Search className="h-5 w-5 text-teal-600 shrink-0" />
        </div>

        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={isAr ? 'ابحث عن طبيب أو تخصص' : 'Search doctors or specialties'}
          aria-label={isAr ? 'ابحث عن طبيب أو تخصص' : 'Search doctors or specialties'}
          className="w-full bg-transparent text-slate-900 placeholder:text-slate-400 text-sm font-bold font-cairo focus:outline-none py-2.5 px-1 min-h-[44px]"
        />

        <button
          type="submit"
          aria-label={isAr ? 'بحث' : 'Search'}
          className="bg-teal-600 hover:bg-teal-700 text-white font-extrabold px-4 sm:px-6 py-2.5 rounded-xl transition-colors shrink-0 text-xs sm:text-sm font-cairo flex items-center gap-1.5 min-h-[44px] cursor-pointer"
        >
          <span>{isAr ? 'بحث' : 'Search'}</span>
        </button>
      </form>
    </div>
  );
}
