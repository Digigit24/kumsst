/**
 * Leave Types Page
 * Master-Detail Layout for Configuration
 */

import { useState, useEffect } from 'react';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Separator } from '../../components/ui/separator';
import { ScrollArea } from '../../components/ui/scroll-area';
import { useCreateLeaveType, useUpdateLeaveType, useDeleteLeaveType } from '../../hooks/useHR';
import { useLeaveTypesSWR } from '../../hooks/swr';
import { LeaveTypeForm } from './forms/LeaveTypeForm';
import { toast } from 'sonner';
import {
  Briefcase,
  Calendar,
  Check,
  ChevronRight,
  Clock,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Settings,
  Trash2,
  X
} from 'lucide-react';
import { DEFAULT_PAGE_SIZE } from '../../config/app.config';
import { useDebouncedCallback } from '../../hooks/useDebounce';

const LeaveTypesPage = () => {
  const [filters, setFilters] = useState<Record<string, any>>({ page: 1, page_size: DEFAULT_PAGE_SIZE });
  const [mode, setMode] = useState<'view' | 'create' | 'edit'>('view');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading, error, refresh } = useLeaveTypesSWR(filters);
  const create = useCreateLeaveType();
  const update = useUpdateLeaveType();
  const del = useDeleteLeaveType();

  // Select first item on load if available and nothing selected
  useEffect(() => {
    if (data?.results?.length && !selectedId && mode === 'view') {
      setSelectedId(data.results[0].id);
    }
  }, [data, selectedId]);

  const selectedItem = data?.results?.find((item: any) => item.id === selectedId);

  const handleSearch = useDebouncedCallback((term: string) => {
    setFilters(prev => ({ ...prev, search: term }));
  }, 500);

  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    handleSearch(e.target.value);
  };

  const handleCreate = () => {
    setSelectedId(null);
    setMode('create');
  };

  const handleSelect = (id: number) => {
    setSelectedId(id);
    setMode('view');
  };

  const handleFormSubmit = async (formData: any) => {
    try {
      if (mode === 'create') {
        await create.mutateAsync(formData);
        toast.success('Leave type created');
      } else {
        if (!selectedId) return;
        await update.mutateAsync({ id: selectedId, data: formData });
        toast.success('Leave type updated');
      }
      setMode('view');
      refresh();
    } catch (error: any) {
      toast.error(error?.message || 'Operation failed');
    }
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    if (window.confirm('Delete this leave type permanently?')) {
      try {
        await del.mutateAsync(selectedId);
        toast.success('Deleted successfully');
        // Reset selection
        setSelectedId(null);
        refresh();
      } catch (error: any) {
        toast.error(error?.message || 'Delete failed');
      }
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-6 h-[calc(100vh-80px)] flex flex-col gap-6 animate-in fade-in duration-500">

      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="h-6 w-6 text-primary" />
            Leave Configuration
          </h1>
          <p className="text-muted-foreground text-sm">Manage absence types and policies</p>
        </div>
      </div>

      {/* Main Layout - Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">

        {/* Left Panel: List */}
        <Card className="lg:col-span-4 flex flex-col h-full overflow-hidden border-border/50 shadow-sm">
          <div className="p-4 border-b border-border/50 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm">All Leave Types</span>
              <Button size="sm" onClick={handleCreate} className="h-8">
                <Plus className="mr-2 h-3.5 w-3.5" /> Add New
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search types..."
                value={searchQuery}
                onChange={onSearchChange}
                className="pl-8 h-9 bg-muted/30"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 w-full rounded-lg bg-muted/20 animate-pulse" />
              ))
            ) : !data?.results?.length ? (
              <div className="text-center py-10 px-4 text-muted-foreground text-sm">
                No leave types found.
              </div>
            ) : (
              data.results.map((item: any) => (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer border transition-all ${selectedId === item.id
                      ? 'bg-primary/5 border-primary/20 shadow-sm'
                      : 'bg-transparent border-transparent hover:bg-muted/50 hover:border-border/30'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-md flex items-center justify-center text-xs font-bold ${selectedId === item.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                      }`}>
                      {item.code.substring(0, 2)}
                    </div>
                    <div>
                      <h4 className={`font-medium text-sm ${selectedId === item.id ? 'text-primary' : 'text-foreground'}`}>
                        {item.name}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{item.code}</span>
                        <span>•</span>
                        <span className={item.is_active ? 'text-green-600' : 'text-muted-foreground'}>
                          {item.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>
                  {selectedId === item.id && (
                    <ChevronRight className="h-4 w-4 text-primary opacity-50" />
                  )}
                </div>
              ))
            )}
          </div>

          <div className="p-3 border-t border-border/50 bg-muted/10 text-xs text-center text-muted-foreground">
            {data?.results?.length || 0} types configured
          </div>
        </Card>

        {/* Right Panel: Detail View */}
        <Card className="lg:col-span-8 flex flex-col h-full overflow-hidden border-border/50 shadow-sm">
          {mode === 'create' || (mode === 'edit' && selectedItem) ? (
            <div className="flex flex-col h-full">
              <div className="p-6 border-b border-border/50 flex items-center justify-between bg-muted/10">
                <div>
                  <h2 className="text-xl font-bold">{mode === 'create' ? 'Create New Leave Type' : 'Edit Leave Type'}</h2>
                  <p className="text-sm text-muted-foreground">Fill in the details below</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setMode('view')}>Cancel</Button>
              </div>
              <div className="p-6 overflow-y-auto max-w-2xl">
                <LeaveTypeForm
                  item={mode === 'edit' ? selectedItem : null}
                  onSubmit={handleFormSubmit}
                  onCancel={() => setMode('view')}
                />
              </div>
            </div>
          ) : selectedItem ? (
            <div className="flex flex-col h-full animate-in fade-in zoom-in-95 duration-200">
              {/* Detail Header */}
              <div className="p-8 pb-6 border-b border-border/50 bg-gradient-to-br from-card to-muted/20">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-5">
                    <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center shadow-inner">
                      <Briefcase className="h-10 w-10 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-3xl font-bold tracking-tight">{selectedItem.name}</h2>
                        <Badge variant={selectedItem.is_active ? "default" : "secondary"} className="h-6">
                          {selectedItem.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-background border border-border/50 font-mono">
                          {selectedItem.code}
                        </span>
                        {selectedItem.college && (
                          <span className="flex items-center gap-1">
                            College ID: {selectedItem.college}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setMode('edit')}>
                      <Pencil className="mr-2 h-4 w-4" /> Edit
                    </Button>
                    <Button variant="outline" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={handleDelete}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Detail Content */}
              <div className="p-8 space-y-8 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="bg-muted/5 border-border/60">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Allowance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold text-foreground">{selectedItem.max_days_per_year}</span>
                        <span className="text-muted-foreground font-medium">days per year</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">Maximum number of days an employee can take.</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-muted/5 border-border/60">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Type</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-3">
                        {selectedItem.is_paid ? (
                          <>
                            <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
                              <Check className="h-6 w-6" />
                            </div>
                            <span className="text-2xl font-semibold text-emerald-700 dark:text-emerald-500">Paid Leave</span>
                          </>
                        ) : (
                          <>
                            <div className="h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600">
                              <Calendar className="h-6 w-6" />
                            </div>
                            <span className="text-2xl font-semibold text-orange-700 dark:text-orange-500">Unpaid Leave</span>
                          </>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">Determines if salary is deducted for this leave.</p>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
                    Description & Policy
                  </h3>
                  <div className="p-6 rounded-xl border border-border/50 bg-background text-muted-foreground leading-relaxed">
                    {selectedItem.description || "No specific description or policy notes added for this leave type."}
                  </div>
                </div>

                {/* System Information / Audit Logs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-border/50">
                   <div>
                      <h4 className="text-sm font-medium mb-4 text-muted-foreground uppercase tracking-widest">Created</h4>
                      <div className="space-y-1">
                         <div className="flex items-center gap-2">
                            <span className="text-foreground font-medium">
                               {typeof selectedItem.created_by === 'object' ? (selectedItem.created_by as any).full_name || (selectedItem.created_by as any).username : selectedItem.created_by || 'Unknown System User'}
                            </span>
                         </div>
                         <div className="text-sm text-muted-foreground flex items-center gap-2">
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(selectedItem.created_at).toLocaleString()}
                         </div>
                      </div>
                   </div>
                   
                   <div>
                      <h4 className="text-sm font-medium mb-4 text-muted-foreground uppercase tracking-widest">Last Updated</h4>
                      <div className="space-y-1">
                         <div className="flex items-center gap-2">
                            <span className="text-foreground font-medium">
                               {typeof selectedItem.updated_by === 'object' ? (selectedItem.updated_by as any).full_name || (selectedItem.updated_by as any).username : selectedItem.updated_by || 'Unknown System User'}
                            </span>
                         </div>
                         <div className="text-sm text-muted-foreground flex items-center gap-2">
                            <Clock className="h-3.5 w-3.5" />
                            {new Date(selectedItem.updated_at).toLocaleString()}
                         </div>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-10">
              <div className="h-24 w-24 rounded-full bg-muted/20 flex items-center justify-center mb-6">
                <Briefcase className="h-10 w-10 opacity-20" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">No Leave Type Selected</h3>
              <p className="text-center max-w-sm mt-2">Select a leave type from the list on the left to view its details or configure settings.</p>
              <Button variant="outline" className="mt-6" onClick={handleCreate}>
                <Plus className="mr-2 h-4 w-4" /> Create New Type
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default LeaveTypesPage;
