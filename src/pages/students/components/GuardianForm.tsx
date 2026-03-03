/**
 * Guardian Form Component
 * Used for creating and editing guardians (parents/guardians)
 */

import { DROPDOWN_PAGE_SIZE } from '@/config/app.config';
import { useEffect, useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Textarea } from '../../../components/ui/textarea';
import { useTheme } from '../../../contexts/ThemeContext';
import { useUsersSWR } from '../../../hooks/useAccountsSWR';
import { useStudentsSWR } from '../../../hooks/useStudentsSWR';
import { userApi } from '../../../services/accounts.service';
import { guardianApi, studentGuardianApi } from '../../../services/students.service';
import type { UserCreateInput } from '../../../types/accounts.types';

import { Link as LinkIcon, UserPlus, UserX } from 'lucide-react';
import { CardSelect } from '../../../components/ui/card-select';
import { SearchableSelect } from '../../../components/ui/searchable-select';
import type { Guardian, GuardianCreateInput, GuardianUpdateInput } from '../../../types/students.types';

interface GuardianFormProps {
  mode: 'create' | 'edit';
  guardian?: Guardian;
  onSuccess: () => void;
  onCancel: () => void;
  collegeId?: number | null;
  initialStudent?: { id: number; name: string };
}

type GuardianFormData = {
  accountMode: 'none' | 'create' | 'existing'; // New: choose account type
  user: string;
  username: string; // For new user creation
  password: string;
  confirmPassword: string;
  first_name: string;
  last_name: string;
  middle_name: string;
  relation: string;
  phone: string;
  email: string;
  alternate_phone: string;
  occupation: string;
  annual_income: string;
  address: string;
  photo: string;
  college: number | null;
};

const getDefaultCollegeId = (): number | null => {
  try {
    const storedUser = localStorage.getItem('kumss_user');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      return parsed.college ?? parsed.college_id ?? null;
    }
  } catch (err) {
    console.error('Failed to read default college id', err);
  }
  return null;
};

export const GuardianForm = ({ mode, guardian, onSuccess, onCancel, collegeId, initialStudent }: GuardianFormProps) => {
  const { theme } = useTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(initialStudent?.id || null);

  const { results: users, isLoading: loadingUsers } = useUsersSWR({
    user_type: 'parent',
    page_size: DROPDOWN_PAGE_SIZE,
    is_active: true
  });

  const { results: studentsList, isLoading: loadingStudents } = useStudentsSWR({
    page_size: DROPDOWN_PAGE_SIZE, // Limit for dropdown
    is_active: true,
    ...(collegeId ? { college: collegeId } : {}),
  });

  const [formData, setFormData] = useState<GuardianFormData>({
    accountMode: 'none',
    user: '',
    username: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    middle_name: '',
    relation: '',
    phone: '',
    email: '',
    alternate_phone: '',
    occupation: '',
    annual_income: '',
    address: '',
    photo: '',
    college: collegeId ?? getDefaultCollegeId(),
  });

  const [errors, setErrors] = useState<Record<string, string>>({});



  // Initialize form data for edit mode
  useEffect(() => {
    if (mode === 'edit' && guardian) {
      setFormData((prev) => ({
        ...prev,
        accountMode: guardian.user ? 'existing' : 'none',
        user: guardian.user ? String(guardian.user) : '',
        first_name: guardian.first_name,
        last_name: guardian.last_name,
        middle_name: guardian.middle_name || '',
        relation: guardian.relation,
        phone: guardian.phone,
        email: guardian.email || '',
        alternate_phone: guardian.alternate_phone || '',
        occupation: guardian.occupation || '',
        annual_income: guardian.annual_income || '',
        address: guardian.address || '',
        photo: guardian.photo || '',
      }));
    }
  }, [mode, guardian]);

  // Update selected student if initialStudent prop changes (though usually it's stable)
  useEffect(() => {
    if (initialStudent) {
      setSelectedStudentId(initialStudent.id);
    }
  }, [initialStudent]);

  // Update college when prop changes
  useEffect(() => {
    if (collegeId !== undefined) {
      setFormData(prev => ({ ...prev, college: collegeId }));
    }
  }, [collegeId]);

  // Clear selected student if college changes - ONLY if not forced by initialStudent
  useEffect(() => {
    if (!initialStudent) {
      setSelectedStudentId(null);
    }
  }, [collegeId, initialStudent]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Account mode validation
    if (formData.accountMode === 'create') {
      if (!formData.username.trim()) {
        newErrors.username = 'Username is required';
      } else if (formData.username.length < 3) {
        newErrors.username = 'Username must be at least 3 characters';
      } else if (!/^[a-z0-9_]+$/.test(formData.username)) {
        newErrors.username = 'Username must be lowercase letters, numbers, and underscores only';
      }

      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }

      if (!formData.email.trim()) {
        newErrors.email = 'Email is required for new user accounts';
      }
    } else if (formData.accountMode === 'existing') {
      if (!formData.user) {
        newErrors.user = 'Please select an existing user';
      }
    }

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    }

    if (!formData.relation) {
      newErrors.relation = 'Relation is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    // Validate phone format
    if (formData.phone && !/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Phone number must be 10 digits';
    }

    // Validate email if provided
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof GuardianFormData, value: any) => {
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
      let userId: string | null = null;

      // Step 1: Handle user account creation/linking
      if (formData.accountMode === 'create') {
        // Create new user account
        const collegeId = formData.college ?? getDefaultCollegeId();
        if (!collegeId) {
          throw new Error('College is required for user account creation');
        }

        const userData: UserCreateInput = {
          username: formData.username.toLowerCase().trim(),
          password: formData.password,
          password_confirm: formData.password,
          email: formData.email,
          first_name: formData.first_name,
          middle_name: formData.middle_name || undefined,
          last_name: formData.last_name,
          user_type: 'parent',
          phone: formData.phone,
          is_active: true,
          college: collegeId,
        };

        const createdUser = await userApi.create(userData);
        if (!createdUser || !createdUser.id) {
          throw new Error('Failed to create user account');
        }
        userId = createdUser.id;
      } else if (formData.accountMode === 'existing') {
        // Use existing user
        userId = formData.user || null;
      }

      // Step 2: Create/update guardian record
      const cleanedData: GuardianCreateInput = {
        user: userId ? Number(userId) : null,
        first_name: formData.first_name,
        middle_name: formData.middle_name || null,
        last_name: formData.last_name,
        relation: formData.relation,
        email: formData.email || null,
        phone: formData.phone,
        alternate_phone: formData.alternate_phone || null,
        occupation: formData.occupation || null,
        annual_income: formData.annual_income || null,
        address: formData.address || null,
        photo: formData.photo || null,
      };

      if (mode === 'create') {
        const createdGuardian = await guardianApi.create(cleanedData);

        // Step 3: Link to student if selected
        if (selectedStudentId && createdGuardian?.id) {
          try {
            await studentGuardianApi.create({
              student: selectedStudentId,
              guardian: createdGuardian.id,
              is_primary: false, // Default
              is_emergency_contact: false, // Default
            });
          } catch (linkError) {
            console.error('Failed to link student:', linkError);
            // We don't block success here, but maybe show a warning toast?
            // For now, simpler to just log it as the main guardian is created.
          }
        }
      } else if (guardian) {
        await guardianApi.update(guardian.id, cleanedData as GuardianUpdateInput);
      }

      onSuccess();
    } catch (err: any) {
      console.error('Form submission error:', err);

      // Enhanced error messages
      let errorMessage = 'Failed to save guardian';
      if (err.errors) {
        if (err.errors.username) {
          errorMessage = `Username error: ${err.errors.username[0]}`;
        } else if (err.errors.email) {
          errorMessage = `Email error: ${err.errors.email[0]}`;
        } else {
          errorMessage = err.message || errorMessage;
        }
      } else {
        errorMessage = err.message || errorMessage;
      }

      setError(errorMessage);

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

  const relationOptions = [
    { value: 'father', label: 'Father' },
    { value: 'mother', label: 'Mother' },
    { value: 'guardian', label: 'Guardian' },
    { value: 'uncle', label: 'Uncle' },
    { value: 'aunt', label: 'Aunt' },
    { value: 'grandfather', label: 'Grandfather' },
    { value: 'grandmother', label: 'Grandmother' },
    { value: 'other', label: 'Other' },
  ];

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {error && (
        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md">
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
            Basic Information
          </h3>

          {/* Account Mode Selection */}

          {/* Student Selection (Display read-only if initialStudent is present, else Select) */}
          {(mode === 'create' || initialStudent) && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Link Student {(!initialStudent) && <span className="text-muted-foreground text-xs">(Optional)</span>}
              </label>
              {initialStudent ? (
                <div className="p-2 border rounded-md bg-muted/40 font-medium">
                  {initialStudent.name}
                </div>
              ) : (
                <SearchableSelect
                  options={studentsList.map(s => ({
                    value: s.id,
                    label: s.full_name,
                    subtitle: s.admission_number
                  })) || []}
                  value={selectedStudentId || ''}
                  onChange={(val) => setSelectedStudentId(Number(val))}
                  placeholder="Select student to link"
                  searchPlaceholder="Search by name or admission no..."
                  isLoading={loadingStudents}
                  className="w-full"
                />
              )}
              {(!initialStudent) ? (
                <p className="text-xs text-muted-foreground mt-1">
                  The guardian will be linked to this student as 'Father' by default (can be changed later)
                </p>
              ) : (
                <p className="text-xs text-muted-foreground mt-1">
                  Editing guardian for this student
                </p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">
              User Account <span className="text-muted-foreground text-xs">(Optional - for portal access)</span>
            </label>
            <div className="mb-6">
              <CardSelect
                options={[
                  { value: 'none', label: 'No Account', description: 'Just records, no login', icon: UserX },
                  { value: 'create', label: 'Create Account', description: 'New portal access', icon: UserPlus },
                  { value: 'existing', label: 'Link Account', description: 'Connect existing user', icon: LinkIcon },
                ]}
                value={formData.accountMode}
                onChange={(val: any) => handleChange('accountMode', val)}
                columns={3}
              />
            </div>

            {/* Create New User Fields */}
            {formData.accountMode === 'create' && (
              <div className="space-y-4 p-4 border rounded-md bg-muted/30">
                <p className="text-sm text-muted-foreground mb-3">
                  Create a new user account for guardian portal access
                </p>

                <div>
                  <label htmlFor="username" className="block text-sm font-medium mb-2">
                    Username <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id="username"
                    type="text"
                    value={formData.username}
                    onChange={(e) => handleChange('username', e.target.value.toLowerCase())}
                    placeholder="username"
                    disabled={isSubmitting}
                    className={errors.username ? 'border-destructive' : ''}
                  />
                  {errors.username && (
                    <p className="text-sm text-destructive mt-1">{errors.username}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    Lowercase letters, numbers, and underscores only
                  </p>
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
                    {errors.password && (
                      <p className="text-sm text-destructive mt-1">{errors.password}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                      Confirm Password <span className="text-destructive">*</span>
                    </label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleChange('confirmPassword', e.target.value)}
                      placeholder="Re-enter password"
                      disabled={isSubmitting}
                      className={errors.confirmPassword ? 'border-destructive' : ''}
                    />
                    {errors.confirmPassword && (
                      <p className="text-sm text-destructive mt-1">{errors.confirmPassword}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Link Existing User */}
            {formData.accountMode === 'existing' && (
              <div className="p-4 border rounded-md bg-muted/30">
                <Select
                  value={formData.user || undefined}
                  onValueChange={(v) => handleChange('user', v || '')}
                  disabled={isSubmitting || loadingUsers}
                >
                  <SelectTrigger className={errors.user ? 'border-destructive' : ''}>
                    <SelectValue placeholder={loadingUsers ? "Loading users..." : "Select existing user"} />
                  </SelectTrigger>
                  <SelectContent>
                    {users.length === 0 ? (
                      <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                        No parent users available
                      </div>
                    ) : (
                      users.map((user) => (
                        <SelectItem key={user.id} value={String(user.id)}>
                          {user.full_name || user.username} {user.email && `(${user.email})`}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {errors.user && (
                  <p className="text-sm text-destructive mt-2">{errors.user}</p>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  Select a user who doesn't have a guardian record yet
                </p>
              </div>
            )}
          </div>

          {/* Photo URL */}
          <div>
            <label htmlFor="photo" className="block text-sm font-medium mb-2">
              Photo URL
            </label>
            <Input
              id="photo"
              type="text"
              value={formData.photo || ''}
              onChange={(e) => handleChange('photo', e.target.value)}
              placeholder="Enter photo URL"
              disabled={isSubmitting}
            />
          </div>

          {/* First Name */}
          <div>
            <label htmlFor="first_name" className="block text-sm font-medium mb-2">
              First Name <span className="text-destructive">*</span>
            </label>
            <Input
              id="first_name"
              type="text"
              value={formData.first_name}
              onChange={(e) => handleChange('first_name', e.target.value)}
              placeholder="Enter first name"
              disabled={isSubmitting}
              className={errors.first_name ? 'border-destructive' : ''}
            />
            {errors.first_name && (
              <p className="text-sm text-destructive mt-1">{errors.first_name}</p>
            )}
          </div>

          {/* Middle Name */}
          <div>
            <label htmlFor="middle_name" className="block text-sm font-medium mb-2">
              Middle Name
            </label>
            <Input
              id="middle_name"
              type="text"
              value={formData.middle_name || ''}
              onChange={(e) => handleChange('middle_name', e.target.value)}
              placeholder="Enter middle name"
              disabled={isSubmitting}
            />
          </div>

          {/* Last Name */}
          <div>
            <label htmlFor="last_name" className="block text-sm font-medium mb-2">
              Last Name <span className="text-destructive">*</span>
            </label>
            <Input
              id="last_name"
              type="text"
              value={formData.last_name}
              onChange={(e) => handleChange('last_name', e.target.value)}
              placeholder="Enter last name"
              disabled={isSubmitting}
              className={errors.last_name ? 'border-destructive' : ''}
            />
            {errors.last_name && (
              <p className="text-sm text-destructive mt-1">{errors.last_name}</p>
            )}
          </div>

          {/* Relation */}
          <div>
            <label htmlFor="relation" className="block text-sm font-medium mb-2">
              Relation <span className="text-destructive">*</span>
            </label>
            <Select value={formData.relation} onValueChange={(value) => handleChange('relation', value)}>
              <SelectTrigger className={errors.relation ? 'border-destructive' : ''}>
                <SelectValue placeholder="Select relation" />
              </SelectTrigger>
              <SelectContent>
                {relationOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.relation && (
              <p className="text-sm text-destructive mt-1">{errors.relation}</p>
            )}
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-4">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
            Contact Information
          </h3>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium mb-2">
              Phone Number <span className="text-destructive">*</span>
            </label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="Enter 10-digit phone number"
              disabled={isSubmitting}
              className={errors.phone ? 'border-destructive' : ''}
              maxLength={10}
            />
            {errors.phone && (
              <p className="text-sm text-destructive mt-1">{errors.phone}</p>
            )}
          </div>

          {/* Alternate Phone */}
          <div>
            <label htmlFor="alternate_phone" className="block text-sm font-medium mb-2">
              Alternate Phone
            </label>
            <Input
              id="alternate_phone"
              type="tel"
              value={formData.alternate_phone || ''}
              onChange={(e) => handleChange('alternate_phone', e.target.value)}
              placeholder="Enter alternate phone number"
              disabled={isSubmitting}
              maxLength={10}
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email {formData.accountMode === 'create' && <span className="text-destructive">*</span>}
            </label>
            <Input
              id="email"
              type="email"
              value={formData.email || ''}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="Enter email address"
              disabled={isSubmitting}
              className={errors.email ? 'border-destructive' : ''}
            />
            {errors.email && (
              <p className="text-sm text-destructive mt-1">{errors.email}</p>
            )}
            {formData.accountMode === 'create' && (
              <p className="text-xs text-muted-foreground mt-1">
                Email is required for user account creation
              </p>
            )}
          </div>
        </div>

        {/* Professional Information */}
        <div className="space-y-4">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
            Professional Information
          </h3>

          {/* Occupation */}
          <div>
            <label htmlFor="occupation" className="block text-sm font-medium mb-2">
              Occupation
            </label>
            <Input
              id="occupation"
              type="text"
              value={formData.occupation || ''}
              onChange={(e) => handleChange('occupation', e.target.value)}
              placeholder="Enter occupation"
              disabled={isSubmitting}
            />
          </div>

          {/* Annual Income */}
          <div>
            <label htmlFor="annual_income" className="block text-sm font-medium mb-2">
              Annual Income
            </label>
            <Input
              id="annual_income"
              type="number"
              value={formData.annual_income || ''}
              onChange={(e) => handleChange('annual_income', e.target.value)}
              placeholder="Enter annual income"
              disabled={isSubmitting}
              step="0.01"
            />
          </div>
        </div>

        {/* Address */}
        <div>
          <label htmlFor="address" className="block text-sm font-medium mb-2">
            Address
          </label>
          <Textarea
            id="address"
            value={formData.address || ''}
            onChange={(e) => handleChange('address', e.target.value)}
            placeholder="Enter complete address"
            disabled={isSubmitting}
            rows={3}
          />
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
            mode === 'create' ? 'Create Guardian' : 'Update Guardian'
          )}
        </Button>
      </div>
    </form>
  );
};
