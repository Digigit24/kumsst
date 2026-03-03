import { DetailSidebar } from '@/components/common/DetailSidebar';
import { SubjectFolderView } from '@/components/common/SubjectFolderView';
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
import { DROPDOWN_PAGE_SIZE } from '@/config/app.config';
import { useClassesSWR, useSectionsFilteredByClass, useSubjectsSWR } from '@/hooks/useAcademicSWR';
import { useHomeworkListSWR } from '@/hooks/useTeachersSWR';
import { teachersApi } from '@/services/teachers.service';
import { HomeworkFilters, HomeworkListItem } from '@/types/academic.types';
import { Calendar, Edit, FileText, Filter, Plus, Search, Trash2 } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useDebounce, DEBOUNCE_DELAYS } from '@/hooks/useDebounce';
import { TeacherHomeworkForm } from './TeacherHomeworkForm';

export const TeacherHomeworkPage: React.FC = () => {
    const [filters, setFilters] = useState<HomeworkFilters>({
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
    const [selectedHomeworkId, setSelectedHomeworkId] = useState<number | null>(null);
    const [mode, setMode] = useState<'create' | 'edit'>('create');
    const [deleteConfirmationId, setDeleteConfirmationId] = useState<number | null>(null);
    const [viewMode, setViewMode] = useState<'folders' | 'grid'>('folders');

    const { data, isLoading, refetch } = useHomeworkListSWR(filters);

    // Data for filters (SWR cached)
    const { results: classesResults } = useClassesSWR({ page_size: DROPDOWN_PAGE_SIZE, is_active: true });
    const { results: subjectsResults } = useSubjectsSWR({ page_size: DROPDOWN_PAGE_SIZE, is_active: true });
    // Fetch sections based on selected class (client-side filtering)
    const { results: sectionsResults } = useSectionsFilteredByClass(filters.class_obj || undefined);

    const homeworkList = data?.results || [];

    const handleCreate = () => {
        setSelectedHomeworkId(null);
        setMode('create');
        setIsSidebarOpen(true);
    };

    const handleEdit = (id: number) => {
        setSelectedHomeworkId(id);
        setMode('edit');
        setIsSidebarOpen(true);
    };

    const handleDelete = async () => {
        if (!deleteConfirmationId) return;
        try {
            await teachersApi.deleteHomework(deleteConfirmationId);
            toast.success('Homework deleted successfully');
            refetch();
        } catch (error) {
            toast.error('Failed to delete homework');
        } finally {
            setDeleteConfirmationId(null);
        }
    };

    const onSuccess = () => {
        setIsSidebarOpen(false);
        refetch();
    };

    const handleFilterChange = (key: keyof HomeworkFilters, value: any) => {
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
                    <h1 className="text-2xl font-bold tracking-tight">Homework</h1>
                    <p className="text-muted-foreground">Manage class homework</p>
                </div>
                <Button onClick={handleCreate}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Homework
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                        <CardTitle>Homework List</CardTitle>
                        <div className="flex items-center gap-2 w-full sm:w-auto">

                            <div className="relative flex-1 sm:w-64">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search homework..."
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
                                                options={[{ label: 'All Classes', value: '' }, ...(classesResults?.map(c => ({
                                                    label: c.name,
                                                    value: c.id,
                                                    subtitle: `${c.program_name} • Sem ${c.semester}`
                                                })) || [])]}
                                                value={filters.class_obj || ''}
                                                onChange={(val) => {
                                                    const classId = val ? Number(val) : undefined;
                                                    setFilters(prev => ({
                                                        ...prev,
                                                        class_obj: classId,
                                                        section: undefined, // Reset filter when class changes
                                                        page: 1
                                                    }));
                                                }}
                                                placeholder="Filter by Class"
                                                searchPlaceholder="Search class..."
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="section-filter">Section</Label>
                                            <SearchableSelect
                                                options={[{ label: 'All Sections', value: '' }, ...(sectionsResults?.map(s => ({
                                                    label: s.name,
                                                    value: s.id,
                                                    subtitle: `Max ${s.max_students} students`
                                                })) || [])]}
                                                value={filters.section || ''}
                                                onChange={(val) => handleFilterChange('section', val ? Number(val) : undefined)}
                                                placeholder="Filter by Section"
                                                searchPlaceholder="Search section..."
                                                disabled={!filters.class_obj}
                                                emptyText={!filters.class_obj ? "Select class first" : "No sections found"}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="subject-filter">Subject</Label>
                                            <SearchableSelect
                                                options={[{ label: 'All Subjects', value: '' }, ...(subjectsResults?.map(s => ({
                                                    label: `${s.name} (${s.code})`,
                                                    value: s.id,
                                                })) || [])]}
                                                value={filters.subject || ''}
                                                onChange={(val) => handleFilterChange('subject', val ? Number(val) : undefined)}
                                                placeholder="Filter by Subject"
                                                searchPlaceholder="Search subject..."
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="status-filter">Status</Label>
                                            <SearchableSelect
                                                options={[
                                                    { label: 'All Status', value: 'all' },
                                                    { label: 'Active', value: 'active' },
                                                    { label: 'Inactive', value: 'inactive' }
                                                ]}
                                                value={filters.is_active === undefined ? 'all' : filters.is_active ? 'active' : 'inactive'}
                                                onChange={(val) => {
                                                    const status = val === 'all' ? undefined : val === 'active';
                                                    handleFilterChange('is_active', status);
                                                }}
                                                placeholder="Filter by Status"
                                            />
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
                    ) : homeworkList.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            No homework found. {filters.search || filters.class_obj || filters.subject ? "Try adjusting your filters." : 'Click "Create Homework" to add one.'}
                        </div>
                    ) : viewMode === 'folders' ? (
                        <SubjectFolderView
                            items={homeworkList}
                            isLoading={isLoading}
                            emptyMessage="No homework found"
                            itemType="homework"
                            onItemClick={(homework) => handleEdit(homework.id)}
                            renderItemCard={(homework, _index) => (
                                <Card
                                    key={homework.id}
                                    className="group hover:border-primary transition-colors h-full flex flex-col"
                                >
                                    <CardContent className="p-4 flex flex-col h-full">
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-2">
                                                <Badge variant={homework.is_active ? 'default' : 'secondary'}>
                                                    {homework.is_active ? 'Active' : 'Inactive'}
                                                </Badge>
                                                <span className="text-xs text-muted-foreground flex items-center">
                                                    <Calendar className="h-3 w-3 mr-1" />
                                                    Due: {new Date(homework.due_date).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <h3 className="font-semibold text-lg line-clamp-1 mb-1 cursor-pointer hover:underline decoration-primary underline-offset-4">
                                                {homework.title}
                                            </h3>
                                            <div className="text-sm text-muted-foreground space-y-1 mb-4">
                                                <p className="flex items-center">
                                                    <FileText className="h-3 w-3 mr-2" />
                                                    {homework.subject_name}
                                                </p>
                                                <p className="text-xs">
                                                    {homework.class_name} {homework.section_name && `- ${homework.section_name}`}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex justify-end gap-2 pt-2 border-t mt-auto" onClick={(e) => e.stopPropagation()}>
                                            <Button variant="outline" size="sm" className="h-8 px-2 text-xs" onClick={() => handleEdit(homework.id)}>
                                                <Edit className="h-3 w-3 mr-1" /> Edit
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-8 px-2 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 hover:border-destructive/30"
                                                onClick={() => setDeleteConfirmationId(homework.id)}
                                            >
                                                <Trash2 className="h-3 w-3 mr-1" /> Delete
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        />
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {homeworkList.map((homework: HomeworkListItem) => (
                                <Card
                                    key={homework.id}
                                    className="group hover:border-primary transition-colors h-full flex flex-col"
                                >
                                    <CardContent className="p-4 flex flex-col h-full">
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-2">
                                                <Badge variant={homework.is_active ? 'default' : 'secondary'}>
                                                    {homework.is_active ? 'Active' : 'Inactive'}
                                                </Badge>
                                                <span className="text-xs text-muted-foreground flex items-center">
                                                    <Calendar className="h-3 w-3 mr-1" />
                                                    Due: {new Date(homework.due_date).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <h3
                                                className="font-semibold text-lg line-clamp-1 mb-1 cursor-pointer hover:underline decoration-primary underline-offset-4"
                                                onClick={() => handleEdit(homework.id)}
                                            >
                                                {homework.title}
                                            </h3>
                                            <div className="text-sm text-muted-foreground space-y-1 mb-4">
                                                <p className="flex items-center">
                                                    <FileText className="h-3 w-3 mr-2" />
                                                    {homework.subject_name}
                                                </p>
                                                <p className="text-xs">
                                                    {homework.class_name} {homework.section_name && `- ${homework.section_name}`}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex justify-end gap-2 pt-2 border-t mt-auto">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-8 px-2 text-xs"
                                                onClick={() => handleEdit(homework.id)}
                                            >
                                                <Edit className="h-3 w-3 mr-1" /> Edit
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-8 px-2 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 hover:border-destructive/30"
                                                onClick={() => setDeleteConfirmationId(homework.id)}
                                            >
                                                <Trash2 className="h-3 w-3 mr-1" /> Delete
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
                title={mode === 'create' ? 'Create Homework' : 'Edit Homework'}
                width="2xl"
                mode={mode}
            >
                <TeacherHomeworkForm
                    mode={mode}
                    homeworkId={selectedHomeworkId}
                    onSuccess={onSuccess}
                    onCancel={() => setIsSidebarOpen(false)}
                />
            </DetailSidebar>

            <AlertDialog open={!!deleteConfirmationId} onOpenChange={(open) => !open && setDeleteConfirmationId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the homework.
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
        </div>
    );
};
