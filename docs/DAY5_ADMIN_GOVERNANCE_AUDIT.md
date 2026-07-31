# Tibbak Day 5 — Admin Operations, Governance & Live-State Privacy Audit

This document records the technical audit, privacy enforcement, state machine hardening, and live-state architecture for the Admin Operations Panel of **طبّك (Tibbak)**.

---

## 🔒 1. Final Privacy Matrix & Safe DTO Boundaries

Provider-facing and operational admin responses do **NOT** return patient contact fields (`patientPhone`, `maskedPhone`, `patientEmail`, `maskedEmail`, `WhatsApp`, `tel:`, `mailto:`). Contact fields are structurally omitted at the repository level via typed DTOs (`ProviderCaseSummary`, `AdminCaseOperationalSummary`, `LockedLeadPreview`).

| Role / Plan | Phone | Email | External Contact (`tel:`, `mailto:`, `wa.me`) | Internal Messaging | Attachments |
|---|---|---|---|---|---|
| **Free (Locked)** | Not returned | Not returned | No | No | No |
| **Free (Accessible)** | Not returned | Not returned | No | Allowed | No |
| **Professional** | Not returned | Not returned | No | Allowed | Allowed |
| **VIP** | Not returned | Not returned | No | Allowed | Allowed |
| **Hospital Authorized** | Not returned | Not returned | No | Allowed | Allowed |
| **Admin Operational** | Not returned | Not returned | No | No Message Text | Safe Metadata Only |

Standard Statement: *"Internal case access and in-platform communication entitlements change with plan."*

---

## 📢 2. Campaign Lifecycle State Machine (`src/lib/campaigns/sponsored-campaigns.ts`)

Required Lifecycle: `draft` → `scheduled` → `active`.

| Transition | Status Before | Status After | Allowed | Audit Action | Badge (`isSponsored`) |
|---|---|---|---|---|---|
| Creation | None | `draft` | Yes | `campaign_created` | `false` |
| Scheduling | `draft` | `scheduled` | Yes | `campaign_scheduled` | `false` |
| Activation | `scheduled` | `active` | Yes | `campaign_activated` | `true` |
| Pause | `active` | `paused` | Yes | `campaign_paused` | `false` |
| Resume | `paused` | `active` | Yes | `campaign_activated` | `true` |
| End | `active` / `paused` | `ended` | Yes | `campaign_ended` | `false` |
| Direct Active | `draft` | `active` | **REJECTED** (`INVALID_CAMPAIGN_TRANSITION`) | None | `false` |
| Invalid Resume | `ended` | `active` | **REJECTED** (`INVALID_CAMPAIGN_TRANSITION`) | None | `false` |

---

## 🛡️ 3. Privacy Request State Machine (`src/lib/admin/admin-actions.ts`)

Allowed transitions:
- `submitted` → `under_review`
- `under_review` → `completed` (Reason required)
- `under_review` → `rejected` (Reason required)

Rejected transitions:
- `submitted` → `completed` (**REJECTED** with `INVALID_PRIVACY_REQUEST_TRANSITION`, zero mutation, zero audit event)
- `submitted` → `rejected` (**REJECTED**)
- `completed` → `under_review` (**REJECTED**)

---

## 🛠️ 4. Encapsulated Demo Reset Architecture

- Ordinary Admin Service (`src/lib/admin/admin-actions.ts`) does **NOT** import `admin-demo-reset.ts`.
- Reset behavior is encapsulated inside `AdminDemoSettings.tsx` (`src/components/admin/AdminDemoSettings.tsx`) and invokes `executeDemoEnvironmentReset(true)`.
- Renders ONLY when `demo=1` context is present with modal confirmation dialog.
