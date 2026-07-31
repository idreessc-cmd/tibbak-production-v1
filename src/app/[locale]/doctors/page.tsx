import { redirect } from 'next/navigation';

export default async function DoctorsRedirectPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  redirect(`/${locale}/search`);
}
