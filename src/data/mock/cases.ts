import { Case, Message, Appointment } from '@/types';
import { demoScenario, getScenarioCase, getScenarioAppointment } from './demo-scenario';

export const inMemoryCases: Case[] = [
  getScenarioCase(), // CASE-2026-000154
  {
    id: 'CASE-2026-000002',
    patient_id: 'patient-2',
    doctor_id: 'doc-1',
    hospital_id: null,
    status: 'new',
    created_at: '2026-07-17T09:15:00Z',
    patient_name: 'سارة أحمد الحلبي',
    patient_phone: '+962 7 8987 6543',
    patient_email: 'sara.halabi@yahoo.com',
    patient_country: 'الأردن',
    patient_city: 'إربد',
    patient_age: 28,
    patient_gender: 'female',
    patient_reason: 'خفقان سريع ومفاجئ في القلب مع دوار خفيف مستمر منذ يومين.',
    patient_files: []
  },
  {
    id: 'CASE-2026-000003',
    patient_id: 'patient-3',
    doctor_id: 'doc-1',
    hospital_id: null,
    status: 'new',
    created_at: '2026-07-18T08:00:00Z',
    patient_name: 'يوسف خالد الخطيب',
    patient_phone: '+962 7 7555 1234',
    patient_email: 'yousef.khatib@outlook.com',
    patient_country: 'الأردن',
    patient_city: 'الزرقاء',
    patient_age: 62,
    patient_gender: 'male',
    patient_reason: 'متابعة ما بعد عملية القسطرة وتركيب الدعامة وتعديل جرعات الأدوية.',
    patient_files: ['discharge_summary.pdf']
  },
  {
    id: 'CASE-2026-000004',
    patient_id: 'patient-4',
    doctor_id: 'doc-1',
    hospital_id: null,
    status: 'new',
    created_at: '2026-07-18T09:05:00Z',
    patient_name: 'رنا عبيد العواملة',
    patient_phone: '+962 7 9999 8888',
    patient_email: 'rana.awamleh@gmail.com',
    patient_country: 'الأردن',
    patient_city: 'السلط',
    patient_age: 35,
    patient_gender: 'female',
    patient_reason: 'استشارة حول آلام متكررة ووخز في عضلات الصدر عند التوتر.',
    patient_files: []
  }
];

export const inMemoryMessages: Message[] = [
  // CASE-2026-000154 (Demo Scenario Messages)
  ...demoScenario.messages.map((m, idx) => ({
    ...m,
    id: `msg-${idx + 1}`
  })),

  // CASE 2 Messages
  {
    id: 'msg-5',
    case_id: 'CASE-2026-000002',
    sender_role: 'system',
    text: 'تم إنشاء الحالة بنجاح. بانتظار استجابة العيادة الطبية.',
    type: 'text',
    created_at: '2026-07-17T09:15:00Z'
  },
  {
    id: 'msg-6',
    case_id: 'CASE-2026-000002',
    sender_role: 'patient',
    text: 'دكتور، نبضات قلبي سريعة جداً حتى وقت الراحة وأشعر بدوار عند الوقوف المفاجئ.',
    type: 'text',
    created_at: '2026-07-17T09:20:00Z'
  }
];

export const inMemoryAppointments: Appointment[] = [
  getScenarioAppointment(), // apt-1 pointing to CASE-2026-000154
  {
    id: 'apt-2',
    case_id: 'CASE-2026-000002',
    doctor_id: 'doc-1',
    date: '2026-07-21',
    time_slot: '11:30 AM',
    status: 'scheduled'
  }
];
