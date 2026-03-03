/**
 * Exam Types Page
 * Master configuration for examination categories
 */

import dataLoadingGif from '@/assets/data-loading.gif';
import { motion } from 'framer-motion';
import {
  BookType,
  Calendar,
  CheckCircle2,
  Hash,
  Percent,
  Plus,
  RefreshCw,
  Tags,
  XCircle,
  FileText
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Column, DataTable, FilterConfig } from '../../components/common/DataTable';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Separator } from '../../components/ui/separator';
import { useCreateExamType, useDeleteExamType, useExamTypes, useUpdateExamType } from '../../hooks/useExamination';
import { ExamType, ExamTypeListItem } from '../../types/examination.types';
import { ExamDrawer } from './components/ExamDrawer';
import { ExamTypeForm } from './forms';

const ExamTypesPage = () => {
  const [filters, setFilters] = useState<Record<string, any>>({ page: 1, page_size: 10 });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarMode, setSidebarMode] = useState<'view' | 'create' | 'edit'>('view');
  const [selectedExamType, setSelectedExamType] = useState<ExamType | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // Fetch exam types
  const { data, isLoading, error, refetch } = useExamTypes(filters);
  const createMutation = useCreateExamType();
  const updateMutation = useUpdateExamType();
  const deleteMutation = useDeleteExamType();

  const totalTypes = data?.results?.length || 0;
  const activeTypes = data?.results?.filter(r => r.is_active).length || 0;

  const getGradient = (name: string) => {
    const gradients = [
      'from-blue-500 to-cyan-400',
      'from-purple-500 to-pink-400',
      'from-orange-500 to-amber-400',
      'from-emerald-500 to-green-400',
      'from-indigo-500 to-purple-400',
      'from-rose-500 to-orange-400'
    ];
    const index = name.length % gradients.length;
    return gradients[index];
  };

  const columns: Column<ExamTypeListItem>[] = [
    {
      key: 'name',
      label: 'Exam Type',
      sortable: true,
      render: (type) => (
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-primary/10 text-primary`}>
            <BookType className="h-4 w-4" />
          </div>
          <div>
            <p className="font-semibold text-foreground">{type.name}</p>
            <p className="text-xs text-muted-foreground font-mono">{type.code}</p>
          </div>
        </div>
      )
    },
    {
      key: 'weightage',
      label: 'Weightage',
      sortable: true,
      render: (type) => (
        <div className="flex items-center gap-1.5 font-medium">
          <Percent className="h-3.5 w-3.5 text-muted-foreground" />
          {type.weightage}%
        </div>
      )
    },
    {
      key: 'description',
      label: 'Description',
      render: (type) => (
        <span className="text-sm text-muted-foreground truncate max-w-[200px] block" title={type.description || ''}>
          {type.description || '-'}
        </span>
      ),
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (type) => (
        <Badge variant={type.is_active ? 'success' : 'secondary'} className="rounded-full">
          {type.is_active ? 'Active' : 'Archived'}
        </Badge>
      ),
    }
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
    setSelectedExamType(null);
    setSidebarMode('create');
    setIsSidebarOpen(true);
  };

  const handleRowClick = (examType: ExamTypeListItem) => {
    setSelectedExamType(examType as any);
    setSidebarMode('view');
    setIsSidebarOpen(true);
  };

  const handleEdit = () => {
    setSidebarMode('edit');
  };

  const handleFormSubmit = async (data: Partial<ExamType>) => {
    try {
      if (sidebarMode === 'edit' && selectedExamType?.id) {
        await updateMutation.mutateAsync({
          id: selectedExamType.id,
          data: data as any,
        });
        toast.success('Exam type updated successfully');
      } else {
        await createMutation.mutateAsync(data as any);
        toast.success('Exam type created successfully');
      }
      setIsSidebarOpen(false);
      setSelectedExamType(null);
      refetch();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save exam type');
    }
  };

  // Dedicated delete handler for the button inside the sidebar
  const handleSidebarDelete = async () => {
    if (!selectedExamType?.id) return;

    if (confirm('Are you sure you want to delete this exam type?')) {
      try {
        await deleteMutation.mutateAsync(selectedExamType.id);
        toast.success('Exam type deleted successfully');
        setIsSidebarOpen(false);
        setSelectedExamType(null);
        refetch();
      } catch (error: any) {
        toast.error(typeof error.message === 'string' ? error.message : 'Failed to delete');
      }
    }
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
    setSelectedExamType(null);
    setSidebarMode('view');
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <img src={dataLoadingGif} alt="Loading..." className="w-48 h-48 opacity-50" />
        <p className="text-muted-foreground animate-pulse">Loading Configurations...</p>
      </div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 space-y-6"
      >
        {/* Header Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {/* Header Title Section */}
          <div className="md:col-span-1 flex flex-col justify-center space-y-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                Exam Types
              </h1>
              <p className="text-muted-foreground mt-1">
                Configure examination categories and weightages
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button onClick={() => refetch()} variant="outline" size="sm" className="h-9">
                <RefreshCw className="h-4 w-4 mr-2" />
                Sync
              </Button>
              <Button onClick={handleAddNew} size="sm" className="h-9 shadow-sm">
                <Plus className="h-4 w-4 mr-2" />
                New Type
              </Button>
            </div>
          </div>

          <div className="md:col-span-2 grid grid-cols-2 gap-4">
            <Card className="border shadow-sm bg-card/50">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Types</p>
                  <h2 className="text-2xl font-bold">{totalTypes}</h2>
                </div>
                <div className="p-2 bg-primary/10 rounded-full text-primary">
                  <Tags className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
            <Card className="border shadow-sm bg-card/50">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active</p>
                  <h2 className="text-2xl font-bold">{activeTypes}</h2>
                </div>
                <div className="p-2 bg-green-500/10 rounded-full text-green-500">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <Card className="border-none shadow-md overflow-hidden">
          <DataTable
            columns={columns}
            data={data}
            isLoading={isLoading}
            error={error instanceof Error ? error.message : typeof error === 'string' ? error : null}
            onRefresh={refetch}
            onRowClick={handleRowClick}
            filters={filters}
            onFiltersChange={setFilters}
            filterConfig={filterConfig}
            searchPlaceholder="Search types..."
          />
        </Card>
      </motion.div>

      <ExamDrawer
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
        title={sidebarMode === 'create' ? 'Create Exam Type' : sidebarMode === 'edit' ? 'Edit Exam Type' : selectedExamType?.name || 'Details'}
        mode={sidebarMode}
        width="xl"
      >
        {sidebarMode === 'view' && selectedExamType && (
          <div className="flex flex-col h-full bg-muted/10">
            {/* Profile Header */}
            <div className="relative">
              <div className={`h-32 w-full bg-gradient-to-r ${getGradient(selectedExamType.name)}`} />

              <div className="absolute top-4 right-4 flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-md"
                  onClick={handleEdit}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-white/20 hover:bg-red-500/80 text-white border-0 backdrop-blur-md"
                  onClick={handleSidebarDelete}
                >
                  Delete
                </Button>
              </div>

              <div className="px-6 pb-4 -mt-12 flex flex-col relative z-10">
                <div className="h-24 w-24 rounded-full border-4 border-background shadow-xl bg-background flex items-center justify-center text-primary">
                  <BookType className="h-10 w-10" />
                </div>

                <div className="mt-4 space-y-1">
                  <h2 className="text-2xl font-bold tracking-tight text-foreground">{selectedExamType.name}</h2>
                  <div className="flex items-center gap-2 text-muted-foreground font-mono text-sm">
                    <Hash className="h-3.5 w-3.5" />
                    <span>{selectedExamType.code}</span>
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <Badge variant={selectedExamType.is_active ? 'success' : 'secondary'} className="rounded-full">
                      {selectedExamType.is_active ? 'Active' : 'Archived'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Scroll */}
            <div className="flex-1 overflow-y-auto hidden-scrollbar p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-background p-4 rounded-xl border shadow-sm space-y-1">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Weightage</span>
                  <div className="flex items-center gap-2">
                    <Percent className="h-5 w-5 text-blue-500" />
                    <span className="font-semibold text-lg">
                      {selectedExamType.weightage}%
                    </span>
                  </div>
                </div>
                <div className="bg-background p-4 rounded-xl border shadow-sm space-y-1">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Display Order</span>
                  <div className="flex items-center gap-2">
                    <Hash className="h-5 w-5 text-purple-500" />
                    <span className="font-semibold text-lg">
                      {selectedExamType.display_order}
                    </span>
                  </div>
                </div>
              </div>

              <Card className="border-none shadow-sm bg-background">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    Description
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-2">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {selectedExamType.description || 'No description provided for this exam type.'}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm bg-background">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    Timestamps
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-2 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Created At</p>
                    <p className="text-sm font-medium">
                      {new Date(selectedExamType.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Last Updated</p>
                    <p className="text-sm font-medium">
                      {new Date(selectedExamType.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {sidebarMode !== 'view' && (
          <ExamTypeForm
            examType={sidebarMode === 'edit' ? selectedExamType : null}
            onSubmit={handleFormSubmit}
            onCancel={handleCloseSidebar}
          />
        )}
      </ExamDrawer>
    </>
  );
};

export default ExamTypesPage;
