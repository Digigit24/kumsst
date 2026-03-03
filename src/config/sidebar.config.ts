import {
    BarChart,
    BarChart3,
    Bell,
    BookOpen,
    Briefcase,
    Bug,
    Building2,
    Calendar,
    Camera,
    CheckCircle,
    CheckSquare,
    ClipboardList,
    CreditCard,
    DoorClosed,
    FileText,
    Flag,
    FolderTree,
    GraduationCap,
    HardHat,
    Home,
    Landmark,
    Library,
    Mail,
    MapPin,
    MessageSquare,
    Package,
    PenTool,
    Percent,
    Printer,
    School,
    Send,
    Settings,
    Shield,
    ShoppingCart,
    Store,
    UserCircle,
    Users,
    Wallet,
    Wrench
} from "lucide-react";

export interface SidebarItem {
  name: string;
  href: string;
  icon: any;
  roles?: string[]; // Which roles can see this item (simple role-based)
  items?: SidebarItem[]; // Optional nested items
  permissions?: string[]; // Which permissions needed (flexible permission-based)
  requireAllPermissions?: boolean; // If true, user needs ALL permissions. If false, needs ANY. Default: false
}

export interface SidebarGroup {
  group: string;
  icon: any;
  items: SidebarItem[];
  roles?: string[]; // Which roles can see this group (simple role-based)
  permissions?: string[]; // Which permissions needed (flexible permission-based)
  requireAllPermissions?: boolean; // If true, user needs ALL permissions. If false, needs ANY. Default: false
}

export const SIDEBAR_GROUPS: SidebarGroup[] = [
  // ================= DASHBOARD (ALL ROLES EXCEPT ACCOUNTANT) =================
  {
    group: "Dashboard",
    icon: Home,
    roles: ["super_admin", "college_admin", "teacher", "student", "parent", "staff", "hr", "store_manager", "library_manager", "hostel_warden", "hostel_manager", "clerk", "construction_head", "jr_engineer"], // ALL roles except accountant
    items: [
      {
        name: "Dashboard",
        href: "/dashboard",
        icon: Home,
        roles: ["super_admin", "college_admin", "teacher", "student", "parent", "staff", "hr", "store_manager", "library_manager", "hostel_warden", "hostel_manager", "clerk", "construction_head", "jr_engineer"],
      },
    ],
  },

  // ================= INCOME DASHBOARD (ACCOUNTANT ONLY) =================
  {
    group: "Income Dashboard",
    icon: BarChart,
    roles: ["accountant"], // Accountant only
    items: [
      {
        name: "Income Dashboard",
        href: "/income-dashboard",
        icon: BarChart,
        roles: ["accountant"],
      },
    ],
  },

  // ================= MY ACADEMICS (STUDENT ONLY) =================
  {
    group: "My Academics",
    icon: BookOpen,
    roles: ["student"],
    items: [
      {
        name: "My Subjects",
        href: "/student/academics/subjects",
        icon: BookOpen,
        roles: ["student"],
      },
      {
        name: "My Timetable",
        href: "/student/academics/timetable",
        icon: Calendar,
        roles: ["student"],
      },
      {
        name: "My Attendance",
        href: "/student/academics/attendance",
        icon: ClipboardList,
        roles: ["student"],
      },
      {
        name: "My Assignments",
        href: "/student/academics/assignments",
        icon: FileText,
        roles: ["student"],
      },
      {
        name: "My Homework",
        href: "/student/academics/homework",
        icon: FileText,
        roles: ["student"],
      },
    ],
  },

  // ================= MY EXAMINATIONS (STUDENT ONLY) =================
  {
    group: "My Examinations",
    icon: PenTool,
    roles: ["student"],
    items: [
      {
        name: "Exam Schedules",
        href: "/exams/schedules",
        icon: Calendar,
        roles: ["student"],
      },
      {
        name: "My Results",
        href: "/student/examinations/results",
        icon: FileText,
        roles: ["student"],
      },
      {
        name: "My Progress Cards",
        href: "/student/examinations/progress-cards",
        icon: FileText,
        roles: ["student"],
      },
    ],
  },

  // ================= MY LIBRARY (STUDENT ONLY) =================
  {
    group: "My Library",
    icon: Library,
    roles: ["student"],
    items: [
      {
        name: "Browse Books",
        href: "/library/books",
        icon: BookOpen,
        roles: ["student"],
      },
      {
        name: "My Books",
        href: "/library/my-books",
        icon: BookOpen,
        roles: ["student"],
      },
    ],
  },

  // ================= MY CLASSES (TEACHER ONLY) =================
  {
    group: "My Classes",
    icon: School,
    roles: ["teacher"],
    items: [
      {
        name: "My Schedule",
        href: "/teachers/schedule",
        icon: Calendar,
        roles: ["teacher"],
      },


      {
        name: "Subjects",
        href: "/teacher/subjects",
        icon: BookOpen,
        roles: ["teacher"],
      },
      {
        name: "Syllabus",
        href: "/teacher/syllabus",
        icon: FileText,
        roles: ["teacher"],
      },
    ],
  },

  // ================= ASSIGNMENTS (TEACHER) =================
  {
    group: "Assignments",
    icon: FileText,
    roles: ["teacher"],
    items: [

      {
        name: "My Assignments",
        href: "/assignments/list",
        icon: FileText,
        roles: ["teacher"],
      },
      {
        name: "Submissions",
        href: "/assignments/submissions",
        icon: ClipboardList,
        roles: ["teacher"],
      },

      {
        name: "Homework",
        href: "/teachers/homework",
        icon: FileText,
        roles: ["teacher"],
      },
      {
        name: "Homework Submissions",
        href: "/teachers/homework-submissions",
        icon: ClipboardList,
        roles: ["teacher"],
      },
    ],
  },


  // ================= CORE (ADMIN ONLY) =================
  {
    group: "Core",
    icon: Settings,
    roles: ["super_admin", "college_admin"], // ADMIN ONLY
    items: [
      {
        name: "Colleges",
        href: "/core/colleges",
        icon: Building2,
        roles: ["super_admin"], // SUPER ADMIN ONLY
      },
      {
        name: "Academic Years",
        href: "/core/academic-years",
        icon: Calendar,
        roles: ["super_admin", "college_admin"],
      },
      {
        name: "Academic Sessions",
        href: "/core/academic-sessions",
        icon: GraduationCap,
        roles: ["super_admin", "college_admin"],
      },
      {
        name: "Holidays",
        href: "/core/holidays",
        icon: Calendar,
        roles: ["super_admin", "college_admin"],
      },

      // System Settings removed as per request
      {
        name: "Notification Settings",
        href: "/core/notification-settings",
        icon: Bell,
        roles: ["super_admin", "college_admin"],
      },
      {
        name: "Activity Logs",
        href: "/core/activity-logs",
        icon: FileText,
        roles: ["super_admin", "college_admin"],
      },
      {
        name: "Drilldown",
        href: "#", // Parent item, no direct link usually, or defaults to first child
        icon: BarChart3,
        roles: ["super_admin", "college_admin"],
        items: [
          {
            name: "Academic Performance",
            href: "/drilldown",
            icon: BarChart3, // Using same icon or specific one
            roles: ["super_admin", "college_admin"],
          },
          {
            name: "Attendance Analytics",
            href: "/attendance/drilldown",
            icon: BarChart,
            roles: ["super_admin", "college_admin"],
          },
          {
            name: "Procurement Overview",
            href: "/store/drilldown",
            icon: Store,
            roles: ["super_admin", "college_admin"],
          },
          {
            name: "Fee Overview",
            href: "/finance/drilldown",
            icon: CreditCard,
            roles: ["super_admin", "college_admin"],
          },
        ]
      },
    ],
  },



  // ================= ACADEMIC (ADMIN + TEACHER) =================
  {
    group: "Academic",
    icon: School,
    roles: ["super_admin", "college_admin"],
    items: [
      {
        name: "Performance Dashboard",
        href: "/drilldown",
        icon: BarChart3,
        roles: ["super_admin", "college_admin", "teacher"],
      },
      {
        name: "Structure Blueprint",
        href: "/academic/setup-wizard",
        icon: GraduationCap,
        roles: ["super_admin", "college_admin"],
      },

      {
        name: "Assign Teachers",
        href: "/academic/class-teachers",
        icon: Users,
        roles: ["super_admin", "college_admin"],
      },
      {
        name: "Class Times",
        href: "/academic/class-times",
        icon: Calendar,
        roles: ["super_admin", "college_admin", "teacher"], // Teachers can view
      },
      {
        name: "Classes",
        href: "/academic/classes",
        icon: School,
        roles: ["super_admin", "college_admin"],
      },
      {
        name: "Classrooms",
        href: "/academic/classrooms",
        icon: Building2,
        roles: ["super_admin", "college_admin"],
      },
      {
        name: "Faculties",
        href: "/academic/faculties",
        icon: Users,
        roles: ["super_admin", "college_admin"],
      },
      {
        name: "Lab Schedules",
        href: "/academic/lab-schedules",
        icon: Calendar,
        roles: ["super_admin", "college_admin", "teacher"],
      },
      {
        name: "Optional Subject Groups",
        href: "/academic/optional-subjects",
        icon: BookOpen,
        roles: ["super_admin", "college_admin"],
      },
      {
        name: "Programs",
        href: "/academic/programs",
        icon: GraduationCap,
        roles: ["super_admin", "college_admin"],
      },
      {
        name: "Sections",
        href: "/academic/sections",
        icon: School,
        roles: ["super_admin", "college_admin"],
      },
      {
        name: "Teacher-Subject Mapping",
        href: "/academic/subject-assignments",
        icon: BookOpen,
        roles: ["super_admin", "college_admin"],
      },
      {
        name: "Subjects",
        href: "/academic/subjects",
        icon: BookOpen,
        roles: ["super_admin", "college_admin", "teacher"], // Teachers can view
      },
      {
        name: "Timetables",
        href: "/academic/timetables",
        icon: Calendar,
        roles: ["super_admin", "college_admin"],
      },
    ],

  },

  // ================= STUDENTS (ADMIN + TEACHER + STAFF) =================
  {
    group: "Students",
    icon: GraduationCap,
    roles: ["super_admin", "college_admin", "teacher", "staff", "clerk"],
    items: [
      {
        name: "Students",
        href: "/students/list",
        icon: GraduationCap,
        roles: ["super_admin", "college_admin", "teacher", "staff", "clerk"],
      },
      {
        name: "Student 360° Profile",
        href: "/students/360-profile",
        icon: UserCircle,
        roles: ["super_admin", "college_admin", "teacher"],
      },
      {
        name: "Guardians",
        href: "/students/guardians",
        icon: Users,
        roles: ["super_admin", "college_admin"],
      },

      {
        name: "Student Groups",
        href: "/students/groups",
        icon: Users,
        roles: ["super_admin", "college_admin"],
      },
      {
        name: "Student Documents",
        href: "/students/documents",
        icon: FileText,
        roles: ["super_admin", "college_admin"],
      },
      {
        name: "Student Addresses",
        href: "/students/addresses",
        icon: Building2,
        roles: ["super_admin", "college_admin"],
      },
      {
        name: "Student Medical Records",
        href: "/students/medical-records",
        icon: FileText,
        roles: ["super_admin", "college_admin"],
      },
      {
        name: "Student Promotions",
        href: "/students/promotions",
        icon: GraduationCap,
        roles: ["super_admin", "college_admin"],
      },
      {
        name: "Certificates",
        href: "/students/certificates",
        icon: FileText,
        roles: ["super_admin", "college_admin"],
      },
    ],
  },

  // ================= TEACHERS (TEACHER + ADMIN) =================
  {
    group: "Teachers",
    icon: Users,
    roles: ["super_admin", "college_admin"],
    items: [
      {
        name: "Teachers",
        href: "/teachers",
        icon: Users,
        roles: ["super_admin", "college_admin"],
      },
      {
        name: "Teacher Schedule",
        href: "/teachers/schedule",
        icon: Calendar,
        roles: ["super_admin", "college_admin"],
      },

      {
        name: "Teacher Homework",
        href: "/teachers/homework",
        icon: FileText,
        roles: ["super_admin", "college_admin"],
      },
      {
        name: "My Assignments",
        href: "/assignments/list",
        icon: FileText,
        roles: ["super_admin", "college_admin"],
      },
      {
        name: "Assignment Submissions",
        href: "/assignments/submissions",
        icon: ClipboardList,
        roles: ["super_admin", "college_admin"],
      },
    ],
  },

  // ================= ATTENDANCE (ADMIN + TEACHER) =================
  {
    group: "Attendance",
    icon: ClipboardList,
    roles: ["super_admin", "college_admin", "teacher"],
    items: [
      {
        name: "Student Attendance",
        href: "/attendance/students",
        icon: ClipboardList,
        roles: ["super_admin", "college_admin", "teacher"], // Teachers mark attendance
      },
      {
        name: "Attendance Analytics",
        href: "/attendance/drilldown",
        icon: BarChart,
        roles: ["super_admin", "college_admin", "teacher"],
      },
      {
        name: "Staff Attendance",
        href: "/attendance/staff",
        icon: ClipboardList,
        roles: ["super_admin", "college_admin"],
      },
    ],
  },

  // ================= EXAMINATIONS (ADMIN + TEACHER) =================
  {
    group: "Examinations",
    icon: PenTool,
    roles: ["super_admin", "college_admin", "teacher"],
    items: [
      {
        name: "Exams",
        href: "/exams/exams",
        icon: PenTool,
        roles: ["super_admin", "college_admin", "teacher"],
      },
      {
        name: "Exam Types",
        href: "/exams/types",
        icon: PenTool,
        roles: ["super_admin", "college_admin"],
      },
      {
        name: "Exam Schedules",
        href: "/exams/schedules",
        icon: Calendar,
        roles: ["super_admin", "college_admin", "teacher"],
      },
      {
        name: "Marks Entry",
        href: "/exams/marks-entry",
        icon: PenTool,
        roles: ["teacher"], // Teacher-specific marks entry
      },
      {
        name: "Marking",
        href: "/exams/marking",
        icon: CheckSquare,
        roles: ["teacher"], // Teacher-specific marking
      },
      {
        name: "Grade Sheets",
        href: "/exams/grade-sheets",
        icon: FileText,
        roles: ["teacher"], // Teacher can view grade sheets
      },
      {
        name: "Marks Registers",
        href: "/exams/marks-registers",
        icon: FileText,
        roles: ["super_admin", "college_admin", "teacher"],
      },
      {
        name: "Progress Cards",
        href: "/exams/progress-cards",
        icon: FileText,
        roles: ["super_admin", "college_admin", "teacher"],
      },
      {
        name: "Tabulation Sheets",
        href: "/exams/tabulation-sheets",
        icon: FileText,
        roles: ["super_admin", "college_admin"],
      },
    ],
  },

  // ================= FEES (ADMIN + STUDENT) =================
  {
    group: "Fees",
    icon: CreditCard,
    roles: ["super_admin", "college_admin", "student", "parent", "central_manager", "clerk"],
    items: [
      {
        name: "Fee Setup",
        href: "/fees/setup",
        icon: Settings,
        roles: ["super_admin", "college_admin"],
      },
      {
        name: "Fee Collection",
        href: "/fees/collection",
        icon: Wallet,
        roles: ["super_admin", "college_admin", "clerk"],
      },
      {
        name: "Fee Adjustments",
        href: "/fees/adjustments",
        icon: Percent,
        roles: ["super_admin", "college_admin"],
      },
      {
        name: "Fee Reports",
        href: "/fees/reports",
        icon: FileText,
        roles: ["super_admin", "college_admin", "clerk"],
      },
      {
        name: "My Fees",
        href: "/fees/my-fees",
        icon: CreditCard,
        roles: ["student", "parent"],
      },
    ],
  },

  // ================= LIBRARY (ADMIN + TEACHER + STAFF) =================
  {
    group: "Library",
    icon: Library,
    roles: ["super_admin", "college_admin", "teacher", "staff", "library_manager"],
    items: [
      {
        name: "Books",
        href: "/library/books",
        icon: BookOpen,
        roles: ["super_admin", "college_admin", "teacher", "staff", "library_manager"],
      },
      {
        name: "Book Categories",
        href: "/library/categories",
        icon: FileText,
        roles: ["super_admin", "college_admin", "staff", "library_manager"],
      },
      {
        name: "Book Issues",
        href: "/library/issues",
        icon: ClipboardList,
        roles: ["super_admin", "college_admin", "staff", "library_manager"],
      },
      {
        name: "Book Returns",
        href: "/library/returns",
        icon: ClipboardList,
        roles: ["super_admin", "college_admin", "staff", "library_manager"],
      },
      {
        name: "Library Fines",
        href: "/library/fines",
        icon: CreditCard,
        roles: ["super_admin", "college_admin", "accountant", "library_manager"],
      },
      {
        name: "Library Members",
        href: "/library/members",
        icon: Users,
        roles: ["super_admin", "college_admin", "staff", "library_manager"],
      },
      {
        name: "My Books",
        href: "/library/my-books",
        icon: BookOpen,
        roles: ["teacher"],
      },
    ],
  },

  // ================= HOSTEL (ADMIN + STAFF + HOSTEL WARDEN) =================
  {
    group: "Hostel",
    icon: Building2,
    roles: ["super_admin", "college_admin", "staff", "hostel_warden", "hostel_manager"],
    items: [
      {
        name: "Hostels",
        href: "/hostel/hostels",
        icon: Building2,
        roles: ["super_admin", "college_admin", "staff", "hostel_warden", "hostel_manager"],
      },
      {
        name: "Rooms & Beds",
        href: "/hostel/rooms",
        icon: DoorClosed,
        roles: ["super_admin", "college_admin", "staff", "hostel_warden", "hostel_manager"],
      },
      {
        name: "Allocations",
        href: "/hostel/allocations",
        icon: Users,
        roles: ["super_admin", "college_admin", "staff", "hostel_warden", "hostel_manager"],
      },
      {
        name: "Fee Management",
        href: "/hostel/fees",
        icon: CreditCard,
        roles: ["super_admin", "college_admin", "staff", "hostel_warden", "hostel_manager"],
      },
      {
        name: "Room Types",
        href: "/hostel/room-types",
        icon: Package,
        roles: ["super_admin", "college_admin", "staff", "hostel_warden", "hostel_manager"],
      },
    ],
  },

  // ================= HR (ADMIN + HR) =================
  {
    group: "HR",
    icon: Briefcase,
    roles: ["super_admin", "college_admin", "hr"],
    items: [
      {
        name: "Leave Management",
        href: "/hr/leave",
        icon: FileText,
        roles: ["super_admin", "college_admin", "hr"],
      },
      {
        name: "Salary Structures",
        href: "/hr/salary-structures",
        icon: CreditCard,
        roles: ["super_admin", "college_admin", "hr"],
      },
      {
        name: "Salary Components",
        href: "/hr/salary-components",
        icon: CreditCard,
        roles: ["super_admin", "college_admin", "hr"],
      },
      {
        name: "Deductions",
        href: "/hr/deductions",
        icon: CreditCard,
        roles: ["super_admin", "college_admin", "hr"],
      },
      {
        name: "Payrolls",
        href: "/hr/payrolls",
        icon: CreditCard,
        roles: ["super_admin", "college_admin", "hr"],
      },
      {
        name: "Payroll Items",
        href: "/hr/payroll-items",
        icon: CreditCard,
        roles: ["super_admin", "college_admin", "hr"],
      },
      {
        name: "Payslips",
        href: "/hr/payslips",
        icon: FileText,
        roles: ["super_admin", "college_admin", "hr"],
      },
    ],
  },

  // ================= REPORTS (ADMIN + TEACHER) =================
  {
    group: "Reports",
    icon: BarChart,
    roles: ["super_admin", "college_admin", "teacher"],
    items: [
      {
        name: "Generated Reports",
        href: "/reports/generated",
        icon: BarChart,
        roles: ["super_admin", "college_admin", "teacher"],
      },
      {
        name: "Report Templates",
        href: "/reports/templates",
        icon: FileText,
        roles: ["super_admin", "college_admin"],
      },
      {
        name: "Saved Reports",
        href: "/reports/saved",
        icon: FileText,
        roles: ["super_admin", "college_admin", "teacher"],
      },
    ],
  },

  // ================= FINANCE (ADMIN) =================
  {
    group: "Finance",
    icon: CreditCard,
    roles: ["super_admin", "college_admin"],
    items: [
      {
        name: "Finance Dashboard",
        href: "/finance/dashboard",
        icon: BarChart,
        roles: ["super_admin", "college_admin"],
      },
      {
        name: "Fee Analysis",
        href: "/finance/drilldown",
        icon: BarChart3,
        roles: ["super_admin", "college_admin"],
      },
      {
        name: "Department Summary",
        href: "/finance/app-summary",
        icon: BarChart,
        roles: ["super_admin", "college_admin"],
      },
      {
        name: "Transactions",
        href: "/finance/transactions",
        icon: FileText,
        roles: ["super_admin", "college_admin"],
      },
      {
        name: "Reports",
        href: "/finance/reports",
        icon: BarChart,
        roles: ["super_admin", "college_admin"],
      },
      {
        name: "Other Expenses",
        href: "/finance/other-expenses",
        icon: CreditCard,
        roles: ["super_admin", "college_admin"],
      },
    ],
  },

  // ================= ACCOUNTANT (ACCOUNTANT & ADMIN) =================
  {
    group: "Accountant",
    icon: CreditCard,
    roles: ["super_admin", "college_admin", "accountant"],
    items: [
      {
        name: "Income Dashboard",
        href: "/income-dashboard",
        icon: BarChart,
        roles: ["super_admin", "college_admin"], // Only admins see it here, accountants see it separately
      },
      {
        name: "Fee Collections",
        href: "/accountant/fee-collections",
        icon: CreditCard,
        roles: ["super_admin", "college_admin", "accountant"],
      },
      {
        name: "Store Sales",
        href: "/accountant/store-sales",
        icon: ShoppingCart,
        roles: ["super_admin", "college_admin", "accountant"],
      },
      {
        name: "Fee Fines",
        href: "/accountant/fee-fines",
        icon: FileText,
        roles: ["super_admin", "college_admin", "accountant"],
      },
      {
        name: "Library Fines",
        href: "/accountant/library-fines",
        icon: BookOpen,
        roles: ["super_admin", "college_admin", "accountant"],
      },

      {
        name: "Receipts",
        href: "/accountant/receipts",
        icon: FileText,
        roles: ["super_admin", "college_admin", "accountant"],
      },
    ],
  },

  // ================= STORE - WORKFLOW FIRST =================
  {
    group: "Store",
    icon: Store,
    roles: ["super_admin", "college_admin", "staff", "store_manager", "central_manager"],
    items: [
      {
        name: "Indents",
        href: "/store/indents-pipeline",
        icon: ClipboardList,
        roles: ["super_admin", "college_admin", "staff", "store_manager", "central_manager"],
      },
      {
        name: "Transfers",
        href: "/store/transfers-workflow",
        icon: Send,
        roles: ["super_admin", "college_admin", "staff", "store_manager", "central_manager"],
      },
      {
        name: "Procurement Pipeline",
        href: "/store/procurement-pipeline",
        icon: ShoppingCart,
        roles: ["super_admin", "central_manager"],
      },
      {
        name: "Procurement Drill-Down",
        href: "/store/drilldown",
        icon: BarChart3,
        roles: ["super_admin", "central_manager"],
      },
      {
        name: "Requirements",
        href: "/procurement/requirements",
        icon: ClipboardList,
        roles: ["super_admin", "central_manager"],
      },
      {
        name: "Quotations",
        href: "/procurement/quotations",
        icon: FileText,
        roles: ["super_admin", "central_manager"],
      },
      {
        name: "Purchase Orders",
        href: "/procurement/purchase-orders",
        icon: ShoppingCart,
        roles: ["super_admin", "central_manager"],
      },
      {
        name: "Goods Receipts",
        href: "/procurement/goods-receipts",
        icon: Package,
        roles: ["super_admin", "central_manager"],
      },
      {
        name: "Inspections",
        href: "/procurement/inspections",
        icon: CheckSquare,
        roles: ["super_admin", "central_manager"],
      },
      {
        name: "College Stores",
        href: "/store/college-stores",
        icon: Building2,
        roles: ["super_admin", "college_admin", "store_manager"],
      },

      {
        name: "Store Hierarchy",
        href: "/store/hierarchy",
        icon: Building2,
        roles: ["super_admin"],
      },
      {
        name: "Store Items",
        href: "/store/items",
        icon: Package,
        roles: ["super_admin", "college_admin", "staff", "store_manager", "central_manager"],
      },
      {
        name: "Categories",
        href: "/store/categories",
        icon: FileText,
        roles: ["super_admin", "college_admin", "staff", "store_manager", "central_manager"],
      },
      {
        name: "Central Stores",
        href: "/store/central-stores",
        icon: Building2,
        roles: ["super_admin", "central_manager"],
      },
      {
        name: "Central Inventory",
        href: "/store/central-inventory",
        icon: Package,
        roles: ["super_admin", "central_manager"],
      },
      {
        name: "Material Issues",
        href: "/store/material-issues",
        icon: Send,
        roles: ["super_admin", "central_manager"],
      },
      {
        name: "Sales",
        href: "/store/sales",
        icon: ShoppingCart,
        roles: ["super_admin", "college_admin", "store_manager", "central_manager"],
      },
      {
        name: "Vendors",
        href: "/store/vendors",
        icon: Users,
        roles: ["super_admin", "college_admin", "store_manager", "central_manager"],
      },
      {
        name: "Stock Receipts",
        href: "/store/stock-receipts",
        icon: ClipboardList,
        roles: ["super_admin", "college_admin", "store_manager", "central_manager"],
      },
      {
        name: "Approvals",
        href: "/store/approvals",
        icon: CheckSquare,
        roles: ["super_admin", "college_admin", "central_manager"],
      },
    ],
  },

  // ================= COMMUNICATION (ALL) =================
  {
    group: "Communication",
    icon: MessageSquare,
    roles: ["super_admin", "college_admin", "teacher", "student", "parent", "store_manager", "staff", "central_manager", "hostel_warden", "hostel_manager", "clerk", "construction_head", "jr_engineer"],
    items: [
      // {
      //   name: "Communication Center",
      //   href: "/communication",
      //   icon: MessageSquare,
      //   roles: ["super_admin", "college_admin"], // Admin communication center
      // },
      // {
      //   name: "Teacher Messages",
      //   href: "/communication/teacher",
      //   icon: MessageSquare,
      //   roles: ["teacher"], // Teacher communication
      // },
      // {
      //   name: "Messages",
      //   href: "/communication/student",
      //   icon: MessageSquare,
      //   roles: ["student"], // Student communication
      // },
      {
        name: "Notices",
        href: "/communication/notices",
        icon: Bell,
        roles: ["super_admin", "college_admin", "teacher", "student", "parent", "store_manager", "staff", "central_manager", "hostel_warden", "hostel_manager", "clerk", "construction_head", "jr_engineer"], // All can view
      },
      {
        name: "Bulk Messages",
        href: "/communication/bulk-messages",
        icon: Send,
        roles: ["super_admin", "college_admin", "teacher", "student", "staff", "central_manager", "hostel_warden", "hostel_manager"],
      },
      {
        name: "Chats",
        href: "/communication/chats",
        icon: Mail,
        roles: ["super_admin", "college_admin", "teacher", "student", "store_manager", "staff", "central_manager", "hostel_warden", "hostel_manager"],
      },
      {
        name: "Events",
        href: "/communication/events",
        icon: Calendar,
        roles: ["super_admin", "college_admin", "teacher", "student", "store_manager", "central_manager", "hostel_warden", "hostel_manager"],
      },
      {
        name: "Event Registrations",
        href: "/communication/event-registrations",
        icon: Users,
        roles: ["super_admin", "college_admin"],
      },
      {
        name: "Message Logs",
        href: "/communication/message-logs",
        icon: FileText,
        roles: ["super_admin", "college_admin"],
      },
      {
        name: "Notification Rules",
        href: "/communication/notification-rules",
        icon: Settings,
        roles: ["super_admin", "college_admin"],
      },
      {
        name: "Message Templates",
        href: "/communication/message-templates",
        icon: FileText,
        roles: ["super_admin", "college_admin"],
      },
    ],
  },

  // ================= PRINT (ADMIN + STAFF) =================
  {
    group: "Print",
    icon: Printer,
    roles: ["super_admin", "college_admin", "staff", "clerk"],
    items: [
      {
        name: "Create Docs",
        href: "/print/configuration",
        icon: Settings,
        roles: ["super_admin", "college_admin"],
      },
      {
        name: "Categories",
        href: "/print/categories",
        icon: FolderTree,
        roles: ["super_admin", "college_admin", "staff", "clerk"],
      },
      {
        name: "Templates",
        href: "/print/templates",
        icon: FileText,
        roles: ["super_admin", "college_admin", "staff", "clerk"],
      },
      {
        name: "Documents",
        href: "/print/documents",
        icon: Printer,
        roles: ["super_admin", "college_admin", "staff", "clerk"],
      },
      {
        name: "Approvals",
        href: "/print/approvals",
        icon: CheckCircle,
        roles: ["super_admin"], // CEO only
      },
      {
        name: "Bulk Jobs",
        href: "/print/bulk-jobs",
        icon: ClipboardList,
        roles: ["super_admin", "college_admin", "staff", "clerk"],
      },
    ],
  },

  // ================= CONSTRUCTION (ADMIN + CONSTRUCTION HEAD + JR ENGINEER) =================
  {
    group: "Construction",
    icon: HardHat,
    roles: ["super_admin", "college_admin", "construction_head", "jr_engineer"],
    items: [
      {
        name: "Dashboard",
        href: "/construction/dashboard",
        icon: HardHat,
        roles: ["super_admin", "college_admin"],
      },
      {
        name: "Projects",
        href: "/construction/projects",
        icon: Building2,
        roles: ["super_admin", "college_admin", "construction_head", "jr_engineer"],
      },
      {
        name: "Daily Reports",
        href: "/construction/daily-reports",
        icon: ClipboardList,
        roles: ["super_admin", "college_admin", "construction_head", "jr_engineer"],
      },
      {
        name: "Photos",
        href: "/construction/photos",
        icon: Camera,
        roles: ["super_admin", "college_admin", "construction_head", "jr_engineer"],
      },
      {
        name: "Milestones",
        href: "/construction/milestones",
        icon: Flag,
        roles: ["super_admin", "college_admin", "construction_head"],
      },
      {
        name: "Expenses",
        href: "/construction/expenses",
        icon: Landmark,
        roles: ["super_admin", "college_admin", "construction_head", "jr_engineer"],
      },
      {
        name: "Material Requests",
        href: "/construction/material-requests",
        icon: Wrench,
        roles: ["super_admin", "college_admin", "construction_head", "jr_engineer"],
      },
      {
        name: "Geofence Violations",
        href: "/construction/geofence-violations",
        icon: MapPin,
        roles: ["super_admin", "college_admin", "construction_head"], // CEO/Head only
      },
    ],
  },

  // ================= PROFILE (ALL USERS) =================
  {
    group: "Profile",
    icon: Users,
    roles: ["super_admin", "college_admin", "teacher", "student", "parent", "staff", "hr", "store_manager", "library_manager", "accountant", "hostel_warden", "hostel_manager", "central_manager", "clerk", "construction_head", "jr_engineer"],
    items: [
      {
        name: "My Profile",
        href: "/profile",
        icon: Users,
        roles: ["super_admin", "college_admin", "teacher", "student", "parent", "staff", "hr", "store_manager", "library_manager", "accountant", "hostel_warden", "hostel_manager", "central_manager", "clerk", "construction_head", "jr_engineer"],
      },
      {
        name: "Settings",
        href: "/profile/settings",
        icon: Settings,
        roles: ["super_admin", "college_admin", "teacher", "student", "parent", "staff", "hr", "store_manager", "library_manager", "accountant", "hostel_warden", "hostel_manager", "central_manager", "clerk", "construction_head", "jr_engineer"],
      },
    ],
  },

  // ================= SYSTEM (ADMIN ONLY) =================
  {
    group: "System",
    icon: Settings,
    roles: ["super_admin", "college_admin"],
    items: [
      {
        name: "Organization Hierarchy",
        href: "/core/organization-hierarchy",
        icon: FolderTree,
        roles: ["super_admin", "college_admin"],
      },
      {
        name: "Users",
        href: "/accounts/users",
        icon: Users,
        roles: ["super_admin", "college_admin"],
      },
      {
        name: "Roles",
        href: "/accounts/roles",
        icon: Shield,
        roles: ["super_admin", "college_admin"],
      },
      {
        name: "User Role Assignments",
        href: "/accounts/user-roles",
        icon: Shield,
        roles: ["super_admin", "college_admin"],
      },
      {
        name: "Departments",
        href: "/accounts/departments",
        icon: Building2,
        roles: ["super_admin", "college_admin"],
      },
      {
        name: "User Profiles",
        href: "/accounts/user-profiles",
        icon: Users,
        roles: ["super_admin", "college_admin"],
      },
      {
        name: "Permissions",
        href: "/system/permissions",
        icon: Shield,
        roles: ["super_admin", "college_admin"],
      },
      {
        name: "Settings",
        href: "/settings",
        icon: Settings,
        roles: ["super_admin", "college_admin"],
      },
      {
        name: "Debug",
        href: "/debug",
        icon: Bug,
        roles: ["super_admin"],
      },
    ],
  },

  // ================= APPROVALS (ADMIN ONLY) =================
  {
    group: "Approvals",
    icon: CheckSquare,
    roles: ["super_admin", "college_admin"],
    items: [
      {
        name: "College Admin Approvals",
        href: "/store/college-approvals",
        icon: CheckSquare,
        roles: ["college_admin"],
      },
      {
        name: "Super Admin Approvals",
        href: "/store/super-admin-approvals",
        icon: CheckSquare,
        roles: ["super_admin"],
      },
      {
        name: "Pending Approvals",
        href: "/approvals/pending",
        icon: ClipboardList,
        roles: ["super_admin", "college_admin"],
      },
      {
        name: "My Requests",
        href: "/approvals/my-requests",
        icon: FileText,
        roles: ["super_admin", "college_admin"],
      },
    ],
  },
];

/**
 * Check if user has access based on roles or permissions
 */
function hasAccess(
  userType: string,
  userPermissions: string[] = [],
  item: { roles?: string[]; permissions?: string[]; requireAllPermissions?: boolean }
): boolean {
  // If no roles and no permissions specified, visible to all
  if (!item.roles && !item.permissions) return true;

  // Check role-based access (backward compatibility)
  if (item.roles && item.roles.includes(userType)) {
    return true;
  }

  // Check permission-based access
  if (item.permissions && item.permissions.length > 0) {
    if (item.requireAllPermissions) {
      // User must have ALL permissions
      return item.permissions.every(perm => userPermissions.includes(perm));
    } else {
      // User must have ANY permission
      return item.permissions.some(perm => userPermissions.includes(perm));
    }
  }

  return false;
}

/**
 * Filter sidebar groups and items based on user role and permissions
 *
 * @param userType - User's role (e.g., 'super_admin', 'teacher', 'hod')
 * @param userPermissions - Array of permission strings (e.g., ['view_students', 'manage_department'])
 */
export function getFilteredSidebarGroups(
  userType: string,
  userPermissions: string[] = []
): SidebarGroup[] {
  let filteredGroups = SIDEBAR_GROUPS.filter((group) => {
    // Filter groups by role or permissions
    return hasAccess(userType, userPermissions, group);
  })
    .map((group) => {
      // Filter items within the group
      const filteredItems = group.items.map((item) => {
        // If item has nested items, filter them recursively
        if (item.items && item.items.length > 0) {
          const filteredChildren = item.items.filter((subItem) =>
            hasAccess(userType, userPermissions, subItem)
          );
          return { ...item, items: filteredChildren };
        }
        return item;
      }).filter((item) => {
        // Filter the item itself
        const hasItemAccess = hasAccess(userType, userPermissions, item);

        // If it's a parent item (like Drilldown) and after filtering children it has none, 
        // and it doesn't have a direct link (href='#'), maybe we should hide it?
        // For now, let's just check access and if children exist if required.
        if (item.items && item.items.length === 0 && item.href === '#') {
          return false; // Hide parent if all children are hidden and parent is just a container
        }

        return hasItemAccess;
      });

      return {
        ...group,
        items: filteredItems,
      };
    })
    .filter((group) => group.items.length > 0); // Remove empty groups

  // Custom order for construction roles
  if (userType === 'construction_head' || userType === 'jr_engineer') {
    const desiredOrder = ['Dashboard', 'Construction', 'Communication', 'Profile'];
    filteredGroups.sort((a, b) => {
      let indexA = desiredOrder.indexOf(a.group);
      let indexB = desiredOrder.indexOf(b.group);
      if (indexA === -1) indexA = 99;
      if (indexB === -1) indexB = 99;
      return indexA - indexB;
    });
  }

  return filteredGroups;
}
