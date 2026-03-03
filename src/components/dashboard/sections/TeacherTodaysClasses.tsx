import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTeacherSchedule } from '@/hooks/useTeachers';
import { TeacherScheduleItem } from '@/types/academic.types';
import {
  CalendarClock,
  CheckCircle2,
  Clock,
  MapPin,
  MoreHorizontal,
  Users,
  CalendarDays
} from 'lucide-react';
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export const TeacherTodaysClasses: React.FC = () => {
  const navigate = useNavigate();
  const { data: scheduleData, isLoading } = useTeacherSchedule();

  const todaysClasses = useMemo(() => {
    if (!scheduleData?.schedule) return [];

    const today = new Date().getDay();
    // Convert JS day (0=Sun, 1=Mon...6=Sat) to Backend day (0=Mon, 1=Tue...6=Sun)
    const backendDay = today === 0 ? 6 : today - 1;

    const toMinutes = (timeStr: string) => {
      // Extract first time from range
      const firstTime = timeStr.split('-')[0].trim();

      // Handle 12-hour format with AM/PM
      if (firstTime.includes('AM') || firstTime.includes('PM')) {
        const isPM = firstTime.includes('PM');
        const cleanTime = firstTime.replace(/\s*(AM|PM)\s*/i, '').trim();
        const [h, m] = cleanTime.split(':').map(Number);
        let hours = h || 0;

        if (isPM && hours !== 12) hours += 12;
        if (!isPM && hours === 12) hours = 0;

        return hours * 60 + (m || 0);
      }

      // Handle 24-hour format
      const [h, m] = firstTime.split(':').map(Number);
      return (h || 0) * 60 + (m || 0);
    };

    return scheduleData.schedule
      .filter((item: TeacherScheduleItem) => item.day_of_week === backendDay)
      .map((item) => {
        let timeDisplay = 'N/A';
        let sessionType = 'Lecture';
        let startTimeForSort = '';

        if (item.time_slot) {
          // Timetable entry
          const timeMatch = item.time_slot.match(/\((.*?)\)/);
          if (timeMatch && timeMatch[1]) {
            timeDisplay = timeMatch[1];
          } else {
            timeDisplay = item.time_slot;
          }
          sessionType = 'Lecture';
          startTimeForSort = timeDisplay;
        } else if (item.start_time && item.end_time) {
          // Lab entry
          timeDisplay = `${item.start_time} - ${item.end_time}`;
          sessionType = 'Lab';
          startTimeForSort = item.start_time;
        } else if (item.start_time) {
          timeDisplay = item.start_time;
          startTimeForSort = item.start_time;
        }

        return {
          ...item,
          timeDisplay,
          sessionType,
          startMinutes: toMinutes(startTimeForSort)
        };
      })
      .sort((a, b) => a.startMinutes - b.startMinutes);
  }, [scheduleData]);

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  const getStatus = (timeRangeStr: string) => {
    if (!timeRangeStr || timeRangeStr === 'N/A') return 'upcoming';

    // Parse start and end times from range "10:00 AM - 11:00 AM" or similar
    // This is a simplified check
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    // Helper to parse single time string to minutes
    const parseToMinutes = (t: string) => {
      const cleanT = t.trim();
      const isPM = cleanT.toUpperCase().includes('PM');
      const isAM = cleanT.toUpperCase().includes('AM');
      const timePart = cleanT.replace(/(AM|PM)/i, '').trim();
      const [h, m] = timePart.split(':').map(Number);
      let hours = h;
      if (isPM && hours !== 12) hours += 12;
      if (isAM && hours === 12) hours = 0;
      return hours * 60 + (m || 0);
    };

    try {
      const parts = timeRangeStr.split('-');
      if (parts.length >= 1) {
        const startMin = parseToMinutes(parts[0]);
        // If end time exists, use it, else assume 45 mins
        const endMin = parts.length > 1 ? parseToMinutes(parts[1]) : startMin + 45;

        if (currentMinutes > endMin) return 'completed';
        if (currentMinutes >= startMin && currentMinutes <= endMin) return 'current';
      }
    } catch (e) {
      console.warn('Error parsing time for status', e);
    }

    return 'upcoming';
  };

  if (isLoading) {
    return (
      <Card className="h-full border-none shadow-md bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
        <CardHeader>
          <div className="h-6 w-1/3 bg-muted rounded animate-pulse" />
          <div className="h-4 w-1/4 bg-muted rounded animate-pulse mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4">
              <div className="w-16 h-16 bg-muted rounded-lg animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
                <div className="h-4 w-1/2 bg-muted rounded animate-pulse" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full border-none shadow-md bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm overflow-hidden">
      <CardHeader className="pb-4 border-b border-border/40">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-lg">
              <CalendarDays className="h-5 w-5 text-primary" />
              Today's Schedule
            </CardTitle>
            <p className="text-sm text-muted-foreground font-medium pl-7">
              {currentDate}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-primary"
            onClick={() => navigate('/teachers/schedule')}
          >
            View Full Timetable
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {todaysClasses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="bg-primary/10 p-4 rounded-full mb-4">
              <CalendarClock className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-1">No Classes Today</h3>
            <p className="text-muted-foreground text-sm max-w-[250px]">
              You don't have any classes scheduled for today. Enjoy your day!
            </p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-[4.5rem] top-6 bottom-6 w-0.5 bg-border/60 hidden sm:block" />

            <div className="space-y-0 divide-y divide-border/30">
              {todaysClasses.map((cls, index) => {
                const status = getStatus(cls.timeDisplay);
                const isCurrent = status === 'current';

                return (
                  <motion.div
                    key={cls.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`relative p-4 sm:pl-24 transition-colors hover:bg-muted/30 ${isCurrent ? 'bg-primary/5' : ''
                      }`}
                  >
                    {/* Time Column (Desktop) */}
                    <div className="absolute left-4 top-5 w-12 text-right hidden sm:block">
                      <span className={`text-sm font-bold ${isCurrent ? 'text-primary' : 'text-foreground'}`}>
                        {cls.timeDisplay.split('-')[0].trim().substring(0, 5)}
                      </span>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {status === 'completed' ? 'Ended' : status === 'current' ? 'Now' : ''}
                      </p>
                    </div>

                    {/* Timeline Dot */}
                    <div className={`absolute left-[4.2rem] top-6 w-3 h-3 rounded-full border-2 z-10 hidden sm:block ${status === 'completed'
                      ? 'bg-muted-foreground border-muted-foreground'
                      : isCurrent
                        ? 'bg-primary border-primary ring-4 ring-primary/20'
                        : 'bg-background border-primary'
                      }`} />

                    {/* Mobile Time Header */}
                    <div className="flex items-center justify-between sm:hidden mb-2">
                      <span className={`text-sm font-bold ${isCurrent ? 'text-primary' : 'text-foreground'}`}>
                        {cls.timeDisplay}
                      </span>
                      <Badge variant={isCurrent ? 'default' : 'secondary'} className="text-[10px] py-0 h-5">
                        {status.toUpperCase()}
                      </Badge>
                    </div>

                    {/* Card Content */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <h4 className={`font-bold text-base ${status === 'completed' ? 'text-muted-foreground line-through decoration-auto' : ''}`}>
                            {cls.subject_name}
                          </h4>
                          <Badge variant="outline" className="text-[10px] h-5">
                            {cls.sessionType}
                          </Badge>
                          {isCurrent && (
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Users className="h-3.5 w-3.5" />
                            <span>{cls.section_name} {cls.batch_name ? `- ${cls.batch_name}` : ''}</span>
                          </div>
                          {cls.classroom_name && (
                            <div className="flex items-center gap-1.5">
                              <MapPin className="h-3.5 w-3.5" />
                              <span>{cls.classroom_name}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {status !== 'upcoming' && (
                          <Button
                            size="sm"
                            className={`${isCurrent ? 'bg-primary' : 'bg-transparent border border-border text-foreground hover:bg-muted'}`}
                            variant={isCurrent ? 'default' : 'outline'}
                            onClick={() => navigate('/attendance/students', {
                              state: {
                                classId: cls.class_obj,
                                sectionId: cls.section
                              }
                            })}
                          >
                            {status === 'completed' ? 'View Attendance' : 'Mark Attendance'}
                          </Button>
                        )}
                        {status === 'upcoming' && (
                          <div className="text-xs font-medium text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-md">
                            {cls.timeDisplay}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
