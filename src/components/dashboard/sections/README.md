# Dashboard Sections - Modular Architecture

## Overview

The dashboard uses a **config-driven, modular architecture** where each section is a separate component. This makes it easy to control what appears for different roles (admin, teacher, student, HOD, etc.) without hardcoding permissions in the main Dashboard component.

## How It Works

### 1. **Section Components** (`/sections/*.tsx`)
Each dashboard section is a self-contained React component. Examples:
- `AdminQuickActions.tsx` - Quick action buttons for admins
- `TeacherTodaysClasses.tsx` - Today's class schedule for teachers
- `StudentAttendanceCalendar.tsx` - Attendance calendar for students

### 2. **Configuration** (`/config/dashboard.config.ts`)
Defines which sections appear for which roles:
```typescript
{
  id: 'admin-quick-actions',
  component: 'AdminQuickActions',
  allowedRoles: ['super_admin', 'college_admin'],
  order: 1,
}
```

### 3. **Dynamic Rendering** (`/pages/Dashboard.tsx`)
The main Dashboard component:
1. Gets the user's role
2. Fetches sections for that role from config
3. Dynamically renders each section in order

## Adding a New Dashboard Section

### Step 1: Create the Component
Create a new file in `/sections/`:

```typescript
// sections/HODDepartmentStats.tsx
import React from 'react';
import { Card } from '@/components/ui/card';

export const HODDepartmentStats: React.FC = () => {
  return (
    <Card>
      <h3>Department Statistics</h3>
      {/* Your content here */}
    </Card>
  );
};
```

### Step 2: Export from Index
Add to `sections/index.tsx`:

```typescript
export { HODDepartmentStats } from './HODDepartmentStats';

// Also add to SECTION_COMPONENTS map:
import { HODDepartmentStats } from './HODDepartmentStats';

export const SECTION_COMPONENTS = {
  // ... existing components
  HODDepartmentStats,
};
```

### Step 3: Add to Config
Add to `config/dashboard.config.ts`:

```typescript
{
  id: 'hod-department-stats',
  component: 'HODDepartmentStats',
  allowedRoles: ['hod', 'super_admin'], // Both HOD and admin can see
  order: 1,
}
```

Done! The section will now appear for HOD users.

## Adding a Custom Role (e.g., HOD)

### Example: Head of Department (HOD)

HODs need access to both teacher features AND department management features.

#### Option 1: Give HOD Access to Existing Sections
Edit `dashboard.config.ts` and add `'hod'` to allowedRoles:

```typescript
// HOD can see teacher's classes
{
  id: 'teacher-todays-classes',
  component: 'TeacherTodaysClasses',
  allowedRoles: ['teacher', 'hod'], // Added 'hod'
  order: 2,
},

// HOD can see admin pending tasks
{
  id: 'admin-pending-tasks',
  component: 'AdminPendingTasks',
  allowedRoles: ['super_admin', 'college_admin', 'hod'], // Added 'hod'
  order: 3,
},
```

#### Option 2: Create HOD-Specific Sections
```typescript
// New sections just for HOD
{
  id: 'hod-department-overview',
  component: 'HODDepartmentOverview',
  allowedRoles: ['hod'],
  order: 1,
},
{
  id: 'hod-faculty-performance',
  component: 'HODFacultyPerformance',
  allowedRoles: ['hod'],
  order: 2,
},
```

## Examples

### Example 1: Multiple Roles Share a Section
```typescript
// Both students and parents see fee information
{
  id: 'fees-overview',
  component: 'FeesOverview',
  allowedRoles: ['student', 'parent'],
  order: 3,
}
```

### Example 2: Different Order for Different Roles
Create separate section entries with different orders:
```typescript
// Teachers see assignments early
{
  id: 'teacher-assignments',
  component: 'AssignmentsWidget',
  allowedRoles: ['teacher'],
  order: 2,
},

// Students see assignments later
{
  id: 'student-assignments',
  component: 'AssignmentsWidget', // Same component!
  allowedRoles: ['student'],
  order: 7,
},
```

### Example 3: Conditional Sections
Add custom logic in the section component itself:
```typescript
export const AdminQuickActions: React.FC = () => {
  const { user } = useAuth();
  const isSuperAdmin = user?.user_type === 'super_admin';

  return (
    <Card>
      {isSuperAdmin && <SuperAdminOnlyButton />}
      <CommonAdminButtons />
    </Card>
  );
};
```

## Benefits

✅ **Easy to add/remove sections** - Edit config file only
✅ **Easy to control permissions** - Just update `allowedRoles` array
✅ **Supports custom roles** - Add 'hod', 'librarian', etc.
✅ **No hardcoded role checks** - All permissions in config
✅ **Reusable sections** - Same component for multiple roles
✅ **Easy to reorder** - Change the `order` property

## Current Sections

### Admin Sections
- `AdminQuickActions` - Quick action buttons
- `AdminKeyMetrics` - Key statistics cards
- `AdminPendingTasks` - Tasks requiring attention
- `AdminSystemAlerts` - System notifications
- `AdminRecentActivities` - Recent system activities
- `AdminUpcomingEvents` - Calendar events
- `AdminInstitutionOverview` - Institution statistics
- `AdminManagementLinks` - Management quick links

### Teacher Sections
- `TeacherQuickStats` - Quick statistics
- `TeacherTodaysClasses` - Today's class schedule
- `TeacherPendingActions` - Pending tasks
- `TeacherAssignments` - Assignment submissions
- `TeacherAnnouncements` - Recent announcements

### Student Sections
- `StudentQuickActions` - Quick action buttons
- `StudentPriorityCards` - Priority information cards
- `StudentAttendanceCalendar` - Attendance calendar
- `StudentTestMarks` - Recent test scores
- `StudentTodaysSchedule` - Today's class schedule
- `StudentUpcomingExams` - Upcoming exams
- `StudentAssignments` - Pending assignments

## TODO

The stub components are placeholders. To complete the implementation:

1. Extract the actual UI code from the old Dashboard component
2. Place it in the corresponding section component
3. Move mock data to the section component or use API calls
4. Test that each section renders correctly

This modular approach makes the dashboard much easier to maintain and customize!
