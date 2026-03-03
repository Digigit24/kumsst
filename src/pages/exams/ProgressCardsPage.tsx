/**
 * Progress Cards Page
 * Generate and manage student progress cards
 */

import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Column, DataTable } from '../../components/common/DataTable';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import {
  useCreateProgressCard,
  useDeleteProgressCard,
  useProgressCards,
  useUpdateProgressCard,
} from '../../hooks/useExamination';
import type { ProgressCard } from '../../types/examination.types';
import { ExamDrawer } from './components/ExamDrawer';
import { ProgressCardForm } from './forms/ProgressCardForm';

const ProgressCardsPage = () => {
  const [filters, setFilters] = useState<Record<string, any>>({ page: 1, page_size: 10 });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarMode, setSidebarMode] = useState<'view' | 'create' | 'edit'>('view');
  const [selectedCard, setSelectedCard] = useState<ProgressCard | undefined>(undefined);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // Queries and mutations
  const { data, isLoading, error, refetch } = useProgressCards(filters);
  const createMutation = useCreateProgressCard();
  const updateMutation = useUpdateProgressCard();
  const deleteMutation = useDeleteProgressCard();

  const handleCreate = () => {
    setSelectedCard(undefined);
    setSidebarMode('create');
    setIsSidebarOpen(true);
  };

  const handleEdit = (card: ProgressCard) => {
    setSelectedCard(card);
    setSidebarMode('edit');
    setIsSidebarOpen(true);
  };

  const handleRowClick = (card: ProgressCard) => {
    setSelectedCard(card);
    setSidebarMode('view');
    setIsSidebarOpen(true);
  };

  const switchToEdit = () => {
    setSidebarMode('edit');
  };

  const handleDelete = async () => {
    if (!deleteId && selectedCard) {
      // If triggered from sidebar delete button
      setDeleteId(selectedCard.id);
      return;
    }

    if (!deleteId) return;
    try {
      await deleteMutation.mutateAsync(deleteId);
      toast.success('Progress card deleted successfully');
      setDeleteId(null);
      setIsSidebarOpen(false);
      refetch();
    } catch (error: any) {
      toast.error(typeof error.message === 'string' ? error.message : 'Failed to delete progress card');
    }
  };

  const handleSubmit = async (formData: any) => {
    try {
      if (selectedCard) {
        await updateMutation.mutateAsync({
          id: selectedCard.id,
          data: formData,
        });
        toast.success('Progress card updated successfully');
      } else {
        await createMutation.mutateAsync(formData);
        toast.success('Progress card created successfully');
      }
      setIsSidebarOpen(false);
      refetch();
    } catch (error: any) {
      toast.error(typeof error.message === 'string' ? error.message : 'Failed to save progress card');
    }
  };

  const columns: Column<any>[] = [
    { key: 'student_name', label: 'Student', sortable: true },
    { key: 'exam_name', label: 'Exam', sortable: true },
    { key: 'issue_date', label: 'Issue Date', sortable: true },
    {
      key: 'actions',
      label: 'Actions',
      render: (card) => (
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="sm" onClick={() => handleEdit(card)}>
            <Pencil className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setDeleteId(card.id)}>
            <Trash2 className="w-4 h-4 text-red-500" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Progress Cards</h1>
          <p className="text-muted-foreground">View and generate student progress cards</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          New Progress Card
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={data}
        isLoading={isLoading}
        error={error?.message}
        onRefresh={refetch}
        filters={filters}
        onFiltersChange={setFilters}
        searchPlaceholder="Search progress cards..."
        onRowClick={handleRowClick}
        searchDebounceDelay={500}
      />

      <ExamDrawer
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        title={sidebarMode === 'create' ? 'New Progress Card' : selectedCard?.student_name || 'Progress Card'}
        subtitle=""
        mode={sidebarMode}
        width="xl"
      >
        {sidebarMode === 'view' && selectedCard ? (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Student</h3>
              <p className="mt-1 text-lg">{selectedCard.student_name}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Exam</h3>
              <p className="mt-1">{selectedCard.exam_name}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Issue Date</h3>
              <p className="mt-1">{selectedCard.issue_date}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Card File</h3>
              {selectedCard.card_file ? (
                <a href={selectedCard.card_file} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline mt-1 block">
                  View Card File
                </a>
              ) : (
                <p className="mt-1 text-muted-foreground">No file available</p>
              )}
            </div>
            <div className="pt-4 flex gap-2">
              <Button onClick={switchToEdit}>Edit</Button>
              <Button variant="destructive" onClick={() => setDeleteId(selectedCard.id)}>Delete</Button>
            </div>
          </div>
        ) : (
          <ProgressCardForm
            initialData={selectedCard}
            onSubmit={handleSubmit}
            onCancel={() => setIsSidebarOpen(false)}
            isLoading={createMutation.isPending || updateMutation.isPending}
          />
        )}
      </ExamDrawer>

      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Progress Card"
        description="Are you sure you want to delete this progress card? This action cannot be undone."
        variant="destructive"
      />
    </div>
  );
};

export default ProgressCardsPage;
