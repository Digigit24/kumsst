/**
 * Student Address Form Component
 * Used for creating and editing student addresses (permanent, current, hostel)
 */

import { useEffect, useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { useTheme } from '../../../contexts/ThemeContext';
import { studentAddressApi } from '../../../services/students.service';
import type { StudentAddress, StudentAddressCreateInput, StudentAddressListItem, StudentAddressUpdateInput } from '../../../types/students.types';

interface StudentAddressFormProps {
  mode: 'create' | 'edit';
  studentId: number;
  address?: StudentAddress | StudentAddressListItem;
  onSuccess: () => void;
  onCancel: () => void;
}

export const StudentAddressForm = ({ mode, studentId, address, onSuccess, onCancel }: StudentAddressFormProps) => {
  const { theme } = useTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<StudentAddressCreateInput>({
    student: studentId,
    address_type: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form data for edit mode
  useEffect(() => {
    if (mode === 'edit' && address) {
      setFormData({
        student: address.student,
        address_type: address.address_type,
        address_line1: address.address_line1 || '',
        address_line2: address.address_line2 || '',
        city: address.city,
        state: address.state,
        pincode: address.pincode || '',
        country: address.country || 'India',
      });
    }
  }, [mode, address]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.address_type) {
      newErrors.address_type = 'Address type is required';
    }

    if (!formData.address_line1.trim()) {
      newErrors.address_line1 = 'Address line 1 is required';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }

    if (!formData.pincode.trim()) {
      newErrors.pincode = 'Pincode is required';
    }

    if (formData.pincode && !/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = 'Pincode must be 6 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof StudentAddressCreateInput, value: any) => {
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
      // Clean up empty strings to null
      const cleanedData = {
        ...formData,
        address_line2: formData.address_line2 || null,
      };

      if (mode === 'create') {
        await studentAddressApi.create(cleanedData);
      } else if (address) {
        await studentAddressApi.update(address.id, cleanedData as StudentAddressUpdateInput);
      }

      onSuccess();
    } catch (err: any) {
      console.error('Form submission error:', err);
      setError(typeof err.message === 'string' ? err.message : 'Failed to save address');

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

  const addressTypeOptions = [
    { value: 'permanent', label: 'Permanent Address' },
    { value: 'current', label: 'Current Address' },
    { value: 'hostel', label: 'Hostel Address' },
  ];

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {error && (
        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md">
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        {/* Address Type */}
        <div>
          <label htmlFor="address_type" className="block text-sm font-medium mb-2">
            Address Type <span className="text-destructive">*</span>
          </label>
          <Select value={formData.address_type} onValueChange={(value) => handleChange('address_type', value)}>
            <SelectTrigger className={errors.address_type ? 'border-destructive' : ''}>
              <SelectValue placeholder="Select address type" />
            </SelectTrigger>
            <SelectContent>
              {addressTypeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.address_type && (
            <p className="text-sm text-destructive mt-1">{errors.address_type}</p>
          )}
        </div>

        {/* Address Line 1 */}
        <div>
          <label htmlFor="address_line1" className="block text-sm font-medium mb-2">
            Address Line 1 <span className="text-destructive">*</span>
          </label>
          <Input
            id="address_line1"
            type="text"
            value={formData.address_line1}
            onChange={(e) => handleChange('address_line1', e.target.value)}
            placeholder="Enter address line 1"
            disabled={isSubmitting}
            className={errors.address_line1 ? 'border-destructive' : ''}
          />
          {errors.address_line1 && (
            <p className="text-sm text-destructive mt-1">{errors.address_line1}</p>
          )}
        </div>

        {/* Address Line 2 */}
        <div>
          <label htmlFor="address_line2" className="block text-sm font-medium mb-2">
            Address Line 2
          </label>
          <Input
            id="address_line2"
            type="text"
            value={formData.address_line2 || ''}
            onChange={(e) => handleChange('address_line2', e.target.value)}
            placeholder="Enter address line 2 (optional)"
            disabled={isSubmitting}
          />
        </div>

        {/* City */}
        <div>
          <label htmlFor="city" className="block text-sm font-medium mb-2">
            City <span className="text-destructive">*</span>
          </label>
          <Input
            id="city"
            type="text"
            value={formData.city}
            onChange={(e) => handleChange('city', e.target.value)}
            placeholder="Enter city"
            disabled={isSubmitting}
            className={errors.city ? 'border-destructive' : ''}
          />
          {errors.city && (
            <p className="text-sm text-destructive mt-1">{errors.city}</p>
          )}
        </div>

        {/* State */}
        <div>
          <label htmlFor="state" className="block text-sm font-medium mb-2">
            State <span className="text-destructive">*</span>
          </label>
          <Input
            id="state"
            type="text"
            value={formData.state}
            onChange={(e) => handleChange('state', e.target.value)}
            placeholder="Enter state"
            disabled={isSubmitting}
            className={errors.state ? 'border-destructive' : ''}
          />
          {errors.state && (
            <p className="text-sm text-destructive mt-1">{errors.state}</p>
          )}
        </div>

        {/* Pincode */}
        <div>
          <label htmlFor="pincode" className="block text-sm font-medium mb-2">
            Pincode <span className="text-destructive">*</span>
          </label>
          <Input
            id="pincode"
            type="text"
            value={formData.pincode}
            onChange={(e) => handleChange('pincode', e.target.value)}
            placeholder="Enter 6-digit pincode"
            disabled={isSubmitting}
            className={errors.pincode ? 'border-destructive' : ''}
            maxLength={6}
          />
          {errors.pincode && (
            <p className="text-sm text-destructive mt-1">{errors.pincode}</p>
          )}
        </div>

        {/* Country */}
        <div>
          <label htmlFor="country" className="block text-sm font-medium mb-2">
            Country <span className="text-destructive">*</span>
          </label>
          <Input
            id="country"
            type="text"
            value={formData.country}
            onChange={(e) => handleChange('country', e.target.value)}
            placeholder="Enter country"
            disabled={isSubmitting}
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
            mode === 'create' ? 'Add Address' : 'Update Address'
          )}
        </Button>
      </div>
    </form>
  );
};
