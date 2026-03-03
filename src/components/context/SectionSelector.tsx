/**
 * Section Selector Component
 *
 * Permission-aware dropdown for selecting section context
 * - Shows only if user has permission (canChooseSection)
 * - Auto-fetches available sections based on selected class
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
import { useSectionContext, useClassContext } from '@/contexts/HierarchicalContext';
import { usePermissions } from '@/contexts/PermissionsContext';
import { useContextSections } from '@/hooks/useContextSelectors';

interface SectionSelectorProps {
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  showAllOption?: boolean;
  onValueChange?: (value: number | null) => void;
}

export const SectionSelector: React.FC<SectionSelectorProps> = ({
  label = 'Section',
  placeholder = 'Select section',
  required = false,
  disabled = false,
  className = '',
  showAllOption = false,
  onValueChange,
}) => {
  const { selectedClass } = useClassContext();
  const { selectedSection, setSelectedSection, sections, isLoadingSections } =
    useSectionContext();
  const { permissions } = usePermissions();

  // Fetch sections (hook updates context automatically)
  useContextSections();

  // Don't render if user can't choose section
  if (!permissions?.canChooseSection) {
    return null;
  }

  const handleChange = (value: string) => {
    const sectionId = value === 'all' ? null : (value ? Number(value) : null);
    setSelectedSection(sectionId);
    onValueChange?.(sectionId);
  };

  const isDisabled = disabled || isLoadingSections || (!selectedClass && !showAllOption);

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <Label htmlFor="section-selector">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      <Select
        value={selectedSection ? String(selectedSection) : (showAllOption ? 'all' : undefined)}
        onValueChange={handleChange}
        disabled={isDisabled}
      >
        <SelectTrigger id="section-selector">
          <SelectValue
            placeholder={
              isLoadingSections
                ? 'Loading...'
                : !selectedClass
                ? 'Select class first'
                : placeholder
            }
          />
        </SelectTrigger>
        <SelectContent>
          {showAllOption && <SelectItem value="all">All Sections</SelectItem>}
          {sections.map((section) => (
            <SelectItem key={section.id} value={String(section.id)}>
              {section.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
