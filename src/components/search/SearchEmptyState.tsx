'use client';

import { useLocale } from 'next-intl';
import { Link, useRouter } from '@/i18n/routing';
import { SearchX, RefreshCw } from 'lucide-react';

interface SearchEmptyStateProps {
  onClearFilters?: () => void;
}

export default function SearchEmptyState({ onClearFilters }: SearchEmptyStateProps) {
  const locale = useLocale();
  const router = useRouter();
  const isAr = locale === 'ar';

  const handleShowAll = () => {
    if (onClearFilters) {
      onClearFilters();
    } else {
      router.push('/search');
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 text-center shadow-xs space-y-6 max-w-lg mx-auto font-cairo dir-auto" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto border border-amber-100 shadow-xs">
        <SearchX className="h-8 w-8" />
      </div>

      <div className="space-y-2">
        <h3 className="text-lg sm:text-xl font-black text-slate-900">
          {isAr ? 'لا توجد نتائج مطابقة' : 'No matching results found'}
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 font-semibold leading-relaxed">
          {isAr 
            ? 'لم نجد أطباء يطابقون المعايير المحددة. جرّب إزالة بعض الفلاتر للحصول على نتائج أكثر.'
            : 'We could not find doctors matching your current filters. Try relaxing your search constraints.'}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <button
          type="button"
          onClick={handleShowAll}
          className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white font-extrabold px-6 py-3 rounded-xl text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <RefreshCw className="h-4 w-4" />
          <span>{isAr ? 'عرض جميع الأطباء' : 'Show all doctors'}</span>
        </button>

        <Link
          href="/"
          className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-6 py-3 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
        >
          <span>{isAr ? 'العودة للرئيسية' : 'Back to Home'}</span>
        </Link>
      </div>
    </div>
  );
}
