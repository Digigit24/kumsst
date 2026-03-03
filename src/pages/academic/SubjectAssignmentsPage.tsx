/**
 * Teacher-Subject Mapping Page
 * Assign teachers to subjects for specific classes and sections
 */

import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Column, DataTable } from '../../components/common/DataTable';
import { DetailSidebar } from '../../components/common/DetailSidebar';
import { Badge } from '../../components/ui/badge';
import { useDeleteSubjectAssignment } from '../../hooks/useAcademic';
import { invalidateSubjectAssignments, useSubjectAssignmentsSWR } from '../../hooks/useAcademicSWR';
import type { SubjectAssignmentFilters, SubjectAssignmentListItem } from '../../types/academic.types';
import { SubjectAssignmentForm } from './components/SubjectAssignmentForm';

export default function SubjectAssignmentsPage() {
    const [filters, setFilters] = useState<SubjectAssignmentFilters>({ page: 1, page_size: 20 });
    const { data, isLoading, error, refresh } = useSubjectAssignmentsSWR(filters);

    const [sidebarMode, setSidebarMode] = useState<'view' | 'create' | 'edit'>('view');
    const [selectedSubjectAssignment, setSelectedSubjectAssignment] = useState<SubjectAssignmentListItem | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const deleteMutation = useDeleteSubjectAssignment();

    const columns: Column<SubjectAssignmentListItem>[] = [
        { key: 'subject_name', label: 'Subject', sortable: true, className: 'font-semibold' },
        { key: 'class_name', label: 'Class', sortable: true },
        { key: 'section_name', label: 'Section', sortable: true, render: (assignment) => assignment.section_name || '-' },
        { key: 'teacher_name', label: 'Teacher', sortable: true, render: (assignment) => assignment.teacher_name || <span className="text-muted-foreground">Not Assigned</span> },
        {
            key: 'is_optional',
            label: 'Type',
            render: (assignment) => (
                <Badge variant={assignment.is_optional ? 'secondary' : 'default'}>
                    {assignment.is_optional ? 'Optional' : 'Mandatory'}
                </Badge>
            ),
        },
        {
            key: 'is_active',
            label: 'Status',
            render: (assignment) => (
                <Badge variant={assignment.is_active ? 'default' : 'secondary'}>
                    {assignment.is_active ? 'Active' : 'Inactive'}
                </Badge>
            ),
        },
    ];

    const handleRowClick = (subjectAssignment: SubjectAssignmentListItem) => {
        setSelectedSubjectAssignment(subjectAssignment);
        setSidebarMode('edit');
        setIsSidebarOpen(true);
    };

    const handleAdd = () => {
        setSelectedSubjectAssignment(null);
        setSidebarMode('create');
        setIsSidebarOpen(true);
    };

    const handleDelete = async () => {
        if (!deleteId) return;

        try {
            await deleteMutation.mutate(deleteId);
            toast.success('Teacher-subject mapping deleted successfully');
            setDeleteId(null);
            setIsSidebarOpen(false);
            await invalidateSubjectAssignments();
        } catch (error: any) {
            toast.error(typeof error.message === 'string' ? error.message : 'Failed to delete teacher-subject mapping');
        }
    };

    return (
        <div className="p-4 md:p-6 animate-fade-in">
            <DataTable
                title="Teacher-Subject Mapping"
                description="Assign teachers to subjects for specific classes and sections. Click on any row to edit."
                data={data}
                columns={columns}
                isLoading={isLoading}
                error={error?.message}
                onRefresh={refresh}
                onAdd={handleAdd}
                onRowClick={handleRowClick}
                filters={filters}
                onFiltersChange={setFilters}
                searchPlaceholder="Search teacher-subject mappings..."
                addButtonLabel="Assign Teacher to Subject"
                searchDebounceDelay={500}
            />

            <DetailSidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                title={sidebarMode === 'create' ? 'Assign Teacher to Subject' : 'Edit Teacher-Subject Mapping'}
                mode={sidebarMode}
            >
                {sidebarMode === 'edit' && selectedSubjectAssignment && (
                    <div className="flex justify-end mb-4">
                        <button
                            onClick={() => setDeleteId(selectedSubjectAssignment.id)}
                            className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 flex items-center gap-2"
                        >
                            <Trash2 className="w-4 h-4" />
                            Delete
                        </button>
                    </div>
                )}
                <SubjectAssignmentForm mode={sidebarMode} subjectAssignmentId={selectedSubjectAssignment?.id} onSuccess={async () => { setIsSidebarOpen(false); await invalidateSubjectAssignments(); }} onCancel={() => setIsSidebarOpen(false)} />
            </DetailSidebar>

            <ConfirmDialog
                open={deleteId !== null}
                onClose={() => setDeleteId(null)}
                onConfirm={handleDelete}
                title="Delete Teacher-Subject Mapping"
                description="Are you sure you want to remove this teacher-subject assignment? This action cannot be undone."
                variant="destructive"
            />
        </div>
    );
}