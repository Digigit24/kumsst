/**
 * College Selector Component
 *
 * Permission-aware dropdown for selecting college context
 * - Shows only if user has permission (canChooseCollege)
 * - Auto-fetches available colleges
 * - Syncs with HierarchicalContext
 */

import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useCollegeContext } from '@/contexts/HierarchicalContext';
import { usePermissions } from '@/contexts/PermissionsContext';
import { useContextColleges } from '@/hooks/useContextSelectors';

interface CollegeSelectorProps {
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  onValueChange?: (value: number | null) => void;
}

export const CollegeSelector: React.FC<CollegeSelectorProps> = ({
  label = 'College',
  placeholder = 'Select college',
  required = false,
  disabled = false,
  className = '',
  onValueChange,
}) => {
  const { selectedCollege, setSelectedCollege, colleges, isLoadingColleges } =
    useCollegeContext();
  const { permissions } = usePermissions();

  // Fetch colleges (hook updates context automatically)
  useContextColleges();

  // Don't render if user can't choose college
  if (!permissions?.canChooseCollege) {
    return null;
  }

  const handleChange = (value: string) => {
    const collegeId = value ? Number(value) : null;
    setSelectedCollege(collegeId);
    onValueChange?.(collegeId);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <Label htmlFor="college-selector">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      <Select
        value={selectedCollege ? String(selectedCollege) : undefined}
        onValueChange={handleChange}
        disabled={disabled || isLoadingColleges}
      >
        <SelectTrigger id="college-selector">
          <SelectValue
            placeholder={isLoadingColleges ? 'Loading...' : placeholder}
          />
        </SelectTrigger>
        <SelectContent>
          {colleges.map((college) => (
            <SelectItem key={college.id} value={String(college.id)}>
              {college.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
