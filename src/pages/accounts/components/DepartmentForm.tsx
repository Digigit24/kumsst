/**
 * Department Form Component
 * Used for creating and editing departments
 */
import { useState, useEffect } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Checkbox } from '../../../components/ui/checkbox';
import type { Department, DepartmentCreateInput, DepartmentUpdateInput } from '../../../types/accounts.types';

interface DepartmentFormData {
  college: number | '';
  code: string;
  name: string;
  short_name: string;
  description: string;
  hod: string;
  display_order: number;
  is_active: boolean;
}

interface DepartmentFormProps {
  mode: 'create' | 'edit';
  department?: Department;
  onSuccess: () => void;
  onCancel: () => void;
  onSubmit: (data: DepartmentCreateInput | DepartmentUpdateInput) => Promise<void>;
}

export const DepartmentForm = ({ mode, department, onSuccess, onCancel, onSubmit }: DepartmentFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<DepartmentFormData>({
    college: '',
    code: '',
    name: '',
    short_name: '',
    description: '',
    hod: '',
    display_order: 0,
    is_active: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (mode === 'edit' && department) {
      setFormData({
        college: department.college,
        code: department.code,
        name: department.name,
        short_name: department.short_name || '',
        description: department.description || '',
        hod: department.hod || '',
        display_order: department.display_order,
        is_active: department.is_active,
      });
    }
  }, [mode, department]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.code.trim()) newErrors.code = 'Department code is required';
    if (!formData.name.trim()) newErrors.name = 'Department name is required';
    if (mode === 'create' && !formData.college) newErrors.college = 'College is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof DepartmentFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
    if (!validateForm()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const submitData: any = {
        code: formData.code,
        name: formData.name,
        short_name: formData.short_name || null,
        description: formData.description || null,
        hod: formData.hod || null,
        display_order: formData.display_order,
        is_active: formData.is_active,
      };

      if (mode === 'create') {
        submitData.college = Number(formData.college);
      }

      await onSubmit(submitData);
      onSuccess();
    } catch (err: any) {
      setError(typeof err.message === 'string' ? err.message : 'Failed to save department');
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

      <div className="space-y-6">
        {/* Basic Information */}
        <div>
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-4">
            Basic Information
          </h3>
          <div className="space-y-4">
            {mode === 'create' && (
              <div>
                <label htmlFor="college" className="block text-sm font-medium mb-2">
                  College <span className="text-destructive">*</span>
                </label>
                <Input
                  id="college"
                  type="number"
                  value={formData.college}
                  onChange={(e) => handleChange('college', e.target.value)}
                  placeholder="Enter college ID"
                  disabled={isSubmitting}
                  className={errors.college ? 'border-destructive' : ''}
                />
                {errors.college && <p className="text-sm text-destructive mt-1">{errors.college}</p>}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="code" className="block text-sm font-medium mb-2">
                  Department Code <span className="text-destructive">*</span>
                </label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
                  placeholder="e.g., CS, EE, ME"
                  disabled={isSubmitting || mode === 'edit'}
                  className={errors.code ? 'border-destructive' : ''}
                />
                {errors.code && <p className="text-sm text-destructive mt-1">{errors.code}</p>}
              </div>

              <div>
                <label htmlFor="short_name" className="block text-sm font-medium mb-2">
                  Short Name
                </label>
                <Input
                  id="short_name"
                  value={formData.short_name}
                  onChange={(e) => handleChange('short_name', e.target.value)}
                  placeholder="e.g., CSE, ECE"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Department Name <span className="text-destructive">*</span>
              </label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Enter full department name"
                disabled={isSubmitting}
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium mb-2">
                Description
              </label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Enter department description"
                disabled={isSubmitting}
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Management */}
        <div>
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-4">
            Management
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="hod" className="block text-sm font-medium mb-2">
                  Head of Department (HOD)
                </label>
                <Input
                  id="hod"
                  value={formData.hod}
                  onChange={(e) => handleChange('hod', e.target.value)}
                  placeholder="Enter HOD user ID"
                  disabled={isSubmitting}
                />
                <p className="text-xs text-muted-foreground mt-1">Enter the user ID of the HOD</p>
              </div>

              <div>
                <label htmlFor="display_order" className="block text-sm font-medium mb-2">
                  Display Order
                </label>
                <Input
                  id="display_order"
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => handleChange('display_order', parseInt(e.target.value) || 0)}
                  disabled={isSubmitting}
                  min={0}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Settings */}
        <div>
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-4">
            Settings
          </h3>
          <div className="flex items-center gap-2">
            <Checkbox
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => handleChange('is_active', checked)}
              disabled={isSubmitting}
            />
            <label htmlFor="is_active" className="text-sm font-medium cursor-pointer">
              Active
            </label>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} className="min-w-[120px]">
          {isSubmitting ? (
            <>
              <span className="animate-spin mr-2">⏳</span>
              Saving...
            </>
          ) : (
            mode === 'create' ? 'Create Department' : 'Update Department'
          )}
        </Button>
      </div>
    </form>
  );
};
