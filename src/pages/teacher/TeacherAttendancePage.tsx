import React, { useMemo } from 'react';
import { DROPDOWN_PAGE_SIZE } from '@/config/app.config';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, ClipboardList, Users, BookOpen, Loader2 } from 'lucide-react';
import { useSubjectAssignmentsSWR } from '@/hooks/swr';
import { useAuth } from '@/hooks/useAuth';

export const TeacherAttendancePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Fetch subject assignments for the logged-in teacher
  const { data: assignmentsData, isLoading } = useSubjectAssignmentsSWR({
    teacher: user?.id, // Filter by logged-in teacher's UUID
    is_active: true,
    page_size: DROPDOWN_PAGE_SIZE,
  });

  const myClasses = assignmentsData?.results || [];

  // Group classes for today's view (you can enhance this with actual timetable data later)
  const todaysClasses = useMemo(() => {
    return myClasses.map((assignment) => ({
      id: assignment.id,
      subject: assignment.subject_name,
      section: `${assignment.class_name}${assignment.section_name ? ` - ${assignment.section_name}` : ''}`,
      class_id: assignment.class_obj,
      section_id: assignment.section,
      subject_id: assignment.subject,
      // These could come from timetable API later
      time: 'To be scheduled', // Placeholder
      room: '-', // Placeholder
      status: 'pending', // Can check attendance records to determine
    }));
  }, [myClasses]);

  const stats = {
    totalClasses: myClasses.length,
    todaysClasses: todaysClasses.length,
    attendanceTaken: 0, // TODO: Calculate from attendance records
    totalStudents: 0, // TODO: Calculate from enrolled students
  };

  const handleTakeAttendance = (classData: any) => {
    // Navigate to attendance marking page with context
    navigate(`/attendance/teacher-marking`, {
      state: {
        classId: classData.class_id,
        sectionId: classData.section_id,
        subjectId: classData.subject_id,
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your classes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Attendance Management</h1>
        <p className="text-muted-foreground mt-2">
          Mark and manage student attendance for your classes
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Classes</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClasses}</div>
            <p className="text-xs text-muted-foreground">Assigned to you</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Classes</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todaysClasses}</div>
            <p className="text-xs text-muted-foreground">Classes scheduled</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance Taken</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.attendanceTaken}/{stats.todaysClasses}</div>
            <p className="text-xs text-muted-foreground">Classes completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">Across all classes</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>My Classes</CardTitle>
        </CardHeader>
        <CardContent>
          {myClasses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No classes assigned yet</p>
              <p className="text-sm mt-2">Contact your administrator to get class assignments</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todaysClasses.map((cls) => (
                <div key={cls.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="font-medium">{cls.subject}</div>
                      <Badge variant="outline">{cls.section}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {cls.time !== 'To be scheduled' && `${cls.time} • `}
                      {cls.room !== '-' ? `Room: ${cls.room}` : 'Room not assigned'}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {cls.status === 'completed' ? (
                      <Badge variant="secondary">Completed</Badge>
                    ) : (
                      <Button size="sm" onClick={() => handleTakeAttendance(cls)}>
                        Take Attendance
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {myClasses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Attendance History</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              View and manage attendance records for all your classes. Historical data will be displayed here.
            </p>
            <Button variant="outline" className="mt-4" onClick={() => navigate('/attendance/history')}>
              View History
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
