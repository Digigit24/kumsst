/**
 * Book Returns Page
 */

import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Column, DataTable, FilterConfig } from '../../components/common/DataTable';
import { DetailSidebar } from '../../components/common/DetailSidebar';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { DROPDOWN_PAGE_SIZE } from '../../config/app.config';
import { invalidateBookReturns, useBookIssuesSWR, useBookReturnsSWR, useBooksSWR, useLibraryMembersSWR } from '../../hooks/swr';
import { useUsers } from '../../hooks/useAccounts';
import { useDebounce } from '../../hooks/useDebounce';
import { useCreateBookReturn, useDeleteBookReturn, useUpdateBookReturn } from '../../hooks/useLibrary';
import { BookReturn } from '../../types/library.types';
import { BookReturnForm } from './forms/BookReturnForm';

const BookReturnsPage = () => {
  const [filters, setFilters] = useState<Record<string, any>>({ page: 1, page_size: 10 });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarMode, setSidebarMode] = useState<'view' | 'create' | 'edit'>('view');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState<BookReturn | null>(null);

  const debouncedFilters = useDebounce(filters, 500);
  const { data, isLoading, error } = useBookReturnsSWR(debouncedFilters);
  const { data: issuesData } = useBookIssuesSWR({ page_size: DROPDOWN_PAGE_SIZE });
  const { data: booksData } = useBooksSWR({ page_size: DROPDOWN_PAGE_SIZE });
  const { data: membersData } = useLibraryMembersSWR({ page_size: DROPDOWN_PAGE_SIZE });
  const { data: usersData } = useUsers({ page_size: DROPDOWN_PAGE_SIZE });
  const createReturn = useCreateBookReturn();
  const updateReturn = useUpdateBookReturn();
  const deleteReturn = useDeleteBookReturn();

  // Enrich returns data with book and member names
  const enrichedData = useMemo(() => {
    if (!data?.results) {
      return data;
    }

    // Create lookup maps for available data
    const issuesMap = issuesData?.results ? new Map(issuesData.results.map((i: any) => [i.id, i])) : new Map();
    const booksMap = booksData?.results ? new Map(booksData.results.map((b: any) => [b.id, b])) : new Map();
    const membersMap = membersData?.results ? new Map(membersData.results.map((m: any) => [m.id, m])) : new Map();
    const usersMap = usersData?.results ? new Map(usersData.results.map((u: any) => [u.id, u])) : new Map();

    const enrichedResults = data.results.map(returnRecord => {
      const issueId = typeof returnRecord.issue === 'number' ? returnRecord.issue : returnRecord.issue?.id;
      const issue = issuesMap.get(issueId);

      // Get book and member from the issue
      const bookId = issue ? (typeof issue.book === 'number' ? issue.book : issue.book.id) : null;
      const memberId = issue ? (typeof issue.member === 'number' ? issue.member : issue.member.id) : null;

      const book = bookId ? booksMap.get(bookId) : null;
      const member = memberId ? membersMap.get(memberId) : null;

      // Get member name
      let memberName = memberId ? `Member #${memberId}` : 'Unknown';
      if (member && usersMap.size > 0) {
        const userId = typeof member.user === 'number' ? member.user : member.user?.id;
        const user = usersMap.get(userId);
        memberName = user?.full_name || user?.username || member.member_id || memberName;
      } else if (member) {
        memberName = member.member_id || memberName;
      }

      return {
        ...returnRecord,
        book_title: book?.title || (bookId ? `Book #${bookId}` : 'Unknown'),
        book_author: book?.author,
        member_name: memberName,
        member_id_display: member?.member_id,
      };
    });

    return { ...data, results: enrichedResults };
  }, [data, issuesData, booksData, membersData, usersData]);

  const columns: Column<BookReturn>[] = [
    { key: 'book_title', label: 'Book', sortable: false },
    { key: 'member_name', label: 'Member', sortable: false },
    { key: 'return_date', label: 'Return Date', sortable: true },
    {
      key: 'is_damaged',
      label: 'Status',
      render: (ret) => (
        <Badge variant={ret.is_damaged ? 'destructive' : 'success'}>
          {ret.is_damaged ? 'Damaged' : 'Good'}
        </Badge>
      ),
    },
    { key: 'fine_amount', label: 'Fine', render: (ret) => `₹${ret.fine_amount}` },
  ];

  const filterConfig: FilterConfig[] = [
    {
      name: 'is_damaged',
      label: 'Status',
      type: 'select',
      options: [
        { value: '', label: 'All' },
        { value: 'false', label: 'Good' },
        { value: 'true', label: 'Damaged' },
      ],
    },
  ];

  const handleAddNew = () => {
    setSelectedReturn(null);
    setSidebarMode('create');
    setIsSidebarOpen(true);
  };

  const handleRowClick = (ret: BookReturn) => {
    setSelectedReturn(ret);
    setSidebarMode('view');
    setIsSidebarOpen(true);
  };

  const handleEdit = () => {
    setSidebarMode('edit');
  };

  const handleFormSubmit = async (data: Partial<BookReturn>) => {
    try {
      if (sidebarMode === 'create') {
        await createReturn.mutateAsync(data);
        toast.success('Book return recorded successfully');
      } else if (sidebarMode === 'edit' && selectedReturn) {
        await updateReturn.mutateAsync({ id: selectedReturn.id, data });
        toast.success('Book return updated successfully');
      }
      setIsSidebarOpen(false);
      setSelectedReturn(null);
      invalidateBookReturns();
    } catch (err: any) {
      toast.error(err?.message || 'An error occurred');
      console.error('Form submission error:', err);
    }
  };

  const handleDelete = () => {
    if (!selectedReturn) return;
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedReturn) return;
    try {
      await deleteReturn.mutateAsync(selectedReturn.id);
      toast.success('Book return deleted successfully');
      setIsSidebarOpen(false);
      setIsDeleteDialogOpen(false);
      setSelectedReturn(null);
      invalidateBookReturns();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete return');
    }
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="">
      <DataTable
        title="Book Returns List"
        description="View and manage all book returns"
        columns={columns}
        data={enrichedData}
        isLoading={isLoading}
        error={error?.message}
        onRefresh={() => invalidateBookReturns()}
        onAdd={handleAddNew}
        onRowClick={handleRowClick}
        filters={filters}
        onFiltersChange={setFilters}
        filterConfig={filterConfig}
        searchPlaceholder="Search returns..."
        addButtonLabel="Record Return"
      />

      <DetailSidebar
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
        title={sidebarMode === 'create' ? 'Record Book Return' : 'Return Details'}
        mode={sidebarMode}
      >
        {sidebarMode === 'view' && selectedReturn ? (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Book</h3>
              <p className="mt-1 text-lg font-semibold">{selectedReturn.book_title || `Issue ID: ${selectedReturn.issue}`}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Member</h3>
              <p className="mt-1">{selectedReturn.member_name}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Return Date</h3>
              <p className="mt-1">{selectedReturn.return_date}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
              <p className="mt-1">
                <Badge variant={selectedReturn.is_damaged ? 'destructive' : 'success'}>
                  {selectedReturn.is_damaged ? 'Damaged' : 'Good'}
                </Badge>
              </p>
            </div>
            {selectedReturn.is_damaged && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Damage Charges</h3>
                <p className="mt-1 text-lg font-semibold">₹{selectedReturn.damage_charges}</p>
              </div>
            )}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Fine Amount</h3>
              <p className="mt-1 text-lg font-semibold">₹{selectedReturn.fine_amount}</p>
            </div>
            {selectedReturn.remarks && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Remarks</h3>
                <p className="mt-1">{selectedReturn.remarks}</p>
              </div>
            )}
            <div className="flex gap-2 pt-4">
              <Button onClick={handleEdit} className="flex-1">Edit</Button>
              <Button onClick={handleDelete} variant="destructive" className="flex-1">Delete</Button>
            </div>
          </div>
        ) : (
          <BookReturnForm
            bookReturn={sidebarMode === 'edit' ? selectedReturn : null}
            onSubmit={handleFormSubmit}
            onCancel={handleCloseSidebar}
          />
        )}
      </DetailSidebar>

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Book Return"
        description="Are you sure you want to delete this return record? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        loading={deleteReturn.isPending}
      />
    </div>
  );
};

export default BookReturnsPage;
