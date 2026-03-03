/**
 * Staff Attendance Page
 * Refactored to match Student Attendance UX
 */

import { Check, Loader2, Save, Search, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { DROPDOWN_PAGE_SIZE } from '@/config/app.config';
import { cn } from '@/lib/utils';
import { Column, DataTable } from '../../components/common/DataTable';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { invalidateStaffAttendance, useStaffAttendanceSWR } from '../../hooks/swr';
import { useBulkMarkStaffAttendance } from '../../hooks/useAttendance';
import { useDebounce } from '../../hooks/useDebounce';
import { useTeachersSWR } from '../../hooks/useTeachersSWR';
import type { TeacherListItem } from '../../types/teachers.types';

type AttendanceStatus = 'present' | 'absent' | 'leave' | 'late' | null;

const StaffAttendancePage = () => {
  // Filters
  const [selectedDate, setSelectedDate] = useState(() => {
    return sessionStorage.getItem('staff_att_page_date') || new Date().toISOString().split('T')[0];
  });
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Track if we have attempted to restore from session storage to avoid accidental wipes
  const [didRestore, setDidRestore] = useState(false);

  // Persist date
  useEffect(() => {
    sessionStorage.setItem('staff_att_page_date', selectedDate);
  }, [selectedDate]);

  // Local state for marking
  const [attendanceMap, setAttendanceMap] = useState<Record<number, AttendanceStatus>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch all teachers (Staff)
  const {
    data: teachersData,
    isLoading: isLoadingTeachers,
    error: teachersError,
  } = useTeachersSWR({ page_size: DROPDOWN_PAGE_SIZE, search: debouncedSearchQuery });

  // Fetch existing attendance for the date
  const {
    data: attendanceData,
    isLoading: isLoadingAttendance,
  } = useStaffAttendanceSWR({
    date: selectedDate,
    page_size: DROPDOWN_PAGE_SIZE,
  });

  // Derived state: Existing Locked Attendance
  // We map teacher_id -> status
  const existingMap = useMemo(() => {
    const map: Record<number, string> = {};
    if (attendanceData?.results) {
      attendanceData.results.forEach(record => {
        if (record.teacher) {
          // Normalize status to lowercase
          map[record.teacher] = record.status.toLowerCase();
        }
      });
    }
    return map;
  }, [attendanceData]);

  // Persistence: Restore attendance map when filters change
  useEffect(() => {
    if (selectedDate) {
      const key = `staff_att_marks_${selectedDate}`;
      try {
        const stored = sessionStorage.getItem(key);
        if (stored) {
          setAttendanceMap(JSON.parse(stored));
        } else {
          setAttendanceMap({});
        }
      } catch (err) {
        console.error("Failed to restore staff attendance:", err);
        setAttendanceMap({});
      }
      setDidRestore(true);
    }
  }, [selectedDate]);

  // Persist unsaved attendance marks to sessionStorage
  useEffect(() => {
    if (didRestore && selectedDate) {
      const key = `staff_att_marks_${selectedDate}`;
      const unsavedMarks: Record<string, AttendanceStatus> = {};

      Object.entries(attendanceMap).forEach(([id, status]) => {
        // Only save marks that aren't already submitted to DB
        if (status !== null && !existingMap[Number(id)]) {
          unsavedMarks[id] = status;
        }
      });

      if (Object.keys(unsavedMarks).length > 0) {
        sessionStorage.setItem(key, JSON.stringify(unsavedMarks));
      } else {
        if (sessionStorage.getItem(key)) {
          sessionStorage.removeItem(key);
        }
      }
    }
  }, [attendanceMap, selectedDate, existingMap, didRestore]);

  // Derived state: Teachers List merged with Attendance
  // We want to show ALL teachers.
  const teachers = teachersData?.results || [];

  // Filtered teachers list based on local status filter (since API filter might not support 'missing')
  const filteredTeachers = useMemo(() => {
    if (statusFilter === 'all') return teachers;
    return teachers.filter(t => {
      const status = attendanceMap[t.id] || existingMap[t.id] || 'pending';
      if (statusFilter === 'pending') return !attendanceMap[t.id] && !existingMap[t.id];
      return status === statusFilter;
    });
  }, [teachers, statusFilter, attendanceMap, existingMap]);


  // Initialize attendance map? 
  // Unlike student page, we might not want to pre-fill it with existing data to avoid confusion between "newly marked" vs "already saved",
  // BUT the user usually wants to see current state.
  // The strategy in StudentAttendancePage was: locked students are disabled.
  // We can do the same.

  // Mutations
  const bulkMarkMutation = useBulkMarkStaffAttendance();

  const handleMark = (teacherId: number, status: AttendanceStatus) => {
    if (existingMap[teacherId]) return; // Locked if already submitted for today
    setAttendanceMap(prev => ({
      ...prev,
      [teacherId]: prev[teacherId] === status ? null : status
    }));
  };

  const handleSelectAll = (status: AttendanceStatus) => {
    if (!status) return;
    const newMap = { ...attendanceMap };
    teachers.forEach(t => {
      if (!existingMap[t.id]) {
        newMap[t.id] = status;
      }
    });
    setAttendanceMap(newMap);
    toast.success(`Marked all unmarked staff as ${status}`);
  };

  const handleSubmit = async () => {
    // Group teachers by status for the bulk API
    // API expects: { teacher_ids, date, status } per call
    const byStatus: Record<string, number[]> = {};

    Object.entries(attendanceMap).forEach(([id, status]) => {
      if (status !== null && !existingMap[Number(id)]) {
        if (!byStatus[status]) byStatus[status] = [];
        byStatus[status].push(Number(id));
      }
    });

    const totalToSubmit = Object.values(byStatus).reduce((sum, ids) => sum + ids.length, 0);

    if (totalToSubmit === 0) {
      toast.error('No new attendance to submit');
      return;
    }

    setIsSubmitting(true);
    try {
      // One API call per status group (e.g. present, absent, leave)
      // This is far more efficient than N individual calls
      await Promise.all(
        Object.entries(byStatus).map(([status, teacher_ids]) =>
          bulkMarkMutation.mutateAsync({
            teacher_ids,
            date: selectedDate,
            status,
          })
        )
      );

      toast.success(`Submitted attendance for ${totalToSubmit} staff members`);
      setAttendanceMap({});
      sessionStorage.removeItem(`staff_att_marks_${selectedDate}`);
      await invalidateStaffAttendance();
    } catch (err: any) {
      toast.error(typeof err.message === 'string' ? err.message : 'Failed to submit attendance');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Stats
  const stats = useMemo(() => {
    const total = teachers.length;
    let present = 0;
    let absent = 0;
    let leave = 0;
    let marked = 0;

    teachers.forEach(t => {
      const status = attendanceMap[t.id] || existingMap[t.id];
      if (status) {
        marked++;
        if (status === 'present') present++;
        else if (status === 'absent') absent++;
        else if (status === 'leave') leave++;
      }
    });

    return { total, marked, present, absent, leave };
  }, [teachers, attendanceMap, existingMap]);

  // Columns
  const columns: Column<TeacherListItem>[] = [
    {
      key: 'employee_id',
      label: 'ID',
      sortable: true,
      className: 'w-[150px] font-medium',
      render: (t) => t.employee_id || `#${t.id}`
    },
    { key: 'full_name', label: 'Staff Name', sortable: true, className: 'pl-6' },

    {
      key: 'faculty_name',
      label: 'Faculty/Dept',
      sortable: true,
      render: (t) => t.faculty_name || '-'
    },
    {
      key: 'status',
      label: 'Status',
      render: (t) => {
        const status = attendanceMap[t.id] || existingMap[t.id];
        if (!status) return <Badge variant="outline" className="text-muted-foreground">Pending</Badge>;

        const variants: Record<string, "default" | "secondary" | "destructive" | "outline" | "success" | "warning"> = {
          present: 'success',
          absent: 'destructive',
          leave: 'warning',
          late: 'warning'
        };
        return <Badge variant={variants[status] || 'secondary'} className="capitalize">{status}</Badge>;
      }
    },
    {
      key: 'actions',
      label: 'Actions',
      className: 'text-right',
      render: (t) => {
        const isLocked = !!existingMap[t.id];
        const currentStatus = attendanceMap[t.id];

        if (isLocked) {
          return <span className="text-sm text-muted-foreground italic">Submitted</span>;
        }

        return (
          <div className="flex justify-end gap-2">
            <Button
              size="sm"
              variant={currentStatus === 'present' ? 'default' : 'outline'}
              className={currentStatus === 'present' ? "bg-green-600 hover:bg-green-700" : "hover:text-green-600 hover:bg-green-50"}
              onClick={() => handleMark(t.id, 'present')}
            >
              <Check className="h-4 w-4 mr-1" />
              Present
            </Button>
            <Button
              size="sm"
              variant={currentStatus === 'absent' ? 'default' : 'outline'}
              className={currentStatus === 'absent' ? "bg-red-600 hover:bg-red-700" : "hover:text-red-600 hover:bg-red-50"}
              onClick={() => handleMark(t.id, 'absent')}
            >
              <X className="h-4 w-4 mr-1" />
              Absent
            </Button>
            <Button
              size="sm"
              variant={currentStatus === 'leave' ? 'default' : 'outline'}
              className={currentStatus === 'leave' ? "bg-yellow-600 hover:bg-yellow-700" : "hover:text-yellow-600 hover:bg-yellow-50"}
              onClick={() => handleMark(t.id, 'leave')}
              title="Mark Leave"
            >
              Leave
            </Button>
          </div>
        );
      }
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Staff Attendance</h1>
          <p className="text-muted-foreground">Manage daily attendance for teachers and staff</p>
          <div className="flex gap-4 mt-2 text-sm">
            <span className="text-muted-foreground">Total: <span className="text-foreground font-medium">{stats.total}</span></span>
            <span className="text-green-600">Present: <span className="font-medium">{stats.present}</span></span>
            <span className="text-red-600">Absent: <span className="font-medium">{stats.absent}</span></span>
            <span className="text-yellow-600">Leave: <span className="font-medium">{stats.leave}</span></span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => handleSelectAll('present')} disabled={isSubmitting}>
            All Present
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleSelectAll('absent')} disabled={isSubmitting}>
            All Absent
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || Object.keys(attendanceMap).length === 0}
            className="min-w-[120px]"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Save ({Object.keys(attendanceMap).length})
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="space-y-2 w-full md:w-auto">
              <Label>Date</Label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  // setAttendanceMap({}); // Removed: Let the restoration logic handle state reset/restore
                }}
                className="w-full md:w-[200px]"
              />
            </div>
            <div className="space-y-2 w-full md:w-auto flex-1">
              <Label>Search Staff</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, ID or designation..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2 w-full md:w-auto">
              <Label>Filter Status</Label>
              <select
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Staff</option>
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="leave">On Leave</option>
                <option value="pending">Not Marked</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <DataTable
        columns={columns}
        data={{ results: filteredTeachers, count: filteredTeachers.length, next: null, previous: null }} // Client-side pagination for simpler interactions
        isLoading={isLoadingTeachers || isLoadingAttendance}
        error={teachersError instanceof Error ? teachersError.message : String(teachersError || "")}
        rowClassName={(t) => {
          const status = attendanceMap[t.id] || existingMap[t.id];
          const isLocked = !!existingMap[t.id];
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
          if (status === 'leave') {
            return cn(
              baseClasses,
              "!bg-amber-100/60 hover:!bg-amber-200/60 dark:!bg-amber-950/40 dark:hover:!bg-amber-900/50 border-l-4 border-l-amber-500 shadow-sm z-10",
              isLocked && "opacity-90 grayscale-[0.2]"
            );
          }
          return baseClasses;
        }}
      />
    </div>
  );
};

export default StaffAttendancePage;
