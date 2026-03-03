import { useForm } from 'react-hook-form';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { useSalaryStructures, useTeachers } from '../../../hooks/useHR';

interface PayrollFormProps {
  item: any | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export const PayrollForm = ({ item, onSubmit, onCancel }: PayrollFormProps) => {
  const { data: structures } = useSalaryStructures({ is_active: true });
  const { data: teachers } = useTeachers({ is_active: true });

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: item || {
      teacher: '',
      salary_structure: '',
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      gross_salary: '',
      total_allowances: '',
      total_deductions: '',
      net_salary: '',
      payment_date: new Date().toISOString().split('T')[0],
      payment_method: 'bank_transfer',
      status: 'pending',
      remarks: ''
    },
  });

  const handleFormSubmit = (data: any) => {
    // Convert to proper types
    const cleanedData = {
      ...data,
      teacher: parseInt(data.teacher),
      salary_structure: parseInt(data.salary_structure),
      month: parseInt(data.month),
      year: parseInt(data.year),
    };
    onSubmit(cleanedData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="teacher">Teacher *</Label>
        <select
          id="teacher"
          {...register('teacher', { required: 'Teacher is required' })}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">Select teacher</option>
          {teachers?.results?.map((teacher: any) => (
            <option key={teacher.id} value={teacher.teacher_id || teacher.id}>
              {teacher.full_name} {teacher.email ? `(${teacher.email})` : ''}
            </option>
          ))}
        </select>
        {errors.teacher && <p className="text-sm text-destructive">{errors.teacher.message as string}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="salary_structure">Salary Structure *</Label>
        <select
          id="salary_structure"
          {...register('salary_structure', { required: 'Salary structure is required' })}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">Select structure</option>
          {structures?.results?.map((structure: any) => (
            <option key={structure.id} value={structure.id}>
              {structure.teacher_name} - ₹{structure.gross_salary}
            </option>
          ))}
        </select>
        {errors.salary_structure && <p className="text-sm text-destructive">{errors.salary_structure.message as string}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="month">Month *</Label>
          <Input id="month" type="number" min="1" max="12" {...register('month', { required: 'Month is required' })} placeholder="1-12" />
          {errors.month && <p className="text-sm text-destructive">{errors.month.message as string}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="year">Year *</Label>
          <Input id="year" type="number" {...register('year', { required: 'Year is required' })} placeholder="e.g., 2024" />
          {errors.year && <p className="text-sm text-destructive">{errors.year.message as string}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="gross_salary">Gross Salary *</Label>
        <Input id="gross_salary" type="number" step="0.01" {...register('gross_salary', { required: 'Gross salary is required' })} placeholder="e.g., 50000" />
        {errors.gross_salary && <p className="text-sm text-destructive">{errors.gross_salary.message as string}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="total_allowances">Total Allowances *</Label>
        <Input id="total_allowances" type="number" step="0.01" {...register('total_allowances', { required: 'Total allowances is required' })} placeholder="e.g., 10000" />
        {errors.total_allowances && <p className="text-sm text-destructive">{errors.total_allowances.message as string}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="total_deductions">Total Deductions *</Label>
        <Input id="total_deductions" type="number" step="0.01" {...register('total_deductions', { required: 'Total deductions is required' })} placeholder="e.g., 5000" />
        {errors.total_deductions && <p className="text-sm text-destructive">{errors.total_deductions.message as string}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="net_salary">Net Salary *</Label>
        <Input id="net_salary" type="number" step="0.01" {...register('net_salary', { required: 'Net salary is required' })} placeholder="e.g., 55000" />
        {errors.net_salary && <p className="text-sm text-destructive">{errors.net_salary.message as string}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="payment_date">Payment Date *</Label>
        <Input id="payment_date" type="date" {...register('payment_date', { required: 'Payment date is required' })} />
        {errors.payment_date && <p className="text-sm text-destructive">{errors.payment_date.message as string}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="payment_method">Payment Method *</Label>
        <select
          id="payment_method"
          {...register('payment_method', { required: 'Payment method is required' })}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="bank_transfer">Bank Transfer</option>
          <option value="cheque">Cheque</option>
          <option value="cash">Cash</option>
        </select>
        {errors.payment_method && <p className="text-sm text-destructive">{errors.payment_method.message as string}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status *</Label>
        <select
          id="status"
          {...register('status', { required: 'Status is required' })}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="cancelled">Cancelled</option>
        </select>
        {errors.status && <p className="text-sm text-destructive">{errors.status.message as string}</p>}
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
