import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useStudentAttendanceSummary } from '@/hooks/useAttendance';
import { useAuth } from '@/hooks/useAuth';
import { useExamSchedules } from '@/hooks/useExamination';
import { useStudentFeeStatus } from '@/hooks/useFees';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  GraduationCap,
  TrendingUp
} from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';

// Circular Progress Component
const CircularProgress = ({
  value,
  size = 80,
  strokeWidth = 8,
  color = "text-emerald-500"
}: {
  value: number;
  size?: number;
  strokeWidth?: number;
  color?: string
}) => {
  // Ensure strict number types for calculations
  const safeSize = Number(size) || 80;
  const safeStrokeWidth = Number(strokeWidth) || 8;
  const safeValue = Number(value) || 0;

  const radius = (safeSize - safeStrokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (Math.min(safeValue, 100) / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: safeSize, height: safeSize }}>
      <svg className="transform -rotate-90 w-full h-full">
        <circle
          className="text-muted/20"
          stroke="currentColor"
          strokeWidth={safeStrokeWidth}
          fill="transparent"
          r={radius}
          cx={safeSize / 2}
          cy={safeSize / 2}
        />
        <motion.circle
          className={color}
          stroke="currentColor"
          strokeWidth={safeStrokeWidth}
          strokeDasharray={circumference}
          fill="transparent"
          r={radius}
          cx={safeSize / 2}
          cy={safeSize / 2}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-bold">{Math.round(safeValue)}%</span>
      </div>
    </div>
  );
};

export const StudentPriorityCards: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const studentId = user?.id ? Number(user.id) : null;

  // Fetch data
  const { data: attendanceSummary, isLoading: attendanceLoading } = useStudentAttendanceSummary(studentId);
  const { data: feeStatus, isLoading: feesLoading } = useStudentFeeStatus(studentId);
  const { data: examSchedules, isLoading: examsLoading } = useExamSchedules({
    page_size: 5,
    ordering: 'date',
    date__gte: new Date().toISOString().split('T')[0] // Upcoming exams
  });

  // Derived state
  const nextExam = examSchedules?.results?.[0];
  const attendancePercentage = attendanceSummary?.attendance_percentage || 0;

  // Determine Attendance Status
  const isAttendanceGood = attendancePercentage >= 75;
  const attendanceColor = isAttendanceGood ? "text-emerald-500" : "text-rose-500";

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  // Loading state skeleton
  if (attendanceLoading || feesLoading || examsLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="h-48 animate-pulse bg-muted/40" />
        ))}
      </div>
    )
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
    >
      {/* Attendance Card */}
      <motion.div variants={item} className="h-full">
        <Card className="h-full shadow-sm hover:shadow-md transition-shadow duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
            <TrendingUp className="w-24 h-24 text-emerald-500" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-base font-medium text-muted-foreground">
              <span className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                Attendance Snapshot
              </span>
              <Badge variant={isAttendanceGood ? "success" : "destructive"} className="ml-2">
                {isAttendanceGood ? "Good" : "Low"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6 mb-4 mt-2">
              <CircularProgress
                value={attendancePercentage}
                color={attendanceColor}
                size={70}
                strokeWidth={8}
              />
              <div className="space-y-1">
                <div className="flex items-baseline gap-1">
                  <span className={cn("text-3xl font-bold tracking-tight", attendanceColor)}>
                    {attendancePercentage}%
                  </span>
                  <span className="text-sm text-muted-foreground">Present</span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {isAttendanceGood
                    ? "Keep it up!"
                    : "Need improvement."}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full justify-between hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 group/btn"
              onClick={() => navigate('/student/academics/attendance')}
            >
              <span className="text-sm font-medium">View Detailed Report</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Fees Card */}
      <motion.div variants={item} className="h-full">
        <Card className="h-full shadow-sm hover:shadow-md transition-shadow duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
            <CreditCard className="w-24 h-24 text-amber-500" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-base font-medium text-muted-foreground">
              <span className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-amber-600" />
                Fees & Payments
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-1 mb-6 mt-2">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold tracking-tight text-foreground">
                  {feeStatus?.balance_amount ? formatCurrency(feeStatus.balance_amount) : '₹0'}
                </span>
                <span className="text-sm font-medium text-muted-foreground">Due</span>
              </div>

              <div className="flex items-center gap-2 text-sm mt-1">
                {feeStatus?.balance_amount && feeStatus.balance_amount > 0 ? (
                  <Badge variant="destructive" className="flex items-center gap-1.5 font-medium px-2 py-0.5">
                    <AlertCircle className="w-3 h-3" />
                    Payment Pending
                  </Badge>
                ) : (
                  <Badge variant="success" className="flex items-center gap-1.5 font-medium px-2 py-0.5">
                    <CheckCircle2 className="w-3 h-3" />
                    All Clear
                  </Badge>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <Button
                variant="outline"
                className="w-full justify-between hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200 group/btn mt-auto"
                onClick={() => navigate('/student/fees')}
              >
                <span className="text-sm font-medium">Manage Payments</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Exams Card */}
      <motion.div variants={item} className="h-full">
        <Card className="h-full shadow-sm hover:shadow-md transition-shadow duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
            <GraduationCap className="w-24 h-24 text-purple-500" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-base font-medium text-muted-foreground">
              <span className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-purple-600" />
                Upcoming Exam
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {nextExam ? (
              <div className="flex flex-col h-full">
                <div className="flex items-start gap-4 mb-4 mt-2">
                  <div className="flex flex-col items-center justify-center min-w-[3.5rem] h-14 bg-purple-100 dark:bg-purple-900/30 rounded-lg border border-purple-200 dark:border-purple-800">
                    <span className="text-xs font-bold text-purple-600 dark:text-purple-300 uppercase leading-none mb-1">
                      {new Date(nextExam.date).toLocaleDateString('en-US', { month: 'short' })}
                    </span>
                    <span className="text-xl font-bold text-purple-700 dark:text-purple-200 leading-none">
                      {new Date(nextExam.date).getDate()}
                    </span>
                  </div>
                  <div className="overflow-hidden space-y-1">
                    <h4 className="font-semibold truncate text-base leading-tight" title={nextExam.exam_name}>
                      {nextExam.exam_name}
                    </h4>
                    <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {nextExam.subject_name || 'General'}
                    </p>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full justify-between hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200 group/btn mt-6"
                  onClick={() => navigate('/exams/schedules')}
                >
                  <span className="text-sm font-medium">View Schedule</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-4 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-purple-50 dark:bg-purple-900/10 flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-purple-500/60" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">No Upcoming Exams</p>
                  <p className="text-xs text-muted-foreground">You are all caught up!</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 p-0 h-auto font-normal mt-1"
                  onClick={() => navigate('/exams/schedules')}
                >
                  Check Calendar
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};
