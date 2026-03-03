import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useActivityLogs } from '@/hooks/useCore';

export const AdminRecentActivities: React.FC = () => {
  const navigate = useNavigate();
  const { data: logsData, isLoading } = useActivityLogs({ page_size: 5, ordering: '-timestamp' });
  const logs = logsData?.results || [];

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });
  };

  return (
    <Card className="lg:col-span-1">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Recent Activity
        </CardTitle>
        <CardDescription>Latest actions in the system</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-sm text-muted-foreground text-center py-4">Loading activities...</div>
          ) : logs.length > 0 ? (
            logs.map((log) => (
              <div key={log.id} className="flex items-start gap-3 pb-3 border-b last:border-0 last:pb-0">
                <div className="bg-primary/10 p-2 rounded-full mt-0.5">
                  <Clock className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {log.description}
                  </p>
                  <div className="flex items-center text-xs text-muted-foreground gap-2">
                    <span>{log.user_name || 'System'}</span>
                    <span>•</span>
                    <span>{formatTime(log.timestamp)}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-sm text-muted-foreground text-center py-4">No recent activity</div>
          )}

          <Button variant="outline" className="w-full mt-2" onClick={() => navigate('/core/activity-logs')}>
            View All Activity
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
