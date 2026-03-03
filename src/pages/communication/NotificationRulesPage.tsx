// Notification Rules Page
import { useState } from 'react';
import { format } from 'date-fns';
import {
  Bell,
  Plus,
  Pencil,
  Trash2,
  CheckCircle,
  XCircle,
  Mail,
  MessageSquare,
  Smartphone,
} from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { NotificationRuleForm } from './forms/NotificationRuleForm';
import {
  useCreateNotificationRule,
  useUpdateNotificationRule,
  useDeleteNotificationRule,
} from '../../hooks/useCommunication';
import { useNotificationRulesSWR } from '../../hooks/swr';
import { useAuth } from '../../hooks/useAuth';
import type { NotificationRule, NotificationRuleFilters } from '../../types/communication.types';

export const NotificationRulesPage = () => {
  const { user } = useAuth();
  const [filters, setFilters] = useState<NotificationRuleFilters>({
    page: 1,
    page_size: 20,
  });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState<NotificationRule | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Queries and mutations
  const { data, isLoading, refresh } = useNotificationRulesSWR(filters);
  const createMutation = useCreateNotificationRule();
  const updateMutation = useUpdateNotificationRule();
  const deleteMutation = useDeleteNotificationRule();

  const handleCreate = () => {
    setSelectedRule(null);
    setIsFormOpen(true);
  };

  const handleEdit = (rule: NotificationRule) => {
    setSelectedRule(rule);
    setIsFormOpen(true);
  };

  const handleSubmit = async (formData: any) => {
    try {
      // College is sent via X-College-ID header, no need in payload
      const { college, ...rest } = formData;
      const transformedData = {
        ...rest,
      };

      if (selectedRule) {
        await updateMutation.mutateAsync({
          id: selectedRule.id,
          data: transformedData,
        });
        toast.success('Notification rule updated successfully');
      } else {
        await createMutation.mutateAsync(transformedData);
        toast.success('Notification rule created successfully');
      }
      setIsFormOpen(false);
      refresh();
    } catch (error: any) {
      toast.error(typeof error.message === 'string' ? error.message : 'Failed to save notification rule');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await deleteMutation.mutateAsync(deleteId);
      toast.success('Notification rule deleted successfully');
      setDeleteId(null);
      refresh();
    } catch (error: any) {
      toast.error(typeof error.message === 'string' ? error.message : 'Failed to delete notification rule');
    }
  };

  const getChannelIcons = (channels: string) => {
    const channelList = channels.split(',').map((c) => c.trim());
    const icons = [];

    if (channelList.includes('email')) {
      icons.push(<Mail key="email" className="w-4 h-4" aria-label="Email" />);
    }
    if (channelList.includes('sms')) {
      icons.push(<MessageSquare key="sms" className="w-4 h-4" aria-label="SMS" />);
    }
    if (channelList.includes('push')) {
      icons.push(<Smartphone key="push" className="w-4 h-4" aria-label="Push" />);
    }

    return icons;
  };

  const filteredRules = data?.results.filter((rule) => {
    if (!searchQuery) return true;
    return (
      rule.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rule.event_type.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notification Rules</h1>
          <p className="text-muted-foreground mt-1">Manage automated notification rules</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          New Rule
        </Button>
      </div>

      {/* Search */}
      <div className="bg-card rounded-lg shadow p-4">
        <Input
          placeholder="Search by rule name or event type..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
      </div>

      {/* Rules List */}
      <div className="bg-card rounded-lg shadow">
        <div className="p-6">
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading notification rules...</p>
            </div>
          ) : !filteredRules || filteredRules.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {searchQuery ? 'No rules found' : 'No notification rules yet'}
              </h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery
                  ? 'Try adjusting your search query'
                  : 'Start by creating your first notification rule'}
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
              {filteredRules.map((rule) => (
                <div
                  key={rule.id}
                  className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      {/* Header */}
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-semibold">{rule.name}</h3>
                        {rule.is_enabled ? (
                          <Badge variant="secondary" className="bg-green-100 text-green-700">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Enabled
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                            <XCircle className="w-3 h-3 mr-1" />
                            Disabled
                          </Badge>
                        )}
                        {rule.is_active ? (
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
                          <p className="text-xs text-muted-foreground">Event Type</p>
                          <p className="font-medium">
                            {rule.event_type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Channels</p>
                          <div className="flex items-center gap-2 font-medium">
                            {getChannelIcons(rule.channels)}
                            <span className="text-xs">
                              {rule.channels.split(',').length} channel(s)
                            </span>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Template ID</p>
                          <p className="font-medium">#{rule.template}</p>
                        </div>
                      </div>

                      {/* Timestamps */}
                      <div className="mt-3 text-xs text-muted-foreground">
                        Created: {format(new Date(rule.created_at), 'PPp')}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(rule)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteId(rule.id)}
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
              {selectedRule ? 'Edit Notification Rule' : 'New Notification Rule'}
            </DialogTitle>
          </DialogHeader>
          <NotificationRuleForm
            notificationRule={selectedRule || undefined}
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
        title="Delete Notification Rule"
        description="Are you sure you want to delete this notification rule? This action cannot be undone."
        variant="destructive"
      />
    </div>
  );
};
