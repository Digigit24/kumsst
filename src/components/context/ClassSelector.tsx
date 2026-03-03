/**
 * Class Selector Component
 *
 * Permission-aware dropdown for selecting class context
 * - Shows only if user has permission (canChooseClass)
 * - Auto-fetches available classes based on selected college
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
import { useClassContext, useCollegeContext } from '@/contexts/HierarchicalContext';
import { usePermissions } from '@/contexts/PermissionsContext';
import { useContextClasses } from '@/hooks/useContextSelectors';
import { useSuperAdminContext } from '@/contexts/SuperAdminContext';

interface ClassSelectorProps {
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  showAllOption?: boolean;
  onValueChange?: (value: number | null) => void;
}

export const ClassSelector: React.FC<ClassSelectorProps> = ({
  label = 'Class',
  placeholder = 'Select class',
  required = false,
  disabled = false,
  className = '',
  showAllOption = false,
  onValueChange,
}) => {
  const { selectedCollege, setSelectedCollege } = useCollegeContext();
  const { selectedClass, setSelectedClass, classes, isLoadingClasses } =
    useClassContext();
  const { permissions, userContext } = usePermissions();
  const { selectedCollege: headerSelectedCollege, isSuperAdminUser } = useSuperAdminContext();

  // Auto-select college for users who can't choose college (teachers)
  React.useEffect(() => {
    if (!permissions?.canChooseCollege && userContext?.college_id && !selectedCollege) {
      setSelectedCollege(userContext.college_id);
    }
  }, [permissions?.canChooseCollege, userContext?.college_id, selectedCollege, setSelectedCollege]);

  // Keep class selector unlocked for super admins by mirroring header selection
  React.useEffect(() => {
    if (isSuperAdminUser && headerSelectedCollege !== selectedCollege) {
      setSelectedCollege(headerSelectedCollege);
    }
  }, [isSuperAdminUser, headerSelectedCollege, selectedCollege, setSelectedCollege]);

  // Auto-select class if teacher has only one class
  React.useEffect(() => {
    if (permissions?.isTeacher && !selectedClass && classes.length === 1 && !isLoadingClasses) {
      setSelectedClass(classes[0].id);
    }
  }, [permissions?.isTeacher, selectedClass, classes, isLoadingClasses, setSelectedClass]);

  // Fetch classes (hook updates context automatically)
  useContextClasses();

  // Don't render if user can't choose class
  if (!permissions?.canChooseClass) {
    return null;
  }

  const handleChange = (value: string) => {
    const classId = value === 'all' ? null : (value ? Number(value) : null);
    setSelectedClass(classId);
    onValueChange?.(classId);
  };

  const isDisabled =
    disabled ||
    isLoadingClasses ||
    (permissions.canChooseCollege && !selectedCollege);

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <Label htmlFor="class-selector">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      <Select
        value={selectedClass ? String(selectedClass) : (showAllOption ? 'all' : undefined)}
        onValueChange={handleChange}
        disabled={isDisabled}
      >
        <SelectTrigger id="class-selector">
          <SelectValue
            placeholder={
              isLoadingClasses
                ? 'Loading...'
                : !selectedCollege && permissions.canChooseCollege
                ? 'Select college first'
                : placeholder
            }
          />
        </SelectTrigger>
        <SelectContent>
          {showAllOption && <SelectItem value="all">All Classes</SelectItem>}
          {classes.map((cls) => (
            <SelectItem key={cls.id} value={String(cls.id)}>
              {cls.name} ({cls.program_name})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
