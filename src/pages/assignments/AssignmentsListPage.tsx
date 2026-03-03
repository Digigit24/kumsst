import { DetailSidebar } from '@/components/common/DetailSidebar';
import { SubjectFolderView } from '@/components/common/SubjectFolderView';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DROPDOWN_PAGE_SIZE } from '@/config/app.config';
import { useClassesSWR, useSectionsFilteredByClass, useSubjectsSWR } from '@/hooks/useAcademicSWR';
import {
  useCreateAssignment,
  useDeleteAssignment,
  useMyAssignments,
  useUpdateAssignment,
} from '@/hooks/useAssignments';
import { useTeachersSWR } from '@/hooks/useTeachersSWR';
import type { Assignment, AssignmentCreateInput } from '@/types/assignments.types';
import { AssignmentListParams } from '@/types/assignments.types';
import { AnimatePresence, motion } from 'framer-motion';
import { Calendar, Clock, Edit, FileText, Filter, Plus, Search, Trash2, Users } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useDebounce, DEBOUNCE_DELAYS } from '@/hooks/useDebounce';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { AssignmentForm } from './components/AssignmentForm';

export const AssignmentsListPage: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarMode, setSidebarMode] = useState<'view' | 'edit' | 'create'>('view');
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [viewMode, setViewMode] = useState<'folders' | 'grid'>('folders');
  const [showFilters, setShowFilters] = useState(false);

  // Filter state
  const [filters, setFilters] = useState<AssignmentListParams>({
    page: 1,
    page_size: DROPDOWN_PAGE_SIZE,
    ordering: '-due_date',
  });
  const [localSearch, setLocalSearch] = useState(filters.search || '');
  const debouncedSearch = useDebounce(localSearch, DEBOUNCE_DELAYS.SEARCH);

  useEffect(() => {
    setFilters(prev => ({ ...prev, search: debouncedSearch || undefined, page: 1 }));
  }, [debouncedSearch]);

  // Fetch dependency data for filters
  const { results: classesData } = useClassesSWR({ page_size: DROPDOWN_PAGE_SIZE, is_active: true });
  // Fetch sections based on selected class
  const { results: sectionsData } = useSectionsFilteredByClass(filters.class_obj);
  const { results: subjectsData } = useSubjectsSWR({ page_size: DROPDOWN_PAGE_SIZE, is_active: true });
  const { results: teachersData } = useTeachersSWR({ page_size: DROPDOWN_PAGE_SIZE, is_active: true });

  // Fetch ALL assignments (up to 1000) for client-side filtering
  const { data, isLoading, error, refetch } = useMyAssignments({
    page_size: 1000,
    ordering: '-due_date'
  });
  const createMutation = useCreateAssignment();
  const updateMutation = useUpdateAssignment();
  const deleteMutation = useDeleteAssignment();

  const allAssignments = data?.results || [];

  const assignments = React.useMemo(() => {
    return allAssignments.filter(assignment => {
      // Search filter
      if (filters.search && !assignment.title.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      // Class filter
      if (filters.class_obj && assignment.class_obj !== filters.class_obj) {
        return false;
      }
      // Section filter
      if (filters.section && assignment.section !== filters.section) {
        return false;
      }
      // Subject filter
      if (filters.subject && assignment.subject !== filters.subject) {
        return false;
      }
      // Teacher filter
      if (filters.teacher && assignment.teacher !== filters.teacher) {
        return false;
      }
      // Status filter
      if (filters.is_active !== undefined && assignment.is_active !== filters.is_active) {
        return false;
      }
      return true;
    });
  }, [allAssignments, filters]);
  const activeAssignments = assignments.filter(a => a.status === 'active');
  const totalPending = assignments.reduce(
    (sum, a) => sum + ((a.total_students || 0) - (a.submission_count || 0)),
    0
  );

  const handleCreate = () => {
    setSelectedAssignment(null);
    setSidebarMode('create');
    setIsSidebarOpen(true);
  };

  const handleEdit = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setSidebarMode('edit');
    setIsSidebarOpen(true);
  };

  const handleView = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setSidebarMode('view');
    setIsSidebarOpen(true);
  };

  const handleDelete = async (assignment: Assignment) => {
    if (window.confirm(`Are you sure you want to delete "${assignment.title}"?`)) {
      try {
        await deleteMutation.mutateAsync(assignment.id);
        toast.success('Assignment deleted successfully');
        refetch();
      } catch (error: any) {
        toast.error(error?.message || 'Failed to delete assignment');
      }
    }
  };

  const handleFormSubmit = async (data: AssignmentCreateInput | FormData) => {
    try {
      if (selectedAssignment && sidebarMode === 'edit') {
        await updateMutation.mutateAsync({ id: selectedAssignment.id, data: data as any });
        toast.success('Assignment updated successfully');
      } else if (sidebarMode === 'create') {
        await createMutation.mutateAsync(data as any);
        toast.success('Assignment created successfully');
      }
      setIsSidebarOpen(false);
      refetch();
    } catch (error: any) {
      toast.error(error?.message || `Failed to ${sidebarMode === 'create' ? 'create' : 'update'} assignment`);
    }
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
    setSelectedAssignment(null);
  };

  const getSidebarTitle = () => {
    switch (sidebarMode) {
      case 'create': return 'Create Assignment';
      case 'edit': return 'Edit Assignment';
      case 'view': return selectedAssignment?.title || 'Assignment Details';
      default: return 'Assignment';
    }
  }

  const handleFilterChange = (key: keyof AssignmentListParams, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      page: 1,
      page_size: DROPDOWN_PAGE_SIZE,
      ordering: '-due_date',
      search: filters.search // Keep search text if any
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Assignments</h1>
          <p className="text-muted-foreground mt-2">
            View and manage all your assignments
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Create Assignment
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assignments.length}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeAssignments.length}</div>
            <p className="text-xs text-muted-foreground">Ongoing assignments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Submissions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPending}</div>
            <p className="text-xs text-muted-foreground">Students pending</p>
          </CardContent>
        </Card>
      </div>

      {/* Assignments List */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <CardTitle>All Assignments</CardTitle>
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                {!showFilters && (
                  <motion.div
                    layoutId="search-container"
                    className="relative flex-1 sm:w-64"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.8 }}
                  >
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search assignments..."
                      className="pl-9"
                      value={localSearch}
                      onChange={(e) => setLocalSearch(e.target.value)}
                    />
                  </motion.div>
                )}
                <motion.div layoutId="filter-toggle" transition={{ duration: 0.5 }}>
                  <Button
                    variant={showFilters ? "secondary" : "outline"}
                    size="icon"
                    onClick={() => setShowFilters(!showFilters)}
                    className={
                      filters.class_obj || filters.subject || filters.teacher || filters.section || filters.is_active !== undefined
                        ? "border-primary text-primary"
                        : ""
                    }
                  >
                    <Filter className="h-4 w-4" />
                  </Button>
                </motion.div>
              </div>
            </div>

            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -10 }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                  className="flex flex-wrap gap-3 items-center overflow-hidden p-1"
                >
                  <motion.div
                    layoutId="search-container"
                    className="relative w-full sm:w-64"
                    transition={{ duration: 0.8 }}
                  >
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search assignments..."
                      className="pl-9 border-slate-400"
                      value={localSearch}
                      onChange={(e) => setLocalSearch(e.target.value)}
                    />
                  </motion.div>

                  <div className="w-[200px]">
                    <SearchableSelect
                      className="border-slate-400"
                      options={[
                        { label: 'All Classes', value: 'all' },
                        ...(classesData?.map(c => ({
                          label: c.name,
                          value: c.id,
                          subtitle: `${c.program_name} • Sem ${c.semester}`
                        })) || [])
                      ]}
                      value={filters.class_obj}
                      onChange={(val) => {
                        handleFilterChange('class_obj', val === 'all' ? undefined : (val ? Number(val) : undefined));
                        handleFilterChange('section', undefined);
                      }}
                      placeholder="Class"
                    />
                  </div>

                  <div className="w-[150px]">
                    <SearchableSelect
                      className="border-slate-400"
                      options={[
                        { label: 'All Sections', value: 'all' },
                        ...(sectionsData?.map(s => ({
                          label: s.name,
                          value: s.id,
                        })) || [])
                      ]}
                      value={filters.section}
                      onChange={(val) => handleFilterChange('section', val === 'all' ? undefined : (val ? Number(val) : undefined))}
                      placeholder="Section"
                      disabled={!filters.class_obj}
                    />
                  </div>

                  <div className="w-[200px]">
                    <SearchableSelect
                      className="border-slate-400"
                      options={[
                        { label: 'All Subjects', value: 'all' },
                        ...(subjectsData?.map(s => ({
                          label: `${s.name} (${s.code})`,
                          value: s.id,
                        })) || [])
                      ]}
                      value={filters.subject}
                      onChange={(val) => handleFilterChange('subject', val === 'all' ? undefined : (val ? Number(val) : undefined))}
                      placeholder="Subject"
                    />
                  </div>

                  <div className="w-[200px]">
                    <SearchableSelect
                      className="border-slate-400"
                      options={[
                        { label: 'All Teachers', value: 'all' },
                        ...(teachersData?.map(t => ({
                          label: t.full_name || t.user_details?.username || t.email,
                          value: t.id,
                          subtitle: t.email
                        })) || [])
                      ]}
                      value={filters.teacher}
                      onChange={(val) => handleFilterChange('teacher', val === 'all' ? undefined : (val ? Number(val) : undefined))}
                      placeholder="Teacher"
                    />
                  </div>

                  <div className="w-[150px]">
                    <Select
                      value={filters.is_active === undefined ? "all" : filters.is_active ? "active" : "inactive"}
                      onValueChange={(val) => handleFilterChange('is_active', val === "all" ? undefined : val === "active")}
                    >
                      <SelectTrigger className="border-slate-400">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground hover:text-primary mb-0.5">
                    Clear
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading assignments...</div>
          ) : error ? (
            <div className="text-center py-8 text-destructive">
              Failed to load assignments: {error.message}
            </div>
          ) : assignments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No assignments yet. Create your first assignment!
            </div>
          ) : viewMode === 'folders' ? (
            <SubjectFolderView
              items={assignments}
              isLoading={isLoading}
              emptyMessage="No assignments found"
              itemType="assignments"
              onItemClick={handleView}
              renderItemCard={(assignment, index) => {
                const submissionRate = assignment.total_students
                  ? Math.round(((assignment.submission_count || 0) / assignment.total_students) * 100)
                  : 0;

                return (
                  <Card
                    key={assignment.id}
                    className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary/30 cursor-pointer bg-card border"
                  >
                    <CardContent className="p-6 flex flex-col h-full">
                      <div className="flex-1 space-y-4">
                        {/* Header with status and date */}
                        <div className="flex justify-between items-start gap-3">
                          <Badge
                            className="px-2.5 py-1 text-xs font-medium"
                            variant={assignment.status === 'active' ? 'default' : assignment.status === 'draft' ? 'secondary' : 'success'}
                          >
                            {assignment.status || 'active'}
                          </Badge>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>{new Date(assignment.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          </div>
                        </div>

                        {/* Title */}
                        <h3 className="font-semibold text-lg line-clamp-2 text-foreground group-hover:text-primary transition-colors leading-snug min-h-[3.5rem]">
                          {assignment.title}
                        </h3>

                        {/* Subject and Class Info */}
                        <div className="space-y-2.5">
                          <div className="flex items-center gap-2 text-sm">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium text-foreground">{assignment.subject_name}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Users className="h-3.5 w-3.5" />
                            <span>{assignment.class_name} {assignment.section_name && `• ${assignment.section_name}`}</span>
                          </div>
                        </div>

                        {/* Submission Progress */}
                        {assignment.total_students && assignment.total_students > 0 && (
                          <div className="pt-3 border-t">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-xs font-medium text-muted-foreground">Submissions</span>
                              <span className="text-sm font-semibold text-foreground">
                                {assignment.submission_count || 0} / {assignment.total_students}
                              </span>
                            </div>
                            <div className="relative h-1.5 w-full bg-muted rounded-full overflow-hidden">
                              <div
                                className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ${submissionRate === 100 ? 'bg-green-600' : 'bg-primary'}`}
                                style={{ width: `${submissionRate}%` }}
                              />
                            </div>
                            <div className="mt-1.5 text-right">
                              <span className="text-xs text-muted-foreground">
                                {submissionRate}%
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Actions Footer */}
                      <div className="flex items-center justify-between pt-4 mt-4 border-t">
                        <Link to={`/assignments/submissions?id=${assignment.id}`} onClick={(e) => e.stopPropagation()}>
                          <Button
                            size="sm"
                            variant="default"
                            className="text-xs font-medium h-8 px-3"
                          >
                            View Submissions
                          </Button>
                        </Link>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
                            onClick={(e) => { e.stopPropagation(); handleEdit(assignment); }}
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            onClick={(e) => { e.stopPropagation(); handleDelete(assignment); }}
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              }}
            />
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {assignments.map((assignment, index) => {
                const submissionRate = assignment.total_students
                  ? Math.round(((assignment.submission_count || 0) / assignment.total_students) * 100)
                  : 0;

                return (
                  <Card
                    key={assignment.id}
                    className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary/30 cursor-pointer bg-card border"
                    onClick={() => handleView(assignment)}
                  >
                    <CardContent className="p-6 flex flex-col h-full">
                      <div className="flex-1 space-y-4">
                        {/* Header with status and date */}
                        <div className="flex justify-between items-start gap-3">
                          <Badge
                            className="px-2.5 py-1 text-xs font-medium"
                            variant={
                              assignment.status === 'active'
                                ? 'default'
                                : assignment.status === 'draft'
                                  ? 'secondary'
                                  : 'success'
                            }
                          >
                            {assignment.status || 'active'}
                          </Badge>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>{new Date(assignment.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          </div>
                        </div>

                        {/* Title */}
                        <h3 className="font-semibold text-lg line-clamp-2 text-foreground group-hover:text-primary transition-colors leading-snug min-h-[3.5rem]">
                          {assignment.title}
                        </h3>

                        {/* Subject and Class Info */}
                        <div className="space-y-2.5">
                          <div className="flex items-center gap-2 text-sm">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium text-foreground">{assignment.subject_name}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Users className="h-3.5 w-3.5" />
                            <span>{assignment.class_name} {assignment.section_name && `• ${assignment.section_name}`}</span>
                          </div>
                        </div>

                        {/* Submission Progress */}
                        {assignment.total_students && assignment.total_students > 0 && (
                          <div className="pt-3 border-t">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-xs font-medium text-muted-foreground">Submissions</span>
                              <span className="text-sm font-semibold text-foreground">
                                {assignment.submission_count || 0} / {assignment.total_students}
                              </span>
                            </div>
                            <div className="relative h-1.5 w-full bg-muted rounded-full overflow-hidden">
                              <div
                                className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ${submissionRate === 100 ? 'bg-green-600' : 'bg-primary'}`}
                                style={{ width: `${submissionRate}%` }}
                              />
                            </div>
                            <div className="mt-1.5 text-right">
                              <span className="text-xs text-muted-foreground">
                                {submissionRate}%
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Actions Footer */}
                      <div className="flex items-center justify-between pt-4 mt-4 border-t">
                        <Link to={`/assignments/submissions?id=${assignment.id}`} onClick={(e) => e.stopPropagation()}>
                          <Button
                            size="sm"
                            variant="default"
                            className="text-xs font-medium h-8 px-3"
                          >
                            View Submissions
                          </Button>
                        </Link>

                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(assignment);
                            }}
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(assignment);
                            }}
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card >

      {/* Detail Sidebar */}
      {/* Detail Sidebar */}
      <DetailSidebar
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
        title={getSidebarTitle()}
        mode={sidebarMode === 'create' ? 'create' : sidebarMode}
        width="xl"
      >
        {sidebarMode === 'view' && selectedAssignment ? (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Title</h3>
              <p className="mt-1 text-lg font-semibold">{selectedAssignment.title}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Subject</h3>
                <p className="mt-1">{selectedAssignment.subject_name}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Class</h3>
                <p className="mt-1">
                  {selectedAssignment.class_name}
                  {selectedAssignment.section_name && ` - ${selectedAssignment.section_name}`}
                </p>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
              <p className="mt-1 whitespace-pre-wrap">{selectedAssignment.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Due Date</h3>
                <p className="mt-1">{new Date(selectedAssignment.due_date).toLocaleDateString()}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Maximum Marks</h3>
                <p className="mt-1">{selectedAssignment.max_marks}</p>
              </div>
            </div>
            {selectedAssignment.total_students && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Total Students</h3>
                  <p className="mt-1">{selectedAssignment.total_students}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Submissions</h3>
                  <p className="mt-1">{selectedAssignment.submission_count || 0}</p>
                </div>
              </div>
            )}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
              <p className="mt-1">
                <Badge variant={selectedAssignment.is_active ? 'success' : 'destructive'}>
                  {selectedAssignment.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </p>
            </div>
            <div className="flex gap-2 pt-4">
              <Button onClick={() => setSidebarMode('edit')} className="flex-1">
                Edit Assignment
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDelete(selectedAssignment)}
                className="flex-1"
              >
                Delete
              </Button>
            </div>
          </div>
        ) : (
          <AssignmentForm
            assignment={selectedAssignment}
            onSubmit={handleFormSubmit}
            onCancel={handleCloseSidebar}
            isSubmitting={sidebarMode === 'create' ? createMutation.isPending : updateMutation.isPending}
          />
        )}
      </DetailSidebar>
    </div>
  );
};

