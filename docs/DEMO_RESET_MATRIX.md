# Tibbak Demo Reset Matrix & Isolation Rules

This document inventories all demo environment reset utilities, their UI triggers, confirmation requirements, and isolation boundaries.

---

## 🛠️ Demo Reset Inventory

| Reset Module | Target Data Store | UI Trigger Location | Context Guard | Confirmation Required? | Public Service Import? |
|---|---|---|---|---|---|
| `executeDemoEnvironmentReset()` | Verifications, Subscriptions, Campaigns, Audit Logs | `AdminDemoSettings.tsx` | `demo=1` required | **Yes** (Modal dialog) | **NO** (Quarantined in demo component) |
| `resetDay4Fixtures()` | Appointments, Cases, Doctor Schedule, Subscription Plan | Doctor Dashboard QA Reset button | `demo=1` or `qa=1` required | **Yes** (Modal dialog) | **NO** (Quarantined in `day4-qa-fixtures.ts`) |
| `resetSponsoredCampaigns()` | In-memory Sponsored Campaigns store | Admin Demo Reset handler | `demo=1` required | **Yes** | **NO** |
| `resetAdminAuditLog()` | Admin Audit Log array | Quarantined in `admin-demo-reset.ts` | `demo=1` required | **Yes** | **NO** (Removed from public audit log API) |

---

## 🛡️ Isolation Verification Rules

1. **No Public Pollution**: Public services (`doctors.ts`, `hospitals.ts`, `cases.ts`, `admin-actions.ts`, `audit-log.ts`) do **NOT** export reset functions.
2. **Explicit Demo Context**: Demo reset UI controls render ONLY when `?demo=1` query parameter is present.
3. **Confirmation Modal**: Destructive reset actions require explicit user confirmation via modal dialog before executing state mutation.
