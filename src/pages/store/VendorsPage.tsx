/**
 * Vendors Page - Manage store vendors
 */

import { useState } from 'react';
import { Column, DataTable, FilterConfig } from '../../components/common/DataTable';
import { DetailSidebar } from '../../components/common/DetailSidebar';
import { Badge } from '../../components/ui/badge';
import { useCreateVendor, useUpdateVendor, useDeleteVendor } from '../../hooks/useStore';
import { useVendorsSWR, invalidateVendors } from '../../hooks/swr';
import { VendorForm } from './forms/VendorForm';
import { toast } from 'sonner';

const VendorsPage = () => {
  const [filters, setFilters] = useState<Record<string, any>>({ page: 1, page_size: 10 });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarMode, setSidebarMode] = useState<'view' | 'create' | 'edit'>('view');
  const [selectedVendor, setSelectedVendor] = useState<any | null>(null);

  const { data, isLoading, error, refresh } = useVendorsSWR(filters);
  const createVendor = useCreateVendor();
  const updateVendor = useUpdateVendor();
  const deleteVendor = useDeleteVendor();

  const columns: Column<any>[] = [
    {
      key: 'name',
      label: 'Vendor Name',
      render: (vendor) => (
        <span className="font-semibold text-primary">{vendor.name}</span>
      ),
      sortable: true,
    },
    {
      key: 'contact_person',
      label: 'Contact Person',
      render: (vendor) => vendor.contact_person,
      sortable: true,
    },
    {
      key: 'phone',
      label: 'Phone',
      render: (vendor) => vendor.phone,
    },
    {
      key: 'email',
      label: 'Email',
      render: (vendor) => vendor.email,
    },
    {
      key: 'gstin',
      label: 'GSTIN',
      render: (vendor) => vendor.gstin || '-',
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (vendor) => (
        <Badge variant={vendor.is_active ? 'default' : 'secondary'}>
          {vendor.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
  ];

  const filterConfig: FilterConfig[] = [
    {
      name: 'search',
      label: 'Search',
      type: 'text',
      placeholder: 'Search vendors...',
    },
    {
      name: 'is_active',
      label: 'Status',
      type: 'select',
      options: [
        { value: '', label: 'All' },
        { value: 'true', label: 'Active' },
        { value: 'false', label: 'Inactive' },
      ],
    },
  ];

  const handleAddNew = () => {
    setSelectedVendor(null);
    setSidebarMode('create');
    setIsSidebarOpen(true);
  };

  const handleRowClick = (vendor: any) => {
    setSelectedVendor(vendor);
    setSidebarMode('view');
    setIsSidebarOpen(true);
  };

  const handleEdit = () => {
    setSidebarMode('edit');
  };

  const handleFormSubmit = async (data: any) => {
    try {
      if (sidebarMode === 'create') {
        await createVendor.mutateAsync(data);
        toast.success('Vendor created successfully');
      } else {
        await updateVendor.mutateAsync({ id: selectedVendor.id, data });
        toast.success('Vendor updated successfully');
      }
      setIsSidebarOpen(false);
      refresh();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save vendor');
    }
  };

  const handleDelete = async () => {
    if (!selectedVendor) return;
    
    if (window.confirm('Are you sure you want to delete this vendor?')) {
      try {
        await deleteVendor.mutateAsync(selectedVendor.id);
        toast.success('Vendor deleted successfully');
        setIsSidebarOpen(false);
        refresh();
      } catch (error: any) {
        toast.error(error?.message || 'Failed to delete vendor');
      }
    }
  };

  return (
    <div>
      <DataTable
        title="Vendors"
        description="Manage your store vendors and suppliers"
        columns={columns}
        data={data || null}
        isLoading={isLoading}
        error={error?.message || null}
        filters={filters}
        onFiltersChange={setFilters}
        filterConfig={filterConfig}
        onRowClick={handleRowClick}
        onRefresh={refresh}
        onAdd={handleAddNew}
        addButtonLabel="Add Vendor"
      />

      <DetailSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        title={sidebarMode === 'create' ? 'Create Vendor' : sidebarMode === 'edit' ? 'Edit Vendor' : 'Vendor Details'}
        mode={sidebarMode}
        onEdit={handleEdit}
        onDelete={handleDelete}
        data={selectedVendor}
      >
        {(sidebarMode === 'create' || sidebarMode === 'edit') && (
          <VendorForm
            vendor={sidebarMode === 'edit' ? selectedVendor : null}
            onSubmit={handleFormSubmit}
            onCancel={() => setIsSidebarOpen(false)}
          />
        )}

        {sidebarMode === 'view' && selectedVendor && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Vendor Name</label>
              <p className="text-base font-semibold">{selectedVendor.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Contact Person</label>
              <p className="text-base">{selectedVendor.contact_person}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <p className="text-base">{selectedVendor.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Phone</label>
              <p className="text-base">{selectedVendor.phone}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Address</label>
              <p className="text-base">{selectedVendor.address}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">GSTIN</label>
              <p className="text-base">{selectedVendor.gstin || '-'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <p>
                <Badge variant={selectedVendor.is_active ? 'default' : 'secondary'}>
                  {selectedVendor.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </p>
            </div>
          </div>
        )}
      </DetailSidebar>
    </div>
  );
};

export default VendorsPage;
