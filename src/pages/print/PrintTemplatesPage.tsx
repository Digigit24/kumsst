/**
 * Print Templates Page
 * Premium card-based layout for managing reusable document templates
 */

import {
  AlertCircle,
  Archive,
  CheckCircle2,
  Copy,
  Edit3,
  Eye,
  FileText,
  Grid3X3,
  LayoutList,
  Loader2,
  PenTool,
  Plus,
  Printer,
  RefreshCw,
  Search,
  Trash2
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useDebounce, DEBOUNCE_DELAYS } from '@/hooks/useDebounce';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { Column, DataTable, FilterConfig } from '../../components/common/DataTable';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';

import { DROPDOWN_PAGE_SIZE } from '../../config/app.config';
import { useAuth } from '../../hooks/useAuth';
import {
  useDeletePrintTemplate,
  useDuplicateTemplate,
  usePreviewTemplate,
  usePrintTemplates,
  useTemplateCategories,
} from '../../hooks/usePrint';
import type {
  PrintTemplate,
  TemplateStatus,
} from '../../types/print.types';

const STATUS_CONFIG: Record<TemplateStatus, { label: string; color: string; icon: any; bg: string; border: string }> = {
  draft: { label: 'Draft', color: 'secondary', icon: PenTool, bg: 'bg-slate-50 dark:bg-slate-900/50', border: 'border-slate-200 dark:border-slate-800' },
  active: { label: 'Active', color: 'success', icon: CheckCircle2, bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-800' },
  archived: { label: 'Archived', color: 'destructive', icon: Archive, bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-800' },
};

const CATEGORY_ICONS: Record<string, string> = {
  'mdi-email': '📧', 'mdi-bell': '🔔', 'mdi-certificate': '📜',
  'mdi-card-account-details': '🪪', 'mdi-file-document': '📄',
  'mdi-form-select': '📝', 'mdi-file-multiple': '📑', 'mdi-folder': '📁',
};

export const PrintTemplatesPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [filters, setFilters] = useState<Record<string, any>>({ page: 1, page_size: 50 });
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, DEBOUNCE_DELAYS.SEARCH);
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [activeStatus, setActiveStatus] = useState<string>('');
  const [previewingId, setPreviewingId] = useState<number | null>(null);

  // Permission check
  const canManage =
    user?.userType === 'super_admin' ||
    user?.user_type === 'super_admin' ||
    user?.userType === 'principal' ||
    user?.user_type === 'principal' ||
    user?.userType === 'college_admin' ||
    user?.user_type === 'college_admin';

  // Fetch templates and categories
  const { data, isLoading, error, refetch } = usePrintTemplates(filters);
  const { data: categoriesData } = useTemplateCategories({ is_active: true, page_size: DROPDOWN_PAGE_SIZE });

  // Mutations
  const deleteTemplate = useDeletePrintTemplate();
  const duplicateTemplate = useDuplicateTemplate();
  const previewTemplate = usePreviewTemplate();

  // Extract data
  const templates: PrintTemplate[] = useMemo(() => {
    if (Array.isArray(data)) return data;
    if (data?.results) return data.results;
    return [];
  }, [data]);

  const categories = useMemo(() => {
    if (Array.isArray(categoriesData)) return categoriesData;
    if (categoriesData?.results) return categoriesData.results;
    return [];
  }, [categoriesData]);

  // Stats
  const stats = useMemo(() => {
    const all = templates;
    return {
      total: all.length,
      active: all.filter(t => t.status === 'active').length,
      draft: all.filter(t => t.status === 'draft').length,
      archived: all.filter(t => t.status === 'archived').length,
      totalUsage: all.reduce((sum, t) => sum + (t.usage_count || 0), 0),
    };
  }, [templates]);

  // Filtered templates (for grid view)
  const filteredTemplates = useMemo(() => {
    let result = templates;
    if (debouncedSearchQuery.trim()) {
      const q = debouncedSearchQuery.toLowerCase();
      result = result.filter(t =>
        t.name.toLowerCase().includes(q) ||
        t.code.toLowerCase().includes(q) ||
        t.category_name?.toLowerCase().includes(q)
      );
    }
    if (activeCategory) {
      result = result.filter(t => String(t.category) === activeCategory);
    }
    if (activeStatus) {
      result = result.filter(t => t.status === activeStatus);
    }
    return result;
  }, [templates, debouncedSearchQuery, activeCategory, activeStatus]);

  // Table columns (for table view)
  const columns: Column<PrintTemplate>[] = [
    {
      key: 'name',
      label: 'Template Name',
      sortable: true,
      render: (template) => (
        <div>
          <p className="font-medium cursor-pointer hover:text-primary hover:underline" onClick={() => canManage ? handleEdit(template) : handlePreview(template)}>
            {template.name}
          </p>
          <p className="text-xs text-muted-foreground">{template.code}</p>
        </div>
      ),
    },
    { key: 'category_name', label: 'Category' },
    {
      key: 'status',
      label: 'Status',
      render: (template) => (
        <Badge variant={STATUS_CONFIG[template.status].color as any}>{STATUS_CONFIG[template.status].label}</Badge>
      ),
    },
    {
      key: 'paper_size',
      label: 'Paper',
      render: (template) => (
        <span className="text-sm">{template.paper_size} ({template.orientation})</span>
      ),
    },
    {
      key: 'usage_count',
      label: 'Usage',
      render: (template) => <span className="text-sm">{template.usage_count} times</span>,
    },
    {
      key: 'version',
      label: 'Version',
      render: (template) => <Badge variant="outline">v{template.version}</Badge>,
    },
  ];

  const filterConfig: FilterConfig[] = [
    {
      name: 'category',
      label: 'Category',
      type: 'select',
      options: [
        { value: '', label: 'All Categories' },
        ...categories.map((cat) => ({ value: String(cat.id), label: cat.name })),
      ],
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: '', label: 'All' },
        { value: 'draft', label: 'Draft' },
        { value: 'active', label: 'Active' },
        { value: 'archived', label: 'Archived' },
      ],
    },
  ];

  // Action Handlers
  const handleAddNew = () => {
    navigate('/print/templates/new');
  };

  const handleEdit = (template: PrintTemplate) => {
    navigate(`/print/templates/${template.id}/edit`);
  };

  const handleDelete = async (template: PrintTemplate) => {
    if (!confirm(`Are you sure you want to delete "${template.name}"?`)) return;

    try {
      await deleteTemplate.mutateAsync(template.id);
      toast.success('Template deleted successfully');
    } catch (error: any) {
      toast.error(typeof error.message === 'string' ? error.message : 'Failed to delete template');
    }
  };

  const handleDuplicate = async (template: PrintTemplate) => {
    const newName = prompt('Enter name for duplicated template:', `${template.name} (Copy)`);
    if (!newName) return;

    try {
      await duplicateTemplate.mutateAsync({
        id: template.id,
        data: {
          new_name: newName,
          new_code: `${template.code}-copy-${Date.now()}`,
        },
      });
      toast.success('Template duplicated successfully');
    } catch (error: any) {
      toast.error(typeof error.message === 'string' ? error.message : 'Failed to duplicate template');
    }
  };

  const handlePreview = async (template: PrintTemplate) => {
    const sampleData: Record<string, any> = {};
    template.available_variables?.forEach((v) => {
      sampleData[v.key] = v.sample_value || `[${v.label}]`;
    });

    const previewWindow = window.open('', '_blank');
    if (!previewWindow) {
      toast.error('Please allow popups to view the preview');
      return;
    }

    previewWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Generating Preview...</title>
          <style>
            body { font-family: system-ui, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f3f4f6; color: #1f2937; }
            .loader { border: 4px solid #e5e7eb; border-top: 4px solid #3b82f6; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin-bottom: 20px; }
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          </style>
        </head>
        <body>
          <div class="loader"></div>
          <h2>Generating Preview...</h2>
          <p>Please wait while we prepare your document.</p>
        </body>
      </html>
    `);

    setPreviewingId(template.id);
    try {
      const result = await previewTemplate.mutateAsync({
        id: template.id,
        data: { context_data: sampleData, use_sample_data: true },
      });

      previewWindow.document.open();
      previewWindow.document.write(result.preview_html);
      previewWindow.document.close();
      previewWindow.focus();
    } catch (error: any) {
      previewWindow.document.body.innerHTML = `
        <div style="font-family: system-ui, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; color: #ef4444;">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <h2 style="margin-top: 20px;">Failed to generate preview</h2>
          <p>${error.message || 'An unexpected error occurred'}</p>
        </div>
      `;
      toast.error(typeof error.message === 'string' ? error.message : 'Failed to generate preview');
    } finally {
      setPreviewingId(null);
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-red-500">
        <AlertCircle className="h-12 w-12 mb-4" />
        <p>Failed to load templates</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-200 via-purple-200 to-indigo-200 p-6 md:p-8 text-gray-900 border border-purple-300/50">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM5MzMzZWEiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djJoLTJ2LTJoMnptMC00djJoLTJ2LTJoMnptLTQgOHYyaC0ydi0yaDJ6bTAgLTR2MmgtMnYtMmgyem0wLTR2MmgtMnYtMmgyek0yMCAzNHYyaC0ydi0yaDJ6bTAtNHYyaC0ydi0yaDJ6bS00IDh2MmgtMnYtMmgyem0wLTR2MmgtMnYtMmgyem0wLTR2MmgtMnYtMmgyek0xMiAzNHYyaC0ydi0yaDJ6bTAtNHYyaC0ydi0yaDJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-white/40 backdrop-blur-sm rounded-xl">
                <FileText className="h-6 w-6 text-purple-700" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">Print Templates</h1>
                <p className="text-purple-800/70 text-sm mt-0.5">Design and manage reusable document templates</p>
              </div>
            </div>
          </div>
          {canManage && (
            <Button
              onClick={handleAddNew}
              className="bg-gray-900 text-white hover:bg-black shadow-lg shadow-purple-900/10 font-semibold gap-2 self-start md:self-auto"
              size="lg"
            >
              <Plus className="h-5 w-5" />
              Create Template
            </Button>
          )}
        </div>

        {/* Stats Row */}
        <div className="relative z-10 grid grid-cols-2 md:grid-cols-5 gap-3 mt-6">
          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-3 border border-purple-300/30 shadow-sm">
            <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
            <p className="text-purple-900/60 text-xs mt-0.5">Total Templates</p>
          </div>
          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-3 border border-purple-300/30 shadow-sm">
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-2xl font-bold text-gray-800">{stats.active}</p>
            </div>
            <p className="text-purple-900/60 text-xs mt-0.5">Active</p>
          </div>
          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-3 border border-purple-300/30 shadow-sm">
            <p className="text-2xl font-bold text-gray-800">{stats.draft}</p>
            <p className="text-purple-900/60 text-xs mt-0.5">Drafts</p>
          </div>
          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-3 border border-purple-300/30 shadow-sm">
            <p className="text-2xl font-bold text-gray-800">{stats.archived}</p>
            <p className="text-purple-900/60 text-xs mt-0.5">Archived</p>
          </div>
          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-3 border border-purple-300/30 shadow-sm col-span-2 md:col-span-1">
            <p className="text-2xl font-bold text-gray-800">{stats.totalUsage.toLocaleString()}</p>
            <p className="text-purple-900/60 text-xs mt-0.5">Total Uses</p>
          </div>
        </div>
      </div>

      {/* Toolbar: Search, Category Filters, View Toggle */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 transition-all"
            />
          </div>

          {/* Status Filter Pills */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveStatus('')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-full border transition-all ${!activeStatus ? 'bg-purple-600 text-white border-purple-600 shadow-sm' : 'bg-background border-border text-muted-foreground hover:border-purple-300 hover:text-purple-600'}`}
            >
              All
            </button>
            {Object.entries(STATUS_CONFIG).map(([key, config]) => {
              const Icon = config.icon;
              return (
                <button
                  key={key}
                  onClick={() => setActiveStatus(activeStatus === key ? '' : key)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-full border transition-all ${activeStatus === key ? 'bg-purple-600 text-white border-purple-600 shadow-sm' : 'bg-background border-border text-muted-foreground hover:border-purple-300 hover:text-purple-600'}`}
                >
                  <Icon className="h-3 w-3" />
                  {config.label}
                </button>
              );
            })}
          </div>

          {/* View Toggle + Refresh */}
          <div className="flex items-center gap-1 ml-auto">
            <Button variant="ghost" size="sm" onClick={() => refetch()} title="Refresh">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <div className="flex border rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-purple-600 text-white' : 'bg-background text-muted-foreground hover:bg-muted'}`}
                title="Grid View"
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 transition-colors ${viewMode === 'table' ? 'bg-purple-600 text-white' : 'bg-background text-muted-foreground hover:bg-muted'}`}
                title="Table View"
              >
                <LayoutList className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Category Pills */}
        {categories.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
            <button
              onClick={() => setActiveCategory('')}
              className={`shrink-0 px-4 py-2 text-xs font-medium rounded-xl border transition-all ${!activeCategory ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white border-transparent shadow-md shadow-purple-500/20' : 'bg-background border-border text-muted-foreground hover:border-purple-300'}`}
            >
              All Categories
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(activeCategory === String(cat.id) ? '' : String(cat.id))}
                className={`shrink-0 flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-xl border transition-all ${activeCategory === String(cat.id) ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white border-transparent shadow-md shadow-purple-500/20' : 'bg-background border-border text-muted-foreground hover:border-purple-300'}`}
              >
                <span>{CATEGORY_ICONS[cat.icon] || '📄'}</span>
                {cat.name}
                <span className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-full ${activeCategory === String(cat.id) ? 'bg-white/20' : 'bg-muted'}`}>
                  {cat.template_count}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content Area */}
      {viewMode === 'grid' ? (
        /* ========== GRID VIEW ========== */
        isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="overflow-hidden animate-pulse">
                <div className="h-36 bg-gradient-to-br from-muted to-muted/50" />
                <CardContent className="p-4 space-y-3">
                  <div className="h-4 w-3/4 bg-muted rounded" />
                  <div className="h-3 w-1/2 bg-muted rounded" />
                  <div className="flex gap-2">
                    <div className="h-5 w-14 bg-muted rounded-full" />
                    <div className="h-5 w-14 bg-muted rounded-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <div className="p-4 rounded-full bg-muted/50 mb-4">
              <FileText className="h-10 w-10" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">No templates found</h3>
            <p className="text-sm">
              {searchQuery || activeCategory || activeStatus ? 'Try adjusting your filters' : 'Create your first template to get started'}
            </p>
            {canManage && !searchQuery && !activeCategory && !activeStatus && (
              <Button onClick={handleAddNew} className="mt-4 gap-2" variant="outline">
                <Plus className="h-4 w-4" />
                Create Template
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-1">
            {filteredTemplates.map(template => {
              const statusConf = STATUS_CONFIG[template.status];
              const StatusIcon = statusConf.icon;
              return (
                <Card
                  key={template.id}
                  className={`group relative overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-1.5 border-t-4 ${statusConf.border} bg-white dark:bg-slate-950`}
                  onClick={() => canManage ? handleEdit(template) : handlePreview(template)}
                >
                  {/* Card Main - Document Preview Area */}
                  <div className={`relative h-48 ${statusConf.bg} p-6 flex items-center justify-center overflow-hidden transition-colors`}>

                    {/* The "Paper" Mockup */}
                    <div className="relative w-32 h-44 bg-white dark:bg-white shadow-[0_2px_15px_-3px_rgba(0,0,0,0.1)] transition-transform duration-500 group-hover:scale-105 flex flex-col items-center pt-4 px-3 border border-gray-100">

                      {/* Paper Header */}
                      <div className="w-full flex items-center gap-2 mb-3">
                        <div className="h-3 w-3 rounded-full bg-indigo-100 border border-indigo-200" />
                        <div className="h-1.5 flex-1 bg-gray-100 rounded-full" />
                      </div>

                      {/* Document Title (Simulated) */}
                      <div className="w-full mb-2">
                        <div className="h-2 w-3/4 bg-gray-800/10 dark:bg-gray-800/20 rounded-sm mx-auto mb-1" />
                        <div className="h-1 w-1/2 bg-gray-800/10 dark:bg-gray-800/20 rounded-sm mx-auto" />
                      </div>

                      {/* Paper Content - Grid / Text approximation */}
                      <div className="w-full flex-1 space-y-1.5 opacity-60">
                        <div className="flex gap-1">
                          <div className="h-1 w-1/3 bg-gray-100 rounded-sm" />
                          <div className="h-1 flex-1 bg-gray-100 rounded-sm" />
                        </div>
                        <div className="flex gap-1">
                          <div className="h-1 w-1/4 bg-gray-100 rounded-sm" />
                          <div className="h-1 flex-1 bg-gray-100 rounded-sm" />
                        </div>
                        <div className="h-px bg-transparent my-1" />
                        <div className="h-1 w-full bg-gray-100 rounded-sm" />
                        <div className="h-1 w-5/6 bg-gray-100 rounded-sm" />
                        <div className="h-1 w-full bg-gray-100 rounded-sm" />
                      </div>

                      {/* Paper Footer / Signature */}
                      <div className="w-full mt-auto mb-3 flex justify-end">
                        <div className="h-4 w-12 border-b border-gray-200" />
                      </div>

                      {/* Hover Overlay Actions */}
                      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[1px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 gap-3">
                        <Button
                          size="icon"
                          variant="secondary"
                          className="h-9 w-9 rounded-full shadow-lg hover:bg-white hover:text-purple-600 hover:scale-110 transition-all font-bold"
                          onClick={(e) => { e.stopPropagation(); handlePreview(template); }}
                          title="Preview"
                        >
                          {previewingId === template.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        {canManage && (
                          <>
                            <Button
                              size="icon"
                              variant="secondary"
                              className="h-9 w-9 rounded-full shadow-lg hover:bg-white hover:text-blue-600 hover:scale-110 transition-all"
                              onClick={(e) => { e.stopPropagation(); handleEdit(template); }}
                              title="Edit"
                            >
                              <Edit3 className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="secondary"
                              className="h-9 w-9 rounded-full shadow-lg hover:bg-white hover:text-orange-600 hover:scale-110 transition-all"
                              onClick={(e) => { e.stopPropagation(); handleDuplicate(template); }}
                              title="Duplicate"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Paper Size Badge (Floating) */}
                    <div className="absolute top-3 left-3">
                      <Badge variant="outline" className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border-0 text-xs font-mono shadow-sm">
                        {template.paper_size}
                      </Badge>
                    </div>
                  </div>

                  {/* Card Info Details */}
                  <div className="p-4 bg-white dark:bg-slate-950/50">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-gray-100 group-hover:text-purple-600 transition-colors line-clamp-1">{template.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider border px-1 rounded bg-muted/50">{template.code}</span>
                          <span className="text-xs text-muted-foreground truncate max-w-[100px]">{template.category_name}</span>
                        </div>
                      </div>
                      <Badge variant={statusConf.color as any} className="shadow-none border bg-opacity-10 text-[10px] px-2 py-0.5 h-auto self-start ml-2">
                        {statusConf.label}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground mt-4 pt-3 border-t border-dashed">
                      <div className="flex items-center gap-1.5" title="Total times used">
                        <Printer className="h-3 w-3" />
                        <span className="font-medium">{template.usage_count} Prints</span>
                      </div>
                      <div className="flex items-center gap-3">
                        {canManage && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(template); }}
                            className="text-muted-foreground hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                        <span className="font-mono text-[10px] bg-muted px-1.5 py-0.5 rounded">v{template.version}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

        )
      ) : (
        /* ========== TABLE VIEW ========== */
        <DataTable<PrintTemplate>
          title="Print Templates"
          description="Create and manage reusable document templates with full branding control."
          onRefresh={() => refetch()}
          onAdd={canManage ? handleAddNew : undefined}
          addButtonLabel="Create Template"
          data={data}
          columns={columns}
          isLoading={isLoading}
          onRowClick={(template: PrintTemplate) => canManage ? handleEdit(template) : handlePreview(template)}
          onEdit={canManage ? handleEdit : undefined}
          onDelete={canManage ? handleDelete : undefined}
          actions={(template: PrintTemplate) => (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePreview(template);
                }}
                title="Quick Preview"
                disabled={previewingId === template.id}
              >
                {previewingId === template.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
              {canManage && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDuplicate(template);
                  }}
                  title="Duplicate"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
          filterConfig={filterConfig}
          filters={filters}
          onFiltersChange={setFilters}
        />
      )}
    </div>
  );
};
