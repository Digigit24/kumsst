import { Loader2 } from 'lucide-react';

import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Checkbox } from '../../../components/ui/checkbox';
import { Input } from '../../../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { DROPDOWN_PAGE_SIZE } from '../../../config/app.config';
import { academicYearApi } from '../../../services/core.service';

interface AcademicSessionFormProps {
  mode: 'create' | 'edit';
  academicSession?: any;
  onSuccess: () => void;
  onCancel: () => void;
  onSubmit: (data: any) => Promise<void>;
}

export const AcademicSessionForm = ({
  mode,
  academicSession,
  onSuccess,
  onCancel,
  onSubmit,
}: AcademicSessionFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    academic_year: null as number | null,
    name: '',
    semester: 1,
    start_date: '',
    end_date: '',
    is_current: false,
  });

  /* ---------------- FETCH COLLEGES ---------------- */


  /* ---------------- FETCH ACADEMIC YEARS ---------------- */
  /* ---------------- FETCH ACADEMIC YEARS ---------------- */
  const { data: academicYears, isLoading: isLoadingYears } = useQuery({
    queryKey: ['academic-years'],
    queryFn: () =>
      academicYearApi.list({
        page: 1,
        page_size: DROPDOWN_PAGE_SIZE,
      }),
  });

  /* ---------------- EDIT MODE ---------------- */
  useEffect(() => {
    if (mode === 'edit' && academicSession) {
      setFormData({
        academic_year: academicSession.academic_year,
        name: academicSession.name,
        semester: academicSession.semester,
        start_date: academicSession.start_date,
        end_date: academicSession.end_date,
        is_current: academicSession.is_current,
      });
    }
  }, [mode, academicSession]);

  /* ---------------- VALIDATION ---------------- */
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.academic_year) newErrors.academic_year = 'Academic year is required';
    if (!formData.name.trim()) newErrors.name = 'Session name is required';
    if (!formData.start_date) newErrors.start_date = 'Start date is required';
    if (!formData.end_date) newErrors.end_date = 'End date is required';

    if (
      formData.start_date &&
      formData.end_date &&
      formData.end_date <= formData.start_date
    ) {
      newErrors.end_date = 'End date must be after start date';
    }

    if (formData.semester < 1 || formData.semester > 8) {
      newErrors.semester = 'Semester must be between 1 and 8';
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
        academic_year: formData.academic_year,
        name: formData.name,
        semester: formData.semester,
        start_date: formData.start_date,
        end_date: formData.end_date,
        is_current: formData.is_current,
      });
      onSuccess();
    } catch (err: any) {
      setError(err?.message || 'Failed to save academic session');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md">
          {error}
        </div>
      )}



      {/* Academic Year */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Academic Year <span className="text-destructive">*</span>
        </label>
        <Select
          value={formData.academic_year ? String(formData.academic_year) : ''}
          onValueChange={(value) =>
            setFormData({ ...formData, academic_year: Number(value) })
          }
          disabled={isLoadingYears}
        >
          <SelectTrigger className={errors.academic_year ? 'border-destructive' : ''}>
            {isLoadingYears ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading...</span>
              </div>
            ) : (
              <SelectValue placeholder="Select academic year" />
            )}
          </SelectTrigger>
          <SelectContent>
            {academicYears?.results?.map((year: any) => (
              <SelectItem key={year.id} value={String(year.id)}>
                {year.year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.academic_year && (
          <p className="text-sm text-destructive mt-1">{errors.academic_year}</p>
        )}
      </div>

      {/* Session Name */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Session Name <span className="text-destructive">*</span>
        </label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Semester 1"
        />
        {errors.name && (
          <p className="text-sm text-destructive mt-1">{errors.name}</p>
        )}
      </div>

      {/* Semester */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Semester <span className="text-destructive">*</span>
        </label>
        <Select
          value={String(formData.semester)}
          onValueChange={(value) =>
            setFormData({ ...formData, semester: Number(value) })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
              <SelectItem key={s} value={String(s)}>
                Semester {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Start Date <span className="text-destructive">*</span>
          </label>
          <Input
            type="date"
            value={formData.start_date}
            onChange={(e) =>
              setFormData({ ...formData, start_date: e.target.value })
            }
            className={errors.start_date ? 'border-destructive' : ''}
          />
          {errors.start_date && (
            <p className="text-sm text-destructive mt-1">{errors.start_date}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">
            End Date <span className="text-destructive">*</span>
          </label>
          <Input
            type="date"
            value={formData.end_date}
            onChange={(e) =>
              setFormData({ ...formData, end_date: e.target.value })
            }
            className={errors.end_date ? 'border-destructive' : ''}
          />
          {errors.end_date && (
            <p className="text-sm text-destructive mt-1">{errors.end_date}</p>
          )}
        </div>
      </div>

      {/* Current */}
      <div className="flex items-center gap-2">
        <Checkbox
          checked={formData.is_current}
          onCheckedChange={(v) =>
            setFormData({ ...formData, is_current: Boolean(v) })
          }
        />
        <span className="text-sm">Set as Current Session</span>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : mode === 'create' ? 'Create Session' : 'Update Session'}
        </Button>
      </div>
    </form>
  );
};
