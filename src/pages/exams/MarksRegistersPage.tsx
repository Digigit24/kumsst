/*
 * Marks Registers Page
 * View consolidated marks registers
 */
import { useState, useMemo } from 'react';
import { Column, DataTable, FilterConfig } from '../../components/common/DataTable';
import { ExamDrawer } from './components/ExamDrawer';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { useMarksRegisters, useCreateMarksRegister, useUpdateMarksRegister, useDeleteMarksRegister } from '../../hooks/useExamination';
import { useExamsSWR, useSubjectsSWR, useAllSectionsSWR } from '../../hooks/swr';
import { MarksRegisterForm } from './forms';
import { toast } from 'sonner';
import { DROPDOWN_PAGE_SIZE } from '@/config/app.config';
import type { MarksRegister } from '../../types/examination.types';

const MarksRegistersPage = () => {
  const [filters, setFilters] = useState<Record<string, any>>({ page: 1, page_size: 10 });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarMode, setSidebarMode] = useState<'view' | 'create' | 'edit'>('view');
  const [selectedRegister, setSelectedRegister] = useState<any | null>(null);

  // Fetch marks registers using real API
  const { data, isLoading, error, refetch } = useMarksRegisters(filters);

  // Fetch related data for ID-to-name mapping (SWR cached)
  const { data: examsData } = useExamsSWR({ page_size: DROPDOWN_PAGE_SIZE });
  const { data: subjectsData } = useSubjectsSWR({ page_size: DROPDOWN_PAGE_SIZE });
  const { data: sectionsData } = useAllSectionsSWR();

  // Create lookup maps for IDs to names
  const examMap = useMemo(() => {
    if (!examsData?.results) return {};
    return Object.fromEntries(
      examsData.results.map((exam: any) => [exam.id, exam])
    );
  }, [examsData]);

  const subjectMap = useMemo(() => {
    if (!subjectsData?.results) return {};
    return Object.fromEntries(
      subjectsData.results.map((subject: any) => [subject.id, subject])
    );
  }, [subjectsData]);

  const sectionMap = useMemo(() => {
    if (!sectionsData?.results) return {};
    return Object.fromEntries(
      sectionsData.results.map((section: any) => [section.id, section])
    );
  }, [sectionsData]);

  // Transform marks register data to include display names
  const enrichedData = useMemo(() => {
    if (!data?.results) return data;

    return {
      ...data,
      results: data.results.map((register: any) => ({
        ...register,
        exam_name: examMap[register.exam]?.name || '-',
        subject_name: subjectMap[register.subject]?.name || '-',
        section_name: sectionMap[register.section]?.name || '-',
        class_name: sectionMap[register.section]?.class_name || '-',
      })),
    };
  }, [data, examMap, subjectMap, sectionMap]);

  const createMutation = useCreateMarksRegister();
  const updateMutation = useUpdateMarksRegister();
  const deleteMutation = useDeleteMarksRegister();

  const columns: Column<any>[] = [
    { key: 'class_name', label: 'Class', sortable: true },
    { key: 'subject_name', label: 'Subject', sortable: true },
    {
      key: 'max_marks',
      label: 'Max Marks',
      render: (register) => <Badge variant="outline">{register.max_marks}</Badge>,
      sortable: true,
    },
    {
      key: 'pass_marks',
      label: 'Pass Marks',
      render: (register) => <Badge variant="secondary">{register.pass_marks}</Badge>,
      sortable: true,
    },
    {
      key: 'is_verified',
      label: 'Verified',
      render: (register) => (
        <Badge variant={register.is_verified ? 'success' : 'outline'}>
          {register.is_verified ? 'Yes' : 'No'}
        </Badge>
      ),
    },
  ];

  const filterConfig: FilterConfig[] = [
    {
      name: 'is_verified',
      label: 'Verification Status',
      type: 'select',
      options: [
        { value: '', label: 'All' },
        { value: 'true', label: 'Verified' },
        { value: 'false', label: 'Unverified' },
      ],
    },
  ];

  const handleAddNew = () => {
    setSelectedRegister(null);
    setSidebarMode('create');
    setIsSidebarOpen(true);
  };

  const handleRowClick = (register: MarksRegister) => {
    setSelectedRegister(register);
    setSidebarMode('view');
    setIsSidebarOpen(true);
  };

  const handleEdit = () => {
    setSidebarMode('edit');
  };

  const handleFormSubmit = async (data: any) => {
    try {
      if (sidebarMode === 'edit' && selectedRegister?.id) {
        await updateMutation.mutateAsync({ id: selectedRegister.id, data });
        toast.success('Marks register updated successfully');
      } else {
        await createMutation.mutateAsync(data);
        toast.success('Marks register created successfully');
      }
      setIsSidebarOpen(false);
      refetch();
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to save marks register';
      toast.error(errorMessage);
    }
  };

  const handleDelete = async () => {
    if (!selectedRegister?.id) return;

    if (window.confirm('Are you sure you want to delete this marks register?')) {
      try {
        await deleteMutation.mutateAsync(selectedRegister.id);
        toast.success('Marks register deleted successfully');
        setIsSidebarOpen(false);
        refetch();
      } catch (error: any) {
        toast.error(error?.message || 'Failed to delete marks register');
      }
    }
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
    setSelectedRegister(null);
  };

  return (
    <div className="">
      <DataTable
        title="Marks Registers"
        description="View and manage exam marks registers"
        columns={columns}
        data={enrichedData}
        isLoading={isLoading}
        error={error?.message}
        onRefresh={refetch}
        onAdd={handleAddNew}
        onRowClick={handleRowClick}
        filters={filters}
        onFiltersChange={setFilters}
        filterConfig={filterConfig}
        searchPlaceholder="Search registers..."
        addButtonLabel="Create Register"
      />

      <ExamDrawer
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
        title={sidebarMode === 'create' ? 'Create Marks Register' : `${selectedRegister?.class_name || 'Marks'} Register`}
        mode={sidebarMode}
        width="xl"
      >
        {sidebarMode === 'view' && selectedRegister ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Class</h3>
                <p className="mt-1 text-lg">{selectedRegister.class_name}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Subject</h3>
                <p className="mt-1 text-lg">{selectedRegister.subject_name}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Max Marks</h3>
                <p className="mt-1 text-2xl font-bold">{selectedRegister.max_marks}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Pass Marks</h3>
                <p className="mt-1 text-2xl font-bold text-green-600">{selectedRegister.pass_marks}</p>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Verified</h3>
              <p className="mt-1">
                <Badge variant={selectedRegister.is_verified ? 'success' : 'outline'}>
                  {selectedRegister.is_verified ? 'Verified' : 'Unverified'}
                </Badge>
              </p>
            </div>
            {selectedRegister.verified_by && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Verified By</h3>
                <p className="mt-1">{selectedRegister.verified_by}</p>
              </div>
            )}
            {selectedRegister.remarks && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Remarks</h3>
                <p className="mt-1">{selectedRegister.remarks}</p>
              </div>
            )}
            <div className="pt-4 flex gap-2">
              <Button onClick={handleEdit}>Edit</Button>
              <Button variant="destructive" onClick={handleDelete}>Delete</Button>
            </div>
          </div>
        ) : (
          <MarksRegisterForm
            register={sidebarMode === 'edit' ? selectedRegister : null}
            onSubmit={handleFormSubmit}
            onCancel={handleCloseSidebar}
          />
        )}
      </ExamDrawer>
    </div>
  );
};

export default MarksRegistersPage;

