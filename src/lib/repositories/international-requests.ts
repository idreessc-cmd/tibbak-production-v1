import { InternationalRequest } from '@/types';

export const inMemoryIntlRequests: InternationalRequest[] = [];

import { canProviderReceiveNewCases } from '@/lib/providers/provider-availability';
import { getDoctorByIdIncludingUnavailable } from './doctors';
import { getHospitalByIdIncludingUnavailable } from './hospitals';

export async function createInternationalRequest(
  request: Omit<InternationalRequest, 'id' | 'status' | 'created_at' | 'updated_at'>
): Promise<{ ok: boolean; errorCode?: string; message: string; requestId: string }> {
  await new Promise(resolve => setTimeout(resolve, 100));

  if (request.doctor_id) {
    const doc = getDoctorByIdIncludingUnavailable(request.doctor_id);
    if (doc && !canProviderReceiveNewCases(doc)) {
      const errorCode = doc.operationalStatus === 'suspended' ? 'PROVIDER_SUSPENDED' :
                        doc.operationalStatus === 'inactive' ? 'PROVIDER_INACTIVE' : 'PROVIDER_ARCHIVED';
      return {
        ok: false,
        errorCode,
        message: 'الطبيب المطلوب موقوف تشغيلياً ولا يمكن استقبال طلبات جديدة حالياً.',
        requestId: ''
      };
    }
  }

  if (request.hospital_id) {
    const hosp = getHospitalByIdIncludingUnavailable(request.hospital_id);
    if (hosp && !canProviderReceiveNewCases(hosp)) {
      const errorCode = hosp.operationalStatus === 'suspended' ? 'PROVIDER_SUSPENDED' :
                        hosp.operationalStatus === 'inactive' ? 'PROVIDER_INACTIVE' : 'PROVIDER_ARCHIVED';
      return {
        ok: false,
        errorCode,
        message: 'المستشفى المطلوب موقوف تشغيلياً ولا يمكن استقبال طلبات جديدة حالياً.',
        requestId: ''
      };
    }
  }

  const requestId = `intl-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const newRequest: InternationalRequest = {
    ...request,
    id: requestId,
    status: 'new',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  inMemoryIntlRequests.push(newRequest);

  return {
    ok: true,
    message: 'تم استلام طلب العلاج وسياحتك العلاجية بنجاح! هذا نموذج تجريبي في المرحلة الأولى، وسيتواصل معك منسق الرعاية الطبية لدينا قريباً لتقديم عروض الأسعار والخيارات المتاحة.',
    requestId
  };
}

export async function getProviderInternationalRequests(providerId: string, providerType: 'doctor' | 'hospital'): Promise<InternationalRequest[]> {
  await new Promise(resolve => setTimeout(resolve, 100));
  return inMemoryIntlRequests.filter(r => 
    r.target_type === providerType && 
    (providerType === 'doctor' ? r.doctor_id === providerId : r.hospital_id === providerId)
  );
}
