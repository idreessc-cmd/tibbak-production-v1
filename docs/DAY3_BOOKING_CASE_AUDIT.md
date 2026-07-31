# Tibbak Day 3 — Booking, Case Creation & Patient Journey Final Privacy Audit

This document records the repository-level lead access control, safe locked lead preview model, 11-stage status state machine, appointment slot validation, session persistence, and QA verification for Day 3.

---

## 🔒 Role Access Matrix

| Role | Safe Lead Preview | Case Room Access | Read Messages | Send Messages | Attachments | Appointment Actions | Status Actions | Phone / Email Fields | Upgrade CTA |
|---|---|---|---|---|---|---|---|---|---|
| **Free (Locked > 3)** | **Yes** | **No** | **No** | **No** | **No** | **No** | **No** | **Not returned** | **Yes** |
| **Free (Accessible <= 3)** | **Yes** | **Yes** | **Yes** | **Yes** | Plan-based | **Yes** | **Yes** | **Never exposed** | **No** |
| **Professional** | **Yes** | **Yes** | **Yes** | **Yes** | **Yes** | **Yes** | **Yes** | **Never exposed** | **No** |
| **VIP** | **Yes** | **Yes** | **Yes** | **Yes** | **Yes** | **Yes** | **Yes** | **Never exposed** | **No** |
| **Hospital** | **Yes** | Authorized only | Authorized only | Authorized only | Authorized only | Authorized only | Authorized only | **Never exposed** | **No** |
| **Patient** | N/A | **Yes (Own Case)** | **Yes** | **Yes** | **Yes** | N/A | N/A | Masked Phone Only | N/A |

---

## 🔒 Repository-Level Access Enforcement

### 1. `getGatedCaseDetails(caseId, doctorId)`
- For a Free doctor accessing a locked lead (case index >= 3), returns `{ access: 'locked', preview: LockedLeadPreview, remainingLimit: 0 }`.
- `LockedLeadPreview` returns ONLY safe operational fields:
  - `caseId`
  - `specialtyNameAr` / `specialtyNameEn`
  - `cityNameAr` / `cityNameEn`
  - `serviceType`
  - `receivedAt`
  - `ageRange` (e.g. `"30-39"`)
  - `gender`
  - `generalCategoryAr` / `generalCategoryEn`
  - `isLocked: true`
- **EXCLUDED**: `patientName`, `patientPhone`, `maskedPhone`, `patientEmail`, `maskedEmail`, `patient_reason`, `patient_files`, `attachments`, `messages`, and `appointment` details!

### 2. Message Read/Write Guards
- `getMessagesForCase(caseId, doctorId)` throws `CASE_ACCESS_LOCKED` when invoked by a locked doctor.
- `sendMessage(caseId, 'doctor', ...)` throws `CASE_ACCESS_LOCKED` when invoked by a locked doctor.
- `updateCaseStatus(caseId, ...)` throws `CASE_ACCESS_LOCKED` when invoked by a locked doctor.

---

## 🧪 Direct URL & Manual Test Results

- **Test A (Free Locked Click)**: Open locked case card -> Renders upgrade view and safe preview card (`CASE-2026-000004`), does NOT open private case room.
- **Test B (Direct URL Test `/ar/cases/CASE-2026-000004`)**: Direct URL navigation as Free locked doctor -> Private content does NOT render, messages NOT loaded, attachments NOT loaded, safe locked view and upgrade CTA rendered.
- **Test C (Message Retrieval Test)**: `getMessagesForCase('CASE-2026-000004', 'doc-1')` -> Throws `CASE_ACCESS_LOCKED`.
- **Test D (Send Message Test)**: `sendMessage('CASE-2026-000004', 'doctor', ...)` -> Throws `CASE_ACCESS_LOCKED`.
- **Test E (Free Accessible Case <= 3)**: Case room accessible, internal messaging works, phone/email masked/hidden.
- **Test F (Professional Doctor)**: Case room, messages, attachments, status actions work; zero external contact details exposed.
- **Test G (VIP Doctor)**: Same strict privacy as Professional; zero external contact details exposed.
- **Test H (Hospital)**: Authorized hospital cases work internally; zero external patient contact data exposed.

---

## 🛠️ Verification & Build Status

| Command | Result |
|---|---|
| `npm run lint` | ✔ No ESLint warnings or errors |
| `npx tsc --noEmit` | Exit code 0 (Zero type errors) |
| `npm run build` | 31 static & SSG routes generated cleanly |
