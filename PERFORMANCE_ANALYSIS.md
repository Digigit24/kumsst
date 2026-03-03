# 🔍 KUMSS ERP — Performance & API Usage Analysis

> **Generated:** 2026-02-15  
> **Scope:** Full frontend codebase (`src/`) — hooks, services, pages, providers, contexts  
> **Stack:** React 18 + Vite + TypeScript + SWR + React Query + Axios + Zustand + TailwindCSS

---

## 📋 Executive Summary — Top 5 Critical Issues

| # | Issue | Severity | Est. Impact |
|---|-------|----------|-------------|
| 1 | **Dual Data-Fetching Systems (SWR + React Query)** running side-by-side cause cache fragmentation, doubled memory, and conflicting revalidation. | 🔴 Critical | High — affects every page |
| 2 | **~42 "legacy" hooks with `useState`/`useEffect` patterns** that bypass both caching layers entirely — every mount = fresh API call. | 🔴 Critical | High — multiplied network requests |
| 3 | **Console logging in EVERY API request** (5 `console.log` calls in the Axios request interceptor) degrades performance in production. | 🟡 High | Medium — affects all requests |
| 4 | **`JSON.stringify(filters)` in useEffect deps** across 40+ hooks causes re-renders on every render cycle if filters object isn't referentially stable. | 🟡 High | Medium — unnecessary API calls |
| 5 | **Chat polling every 3 seconds** (`refetchInterval: 3000`) even when the chat page is open but idle, wastes bandwidth and battery. | 🟠 Medium | Medium — continuous network traffic |

---

## 1. 🌐 API Call Analysis

### 1.1 Dual Data-Fetching Systems (SWR + React Query)

**Files:** `package.json`, `App.tsx`, across hooks directory  
**Lines:** `package.json:29` (`@tanstack/react-query`), `package.json:46` (`swr`)

Your project uses **both** SWR `v2.3.8` **and** React Query `v5.90.12` simultaneously:

```
App.tsx (line 11):  import { SWRProvider } from "./providers/SWRProvider";
App.tsx (line 12):  // React Query's QueryClientProvider is inside lib/react-query
```

**Current mixed usage pattern:**
| Library | Used By | Hook Files |
|---------|---------|------------|
| SWR | Academic, Attendance, Students, Store, Fees, Accounts, HR, Hostel, Library, Approvals, Teachers | `*SWR.ts` hooks (~12 files) |
| React Query | Communication, Store Indents, Material Issues, Context Selectors | `useCommunication.ts`, `useStoreIndents.ts`, `useMaterialIssues.ts`, `useContextSelectors.ts` |
| Neither (raw `useEffect`) | Academic (legacy), Students (legacy), Accounts (legacy), Core (legacy), Teachers (legacy) | `useAcademic.ts`, `useStudents.ts`, `useAccounts.ts`, `useCore.ts`, `useTeachers.ts` |

**Why this is a problem:**
- **Cache fragmentation:** SWR and React Query maintain *separate* caches. The same data (e.g., `teachers`) may be cached in React Query by `useModulePrefetcher` and in SWR by `useTeachersSWR` — never sharing.
- **Double memory usage:** Two cache stores in memory at all times.
- **Dashboard refresh is confused:** `Dashboard.tsx` line 34 revalidates ALL SWR caches AND invalidates ALL React Query caches:

```tsx
// Dashboard.tsx, lines 33-36
await mutate(() => true, undefined, { revalidate: true }); // SWR
await queryClient.invalidateQueries(); // React Query — EVERYTHING
```

**Recommendation:**
Pick **one** library and migrate fully. React Query is the more mature choice with better devtools, but SWR is already more widely used in your codebase. Either works — the key is consolidation.

**Expected improvement:** ~30% reduction in memory, elimination of conflicting cache states.

---

### 1.2 Legacy Hooks Without Any Caching (40+ Hooks)

**Files:** `useAcademic.ts` (853 lines), `useStudents.ts` (1405 lines), `useAccounts.ts`, `useCore.ts`, `useTeachers.ts`  
**Pattern found 42 times** across these files.

These hooks use raw `useState`/`useEffect`/`JSON.stringify(filters)` — no SWR, no React Query:

```typescript
// useAcademic.ts, lines 76-100 (repeated 14x in this file alone)
export const useFaculties = (filters?: FacultyFilters) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const result = await facultyApi.list(filters);
      setData(result);
    } catch (err) { setError(err.message); }
    finally { setIsLoading(false); }
  };

  useEffect(() => {
    fetchData();
  }, [JSON.stringify(filters)]); // ⚠️ Problem #1: JSON.stringify in deps

  return { data, isLoading, error, refetch: fetchData };
};
```

**Problems:**
1. **No caching** — every component mount triggers a fresh API call
2. **No deduplication** — 3 components using `useFaculties()` = 3 simultaneous API calls
3. **No stale-while-revalidate** — loading spinner on every mount
4. **`JSON.stringify(filters)` in deps** — if the consumer doesn't memoize the filters object, a new serialized string is created every render, triggering infinite re-fetches

**Where this pattern exists (42 instances):**

| File | Count | Size |
|------|-------|------|
| `useAcademic.ts` | 14 list hooks | 27 KB |
| `useStudents.ts` | 12 list hooks | 47 KB |
| `useAccounts.ts` | 5 list hooks | 8 KB |
| `useCore.ts` | 6 list hooks | 25 KB |
| `useTeachers.ts` | 4 list hooks | 9 KB |
| `useFinance.ts` | 1 list hook | 1.2 KB |

**Note:** You already have SWR equivalents (`useAcademicSWR.ts`, `useStudentsSWR.ts`, etc.) that fix these problems. The legacy hooks appear to still be imported in some pages.

**Recommendation:**
Migrate remaining consumers of legacy hooks to their SWR counterparts, then delete the legacy files. This will eliminate ~116 KB of redundant code.

**Expected improvement:** 50-70% reduction in API calls for pages using dropdown data.

---

### 1.3 Pages Making the Most API Requests

Based on hook usage analysis:

| Page | Estimated API Calls on Mount | Issues |
|------|------|--------|
| `StudentAttendancePage.tsx` | 6-7 | Students, Programs, Subjects, Classes, Sections, Existing Attendance, Permissions |
| `StudentCreationPipeline.tsx` | 5-8 | Classes, Sections, Programs, Categories, Subjects, + cascading fetches (6 useEffects) |
| `Dashboard.tsx` | 3-10+ | Variable by role; refreshes invalidate ALL caches |
| `GuardianForm.tsx` | 4-5 | Students, Guardians, cascading lookups (5 useEffects) |
| `TeacherHomeworkForm.tsx` | 4 | Classes, Sections, Subjects, Students |

**`StudentAttendancePage.tsx` deep-dive (lines 86-118):**
```tsx
// 6 SWR hooks on a single page — all fire on mount:
const { data } = useStudentsSWR({ ...filters });           // 1
const { data: programsData } = useProgramsSWR({...});      // 2
const { data: subjectsData } = useSubjectsSWR({...});      // 3
const { data: classesData } = useClassesSWR({...});        // 4
const { results: filteredSections } = useSectionsFilteredByClass(); // 5 (cached)
const { data: existingAttendanceData } = useStudentAttendanceSWR({...}); // 6
```

This is actually well-designed (SWR handles deduplication), but if the same page also imports legacy hooks elsewhere, the benefits are lost.

---

### 1.4 Missing Request Deduplication

**In apiClient.ts** there is no request deduplication at the Axios level. While SWR/React Query handle this for their managed hooks, any direct `apiClient.get()` calls bypass deduplication.

**Files affected:** Any page directly importing from `services/*.service.ts` and calling methods manually (not through hooks).

---

## 2. 🗃️ SWR / Data Fetching Issues

### 2.1 SWR Cache Keys Are Well-Designed ✅

The `generateCacheKey` function in `useSWR.ts` (lines 79-102) properly:
- Sorts filter keys for deterministic serialization
- Strips `undefined`, `null`, and empty string values
- Returns `null` to prevent fetching (conditional fetching)

**This is correct and well-implemented.**

### 2.2 SWR Provider Configuration is Good ✅

`SWRProvider.tsx` has sensible defaults:
- 10-minute deduplication interval
- Focus/reconnect revalidation disabled
- keepPreviousData enabled for smooth UX
- 3 error retries

### 2.3 Cache Invalidation Could Be More Surgical

**File:** `Dashboard.tsx`, line 34

```tsx
await mutate(() => true, undefined, { revalidate: true });
```

This revalidates **every single SWR cache key** in the application. On a dashboard with 10+ sections, this triggers a cascade of API calls.

**Recommendation:** Only invalidate dashboard-specific keys:
```tsx
// Instead of revalidating everything:
await invalidateCaches(['dashboard-stats', 'recent-activities', 'attendance-summary']);
```

### 2.4 `useAllSectionsSWR` Has a Hard-Coded Page Size Limit

**File:** `useAcademicSWR.ts`, lines 188-194

```typescript
export const useAllSectionsSWR = (): UseSWRPaginatedResult<Section> => {
  return useSWRPaginated(
    generateCacheKey(swrKeys.sections, { is_active: true, page_size: 15 }),
    () => sectionApi.list({ is_active: true, page_size: 15 }),  // ⚠️ Only 15 sections
    staticDataSwrConfig
  );
};
```

If a college has more than 15 sections, this silently truncates the data. The hook is named "useAll" but doesn't fetch all.

**Recommendation:** Use `page_size: 200` or implement pagination-until-exhausted logic.

---

## 3. ⚡ Performance Bottlenecks

### 3.1 Console Logging in Every API Request (Production)

**File:** `src/api/apiClient.ts`, lines 51-67

```typescript
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    console.log("[apiClient] Request interceptor - Token:", token ? "Found" : "Missing"); // ⚠️
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("[apiClient] Added Authorization header to request"); // ⚠️
    }
    const collegeId = getCollegeId();
    config.headers['X-College-ID'] = collegeId;
    console.log("[apiClient] Added X-College-ID header:", collegeId); // ⚠️
    console.log("[apiClient] Final request headers:", config.headers);  // ⚠️ LOGS FULL HEADERS
    return config;
  }
);
```

**5 `console.log` calls per API request.** If a page makes 6 API calls, that's 30 console.log statements. The `config.headers` log especially is expensive as it serializes the entire headers object.

**Total console.log statements found in production code:** 180+ across the codebase.

**Recommendation:**
```typescript
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.headers['X-College-ID'] = getCollegeId();
  return config;
});
```

**Expected improvement:** Noticeable speedup in request processing, especially on slower devices.

### 3.2 `JSON.stringify(filters)` in useEffect Dependencies

**Files:** 40+ occurrences across `useAcademic.ts`, `useStudents.ts`, `useAccounts.ts`, `useCore.ts`, `useTeachers.ts`

```typescript
useEffect(() => {
  fetchData();
}, [JSON.stringify(filters)]); // ⚠️ Runs JSON.stringify on EVERY render
```

**Why this is problematic:**
1. `JSON.stringify` runs on every render cycle (not just when filters change)
2. If the parent passes an inline object `{ page: 1 }`, a new object reference is created each render
3. React compares the serialized strings — if they match, the effect doesn't re-run, but the serialization cost is still paid

**Recommendation:** Use `useMemo` to stabilize filter objects, or migrate to SWR/React Query hooks which handle key serialization properly.

### 3.3 `optimizeDeps.force: true` in Vite Config

**File:** `vite.config.ts`, line 14

```typescript
optimizeDeps: {
  force: true,  // ⚠️ Forces re-optimization on every dev server start
},
```

This forces Vite to re-bundle all dependencies every time the dev server starts, adding 5-15 seconds to startup time.

**Recommendation:** Remove `force: true`. Only use it temporarily when debugging dependency issues.

### 3.4 No Code Splitting Configuration

**File:** `vite.config.ts`

The Vite config has no `build.rollupOptions.output.manualChunks` configuration. The entire app bundles into a few large chunks. Based on the conversation history, you've already received a "Large Chunk Warning" from Vite.

**Recommendation:**
```typescript
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        vendor: ['react', 'react-dom', 'react-router-dom'],
        ui: ['@radix-ui/react-dialog', '@radix-ui/react-select', '@radix-ui/react-popover'],
        charts: ['recharts'],
        forms: ['react-hook-form', '@hookform/resolvers', 'zod'],
        data: ['swr', '@tanstack/react-query', 'axios'],
        mui: ['@mui/material', '@mui/icons-material'],
      },
    },
  },
},
```

### 3.5 Heavy Libraries Imported Globally

**File:** `package.json`

| Library | Size (approx.) | Usage |
|---------|---------------|-------|
| `@mui/material` + `@mui/icons-material` | ~300-500KB | Likely only used in a few places (you mainly use Radix UI) |
| `recharts` | ~200KB | Only on dashboard/reports |
| `framer-motion` | ~100KB | Animation framework |
| `hls.js` | ~70KB | Video streaming — only used on login page? |

**Recommendation:** Ensure these are only imported in lazy-loaded routes. If `@mui/material` is only used in 1-2 pages, consider replacing with Radix equivalents to eliminate the dependency entirely.

### 3.6 No React.memo / useMemo on Expensive Renders

**File:** `StudentAttendancePage.tsx`, lines 306-418

The `columns` array containing render functions is recreated on every render. Each column's `render` function creates new JSX on every render cycle.

```tsx
// Recreated every render:
const columns: Column<StudentListItem>[] = [
  {
    key: 'attendance_action',
    render: (student) => { /* expensive JSX */ },
  },
  // ...
];
```

**Recommendation:** Wrap with `useMemo`:
```tsx
const columns = useMemo(() => [/* ... */], [attendanceMap, lockedStudents]);
```

---

## 4. 🐛 Code Quality Issues

### 4.1 SuperAdminContext Reads localStorage on Every Render

**File:** `src/contexts/SuperAdminContext.tsx`, lines 99-118

```typescript
export const useActiveCollegeId = (): number | null => {
  const { selectedCollege, isSuperAdminUser } = useSuperAdminContext();

  if (!isSuperAdminUser) {
    try {
      const storedUser = localStorage.getItem('kumss_user'); // ⚠️ Every render
      if (storedUser) {
        const user = JSON.parse(storedUser); // ⚠️ Parse JSON every render
        return user.college || null;
      }
    } catch (error) { /* ... */ }
    return null;
  }
  return selectedCollege;
};
```

**Problem:** This hook is called by many components. Every render of every component using `useActiveCollegeId()` triggers `localStorage.getItem()` and `JSON.parse()` for non-super-admin users.

**Recommendation:** Compute this once in the provider and store in context state.

### 4.2 Debug Console Logs Left in Production Code

**Files:** Multiple — 180+ `console.log` statements found

Key offenders:
| File | Count | Severity |
|------|-------|----------|
| `apiClient.ts` | 5 | 🔴 Every request |
| `useLongPolling.ts` | 15+ | 🔴 Continuous polling |
| `useStoreIndents.ts` | 4 | 🟡 On mutations |
| `HierarchicalContext.tsx` | 2 | 🟡 On selection change |
| `useLogin.ts` | 2 | 🟡 Logs credentials/permissions |
| `TeacherAttendanceMarkingPage.tsx` | 5+ | 🟡 Debug data |
| `store/auth.ts` | 3 | 🟡 Auth state changes |
| `useModulePrefetcher.ts` | 1 | 🟢 On prefetch |

**Recommendation:** Use conditional logging:
```typescript
const isDev = import.meta.env.DEV;
if (isDev) console.log('...');
```

Or better, remove all debug logs and use React DevTools / Network tab for debugging.

### 4.3 Chat Polling at 3-Second Intervals

**File:** `useCommunication.ts`, lines 284-291

```typescript
export const useConversation = (otherUserId, limit = 50) => {
  return useQuery({
    queryKey: [...chatKeys.all, "conversation", otherUserId],
    queryFn: () => chatsApi.getConversation(otherUserId!, limit),
    enabled: !!otherUserId,
    refetchInterval: 3000, // ⚠️ Every 3 seconds!
    refetchIntervalInBackground: false,
  });
};
```

**Problem:** Makes an API call every 3 seconds while viewing a conversation. With the WebSocket infrastructure already in place (`WS_CHAT_URL` in config + `ChatContext.tsx`), this polling is redundant.

**Recommendation:** Use WebSocket for real-time updates, or increase poll interval to 10-15 seconds. Add `refetchIntervalInBackground: false` (already set) and consider pausing when the chat panel is minimized.

### 4.4 Potential Memory Leak in `useLongPolling`

**File:** `useLongPolling.ts`, lines 100-223

The long polling hook has extensive logging and complex abort controller management. If the effect cleanup doesn't properly abort the in-flight request, the component will attempt to set state after unmounting.

The implementation looks mostly correct with `AbortController`, but the 15+ console.log statements in the polling loop will slow down the event loop, especially on mobile devices.

### 4.5 Missing Error Boundaries on Data-Heavy Pages

While there's a global `ErrorBoundary` in `App.tsx`, individual data-heavy pages like `StudentAttendancePage` and `Dashboard` don't have granular error boundaries. A single failed API call crashes the entire page instead of just the affected section.

### 4.6 `TestLongPolling.tsx` in Production Bundle

**File:** `src/TestLongPolling.tsx` (2,494 bytes)

This test file is in the `src/` root and will be included in the production build if imported anywhere.

**Recommendation:** Move to a `__tests__/` directory or delete if no longer needed.

---

## 5. 🚀 Optimization Opportunities

### 5.1 Request Batching

**Opportunity:** Multiple independent API calls that fire simultaneously on page mount could be batched.

**Example in `StudentAttendancePage.tsx`:**
```tsx
// These 4 parallel calls could be batched into one endpoint:
useProgramsSWR({ page_size: DROPDOWN_PAGE_SIZE, is_active: true });
useSubjectsSWR({ page_size: DROPDOWN_PAGE_SIZE, is_active: true, class_obj: ... });
useClassesSWR({ page_size: DROPDOWN_PAGE_SIZE, is_active: true });
useStudentAttendanceSWR({ ... });
```

**Backend change:** Create a `/api/v1/attendance/page-init/` endpoint that returns programs, subjects, classes, and existing attendance in one response.

### 5.2 Lazy Loading (Already Partially Implemented ✅)

**Current state:** Routes use `React.lazy()` properly in `routes.tsx`. The `Dashboard.tsx` uses `LazySection` for below-fold sections.

**Missing:**
- Heavy components within pages (e.g., chart components in reports) are not lazy-loaded
- The `@mui/material` and `@mui/icons-material` imports should use named imports with lazy loading

### 5.3 Code Splitting Additions

**Current route-level splitting:** ✅ Good — all routes use `lazy()`

**Missing module-level splitting:**
- `api.config.ts` (1593 lines, 68KB) is imported by every service file. Consider splitting by module.
- `useStudents.ts` (1405 lines, 47KB) contains hooks for 12 different entities. Split into per-entity files.

### 5.4 Memoization Opportunities

| Component/Hook | What to Memoize | Tool |
|----------------|-----------------|------|
| `StudentAttendancePage` columns array | `columns` | `useMemo` |
| `StudentAttendancePage` handlers | `handleMarkPresent`, `handleMarkAbsent` | `useCallback` |
| `DataTable` component | The entire component | `React.memo` |
| Context providers' value objects | Provider `value` prop | `useMemo` |
| `HierarchicalContext` combined hook | All spread context values | `useMemo` |

**Example fix for context providers:**
```tsx
// HierarchicalContext.tsx — Current (creates new value object every render):
<CollegeContext.Provider value={{
  selectedCollege,
  setSelectedCollege,
  colleges,
  setColleges,
  isLoadingColleges,
  setIsLoadingColleges,
}}>

// Fixed:
const value = useMemo(() => ({
  selectedCollege, setSelectedCollege,
  colleges, setColleges,
  isLoadingColleges, setIsLoadingColleges,
}), [selectedCollege, colleges, isLoadingColleges]);

<CollegeContext.Provider value={value}>
```

### 5.5 Debouncing/Throttling

**Already implemented:** `useDebounce.ts` exists (6.8KB) ✅

**Missing usage in:**
- Search inputs in `DataTable` (unclear if debounced at the component level)
- Filter changes in attendance and student pages — changing class triggers immediate API calls
- `sessionStorage.setItem` calls in `StudentAttendancePage` (fires on every state change)

### 5.6 Module Prefetcher is Incomplete

**File:** `useModulePrefetcher.ts`

Only 3 modules are covered: `store`, `hr`, `library`. The following high-traffic modules are missing:

| Module | Status |
|--------|--------|
| `academic` | ❌ Not prefetched |
| `students` | ❌ Not prefetched |
| `attendance` | ❌ Not prefetched |
| `fees` | ❌ Not prefetched |
| `examinations` | ❌ Not prefetched |

### 5.7 Background Data Fetching for Dropdown Data

**Already good:** SWR hooks with `keepPreviousData: true` and `revalidateIfStale: true` provide stale-while-revalidate behavior.

**Improvement:** The `DataPrefetcher` and `ModuleDataPrefetcher` components in `App.tsx` could be expanded to pre-warm commonly needed data (colleges, classes, sections) immediately after login.

---

## 6. 📊 Priority Matrix

| Issue | Impact | Effort | Priority |
|-------|--------|--------|----------|
| Remove console.logs from apiClient.ts | 🟢 High | 🟢 5 min | **P0 — Do Now** |
| Remove `optimizeDeps.force` | 🟢 Medium | 🟢 1 min | **P0 — Do Now** |
| Add manual chunks to Vite config | 🟢 High | 🟢 10 min | **P0 — Do Now** |
| Memoize context provider values | 🟡 Medium | 🟢 30 min | **P1 — Quick Win** |
| Fix `useAllSectionsSWR` page_size=15 | 🟡 Medium | 🟢 2 min | **P1 — Quick Win** |
| Reduce chat polling to 10-15s | 🟡 Medium | 🟢 2 min | **P1 — Quick Win** |
| Consolidate to one data-fetching library | 🔴 High | 🔴 2-3 days | **P2 — Plan** |
| Migrate all legacy hooks to SWR | 🔴 High | 🟡 1-2 days | **P2 — Plan** |
| Delete legacy hook files after migration | 🟢 Medium | 🟢 30 min | **P2 — After migration** |
| Add manual chunking for MUI/Recharts | 🟡 Medium | 🟡 1 hour | **P2 — Plan** |
| Expand module prefetcher | 🟢 Low | 🟡 1 hour | **P3 — Nice to Have** |
| Add per-section error boundaries | 🟢 Low | 🟡 2 hours | **P3 — Nice to Have** |
| Create batched API endpoints | 🟡 Medium | 🔴 Backend work | **P3 — Future** |

---

## 7. ✅ Action Items — Specific Code Changes

### Quick Win #1: Clean Up apiClient.ts (5 minutes)

**File:** `src/api/apiClient.ts`

```typescript
// BEFORE (lines 46-73):
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    console.log("[apiClient] Request interceptor - Token:", token ? "Found" : "Missing");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("[apiClient] Added Authorization header to request");
    } else {
      console.warn("[apiClient] No token found in localStorage");
    }
    const collegeId = getCollegeId();
    config.headers['X-College-ID'] = collegeId;
    console.log("[apiClient] Added X-College-ID header:", collegeId);
    console.log("[apiClient] Final request headers:", config.headers);
    return config;
  },
  (error) => Promise.reject(error)
);

// AFTER:
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.headers['X-College-ID'] = getCollegeId();
    return config;
  },
  (error) => Promise.reject(error)
);
```

### Quick Win #2: Remove Vite Force Optimization (1 minute)

**File:** `vite.config.ts`

```typescript
// BEFORE:
optimizeDeps: {
  force: true,
},

// AFTER — remove the entire block, or:
optimizeDeps: {
  // force: true, // Only enable temporarily for debugging
},
```

### Quick Win #3: Add Bundle Splitting (10 minutes)

**File:** `vite.config.ts`

```typescript
export default defineConfig({
  plugins: [react()],
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-select',
            '@radix-ui/react-popover',
            '@radix-ui/react-dropdown-menu',
          ],
          'vendor-charts': ['recharts'],
          'vendor-forms': ['react-hook-form', '@hookform/resolvers', 'zod'],
          'vendor-data': ['swr', '@tanstack/react-query', 'axios'],
          'vendor-motion': ['framer-motion'],
        },
      },
    },
  },
  server: { port: 3030 /* ... proxies ... */ },
});
```

### Quick Win #4: Fix Section Page Size (2 minutes)

**File:** `src/hooks/useAcademicSWR.ts`, line 190

```typescript
// BEFORE:
generateCacheKey(swrKeys.sections, { is_active: true, page_size: 15 }),
() => sectionApi.list({ is_active: true, page_size: 15 }),

// AFTER:
generateCacheKey(swrKeys.sections, { is_active: true, page_size: 200 }),
() => sectionApi.list({ is_active: true, page_size: 200 }),
```

### Quick Win #5: Reduce Chat Polling (2 minutes)

**File:** `src/hooks/useCommunication.ts`, line 289

```typescript
// BEFORE:
refetchInterval: 3000, // Every 3 seconds

// AFTER:
refetchInterval: 15000, // Every 15 seconds (or remove if WebSocket works)
```

### Quick Win #6: Memoize Context Provider Values (30 minutes)

**File:** `src/contexts/HierarchicalContext.tsx`

Add `useMemo` for all three providers' value props. Example for CollegeProvider:

```typescript
// BEFORE (line 82-93):
<CollegeContext.Provider value={{
  selectedCollege, setSelectedCollege,
  colleges, setColleges,
  isLoadingColleges, setIsLoadingColleges,
}}>

// AFTER:
const value = useMemo(() => ({
  selectedCollege, setSelectedCollege,
  colleges, setColleges,
  isLoadingColleges, setIsLoadingColleges,
}), [selectedCollege, setSelectedCollege, colleges, setColleges, isLoadingColleges, setIsLoadingColleges]);

<CollegeContext.Provider value={value}>
```

Repeat for `ClassProvider` and `SectionProvider`.

---

## 8. 🏆 Summary of What's Working Well

| Area | Status | Details |
|------|--------|---------|
| Route-level code splitting | ✅ Excellent | All routes use `React.lazy()` |
| SWR cache key generation | ✅ Well-designed | Deterministic, sorted, null-safe |
| SWR global configuration | ✅ Sensible | Good dedup, stale-while-revalidate |
| Client-side section filtering | ✅ Smart | `useSectionsFilteredByClass` avoids per-class API calls |
| Dashboard lazy sections | ✅ Good | `LazySection` with `IntersectionObserver` |
| Module prefetching concept | ✅ Good idea | `useModulePrefetcher` — just needs more modules |
| Error retry configuration | ✅ Good | 3 retries with 5s interval |
| Auth failure handling | ✅ Robust | Interceptor catches 401/403 and redirects |

---

## 9. 📁 Files Referenced in This Report

| File | Size | Key Issues |
|------|------|------------|
| `src/api/apiClient.ts` | 3.3 KB | Console logs in interceptor |
| `src/providers/SWRProvider.tsx` | 2.4 KB | Good config ✅ |
| `src/hooks/useSWR.ts` | 8.7 KB | Well-designed base hooks ✅ |
| `src/hooks/useAcademic.ts` | 27 KB | Legacy hooks, no caching |
| `src/hooks/useAcademicSWR.ts` | 13.5 KB | Proper SWR hooks ✅ |
| `src/hooks/useStudents.ts` | 47 KB | Legacy hooks, no caching |
| `src/hooks/useCommunication.ts` | 29 KB | 3s polling interval |
| `src/hooks/useModulePrefetcher.ts` | 3.3 KB | Only 3 modules covered |
| `src/hooks/useContextSelectors.ts` | 5.5 KB | React Query (mixed system) |
| `src/contexts/HierarchicalContext.tsx` | 10.2 KB | Debug logs, unmemoized values |
| `src/contexts/SuperAdminContext.tsx` | 3.5 KB | localStorage on every render |
| `src/pages/Dashboard.tsx` | 4.6 KB | Nuclear cache invalidation |
| `src/pages/attendance/StudentAttendancePage.tsx` | 26.5 KB | 6 API calls, unmemoized columns |
| `src/config/api.config.ts` | 68.2 KB | 1593 lines — consider splitting |
| `vite.config.ts` | 725 B | force: true, no chunking |
| `package.json` | 2.2 KB | Dual data-fetching libs |

---

*End of Initial Performance Analysis Report*

---
---

# Claude Analyze: Deep Performance & API Usage Audit

> **Generated:** 2026-02-15
> **Scope:** Full codebase deep-dive — 28 service files, 52+ hooks, 200+ pages, 6 contexts, all providers
> **Method:** Static analysis of every hook, service, context, and high-traffic page file

---

## 1. Executive Summary — Top 5 Critical Issues

| # | Issue | Severity | Files Affected | Est. Daily Impact |
|---|-------|----------|----------------|-------------------|
| 1 | **42 legacy hooks use `useState`/`useEffect`/`JSON.stringify(filters)`** — no caching, no deduplication, race conditions on every mount | CRITICAL | 6 hook files, 42 instances | Hundreds of redundant API calls/user/day |
| 2 | **N+1 query pattern in `useHR.ts`** — fetches ALL teachers alongside every leave/salary query | CRITICAL | `useHR.ts` lines 223, 416, 519 | 3x redundant full-teacher-list fetches per HR page |
| 3 | **5 context providers pass unmemoized value objects** — every parent render re-renders all consumers app-wide | CRITICAL | PermissionsContext, LoadingContext, ThemeContext, ChatContext, SettingsProvider | Cascading re-renders on every state change |
| 4 | **474 `console.log/warn/error` statements** remain in production code across 166 files, including credential logging | HIGH | 166 files | Slower request processing, security risk |
| 5 | **Duplicate service endpoints** — `feeCollections`, `feeFines`, `libraryFines` defined in both `accountant.service.ts` and their primary services with different base paths | HIGH | 3 service pairs | Cache fragmentation, potential stale data |

---

## 2. Detailed Findings

### 2.1 API Call Analysis

#### 2.1.1 Total API Surface

| Metric | Count |
|--------|-------|
| Service files | 28 |
| Sub-API objects | ~160 |
| Total API methods | ~700+ |
| Unique base paths | 12 (`/api/v1/academic/`, `/api/v1/fees/`, etc.) |
| Hooks using SWR | ~12 files |
| Hooks using React Query | ~15 files |
| Hooks using raw useState/useEffect | ~6 files (42 instances) |

#### 2.1.2 Duplicate API Endpoints

These endpoints are defined in **two different service files** with different base paths:

| Endpoint | File 1 | File 2 | Risk |
|----------|--------|--------|------|
| Fee Collections | `accountant.service.ts` → `/fees/fee-collections/` | `fees.service.ts` → `/api/v1/fees/fee-collections/` | Different paths may hit different backends or bypass middleware |
| Fee Fines | `accountant.service.ts` → `/fees/fee-fines/` | `fees.service.ts` → `/api/v1/fees/fee-fines/` | Same data, two cache entries |
| Library Fines | `accountant.service.ts` → `/library/library-fines/` | `library.service.ts` → `/api/v1/library/...` | Inconsistent base paths |

**Fix:** Consolidate into single service per entity. Import from the canonical service in `accountant.service.ts`.

#### 2.1.3 Pages Making the Most API Requests

| Page | API Calls on Mount | Details |
|------|-------------------|---------|
| `StudentCreationPipeline.tsx` | 6-8 | Classes, Sections, Programs, Categories, Subjects + cascading useEffects |
| `StudentAttendancePage.tsx` | 6 | Students, Programs, Subjects, Classes, Sections, Existing Attendance |
| `FeeSetupPage.tsx` | 5 | FeeTypes, FeeGroups, FeeMasters, FeeStructures, FeeInstallments |
| `FinanceDashboardPage.tsx` | 7 | 7 parallel Promise.all calls for dashboard data |
| `TeacherAttendanceMarkingPage.tsx` | 5 | Students, Subjects, Sections, Classes, Existing Attendance |
| `CommunicationPage.tsx` | 4+ | Messages, Templates, Users, Conversations |
| `ClassDetailPage.tsx` | 4 | Class detail, Students, Subjects, Timetable |
| `BooksPage.tsx` | 3 | Books, Categories, Stats |

#### 2.1.4 N+1 Query Patterns

**`src/hooks/useHR.ts` — CRITICAL (3 instances)**

The following hooks fetch the **entire teacher list** as a side-query every time they run:

```typescript
// useHR.ts, line 223 — useLeaveApplications
const [leaveApplications, teachers] = await Promise.all([
  leaveApplicationsApi.list(filters),
  teachersApi.list({ page_size: DROPDOWN_PAGE_SIZE }), // Fetches ALL teachers every time
]);

// useHR.ts, line 416 — useLeaveBalances (same pattern)
// useHR.ts, line 519 — useSalaryStructures (same pattern)
```

**Impact:** If a user opens the leave page, balance page, and salary page, the full teacher list is fetched 3 times (once per hook). With SWR or React Query dedup this wouldn't happen, but since each hook has a different queryKey, they don't share cache.

**Fix:** Extract teacher lookup into a shared SWR hook (`useTeachersSWR`) and join client-side:
```typescript
export const useLeaveApplications = (filters?: any) => {
  const { data: teachersData } = useTeachersSWR({ page_size: DROPDOWN_PAGE_SIZE });
  return useQuery({
    queryKey: ['hr-leave-applications', filters],
    queryFn: () => leaveApplicationsApi.list(filters),
    select: (data) => {
      // Enrich with teacher names client-side using cached teacher data
      const teacherMap = new Map(teachersData?.results?.map(t => [t.teacher_id, t.full_name]) || []);
      return {
        ...data,
        results: data.results?.map(app => ({
          ...app,
          teacher_name: teacherMap.get(app.teacher) || `Teacher #${app.teacher}`,
        })),
      };
    },
    enabled: !!teachersData,
  });
};
```

**`src/hooks/useStore.ts` — localStorage reads in every mutation**

```typescript
// useStore.ts — repeated 22 times across mutations
mutationFn: async (data: any) => {
  const userId = localStorage.getItem('kumss_user_id');     // Read on every call
  const collegeId = localStorage.getItem('kumss_college_id'); // Read on every call
  // ...
},
```

**Fix:** Read once in a context or custom hook and inject via closure.

Similarly, `useHR.ts` has 18 `localStorage.getItem` calls scattered across mutation functions.

#### 2.1.5 Missing Request Deduplication

The Axios interceptor in `apiClient.ts` has no deduplication layer. While SWR/React Query handle dedup for their hooks, any direct service calls bypass this. Pages that call service methods directly (outside hooks) will make duplicate requests if the component re-renders.

#### 2.1.6 Polling Endpoints

| Hook | Interval | Daily Calls (8h active) | Purpose |
|------|----------|------------------------|---------|
| `useCommunication.ts:289` | 15s | 1,920/user | Chat conversation updates |
| `useApprovals.ts:157` | 30s | 960/user | Approval notification count |
| `useLongPolling.ts` | Continuous | Persistent connection | Real-time events |

**Total polling overhead:** ~2,880 API calls/user/8-hour day just for notifications and chat.

**Recommendation:** Use the existing WebSocket/long-polling infrastructure for both chat and approval notifications instead of separate polling intervals.

---

### 2.2 SWR / Data Fetching Issues

#### 2.2.1 Three Competing Data-Fetching Systems

Your codebase runs **three separate data-fetching approaches simultaneously**:

| System | Files | Cache | Dedup | Stale-While-Revalidate |
|--------|-------|-------|-------|------------------------|
| SWR | 12 `*SWR.ts` hook files | Shared SWR cache | Yes (10-min dedup) | Yes |
| React Query | 15+ hook files | Shared RQ cache | Yes (5-min stale) | Yes |
| Raw useState/useEffect | 6 legacy files (42 hooks) | None | None | None |

**The critical problem:** SWR and React Query maintain **separate caches**. The same data (e.g., teachers) cached in SWR by `useTeachersSWR` is invisible to React Query hooks. Dashboard refresh had to invalidate BOTH caches (fixed in previous commit to be more surgical).

#### 2.2.2 Legacy Hooks Without Any Caching (42 instances)

These files contain hooks that use raw `useState`/`useEffect` with `JSON.stringify(filters)` as the dependency:

| File | Hook Count | Lines | JSON.stringify Count |
|------|-----------|-------|---------------------|
| `useAcademic.ts` | 14 list hooks | 853 | 14 |
| `useStudents.ts` | 12 list hooks | 1,405 | 12 |
| `useAccounts.ts` | 5 list hooks | 286 | 5 |
| `useCore.ts` | 6 list hooks | 854 | 6 |
| `useTeachers.ts` | 4 list hooks | 281 | 4 |
| `useFinance.ts` | 1 list hook | - | 1 |
| **Total** | **42** | **3,679** | **42** |

**Problems with each hook:**
1. **No caching** — every component mount = fresh API call
2. **No deduplication** — 3 components using `useFaculties()` = 3 simultaneous API calls
3. **Race conditions** — rapid filter changes cause async responses to arrive out of order
4. **No abort controller** — unmounted components may try to set state
5. **`fetchData` recreated every render** — not wrapped in `useCallback`
6. **`JSON.stringify(filters)` in deps** — runs serialization on every render cycle

**Impact:** SWR equivalents already exist (`useAcademicSWR.ts`, `useStudentsSWR.ts`, etc.) for most of these. The legacy hooks appear to still be imported in some pages. Migrating consumers would eliminate ~3,700 lines of redundant code and reduce API calls by 50-70%.

#### 2.2.3 Cache Invalidation Issues

**Approval notifications** (`useApprovals.ts:157`):
```typescript
queryKey: approvalNotificationKeys.unreadCount() // Same key for ALL users
refetchInterval: 30000
```
The cache key doesn't include the user ID. If (hypothetically) user context changes, stale count would show.

**Store mutations** — multiple hooks invalidate broad cache keys:
```typescript
queryClient.invalidateQueries({ queryKey: ['store-items'] }); // All store items
queryClient.invalidateQueries({ queryKey: storeIndentKeys.lists() }); // All indent lists
```
These are correct but could be more granular (e.g., invalidate only the affected category).

#### 2.2.4 SWR/React Query Configuration Comparison

| Setting | SWR (SWRProvider) | React Query (lib/react-query.ts) |
|---------|-------------------|----------------------------------|
| Stale time | 10-min dedup | 5 minutes |
| Cache time | 30-min for static | 10 minutes (gcTime) |
| Refetch on focus | Disabled | Disabled |
| Retry | 3 times, 5s interval | 1 retry |
| Keep previous data | Yes | Not set (default false) |

These differing configurations mean the same data behaves differently depending on which system fetches it.

---

### 2.3 Performance Bottlenecks

#### 2.3.1 Unmemoized Context Provider Values (5 providers)

Every context provider that passes an inline object as `value` creates a new reference on every render, causing **all consumers** to re-render:

| Provider | File:Line | Impact |
|----------|-----------|--------|
| `PermissionsContext` | `PermissionsContext.tsx:110-118` | Used by nearly every page |
| `LoadingContext` | `LoadingContext.tsx:21` | Used for global loading overlay |
| `ThemeContext` | `ThemeContext.tsx:135` | Used by all themed components |
| `ChatContext` | `ChatContext.tsx:70` | Used by chat components |
| `SettingsProvider` | `settings/context/SettingsProvider.tsx:84` | Used for app settings |

**Example — PermissionsContext.tsx (lines 109-122):**
```tsx
// PROBLEM: New object created every render
<PermissionsContext.Provider
  value={{
    permissions,
    rawPermissions,
    userContext,
    isLoading,
    error,
    refetch: loadPermissions, // loadPermissions is recreated every render too
  }}
>
```

**Fix for PermissionsContext:**
```tsx
import { useMemo, useCallback } from 'react';

const loadPermissions = useCallback(async () => {
  // ... existing logic
}, [token]);

const value = useMemo(() => ({
  permissions,
  rawPermissions,
  userContext,
  isLoading,
  error,
  refetch: loadPermissions,
}), [permissions, rawPermissions, userContext, isLoading, error, loadPermissions]);

<PermissionsContext.Provider value={value}>
```

**Fix for LoadingContext:**
```tsx
const showLoader = useCallback(() => setIsLoading(true), []);
const hideLoader = useCallback(() => setIsLoading(false), []);

const value = useMemo(() => ({
  isLoading, setIsLoading, showLoader, hideLoader,
}), [isLoading, showLoader, hideLoader]);
```

**Fix for ThemeContext:**
```tsx
const setTheme = useCallback((t: Theme) => setThemeState(t), []);
const setFont = useCallback((f: Font) => setFontState(f), []);
const setColors = useCallback((c: ThemeColors) => setColorsState(c), []);
const toggleTheme = useCallback(() => setThemeState(p => p === 'light' ? 'dark' : 'light'), []);

const value = useMemo(() => ({
  theme, font, colors, setTheme, setFont, setColors, toggleTheme,
}), [theme, font, colors, setTheme, setFont, setColors, toggleTheme]);
```

**Fix for ChatContext:**
```tsx
const value = useMemo(() => ({
  isConnected, messages, sendMessage, sendTyping, markAsRead,
}), [isConnected, messages, sendMessage, sendTyping, markAsRead]);
```

#### 2.3.2 ThemeContext — Excessive localStorage Operations

`ThemeContext.tsx` performs **5 localStorage reads** on initialization and **2 localStorage reads + 2 writes** on every theme change:

```
Mount:
  1. localStorage.getItem('app_settings_v1')     [line 33]
  2. JSON.parse(settingsJson)                     [line 35]
  3. localStorage.getItem('theme')                [line 44] (fallback)
  4. localStorage.getItem('font')                 [line 52]
  5. localStorage.getItem('colors') + JSON.parse  [line 57-58]

Theme change:
  1. localStorage.setItem('theme', theme)                           [line 86]
  2. localStorage.getItem('app_settings_v1') + JSON.parse           [line 90-92]
  3. localStorage.setItem('app_settings_v1', JSON.stringify(...))    [line 94]
```

Also: The `storage` event listener on line 62-78 **only fires for cross-tab changes**, not same-tab changes. So the sync mechanism with SettingsProvider is broken for the primary use case.

#### 2.3.3 Sidebar.tsx — JSON.parse in useMemo

```typescript
// Sidebar.tsx — lines 89-127
const userType = useMemo(() => {
  if (user?.user_type) return user.user_type;
  try {
    const storedUser = JSON.parse(localStorage.getItem('kumss_user') || '{}');
    // JSON.parse runs on every recalculation
  }
}, [user]);

const userPermissions = useMemo(() => {
  // Same pattern — another JSON.parse of the same localStorage key
}, [user]);
```

Two separate `JSON.parse` calls on the same localStorage key. Should read once.

#### 2.3.4 Heavy Computations in Render Cycles

| File | Issue | Line(s) |
|------|-------|---------|
| `ClassDetailPage.tsx` | Timetable `timeSlotMap` computation + sorting in render body | 366-444 |
| `FinanceDashboardPage.tsx` | 7 parallel API calls in `useQuery`, no partial error handling | 54-62 |
| `CommunicationPage.tsx` | Message array filtering without `useMemo` | 85-97 |
| `PayrollsPage.tsx` | 3 separate `.filter()` passes on rows array (should be single `.reduce()`) | 27-34 |
| `BooksPage.tsx` | Multiple `.reduce()` iterations over books array for stats | 101-134 |
| `AttendanceStudentDrillDownPage.tsx` | `CustomTooltip` component defined inside render | 129-145 |

**ClassDetailPage.tsx (lines 366-444) — Example:**
```tsx
// This runs on EVERY render — should be wrapped in useMemo
const timeSlotMap: Record<string, Record<number, any>> = {};
classData.timetable.forEach((entry: any) => {
  if (!timeSlotMap[entry.time_slot]) {
    timeSlotMap[entry.time_slot] = {};
  }
  timeSlotMap[entry.time_slot][entry.day_of_week] = entry;
});
const timeSlots = Object.keys(timeSlotMap).sort();
```

**Fix:**
```tsx
const { timeSlotMap, timeSlots } = useMemo(() => {
  const map: Record<string, Record<number, any>> = {};
  classData.timetable.forEach((entry: any) => {
    if (!map[entry.time_slot]) map[entry.time_slot] = {};
    map[entry.time_slot][entry.day_of_week] = entry;
  });
  return { timeSlotMap: map, timeSlots: Object.keys(map).sort() };
}, [classData.timetable]);
```

#### 2.3.5 Column Definitions Recreated on Every Render

Almost every page with a `DataTable` creates its `columns` array inline. Since column definitions contain `render` functions, new function references are created every render:

| Page | Line(s) | Fix |
|------|---------|-----|
| `FeeSetupPage.tsx` (FeeTypesTab) | 172-191 | Wrap in `useMemo` |
| `PayrollsPage.tsx` | 36-43 | Wrap in `useMemo` |
| `StoreIndentsPage.tsx` | 145-219 | Wrap in `useMemo` |
| `UsersPage.tsx` | 88-150 | Wrap in `useMemo` |
| `TeachersPage.tsx` | 78-90 | Wrap in `useMemo` |
| `BooksPage.tsx` | 180-380 | Wrap in `useMemo` |

#### 2.3.6 Helper Functions Defined Inside Components

| File | Function | Line(s) | Impact |
|------|----------|---------|--------|
| `StudentDetailPage.tsx` | `getInitials()` | 230-237 | Called in render, recreated |
| `UsersPage.tsx` | `getGradient()` | 68-78 | Called per-row, recreated |
| `TeachersPage.tsx` | `getInitials()` | 57-64 | Called per-row, recreated |
| `StoreIndentsPage.tsx` | `getStatusVariant()`, `getPriorityVariant()` | 120-143 | Called per-row |
| `AttendanceStudentDrillDownPage.tsx` | `getStatusColor()`, `getStatusBadgeVariant()` | 107-126 | Called multiple times |

**Fix:** Move pure utility functions to module level (outside the component):
```typescript
// Move outside component — no re-creation cost
const getInitials = (name: string) =>
  name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
```

#### 2.3.7 ChatContext — Unbounded Message Accumulation

```typescript
// ChatContext.tsx, line 42
setMessages(prev => [...prev, newMsg]); // Grows indefinitely!
```
The `messages` array in ChatContext grows without bound. Long sessions will accumulate thousands of messages in memory. There's no cleanup mechanism or pagination.

**Fix:** Add a maximum message buffer:
```typescript
setMessages(prev => [...prev.slice(-500), newMsg]); // Keep last 500
```

#### 2.3.8 Provider Nesting Depth (Provider Hell)

`App.tsx` nests 7+ providers deep:
```
ThemeProvider → SWRProvider → BrowserRouter → SuperAdminProvider →
  PermissionsProvider → HierarchicalContextProvider → ChatProvider →
    DataPrefetcher → ModuleDataPrefetcher → ErrorBoundary → AppRoutes
```

Any context update near the top (e.g., ThemeProvider) triggers reconciliation through the entire tree. Consider using context composition or a state management library (zustand, which is already installed, could replace some contexts).

---

### 2.4 Code Quality Issues

#### 2.4.1 Console Logging in Production — 474 Statements Across 166 Files

| Category | Count | Severity |
|----------|-------|----------|
| Debug `console.log` | ~350 | HIGH — performance overhead |
| Warning `console.warn` | ~30 | MEDIUM |
| Error `console.error` (in catch blocks) | ~94 | LOW — often useful to keep |

**Security risk:** `useLogin.ts` previously logged user credentials/permissions (fixed in previous commit). Other files like `QuotationSelectionDialog.tsx` (34 statements), `useStudents.ts` (49 statements), and `useAcademic.ts` (29 statements) have excessive debug logging.

**Top offenders still remaining:**

| File | Count | Content |
|------|-------|---------|
| `useStudents.ts` | 49 | Fetch errors, mutation results |
| `QuotationSelectionDialog.tsx` | 34 | Debug flow logging |
| `useAcademic.ts` | 29 | Fetch errors, mutation results |
| `useCore.ts` | 22 | Fetch/mutation logging |
| `BookCategoryForm.tsx` | 16 | Form debug logging |
| `ChatWindow.tsx` | 12 | Chat message logging |
| `useTeachers.ts` | 9 | Fetch/mutation logging |
| `auth.service.ts` | 8 | Auth flow logging |
| `StaffAttendanceForm.tsx` | 7 | Form debug logging |
| `ClassSelector.tsx` | 7 | Selector state logging |
| `SectionForm.tsx` | 7 | Form debug logging |

#### 2.4.2 Race Conditions in Legacy Hooks

All 42 legacy hooks have this pattern:
```typescript
const fetchData = async () => {
  setIsLoading(true);
  const result = await someApi.list(filters);
  setData(result); // Could set stale data if filters changed during fetch
  setIsLoading(false);
};

useEffect(() => {
  fetchData(); // No cleanup, no abort controller
}, [JSON.stringify(filters)]);
```

If filters change quickly (e.g., typing in a search field), requests fire in sequence but may resolve out of order. Response from request N-1 could overwrite response from request N.

**Fix:** Add AbortController:
```typescript
useEffect(() => {
  const controller = new AbortController();
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const result = await someApi.list(filters, { signal: controller.signal });
      setData(result);
    } catch (err) {
      if (!controller.signal.aborted) setError(err.message);
    } finally {
      if (!controller.signal.aborted) setIsLoading(false);
    }
  };
  fetchData();
  return () => controller.abort();
}, [/* stable deps */]);
```

Or better: just migrate to SWR hooks which handle this automatically.

#### 2.4.3 Duplicated CRUD Mutation Patterns

`useStudents.ts` contains **25+ near-identical mutation hooks** for create/update/delete across 12 entities. Each follows the exact same pattern:

```typescript
export const useCreateStudentCategory = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const create = async (data: any) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await studentCategoryApi.create(data);
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to create');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  return { create, isLoading, error };
};
```

This pattern is repeated for: `useUpdateStudentCategory`, `useDeleteStudentCategory`, `useCreateStudentGroup`, `useUpdateStudentGroup`, `useDeleteStudentGroup`, `useCreateStudent`, `useUpdateStudent`, `useDeleteStudent`... etc. 25+ times.

**Fix:** Create a generic mutation factory:
```typescript
const useGenericMutation = <TData, TInput>(apiFn: (input: TInput) => Promise<TData>) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mutate = async (input: TInput) => {
    try { setIsLoading(true); setError(null); return await apiFn(input); }
    catch (err: any) { setError(err.message); throw err; }
    finally { setIsLoading(false); }
  };
  return { mutate, isLoading, error };
};

// Usage:
export const useCreateStudentCategory = () => useGenericMutation(studentCategoryApi.create);
export const useUpdateStudentCategory = () => useGenericMutation(
  (data: { id: number; payload: any }) => studentCategoryApi.update(data.id, data.payload)
);
```

Or migrate to React Query `useMutation` which has this built-in.

#### 2.4.4 Inconsistent Error Handling Across Service Files

Services have two different error-handling patterns:

**Pattern A (most services):**
```typescript
if (!response.ok) {
  const errorData = await response.json().catch(() => ({}));
  throw { message: errorData.detail || errorData.message || 'Request failed', status: response.status, errors: errorData };
}
```

**Pattern B (some services — e.g., `store.service.ts`):**
```typescript
if (!response.ok) {
  const errorData = await response.json().catch(() => ({}));
  const fieldErrors = Object.entries(errorData)
    .filter(([key]) => key !== 'detail' && key !== 'message')
    .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
    .join(' | ');
  throw { message: fieldErrors || errorData.detail || 'Request failed', ... };
}
```

Some services aggregate field errors into pipe-separated strings; others don't. This makes error display inconsistent.

**Fix:** Centralize error handling in a shared utility that all services use.

#### 2.4.5 `localStorage.getItem` Calls — 194 Across 85 Files

194 `localStorage.getItem` calls across 85 files. Many are in render paths or mutation functions where the same key is read multiple times:

- `useStore.ts`: 22 reads (mostly `kumss_user_id` and `kumss_college_id` in mutation functions)
- `useHR.ts`: 18 reads (same pattern)
- `useHostel.ts`: 13 reads
- Auth service files: 6 reads each

The same keys (`kumss_user`, `kumss_user_id`, `kumss_college_id`, `access_token`) are read hundreds of times across the app lifecycle.

**Fix:** Centralize in a context or zustand store (already have `auth.ts` store — use it).

#### 2.4.6 `TeachersPage.tsx` Still Has Console Logging

```typescript
// TeachersPage.tsx, line ~30-36
console.log('🔷 [TeachersPage] Permissions:', {
  canCreateTeachers: permissions?.canCreateTeachers,
  ...
});
```

---

### 2.5 Optimization Opportunities

#### 2.5.1 Request Batching

Multiple independent API calls that fire simultaneously on page mount could be batched into single backend endpoints:

| Page | Current Calls | Proposed Batch Endpoint |
|------|--------------|------------------------|
| `StudentAttendancePage` | 6 SWR hooks | `/api/v1/attendance/page-init/` |
| `FeeSetupPage` | 5 React Query hooks | `/api/v1/fees/setup-init/` |
| `FinanceDashboardPage` | 7 parallel calls | `/api/v1/finance/dashboard/` (already exists partially) |

#### 2.5.2 Lazy Loading Improvements

**Currently good:** Routes use `React.lazy()` and dashboard uses `LazySection` with IntersectionObserver.

**Missing:**
- Chart components (`recharts`) within pages are not lazy-loaded — they contribute 390KB to the vendor chunk
- `@mui/material` (300-500KB) appears in `package.json` but your UI is primarily built with Radix — consider removing if only used in 1-2 places
- `framer-motion` (117KB) should be lazy-loaded to pages that use it

#### 2.5.3 Code Splitting — Large Files to Split

| File | Lines | Recommendation |
|------|-------|----------------|
| `useStudents.ts` | 1,405 | Split into per-entity files or delete (SWR versions exist) |
| `config/api.config.ts` | 1,593 | Split by module domain |
| `useAcademic.ts` | 853 | Delete — SWR equivalent exists |
| `useCore.ts` | 854 | Migrate remaining hooks to SWR |
| `useHR.ts` | 943 | Fix N+1 patterns, then OK |
| `useStore.ts` | 817 | Fix localStorage reads |
| `StudentDetailPage.tsx` | 848 | Extract tab contents into lazy-loaded components |
| `CommunicationPage.tsx` | 717 | Extract ComposeDialog, FilterPanel, MessageList |

#### 2.5.4 Memoization Strategy

**Context values** — memoize all provider `value` props (see section 2.3.1):
- PermissionsContext, LoadingContext, ThemeContext, ChatContext, SettingsProvider

**DataTable columns** — memoize in every page that uses `DataTable`:
- Wrap `columns` array with `useMemo([deps])` using only the data the render functions reference

**Expensive computations:**
- Timetable map in `ClassDetailPage.tsx` — `useMemo`
- Message filtering in `CommunicationPage.tsx` — `useMemo`
- Stats calculation in `BooksPage.tsx` — `useMemo` (single-pass reduce)
- Metric computation in `PayrollsPage.tsx` — `useMemo` (single-pass reduce)

#### 2.5.5 Debouncing / Throttling

`useDebounce.ts` exists but is underused. Missing usage in:
- Filter changes on attendance, student, and fee pages (class/section selectors trigger immediate API calls)
- Search inputs — verify `DataTable`'s built-in search is debounced
- `sessionStorage.setItem` calls in `StudentAttendancePage.tsx` (fires on every attendance map change)

#### 2.5.6 Module Prefetcher — Incomplete Coverage

`useModulePrefetcher.ts` only covers 3 modules: `store`, `hr`, `library`.

Missing high-traffic modules:
| Module | Traffic | Status |
|--------|---------|--------|
| `academic` | Very High | Not prefetched |
| `students` | Very High | Not prefetched |
| `attendance` | High | Not prefetched |
| `fees` | High | Not prefetched |
| `examinations` | Medium | Not prefetched |

#### 2.5.7 React.memo Opportunities

Components that receive stable props but re-render due to parent changes:
- `DataTable` component itself
- Individual list/card items (`BookCard` in `BooksPage.tsx`)
- Layout components (`Sidebar`, `Header`) — should be wrapped in `React.memo`
- Tab content components in `FeeSetupPage.tsx` (FeeTypesTab, FeeGroupsTab, etc.)

---

## 3. Priority Matrix

### Impact vs Effort Grid

```
                    LOW EFFORT                    HIGH EFFORT
              ┌─────────────────────────┬─────────────────────────┐
              │                         │                         │
  HIGH        │  P0 — DO NOW            │  P2 — PLAN & EXECUTE   │
  IMPACT      │                         │                         │
              │  • Memoize 5 context    │  • Consolidate to one   │
              │    provider values      │    data-fetching lib    │
              │  • Fix N+1 in useHR.ts  │  • Migrate 42 legacy   │
              │  • Remove 474 console   │    hooks to SWR         │
              │    logs (batch script)  │  • Split large files    │
              │  • Fix localStorage     │    (useStudents, etc.)  │
              │    reads in useStore/HR │  • Create generic       │
              │                         │    mutation factory      │
              ├─────────────────────────┼─────────────────────────┤
              │                         │                         │
  LOW         │  P1 — QUICK WINS        │  P3 — NICE TO HAVE     │
  IMPACT      │                         │                         │
              │  • Memoize columns in   │  • Expand module        │
              │    all DataTable pages  │    prefetcher            │
              │  • Move helper funcs    │  • Add per-section      │
              │    to module level      │    error boundaries      │
              │  • Fix ThemeContext      │  • Create batched API   │
              │    localStorage ops     │    endpoints (backend)   │
              │  • Add React.memo to    │  • Remove @mui if       │
              │    DataTable component  │    underused             │
              │  • Cap ChatContext      │  • Centralize error      │
              │    message buffer       │    handling in services  │
              └─────────────────────────┴─────────────────────────┘
```

### Detailed Priority Table

| Priority | Issue | Impact | Effort | Expected Improvement |
|----------|-------|--------|--------|---------------------|
| **P0** | Memoize 5 context provider values | High — stops cascading re-renders | 1-2 hours | 30-50% fewer re-renders app-wide |
| **P0** | Fix N+1 queries in `useHR.ts` (3 instances) | High — eliminates 3 redundant full-list fetches | 30 min | 3 fewer API calls per HR page load |
| **P0** | Remove remaining 474 console statements | Medium — CPU/memory savings | 1-2 hours | Faster request processing on mobile |
| **P0** | Fix localStorage reads in `useStore.ts` (22x) and `useHR.ts` (18x) | Medium — eliminates ~40 localStorage reads per mutation | 1 hour | Measurable on slow devices |
| **P1** | Memoize DataTable columns in 6+ pages | Medium — prevents table re-renders | 1 hour | Smoother table interactions |
| **P1** | Move helper functions to module level | Low-Medium | 30 min | Fewer allocations per render |
| **P1** | Fix ThemeContext localStorage operations | Medium — 5 reads + 3 writes per theme change | 30 min | Faster theme switching |
| **P1** | Add React.memo to DataTable, Sidebar, Header | Medium — prevents cascading renders | 1 hour | Significant for layout stability |
| **P1** | Cap ChatContext message buffer | Low — prevents memory leak over time | 5 min | Prevents crash in long sessions |
| **P2** | Consolidate SWR + React Query to one lib | Very High — eliminates cache fragmentation | 2-3 days | 30% memory reduction, unified cache |
| **P2** | Migrate 42 legacy hooks to SWR equivalents | Very High — adds caching + dedup | 1-2 days | 50-70% fewer API calls |
| **P2** | Delete legacy hook files after migration | Medium — removes ~3,700 lines | 30 min | Cleaner codebase |
| **P2** | Create generic mutation factory or migrate to useMutation | Medium — eliminates 25+ duplicate hooks | 2-3 hours | ~1,000 lines removed |
| **P3** | Expand module prefetcher to academic/students/fees | Low — pre-warm cache | 1 hour | Faster page transitions |
| **P3** | Add per-section error boundaries | Low — graceful degradation | 2 hours | Better UX on partial failures |
| **P3** | Centralize service error handling | Low — consistency | 3 hours | Cleaner error messages |
| **P3** | Create batched API endpoints (backend) | Medium — fewer round-trips | Backend work | 3-5 fewer calls per page |

---

## 4. Action Items — Specific Code Changes

### Action 1: Memoize PermissionsContext Provider Value

**File:** `src/contexts/PermissionsContext.tsx`

```typescript
// ADD to imports:
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';

// CHANGE loadPermissions to useCallback:
const loadPermissions = useCallback(async () => {
  const currentToken = token || localStorage.getItem('kumss_auth_token');
  if (!currentToken) {
    setIsLoading(false);
    setPermissions(null);
    setRawPermissions(null);
    setUserContext(null);
    return;
  }
  try {
    setIsLoading(true);
    setError(null);
    const response: PermissionsResponse = await fetchUserPermissions();
    setRawPermissions(response.user_permissions);
    setUserContext(response.user_context);
    if (!response.user_context) {
      throw new Error('User context is missing from permissions response');
    }
    const normalized = normalizePermissions(response.user_permissions, response.user_context);
    setPermissions(normalized);
  } catch (err: any) {
    console.error('Failed to load permissions:', err);
    setError(err.message || 'Failed to load permissions');
  } finally {
    setIsLoading(false);
  }
}, [token]);

// ADD memoized value:
const value = useMemo(() => ({
  permissions,
  rawPermissions,
  userContext,
  isLoading,
  error,
  refetch: loadPermissions,
}), [permissions, rawPermissions, userContext, isLoading, error, loadPermissions]);

// USE in provider:
<PermissionsContext.Provider value={value}>
```

### Action 2: Fix N+1 Queries in useHR.ts

**File:** `src/hooks/useHR.ts` — 3 locations (lines ~223, ~416, ~519)

For each of `useLeaveApplications`, `useLeaveBalances`, and `useSalaryStructures`, remove the inline `teachersApi.list()` call and use a shared cached teacher lookup:

```typescript
// Create a shared teacher map hook (or use existing useTeachersSWR)
const useTeacherMap = () => {
  const { data } = useTeachersSWR({ page_size: 200, is_active: true });
  return useMemo(() => {
    const map = new Map<number, string>();
    data?.results?.forEach((t: any) => {
      if (t.teacher_id) map.set(t.teacher_id, t.full_name);
    });
    return map;
  }, [data]);
};

// Then in useLeaveApplications:
export const useLeaveApplications = (filters?: any) => {
  const teacherMap = useTeacherMap();
  return useQuery({
    queryKey: ['hr-leave-applications', filters],
    queryFn: () => leaveApplicationsApi.list(filters),
    select: (data) => ({
      ...data,
      results: data.results?.map((app: any) => ({
        ...app,
        teacher_name: teacherMap.get(app.teacher) || `Teacher #${app.teacher}`,
      })),
    }),
  });
};
```

### Action 3: Remove Console Logs at Scale

Run a targeted removal using a search-and-fix pass. Priority files:

| File | Count | Action |
|------|-------|--------|
| `useStudents.ts` | 49 | Remove all — errors already thrown to callers |
| `QuotationSelectionDialog.tsx` | 34 | Remove all debug logs |
| `useAcademic.ts` | 29 | Remove all — errors already thrown |
| `useCore.ts` | 22 | Remove all — errors already thrown |
| `BookCategoryForm.tsx` | 16 | Remove form debug logs |
| `ChatWindow.tsx` | 12 | Remove — use React DevTools instead |
| `useTeachers.ts` | 9 | Remove all |
| `auth.service.ts` | 8 | Remove token logs (security risk) |
| `SectionForm.tsx` | 7 | Remove form debug |
| `ClassSelector.tsx` | 7 | Remove selector debug |

**Keep:** `console.error` in `catch` blocks that handle user-facing errors (e.g., `PermissionsContext.tsx:97`, `ErrorBoundary.tsx`).

### Action 4: Fix localStorage Reads in Mutation Hooks

**File:** `src/hooks/useStore.ts` (22 reads) and `src/hooks/useHR.ts` (18 reads)

Create a shared helper:
```typescript
// src/utils/auth-context.ts
let _cachedUserId: string | null = null;
let _cachedCollegeId: string | null = null;

export const getAuthIds = () => {
  if (!_cachedUserId) _cachedUserId = localStorage.getItem('kumss_user_id');
  if (!_cachedCollegeId) _cachedCollegeId = localStorage.getItem('kumss_college_id');
  return { userId: _cachedUserId, collegeId: _cachedCollegeId };
};

export const clearAuthCache = () => {
  _cachedUserId = null;
  _cachedCollegeId = null;
};
```

Or better: use the existing `useAuth()` hook and pass user data through the mutation input.

---

## 5. Quick Wins — Easy Fixes for Immediate Improvement

### Quick Win 1: Memoize LoadingContext (5 minutes)

**File:** `src/contexts/LoadingContext.tsx`

```typescript
// Add imports
import React, { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';

// Wrap callbacks
const showLoader = useCallback(() => setIsLoading(true), []);
const hideLoader = useCallback(() => setIsLoading(false), []);

// Memoize value
const value = useMemo(() => ({ isLoading, setIsLoading, showLoader, hideLoader }), [isLoading, showLoader, hideLoader]);

// Use
<LoadingContext.Provider value={value}>
```

### Quick Win 2: Memoize ChatContext (5 minutes)

**File:** `src/contexts/ChatContext.tsx`

```typescript
// Already uses useCallback for handleLongPollingMessage
// Add sendMessage/sendTyping/markAsRead as useCallback, then:
const value = useMemo(() => ({
  isConnected, messages, sendMessage, sendTyping, markAsRead,
}), [isConnected, messages, sendMessage, sendTyping, markAsRead]);

<ChatContext.Provider value={value}>
```

### Quick Win 3: Memoize ThemeContext (10 minutes)

**File:** `src/contexts/ThemeContext.tsx`

```typescript
const setTheme = useCallback((t: Theme) => setThemeState(t), []);
const setFont = useCallback((f: Font) => setFontState(f), []);
const setColors = useCallback((c: ThemeColors) => setColorsState(c), []);
const toggleTheme = useCallback(() => setThemeState(p => p === 'light' ? 'dark' : 'light'), []);

const value = useMemo(() => ({
  theme, font, colors, setTheme, setFont, setColors, toggleTheme,
}), [theme, font, colors, setTheme, setFont, setColors, toggleTheme]);
```

### Quick Win 4: Cap Chat Message Buffer (2 minutes)

**File:** `src/contexts/ChatContext.tsx`, line 42

```typescript
// BEFORE:
setMessages(prev => [...prev, newMsg]);

// AFTER:
setMessages(prev => [...prev.slice(-500), newMsg]);
```

### Quick Win 5: Remove TeachersPage Console Log (1 minute)

**File:** `src/pages/teachers/TeachersPage.tsx`, lines ~30-36

Remove the `console.log('🔷 [TeachersPage] Permissions:', ...)` debug statement.

### Quick Win 6: Move Helper Functions to Module Level (15 minutes)

In `StudentDetailPage.tsx`, `UsersPage.tsx`, `TeachersPage.tsx`, and `AttendanceStudentDrillDownPage.tsx`, move pure utility functions like `getInitials()`, `getGradient()`, `getStatusColor()` outside the component body to module-level constants.

### Quick Win 7: Single-Pass Stats Computation (10 minutes)

**File:** `src/pages/hr/PayrollsPage.tsx`, lines 27-34

```typescript
// BEFORE: 3 separate filter passes
const paid = rows.filter(r => r.status === 'paid').length;
const pending = rows.filter(r => r.status === 'pending').length;
const net = rows.reduce((sum, r) => sum + (Number(r.net_salary) || 0), 0);

// AFTER: Single pass
const metrics = useMemo(() => {
  let paid = 0, pending = 0, net = 0;
  for (const r of rows) {
    if (r.status === 'paid') paid++;
    else if (r.status === 'pending') pending++;
    net += Number(r.net_salary) || 0;
  }
  return { total: rows.length, paid, pending, net };
}, [rows]);
```

---

## Summary Statistics

| Metric | Current | After P0 Fixes | After All Fixes |
|--------|---------|----------------|-----------------|
| Console log statements | 474 | ~94 (keep catch blocks) | ~50 |
| Uncached API hooks | 42 | 42 (P2 migration) | 0 |
| Unmemoized context values | 5 | 0 | 0 |
| N+1 query patterns | 3 | 0 | 0 |
| localStorage reads in mutations | 40+ | 0 (cached) | 0 |
| JSON.stringify in deps | 42 | 42 (P2 migration) | 0 |
| Polling API calls/user/day | ~2,880 | ~2,880 | ~960 (with WebSocket) |
| Legacy hook code lines | ~3,700 | ~3,700 | 0 (deleted) |

---

*End of Claude Analyze Report*
