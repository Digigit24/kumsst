import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useSubjectDrillDown } from '@/hooks/useDrillDown';
import {
  ArrowRight,
  Award,
  BookOpen,
  ChevronLeft,
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-react';
import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

export const SubjectDrillDown: React.FC = () => {
  const { subjectId } = useParams<{ subjectId: string }>();
  const navigate = useNavigate();
  const [filters, setFilters] = useState({});
  const { data, isLoading, error } = useSubjectDrillDown(
    subjectId ? parseInt(subjectId) : null,
    filters
  );

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-red-500">Error: {error instanceof Error ? error.message : String(error)}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getGradeBadgeVariant = (grade: string) => {
    if (['A+', 'A'].includes(grade)) return 'default';
    if (['B+', 'B'].includes(grade)) return 'secondary';
    return 'outline';
  };

  return (
    <div className="space-y-6 p-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link to="/drilldown" className="text-muted-foreground hover:text-foreground">
          College Overview
        </Link>
        <ChevronLeft className="h-4 w-4 rotate-180" />
        <span className="text-muted-foreground">{data?.program_name}</span>
        <ChevronLeft className="h-4 w-4 rotate-180" />
        <span className="text-muted-foreground">{data?.class_name}</span>
        <ChevronLeft className="h-4 w-4 rotate-180" />
        <span className="font-medium">{data?.subject_name}</span>
      </div>

      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isLoading ? <Skeleton className="h-9 w-64" /> : data?.subject_name}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isLoading ? (
              <Skeleton className="h-4 w-48" />
            ) : (
              <>
                {data?.subject_code} | {data?.class_name} | {data?.program_name}
              </>
            )}
          </p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {data?.total_students.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Appeared</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Marks</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className={`text-2xl font-bold ${getPerformanceColor(data?.average_marks || 0)}`}>
                  {data?.average_marks.toFixed(1)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Out of 100</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Highest Marks</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {data?.highest_marks.toFixed(1)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Top score</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lowest Marks</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {data?.lowest_marks.toFixed(1)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Lowest score</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pass Percentage</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className={`text-2xl font-bold ${getPerformanceColor(data?.pass_percentage || 0)}`}>
                  {data?.pass_percentage.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">Students passed</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Student Marks Table */}
      <Card>
        <CardHeader>
          <CardTitle>Student-wise Marks</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Roll No</TableHead>
                  <TableHead className="text-center">Marks Obtained</TableHead>
                  <TableHead className="text-center">Total Marks</TableHead>
                  <TableHead className="text-center">Percentage</TableHead>
                  <TableHead className="text-center">Grade</TableHead>
                  <TableHead className="text-center">Attendance</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.student_marks
                  .sort((a, b) => b.percentage - a.percentage)
                  .map((student, index) => (
                    <TableRow
                      key={student.student_id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => navigate(`/drilldown/student/${student.student_id}`)}
                    >
                      <TableCell>
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            {index < 3 && (
                              <Award className={`h-4 w-4 ${index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-400' : 'text-amber-600'}`} />
                            )}
                            {student.student_name}
                          </div>
                          <div className="text-xs text-muted-foreground">{student.admission_number}</div>
                        </div>
                      </TableCell>
                      <TableCell>{student.roll_number || '-'}</TableCell>
                      <TableCell className="text-center font-semibold">
                        {student.marks_obtained.toFixed(1)}
                      </TableCell>
                      <TableCell className="text-center">
                        {student.total_marks.toFixed(1)}
                      </TableCell>
                      <TableCell className={`text-center font-semibold ${getPerformanceColor(student.percentage)}`}>
                        {student.percentage.toFixed(1)}%
                      </TableCell>
                      <TableCell className="text-center">
                        {student.grade ? (
                          <Badge variant={getGradeBadgeVariant(student.grade)} className="dark:border-slate-600">
                            {student.grade}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell className={`text-center ${getPerformanceColor(student.attendance_percentage)}`}>
                        {student.attendance_percentage.toFixed(1)}%
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/drilldown/student/${student.student_id}`);
                          }}
                        >
                          View Profile
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
