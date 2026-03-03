/**
 * Weekend Form Component
 * College selection is MANDATORY (Super Admin + Admin)
 */

import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Button } from '../../../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { DROPDOWN_PAGE_SIZE } from '../../../config/app.config';
import { collegeApi } from '../../../services/core.service';
import { useAuth } from '../../../hooks/useAuth';

interface WeekendFormProps {
  mode: 'create' | 'edit';
  weekend?: any;
  onSuccess: () => void;
  onCancel: () => void;
  onSubmit: (data: any) => Promise<void>;
}

export const WeekendForm = ({
  mode,
  weekend,
  onSuccess,
  onCancel,
  onSubmit,
}: WeekendFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { user } = useAuth();
  const userCollegeId = user?.college;
  const hasOnlyOneCollege = !!userCollegeId;

  /* ---------------- FORM STATE ---------------- */
  const [formData, setFormData] = useState({
    college: hasOnlyOneCollege ? userCollegeId : null as number | null,
    day: null as number | null,
    is_active: true,
  });

  /* ---------------- FETCH COLLEGES ---------------- */
  const { data: collegesData } = useQuery({
    queryKey: ['colleges'],
    queryFn: () => collegeApi.list({ page_size: DROPDOWN_PAGE_SIZE }),
  });

  const colleges = collegesData?.results ?? [];

  /* ---------------- EDIT MODE ---------------- */
  useEffect(() => {
    if (mode === 'edit' && weekend) {
      setFormData({
        college: weekend.college,
        day: weekend.day,
        is_active: weekend.is_active ?? true,
      });
    }
  }, [mode, weekend]);

  /* ---------------- VALIDATION ---------------- */
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.college) newErrors.college = 'College is required';
    if (formData.day === null || formData.day === undefined) {
      newErrors.day = 'Day is required';
    }

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
        college: formData.college, // ✅ REQUIRED
        day: formData.day,
        is_active: formData.is_active,
      });

      onSuccess();
    } catch (err: any) {
      setError(err?.message || 'Failed to save weekend');
    } finally {
      setIsSubmitting(false);
    }
  };

  const dayOptions = [
    { value: 0, label: 'Monday' },
    { value: 1, label: 'Tuesday' },
    { value: 2, label: 'Wednesday' },
    { value: 3, label: 'Thursday' },
    { value: 4, label: 'Friday' },
    { value: 5, label: 'Saturday' },
    { value: 6, label: 'Sunday' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* -------- College -------- */}
      {!hasOnlyOneCollege && (
        <div>
          <label className="block text-sm font-medium mb-2">
            Select College <span className="text-destructive">*</span>
          </label>

          <Select
            value={formData.college ? String(formData.college) : ''}
            onValueChange={(value) =>
              setFormData({ ...formData, college: Number(value) })
            }
          >
            <SelectTrigger
              className={`bg-background text-foreground border ${errors.college ? 'border-destructive' : ''
                }`}
            >
              <SelectValue placeholder="Select college" />
            </SelectTrigger>

            <SelectContent className="bg-background text-foreground">
              {colleges.map((college: any) => (
                <SelectItem key={college.id} value={String(college.id)}>
                  {college.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {errors.college && (
            <p className="text-sm text-destructive mt-1">{errors.college}</p>
          )}
        </div>
      )}

      {/* -------- Day -------- */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Day of Week <span className="text-destructive">*</span>
        </label>
        <Select
          value={formData.day !== null ? String(formData.day) : ''}
          onValueChange={(value) =>
            setFormData({ ...formData, day: Number(value) })
          }
        >
          <SelectTrigger className={errors.day ? 'border-destructive' : ''}>
            <SelectValue placeholder="Select day" />
          </SelectTrigger>
          <SelectContent className="bg-background text-foreground">
            {dayOptions.map((option) => (
              <SelectItem key={option.value} value={String(option.value)}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.day && (
          <p className="text-sm text-destructive mt-1">{errors.day}</p>
        )}
      </div>

      {/* -------- Actions -------- */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? 'Saving...'
            : mode === 'create'
              ? 'Add Weekend'
              : 'Update Weekend'}
        </Button>
      </div>
    </form>
  );
};
