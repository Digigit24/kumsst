import { useForm } from 'react-hook-form';
import { Button } from '../../../components/ui/button';
import { Checkbox } from '../../../components/ui/checkbox';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { SearchableSelect } from '../../../components/ui/searchable-select';
import { Textarea } from '../../../components/ui/textarea';
import { DROPDOWN_PAGE_SIZE } from '../../../config/app.config';
import { useHostelAllocations } from '../../../hooks/useHostel';

interface FeeFormProps {
  item: any | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export const FeeForm = ({ item, onSubmit, onCancel }: FeeFormProps) => {
  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue, watch } = useForm({
    defaultValues: item || {
      allocation: '',
      month: '',
      year: '',
      amount: '',
      due_date: '',
      is_paid: false,
      paid_date: '',
      remarks: '',
      is_active: true,
    },
  });

  const isPaid = watch('is_paid');
  const isActive = watch('is_active');
  const allocation = watch('allocation');

  // Fetch allocations
  const { data: allocationsData } = useHostelAllocations({ page_size: DROPDOWN_PAGE_SIZE });

  const allocationOptions = allocationsData?.results?.map((a: any) => ({
    value: a.id,
    label: `${a.student_name || `Student #${a.student}`} - ${a.room_number || `Room #${a.room}`}`,
    subtitle: `${a.hostel_name || `Hostel #${a.hostel}`} | ${a.bed_number || `Bed #${a.bed}`}`,
  })) || [];

  const handleFormSubmit = (data: any) => {
    // Clean up the data before submission
    const cleanedData = {
      ...data,
      // Only include paid_date if is_paid is true, and convert empty string to null
      paid_date: data.is_paid && data.paid_date ? data.paid_date : null,
    };

    onSubmit(cleanedData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label>Allocation *</Label>
        <SearchableSelect
          options={allocationOptions}
          value={allocation}
          onChange={(value) => setValue('allocation', value)}
          placeholder="Select allocation..."
          searchPlaceholder="Search allocations..."
        />
        {errors.allocation && <p className="text-sm text-destructive">{errors.allocation.message as string}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="month">Month *</Label>
          <Input id="month" type="number" {...register('month', { required: 'Month is required', min: 1, max: 12 })} placeholder="1-12" />
          {errors.month && <p className="text-sm text-destructive">{errors.month.message as string}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="year">Year *</Label>
          <Input id="year" type="number" {...register('year', { required: 'Year is required' })} placeholder="e.g., 2026" />
          {errors.year && <p className="text-sm text-destructive">{errors.year.message as string}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Amount *</Label>
        <Input id="amount" type="number" step="0.01" {...register('amount', { required: 'Amount is required' })} placeholder="Enter amount" />
        {errors.amount && <p className="text-sm text-destructive">{errors.amount.message as string}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="due_date">Due Date *</Label>
        <Input id="due_date" type="date" {...register('due_date', { required: 'Due date is required' })} />
        {errors.due_date && <p className="text-sm text-destructive">{errors.due_date.message as string}</p>}
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox id="is_paid" checked={isPaid} onCheckedChange={(checked) => setValue('is_paid', checked)} />
        <Label htmlFor="is_paid" className="cursor-pointer">Paid</Label>
      </div>

      {isPaid && (
        <div className="space-y-2">
          <Label htmlFor="paid_date">Paid Date *</Label>
          <Input id="paid_date" type="date" {...register('paid_date', {
            required: isPaid ? 'Paid date is required when marked as paid' : false
          })} />
          {errors.paid_date && <p className="text-sm text-destructive">{errors.paid_date.message as string}</p>}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="remarks">Remarks</Label>
        <Textarea id="remarks" {...register('remarks')} placeholder="Enter any remarks" rows={3} />
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
