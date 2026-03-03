/**
 * Attendance Notifications Page
 */

import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

const AttendanceNotificationsPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Attendance Notifications</h1>
        <p className="text-muted-foreground">Send attendance notifications to parents/guardians</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Attendance Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <p>Attendance notification functionality will be available soon</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendanceNotificationsPage;
