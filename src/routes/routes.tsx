import { ComponentType, lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { PageLoader } from "../components/common/LoadingComponents";

// Layouts & Guards
import { MainLayout } from "../components/layout/MainLayout";
import ProtectedRoute from "../components/ProtectedRoute";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import LoginPage from "../pages/Login";
import ResetPasswordPage from "../pages/ResetPasswordPage";

// ============================================================================
// LAZY LOADING HELPER
// ============================================================================

/**
 * Wrapper component for lazy-loaded routes with Suspense
 */
const LazyRoute = ({ component: Component }: { component: ComponentType }) => (
    <Suspense fallback={<PageLoader />}>
        <Component />
    </Suspense>
);

// ============================================================================
// LAZY LOADED PAGES
// ============================================================================

// Core Pages
const Dashboard = lazy(() => import("../pages/Dashboard").then(m => ({ default: m.Dashboard })));
const Settings = lazy(() => import("../pages/Settings"));
const DebugPage = lazy(() => import("../pages/debug/DebugPage").then(m => ({ default: m.DebugPage })));

// Core Module
const PermissionsPage = lazy(() => import("../pages/core/PermissionsPage"));
const CollegesPage = lazy(() => import("../pages/core/CollegesPage"));
const AcademicYearsPage = lazy(() => import("../pages/core/AcademicYearsPage"));
const AcademicSessionsPage = lazy(() => import("../pages/core/AcademicSessionsPage"));
const HolidaysPage = lazy(() => import("../pages/core/HolidaysPage"));
const WeekendsPage = lazy(() => import("../pages/core/WeekendsPage"));
const SystemSettingsPage = lazy(() => import("../pages/core/SystemSettingsPage"));
const NotificationSettingsPage = lazy(() => import("../pages/core/NotificationSettingsPage"));
const ActivityLogsPage = lazy(() => import("../pages/core/ActivityLogsPage"));
const OrganizationHierarchyPage = lazy(() => import("../pages/core/OrganizationHierarchyPage").then(m => ({ default: m.OrganizationHierarchyPage })));

// Accounts Module
const UsersPage = lazy(() => import("../pages/accounts/UsersPage"));
const RolesPage = lazy(() => import("../pages/accounts/RolesPage"));
const UserRolesPage = lazy(() => import("../pages/accounts/UserRolesPage"));
const DepartmentsPage = lazy(() => import("../pages/accounts/DepartmentsPage"));
const UserProfilesPage = lazy(() => import("../pages/accounts/UserProfilesPage"));
const RoleHierarchyPage = lazy(() => import("../pages/accounts/RoleHierarchyPage").then(m => ({ default: m.RoleHierarchyPage })));

// Academic Module
const FacultiesPage = lazy(() => import("../pages/academic").then(m => ({ default: m.FacultiesPage })));
const ProgramsPage = lazy(() => import("../pages/academic").then(m => ({ default: m.ProgramsPage })));
const ClassesPage = lazy(() => import("../pages/academic").then(m => ({ default: m.ClassesPage })));
const ClassDetailPage = lazy(() => import("../pages/academic/ClassDetailPage").then(m => ({ default: m.ClassDetailPage })));
const SectionsPage = lazy(() => import("../pages/academic").then(m => ({ default: m.SectionsPage })));
const SubjectsPage = lazy(() => import("../pages/academic").then(m => ({ default: m.SubjectsPage })));
const OptionalSubjectsPage = lazy(() => import("../pages/academic").then(m => ({ default: m.OptionalSubjectsPage })));
const SubjectAssignmentsPage = lazy(() => import("../pages/academic").then(m => ({ default: m.SubjectAssignmentsPage })));
const ClassroomsPage = lazy(() => import("../pages/academic").then(m => ({ default: m.ClassroomsPage })));
const ClassTimesPage = lazy(() => import("../pages/academic").then(m => ({ default: m.ClassTimesPage })));
const TimetablesPage = lazy(() => import("../pages/academic").then(m => ({ default: m.TimetablesPage })));
const LabSchedulesPage = lazy(() => import("../pages/academic").then(m => ({ default: m.LabSchedulesPage })));
const ClassTeachersPage = lazy(() => import("../pages/academic").then(m => ({ default: m.ClassTeachersPage })));
const AcademicSetupWizard = lazy(() => import("../pages/academic").then(m => ({ default: m.AcademicSetupWizard })));

// Academic Drill-Down Module
const CollegeOverview = lazy(() => import("../pages/drilldown").then(m => ({ default: m.CollegeOverview })));
const ProgramDrillDown = lazy(() => import("../pages/drilldown").then(m => ({ default: m.ProgramDrillDown })));
const ClassDrillDown = lazy(() => import("../pages/drilldown").then(m => ({ default: m.ClassDrillDown })));
const SectionDrillDown = lazy(() => import("../pages/drilldown").then(m => ({ default: m.SectionDrillDown })));
const SubjectDrillDown = lazy(() => import("../pages/drilldown").then(m => ({ default: m.SubjectDrillDown })));
const StudentProfile = lazy(() => import("../pages/drilldown").then(m => ({ default: m.StudentProfile })));

// Students Module
const StudentsPage = lazy(() => import("../pages/students").then(m => ({ default: m.StudentsPage })));
const StudentDetailPage = lazy(() => import("../pages/students/StudentDetailPage").then(m => ({ default: m.StudentDetailPage })));
const StudentCategoriesPage = lazy(() => import("../pages/students").then(m => ({ default: m.StudentCategoriesPage })));
const StudentGroupsPage = lazy(() => import("../pages/students").then(m => ({ default: m.StudentGroupsPage })));
const GuardiansPage = lazy(() => import("../pages/students").then(m => ({ default: m.GuardiansPage })));
const StudentAddressesPage = lazy(() => import("../pages/students").then(m => ({ default: m.StudentAddressesPage })));
const StudentDocumentsPage = lazy(() => import("../pages/students").then(m => ({ default: m.StudentDocumentsPage })));
const MedicalRecordsPage = lazy(() => import("../pages/students").then(m => ({ default: m.MedicalRecordsPage })));
const PreviousAcademicRecordsPage = lazy(() => import("../pages/students").then(m => ({ default: m.PreviousAcademicRecordsPage })));
const StudentPromotionsPage = lazy(() => import("../pages/students").then(m => ({ default: m.StudentPromotionsPage })));
const CertificatesPage = lazy(() => import("../pages/students").then(m => ({ default: m.CertificatesPage })));
const StudentIDCardsPage = lazy(() => import("../pages/students").then(m => ({ default: m.StudentIDCardsPage })));
const Student360ProfileSearchPage = lazy(() => import("../pages/students/Student360ProfileSearchPage").then(m => ({ default: m.Student360ProfileSearchPage })));
const Student360ProfileDetailPage = lazy(() => import("../pages/students/Student360ProfileDetailPage").then(m => ({ default: m.Student360ProfileDetailPage })));

// Student Portal (removed StudentDashboard - using unified /dashboard instead)
const MyProfile = lazy(() => import("../pages/student").then(m => ({ default: m.MyProfile })));
const Attendance = lazy(() => import("../pages/student").then(m => ({ default: m.Attendance })));
const Subjects = lazy(() => import("../pages/student").then(m => ({ default: m.Subjects })));
const Assignments = lazy(() => import("../pages/student").then(m => ({ default: m.Assignments })));
const Homework = lazy(() => import("../pages/student").then(m => ({ default: m.Homework })));
const Timetable = lazy(() => import("../pages/student").then(m => ({ default: m.Timetable })));
const ExamForm = lazy(() => import("../pages/student").then(m => ({ default: m.ExamForm })));
const Results = lazy(() => import("../pages/student").then(m => ({ default: m.Results })));
const ProgressCards = lazy(() => import("../pages/student").then(m => ({ default: m.ProgressCards })));
const Fees = lazy(() => import("../pages/student").then(m => ({ default: m.Fees })));
const StudentCertificates = lazy(() => import("../pages/student").then(m => ({ default: m.Certificates })));
const Notices = lazy(() => import("../pages/student").then(m => ({ default: m.Notices })));
const Support = lazy(() => import("../pages/student").then(m => ({ default: m.Support })));

// Teacher Portal
const TeacherAttendancePage = lazy(() => import("../pages/teacher").then(m => ({ default: m.TeacherAttendancePage })));
const TeacherStudentsPage = lazy(() => import("../pages/teacher").then(m => ({ default: m.TeacherStudentsPage })));
const TeacherSubjectsPage = lazy(() => import("../pages/teacher").then(m => ({ default: m.TeacherSubjectsPage })));
const SyllabusPage = lazy(() => import("../pages/teacher").then(m => ({ default: m.SyllabusPage })));

// Teachers Module
const TeachersPage = lazy(() => import("../pages/teachers/TeachersPage").then(m => ({ default: m.TeachersPage })));
const TeacherSchedule = lazy(() => import("../pages/teachers/TeacherSchedule").then(m => ({ default: m.TeacherSchedule })));
const TeacherAssignmentsPage = lazy(() => import("../pages/teachers/assignments/TeacherAssignmentsPage").then(m => ({ default: m.TeacherAssignmentsPage })));
const TeacherHomeworkPage = lazy(() => import("../pages/teachers/homework/TeacherHomeworkPage").then(m => ({ default: m.TeacherHomeworkPage })));
const TeacherHomeworkSubmissionsPage = lazy(() => import("../pages/teachers/homework/TeacherHomeworkSubmissionsPage").then(m => ({ default: m.TeacherHomeworkSubmissionsPage })));
const TeacherDetailPage = lazy(() => import("../pages/teachers/TeacherDetailPage").then(m => ({ default: m.TeacherDetailPage })));

// Assignments

const AssignmentsListPage = lazy(() => import("../pages/assignments").then(m => ({ default: m.AssignmentsListPage })));
const SubmissionsPage = lazy(() => import("../pages/assignments").then(m => ({ default: m.SubmissionsPage })));

// Approvals Module
const PendingApprovalsPage = lazy(() => import("../pages/approvals/PendingApprovalsPage"));
const MyRequestsPage = lazy(() => import("../pages/approvals/MyRequestsPage"));
const ApprovalDetailPage = lazy(() => import("../pages/approvals/ApprovalDetailPage"));

// Examinations Module
const ExamsPage = lazy(() => import("../pages/exams/ExamsPage"));
const ExamTypesPage = lazy(() => import("../pages/exams/ExamTypesPage"));
const ExamSchedulesPage = lazy(() => import("../pages/exams/ExamSchedulesPage"));
const MarksEntryPage = lazy(() => import("../pages/exams/MarksEntryPage"));
const GradeSheetsPage = lazy(() => import("../pages/exams/GradeSheetsPage"));
const MarksRegistersPage = lazy(() => import("../pages/exams/MarksRegistersPage"));
const ProgressCardsPage = lazy(() => import("../pages/exams/ProgressCardsPage"));
const TabulationSheetsPage = lazy(() => import("../pages/exams/TabulationSheetsPage"));
const CreateTestPage = lazy(() => import("../pages/exams/CreateTestPage"));
const MarkingPage = lazy(() => import("../pages/exams/MarkingPage"));
const MarkingRegisterPage = lazy(() => import("../pages/exams/MarkingRegisterPage"));

// Attendance Module
const StudentAttendancePage = lazy(() => import("../pages/attendance/StudentAttendancePage"));
const StaffAttendancePage = lazy(() => import("../pages/attendance/StaffAttendancePage"));
const SubjectAttendancePage = lazy(() => import("../pages/attendance/SubjectAttendancePage"));
const AttendanceNotificationsPage = lazy(() => import("../pages/attendance/AttendanceNotificationsPage"));
const AttendanceMarkingPage = lazy(() => import("../pages/attendance/AttendanceMarkingPage"));

const MyAttendancePage = lazy(() => import("../pages/attendance/MyAttendancePage"));
const AttendanceCollegeOverviewPage = lazy(() => import("../pages/attendance/drilldown/AttendanceCollegeOverviewPage").then(m => ({ default: m.AttendanceCollegeOverviewPage })));
const AttendanceProgramDrillDownPage = lazy(() => import("../pages/attendance/drilldown/AttendanceProgramDrillDownPage").then(m => ({ default: m.AttendanceProgramDrillDownPage })));
const AttendanceClassDrillDownPage = lazy(() => import("../pages/attendance/drilldown/AttendanceClassDrillDownPage").then(m => ({ default: m.AttendanceClassDrillDownPage })));
const AttendanceSectionDrillDownPage = lazy(() => import("../pages/attendance/drilldown/AttendanceSectionDrillDownPage").then(m => ({ default: m.AttendanceSectionDrillDownPage })));
const AttendanceStudentDrillDownPage = lazy(() => import("../pages/attendance/drilldown/AttendanceStudentDrillDownPage").then(m => ({ default: m.AttendanceStudentDrillDownPage })));
const AttendanceSubjectDrillDownPage = lazy(() => import("../pages/attendance/drilldown/AttendanceSubjectDrillDownPage").then(m => ({ default: m.AttendanceSubjectDrillDownPage })));
const AttendanceLowAttendanceAlertsPage = lazy(() => import("../pages/attendance/drilldown/AttendanceLowAttendanceAlertsPage").then(m => ({ default: m.AttendanceLowAttendanceAlertsPage })));

// Fees Module - Consolidated Pages
const FeeSetupPage = lazy(() => import("../pages/fees/FeeSetupPage"));
const FeeCollectionPage = lazy(() => import("../pages/fees/FeeCollectionPage"));
const FeeAdjustmentsPage = lazy(() => import("../pages/fees/FeeAdjustmentsPage"));
const FeeReportsPage = lazy(() => import("../pages/fees/FeeReportsPage"));

// Library Module
const BooksPage = lazy(() => import("../pages/library/BooksPage"));
const BookCategoriesPage = lazy(() => import("../pages/library/BookCategoriesPage"));
const LibraryMembersPage = lazy(() => import("../pages/library/LibraryMembersPage"));
const BookIssuesPage = lazy(() => import("../pages/library/BookIssuesPage"));
const BookReturnsPage = lazy(() => import("../pages/library/BookReturnsPage"));
const MyBooksPage = lazy(() => import("../pages/library/MyBooksPage"));
const LibraryFinesPage = lazy(() => import("../pages/library/LibraryFinesPage"));
// const LibraryStats = lazy(() => import("../components/dashboard/sections/LibraryStats"));

// Hostel Module
const HostelsPage = lazy(() => import("../pages/hostel").then(m => ({ default: m.HostelsPage })));
const RoomTypesPage = lazy(() => import("../pages/hostel").then(m => ({ default: m.RoomTypesPage })));
const RoomsPage = lazy(() => import("../pages/hostel").then(m => ({ default: m.RoomsPage })));
const AllocationsPage = lazy(() => import("../pages/hostel").then(m => ({ default: m.AllocationsPage })));
const BedsPage = lazy(() => import("../pages/hostel").then(m => ({ default: m.BedsPage })));
const FeesPage = lazy(() => import("../pages/hostel").then(m => ({ default: m.FeesPage })));

// HR Module
const DeductionsPage = lazy(() => import("../pages/hr/DeductionsPage"));
const LeaveTypesPage = lazy(() => import("../pages/hr/LeaveTypesPage"));
const LeaveApplicationsPage = lazy(() => import("../pages/hr/LeaveApplicationsPage"));
const LeaveApprovalsPage = lazy(() => import("../pages/hr/LeaveApprovalsPage"));
const LeaveBalancesPage = lazy(() => import("../pages/hr/LeaveBalancesPage"));
const LeaveManagementPage = lazy(() => import("../pages/hr/LeaveManagementPage"));
const SalaryStructuresPage = lazy(() => import("../pages/hr/SalaryStructuresPage"));
const SalaryComponentsPage = lazy(() => import("../pages/hr/SalaryComponentsPage"));
const PayrollsPage = lazy(() => import("../pages/hr/PayrollsPage"));
const PayrollItemsPage = lazy(() => import("../pages/hr/PayrollItemsPage"));
const PayslipsPage = lazy(() => import("../pages/hr/PayslipsPage"));

// Reports Module
const ReportTemplatesPage = lazy(() => import("../pages/reports/ReportTemplatesPage"));
const GeneratedReportsPage = lazy(() => import("../pages/reports/GeneratedReportsPage"));
const SavedReportsPage = lazy(() => import("../pages/reports/SavedReportsPage"));

// Profile Module
const ProfilePage = lazy(() => import("../pages/profile/ProfilePage"));
const ProfileSettingsPage = lazy(() => import("../pages/profile/ProfileSettingsPage"));

// Communication Module
const CommunicationPage = lazy(() => import("../pages/communication/CommunicationPage"));
const StudentCommunicationPage = lazy(() => import("../pages/communication/StudentCommunicationPage"));
const TeacherCommunicationPage = lazy(() => import("../pages/communication/TeacherCommunicationPage"));
const BulkMessagesPage = lazy(() => import("../pages/communication").then(m => ({ default: m.BulkMessagesPage })));
const ChatsPage = lazy(() => import("../pages/communication").then(m => ({ default: m.ChatsPage })));
const ChatPage = lazy(() => import("../pages/ChatPage").then(m => ({ default: m.ChatPage })));
const EventsPage = lazy(() => import("../pages/communication").then(m => ({ default: m.EventsPage })));
const EventRegistrationsPage = lazy(() => import("../pages/communication").then(m => ({ default: m.EventRegistrationsPage })));
const MessageLogsPage = lazy(() => import("../pages/communication").then(m => ({ default: m.MessageLogsPage })));
const NoticesPage = lazy(() => import("../pages/communication").then(m => ({ default: m.NoticesPage })));
const NotificationRulesPage = lazy(() => import("../pages/communication").then(m => ({ default: m.NotificationRulesPage })));
const MessageTemplatesPage = lazy(() => import("../pages/communication").then(m => ({ default: m.MessageTemplatesPage })));
const NoticeVisibilityPage = lazy(() => import("../pages/communication").then(m => ({ default: m.NoticeVisibilityPage })));

// Store Module
const StoreItemsPage = lazy(() => import("../pages/store/StoreItemsPage"));
const CategoriesPage = lazy(() => import("../pages/store/CategoriesPage"));
const CreditsPage = lazy(() => import("../pages/store/CreditsPage"));
const SalesPage = lazy(() => import("../pages/store/SalesPage"));
const PrintRequestsPage = lazy(() => import("../pages/store/PrintRequestsPage"));
const SaleItemsPage = lazy(() => import("../pages/store/SaleItemsPage"));
const VendorsPage = lazy(() => import("../pages/store/VendorsPage"));
const StockReceiptsPage = lazy(() => import("../pages/store/StockReceiptsPage"));
const CollegeStoresPage = lazy(() => import("../pages/store/CollegeStoresPage").then(m => ({ default: m.CollegeStoresPage })));
const CentralStoresPage = lazy(() => import("../pages/store/CentralStoresPage").then(m => ({ default: m.CentralStoresPage })));
const CentralInventoryPage = lazy(() => import("../pages/store/CentralInventoryPage").then(m => ({ default: m.CentralInventoryPage })));
const MaterialIssuesPage = lazy(() => import("../pages/store/MaterialIssuesPage").then(m => ({ default: m.MaterialIssuesPage })));
const StoreIndentsPage = lazy(() => import("../pages/store/StoreIndentsPage").then(m => ({ default: m.StoreIndentsPage })));
const CollegeAdminApprovalsPage = lazy(() => import("../pages/store/CollegeAdminApprovalsPage").then(m => ({ default: m.CollegeAdminApprovalsPage })));
const SuperAdminApprovalsPage = lazy(() => import("../pages/store/SuperAdminApprovalsPage").then(m => ({ default: m.SuperAdminApprovalsPage })));
const MaterialIssuancePage = lazy(() => import("../pages/store/MaterialIssuancePage").then(m => ({ default: m.MaterialIssuancePage })));

// New Workflow-First Store Pages
const IndentsPipelinePage = lazy(() => import("../pages/store/IndentsPipelinePage").then(m => ({ default: m.IndentsPipelinePage })));
const TransfersWorkflowPage = lazy(() => import("../pages/store/TransfersWorkflowPage").then(m => ({ default: m.TransfersWorkflowPage })));
const UnifiedApprovalsPage = lazy(() => import("../pages/store/UnifiedApprovalsPage").then(m => ({ default: m.UnifiedApprovalsPage })));
const InventoryPage = lazy(() => import("../pages/store/InventoryPage").then(m => ({ default: m.InventoryPage })));
const StoreHierarchyPage = lazy(() => import("../pages/store/StoreHierarchyPage").then(m => ({ default: m.StoreHierarchyPage })));

// Procurement Module
const RequirementsPage = lazy(() => import("../pages/store/procurement/RequirementsPage").then(m => ({ default: m.RequirementsPage })));
const QuotationsPage = lazy(() => import("../pages/store/procurement/QuotationsPage").then(m => ({ default: m.QuotationsPage })));
const PurchaseOrdersPage = lazy(() => import("../pages/store/procurement/PurchaseOrdersPage").then(m => ({ default: m.PurchaseOrdersPage })));
const GoodsReceiptsPage = lazy(() => import("../pages/store/procurement/GoodsReceiptsPage").then(m => ({ default: m.GoodsReceiptsPage })));
const InspectionsPage = lazy(() => import("../pages/store/procurement/InspectionsPage").then(m => ({ default: m.InspectionsPage })));
const ProcurementPipelinePage = lazy(() => import("../pages/store/procurement/ProcurementPipelinePage").then(m => ({ default: m.ProcurementPipelinePage })));

// Procurement Drill-Down Pages
const ProcurementOverviewPage = lazy(() => import("../pages/store/drilldown/ProcurementOverviewPage").then(m => ({ default: m.ProcurementOverviewPage })));
const ProcurementCentralStoreDrillDownPage = lazy(() => import("../pages/store/drilldown/ProcurementCentralStoreDrillDownPage").then(m => ({ default: m.ProcurementCentralStoreDrillDownPage })));
const ProcurementRequirementDrillDownPage = lazy(() => import("../pages/store/drilldown/ProcurementRequirementDrillDownPage").then(m => ({ default: m.ProcurementRequirementDrillDownPage })));
const ProcurementPODrillDownPage = lazy(() => import("../pages/store/drilldown/ProcurementPODrillDownPage").then(m => ({ default: m.ProcurementPODrillDownPage })));
const ProcurementGRNDrillDownPage = lazy(() => import("../pages/store/drilldown/ProcurementGRNDrillDownPage").then(m => ({ default: m.ProcurementGRNDrillDownPage })));
const ProcurementInventoryDrillDownPage = lazy(() => import("../pages/store/drilldown/ProcurementInventoryDrillDownPage").then(m => ({ default: m.ProcurementInventoryDrillDownPage })));
const ProcurementSupplierPerformancePage = lazy(() => import("../pages/store/drilldown/ProcurementSupplierPerformancePage").then(m => ({ default: m.ProcurementSupplierPerformancePage })));



// Library Student Module
const StudentLibraryPage = lazy(() => import("../pages/library/StudentLibraryPage"));

// Finance Module
const FinanceDashboardPage = lazy(() => import("../pages/finance/FinanceDashboardPage"));
const FinanceTransactionsPage = lazy(() => import("../pages/finance/FinanceTransactionsPage"));
const OtherExpensesPage = lazy(() => import("../pages/finance/OtherExpensesPage"));
const FinanceAppSummaryPage = lazy(() => import("../pages/finance/FinanceAppSummaryPage"));
const FinanceReportsPage = lazy(() => import("../pages/finance/FinanceReportsPage"));

// Fee Drill-Down Pages
const FeeCollegeOverview = lazy(() => import("../pages/finance/drilldown").then(m => ({ default: m.FeeCollegeOverview })));
const FeeAcademicYearDrillDown = lazy(() => import("../pages/finance/drilldown").then(m => ({ default: m.FeeAcademicYearDrillDown })));
const FeeProgramDrillDown = lazy(() => import("../pages/finance/drilldown").then(m => ({ default: m.FeeProgramDrillDown })));
const FeeClassDrillDown = lazy(() => import("../pages/finance/drilldown").then(m => ({ default: m.FeeClassDrillDown })));
const FeeTypeDrillDown = lazy(() => import("../pages/finance/drilldown").then(m => ({ default: m.FeeTypeDrillDown })));
const FeeStudentDrillDown = lazy(() => import("../pages/finance/drilldown").then(m => ({ default: m.FeeStudentDrillDown })));

// Accountant Module
const IncomeDashboardPage = lazy(() => import("../pages/accountant/IncomeDashboardPage"));
const AccountantFeeCollectionsPage = lazy(() => import("../pages/accountant/FeeCollectionsPage"));
const AccountantStoreSalesPage = lazy(() => import("../pages/accountant/StoreSalesPage"));
const AccountantFeeFinesPage = lazy(() => import("../pages/accountant/FeeFinesPage"));
const AccountantLibraryFinesPage = lazy(() => import("../pages/accountant/LibraryFinesPage"));
const AccountantReceiptsPage = lazy(() => import("../pages/accountant/ReceiptsPage"));

// Print Template Module
const PrintConfigurationPage = lazy(() => import("../pages/print").then(m => ({ default: m.PrintConfigurationPage })));
const TemplateCategoriesPage = lazy(() => import("../pages/print").then(m => ({ default: m.TemplateCategoriesPage })));
const PrintTemplatesPage = lazy(() => import("../pages/print").then(m => ({ default: m.PrintTemplatesPage })));
const PrintDocumentsPage = lazy(() => import("../pages/print").then(m => ({ default: m.PrintDocumentsPage })));
const PrintApprovalsPage = lazy(() => import("../pages/print").then(m => ({ default: m.PrintApprovalsPage })));
const BulkPrintJobsPage = lazy(() => import("../pages/print").then(m => ({ default: m.BulkPrintJobsPage })));

// Construction Module
const ConstructionDashboardPage = lazy(() => import("../pages/construction").then(m => ({ default: m.ConstructionDashboardPage })));
const ConstructionProjectsPage = lazy(() => import("../pages/construction").then(m => ({ default: m.ConstructionProjectsPage })));
const ProjectDetailPage = lazy(() => import("../pages/construction").then(m => ({ default: m.ProjectDetailPage })));
const DailyReportsPage = lazy(() => import("../pages/construction").then(m => ({ default: m.DailyReportsPage })));
const ConstructionPhotosPage = lazy(() => import("../pages/construction").then(m => ({ default: m.ConstructionPhotosPage })));
const MilestonesPage = lazy(() => import("../pages/construction").then(m => ({ default: m.MilestonesPage })));
const ConstructionExpensesPage = lazy(() => import("../pages/construction").then(m => ({ default: m.ConstructionExpensesPage })));
const MaterialRequestsConstructionPage = lazy(() => import("../pages/construction").then(m => ({ default: m.MaterialRequestsPage })));
const GeofenceViolationsPage = lazy(() => import("../pages/construction").then(m => ({ default: m.GeofenceViolationsPage })));

// Jr Engineer Portal
const JrEngineerLogin = lazy(() => import("../pages/jr-engineer").then(m => ({ default: m.JrEngineerLogin })));
const JrCollegeSelector = lazy(() => import("../pages/jr-engineer").then(m => ({ default: m.CollegeSelector })));
const JrEngineerLayout = lazy(() => import("../pages/jr-engineer").then(m => ({ default: m.JrEngineerLayout })));
const JrMyProjects = lazy(() => import("../pages/jr-engineer").then(m => ({ default: m.MyProjects })));
const JrDailyReports = lazy(() => import("../pages/jr-engineer").then(m => ({ default: m.DailyReports })));
const JrPhotoUpload = lazy(() => import("../pages/jr-engineer").then(m => ({ default: m.PhotoUpload })));
const JrLabourLogs = lazy(() => import("../pages/jr-engineer").then(m => ({ default: m.LabourLogs })));
const JrExpenses = lazy(() => import("../pages/jr-engineer").then(m => ({ default: m.Expenses })));
const JrMaterialRequests = lazy(() => import("../pages/jr-engineer").then(m => ({ default: m.MaterialRequests })));

// Clerk Portal
const ClerkLogin = lazy(() => import("../pages/clerk").then(m => ({ default: m.ClerkLogin })));
const ClerkCollegeSelector = lazy(() => import("../pages/clerk").then(m => ({ default: m.ClerkCollegeSelector })));
const ClerkLayout = lazy(() => import("../pages/clerk").then(m => ({ default: m.ClerkLayout })));
const ClerkStudents = lazy(() => import("../pages/clerk").then(m => ({ default: m.ClerkStudents })));
const ClerkFees = lazy(() => import("../pages/clerk").then(m => ({ default: m.ClerkFees })));
const ClerkPrintTemplates = lazy(() => import("../pages/clerk").then(m => ({ default: m.ClerkPrintTemplates })));
const ClerkPrintDocuments = lazy(() => import("../pages/clerk").then(m => ({ default: m.ClerkPrintDocuments })));
const ClerkCommunication = lazy(() => import("../pages/clerk").then(m => ({ default: m.ClerkCommunication })));

export default function AppRoutes() {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
                <Route path="/" element={<MainLayout />}>
                    <Route index element={<Navigate to="/dashboard" replace />} />

                    {/* Core */}
                    <Route path="dashboard" element={<LazyRoute component={Dashboard} />} />
                    <Route path="settings" element={<LazyRoute component={Settings} />} />
                    <Route path="debug" element={<LazyRoute component={DebugPage} />} />

                    {/* System Module */}
                    <Route path="system/permissions" element={<LazyRoute component={PermissionsPage} />} />

                    {/* Core Module */}
                    <Route path="core/colleges" element={<LazyRoute component={CollegesPage} />} />
                    <Route path="core/academic-years" element={<LazyRoute component={AcademicYearsPage} />} />
                    <Route path="core/academic-sessions" element={<LazyRoute component={AcademicSessionsPage} />} />
                    <Route path="core/holidays" element={<LazyRoute component={HolidaysPage} />} />
                    <Route path="core/weekends" element={<LazyRoute component={WeekendsPage} />} />
                    <Route path="core/system-settings" element={<LazyRoute component={SystemSettingsPage} />} />
                    <Route path="core/notification-settings" element={<LazyRoute component={NotificationSettingsPage} />} />
                    <Route path="core/activity-logs" element={<LazyRoute component={ActivityLogsPage} />} />
                    <Route path="core/permissions" element={<LazyRoute component={PermissionsPage} />} />
                    <Route path="core/organization-hierarchy" element={<LazyRoute component={OrganizationHierarchyPage} />} />

                    {/* Accounts Module */}
                    <Route path="accounts/users" element={<LazyRoute component={UsersPage} />} />
                    <Route path="accounts/roles" element={<LazyRoute component={RolesPage} />} />
                    <Route path="accounts/user-roles" element={<LazyRoute component={UserRolesPage} />} />
                    <Route path="accounts/departments" element={<LazyRoute component={DepartmentsPage} />} />
                    <Route path="accounts/user-profiles" element={<LazyRoute component={UserProfilesPage} />} />
                    <Route path="accounts/hierarchy" element={<LazyRoute component={RoleHierarchyPage} />} />

                    {/* Students Module */}
                    <Route path="students/list" element={<LazyRoute component={StudentsPage} />} />
                    <Route path="students/:id" element={<LazyRoute component={StudentDetailPage} />} />
                    <Route path="students/categories" element={<LazyRoute component={StudentCategoriesPage} />} />
                    <Route path="students/groups" element={<LazyRoute component={StudentGroupsPage} />} />
                    <Route path="students/guardians" element={<LazyRoute component={GuardiansPage} />} />
                    <Route path="students/addresses" element={<LazyRoute component={StudentAddressesPage} />} />
                    <Route path="students/documents" element={<LazyRoute component={StudentDocumentsPage} />} />
                    <Route path="students/medical-records" element={<LazyRoute component={MedicalRecordsPage} />} />
                    <Route path="students/previous-records" element={<LazyRoute component={PreviousAcademicRecordsPage} />} />
                    <Route path="students/promotions" element={<LazyRoute component={StudentPromotionsPage} />} />
                    <Route path="students/certificates" element={<LazyRoute component={CertificatesPage} />} />
                    <Route path="students/id-cards" element={<LazyRoute component={StudentIDCardsPage} />} />
                    <Route path="students/360-profile" element={<LazyRoute component={Student360ProfileSearchPage} />} />
                    <Route path="students/360-profile/:studentId" element={<LazyRoute component={Student360ProfileDetailPage} />} />

                    {/* Academic Module */}
                    <Route path="academic/faculties" element={<LazyRoute component={FacultiesPage} />} />
                    <Route path="academic/programs" element={<LazyRoute component={ProgramsPage} />} />
                    <Route path="academic/classes" element={<LazyRoute component={ClassesPage} />} />
                    <Route path="academic/classes/:id" element={<LazyRoute component={ClassDetailPage} />} />
                    <Route path="academic/sections" element={<LazyRoute component={SectionsPage} />} />
                    <Route path="academic/subjects" element={<LazyRoute component={SubjectsPage} />} />
                    <Route path="academic/optional-subjects" element={<LazyRoute component={OptionalSubjectsPage} />} />
                    <Route path="academic/subject-assignments" element={<LazyRoute component={SubjectAssignmentsPage} />} />
                    <Route path="academic/classrooms" element={<LazyRoute component={ClassroomsPage} />} />
                    <Route path="academic/class-times" element={<LazyRoute component={ClassTimesPage} />} />
                    <Route path="academic/timetables" element={<LazyRoute component={TimetablesPage} />} />
                    <Route path="academic/lab-schedules" element={<LazyRoute component={LabSchedulesPage} />} />
                    <Route path="academic/class-teachers" element={<LazyRoute component={ClassTeachersPage} />} />
                    <Route path="academic/setup-wizard" element={<LazyRoute component={AcademicSetupWizard} />} />

                    {/* Academic Drill-Down Dashboard */}
                    <Route path="drilldown" element={<LazyRoute component={CollegeOverview} />} />
                    <Route path="drilldown/program/:programId" element={<LazyRoute component={ProgramDrillDown} />} />
                    <Route path="drilldown/class/:classId" element={<LazyRoute component={ClassDrillDown} />} />
                    <Route path="drilldown/section/:sectionId" element={<LazyRoute component={SectionDrillDown} />} />
                    <Route path="drilldown/subject/:subjectId" element={<LazyRoute component={SubjectDrillDown} />} />
                    <Route path="drilldown/student/:studentId" element={<LazyRoute component={StudentProfile} />} />

                    {/* Student Portal */}
                    <Route path="student/profile" element={<LazyRoute component={MyProfile} />} />
                    <Route path="student/academics/attendance" element={<LazyRoute component={Attendance} />} />
                    <Route path="student/academics/subjects" element={<LazyRoute component={Subjects} />} />
                    <Route path="student/academics/assignments" element={<LazyRoute component={Assignments} />} />
                    <Route path="student/academics/homework" element={<LazyRoute component={Homework} />} />
                    <Route path="student/academics/timetable" element={<LazyRoute component={Timetable} />} />
                    <Route path="student/examinations/exam-form" element={<LazyRoute component={ExamForm} />} />
                    <Route path="student/examinations/results" element={<LazyRoute component={Results} />} />
                    <Route path="student/examinations/progress-cards" element={<LazyRoute component={ProgressCards} />} />
                    <Route path="student/fees" element={<LazyRoute component={Fees} />} />
                    <Route path="student/certificates" element={<LazyRoute component={StudentCertificates} />} />
                    <Route path="student/notices" element={<LazyRoute component={Notices} />} />
                    <Route path="student/support" element={<LazyRoute component={Support} />} />

                    {/* Teacher Portal */}
                    <Route path="teacher/attendance" element={<LazyRoute component={TeacherAttendancePage} />} />
                    <Route path="teacher/students" element={<LazyRoute component={TeacherStudentsPage} />} />
                    <Route path="teacher/subjects" element={<LazyRoute component={TeacherSubjectsPage} />} />
                    <Route path="teacher/syllabus" element={<LazyRoute component={SyllabusPage} />} />

                    {/* Teachers Module */}
                    <Route path="teachers" element={<LazyRoute component={TeachersPage} />} />
                    <Route path="teachers/:id" element={<LazyRoute component={TeacherDetailPage} />} />
                    <Route path="teachers/schedule" element={<LazyRoute component={TeacherSchedule} />} />
                    <Route path="teachers/assignments" element={<LazyRoute component={TeacherAssignmentsPage} />} />
                    <Route path="teachers/homework" element={<LazyRoute component={TeacherHomeworkPage} />} />
                    <Route path="teachers/homework-submissions" element={<LazyRoute component={TeacherHomeworkSubmissionsPage} />} />

                    {/* Assignments */}

                    <Route path="assignments/list" element={<LazyRoute component={AssignmentsListPage} />} />
                    <Route path="assignments/submissions" element={<LazyRoute component={SubmissionsPage} />} />

                    {/* Approvals Module */}
                    <Route path="approvals/pending" element={<LazyRoute component={PendingApprovalsPage} />} />
                    <Route path="approvals/my-requests" element={<LazyRoute component={MyRequestsPage} />} />
                    <Route path="approvals/:id" element={<LazyRoute component={ApprovalDetailPage} />} />

                    {/* Examinations Module */}
                    <Route path="exams/exams" element={<LazyRoute component={ExamsPage} />} />
                    <Route path="exams/types" element={<LazyRoute component={ExamTypesPage} />} />
                    <Route path="exams/schedules" element={<LazyRoute component={ExamSchedulesPage} />} />
                    <Route path="exams/marks-entry" element={<LazyRoute component={MarksEntryPage} />} />
                    <Route path="exams/grade-sheets" element={<LazyRoute component={GradeSheetsPage} />} />
                    <Route path="exams/marks-registers" element={<LazyRoute component={MarksRegistersPage} />} />
                    <Route path="exams/progress-cards" element={<LazyRoute component={ProgressCardsPage} />} />
                    <Route path="exams/tabulation-sheets" element={<LazyRoute component={TabulationSheetsPage} />} />
                    <Route path="exams/create-test" element={<LazyRoute component={CreateTestPage} />} />
                    <Route path="exams/marking" element={<LazyRoute component={MarkingPage} />} />
                    <Route path="exams/marking/:questionPaperId" element={<LazyRoute component={MarkingRegisterPage} />} />

                    {/* Attendance Module */}
                    <Route path="attendance/students" element={<LazyRoute component={StudentAttendancePage} />} />
                    <Route path="attendance/staff" element={<LazyRoute component={StaffAttendancePage} />} />
                    <Route path="attendance/subjects" element={<LazyRoute component={SubjectAttendancePage} />} />
                    <Route path="attendance/notifications" element={<LazyRoute component={AttendanceNotificationsPage} />} />
                    <Route path="attendance/marking" element={<LazyRoute component={AttendanceMarkingPage} />} />
                    <Route path="attendance/drilldown" element={<LazyRoute component={AttendanceCollegeOverviewPage} />} />
                    <Route path="attendance/drilldown/low-attendance-alerts" element={<LazyRoute component={AttendanceLowAttendanceAlertsPage} />} />
                    <Route path="attendance/drilldown/:programId/program" element={<LazyRoute component={AttendanceProgramDrillDownPage} />} />
                    <Route path="attendance/drilldown/:classId/class" element={<LazyRoute component={AttendanceClassDrillDownPage} />} />
                    <Route path="attendance/drilldown/:sectionId/section" element={<LazyRoute component={AttendanceSectionDrillDownPage} />} />
                    <Route path="attendance/drilldown/:subjectId/subject" element={<LazyRoute component={AttendanceSubjectDrillDownPage} />} />
                    <Route path="attendance/drilldown/:studentId/student" element={<LazyRoute component={AttendanceStudentDrillDownPage} />} />



                    <Route path="attendance/my-attendance" element={<LazyRoute component={MyAttendancePage} />} />

                    {/* Fees Module - Consolidated */}
                    <Route path="fees/setup" element={<LazyRoute component={FeeSetupPage} />} />
                    <Route path="fees/collection" element={<LazyRoute component={FeeCollectionPage} />} />
                    <Route path="fees/adjustments" element={<LazyRoute component={FeeAdjustmentsPage} />} />
                    <Route path="fees/reports" element={<LazyRoute component={FeeReportsPage} />} />
                    <Route path="fees/my-fees" element={<LazyRoute component={Fees} />} />

                    {/* Library Module */}
                    <Route path="library/books" element={<LazyRoute component={BooksPage} />} />
                    <Route path="library/categories" element={<LazyRoute component={BookCategoriesPage} />} />
                    <Route path="library/members" element={<LazyRoute component={LibraryMembersPage} />} />
                    <Route path="library/issues" element={<LazyRoute component={BookIssuesPage} />} />
                    <Route path="library/returns" element={<LazyRoute component={BookReturnsPage} />} />
                    <Route path="library/fines" element={<LazyRoute component={LibraryFinesPage} />} />
                    <Route path="library/my-books" element={<LazyRoute component={MyBooksPage} />} />
                    <Route path="library/student" element={<LazyRoute component={StudentLibraryPage} />} />

                    {/* Hostel Module */}
                    <Route path="hostel/hostels" element={<LazyRoute component={HostelsPage} />} />
                    <Route path="hostel/room-types" element={<LazyRoute component={RoomTypesPage} />} />
                    <Route path="hostel/rooms" element={<LazyRoute component={RoomsPage} />} />
                    <Route path="hostel/allocations" element={<LazyRoute component={AllocationsPage} />} />
                    <Route path="hostel/beds" element={<LazyRoute component={BedsPage} />} />
                    <Route path="hostel/fees" element={<LazyRoute component={FeesPage} />} />

                    {/* HR Module */}
                    <Route path="hr/deductions" element={<LazyRoute component={DeductionsPage} />} />
                    {/* Unified Leave Management Hub */}
                    <Route path="hr/leave" element={<LazyRoute component={LeaveManagementPage} />} />
                    {/* Legacy routes redirect to unified hub */}
                    <Route path="hr/leave-types" element={<Navigate to="/hr/leave" replace />} />
                    <Route path="hr/leave-applications" element={<Navigate to="/hr/leave" replace />} />
                    <Route path="hr/leave-approvals" element={<Navigate to="/hr/leave" replace />} />
                    <Route path="hr/leave-balances" element={<Navigate to="/hr/leave" replace />} />
                    <Route path="hr/salary-structures" element={<LazyRoute component={SalaryStructuresPage} />} />
                    <Route path="hr/salary-components" element={<LazyRoute component={SalaryComponentsPage} />} />
                    <Route path="hr/payrolls" element={<LazyRoute component={PayrollsPage} />} />
                    <Route path="hr/payroll-items" element={<LazyRoute component={PayrollItemsPage} />} />
                    <Route path="hr/payslips" element={<LazyRoute component={PayslipsPage} />} />

                    {/* Reports Module */}
                    <Route path="reports/templates" element={<LazyRoute component={ReportTemplatesPage} />} />
                    <Route path="reports/generated" element={<LazyRoute component={GeneratedReportsPage} />} />
                    <Route path="reports/saved" element={<LazyRoute component={SavedReportsPage} />} />

                    {/* Print Template Module */}
                    <Route path="print/configuration" element={<LazyRoute component={PrintConfigurationPage} />} />
                    <Route path="print/categories" element={<LazyRoute component={TemplateCategoriesPage} />} />
                    <Route path="print/templates" element={<LazyRoute component={PrintTemplatesPage} />} />
                    <Route path="print/templates/new" element={<LazyRoute component={PrintConfigurationPage} />} />
                    <Route path="print/templates/:id/edit" element={<LazyRoute component={PrintConfigurationPage} />} />
                    <Route path="print/documents" element={<LazyRoute component={PrintDocumentsPage} />} />
                    <Route path="print/approvals" element={<LazyRoute component={PrintApprovalsPage} />} />
                    <Route path="print/bulk-jobs" element={<LazyRoute component={BulkPrintJobsPage} />} />

                    {/* Construction Module */}
                    <Route path="construction/dashboard" element={<LazyRoute component={ConstructionDashboardPage} />} />
                    <Route path="construction/projects" element={<LazyRoute component={ConstructionProjectsPage} />} />
                    <Route path="construction/projects/:id" element={<LazyRoute component={ProjectDetailPage} />} />
                    <Route path="construction/daily-reports" element={<LazyRoute component={DailyReportsPage} />} />
                    <Route path="construction/photos" element={<LazyRoute component={ConstructionPhotosPage} />} />
                    <Route path="construction/milestones" element={<LazyRoute component={MilestonesPage} />} />
                    <Route path="construction/expenses" element={<LazyRoute component={ConstructionExpensesPage} />} />
                    <Route path="construction/material-requests" element={<LazyRoute component={MaterialRequestsConstructionPage} />} />
                    <Route path="construction/geofence-violations" element={<LazyRoute component={GeofenceViolationsPage} />} />

                    {/* Profile Module */}
                    <Route path="profile" element={<LazyRoute component={ProfilePage} />} />
                    <Route path="profile/settings" element={<LazyRoute component={ProfileSettingsPage} />} />

                    {/* Communication Module */}
                    <Route path="communication/bulk-messages" element={<LazyRoute component={BulkMessagesPage} />} />
                    <Route path="communication/chats" element={<LazyRoute component={ChatsPage} />} />
                    <Route path="communication/chat-sse" element={<LazyRoute component={ChatPage} />} />
                    <Route path="communication/events" element={<LazyRoute component={EventsPage} />} />
                    <Route path="communication/event-registrations" element={<LazyRoute component={EventRegistrationsPage} />} />
                    <Route path="communication/message-logs" element={<LazyRoute component={MessageLogsPage} />} />
                    <Route path="communication/notices" element={<LazyRoute component={NoticesPage} />} />
                    <Route path="communication/notification-rules" element={<LazyRoute component={NotificationRulesPage} />} />
                    <Route path="communication/message-templates" element={<LazyRoute component={MessageTemplatesPage} />} />
                    <Route path="communication/notice-visibility" element={<LazyRoute component={NoticeVisibilityPage} />} />

                    {/* Store Module - Workflow-First Pages */}
                    <Route path="store/indents-pipeline" element={<LazyRoute component={IndentsPipelinePage} />} />
                    <Route path="store/transfers-workflow" element={<LazyRoute component={TransfersWorkflowPage} />} />
                    <Route path="store/approvals" element={<LazyRoute component={UnifiedApprovalsPage} />} />
                    <Route path="store/inventory" element={<LazyRoute component={InventoryPage} />} />
                    <Route path="store/procurement-pipeline" element={<LazyRoute component={ProcurementPipelinePage} />} />

                    {/* Procurement Drill-Down */}
                    <Route path="store/drilldown" element={<LazyRoute component={ProcurementOverviewPage} />} />
                    <Route path="store/drilldown/:storeId/central-store" element={<LazyRoute component={ProcurementCentralStoreDrillDownPage} />} />
                    <Route path="store/drilldown/:storeId/inventory" element={<LazyRoute component={ProcurementInventoryDrillDownPage} />} />
                    <Route path="store/drilldown/requirement/:reqId" element={<LazyRoute component={ProcurementRequirementDrillDownPage} />} />
                    <Route path="store/drilldown/purchase-order/:poId" element={<LazyRoute component={ProcurementPODrillDownPage} />} />
                    <Route path="store/drilldown/grn/:grnId" element={<LazyRoute component={ProcurementGRNDrillDownPage} />} />
                    <Route path="store/drilldown/supplier-performance" element={<LazyRoute component={ProcurementSupplierPerformancePage} />} />

                    {/* Store Module - Legacy/Admin Pages */}
                    <Route path="store/hierarchy" element={<LazyRoute component={StoreHierarchyPage} />} />
                    <Route path="store/college-stores" element={<LazyRoute component={CollegeStoresPage} />} />
                    <Route path="store/central-stores" element={<LazyRoute component={CentralStoresPage} />} />
                    <Route path="store/central-inventory" element={<LazyRoute component={CentralInventoryPage} />} />
                    <Route path="store/material-issues" element={<LazyRoute component={MaterialIssuesPage} />} />
                    <Route path="store/indents" element={<LazyRoute component={StoreIndentsPage} />} />
                    <Route path="store/college-approvals" element={<LazyRoute component={CollegeAdminApprovalsPage} />} />
                    <Route path="store/super-admin-approvals" element={<LazyRoute component={SuperAdminApprovalsPage} />} />
                    <Route path="store/material-issuance" element={<LazyRoute component={MaterialIssuancePage} />} />
                    <Route path="store/items" element={<LazyRoute component={StoreItemsPage} />} />
                    <Route path="store/categories" element={<LazyRoute component={CategoriesPage} />} />
                    <Route path="store/credits" element={<LazyRoute component={CreditsPage} />} />

                    {/* Procurement Module */}
                    <Route path="procurement/requirements" element={<LazyRoute component={RequirementsPage} />} />
                    <Route path="procurement/quotations" element={<LazyRoute component={QuotationsPage} />} />
                    <Route path="procurement/purchase-orders" element={<LazyRoute component={PurchaseOrdersPage} />} />
                    <Route path="procurement/goods-receipts" element={<LazyRoute component={GoodsReceiptsPage} />} />
                    <Route path="procurement/inspections" element={<LazyRoute component={InspectionsPage} />} />
                    <Route path="store/sales" element={<LazyRoute component={SalesPage} />} />
                    <Route path="store/sale-items" element={<LazyRoute component={SaleItemsPage} />} />
                    <Route path="store/print-requests" element={<LazyRoute component={PrintRequestsPage} />} />
                    <Route path="store/vendors" element={<LazyRoute component={VendorsPage} />} />
                    <Route path="store/stock-receipts" element={<LazyRoute component={StockReceiptsPage} />} />

                    {/* Finance Module */}
                    <Route path="finance/dashboard" element={<LazyRoute component={FinanceDashboardPage} />} />
                    <Route path="finance/transactions" element={<LazyRoute component={FinanceTransactionsPage} />} />
                    <Route path="finance/other-expenses" element={<LazyRoute component={OtherExpensesPage} />} />
                    <Route path="finance/app-summary" element={<LazyRoute component={FinanceAppSummaryPage} />} />
                    <Route path="finance/reports" element={<LazyRoute component={FinanceReportsPage} />} />

                    {/* Fee Drill-Down Dashboard */}
                    <Route path="finance/drilldown" element={<LazyRoute component={FeeCollegeOverview} />} />
                    <Route path="finance/drilldown/:yearId" element={<LazyRoute component={FeeAcademicYearDrillDown} />} />
                    <Route path="finance/drilldown/:yearId/program/:programId" element={<LazyRoute component={FeeProgramDrillDown} />} />
                    <Route path="finance/drilldown/:yearId/program/:programId/class/:classId" element={<LazyRoute component={FeeClassDrillDown} />} />
                    <Route path="finance/drilldown/:yearId/program/:programId/class/:classId/fee-type/:feeTypeId" element={<LazyRoute component={FeeTypeDrillDown} />} />
                    <Route path="finance/drilldown/student/:studentId" element={<LazyRoute component={FeeStudentDrillDown} />} />

                    {/* Accountant Module */}
                    <Route path="income-dashboard" element={<LazyRoute component={IncomeDashboardPage} />} />
                    <Route path="accountant/fee-collections" element={<LazyRoute component={AccountantFeeCollectionsPage} />} />
                    <Route path="accountant/store-sales" element={<LazyRoute component={AccountantStoreSalesPage} />} />
                    <Route path="accountant/fee-fines" element={<LazyRoute component={AccountantFeeFinesPage} />} />
                    <Route path="accountant/library-fines" element={<LazyRoute component={AccountantLibraryFinesPage} />} />
                    <Route path="accountant/receipts" element={<LazyRoute component={AccountantReceiptsPage} />} />


                    {/* Demo Routes */}
                    <Route path="demo/tetris" element={<LazyRoute component={lazy(() => import("../pages/demo/TetrisDemoPage"))} />} />
                </Route>
            </Route>

            {/* Jr Engineer Portal - Standalone routes (outside MainLayout) */}
            <Route path="/jr-engineer/login" element={<LazyRoute component={JrEngineerLogin} />} />
            <Route path="/jr-engineer/select-college" element={<LazyRoute component={JrCollegeSelector} />} />
            <Route path="/jr-engineer" element={<LazyRoute component={JrEngineerLayout} />}>
                <Route index element={<Navigate to="/jr-engineer/projects" replace />} />
                <Route path="projects" element={<LazyRoute component={JrMyProjects} />} />
                <Route path="daily-reports" element={<LazyRoute component={JrDailyReports} />} />
                <Route path="photos" element={<LazyRoute component={JrPhotoUpload} />} />
                <Route path="labour-logs" element={<LazyRoute component={JrLabourLogs} />} />
                <Route path="expenses" element={<LazyRoute component={JrExpenses} />} />
                <Route path="material-requests" element={<LazyRoute component={JrMaterialRequests} />} />
            </Route>

            {/* Clerk Portal */}
            <Route path="/clerk/login" element={<LazyRoute component={ClerkLogin} />} />
            <Route path="/clerk/select-college" element={<LazyRoute component={ClerkCollegeSelector} />} />
            <Route path="/clerk" element={<LazyRoute component={ClerkLayout} />}>
                <Route index element={<Navigate to="/clerk/students" replace />} />
                <Route path="students" element={<LazyRoute component={ClerkStudents} />} />
                <Route path="fees" element={<LazyRoute component={ClerkFees} />} />
                <Route path="print-templates" element={<LazyRoute component={ClerkPrintTemplates} />} />
                <Route path="print-documents" element={<LazyRoute component={ClerkPrintDocuments} />} />
                <Route path="communication" element={<LazyRoute component={ClerkCommunication} />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
    );
}
