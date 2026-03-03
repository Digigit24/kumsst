/**
 * Exam Schedules Page
 * Premium design with timeline visualization and modern UI
 */


import { motion } from 'framer-motion';
import {
  CalendarDays,
  Clock,
  Filter,
  GraduationCap,
  LayoutList,
  MapPin,
  Plus,
  RefreshCw,
  Search,
  Loader2
} from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  XAxis,
  YAxis
} from 'recharts';
import { toast } from 'sonner';
import { Column, DataTable, FilterConfig } from '../../components/common/DataTable';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { useAuth } from '../../hooks/useAuth';
import { useCreateExamSchedule, useDeleteExamSchedule, useExamSchedules, useUpdateExamSchedule } from '../../hooks/useExamination';
import type { ExamSchedule } from '../../types/examination.types';
import { ExamDrawer } from './components/ExamDrawer';
import { ExamScheduleForm } from './forms';

export default function ExamSchedulesPage() {
  const { user } = useAuth();
  const [filters, setFilters] = useState<Record<string, any>>({ page: 1, page_size: 10 });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarMode, setSidebarMode] = useState<'view' | 'create' | 'edit'>('view');
  const [selectedSchedule, setSelectedSchedule] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const isStudent = user?.user_type === 'student' || user?.userType === 'student';

  // Fetch exam schedules using real API
  const { data, isLoading, error, refetch } = useExamSchedules(filters);
  const createMutation = useCreateExamSchedule();
  const updateMutation = useUpdateExamSchedule();
  const deleteMutation = useDeleteExamSchedule();

  // Derived Stats - use data.count for accurate total, results for current-page analysis
  const totalSchedules = data?.count || 0;
  const todaySchedules = data?.results?.filter((s: any) => new Date(s.date).toDateString() === new Date().toDateString()).length || 0;
  const uniqueSubjects = new Set(data?.results?.map((s: any) => s.subject_name)).size || 0;

  // Chart Data: Compute exams per day of week from actual schedule data
  const chartData = useMemo(() => {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const counts: Record<string, number> = {};
    dayNames.forEach(d => { counts[d] = 0; });
    (data?.results || []).forEach((s: any) => {
      if (s.date) {
        const day = dayNames[new Date(s.date).getDay()];
        counts[day] = (counts[day] || 0) + 1;
      }
    });
    return dayNames.filter(d => d !== 'Sun').map(name => ({ name, count: counts[name] }));
  }, [data?.results]);

  const columns: Column<any>[] = [
    {
      key: 'exam_name',
      label: 'Exam & Subject',
      sortable: true,
      render: (schedule) => (
        <div className="flex flex-col">
          <span className="font-semibold text-foreground">{schedule.exam_name || '-'}</span>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="text-xs font-normal bg-indigo-50 text-indigo-700 border-indigo-200">
              {schedule.subject_name || '-'}
            </Badge>
          </div>
        </div>
      ),
    },
    {
      key: 'date',
      label: 'Timing',
      sortable: true,
      render: (schedule) => (
        <div className="flex flex-col text-sm">
          <div className="flex items-center gap-1 font-medium text-foreground">
            <CalendarDays className="h-3 w-3 text-muted-foreground" />
            {new Date(schedule.date).toLocaleDateString()}
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
            <Clock className="h-3 w-3" />
            {schedule.start_time} - {schedule.end_time}
          </div>
        </div>
      ),
    },
    {
      key: 'classroom_name',
      label: 'Venue',
      render: (schedule) => (
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="h-3 w-3 text-red-400" />
          <span>{schedule.classroom_name || 'TBA'}</span>
        </div>
      ),
    },
    {
      key: 'max_marks',
      label: 'Marks',
      render: (schedule) => <Badge variant="secondary" className="font-mono">{schedule.max_marks}</Badge>,
    },
    {
      key: 'actions',
      label: 'Action',
      render: (schedule) => (
        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleRowClick(schedule); }}>
          Details
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
    setSelectedSchedule(null);
    setSidebarMode('create');
    setIsSidebarOpen(true);
  };

  const handleRowClick = (schedule: ExamSchedule) => {
    setSelectedSchedule(schedule);
    setSidebarMode('view');
    setIsSidebarOpen(true);
  };

  const handleEdit = () => {
    setSidebarMode('edit');
  };

  const handleFormSubmit = async (data: Partial<ExamSchedule>) => {
    try {
      if (sidebarMode === 'edit' && selectedSchedule?.id) {
        await updateMutation.mutateAsync({ id: selectedSchedule.id, data: data as any });
        toast.success('Exam schedule updated successfully');
      } else {
        await createMutation.mutateAsync(data as any);
        toast.success('Exam schedule created successfully');
      }
      setIsSidebarOpen(false);
      refetch();
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to save exam schedule';
      toast.error(errorMessage);
    }
  };

  const handleDelete = async () => {
    if (!selectedSchedule?.id) return;
    if (window.confirm('Are you sure you want to delete this exam schedule?')) {
      try {
        await deleteMutation.mutateAsync(selectedSchedule.id);
        toast.success('Exam schedule deleted successfully');
        setIsSidebarOpen(false);
        refetch();
      } catch (error: any) {
        toast.error(error?.message || 'Failed to delete exam schedule');
      }
    }
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
    setSelectedSchedule(null);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Loading schedules...</p>
      </div>
    );
  }

  return (
    <>
      <motion.div
        className="p-6 space-y-6 min-h-screen bg-transparent"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
              Exam Schedules
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Detailed timetables and invigilation details
            </p>
          </div>
          <div className="flex items-center gap-3">

            <Button onClick={() => refetch()} variant="outline" size="sm" className="hover:bg-primary/10">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            {!isStudent && (
              <Button onClick={handleAddNew} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Schedule
              </Button>
            )}
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <motion.div variants={itemVariants} whileHover={{ y: -5 }} transition={{ type: 'spring', stiffness: 300 }}>
            <Card className="overflow-hidden relative shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-muted-foreground font-medium text-sm flex justify-between items-center">
                  TOTAL SCHEDULED
                  <LayoutList className="h-4 w-4 opacity-70" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{totalSchedules}</div>
                <p className="text-muted-foreground text-xs mt-1">Papers to be conducted</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants} whileHover={{ y: -5 }} transition={{ type: 'spring', stiffness: 300 }}>
            <Card className="overflow-hidden relative shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-muted-foreground font-medium text-sm flex justify-between items-center">
                  TODAY'S PAPERS
                  <CalendarDays className="h-4 w-4 opacity-70" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{todaySchedules}</div>
                <p className="text-muted-foreground text-xs mt-1">{new Date().toLocaleDateString()}</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants} whileHover={{ y: -5 }} transition={{ type: 'spring', stiffness: 300 }}>
            <Card className="overflow-hidden relative shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-muted-foreground font-medium text-sm flex justify-between items-center">
                  SUBJECTS COVERED
                  <GraduationCap className="h-4 w-4 opacity-70" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{uniqueSubjects}</div>
                <p className="text-muted-foreground text-xs mt-1">Unique subjects</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {!isStudent && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {/* Chart */}
            <motion.div variants={itemVariants} className="md:col-span-2">
              <Card className="border-none shadow-md h-full">
                <CardHeader>
                  <CardTitle className="text-lg">Schedule Distribution</CardTitle>
                  <CardDescription>Number of papers per day this week</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                        <RechartsTooltip cursor={false} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#0d9488' : '#059669'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Search/Filters */}
            <motion.div variants={itemVariants} className="md:col-span-1">
              <Card className="border-none shadow-md h-full bg-muted/40 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Quick Find</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Find subject or class..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-background"
                    />
                  </div>
                  <div className="p-4 bg-background rounded-lg border border-border/50">
                    <h4 className="font-medium mb-2 text-sm flex items-center gap-2">
                      <Filter className="h-3 w-3" /> Filters
                    </h4>
                    <div className="space-y-2">
                      <Badge variant="secondary" className="mr-2 cursor-pointer hover:bg-slate-200">Today</Badge>
                      <Badge variant="secondary" className="mr-2 cursor-pointer hover:bg-slate-200">Start This Week</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}

        {/* Data Table */}
        <motion.div variants={itemVariants}>
          <Card className="border-none shadow-md overflow-hidden">
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
              searchPlaceholder="Search schedules..."
              hideToolbar={true}
            />
          </Card>
        </motion.div>

      </motion.div>

      <ExamDrawer
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
        title={sidebarMode === 'create' ? 'Create Exam Schedule' : 'Exam Schedule'}
        mode={sidebarMode}
        width="xl"
      >
        {sidebarMode === 'view' && selectedSchedule ? (
          <div className="space-y-6">
            {/* Exam & Subject Info */}
            <div className="p-4 rounded-lg bg-muted/40 border">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold">{selectedSchedule.exam_name || '-'}</h3>
                  <p className="text-muted-foreground font-medium mt-1">
                    {selectedSchedule.subject_name || '-'}
                  </p>
                </div>
                <Badge variant="secondary">
                  {selectedSchedule.max_marks} Marks
                </Badge>
              </div>
            </div>

            {/* Schedule Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</h4>
                <p className="text-sm font-medium flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-primary" />
                  {new Date(selectedSchedule.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Time</h4>
                <p className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  {selectedSchedule.start_time} - {selectedSchedule.end_time}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="space-y-1">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Venue</h4>
                <p className="text-sm font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-destructive" />
                  {selectedSchedule.classroom_name || 'Not assigned'}
                </p>
              </div>
              {selectedSchedule.invigilator && (
                <div className="space-y-1">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Invigilator</h4>
                  <p className="text-sm font-medium">{selectedSchedule.invigilator}</p>
                </div>
              )}
            </div>

            {!isStudent && (
              <div className="pt-6 flex gap-2 border-t mt-4">
                <Button onClick={handleEdit} className="flex-1">Edit</Button>
                <Button variant="destructive" onClick={handleDelete}>Delete</Button>
              </div>
            )}
          </div>
        ) : (
          <ExamScheduleForm
            schedule={sidebarMode === 'edit' ? selectedSchedule : null}
            onSubmit={handleFormSubmit}
            onCancel={handleCloseSidebar}
          />
        )}
      </ExamDrawer>
    </>
  );
}
