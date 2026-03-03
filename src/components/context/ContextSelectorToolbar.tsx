/**
 * Context Selector Toolbar
 *
 * Combined toolbar with all three selectors
 * Perfect for pages like Attendance that need hierarchical filtering
 */

import { Card, CardContent } from '@/components/ui/card';
import { usePermissions } from '@/contexts/PermissionsContext';
import React from 'react';
import { ClassSelector } from './ClassSelector';
import { SectionSelector } from './SectionSelector';

interface ContextSelectorToolbarProps {
  showClass?: boolean;
  showSection?: boolean;
  className?: string;
}

export const ContextSelectorToolbar: React.FC<ContextSelectorToolbarProps> = ({
  showClass = true,
  showSection = true,
  className = '',
}) => {
  const { permissions } = usePermissions();

  // Don't render anything if no selectors are needed
  const hasAnySelector =
    (showClass && permissions?.canChooseClass) ||
    (showSection && permissions?.canChooseSection);

  if (!hasAnySelector) {
    return null;
  }

  return (
    <Card className={className}>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {showClass && <ClassSelector required />}
          {showSection && <SectionSelector required />}
        </div>
      </CardContent>
    </Card>
  );
};
