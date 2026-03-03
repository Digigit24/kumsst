import { AttendanceCalendar } from '@/components/attendance/AttendanceCalendar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAssignments } from '@/hooks/useAssignments';
import {
  AlertCircle,
  BarChart3,
  BookOpen,
  Calendar,
  CheckCircle2,
  ClipboardList,
  Clock,
  CreditCard,
  FileCheck,
  FileText,
  GraduationCap,
  Trophy,
  UserCircle
} from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';

export const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();

  // Fetch assignments from API
  const { data: assignmentsData } = useAssignments({ page_size: 10, status: 'active' });
  const assignments = assignmentsData?.results || [];

  // Filter assignments that are not yet submitted (pending)
  const today = new Date();
  const pendingAssignments = assignments.filter(a => {
    const dueDate = new Date(a.due_date);
    return dueDate >= today; // Only show assignments that haven't passed due date
  });

  // Mock data - Replace with actual API calls
  const todaysClasses = [
    { id: 1, subject: 'Mathematics', time: '09:00 AM', room: 'Room 101', status: 'upcoming' },
    { id: 2, subject: 'Physics', time: '11:00 AM', room: 'Lab 203', status: 'upcoming' },
    { id: 3, subject: 'English', time: '02:00 PM', room: 'Room 105', status: 'completed' },
  ];

  const attendanceData = {
    percentage: 85,
    present: 68,
    absent: 12,
    total: 80
  };

  const pendingFees = {
    amount: 5000,
    dueDate: '2025-01-15',
    description: 'Semester Fee'
  };

  const upcomingExams = [
    { id: 1, subject: 'Mathematics', date: '2026-01-05', type: 'Mid-term' },
    { id: 2, subject: 'Physics', date: '2026-01-08', type: 'Mid-term' },
  ];

  const recentNotices = [
    { id: 1, title: 'Holiday Notice', date: '2025-12-20', type: 'important' },
    { id: 2, title: 'Sports Day Registration', date: '2025-12-18', type: 'event' },
  ];

  // Test Marks Data
  const recentTestMarks = [
    { id: 1, subject: 'Mathematics', test: 'Unit Test 3', marks: 85, totalMarks: 100, grade: 'A', date: '2025-12-15' },
    { id: 2, subject: 'Physics', test: 'Mid-term Exam', marks: 78, totalMarks: 100, grade: 'B+', date: '2025-12-10' },
    { id: 3, subject: 'Chemistry', test: 'Unit Test 3', marks: 92, totalMarks: 100, grade: 'A+', date: '2025-12-08' },
    { id: 4, subject: 'English', test: 'Essay Test', marks: 88, totalMarks: 100, grade: 'A', date: '2025-12-05' },
  ];

  const getGradeColor = (grade: string) => {
    if (grade === 'A+' || grade === 'A') return 'success';
    if (grade === 'B+' || grade === 'B') return 'default';
    if (grade === 'C+' || grade === 'C') return 'warning';
    return 'destructive';
  };

  return (
    <div
      className="space-y-6 min-h-screen p-6"
      style={{
        backgroundColor: '#F0F0F0' // 60% - Seashell (main background)
      }}
    >
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold" style={{ color: '#192D3C' }}>Student Dashboard</h1>
        <p className="mt-2" style={{ color: '#96AAAA' }}>
          Welcome back! Here's your overview for today
        </p>
      </div>

      {/* Quick Actions - Prominent at Top */}
      <Card
        className="border-none shadow-lg"
        style={{ backgroundColor: '#96AAAA' }} // 30% - Cascade (secondary)
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2" style={{ color: '#192D3C' }}>
            <BarChart3 className="h-5 w-5" style={{ color: '#192D3C' }} />
            Quick Actions
          </CardTitle>
          <CardDescription style={{ color: '#F0F0F0' }}>Frequently used actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            <Button
              variant="outline"
              className="h-24 border-none shadow-md hover:shadow-lg transition-all"
              style={{
                backgroundColor: '#F0F0F0',
                color: '#192D3C'
              }}
              onClick={() => navigate('/attendance/my-attendance')}
            >
              <div className="flex flex-col items-center gap-2">
                <ClipboardList className="h-6 w-6" style={{ color: '#192D3C' }} />
                <span className="text-xs font-medium">My Attendance</span>
              </div>
            </Button>
            <Button
              variant="outline"
              className="h-24 border-none shadow-md hover:shadow-lg transition-all"
              style={{
                backgroundColor: '#F0F0F0',
                color: '#192D3C'
              }}
              onClick={() => navigate('/student/examinations/results')}
            >
              <div className="flex flex-col items-center gap-2">
                <Trophy className="h-6 w-6" style={{ color: '#192D3C' }} />
                <span className="text-xs font-medium">My Results</span>
              </div>
            </Button>
            <Button
              variant="outline"
              className="h-24 border-none shadow-md hover:shadow-lg transition-all"
              style={{
                backgroundColor: '#F0F0F0',
                color: '#192D3C'
              }}
              onClick={() => navigate('/student/fees')}
            >
              <div className="flex flex-col items-center gap-2">
                <CreditCard className="h-6 w-6" style={{ color: '#192D3C' }} />
                <span className="text-xs font-medium">Pay Fees</span>
              </div>
            </Button>
            <Button
              variant="outline"
              className="h-24 border-none shadow-md hover:shadow-lg transition-all"
              style={{
                backgroundColor: '#F0F0F0',
                color: '#192D3C'
              }}
              onClick={() => navigate('/student/academics/assignments')}
            >
              <div className="flex flex-col items-center gap-2">
                <FileCheck className="h-6 w-6" style={{ color: '#192D3C' }} />
                <span className="text-xs font-medium">Assignments</span>
              </div>
            </Button>
            <Button
              variant="outline"
              className="h-24 border-none shadow-md hover:shadow-lg transition-all"
              style={{
                backgroundColor: '#F0F0F0',
                color: '#192D3C'
              }}
              onClick={() => navigate('/student/certificates')}
            >
              <div className="flex flex-col items-center gap-2">
                <FileText className="h-6 w-6" style={{ color: '#192D3C' }} />
                <span className="text-xs font-medium">Certificates</span>
              </div>
            </Button>
            <Button
              variant="outline"
              className="h-24 border-none shadow-md hover:shadow-lg transition-all"
              style={{
                backgroundColor: '#F0F0F0',
                color: '#192D3C'
              }}
              onClick={() => navigate('/student/profile')}
            >
              <div className="flex flex-col items-center gap-2">
                <UserCircle className="h-6 w-6" style={{ color: '#192D3C' }} />
                <span className="text-xs font-medium">My Profile</span>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Priority Cards - Top Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Today's Classes Card */}
        <Card
          className="hover:shadow-lg transition-shadow cursor-pointer border-none"
          style={{ backgroundColor: '#96AAAA' }}
          onClick={() => navigate('/student/academics/subjects')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium" style={{ color: '#F0F0F0' }}>
              Today's Classes
            </CardTitle>
            <Calendar className="h-4 w-4" style={{ color: '#F0F0F0' }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: '#192D3C' }}>{todaysClasses.length}</div>
            <p className="text-xs mt-1" style={{ color: '#F0F0F0' }}>
              {todaysClasses.filter(c => c.status === 'upcoming').length} upcoming
            </p>
          </CardContent>
        </Card>

        {/* Attendance Status Card */}
        <Card
          className="hover:shadow-lg transition-shadow cursor-pointer border-none"
          style={{ backgroundColor: '#96AAAA' }}
          onClick={() => navigate('/attendance/my-attendance')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium" style={{ color: '#F0F0F0' }}>
              Attendance
            </CardTitle>
            <CheckCircle2 className="h-4 w-4" style={{ color: '#F0F0F0' }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: '#192D3C' }}>{attendanceData.percentage}%</div>
            <div className="flex items-center gap-2 mt-1">
              <Badge
                variant={attendanceData.percentage >= 75 ? "default" : "destructive"}
                style={{
                  backgroundColor: attendanceData.percentage >= 75 ? '#192D3C' : '#dc2626',
                  color: '#F0F0F0'
                }}
              >
                {attendanceData.present}/{attendanceData.total}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Pending Fees Card */}
        <Card
          className="hover:shadow-lg transition-shadow cursor-pointer border-none"
          style={{ backgroundColor: '#96AAAA' }}
          onClick={() => navigate('/student/fees')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium" style={{ color: '#F0F0F0' }}>
              Pending Fees
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" style={{ color: '#dc2626' }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: '#192D3C' }}>₹{pendingFees.amount}</div>
            <p className="text-xs mt-1" style={{ color: '#dc2626' }}>
              Due: {new Date(pendingFees.dueDate).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>

        {/* Pending Assignments Card */}
        <Card
          className="hover:shadow-lg transition-shadow cursor-pointer border-none"
          style={{ backgroundColor: '#96AAAA' }}
          onClick={() => navigate('/student/academics/assignments')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium" style={{ color: '#F0F0F0' }}>
              Pending Assignments
            </CardTitle>
            <FileText className="h-4 w-4" style={{ color: '#F0F0F0' }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: '#192D3C' }}>{pendingAssignments.length}</div>
            <p className="text-xs mt-1" style={{ color: '#F0F0F0' }}>
              {pendingAssignments.filter(a => {
                const daysUntilDue = Math.ceil((new Date(a.due_date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                return daysUntilDue <= 3; // Due within 3 days
              }).length} due soon
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content - With Attendance Calendar and Test Marks */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Mini Attendance Calendar - Full Width on Small, 2 cols on Large */}
        <div className="lg:col-span-2">
          <div style={{ backgroundColor: '#96AAAA', borderRadius: '8px', padding: '1rem' }}>
            <AttendanceCalendar
              showStats={true}
              showLegend={true}
              compact={false}
            />
          </div>
        </div>

        {/* Test Marks Widget */}
        <Card className="border-none" style={{ backgroundColor: '#96AAAA' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ color: '#F0F0F0' }}>
              <GraduationCap className="h-5 w-5" style={{ color: '#F0F0F0' }} />
              Recent Test Marks
            </CardTitle>
            <CardDescription style={{ color: '#F0F0F0' }}>Your latest test scores</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentTestMarks.map((test) => (
                <div key={test.id} className="p-3 rounded-lg border-none shadow-sm transition-colors" style={{ backgroundColor: '#F0F0F0' }}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-medium text-sm" style={{ color: '#192D3C' }}>{test.subject}</p>
                      <p className="text-xs" style={{ color: '#96AAAA' }}>{test.test}</p>
                    </div>
                    <Badge
                      variant={getGradeColor(test.grade)}
                      style={{
                        backgroundColor: '#192D3C',
                        color: '#F0F0F0'
                      }}
                    >
                      {test.grade}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold" style={{ color: '#192D3C' }}>{test.marks}</span>
                      <span className="text-sm" style={{ color: '#96AAAA' }}>/ {test.totalMarks}</span>
                    </div>
                    <span className="text-xs" style={{ color: '#96AAAA' }}>
                      {new Date(test.date).toLocaleDateString()}
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#96AAAA' }}>
                    <div
                      className="h-full transition-all"
                      style={{
                        backgroundColor: test.marks / test.totalMarks >= 0.9 ? '#22c55e' :
                          test.marks / test.totalMarks >= 0.75 ? '#3b82f6' :
                          test.marks / test.totalMarks >= 0.6 ? '#eab308' :
                          '#ef4444',
                        width: `${(test.marks / test.totalMarks) * 100}%`
                      }}
                    />
                  </div>
                </div>
              ))}
              <Button
                variant="outline"
                className="w-full mt-2 border-none"
                style={{
                  backgroundColor: '#192D3C',
                  color: '#F0F0F0'
                }}
                onClick={() => navigate('/student/examinations/results')}
              >
                View All Results
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Today's Classes Detail */}
        <Card className="border-none" style={{ backgroundColor: '#96AAAA' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ color: '#F0F0F0' }}>
              <Calendar className="h-5 w-5" style={{ color: '#F0F0F0' }} />
              Today's Schedule
            </CardTitle>
            <CardDescription style={{ color: '#F0F0F0' }}>Your classes for today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {todaysClasses.map((class_) => (
                <div key={class_.id} className="flex items-center justify-between p-3 rounded-lg border-none shadow-sm transition-colors" style={{ backgroundColor: '#F0F0F0' }}>
                  <div className="flex items-center gap-3">
                    <div
                      className="h-10 w-10 rounded-full flex items-center justify-center"
                      style={{
                        backgroundColor: class_.status === 'completed' ? '#22c55e' : '#192D3C',
                        color: '#F0F0F0'
                      }}
                    >
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-sm" style={{ color: '#192D3C' }}>{class_.subject}</p>
                      <p className="text-xs" style={{ color: '#96AAAA' }}>{class_.room}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-xs" style={{ color: '#192D3C' }}>{class_.time}</p>
                    <Badge
                      variant={class_.status === 'completed' ? 'default' : 'default'}
                      className="mt-1"
                      style={{
                        backgroundColor: class_.status === 'completed' ? '#22c55e' : '#192D3C',
                        color: '#F0F0F0'
                      }}
                    >
                      {class_.status === 'completed' ? 'Done' : 'Upcoming'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Exam Schedule */}
        <Card className="border-none" style={{ backgroundColor: '#96AAAA' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ color: '#F0F0F0' }}>
              <Trophy className="h-5 w-5" style={{ color: '#F0F0F0' }} />
              Upcoming Exams
            </CardTitle>
            <CardDescription style={{ color: '#F0F0F0' }}>Your exam schedule</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingExams.map((exam) => (
                <div key={exam.id} className="p-3 rounded-lg border-none shadow-sm" style={{ backgroundColor: '#F0F0F0' }}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium" style={{ color: '#192D3C' }}>{exam.subject}</p>
                      <Badge
                        variant="outline"
                        className="mt-1 border-none"
                        style={{
                          backgroundColor: '#192D3C',
                          color: '#F0F0F0'
                        }}
                      >
                        {exam.type}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-sm" style={{ color: '#96AAAA' }}>
                        {new Date(exam.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              <Button
                variant="outline"
                className="w-full mt-2 border-none"
                style={{
                  backgroundColor: '#192D3C',
                  color: '#F0F0F0'
                }}
                onClick={() => navigate('/student/examinations/exam-form')}
              >
                View All Exams
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Pending Assignments Detail */}
        <Card className="border-none" style={{ backgroundColor: '#96AAAA' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ color: '#F0F0F0' }}>
              <FileText className="h-5 w-5" style={{ color: '#F0F0F0' }} />
              Assignments
            </CardTitle>
            <CardDescription style={{ color: '#F0F0F0' }}>Due soon</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingAssignments.length === 0 ? (
                <p className="text-sm text-center py-4" style={{ color: '#F0F0F0' }}>
                  No pending assignments
                </p>
              ) : (
                pendingAssignments.slice(0, 5).map((assignment) => {
                  const daysUntilDue = Math.ceil((new Date(assignment.due_date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                  const isUrgent = daysUntilDue <= 3;

                  return (
                    <div key={assignment.id} className="p-3 rounded-lg border-none shadow-sm" style={{ backgroundColor: '#F0F0F0' }}>
                      <div className="flex items-start justify-between mb-2">
                        <p className="font-medium text-sm" style={{ color: '#192D3C' }}>{assignment.subject_name}</p>
                        <Badge
                          variant={isUrgent ? 'destructive' : 'default'}
                          style={{
                            backgroundColor: isUrgent ? '#dc2626' : '#192D3C',
                            color: '#F0F0F0'
                          }}
                        >
                          {daysUntilDue === 0 ? 'Today' : daysUntilDue === 1 ? 'Tomorrow' : `${daysUntilDue} days`}
                        </Badge>
                      </div>
                      <p className="text-sm mb-2" style={{ color: '#96AAAA' }}>{assignment.title}</p>
                      <div className="flex items-center gap-1 text-xs" style={{ color: '#96AAAA' }}>
                        <Clock className="h-3 w-3" />
                        Due: {new Date(assignment.due_date).toLocaleDateString()}
                      </div>
                    </div>
                  );
                })
              )}
              <Button
                variant="outline"
                className="w-full mt-2 border-none"
                style={{
                  backgroundColor: '#192D3C',
                  color: '#F0F0F0'
                }}
                onClick={() => navigate('/student/academics/assignments')}
              >
                View All Assignments
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
