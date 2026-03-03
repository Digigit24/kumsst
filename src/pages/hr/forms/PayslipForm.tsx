import { useForm } from 'react-hook-form';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Checkbox } from '../../../components/ui/checkbox';
import { usePayrolls } from '../../../hooks/useHR';

interface PayslipFormProps {
  item: any | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export const PayslipForm = ({ item, onSubmit, onCancel }: PayslipFormProps) => {
  const { data: payrolls } = usePayrolls({ status: 'paid' });
  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue, watch } = useForm({
    defaultValues: item || {
      payroll: '',
      slip_number: '',
      slip_file: '',
      issue_date: new Date().toISOString().split('T')[0],
      is_active: true
    },
  });

  const isActive = watch('is_active');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="payroll">Payroll *</Label>
        <select
          id="payroll"
          {...register('payroll', { required: 'Payroll is required' })}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">Select payroll</option>
          {payrolls?.results?.map((payroll: any) => (
            <option key={payroll.id} value={payroll.id}>
              {payroll.teacher_name} - {payroll.month}/{payroll.year}
            </option>
          ))}
        </select>
        {errors.payroll && <p className="text-sm text-destructive">{errors.payroll.message as string}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="slip_number">Slip Number *</Label>
        <Input id="slip_number" {...register('slip_number', { required: 'Slip number is required' })} placeholder="e.g., PS-2024-001" />
        {errors.slip_number && <p className="text-sm text-destructive">{errors.slip_number.message as string}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="slip_file">Slip File (URL) *</Label>
        <Input id="slip_file" {...register('slip_file', { required: 'Slip file is required' })} placeholder="Enter file URL" />
        {errors.slip_file && <p className="text-sm text-destructive">{errors.slip_file.message as string}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="issue_date">Issue Date *</Label>
        <Input id="issue_date" type="date" {...register('issue_date', { required: 'Issue date is required' })} />
        {errors.issue_date && <p className="text-sm text-destructive">{errors.issue_date.message as string}</p>}
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox id="is_active" checked={isActive} onCheckedChange={(checked) => setValue('is_active', checked)} />
        <Label htmlFor="is_active" className="cursor-pointer">Active</Label>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={isSubmitting} className="flex-1">{isSubmitting ? 'Saving...' : item ? 'Update' : 'Create'}</Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">Cancel</Button>
      </div>
    </form>
  );
};
