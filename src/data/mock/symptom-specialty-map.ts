export interface SymptomMapping {
  id: string;
  symptom_ar: string;
  symptom_en: string;
  specialty_id: string;
  specialty_slug: string;
  specialty_ar: string;
  specialty_en: string;
}

export const SEARCH_DISCLAIMER_AR = 'اقتراحات البحث للمساعدة في الوصول إلى التخصص المناسب، وليست تشخيصًا طبيًا.';
export const SEARCH_DISCLAIMER_EN = 'Search suggestions help you find a relevant specialty and are not a medical diagnosis.';

export const symptomMappings: SymptomMapping[] = [
  {
    id: 'sym-1',
    symptom_ar: 'ألم الركبة',
    symptom_en: 'Knee pain',
    specialty_id: 'spec-orthopedics',
    specialty_slug: 'spec-orthopedics',
    specialty_ar: 'جراحة العظام والمفاصل',
    specialty_en: 'Orthopedic Surgery'
  },
  {
    id: 'sym-2',
    symptom_ar: 'ألم الظهر',
    symptom_en: 'Back pain',
    specialty_id: 'spec-orthopedics',
    specialty_slug: 'spec-orthopedics',
    specialty_ar: 'جراحة العظام والمفاصل',
    specialty_en: 'Orthopedic Surgery'
  },
  {
    id: 'sym-3',
    symptom_ar: 'كسر أو التواء',
    symptom_en: 'Fracture or sprain',
    specialty_id: 'spec-orthopedics',
    specialty_slug: 'spec-orthopedics',
    specialty_ar: 'جراحة العظام والمفاصل',
    specialty_en: 'Orthopedic Surgery'
  },
  {
    id: 'sym-4',
    symptom_ar: 'طفح جلدي',
    symptom_en: 'Skin rash',
    specialty_id: 'spec-dermatology',
    specialty_slug: 'spec-dermatology',
    specialty_ar: 'الأمراض الجلدية والتناسلية',
    specialty_en: 'Dermatology'
  },
  {
    id: 'sym-5',
    symptom_ar: 'حب الشباب',
    symptom_en: 'Acne',
    specialty_id: 'spec-dermatology',
    specialty_slug: 'spec-dermatology',
    specialty_ar: 'الأمراض الجلدية والتناسلية',
    specialty_en: 'Dermatology'
  },
  {
    id: 'sym-6',
    symptom_ar: 'ألم الأسنان',
    symptom_en: 'Toothache',
    specialty_id: 'spec-dentistry',
    specialty_slug: 'spec-dentistry',
    specialty_ar: 'طب وجراحة الأسنان',
    specialty_en: 'Dentistry'
  },
  {
    id: 'sym-7',
    symptom_ar: 'نزيف اللثة',
    symptom_en: 'Bleeding gums',
    specialty_id: 'spec-dentistry',
    specialty_slug: 'spec-dentistry',
    specialty_ar: 'طب وجراحة الأسنان',
    specialty_en: 'Dentistry'
  },
  {
    id: 'sym-8',
    symptom_ar: 'تأخر الحمل والعقم',
    symptom_en: 'Delayed pregnancy & infertility',
    specialty_id: 'spec-obstetrics-gynecology',
    specialty_slug: 'spec-obstetrics-gynecology',
    specialty_ar: 'النسائية والتوليد',
    specialty_en: 'Obstetrics & Gynecology'
  },
  {
    id: 'sym-9',
    symptom_ar: 'متابعة الحمل',
    symptom_en: 'Pregnancy follow-up',
    specialty_id: 'spec-obstetrics-gynecology',
    specialty_slug: 'spec-obstetrics-gynecology',
    specialty_ar: 'النسائية والتوليد',
    specialty_en: 'Obstetrics & Gynecology'
  },
  {
    id: 'sym-10',
    symptom_ar: 'حرارة الطفل',
    symptom_en: 'Child fever',
    specialty_id: 'spec-pediatrics',
    specialty_slug: 'spec-pediatrics',
    specialty_ar: 'طب الأطفال وحديثي الولادة',
    specialty_en: 'Pediatrics'
  },
  {
    id: 'sym-11',
    symptom_ar: 'سعال الطفل',
    symptom_en: 'Child cough',
    specialty_id: 'spec-pediatrics',
    specialty_slug: 'spec-pediatrics',
    specialty_ar: 'طب الأطفال وحديثي الولادة',
    specialty_en: 'Pediatrics'
  },
  {
    id: 'sym-12',
    symptom_ar: 'خفقان القلب',
    symptom_en: 'Heart palpitations',
    specialty_id: 'spec-cardiology',
    specialty_slug: 'spec-cardiology',
    specialty_ar: 'أمراض القلب والشرايين',
    specialty_en: 'Cardiology'
  },
  {
    id: 'sym-13',
    symptom_ar: 'ضيق التنفس',
    symptom_en: 'Shortness of breath',
    specialty_id: 'spec-cardiology',
    specialty_slug: 'spec-cardiology',
    specialty_ar: 'أمراض القلب والشرايين',
    specialty_en: 'Cardiology'
  }
];

export function findSpecialtyForQuery(query: string): SymptomMapping | null {
  if (!query || query.trim().length === 0) return null;
  const q = query.toLowerCase().trim();

  const match = symptomMappings.find(
    s => s.symptom_ar.includes(q) || 
         s.symptom_en.toLowerCase().includes(q) ||
         q.includes(s.symptom_ar) ||
         q.includes(s.symptom_en.toLowerCase())
  );

  return match || null;
}
