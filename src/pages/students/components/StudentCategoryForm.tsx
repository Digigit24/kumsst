/**
 * Student Category Form Component
 * Used for creating and editing student categories
 */

import { useSuperAdminContext } from '@/contexts/SuperAdminContext';
import { getCurrentUserCollege, isSuperAdmin } from '@/utils/auth.utils';
import { useEffect, useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { useAuth } from '../../../hooks/useAuth';
import { studentCategoryApi } from '../../../services/students.service';
import type { StudentCategory, StudentCategoryCreateInput, StudentCategoryUpdateInput } from '../../../types/students.types';

interface StudentCategoryFormProps {
  mode: 'create' | 'edit';
  category?: StudentCategory;
  onSuccess: () => void;
  onCancel: () => void;
}

export const StudentCategoryForm = ({ mode, category, onSuccess, onCancel }: StudentCategoryFormProps) => {

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { selectedCollege } = useSuperAdminContext();

  // Get initial college - use global selection if super admin, otherwise use user's college
  const getInitialCollege = () => {
    if (isSuperAdmin(user as any)) {
      return selectedCollege || 0;
    }
    return getCurrentUserCollege(user as any) || 0;
  };

  const [formData, setFormData] = useState<StudentCategoryCreateInput>({
    college: getInitialCollege(),
    name: '',
    code: '',
    description: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form data for edit mode
  useEffect(() => {
    if (mode === 'edit' && category) {
      setFormData({
        college: category.college,
        name: category.name,
        code: category.code,
        description: category.description || '',
      });
    } else if (mode === 'create') {
      // Get college ID from current user or global selection
      const college = getInitialCollege();
      setFormData(prev => ({ ...prev, college }));
    }
  }, [mode, category, user]);

  // Auto-update college field when global selection changes (for super admins)
  useEffect(() => {
    if (isSuperAdmin(user as any) && selectedCollege !== undefined) {
      setFormData(prev => ({ ...prev, college: selectedCollege || 0 }));
    }
  }, [selectedCollege, user]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required';
    }

    if (!formData.code.trim()) {
      newErrors.code = 'Category code is required';
    }

    if (!formData.college || formData.college === 0) {
      newErrors.college = 'College is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof StudentCategoryCreateInput, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      if (mode === 'create') {
        await studentCategoryApi.create(formData);
      } else if (category) {
        const updateData: StudentCategoryUpdateInput = {
          name: formData.name,
          code: formData.code,
          description: formData.description,
        };
        await studentCategoryApi.update(category.id, updateData);
      }

      onSuccess();
    } catch (err: any) {
      console.error('Form submission error:', err);
      setError(typeof err.message === 'string' ? err.message : 'Failed to save category');

      // Handle field-specific errors from backend
      if (err.errors) {
        const backendErrors: Record<string, string> = {};
        Object.entries(err.errors).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            backendErrors[key] = value[0];
          } else {
            backendErrors[key] = String(value);
          }
        });
        setErrors(backendErrors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {error && (
        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md">
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        {/* College is now auto-populated from header selection */}
        {/* Category Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-2">
            Category Name <span className="text-destructive">*</span>
          </label>
          <Input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="e.g., General, OBC, SC, ST"
            disabled={isSubmitting}
            className={errors.name ? 'border-destructive' : ''}
          />
          {errors.name && (
            <p className="text-sm text-destructive mt-1">{errors.name}</p>
          )}
        </div>

        {/* Category Code */}
        <div>
          <label htmlFor="code" className="block text-sm font-medium mb-2">
            Category Code <span className="text-destructive">*</span>
          </label>
          <Input
            id="code"
            type="text"
            value={formData.code}
            onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
            placeholder="e.g., GEN, OBC, SC, ST"
            disabled={isSubmitting}
            className={errors.code ? 'border-destructive' : ''}
            maxLength={20}
          />
          {errors.code && (
            <p className="text-sm text-destructive mt-1">{errors.code}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-2">
            Description
          </label>
          <Textarea
            id="description"
            value={formData.description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Enter category description..."
            disabled={isSubmitting}
            rows={4}
            className={errors.description ? 'border-destructive' : ''}
          />
          {errors.description && (
            <p className="text-sm text-destructive mt-1">{errors.description}</p>
          )}
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="min-w-[100px]"
        >
          {isSubmitting ? (
            <>
              <span className="animate-spin mr-2">⏳</span>
              Saving...
            </>
          ) : (
            mode === 'create' ? 'Create Category' : 'Update Category'
          )}
        </Button>
      </div>
    </form>
  );
};
