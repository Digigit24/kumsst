/**
 * TeacherHomeworkSubmissionsPage.tsx
 * Page for teachers to view and grade homework submissions
 */

import { useHomeworkSubmissionsSWR } from '@/hooks/useTeachersSWR';
import { useState } from 'react';
import { Column, DataTable, FilterConfig } from '../../../components/common/DataTable';
import { DetailSidebar } from '../../../components/common/DetailSidebar';
import { Badge } from '../../../components/ui/badge';
import { useAuth } from '../../../hooks/useAuth';
import { HomeworkSubmission, HomeworkSubmissionFilters } from '../../../types/academic.types';

export const TeacherHomeworkSubmissionsPage = () => {
    const { user } = useAuth();
    const [filters, setFilters] = useState<HomeworkSubmissionFilters>({ page: 1, page_size: 20 });
    const { data, isLoading, error, refetch } = useHomeworkSubmissionsSWR(filters);

    const [sidebarMode, setSidebarMode] = useState<'view' | 'edit'>('view');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [selectedSubmission, setSelectedSubmission] = useState<HomeworkSubmission | null>(null);

    // Columns
    const columns: Column<HomeworkSubmission>[] = [
        {
            key: 'homework_title',
            label: 'Homework',
            sortable: true,
            className: 'font-medium',
        },
        {
            key: 'student_name',
            label: 'Student',
            sortable: true,
        },
        {
            key: 'status',
            label: 'Status',
            render: (submission) => {
                const variant =
                    submission.status === 'checked' ? 'success' :
                        submission.status === 'submitted' ? 'info' :
                            submission.status === 'pending' ? 'secondary' :
                                submission.status === 'resubmit' ? 'warning' :
                                    'destructive'; // late

                return (
                    <Badge variant={variant} className="capitalize">
                        {submission.status}
                    </Badge>
                );
            },
        },
        {
            key: 'created_at',
            label: 'Submitted On',
            render: (submission) => submission.created_at ? new Date(submission.created_at).toLocaleDateString() : '-',
        },
        {
            key: 'submission_file',
            label: 'View File',
            render: (submission) => submission.submission_file ? (
                <a
                    href={submission.submission_file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline text-sm font-medium"
                    onClick={(e) => e.stopPropagation()}
                >
                    View File
                </a>
            ) : <span className="text-muted-foreground">-</span>,
        },
    ];

    // Filter Config
    const filterConfig: FilterConfig[] = [
        {
            name: 'homework',
            label: 'Homework',
            type: 'text', // Ideally a searchable select or dynamic load
            placeholder: 'Search by Homework ID',
        },
        {
            name: 'status',
            label: 'Status',
            type: 'select',
            options: [
                { value: '', label: 'All Statuses' },
                { value: 'pending', label: 'Pending' },
                { value: 'submitted', label: 'Submitted' },
                { value: 'late', label: 'Late' },
                { value: 'checked', label: 'Checked' },
                { value: 'resubmit', label: 'Resubmit' },
            ],
        },
    ];

    const handleRowClick = (submission: HomeworkSubmission) => {
        setSelectedSubmission(submission);
        setSidebarMode('view'); // Or 'edit' if we want to allow grading immediately
        setIsSidebarOpen(true);
    };

    const handleCloseSidebar = () => {
        setIsSidebarOpen(false);
        setSelectedSubmission(null);
    };

    const handleFormSuccess = () => {
        setIsSidebarOpen(false);
        refetch();
    };

    return (
        <div className="p-4 md:p-6 animate-fade-in flex flex-col gap-6">

            <DataTable
                title="Homework Submissions"
                description="View and grade student homework submissions"
                data={data || { count: 0, next: null, previous: null, results: [] }}
                columns={columns}
                isLoading={isLoading}
                error={error ? error.message : null}
                onRefresh={refetch}
                // No onAdd needed for submissions list (usually created by students)
                onRowClick={handleRowClick}
                filters={filters}
                onFiltersChange={setFilters}
                filterConfig={filterConfig}
                searchPlaceholder="Search by student name..."
            />

            {/* Detail/Grading Sidebar */}
            <DetailSidebar
                isOpen={isSidebarOpen}
                onClose={handleCloseSidebar}
                title={sidebarMode === 'view' ? 'Submission Details' : 'Grade Submission'}
                mode={sidebarMode}
                width="xl"
            >
                {/* 
                  TODO: Create TeacherHomeworkSubmissionForm component
                  <TeacherHomeworkSubmissionForm 
                    submission={selectedSubmission} 
                    onSuccess={handleFormSuccess} 
                    mode={sidebarMode}
                  /> 
                */}
                <div className="p-4">
                    <h3 className="text-lg font-semibold">Submission from {selectedSubmission?.student_name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">Homework: {selectedSubmission?.homework_title}</p>

                    <div className="grid gap-4">
                        <div>
                            <span className="font-medium">Status:</span> {selectedSubmission?.status}
                        </div>
                        <div>
                            <span className="font-medium">Remarks:</span> {selectedSubmission?.remarks || 'No remarks'}
                        </div>
                        {/* Placeholder for Grading Form */}
                        <div className="bg-muted p-4 rounded-md">
                            <p className="text-sm italic text-muted-foreground">Grading form implementation pending...</p>
                        </div>
                    </div>
                </div>
            </DetailSidebar>
        </div>
    );
};
