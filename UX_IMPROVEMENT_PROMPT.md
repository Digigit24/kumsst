KUMSS ERP — UX Improvement Prompts for Claude Code

Instructions: Copy ONE phase at a time and paste it into Claude Code. Always start with the Pre-Requisite message. Each phase is a standalone prompt.

============================================================
PRE-REQUISITE (say this first in every new session)
============================================================

Before starting, read the file UX_ENGAGEMENT_AUDIT.md in the project root. It contains a full UX audit of this project with detailed findings, code examples, and priority rankings for every module. Use it as your reference for all work. It has exact component names, file paths, line numbers, and code patterns. After reading it, confirm you understood it and then proceed with the phase I give you.


============================================================
PHASE 1: Shared Reusable Components (Do This First)
============================================================

Read UX_ENGAGEMENT_AUDIT.md for full context. Then build the following 9 shared reusable components. Create them in src/components/common/. Use TypeScript, cn() utility, Radix UI primitives, lucide-react icons, and Framer Motion for animations — all already installed in the project. Do NOT modify any existing pages — just create the components.

1. InlineEditField (src/components/common/InlineEditField.tsx)
A click-to-edit field. When not editing, shows value as plain text with a subtle pencil icon on hover. When clicked, turns into an input. On blur or Enter, calls onSave(newValue). On Escape, cancels. Props: value, onSave, label, type (text/number/date/email), placeholder, disabled, className. Use Framer Motion for smooth transitions. Reference: there is already an InlineEdit component inside src/pages/academic/wizard/AcademicSetupWizard.tsx around line 257 — extract and generalize that pattern.

2. CardSelect (src/components/common/CardSelect.tsx)
Visual card-based selection as an alternative to dropdowns. Shows options as clickable cards in a grid. Props: options (array of value/label/icon/description), value, onChange, columns (default 3), disabled. Selected card: border-primary bg-primary/5 shadow-md. Unselected: border-muted hover:border-primary/30. Use whileHover and whileTap from Framer Motion.

3. ProgressiveDisclosure (src/components/common/ProgressiveDisclosure.tsx)
Collapsible section for optional form fields. Shows trigger like "Show 6 additional fields" with chevron. Props: children, label, fieldCount, defaultOpen. Use Radix Collapsible (already installed). Smooth slide animation.

4. SuccessCard (src/components/common/SuccessCard.tsx)
Animated success feedback to replace plain toasts. Shows animated checkmark (scale-in with spring), title, subtitle, action buttons. Props: title, subtitle, icon (default CheckCircle), actions (array of label/onClick/variant), onClose. Gradient background from-green-500 to-emerald-600 with white text. Works with Sonner toast.custom() since project uses Sonner.

5. DuplicateButton (src/components/common/DuplicateButton.tsx)
"Create Another Similar" button for after form submission. Props: onDuplicate, label (default "Create Another Similar"), fieldsKept (list of field names for tooltip). Icon: Copy or Plus from lucide-react.

6. EmptyState (src/components/common/EmptyState.tsx)
Beautiful empty state for tables/lists with no data. Props: icon (Lucide icon), title, description, actionLabel, onAction, className. Large faded icon (64px, opacity 0.3), semibold title, muted description, optional action button. Subtle pulse animation.

7. ValidatedInput (src/components/common/ValidatedInput.tsx)
Input with real-time inline validation. Extends all Input props plus validate (function returning boolean or error string), showStatus. Green checkmark when valid, red X when invalid (absolute positioned right side). Border color changes accordingly. Error message slides in below.

8. QuickStatusPill (src/components/common/QuickStatusPill.tsx)
Clickable status badge that cycles through statuses on click, replacing "open form, change status, submit" pattern. Props: status, options (array of value/label/color), onUpdate (async), disabled. Loading spinner while updating. whileTap scale 0.95.

9. WelcomeGreeting (src/components/common/WelcomeGreeting.tsx)
Time-based greeting for Dashboard. Shows "Good morning/afternoon/evening, [First Name]" with wave emoji. Props: userName (full name, extracts first name), className. Morning 5am-12pm, Afternoon 12pm-5pm, Evening 5pm-9pm, Night 9pm-5am. Fade-in on mount.

After building all 9 components, run npm run build to verify zero TypeScript errors.


============================================================
PHASE 2: Command Palette (Biggest UX Win)
============================================================

Read UX_ENGAGEMENT_AUDIT.md section 7.1 for context.

Install cmdk library (npm install cmdk). Then create src/components/common/CommandPalette.tsx — a global command palette that opens with Ctrl+K (or Cmd+K on Mac).

Use the existing useKeyboardShortcuts hook from src/hooks/useKeyboardShortcuts.ts for the shortcut binding.

The palette should have a search input at top with placeholder "Type a command or search...", and these command groups:

Quick Actions group with: New Student (navigates /students), Mark Attendance (/attendance/student), Collect Fee (/fees/collections), Issue Book (/library/book-issues), Create Notice (/communication/notices), New Indent (/store/indents).

Navigation group: pull all nav items from the sidebar config at src/config/sidebar.config.ts. Each item navigates to its route and closes the palette.

Styling: max width 640px, centered at top 20vh, bg-popover with border and shadow-2xl, rounded-xl. Input area full width with border-bottom. List max-height 400px scrollable. Backdrop semi-transparent with blur.

Add the CommandPalette component to src/App.tsx so it works globally on every page. Use useNavigate from react-router-dom for navigation. Arrow keys, Enter, Escape are built into cmdk.

After implementation, run npm run dev and test that Ctrl+K opens the palette, search filters work, and navigation works.


============================================================
PHASE 3: Dashboard Improvements
============================================================

Read UX_ENGAGEMENT_AUDIT.md section 3.1 for context.

Improve src/pages/Dashboard.tsx with these additions (don't break existing functionality):

1. Welcome Greeting: Import and use the WelcomeGreeting component (from Phase 1) at the top. Get user name from the useAuth() hook already used in the file.

2. Quick Actions Card: Add a card below the greeting with 4-6 common actions as clickable cards in a 3-col grid (2-col on mobile). Actions: Mark Attendance (/attendance/student), Collect Fee (/fees/collections), Add Student (/students), Create Notice (/communication/notices), Issue Book (/library/book-issues), New Indent (/store/indents). Each card has icon + label, hover lift animation, subtle gradient border. Use useNavigate.

3. Animated Stat Counters: The AcademicSetupWizard at src/pages/academic/wizard/AcademicSetupWizard.tsx has an AnimatedNumber component around line 213. If the Dashboard has stat cards, animate their numbers from 0 to value on mount using a similar approach.

4. Keyboard Shortcut Hint: Add a small muted badge somewhere: "Press Ctrl+K to search anything" to help users discover the Command Palette.

Make sure it works for all user roles. Run npm run build to verify.


============================================================
PHASE 4: Form Quick Wins (Success Feedback + Duplicate + Auto-Save)
============================================================

Read UX_ENGAGEMENT_AUDIT.md sections 4.1, 5.3, and 6.2 for context.

Apply three improvements to the 5 highest-traffic forms:
- src/pages/fees/forms/FeeCollectionForm.tsx
- src/pages/students/forms/StudentCreationPipeline.tsx
- src/pages/teachers/forms/TeacherCreationPipeline.tsx
- src/pages/library/forms/BookForm.tsx
- src/pages/hr/forms/LeaveApplicationForm.tsx

For each form:

A) Animated Success Feedback: Replace or enhance existing toast.success() calls with the SuccessCard component from Phase 1. After successful submit, show animated success card with checkmark, descriptive title (like "Fee Collected Successfully!"), subtitle with key details (like the amount and student name), and action buttons for "View All" and "Create Another". Use Sonner's toast.custom().

B) Create Another Similar: After success, offer option that keeps shared context fields (program, class, section, academic_year, payment_method) but clears unique fields (name, email, IDs, amounts). Show toast "Fields pre-filled from last entry!". For wizard forms, reset to Step 1 with shared fields pre-filled.

C) Auto-Save Drafts (wizard forms only): For StudentCreationPipeline and TeacherCreationPipeline — auto-save to sessionStorage every 5 seconds. On mount, restore draft with toast "Restored your unsaved draft" with Discard action. Clear draft on success. Note: TeacherCreationPipeline already has auto-save around line 206 — check before adding duplicate logic.

Also fix LeaveApplicationForm while you are there: auto-calculate Total Days when from_date and to_date are both filled (total = to - from + 1). Also replace the raw HTML select elements with Radix UI Select component from src/components/ui/select.tsx.

Run npm run build after.


============================================================
PHASE 5: Progressive Disclosure + Card Selects
============================================================

Read UX_ENGAGEMENT_AUDIT.md sections 4.4 and 7.4 for context.

1. StudentForm progressive disclosure (src/pages/students/components/StudentForm.tsx, 777 lines): The Basic Info tab shows all fields at once. Refactor it — keep always visible: User select, First/Middle/Last Name, Date of Birth, Gender. Wrap in ProgressiveDisclosure (Phase 1): Blood Group, Nationality, Religion, Caste, Mother Tongue, Aadhar, PAN. Label: "Show 7 additional fields". Default collapsed for create, expanded for edit/view.

2. BookForm progressive disclosure (src/pages/library/forms/BookForm.tsx, 592 lines): Review and identify optional fields. Keep essential: Title, ISBN, Category, Copies. Wrap the rest in ProgressiveDisclosure.

3. Payment Method card select (src/pages/fees/forms/FeeCollectionForm.tsx around line 164): Replace the Select dropdown with CardSelect from Phase 1. Options: Cash (icon: money emoji, desc: Cash payment at counter), Bank Transfer (icon: bank emoji, desc: Bank/NEFT/RTGS/IMPS), Online (icon: phone emoji, desc: UPI/Razorpay/Paytm). 3-column grid.

4. Gender card select (src/pages/students/components/StudentForm.tsx around line 449): Replace Select dropdown with CardSelect. Male/Female/Other with appropriate icons. 3-column grid.

5. Admission Type card select (same StudentForm, Academic tab, around line 616): Replace Select with CardSelect. Regular, Lateral Entry, Transfer, Management Quota with icons. 4-column grid or 2x2 on mobile.

Run npm run build after.


============================================================
PHASE 6: Copy Yesterday Attendance + Inline Editing
============================================================

Read UX_ENGAGEMENT_AUDIT.md sections 3.3 and 2.1.

1. Copy Yesterday button (src/pages/attendance/StudentAttendancePage.tsx): Add a "Copy Yesterday" button near the date picker. When clicked, fetch yesterday's attendance for the same class/section, pre-fill today's toggles with those values, show toast "Yesterday's attendance copied! Review and save." If no data, show "No attendance data for yesterday." Only visible when today's attendance hasn't been saved. This saves 90% of daily work since most days are identical.

2. Inline editing on Student Detail Page (src/pages/students/StudentDetailPage.tsx): For text fields like email, phone, alternate phone, roll number — use the InlineEditField component from Phase 1. When saved, call student update API with just the changed field. Show small toast like "Phone updated". Keep the full Edit button too for bulk changes.

3. Inline editing on Teacher Detail Page (src/pages/teachers/TeacherDetailPage.tsx): Same pattern — inline edit for email, phone, specialization, qualifications. Call teacher update API on save, show toast.

Run npm run build after.


============================================================
PHASE 7: Empty States + Real-Time Validation
============================================================

Read UX_ENGAGEMENT_AUDIT.md for context.

1. Empty States: Find all pages showing plain text like "No data found" or "No results" when tables are empty. Replace with the EmptyState component from Phase 1. Prioritize: Students page (icon: Users, "No students yet", action: Add Student), Fee collections (icon: Wallet, "No fee collections", action: Collect Fee), Books (icon: BookOpen, "No books in the library", action: Add Book), Attendance (icon: UserCheck, "No students found", "Select a class and section"), Notices (icon: Bell, "No notices yet", action: Create Notice), Store items (icon: Package, "No items found", action: Add Item). Search for "No data", "No results", "not found" across pages directory. If DataTable has a built-in empty state prop, update it for global coverage.

2. Real-Time Validation: Add ValidatedInput or inline validation to: email fields (validate email format), phone fields (10-digit Indian number), Aadhar (exactly 12 digits), PAN (format ABCDE1234F), admission/registration numbers (non-empty). Show green border with checkmark when valid, red with X when invalid. Error message slides in below.

Run npm run build after.


============================================================
PHASE 8: Spreadsheet-Style Marks Entry
============================================================

Read UX_ENGAGEMENT_AUDIT.md section 7.2.

Create src/components/common/SpreadsheetGrid.tsx — an Airtable-like editable grid for bulk data entry. Rows = students, columns = subjects. Each cell is a number input. Tab key moves to next cell. Student names sticky on left, subject headers sticky on top. Total column auto-calculates. Green for pass, red for fail. Bulk save button.

Then integrate into the exam marks pages. Look at src/pages/exams/forms/StudentMarksForm.tsx and the marks register pages. Add a "Grid Entry" toggle alongside existing form entry. Grid loads all students for selected exam/class, one column per subject. User fills grid then clicks Save All Marks. Validate marks between 0 and max_marks.

This is high-effort. Get basic grid working first, then polish. Run npm run build after.


============================================================
PHASE 9: Leave Management (HR Module)
============================================================

Read UX_ENGAGEMENT_AUDIT.md section 3.7.

1. Leave Balance Widget: Before showing the leave form, display remaining leave balance per type (Used/Total/Remaining). Color coded: green >50% remaining, yellow 25-50%, red <25%.

2. Quick Approve/Reject in list: On the Leave Applications list page, add Approve and Reject buttons directly in each table row for pending items. Small confirmation popover on click, then call API. Only show for users with approval permission.

3. Replace raw HTML selects in LeaveApplicationForm.tsx: The form uses raw HTML select elements with long manually-copied className strings. Replace all of them with the Radix UI Select component from src/components/ui/select.tsx.

Run npm run build after.


============================================================
PHASE 10: Fee Collection Improvements
============================================================

Read UX_ENGAGEMENT_AUDIT.md section 3.4.

Working in src/pages/fees/forms/FeeCollectionForm.tsx and related pages:

1. Fix legacy hook: Line 14 uses useStudents from hooks/useStudents. Check if it's a legacy hook (useState/useEffect pattern). If so, switch to SWR version — check src/hooks/swr.ts or similar files for useStudentsSWR.

2. Fix localStorage in handleSubmit: Lines 77-78 read localStorage directly for college_id and user_id. Replace with useActiveCollegeId() from SuperAdminContext and useAuth() hook.

3. Receipt preview after collection: After success, show styled receipt card with student name, amount (large bold), payment method, date, transaction ID, collected by. Buttons: Print Receipt (opens print dialog) and Collect Another.

4. Recent payments: Below student selector, show "Recent payments by this student" — last 3 payments with amount, date, method. Helps avoid duplicates.

Run npm run build after.


============================================================
GENERAL RULES (applies to all phases)
============================================================

Always read UX_ENGAGEMENT_AUDIT.md first. Don't break existing functionality. Use TypeScript with proper types. Use cn() for classnames, Radix UI primitives, Framer Motion for animations, lucide-react icons, Sonner for toasts, react-router-dom for navigation — all already installed. Run npm run build after each phase. Make everything mobile responsive (grid-cols-1 md:grid-cols-2 etc). Use semantic color tokens (text-foreground, bg-background, border-border) for dark mode compatibility. Use useMemo/useCallback where appropriate. Shared components go in src/components/common/, UI primitives in src/components/ui/, page-specific in src/pages/[module]/components/ or forms/.
