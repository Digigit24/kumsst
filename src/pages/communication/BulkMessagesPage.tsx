// Bulk Messages Page
import { format } from 'date-fns';
import { Calendar, Mail, Pencil, Plus, Send, Trash2, Users } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { useBulkMessagesSWR } from '../../hooks/swr';
import { useAuth } from '../../hooks/useAuth';
import {
  useCreateBulkMessage,
  useDeleteBulkMessage,
  useUpdateBulkMessage,
} from '../../hooks/useCommunication';
import type { BulkMessage, BulkMessageFilters } from '../../types/communication.types';
import { BulkMessageForm } from './forms/BulkMessageForm';

export const BulkMessagesPage = () => {
  const { user } = useAuth();
  const authUser = user as any;
  const [filters, setFilters] = useState<BulkMessageFilters>({
    page: 1,
    page_size: 10,
  });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<BulkMessage | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // Queries and mutations
  const { data, isLoading, refresh } = useBulkMessagesSWR(filters);
  const createMutation = useCreateBulkMessage();
  const updateMutation = useUpdateBulkMessage();
  const deleteMutation = useDeleteBulkMessage();

  const handleCreate = () => {
    setSelectedMessage(null);
    setIsFormOpen(true);
  };

  const handleEdit = (message: BulkMessage) => {
    setSelectedMessage(message);
    setIsFormOpen(true);
  };

  const handleSubmit = async (formData: any) => {
    try {
      // Transform form data to match API requirements
      const transformedData = {
        ...formData,
        // Convert empty strings to null for optional datetime fields
        scheduled_at: formData.scheduled_at || null,
        sent_at: formData.sent_at || null,
        // Add college field from current user if not present
        college: formData.college || authUser?.college || null,
      };

      if (selectedMessage) {
        await updateMutation.mutateAsync({
          id: selectedMessage.id,
          data: transformedData,
        });
        toast.success('Bulk message updated successfully');
      } else {
        await createMutation.mutateAsync(transformedData);
        toast.success('Bulk message created successfully');
      }
      setIsFormOpen(false);
      refresh();
    } catch (error: any) {
      toast.error(typeof error.message === 'string' ? error.message : 'Failed to save bulk message');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await deleteMutation.mutateAsync(deleteId);
      toast.success('Bulk message deleted successfully');
      setDeleteId(null);
      refresh();
    } catch (error: any) {
      toast.error(typeof error.message === 'string' ? error.message : 'Failed to delete bulk message');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; className: string }> = {
      draft: { variant: 'secondary', className: 'bg-secondary text-secondary-foreground' },
      scheduled: { variant: 'secondary', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200' },
      sending: { variant: 'secondary', className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-200' },
      sent: { variant: 'secondary', className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-200' },
      failed: { variant: 'secondary', className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-200' },
    };

    const config = variants[status] || variants.draft;
    return (
      <Badge variant={config.variant} className={config.className}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getMessageTypeBadge = (type: string) => {
    const variants: Record<string, { icon: any; className: string }> = {
      sms: { icon: Mail, className: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-200' },
      email: { icon: Mail, className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200' },
      push: { icon: Send, className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-200' },
      notification: { icon: Mail, className: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-200' },
      all: { icon: Mail, className: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-200' },
    };

    const config = variants[type] || variants.notification;
    const Icon = config.icon;

    return (
      <Badge variant="secondary" className={config.className}>
        <Icon className="w-3 h-3 mr-1" />
        {type.toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Bulk Messages</h1>
          <p className="text-muted-foreground mt-1">Send messages to multiple recipients</p>
        </div>
        {authUser?.user_type !== 'student' && (
          <Button onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" />
            New Bulk Message
          </Button>
        )}
      </div>

      {/* Messages List */}
      <div className="bg-card rounded-lg shadow border border-border">
        <div className="p-6">
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading messages...</p>
            </div>
          ) : !data?.results || data.results.length === 0 ? (
            <div className="text-center py-12">
              <Mail className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No bulk messages found
              </h3>
              <p className="text-muted-foreground mb-6">
                Get started by creating your first bulk message
              </p>
              {authUser?.user_type !== 'student' && (
                <Button onClick={handleCreate}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Bulk Message
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {data.results.map((message) => (
                <div
                  key={message.id}
                  className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{message.title}</h3>
                        {getStatusBadge(message.status)}
                        {getMessageTypeBadge(message.message_type)}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground mb-3">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <span>{message.recipient_type}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          <span>{message.total_recipients} recipients</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Send className="w-4 h-4" />
                          <span>{message.sent_count} sent</span>
                        </div>
                        {message.failed_count > 0 && (
                          <div className="flex items-center gap-2 text-red-600">
                            <span>{message.failed_count} failed</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        {message.scheduled_at && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>
                              Scheduled: {format(new Date(message.scheduled_at), 'PPp')}
                            </span>
                          </div>
                        )}
                        {message.sent_at && (
                          <div className="flex items-center gap-1">
                            <Send className="w-3 h-3" />
                            <span>
                              Sent: {format(new Date(message.sent_at), 'PPp')}
                            </span>
                          </div>
                        )}
                        <span>
                          Created: {format(new Date(message.created_at), 'PPp')}
                        </span>
                      </div>
                    </div>

                    {authUser?.user_type !== 'student' && (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(message)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteId(message.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {data && data.results.length > 0 && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Showing {((filters.page || 1) - 1) * (filters.page_size || 10) + 1} to{' '}
                {Math.min((filters.page || 1) * (filters.page_size || 10), data.count)} of{' '}
                {data.count} results
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
              {selectedMessage ? 'Edit Bulk Message' : 'Create Bulk Message'}
            </DialogTitle>
          </DialogHeader>
          <BulkMessageForm
            bulkMessage={selectedMessage || undefined}
            onSubmit={handleSubmit}
            onCancel={() => setIsFormOpen(false)}
            isLoading={createMutation.isPending || updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Bulk Message"
        description="Are you sure you want to delete this bulk message? This action cannot be undone."
        variant="destructive"
      />
    </div>
  );
};
