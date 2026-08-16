'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Doctor, Specialty, City } from '@/types';
import { getFavoriteDoctorIds } from '@/lib/favorites';
import DoctorResultCard from './DoctorResultCard';
import { Heart, Stethoscope, Search } from 'lucide-react';

interface FavoritesViewProps {
  allDoctors: Doctor[];
  specialties: Specialty[];
  cities: City[];
}

export default function FavoritesView({ allDoctors, specialties, cities }: FavoritesViewProps) {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const [favoriteDoctors, setFavoriteDoctors] = useState<Doctor[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const ids = getFavoriteDoctorIds();
    const favs = allDoctors.filter(d => ids.includes(d.id));
    setFavoriteDoctors(favs);
    setIsLoaded(true);

    const handleFavUpdate = () => {
      const updatedIds = getFavoriteDoctorIds();
      setFavoriteDoctors(allDoctors.filter(d => updatedIds.includes(d.id)));
    };

    window.addEventListener('tibbak_favorites_updated', handleFavUpdate);
    return () => window.removeEventListener('tibbak_favorites_updated', handleFavUpdate);
  }, [allDoctors]);

  if (!isLoaded) {
    return (
      <div className="py-12 text-center text-slate-400 font-cairo">
        <span className="text-xs font-bold">{isAr ? 'جاري تحميل الأطباء المفضلين...' : 'Loading favorites...'}</span>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 space-y-6 font-cairo dir-auto" dir={isAr ? 'rtl' : 'ltr'}>
      
      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
            <Heart className="h-6 w-6 fill-rose-500" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900">
              {isAr ? 'الأطباء المفضلون' : 'Favorite Doctors'}
            </h1>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              {isAr 
                ? `لديك ${favoriteDoctors.length} طبيب محفوظ في قائمتك المفضلة` 
                : `You have ${favoriteDoctors.length} doctors saved in your favorites list`}
            </p>
          </div>
        </div>

        <Link
          href="/search"
          className="hidden sm:inline-flex items-center gap-1.5 text-xs font-extrabold text-teal-600 hover:text-teal-700 bg-teal-50 px-4 py-2.5 rounded-xl transition-colors"
        >
          <Search className="h-4 w-4" />
          <span>{isAr ? 'البحث عن أطباء جدد' : 'Find More Doctors'}</span>
        </Link>
      </div>

      {/* Favorites List or Empty State */}
      {favoriteDoctors.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-10 text-center shadow-xs space-y-5">
          <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto border border-rose-100">
            <Heart className="h-8 w-8" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h2 className="text-lg font-black text-slate-900">
              {isAr ? 'لا يوجد أطباء مفضلون حالياً' : 'No favorite doctors yet'}
            </h2>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              {isAr 
                ? 'عند استعراض نتائج الأطباء، انقر على زر القلب لإضافة أطبائك المفضلين والوصول إليهم بسهولة.'
                : 'Click the heart icon on any doctor card to save them to your favorites for quick access.'}
            </p>
          </div>

          <div className="pt-2">
            <Link
              href="/search"
              className="inline-flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-extrabold px-6 py-3 rounded-xl text-xs shadow-xs transition-all"
            >
              <Stethoscope className="h-4 w-4" />
              <span>{isAr ? 'استعراض الأطباء المعتمدين' : 'Browse Verified Doctors'}</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {favoriteDoctors.map((doc) => {
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
  );
}
