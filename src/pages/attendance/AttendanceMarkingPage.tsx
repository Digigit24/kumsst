import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Check,
  X,
  QrCode,
  Save,
  Users,
  UserCheck,
  UserX,
  Percent,
  ChevronLeft,
  Search,
  Filter,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  createAttendanceSession,
  getStudentsByClassSession,
  mockClassSessions,
  type StudentForAttendance,
  type AttendanceSession,
} from '@/data/attendanceMarkingMockData';

export const AttendanceMarkingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get('session');

  const [attendanceSession, setAttendanceSession] = useState<AttendanceSession | null>(null);
  const [students, setStudents] = useState<StudentForAttendance[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'present' | 'absent' | 'unmarked'>('all');

  useEffect(() => {
    if (sessionId) {
      const session = createAttendanceSession(sessionId);
      if (session) {
        setAttendanceSession(session);
        setStudents(session.students);
      }
    }
  }, [sessionId]);

  const handleMarkAttendance = (studentId: number, status: 'present' | 'absent') => {
    setStudents((prev) =>
      prev.map((student) =>
        student.id === studentId ? { ...student, attendance_status: status } : student
      )
    );
  };

  const handleMarkAllPresent = () => {
    setStudents((prev) => prev.map((student) => ({ ...student, attendance_status: 'present' })));
  };

  const handleMarkAllAbsent = () => {
    setStudents((prev) => prev.map((student) => ({ ...student, attendance_status: 'absent' })));
  };

  const handleSaveAttendance = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      // Show success message
      toast.success('Attendance saved successfully!');
      navigate('/dashboard');
    }, 1000);
  };

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.roll_number.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      filterStatus === 'all' ||
      (filterStatus === 'present' && student.attendance_status === 'present') ||
      (filterStatus === 'absent' && student.attendance_status === 'absent') ||
      (filterStatus === 'unmarked' && !student.attendance_status);

    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: students.length,
    present: students.filter((s) => s.attendance_status === 'present').length,
    absent: students.filter((s) => s.attendance_status === 'absent').length,
    unmarked: students.filter((s) => !s.attendance_status).length,
    percentage: '0',
  };

  stats.percentage = stats.total > 0 ? ((stats.present / stats.total) * 100).toFixed(2) : '0';

  if (!attendanceSession) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Session not found</h2>
          <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Take Attendance</h1>
            <p className="text-muted-foreground mt-1">
              {attendanceSession.class_session.subject} - {attendanceSession.class_session.class} -{' '}
              {attendanceSession.class_session.time}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowQRDialog(true)}>
            <QrCode className="h-4 w-4 mr-2" />
            Show QR Code
          </Button>
          <Button onClick={handleSaveAttendance} disabled={isSaving || stats.unmarked > 0}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Attendance'}
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Students in this class</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Present</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.present}</div>
            <p className="text-xs text-muted-foreground">Students marked present</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Absent</CardTitle>
            <UserX className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.absent}</div>
            <p className="text-xs text-muted-foreground">Students marked absent</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance %</CardTitle>
            <Percent className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.percentage}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.unmarked > 0 ? `${stats.unmarked} unmarked` : 'All marked'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Actions and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or roll number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('all')}
              >
                All ({students.length})
              </Button>
              <Button
                variant={filterStatus === 'present' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('present')}
              >
                Present ({stats.present})
              </Button>
              <Button
                variant={filterStatus === 'absent' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('absent')}
              >
                Absent ({stats.absent})
              </Button>
              <Button
                variant={filterStatus === 'unmarked' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('unmarked')}
              >
                Unmarked ({stats.unmarked})
              </Button>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button variant="outline" size="sm" onClick={handleMarkAllPresent}>
              <Check className="h-4 w-4 mr-2" />
              Mark All Present
            </Button>
            <Button variant="outline" size="sm" onClick={handleMarkAllAbsent}>
              <X className="h-4 w-4 mr-2" />
              Mark All Absent
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Students List */}
      <Card>
        <CardHeader>
          <CardTitle>Students ({filteredStudents.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filteredStudents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No students found matching your criteria
              </div>
            ) : (
              filteredStudents.map((student) => (
                <div
                  key={student.id}
                  className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                    student.attendance_status === 'present'
                      ? 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900'
                      : student.attendance_status === 'absent'
                      ? 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900'
                      : 'bg-muted/50 border-muted'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center">
                      <Badge variant="outline" className="font-mono">
                        {student.roll_number}
                      </Badge>
                    </div>
                    <div>
                      <div className="font-medium">{student.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {student.class_name} - Section {student.section_name}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={student.attendance_status === 'present' ? 'default' : 'outline'}
                      onClick={() => handleMarkAttendance(student.id, 'present')}
                      className={
                        student.attendance_status === 'present'
                          ? 'bg-green-600 hover:bg-green-700'
                          : ''
                      }
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Present
                    </Button>
                    <Button
                      size="sm"
                      variant={student.attendance_status === 'absent' ? 'default' : 'outline'}
                      onClick={() => handleMarkAttendance(student.id, 'absent')}
                      className={
                        student.attendance_status === 'absent'
                          ? 'bg-red-600 hover:bg-red-700'
                          : ''
                      }
                    >
                      <X className="h-4 w-4 mr-1" />
                      Absent
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* QR Code Dialog */}
      <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>QR Code for Attendance</DialogTitle>
            <DialogDescription>
              Students can scan this QR code to mark their attendance
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-6">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="w-64 h-64 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center rounded-lg">
                <QrCode className="h-48 w-48 text-gray-700" />
              </div>
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm font-medium">QR Code: {attendanceSession.qr_code}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Expires at: {new Date(attendanceSession.qr_code_expiry || '').toLocaleTimeString()}
              </p>
            </div>
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                Note: Students need to scan this QR code using the student app to mark their
                attendance automatically.
              </p>
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => setShowQRDialog(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AttendanceMarkingPage;
