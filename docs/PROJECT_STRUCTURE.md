# Project Structure & Architecture Documentation

This document provides a comprehensive, file-by-file explanation of the **KUMSS ERP** frontend project structure.

## Root Directory (`/`)

*   **`.env` / `.env.example`**: Configuration for environment variables such as `VITE_API_URL` (Base backend URL) and feature flags.
*   **`.gitignore`**: Defines files/directories to be excluded from version control (e.g., `node_modules`, `dist`, `.env`).
*   **`package.json`**: Project manifest listing dependencies (React, Vite, Lucide, Framer Motion), scripts (`dev`, `build`, `lint`), and version info.
*   **`tsconfig.json`**: TypeScript compiler options (paths, strict mode, target ES version).
*   **`vite.config.ts`**: Configuration for the Vite bundler. Sets up aliases (e.g., `@/` maps to `src/`) and plugins.
*   **`tailwind.config.js`**: Tailwind CSS theme configuration, extending standard colors with CSS variables (e.g., `var(--primary)`) and defining content paths.
*   **`postcss.config.js`**: Configures PostCSS plugins like `tailwindcss` and `autoprefixer`.
*   **`index.html`**: Application entry point HTML. Contains the root div (`<div id="root"></div>`) where React mounts.
*   **`public/`**: Static public assets (favicons, manifests).

---

## Source Code (`src/`)

### 1. `src/api/` (Networking Layer)
*   **`axios.ts`**: The central HTTP client instance.
    *   **Interceptors**:
        *   **Request**: Automatically attaches the JWT `access` token from local storage to `Authorization` headers.
        *   **Response**: Global error handling logic (e.g., redirects to login on 401 Unauthorized, specific error parsing).

### 2. `src/assets/`
*   **`images/`**: Contains static images like usage in placeholders or logos.
*   **`fonts/`**: Custom web fonts if local files are used.

### 3. `src/components/` (UI Library)

#### `src/components/ui/` (Atomic Design System)
*   **`button.tsx`**: Standard button component with variants (default, outline, ghost, destructive) and sizes (sm, md, lg).
*   **`card.tsx`**: Layout primitives for Panels (`Card`, `CardHeader`, `CardTitle`, `CardContent`). Used heavily in Dashboards.
*   **`badge.tsx`**: Status indicators (e.g., "Paid", "Pending", "Urgent").
*   **`table.tsx`**: Styling primitives for HTML tables.
*   **`dialog.tsx`**: Modal/Popup implementation (Dialog, DialogTrigger, DialogContent).
*   **`input.tsx`, `select.tsx`, `textarea.tsx`**: Form inputs styled consistently.
*   **`skeleton.tsx`**: Loading placeholder animations.
*   **`progress.tsx`**: Progress bars for stats.

#### `src/components/common/` (Shared Business Components)
*   **`DataTable.tsx`**: A powerful, reusable table component.
    *   **Features**: Sorting, Pagination, Search Filtering, Column Toggle.
    *   **Loading**: Handles loading markers automatically.
*   **`LoadingComponents.tsx`**: Contains `PageLoader`, `ComponentLoader`, and `Spinner`.
*   **`ConfirmationModal.tsx`**: Generic modal for confirming destructive actions (Delete, Cancel).

#### `src/components/layout/`
*   **`Sidebar.tsx`**: The main side navigation menu. Dynamically renders links based on user role (`admin`, `teacher`, etc.).
*   **`Navbar.tsx`**: Top header containing User Profile dropdown, Module Selectors, and Theme toggles.
*   **`MainLayout.tsx`**: Wrapper for authenticated pages. Contains the Sidebar + Navbar + Content Area structure.

#### `src/components/dashboard/sections/` (Dashboard Widgets)
*   **`TeacherQuickStats.tsx`**: Grid of shortcuts (New Assignment, Mark Attendance) with hover effects.
*   **`TeacherTodaysClasses.tsx`**: Timeline view of the day's schedule. Logic for "Current", "Upcoming", "Completed".
*   **`TeacherAnnouncements.tsx`**: Notification Center list of broadcast notices.
*   **`TeacherPendingActions.tsx`**: To-do list (Unread messages, Ungraded assignments).
*   **`TeacherAssignments.tsx`**: Latest active assignments with submission counts and due dates.
*   **`AcademicDrillDownWidget.tsx`**: (Admin/Teacher) Stats for Pass Rates, Attendance breakdown, and Top Programs leaderboard.
*   **`FinanceWidgets`**: Components for Income/Expense charts (Accountant dashboard).

### 4. `src/config/` (Configuration Constants)
*   **`api.config.ts`**:
    *   Exports `API_BASE_URL` (e.g., `http://localhost:8000/api/v1/`).
    *   Defines `ENDPOINTS` object grouping all API paths: `AUTH`, `ACADEMIC`, `STUDENTS`, `FINANCE`.
*   **`dashboard.config.ts`**:
    *   Maps User Roles (e.g., 'teacher') to a list of Widget Components to render.
    *   Controls the layout order of the Dashboard page.
*   **`nav.config.ts`**:
    *   Defines the Sidebar Menu structure for each role (Label, Icon, Route Path).

### 5. `src/contexts/` (Global State)
*   **`AuthContext.tsx`**:
    *   **State**: `user` object, `isAuthenticated` boolean, `isLoading`.
    *   **Actions**: `login(credentials)`, `logout()`, `refreshProfile()`.
    *   **Persistence**: Handles reading token from localStorage on boot.
*   **`ThemeContext.tsx`**: Controls Light/Dark mode toggling and persistence.
*   **`SettingsContext`**: Global app settings logic.

### 6. `src/hooks/` (Custom Logic)
*   **`useAuth.ts`**: Simple wrapper to access `AuthContext`.
*   **`useCommunication.ts`**:
    *   `useNotices()`: Wrapper for `useQuery` to fetch notices.
    *   `useChats()`: wrapper for chat API.
*   **`useTeachers.ts`**:
    *   `useTeacherSchedule()`: Fetches timetable.
    *   `useAssignments()`: Fetches created homework updates.
    *   `useHomeworkSubmissions()`: Fetches submission lists.
*   **`useStudents.ts`**: Student-specific data fetching (Profile, Grades, Attendance).
*   **`useFinance.ts`**: Accountant hooks (Fee collections, Income reports).

### 7. `src/pages/` (Screens & Views)
*   **`Dashboard.tsx`**: The main landing page. Dynamically loops through `dashboard.config.ts` to render widgets.

#### `src/pages/auth/`
*   **`LoginPage.tsx`**: Login form with validation and error handling.
*   **`LogoutPage.tsx`**: Cleanup logic during logout.

#### `src/pages/teachers/` (Teacher Module)
*   **`TeacherSchedule.tsx`**: Full weekly timetable view.
*   **`AssignmentCreate.tsx`**: Form to create new assignments.
*   **`HomeworkSubmissionsPage.tsx`**: Grading interface for student work.
*   **`TeacherAttendance.tsx`**: Grid view to mark student attendance.

#### `src/pages/students/` (Student Module)
*   **`StudentProfile.tsx`**: view personal details.
*   **`StudentGrades.tsx`**: View report cards/results.

#### `src/pages/accountant/` (Finance Module)
*   **`FeeCollectionsPage.tsx`**: Table of student fee payments.
*   **`IncomeDashboardPage.tsx`**: High-level finance charts.
*   **`StoreSalesPage.tsx`**: Inventory sales tracking.

### 8. `src/routes/`
*   **`routes.tsx`**:
    *   Exports the React Router configuration.
    *   Defines Public Routes (Login) vs Private Routes (Dashboard).
    *   Uses **Lazy Loading** (`React.lazy`) for performance optimization (only load Accountant code for accountants, etc.).
    *   Implements `<ProtectedRoute>` wrapper checking for authentication and specific Roles.

### 9. `src/services/` (API Implementation)
*   **`auth.service.ts`**: Functions for `login`, `register`, `refreshToken`.
*   **`communication.service.ts`**: HTTP calls for `notices`, `chats`.
*   **`hr.service.ts`**: Employee/Staff management endpoints.
*   **`academic.service.ts`**:
    *   `classesApi`: List/Create/Edit classes.
    *   `subjectsApi`: Manage subjects.
    *   `timetableApi`: Manage time slots.
*   **`finance.service.ts`**: Fee structure, payments, and transaction endpoints.

### 10. `src/types/` (TypeScript Definitions)
*   **`auth.types.ts`**: `User`, `LoginResponse`, `UserRole`.
*   **`academic.types.ts`**:
    *   `TeacherScheduleItem`: { day, time_slot, subject, class... }.
    *   `ClassSession`: For timeline rendering.
*   **`communication.types.ts`**: `Notice` interface, `Message` interface.

### 11. `src/utils/`
*   **`auth.utils.ts`**: `isSuperAdmin(user)`, `isTeacher(user)` helper predicates.
*   **`format.utils.ts`**: Helpers like `formatCurrency(amount)`, `formatDate(date)`.
*   **`cn.ts`**: Helper for conditional Tailwind class merging (using `clsx` and `tailwind-merge`).

### 12. `src/App.tsx` & `main.tsx`
*   **`App.tsx`**: The root component. Wraps the app in `QueryClientProvider` (cached data), `AuthProvider` (auth state), and `RouterProvider` (navigation).
*   **`main.tsx`**: Mounts `App` to the DOM. Imports global styles (`index.css`).
