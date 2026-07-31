# Tibbak Route Inventory & Scenario Matrix

This document provides the complete inventory of compiled App Router routes (31) and scenario test cases (29).

---

## 1. Compiled App Router Routes (31 Total)

```
Route (app)                                 Type
┌ ○ /                                      Static (Redirects 307 -> /ar)
├ ○ /_not-found                            Static (404 Error Page)
├ ● /[locale]                              SSG (/ar, /en)
├ ƒ /[locale]/cases/[id]                   Dynamic Server-Rendered
├ ● /[locale]/contact                      SSG (/ar/contact, /en/contact)
├ ƒ /[locale]/dashboard/[role]             Dynamic Server-Rendered
├ ● /[locale]/dashboard/admin            SSG (/ar/dashboard/admin, /en/dashboard/admin)
├ ● /[locale]/dashboard/doctor           SSG (/ar/dashboard/doctor, /en/dashboard/doctor)
├ ● /[locale]/dashboard/hospital         SSG (/ar/dashboard/hospital, /en/dashboard/hospital)
├ ● /[locale]/demo                       SSG (/ar/demo, /en/demo)
├ ● /[locale]/doctors                      SSG (/ar/doctors, /en/doctors)
├ ƒ /[locale]/doctors/[slug]             Dynamic Server-Rendered
├ ● /[locale]/hospitals                    SSG (/ar/hospitals, /en/hospitals)
├ ƒ /[locale]/hospitals/[slug]           Dynamic Server-Rendered
├ ● /[locale]/international-treatment    SSG (/ar/international-treatment, /en/international-treatment)
├ ● /[locale]/join-doctor                SSG (/ar/join-doctor, /en/join-doctor)
├ ● /[locale]/join-hospital              SSG (/ar/join-hospital, /en/join-hospital)
├ ● /[locale]/packages                   SSG (/ar/packages, /en/packages)
└ ● /[locale]/search                     SSG (/ar/search, /en/search)
```

---

## 2. Tested Route Scenario Matrix (29 Scenarios)

| # | Scenario Path / Condition | HTTP Status | Location Header | Expected Behavior |
|---|---|---|---|---|
| 1 | `/` (Root URL) | `307 Temporary Redirect` | `/ar` | Redirects to default Arabic locale |
| 2 | `/ar` (Arabic Home) | `200 OK` | N/A | Renders Arabic homepage |
| 3 | `/en` (English Home) | `200 OK` | N/A | Renders English homepage |
| 4 | `/ar/search` (Arabic Search) | `200 OK` | N/A | Renders doctor/hospital search |
| 5 | `/en/search` (English Search) | `200 OK` | N/A | Renders English search interface |
| 6 | `/ar/doctors` (Doctor Index) | `200 OK` | N/A | Renders doctor catalog |
| 7 | `/ar/doctors/dr-firas-khatib` (Valid Doctor) | `200 OK` | N/A | Doctor profile page |
| 8 | `/ar/doctors/invalid-doctor-slug` (Invalid Doctor) | `404 Not Found` | N/A | Renders safe 404 page |
| 9 | `/ar/doctors/dr-suspended-test` (Suspended Doctor) | `404 Not Found` | N/A | Excluded from search/profiles |
| 10 | `/ar/hospitals` (Hospital Index) | `200 OK` | N/A | Renders hospital catalog |
| 11 | `/ar/hospitals/king-hussein-medical-center` | `200 OK` | N/A | Hospital profile page |
| 12 | `/ar/hospitals/invalid-hospital-slug` | `404 Not Found` | N/A | Renders safe 404 page |
| 13 | `/ar/hospitals/hosp-suspended-test` | `404 Not Found` | N/A | Excluded from search/profiles |
| 14 | `/ar/packages` | `200 OK` | N/A | Medical tourism packages |
| 15 | `/ar/demo` | `200 OK` | N/A | Demo rehearsal panel |
| 16 | `/ar/login` | `200 OK` | N/A | Login / session selection |
| 17 | `/ar/cases/CASE-2026-000154` (Patient-Owned) | `200 OK` | N/A | Access granted to Patient A |
| 18 | `/ar/cases/CASE-2026-000154` (Cross-Patient) | `200 OK` | N/A | Returns `PATIENT_CASE_ACCESS_DENIED` |
| 19 | `/ar/cases/CASE-2026-000154` (No-Session) | `200 OK` | N/A | Returns `PATIENT_AUTH_REQUIRED` |
| 20 | `/ar/cases/CASE-2026-000157` (Locked Case) | `200 OK` | N/A | Gated blur under Free doctor plan |
| 21 | `/ar/dashboard/doctor` | `200 OK` | N/A | Doctor portal dashboard |
| 22 | `/ar/dashboard/hospital` | `200 OK` | N/A | Hospital portal dashboard |
| 23 | `/ar/dashboard/admin` (Normal) | `200 OK` | N/A | Admin operational panel |
| 24 | `/ar/dashboard/admin?demo=1` (Demo) | `200 OK` | N/A | Admin panel + Demo reset control |
| 25 | `/ar/international-treatment` | `200 OK` | N/A | International patient landing |
| 26 | `/ar/join-doctor` | `200 OK` | N/A | Doctor onboarding registration |
| 27 | `/ar/join-hospital` | `200 OK` | N/A | Hospital onboarding registration |
| 28 | `/ar/contact` | `200 OK` | N/A | Contact & support form |
| 29 | `/non-existent-route` (Unknown Route) | `404 Not Found` | N/A | Custom styled 404 page |
