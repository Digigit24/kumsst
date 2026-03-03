/**
 * SWR Hooks Index
 * Central export for all SWR-based data fetching hooks
 *
 * Usage:
 * ```tsx
 * import { useClassesSWR, useSubjectsSWR, invalidateClasses } from '@/hooks/swr';
 * ```
 */

// Base utilities
export {
  useSWRAPI,
  useSWRPaginated,
  generateCacheKey,
  swrKeys,
  dropdownSwrConfig,
  staticDataSwrConfig,
  invalidateCache,
  invalidateCaches,
  optimisticUpdate,
  type UseSWRResult,
  type UseSWRPaginatedResult,
} from '../useSWR';

// Core module hooks
export {
  useCollegesSWR,
  useCollegeSWR,
  useAcademicYearsSWR,
  useAcademicYearSWR,
  useCurrentAcademicYearSWR,
  useAcademicSessionsSWR,
  useHolidaysSWR,
  useWeekendsSWR,
  invalidateColleges,
  invalidateAcademicYears,
  invalidateAcademicSessions,
  invalidateHolidays,
  invalidateWeekends,
  invalidateAllCore,
} from '../useCoreSWR';

// Academic module hooks
export {
  useFacultiesSWR,
  useProgramsSWR,
  useClassesSWR,
  useSectionsSWR,
  useAllSectionsSWR,
  useSectionsFilteredByClass,
  useSubjectsSWR,
  useOptionalSubjectsSWR,
  useSubjectAssignmentsSWR,
  useClassroomsSWR,
  useClassTimesSWR,
  useTimetablesSWR,
  useLabSchedulesSWR,
  useClassTeachersSWR,
  invalidateFaculties,
  invalidatePrograms,
  invalidateClasses,
  invalidateSections,
  invalidateSubjects,
  invalidateOptionalSubjects,
  invalidateSubjectAssignments,
  invalidateClassrooms,
  invalidateClassTimes,
  invalidateTimetables,
  invalidateLabSchedules,
  invalidateClassTeachers,
  useAssignmentsSWR,
  invalidateAssignments,
  invalidateAllAcademic,
} from '../useAcademicSWR';

// Students module hooks
export {
  useStudentsSWR,
  useStudentCategoriesSWR,
  useStudentGroupsSWR,
  useGuardiansSWR,
  useStudentGuardiansSWR,
  useStudentAddressesSWR,
  useStudentDocumentsSWR,
  useStudentMedicalRecordsSWR,
  usePreviousAcademicRecordsSWR,
  useStudentPromotionsSWR,
  useCertificatesSWR,
  useStudentIDCardsSWR,
  invalidateStudents,
  invalidateStudentCategories,
  invalidateStudentGroups,
  invalidateGuardians,
  invalidateStudentGuardians,
  invalidateStudentAddresses,
  invalidateStudentDocuments,
  invalidateStudentMedicalRecords,
  invalidatePreviousAcademicRecords,
  invalidateStudentPromotions,
  invalidateCertificates,
  invalidateStudentIDCards,
  invalidateAllStudents,
} from '../useStudentsSWR';

// Fees module hooks
export {
  useFeeMastersSWR,
  useFeeStructuresSWR,
  useFeeDiscountsSWR,
  useFeesFinesSWR,
  useFeeCollectionsSWR,
  useFeeTypesSWR,
  useFeeGroupsSWR,
  useFeeInstallmentsSWR,
  useFeeReceiptsSWR,
  useStudentFeeDiscountsSWR,
  useFeeRefundsSWR,
  useFeeRemindersSWR,
  useBankPaymentsSWR,
  useOnlinePaymentsSWR,
  invalidateFeeMasters,
  invalidateFeeStructures,
  invalidateFeeDiscounts,
  invalidateFeeFines,
  invalidateFeeCollections,
  invalidateFeeTypes,
  invalidateFeeGroups,
  invalidateFeeInstallments,
  invalidateFeeReceipts,
  invalidateStudentFeeDiscounts,
  invalidateFeeRefunds,
  invalidateFeeReminders,
  invalidateBankPayments,
  invalidateOnlinePayments,
  invalidateAllFees,
} from '../useFeesSWR';

// Examination module hooks
export {
  useExamTypesSWR,
  useExamsSWR,
  useExamSchedulesSWR,
  useExamAttendanceSWR,
  useAdmitCardsSWR,
  useStudentMarksSWR,
  useMarksGradesSWR,
  useMarksRegistersSWR,
  useMarkSheetsSWR,
  useProgressCardsSWR,
  useTabulationSheetsSWR,
  useExamResultsSWR,
  invalidateExamTypes,
  invalidateExams,
  invalidateExamSchedules,
  invalidateExamAttendance,
  invalidateAdmitCards,
  invalidateStudentMarks,
  invalidateMarksGrades,
  invalidateMarksRegisters,
  invalidateMarkSheets,
  invalidateProgressCards,
  invalidateTabulationSheets,
  invalidateExamResults,
  invalidateAllExamination,
} from '../useExaminationSWR';

// Attendance module hooks
export {
  useStudentAttendanceSWR,
  useStaffAttendanceSWR,
  useSubjectAttendanceSWR,
  useAttendanceNotificationsSWR,
  invalidateStudentAttendance,
  invalidateStaffAttendance,
  invalidateSubjectAttendance,
  invalidateAttendanceNotifications,
  invalidateAllAttendance,
} from '../useAttendanceSWR';

// Store module hooks
export {
  useCategoriesSWR,
  useStoreItemsSWR,
  useSaleItemsSWR,
  useSalesSWR,
  useCreditsSWR,
  usePrintJobsSWR,
  useVendorsSWR,
  useStockReceiptsSWR,
  useCollegeStoresSWR,
  useCentralStoresSWR,
  useCentralInventorySWR,
  useMaterialIssuesSWR,
  useStoreIndentsSWR,
  useProcurementRequirementsSWR,
  useProcurementQuotationsSWR,
  useProcurementPurchaseOrdersSWR,
  useProcurementGoodsReceiptsSWR,
  useProcurementInspectionsSWR,
  invalidateCategories,
  invalidateStoreItems,
  invalidateSaleItems,
  invalidateSales,
  invalidateCredits,
  invalidatePrintJobs,
  invalidateVendors,
  invalidateStockReceipts,
  invalidateCollegeStores,
  invalidateCentralStores,
  invalidateCentralInventory,
  invalidateMaterialIssues,
  invalidateStoreIndents,
  invalidateProcurementRequirements,
  invalidateProcurementQuotations,
  invalidateProcurementPurchaseOrders,
  invalidateProcurementGoodsReceipts,
  invalidateProcurementInspections,
  invalidateAllStore,
} from '../useStoreSWR';

// HR module hooks
export {
  useDeductionsSWR,
  useLeaveTypesSWR,
  useLeaveApplicationsSWR,
  useLeaveApprovalsSWR,
  useLeaveBalancesSWR,
  useSalaryStructuresSWR,
  useSalaryComponentsSWR,
  usePayrollsSWR,
  usePayrollItemsSWR,
  usePayslipsSWR,
  invalidateDeductions,
  invalidateLeaveTypes,
  invalidateLeaveApplications,
  invalidateLeaveApprovals,
  invalidateLeaveBalances,
  invalidateSalaryStructures,
  invalidateSalaryComponents,
  invalidatePayrolls,
  invalidatePayrollItems,
  invalidatePayslips,
  invalidateAllHR,
} from '../useHRSWR';

// Library module hooks
export {
  useBookCategoriesSWR,
  useBooksSWR,
  useLibraryMembersSWR,
  useLibraryCardsSWR,
  useBookIssuesSWR,
  useBookReturnsSWR,
  useLibraryFinesSWR,
  useReservationsSWR,
  invalidateBookCategories,
  invalidateBooks,
  invalidateLibraryMembers,
  invalidateLibraryCards,
  invalidateBookIssues,
  invalidateBookReturns,
  invalidateLibraryFines,
  invalidateReservations,
  invalidateAllLibrary,
} from '../useLibrarySWR';

// Hostel module hooks
export {
  useHostelsSWR,
  useRoomTypesSWR,
  useRoomsSWR,
  useHostelAllocationsSWR,
  useHostelBedsSWR,
  useHostelFeesSWR,
  invalidateHostels,
  invalidateRoomTypes,
  invalidateRooms,
  invalidateHostelAllocations,
  invalidateHostelBeds,
  invalidateHostelFees,
  invalidateAllHostel,
} from '../useHostelSWR';

// Communication module hooks
export {
  useBulkMessagesSWR,
  useChatsSWR,
  useEventsSWR,
  useEventRegistrationsSWR,
  useMessageLogsSWR,
  useMessageTemplatesSWR,
  useNoticesSWR,
  useNoticeVisibilitySWR,
  useNotificationRulesSWR,
  invalidateBulkMessages,
  invalidateChats,
  invalidateEvents,
  invalidateEventRegistrations,
  invalidateMessageLogs,
  invalidateMessageTemplates,
  invalidateNotices,
  invalidateNoticeVisibility,
  invalidateNotificationRules,
  invalidateAllCommunication,
} from '../useCommunicationSWR';

// Assignments module hooks
export {
  useAssignmentsListSWR,
  useStudentAssignmentsListSWR,
  useAssignmentSubmissionsSWR,
  invalidateAssignmentsList,
  invalidateStudentAssignmentsList,
  invalidateAssignmentSubmissions,
  invalidateAllAssignmentsModule,
} from '../useAssignmentsSWR';

// Approvals module hooks
export {
  useApprovalsSWR,
  usePendingApprovalsSWR,
  useMyRequestsSWR,
  useApprovalNotificationsSWR,
  invalidateApprovals,
  invalidatePendingApprovals,
  invalidateMyRequests,
  invalidateApprovalNotifications,
  invalidateAllApprovals,
} from '../useApprovalsSWR';

// Teachers module hooks (from existing)
export {
  useTeachersSWR,
  useTeacherSWR,
  invalidateTeachers,
} from '../useTeachersSWR';

// Accounts module hooks (from existing)
export {
  useTeachersSWR as useAccountsTeachersSWR,
  useUsersSWR,
} from '../useAccountsSWR';
