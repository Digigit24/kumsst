import { DataTable } from '@/components/common/DataTable';
import { DetailSidebar } from '@/components/common/DetailSidebar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { CollegeStore } from '@/types/store.types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCollegeStoresSWR, invalidateCollegeStores } from '@/hooks/swr';
import { collegeStoresApi } from '@/services/store.service';
import { Building2, Mail, MapPin, Phone, Plus, User } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { CollegeStoreForm } from './forms/CollegeStoreForm';

export const CollegeStoresPage: React.FC = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [sidebarMode, setSidebarMode] = useState<'view' | 'create' | 'edit'>('view');
    const [selectedStore, setSelectedStore] = useState<CollegeStore | null>(null);
    const [filters, setFilters] = useState({ page: 1, page_size: 10 });

    const queryClient = useQueryClient();

    // Fetch Data
    const { data, isLoading, refresh } = useCollegeStoresSWR(filters);

    // Mutations
    const createMutation = useMutation({
        mutationFn: (data: any) => collegeStoresApi.create(data),
        onSuccess: () => {
            invalidateCollegeStores();
            toast.success('Store created successfully');
            setIsSidebarOpen(false);
        },
        onError: (error: any) => {
            toast.error(typeof error.message === 'string' ? error.message : 'Failed to create store');
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: any }) => collegeStoresApi.update(id, data),
        onSuccess: () => {
            invalidateCollegeStores();
            toast.success('Store updated successfully');
            setIsSidebarOpen(false);
        },
        onError: (error: any) => {
            toast.error(typeof error.message === 'string' ? error.message : 'Failed to update store');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => collegeStoresApi.delete(id),
        onSuccess: () => {
            invalidateCollegeStores();
            toast.success('Store deleted successfully');
        },
        onError: (error: any) => {
            toast.error(typeof error.message === 'string' ? error.message : 'Failed to delete store');
        }
    });

    const columns = [
        { key: 'code', label: 'Code', sortable: true },
        { key: 'name', label: 'Name', sortable: true },
        { key: 'college_name', label: 'College' },
        {
            key: 'location',
            label: 'Location',
            render: (row: CollegeStore) => `${row.city}, ${row.state}`,
        },
        { key: 'contact_phone', label: 'Contact' },
        { key: 'manager_name', label: 'Manager' },
        {
            key: 'is_active',
            label: 'Status',
            render: (row: CollegeStore) => (
                <Badge variant={row.is_active ? 'success' : 'secondary'}>
                    {row.is_active ? 'Active' : 'Inactive'}
                </Badge>
            ),
        },
    ];

    const handleView = (store: CollegeStore) => {
        setSelectedStore(store);
        setSidebarMode('view');
        setIsSidebarOpen(true);
    };

    const handleEdit = (store: CollegeStore) => {
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
        if (confirm('Delete this college store?')) {
            await deleteMutation.mutateAsync(id);
        }
    };

    const handleFormSubmit = async (data: any) => {
        if (sidebarMode === 'edit' && selectedStore) {
            await updateMutation.mutateAsync({ id: selectedStore.id, data });
        } else {
            await createMutation.mutateAsync(data);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">College Stores</h1>
                    <p className="text-muted-foreground">Manage college-level stores</p>
                </div>
                <Button onClick={handleCreate}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add College Store
                </Button>
            </div>

            <DataTable<CollegeStore>
                columns={columns}
                data={data || null}
                isLoading={isLoading}
                onRowClick={handleView}
                onEdit={handleEdit}
                onDelete={(item) => handleDelete(item.id)}
                filters={filters}
                onFiltersChange={(newFilters) => setFilters(newFilters as any)}
                error={null}
                onRefresh={() => {
                    invalidateCollegeStores();
                }}
            />

            <DetailSidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                title={sidebarMode === 'create' ? 'New College Store' : sidebarMode === 'edit' ? 'Edit Store' : 'Store Details'}
                mode={sidebarMode}
            >
                {(sidebarMode === 'create' || sidebarMode === 'edit') ? (
                    <CollegeStoreForm
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
                                    <p className="text-sm font-medium text-muted-foreground">College</p>
                                    <p>{selectedStore.college_name || selectedStore.college}</p>
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
