# Tibbak Accessibility Audit & Evidence

Accessibility audit completed against selected WCAG 2.1 AA criteria.

---

## 📄 Page-by-Page Accessibility Audit Evidence Table

| Page / Route | Keyboard Navigation | Input & Button Labels | Dialog Focus & Esc Closure | Heading Hierarchy (`<h1>`) | Known Limitations / Issues |
|---|---|---|---|---|---|
| **Homepage (`/[locale]`)** | **PASS** (Tab order through hero, search, specialties) | **PASS** (SearchBar label & search button accessible) | N/A | **PASS** (Single H1) | None |
| **Search (`/[locale]/search`)** | **PASS** (Filters & drawer navigable via Tab) | **PASS** (All filter checkboxes & selects labeled) | **PASS** (Mobile filter drawer traps focus & Esc closes) | **PASS** (Single H1) | None |
| **Doctor Profile (`/[locale]/doctors/[slug]`)** | **PASS** (Slots grid navigable via Arrow & Tab keys) | **PASS** (Slot buttons & CTA buttons labeled) | **PASS** (Booking modal traps focus & Esc closes) | **PASS** (Single H1) | None |
| **Hospital Profile (`/[locale]/hospitals/[slug]`)** | **PASS** (Doctors grid & offers list navigable) | **PASS** (Action buttons labeled) | N/A | **PASS** (Single H1) | None |
| **Case Room (`/[locale]/cases/[id]`)** | **PASS** (Message input & send button navigable) | **PASS** (Send, upload, & status update inputs labeled) | N/A | **PASS** (Single H1) | None |
| **Doctor Dashboard (`/[locale]/dashboard/doctor`)** | **PASS** (Tab navigation across overview/cases/schedule) | **PASS** (Schedule inputs & leave date inputs labeled) | **PASS** (Reschedule modal traps focus & Esc closes) | **PASS** (Single H1) | None |
| **Hospital Dashboard (`/[locale]/dashboard/hospital`)** | **PASS** (Tabs & stat update inputs navigable) | **PASS** (Beds & surgery count inputs labeled) | N/A | **PASS** (Single H1) | None |
| **Admin Dashboard (`/[locale]/dashboard/admin`)** | **PASS** (Tab navigation across 9 admin sections) | **PASS** (Filter inputs, search, & status selects labeled) | **PASS** (Audit log modal & reset modal trap focus) | **PASS** (Single H1) | None |

---

## ♿ WCAG 2.1 AA Criteria Checklist Summary

1. **Perceivable**: Text contrast ratio >= 4.5:1, status badges feature text + color + distinct icon.
2. **Operable**: Full keyboard accessibility, visible focus indicators (`focus:ring-2 focus:ring-teal-500`), modal focus traps, Escape key closure handlers.
3. **Understandable**: Native RTL/LTR support via `dir="rtl"` / `dir="ltr"`, clear error messages, bilingual labels.
4. **Robust**: Semantic HTML5 elements (`main`, `nav`, `header`, `footer`, `section`, `article`).
