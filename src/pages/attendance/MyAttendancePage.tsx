/**
 * My Attendance Page - Student Portal
 * Allows students to view their attendance history
 */

import React from 'react';
import { Calendar, TrendingUp } from 'lucide-react';
import { AttendanceCalendar } from '@/components/attendance/AttendanceCalendar';

export const MyAttendancePage: React.FC = () => {
  // Get student ID from auth context or localStorage
  const getStudentId = () => {
    try {
      const user = JSON.parse(localStorage.getItem('kumss_user') || '{}');
      return user.id;
    } catch {
      return 1; // Fallback for demo
    }
  };

  const studentId = getStudentId();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Calendar className="h-8 w-8" />
          My Attendance
        </h1>
        <p className="text-muted-foreground mt-2">
          Track your attendance records and view your attendance percentage
        </p>
      </div>

      {/* Attendance Calendar */}
      <AttendanceCalendar
        studentId={studentId}
        showStats={true}
        showLegend={true}
      />
    </div>
  );
};

export default MyAttendancePage;
