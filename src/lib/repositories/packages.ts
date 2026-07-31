import { Package } from '@/types';
import { mockPackages } from '@/data/mock/packages';

export async function getDoctorPackages(): Promise<Package[]> {
  await new Promise(resolve => setTimeout(resolve, 10));
  return mockPackages.filter(p => p.role === 'doctor');
}

export async function getHospitalPackages(): Promise<Package[]> {
  await new Promise(resolve => setTimeout(resolve, 10));
  return mockPackages.filter(p => p.role === 'hospital');
}

export async function getPackageById(id: string): Promise<Package | null> {
  const pkg = mockPackages.find(p => p.id === id);
  return pkg || null;
}
