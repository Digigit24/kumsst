/**
 * Credit Form Component
 */

import { useState, useEffect } from 'react';
import { Label } from '../../../components/ui/label';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Button } from '../../../components/ui/button';
import { Switch } from '../../../components/ui/switch';
import { SearchableSelect } from '../../../components/ui/searchable-select';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { studentApi } from '../../../services/students.service';

interface CreditFormProps {
  credit?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const CreditForm = ({ credit, onSubmit, onCancel, isSubmitting = false }: CreditFormProps) => {
  const [formData, setFormData] = useState<any>({
    student: 0,
    amount: '0',
    transaction_type: 'credit',
    date: new Date().toISOString().split('T')[0],
    reference_type: '',
    reference_id: 0,
    reason: '',
    balance_after: '0',
    is_active: true,
  });

  // Fetch students for dropdown
  const { data: studentsData } = useQuery({
    queryKey: ['students-for-select'],
    queryFn: () => studentApi.list(),
  });

  useEffect(() => {
    if (credit) {
      setFormData({
        student: credit.student || 0,
        amount: String(credit.amount || '0'),
        transaction_type: credit.transaction_type || 'credit',
        date: credit.date || new Date().toISOString().split('T')[0],
        reference_type: credit.reference_type || '',
        reference_id: credit.reference_id || 0,
        reason: credit.reason || '',
        balance_after: String(credit.balance_after || '0'),
        is_active: credit.is_active ?? true,
      });
    }
  }, [credit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const studentsOptions = studentsData?.results?.map((student: any) => ({
    value: student.id,
    label: student.full_name
      ? `${student.full_name} (${student.admission_number || student.id})`
      : `${student.first_name || ''} ${student.last_name || ''} (${student.admission_number || student.id})`.trim(),
  })) || [];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="student">Student *</Label>
        <SearchableSelect
          options={studentsOptions}
          value={formData.student}
          onChange={(value) => setFormData({ ...formData, student: value })}
          placeholder="Select student"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="transaction_type">Transaction Type *</Label>
          <Select
            value={formData.transaction_type}
            onValueChange={(value) => setFormData({ ...formData, transaction_type: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="credit">Credit</SelectItem>
              <SelectItem value="debit">Debit</SelectItem>
              <SelectItem value="refund">Refund</SelectItem>
              <SelectItem value="purchase">Purchase</SelectItem>
              <SelectItem value="adjustment">Adjustment</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="date">Date *</Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="amount">Amount *</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="balance_after">Balance After</Label>
          <Input
            id="balance_after"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={formData.balance_after}
            onChange={(e) => setFormData({ ...formData, balance_after: e.target.value })}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="reason">Reason</Label>
        <Textarea
          id="reason"
          placeholder="Reason for transaction..."
          rows={3}
          value={formData.reason}
          onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="reference_type">Reference Type</Label>
          <Input
            id="reference_type"
            placeholder="e.g., Invoice, Purchase, Refund"
            value={formData.reference_type}
            onChange={(e) => setFormData({ ...formData, reference_type: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="reference_id">Reference ID</Label>
          <Input
            id="reference_id"
            type="number"
            placeholder="Reference ID"
            value={formData.reference_id}
            onChange={(e) => setFormData({ ...formData, reference_id: parseInt(e.target.value) || 0 })}
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="is_active"
          checked={formData.is_active}
          onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
        />
        <Label htmlFor="is_active" className="cursor-pointer">
          Active
        </Label>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" loading={isSubmitting}>
          {credit ? 'Update' : 'Create'} Credit
        </Button>
      </div>
    </form>
  );
};

export default CreditForm;
