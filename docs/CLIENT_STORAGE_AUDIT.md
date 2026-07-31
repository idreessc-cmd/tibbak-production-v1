# Tibbak Client Storage Audit (sessionStorage & localStorage)

This document audits all client storage keys used by the application, classifying stored data types, verifying absence of unmasked contact PII, and establishing demo storage expiration policies.

---

## 💾 Client Storage Keys Inventory & Data Classification

| Storage Key | Storage Mechanism | Category | Data Stored | Contains Unmasked Contact PII? | Demo Expiry / Reset Policy | Risk Level |
|---|---|---|---|---|---|---|
| `tibbak_cases_db_v1` | `sessionStorage` | Health & Personal (Fictional Demo Data) | Fictional Case objects (Patient name, ID, city, reason, status history) | **No** (Phone & email stripped/masked) | Cleared on tab close / demo reset / session expiry | Low |
| `tibbak_msgs_db_v1` | `sessionStorage` | Health & Operational | Fictional Case chat messages (Text, timestamps, roles) | **No** (Contact details forbidden by validation) | Cleared on tab close / demo reset / session expiry | Low |
| `tibbak_apts_db_v1` | `sessionStorage` | Operational | Fictional Appointment reservations (Slots, dates, statuses) | **No** | Cleared on tab close / demo reset | Low |
| `tibbak_demo_patient_session_v1` | `sessionStorage` | Demo Auth Identity | Fictional Patient Session (`patientId`, `sessionId`, `patientName`) | **No** | Cleared on tab close / demo reset | Low |
| `tibbak_doctor_plan_v1` | `sessionStorage` | Operational Simulation | Doctor plan simulation (`'free'` / `'professional'` / `'vip'`) | **No** | Cleared on demo reset | Low |
| `tibbak_doctor_notifications_v1` | `sessionStorage` | Operational | Notification read statuses & operational titles | **No** | Cleared on demo reset | Low |
| `tibbak_doctor_schedule_v1` | `sessionStorage` | Operational | Doctor working hours, slot duration & leave dates | **No** | Cleared on demo reset | Low |

---

## 🕒 Demo Session Expiration Policy

To prevent stale or corrupted demo state across browser sessions, client demo storage objects utilize a lightweight session envelope:

```json
{
  "version": "1.0",
  "createdAt": "2026-07-26T19:00:00.000Z",
  "expiresAt": "2026-07-26T23:59:59.000Z",
  "data": { ... }
}
```

- **Expiration Horizon**: Demo sessions automatically expire after 24 hours or upon explicit browser session termination (`sessionStorage`).
- **Expiration Behavior**: On encountering an expired demo session object, the client environment clears the key and restores baseline deterministic QA fixtures without affecting unrelated browser preferences.

---

## 🔒 Security & Safety Disclosures

- **Zero Unmasked Phone/Email**: Full patient phone numbers and email addresses are NEVER stored in localStorage or persistent cookies.
- **Forbidden Contact Validation**: All chat message entries pass through `detectExternalContactPattern()` validation before persistence.
- **Fictional Demo Data Disclaimer**: All patient names, medical histories, and cases represent fictional presentation data.
