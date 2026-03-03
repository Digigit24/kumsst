import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useCollegeOverview } from '@/hooks/useDrillDown';
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  GraduationCap,
  TrendingUp,
  Trophy,
  Users,
} from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export const AcademicDrillDownWidget: React.FC = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useCollegeOverview();

  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 80) return 'text-emerald-600 dark:text-emerald-400';
    if (percentage >= 60) return 'text-amber-600 dark:text-amber-400';
    return 'text-rose-600 dark:text-rose-400';
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-emerald-500';
    if (percentage >= 60) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-4"
    >
      <Card className="border-none shadow-md bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-border/40">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            <BarChart3 className="h-5 w-5 text-primary" />
            Academic Overview
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/drilldown')}
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            Full Dashboard
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="p-6">
          {/* Key Metrics Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            {/* Total Students */}
            <motion.div variants={itemVariants} className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30">
              <div className="flex items-start justify-between mb-2">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                {isLoading ? <Skeleton className="h-4 w-12" /> : (
                  <Badge variant="secondary" className="bg-white/50 dark:bg-black/20 text-blue-700 dark:text-blue-300">
                    Active
                  </Badge>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Total Students</p>
                {isLoading ? <Skeleton className="h-8 w-24" /> : (
                  <h3 className="text-2xl font-bold text-foreground">
                    {data?.total_students.toLocaleString()}
                  </h3>
                )}
                <p className="text-xs text-muted-foreground">
                  {isLoading ? <Skeleton className="h-3 w-16" /> : `Across ${data?.total_programs} programs`}
                </p>
              </div>
            </motion.div>

            {/* Total Classes */}
            <motion.div variants={itemVariants} className="p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800/30">
              <div className="flex items-start justify-between mb-2">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                  <BookOpen className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <Badge variant="secondary" className="bg-white/50 dark:bg-black/20 text-purple-700 dark:text-purple-300">
                  Current
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Total Classes</p>
                {isLoading ? <Skeleton className="h-8 w-24" /> : (
                  <h3 className="text-2xl font-bold text-foreground">
                    {data?.total_classes.toLocaleString()}
                  </h3>
                )}
                <p className="text-xs text-muted-foreground">Active sessions</p>
              </div>
            </motion.div>

            {/* Overall Pass Rate */}
            <motion.div variants={itemVariants} className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/30">
              <div className="flex items-start justify-between mb-2">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                {isLoading ? <Skeleton className="h-4 w-12" /> : (
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-white/50 dark:bg-black/20 ${getPerformanceColor(data?.overall_pass_percentage || 0)}`}>
                    {data?.overall_pass_percentage.toFixed(1)}%
                  </span>
                )}
              </div>
              <div className="space-y-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pass Rate</p>
                  {isLoading ? <Skeleton className="h-6 w-full mt-1" /> : (
                    <div className="flex items-end gap-2 mt-1">
                      <Progress value={data?.overall_pass_percentage} className="h-2" indicatorClassName={getProgressColor(data?.overall_pass_percentage || 0)} />
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Average performance
                </p>
              </div>
            </motion.div>

            {/* Attendance Rate */}
            <motion.div variants={itemVariants} className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/30">
              <div className="flex items-start justify-between mb-2">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-lg">
                  <GraduationCap className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                {isLoading ? <Skeleton className="h-4 w-12" /> : (
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-white/50 dark:bg-black/20 ${getPerformanceColor(data?.overall_attendance_rate || 0)}`}>
                    {data?.overall_attendance_rate.toFixed(1)}%
                  </span>
                )}
              </div>
              <div className="space-y-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Attendance</p>
                  {isLoading ? <Skeleton className="h-6 w-full mt-1" /> : (
                    <div className="flex items-end gap-2 mt-1">
                      <Progress value={data?.overall_attendance_rate} className="h-2" indicatorClassName={getProgressColor(data?.overall_attendance_rate || 0)} />
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Overall engagement
                </p>
              </div>
            </motion.div>
          </div>

          {/* Top Performing Programs Leaderboard */}
          {!isLoading && data?.program_breakdown && (
            <motion.div variants={itemVariants} className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-amber-500" />
                  Top Performing Programs
                </h4>
                <span className="text-xs text-muted-foreground">Based on pass percentage</span>
              </div>

              <div className="grid gap-3">
                {data.program_breakdown
                  .slice()
                  .sort((a, b) => b.pass_percentage - a.pass_percentage)
                  .slice(0, 3)
                  .map((program, index) => (
                    <motion.div
                      key={program.program_id}
                      whileHover={{ scale: 1.01 }}
                      className="group relative flex items-center justify-between p-4 rounded-xl border border-border/50 bg-card hover:shadow-md transition-all cursor-pointer"
                      onClick={() => navigate(`/drilldown/program/${program.program_id}`)}
                    >
                      {/* Rank Indicator */}
                      <div className={`absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-sm ${index === 0 ? 'bg-amber-400 text-white border-2 border-white' :
                          index === 1 ? 'bg-slate-400 text-white border-2 border-white' :
                            'bg-orange-400 text-white border-2 border-white'
                        }`}>
                        {index + 1}
                      </div>

                      <div className="flex-1 pl-4">
                        <div className="font-semibold text-foreground group-hover:text-primary transition-colors">
                          {program.program_name}
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" /> {program.total_students}
                          </span>
                          <span className="flex items-center gap-1">
                            <BookOpen className="h-3 w-3" /> {program.total_classes}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className={`text-lg font-bold ${getPerformanceColor(program.pass_percentage)}`}>
                            {program.pass_percentage.toFixed(1)}%
                          </div>
                          <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Pass Rate</div>
                        </div>
                        <div className="h-8 w-8 rounded-full bg-muted/50 flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                          <ArrowRight className="h-4 w-4" />
                        </div>
                      </div>
                    </motion.div>
                  ))}
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
