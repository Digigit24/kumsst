/**
 * Fee Structure Form Component
 * Create/Edit form for fee structures
 */

import { useEffect, useMemo, useState } from 'react';
import { DROPDOWN_PAGE_SIZE } from '@/config/app.config';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { SearchableSelect, SearchableSelectOption } from '../../../components/ui/searchable-select';
import { Switch } from '../../../components/ui/switch';
import { useFeeMastersSWR } from '../../../hooks/swr';
import { useStudents } from '../../../hooks/useStudents';
import { FeeStructure, FeeStructureCreateInput } from '../../../types/fees.types';

interface FeeStructureFormProps {
  feeStructure: FeeStructure | null;
  onSubmit: (data: Partial<FeeStructureCreateInput>) => void;
  onCancel: () => void;
}

export const FeeStructureForm = ({ feeStructure, onSubmit, onCancel }: FeeStructureFormProps) => {
  const [formData, setFormData] = useState<Partial<FeeStructureCreateInput>>({
    student: 0,
    fee_master: 0,
    amount: '0',
    due_date: new Date().toISOString().split('T')[0],
    is_paid: false,
    paid_amount: '0',
    balance: '0',
    is_active: true,
  });

  // Fetch dropdown data
  const { data: studentsData, isLoading: isLoadingStudents } = useStudents({ page_size: DROPDOWN_PAGE_SIZE });
  const { data: feeMastersData, isLoading: isLoadingFeeMasters } = useFeeMastersSWR({ page_size: DROPDOWN_PAGE_SIZE });

  // Create options for dropdowns
  const studentOptions: SearchableSelectOption[] = useMemo(() => {
    if (!studentsData?.results) return [];
    return studentsData.results.map((student) => ({
      value: student.id,
      label: student.full_name || `${student.first_name || ''} ${student.last_name || ''}`.trim() || `Student ${student.id}`,
      subtitle: student.roll_number || student.email || '',
    }));
  }, [studentsData]);

  const feeMasterOptions: SearchableSelectOption[] = useMemo(() => {
    if (!feeMastersData?.results) return [];
    return feeMastersData.results.map((master) => ({
      value: master.id,
      label: `${master.fee_type_name || 'Fee'} - Sem ${master.semester}`,
      subtitle: `₹${master.amount} • ${master.program_name || ''}`,
    }));
  }, [feeMastersData]);

  useEffect(() => {
    if (feeStructure) {
      setFormData({
        student: feeStructure.student,
        fee_master: feeStructure.fee_master,
        amount: feeStructure.amount,
        due_date: feeStructure.due_date,
        is_paid: feeStructure.is_paid,
        paid_amount: feeStructure.paid_amount,
        balance: feeStructure.balance,
        is_active: feeStructure.is_active,
      });
    }
  }, [feeStructure]);

  // Auto-calculate balance when amount or paid_amount changes
  useEffect(() => {
    const amount = parseFloat(formData.amount || '0');
    const paidAmount = parseFloat(formData.paid_amount || '0');
    const balance = (amount - paidAmount).toFixed(2);
    setFormData(prev => ({ ...prev, balance }));
  }, [formData.amount, formData.paid_amount]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const collegeId = localStorage.getItem('kumss_college_id');
    const userId = localStorage.getItem('kumss_user_id') || undefined;
    const submitData: any = { ...formData };

    // Auto-populate college ID
    if (collegeId) {
      submitData.college = parseInt(collegeId);
    }

    if (!feeStructure && userId) {
      submitData.created_by = userId;
      submitData.updated_by = userId;
    } else if (feeStructure && userId) {
      submitData.updated_by = userId;
    }

    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">

      {/* Assignment Section */}
      <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
        <div className="flex flex-col space-y-1.5 p-6 border-b bg-muted/20">
          <h3 className="font-semibold leading-none tracking-tight">Assignment Details</h3>
          <p className="text-sm text-muted-foreground">Select the student and the fee type to assign.</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="student">Student <span className="text-destructive">*</span></Label>
            <SearchableSelect
              options={studentOptions}
              value={formData.student}
              onChange={(value) => setFormData({ ...formData, student: Number(value) })}
              placeholder="Select student"
              searchPlaceholder="Search students..."
              emptyText="No students available"
              isLoading={isLoadingStudents}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fee_master">Fee Master <span className="text-destructive">*</span></Label>
            <SearchableSelect
              options={feeMasterOptions}
              value={formData.fee_master}
              onChange={(value) => setFormData({ ...formData, fee_master: Number(value) })}
              placeholder="Select fee master"
              searchPlaceholder="Search fee masters..."
              emptyText="No fee masters available"
              isLoading={isLoadingFeeMasters}
            />
          </div>
        </div>
      </div>

      {/* Payment & Status */}
      <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
        <div className="flex flex-col space-y-1.5 p-6 border-b bg-muted/20">
          <h3 className="font-semibold leading-none tracking-tight">Payment & Status</h3>
          <p className="text-sm text-muted-foreground">Manage payment amounts and dates.</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Total Amount (₹) <span className="text-destructive">*</span></Label>
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
              <Label htmlFor="due_date">Due Date <span className="text-destructive">*</span></Label>
              <Input
                id="due_date"
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="paid_amount">Paid Amount (₹)</Label>
              <Input
                id="paid_amount"
                type="number"
                step="0.01"
                value={formData.paid_amount}
                onChange={(e) => setFormData({ ...formData, paid_amount: e.target.value })}
                placeholder="0.00"
                min="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="balance">Balance (₹)</Label>
              <Input
                id="balance"
                type="number"
                step="0.01"
                value={formData.balance}
                disabled
                className="bg-muted"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <Switch
              id="is_paid"
              checked={formData.is_paid}
              onCheckedChange={(checked) => setFormData({ ...formData, is_paid: checked })}
            />
            <Label htmlFor="is_paid">Mark as Fully Paid</Label>
          </div>
        </div>
      </div>

      <div className="flex gap-2 pt-4 border-t mt-2">
        <Button type="submit" className="flex-1">
          {feeStructure ? 'Update' : 'Create'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
      </div>
    </form>
  );
};
