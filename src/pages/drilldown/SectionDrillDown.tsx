import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
import { useSectionDrillDown } from '@/hooks/useDrillDown';
import {
  ArrowRight,
  Award,
  BookOpen,
  Calendar,
  ChevronLeft,
  GraduationCap,
  Search,
  TrendingUp,
  Users,
} from 'lucide-react';
import React, { useState } from 'react';
import { useDebounce, DEBOUNCE_DELAYS } from '@/hooks/useDebounce';
import { Link, useNavigate, useParams } from 'react-router-dom';

export const SectionDrillDown: React.FC = () => {
  const { sectionId } = useParams<{ sectionId: string }>();
  const navigate = useNavigate();
  const [filters, setFilters] = useState({});
  const [activeTab, setActiveTab] = useState('students');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, DEBOUNCE_DELAYS.SEARCH);

  const { data, isLoading, error, refresh } = useSectionDrillDown(
    sectionId ? parseInt(sectionId) : null,
    filters
  );

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-red-500">Error: {error instanceof Error ? error.message : String(error)}</p>
            <Button onClick={() => refresh()} className="mt-4">
              Retry
            </Button>
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
    if (percentage >= 80) return <Badge className="bg-green-100 text-green-800">Excellent</Badge>;
    if (percentage >= 60) return <Badge className="bg-yellow-100 text-yellow-800">Good</Badge>;
    return <Badge className="bg-red-100 text-red-800">Needs Improvement</Badge>;
  };

  const getGradeBadgeVariant = (grade: string) => {
    if (['A+', 'A'].includes(grade)) return 'default';
    if (['B+', 'B'].includes(grade)) return 'secondary';
    return 'outline';
  };

  // Filter students based on search query
  const filteredStudents = data?.student_list?.filter(student =>
    student.student_name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
    student.admission_number.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
    (student.roll_number && student.roll_number.toLowerCase().includes(debouncedSearchQuery.toLowerCase()))
  ) || [];

  return (
    <div className="space-y-4 md:space-y-8 p-4 md:p-6 animate-fade-in bg-slate-50/50 dark:bg-slate-950/50 min-h-screen">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link
          to="/drilldown"
          className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
        >
          <Users className="h-3 w-3" />
          College Overview
        </Link>
        <ChevronLeft className="h-3 w-3 rotate-180 text-muted-foreground/50" />
        <span className="text-muted-foreground px-2 py-0.5">{data?.program_name}</span>
        <ChevronLeft className="h-3 w-3 rotate-180 text-muted-foreground/50" />
        <span className="text-muted-foreground px-2 py-0.5">{data?.class_name}</span>
        <ChevronLeft className="h-3 w-3 rotate-180 text-muted-foreground/50" />
        <span className="font-medium text-foreground bg-background dark:bg-slate-800 px-2 py-0.5 rounded-full shadow-sm border dark:border-slate-700">
          Section {data?.section_name || 'Section'}
        </span>
      </div>

      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600 via-fuchsia-600 to-pink-600 shadow-2xl">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
        <div className="absolute top-0 right-0 -mt-20 -mr-20 opacity-10 blur-3xl">
          <div className="w-96 h-96 rounded-full bg-white"></div>
        </div>
        <div className="relative z-10 p-8 md:p-10 text-white">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate(-1)}
                  className="text-white/70 hover:text-white hover:bg-white/10 rounded-full"
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                  {isLoading ? <Skeleton className="h-10 w-96 bg-white/20" /> : `Section ${data?.section_name}`}
                </h1>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-white/80 pl-14">
                {isLoading ? (
                  <Skeleton className="h-4 w-64 bg-white/20" />
                ) : (
                  <>
                    <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full text-sm backdrop-blur-md border border-white/10">
                      <Users className="h-3.5 w-3.5" />
                      Class {data?.class_name}
                    </span>
                    <span className="hidden w-1 h-1 rounded-full bg-white/40 md:block" />
                    <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full text-sm backdrop-blur-md border border-white/10">
                      <GraduationCap className="h-3.5 w-3.5" />
                      {data?.program_name}
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="flex gap-3 pl-14 md:pl-0">
              <Button className="bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-sm">
                <Calendar className="mr-2 h-4 w-4" />
                Attendance
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: 'Total Students', icon: Users, value: data?.total_students.toLocaleString(), sub: 'In this section', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/20' },
          { title: 'Average %', icon: TrendingUp, value: data?.average_percentage ? `${data?.average_percentage.toFixed(1)}%` : '-', sub: data?.average_percentage ? getPerformanceBadge(data.average_percentage) : null, color: 'text-fuchsia-600 dark:text-fuchsia-400', bg: 'bg-fuchsia-50 dark:bg-fuchsia-900/20' },
          { title: 'Pass Rate', icon: GraduationCap, value: data?.pass_percentage ? `${data?.pass_percentage.toFixed(1)}%` : '-', sub: data?.pass_percentage ? getPerformanceBadge(data.pass_percentage) : null, color: 'text-pink-600 dark:text-pink-400', bg: 'bg-pink-50 dark:bg-pink-900/20' },
          { title: 'Attendance', icon: Calendar, value: data?.attendance_rate ? `${data?.attendance_rate.toFixed(1)}%` : '-', sub: data?.attendance_rate ? getPerformanceBadge(data.attendance_rate) : null, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/20' }
        ].map((item, i) => (
          <Card key={i} className="border-none shadow-sm bg-white dark:bg-slate-800 hover:shadow-xl transition-all duration-300 group overflow-hidden relative">
            <div className={`absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity ${item.color}`}>
              <item.icon className="w-24 h-24 -mr-6 -mt-6 transform rotate-12" />
            </div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-muted-foreground">{item.title}</CardTitle>
              <div className={`p-2 rounded-xl ${item.bg} ${item.color}`}>
                <item.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className="text-3xl font-bold tracking-tight mt-2 dark:text-slate-100">
                    {item.value}
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    {item.sub}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="students" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm p-1 rounded-xl border dark:border-slate-700 h-auto">
          <TabsTrigger
            value="students"
            className="rounded-lg px-8 py-2.5 data-[state=active]:bg-white data-[state=active]:text-purple-700 data-[state=active]:shadow-sm transition-all text-muted-foreground dark:data-[state=active]:bg-slate-700 dark:data-[state=active]:text-purple-300"
          >
            <Users className="w-4 h-4 mr-2" />
            Student List
          </TabsTrigger>
          <TabsTrigger
            value="subjects"
            className="rounded-lg px-8 py-2.5 data-[state=active]:bg-white data-[state=active]:text-rose-700 data-[state=active]:shadow-sm transition-all text-muted-foreground dark:data-[state=active]:bg-slate-700 dark:data-[state=active]:text-rose-300"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Subject Performance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="students" className="animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
          <Card className="border-none shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm overflow-hidden">
            <CardHeader className="border-b bg-muted/30 dark:bg-slate-700/30 px-4 py-4 md:px-6 md:py-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <CardTitle className="text-xl font-bold text-gray-800 dark:text-white">Student Performance</CardTitle>
                  <p className="text-sm text-muted-foreground">Individual student statistics</p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                  <div className="relative flex-1 md:flex-none">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search students..."
                      className="pl-8 h-9 w-full md:w-[200px] dark:bg-slate-700 dark:border-slate-600"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button variant="outline" size="sm" className="h-9 dark:bg-slate-700 dark:border-slate-600">
                    Filter
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="space-y-4 p-6">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-16 w-full rounded-xl" />
                  ))}
                </div>
              ) : filteredStudents.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-muted/30 dark:bg-slate-700/30">
                      <TableRow className="hover:bg-transparent border-none">
                        <TableHead className="pl-6 h-12 min-w-[80px]">Rank</TableHead>
                        <TableHead className="h-12 min-w-[200px]">Student</TableHead>
                        <TableHead className="h-12 min-w-[120px]">Roll No</TableHead>
                        <TableHead className="text-center h-12 min-w-[100px]">Avg Score</TableHead>
                        <TableHead className="text-center h-12 min-w-[120px]">Attendance</TableHead>
                        <TableHead className="text-center h-12 min-w-[100px]">Grade</TableHead>
                        <TableHead className="text-right pr-6 h-12 min-w-[100px]">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStudents.map((student, index) => (
                        <TableRow
                          key={student.student_id}
                          className={`cursor-pointer transition-colors border-b border-muted/50 last:border-0 hover:bg-purple-50/50 dark:hover:bg-purple-900/10 ${index % 2 === 0 ? 'bg-white dark:bg-slate-800' : 'bg-slate-50/30 dark:bg-slate-800/50'}`}
                          onClick={() => navigate(`/drilldown/student/${student.student_id}`)}
                        >
                          <TableCell className="pl-6">
                            <div className="flex items-center gap-3">
                              {student.rank <= 3 && (
                                <div className={`p-1.5 rounded-full ${student.rank === 1 ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400' : student.rank === 2 ? 'bg-gray-100 text-gray-500 dark:bg-gray-700/20 dark:text-gray-400' : 'bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400'}`}>
                                  <Award className="h-4 w-4" />
                                </div>
                              )}
                              <span className={`font-bold ${student.rank <= 3 ? 'text-foreground' : 'text-muted-foreground'} dark:text-slate-100`}>#{student.rank}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-semibold text-gray-900 dark:text-gray-100 whitespace-nowrap">{student.student_name}</span>
                              <span className="text-xs text-muted-foreground whitespace-nowrap">{student.admission_number}</span>
                            </div>
                          </TableCell>
                          <TableCell className="dark:text-slate-300 whitespace-nowrap">{student.roll_number || '-'}</TableCell>
                          <TableCell className="text-center">
                            <span className={`font-bold ${getPerformanceColor(student.average_percentage)}`}>
                              {student.average_percentage.toFixed(1)}%
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-16 h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${student.attendance_percentage >= 75 ? 'bg-green-500' : student.attendance_percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                  style={{ width: `${student.attendance_percentage}%` }}
                                />
                              </div>
                              <span className="text-xs font-medium dark:text-slate-300">{student.attendance_percentage.toFixed(0)}%</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            {student.grade ? (
                              <Badge variant={getGradeBadgeVariant(student.grade)} className="px-3 dark:border-slate-600">
                                {student.grade}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground text-sm">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right pr-6">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-900/30"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/drilldown/student/${student.student_id}`);
                              }}
                            >
                              View
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12 bg-slate-50/50">
                  <div className="bg-white p-4 rounded-full shadow-sm inline-block mb-4">
                    <Users className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-900">No Students Found</h3>
                  <p className="text-sm text-muted-foreground">
                    {searchQuery ? `No students match "${searchQuery}"` : 'There are no students enrolled in this section yet.'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subjects" className="animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
          <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm overflow-hidden">
            <CardHeader className="border-b bg-muted/30 px-4 py-4 md:px-6 md:py-5">
              <CardTitle className="text-xl font-bold text-gray-800">Subject-wise Performance</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="space-y-4 p-6">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-16 w-full rounded-xl" />
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-muted/30">
                      <TableRow className="hover:bg-transparent border-none">
                        <TableHead className="pl-6 h-12 min-w-[200px]">Subject</TableHead>
                        <TableHead className="h-12 min-w-[100px]">Code</TableHead>
                        <TableHead className="text-center h-12 min-w-[100px]">Students</TableHead>
                        <TableHead className="text-center h-12 min-w-[100px]">Avg Marks</TableHead>
                        <TableHead className="text-center h-12 min-w-[100px]">Pass Rate</TableHead>
                        <TableHead className="text-right pr-6 h-12 min-w-[100px]">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data?.subject_breakdown?.map((subject, index) => (
                        <TableRow
                          key={subject.subject_id}
                          className={`cursor-pointer transition-colors border-b border-muted/50 last:border-0 hover:bg-rose-50/50 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}
                          onClick={() => navigate(`/drilldown/subject/${subject.subject_id}`)}
                        >
                          <TableCell className="font-medium pl-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-sm shrink-0">
                                {subject.subject_name.substring(0, 1).toUpperCase()}
                              </div>
                              <div>
                                <div className="text-base text-gray-900 whitespace-nowrap">{subject.subject_name}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-mono text-xs whitespace-nowrap">{subject.subject_code}</Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="font-semibold text-gray-700">{subject.total_students_appeared}</div>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className={`font-bold ${getPerformanceColor(subject.average_marks)}`}>
                              {subject.average_marks.toFixed(1)}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className={`font-bold ${getPerformanceColor(subject.pass_percentage)}`}>
                              {subject.pass_percentage.toFixed(1)}%
                            </span>
                          </TableCell>
                          <TableCell className="text-right pr-6">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/drilldown/subject/${subject.subject_id}`);
                              }}
                            >
                              View
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
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
