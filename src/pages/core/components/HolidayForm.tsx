/**
 * Holiday Form Component
 * Super Admin + Normal Admin compatible
 * College selection is MANDATORY
 */

import { useEffect, useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { Textarea } from '../../../components/ui/textarea';

interface HolidayFormProps {
  mode: 'create' | 'edit';
  holiday?: any;
  initialValues?: Partial<{
    name: string;
    date: string;
    holiday_type: string;
    description: string;
    is_active: boolean;
  }>;
  onSuccess: (data?: any) => void;
  onCancel: () => void;
  onSubmit: (data: any) => Promise<void>;
  onDelete?: () => void;
}

export const HolidayForm = ({
  mode,
  holiday,
  initialValues,
  onSuccess,
  onCancel,
  onSubmit,
  onDelete,
}: HolidayFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  /* ---------------- FORM STATE ---------------- */
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    holiday_type: '',
    description: '',
    is_active: true,
  });



  /* ---------------- EDIT MODE ---------------- */
  useEffect(() => {
    if (mode === 'edit' && holiday) {
      setFormData({
        name: holiday.name,
        date: holiday.date,
        holiday_type: holiday.holiday_type,
        description: holiday.description || '',
        is_active: holiday.is_active ?? true,
      });
    } else if (mode === 'create' && initialValues) {
      setFormData((prev) => ({
        ...prev,
        ...initialValues,
      }));
    }
  }, [mode, holiday, initialValues]);

  /* ---------------- VALIDATION ---------------- */
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Holiday name is required';
    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.holiday_type) newErrors.holiday_type = 'Holiday type is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit({
        name: formData.name,
        date: formData.date,
        holiday_type: formData.holiday_type,
        description: formData.description || null,
        is_active: formData.is_active,
      });

      onSuccess(formData);
    } catch (err: any) {
      setError(err?.message || 'Failed to save holiday');
    } finally {
      setIsSubmitting(false);
    }
  };

  const holidayTypes = [
    { value: 'national', label: 'National Holiday' },
    { value: 'festival', label: 'Festival' },
    { value: 'college', label: 'College Holiday' },
    { value: 'exam', label: 'Exam Holiday' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md">
          {error}
        </div>
      )}



      {/* -------- Holiday Name -------- */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Holiday Name <span className="text-destructive">*</span>
        </label>
        <Input
          value={formData.name}
          onChange={(e) =>
            setFormData({ ...formData, name: e.target.value })
          }
          placeholder="e.g., Diwali, Independence Day"
        />
        {errors.name && (
          <p className="text-sm text-destructive mt-1">{errors.name}</p>
        )}
      </div>

      {/* -------- Date -------- */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Date <span className="text-destructive">*</span>
        </label>
        <Input
          type="date"
          value={formData.date}
          onChange={(e) =>
            setFormData({ ...formData, date: e.target.value })
          }
        />
        {errors.date && (
          <p className="text-sm text-destructive mt-1">{errors.date}</p>
        )}
      </div>

      {/* -------- Holiday Type -------- */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Holiday Type <span className="text-destructive">*</span>
        </label>
        <Select
          value={formData.holiday_type}
          onValueChange={(value) =>
            setFormData({ ...formData, holiday_type: value })
          }
        >
          <SelectTrigger className={errors.holiday_type ? 'border-destructive' : ''}>
            <SelectValue placeholder="Select holiday type" />
          </SelectTrigger>
          <SelectContent>
            {holidayTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.holiday_type && (
          <p className="text-sm text-destructive mt-1">{errors.holiday_type}</p>
        )}
      </div>

      {/* -------- Description -------- */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Description
        </label>
        <Textarea
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          rows={3}
          placeholder="Optional description"
        />
      </div>

      {/* -------- Actions -------- */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t">
        {onDelete && (
          <Button
            type="button"
            variant="destructive"
            onClick={onDelete}
            className="mr-auto"
          >
            Delete
          </Button>
        )}
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? 'Saving...'
            : mode === 'create'
              ? 'Create Holiday'
              : 'Update Holiday'}
        </Button>
      </div>
    </form>
  );
};
