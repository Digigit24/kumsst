import { useEffect, useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Checkbox } from '../../../components/ui/checkbox';
import { Input } from '../../../components/ui/input';

interface AcademicYearFormProps {
  mode: 'create' | 'edit';
  academicYear?: any;
  colleges: any[];
  onSuccess: () => void;
  onCancel: () => void;
  onSubmit: (data: any) => Promise<void>;
}

export const AcademicYearForm = ({
  mode,
  academicYear,
  colleges,
  onSuccess,
  onCancel,
  onSubmit,
}: AcademicYearFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    year: '',
    start_date: '',
    end_date: '',
    is_current: false,
    is_active: true,
  });

  /* ---------- EDIT MODE ---------- */
  useEffect(() => {
    if (mode === 'edit' && academicYear) {
      setFormData({
        year: academicYear.year,
        start_date: academicYear.start_date,
        end_date: academicYear.end_date,
        is_current: academicYear.is_current,
        is_active: academicYear.is_active,
      });
    }
  }, [mode, academicYear]);

  /* ---------- VALIDATION ---------- */
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.year.trim()) newErrors.year = 'Year is required';
    if (!formData.start_date) newErrors.start_date = 'Start date required';
    if (!formData.end_date) newErrors.end_date = 'End date required';

    if (
      formData.start_date &&
      formData.end_date &&
      formData.end_date <= formData.start_date
    ) {
      newErrors.end_date = 'End date must be after start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ---------- SUBMIT ---------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit({
        year: formData.year,
        start_date: formData.start_date,
        end_date: formData.end_date,
        is_current: formData.is_current,
        is_active: formData.is_active,
      });

      onSuccess();
    } catch (err: any) {
      setError(err?.message || 'Failed to save academic year');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="border border-destructive bg-destructive/10 text-destructive px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Academic Year */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Academic Year *
        </label>
        <Input
          value={formData.year}
          onChange={(e) =>
            setFormData({ ...formData, year: e.target.value })
          }
          placeholder="2025-2026"
          className="h-11"
        />
        {errors.year && (
          <p className="text-sm text-destructive">{errors.year}</p>
        )}
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Start Date *
          </label>
          <Input
            type="date"
            value={formData.start_date}
            onChange={(e) =>
              setFormData({ ...formData, start_date: e.target.value })
            }
            className="h-11"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            End Date *
          </label>
          <Input
            type="date"
            value={formData.end_date}
            onChange={(e) =>
              setFormData({ ...formData, end_date: e.target.value })
            }
            className="h-11"
          />
        </div>
      </div>

      {/* Flags */}
      <div className="flex gap-6">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={formData.is_current}
            onCheckedChange={(v) =>
              setFormData({ ...formData, is_current: Boolean(v) })
            }
          />
          <span className="text-sm">Current Year</span>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            checked={formData.is_active}
            onCheckedChange={(v) =>
              setFormData({ ...formData, is_active: Boolean(v) })
            }
          />
          <span className="text-sm">Active</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : 'Save Academic Year'}
        </Button>
      </div>
    </form>
  );
};
