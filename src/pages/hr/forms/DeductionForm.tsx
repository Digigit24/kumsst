import { useForm } from 'react-hook-form';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Checkbox } from '../../../components/ui/checkbox';

interface DeductionFormProps {
  deduction: any | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export const DeductionForm = ({ deduction, onSubmit, onCancel }: DeductionFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm({
    defaultValues: deduction || {
      name: '',
      code: '',
      deduction_type: '',
      amount: '',
      percentage: '',
      is_active: true,
    },
  });

  const isActive = watch('is_active');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Name *</Label>
        <Input
          id="name"
          {...register('name', { required: 'Name is required' })}
          placeholder="Enter deduction name"
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message as string}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="code">Code *</Label>
        <Input
          id="code"
          {...register('code', { required: 'Code is required' })}
          placeholder="Enter deduction code"
        />
        {errors.code && (
          <p className="text-sm text-destructive">{errors.code.message as string}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="deduction_type">Deduction Type *</Label>
        <Input
          id="deduction_type"
          {...register('deduction_type', { required: 'Deduction type is required' })}
          placeholder="e.g., Tax, Insurance, etc."
        />
        {errors.deduction_type && (
          <p className="text-sm text-destructive">{errors.deduction_type.message as string}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Amount *</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          {...register('amount', { required: 'Amount is required' })}
          placeholder="Enter amount"
        />
        {errors.amount && (
          <p className="text-sm text-destructive">{errors.amount.message as string}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="percentage">Percentage *</Label>
        <Input
          id="percentage"
          type="number"
          step="0.01"
          {...register('percentage', { required: 'Percentage is required' })}
          placeholder="Enter percentage"
        />
        {errors.percentage && (
          <p className="text-sm text-destructive">{errors.percentage.message as string}</p>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="is_active"
          checked={isActive}
          onCheckedChange={(checked) => setValue('is_active', checked)}
        />
        <Label htmlFor="is_active" className="cursor-pointer">
          Active
        </Label>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? 'Saving...' : deduction ? 'Update' : 'Create'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
      </div>
    </form>
  );
};
