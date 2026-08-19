'use client';

import { useLocale } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import { Home, Stethoscope, Heart, MessageSquare, User } from 'lucide-react';

export default function MobileBottomNav() {
  const locale = useLocale();
  const pathname = usePathname();
  const isAr = locale === 'ar';

  const items = [
    {
      id: 'home',
      label: isAr ? 'الرئيسية' : 'Home',
      href: '/',
      icon: Home,
      match: (path: string) => path === '/' || path === '',
    },
    {
      id: 'doctors',
      label: isAr ? 'الأطباء' : 'Doctors',
      href: '/doctors',
      icon: Stethoscope,
      match: (path: string) => path.startsWith('/doctors') || path.startsWith('/search'),
    },
    {
      id: 'favorites',
      label: isAr ? 'المفضلة' : 'Favorites',
      href: '/favorites',
      icon: Heart,
      match: (path: string) => path.startsWith('/favorites'),
    },
    {
      id: 'messages',
      label: isAr ? 'المحادثات' : 'Messages',
      href: '/messages',
      icon: MessageSquare,
      match: (path: string) => path.startsWith('/messages') || path.startsWith('/cases'),
    },
    {
      id: 'account',
      label: isAr ? 'حسابي' : 'Account',
      href: '/account',
      icon: User,
      match: (path: string) => path.startsWith('/account') || path.startsWith('/login') || path.startsWith('/dashboard'),
    },
  ];

  return (
    <nav 
      aria-label={isAr ? 'التنقل السفلي للهاتف' : 'Mobile Bottom Navigation'}
      className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200/90 shadow-[0_-2px_12px_rgba(0,0,0,0.06)] md:hidden dir-auto pb-[env(safe-area-inset-bottom)]"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <div className="flex h-16 items-center justify-around px-1 max-w-md mx-auto">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = item.match(pathname);

          return (
            <Link
              key={item.id}
              href={item.href}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
              className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all min-h-[48px] select-none ${
                isActive
                  ? 'text-teal-600 font-extrabold'
                  : 'text-slate-500 font-medium hover:text-slate-800'
              }`}
            >
              <div className={`p-1 rounded-lg transition-transform ${isActive ? 'bg-teal-50 scale-105' : ''}`}>
                <Icon className={`h-5 w-5 ${isActive ? 'text-teal-600 stroke-[2.5]' : 'text-slate-500 stroke-[1.75]'}`} />
              </div>
              <span className={`text-[10px] sm:text-[11px] leading-tight font-cairo ${isActive ? 'font-black text-teal-700' : 'font-semibold text-slate-500'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
