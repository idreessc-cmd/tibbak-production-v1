# Tibbak MVP Acceptance Criteria & Test Matrix

This document outlines acceptance criteria and manual verification procedures for Days 1 through 5 of **طبّك (Tibbak)**.

---

## 1. Days 1–4 Summary

- **Day 1**: Canonical demo scenario (`CASE-2026-000154`), `DemoDataBanner`, `/demo` route, route audit (`docs/MVP_ROUTE_AUDIT.md`).
- **Day 2**: Search engine overhaul, symptom-to-specialty mapping layer, `SearchBar.tsx` autocomplete, `DoctorCardItem.tsx` verified badges, zero direct contact exposure.
- **Day 3**: Booking wizard, case creation state machine (11 statuses), `LockedLeadPreview` for locked cases, appointment slot conflict validation, patient phone masking (`07*******12`).
- **Day 4**: Central appointment domain module (`src/lib/appointments/appointment-status.ts`), atomic doctor confirmation transaction, active slot conflict reservation.

---

## 2. Day 5 Admin Operations & Governance Test Matrix

| Test ID | Scenario / Steps | Expected Result | Status |
|---|---|---|---|
| **Test A** | Safe DTO Boundaries | `ProviderCaseSummary`, `AdminCaseOperationalSummary`, `LockedLeadPreview` structurally omit contact fields. Provider/admin responses return "Not returned" for phone/email. | **PASSED** ✅ |
| **Test B** | Privacy Request Machine | `submitted` → `under_review` → `completed` / `rejected`. Direct `submitted` → `completed` returns `INVALID_PRIVACY_REQUEST_TRANSITION`. | **PASSED** ✅ |
| **Test C** | Campaign Creation Lifecycle | `draft` → `scheduled` → `active`. Direct `draft` → `active` creation returns `INVALID_CAMPAIGN_TRANSITION`. | **PASSED** ✅ |
| **Test D** | Invalid Campaign Transitions | Rejects `draft` → `active`, `scheduled` → `paused`, `ended` → `active`, `cancelled` → `scheduled` with `INVALID_CAMPAIGN_TRANSITION` and zero audit event. | **PASSED** ✅ |
| **Test E** | Encapsulated Demo Reset | Reset logic encapsulated in `AdminDemoSettings.tsx`. Ordinary `admin-actions.ts` never imports demo reset code. | **PASSED** ✅ |
| **Test F** | Suspended Hospital Request | International request targeting `hosp-governance-suspended` rejected with `PROVIDER_SUSPENDED`. Reactivation restores capability. | **PASSED** ✅ |
| **Test G** | Audit Log Sequence | 11-step audit sequence logged cleanly without direct status skips or patient PII. | **PASSED** ✅ |
| **Test H** | Day 6 Approved Scope | Deployment & QA Hardening (No Hospital CRM). | **PASSED** ✅ |
