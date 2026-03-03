/**
 * Student Fee Discounts Page
 */

import { useState } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Column, DataTable, FilterConfig } from '../../components/common/DataTable';
import { DetailSidebar } from '../../components/common/DetailSidebar';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { useCreateStudentFeeDiscount, useDeleteStudentFeeDiscount, useUpdateStudentFeeDiscount } from '../../hooks/useFees';
import { useStudentFeeDiscountsSWR, invalidateStudentFeeDiscounts } from '../../hooks/swr';
import type { StudentFeeDiscount, StudentFeeDiscountCreateInput } from '../../types/fees.types';
import { StudentFeeDiscountForm } from './forms/StudentFeeDiscountForm';

const StudentFeeDiscountsPage = () => {
  const [filters, setFilters] = useState<Record<string, any>>({ page: 1, page_size: 10 });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarMode, setSidebarMode] = useState<'view' | 'create' | 'edit'>('view');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedDiscount, setSelectedDiscount] = useState<StudentFeeDiscount | null>(null);

  const { data, isLoading, error } = useStudentFeeDiscountsSWR(filters);
  const createStudentFeeDiscount = useCreateStudentFeeDiscount();
  const updateStudentFeeDiscount = useUpdateStudentFeeDiscount();
  const deleteStudentFeeDiscount = useDeleteStudentFeeDiscount();

  const columns: Column<StudentFeeDiscount>[] = [
    {
      key: 'student_name',
      label: 'Student',
      render: (item) => item.student_details ?
        (<div>
          <span className="font-medium">{item.student_details.student_name}</span>
          <br />
          <span className="text-xs text-muted-foreground">{item.student_details.admission_number}</span>
        </div>) :
        (item.student_name || '-')
    },
    {
      key: 'discount_name',
      label: 'Discount',
      render: (item) => item.discount_details ?
        (<div>
          <span className="font-medium">{item.discount_details.name}</span>
          <span className="text-xs text-muted-foreground ml-1">({item.discount_details.code})</span>
        </div>) :
        (item.discount_name || '-')
    },
    {
      key: 'value',
      label: 'Value',
      render: (item) => {
        if (!item.discount_details) return '-';
        if (item.discount_details.discount_type === 'percentage') {
          return <Badge variant="outline">{parseFloat(item.discount_details.percentage || '0')}%</Badge>;
        }
        return <span className="font-medium">₹{parseFloat(item.discount_details.amount || '0').toLocaleString()}</span>;
      }
    },
    { key: 'applied_date', label: 'Applied Date', sortable: true },
    {
      key: 'is_active',
      label: 'Status',
      render: (discount) => (
        <Badge variant={discount.is_active ? 'success' : 'destructive'}>
          {discount.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
  ];

  const filterConfig: FilterConfig[] = [
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
    setSelectedDiscount(null);
    setSidebarMode('create');
    setIsSidebarOpen(true);
  };

  const handleRowClick = (discount: StudentFeeDiscount) => {
    setSelectedDiscount(discount);
    setSidebarMode('view');
    setIsSidebarOpen(true);
  };

  const handleEdit = () => {
    setSidebarMode('edit');
  };

  const handleFormSubmit = async (data: Partial<StudentFeeDiscountCreateInput>) => {
    console.log('handleFormSubmit called with data:', data);
    try {
      if (sidebarMode === 'create') {
        console.log('Creating student fee discount...');
        const result = await createStudentFeeDiscount.mutateAsync(data);
        console.log('Create result:', result);
        toast.success('Student fee discount created successfully');
      } else if (sidebarMode === 'edit' && selectedDiscount) {
        console.log('Updating student fee discount...');
        const result = await updateStudentFeeDiscount.mutateAsync({ id: selectedDiscount.id, data });
        console.log('Update result:', result);
        toast.success('Student fee discount updated successfully');
      }
      setIsSidebarOpen(false);
      setSelectedDiscount(null);
      await invalidateStudentFeeDiscounts();
    } catch (err: any) {
      console.error('Form submission error:', err);
      toast.error(err?.message || err?.error || 'An error occurred');
    }
  };

  const handleDelete = () => {
    if (!selectedDiscount) return;
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedDiscount) return;
    try {
      await deleteStudentFeeDiscount.mutateAsync(selectedDiscount.id);
      toast.success('Student fee discount deleted successfully');
      setIsSidebarOpen(false);
      setIsDeleteDialogOpen(false);
      setSelectedDiscount(null);
      await invalidateStudentFeeDiscounts();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete student fee discount');
    }
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
    setSelectedDiscount(null);
  };

  return (
    <div className="">
      <DataTable
        title="Student Fee Discounts"
        description="View and manage student fee discounts"
        columns={columns}
        data={data}
        isLoading={isLoading}
        error={error?.message}
        onRefresh={() => invalidateStudentFeeDiscounts()}
        onAdd={handleAddNew}
        onRowClick={handleRowClick}
        filters={filters}
        onFiltersChange={setFilters}
        filterConfig={filterConfig}
        searchPlaceholder="Search student fee discounts..."
        addButtonLabel="Add Student Fee Discount"
      />

      <DetailSidebar
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
        title={sidebarMode === 'create' ? 'Create Student Fee Discount' : 'Student Fee Discount Details'}
        mode={sidebarMode}
      >
        {sidebarMode === 'view' && selectedDiscount ? (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Student</h3>
              {selectedDiscount.student_details ? (
                <>
                  <p className="mt-1 text-lg font-semibold">{selectedDiscount.student_details.student_name}</p>
                  <p className="text-sm text-muted-foreground">{selectedDiscount.student_details.admission_number}</p>
                </>
              ) : (
                <p className="mt-1 text-lg font-semibold">{selectedDiscount.student_name || `ID: ${selectedDiscount.student}`}</p>
              )}
            </div>

            <div className="p-4 bg-primary/10 rounded-lg">
              <h3 className="text-sm font-medium text-muted-foreground">Discount Applied</h3>
              {selectedDiscount.discount_details ? (
                <>
                  <div className="flex justify-between items-center mt-2">
                    <span className="font-semibold">{selectedDiscount.discount_details.name}</span>
                    <Badge variant="outline">{selectedDiscount.discount_details.code}</Badge>
                  </div>
                  <div className="mt-2 text-2xl font-bold">
                    {selectedDiscount.discount_details.discount_type === 'percentage'
                      ? `${parseFloat(selectedDiscount.discount_details.percentage || '0')}%`
                      : `₹${parseFloat(selectedDiscount.discount_details.amount || '0').toLocaleString()}`}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 capitalize">{selectedDiscount.discount_details.discount_type} Discount</p>
                </>
              ) : (
                <p className="mt-1 text-lg">{selectedDiscount.discount_name || `ID: ${selectedDiscount.discount}`}</p>
              )}
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Applied Date</h3>
              <p className="mt-1 text-lg">{selectedDiscount.applied_date}</p>
            </div>
            {selectedDiscount.remarks && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Remarks</h3>
                <p className="mt-1">{selectedDiscount.remarks}</p>
              </div>
            )}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
              <p className="mt-1">
                <Badge variant={selectedDiscount.is_active ? 'success' : 'destructive'}>
                  {selectedDiscount.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </p>
            </div>
            <div className="flex gap-2 pt-4">
              <Button onClick={handleEdit} className="flex-1">Edit</Button>
              <Button onClick={handleDelete} variant="destructive" className="flex-1">Delete</Button>
            </div>
          </div>
        ) : (
          <StudentFeeDiscountForm
            studentFeeDiscount={sidebarMode === 'edit' ? selectedDiscount : null}
            onSubmit={handleFormSubmit}
            onCancel={handleCloseSidebar}
          />
        )}
      </DetailSidebar>

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Student Fee Discount"
        description="Are you sure you want to delete this student fee discount? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        loading={deleteStudentFeeDiscount.isPending}
      />
    </div>
  );
};

export default StudentFeeDiscountsPage;
