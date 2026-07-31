import { Package } from '@/types';

export const mockPackages: Package[] = [
  // Doctor packages
  {
    id: 'pkg-doc-free',
    name_ar: 'الباقة المجانية',
    name_en: 'Free Package',
    role: 'doctor',
    price_monthly: 0,
    lead_limit: 3,
    features_ar: ['رؤية أول 3 محادثات شهرياً فقط', 'حجب بيانات المريض بعد الحد المسموح', 'إخفاء أرقام الهواتف والإيميلات'],
    features_en: ['View first 3 chats per month only', 'Gated patient details after limit', 'Masked patient contact details']
  },
  {
    id: 'pkg-doc-premium',
    name_ar: 'الباقة المتميزة (Premium)',
    name_en: 'Premium Package',
    role: 'doctor',
    price_monthly: 49,
    lead_limit: -1,
    features_ar: ['محادثات وحجوزات غير محدودة', 'إظهار بيانات المرضى كاملة', 'لوحة تحكم وتحليلات متقدمة', 'تقارير الإيرادات و CTR'],
    features_en: ['Unlimited chats & bookings', 'Unmasked patient details unlocked', 'Advanced analytics dashboard', 'Revenue & CTR reports']
  },
  {
    id: 'pkg-doc-vip',
    name_ar: 'باقة كبار الشخصيات (VIP)',
    name_en: 'VIP Package',
    role: 'doctor',
    price_monthly: 149,
    lead_limit: -1,
    features_ar: ['محادثات غير محدودة وبيانات كاملة', 'أولوية الظهور في نتائج البحث (Booster)', 'شارة VIP على بطاقة التعريف', 'إعلانات على الصفحة الرئيسية للمنصة'],
    features_en: ['Unlimited chats & full details', 'Priority search listing booster', 'VIP Badge on profile card', 'Homepage banner advertisement placement']
  },
  
  // Hospital packages
  {
    id: 'pkg-hosp-basic',
    name_ar: 'الباقة الأساسية للمستشفيات',
    name_en: 'Hospital Basic',
    role: 'hospital',
    price_monthly: 99,
    lead_limit: -1,
    features_ar: ['إدارة الأطباء المعتمدين والأقسام', 'إدارة سعة الأسرة وجدول العمليات', 'تلقي طلبات الحجز العامة'],
    features_en: ['Manage accredited doctors & departments', 'Manage bed capacity & surgery schedules', 'Receive general booking requests']
  },
  {
    id: 'pkg-hosp-premium',
    name_ar: 'الباقة المتقدمة للمستشفيات',
    name_en: 'Hospital Premium',
    role: 'hospital',
    price_monthly: 249,
    lead_limit: -1,
    features_ar: ['لوحة تحكم إدارية كاملة وعروض ترويجية', 'تقارير أداء ومعدلات تحويل', 'نشر العروض الطبية والخصومات الخاصة'],
    features_en: ['Full admin dashboard & promotions', 'Performance & conversion reports', 'Publish medical deals & special discounts']
  },
  {
    id: 'pkg-hosp-international',
    name_ar: 'باقة شريك العلاج الدولي (SaaS + السياحة العلاجية)',
    name_en: 'International Partner Package',
    role: 'hospital',
    price_monthly: 499,
    lead_limit: -1,
    features_ar: ['شريك علاج دولي معتمد', 'تلقي طلبات السياحة العلاجية الدولية مباشرة', 'ربط فندقي ولوجستي متقدم', 'دعم فني خاص 24/7'],
    features_en: ['Accredited International Partner status', 'Receive international medical tourism cases', 'Advanced hotel & logistics coordination', 'Dedicated 24/7 technical support']
  }
];
