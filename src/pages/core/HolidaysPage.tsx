'use client';

/**
 * Holidays Page - Calendar-first management (create/update/delete)
 */

import { Button } from '@/components/ui/button';
import {
  CalendarBody,
  CalendarDate,
  CalendarDatePagination,
  CalendarDatePicker,
  CalendarHeader,
  CalendarItem,
  CalendarMonthPicker,
  CalendarProvider,
  CalendarYearPicker,
} from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarClock, Flag, Gift, GraduationCap, Plus, RefreshCw } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '../../components/ui/badge';
import { Card } from '../../components/ui/card';
import { useAuth } from '../../hooks/useAuth';
import { DROPDOWN_PAGE_SIZE } from '../../config/app.config';
import { useCreateHoliday, useDeleteHoliday, useUpdateHoliday } from '../../hooks/useCore';
import { holidayApi } from '../../services/core.service';
import { HolidayForm } from './components/HolidayForm';

const HolidaysPage = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [formOpen, setFormOpen] = useState(false);
  const [prefillDate, setPrefillDate] = useState<Date | null>(null);
  const [loadingDate, setLoadingDate] = useState<Date | null>(null);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['holidays'],
    queryFn: () => holidayApi.list({ page_size: DROPDOWN_PAGE_SIZE }),
  });

  const { data: selected } = useQuery({
    queryKey: ['holiday', selectedId],
    queryFn: () => (selectedId ? holidayApi.get(selectedId) : null),
    enabled: !!selectedId,
  });

  const createMutation = useCreateHoliday();
  const updateMutation = useUpdateHoliday();
  const deleteMutation = useDeleteHoliday();
  const holidays = data?.results || [];

  const stats = useMemo(() => {
    const byType: Record<string, number> = {};
    holidays.forEach((h: any) => {
      byType[h.holiday_type] = (byType[h.holiday_type] || 0) + 1;
    });
    return byType;
  }, [holidays]);

  const holidayStatuses: Record<string, { id: string; name: string; color: string; icon: any }> = {
    national: { id: 'national', name: 'National', color: '#ef4444', icon: Flag },
    festival: { id: 'festival', name: 'Festival', color: '#f59e0b', icon: Gift },
    college: { id: 'college', name: 'College', color: '#3b82f6', icon: GraduationCap },
    exam: { id: 'exam', name: 'Exam', color: '#22c55e', icon: CalendarClock },
  };

  const calendarFeatures =
    holidays.map((h: any) => ({
      id: String(h.id),
      name: h.name,
      startAt: new Date(h.date),
      endAt: new Date(h.date),
      status: holidayStatuses[h.holiday_type] || { id: 'other', name: 'Holiday', color: '#6b7280' },
      description: h.description ? String(h.description) : undefined,
    })) || [];

  const handleSubmit = async (formData: any) => {
    if (formMode === 'create') {
      await createMutation.mutate(formData);
    } else if (selected) {
      await updateMutation.mutate({ id: selected.id, data: formData });
    }
    // queryClient.invalidateQueries({ queryKey: ['holidays'] }); // Moved to onSuccess to coordinate with loading spinner
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutate(id);
      toast.success('Holiday deleted successfully');
      refetch();
      setFormOpen(false);
      setSelectedId(null);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete holiday');
    }
  };

  const openCreate = (date?: Date) => {
    setSelectedId(null);
    setFormMode('create');
    setPrefillDate(date || null);
    setFormOpen(true);
  };

  const openEdit = (holidayId: number) => {
    setSelectedId(holidayId);
    setFormMode('edit');
    setFormOpen(true);
  };

  const toInputDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      <Card className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">Holiday Calendar</h2>
            <p className="text-sm text-muted-foreground">Click a date to create, or a holiday to edit</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(stats).map(([type, count]) => {
              const status = holidayStatuses[type] || { icon: CalendarClock, color: '#6b7280' };
              const Icon = status.icon;
              return (
                <Badge
                  key={type}
                  className="flex items-center gap-1"
                  style={{ backgroundColor: status.color + '20', color: status.color }}
                >
                  <Icon className="h-4 w-4" />
                  {type} {count}
                </Badge>
              );
            })}
          </div>
          <div className="ml-auto flex items-center gap-3">

            <Button onClick={() => openCreate()} size="sm" className="gap-2">
              <Plus className="h-4 w-4" /> Add Holiday
            </Button>
          </div>
        </div>

        <div className="mt-4 border rounded-lg overflow-x-auto">
          <TooltipProvider>
            <CalendarProvider className="min-w-[800px]">
              <CalendarDate className="border-b">
                <CalendarDatePicker>
                  <CalendarMonthPicker />
                  <CalendarYearPicker start={2020} end={2035} />
                </CalendarDatePicker>
                <CalendarDatePagination />
              </CalendarDate>
              <CalendarHeader className="border-b" />
              <CalendarBody
                features={calendarFeatures}
                onDayClick={(date) => openCreate(date)}
                onFeatureClick={(feature) => openEdit(Number(feature.id))}
                loadingDates={loadingDate ? [loadingDate] : []}
              >
                {({ feature }) => {
                  if (!feature.description) {
                    return (
                      <CalendarItem
                        key={feature.id}
                        feature={feature}
                        className="text-sm font-semibold hover:underline cursor-pointer px-2 py-1 rounded-md"
                        style={{ backgroundColor: feature.status.color + '30', color: feature.status.color }}
                      />
                    );
                  }

                  return (
                    <Tooltip key={feature.id}>
                      <TooltipTrigger asChild>
                        <div className="w-full">
                          <CalendarItem
                            feature={feature}
                            className="text-sm font-semibold hover:underline cursor-pointer px-2 py-1 rounded-md"
                            style={{ backgroundColor: feature.status.color + '30', color: feature.status.color }}
                          />
                          <p className="text-[10px] text-muted-foreground truncate px-1 mt-0.5 ml-1">
                            {feature.description}
                          </p>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">{feature.description}</p>
                      </TooltipContent>
                    </Tooltip>
                  );
                }}
              </CalendarBody>
            </CalendarProvider>
          </TooltipProvider>
        </div>
      </Card>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-lg max-w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{formMode === 'create' ? 'Add Holiday' : 'Edit Holiday'}</DialogTitle>
          </DialogHeader>
          <HolidayForm
            mode={formMode}
            holiday={formMode === 'edit' ? selected : undefined}
            initialValues={prefillDate ? { date: toInputDate(prefillDate) } : undefined}
            onSuccess={(formData) => {
              if (formData?.date) {
                setLoadingDate(new Date(formData.date));
              }
              setFormOpen(false);
              setSelectedId(null);

              Promise.all([
                queryClient.invalidateQueries({ queryKey: ['holidays'] }),
                refetch()
              ]).finally(() => {
                setLoadingDate(null);
              });
            }}
            onCancel={() => {
              setFormOpen(false);
              setSelectedId(null);
            }}
            onSubmit={handleSubmit}
            onDelete={
              formMode === 'edit' && selected
                ? () => handleDelete(selected.id)
                : undefined
            }
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HolidaysPage;
