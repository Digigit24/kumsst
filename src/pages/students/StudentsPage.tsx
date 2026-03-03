/**
 * Students Page - Main students management page
 * Uses DataTable and DetailSidebar for CRUD operations
 */

import { FileSpreadsheet } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Column, DataTable, FilterConfig } from '../../components/common/DataTable';
import { DetailSidebar } from '../../components/common/DetailSidebar';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { useHierarchicalContext } from '../../contexts/HierarchicalContext';
import { usePermissions } from '../../contexts/PermissionsContext';
import { useSuperAdminContext } from '../../contexts/SuperAdminContext';
import { invalidateStudents, useStudentsSWR } from '../../hooks/swr';
import { useAuth } from '../../hooks/useAuth';
import { useContextClasses, useContextSections } from '../../hooks/useContextSelectors';
import { useDeleteStudent } from '../../hooks/useStudents';
import type { StudentFilters, StudentListItem } from '../../types/students.types';
import { isSuperAdmin } from '../../utils/auth.utils';
import { StudentExcelImport } from './components/StudentExcelImport';
import { StudentForm } from './components/StudentForm';
import { StudentCreationPipeline } from './forms/StudentCreationPipeline';

export const StudentsPage = () => {
    const navigate = useNavigate();

    // Initialize context data fetching
    useContextClasses();
    useContextSections();

    const {
        selectedClass, setSelectedClass, classes,
        selectedSection, setSelectedSection, sections
    } = useHierarchicalContext();
    const { permissions, isLoading: isLoadingPermissions } = usePermissions();
    const { selectedCollege } = useSuperAdminContext();
    const { user } = useAuth();

    const [filters, setFilters] = useState<StudentFilters>({ page: 1, page_size: 20 });

    // Apply global college selection for super admins
    // Memoized to prevent unnecessary re-renders and infinite loops
    const normalizedFilters: StudentFilters = useMemo(() => ({
        ...filters,
        college: isSuperAdmin(user as any) ? (selectedCollege || undefined) : (filters.college ? Number(filters.college) : undefined),
        current_class: selectedClass || undefined,
        current_section: selectedSection || undefined,
    }), [filters, selectedCollege, selectedClass, selectedSection, user]);

    const { data, isLoading, error, refresh } = useStudentsSWR(normalizedFilters);
    const deleteMutation = useDeleteStudent();

    const [sidebarMode, setSidebarMode] = useState<'view' | 'create' | 'edit'>('view');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<StudentListItem | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [wizardDialogOpen, setWizardDialogOpen] = useState(false);
    const [importSidebarOpen, setImportSidebarOpen] = useState(false);

    // Sync filters with context and reset page
    useEffect(() => {
        setFilters((prev) => ({
            ...prev,
            page: 1,
            // Ensure filters reflect context state (important for auto-resets)
            current_class: selectedClass || undefined,
            current_section: selectedSection || undefined,
        }));
    }, [selectedClass, selectedSection]);

    // Note: No need to manually refetch when selectedCollege changes
    // React Query automatically refetches when normalizedFilters changes
    // (selectedCollege is part of normalizedFilters)

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    // Define table columns
    const columns: Column<StudentListItem>[] = useMemo(() => [
        {
            key: 'admission_number',
            label: 'Admission No.',
            sortable: true,
            className: 'font-medium',
        },
        {
            key: 'full_name',
            label: 'Student Name',
            sortable: true,
            render: (student) => (
                <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8 border-2 border-background">
                        <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                            {getInitials(student.full_name)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <span className="font-medium">{student.full_name}</span>
                        <span className="text-xs text-muted-foreground">{student.registration_number}</span>
                    </div>
                </div>
            ),
        },
        {
            key: 'college_name',
            label: 'College',
            sortable: true,
            render: (student) => student.college_name || `College #${student.college}`,
        },
        {
            key: 'program_name',
            label: 'Program',
            sortable: true,
            render: (student) => (
                <Badge variant="secondary" className="transition-all hover:scale-105">{student.program_name}</Badge>
            ),
        },
        {
            key: 'current_class_name',
            label: 'Class',
            render: (student) => student.current_class_name || '-',
        },
        {
            key: 'email',
            label: 'Email',
            render: (student) => permissions?.canViewStudentSensitiveFields ? (
                <span className="text-sm">{student.email}</span>
            ) : (
                <span className="text-sm text-muted-foreground">Hidden</span>
            ),
        },
        {
            key: 'phone',
            label: 'Phone',
            render: (student) => permissions?.canViewStudentSensitiveFields
                ? student.phone || '-'
                : 'Hidden',
        },
        {
            key: 'is_active',
            label: 'Status',
            render: (student) => (
                <Badge variant={student.is_active ? 'success' : 'destructive'} className="transition-all">
                    {student.is_active ? 'Active' : 'Inactive'}
                </Badge>
            ),
        },
        {
            key: 'is_alumni',
            label: 'Alumni',
            render: (student) => student.is_alumni ? (
                <Badge variant="outline">Alumni</Badge>
            ) : null,
        },
    ], [permissions?.canViewStudentSensitiveFields]);

    // Define filter configuration
    const filterConfig: FilterConfig[] = [
        {
            name: 'current_class',
            label: 'Class',
            type: 'select',
            options: [
                ...classes.map(c => ({ value: String(c.id), label: c.name }))
            ],
        },
        {
            name: 'current_section',
            label: 'Section',
            type: 'select',
            options: [
                ...sections.map(s => ({ value: String(s.id), label: s.name }))
            ],
        },
        {
            name: 'is_active',
            label: 'Active Status',
            type: 'select',
            options: [
                { value: 'true', label: 'Active' },
                { value: 'false', label: 'Inactive' },
            ],
        },
        {
            name: 'is_alumni',
            label: 'Alumni Status',
            type: 'select',
            options: [
                { value: 'true', label: 'Alumni' },
                { value: 'false', label: 'Current Students' },
            ],
        },
        {
            name: 'gender',
            label: 'Gender',
            type: 'select',
            options: [
                { value: 'male', label: 'Male' },
                { value: 'female', label: 'Female' },
                { value: 'other', label: 'Other' },
            ],
        },
    ];

    const handleRowClick = (student: StudentListItem) => {
        navigate(`/students/${student.id}`);
    };

    const handleAdd = () => {
        if (!permissions?.canCreateStudents) {
            return;
        }
        setWizardDialogOpen(true);
    };

    const handleDelete = (student: StudentListItem) => {
        setSelectedStudent(student);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (selectedStudent) {
            await deleteMutation.mutate(selectedStudent.id);
            invalidateStudents();
            setDeleteDialogOpen(false);
            setSelectedStudent(null);
        }
    };

    const handleCloseSidebar = () => {
        setIsSidebarOpen(false);
    };

    const handleFormSuccess = () => {
        setIsSidebarOpen(false);
        invalidateStudents();
    };

    const handleWizardSubmit = () => {
        setWizardDialogOpen(false);
        invalidateStudents();
    };

    const handleWizardCancel = () => {
        setWizardDialogOpen(false);
    };

    const handleImportComplete = () => {
        setImportSidebarOpen(false);
        invalidateStudents();
    };

    return (
        <div className="p-4 md:p-6 animate-fade-in flex flex-col gap-6">
            <DataTable
                key={`datatable-${permissions?.canCreateStudents}-${selectedCollege}-${selectedClass}-${selectedSection}`}
                title="Students"
                description="Manage all student records, admissions, and information"
                data={data || { count: 0, next: null, previous: null, results: [] }}
                columns={columns}
                isLoading={isLoading || isLoadingPermissions}
                error={error?.message || null}
                onRefresh={refresh}
                onAdd={permissions?.canCreateStudents === true ? handleAdd : undefined}
                onDelete={handleDelete}
                onRowClick={handleRowClick}
                filters={filters}
                onFiltersChange={(newFilters) => {
                    setFilters(newFilters);
                    // Sync context
                    if (newFilters.current_class !== filters.current_class) {
                        setSelectedClass(newFilters.current_class ? Number(newFilters.current_class) : null);
                    }
                    if (newFilters.current_section !== filters.current_section) {
                        setSelectedSection(newFilters.current_section ? Number(newFilters.current_section) : null);
                    }
                }}
                filterConfig={filterConfig}
                searchPlaceholder="Search by name, admission number, email..."
                addButtonLabel="Add Student"
                customActions={
                    permissions?.canCreateStudents ? (
                        <Button
                            variant="outline"
                            onClick={() => setImportSidebarOpen(true)}
                        >
                            <FileSpreadsheet className="h-4 w-4 mr-2" />
                            Import from Excel
                        </Button>
                    ) : undefined
                }
            />

            {/* Create Sidebar */}
            {permissions?.canCreateStudents && (
                <DetailSidebar
                    isOpen={isSidebarOpen}
                    onClose={handleCloseSidebar}
                    title={sidebarMode === 'create' ? 'Add New Student' : 'Edit Student'}
                    mode={sidebarMode}
                    width="2xl"
                >
                    <StudentForm
                        mode={sidebarMode}
                        onSuccess={handleFormSuccess}
                        onCancel={handleCloseSidebar}
                    />
                </DetailSidebar>
            )}

            {/* Delete Confirmation */}
            <ConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                title="Delete Student"
                description={`Are you sure you want to delete ${selectedStudent?.full_name}? This action cannot be undone.`}
                confirmLabel="Delete"
                onConfirm={confirmDelete}
                loading={deleteMutation.isLoading}
            />

            {/* Student Creation Wizard Sidebar */}
            {permissions?.canCreateStudents && (
                <DetailSidebar
                    isOpen={wizardDialogOpen}
                    onClose={handleWizardCancel}
                    title="Create New Student"
                    subtitle="Complete the wizard to create a student account and record in one streamlined process"
                    mode="create"
                    width="3xl"
                >
                    <StudentCreationPipeline
                        onSubmit={handleWizardSubmit}
                        onCancel={handleWizardCancel}
                    />
                </DetailSidebar>
            )}

            {/* Student Excel Import Sidebar */}
            {permissions?.canCreateStudents && (
                <DetailSidebar
                    isOpen={importSidebarOpen}
                    onClose={() => setImportSidebarOpen(false)}
                    title="Import Students from Excel"
                    subtitle="Upload an Excel file to bulk-import student records"
                    mode="create"
                    width="3xl"
                >
                    <StudentExcelImport
                        onComplete={handleImportComplete}
                        onCancel={() => setImportSidebarOpen(false)}
                    />
                </DetailSidebar>
            )}
        </div>
    );
};
