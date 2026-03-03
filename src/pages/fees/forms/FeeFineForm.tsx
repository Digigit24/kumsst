/**
 * Fee Fine Form Component
 * Create/Edit form for applying fines to students
 */

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { DROPDOWN_PAGE_SIZE } from '@/config/app.config';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { SearchableSelect, SearchableSelectOption } from '../../../components/ui/searchable-select';
import { Switch } from '../../../components/ui/switch';
import { Textarea } from '../../../components/ui/textarea';
import { useFeeStructuresSWR } from '../../../hooks/swr';
import { useStudents } from '../../../hooks/useStudents';

interface FeeFineFormProps {
  feeFine: any | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export const FeeFineForm = ({ feeFine, onSubmit, onCancel }: FeeFineFormProps) => {
  const [formData, setFormData] = useState<any>({
    student: 0,
    fee_structure: 0,
    amount: '0',
    reason: '',
    fine_date: new Date().toISOString().split('T')[0],
    is_paid: false,
    paid_date: '',
    is_active: true,
  });

  // Fetch dropdown data
  const { data: studentsData, isLoading: isLoadingStudents } = useStudents({ page_size: DROPDOWN_PAGE_SIZE });
  const { data: feeStructuresData, isLoading: isLoadingStructures } = useFeeStructuresSWR({ page_size: DROPDOWN_PAGE_SIZE });

  // Create options for dropdowns
  const studentOptions: SearchableSelectOption[] = useMemo(() => {
    if (!studentsData?.results) return [];
    return studentsData.results.map((student) => ({
      value: student.id,
      label: student.full_name || `${student.first_name || ''} ${student.last_name || ''}`.trim() || `Student ${student.id}`,
      subtitle: student.roll_number || student.email || '',
    }));
  }, [studentsData]);

  const feeStructureOptions: SearchableSelectOption[] = useMemo(() => {
    if (!feeStructuresData?.results) return [];
    return feeStructuresData.results.map((structure) => ({
      value: structure.id,
      label: structure.name || `Fee Structure ${structure.id}`,
      subtitle: structure.description || '',
    }));
  }, [feeStructuresData]);

  useEffect(() => {
    if (feeFine) {
      setFormData({
        ...feeFine,
        fine_date: feeFine.fine_date || new Date().toISOString().split('T')[0],
        paid_date: feeFine.paid_date || '',
      });
    }
  }, [feeFine]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.student || formData.student === 0) {
      toast.warning('Please select a student');
      return;
    }
    if (!formData.reason || formData.reason.trim() === '') {
      toast.warning('Please enter a reason for the fine');
      return;
    }
    if (!formData.fine_date) {
      toast.warning('Please select a fine date');
      return;
    }

    const userId = localStorage.getItem('kumss_user_id') || undefined;

    const submitData: any = {
      student: formData.student,
      fee_structure: formData.fee_structure || 0,
      amount: formData.amount,
      reason: formData.reason,
      fine_date: formData.fine_date,
      is_paid: formData.is_paid,
      is_active: formData.is_active,
    };

    // Only include paid_date if is_paid is true and date is provided
    if (formData.is_paid && formData.paid_date) {
      submitData.paid_date = formData.paid_date;
    }

    // Auto-populate user IDs
    if (!feeFine && userId) {
      submitData.created_by = userId;
      submitData.updated_by = userId;
    } else if (feeFine && userId) {
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
          isLoading={isLoadingStudents}
          searchPlaceholder="Search students..."
          emptyText="No students available"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="fee_structure">Fee Structure</Label>
        <SearchableSelect
          options={feeStructureOptions}
          value={formData.fee_structure}
          onChange={(value) => setFormData({ ...formData, fee_structure: Number(value) })}
          placeholder="Select fee structure (optional)"
          isLoading={isLoadingStructures}
          searchPlaceholder="Search fee structures..."
          emptyText="No fee structures available"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Fine Amount *</Label>
        <Input
          id="amount"
          type="number"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          placeholder="e.g., 500"
          min="0"
          step="0.01"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="reason">Reason *</Label>
        <Textarea
          id="reason"
          value={formData.reason || ''}
          onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
          placeholder="e.g., Late payment of tuition fee"
          rows={3}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="fine_date">Fine Date *</Label>
        <Input
          id="fine_date"
          type="date"
          value={formData.fine_date}
          onChange={(e) => setFormData({ ...formData, fine_date: e.target.value })}
          required
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="is_paid">Paid</Label>
        <Switch
          id="is_paid"
          checked={formData.is_paid}
          onCheckedChange={(checked) => setFormData({ ...formData, is_paid: checked })}
        />
      </div>

      {formData.is_paid && (
        <div className="space-y-2">
          <Label htmlFor="paid_date">Paid Date</Label>
          <Input
            id="paid_date"
            type="date"
            value={formData.paid_date || ''}
            onChange={(e) => setFormData({ ...formData, paid_date: e.target.value })}
          />
        </div>
      )}

      <div className="flex items-center justify-between">
        <Label htmlFor="is_active">Active</Label>
        <Switch
          id="is_active"
          checked={formData.is_active}
          onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1">
          {feeFine ? 'Update' : 'Create'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
      </div>
    </form>
  );
};
