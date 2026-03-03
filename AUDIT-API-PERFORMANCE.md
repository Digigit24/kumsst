# Performance & API Efficiency Audit Report

**Date**: 2026-02-14
**Scope**: `src/pages/` and `src/hooks/` directories

---

## CRITICAL: Dual Hook System

**`src/hooks/useAcademic.ts`** (old, zero caching) vs **`src/hooks/useAcademicSWR.ts`** (new, SWR cached)

15+ pages still use the old system. Every page mount fires fresh API calls with no deduplication or caching. Migrating all consumers to SWR hooks is the **single highest-impact optimization** (~30-50% reduction in API calls).

---

## Category 1: Client-Side Filtering Opportunities

| # | File | Lines | Issue | Fix |
|---|------|-------|-------|-----|
| 1.1 | `src/pages/attendance/StudentAttendancePage.tsx` | 106-110 | `useSections({class_obj})` refetches on every class change | Use `useSectionsFilteredByClass()` |
| 1.2 | `src/pages/attendance/TeacherAttendanceMarkingPage.tsx` | 88-92 | Same server-side section filtering | Use `useSectionsFilteredByClass()` |
| 1.3 | `src/pages/teachers/homework/TeacherHomeworkSubmissionsPage.tsx` | 25-27 | Uses old uncached hooks for dropdown data | Switch to SWR equivalents |
| 1.4 | `src/pages/exams/MarkingPage.tsx` + `MarksRegistersPage.tsx` | 25-28 | `useSubjects/useSections({page_size:1000})` uncached | Switch to `useSubjectsSWR()`/`useAllSectionsSWR()` |
| 1.5 | `src/pages/exams/ExamSchedulesPage.tsx` | 54-63 | Stats computed from paginated subset (misleading) | Add server-side `/stats/` endpoint |

## Category 2: Request Waterfalls

| # | File | Lines | Issue | Fix |
|---|------|-------|-------|-----|
| 2.1 | `src/pages/academic/components/SubjectAssignmentForm.tsx` | 63-123 | `fetchFormData()` → wait → then fetch sections | Use SWR hooks for parallel cache hits |
| 2.2 | `src/pages/attendance/StudentAttendancePage.tsx` | 87-123 | 6 hooks with mixed old/new caching, chained section fetch | Migrate all to SWR equivalents |
| 2.3 | `src/pages/exams/MarkingPage.tsx` | 20-48 | Fetches 1000 student marks to compute per-register stats | Add `marked_count` to register API |
| 2.4 | `src/pages/exams/MarksEntryPage.tsx` | 24-28 | 3 separate fetches for name lookups | Embed names in marks API response |
| 2.5 | `src/pages/teachers/homework/TeacherHomeworkSubmissionsPage.tsx` | 25-57 | Uncached filter hooks + separate data fetch | Switch to SWR equivalents |

## Category 3: N+1 Fetching

| # | File | Lines | Issue | Fix |
|---|------|-------|-------|-----|
| 3.1 | `src/pages/hostel/components/RoomGrid.tsx` | — | Potential per-room bed fetch in grid | Bulk fetch beds or embed in room response |
| 3.2 | `src/pages/hostel/AllocationsPage.tsx` | 34-35 | Separate hostels fetch for dropdown when names exist in allocations | Embed `hostel_name` in allocation response |

## Category 4: Redundant / Duplicate Hooks

| # | File | Lines | Issue | Fix |
|---|------|-------|-------|-----|
| 4.1 | `useAcademic.ts` vs `useAcademicSWR.ts` | All | **CRITICAL** — Two parallel hook systems, 15+ pages use old uncached one | Migrate all to SWR, delete old file |
| 4.2 | `useExamination.ts` vs `useExaminationSWR.ts` | All | Same dual-system problem for exam hooks | Consolidate to SWR system |
| 4.3 | `src/pages/fees/FeeCollectionPage.tsx` | 31, 106 | Two `useFeeCollectionsSWR` calls with different `page_size` (no dedup) | Add `/stats/` endpoint |
| 4.4 | `FeeCollectionPage.tsx` vs `FeeCollectionsPage.tsx` | All | Two 95%-identical page files | Consolidate into single component |
| 4.5 | `MarkingPage.tsx` + `MarksRegistersPage.tsx` | 20-50 | Both build identical `examMap/subjectMap/sectionMap` lookups | Create shared `useExamLookups()` hook |
| 4.6 | `src/pages/exams/MarksEntryPage.tsx` | 27-43 | Fetches 1000 students + 1000 registers just for name lookup | Embed names in API response |
| 4.7 | `src/pages/exams/forms/StudentMarksForm.tsx` | 49 | `useMarksRegisters({page_size:100})` duplicates parent's call | Pass data as prop from parent |
| 4.8 | `TeacherAttendanceMarkingPage` vs `StudentAttendancePage` | Various | Near-identical hook calls, no shared cache | Extract shared `useAttendanceFilters()` |

## Category 5: Unused / Wasteful Data Fetching

| # | File | Lines | Issue | Fix |
|---|------|-------|-------|-----|
| **5.1** | `src/pages/teachers/homework/TeacherHomeworkSubmissionsPage.tsx` | **25-27** | **3 hooks called, data NEVER used** | **Remove all 3 hooks** |
| 5.2 | `src/pages/fees/FeeCollectionPage.tsx` | 31-39 | Fetches 1000 records to compute 2 numbers | Add `/fee-collections/stats/` endpoint |
| 5.3 | `src/pages/exams/MarkingPage.tsx` | 21, 60-63 | Fetches 1000 student marks for per-register count | Add `marked_count` to register response |
| 5.4 | `src/pages/exams/MarksRegistersPage.tsx` | 26-28 | 3 x `page_size:1000` fetches for name lookups | Embed names in register API |
| 5.5 | `src/pages/exams/ExamSchedulesPage.tsx` | 66-73 | Chart renders hardcoded mock data, ignores fetched data | Compute chart from real data |
| 5.6 | `src/pages/exams/ExamSchedulesPage.tsx` | 54-63 | Stats reflect only current page, not full dataset | Use aggregate stats from API |

---

## Top 5 Quick Wins

1. **Remove 3 dead hooks** in `TeacherHomeworkSubmissionsPage.tsx:25-27` — eliminates 3 wasted API calls
2. **Migrate `useAcademic.ts` → `useAcademicSWR.ts`** across 15+ pages — eliminates 30-50% of redundant calls
3. **Embed display names** in marks/register API responses — eliminates 4-6 `page_size:1000` lookup calls per page
4. **Add server-side stats endpoints** — eliminates fetching 1000+ records for aggregate counts
5. **Merge `FeeCollectionPage.tsx` and `FeeCollectionsPage.tsx`** — removes a fully duplicated page

## Estimated Total Impact

- **50-60% reduction** in API calls across the application
- **70-80% reduction** in bandwidth for large list pages
- Significantly faster page loads, especially on slow networks
- Reduced server load and better scalability
