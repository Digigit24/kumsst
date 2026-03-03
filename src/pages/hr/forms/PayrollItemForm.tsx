import { useForm } from 'react-hook-form';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Checkbox } from '../../../components/ui/checkbox';
import { usePayrolls } from '../../../hooks/useHR';

interface PayrollItemFormProps {
  item: any | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export const PayrollItemForm = ({ item, onSubmit, onCancel }: PayrollItemFormProps) => {
  const { data: payrolls } = usePayrolls({ is_active: true });
  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue, watch } = useForm({
    defaultValues: item || {
      payroll: '',
      component_name: '',
      component_type: '',
      amount: '',
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
        <Label htmlFor="component_name">Component Name *</Label>
        <Input id="component_name" {...register('component_name', { required: 'Component name is required' })} placeholder="e.g., Travel Allowance" />
        {errors.component_name && <p className="text-sm text-destructive">{errors.component_name.message as string}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="component_type">Component Type *</Label>
        <select
          id="component_type"
          {...register('component_type', { required: 'Component type is required' })}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">Select type</option>
          <option value="allowance">Allowance</option>
          <option value="deduction">Deduction</option>
          <option value="bonus">Bonus</option>
        </select>
        {errors.component_type && <p className="text-sm text-destructive">{errors.component_type.message as string}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Amount *</Label>
        <Input id="amount" type="number" step="0.01" {...register('amount', { required: 'Amount is required' })} placeholder="e.g., 5000" />
        {errors.amount && <p className="text-sm text-destructive">{errors.amount.message as string}</p>}
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
