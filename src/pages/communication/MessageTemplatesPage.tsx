// Message Templates Page
import { format } from 'date-fns';
import {
  Code,
  FileText,
  Mail,
  MessageSquare,
  Pencil,
  Plus,
  Smartphone,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { useMessageTemplatesSWR } from '../../hooks/swr';
import { useAuth } from '../../hooks/useAuth';
import {
  useCreateMessageTemplate,
  useDeleteMessageTemplate,
  useUpdateMessageTemplate,
} from '../../hooks/useCommunication';
import type { MessageTemplate, MessageTemplateFilters } from '../../types/communication.types';
import { MessageTemplateForm } from './forms/MessageTemplateForm';

export const MessageTemplatesPage = () => {
  const { user } = useAuth();
  const [filters, setFilters] = useState<MessageTemplateFilters>({
    page: 1,
    page_size: 20,
  });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Queries and mutations
  const { data, isLoading, refresh } = useMessageTemplatesSWR(filters);
  const createMutation = useCreateMessageTemplate();
  const updateMutation = useUpdateMessageTemplate();
  const deleteMutation = useDeleteMessageTemplate();

  const handleCreate = () => {
    setSelectedTemplate(null);
    setIsFormOpen(true);
  };

  const handleEdit = (template: MessageTemplate) => {
    setSelectedTemplate(template);
    setIsFormOpen(true);
  };

  const handleSubmit = async (formData: any) => {
    try {
      // College is sent via X-College-ID header, no need in payload
      const { college, ...rest } = formData;
      const transformedData = {
        ...rest,
        variables: formData.variables || '',
      };

      if (selectedTemplate) {
        await updateMutation.mutateAsync({
          id: selectedTemplate.id,
          data: transformedData,
        });
        toast.success('Template updated successfully');
      } else {
        await createMutation.mutateAsync(transformedData);
        toast.success('Template created successfully');
      }
      setIsFormOpen(false);
      refresh();
    } catch (error: any) {
      toast.error(typeof error.message === 'string' ? error.message : 'Failed to save template');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await deleteMutation.mutateAsync(deleteId);
      toast.success('Template deleted successfully');
      setDeleteId(null);
      refresh();
    } catch (error: any) {
      toast.error(typeof error.message === 'string' ? error.message : 'Failed to delete template');
    }
  };

  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail className="w-4 h-4" />;
      case 'sms':
        return <MessageSquare className="w-4 h-4" />;
      case 'push':
        return <Smartphone className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const filteredTemplates = data?.results.filter((template) => {
    if (!searchQuery) return true;
    return (
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Message Templates</h1>
          <p className="text-muted-foreground mt-1">Manage reusable message templates</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          New Template
        </Button>
      </div>

      {/* Search */}
      <div className="bg-card rounded-lg shadow p-4">
        <Input
          placeholder="Search by name, code, or content..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
      </div>

      {/* Templates List */}
      <div className="bg-card rounded-lg shadow">
        <div className="p-6">
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading templates...</p>
            </div>
          ) : !filteredTemplates || filteredTemplates.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {searchQuery ? 'No templates found' : 'No templates yet'}
              </h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery
                  ? 'Try adjusting your search query'
                  : 'Start by creating your first message template'}
              </p>
              {!searchQuery && (
                <Button onClick={handleCreate}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Template
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      {/* Header */}
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-semibold">{template.name}</h3>
                        <Badge variant="secondary" className="flex items-center gap-1">
                          {getMessageTypeIcon(template.message_type)}
                          {template.message_type}
                        </Badge>
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Code className="w-3 h-3" />
                          {template.code}
                        </Badge>
                        {template.is_active ? (
                          <Badge variant="secondary" className="bg-green-100 text-green-700">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                            Inactive
                          </Badge>
                        )}
                      </div>

                      {/* Content Preview */}
                      <p className="text-sm text-foreground mb-3 line-clamp-2 bg-muted/50 p-2 rounded border border-border">
                        {template.content}
                      </p>

                      {/* Variables */}
                      {template.variables && (
                        <div className="mb-2">
                          <p className="text-xs text-muted-foreground mb-1">Variables:</p>
                          <div className="flex flex-wrap gap-1">
                            {template.variables.split(',').map((variable, idx) => (
                              <Badge
                                key={idx}
                                variant="outline"
                                className="text-xs font-mono"
                              >
                                {'{' + variable.trim() + '}'}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Timestamps */}
                      <div className="text-xs text-muted-foreground">
                        Created: {format(new Date(template.created_at), 'PPp')}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(template)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteId(template.id)}
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
                {data.count} templates
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
              {selectedTemplate ? 'Edit Message Template' : 'New Message Template'}
            </DialogTitle>
          </DialogHeader>
          <MessageTemplateForm
            template={selectedTemplate || undefined}
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
        title="Delete Message Template"
        description="Are you sure you want to delete this template? This action cannot be undone."
        variant="destructive"
      />
    </div>
  );
};
