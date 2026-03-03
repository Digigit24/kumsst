/**
 * Role Form Component with Permissions Management
 * Used for creating and editing roles with granular permissions
 */

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
import { Textarea } from '../../../components/ui/textarea';

import { useQuery } from '@tanstack/react-query';
import { DROPDOWN_PAGE_SIZE } from '../../../config/app.config';
import { collegeApi } from '../../../services/core.service';
import type { Role, RoleCreateInput, RoleUpdateInput } from '../../../types/accounts.types';

interface RoleFormData {
  college: number | '';
  name: string;
  code: string;
  description: string;
  permissions: Record<string, Record<string, boolean>>;
  display_order: number;
  is_active: boolean;
}

interface RoleFormProps {
  mode: 'create' | 'edit';
  role?: Role;
  onSuccess: () => void;
  onCancel: () => void;
  onSubmit: (data: RoleCreateInput | RoleUpdateInput) => Promise<void>;
}

// Define available permissions structure
const AVAILABLE_PERMISSIONS = {
  users: {
    view: 'View Users',
    create: 'Create Users',
    edit: 'Edit Users',
    delete: 'Delete Users',
    manage_permissions: 'Manage User Permissions',
  },
  students: {
    view: 'View Students',
    create: 'Create Students',
    edit: 'Edit Students',
    delete: 'Delete Students',
    view_academic: 'View Academic Records',
    edit_academic: 'Edit Academic Records',
  },
  teachers: {
    view: 'View Teachers',
    create: 'Create Teachers',
    edit: 'Edit Teachers',
    delete: 'Delete Teachers',
    assign_courses: 'Assign Courses',
  },
  courses: {
    view: 'View Courses',
    create: 'Create Courses',
    edit: 'Edit Courses',
    delete: 'Delete Courses',
    manage_enrollment: 'Manage Enrollment',
  },
  departments: {
    view: 'View Departments',
    create: 'Create Departments',
    edit: 'Edit Departments',
    delete: 'Delete Departments',
  },
  colleges: {
    view: 'View Colleges',
    create: 'Create Colleges',
    edit: 'Edit Colleges',
    delete: 'Delete Colleges',
  },
  attendance: {
    view: 'View Attendance',
    mark: 'Mark Attendance',
    edit: 'Edit Attendance',
    reports: 'Generate Reports',
  },
  examinations: {
    view: 'View Exams',
    create: 'Create Exams',
    edit: 'Edit Exams',
    delete: 'Delete Exams',
    manage_marks: 'Manage Marks',
    publish_results: 'Publish Results',
  },
  library: {
    view: 'View Library',
    issue_books: 'Issue Books',
    return_books: 'Return Books',
    manage_inventory: 'Manage Inventory',
  },
  finance: {
    view: 'View Finance',
    create_fees: 'Create Fees',
    collect_fees: 'Collect Fees',
    view_reports: 'View Reports',
    manage_budget: 'Manage Budget',
  },
  reports: {
    view: 'View Reports',
    create: 'Create Reports',
    export: 'Export Reports',
    academic_reports: 'Academic Reports',
    financial_reports: 'Financial Reports',
  },
  settings: {
    view: 'View Settings',
    edit: 'Edit Settings',
    system_config: 'System Configuration',
    manage_roles: 'Manage Roles',
  },
};

export const RoleForm = ({ mode, role, onSuccess, onCancel, onSubmit }: RoleFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<RoleFormData>({
    college: '',
    name: '',
    code: '',
    description: '',
    permissions: {},
    display_order: 0,
    is_active: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: collegesData } = useQuery({
    queryKey: ['colleges'],
    queryFn: () => collegeApi.list({ page_size: DROPDOWN_PAGE_SIZE }),
  });

  const colleges = collegesData?.results ?? [];

  useEffect(() => {
    if (mode === 'edit' && role) {
      setFormData({
        college: role.college,
        name: role.name,
        code: role.code,
        description: role.description || '',
        permissions: role.permissions || {},
        display_order: role.display_order,
        is_active: role.is_active,
      });
    }
  }, [mode, role]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Role name is required';
    if (!formData.code.trim()) newErrors.code = 'Role code is required';
    if (mode === 'create' && !formData.college) newErrors.college = 'College is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof RoleFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handlePermissionChange = (module: string, action: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [module]: {
          ...(prev.permissions[module] || {}),
          [action]: checked,
        },
      },
    }));
  };

  const handleModuleSelectAll = (module: string, checked: boolean) => {
    const modulePermissions = AVAILABLE_PERMISSIONS[module as keyof typeof AVAILABLE_PERMISSIONS];
    const updatedModulePerms: Record<string, boolean> = {};

    Object.keys(modulePermissions).forEach(action => {
      updatedModulePerms[action] = checked;
    });

    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [module]: updatedModulePerms,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const submitData: any = {
        college: Number(formData.college),
        name: formData.name,
        code: formData.code,
        description: formData.description || null,
        permissions: formData.permissions,
        display_order: formData.display_order,
        is_active: formData.is_active,
      };

      if (mode === 'create') {
        submitData.college = Number(formData.college);
      }

      await onSubmit(submitData);
      onSuccess();
    } catch (err: any) {
      setError(typeof err.message === 'string' ? err.message : 'Failed to save role');
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
            {mode === 'edit' && (
              <div>
                <label className="block text-sm font-medium mb-2">College</label>
                <Input value={role?.college_name} disabled />
              </div>
            )}
            {mode === 'create' && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  College <span className="text-destructive">*</span>
                </label>

                <Select
                  value={formData.college ? String(formData.college) : ''}
                  onValueChange={(value) =>
                    setFormData({ ...formData, college: Number(value) })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select college" />
                  </SelectTrigger>

                  <SelectContent>
                    {colleges.map((college: any) => (
                      <SelectItem key={college.id} value={String(college.id)}>
                        {college.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="code" className="block text-sm font-medium mb-2">
                  Role Code <span className="text-destructive">*</span>
                </label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
                  placeholder="e.g., ADMIN, TEACHER"
                  disabled={isSubmitting || mode === 'edit'}
                  className={errors.code ? 'border-destructive' : ''}
                />
                {errors.code && <p className="text-sm text-destructive mt-1">{errors.code}</p>}
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

            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Role Name <span className="text-destructive">*</span>
              </label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Enter role name"
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
                placeholder="Enter role description"
                disabled={isSubmitting}
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Permissions Management */}
        <div>
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-4">
            Permissions
          </h3>
          <div className="space-y-4">
            {Object.entries(AVAILABLE_PERMISSIONS).map(([module, actions]) => {
              const modulePerms = formData.permissions[module] || {};
              const allSelected = Object.keys(actions).every(action => modulePerms[action]);
              const someSelected = Object.keys(actions).some(action => modulePerms[action]);

              return (
                <div key={module} className="border rounded-lg p-4 bg-muted/30">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`module-${module}`}
                        checked={allSelected}
                        onCheckedChange={(checked) => handleModuleSelectAll(module, checked as boolean)}
                        disabled={isSubmitting}
                      />
                      <label
                        htmlFor={`module-${module}`}
                        className="text-sm font-semibold capitalize cursor-pointer"
                      >
                        {module}
                      </label>
                    </div>
                    {someSelected && !allSelected && (
                      <span className="text-xs text-muted-foreground">Partially selected</span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3 ml-6">
                    {Object.entries(actions).map(([action, label]) => (
                      <div key={action} className="flex items-center gap-2">
                        <Checkbox
                          id={`perm-${module}-${action}`}
                          checked={modulePerms[action] || false}
                          onCheckedChange={(checked) => handlePermissionChange(module, action, checked as boolean)}
                          disabled={isSubmitting}
                        />
                        <label
                          htmlFor={`perm-${module}-${action}`}
                          className="text-sm cursor-pointer"
                        >
                          {label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
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
            mode === 'create' ? 'Create Role' : 'Update Role'
          )}
        </Button>
      </div>
    </form>
  );
};
