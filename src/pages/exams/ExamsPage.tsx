/**
 * Exams Page
 * Manage examinations and assessments
 */

import { motion } from 'framer-motion';
import {
    Calendar,
    FileText,
    Plus,
    RefreshCw,
    Tags
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Column, DataTable, FilterConfig } from '../../components/common/DataTable';
import { PageLoader } from '../../components/common/LoadingComponents';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { useCreateExam, useDeleteExam, useExams, useUpdateExam } from '../../hooks/useExamination';
import { ExamDrawer } from './components/ExamDrawer';
import { ExamForm } from './forms';

const ExamsPage = () => {
    const [filters, setFilters] = useState<Record<string, any>>({ page: 1, page_size: 10 });
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [sidebarMode, setSidebarMode] = useState<'view' | 'create' | 'edit'>('view');
    const [selectedExam, setSelectedExam] = useState<any | null>(null);

    // Fetch exams
    const { data, isLoading, error, refetch } = useExams(filters);
    const createMutation = useCreateExam();
    const updateMutation = useUpdateExam();
    const deleteMutation = useDeleteExam();

    const totalExams = data?.results?.length || 0;

    const columns: Column<any>[] = [
        {
            key: 'name',
            label: 'Exam Name',
            sortable: true,
            render: (exam) => (
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-600 dark:text-purple-400">
                        <FileText className="h-4 w-4" />
                    </div>
                    <div>
                        <p className="font-semibold text-foreground">{exam.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">{exam.code}</p>
                    </div>
                </div>
            )
        },
        {
            key: 'exam_type',
            label: 'Type',
            render: (exam) => (
                <span className="text-sm">
                    {exam.exam_type_data?.name || 'N/A'}
                </span>
            ),
        },
        {
            key: 'dates',
            label: 'Schedule',
            render: (exam) => (
                <div className="flex flex-col text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{exam.start_date} - {exam.end_date}</span>
                    </div>
                </div>
            ),
        },
        {
            key: 'is_active',
            label: 'Status',
            render: (exam) => (
                <Badge variant={exam.is_active ? 'success' : 'secondary'} className={exam.is_active ? "bg-green-100 text-green-700" : ""}>
                    {exam.is_active ? 'Active' : 'Archived'}
                </Badge>
            ),
        },
        {
            key: 'actions',
            label: 'Actions',
            render: (exam) => (
                <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleRowClick(exam); }}>
                    Edit
                </Button>
            )
        }
    ];

    const filterConfig: FilterConfig[] = [
        {
            name: 'is_active',
            label: 'Status',
            type: 'select',
            options: [
                { value: '', label: 'All' },
                { value: 'true', label: 'Active' },
                { value: 'false', label: 'Inactive' },
            ],
        },
    ];

    const handleAddNew = () => {
        setSelectedExam(null);
        setSidebarMode('create');
        setIsSidebarOpen(true);
    };

    const handleRowClick = (exam: any) => {
        setSelectedExam(exam);
        setSidebarMode('view');
        setIsSidebarOpen(true);
    };

    const handleEdit = () => {
        setSidebarMode('edit');
    };

    const handleFormSubmit = async (data: any) => {
        try {
            if (sidebarMode === 'edit' && selectedExam?.id) {
                await updateMutation.mutateAsync({
                    id: selectedExam.id,
                    data: data,
                });
                toast.success('Exam updated successfully');
            } else {
                await createMutation.mutateAsync(data);
                toast.success('Exam created successfully');
            }
            setIsSidebarOpen(false);
            setSelectedExam(null);
            refetch();
        } catch (error: any) {
            toast.error(error?.message || 'Failed to save exam');
        }
    };

    const handleDelete = async () => {
        if (!selectedExam?.id) return;

        if (confirm('Are you sure you want to delete this exam?')) {
            try {
                await deleteMutation.mutateAsync(selectedExam.id);
                toast.success('Exam deleted successfully');
                setIsSidebarOpen(false);
                setSelectedExam(null);
                refetch();
            } catch (error: any) {
                toast.error(error?.message || 'Failed to delete exam');
            }
        }
    };

    const handleCloseSidebar = () => {
        setIsSidebarOpen(false);
        setSelectedExam(null);
    };

    if (isLoading) {
        return <PageLoader />;
    }

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 space-y-6"
            >
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                            Examinations
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Manage school examinations and assessments
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button onClick={() => refetch()} variant="outline" size="sm">
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Sync
                        </Button>
                        <Button onClick={handleAddNew} size="sm" className="shadow-md">
                            <Plus className="h-4 w-4 mr-2" />
                            New Exam
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                    {/* Quick Stats Sidebar */}
                    <Card className="md:col-span-1 bg-gradient-to-br from-slate-800 to-slate-900 text-white border-none shadow-xl">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-slate-100">
                                <Tags className="h-5 w-5" />
                                Total Exams
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold">{totalExams}</div>
                            <p className="text-slate-400 text-sm mt-2">
                                Scheduled examinations
                            </p>
                        </CardContent>
                    </Card>

                    {/* Main Table */}
                    <Card className="md:col-span-3 border-none shadow-md overflow-hidden">
                        <DataTable
                            title=""
                            description=""
                            columns={columns}
                            data={data}
                            isLoading={isLoading}
                            error={error?.message}
                            onRefresh={refetch}
                            onAdd={undefined} // Hidden as we have a main action button above
                            onRowClick={handleRowClick}
                            filters={filters}
                            onFiltersChange={setFilters}
                            filterConfig={filterConfig}
                            searchPlaceholder="Search exams..."
                            hideToolbar={false}
                        />
                    </Card>
                </div>
            </motion.div>

            <ExamDrawer
                isOpen={isSidebarOpen}
                onClose={handleCloseSidebar}
                title={sidebarMode === 'create' ? 'Create Exam' : selectedExam?.name || 'Exam Details'}
                mode={sidebarMode}
                width="lg"
            >
                {sidebarMode === 'view' && selectedExam ? (
                    <div className="space-y-6">
                        <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
                            <h3 className="text-2xl font-bold mb-1">{selectedExam.name}</h3>
                            <div className="flex gap-2 mt-2">
                                <Badge variant="outline" className="font-mono text-xs">{selectedExam.code}</Badge>
                                <Badge variant={selectedExam.is_active ? 'success' : 'destructive'} className="px-3 py-0 h-5">
                                    {selectedExam.is_active ? 'Active' : 'Inactive'}
                                </Badge>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground uppercase">Start Date</p>
                                <p className="font-medium">{selectedExam.start_date}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground uppercase">End Date</p>
                                <p className="font-medium">{selectedExam.end_date}</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Description</h3>
                            <p className="text-base leading-relaxed bg-muted/30 p-4 rounded-lg">
                                {selectedExam.description || 'No description provided.'}
                            </p>
                        </div>

                        <div className="pt-6 flex gap-2 border-t">
                            <Button onClick={handleEdit} className="flex-1">Edit</Button>
                            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
                        </div>
                    </div>
                ) : (
                    <ExamForm
                        exam={sidebarMode === 'edit' ? selectedExam : null}
                        onSubmit={handleFormSubmit}
                        onCancel={handleCloseSidebar}
                    />
                )}
            </ExamDrawer>
        </>
    );
};

export default ExamsPage;
