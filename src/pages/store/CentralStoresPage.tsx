import React, { useState } from 'react';
import { Plus, Building2, MapPin, Phone, Mail, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useDeleteCentralStore, useCreateCentralStore, useUpdateCentralStore } from '@/hooks/useCentralStores';
import { useCentralStoresSWR, invalidateCentralStores } from '@/hooks/swr';
import { Column, DataTable } from '@/components/common/DataTable';
import { DetailSidebar } from '@/components/common/DetailSidebar';
import { CentralStoreForm } from './forms/CentralStoreForm';
import type { CentralStore } from '@/types/store.types';
import { toast } from 'sonner';

export const CentralStoresPage: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarMode, setSidebarMode] = useState<'view' | 'create' | 'edit'>('view');
  const [selectedStore, setSelectedStore] = useState<CentralStore | null>(null);
  const [filters, setFilters] = useState({ page: 1, page_size: 10 });

  const { data, isLoading, refresh } = useCentralStoresSWR(filters);
  const deleteMutation = useDeleteCentralStore();
  const createMutation = useCreateCentralStore();
  const updateMutation = useUpdateCentralStore();

  const columns: Column<CentralStore>[] = [
    { key: 'code', label: 'Code', sortable: true },
    { key: 'name', label: 'Name', sortable: true },
    {
      key: 'location',
      label: 'Location',
      render: (row: CentralStore) => `${row.city}, ${row.state}`,
    },
    { key: 'contact_phone', label: 'Contact' },
    { key: 'contact_email', label: 'Email' },
    {
      key: 'is_active',
      label: 'Status',
      render: (row: CentralStore) => (
        <Badge variant={row.is_active ? 'success' : 'secondary'}>
          {row.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
  ];

  const handleView = (store: CentralStore) => {
    setSelectedStore(store);
    setSidebarMode('view');
    setIsSidebarOpen(true);
  };

  const handleEdit = (store: CentralStore) => {
    setSelectedStore(store);
    setSidebarMode('edit');
    setIsSidebarOpen(true);
  };

  const handleCreate = () => {
    setSelectedStore(null);
    setSidebarMode('create');
    setIsSidebarOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Delete this central store?')) {
      try {
        await deleteMutation.mutateAsync(id);
        toast.success('Store deleted successfully');
        refresh();
      } catch (error: any) {
        toast.error(typeof error.message === 'string' ? error.message : 'Failed to delete store');
      }
    }
  };

  const handleFormSubmit = async (data: any) => {
    try {
      if (sidebarMode === 'edit' && selectedStore) {
        await updateMutation.mutateAsync({ id: selectedStore.id, data });
        toast.success('Store updated successfully');
      } else {
        await createMutation.mutateAsync(data);
        toast.success('Store created successfully');
      }
      setIsSidebarOpen(false);
      refresh();
    } catch (error: any) {
      toast.error(typeof error.message === 'string' ? error.message : 'Operation failed');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Central Stores</h1>
          <p className="text-muted-foreground">Manage central store locations</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add Central Store
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={data}
        isLoading={isLoading}
        onRowClick={handleView}
        onEdit={handleEdit}
        onDelete={(store) => handleDelete(store.id)}
        onPageChange={(page: number) => setFilters({ ...filters, page })}
      />

      <DetailSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        title={sidebarMode === 'create' ? 'New Central Store' : sidebarMode === 'edit' ? 'Edit Store' : 'Store Details'}
        mode={sidebarMode}
      >
        {(sidebarMode === 'create' || sidebarMode === 'edit') ? (
          <CentralStoreForm
            store={selectedStore}
            onSubmit={handleFormSubmit}
            onCancel={() => setIsSidebarOpen(false)}
          />
        ) : selectedStore && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  {selectedStore.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Code</p>
                    <p>{selectedStore.code}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                    <Badge variant={selectedStore.is_active ? 'success' : 'secondary'}>
                      {selectedStore.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <MapPin className="h-4 w-4" /> Address
                  </p>
                  <p>{selectedStore.address_line1}</p>
                  {selectedStore.address_line2 && <p>{selectedStore.address_line2}</p>}
                  <p>{selectedStore.city}, {selectedStore.state} - {selectedStore.pincode}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Phone className="h-4 w-4" /> Contact
                  </p>
                  <p>{selectedStore.contact_phone}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Mail className="h-4 w-4" /> Email
                  </p>
                  <p>{selectedStore.contact_email}</p>
                </div>

                {selectedStore.manager_name && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <User className="h-4 w-4" /> Manager
                    </p>
                    <p>{selectedStore.manager_name}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </DetailSidebar>
    </div>
  );
};
