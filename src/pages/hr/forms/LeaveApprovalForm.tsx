import { useForm } from 'react-hook-form';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { useLeaveApplications } from '../../../hooks/useHR';

interface LeaveApprovalFormProps {
  item: any | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export const LeaveApprovalForm = ({ item, onSubmit, onCancel }: LeaveApprovalFormProps) => {
  const { data: applications } = useLeaveApplications({ status: 'pending' });
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: item || {
      application: '',
      status: 'approved',
      approval_date: new Date().toISOString().split('T')[0],
      remarks: ''
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="application">Leave Application *</Label>
        <select
          id="application"
          {...register('application', { required: 'Application is required' })}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">Select application</option>
          {applications?.results?.map((app: any) => (
            <option key={app.id} value={app.id}>App #{app.id} - {app.teacher_name} - {app.leave_type_name}</option>
          ))}
        </select>
        {errors.application && <p className="text-sm text-destructive">{errors.application.message as string}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status *</Label>
        <select
          id="status"
          {...register('status', { required: 'Status is required' })}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="pending">Pending</option>
        </select>
        {errors.status && <p className="text-sm text-destructive">{errors.status.message as string}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="approval_date">Approval Date *</Label>
        <Input id="approval_date" type="date" {...register('approval_date', { required: 'Approval date is required' })} />
        {errors.approval_date && <p className="text-sm text-destructive">{errors.approval_date.message as string}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="remarks">Remarks</Label>
        <Textarea id="remarks" {...register('remarks')} placeholder="Enter remarks" rows={3} />
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={isSubmitting} className="flex-1">{isSubmitting ? 'Saving...' : item ? 'Update' : 'Create'}</Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">Cancel</Button>
      </div>
    </form>
  );
};
