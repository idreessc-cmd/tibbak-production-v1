import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { MessageSquare } from 'lucide-react';

export function generateStaticParams() {
  return [{ locale: 'ar' }, { locale: 'en' }];
}

interface PlaceholderProps {
  params: Promise<{ locale: string }>;
}

export default async function MessagesPage({ params }: PlaceholderProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isAr = locale === 'ar';

  return (
    <div className="flex-1 flex items-center justify-center py-16 px-4 bg-slate-50/50 font-cairo dir-auto" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center border border-slate-200/80 shadow-xs space-y-5">
        <div className="w-16 h-16 bg-teal-50 border border-teal-100 rounded-2xl flex items-center justify-center text-teal-600 mx-auto">
          <MessageSquare className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <span className="inline-block px-3 py-1 bg-amber-100 text-amber-900 font-extrabold text-xs rounded-full">
            {isAr ? 'قريبًا' : 'Coming Soon'}
          </span>
          <h1 className="text-xl font-black text-slate-900">
            {isAr ? 'مركز المحادثات الطبية' : 'Medical Messages'}
          </h1>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            {isAr 
              ? 'ميزة مركز الرسائل الموحد ستكون متاحة قريباً. يمكن للمريض حالياً متابعة المحادثة مباشرة عبر صفحة الحالة (CASE-2026-000154).' 
              : 'Unified message center will be available soon. Patients can currently follow case discussions directly inside their active case room (CASE-2026-000154).'}
          </p>
        </div>

        <div className="pt-2 space-y-2">
          <Link
            href="/cases/CASE-2026-000154"
            className="inline-flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-extrabold px-6 py-3 rounded-xl text-xs transition-colors shadow-xs w-full"
          >
            <span>{isAr ? 'الانتقال إلى غرف المحادثة الفعالة' : 'Go to Active Case Room'}</span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-6 py-2.5 rounded-xl text-xs transition-colors w-full"
          >
            <span>{isAr ? 'العودة للرئيسية' : 'Back to Home'}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
