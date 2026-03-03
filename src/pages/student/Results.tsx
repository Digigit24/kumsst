import React, { useMemo } from 'react';
import { DROPDOWN_PAGE_SIZE } from '@/config/app.config';
import { Trophy, TrendingUp, FileText, Download, Award, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useStudent } from '@/hooks/useStudents';
import { useStudentMarks } from '@/hooks/useExamination';

export const Results: React.FC = () => {
  const { user } = useAuth();
  const studentId = user?.id ? Number(user.id) : null;

  // Fetch student details to get current student record
  const { data: studentsData, isLoading: studentLoading } = useStudent(studentId);

  // Fetch student marks
  const { data: marksData, isLoading: marksLoading } = useStudentMarks({
    student: studentId || undefined,
    page_size: DROPDOWN_PAGE_SIZE,
  });

  const marks = marksData?.results || [];

  // Calculate overall performance from marks
  const overallPerformance = useMemo(() => {
    if (!marks.length) {
      return {
        currentCGPA: 0,
        currentSemesterGPA: 0,
        totalCredits: 0,
        rank: 0,
        totalStudents: 0,
      };
    }

    // Calculate averages and totals
    const totalMarks = marks.reduce((sum, mark) => sum + (mark.total_marks || 0), 0);
    const obtainedMarks = marks.reduce((sum, mark) => sum + (mark.obtained_marks || 0), 0);
    const percentage = totalMarks > 0 ? (obtainedMarks / totalMarks) * 100 : 0;
    const gpa = (percentage / 100) * 10; // Simple conversion

    return {
      currentCGPA: Number(gpa.toFixed(2)),
      currentSemesterGPA: Number(gpa.toFixed(2)),
      totalCredits: marks.length * 4, // Assuming 4 credits per subject
      rank: 0, // Would need separate API endpoint for ranking
      totalStudents: 0, // Would need separate API endpoint
    };
  }, [marks]);

  // Group marks by exam
  const semesterResults = useMemo(() => {
    const examGroups = marks.reduce((groups: any, mark) => {
      const examId = mark.exam || 0;
      const examName = mark.exam_name || 'Exam';

      if (!groups[examId]) {
        groups[examId] = {
          id: examId,
          semester: examName,
          examType: mark.exam_type_name || 'Examination',
          publishedDate: mark.created_at || new Date().toISOString(),
          results: [],
        };
      }

      groups[examId].results.push({
        subject: mark.subject_name || 'Subject',
        totalMarks: mark.total_marks || 100,
        obtainedMarks: mark.obtained_marks || 0,
        grade: mark.grade || 'N/A',
        credits: 4, // Default credits
      });

      return groups;
    }, {});

    // Calculate exam totals
    return Object.values(examGroups).map((exam: any) => {
      const totalMarks = exam.results.reduce((sum: number, r: any) => sum + r.totalMarks, 0);
      const obtainedMarks = exam.results.reduce((sum: number, r: any) => sum + r.obtainedMarks, 0);
      const percentage = totalMarks > 0 ? Math.round((obtainedMarks / totalMarks) * 100) : 0;
      const gpa = Number(((percentage / 100) * 10).toFixed(2));

      return {
        ...exam,
        totalMarks,
        obtainedMarks,
        percentage,
        gpa,
      };
    });
  }, [marks]);

  // Loading state
  if (studentLoading || marksLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'success';
    if (grade.startsWith('B')) return 'default';
    if (grade.startsWith('C')) return 'warning';
    return 'destructive';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">My Results</h1>
        <p className="text-muted-foreground mt-2">
          View your examination results and academic performance
        </p>
      </div>

      {/* Empty State */}
      {marks.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Results Available</h3>
              <p className="text-muted-foreground max-w-md">
                Your examination results will appear here once they are published by your instructors.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
      {/* Overall Performance */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current CGPA</CardTitle>
            <Trophy className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallPerformance.currentCGPA}</div>
            <p className="text-xs text-muted-foreground mt-1">Out of 10.0</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Semester GPA</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallPerformance.currentSemesterGPA}</div>
            <Badge variant="success" className="mt-1">Current Semester</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
            <Award className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallPerformance.totalCredits}</div>
            <p className="text-xs text-muted-foreground mt-1">Earned</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Class Rank</CardTitle>
            <Trophy className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">#{overallPerformance.rank}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Out of {overallPerformance.totalStudents} students
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Semester Results */}
      {semesterResults.map((semester) => (
        <Card key={semester.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {semester.semester} - {semester.examType}
                </CardTitle>
                <CardDescription>
                  Published on {new Date(semester.publishedDate).toLocaleDateString()}
                </CardDescription>
              </div>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download Report Card
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-lg bg-accent/50">
              <div>
                <p className="text-sm text-muted-foreground">Total Marks</p>
                <p className="text-xl font-bold">{semester.totalMarks}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Obtained Marks</p>
                <p className="text-xl font-bold">{semester.obtainedMarks}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Percentage</p>
                <p className="text-xl font-bold">{semester.percentage}%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">GPA</p>
                <p className="text-xl font-bold">{semester.gpa}</p>
              </div>
            </div>

            {/* Subject-wise Results */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Subject-wise Performance</h3>
              <div className="space-y-3">
                {semester.results.map(
                  (
                    result: {
                      subject: string;
                      totalMarks: number;
                      obtainedMarks: number;
                      grade: string;
                      credits: number;
                    },
                    index: number
                  ) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium">{result.subject}</p>
                        <Badge variant={getGradeColor(result.grade)} className="text-lg px-3">
                          {result.grade}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Marks: {result.obtainedMarks}/{result.totalMarks}</span>
                        <span>•</span>
                        <span>Credits: {result.credits}</span>
                        <span>•</span>
                        <span>Percentage: {((result.obtainedMarks / result.totalMarks) * 100).toFixed(1)}%</span>
                      </div>
                      {/* Progress Bar */}
                      <div className="w-full bg-muted rounded-full h-2 mt-2 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
                          style={{ width: `${(result.obtainedMarks / result.totalMarks) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Grade Scale Reference */}
      <Card>
        <CardHeader>
          <CardTitle>Grading Scale</CardTitle>
          <CardDescription>Reference for grade interpretation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-3 rounded-lg border">
              <Badge variant="success" className="mb-2">A+</Badge>
              <p className="text-sm text-muted-foreground">90-100%</p>
            </div>
            <div className="text-center p-3 rounded-lg border">
              <Badge variant="success" className="mb-2">A</Badge>
              <p className="text-sm text-muted-foreground">80-89%</p>
            </div>
            <div className="text-center p-3 rounded-lg border">
              <Badge variant="default" className="mb-2">B+</Badge>
              <p className="text-sm text-muted-foreground">70-79%</p>
            </div>
            <div className="text-center p-3 rounded-lg border">
              <Badge variant="default" className="mb-2">B</Badge>
              <p className="text-sm text-muted-foreground">60-69%</p>
            </div>
            <div className="text-center p-3 rounded-lg border">
              <Badge variant="warning" className="mb-2">C</Badge>
              <p className="text-sm text-muted-foreground">50-59%</p>
            </div>
          </div>
        </CardContent>
      </Card>
        </>
      )}
    </div>
  );
};
