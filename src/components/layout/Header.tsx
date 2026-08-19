'use client';

import { useLocale } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/routing';
import { Globe, HeartPulse } from 'lucide-react';
import MobileTopHeader from '@/components/mobile/MobileTopHeader';

export default function Header() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const isAr = locale === 'ar';

  const switchLanguage = () => {
    const nextLocale = isAr ? 'en' : 'ar';
    router.replace(pathname, { locale: nextLocale });
  };

  const navLinks = [
    { href: '/', label: isAr ? 'الرئيسية' : 'Home' },
    { href: '/search', label: isAr ? 'البحث عن طبيب' : 'Find a Doctor' },
    { href: '/search?service=hospital', label: isAr ? 'المستشفيات' : 'Hospitals' },
    { href: '/packages', label: isAr ? 'باقات الاشتراك' : 'Packages' },
    { href: '/demo', label: isAr ? 'العرض التجريبي ⚠️' : 'Demo Hub ⚠️' }
  ];

  return (
    <>
      {/* Mobile Streamlined Top Header */}
      <MobileTopHeader />

      {/* Desktop Full Header */}
      <header className="sticky top-0 z-40 w-full border-b border-gray-100 bg-white/95 backdrop-blur-md hidden md:block dir-auto" dir={isAr ? 'rtl' : 'ltr'}>
        <div className="mx-auto flex max-w-7xl h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-teal-600 focus:outline-none">
            <HeartPulse className="h-7 w-7 animate-pulse" />
            <span className="text-xl font-bold tracking-tight text-slate-800 font-cairo">
              {isAr ? 'طبّك' : 'Tabibak'}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-teal-600 ${
                  pathname === link.href ? 'text-teal-600 border-b-2 border-teal-500 py-1' : 'text-slate-600'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-4">
            {/* Language Switcher */}
            <button
              onClick={switchLanguage}
              type="button"
              className="flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-teal-600 transition-colors border border-gray-200 px-3 py-1.5 rounded-full hover:bg-slate-50 cursor-pointer"
              title={isAr ? 'Switch to English' : 'التحويل للعربية'}
            >
              <Globe className="h-4 w-4 text-teal-600" />
              <span>{isAr ? 'English' : 'العربية'}</span>
            </button>

            {/* For Doctors */}
            <Link
              href="/join-doctor"
              className="text-sm font-semibold text-slate-650 hover:text-teal-600 transition-colors"
            >
              {isAr ? 'للأطباء' : 'For Doctors'}
            </Link>

            {/* Login Link */}
            <Link
              href="/login"
              className="text-sm font-semibold text-slate-600 hover:text-teal-600 transition-colors"
            >
              {isAr ? 'تسجيل الدخول' : 'Sign in'}
            </Link>

            {/* Demo access button */}
            <Link
              href="/demo"
              className="text-sm font-bold bg-teal-600 text-white px-5 py-2 rounded-xl hover:bg-teal-700 transition-colors shadow-xs cursor-pointer font-cairo"
            >
              {isAr ? 'دخول تجريبي' : 'Demo access'}
            </Link>
          </div>

        </div>
      </header>
    </>
  );
}
