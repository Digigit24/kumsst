/**
 * Teachers Page - Main teachers management page
 * Uses DataTable and DetailSidebar for CRUD operations
 */

import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Column, DataTable, FilterConfig } from '../../components/common/DataTable';
import { DetailSidebar } from '../../components/common/DetailSidebar';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import { usePermissions } from '../../contexts/PermissionsContext';
import { useSuperAdminContext } from '../../contexts/SuperAdminContext';
import { useClassesSWR } from '../../hooks/useAcademicSWR';
import { useAuth } from '../../hooks/useAuth';
import { useDeleteTeacher } from '../../hooks/useTeachers';
import { invalidateTeachers, useTeachersSWR } from '../../hooks/useTeachersSWR';
import type { TeacherFilters, TeacherListItem } from '../../types/teachers.types';
import { isSuperAdmin } from '../../utils/auth.utils';
import { TeacherCreationPipeline } from './forms/TeacherCreationPipeline';

const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

export const TeachersPage = () => {
    const navigate = useNavigate();
    const { permissions, isLoading: isLoadingPermissions } = usePermissions();
    const { selectedCollege } = useSuperAdminContext();
    const { user } = useAuth();

    const [filters, setFilters] = useState<TeacherFilters>({ page: 1, page_size: 20 });

    // Apply global college selection for super admins
    // Memoized to prevent unnecessary re-renders and infinite loops
    const normalizedFilters: TeacherFilters = useMemo(() => ({
        ...filters,
        college: isSuperAdmin(user as any) ? (selectedCollege || undefined) : (filters.college ? Number(filters.college) : undefined),
    }), [filters, selectedCollege, user]);

    const { data, isLoading, error } = useTeachersSWR(normalizedFilters);
    const { results: classes } = useClassesSWR({ is_active: true });
    const deleteMutation = useDeleteTeacher();

    const [sidebarMode, setSidebarMode] = useState<'view' | 'create' | 'edit'>('view');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [selectedTeacher, setSelectedTeacher] = useState<TeacherListItem | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [wizardDialogOpen, setWizardDialogOpen] = useState(false);

    // Define table columns
    const columns: Column<TeacherListItem>[] = useMemo(() => [
        {
            key: 'employee_id',
            label: 'Employee ID',
            sortable: true,
            className: 'font-medium',
        },
        {
            key: 'full_name',
            label: 'Teacher Name',
            sortable: true,
            render: (teacher) => (
                <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8 border-2 border-background">
                        <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                            {getInitials(teacher.full_name)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <span className="font-medium">{teacher.full_name}</span>
                        <span className="text-xs text-muted-foreground">{teacher.email}</span>
                    </div>
                </div>
            ),
        },
        {
            key: 'college_name',
            label: 'College',
            sortable: true,
            render: (teacher) => teacher.college_detail?.name || teacher.college_name || `College #${teacher.college}`,
        },
        {
            key: 'faculty_name',
            label: 'Faculty',
            sortable: true,
            render: (teacher) => (
                <Badge variant="secondary" className="transition-all hover:scale-105">
                    {teacher.faculty_detail?.name || teacher.faculty_name || '-'}
                </Badge>
            ),
        },
        {
            key: 'specialization',
            label: 'Specialization',
            render: (teacher) => teacher.specialization || '-',
        },
        {
            key: 'phone',
            label: 'Phone',
            render: (teacher) => permissions?.canViewTeacherSensitiveFields
                ? teacher.phone || '-'
                : 'Hidden',
        },
        {
            key: 'joining_date',
            label: 'Joining Date',
            sortable: true,
            render: (teacher) => new Date(teacher.joining_date).toLocaleDateString(),
        },
        {
            key: 'is_active',
            label: 'Status',
            render: (teacher) => (
                <Badge variant={teacher.is_active ? 'success' : 'destructive'} className="transition-all">
                    {teacher.is_active ? 'Active' : 'Inactive'}
                </Badge>
            ),
        },
    ], [permissions?.canViewTeacherSensitiveFields]);

    // Define filter configuration
    const filterConfig: FilterConfig[] = [
        {
            name: 'is_active',
            label: 'Active Status',
            type: 'select',
            options: [
                { value: '', label: 'All' },
                { value: 'true', label: 'Active' },
                { value: 'false', label: 'Inactive' },
            ],
        },
        {
            name: 'class_id',
            label: 'Class',
            type: 'select',
            options: [
                { value: '', label: 'All' },
                ...(classes?.map((c) => ({ value: String(c.id), label: c.name })) || []),
            ],
        },
        {
            name: 'gender',
            label: 'Gender',
            type: 'select',
            options: [
                { value: '', label: 'All' },
                { value: 'male', label: 'Male' },
                { value: 'female', label: 'Female' },
                { value: 'other', label: 'Other' },
            ],
        },
    ];

    const handleRowClick = (teacher: TeacherListItem) => {
        navigate(`/teachers/${teacher.id}`);
    };

    const handleAdd = () => {
        if (!permissions?.canCreateTeachers) {
            return;
        }
        setWizardDialogOpen(true);
    };

    const handleDelete = (teacher: TeacherListItem) => {
        setSelectedTeacher(teacher);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (selectedTeacher) {
            await deleteMutation.mutate(selectedTeacher.id);
            await invalidateTeachers();
            setDeleteDialogOpen(false);
            setSelectedTeacher(null);
        }
    };

    const handleCloseSidebar = () => {
        setIsSidebarOpen(false);
    };

    const handleFormSuccess = async () => {
        setIsSidebarOpen(false);
        await invalidateTeachers();
    };

    const handleWizardSubmit = async () => {
        setWizardDialogOpen(false);
        await invalidateTeachers();
    };

    const handleWizardCancel = () => {
        setWizardDialogOpen(false);
    };

    return (
        <div className="p-4 md:p-6 animate-fade-in flex flex-col gap-6">
            <DataTable
                title="Teachers"
                description="Manage all teacher records, employment, and information"
                data={data || { count: 0, next: null, previous: null, results: [] }}
                columns={columns}
                isLoading={isLoading || isLoadingPermissions}
                error={error?.message || null}
                onRefresh={() => invalidateTeachers()}
                onAdd={permissions?.canCreateTeachers ? handleAdd : undefined}
                onDelete={handleDelete}
                onRowClick={handleRowClick}
                filters={filters}
                onFiltersChange={setFilters}
                filterConfig={filterConfig}
                searchPlaceholder="Search by name, employee ID, email..."
                addButtonLabel="Add Teacher"
            />

            {/* Delete Confirmation */}
            <ConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                title="Delete Teacher"
                description={`Are you sure you want to delete ${selectedTeacher?.full_name}? This action cannot be undone.`}
                confirmLabel="Delete"
                onConfirm={confirmDelete}
                loading={deleteMutation.isLoading}
            />

            {/* Teacher Creation Wizard Sidebar */}
            {permissions?.canCreateTeachers && (
                <DetailSidebar
                    isOpen={wizardDialogOpen}
                    onClose={handleWizardCancel}
                    title="Create New Teacher"
                    subtitle="Complete the wizard to create a teacher account and record in one streamlined process"
                    mode="create"
                    width="3xl"
                >
                    <TeacherCreationPipeline
                        onSubmit={handleWizardSubmit}
                        onCancel={handleWizardCancel}
                    />
                </DetailSidebar>
            )}
        </div>
    );
};
