# Tibbak Day 4 — Doctor Dashboard, Subscription & Ranking Model Audit

This document records the technical audit of the doctor dashboard, subscription entitlement model, organic ranking module, repository access guards, appointment domain module, atomic confirmation transitions, and isolated QA verification for Day 4.

---

## 🔒 1. Final Doctor Domain Model & Appointment Domain Module

### Central Domain Module: `src/lib/appointments/appointment-status.ts`
- **`AppointmentStatus`**: `'requested' | 'scheduled' | 'cancelled' | 'completed' | 'no_show'`.
- **`isAppointmentActive(apt)`**: Returns `true` for `'requested'` and `'scheduled'`. Returns `false` for `'cancelled'`, `'completed'`, and `'no_show'`.
- **Action Validators**: `canConfirmAppointment`, `canRescheduleAppointment`, `canCancelAppointment`, `canMarkAppointmentAttended`, `canMarkAppointmentNoShow`.

```typescript
export type DoctorSubscriptionPlan = 'free' | 'professional' | 'vip';

export type AppointmentStatus =
  | 'requested'
  | 'scheduled'
  | 'cancelled'
  | 'completed'
  | 'no_show';

export interface Doctor {
  id: string;
  name_ar: string;
  name_en: string;
  slug: string;
  specialty_id: string;
  city_id: string;
  hospital_id: string | null;
  title_ar: string;
  title_en: string;
  bio_ar: string;
  bio_en: string;
  experience_years: number;
  consultation_fee_jod: number;
  rating: number;
  reviews_count: number;
  patients_count: number;
  is_verified: boolean;
  gender?: 'male' | 'female';
  
  subscriptionPlan: DoctorSubscriptionPlan;
  isSponsored: boolean;
  sponsoredUntil?: string | null;
  organicSortOrder: number;

  package_id: string;
  languages: string[];
  address_ar: string;
  address_en: string;
  first_available_date: string;
}
```

---

## 🔒 2. Initial Case & Appointment Status Distinction

- **Appointment Booking Request** (Patient selects specific doctor + slot):
  - Appointment Status: `requested`
  - Case Status: `waiting_doctor` (Awaiting doctor review)
- **General Medical Inquiry** (Patient submits request without selecting doctor/slot):
  - Case Status: `new`

---

## ⚛️ 3. Atomic Confirmation Transaction

Doctor confirmation (`confirmAppointment`) performs one atomic operation:
- **Appointment Transition**: `requested` → `scheduled`
- **Case Transition**: `waiting_doctor` → `accepted` → `appointment_scheduled`
- **History Records Generated**:
  1. `waiting_doctor` → `accepted` (Actor: `doctor`, Reason: `Appointment request accepted`)
  2. `accepted` → `appointment_scheduled` (Actor: `doctor`, Reason: `Appointment confirmed and scheduled`)

*Failure Safety*: All state checks are evaluated prior to any array mutations. If any check fails, zero state mutations occur and typed error codes (`APPOINTMENT_ALREADY_CONFIRMED`, `INVALID_APPOINTMENT_TRANSITION`) are returned.

---

## 📦 4. Domain Import Audit

| File Path | Imports Domain Logic From | Imports QA Fixtures? | Audit Status |
|---|---|---|---|
| `src/lib/repositories/bookings.ts` | `src/lib/appointments/appointment-status.ts` | **No** | **CLEAN** ✅ |
| `src/lib/repositories/appointment-slots.ts` | `src/lib/appointments/appointment-status.ts` | **No** | **CLEAN** ✅ |
| `src/app/[locale]/dashboard/doctor/page.tsx` | `src/lib/appointments/appointment-status.ts` | Demo Reset Button Only (`demo=1`) | **CLEAN** ✅ |
| `src/lib/demo/day4-qa-fixtures.ts` | `src/lib/appointments/appointment-status.ts` | **Yes (QA file)** | **CLEAN** ✅ |

---

## 📊 5. Isolated Appointment Action Results Table

| Test | Fixture ID | Initial Apt Status | Initial Case Status | Action | Repository Return Object | Final Apt Status | Final Case Status | Active? | Status History Events Logged | Error Code |
|---|---|---|---|---|---|---|---|---|---|---|
| **A** | `apt-qa-confirm` | `requested` | `waiting_doctor` | `confirm` | `{ success: true }` | `scheduled` | `appointment_scheduled` | **Yes** | 1. `waiting_doctor`→`accepted`<br>2. `accepted`→`appointment_scheduled` | `null` |
| **B** | `apt-qa-confirm` (repeat) | `scheduled` | `appointment_scheduled` | `confirm` | `{ success: false, errorCode: 'APPOINTMENT_ALREADY_CONFIRMED' }` | `scheduled` | `appointment_scheduled` | **Yes** | None (No duplicate event logged) | `APPOINTMENT_ALREADY_CONFIRMED` |
| **C** | `apt-qa-reschedule` | `scheduled` | `appointment_scheduled` | `reschedule` | `{ success: true }` | `scheduled` | `appointment_scheduled` | **Yes** | `Rescheduled to 2026-07-25 09:00 AM` | `null` |
| **D** | `apt-qa-conflict-source` | `scheduled` | `appointment_scheduled` | `reschedule` (to `02:00 PM`) | `{ success: false, errorCode: 'APPOINTMENT_SLOT_UNAVAILABLE' }` | `scheduled` | `appointment_scheduled` | **Yes** | None (No false event logged) | `APPOINTMENT_SLOT_UNAVAILABLE` |
| **E** | `apt-qa-cancel` | `scheduled` | `appointment_scheduled` | `cancel` | `{ success: true }` | `cancelled` | `cancelled` | **No** | `Cancelled by doctor: Emergency` | `null` |
| **F** | `apt-qa-attended` | `scheduled` | `appointment_scheduled` | `markAttended` | `{ success: true }` | `completed` | `visit_completed` | **No** | `Patient attended appointment visit` | `null` |
| **G** | `apt-qa-no-show` | `scheduled` | `appointment_scheduled` | `markNoShow` | `{ success: true }` | `no_show` | `no_show` | **No** | `Patient did not attend scheduled appointment` | `null` |
