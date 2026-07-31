# Tibbak Day 2 — Home Page & Search Experience Audit

This audit identifies UX deficiencies, search filtering gaps, mobile responsiveness issues, and RTL formatting needs across the homepage and search flows before implementing Day 2 enhancements.

---

## 🔍 Audit Findings

| UX / Code Problem | Related File | Severity | Planned Fix | Mobile Affect | RTL Affect | Blocks Canonical Demo |
|---|---|---|---|---|---|---|
| **Missing Free-Text Search Input**: Search bar only uses dropdowns for specialty and city; no text field for entering symptoms, doctor names, or keywords. | `src/components/home/SearchBar.tsx` | **High** | Replace single dropdown with free-text autocomplete input `ماذا تبحث؟` accepting medical symptoms, specialties, and doctor names. | Yes | Yes | **Yes** |
| **Missing Autocomplete Panel & Keyboard Nav**: No suggestions panel grouping concerns, specialties, and doctors with keyboard navigation (Up/Down/Enter/Esc) and ARIA attributes. | `src/components/home/SearchBar.tsx` | **High** | Build accessible autocomplete panel grouped into `مشاكل صحية`, `تخصصات`, `أطباء` with full keyboard navigation and click-outside handling. | Yes | Yes | **Yes** |
| **Missing Symptom-Specialty Mapping**: Typing symptoms like "ألم الركبة" does not auto-map to `spec-orthopedics`. | `src/data/mock/symptom-specialty-map.ts` | **High** | Create `symptom-specialty-map.ts` mapping terms (e.g. knee pain -> orthopedics, rash -> dermatology) with a clear non-diagnostic disclaimer. | No | Yes | **Yes** |
| **Homepage Hero Messaging**: Headline and supporting text use generic placeholder strings instead of exact required copy. | `src/app/[locale]/page.tsx` | **Medium** | Update hero copy to required headlines, supporting text, and CTAs (e.g. "ابحث عن الطبيب المناسب وابدأ رحلتك العلاجية بأمان"). | Yes | Yes | No |
| **Search Repository Relevance**: `getAllDoctors` search logic doesn't match symptom synonyms or sort by earliest available appointment. | `src/lib/repositories/doctors.ts` | **High** | Enhance `getAllDoctors` to inspect symptom terms, specialty names, and doctor titles, and support stable `earliest_date` sorting. | No | No | **Yes** |
| **Search Page Header & Breadcrumbs**: `/search` top section lacks breadcrumbs, active query labels ("أطباء جراحة العظام والمفاصل في عمان"), active filter chips, and clear-all actions. | `src/app/[locale]/search/page.tsx` | **Medium** | Redesign search results header to show exact query details, result count, active removable filter chips, and breadcrumb. | Yes | Yes | No |
| **Doctor Result Cards Content**: Cards lack accepted insurance names (up to 3), explicit `إعلان / Sponsored` labels on boosted items, and "احفظ للمقارنة" action. | `src/app/[locale]/search/page.tsx` | **Medium** | Enrich card layout with insurance tags, sponsored badges, earliest appointment chips, and comparison save toggle. No direct contact details. | Yes | Yes | No |
| **Mobile Filter Experience**: Filters render in a static column on small screens instead of opening in a clean mobile slide-over drawer/panel. | `src/components/booking/SearchFilterSidebar.tsx` | **High** | Add a mobile drawer toggle button (`فلاتر التصفية`) that slides in a full-height sheet on viewports < 768px. | **Yes** | Yes | No |
| **Public Header Login Label**: Header login button says "تسجيل الدخول" while linking to `/demo`, which could be mistaken for real auth. | `src/components/layout/Header.tsx` | **Low** | Update label to `دخول تجريبي` / `Demo access`. | Yes | Yes | No |
| **Missing "How Tibbak Works" 3-Step Section**: Homepage 3-step section needs refined non-diagnostic copy. | `src/app/[locale]/page.tsx` | **Medium** | Update 3-step guide: 1. ابحث وقارن 2. اختر الموعد 3. تابع حالتك داخل طبّك. | Yes | Yes | No |
| **Trust Section**: Needs restrained trust badges explaining verified providers and internal communications without fake statistics. | `src/app/[locale]/page.tsx` | **Medium** | Add trust section with clear badges and explicit demo data notice. | Yes | Yes | No |

---

## 🎯 Day 2 Implementation Action Plan

1. Create `src/data/mock/symptom-specialty-map.ts` with symptom mappings and non-diagnostic disclaimers.
2. Refine `src/lib/repositories/doctors.ts` query matching and sorting (`ranking`, `rating`, `earliest_date`, `fees_asc`, `fees_desc`, `experience`).
3. Overhaul `src/components/home/SearchBar.tsx` with free-text autocomplete, keyboard nav, ARIA attributes, and symptom mapping.
4. Refine `src/app/[locale]/page.tsx` with hero copy, 3-step "How Tibbak Works", and Trust section.
5. Enhance `src/components/booking/SearchFilterSidebar.tsx` with mobile drawer sheet and additional sorting/filter controls.
6. Upgrade `src/app/[locale]/search/page.tsx` with detailed result headers, active filter tags, breadcrumbs, enriched doctor cards, and sponsored labels.
7. Update `src/components/layout/Header.tsx` login button label to `دخول تجريبي` / `Demo access`.
8. Verify all tests (Test A to Test H), lint, type-check, and build.
