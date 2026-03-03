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
import { useProgramDrillDown } from '@/hooks/useDrillDown';
import {
  ArrowRight,
  Building2,
  Calendar,
  ChevronLeft,
  TrendingUp,
  Users,
} from 'lucide-react';
import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

export const ProgramDrillDown: React.FC = () => {
  const { programId } = useParams<{ programId: string }>();
  const navigate = useNavigate();
  const [filters, setFilters] = useState({});
  const { data, isLoading, error } = useProgramDrillDown(
    programId ? parseInt(programId) : null,
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

  return (
    <div className="space-y-4 md:space-y-8 p-4 md:p-6 animate-fade-in bg-slate-50/50 dark:bg-slate-950/50 min-h-screen">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link
          to="/drilldown"
          className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
        >
          <Building2 className="h-3 w-3" />
          College Overview
        </Link>
        <ChevronLeft className="h-3 w-3 rotate-180 text-muted-foreground/50" />
        <span className="font-medium text-foreground bg-background dark:bg-slate-800 px-2 py-0.5 rounded-full shadow-sm border dark:border-slate-700">
          {data?.program_name || 'Program'}
        </span>
      </div>

      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 shadow-2xl">
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
                  onClick={() => navigate('/drilldown')}
                  className="text-white/70 hover:text-white hover:bg-white/10 rounded-full"
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                  {isLoading ? <Skeleton className="h-10 w-96 bg-white/20" /> : data?.program_name}
                </h1>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-white/80 pl-14">
                {isLoading ? (
                  <Skeleton className="h-4 w-64 bg-white/20" />
                ) : (
                  <>
                    <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full text-sm backdrop-blur-md border border-white/10">
                      <Building2 className="h-3.5 w-3.5" />
                      Code: {data?.program_code}
                    </span>
                    <span className="hidden w-1 h-1 rounded-full bg-white/40 md:block" />
                    <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full text-sm backdrop-blur-md border border-white/10">
                      <Users className="h-3.5 w-3.5" />
                      Faculty: {data?.faculty_name}
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="flex gap-3 pl-14 md:pl-0">
              <Button className="bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-sm">
                <Calendar className="mr-2 h-4 w-4" />
                Schedule
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: 'Total Students', icon: Users, value: data?.total_students.toLocaleString(), sub: `In ${data?.total_classes} classes`, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { title: 'Average %', icon: TrendingUp, value: data?.average_percentage ? `${data?.average_percentage.toFixed(1)}%` : '-', sub: data?.average_percentage ? getPerformanceBadge(data.average_percentage) : null, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/20' },
          { title: 'Pass Rate', icon: Building2, value: data?.pass_percentage ? `${data?.pass_percentage.toFixed(1)}%` : '-', sub: data?.pass_percentage ? getPerformanceBadge(data.pass_percentage) : null, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20' },
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

      {/* Classes Breakdown */}
      <Card className="border-none shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm overflow-hidden">
        <CardHeader className="border-b bg-muted/30 dark:bg-slate-700/30 px-4 py-4 md:px-6 md:py-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <CardTitle className="text-xl font-bold text-gray-800 dark:text-white">Classes Overview</CardTitle>
              <p className="text-sm text-muted-foreground">Detailed performance breakdown by class</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="h-9 dark:bg-slate-700 dark:border-slate-600">
                <Calendar className="mr-2 h-4 w-4" />
                Academic Year
              </Button>
              <Button variant="outline" size="sm" className="h-9 dark:bg-slate-700 dark:border-slate-600">
                Filter
              </Button>
            </div>
          </div>
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
                <TableHeader className="bg-muted/30 dark:bg-slate-700/30">
                  <TableRow className="hover:bg-transparent border-none">
                    <TableHead className="pl-6 h-12 min-w-[200px]">Class Name</TableHead>
                    <TableHead className="text-center h-12 min-w-[150px]">Semester/Year</TableHead>
                    <TableHead className="text-center h-12 min-w-[100px]">Students</TableHead>
                    <TableHead className="text-center h-12 min-w-[100px]">Sections</TableHead>
                    <TableHead className="text-center h-12 min-w-[100px]">Avg Score</TableHead>
                    <TableHead className="text-center h-12 min-w-[100px]">Pass Rate</TableHead>
                    <TableHead className="text-center h-12 min-w-[150px]">Attendance</TableHead>
                    <TableHead className="text-right pr-6 h-12 min-w-[100px]">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.class_breakdown.map((classItem, index) => (
                    <TableRow
                      key={classItem.class_id}
                      className={`cursor-pointer transition-colors border-b border-muted/50 last:border-0 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 ${index % 2 === 0 ? 'bg-white dark:bg-slate-800' : 'bg-slate-50/30 dark:bg-slate-800/50'}`}
                      onClick={() => navigate(`/drilldown/class/${classItem.class_id}`)}
                    >
                      <TableCell className="font-medium pl-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm shrink-0">
                            {classItem.class_name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-base text-gray-900 dark:text-gray-100 whitespace-nowrap">{classItem.class_name}</div>
                            <div className="text-xs text-muted-foreground whitespace-nowrap">Class ID: {classItem.class_id}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center whitespace-nowrap">
                        <Badge variant="outline" className="font-normal dark:border-slate-600">
                          Sem {classItem.semester} • {classItem.year}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="font-semibold text-gray-700 dark:text-gray-300">{classItem.total_students}</div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="font-semibold text-gray-700 dark:text-gray-300">{classItem.total_sections}</div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={`font-bold ${getPerformanceColor(classItem.average_percentage)}`}>
                          {classItem.average_percentage.toFixed(1)}%
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={`font-bold ${getPerformanceColor(classItem.pass_percentage)}`}>
                          {classItem.pass_percentage.toFixed(1)}%
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-16 h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${classItem.attendance_rate >= 75 ? 'bg-green-500' : classItem.attendance_rate >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                              style={{ width: `${classItem.attendance_rate}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium">{classItem.attendance_rate.toFixed(0)}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/30"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/drilldown/class/${classItem.class_id}`);
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
    </div>
  );
};
