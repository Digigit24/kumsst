import { DetailSidebar } from '@/components/common/DetailSidebar';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useClassesSWR, useSubjectsSWR } from '@/hooks/swr';
import { useAssignmentsSWR, invalidateAssignments } from '@/hooks/swr';
import { teachersApi } from '@/services/teachers.service';
import { DROPDOWN_PAGE_SIZE } from '@/config/app.config';
import { AssignmentFilters, AssignmentListItem } from '@/types/academic.types';
import { Calendar, Edit, FileText, Filter, Plus, Search, Trash2 } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useDebounce, DEBOUNCE_DELAYS } from '@/hooks/useDebounce';
import { TeacherAssignmentForm } from './TeacherAssignmentForm';

export const TeacherAssignmentsPage: React.FC = () => {
    const [filters, setFilters] = useState<AssignmentFilters>({
        page: 1,
        page_size: 20,
        ordering: '-due_date',
    });
    const [localSearch, setLocalSearch] = useState(filters.search || '');
    const debouncedSearch = useDebounce(localSearch, DEBOUNCE_DELAYS.SEARCH);

    useEffect(() => {
        setFilters(prev => ({ ...prev, search: debouncedSearch || undefined, page: 1 }));
    }, [debouncedSearch]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [selectedAssignmentId, setSelectedAssignmentId] = useState<number | null>(null);
    const [mode, setMode] = useState<'create' | 'edit'>('create');
    const [deleteConfirmationId, setDeleteConfirmationId] = useState<number | null>(null);

    const { data, isLoading } = useAssignmentsSWR(filters);

    // Data for filters (SWR cached)
    const { data: classesData } = useClassesSWR({ page_size: DROPDOWN_PAGE_SIZE, is_active: true });
    const { data: subjectsData } = useSubjectsSWR({ page_size: DROPDOWN_PAGE_SIZE, is_active: true });

    const assignments = data?.results || [];

    const handleCreate = () => {
        setSelectedAssignmentId(null);
        setMode('create');
        setIsSidebarOpen(true);
    };

    const handleEdit = (id: number) => {
        setSelectedAssignmentId(id);
        setMode('edit');
        setIsSidebarOpen(true);
    };

    const handleDelete = async () => {
        if (!deleteConfirmationId) return;
        try {
            await teachersApi.deleteAssignment(deleteConfirmationId);
            toast.success('Assignment deleted successfully');
            await invalidateAssignments();
        } catch (error) {
            toast.error('Failed to delete assignment');
        } finally {
            setDeleteConfirmationId(null);
        }
    };

    const onSuccess = async () => {
        setIsSidebarOpen(false);
        await invalidateAssignments();
    };

    const handleFilterChange = (key: keyof AssignmentFilters, value: any) => {
        setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
    };

    const clearFilters = () => {
        setFilters({
            page: 1,
            page_size: 20,
            ordering: '-due_date',
            search: filters.search // Keep search text if any
        });
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Assignments</h1>
                    <p className="text-muted-foreground">Manage class assignments and homework</p>
                </div>
                <Button onClick={handleCreate}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Assignment
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                        <CardTitle>Assignments List</CardTitle>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <div className="relative flex-1 sm:w-64">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search assignments..."
                                    className="pl-9"
                                    value={localSearch}
                                    onChange={(e) => setLocalSearch(e.target.value)}
                                />
                            </div>

                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" size="icon" className={
                                        filters.class_obj || filters.subject || filters.is_active !== undefined
                                            ? "border-primary text-primary"
                                            : ""
                                    }>
                                        <Filter className="h-4 w-4" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-80" align="end">
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <h4 className="font-medium leading-none">Filters</h4>
                                            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-auto p-0 text-xs text-muted-foreground hover:text-primary">
                                                Clear all
                                            </Button>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="class-filter">Class</Label>
                                            <SearchableSelect
                                                options={classesData?.results.map(c => ({
                                                    label: c.name,
                                                    value: c.id,
                                                    subtitle: `${c.program_name} • Sem ${c.semester}`
                                                })) || []}
                                                value={filters.class_obj}
                                                onChange={(val) => handleFilterChange('class_obj', val ? Number(val) : undefined)}
                                                placeholder="Filter by Class"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="subject-filter">Subject</Label>
                                            <SearchableSelect
                                                options={subjectsData?.results.map(s => ({
                                                    label: `${s.name} (${s.code})`,
                                                    value: s.id,
                                                })) || []}
                                                value={filters.subject}
                                                onChange={(val) => handleFilterChange('subject', val ? Number(val) : undefined)}
                                                placeholder="Filter by Subject"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="status-filter">Status</Label>
                                            <Select
                                                value={filters.is_active === undefined ? "all" : filters.is_active ? "active" : "inactive"}
                                                onValueChange={(val) => handleFilterChange('is_active', val === "all" ? undefined : val === "active")}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">All Status</SelectItem>
                                                    <SelectItem value="active">Active</SelectItem>
                                                    <SelectItem value="inactive">Inactive</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="text-center py-8">Loading...</div>
                    ) : assignments.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            No assignments found. {filters.search || filters.class_obj || filters.subject ? "Try adjusting your filters." : 'Click "Create Assignment" to add one.'}
                        </div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {assignments.map((assignment: AssignmentListItem) => (
                                <Card
                                    key={assignment.id}
                                    className="group hover:border-primary transition-colors h-full flex flex-col"
                                >
                                    <CardContent className="p-4 flex flex-col h-full">
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-2">
                                                <Badge variant={assignment.is_active ? 'default' : 'secondary'}>
                                                    {assignment.is_active ? 'Active' : 'Inactive'}
                                                </Badge>
                                                <span className="text-xs text-muted-foreground flex items-center">
                                                    <Calendar className="h-3 w-3 mr-1" />
                                                    Due: {new Date(assignment.due_date).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <h3
                                                className="font-semibold text-lg line-clamp-1 mb-1 cursor-pointer hover:underline decoration-primary underline-offset-4"
                                                onClick={() => handleEdit(assignment.id)}
                                            >
                                                {assignment.title}
                                            </h3>
                                            <div className="text-sm text-muted-foreground space-y-1 mb-4">
                                                <p className="flex items-center">
                                                    <FileText className="h-3 w-3 mr-2" />
                                                    {assignment.subject_name}
                                                </p>
                                                <p className="text-xs">
                                                    {assignment.class_name} {assignment.section_name && `- ${assignment.section_name}`}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex justify-end gap-1 pt-2 border-t mt-auto">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-primary"
                                                onClick={() => handleEdit(assignment.id)}
                                                title="Edit"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                onClick={() => setDeleteConfirmationId(assignment.id)}
                                                title="Delete"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <DetailSidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                title={mode === 'create' ? 'Create Assignment' : 'Edit Assignment'}
                width="2xl"
                mode={mode}
            >
                <TeacherAssignmentForm
                    mode={mode}
                    assignmentId={selectedAssignmentId}
                    onSuccess={onSuccess}
                    onCancel={() => setIsSidebarOpen(false)}
                />
            </DetailSidebar>

            <AlertDialog open={!!deleteConfirmationId} onOpenChange={(open) => !open && setDeleteConfirmationId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the assignment.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90 text-white">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div >
    );
};
