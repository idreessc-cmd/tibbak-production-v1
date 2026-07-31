'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/routing';
import { Menu, X, Globe, HeartPulse, Stethoscope } from 'lucide-react';

export default function Header() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const switchLanguage = () => {
    const nextLocale = locale === 'ar' ? 'en' : 'ar';
    router.replace(pathname, { locale: nextLocale });
  };

  const navLinks = [
    { href: '/', label: locale === 'ar' ? 'الرئيسية' : 'Home' },
    { href: '/search', label: locale === 'ar' ? 'البحث عن طبيب' : 'Find a Doctor' },
    { href: '/search?service=hospital', label: locale === 'ar' ? 'المستشفيات' : 'Hospitals' },
    { href: '/packages', label: locale === 'ar' ? 'باقات الاشتراك' : 'Packages' },
    { href: '/demo', label: locale === 'ar' ? 'العرض التجريبي ⚠️' : 'Demo Hub ⚠️' }
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-teal-600">
          <HeartPulse className="h-7 w-7 animate-pulse" />
          <span className="text-xl font-bold tracking-tight text-slate-800 font-cairo">
            {locale === 'ar' ? 'طبّك' : 'Tabibak'}
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6">
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
        <div className="hidden lg:flex items-center gap-4">
          {/* Language Switcher */}
          <button
            onClick={switchLanguage}
            className="flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-teal-600 transition-colors border border-gray-200 px-3 py-1.5 rounded-full hover:bg-slate-50 cursor-pointer"
            title={locale === 'ar' ? 'Switch to English' : 'التحويل للعربية'}
          >
            <Globe className="h-4 w-4" />
            <span>{locale === 'ar' ? 'English' : 'العربية'}</span>
          </button>
 
          {/* For Doctors */}
          <Link
            href="/join-doctor"
            className="text-sm font-semibold text-slate-650 hover:text-teal-600 transition-colors"
          >
            {locale === 'ar' ? 'للأطباء' : 'For Doctors'}
          </Link>
 
          {/* Login Link */}
          <Link
            href="/login"
            className="text-sm font-semibold text-slate-600 hover:text-teal-600 transition-colors"
          >
            {locale === 'ar' ? 'تسجيل الدخول' : 'Sign in'}
          </Link>

          {/* Demo access button */}
          <Link
            href="/demo"
            className="text-sm font-bold bg-teal-600 text-white px-5 py-2 rounded-xl hover:bg-teal-700 transition-colors shadow-sm cursor-pointer font-cairo"
          >
            {locale === 'ar' ? 'دخول تجريبي' : 'Demo access'}
          </Link>
        </div>

        {/* Mobile Hamburger Menu Toggle */}
        <div className="flex lg:hidden items-center gap-3">
          <button
            onClick={switchLanguage}
            className="flex items-center gap-1 text-xs font-medium text-slate-600 border border-gray-200 px-2 py-1 rounded-full hover:bg-slate-50"
          >
            <Globe className="h-3 w-3" />
            <span>{locale === 'ar' ? 'En' : 'عرب'}</span>
          </button>
          
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-slate-600 hover:text-teal-600 transition-colors"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-3 shadow-inner">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className={`block px-3 py-2 rounded-lg text-base font-medium transition-colors ${
                  pathname === link.href ? 'bg-teal-50 text-teal-700' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <hr className="border-gray-100" />

          <div className="space-y-2">
            <Link
              href="/join-doctor"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors font-cairo"
            >
              <Stethoscope className="h-5 w-5 text-teal-600" />
              {locale === 'ar' ? 'للأطباء' : 'For Doctors'}
            </Link>
            <Link
              href="/login"
              onClick={() => setIsMenuOpen(false)}
              className="block w-full text-center border border-teal-600 text-teal-600 px-4 py-2 rounded-lg font-medium hover:bg-teal-50 transition-colors font-cairo"
            >
              {locale === 'ar' ? 'تسجيل الدخول' : 'Sign in'}
            </Link>
            <Link
              href="/demo"
              onClick={() => setIsMenuOpen(false)}
              className="block w-full text-center bg-teal-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-teal-700 transition-colors font-cairo"
            >
              {locale === 'ar' ? 'دخول تجريبي' : 'Demo access'}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
