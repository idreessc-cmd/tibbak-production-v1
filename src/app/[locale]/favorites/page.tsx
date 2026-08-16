import { setRequestLocale } from 'next-intl/server';
import { getAllDoctors } from '@/lib/repositories/doctors';
import { mockSpecialties } from '@/data/mock/specialties';
import { mockCities } from '@/data/mock/cities';
import FavoritesView from '@/components/search/FavoritesView';
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isRtl = locale === 'ar';
  return {
    title: isRtl ? 'الأطباء المفضلون - طبّك' : 'Favorite Doctors - Tibbak',
    description: isRtl 
      ? 'قائمة الأطباء المفضلين المحفوظة محلياً.'
      : 'Your locally saved favorite doctors list.'
  };
}

interface FavoritesPageProps {
  params: Promise<{ locale: string }>;
}

export default async function FavoritesPage({ params }: FavoritesPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const allDoctors = await getAllDoctors();

  return (
    <div className="py-4 sm:py-8 bg-slate-50/50 flex-1 min-h-screen">
      <FavoritesView 
        allDoctors={allDoctors}
        specialties={mockSpecialties}
        cities={mockCities}
      />
    </div>
  );
}
