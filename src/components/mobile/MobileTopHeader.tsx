'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/routing';
import { Menu, X, HeartPulse, Globe, Stethoscope, User } from 'lucide-react';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';

export default function MobileTopHeader() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const isAr = locale === 'ar';
  const [isOpen, setIsOpen] = useState(false);

  // Lock body scroll when drawer is open & handle Escape key
  useBodyScrollLock(isOpen, () => setIsOpen(false));

  // Automatically close menu on route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const switchLanguage = () => {
    setIsOpen(false);
    const nextLocale = isAr ? 'en' : 'ar';
    router.replace(pathname, { locale: nextLocale });
  };

  const navLinks = [
    { href: '/', label: isAr ? 'الرئيسية' : 'Home' },
    { href: '/doctors', label: isAr ? 'الأطباء' : 'Doctors' },
    { href: '/search?service=hospital', label: isAr ? 'المستشفيات' : 'Hospitals' },
    { href: '/packages', label: isAr ? 'الباقات والاشتراكات' : 'Packages' },
    { href: '/demo', label: isAr ? 'بوابة الاستعراض التجريبي' : 'Investor Demo Hub' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/98 border-b border-slate-100 md:hidden dir-auto" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="flex h-14 items-center justify-between px-4">
        
        {/* Brand Logo */}
        <Link 
          href="/" 
          onClick={() => setIsOpen(false)}
          className="flex items-center gap-2 text-teal-600 focus:outline-none"
          aria-label={isAr ? 'الرئيسية - طبّك' : 'Home - Tabibak'}
        >
          <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
            <HeartPulse className="h-5 w-5" />
          </div>
          <span className="text-lg font-black tracking-tight text-slate-900 font-cairo">
            {isAr ? 'طبّك' : 'Tibbak'}
          </span>
        </Link>

        {/* Right Actions: Language Switcher & Hamburger Toggle */}
        <div className="flex items-center gap-2">
          {/* Compact Lang Switcher */}
          <button
            onClick={switchLanguage}
            type="button"
            aria-label={isAr ? 'تغيير اللغة إلى الإنجليزية' : 'Switch to Arabic'}
            className="flex items-center gap-1 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200/80 px-2.5 py-1.5 rounded-full transition-colors cursor-pointer min-h-[36px]"
          >
            <Globe className="h-3.5 w-3.5 text-teal-600" />
            <span>{isAr ? 'EN' : 'عربي'}</span>
          </button>

          {/* Drawer Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            type="button"
            aria-expanded={isOpen}
            aria-label={isOpen ? (isAr ? 'إغلاق القائمة' : 'Close Menu') : (isAr ? 'فتح القائمة الجانبية' : 'Open Drawer Menu')}
            className="p-2 text-slate-700 hover:text-teal-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer Dropdown Overlay & Full Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex flex-col justify-start dir-auto animate-in fade-in duration-200"
          dir={isAr ? 'rtl' : 'ltr'}
          onClick={() => setIsOpen(false)}
        >
          <div 
            className="w-full max-h-[85dvh] bg-white border-b border-slate-200 shadow-2xl p-5 space-y-4 overflow-y-auto overscroll-contain pb-[calc(1.5rem+env(safe-area-inset-bottom))] animate-in slide-in-from-top-2 duration-200 font-cairo"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-sm font-black text-slate-900">
                {isAr ? 'القائمة الرئيسية' : 'Main Menu'}
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label={isAr ? 'إغلاق القائمة' : 'Close Menu'}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex flex-col space-y-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-bold transition-all ${
                      isActive 
                        ? 'bg-teal-50 text-teal-700 font-black' 
                        : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
              <Link
                href="/join-doctor"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                <Stethoscope className="h-4 w-4 text-teal-600" />
                <span>{isAr ? 'انضم كطبيب' : 'For Doctors'}</span>
              </Link>

              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-colors shadow-xs"
              >
                <User className="h-4 w-4" />
                <span>{isAr ? 'تسجيل الدخول' : 'Sign In'}</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
