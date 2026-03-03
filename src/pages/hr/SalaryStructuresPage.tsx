/**
 * Salary Structures Page
 * "Minimalist Finance" Layout
 * A clean, high-contrast, professional design focusing on readability and data hierarchy.
 */

import {
  Banknote,
  ChevronDown,
  ChevronUp,
  Edit,
  Filter,
  Plus,
  Search,
  Trash,
  Wallet // Added Wallet import
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { DetailSidebar } from '../../components/common/DetailSidebar';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { DEFAULT_PAGE_SIZE } from '../../config/app.config';
import { useSalaryStructuresSWR } from '../../hooks/swr';
import { useDebouncedCallback } from '../../hooks/useDebounce';
import { useCreateSalaryStructure, useDeleteSalaryStructure, useUpdateSalaryStructure } from '../../hooks/useHR';
import { cn } from '../../lib/utils';
import { SalaryStructure } from '../../types/hr.types';
import { SalaryStructureForm } from './forms/SalaryStructureForm';

const SalaryStructuresPage = () => {
  const [filters, setFilters] = useState<Record<string, any>>({ page: 1, page_size: DEFAULT_PAGE_SIZE });
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarMode, setSidebarMode] = useState<'create' | 'edit'>('create');
  const [selectedItem, setSelectedItem] = useState<SalaryStructure | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading, error, refresh } = useSalaryStructuresSWR(filters);
  const create = useCreateSalaryStructure();
  const update = useUpdateSalaryStructure();
  const del = useDeleteSalaryStructure();

  const metrics = useMemo(() => {
    const rows = data?.results || [];
    const total = rows.length;
    const active = rows.filter((r: any) => r.is_active).length;
    const current = rows.filter((r: any) => r.is_current).length;
    const avgGross = total === 0 ? 0 : Math.round(
      rows.reduce((sum: number, r: any) => sum + (Number(r.gross_salary) || 0), 0) / total
    );
    return { total, active, current, avgGross };
  }, [data]);

  const handleSearch = useDebouncedCallback((term: string) => {
    setFilters(prev => ({ ...prev, search: term }));
  }, 500);

  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    handleSearch(e.target.value);
  };

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleCreate = () => {
    setSelectedItem(null);
    setSidebarMode('create');
    setIsSidebarOpen(true);
  };

  const handleEdit = (item: SalaryStructure, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedItem(item);
    setSidebarMode('edit');
    setIsSidebarOpen(true);
  };

  const handleFormSubmit = async (formData: any) => {
    try {
      if (sidebarMode === 'create') {
        await create.mutateAsync(formData);
        toast.success('Structure created successfully');
      } else {
        if (!selectedItem) return;
        await update.mutateAsync({ id: selectedItem.id, data: formData });
        toast.success('Structure updated successfully');
      }
      setIsSidebarOpen(false);
      refresh();
    } catch (error: any) {
      toast.error(error?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (window.confirm('Delete this salary structure?')) {
      try {
        await del.mutateAsync(id);
        toast.success('Deleted successfully');
        if (expandedId === id) setExpandedId(null);
        refresh();
      } catch (error: any) {
        toast.error(error?.message || 'Delete failed');
      }
    }
  };

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(Number(amount));
  };

  return (
    <div className="max-w-[1200px] mx-auto p-6 flex flex-col gap-6 animate-in fade-in duration-500">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <Wallet className="h-8 w-8 text-primary" />
            Salary Notebook
          </h1>
          <p className="text-muted-foreground mt-1">Manage employee compensation and effective dates.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:block text-right">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Avg. Gross</span>
            <div className="text-xl font-bold font-mono">{formatCurrency(metrics.avgGross)}</div>
          </div>

          <Button onClick={handleCreate} size="lg" className="shadow-sm">
            <Plus className="mr-2 h-4 w-4" /> Create Structure
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 bg-card border rounded-lg p-1.5 shadow-sm">
        <div className="pl-3 text-muted-foreground">
          <Search className="h-4 w-4" />
        </div>
        <Input
          placeholder="Search by teacher name..."
          value={searchQuery}
          onChange={onSearchChange}
          className="border-none shadow-none focus-visible:ring-0 bg-transparent h-9"
        />
        <div className="flex items-center gap-2 pr-1">
          <Badge variant="secondary" className="font-normal text-muted-foreground bg-muted/50 rounded-md px-2">
            {metrics.total} Records
          </Badge>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Filter className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 rounded-lg border bg-muted/20 animate-pulse" />
          ))
        ) : !data?.results?.length ? (
          <div className="text-center py-20 border rounded-xl border-dashed">
            <p className="text-muted-foreground">No salary structures found.</p>
          </div>
        ) : (
          data.results.map((item: SalaryStructure) => (
            <div
              key={item.id}
              className={cn(
                "group bg-card border rounded-xl transition-all duration-200 overflow-hidden",
                expandedId === item.id
                  ? "shadow-lg ring-1 ring-primary/20 border-primary/50"
                  : "hover:border-primary/30 hover:shadow-md"
              )}
            >
              {/* Row Header */}
              <div
                onClick={() => toggleExpand(item.id)}
                className="p-5 flex flex-col md:flex-row md:items-center gap-4 cursor-pointer select-none"
              >
                {/* Left: Info */}
                <div className="flex-1 flex items-center gap-4">
                  <div className={cn(
                    "h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0",
                    item.is_active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                  )}>
                    {item.teacher_name?.charAt(0) || 'U'}
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground text-lg leading-none group-hover:text-primary transition-colors">
                        {item.teacher_name || 'Unassigned'}
                      </h3>
                      {item.is_current && (
                        <Badge variant="default" className="text-[10px] h-4 px-1.5 bg-blue-600 hover:bg-blue-700">CURRENT</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Effective: {new Date(item.effective_from).toLocaleDateString()}</span>
                      {!item.is_active && <Badge variant="secondary" className="text-[10px] h-4 px-1.5">Archived</Badge>}
                    </div>
                  </div>
                </div>

                {/* Right: Salary & Actions */}
                <div className="flex items-center justify-between md:justify-end gap-6 md:gap-10 w-full md:w-auto pl-14 md:pl-0">
                  <div className="text-right">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Gross Salary</div>
                    <div className="text-xl font-bold font-mono tracking-tight text-foreground">
                      {formatCurrency(item.gross_salary)}
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={(e) => { e.stopPropagation(); toggleExpand(item.id); }}>
                      {expandedId === item.id ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedId === item.id && (
                <div className="border-t bg-muted/5 p-6 animate-in slide-in-from-top-1 duration-200">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Components Grid */}
                    <div className="lg:col-span-8 space-y-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-semibold flex items-center gap-2">
                          <Banknote className="h-4 w-4 text-primary" />
                          Salary Breakdown
                        </h4>
                      </div>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="p-4 rounded-lg bg-background border shadow-sm">
                          <div className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">Basic</div>
                          <div className="text-lg font-bold font-mono">{formatCurrency(item.basic_salary)}</div>
                        </div>
                        <div className="p-4 rounded-lg bg-background border shadow-sm">
                          <div className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">HRA</div>
                          <div className="text-lg font-bold font-mono">{formatCurrency(item.hra)}</div>
                        </div>
                        <div className="p-4 rounded-lg bg-background border shadow-sm">
                          <div className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">DA</div>
                          <div className="text-lg font-bold font-mono">{formatCurrency(item.da)}</div>
                        </div>
                        <div className="p-4 rounded-lg bg-background border shadow-sm">
                          <div className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">Allowances</div>
                          <div className="text-lg font-bold font-mono">{formatCurrency(item.other_allowances)}</div>
                        </div>
                      </div>
                    </div>

                    {/* Actions & Meta */}
                    <div className="lg:col-span-4 flex flex-col justify-between border-l pl-8 gap-6 border-border/50">
                      <div className="space-y-4">
                        <div>
                          <div className="text-xs font-medium text-muted-foreground mb-1">Last Updated</div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              {item.updated_by && typeof item.updated_by === 'object'
                                ? ((item.updated_by as any).full_name || (item.updated_by as any).username)
                                : (item.updated_by || 'System')
                              }
                            </span>
                            <span className="text-xs text-muted-foreground">•&nbsp;{new Date(item.updated_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div>
                          <div className="text-xs font-medium text-muted-foreground mb-1">Created</div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              {item.created_by && typeof item.created_by === 'object'
                                ? ((item.created_by as any).full_name || (item.created_by as any).username)
                                : (item.created_by || 'System')
                              }
                            </span>
                            <span className="text-xs text-muted-foreground">•&nbsp;{new Date(item.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Button variant="outline" size="sm" className="flex-1" onClick={(e) => handleEdit(item, e)}>
                          <Edit className="mr-2 h-3.5 w-3.5" /> Edit
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1 text-destructive hover:bg-destructive/5 hover:text-destructive" onClick={(e) => handleDelete(item.id, e)}>
                          <Trash className="mr-2 h-3.5 w-3.5" /> Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <DetailSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        title={sidebarMode === 'create' ? 'Create Structure' : 'Edit Structure'}
        subtitle="Configure salary components and limits"
        mode={sidebarMode}
        width="lg"
      >
        <div className="py-4">
          <SalaryStructureForm
            item={sidebarMode === 'edit' ? selectedItem : null}
            onSubmit={handleFormSubmit}
            onCancel={() => setIsSidebarOpen(false)}
          />
        </div>
      </DetailSidebar>
    </div>
  );
};

export default SalaryStructuresPage;
