// Notice Visibility Page
import { useState } from 'react';
import { format } from 'date-fns';
import {
  Eye,
  Plus,
  Pencil,
  Trash2,
  Users,
  GraduationCap,
  Globe,
} from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { NoticeVisibilityForm } from './forms/NoticeVisibilityForm';
import {
  useCreateNoticeVisibility,
  useUpdateNoticeVisibility,
  useDeleteNoticeVisibility,
} from '../../hooks/useCommunication';
import { useNoticeVisibilitySWR } from '../../hooks/swr';
import type { NoticeVisibility, NoticeVisibilityFilters } from '../../types/communication.types';

export const NoticeVisibilityPage = () => {
  const [filters, setFilters] = useState<NoticeVisibilityFilters>({
    page: 1,
    page_size: 20,
  });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedVisibility, setSelectedVisibility] = useState<NoticeVisibility | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Queries and mutations
  const { data, isLoading, refresh } = useNoticeVisibilitySWR(filters);
  const createMutation = useCreateNoticeVisibility();
  const updateMutation = useUpdateNoticeVisibility();
  const deleteMutation = useDeleteNoticeVisibility();

  const handleCreate = () => {
    setSelectedVisibility(null);
    setIsFormOpen(true);
  };

  const handleEdit = (visibility: NoticeVisibility) => {
    setSelectedVisibility(visibility);
    setIsFormOpen(true);
  };

  const handleSubmit = async (formData: any) => {
    try {
      // Transform data - convert null values properly
      const transformedData = {
        ...formData,
        class_obj: formData.class_obj || null,
        section: formData.section || null,
      };

      if (selectedVisibility) {
        await updateMutation.mutateAsync({
          id: selectedVisibility.id,
          data: transformedData,
        });
        toast.success('Notice visibility updated successfully');
      } else {
        await createMutation.mutateAsync(transformedData);
        toast.success('Notice visibility created successfully');
      }
      setIsFormOpen(false);
      refresh();
    } catch (error: any) {
      toast.error(typeof error.message === 'string' ? error.message : 'Failed to save notice visibility');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await deleteMutation.mutateAsync(deleteId);
      toast.success('Notice visibility deleted successfully');
      setDeleteId(null);
      refresh();
    } catch (error: any) {
      toast.error(typeof error.message === 'string' ? error.message : 'Failed to delete notice visibility');
    }
  };

  const getTargetTypeIcon = (type: string) => {
    switch (type) {
      case 'all':
        return <Globe className="w-4 h-4" />;
      case 'class':
        return <GraduationCap className="w-4 h-4" />;
      case 'section':
        return <Users className="w-4 h-4" />;
      default:
        return <Eye className="w-4 h-4" />;
    }
  };

  const filteredVisibilities = data?.results.filter((visibility) => {
    if (!searchQuery) return true;
    return (
      visibility.target_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      visibility.notice.toString().includes(searchQuery)
    );
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notice Visibility</h1>
          <p className="text-muted-foreground mt-1">Control who can see each notice</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          New Visibility Rule
        </Button>
      </div>

      {/* Search */}
      <div className="bg-card rounded-lg shadow p-4">
        <Input
          placeholder="Search by target type or notice ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
      </div>

      {/* Visibility Rules List */}
      <div className="bg-card rounded-lg shadow">
        <div className="p-6">
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading visibility rules...</p>
            </div>
          ) : !filteredVisibilities || filteredVisibilities.length === 0 ? (
            <div className="text-center py-12">
              <Eye className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {searchQuery ? 'No visibility rules found' : 'No visibility rules yet'}
              </h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery
                  ? 'Try adjusting your search query'
                  : 'Start by creating your first notice visibility rule'}
              </p>
              {!searchQuery && (
                <Button onClick={handleCreate}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Rule
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredVisibilities.map((visibility) => (
                <div
                  key={visibility.id}
                  className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      {/* Header */}
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-semibold">Notice #{visibility.notice}</h3>
                        <Badge variant="secondary" className="flex items-center gap-1">
                          {getTargetTypeIcon(visibility.target_type)}
                          {visibility.target_type === 'all' && 'All'}
                          {visibility.target_type === 'class' && 'Class'}
                          {visibility.target_type === 'section' && 'Section'}
                        </Badge>
                        {visibility.is_active ? (
                          <Badge variant="secondary" className="bg-green-100 text-green-700">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                            Inactive
                          </Badge>
                        )}
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-xs text-muted-foreground">Target Type</p>
                          <p className="font-medium capitalize">{visibility.target_type}</p>
                        </div>
                        {visibility.class_obj && (
                          <div>
                            <p className="text-xs text-muted-foreground">Class ID</p>
                            <p className="font-medium">#{visibility.class_obj}</p>
                          </div>
                        )}
                        {visibility.section && (
                          <div>
                            <p className="text-xs text-muted-foreground">Section ID</p>
                            <p className="font-medium">#{visibility.section}</p>
                          </div>
                        )}
                      </div>

                      {/* Timestamps */}
                      <div className="mt-3 text-xs text-muted-foreground">
                        Created: {format(new Date(visibility.created_at), 'PPp')}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(visibility)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteId(visibility.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {data && data.results.length > 0 && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Showing {((filters.page || 1) - 1) * (filters.page_size || 20) + 1} to{' '}
                {Math.min((filters.page || 1) * (filters.page_size || 20), data.count)} of{' '}
                {data.count} rules
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!data.previous}
                  onClick={() =>
                    setFilters((prev) => ({ ...prev, page: (prev.page || 1) - 1 }))
                  }
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!data.next}
                  onClick={() =>
                    setFilters((prev) => ({ ...prev, page: (prev.page || 1) + 1 }))
                  }
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-3xl max-w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedVisibility ? 'Edit Notice Visibility' : 'New Notice Visibility'}
            </DialogTitle>
          </DialogHeader>
          <NoticeVisibilityForm
            noticeVisibility={selectedVisibility || undefined}
            onSubmit={handleSubmit}
            onCancel={() => setIsFormOpen(false)}
            isLoading={createMutation.isPending || updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Notice Visibility"
        description="Are you sure you want to delete this visibility rule? This action cannot be undone."
        variant="destructive"
      />
    </div>
  );
};
