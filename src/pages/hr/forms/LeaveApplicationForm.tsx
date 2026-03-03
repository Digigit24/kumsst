/**
 * Leave Application Form — Premium Version
 * - Auto-calculates total days from date range
 * - Shows live leave balance preview for selected teacher + type
 * - Status is always "pending" on create (removed from form)
 * - Rich, guided UX with contextual hints
 */

import { AlertCircle, CalendarDays, CheckCircle2, Clock, Info, User } from 'lucide-react';
import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { useLeaveBalances, useLeaveTypes, useTeachers } from '../../../hooks/useHR';
import { cn } from '../../../lib/utils';

interface LeaveApplicationFormProps {
  item: any | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

// Calculate working days between two dates (Mon–Sat, excludes Sundays)
const calcWorkingDays = (from: string, to: string): number => {
  if (!from || !to) return 0;
  const start = new Date(from);
  const end = new Date(to);
  if (end < start) return 0;
  let count = 0;
  const cur = new Date(start);
  while (cur <= end) {
    const day = cur.getDay();
    if (day !== 0) count++; // exclude Sunday
    cur.setDate(cur.getDate() + 1);
  }
  return count;
};

export const LeaveApplicationForm = ({ item, onSubmit, onCancel }: LeaveApplicationFormProps) => {
  const { data: leaveTypesData } = useLeaveTypes({ is_active: true });
  const { data: teachersData } = useTeachers({ is_active: true });

  const leaveTypes = leaveTypesData?.results || [];
  const teachers = teachersData?.results || [];

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: item
      ? {
        leave_type: String(item.leave_type || ''),
        teacher: String(item.teacher || ''),
        from_date: item.from_date || '',
        to_date: item.to_date || '',
        total_days: item.total_days || 0,
        reason: item.reason || '',
      }
      : {
        leave_type: '',
        teacher: '',
        from_date: '',
        to_date: '',
        total_days: 0,
        reason: '',
      },
  });

  // Watch fields for live computation
  const fromDate = useWatch({ control, name: 'from_date' });
  const toDate = useWatch({ control, name: 'to_date' });
  const selectedTeacher = useWatch({ control, name: 'teacher' });
  const selectedLeaveType = useWatch({ control, name: 'leave_type' });

  // Auto-calculate total days
  useEffect(() => {
    if (fromDate && toDate) {
      const days = calcWorkingDays(fromDate, toDate);
      setValue('total_days', days);
    }
  }, [fromDate, toDate, setValue]);

  // Fetch balance for selected teacher + leave type
  const { data: balancesData } = useLeaveBalances(
    selectedTeacher && selectedLeaveType
      ? { teacher: selectedTeacher, leave_type: selectedLeaveType, page_size: 5 }
      : undefined
  );
  const balance = balancesData?.results?.[0] || null;

  // Computed days
  const computedDays = fromDate && toDate ? calcWorkingDays(fromDate, toDate) : 0;
  const exceedsBalance = balance && computedDays > balance.balance_days;

  // Selected leave type info
  const leaveTypeInfo = leaveTypes.find((t: any) => String(t.id) === String(selectedLeaveType));

  const handleFormSubmit = (data: any) => {
    const cleaned: any = {
      ...data,
      leave_type: parseInt(data.leave_type),
      teacher: parseInt(data.teacher),
      total_days: computedDays || parseInt(data.total_days),
      status: 'pending', // always pending on create
    };
    // Remove empty attachment
    if (!cleaned.attachment || cleaned.attachment.trim() === '') {
      delete cleaned.attachment;
    }
    onSubmit(cleaned);
  };

  const selectClass =
    'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">

      {/* Teacher */}
      <div className="space-y-2">
        <Label htmlFor="teacher" className="flex items-center gap-1.5">
          <User className="h-3.5 w-3.5 text-muted-foreground" />
          Staff Member <span className="text-destructive">*</span>
        </Label>
        <select
          id="teacher"
          {...register('teacher', { required: 'Please select a staff member' })}
          className={selectClass}
        >
          <option value="">Select staff member...</option>
          {teachers.map((t: any) => (
            <option key={t.id} value={t.teacher_id || t.id}>
              {t.full_name} {t.email ? `(${t.email})` : ''}
            </option>
          ))}
        </select>
        {errors.teacher && (
          <p className="text-xs text-destructive flex items-center gap-1">
            <AlertCircle className="h-3.5 w-3.5" />
            {errors.teacher.message as string}
          </p>
        )}
      </div>

      {/* Leave Type */}
      <div className="space-y-2">
        <Label htmlFor="leave_type" className="flex items-center gap-1.5">
          <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
          Leave Type <span className="text-destructive">*</span>
        </Label>
        {leaveTypes.length === 0 ? (
          <div className="flex items-center gap-2 p-3 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 text-sm text-amber-700 dark:text-amber-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            No active leave types found. Please configure leave types first.
          </div>
        ) : (
          <select
            id="leave_type"
            {...register('leave_type', { required: 'Please select a leave type' })}
            className={selectClass}
          >
            <option value="">Select leave type...</option>
            {leaveTypes.map((type: any) => (
              <option key={type.id} value={type.id}>
                {type.name} ({type.max_days_per_year} days/year · {type.is_paid ? 'Paid' : 'Unpaid'})
              </option>
            ))}
          </select>
        )}
        {errors.leave_type && (
          <p className="text-xs text-destructive flex items-center gap-1">
            <AlertCircle className="h-3.5 w-3.5" />
            {errors.leave_type.message as string}
          </p>
        )}
      </div>

      {/* Live Balance Preview */}
      {selectedTeacher && selectedLeaveType && (
        <div className={cn(
          'p-3 rounded-xl border text-sm transition-all animate-in fade-in duration-300',
          balance
            ? exceedsBalance
              ? 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800'
              : 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
            : 'bg-muted/30 border-border/50'
        )}>
          {balance ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground">Leave Balance</span>
                {exceedsBalance ? (
                  <span className="text-xs font-medium text-rose-600 dark:text-rose-400 flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" /> Exceeds balance
                  </span>
                ) : (
                  <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Sufficient balance
                  </span>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                {[
                  { label: 'Total', value: balance.total_days, color: 'text-foreground' },
                  { label: 'Used', value: balance.used_days, color: 'text-amber-600 dark:text-amber-400' },
                  { label: 'Available', value: balance.balance_days, color: exceedsBalance ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400' },
                ].map((s) => (
                  <div key={s.label} className="bg-background/60 rounded-lg p-2">
                    <p className={cn('text-lg font-bold', s.color)}>{s.value}</p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>
              {/* Progress bar */}
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className={cn('h-full rounded-full transition-all', exceedsBalance ? 'bg-rose-500' : 'bg-emerald-500')}
                  style={{ width: `${Math.min(100, balance.total_days > 0 ? (balance.balance_days / balance.total_days) * 100 : 0)}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Info className="h-4 w-4 shrink-0" />
              <span>No balance record found for this staff + leave type combination.</span>
            </div>
          )}
        </div>
      )}

      {/* Date Range */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="from_date" className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            From Date <span className="text-destructive">*</span>
          </Label>
          <Input
            id="from_date"
            type="date"
            {...register('from_date', { required: 'From date is required' })}
          />
          {errors.from_date && (
            <p className="text-xs text-destructive">{errors.from_date.message as string}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="to_date" className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            To Date <span className="text-destructive">*</span>
          </Label>
          <Input
            id="to_date"
            type="date"
            {...register('to_date', { required: 'To date is required' })}
            min={fromDate || undefined}
          />
          {errors.to_date && (
            <p className="text-xs text-destructive">{errors.to_date.message as string}</p>
          )}
        </div>
      </div>

      {/* Auto-calculated days display */}
      {computedDays > 0 && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/5 border border-primary/20 text-sm animate-in fade-in duration-200">
          <CalendarDays className="h-4 w-4 text-primary shrink-0" />
          <span className="text-muted-foreground">Duration:</span>
          <span className="font-bold text-primary">{computedDays} working day{computedDays !== 1 ? 's' : ''}</span>
          <span className="text-xs text-muted-foreground ml-auto">(Sundays excluded)</span>
        </div>
      )}

      {/* Hidden total_days field */}
      <input type="hidden" {...register('total_days')} />

      {/* Reason */}
      <div className="space-y-2">
        <Label htmlFor="reason">
          Reason <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="reason"
          {...register('reason', { required: 'Please provide a reason for the leave' })}
          placeholder="Describe the reason for this leave request..."
          rows={3}
          className="resize-none"
        />
        {errors.reason && (
          <p className="text-xs text-destructive flex items-center gap-1">
            <AlertCircle className="h-3.5 w-3.5" />
            {errors.reason.message as string}
          </p>
        )}
      </div>

      {/* Status note */}
      {!item && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground p-2 rounded-lg bg-muted/30">
          <Info className="h-3.5 w-3.5 shrink-0" />
          Application will be submitted with <strong className="text-amber-600 dark:text-amber-400">Pending</strong> status and routed for approval.
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-2 border-t border-border/50">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1 h-11">
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || leaveTypes.length === 0}
          className="flex-1 h-11 shadow-sm"
        >
          {isSubmitting ? 'Submitting...' : item ? 'Update Application' : 'Submit Application'}
        </Button>
      </div>
    </form>
  );
};
