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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useStudentDrillDown } from '@/hooks/useDrillDown';
import {
  Award,
  BookOpen,
  Calendar,
  CheckCircle,
  ChevronLeft,
  GraduationCap,
  TrendingUp,
  XCircle
} from 'lucide-react';
import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

export const StudentProfile: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const [filters, setFilters] = useState({});
  const [activeTab, setActiveTab] = useState('subjects');
  const { data, isLoading, error } = useStudentDrillDown(
    studentId ? parseInt(studentId) : null,
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

  const getPerformanceBadge = (percentage: number) => {
    if (percentage >= 80) return <Badge className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">Excellent</Badge>;
    if (percentage >= 60) return <Badge className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300">Good</Badge>;
    return <Badge className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300">Needs Improvement</Badge>;
  };

  const getGradeBadgeVariant = (grade: string) => {
    if (['A+', 'A'].includes(grade)) return 'default';
    if (['B+', 'B'].includes(grade)) return 'secondary';
    return 'outline';
  };

  return (
    <div className="space-y-6 p-6">
      {/* Breadcrumb */}
      {/* Breadcrumb */}
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <Link to="/drilldown" className="text-muted-foreground hover:text-foreground">
          College Overview
        </Link>
        <ChevronLeft className="h-4 w-4 rotate-180" />
        <span className="text-muted-foreground whitespace-nowrap">{data?.program_name}</span>
        <ChevronLeft className="h-4 w-4 rotate-180" />
        <span className="text-muted-foreground whitespace-nowrap">{data?.class_name}</span>
        <ChevronLeft className="h-4 w-4 rotate-180" />
        <span className="text-muted-foreground whitespace-nowrap">Section {data?.section_name}</span>
        <ChevronLeft className="h-4 w-4 rotate-180" />
        <span className="font-medium whitespace-nowrap">{data?.student_name}</span>
      </div>

      {/* Header Card */}
      <div className="relative overflow-hidden rounded-3xl bg-white shadow-xl border border-blue-100">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <GraduationCap className="w-64 h-64 -mr-16 -mt-16 text-blue-900" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 via-white to-white pointer-events-none" />

        <div className="relative z-10 p-6 md:p-8">
          <div className="flex flex-col lg:flex-row justify-between gap-8">
            <div className="flex-1 space-y-6 w-full">
              <div className="space-y-4">
                <div className="flex items-start md:items-center gap-4 flex-col md:flex-row">
                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => navigate(-1)}
                      className="h-8 w-8 -ml-2 rounded-full hover:bg-blue-50 text-blue-600 shrink-0"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
                      {isLoading ? <Skeleton className="h-8 w-48 inline-block" /> : data?.student_name}
                    </h1>
                  </div>
                  <div className="flex gap-2 ml-0 md:ml-2">
                    <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200 whitespace-nowrap">
                      Rank: #{data?.overall_rank}
                    </Badge>
                    <Badge variant={getGradeBadgeVariant(data?.overall_grade || '')} className="whitespace-nowrap">
                      Grade: {data?.overall_grade}
                    </Badge>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500 pl-0 md:pl-9">
                  <div className="flex items-center gap-1.5 min-w-fit">
                    <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-xs text-slate-600">{data?.admission_number}</span>
                  </div>
                  <div className="hidden sm:block w-px h-4 bg-slate-300" />
                  <div className="flex items-center gap-1.5 min-w-fit">
                    <span className="font-medium text-slate-700">Roll No: {data?.roll_number}</span>
                  </div>
                  <div className="hidden sm:block w-px h-4 bg-slate-300" />
                  <div className="flex items-center gap-1.5 min-w-fit">
                    <span className="font-medium text-slate-700">{data?.class_name}</span>
                    <span className="text-slate-400">•</span>
                    <span>Section {data?.section_name}</span>
                  </div>
                  <div className="hidden sm:block w-px h-4 bg-slate-300" />
                  <div className="flex items-center gap-1.5 min-w-fit w-full sm:w-auto">
                    <span>{data?.program_name}</span>
                  </div>
                </div>
              </div>

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 pt-4">
                <div className="p-4 rounded-xl bg-violet-50/50 border border-violet-100 transition-all hover:shadow-md">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-violet-100 rounded-lg text-violet-600">
                      <TrendingUp className="h-4 w-4" />
                    </div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-violet-600">Overall %</p>
                  </div>
                  {isLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <div className="flex items-baseline gap-2">
                      <p className={`text-2xl font-bold ${getPerformanceColor(data?.overall_percentage || 0)}`}>{data?.overall_percentage.toFixed(1)}%</p>
                      {getPerformanceBadge(data?.overall_percentage || 0)}
                    </div>
                  )}
                </div>

                <div className="p-4 rounded-xl bg-orange-50/50 border border-orange-100 transition-all hover:shadow-md">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                      <Award className="h-4 w-4" />
                    </div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-orange-600">Class Rank</p>
                  </div>
                  {isLoading ? <Skeleton className="h-8 w-16" /> : (
                    <div>
                      <p className="text-2xl font-bold text-slate-800">#{data?.overall_rank}</p>
                      <p className="text-xs text-muted-foreground">Top {(data?.overall_percentage ?? 0) > 90 ? '10%' : '50%'}</p>
                    </div>
                  )}
                </div>

                <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 transition-all hover:shadow-md">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                      <GraduationCap className="h-4 w-4" />
                    </div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">Exams</p>
                  </div>
                  {isLoading ? <Skeleton className="h-8 w-16" /> : (
                    <div>
                      <p className="text-2xl font-bold text-slate-800">{data?.total_exams}</p>
                      <p className="text-xs text-muted-foreground">Appeared</p>
                    </div>
                  )}
                </div>

                <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100 transition-all hover:shadow-md">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">Presents</p>
                  </div>
                  {isLoading ? <Skeleton className="h-8 w-16" /> : (
                    <div>
                      <p className="text-2xl font-bold text-slate-800">{data?.present_days}/{data?.total_days}</p>
                      <p className="text-xs font-bold text-emerald-600">{data?.attendance_percentage.toFixed(1)}%</p>
                    </div>
                  )}
                </div>

                <div className="p-4 rounded-xl bg-rose-50/50 border border-rose-100 transition-all hover:shadow-md">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-rose-100 rounded-lg text-rose-600">
                      <XCircle className="h-4 w-4" />
                    </div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-rose-600">Absents</p>
                  </div>
                  {isLoading ? <Skeleton className="h-8 w-16" /> : (
                    <div>
                      <p className="text-2xl font-bold text-slate-800">{data?.absent_days}</p>
                      <p className="text-xs text-muted-foreground">Days missed</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs for Exam Results and Subject-wise Marks */}
      {/* Tabs for Exam Results and Subject-wise Marks */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
        <div className="flex items-center justify-between sticky top-0 z-20 bg-background/95 backdrop-blur py-2">
          <TabsList className="inline-flex h-10 items-center justify-center rounded-full bg-slate-100 p-1 text-slate-500 w-full md:w-auto overflow-x-auto justify-start no-scrollbar">
            <TabsTrigger
              value="subjects"
              className="rounded-full px-6 whitespace-nowrap data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm transition-all"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Subject-wise Marks
            </TabsTrigger>
            <TabsTrigger
              value="exams"
              className="rounded-full px-6 whitespace-nowrap data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm transition-all"
            >
              <GraduationCap className="h-4 w-4 mr-2" />
              Exam Results ({data?.exam_results?.length || 0})
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="subjects" className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="border shadow-md overflow-hidden bg-white/50 backdrop-blur-sm">
            <CardHeader className="bg-slate-50/50 border-b pb-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-500" />
                Subject-wise Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-6 space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-16 w-full rounded-xl" />
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-slate-50/80 sticky top-0 backdrop-blur-sm z-10">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="pl-6 h-12 font-semibold text-xs uppercase tracking-wider whitespace-nowrap">Subject</TableHead>
                        <TableHead className="h-12 font-semibold text-xs uppercase tracking-wider whitespace-nowrap">Code</TableHead>
                        <TableHead className="text-center h-12 font-semibold text-xs uppercase tracking-wider whitespace-nowrap">Marks Obt.</TableHead>
                        <TableHead className="text-center h-12 font-semibold text-xs uppercase tracking-wider whitespace-nowrap">Total</TableHead>
                        <TableHead className="text-center h-12 font-semibold text-xs uppercase tracking-wider whitespace-nowrap">%</TableHead>
                        <TableHead className="text-center h-12 font-semibold text-xs uppercase tracking-wider whitespace-nowrap">Grade</TableHead>
                        <TableHead className="text-center pr-6 h-12 font-semibold text-xs uppercase tracking-wider whitespace-nowrap">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data?.subject_wise_marks
                        .sort((a, b) => b.percentage - a.percentage)
                        .map((subject) => (
                          <TableRow key={subject.subject_id} className="hover:bg-slate-50/50 transition-colors border-b border-slate-100 last:border-0">
                            <TableCell className="font-medium pl-6 py-4 whitespace-nowrap text-slate-700">{subject.subject_name}</TableCell>
                            <TableCell className="whitespace-nowrap font-mono text-xs text-muted-foreground">{subject.subject_code}</TableCell>
                            <TableCell className="text-center font-semibold whitespace-nowrap">
                              {subject.marks_obtained.toFixed(1)}
                            </TableCell>
                            <TableCell className="text-center whitespace-nowrap text-muted-foreground">
                              {subject.total_marks.toFixed(1)}
                            </TableCell>
                            <TableCell className="text-center whitespace-nowrap">
                              <div className="flex flex-col items-center justify-center">
                                <span className={`font-bold ${getPerformanceColor(subject.percentage)}`}>{subject.percentage.toFixed(1)}%</span>
                                <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden mt-1">
                                  <div
                                    className={`h-full rounded-full ${subject.percentage >= 80 ? 'bg-green-500' :
                                      subject.percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                      }`}
                                    style={{ width: `${subject.percentage}%` }}
                                  />
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-center whitespace-nowrap">
                              {subject.grade ? (
                                <Badge variant={getGradeBadgeVariant(subject.grade)} className="font-mono">
                                  {subject.grade}
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground text-sm">-</span>
                              )}
                            </TableCell>
                            <TableCell className="text-center pr-6 whitespace-nowrap">
                              {subject.percentage >= 40 ? (
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Pass
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                  <XCircle className="h-3 w-3 mr-1" />
                                  Fail
                                </Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exams" className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="border shadow-md overflow-hidden bg-white/50 backdrop-blur-sm">
            <CardHeader className="bg-slate-50/50 border-b pb-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-purple-500" />
                Examination Results
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-6 space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-16 w-full rounded-xl" />
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-slate-50/80 sticky top-0 backdrop-blur-sm z-10">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="pl-6 h-12 font-semibold text-xs uppercase tracking-wider whitespace-nowrap">Exam Name</TableHead>
                        <TableHead className="h-12 font-semibold text-xs uppercase tracking-wider whitespace-nowrap">Type</TableHead>
                        <TableHead className="h-12 font-semibold text-xs uppercase tracking-wider whitespace-nowrap">Date</TableHead>
                        <TableHead className="text-center h-12 font-semibold text-xs uppercase tracking-wider whitespace-nowrap">Marks Obt.</TableHead>
                        <TableHead className="text-center h-12 font-semibold text-xs uppercase tracking-wider whitespace-nowrap">Total</TableHead>
                        <TableHead className="text-center h-12 font-semibold text-xs uppercase tracking-wider whitespace-nowrap">%</TableHead>
                        <TableHead className="text-center h-12 font-semibold text-xs uppercase tracking-wider whitespace-nowrap">Grade</TableHead>
                        <TableHead className="text-center pr-6 h-12 font-semibold text-xs uppercase tracking-wider whitespace-nowrap">Rank</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data?.exam_results
                        .sort((a, b) => new Date(b.exam_date).getTime() - new Date(a.exam_date).getTime())
                        .map((exam) => (
                          <TableRow key={exam.exam_id} className="hover:bg-slate-50/50 transition-colors border-b border-slate-100 last:border-0">
                            <TableCell className="font-medium pl-6 py-4 whitespace-nowrap text-slate-700">{exam.exam_name}</TableCell>
                            <TableCell className="whitespace-nowrap">
                              <Badge variant="outline" className="bg-slate-50 text-slate-600 font-normal">{exam.exam_type}</Badge>
                            </TableCell>
                            <TableCell className="whitespace-nowrap text-muted-foreground text-sm">
                              {new Date(exam.exam_date).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </TableCell>
                            <TableCell className="text-center font-semibold whitespace-nowrap">
                              {exam.marks_obtained.toFixed(1)}
                            </TableCell>
                            <TableCell className="text-center whitespace-nowrap text-muted-foreground">
                              {exam.total_marks.toFixed(1)}
                            </TableCell>
                            <TableCell className="text-center whitespace-nowrap">
                              <div className="flex flex-col items-center justify-center">
                                <span className={`font-bold ${getPerformanceColor(exam.percentage)}`}>{exam.percentage.toFixed(1)}%</span>
                                <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden mt-1">
                                  <div
                                    className={`h-full rounded-full ${exam.percentage >= 80 ? 'bg-green-500' :
                                      exam.percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                      }`}
                                    style={{ width: `${exam.percentage}%` }}
                                  />
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-center whitespace-nowrap">
                              {exam.grade ? (
                                <Badge variant={getGradeBadgeVariant(exam.grade)} className="font-mono">
                                  {exam.grade}
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground text-sm">-</span>
                              )}
                            </TableCell>
                            <TableCell className="text-center pr-6 whitespace-nowrap">
                              <div className="flex items-center justify-center gap-2">
                                {exam.rank <= 3 && (
                                  <Award className={`h-4 w-4 ${exam.rank === 1 ? 'text-yellow-500' : exam.rank === 2 ? 'text-gray-400' : 'text-amber-600'}`} />
                                )}
                                <span className={`font-medium ${exam.rank <= 3 ? 'text-slate-900' : 'text-muted-foreground'}`}>#{exam.rank}</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
