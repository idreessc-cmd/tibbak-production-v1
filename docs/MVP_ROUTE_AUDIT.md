# Tibbak MVP Route Audit

This document audits the active routes in **طبّك (Tibbak) Production MVP V1** to verify linking, mobile responsiveness, layout consistency, and canonical flow inclusion.

---

## 🗺️ Route Inventory

| Route Path | Type | Purpose | Included in Canonical Demo | Current Status / Issues | Recommended Action |
|---|---|---|---|---|---|
| `/[locale]` | Public | Main landing page containing Booking.com search bar and featured sliders. | **Yes** | Active. Layout looks great, Cairo font applied. | Keep and optimize symptom search inputs on Day 2. |
| `/[locale]/search` | Public | Booking-style Search results with dynamic filters and doctor cards. | **Yes** | Active. Dynamic query parameters are verified. | Ensure Dr. Firas Khatib (`doc-1`) displays first. |
| `/[locale]/doctors` | Public | List of all doctors. Currently redirects to `/search`. | **Yes** | Active. Redirect logic is healthy. | Keep redirect in place. |
| `/[locale]/doctors/[slug]` | Public | 14-section Doctor Profile details page with booking panel sidebar. | **Yes** | Active. No contact numbers visible. | Integrate the canonical demo scenario details. |
| `/[locale]/hospitals` | Public | List of all hospitals. Redirects to `/search?service=hospital`. | **No** | Active. Redirect logic is healthy. | Keep redirect in place. |
| `/[locale]/hospitals/[slug]` | Public | Detailed Hospital Profile with departments list and booking wizard. | **No** | Active. Clean layout. | Exclude from core demo flow; keep as secondary option. |
| `/[locale]/cases/[id]` | Private | Patient secure case messenger chat room with role simulator bar. | **Yes** | Active. Uses mock sandbox selectors. | Align case data strictly to `CASE-2026-000154`. |
| `/[locale]/dashboard/doctor` | Private | Comprehensive Doctor dashboard tracking leads, calendar, stats. | **Yes** | Active. Gated demo toggle works. | Sync weekly calendar updates and package locks. |
| `/[locale]/dashboard/hospital` | Private | Hospital analytics panel managing beds, surgical logs. | **No** | Active. Clean layouts. | Exclude from core demo flow. |
| `/[locale]/dashboard/admin` | Private | Admin SaaS control center overseeing doctors, verifications, CMS. | **Yes** | Active. Clean tabs. | Connect homepage CMS editing to in-session state. |
| `/[locale]/dashboard/[role]` | Private | Mockup/generic dashboard route wrapper. | **No** | Active but redundant. Duplicates specialized dashboards. | Retain as fallback or delete if unused; currently unused by main links. |
| `/[locale]/packages` | Public | Interactive Subscription Package selection grids. | **No** | Active. Dynamic tier upgrades. | Keep as dashboard upgrade option. |
| `/[locale]/international-treatment` | Public | Medical tourism contact form for international patients. | **No** | Active. Works properly. | Exclude from core demo flow. |
| `/[locale]/join-doctor` | Public | Doctor onboarding form template. | **No** | Active. Simple wizard. | Exclude from core demo flow. |
| `/[locale]/join-hospital` | Public | Hospital onboarding form template. | **No** | Active. Simple wizard. | Exclude from core demo flow. |
| `/[locale]/contact` | Public | Customer support contact form page. | **No** | Active. Simple layout. | Exclude from core demo flow. |
| `/[locale]/demo` | Demo | Presentation entry point showcasing step-by-step investor flows. | **Yes** | **Missing** | Create this route to unify presentation actions on Day 1. |

---

## 🛠️ Broken, Duplicate, and Mobile Link Audits

1. **Broken Links**: None detected on core pathways. Minor warning regarding lockfile root tracing from the Next.js compiler is resolved.
2. **Duplicate Routes**: `/[locale]/dashboard/[role]/page.tsx` is a redundant dynamic placeholder page which duplicates the standalone directories `/admin`, `/doctor`, and `/hospital`. Since it is not used in the canonical navigation, it is marked for exclusion.
3. **Mobile Menu Toggle**: Navigational header mobile menu requires validation to ensure transitions work smoothly on phone viewports.
