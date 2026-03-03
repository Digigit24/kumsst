import React from 'react';
import { Calendar, FileText, CheckCircle2, AlertCircle, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export const ExamForm: React.FC = () => {
  // Mock data - Replace with actual API calls
  const upcomingExams = [
    {
      id: 1,
      name: 'Mid-term Examination',
      type: 'Mid-term',
      startDate: '2026-01-05',
      endDate: '2026-01-15',
      registrationDeadline: '2025-12-30',
      fee: 500,
      status: 'registration-open',
      registered: false,
    },
    {
      id: 2,
      name: 'Final Examination',
      type: 'Final',
      startDate: '2026-03-01',
      endDate: '2026-03-15',
      registrationDeadline: '2026-02-20',
      fee: 750,
      status: 'upcoming',
      registered: false,
    },
  ];

  const registeredExams = [
    {
      id: 3,
      name: 'Unit Test 1',
      type: 'Unit Test',
      startDate: '2025-12-10',
      endDate: '2025-12-15',
      registrationDate: '2025-11-25',
      admitCardAvailable: true,
    },
  ];

  const examSchedule = [
    { date: '2026-01-05', subject: 'Mathematics', time: '09:00 AM - 12:00 PM', room: 'Hall A' },
    { date: '2026-01-08', subject: 'Physics', time: '09:00 AM - 12:00 PM', room: 'Hall B' },
    { date: '2026-01-10', subject: 'Chemistry', time: '09:00 AM - 12:00 PM', room: 'Hall A' },
    { date: '2026-01-12', subject: 'English', time: '09:00 AM - 12:00 PM', room: 'Hall C' },
    { date: '2026-01-15', subject: 'Computer Science', time: '09:00 AM - 12:00 PM', room: 'Computer Lab' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Exam Registration</h1>
        <p className="text-muted-foreground mt-2">
          Register for upcoming examinations and download admit cards
        </p>
      </div>

      {/* Registration Open */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Registration Open</h2>
        <div className="space-y-4">
          {upcomingExams
            .filter(exam => exam.status === 'registration-open')
            .map((exam) => (
              <Card key={exam.id} className="border-l-4 border-l-blue-500">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle>{exam.name}</CardTitle>
                      <CardDescription>
                        {new Date(exam.startDate).toLocaleDateString()} - {new Date(exam.endDate).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <Badge variant="default">Registration Open</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Exam Type</p>
                      <p className="font-medium">{exam.type}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Registration Fee</p>
                      <p className="font-medium">₹{exam.fee}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Deadline</p>
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-destructive" />
                        <p className="font-medium text-destructive">
                          {new Date(exam.registrationDeadline).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button className="flex-1">
                      <FileText className="h-4 w-4 mr-2" />
                      Register Now
                    </Button>
                    <Button variant="outline">View Details</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>

      {/* Registered Exams */}
      <div>
        <h2 className="text-xl font-semibold mb-4">My Registered Exams</h2>
        <div className="space-y-4">
          {registeredExams.map((exam) => (
            <Card key={exam.id} className="border-l-4 border-l-green-500">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle>{exam.name}</CardTitle>
                    <CardDescription>
                      {new Date(exam.startDate).toLocaleDateString()} - {new Date(exam.endDate).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <Badge variant="success">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Registered
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Exam Type</p>
                    <p className="font-medium">{exam.type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Registration Date</p>
                    <p className="font-medium">{new Date(exam.registrationDate).toLocaleDateString()}</p>
                  </div>
                </div>
                {exam.admitCardAvailable && (
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download Admit Card
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Exam Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Exam Schedule - Mid-term Examination
          </CardTitle>
          <CardDescription>Your examination timetable</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {examSchedule.map((schedule, index) => (
              <div key={index} className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-primary/10">
                    <p className="text-xs text-muted-foreground">
                      {new Date(schedule.date).toLocaleDateString('en-US', { month: 'short' })}
                    </p>
                    <p className="text-2xl font-bold">
                      {new Date(schedule.date).getDate()}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-lg">{schedule.subject}</p>
                    <p className="text-sm text-muted-foreground">{schedule.time}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="outline">{schedule.room}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Exams */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Upcoming Exams</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {upcomingExams
            .filter(exam => exam.status === 'upcoming')
            .map((exam) => (
              <Card key={exam.id}>
                <CardHeader>
                  <CardTitle>{exam.name}</CardTitle>
                  <CardDescription>
                    {new Date(exam.startDate).toLocaleDateString()} - {new Date(exam.endDate).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Type</span>
                      <Badge variant="outline">{exam.type}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Fee</span>
                      <span className="font-medium">₹{exam.fee}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Registration Opens</span>
                      <span className="font-medium">
                        {new Date(exam.registrationDeadline).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>
    </div>
  );
};
