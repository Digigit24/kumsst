/**
 * Book Category Form Component
 * Used for creating and editing book categories
 */

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '../../../components/common/ConfirmDialog';
import { useTheme } from '../../../contexts/ThemeContext';
import { bookCategoriesApi } from '../../../services/library.service';
import type { BookCategory, BookCategoryCreateInput, BookCategoryUpdateInput } from '../../../types/library.types';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { useCollegeContext } from '../../../contexts/HierarchicalContext';
import { getCurrentUser } from '../../../services/auth.service';
import { useAuth } from '../../../hooks/useAuth';

interface BookCategoryFormProps {
  mode: 'create' | 'edit';
  category?: BookCategory;
  onSuccess: () => void;
  onCancel: () => void;
}

export const BookCategoryForm = ({ mode, category, onSuccess, onCancel }: BookCategoryFormProps) => {
  const { theme } = useTheme();
  const { selectedCollege } = useCollegeContext();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<BookCategoryCreateInput>({
    name: '',
    code: '',
    description: '',
    is_active: true,
    college: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form data for edit mode
  useEffect(() => {
    if (mode === 'edit' && category) {
      setFormData({
        name: category.name,
        code: category.code,
        description: category.description || '',
        is_active: category.is_active,
        college: category.college,
      });
    } else if (mode === 'create') {
      // Get college ID with multiple fallbacks
      const storedUser = getCurrentUser();
      let collegeId = 0;

      // Try multiple sources for college ID
      if (selectedCollege) {
        collegeId = selectedCollege;
      } else if (storedUser?.college) {
        collegeId = storedUser.college;
      } else if (storedUser?.user_roles && storedUser.user_roles.length > 0) {
        // Get primary role's college or first role's college
        const primaryRole = storedUser.user_roles.find(r => r.is_primary) || storedUser.user_roles[0];
        collegeId = primaryRole.college_id;
      } else {
        // Default fallback - you might want to set this to a specific college
        collegeId = 1;
      }
      setFormData(prev => ({ ...prev, college: collegeId }));
    }
  }, [mode, category, selectedCollege, user]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required';
    }

    if (!formData.code.trim()) {
      newErrors.code = 'Category code is required';
    }

    if (!formData.college || formData.college === 0) {
      newErrors.college = 'College ID is missing. Please refresh the page or contact support.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof BookCategoryCreateInput, value: any) => {
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

  const handleDelete = () => {
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!category) return;

    setIsDeleting(true);
    try {
      await bookCategoriesApi.delete(category.id);
      toast.success('Category deleted successfully');
      onSuccess();
    } catch (err: any) {
      toast.error(typeof err.message === 'string' ? err.message : 'Failed to delete category');
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
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
        await bookCategoriesApi.create(formData);
      } else if (category) {
        const updateData: BookCategoryUpdateInput = {
          name: formData.name,
          code: formData.code,
          description: formData.description,
          is_active: formData.is_active,
        };
        await bookCategoriesApi.update(category.id, updateData);
      }

      onSuccess();
    } catch (err: any) {
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
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md">
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {errors.college && (
        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md">
          <p className="text-sm font-medium">{errors.college}</p>
        </div>
      )}

      <div className="space-y-4">
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
            placeholder="e.g., Fiction, Non-Fiction, Reference, Science"
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
            placeholder="e.g., FICT, NFICT, REF, SCI"
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

        {/* Active Status */}
        <div className="flex items-center gap-3">
          <input
            id="is_active"
            type="checkbox"
            checked={formData.is_active}
            onChange={(e) => handleChange('is_active', e.target.checked)}
            disabled={isSubmitting}
            className="w-4 h-4 rounded border-gray-300"
          />
          <label htmlFor="is_active" className="text-sm font-medium">
            Active
          </label>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-between items-center pt-4 border-t">
        {mode === 'edit' && (
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isSubmitting || isDeleting}
          >
            Delete
          </Button>
        )}
        <div className={`flex gap-3 ${mode === 'create' ? 'ml-auto' : ''}`}>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting || isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || isDeleting}
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
      </div>

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Book Category"
        description="Are you sure you want to delete this category? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        loading={isDeleting}
      />
    </form>
  );
};
