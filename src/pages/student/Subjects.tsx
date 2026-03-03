import React, { useMemo } from 'react';
import { DROPDOWN_PAGE_SIZE } from '@/config/app.config';
import { BookOpen, Users, Clock, Calendar, Loader2, GraduationCap, Medal, Layers } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useStudent } from '@/hooks/useStudents';
import { useSubjectAssignmentsSWR } from '@/hooks/swr';
import { Separator } from '@/components/ui/separator';

export const Subjects: React.FC = () => {
  const { user } = useAuth();
  const studentId = user?.id ? Number(user.id) : null;

  // Fetch student details to get current class
  const { data: studentData, isLoading: studentLoading } = useStudent(studentId);

  // Fetch subject assignments for the student's class
  const classId = studentData?.current_class;
  const sectionId = studentData?.current_section;

  const { data: assignmentsData, isLoading: assignmentsLoading } = useSubjectAssignmentsSWR({
    class_field: classId || undefined,
    section: sectionId || undefined,
    page_size: DROPDOWN_PAGE_SIZE,
  });

  const subjectAssignments = assignmentsData?.results || [];

  // Transform API data to match UI structure
  type SubjectSchedule = { day: string; time: string; room: string };
  type SubjectItem = {
    id: number;
    name: string;
    code: string;
    teacher: string;
    credits: number;
    type: string;
    schedule: SubjectSchedule[];
  };

  const subjects = useMemo<SubjectItem[]>(() => {
    return subjectAssignments.map((assignment) => ({
      id: assignment.id,
      name: assignment.subject_name || 'Subject',
      code: assignment.subject_code || 'N/A',
      teacher: assignment.teacher_name || 'Staff',
      credits: 4, // Default credits, would need to come from subject details
      type: 'Core', // Would need to determine from subject type
      schedule: [], // Would need separate timetable API call for schedule
    }));
  }, [subjectAssignments]);

  const totalCredits = subjects.reduce((sum, subject) => sum + subject.credits, 0);

  // Loading state
  if (studentLoading || assignmentsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">My Subjects</h1>
        <p className="text-muted-foreground">
          View your enrolled subjects, course details, and instructors for the current semester.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Subjects</CardTitle>
            <BookOpen className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subjects.length}</div>
            <p className="text-xs text-muted-foreground">Enrolled courses this semester</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
            <Medal className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCredits}</div>
            <p className="text-xs text-muted-foreground">Cumulative credits registered</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Core Courses</CardTitle>
            <Layers className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subjects.filter(s => s.type === 'Core').length}</div>
            <p className="text-xs text-muted-foreground">Mandatory core subjects</p>
          </CardContent>
        </Card>
      </div>

      {/* Subjects Grid */}
      {subjects.length === 0 ? (
        <Card className="bg-muted/50 border-dashed">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="bg-background p-4 rounded-full mb-4 ring-1 ring-border">
                <BookOpen className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Subjects Found</h3>
              <p className="text-muted-foreground max-w-sm">
                Your enrolled subjects will appear here once assigned to your class.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((subject) => (
            <Card key={subject.id} className="group overflow-hidden hover:shadow-lg hover:border-primary/20 transition-all duration-300">
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="bg-primary/10 p-2.5 rounded-lg group-hover:bg-primary/20 transition-colors">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  <Badge variant={subject.type === 'Core' ? 'default' : 'secondary'} className="rounded-full px-3">
                    {subject.type}
                  </Badge>
                </div>

                <div>
                  <h3 className="font-bold text-lg leading-tight mb-1 group-hover:text-primary transition-colors">{subject.name}</h3>
                  <p className="text-sm text-muted-foreground font-mono">{subject.code}</p>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <span className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">Instructor</span>
                    <div className="flex items-center gap-2 font-medium">
                      <Users className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="truncate">{subject.teacher}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">Credits</span>
                    <div className="flex items-center gap-2 font-medium">
                      <Medal className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{subject.credits} Credits</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-muted/30 px-6 py-3 border-t flex items-center justify-between text-xs text-muted-foreground group-hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>View Schedule</span>
                </div>
                <Badge variant="outline" className="text-[10px] bg-background">Active</Badge>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
