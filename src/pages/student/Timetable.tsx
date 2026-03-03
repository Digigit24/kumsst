import { DROPDOWN_PAGE_SIZE } from '@/config/app.config';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTimetablesSWR, useLabSchedulesSWR } from '@/hooks/swr';
import { useAuth } from '@/hooks/useAuth';
import { useStudent } from '@/hooks/useStudents';
import { Calendar, Clock, Loader2, MapPin, User } from 'lucide-react';
import React, { useMemo } from 'react';

interface ClassSession {
  subject: string;
  code: string;
  teacher: string;
  room: string;
  type: 'Lecture' | 'Lab' | 'Tutorial';
  color: string;
}

interface TimeSlot {
  time: string;
  Monday?: ClassSession;
  Tuesday?: ClassSession;
  Wednesday?: ClassSession;
  Thursday?: ClassSession;
  Friday?: ClassSession;
  Saturday?: ClassSession;
}

export const Timetable: React.FC = () => {
  const { user } = useAuth();
  const studentId = user?.id ? Number(user.id) : null;

  // Fetch student details to get current class
  const { data: studentData, isLoading: studentLoading } = useStudent(studentId);

  // Fetch timetable for the student's class
  const classId = studentData?.current_class;
  const sectionId = studentData?.current_section;

  const { data: timetableData, isLoading: timetableLoading } = useTimetablesSWR({
    class_field: classId || undefined,
    section: sectionId || undefined,
    page_size: DROPDOWN_PAGE_SIZE,
  });

  const { data: labData, isLoading: labLoading } = useLabSchedulesSWR({
    section: sectionId || undefined,
    page_size: DROPDOWN_PAGE_SIZE,
  });

  const timetableRecords = timetableData?.results || [];
  const labRecords = labData?.results || [];

  // Helper function to assign colors based on session type
  const getSessionColor = (type: string): string => {
    switch (type) {
      case 'Lab':
        return 'bg-purple-100 border-purple-300 text-purple-900';
      case 'Lecture':
        return 'bg-blue-100 border-blue-300 text-blue-900';
      case 'Tutorial':
        return 'bg-yellow-100 border-yellow-300 text-yellow-900';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-900';
    }
  };

  // Transform API data to timetable slots
  const timetable: TimeSlot[] = useMemo(() => {
    const timeSlots: Record<string, TimeSlot> = {};
    const dayMap: Record<number, string> = {
      0: 'Monday',
      1: 'Tuesday',
      2: 'Wednesday',
      3: 'Thursday',
      4: 'Friday',
      5: 'Saturday',
      6: 'Sunday'
    };

    const processRecord = (record: any, isLab: boolean) => {
      // Extract time from time_slot string "Period X (Start - End)"
      // Example: "Period 7 (04:00:00 AM - 05:00:00 AM)"
      let time = "Unknown Time";

      if (record.start_time && record.end_time) {
        // Format simple start-end string
        const formatTime = (t: string) => {
          // Check if it's already in 12h format or needs simple truncation
          return t;
        }
        time = `${formatTime(record.start_time)} - ${formatTime(record.end_time)}`;
      } else if (record.time_slot) {
        const match = record.time_slot.match(/\((.*?)\)/);
        if (match && match[1]) {
          time = match[1];
        } else {
          time = record.time_slot;
        }
      }

      const dayIndex = record.day_of_week;
      // Handle both 0-indexed integer (backend) and potential string matches
      const dayName = typeof dayIndex === 'number' ? dayMap[dayIndex] : dayIndex;

      if (!timeSlots[time]) {
        timeSlots[time] = { time };
      }

      const session: ClassSession = {
        subject: record.subject_name || 'Class',
        code: record.subject_code || (isLab ? 'LAB' : ''),
        teacher: record.teacher_name || 'Staff',
        room: record.classroom_name || 'Room',
        type: isLab ? 'Lab' : 'Lecture',
        color: getSessionColor(isLab ? 'Lab' : 'Lecture'),
      };

      if (dayName && ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].includes(dayName)) {
        (timeSlots[time] as any)[dayName] = session;
      }
    };

    timetableRecords.forEach((r: any) => processRecord(r, false));
    labRecords.forEach((r: any) => processRecord(r, true));

    // Sort by time (simple string sort might work if format is consistent HH:MM AM/PM)
    // For better sorting, we might need to parse the start time.
    // For now, Object.values might be somewhat random, but usually insertion order preservation helps.
    // Let's rely on standard object iteration or sort keys if needed.
    return Object.values(timeSlots).sort((a, b) => {
      // Basic sort by start time string
      return a.time.localeCompare(b.time);
    });
  }, [timetableRecords, labRecords]);

  // Loading state
  if (studentLoading || timetableLoading || labLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Fallback mock data if no timetable exists
  const mockTimetable: TimeSlot[] = [
    {
      time: '08:00 AM - 09:00 AM',
      Monday: {
        subject: 'Mathematics',
        code: 'MATH101',
        teacher: 'Dr. Smith',
        room: 'Room 101',
        type: 'Lecture',
        color: 'bg-blue-100 border-blue-300 text-blue-900'
      },
      Wednesday: {
        subject: 'Mathematics',
        code: 'MATH101',
        teacher: 'Dr. Smith',
        room: 'Room 101',
        type: 'Lecture',
        color: 'bg-blue-100 border-blue-300 text-blue-900'
      },
      Friday: {
        subject: 'Mathematics',
        code: 'MATH101',
        teacher: 'Dr. Smith',
        room: 'Room 101',
        type: 'Lecture',
        color: 'bg-blue-100 border-blue-300 text-blue-900'
      }
    },
    {
      time: '09:00 AM - 10:00 AM',
      Tuesday: {
        subject: 'Physics',
        code: 'PHY101',
        teacher: 'Prof. Johnson',
        room: 'Lab 203',
        type: 'Lab',
        color: 'bg-purple-100 border-purple-300 text-purple-900'
      },
      Thursday: {
        subject: 'Physics',
        code: 'PHY101',
        teacher: 'Prof. Johnson',
        room: 'Lab 203',
        type: 'Lab',
        color: 'bg-purple-100 border-purple-300 text-purple-900'
      },
      Saturday: {
        subject: 'English',
        code: 'ENG101',
        teacher: 'Ms. Brown',
        room: 'Room 105',
        type: 'Tutorial',
        color: 'bg-yellow-100 border-yellow-300 text-yellow-900'
      }
    },
    {
      time: '10:00 AM - 11:00 AM',
      Monday: {
        subject: 'Computer Science',
        code: 'CS101',
        teacher: 'Mr. Davis',
        room: 'Computer Lab',
        type: 'Lab',
        color: 'bg-green-100 border-green-300 text-green-900'
      },
      Wednesday: {
        subject: 'Computer Science',
        code: 'CS101',
        teacher: 'Mr. Davis',
        room: 'Computer Lab',
        type: 'Lab',
        color: 'bg-green-100 border-green-300 text-green-900'
      },
      Friday: {
        subject: 'Computer Science',
        code: 'CS101',
        teacher: 'Mr. Davis',
        room: 'Computer Lab',
        type: 'Lab',
        color: 'bg-green-100 border-green-300 text-green-900'
      }
    },
    {
      time: '11:00 AM - 12:00 PM',
      Tuesday: {
        subject: 'Chemistry',
        code: 'CHEM101',
        teacher: 'Dr. Williams',
        room: 'Lab 204',
        type: 'Lecture',
        color: 'bg-red-100 border-red-300 text-red-900'
      },
      Thursday: {
        subject: 'Chemistry',
        code: 'CHEM101',
        teacher: 'Dr. Williams',
        room: 'Lab 204',
        type: 'Lecture',
        color: 'bg-red-100 border-red-300 text-red-900'
      }
    },
    {
      time: '12:00 PM - 01:00 PM',
      Monday: { subject: 'LUNCH BREAK', code: '', teacher: '', room: '', type: 'Lecture', color: 'bg-gray-100 border-gray-300 text-gray-600' },
      Tuesday: { subject: 'LUNCH BREAK', code: '', teacher: '', room: '', type: 'Lecture', color: 'bg-gray-100 border-gray-300 text-gray-600' },
      Wednesday: { subject: 'LUNCH BREAK', code: '', teacher: '', room: '', type: 'Lecture', color: 'bg-gray-100 border-gray-300 text-gray-600' },
      Thursday: { subject: 'LUNCH BREAK', code: '', teacher: '', room: '', type: 'Lecture', color: 'bg-gray-100 border-gray-300 text-gray-600' },
      Friday: { subject: 'LUNCH BREAK', code: '', teacher: '', room: '', type: 'Lecture', color: 'bg-gray-100 border-gray-300 text-gray-600' },
      Saturday: { subject: 'LUNCH BREAK', code: '', teacher: '', room: '', type: 'Lecture', color: 'bg-gray-100 border-gray-300 text-gray-600' }
    },
    {
      time: '01:00 PM - 02:00 PM',
      Monday: {
        subject: 'English',
        code: 'ENG101',
        teacher: 'Ms. Brown',
        room: 'Room 105',
        type: 'Lecture',
        color: 'bg-yellow-100 border-yellow-300 text-yellow-900'
      },
      Wednesday: {
        subject: 'English',
        code: 'ENG101',
        teacher: 'Ms. Brown',
        room: 'Room 105',
        type: 'Lecture',
        color: 'bg-yellow-100 border-yellow-300 text-yellow-900'
      },
      Friday: {
        subject: 'Biology',
        code: 'BIO101',
        teacher: 'Dr. Taylor',
        room: 'Lab 301',
        type: 'Lab',
        color: 'bg-teal-100 border-teal-300 text-teal-900'
      }
    },
    {
      time: '02:00 PM - 03:00 PM',
      Tuesday: {
        subject: 'History',
        code: 'HIST101',
        teacher: 'Prof. Anderson',
        room: 'Room 202',
        type: 'Lecture',
        color: 'bg-orange-100 border-orange-300 text-orange-900'
      },
      Thursday: {
        subject: 'History',
        code: 'HIST101',
        teacher: 'Prof. Anderson',
        room: 'Room 202',
        type: 'Lecture',
        color: 'bg-orange-100 border-orange-300 text-orange-900'
      },
      Saturday: {
        subject: 'Sports',
        code: 'PE101',
        teacher: 'Coach Wilson',
        room: 'Sports Ground',
        type: 'Tutorial',
        color: 'bg-pink-100 border-pink-300 text-pink-900'
      }
    },
    {
      time: '03:00 PM - 04:00 PM',
      Monday: {
        subject: 'Biology',
        code: 'BIO101',
        teacher: 'Dr. Taylor',
        room: 'Lab 301',
        type: 'Lab',
        color: 'bg-teal-100 border-teal-300 text-teal-900'
      },
      Wednesday: {
        subject: 'Biology',
        code: 'BIO101',
        teacher: 'Dr. Taylor',
        room: 'Lab 301',
        type: 'Lab',
        color: 'bg-teal-100 border-teal-300 text-teal-900'
      }
    }
  ];

  // Use real data if available, otherwise use mock data
  const displayTimetable = timetable.length > 0 ? timetable : mockTimetable;

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Get current day
  const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">My Timetable</h1>
        <p className="text-muted-foreground mt-2">
          Weekly class schedule - Academic Year 2024-2025
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Calendar className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">6</p>
              <p className="text-sm text-muted-foreground">Days per Week</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Clock className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">8</p>
              <p className="text-sm text-muted-foreground">Classes per Day</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <User className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">8</p>
              <p className="text-sm text-muted-foreground">Total Subjects</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <MapPin className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">12</p>
              <p className="text-sm text-muted-foreground">Different Rooms</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timetable Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Schedule</CardTitle>
          <CardDescription>Current week timetable</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border border-border bg-muted p-3 text-left font-semibold min-w-[120px]">
                    Time
                  </th>
                  {days.map((day) => (
                    <th
                      key={day}
                      className={`border border-border p-3 text-center font-semibold min-w-[180px] ${day === currentDay ? 'bg-primary/10 text-primary' : 'bg-muted'
                        }`}
                    >
                      {day}
                      {day === currentDay && (
                        <Badge variant="default" className="ml-2 text-xs">Today</Badge>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayTimetable.map((slot, index) => (
                  <tr key={index}>
                    <td className="border border-border bg-muted p-3 font-medium text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        {slot.time}
                      </div>
                    </td>
                    {days.map((day) => {
                      const session = slot[day as keyof TimeSlot] as ClassSession | undefined;
                      return (
                        <td key={day} className="border border-border p-2">
                          {session ? (
                            <div className={`${session.color} p-3 rounded-lg border-2 h-full min-h-[100px] flex flex-col justify-between`}>
                              <div>
                                <p className="font-semibold text-sm mb-1">{session.subject}</p>
                                {session.code && (
                                  <Badge variant="outline" className="mb-2 text-xs">
                                    {session.code}
                                  </Badge>
                                )}
                              </div>
                              {session.teacher && (
                                <div className="space-y-1 text-xs">
                                  <div className="flex items-center gap-1">
                                    <User className="h-3 w-3" />
                                    <span>{session.teacher}</span>
                                  </div>
                                  {session.room && (
                                    <div className="flex items-center gap-1">
                                      <MapPin className="h-3 w-3" />
                                      <span>{session.room}</span>
                                    </div>
                                  )}
                                  <Badge variant="secondary" className="text-xs">
                                    {session.type}
                                  </Badge>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="h-full min-h-[100px]"></div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Session Types */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Session Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-blue-100 border-2 border-blue-300"></div>
              <span className="text-sm font-medium">Class Session</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-purple-100 border-2 border-purple-300"></div>
              <span className="text-sm font-medium">Lab Session</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-yellow-100 border-2 border-yellow-300"></div>
              <span className="text-sm font-medium">Tutorial / Other</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
