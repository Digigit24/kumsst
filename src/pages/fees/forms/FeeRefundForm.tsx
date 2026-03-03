/**
 * Fee Refund Form Component
 * Create/Edit form for fee refunds
 */

import { useEffect, useMemo, useState } from 'react';
import { DROPDOWN_PAGE_SIZE } from '@/config/app.config';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { SearchableSelect, SearchableSelectOption } from '../../../components/ui/searchable-select';
import { Textarea } from '../../../components/ui/textarea';
import { useStudents } from '../../../hooks/useStudents';
import { FeeRefund, FeeRefundCreateInput } from '../../../types/fees.types';

interface FeeRefundFormProps {
  feeRefund: FeeRefund | null;
  onSubmit: (data: Partial<FeeRefundCreateInput>) => void;
  onCancel: () => void;
}

export const FeeRefundForm = ({ feeRefund, onSubmit, onCancel }: FeeRefundFormProps) => {
  const [formData, setFormData] = useState<Partial<FeeRefundCreateInput>>({
    student: 0,
    amount: '0',
    reason: '',
    refund_date: new Date().toISOString().split('T')[0],
    payment_method: '',
    transaction_id: '',
    processed_by: '',
    is_active: true,
  });

  // Fetch students for dropdown
  const { data: studentsData, isLoading: isLoadingStudents } = useStudents({ page_size: DROPDOWN_PAGE_SIZE });

  // Create options for students dropdown
  const studentOptions: SearchableSelectOption[] = useMemo(() => {
    if (!studentsData?.results) return [];
    return studentsData.results.map((student) => ({
      value: student.id,
      label: student.full_name || `${student.first_name || ''} ${student.last_name || ''}`.trim() || `Student ${student.id}`,
      subtitle: student.roll_number || student.email || '',
    }));
  }, [studentsData]);

  useEffect(() => {
    if (feeRefund) {
      setFormData({
        student: feeRefund.student,
        amount: feeRefund.amount,
        reason: feeRefund.reason || '',
        refund_date: feeRefund.refund_date,
        payment_method: feeRefund.payment_method,
        transaction_id: feeRefund.transaction_id || '',
        processed_by: feeRefund.processed_by || '',
        is_active: feeRefund.is_active,
      });
    }
  }, [feeRefund]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const collegeId = localStorage.getItem('kumss_college_id');
    const userId = localStorage.getItem('kumss_user_id') || undefined;
    const submitData: any = { ...formData };

    // Auto-populate college ID
    if (collegeId) {
      submitData.college = parseInt(collegeId);
    }

    if (!feeRefund && userId) {
      submitData.created_by = userId;
      submitData.updated_by = userId;
    } else if (feeRefund && userId) {
      submitData.updated_by = userId;
    }

    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="student">Student *</Label>
        <SearchableSelect
          options={studentOptions}
          value={formData.student}
          onChange={(value) => setFormData({ ...formData, student: Number(value) })}
          placeholder="Select student"
          searchPlaceholder="Search students..."
          isLoading={isLoadingStudents}
          emptyText="No students available"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Refund Amount (₹) *</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          placeholder="0.00"
          required
          min="0"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="refund_date">Refund Date *</Label>
        <Input
          id="refund_date"
          type="date"
          value={formData.refund_date}
          onChange={(e) => setFormData({ ...formData, refund_date: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="payment_method">Payment Method *</Label>
        <Input
          id="payment_method"
          value={formData.payment_method}
          onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
          placeholder="e.g., Cash, Bank Transfer, Cheque"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="transaction_id">Transaction ID</Label>
        <Input
          id="transaction_id"
          value={formData.transaction_id ?? ''}
          onChange={(e) => setFormData({ ...formData, transaction_id: e.target.value })}
          placeholder="Enter transaction ID (optional)"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="processed_by">Processed By</Label>
        <Input
          id="processed_by"
          value={formData.processed_by ?? ''}
          onChange={(e) => setFormData({ ...formData, processed_by: e.target.value })}
          placeholder="Name of person who processed the refund"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="reason">Reason</Label>
        <Textarea
          id="reason"
          value={formData.reason ?? ''}
          onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
          placeholder="Enter reason for refund (optional)"
          rows={3}
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1">
          {feeRefund ? 'Update' : 'Create'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
      </div>
    </form>
  );
};
