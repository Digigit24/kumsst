/**
 * College Form Component
 * Used for creating and editing colleges
 */

import { useState, useEffect } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Checkbox } from '../../../components/ui/checkbox';

interface College {
  id: number;
  code: string;
  name: string;
  short_name: string;
  email: string;
  phone: string;
  website?: string | null;
  address_line1: string;
  address_line2?: string | null;
  city: string;
  state: string;
  pincode: string;
  country: string;
  logo?: string | null;
  established_date?: string | null;
  affiliation_number?: string | null;
  primary_color: string;
  secondary_color: string;
  is_main: boolean;
  display_order: number;
  is_active: boolean;
  settings?: any;
}

interface CollegeFormData {
  code: string;
  name: string;
  short_name: string;
  email: string;
  phone: string;
  website?: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  established_date?: string;
  affiliation_number?: string;
  primary_color: string;
  secondary_color: string;
  is_main: boolean;
  display_order: number;
  is_active: boolean;
}

interface CollegeFormProps {
  mode: 'create' | 'edit';
  college?: College;
  onSuccess: () => void;
  onCancel: () => void;
  onSubmit: (data: CollegeFormData) => Promise<void>;
}

export const CollegeForm = ({ mode, college, onSuccess, onCancel, onSubmit }: CollegeFormProps) => {
  const { theme } = useTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<CollegeFormData>({
    code: '',
    name: '',
    short_name: '',
    email: '',
    phone: '',
    website: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    established_date: '',
    affiliation_number: '',
    primary_color: '#1976d2',
    secondary_color: '#dc004e',
    is_main: false,
    display_order: 0,
    is_active: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (mode === 'edit' && college) {
      setFormData({
        code: college.code,
        name: college.name,
        short_name: college.short_name,
        email: college.email,
        phone: college.phone,
        website: college.website || '',
        address_line1: college.address_line1,
        address_line2: college.address_line2 || '',
        city: college.city,
        state: college.state,
        pincode: college.pincode,
        country: college.country,
        established_date: college.established_date || '',
        affiliation_number: college.affiliation_number || '',
        primary_color: college.primary_color,
        secondary_color: college.secondary_color,
        is_main: college.is_main,
        display_order: college.display_order,
        is_active: college.is_active,
      });
    }
  }, [mode, college]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.code.trim()) newErrors.code = 'College code is required';
    if (!formData.name.trim()) newErrors.name = 'College name is required';
    if (!formData.short_name.trim()) newErrors.short_name = 'Short name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!formData.address_line1.trim()) newErrors.address_line1 = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.pincode.trim()) newErrors.pincode = 'Pincode is required';
    else if (!/^\d{6}$/.test(formData.pincode)) newErrors.pincode = 'Pincode must be 6 digits';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof CollegeFormData, value: any) => {
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
      await onSubmit(formData);
      onSuccess();
    } catch (err: any) {
      setError(typeof err.message === 'string' ? err.message : 'Failed to save college');
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="code" className="block text-sm font-medium mb-2">
                  College Code <span className="text-destructive">*</span>
                </label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
                  placeholder="e.g., KUMSS01"
                  disabled={isSubmitting || mode === 'edit'}
                  className={errors.code ? 'border-destructive' : ''}
                />
                {errors.code && <p className="text-sm text-destructive mt-1">{errors.code}</p>}
              </div>

              <div>
                <label htmlFor="short_name" className="block text-sm font-medium mb-2">
                  Short Name <span className="text-destructive">*</span>
                </label>
                <Input
                  id="short_name"
                  value={formData.short_name}
                  onChange={(e) => handleChange('short_name', e.target.value)}
                  placeholder="e.g., KUMSS"
                  disabled={isSubmitting}
                  className={errors.short_name ? 'border-destructive' : ''}
                />
                {errors.short_name && <p className="text-sm text-destructive mt-1">{errors.short_name}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Full Name <span className="text-destructive">*</span>
              </label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Enter full college name"
                disabled={isSubmitting}
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
            </div>

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
                  placeholder="college@example.com"
                  disabled={isSubmitting}
                  className={errors.email ? 'border-destructive' : ''}
                />
                {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium mb-2">
                  Phone <span className="text-destructive">*</span>
                </label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="Enter phone number"
                  disabled={isSubmitting}
                  className={errors.phone ? 'border-destructive' : ''}
                />
                {errors.phone && <p className="text-sm text-destructive mt-1">{errors.phone}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="website" className="block text-sm font-medium mb-2">
                  Website
                </label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleChange('website', e.target.value)}
                  placeholder="https://college.edu"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label htmlFor="affiliation_number" className="block text-sm font-medium mb-2">
                  Affiliation Number
                </label>
                <Input
                  id="affiliation_number"
                  value={formData.affiliation_number}
                  onChange={(e) => handleChange('affiliation_number', e.target.value)}
                  placeholder="Enter affiliation number"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div>
              <label htmlFor="established_date" className="block text-sm font-medium mb-2">
                Established Date
              </label>
              <Input
                id="established_date"
                type="date"
                value={formData.established_date}
                onChange={(e) => handleChange('established_date', e.target.value)}
                disabled={isSubmitting}
              />
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div>
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-4">
            Address Information
          </h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="address_line1" className="block text-sm font-medium mb-2">
                Address Line 1 <span className="text-destructive">*</span>
              </label>
              <Input
                id="address_line1"
                value={formData.address_line1}
                onChange={(e) => handleChange('address_line1', e.target.value)}
                placeholder="Enter address"
                disabled={isSubmitting}
                className={errors.address_line1 ? 'border-destructive' : ''}
              />
              {errors.address_line1 && <p className="text-sm text-destructive mt-1">{errors.address_line1}</p>}
            </div>

            <div>
              <label htmlFor="address_line2" className="block text-sm font-medium mb-2">
                Address Line 2
              </label>
              <Input
                id="address_line2"
                value={formData.address_line2}
                onChange={(e) => handleChange('address_line2', e.target.value)}
                placeholder="Enter address line 2 (optional)"
                disabled={isSubmitting}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="city" className="block text-sm font-medium mb-2">
                  City <span className="text-destructive">*</span>
                </label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  placeholder="Enter city"
                  disabled={isSubmitting}
                  className={errors.city ? 'border-destructive' : ''}
                />
                {errors.city && <p className="text-sm text-destructive mt-1">{errors.city}</p>}
              </div>

              <div>
                <label htmlFor="state" className="block text-sm font-medium mb-2">
                  State <span className="text-destructive">*</span>
                </label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => handleChange('state', e.target.value)}
                  placeholder="Enter state"
                  disabled={isSubmitting}
                  className={errors.state ? 'border-destructive' : ''}
                />
                {errors.state && <p className="text-sm text-destructive mt-1">{errors.state}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="pincode" className="block text-sm font-medium mb-2">
                  Pincode <span className="text-destructive">*</span>
                </label>
                <Input
                  id="pincode"
                  value={formData.pincode}
                  onChange={(e) => handleChange('pincode', e.target.value)}
                  placeholder="Enter 6-digit pincode"
                  disabled={isSubmitting}
                  maxLength={6}
                  className={errors.pincode ? 'border-destructive' : ''}
                />
                {errors.pincode && <p className="text-sm text-destructive mt-1">{errors.pincode}</p>}
              </div>

              <div>
                <label htmlFor="country" className="block text-sm font-medium mb-2">
                  Country <span className="text-destructive">*</span>
                </label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => handleChange('country', e.target.value)}
                  placeholder="Enter country"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Branding */}
        <div>
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-4">
            Branding
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="primary_color" className="block text-sm font-medium mb-2">
                Primary Color
              </label>
              <div className="flex gap-2">
                <Input
                  id="primary_color"
                  type="color"
                  value={formData.primary_color}
                  onChange={(e) => handleChange('primary_color', e.target.value)}
                  disabled={isSubmitting}
                  className="w-20 h-10"
                />
                <Input
                  value={formData.primary_color}
                  onChange={(e) => handleChange('primary_color', e.target.value)}
                  disabled={isSubmitting}
                  placeholder="#1976d2"
                />
              </div>
            </div>

            <div>
              <label htmlFor="secondary_color" className="block text-sm font-medium mb-2">
                Secondary Color
              </label>
              <div className="flex gap-2">
                <Input
                  id="secondary_color"
                  type="color"
                  value={formData.secondary_color}
                  onChange={(e) => handleChange('secondary_color', e.target.value)}
                  disabled={isSubmitting}
                  className="w-20 h-10"
                />
                <Input
                  value={formData.secondary_color}
                  onChange={(e) => handleChange('secondary_color', e.target.value)}
                  disabled={isSubmitting}
                  placeholder="#dc004e"
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
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Checkbox
                id="is_main"
                checked={formData.is_main}
                onCheckedChange={(checked) => handleChange('is_main', checked)}
                disabled={isSubmitting}
              />
              <label htmlFor="is_main" className="text-sm font-medium cursor-pointer">
                Mark as Main University
              </label>
            </div>

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
            mode === 'create' ? 'Create College' : 'Update College'
          )}
        </Button>
      </div>
    </form>
  );
};
