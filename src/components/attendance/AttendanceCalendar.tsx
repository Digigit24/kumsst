/**
 * Attendance Calendar Component
 * Displays student attendance in a compact calendar view
 * Reusable in both student portal and student detail page
 */

import { cn } from '@/lib/utils';
import { attendanceDrillDownApi } from '@/services/attendance-drilldown.service';
import { useQuery } from '@tanstack/react-query';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, TrendingUp, UserCheck, UserX } from 'lucide-react';
import React, { useState } from 'react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface AttendanceRecord {
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused' | 'half_day';
  subject?: string;
  remarks?: string;
  check_in_time?: string;
  check_out_time?: string;
}

interface AttendanceCalendarProps {
  studentId?: number;
  showStats?: boolean;
  showLegend?: boolean;
  compact?: boolean;
}

export const AttendanceCalendar: React.FC<AttendanceCalendarProps> = ({
  studentId,
  showStats = true,
  showLegend = true,
  compact = false,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Fetch attendance data using the drilldown API to avoid filter issues
  const { data: attendanceData, isLoading, error } = useQuery({
    queryKey: ['student-attendance-drilldown', studentId],
    queryFn: async () => {
      if (!studentId) return null;
      return await attendanceDrillDownApi.getStudentDetails(studentId);
    },
    enabled: !!studentId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const mapStatus = (apiStatus: string): AttendanceRecord['status'] => {
    if (!apiStatus) return 'present';
    const status = apiStatus.toLowerCase();
    if (status === 'present') return 'present';
    if (status === 'absent') return 'absent';
    if (status === 'late') return 'late';
    if (status === 'half_day' || status === 'half day') return 'half_day';
    if (status === 'excused' || status === 'leave') return 'excused';
    return 'present'; // Default fallback
  };

  const attendanceRecords: AttendanceRecord[] = (attendanceData?.attendance_records || []).map((record) => ({
    date: record.date,
    status: mapStatus(record.status),
    remarks: record.remarks || undefined,
    check_in_time: record.check_in_time || undefined,
    check_out_time: record.check_out_time || undefined,
  }));

  // Create a map for quick lookup
  const attendanceMap = new Map(
    attendanceRecords.map(record => [record.date, record])
  );

  // Calculate statistics
  // We can use the overall stats from the response or calculate current month's
  const currentMonthRecords = attendanceRecords.filter(r => {
    const d = new Date(r.date);
    return d.getFullYear() === year && d.getMonth() === month;
  });

  const stats = {
    total: currentMonthRecords.length,
    present: currentMonthRecords.filter(r => r.status === 'present').length,
    absent: currentMonthRecords.filter(r => r.status === 'absent').length,
    late: currentMonthRecords.filter(r => r.status === 'late').length,
    halfDay: currentMonthRecords.filter(r => r.status === 'half_day').length,
    percentage: '0',
  };

  // Use API provided percentage if available and we want overall, otherwise calculate monthly
  // const overallPercentage = attendanceData?.overall_attendance || 0;
  // Let's stick to monthly percentage for the stats cards as they change with month view
  stats.percentage = stats.total > 0 ? ((stats.present / stats.total) * 100).toFixed(1) : '0';

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDate(null);
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDate(null);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(null);
  };

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Get calendar days
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const calendarDays: Array<{ date: Date; isCurrentMonth: boolean }> = [];

  // Previous month days
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    calendarDays.push({
      date: new Date(year, month - 1, daysInPrevMonth - i),
      isCurrentMonth: false,
    });
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push({
      date: new Date(year, month, i),
      isCurrentMonth: true,
    });
  }

  // Next month days to fill the grid
  const remainingDays = 42 - calendarDays.length; // 6 rows × 7 days
  for (let i = 1; i <= remainingDays; i++) {
    calendarDays.push({
      date: new Date(year, month + 1, i),
      isCurrentMonth: false,
    });
  }

  const getStatusColor = (status: AttendanceRecord['status']) => {
    switch (status) {
      case 'present':
        return 'bg-green-500 dark:bg-green-600';
      case 'absent':
        return 'bg-red-500 dark:bg-red-600';
      case 'late':
        return 'bg-yellow-500 dark:bg-yellow-600';
      case 'excused':
        return 'bg-blue-500 dark:bg-blue-600';
      case 'half_day':
        return 'bg-orange-500 dark:bg-orange-600';
      default:
        return 'bg-gray-300 dark:bg-gray-700';
    }
  };

  const getStatusBgColor = (status: AttendanceRecord['status']) => {
    switch (status) {
      case 'present':
        return 'bg-green-50 dark:bg-green-900/20';
      case 'absent':
        return 'bg-red-50 dark:bg-red-900/20';
      case 'late':
        return 'bg-yellow-50 dark:bg-yellow-900/20';
      case 'excused':
        return 'bg-blue-50 dark:bg-blue-900/20';
      case 'half_day':
        return 'bg-orange-50 dark:bg-orange-900/20';
      default:
        return 'bg-gray-50 dark:bg-gray-800/20';
    }
  };

  const getStatusLabel = (status: AttendanceRecord['status']) => {
    switch (status) {
      case 'present':
        return 'Present';
      case 'absent':
        return 'Absent';
      case 'late':
        return 'Late';
      case 'excused':
        return 'Excused';
      case 'half_day':
        return 'Half Day';
      default:
        return status;
    }
  };

  const selectedRecord = selectedDate ? attendanceMap.get(selectedDate) : null;

  return (
    <div className="space-y-4">
      {/* Statistics Cards - Monthly Stats */}
      {showStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <UserCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Present (Month)</p>
                  <p className="text-xl font-bold">{stats.present}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                  <UserX className="h-4 w-4 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Absent (Month)</p>
                  <p className="text-xl font-bold">{stats.absent}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                  <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Late (Month)</p>
                  <p className="text-xl font-bold">{stats.late}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Rate (Month)</p>
                  <p className="text-xl font-bold">{stats.percentage}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Calendar */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              {monthName}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={goToToday}>
                Today
              </Button>
              <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={goToNextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <div className="h-64 bg-muted/20 animate-pulse rounded-lg flex items-center justify-center">
                Loading Attendance Data...
              </div>
            </div>
          ) : error ? (
            <div className="p-4 text-center text-red-500 bg-red-50 dark:bg-red-900/10 rounded-lg">
              Failed to load attendance data. {(error as any)?.message}
            </div>
          ) : (
            <>
              {/* Weekday Headers */}
              <div className="grid grid-cols-7 gap-2 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="text-center text-xs font-semibold text-muted-foreground p-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((day, index) => {
                  const dateStr = day.date.toISOString().split('T')[0];
                  const record = attendanceMap.get(dateStr);
                  const isToday = dateStr === new Date().toISOString().split('T')[0];
                  const isSelected = dateStr === selectedDate;
                  const isFuture = day.date > new Date();

                  return (
                    <button
                      key={index}
                      onClick={() => record && setSelectedDate(dateStr)}
                      disabled={!record || !day.isCurrentMonth}
                      className={cn(
                        'aspect-square p-2 rounded-lg text-sm relative transition-all',
                        'hover:bg-accent hover:scale-105',
                        !day.isCurrentMonth && 'text-muted-foreground opacity-40',
                        isToday && 'ring-2 ring-primary',
                        isSelected && 'ring-2 ring-primary bg-accent',
                        !record && day.isCurrentMonth && !isFuture && 'opacity-50',
                        record && 'cursor-pointer',
                        record && !isSelected && getStatusBgColor(record.status)
                      )}
                    >
                      <div className="flex flex-col items-center justify-center h-full">
                        <span className={cn(
                          'text-xs md:text-sm font-medium',
                          !day.isCurrentMonth && 'text-muted-foreground'
                        )}>
                          {day.date.getDate()}
                        </span>
                        {record && (
                          <div
                            className={cn(
                              'w-2 h-2 rounded-full mt-1',
                              getStatusColor(record.status)
                            )}
                          />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* Legend */}
          {showLegend && (
            <div className="mt-6 pt-4 border-t">
              <div className="flex flex-wrap gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span>Present</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span>Absent</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <span>Late</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500" />
                  <span>Half Day</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span>Excused</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selected Date Details */}
      {selectedRecord && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {new Date(selectedDate!).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <Badge
                    variant={
                      selectedRecord.status === 'present' ? 'success' :
                        selectedRecord.status === 'absent' ? 'destructive' :
                          selectedRecord.status === 'late' ? 'warning' :
                            'default'
                    }
                  >
                    {getStatusLabel(selectedRecord.status)}
                  </Badge>
                </div>
                {selectedRecord.subject && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Subject:</span>
                    <span className="text-sm font-medium">{selectedRecord.subject}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-4 text-sm text-muted-foreground">
                {selectedRecord.check_in_time && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    In: {new Date(selectedRecord.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                )}
                {selectedRecord.check_out_time && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Out: {new Date(selectedRecord.check_out_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                )}
              </div>
            </div>
            {selectedRecord.remarks && (
              <div>
                <span className="text-sm text-muted-foreground">Remarks:</span>
                <p className="text-sm mt-1">{selectedRecord.remarks}</p>
              </div>
            )}
            {!selectedRecord.remarks && !selectedRecord.check_in_time && (
              <p className="text-sm text-muted-foreground italic">No additional details available.</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AttendanceCalendar;
