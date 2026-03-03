import { useForm } from 'react-hook-form';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Checkbox } from '../../../components/ui/checkbox';
import { Card, CardContent } from '../../../components/ui/card';
import { Info } from 'lucide-react';

interface LeaveTypeFormProps {
  item: any | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export const LeaveTypeForm = ({ item, onSubmit, onCancel }: LeaveTypeFormProps) => {
  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue, watch } = useForm({
    defaultValues: item || { name: '', code: '', max_days_per_year: '', description: '', is_paid: true, is_active: true },
  });

  const isPaid = watch('is_paid');
  const isActive = watch('is_active');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

      {/* Basic Information */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Leave Type Name *</Label>
          <Input
            id="name"
            {...register('name', { required: 'Name is required' })}
            placeholder="e.g., Annual Leave"
            className="h-10"
          />
          {errors.name && <p className="text-sm text-destructive">{errors.name.message as string}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="code">Short Code *</Label>
            <Input
              id="code"
              {...register('code', { required: 'Code is required', maxLength: { value: 10, message: "Code too long" } })}
              placeholder="e.g., AL"
              className="font-mono uppercase h-10"
            />
            {errors.code && <p className="text-sm text-destructive">{errors.code.message as string}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="max_days_per_year">Days / Year *</Label>
            <Input
              id="max_days_per_year"
              type="number"
              {...register('max_days_per_year', { required: 'Limit is required', min: 0 })}
              placeholder="e.g., 14"
              className="h-10"
            />
            {errors.max_days_per_year && <p className="text-sm text-destructive">{errors.max_days_per_year.message as string}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            {...register('description')}
            placeholder="Describe the purpose and eligibility for this leave type..."
            rows={4}
            className="resize-none"
          />
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Info className="h-3 w-3" /> Brief description shown to employees.
          </p>
        </div>
      </div>

      {/* Configuration Toggles */}
      <div className="grid grid-cols-1 gap-3">
        <Card className={`border transition-colors ${isPaid ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-border'}`}>
          <CardContent className="p-3 flex items-start gap-3">
            <Checkbox
              id="is_paid"
              checked={isPaid}
              onCheckedChange={(checked) => setValue('is_paid', checked)}
              className="mt-1"
            />
            <div className="space-y-1">
              <Label htmlFor="is_paid" className="font-semibold cursor-pointer">Paid Leave</Label>
              <p className="text-xs text-muted-foreground">
                Enable if employees are paid for these leave days. Unchecking marks this as Unpaid Leave / LOP.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className={`border transition-colors ${isActive ? 'border-primary/50 bg-primary/5' : 'border-border'}`}>
          <CardContent className="p-3 flex items-start gap-3">
            <Checkbox
              id="is_active"
              checked={isActive}
              onCheckedChange={(checked) => setValue('is_active', checked)}
              className="mt-1"
            />
            <div className="space-y-1">
              <Label htmlFor="is_active" className="font-semibold cursor-pointer">Active Status</Label>
              <p className="text-xs text-muted-foreground">
                Only active leave types can be applied for by employees.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-3 pt-4 border-t border-border/50">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1 h-11">Cancel</Button>
        <Button type="submit" disabled={isSubmitting} className="flex-1 h-11 shadow-sm">
          {isSubmitting ? 'Saving...' : item ? 'Update Changes' : 'Create Leave Type'}
        </Button>
      </div>
    </form>
  );
};
