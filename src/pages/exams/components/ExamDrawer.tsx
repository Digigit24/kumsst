import { ReactNode } from 'react';
import { DetailSidebar, DetailSidebarProps } from '@/components/common/DetailSidebar';

type ExamDrawerProps = Omit<DetailSidebarProps, 'width'> & {
  width?: DetailSidebarProps['width'];
};

/**
 * Shared drawer for all examination forms/pages.
 * Wraps the universal DetailSidebar with a consistent default width.
 */
export const ExamDrawer = ({
  width = '4xl',
  ...props
}: ExamDrawerProps) => {
  return <DetailSidebar width={width} {...props} />;
};

