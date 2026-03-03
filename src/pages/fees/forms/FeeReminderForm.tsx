/**
 * Fee Reminder Form Component
 * Create/Edit form for fee reminders
 */

import { useEffect, useMemo, useState } from 'react';
import { DROPDOWN_PAGE_SIZE } from '@/config/app.config';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { SearchableSelect, SearchableSelectOption } from '../../../components/ui/searchable-select';
import { Textarea } from '../../../components/ui/textarea';
import { useFeeStructuresSWR } from '../../../hooks/swr';
import { useStudents } from '../../../hooks/useStudents';
import { FeeReminder, FeeReminderCreateInput } from '../../../types/fees.types';

interface FeeReminderFormProps {
  feeReminder: FeeReminder | null;
  onSubmit: (data: Partial<FeeReminderCreateInput>) => void;
  onCancel: () => void;
}

export const FeeReminderForm = ({ feeReminder, onSubmit, onCancel }: FeeReminderFormProps) => {
  const [formData, setFormData] = useState<Partial<FeeReminderCreateInput>>({
    student: 0,
    fee_structure: 0,
    reminder_date: new Date().toISOString().split('T')[0],
    reminder_type: '',
    status: 'pending',
    sent_at: '',
    message: '',
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
      label: `${structure.student_name || 'Student'} - ${structure.fee_master_name || 'Fee'}`,
      subtitle: `₹${structure.balance} due on ${structure.due_date}`,
    }));
  }, [feeStructuresData]);

  useEffect(() => {
    if (feeReminder) {
      setFormData({
        student: feeReminder.student,
        fee_structure: feeReminder.fee_structure,
        reminder_date: feeReminder.reminder_date,
        reminder_type: feeReminder.reminder_type,
        status: feeReminder.status,
        sent_at: feeReminder.sent_at || '',
        message: feeReminder.message,
        is_active: feeReminder.is_active,
      });
    }
  }, [feeReminder]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const collegeId = localStorage.getItem('kumss_college_id');
    const userId = localStorage.getItem('kumss_user_id') || undefined;

    const submitData: any = {
      student: formData.student,
      fee_structure: formData.fee_structure,
      reminder_date: formData.reminder_date,
      reminder_type: formData.reminder_type,
      status: formData.status,
      message: formData.message,
      is_active: formData.is_active,
    };

    // Only include sent_at if status is 'sent' and there's a value
    if (formData.status === 'sent' && formData.sent_at) {
      // Convert to ISO datetime format if it's a datetime-local value
      const sentAtDate = new Date(formData.sent_at);
      submitData.sent_at = sentAtDate.toISOString();
    }

    // Auto-populate college ID
    if (collegeId) {
      submitData.college = parseInt(collegeId);
    }

    if (!feeReminder && userId) {
      submitData.created_by = userId;
      submitData.updated_by = userId;
    } else if (feeReminder && userId) {
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
          emptyText="No students available"
          isLoading={isLoadingStudents}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="fee_structure">Fee Structure *</Label>
        <SearchableSelect
          options={feeStructureOptions}
          value={formData.fee_structure}
          onChange={(value) => setFormData({ ...formData, fee_structure: Number(value) })}
          placeholder="Select fee structure"
          searchPlaceholder="Search fee structures..."
          emptyText="No fee structures available"
          isLoading={isLoadingStructures}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="reminder_type">Reminder Type *</Label>
        <Input
          id="reminder_type"
          value={formData.reminder_type}
          onChange={(e) => setFormData({ ...formData, reminder_type: e.target.value })}
          placeholder="e.g., Email, SMS, Phone Call"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="reminder_date">Reminder Date *</Label>
        <Input
          id="reminder_date"
          type="date"
          value={formData.reminder_date}
          onChange={(e) => setFormData({ ...formData, reminder_date: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status *</Label>
        <select
          id="status"
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="pending">Pending</option>
          <option value="sent">Sent</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {formData.status === 'sent' && (
        <div className="space-y-2">
          <Label htmlFor="sent_at">Sent At</Label>
          <Input
            id="sent_at"
            type="datetime-local"
            value={formData.sent_at ?? ''}
            onChange={(e) => setFormData({ ...formData, sent_at: e.target.value })}
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="message">Message *</Label>
        <Textarea
          id="message"
          value={formData.message ?? ''}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          placeholder="Enter reminder message"
          rows={4}
          required
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1">
          {feeReminder ? 'Update' : 'Create'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
      </div>
    </form>
  );
};
