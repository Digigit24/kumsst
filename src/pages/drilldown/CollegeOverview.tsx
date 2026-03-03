import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useCollegeOverview } from '@/hooks/useDrillDown';
import {
  Activity,
  ArrowRight,
  Award,
  Building2,
  Calendar,
  GraduationCap,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

export const CollegeOverview: React.FC = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({});
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const legendRefs = useRef<(HTMLDivElement | null)[]>([]);
  const { data, isLoading, error, refresh } = useCollegeOverview(filters);

  // Auto-scroll logic
  useEffect(() => {
    if (activeIndex !== null && legendRefs.current[activeIndex]) {
      const listItem = legendRefs.current[activeIndex];
      if (listItem) {
        // Scroll item into view
        listItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [activeIndex]);

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-red-100 p-3">
                <Activity className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-red-900">Error Loading Data</h3>
                <p className="text-sm text-red-700">{error instanceof Error ? error.message : String(error)}</p>
              </div>
            </div>
            <Button onClick={() => refresh()} className="mt-4 bg-red-600 hover:bg-red-700">
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

  const getPerformanceBg = (percentage: number) => {
    if (percentage >= 80) return 'bg-gradient-to-br from-green-500 to-emerald-600';
    if (percentage >= 60) return 'bg-gradient-to-br from-yellow-500 to-orange-600';
    return 'bg-gradient-to-br from-red-500 to-rose-600';
  };

  const getPerformanceBadge = (percentage: number) => {
    if (percentage >= 80) return <Badge className="bg-green-100 text-green-800 border-green-200">Excellent</Badge>;
    if (percentage >= 60) return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Good</Badge>;
    return <Badge className="bg-red-100 text-red-800 border-red-200">Needs Improvement</Badge>;
  };

  // Prepare chart data
  const programChartData = data?.program_breakdown?.map(p => ({
    name: p.program_code,
    passRate: p.pass_percentage,
    attendance: p.attendance_rate,
    avgScore: p.average_percentage,
  })) || [];

  const pieChartData = data?.program_breakdown?.map(p => ({
    name: p.program_code,
    value: p.total_students,
  })) || [];

  // Professional, distinct colors for charts (Vibrant but professional)
  const COLORS = [
    '#3b82f6', // Blue
    '#10b981', // Emerald
    '#8b5cf6', // Violet
    '#f59e0b', // Amber
    '#ec4899', // Pink
    '#06b6d4', // Cyan
    '#f97316', // Orange
    '#6366f1'  // Indigo
  ];

  const radialData = [
    {
      name: 'Pass Rate',
      value: data?.overall_pass_percentage || 0,
      fill: '#10b981', // Emerald
    },
    {
      name: 'Attendance',
      value: data?.overall_attendance_rate || 0,
      fill: '#3b82f6', // Blue
    },
    {
      name: 'Avg Score',
      value: data?.overall_average_percentage || 0,
      fill: '#f59e0b', // Amber
    },
  ];

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-[#FFF1CB]/30 via-[#C2E2FA]/20 to-[#B7A3E3]/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 min-h-screen">
      {/* Light Pastel Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#C2E2FA] via-[#B7A3E3]/80 to-[#FF8F8F]/70 p-8 shadow-lg border border-white/50">
        <div className="absolute inset-0 bg-white/30"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-lg bg-white/60 backdrop-blur-sm p-3 shadow-sm">
              <Award className="h-8 w-8 text-[#7C6AAE]" />
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-slate-800">Academic Performance Dashboard</h1>
              <p className="text-slate-600 mt-2 text-lg">
                Institution-wide insights and analytics
              </p>
            </div>
          </div>
        </div>
        <div className="absolute right-0 top-0 h-full w-64 bg-white/20 transform skew-x-12"></div>
        <div className="absolute -bottom-4 -right-4 w-32 h-32 rounded-full bg-[#FFF1CB]/50"></div>
        <div className="absolute -top-4 right-20 w-20 h-20 rounded-full bg-[#FF8F8F]/30"></div>
      </div>

      {/* Light Pastel Key Metrics Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Students - Light Blue */}
        <Card className="relative border border-[#C2E2FA] shadow-md bg-gradient-to-br from-[#C2E2FA]/30 to-white dark:from-blue-900/20 dark:to-slate-800 hover:shadow-lg transition-all duration-300 overflow-hidden group hover:scale-[1.02]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-200">Total Students</CardTitle>
            <div className="rounded-full bg-[#C2E2FA] p-2">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-10 w-32" />
            ) : (
              <>
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {(data?.total_students || 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Across {data?.total_programs} programs • {data?.total_classes} classes
                </p>
                <Progress value={75} className="mt-3 h-1.5" />
              </>
            )}
          </CardContent>
        </Card>

        {/* Pass Rate - Light Cream/Yellow */}
        <Card className="relative border border-[#FFF1CB] shadow-md bg-gradient-to-br from-[#FFF1CB]/40 to-white dark:from-yellow-900/20 dark:to-slate-800 hover:shadow-lg transition-all duration-300 overflow-hidden group hover:scale-[1.02]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-200">Overall Pass Rate</CardTitle>
            <div className="rounded-full bg-[#FFF1CB] p-2">
              <GraduationCap className="h-5 w-5 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-10 w-32" />
            ) : (
              <>
                <div className={`text-3xl font-bold ${getPerformanceColor(data?.overall_pass_percentage || 0)}`}>
                  {(data?.overall_pass_percentage || 0).toFixed(1)}%
                </div>
                <div className="mt-2">{getPerformanceBadge(data?.overall_pass_percentage || 0)}</div>
                <Progress value={data?.overall_pass_percentage || 0} className="mt-3 h-1.5" />
              </>
            )}
          </CardContent>
        </Card>

        {/* Average Score - Light Pink/Coral */}
        <Card className="relative border border-[#FF8F8F]/50 shadow-md bg-gradient-to-br from-[#FF8F8F]/20 to-white dark:from-rose-900/20 dark:to-slate-800 hover:shadow-lg transition-all duration-300 overflow-hidden group hover:scale-[1.02]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-200">Average Score</CardTitle>
            <div className="rounded-full bg-[#FF8F8F]/40 p-2">
              <Target className="h-5 w-5 text-rose-600" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-10 w-32" />
            ) : (
              <>
                <div className={`text-3xl font-bold ${getPerformanceColor(data?.overall_average_percentage || 0)}`}>
                  {(data?.overall_average_percentage || 0).toFixed(1)}%
                </div>
                <div className="mt-2">{getPerformanceBadge(data?.overall_average_percentage || 0)}</div>
                <Progress value={data?.overall_average_percentage || 0} className="mt-3 h-1.5" />
              </>
            )}
          </CardContent>
        </Card>

        {/* Attendance - Light Purple */}
        <Card className="relative border border-[#B7A3E3]/50 shadow-md bg-gradient-to-br from-[#B7A3E3]/25 to-white dark:from-purple-900/20 dark:to-slate-800 hover:shadow-lg transition-all duration-300 overflow-hidden group hover:scale-[1.02]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-200">Attendance Rate</CardTitle>
            <div className="rounded-full bg-[#B7A3E3]/50 p-2">
              <Calendar className="h-5 w-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-10 w-32" />
            ) : (
              <>
                <div className={`text-3xl font-bold ${getPerformanceColor(data?.overall_attendance_rate || 0)}`}>
                  {(data?.overall_attendance_rate || 0).toFixed(1)}%
                </div>
                <div className="mt-2">{getPerformanceBadge(data?.overall_attendance_rate || 0)}</div>
                <Progress value={data?.overall_attendance_rate || 0} className="mt-3 h-1.5" />
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Performance Chart */}
        <Card className="border-0 shadow-lg bg-white dark:bg-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-100">
              <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              Program Performance Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-80 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={programChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-slate-700" />
                  <XAxis dataKey="name" stroke="#6b7280" className="dark:stroke-slate-400" />
                  <YAxis stroke="#6b7280" className="dark:stroke-slate-400" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--tooltip-bg, white)',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      color: 'var(--tooltip-text, black)'
                    }}
                    wrapperClassName="dark:!bg-slate-800 dark:!text-white"
                  />
                  <Legend wrapperStyle={{ color: '#6b7280' }} />
                  <Bar dataKey="passRate" fill="#10b981" name="Pass Rate %" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="attendance" fill="#3b82f6" name="Attendance %" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="avgScore" fill="#f59e0b" name="Avg Score %" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Student Distribution */}
        <Card className="border-0 shadow-lg bg-white dark:bg-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-100">
              <Building2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              Student Distribution by Program
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-80 w-full" />
            ) : (
              <div className="flex flex-col-reverse md:flex-row items-center gap-6 h-auto min-h-[400px] md:h-[350px] p-2 relative">

                {/* Custom Legend Section */}
                <div className="w-full md:w-1/2 h-[200px] md:h-full overflow-y-auto pr-2 custom-scrollbar">
                  <style>
                    {`
                      .custom-scrollbar::-webkit-scrollbar {
                        width: 6px;
                      }
                      .custom-scrollbar::-webkit-scrollbar-track {
                        background: transparent;
                      }
                      .custom-scrollbar::-webkit-scrollbar-thumb {
                        background-color: rgba(156, 163, 175, 0.5);
                        border-radius: 20px;
                      }
                      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                        background-color: rgba(107, 114, 128, 0.8);
                      }
                    `}
                  </style>
                  <div className="space-y-3">
                    {pieChartData.map((entry, index) => (
                      <div
                        key={index}
                        ref={(el) => (legendRefs.current[index] = el)}
                        onMouseEnter={() => setActiveIndex(index)}
                        onMouseLeave={() => setActiveIndex(null)}
                        className={`flex items-center justify-between p-3 rounded-xl transition-all duration-300 cursor-pointer border ${activeIndex === index
                          ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 shadow-lg scale-105 z-10'
                          : activeIndex !== null
                            ? 'bg-gray-50 dark:bg-gray-800/50 border-transparent opacity-40 blur-[1px] scale-95'
                            : 'bg-gray-50 dark:bg-gray-800/50 border-transparent hover:bg-gray-100 dark:hover:bg-gray-800 hover:scale-[1.02]'
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`h-3 w-3 rounded-full shadow-sm ring-2 ring-white dark:ring-gray-900 transition-transform duration-300 ${activeIndex === index ? 'scale-150 ring-blue-200' : ''}`}
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className={`text-sm font-medium truncate max-w-[140px] transition-all duration-300 ${activeIndex === index
                            ? 'text-blue-700 dark:text-blue-300 text-base font-bold'
                            : 'text-gray-700 dark:text-gray-200'
                            }`} title={entry.name}>
                            {entry.name}
                          </span>
                        </div>
                        <span className={`text-xs font-bold px-2 py-1 rounded-md shadow-sm border transition-all duration-300 ${activeIndex === index
                          ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 scale-110'
                          : 'bg-white dark:bg-gray-900 text-gray-500 border-gray-100 dark:border-gray-800'
                          }`}>
                          {entry.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Chart Section */}
                <div className="w-full md:w-1/2 h-[300px] md:h-full z-10 min-h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={95}
                        paddingAngle={3}
                        dataKey="value"
                        stroke="none"
                        onMouseEnter={(_, index) => setActiveIndex(index)}
                        onMouseLeave={() => setActiveIndex(null)}
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                            opacity={activeIndex === null || activeIndex === index ? 1 : 0.3}
                            stroke={activeIndex === index ? '#fff' : 'none'}
                            strokeWidth={activeIndex === index ? 2 : 0}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: 'none',
                          borderRadius: '12px',
                          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                          padding: '12px'
                        }}
                        itemStyle={{ color: '#374151', fontWeight: 600, fontSize: '13px' }}
                        formatter={(value: any) => [`${value} Students`, '']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Programs Table */}
      <Card className="border-0 shadow-lg bg-white dark:bg-slate-800 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800 dark:to-slate-800/50 border-b border-slate-100 dark:border-slate-700">
          <CardTitle className="flex items-center gap-2 text-xl text-slate-800 dark:text-slate-100">
            <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            Programs Performance Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-2 p-6">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 hover:bg-slate-50 dark:bg-slate-800/50 dark:hover:bg-slate-800/50">
                    <TableHead className="font-semibold text-slate-600 dark:text-slate-300">Program</TableHead>
                    <TableHead className="font-semibold text-slate-600 dark:text-slate-300">Faculty</TableHead>
                    <TableHead className="text-center font-semibold text-slate-600 dark:text-slate-300">Students</TableHead>
                    <TableHead className="text-center font-semibold text-slate-600 dark:text-slate-300">Classes</TableHead>
                    <TableHead className="text-center font-semibold text-slate-600 dark:text-slate-300">Avg %</TableHead>
                    <TableHead className="text-center font-semibold text-slate-600 dark:text-slate-300">Pass %</TableHead>
                    <TableHead className="text-center font-semibold text-slate-600 dark:text-slate-300">Attendance</TableHead>
                    <TableHead className="text-right font-semibold text-slate-600 dark:text-slate-300">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(data?.program_breakdown || [])
                    .slice()
                    .sort((a, b) => b.pass_percentage - a.pass_percentage)
                    .map((program, index) => (
                      <TableRow
                        key={program.program_id}
                        className="cursor-pointer hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors border-b border-slate-100 dark:border-slate-800"
                        onClick={() => navigate(`/drilldown/program/${program.program_id}`)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {index < 3 && (
                              <div className={`rounded-full p-1 ${index === 0 ? 'bg-yellow-100 dark:bg-yellow-900/30' : index === 1 ? 'bg-slate-100 dark:bg-slate-700' : 'bg-orange-100 dark:bg-orange-900/30'}`}>
                                <Award className={`h-4 w-4 ${index === 0 ? 'text-yellow-600 dark:text-yellow-400' : index === 1 ? 'text-slate-600 dark:text-slate-400' : 'text-orange-600 dark:text-orange-400'}`} />
                              </div>
                            )}
                            <div>
                              <div className="font-medium text-slate-800 dark:text-slate-100">{program.program_name}</div>
                              <div className="text-xs text-muted-foreground">{program.program_code}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-normal dark:border-slate-600 dark:text-slate-300">
                            {program.faculty_name}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="font-semibold text-slate-700 dark:text-slate-200">{program.total_students}</div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="font-semibold text-slate-700 dark:text-slate-200">{program.total_classes}</div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex flex-col items-center gap-1">
                            <span className={`font-bold ${getPerformanceColor(program.average_percentage)}`}>
                              {(program.average_percentage || 0).toFixed(1)}%
                            </span>
                            <Progress value={program.average_percentage} className="h-1 w-16" />
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex flex-col items-center gap-1">
                            <span className={`font-bold ${getPerformanceColor(program.pass_percentage)}`}>
                              {(program.pass_percentage || 0).toFixed(1)}%
                            </span>
                            <Progress value={program.pass_percentage} className="h-1 w-16" />
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex flex-col items-center gap-1">
                            <span className={`font-bold ${getPerformanceColor(program.attendance_rate)}`}>
                              {(program.attendance_rate || 0).toFixed(1)}%
                            </span>
                            <Progress value={program.attendance_rate} className="h-1 w-16" />
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="hover:bg-blue-100 hover:text-blue-700 dark:hover:bg-blue-900/30 dark:hover:text-blue-400"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/drilldown/program/${program.program_id}`);
                            }}
                          >
                            View Details
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
