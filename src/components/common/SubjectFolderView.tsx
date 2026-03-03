import { AnimatedFolder, type FolderItem } from '@/components/ui/3d-folder';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ArrowLeft, Calendar, FileText, FolderOpen, Grid3X3, Layers } from 'lucide-react';
import { useState } from 'react';

interface BaseItem {
  id: number;
  title: string;
  subject_name?: string;
  due_date: string;
  is_active?: boolean;
  status?: string;
}

interface SubjectGroup<T extends BaseItem> {
  subjectName: string;
  items: T[];
  folderItems: FolderItem[];
}

interface SubjectFolderViewProps<T extends BaseItem> {
  items: T[];
  isLoading: boolean;
  emptyMessage?: string;
  onItemClick?: (item: T) => void;
  renderItemCard: (item: T, index: number) => React.ReactNode;
  itemType?: 'assignments' | 'homework';
}

export function SubjectFolderView<T extends BaseItem>({
  items,
  isLoading,
  emptyMessage = 'No items found',
  onItemClick,
  renderItemCard,
  itemType = 'assignments'
}: SubjectFolderViewProps<T>) {
  const [viewMode, setViewMode] = useState<'folders' | 'list'>('folders');
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  // Group items by subject
  const groupedBySubject = items.reduce<Record<string, T[]>>((acc, item) => {
    const subject = item.subject_name || 'Uncategorized';
    if (!acc[subject]) {
      acc[subject] = [];
    }
    acc[subject].push(item);
    return acc;
  }, {});

  // Convert to SubjectGroup array
  const subjectGroups: SubjectGroup<T>[] = Object.entries(groupedBySubject).map(([subjectName, subjectItems]) => ({
    subjectName,
    items: subjectItems,
    folderItems: subjectItems.slice(0, 3).map(item => ({
      id: String(item.id),
      title: item.title,
      image: undefined // Could add thumbnail if available
    }))
  }));

  // Get items for selected subject
  const selectedSubjectItems = selectedSubject
    ? groupedBySubject[selectedSubject] || []
    : [];

  const handleFolderClick = (subjectName: string) => {
    setSelectedSubject(subjectName);
  };

  const handleBackClick = () => {
    setSelectedSubject(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center space-y-3">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-muted-foreground font-medium">Loading {itemType}...</p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="relative w-24 h-24 mx-auto mb-6">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl transform rotate-6"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl flex items-center justify-center">
            <FolderOpen className="h-12 w-12 text-primary/40" />
          </div>
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">No {itemType} yet</h3>
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  // Show subject's items when a folder is selected
  if (selectedSubject) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
        {/* Enhanced Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 pb-4 border-b">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackClick}
            className="gap-2 hover:gap-3 transition-all self-start group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to Subjects
          </Button>
          <div className="flex items-center gap-3 flex-1">
            <div className="flex items-center gap-2 bg-gradient-to-r from-primary/10 to-primary/5 px-4 py-2 rounded-lg border border-primary/20">
              <Layers className="h-4 w-4 text-primary" />
              <span className="font-semibold text-foreground">{selectedSubject}</span>
            </div>
            <Badge variant="secondary" className="px-3 py-1.5 font-medium">
              {selectedSubjectItems.length} {selectedSubjectItems.length === 1 ? itemType.slice(0, -1) : itemType}
            </Badge>
          </div>
        </div>

        {/* Grid with smooth transition */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {selectedSubjectItems.map((item, index) => (
            <div
              key={item.id}
              onClick={() => onItemClick?.(item)}
              className="cursor-pointer animate-in fade-in slide-in-from-bottom-2 duration-300"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {renderItemCard(item, index)}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Show folder view
  return (
    <div className="space-y-6">
      {/* Enhanced View Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-1 bg-gradient-to-b from-primary to-primary/50 rounded-full"></div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              {subjectGroups.length} Subject{subjectGroups.length !== 1 ? 's' : ''}
            </p>
            <p className="text-xs text-muted-foreground">
              {items.length} total {itemType}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-lg border">
          <Button
            variant={viewMode === 'folders' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('folders')}
            className={cn(
              "gap-2 transition-all duration-200",
              viewMode === 'folders' && "shadow-sm"
            )}
          >
            <FolderOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Folders</span>
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
            className={cn(
              "gap-2 transition-all duration-200",
              viewMode === 'list' && "shadow-sm"
            )}
          >
            <Grid3X3 className="h-4 w-4" />
            <span className="hidden sm:inline">Grid</span>
          </Button>
        </div>
      </div>

      {/* Content with smooth transitions */}
      <div className="relative">
        {viewMode === 'folders' ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 place-items-center animate-in fade-in zoom-in-95 duration-300">
            {subjectGroups.map((group, index) => (
              <div
                key={group.subjectName}
                className="w-full flex justify-center animate-in fade-in slide-in-from-bottom-4 duration-300"
                style={{ animationDelay: `${index * 75}ms` }}
              >
                <AnimatedFolder
                  title={group.subjectName}
                  items={group.folderItems}
                  itemCount={group.items.length}
                  onFolderClick={() => handleFolderClick(group.subjectName)}
                  showLightbox={false}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 animate-in fade-in zoom-in-95 duration-300">
            {items.map((item, index) => (
              <div
                key={item.id}
                onClick={() => onItemClick?.(item)}
                className="cursor-pointer animate-in fade-in slide-in-from-bottom-2 duration-300"
                style={{ animationDelay: `${index * 40}ms` }}
              >
                {renderItemCard(item, index)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Compact card component for items inside folder view
interface CompactItemCardProps {
  title: string;
  subjectName?: string;
  className?: string;
  dueDate: string;
  status?: string;
  isActive?: boolean;
  onClick?: () => void;
  actions?: React.ReactNode;
}

export function CompactItemCard({
  title,
  subjectName,
  className,
  dueDate,
  status,
  isActive,
  onClick,
  actions
}: CompactItemCardProps) {
  return (
    <Card
      className={cn(
        "group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer border-l-4 border-l-primary/50 hover:border-l-primary",
        className
      )}
      onClick={onClick}
    >
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-transparent rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>

      <CardContent className="p-5 relative z-10">
        <div className="flex justify-between items-start mb-3">
          <Badge
            className="shadow-sm"
            variant={
              status === 'active' || isActive
                ? 'default'
                : status === 'draft'
                  ? 'secondary'
                  : status === 'completed'
                    ? 'success'
                    : 'secondary'
            }
          >
            {status || (isActive ? 'Active' : 'Inactive')}
          </Badge>
          <div className="flex items-center text-xs font-medium text-muted-foreground bg-muted/50 px-2 py-1 rounded-md">
            <Calendar className="h-3.5 w-3.5 mr-1.5 text-primary" />
            {new Date(dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </div>
        </div>

        <h3 className="font-bold text-lg line-clamp-2 mb-3 group-hover:text-primary transition-colors leading-tight">
          {title}
        </h3>

        {subjectName && (
          <div className="flex items-center text-sm text-muted-foreground mb-4 bg-muted/30 px-3 py-1.5 rounded-md w-fit">
            <FileText className="h-3.5 w-3.5 mr-2 text-primary/70" />
            <span className="font-medium">{subjectName}</span>
          </div>
        )}

        {actions && (
          <div className="flex justify-end gap-2 pt-3 border-t border-dashed mt-3" onClick={(e) => e.stopPropagation()}>
            {actions}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
