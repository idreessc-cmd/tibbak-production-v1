# Executive Product Brief — طبّك (Tibbak)

## 📌 Executive Summary

**طبّك (Tibbak)** is a specialized healthcare marketplace platform engineered for the Middle East and North Africa (MENA) region. It connects patients with verified medical specialists and accredited hospitals for domestic and international care.

---

## 🎯 Value Proposition

### 1. For Patients
- **Transparent Discovery**: Browse doctors and hospitals filtered by specialty, city, language, and services.
- **Privacy Assurance**: Sensitive health details and identity are protected by strict privacy access control.
- **Seamless Booking**: Request appointments and initiate consultations directly in Arabic or English.

### 2. For Doctors
- **Tiered Lead Entitlements**: Free Tier allows 3 accessible patient leads before locking. Professional and VIP tiers unlock unlimited case access.
- **Privacy Protection**: Contact details are never exposed to foreign providers or unentitled accounts.
- **Independent Organic Placement**: Quality score and organic rankings remain independent of commercial plan upgrades.

### 3. For Hospitals
- **Institutional Governance**: Manage department workflows, international medical tourism inquiries, and hospital requests.
- **Operational Verification**: Provider verification badges reflect actual operational status (Active, Suspended, Inactive, Archived).

---

## 💼 Commercial & Business Model

- **Subscription Plans**: Free (3 leads limit), Professional (Unlimited leads), VIP (Unlimited leads + Priority placement).
- **Sponsored Placement Separation**: Sponsored campaigns boost placement in dedicated sponsored carousels only. Sponsored status NEVER alters organic ranking scores.
- **Indicative Pricing**: Subscriptions and campaign budgets are managed independently through transparent governance controls.

---

## 🔒 Governance & Privacy Architecture

- **Privacy-by-Design**: Contact details (`patient_phone`, `patient_email`, raw file paths) are structurally excluded from provider responses (`ProviderCaseSummary`) and admin operational views (`AdminCaseOperationalSummary`).
- **Locked Lead Previews**: Unentitled doctors view only safe demographic previews (`LockedLeadPreview`).
- **Append-Only Audit Logs**: Every provider status change, verification update, and campaign state transition generates immutable audit records.
