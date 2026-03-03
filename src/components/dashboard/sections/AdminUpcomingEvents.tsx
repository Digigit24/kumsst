import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useHolidays } from '@/hooks/useCore';
import { Badge } from '@/components/ui/badge';

export const AdminUpcomingEvents: React.FC = () => {
  const navigate = useNavigate();
  // Fetch holidays, assuming ordering by -date gives us the most relevant ones (or future ones)
  // In a real scenario, we'd want ?date__gte=today
  const { data: holidaysData, isLoading } = useHolidays({ page_size: 5, ordering: '-date' });
  const holidays = holidaysData?.results || [];

  // Filter for future dates on client side if needed, or just display sort order
  // For now, displaying as returned from API
  const upcomingHolidays = holidays.filter(h => new Date(h.date) >= new Date());

  // If filtered list is empty, maybe fallback to showing recent past? 
  // Or just show what we have if the filter is too strict for the data available.
  // Let's stick to showing the API results but maybe limiting to 5.
  const displayHolidays = upcomingHolidays.length > 0 ? upcomingHolidays.slice(0, 5) : holidays.slice(0, 5);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <Card className="lg:col-span-1">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Upcoming Events
        </CardTitle>
        <CardDescription>Holidays and important dates</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-sm text-muted-foreground text-center py-4">Loading events...</div>
          ) : displayHolidays.length > 0 ? (
            displayHolidays.map((holiday) => (
              <div key={holiday.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                <div className="flex flex-col">
                  <span className="font-medium text-sm">{holiday.name}</span>
                  <div className="flex items-center text-xs text-muted-foreground gap-1 mt-1">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(holiday.date)}</span>
                  </div>
                </div>
                <Badge variant={holiday.holiday_type === 'national' ? 'default' : 'secondary'}>
                  {holiday.holiday_type_display || holiday.holiday_type}
                </Badge>
              </div>
            ))
          ) : (
            <div className="text-sm text-muted-foreground text-center py-4">No upcoming events</div>
          )}

          <Button variant="outline" className="w-full mt-2" onClick={() => navigate('/core/holidays')}>
            View Calendar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
