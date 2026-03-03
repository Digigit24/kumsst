/**
 * Attendance Tab Component
 * Displays student attendance in the student detail page
 */

import React from 'react';
import { AttendanceCalendar } from '../../../components/attendance/AttendanceCalendar';

interface AttendanceTabProps {
  studentId: number;
}

export const AttendanceTab: React.FC<AttendanceTabProps> = ({ studentId }) => {
  return (
    <div className="space-y-4">
      <AttendanceCalendar
        studentId={studentId}
        showStats={true}
        showLegend={true}
      />
    </div>
  );
};

export default AttendanceTab;
