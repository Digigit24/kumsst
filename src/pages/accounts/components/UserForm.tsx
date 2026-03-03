/**
 * User Form Component
 * Used for creating and editing users
 */

import { Check, ChevronsUpDown, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Checkbox } from '../../../components/ui/checkbox';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../../../components/ui/command';
import { Input } from '../../../components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '../../../components/ui/popover';
import { useSuperAdminContext } from '../../../contexts/SuperAdminContext';
import { useColleges } from '../../../hooks/useCore';
import { cn } from '../../../lib/utils';
import type { GenderChoices, User, UserCreateInput, UserType, UserUpdateInput } from '../../../types/accounts.types';

interface UserFormData {
  username: string;
  email: string;
  password?: string;
  password_confirm?: string;
  phone: string;
  first_name: string;
  last_name: string;
  middle_name: string;
  gender: GenderChoices | '';
  date_of_birth: string;
  college: number | '';
  assigned_colleges: number[];
  user_type: UserType;
  is_active: boolean;
}

interface UserFormProps {
  mode: 'create' | 'edit';
  user?: User;
  onSuccess: () => void;
  onCancel: () => void;
  onSubmit: (data: UserCreateInput | UserUpdateInput) => Promise<void>;
}

export const UserForm = ({ mode, user, onSuccess, onCancel, onSubmit }: UserFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const { selectedCollege } = useSuperAdminContext();
  const { data: collegesData } = useColleges({ is_active: true, page_size: 100 });
  const colleges = collegesData?.results || [];
  const [openCombobox, setOpenCombobox] = useState(false);

  // Get initial college from global selection or localStorage
  const getInitialCollege = () => {
    if (isSuperAdmin && selectedCollege) {
      return selectedCollege;
    }
    const storedUser = localStorage.getItem('kumss_user');
    if (storedUser) {
      const currentUser = JSON.parse(storedUser);
      return currentUser.college || '';
    }
    return '';
  };

  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    email: '',
    password: '',
    password_confirm: '',
    phone: '',
    first_name: '',
    last_name: '',
    middle_name: '',
    gender: '',
    date_of_birth: '',
    college: getInitialCollege(),
    assigned_colleges: [],
    user_type: 'student',
    is_active: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Check if current user is super admin
  useEffect(() => {
    const storedUser = localStorage.getItem('kumss_user');
    if (storedUser) {
      const currentUser = JSON.parse(storedUser);
      const userType = currentUser.user_type || currentUser.userType;
      setIsSuperAdmin(userType === 'super_admin');
    }
  }, []);

  useEffect(() => {
    if (mode === 'edit' && user) {
      setFormData({
        username: user.username,
        email: user.email,
        phone: user.phone || '',
        first_name: user.first_name,
        last_name: user.last_name,
        middle_name: user.middle_name || '',
        gender: user.gender || '',
        date_of_birth: user.date_of_birth || '',
        college: user.college || '',
        assigned_colleges: user.assigned_colleges || [],
        user_type: user.user_type,
        is_active: user.is_active,
      });
    }
  }, [mode, user]);

  // Auto-update college field when global selection changes (for super admins in create mode)
  useEffect(() => {
    if (mode === 'create' && isSuperAdmin && selectedCollege !== undefined) {
      setFormData(prev => ({ ...prev, college: selectedCollege || '' }));
    }
  }, [selectedCollege, isSuperAdmin, mode]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (mode === 'create') {
      if (!formData.username.trim()) newErrors.username = 'Username is required';
      if (!formData.password) newErrors.password = 'Password is required';
      else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
      if (!formData.password_confirm) newErrors.password_confirm = 'Please confirm password';
      else if (formData.password !== formData.password_confirm) newErrors.password_confirm = 'Passwords do not match';
      // College is required only if super admin and no college selected, AND not a central store manager, accountant, or hostel manager
      if (isSuperAdmin && !formData.college && !['central_manager', 'accountant', 'hostel_manager', 'construction_head', 'jr_engineer', 'clerk'].includes(formData.user_type)) newErrors.college = 'College is required';
    }

    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.first_name.trim()) newErrors.first_name = 'First name is required';
    if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof UserFormData, value: any) => {
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
        email: formData.email,
        phone: formData.phone || null,
        first_name: formData.first_name,
        last_name: formData.last_name,
        middle_name: formData.middle_name || null,
        gender: formData.gender || null,
        date_of_birth: formData.date_of_birth || null,
      };

      if (mode === 'create') {
        submitData.username = formData.username;
        submitData.password = formData.password;
        submitData.password_confirm = formData.password_confirm;
        submitData.user_type = formData.user_type;
        submitData.is_active = formData.is_active;

        // Handle college - for non-super admins, get from localStorage if not in formData
        // Skip for accountants and global roles as they are handled differently or globally
        if (!['accountant', 'hostel_manager', 'central_manager', 'construction_head', 'jr_engineer', 'clerk'].includes(formData.user_type)) {
          if (formData.college) {
            submitData.college = Number(formData.college);
          } else if (!isSuperAdmin) {
            // Get current user's college for non-super admins
            const storedUser = localStorage.getItem('kumss_user');
            if (storedUser) {
              const currentUser = JSON.parse(storedUser);
              if (currentUser.college) {
                submitData.college = Number(currentUser.college);
              }
            }
          }
        }

        if (formData.user_type === 'accountant') {
          submitData.assigned_colleges = formData.assigned_colleges;
        }
      }

      if (mode === 'edit' && formData.user_type === 'accountant') {
        submitData.assigned_colleges = formData.assigned_colleges;
      }

      await onSubmit(submitData);
      onSuccess();
    } catch (err: any) {
      console.error('Form submission error:', err);
      setError(typeof err.message === 'string' ? err.message : 'Failed to save user');
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
        {/* Account Information */}
        <div>
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-4">
            Account Information
          </h3>
          <div className="space-y-4">
            {mode === 'create' && (
              <>
                <div>
                  <label htmlFor="username" className="block text-sm font-medium mb-2">
                    Username <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => handleChange('username', e.target.value.toLowerCase())}
                    placeholder="Enter username"
                    disabled={isSubmitting}
                    className={errors.username ? 'border-destructive' : ''}
                  />
                  {errors.username && <p className="text-sm text-destructive mt-1">{errors.username}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium mb-2">
                      Password <span className="text-destructive">*</span>
                    </label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                      placeholder="Enter password"
                      disabled={isSubmitting}
                      className={errors.password ? 'border-destructive' : ''}
                    />
                    {errors.password && <p className="text-sm text-destructive mt-1">{errors.password}</p>}
                  </div>

                  <div>
                    <label htmlFor="password_confirm" className="block text-sm font-medium mb-2">
                      Confirm Password <span className="text-destructive">*</span>
                    </label>
                    <Input
                      id="password_confirm"
                      type="password"
                      value={formData.password_confirm}
                      onChange={(e) => handleChange('password_confirm', e.target.value)}
                      placeholder="Confirm password"
                      disabled={isSubmitting}
                      className={errors.password_confirm ? 'border-destructive' : ''}
                    />
                    {errors.password_confirm && <p className="text-sm text-destructive mt-1">{errors.password_confirm}</p>}
                  </div>
                </div>

                {/* College is now auto-populated from header selection */}

                <div>
                  <label htmlFor="user_type" className="block text-sm font-medium mb-2">
                    Role <span className="text-destructive">*</span>
                  </label>
                  <select
                    id="user_type"
                    value={formData.user_type}
                    onChange={(e) => handleChange('user_type', e.target.value as UserType)}
                    disabled={isSubmitting}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                    <option value="staff">Staff</option>
                    <option value="parent">Parent</option>
                    <option value="hr">HR</option>
                    <option value="store_manager">Store Manager</option>
                    <option value="central_manager">Central Store Manager</option>
                    <option value="library_manager">Library Manager</option>
                    <option value="hostel_warden">Hostel Warden</option>
                    <option value="hostel_manager">Hostel Manager</option>
                    <option value="accountant">Accountant</option>
                    <option value="construction_head">Construction Head</option>
                    <option value="jr_engineer">Jr Engineer</option>
                    <option value="clerk">Clerk</option>
                    <option value="college_admin">College Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>


              </>
            )}

            {formData.user_type === 'accountant' && (
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-2">
                  Assigned Colleges (Optional)
                </label>
                <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openCombobox}
                      className="w-full justify-between h-auto min-h-[40px]"
                    >
                      {formData.assigned_colleges.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {formData.assigned_colleges.map((collegeId) => {
                            const college = colleges.find((c) => c.id === collegeId);
                            return (
                              <Badge key={collegeId} variant="secondary" className="mr-1">
                                {college?.name || collegeId}
                                <span
                                  className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setFormData((prev) => ({
                                      ...prev,
                                      assigned_colleges: prev.assigned_colleges.filter((id) => id !== collegeId),
                                    }));
                                  }}
                                >
                                  <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                                </span>
                              </Badge>
                            );
                          })}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Select colleges (Leave empty for ALL)</span>
                      )}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] p-0">
                    <Command>
                      <CommandInput placeholder="Search colleges..." />
                      <CommandList>
                        <CommandEmpty>No college found.</CommandEmpty>
                        <CommandGroup className="max-h-64 overflow-auto">
                          {colleges.map((college) => (
                            <CommandItem
                              key={college.id}
                              value={college.name}
                              onSelect={() => {
                                setFormData((prev) => {
                                  const isSelected = prev.assigned_colleges.includes(college.id);
                                  return {
                                    ...prev,
                                    assigned_colleges: isSelected
                                      ? prev.assigned_colleges.filter((id) => id !== college.id)
                                      : [...prev.assigned_colleges, college.id],
                                  };
                                });
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  formData.assigned_colleges.includes(college.id)
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {college.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <p className="text-[10px] text-muted-foreground mt-1.5">
                  * If no colleges are selected, the accountant will have access to <strong>ALL</strong> colleges.
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  Email <span className="text-destructive">*</span>
                </label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="user@example.com"
                  disabled={isSubmitting}
                  className={errors.email ? 'border-destructive' : ''}
                />
                {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium mb-2">
                  Phone
                </label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="Enter phone number"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>
        </div>


        {/* Personal Information */}
        <div>
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-4">
            Personal Information
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label htmlFor="first_name" className="block text-sm font-medium mb-2">
                  First Name <span className="text-destructive">*</span>
                </label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => handleChange('first_name', e.target.value)}
                  placeholder="Enter first name"
                  disabled={isSubmitting}
                  className={errors.first_name ? 'border-destructive' : ''}
                />
                {errors.first_name && <p className="text-sm text-destructive mt-1">{errors.first_name}</p>}
              </div>

              <div>
                <label htmlFor="middle_name" className="block text-sm font-medium mb-2">
                  Middle Name
                </label>
                <Input
                  id="middle_name"
                  value={formData.middle_name}
                  onChange={(e) => handleChange('middle_name', e.target.value)}
                  placeholder="Enter middle name"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label htmlFor="last_name" className="block text-sm font-medium mb-2">
                  Last Name <span className="text-destructive">*</span>
                </label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => handleChange('last_name', e.target.value)}
                  placeholder="Enter last name"
                  disabled={isSubmitting}
                  className={errors.last_name ? 'border-destructive' : ''}
                />
                {errors.last_name && <p className="text-sm text-destructive mt-1">{errors.last_name}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="gender" className="block text-sm font-medium mb-2">
                  Gender
                </label>
                <select
                  id="gender"
                  value={formData.gender}
                  onChange={(e) => handleChange('gender', e.target.value)}
                  disabled={isSubmitting}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="date_of_birth" className="block text-sm font-medium mb-2">
                  Date of Birth
                </label>
                <Input
                  id="date_of_birth"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => handleChange('date_of_birth', e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Settings */}
        {mode === 'create' && (
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
        )}
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
            mode === 'create' ? 'Create User' : 'Update User'
          )}
        </Button>
      </div>
    </form >
  );
};
