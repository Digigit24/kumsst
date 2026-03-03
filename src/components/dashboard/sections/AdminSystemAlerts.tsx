import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const AdminSystemAlerts: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          System Alerts
        </CardTitle>
        <CardDescription>Recent system notifications</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
          <CheckCircle2 className="h-10 w-10 mb-2 text-green-500" />
          <p className="font-medium">System is healthy</p>
          <p className="text-xs">No active alerts</p>
        </div>
        <Button variant="outline" className="w-full mt-4" onClick={() => navigate('/core/activity-logs')}>
          View All Logs
        </Button>
      </CardContent>
    </Card>
  );
};
