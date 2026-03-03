import { DROPDOWN_PAGE_SIZE } from '@/config/app.config';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useStudentAttendance, useStudentAttendanceSummary } from '@/hooks/useAttendance';
import { useAuth } from '@/hooks/useAuth';
import { useStudent } from '@/hooks/useStudents';
import { AlertCircle, Calendar, CheckCircle2, Clock, Loader2, XCircle } from 'lucide-react';
import React, { useMemo, useState } from 'react';

export const Attendance: React.FC = () => {
  const { user } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Get student ID from user object
  const userId = user?.id ? Number(user.id) : null;

  // Fetch student profile to get the correct student ID for filtering
  const { data: studentData, isLoading: studentLoading } = useStudent(userId);
  const studentId = studentData?.id;

  // Fetch student attendance summary
  const { data: summaryData, isLoading: summaryLoading } = useStudentAttendanceSummary(studentId || null);

  // Fetch attendance records for the month
  const startDate = new Date(selectedYear, selectedMonth, 1).toISOString().split('T')[0];
  const endDate = new Date(selectedYear, selectedMonth + 1, 0).toISOString().split('T')[0];

  const { data: attendanceData, isLoading: attendanceLoading } = useStudentAttendance({
    student: studentId || undefined, // This will now be the Student Profile ID
    date_from: startDate,
    date_to: endDate,
    page_size: DROPDOWN_PAGE_SIZE,
  });

  const attendanceRecords = attendanceData?.results || [];

  // Calculate subject-wise attendance
  const subjectWiseAttendance = useMemo(() => {
    const subjects: Record<string, { present: number; total: number; subject_name: string }> = {};

    attendanceRecords.forEach(record => {
      const subjectId = record.subject || 0;
      const subjectName = record.subject_name || 'General';

      if (!subjects[subjectId]) {
        subjects[subjectId] = {
          subject_name: subjectName,
          present: 0,
          total: 0,
        };
      }

      subjects[subjectId].total++;
      if (record.status === 'present') {
        subjects[subjectId].present++;
      }
    });

    return Object.values(subjects).map(subject => ({
      subject: subject.subject_name,
      present: subject.present,
      total: subject.total,
      percentage: subject.total > 0 ? Math.round((subject.present / subject.total) * 100) : 0,
    }));
  }, [attendanceRecords]);

  // Summary data from API
  const attendanceSummary = summaryData || {
    total_days: 0,
    present_days: 0,
    absent_days: 0,
    late_days: 0,
    excused_days: 0,
    half_days: 0,
    attendance_percentage: 0,
  };

  const requiredPercentage = 75;

  // Loading state
  if (summaryLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">My Attendance</h1>
        <p className="text-muted-foreground mt-2">
          Track your attendance and maintain required percentage
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Days</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attendanceSummary.total_days}</div>
            <p className="text-xs text-muted-foreground mt-1">This semester</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Present</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{attendanceSummary.present_days}</div>
            <p className="text-xs text-muted-foreground mt-1">Days attended</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Absent</CardTitle>
            <XCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{attendanceSummary.absent_days}</div>
            <p className="text-xs text-muted-foreground mt-1">Days missed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Percentage</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(attendanceSummary.attendance_percentage)}%
            </div>
            <Badge
              variant={attendanceSummary.attendance_percentage >= requiredPercentage ? "success" : "destructive"}
              className="mt-1"
            >
              {attendanceSummary.attendance_percentage >= requiredPercentage ? 'Above Required' : 'Below Required'}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Status Alert */}
      {attendanceSummary.attendance_percentage < requiredPercentage && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
              <div>
                <h3 className="font-semibold text-destructive">Attendance Warning</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Your attendance is below the required {requiredPercentage}%. You need to attend more classes to meet the minimum requirement.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progress Bar */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance Progress</CardTitle>
          <CardDescription>
            Required: {requiredPercentage}% | Current: {Math.round(attendanceSummary.attendance_percentage)}%
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full bg-muted rounded-full h-4 overflow-hidden">
            <div
              className={`h-full transition-all ${attendanceSummary.attendance_percentage >= requiredPercentage
                ? 'bg-green-500'
                : 'bg-destructive'
                }`}
              style={{ width: `${Math.min(attendanceSummary.attendance_percentage, 100)}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-2 text-sm text-muted-foreground">
            <span>0%</span>
            <span>{requiredPercentage}% (Required)</span>
            <span>100%</span>
          </div>
        </CardContent>
      </Card>

      {/* Additional Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Late</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{attendanceSummary.late_days}</div>
            <p className="text-xs text-muted-foreground mt-1">Times late</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Excused</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{attendanceSummary.excused_days}</div>
            <p className="text-xs text-muted-foreground mt-1">Excused absences</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Half Day</CardTitle>
            <Calendar className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{attendanceSummary.half_days}</div>
            <p className="text-xs text-muted-foreground mt-1">Half days</p>
          </CardContent>
        </Card>
      </div>

      {/* Subject-wise Attendance */}
      {subjectWiseAttendance.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Subject-wise Attendance</CardTitle>
            <CardDescription>Your attendance in each subject</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {subjectWiseAttendance.map((subject, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{subject.subject}</p>
                      <p className="text-sm text-muted-foreground">
                        {subject.present} / {subject.total} classes
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={subject.percentage >= 75 ? "success" : "destructive"}>
                        {subject.percentage}%
                      </Badge>
                    </div>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full ${subject.percentage >= 75 ? 'bg-green-500' : 'bg-destructive'
                        }`}
                      style={{ width: `${subject.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Monthly Calendar View */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Monthly Attendance
          </CardTitle>
          <CardDescription>
            {new Date(selectedYear, selectedMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {attendanceLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-7 gap-2 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {/* Empty cells for days before month starts */}
                {Array.from({ length: new Date(selectedYear, selectedMonth, 1).getDay() }, (_, i) => (
                  <div key={`empty-${i}`} className="p-3" />
                ))}

                {/* Days of the month */}
                {Array.from(
                  { length: new Date(selectedYear, selectedMonth + 1, 0).getDate() },
                  (_, i) => {
                    const day = i + 1;
                    const dateString = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const record = attendanceRecords.find(r => r.date === dateString);

                    return (
                      <div
                        key={day}
                        className={`p-3 rounded-lg text-center text-sm border ${record?.status === 'present'
                          ? 'bg-green-100 border-green-300 text-green-800 dark:bg-green-900/20 dark:border-green-800'
                          : record?.status === 'absent'
                            ? 'bg-red-100 border-red-300 text-red-800 dark:bg-red-900/20 dark:border-red-800'
                            : record?.status === 'late'
                              ? 'bg-orange-100 border-orange-300 text-orange-800 dark:bg-orange-900/20 dark:border-orange-800'
                              : record?.status === 'excused'
                                ? 'bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800'
                                : 'bg-muted'
                          }`}
                      >
                        {day}
                      </div>
                    );
                  }
                )}
              </div>

              <div className="flex items-center justify-center gap-6 mt-6">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-green-500" />
                  <span className="text-sm">Present</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-red-500" />
                  <span className="text-sm">Absent</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-orange-500" />
                  <span className="text-sm">Late</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-blue-500" />
                  <span className="text-sm">Excused</span>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
