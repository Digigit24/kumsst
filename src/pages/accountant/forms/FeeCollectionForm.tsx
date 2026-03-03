/**
 * Fee Collection Form Component
 * Form for creating/editing fee collections
 */

import { DROPDOWN_PAGE_SIZE } from '@/config/app.config';
import { useEffect, useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { SearchableSelect } from '../../../components/ui/searchable-select';
import { Textarea } from '../../../components/ui/textarea';
import { useStudents } from '../../../hooks/useStudents';
import type {
  FeeCollection,
  FeeCollectionCreateInput,
  PaymentMethod,
  PaymentStatus,
} from '../../../types/accountant.types';

interface FeeCollectionFormProps {
  feeCollection: FeeCollection | null;
  onSubmit: (data: FeeCollectionCreateInput) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function FeeCollectionForm({
  feeCollection,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: FeeCollectionFormProps) {
  const [formData, setFormData] = useState<FeeCollectionCreateInput>({
    student: 0,
    amount: 0,
    payment_method: 'Cash',
    payment_date: new Date().toISOString().split('T')[0],
    status: 'paid',
    transaction_id: `TXN${Date.now()}`,
    remarks: '',
  });

  // Load students for the dropdown
  const { data: studentsData, isLoading: studentsLoading } = useStudents({
    page: 1,
    page_size: DROPDOWN_PAGE_SIZE // Load students for dropdown
  });

  useEffect(() => {
    if (feeCollection) {
      setFormData({
        student: feeCollection.student,
        amount: Number(feeCollection.amount),
        payment_method: feeCollection.payment_method,
        payment_date: feeCollection.payment_date,
        status: feeCollection.status,
        transaction_id: feeCollection.transaction_id,
        remarks: feeCollection.remarks || '',
      });
    }
  }, [feeCollection]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (
    field: keyof FeeCollectionCreateInput,
    value: any
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Prepare student options for SearchableSelect
  const studentOptions = studentsData?.results?.map((student: any) => ({
    value: student.id.toString(),
    label: `${student.full_name} (${student.admission_number})`,
  })) || [];

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6">
      <Card className="p-6 space-y-4">
        <h3 className="font-semibold text-lg border-b pb-2">Basic Details</h3>

        <div className="space-y-2">
          <Label htmlFor="student">Student *</Label>
          <SearchableSelect
            options={studentOptions}
            value={formData.student}
            onChange={(value) => handleChange('student', typeof value === 'string' ? parseInt(value) : value)}
            placeholder="Search student by name or admission number..."
            emptyText="No students found. Start typing to search..."
            searchPlaceholder="Type student name or admission number..."
            isLoading={studentsLoading}
          />
          <p className="text-xs text-muted-foreground">
            Search for students by name or admission number
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">Amount *</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            value={formData.amount || ''}
            onChange={(e) =>
              handleChange('amount', parseFloat(e.target.value) || 0)
            }
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="payment_method">Payment Method *</Label>
          <select
            id="payment_method"
            className="w-full px-3 py-2 border rounded-md"
            value={formData.payment_method}
            onChange={(e) =>
              handleChange('payment_method', e.target.value as PaymentMethod)
            }
            required
          >
            <option value="Cash">Cash</option>
            <option value="UPI">UPI</option>
            <option value="Card">Card</option>
            <option value="Cheque">Cheque</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="payment_date">Payment Date *</Label>
          <Input
            id="payment_date"
            type="date"
            value={formData.payment_date}
            onChange={(e) => handleChange('payment_date', e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status *</Label>
          <select
            id="status"
            className="w-full px-3 py-2 border rounded-md"
            value={formData.status}
            onChange={(e) =>
              handleChange('status', e.target.value as PaymentStatus)
            }
            required
          >
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="transaction_id">Transaction ID *</Label>
          <Input
            id="transaction_id"
            type="text"
            value={formData.transaction_id}
            onChange={(e) => handleChange('transaction_id', e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="remarks">Remarks</Label>
          <Textarea
            id="remarks"
            value={formData.remarks || ''}
            onChange={(e) => handleChange('remarks', e.target.value)}
            rows={3}
          />
        </div>
      </Card>

      <div className="flex gap-3 justify-end">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" loading={isSubmitting}>
          {feeCollection ? 'Update' : 'Create'} Fee Collection
        </Button>
      </div>
    </form>
  );
}
