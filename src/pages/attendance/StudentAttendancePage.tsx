/**
 * Student Attendance Page
 * Redeveloped with Premium UI/UX
 */

import { format } from 'date-fns';
import { AlertCircle, Calendar as CalendarIcon, Check, RefreshCw, Save, UserCheck, Users, UserX, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { toast } from 'sonner';

import { DROPDOWN_PAGE_SIZE } from '@/config/app.config';
import { cn } from '@/lib/utils'; // Assuming alias is configured, or use relative
import { StudentAttendanceForm } from '../../components/attendance/StudentAttendanceForm';
import { Column, DataTable, FilterConfig } from '../../components/common/DataTable';
import { ClassSelector } from '../../components/context/ClassSelector';
import { SectionSelector } from '../../components/context/SectionSelector';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Separator } from '../../components/ui/separator';
import { useHierarchicalContext } from '../../contexts/HierarchicalContext';
import { usePermissions } from '../../contexts/PermissionsContext';
import { invalidateStudentAttendance, invalidateStudents, useClassesSWR, useProgramsSWR, useSectionsFilteredByClass, useStudentAttendanceSWR, useStudentsSWR, useSubjectsSWR } from '../../hooks/swr';
import { useBulkMarkAttendance, useMarkStudentAttendance } from '../../hooks/useAttendance';
import type { StudentFilters, StudentListItem } from '../../types/students.types';

type AttendanceStatus = 'present' | 'absent' | null;

const StudentAttendancePage = () => {
  const [filters, setFilters] = useState<StudentFilters>({
    page: 1,
    page_size: 50, // Increased page size for better attendance flow
  });
  const [formOpen, setFormOpen] = useState(false);
  const [bulkFormOpen, setBulkFormOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentListItem | null>(null);

  // Attendance form fields - restore from sessionStorage on refresh
  const [selectedDate, setSelectedDate] = useState(() => {
    return sessionStorage.getItem('att_page_date') || new Date().toISOString().split('T')[0];
  });
  const [selectedSubject, setSelectedSubject] = useState<number | null>(() => {
    const v = sessionStorage.getItem('att_page_subject');
    return v ? Number(v) : null;
  });
  const [selectedProgram, setSelectedProgram] = useState<number | null>(() => {
    const v = sessionStorage.getItem('att_page_program');
    return v ? Number(v) : null;
  });

  // Track attendance status for each student
  const [attendanceMap, setAttendanceMap] = useState<Record<number, AttendanceStatus>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Use hierarchical context for class and section
  const { selectedClass, selectedSection, setSelectedClass, setSelectedSection } = useHierarchicalContext();
  const { permissions, userContext } = usePermissions();
  const location = useLocation();

  // For teachers who can't choose class/section, use their assigned values
  const effectiveClass = permissions?.canChooseClass
    ? selectedClass
    : (selectedClass || (userContext?.assigned_class_ids?.[0] ?? null));
  const effectiveSection = permissions?.canChooseSection
    ? selectedSection
    : (selectedSection || (userContext?.assigned_section_ids?.[0] ?? null));

  // Handle navigation state to pre-select class/section
  useEffect(() => {
    const state = location.state as any;
    if (state) {
      if (state.classId && state.classId !== selectedClass) {
        setSelectedClass(state.classId);
      }
      if (state.sectionId && state.sectionId !== selectedSection) {
        setSelectedSection(state.sectionId);
      }
    }
  }, [location.state, selectedClass, selectedSection, setSelectedClass, setSelectedSection]);

  // Fetch students for marking attendance
  const { data, isLoading, error } = useStudentsSWR({
    ...filters,
    class_obj: effectiveClass || undefined,
    section: effectiveSection || undefined,
    program: selectedProgram || undefined,
  });

  // Fetch programs (SWR cached)
  const { data: programsData } = useProgramsSWR({ page_size: DROPDOWN_PAGE_SIZE, is_active: true });

  // Fetch subjects for the chosen class (SWR cached)
  const { data: subjectsData } = useSubjectsSWR({
    page_size: DROPDOWN_PAGE_SIZE,
    is_active: true,
    class_obj: effectiveClass || undefined,
  });

  // Fetch class and section data (SWR cached, client-side filtered)
  const { data: classesData } = useClassesSWR({ page_size: DROPDOWN_PAGE_SIZE, is_active: true });
  const { results: filteredSections } = useSectionsFilteredByClass(effectiveClass);

  // Get class and section names for display
  const effectiveClassName = classesData?.results?.find(c => c.id === effectiveClass)?.name || '';
  const effectiveSectionName = filteredSections.find(s => s.id === effectiveSection)?.name || '';

  // Fetch existing attendance for the selected date
  const { data: existingAttendanceData } = useStudentAttendanceSWR({
    class_obj: effectiveClass || undefined,
    section: effectiveSection || undefined,
    subject: selectedSubject || undefined,
    date: selectedDate,
    page_size: DROPDOWN_PAGE_SIZE,
  });

  // Persist filter selections to sessionStorage
  useEffect(() => { sessionStorage.setItem('att_page_date', selectedDate); }, [selectedDate]);
  useEffect(() => {
    if (selectedSubject !== null) sessionStorage.setItem('att_page_subject', String(selectedSubject));
    else sessionStorage.removeItem('att_page_subject');
  }, [selectedSubject]);
  useEffect(() => {
    if (selectedProgram !== null) sessionStorage.setItem('att_page_program', String(selectedProgram));
    else sessionStorage.removeItem('att_page_program');
  }, [selectedProgram]);

  // Track if we have attempted to restore from session storage to avoid accidental wipes
  const [didRestore, setDidRestore] = useState(false);

  // Persistence: Restore attendance map when filters change
  useEffect(() => {
    if (selectedDate && effectiveClass) {
      const key = `att_marks_${selectedDate}_${effectiveClass}_${effectiveSection || 'all'}`;
      try {
        const stored = sessionStorage.getItem(key);
        if (stored) {
          setAttendanceMap(JSON.parse(stored));
        } else {
          setAttendanceMap({});
        }
      } catch (err) {
        console.error("Failed to restore attendance:", err);
        setAttendanceMap({});
      }
      setDidRestore(true);
    }
  }, [effectiveClass, effectiveSection, selectedDate]);

  // Merge with existing attendance from API
  useEffect(() => {
    if (existingAttendanceData?.results) {
      const existingMap: Record<number, AttendanceStatus> = {};
      existingAttendanceData.results.forEach((record: any) => {
        if (record.student && record.status) {
          existingMap[record.student] = record.status as AttendanceStatus;
        }
      });
      // Merge: maintain unsaved marks but allow existing ones to show
      setAttendanceMap(prev => ({ ...prev, ...existingMap }));
    }
  }, [existingAttendanceData]);

  // Students that already have attendance submitted
  const lockedStudents = useMemo(
    () => new Set<number>(existingAttendanceData?.results?.map((r: any) => r.student) || []),
    [existingAttendanceData]
  );

  // Persist unsaved attendance marks to sessionStorage
  useEffect(() => {
    // ONLY save if we have actually attempted a restore first, otherwise we might wipe data
    if (didRestore && selectedDate && effectiveClass) {
      const key = `att_marks_${selectedDate}_${effectiveClass}_${effectiveSection || 'all'}`;
      const unsavedMarks: Record<string, AttendanceStatus> = {};

      Object.entries(attendanceMap).forEach(([id, status]) => {
        // Only save marks that aren't already 'locked' (submitted to DB)
        if (status !== null && !lockedStudents.has(Number(id))) {
          unsavedMarks[id] = status;
        }
      });

      if (Object.keys(unsavedMarks).length > 0) {
        sessionStorage.setItem(key, JSON.stringify(unsavedMarks));
      } else {
        // If we have nothing to save, and we DID have something before, remove it
        // Check if there was something before to avoid unnecessary removal
        if (sessionStorage.getItem(key)) {
          sessionStorage.removeItem(key);
        }
      }
    }
  }, [attendanceMap, selectedDate, effectiveClass, effectiveSection, lockedStudents, didRestore]);

  // Attendance mutations
  const bulkMarkMutation = useBulkMarkAttendance();
  const markSingleMutation = useMarkStudentAttendance();

  const handleMarkPresent = useCallback((studentId: number) => {
    if (lockedStudents.has(studentId)) return;
    setAttendanceMap(prev => ({
      ...prev,
      [studentId]: prev[studentId] === 'present' ? null : 'present'
    }));
  }, [lockedStudents]);

  const handleMarkAbsent = useCallback((studentId: number) => {
    if (lockedStudents.has(studentId)) return;
    setAttendanceMap(prev => ({
      ...prev,
      [studentId]: prev[studentId] === 'absent' ? null : 'absent'
    }));
  }, [lockedStudents]);

  const handleSubmitAttendance = async () => {
    const markedStudents = Object.entries(attendanceMap).filter(([_, status]) => status !== null);

    if (markedStudents.length === 0) {
      toast.error('Please mark attendance for at least one student');
      return;
    }

    if (!effectiveClass) { toast.error('Please select class'); return; }
    if (!effectiveSection) { toast.error('Please select section'); return; }

    setIsSubmitting(true);
    try {
      // Group students by status
      const groupedByStatus: Record<string, number[]> = {};
      markedStudents.forEach(([studentId, status]) => {
        if (status && !groupedByStatus[status]) {
          groupedByStatus[status] = [];
        }
        if (status && !lockedStudents.has(Number(studentId))) {
          groupedByStatus[status].push(Number(studentId));
        }
      });

      const promises = Object.entries(groupedByStatus).map(async ([status, studentIds]) => {
        if (studentIds.length === 0) return;

        if (studentIds.length === 1) {
          return await markSingleMutation.mutateAsync({
            student: studentIds[0],
            class_obj: effectiveClass!,
            section: effectiveSection || null,
            date: selectedDate,
            subject: selectedSubject,
            status: status as 'present' | 'absent' | 'late' | 'excused' | 'half_day',
            period: null,
            remarks: null,
          });
        } else {
          return await bulkMarkMutation.mutateAsync({
            student_ids: studentIds,
            class_obj: effectiveClass!,
            section: effectiveSection || null,
            date: selectedDate,
            status: status as 'present' | 'absent' | 'late' | 'excused' | 'half_day',
            subject: selectedSubject,
            remarks: null,
          });
        }
      });

      await Promise.all(promises);
      // Clear stored unsaved marks after successful submission
      const storageKey = `att_marks_${selectedDate}_${effectiveClass}_${effectiveSection}`;
      sessionStorage.removeItem(storageKey);
      toast.success(`Attendance submitted successfully for ${markedStudents.length} student(s)`);
      await invalidateStudentAttendance();
      await invalidateStudents();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to submit attendance');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectAll = useCallback((status: 'present' | 'absent') => {
    const students = data?.results || [];
    const newMap: Record<number, AttendanceStatus> = {};
    students.forEach(student => {
      if (!lockedStudents.has(student.id)) {
        newMap[student.id] = status;
      }
    });
    setAttendanceMap(prev => {
      const merged = { ...prev };
      students.forEach(student => {
        if (!lockedStudents.has(student.id)) {
          merged[student.id] = status;
        }
      });
      return merged;
    });

    toast.success(`All unlocked students marked as ${status}`);
  }, [data?.results, lockedStudents]);

  const handleFormSuccess = async () => { await invalidateStudents(); };

  // Calculate stats — single pass over attendanceMap values
  const { presentCount, absentCount, totalMarked } = useMemo(() => {
    let present = 0, absent = 0, marked = 0;
    for (const status of Object.values(attendanceMap)) {
      if (status === 'present') { present++; marked++; }
      else if (status === 'absent') { absent++; marked++; }
      else if (status !== null) { marked++; }
    }
    return { presentCount: present, absentCount: absent, totalMarked: marked };
  }, [attendanceMap]);
  const totalStudents = data?.count || 0;
  const unmarkedCount = (data?.results?.length || 0) - Object.keys(attendanceMap).length;

  const columns: Column<StudentListItem>[] = useMemo(() => [
    {
      key: 'student_info',
      label: 'Student',
      sortable: false,
      className: 'w-[250px]',
      render: (student) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs border border-primary/20">
            {student.full_name.substring(0, 2).toUpperCase()}
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm text-foreground">{student.full_name}</span>
            <span className="text-xs text-muted-foreground">{student.admission_number}</span>
          </div>
        </div>
      )
    },
    {
      key: 'roll_number',
      label: 'Roll No',
      sortable: true,
      className: 'w-[100px]',
      render: (student) => (
        <Badge variant="outline" className="font-mono text-xs bg-muted/50">
          {student.roll_number || 'N/A'}
        </Badge>
      )
    },
    {
      key: 'attendance_action',
      label: 'Mark Attendance',
      className: 'w-[240px]',
      render: (student) => {
        // Determine effective status: either from local map (new/edit) or strict locked source
        const localStatus = attendanceMap[student.id];
        const isLocked = lockedStudents.has(student.id);

        // If locked, we usually trust the API data, but we might have initialized attendanceMap with it too.
        // In the useEffect above, we did: setAttendanceMap(existingMap). So attendanceMap holds the truth.
        const currentStatus = localStatus;

        return (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isLocked}
              className={cn(
                "h-8 flex-1 transition-all rounded-md flex gap-2 items-center justify-center border",
                currentStatus === 'present'
                  ? "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-900 font-medium"
                  : "bg-transparent border-transparent text-muted-foreground hover:bg-green-50 hover:text-green-600 hover:border-green-100"
              )}
              onClick={() => handleMarkPresent(student.id)}
            >
              <Check className="h-3.5 w-3.5" />
              Present
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isLocked}
              className={cn(
                "h-8 flex-1 transition-all rounded-md flex gap-2 items-center justify-center border",
                currentStatus === 'absent'
                  ? "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-900 font-medium"
                  : "bg-transparent border-transparent text-muted-foreground hover:bg-red-50 hover:text-red-600 hover:border-red-100"
              )}
              onClick={() => handleMarkAbsent(student.id)}
            >
              <X className="h-3.5 w-3.5" />
              Absent
            </Button>
          </div>
        );
      },
    },
    {
      key: 'status',
      label: 'Status',
      className: 'w-[150px]',
      render: (student) => {
        const localStatus = attendanceMap[student.id];
        const isLocked = lockedStudents.has(student.id);

        if (isLocked) {
          return (
            <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-slate-200 gap-1.5 pl-1.5">
              <div className="h-2 w-2 rounded-full bg-slate-500" />
              Submitted
            </Badge>
          );
        }

        if (localStatus) {
          return (
            <Badge variant="outline" className="border-orange-200 bg-orange-50 text-orange-600 gap-1.5 pl-1.5">
              <div className="h-2 w-2 rounded-full bg-orange-400 animate-pulse" />
              Unsaved
            </Badge>
          );
        }

        return (
          <span className="text-xs text-muted-foreground/50 font-medium px-2">Pending</span>
        );
      }
    }
  ], [attendanceMap, lockedStudents, handleMarkPresent, handleMarkAbsent]);

  const filterConfig: FilterConfig[] = useMemo(() => [
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
  ], []);

  return (
    <div className="space-y-4 p-6">

      {/* Header + Stats inline */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Student Attendance</h1>
          <p className="text-sm text-muted-foreground">
            {selectedDate ? format(new Date(selectedDate), 'EEEE, MMMM d, yyyy') : 'Select a date'}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="gap-1.5 px-3 py-1.5 text-sm font-medium">
            <Users className="h-3.5 w-3.5 text-blue-500" /> {totalStudents} Total
          </Badge>
          <Badge variant="outline" className="gap-1.5 px-3 py-1.5 text-sm font-medium text-green-700 border-green-200 bg-green-50">
            <UserCheck className="h-3.5 w-3.5" /> {presentCount} Present
          </Badge>
          <Badge variant="outline" className="gap-1.5 px-3 py-1.5 text-sm font-medium text-red-700 border-red-200 bg-red-50">
            <UserX className="h-3.5 w-3.5" /> {absentCount} Absent
          </Badge>
          <Badge variant="outline" className="gap-1.5 px-3 py-1.5 text-sm font-medium text-yellow-700 border-yellow-200 bg-yellow-50">
            <AlertCircle className="h-3.5 w-3.5" /> {totalStudents - totalMarked} Pending
          </Badge>
        </div>
      </div>

      {/* Filters Card - Compact */}
      <Card className="shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-end gap-3">


            {/* Date */}
            <div className="space-y-1 w-[170px]">
              <Label className="text-xs font-medium text-muted-foreground">Date</Label>
              <div className="relative">
                <CalendarIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="pl-8 h-9 text-sm"
                />
              </div>
            </div>

            {/* Program */}
            <div className="space-y-1 w-[180px]">
              <Label className="text-xs font-medium text-muted-foreground">Program</Label>
              <Select
                value={selectedProgram ? selectedProgram.toString() : 'all'}
                onValueChange={(value: string) => setSelectedProgram(value === 'all' ? null : Number(value))}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="All Programs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Programs</SelectItem>
                  {programsData?.results?.map((prog) => (
                    <SelectItem key={prog.id} value={prog.id.toString()}>{prog.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Class */}
            {permissions?.canChooseClass ? (
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase text-muted-foreground">Class</Label>
                <ClassSelector label="" showAllOption />
              </div>
            ) : effectiveClass ? (
              <div className="space-y-1 w-[180px]">
                <Label className="text-xs font-medium text-muted-foreground">Class</Label>
                <Input value={effectiveClassName || 'Assigned'} disabled className="h-9 text-sm bg-muted/50" />
              </div>
            ) : null}

            {/* Section */}
            {permissions?.canChooseSection ? (
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase text-muted-foreground">Section</Label>
                <SectionSelector required label="" />
              </div>
            ) : effectiveSection ? (
              <div className="space-y-1 w-[180px]">
                <Label className="text-xs font-medium text-muted-foreground">Section</Label>
                <Input value={effectiveSectionName || 'Assigned'} disabled className="h-9 text-sm bg-muted/50" />
              </div>
            ) : null}

            {/* Subject */}
            <div className="space-y-1 w-[200px]">
              <Label className="text-xs font-medium text-muted-foreground">Subject (Optional)</Label>
              <Select
                value={selectedSubject ? selectedSubject.toString() : 'all'}
                onValueChange={(value: string) => setSelectedSubject(value === 'all' ? null : Number(value))}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="General Attendance" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">General Attendance</SelectItem>
                  {subjectsData?.results?.map((subj) => (
                    <SelectItem key={subj.id} value={subj.id.toString()}>{subj.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Spacer + Actions */}
            <div className="flex items-center gap-2 ml-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSelectAll('present')}
                disabled={isSubmitting || !effectiveClass}
                className="h-9 text-green-700 hover:bg-green-50 border-green-200"
              >
                <Check className="h-3.5 w-3.5 mr-1.5" />
                All Present
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSelectAll('absent')}
                disabled={isSubmitting || !effectiveClass}
                className="h-9 text-red-700 hover:bg-red-50 border-red-200"
              >
                <X className="h-3.5 w-3.5 mr-1.5" />
                All Absent
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <Button variant="outline" size="sm" onClick={() => invalidateStudents()} disabled={isLoading} className="h-9">
                <RefreshCw className={cn("h-3.5 w-3.5 mr-1.5", isLoading && "animate-spin")} />
                Refresh
              </Button>
              <Button
                size="sm"
                onClick={handleSubmitAttendance}
                disabled={totalMarked === 0 || isSubmitting}
                className="h-9 shadow-sm"
              >
                <Save className="h-3.5 w-3.5 mr-1.5" />
                {isSubmitting ? 'Saving...' : `Submit (${totalMarked})`}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Data Table */}
      <Card className="shadow-sm mt-6">
        <CardHeader className="px-6 py-4 border-b">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            Student List
            {data?.count ? (
              <Badge variant="secondary" className="ml-2 text-xs font-normal">
                {data.count} records
              </Badge>
            ) : null}
          </CardTitle>
        </CardHeader>
        <div className="p-6 pt-4">
          <DataTable
            columns={columns}
            data={data || { count: 0, next: null, previous: null, results: [] }}
            isLoading={isLoading}
            error={typeof error === 'string' ? error : error ? String(error) : null}
            onRefresh={() => invalidateStudents()}
            filters={filters}
            onFiltersChange={setFilters}
            filterConfig={filterConfig}
            searchPlaceholder="Search by name or admission no..."
            rowClassName={(student) => {
              const status = attendanceMap[student.id];
              const isLocked = lockedStudents.has(student.id);
              const baseClasses = "transition-all duration-200 ";

              if (status === 'present') {
                return cn(
                  baseClasses,
                  "!bg-emerald-100/60 hover:!bg-emerald-200/60 dark:!bg-emerald-900/40 dark:hover:!bg-emerald-900/50 border-l-4 border-l-emerald-500 shadow-sm z-10",
                  isLocked && "opacity-90 grayscale-[0.2]"
                );
              }
              if (status === 'absent') {
                return cn(
                  baseClasses,
                  "!bg-rose-100/60 hover:!bg-rose-200/60 dark:!bg-rose-950/40 dark:hover:!bg-rose-900/50 border-l-4 border-l-rose-500 shadow-sm z-10",
                  isLocked && "opacity-90 grayscale-[0.2]"
                );
              }
              return baseClasses;
            }}
          />
        </div>
      </Card>

      <StudentAttendanceForm
        open={formOpen}
        onOpenChange={setFormOpen}
        attendance={null}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
};

export default StudentAttendancePage;
