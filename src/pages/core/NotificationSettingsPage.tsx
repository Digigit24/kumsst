/**
 * Notification Settings Page - Manage notification preferences
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Column, DataTable } from '../../components/common/DataTable';
import { DetailSidebar } from '../../components/common/DetailSidebar';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { useAuth } from '../../hooks/useAuth';
import { useCreateNotificationSetting, useUpdateNotificationSetting } from '../../hooks/useCore';
import { notificationSettingApi } from '../../services/core.service';
import { NotificationSettingForm } from './components/NotificationSettingForm';

const NotificationSettingsPage = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [filters, setFilters] = useState<any>({ page: 1, page_size: 20 });
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editMode, setEditMode] = useState<'create' | 'edit'>('create');

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['notification-settings', filters],
    queryFn: () => notificationSettingApi.list(filters),
  });

  const { data: selected } = useQuery({
    queryKey: ['notification-setting', selectedId],
    queryFn: () => selectedId ? notificationSettingApi.get(selectedId) : null,
    enabled: !!selectedId,
  });

  const createMutation = useCreateNotificationSetting();
  const updateMutation = useUpdateNotificationSetting();

  const handleCreate = () => {
    setEditMode('create');
    setSelectedId(null);
    setIsFormOpen(true);
  };

  const handleEdit = (id: number) => {
    setEditMode('edit');
    setSelectedId(id);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (formData: any) => {
    try {
      if (editMode === 'create') {
        await createMutation.mutate(formData);
        toast.success('Notification setting created successfully');
      } else if (selectedId) {
        await updateMutation.mutate({ id: selectedId, data: formData });
        toast.success('Notification setting updated successfully');
      }
      setIsFormOpen(false);
      queryClient.invalidateQueries({ queryKey: ['notification-settings'] });
      refetch();
    } catch (error: any) {
      toast.error(typeof error.message === 'string' ? error.message : 'Failed to save notification setting');
      throw error;
    }
  };

  const columns: Column<any>[] = [
    {
      key: 'college_name',
      label: 'College',
      sortable: true,
      render: (item) => <span className="font-medium">{item.college_name}</span>,
    },
    {
      key: 'sms_enabled',
      label: 'SMS',
      render: (item) => (
        <Badge variant={item.sms_enabled ? 'success' : 'outline'}>
          {item.sms_enabled ? 'Enabled' : 'Disabled'}
        </Badge>
      ),
    },
    {
      key: 'email_enabled',
      label: 'Email',
      render: (item) => (
        <Badge variant={item.email_enabled ? 'success' : 'outline'}>
          {item.email_enabled ? 'Enabled' : 'Disabled'}
        </Badge>
      ),
    },
    {
      key: 'whatsapp_enabled',
      label: 'WhatsApp',
      render: (item) => (
        <Badge variant={item.whatsapp_enabled ? 'success' : 'outline'}>
          {item.whatsapp_enabled ? 'Enabled' : 'Disabled'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (item) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            handleEdit(item.id);
          }}
        >
          <Pencil className="w-4 h-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="p-6">
      <DataTable
        title="Notification Settings"
        description="Manage notification preferences for SMS, Email, and WhatsApp"
        data={data}
        columns={columns}
        isLoading={isLoading}
        error={error instanceof Error ? error.message : error ? String(error) : null}
        onRefresh={refetch}
        onRowClick={(item) => { setSelectedId(item.id); setIsSidebarOpen(true); }}
        filters={filters}
        onFiltersChange={setFilters}
        searchPlaceholder="Search settings..."
        onAdd={handleCreate}
        addButtonLabel="Add Setting"
      />

      <DetailSidebar
        isOpen={isSidebarOpen}
        onClose={() => { setIsSidebarOpen(false); setSelectedId(null); }}
        title="Notification Settings"
        mode="view"
        width="xl"
      >
        {selected && (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">College Information</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-muted-foreground">College</label>
                    <p className="font-medium">{selected.college_name}</p>
                  </div>
                </div>
              </div>

              {/* SMS Settings */}
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">SMS Settings</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">SMS Enabled</span>
                    <Badge variant={selected.sms_enabled ? 'success' : 'outline'}>
                      {selected.sms_enabled ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                  {selected.sms_enabled && (
                    <>
                      <div>
                        <label className="text-sm text-muted-foreground">SMS Gateway</label>
                        <p className="font-medium">{selected.sms_gateway || 'Not set'}</p>
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground">API Key</label>
                        <p className="font-mono text-xs">{selected.sms_api_key ? '••••••••' : 'Not set'}</p>
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground">Sender ID</label>
                        <p className="font-medium">{selected.sms_sender_id || 'Not set'}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Email Settings */}
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">Email Settings</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Email Enabled</span>
                    <Badge variant={selected.email_enabled ? 'success' : 'outline'}>
                      {selected.email_enabled ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                  {selected.email_enabled && (
                    <>
                      <div>
                        <label className="text-sm text-muted-foreground">Email Gateway</label>
                        <p className="font-medium">{selected.email_gateway || 'Not set'}</p>
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground">From Email</label>
                        <p className="font-medium">{selected.email_from || 'Not set'}</p>
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground">From Name</label>
                        <p className="font-medium">{selected.email_from_name || 'Not set'}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* WhatsApp Settings */}
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">WhatsApp Settings</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">WhatsApp Enabled</span>
                    <Badge variant={selected.whatsapp_enabled ? 'success' : 'outline'}>
                      {selected.whatsapp_enabled ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                  {selected.whatsapp_enabled && (
                    <>
                      <div>
                        <label className="text-sm text-muted-foreground">API Key</label>
                        <p className="font-mono text-xs">{selected.whatsapp_api_key ? '••••••••' : 'Not set'}</p>
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground">Phone Number</label>
                        <p className="font-medium">{selected.whatsapp_phone_number || 'Not set'}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Notification Preferences */}
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">Notification Preferences</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Admission Notifications</span>
                    <Badge variant={selected.notify_admission ? 'success' : 'outline'}>
                      {selected.notify_admission ? 'On' : 'Off'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Fee Notifications</span>
                    <Badge variant={selected.notify_fees ? 'success' : 'outline'}>
                      {selected.notify_fees ? 'On' : 'Off'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Attendance Notifications</span>
                    <Badge variant={selected.notify_attendance ? 'success' : 'outline'}>
                      {selected.notify_attendance ? 'On' : 'Off'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Exam Notifications</span>
                    <Badge variant={selected.notify_exam ? 'success' : 'outline'}>
                      {selected.notify_exam ? 'On' : 'Off'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Result Notifications</span>
                    <Badge variant={selected.notify_result ? 'success' : 'outline'}>
                      {selected.notify_result ? 'On' : 'Off'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Event Notifications</span>
                    <Badge variant={selected.notify_event ? 'success' : 'outline'}>
                      {selected.notify_event ? 'On' : 'Off'}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">Audit Information</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <label className="text-xs text-muted-foreground">Created At</label>
                    <p>{new Date(selected.created_at).toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Updated At</label>
                    <p>{new Date(selected.updated_at).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Raw API Data Removed */}
            </div>
          </div>
        )}
      </DetailSidebar>

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-3xl max-w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editMode === 'create' ? 'New Notification Setting' : 'Edit Notification Setting'}
            </DialogTitle>
          </DialogHeader>
          {editMode === 'create' || selected ? (
            <NotificationSettingForm
              mode={editMode}
              notificationSetting={editMode === 'edit' ? selected || undefined : undefined}
              collegeId={user?.college || 1}
              onSuccess={() => setIsFormOpen(false)}
              onCancel={() => setIsFormOpen(false)}
              onSubmit={handleFormSubmit}
            />
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              Loading...
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NotificationSettingsPage;
