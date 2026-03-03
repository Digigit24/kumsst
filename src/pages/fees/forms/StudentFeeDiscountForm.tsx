/**
 * Student Fee Discount Form Component
 * Create/Edit form for student fee discounts
 */

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { DROPDOWN_PAGE_SIZE } from '@/config/app.config';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { SearchableSelect, SearchableSelectOption } from '../../../components/ui/searchable-select';
import { Textarea } from '../../../components/ui/textarea';
import { useFeeDiscountsSWR } from '../../../hooks/swr';
import { useStudents } from '../../../hooks/useStudents';
import { StudentFeeDiscount, StudentFeeDiscountCreateInput } from '../../../types/fees.types';

interface StudentFeeDiscountFormProps {
  studentFeeDiscount: StudentFeeDiscount | null;
  onSubmit: (data: Partial<StudentFeeDiscountCreateInput>) => void;
  onCancel: () => void;
}

export const StudentFeeDiscountForm = ({ studentFeeDiscount, onSubmit, onCancel }: StudentFeeDiscountFormProps) => {
  const [formData, setFormData] = useState<Partial<StudentFeeDiscountCreateInput>>({
    student: 0,
    discount: 0,
    applied_date: new Date().toISOString().split('T')[0],
    remarks: '',
    is_active: true,
  });

  // Fetch dropdown data
  const { data: studentsData, isLoading: isLoadingStudents } = useStudents({ page_size: DROPDOWN_PAGE_SIZE });
  const { data: discountsData, isLoading: isLoadingDiscounts } = useFeeDiscountsSWR({ page_size: DROPDOWN_PAGE_SIZE });

  // Create options for dropdowns
  const studentOptions: SearchableSelectOption[] = useMemo(() => {
    if (!studentsData?.results) return [];
    return studentsData.results.map((student) => ({
      value: student.id,
      label: student.full_name || `${student.first_name || ''} ${student.last_name || ''}`.trim() || `Student ${student.id}`,
      subtitle: student.roll_number || student.email || '',
    }));
  }, [studentsData]);

  const discountOptions: SearchableSelectOption[] = useMemo(() => {
    if (!discountsData?.results) return [];
    return discountsData.results.map((discount) => ({
      value: discount.id,
      label: discount.name,
      subtitle: `${discount.discount_percentage}% • ${discount.description || ''}`,
    }));
  }, [discountsData]);

  useEffect(() => {
    if (studentFeeDiscount) {
      setFormData({
        student: studentFeeDiscount.student,
        discount: studentFeeDiscount.discount,
        applied_date: studentFeeDiscount.applied_date,
        remarks: studentFeeDiscount.remarks || '',
        is_active: studentFeeDiscount.is_active,
      });
    }
  }, [studentFeeDiscount]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.student || formData.student === 0) {
      toast.warning('Please select a student');
      return;
    }
    if (!formData.discount || formData.discount === 0) {
      toast.warning('Please select a discount');
      return;
    }

    const collegeId = localStorage.getItem('kumss_college_id');
    const userId = localStorage.getItem('kumss_user_id') || undefined;
    const submitData: any = { ...formData };

    // Auto-populate college ID
    if (collegeId) {
      submitData.college = parseInt(collegeId);
    }

    if (!studentFeeDiscount && userId) {
      submitData.created_by = userId;
      submitData.updated_by = userId;
    } else if (studentFeeDiscount && userId) {
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
        <Label htmlFor="discount">Discount *</Label>
        <SearchableSelect
          options={discountOptions}
          value={formData.discount}
          onChange={(value) => setFormData({ ...formData, discount: Number(value) })}
          placeholder="Select discount"
          searchPlaceholder="Search discounts..."
          emptyText="No discounts available"
          isLoading={isLoadingDiscounts}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="applied_date">Applied Date *</Label>
        <Input
          id="applied_date"
          type="date"
          value={formData.applied_date}
          onChange={(e) => setFormData({ ...formData, applied_date: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="remarks">Remarks</Label>
        <Textarea
          id="remarks"
          value={formData.remarks ?? ''}
          onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
          placeholder="Enter any additional remarks (optional)"
          rows={3}
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1">
          {studentFeeDiscount ? 'Update' : 'Create'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
      </div>
    </form>
  );
};
