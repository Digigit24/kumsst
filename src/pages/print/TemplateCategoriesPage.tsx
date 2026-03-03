/**
 * Template Categories Page
 * Manage print template categories (Letters, Notices, Certificates, etc.)
 */

import {
  AlertCircle,
  Edit,
  Loader2,
  Trash2,
  Wand2,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { Column, DataTable, FilterConfig } from '../../components/common/DataTable';
import { DetailSidebar } from '../../components/common/DetailSidebar';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { useAuth } from '../../hooks/useAuth';
import {
  useCreateTemplateCategory,
  useDeleteTemplateCategory,
  useSeedDefaultCategories,
  useTemplateCategories,
  useUpdateTemplateCategory,
} from '../../hooks/usePrint';
import type { TemplateCategory, TemplateCategoryCreateInput } from '../../types/print.types';

const ICON_OPTIONS = [
  { value: 'mdi-email', label: 'Email/Letter' },
  { value: 'mdi-bell', label: 'Notice/Bell' },
  { value: 'mdi-certificate', label: 'Certificate' },
  { value: 'mdi-card-account-details', label: 'ID Card' },
  { value: 'mdi-file-document', label: 'Report/Document' },
  { value: 'mdi-form-select', label: 'Form' },
  { value: 'mdi-file-multiple', label: 'Multiple Files' },
  { value: 'mdi-folder', label: 'Folder' },
];

export const TemplateCategoriesPage = () => {
  const { user } = useAuth();
  const [filters, setFilters] = useState<Record<string, any>>({ page: 1, page_size: 20 });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarMode, setSidebarMode] = useState<'view' | 'create' | 'edit'>('view');
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | null>(null);
  const [formData, setFormData] = useState<TemplateCategoryCreateInput>({
    name: '',
    code: '',
    description: '',
    icon: 'mdi-folder',
    display_order: 0,
    is_active: true,
  });

  // Permissions
  const canManage =
    user?.userType === 'super_admin' ||
    user?.user_type === 'super_admin' ||
    user?.userType === 'principal' ||
    user?.user_type === 'principal' ||
    user?.userType === 'college_admin' ||
    user?.user_type === 'college_admin';

  // Fetch categories - relies on filters.search from DataTable
  const { data, isLoading, error, refetch } = useTemplateCategories(filters);

  // Mutations
  const createCategory = useCreateTemplateCategory();
  const updateCategory = useUpdateTemplateCategory();
  const deleteCategory = useDeleteTemplateCategory();
  const seedDefaults = useSeedDefaultCategories();

  // Extract categories array
  const categories: TemplateCategory[] = useMemo(() => {
    if (Array.isArray(data)) return data;
    if (data?.results) return data.results;
    return [];
  }, [data]);

  const totalCount = useMemo(() => {
    if (Array.isArray(data)) return data.length;
    if (data?.count) return data.count;
    return 0;
  }, [data]);

  // Table columns
  const columns: Column<TemplateCategory>[] = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      render: (cat) => (
        <div className="flex items-center gap-2">
          <span className="text-lg">{getIconComponent(cat.icon)}</span>
          <span className="font-medium">{cat.name}</span>
        </div>
      ),
    },
    { key: 'code', label: 'Code', sortable: true },
    { key: 'description', label: 'Description' },
    {
      key: 'template_count',
      label: 'Templates',
      render: (cat) => (
        <Badge variant="secondary">{cat.template_count} templates</Badge>
      ),
    },
    { key: 'display_order', label: 'Order', sortable: true },
    {
      key: 'is_active',
      label: 'Status',
      render: (cat) => (
        <Badge variant={cat.is_active ? 'success' : 'destructive'}>
          {cat.is_active ? 'Active' : 'Inactive'}
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

  const getIconComponent = (icon: string) => {
    // Return a simple icon representation
    const iconMap: Record<string, string> = {
      'mdi-email': '📧',
      'mdi-bell': '🔔',
      'mdi-bulletin-board': '📋',
      'mdi-certificate': '📜',
      'mdi-card-account-details': '🪪',
      'mdi-file-document': '📄',
      'mdi-form-select': '📝',
      'mdi-file-multiple': '📑',
      'mdi-folder': '📁',
      'mdi-file-chart': '📊',
    };
    return iconMap[icon] || '📁';
  };

  const handleAddNew = () => {
    setSelectedCategory(null);
    setFormData({
      name: '',
      code: '',
      description: '',
      icon: 'mdi-folder',
      display_order: categories.length + 1,
      is_active: true,
    });
    setSidebarMode('create');
    setIsSidebarOpen(true);
  };

  const handleRowClick = (category: TemplateCategory) => {
    setSelectedCategory(category);
    setSidebarMode('view');
    setIsSidebarOpen(true);
  };

  const handleEdit = (category?: TemplateCategory) => {
    const cat = category || selectedCategory;
    if (cat) {
      setSelectedCategory(cat);
      setFormData({
        name: cat.name,
        code: cat.code,
        description: cat.description || '',
        icon: cat.icon,
        display_order: cat.display_order,
        is_active: cat.is_active,
      });
      setSidebarMode('edit');
      setIsSidebarOpen(true);
    }
  };

  const handleDelete = async (category?: TemplateCategory) => {
    const cat = category || selectedCategory;
    if (!cat) return;

    if (!confirm(`Are you sure you want to delete "${cat.name}"?`)) return;

    try {
      await deleteCategory.mutateAsync(cat.id);
      toast.success('Category deleted successfully');
      setIsSidebarOpen(false);
    } catch (error: any) {
      toast.error(typeof error.message === 'string' ? error.message : 'Failed to delete category');
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.code) {
      toast.error('Please fill in name and code');
      return;
    }

    try {
      if (sidebarMode === 'create') {
        await createCategory.mutateAsync(formData);
        toast.success('Category created successfully');
      } else if (sidebarMode === 'edit' && selectedCategory) {
        await updateCategory.mutateAsync({ id: selectedCategory.id, data: formData });
        toast.success('Category updated successfully');
      }
      setIsSidebarOpen(false);
    } catch (error: any) {
      toast.error(typeof error.message === 'string' ? error.message : 'Failed to save category');
    }
  };

  const handleSeedDefaults = async () => {
    if (!confirm('This will create default template categories. Continue?')) return;

    try {
      const result = await seedDefaults.mutateAsync();
      toast.success(`Created ${result.created.length} default categories`);
    } catch (error: any) {
      toast.error(typeof error.message === 'string' ? error.message : 'Failed to seed default categories');
    }
  };

  const handleInputChange = (field: keyof TemplateCategoryCreateInput, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Auto-generate code from name
  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
      code: sidebarMode === 'create' ? name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') : prev.code,
    }));
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-red-500">
        <AlertCircle className="h-12 w-12 mb-4" />
        <p>Failed to load template categories</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Data Table */}
      <DataTable<TemplateCategory>
        title="Template Categories"
        description="Manage categories for organizing print templates"
        data={data}
        columns={columns}
        isLoading={isLoading}
        onRowClick={handleRowClick}
        onEdit={canManage ? handleEdit : undefined}
        onDelete={canManage ? handleDelete : undefined}
        filterConfig={filterConfig}
        filters={filters}
        onFiltersChange={setFilters}
        onRefresh={() => refetch()}
        onAdd={canManage ? handleAddNew : undefined}
        addButtonLabel="Add Category"
        customActions={
          canManage && categories.length === 0 ? (
            <Button
              variant="outline"
              onClick={handleSeedDefaults}
              disabled={seedDefaults.isPending}
            >
              {seedDefaults.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Wand2 className="h-4 w-4 mr-2" />
              )}
              Create Defaults
            </Button>
          ) : undefined
        }
      />

      {/* Sidebar */}
      <DetailSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        mode={sidebarMode}
        title={
          sidebarMode === 'create'
            ? 'Create Category'
            : sidebarMode === 'edit'
              ? 'Edit Category'
              : selectedCategory?.name || 'Category Details'
        }
      >
        {sidebarMode === 'view' && selectedCategory ? (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="text-4xl">{getIconComponent(selectedCategory.icon)}</div>
              <div>
                <h3 className="text-lg font-semibold">{selectedCategory.name}</h3>
                <p className="text-sm text-muted-foreground">{selectedCategory.code}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Description</Label>
                <p>{selectedCategory.description || 'No description'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Templates</Label>
                  <p className="font-medium">{selectedCategory.template_count}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Display Order</Label>
                  <p className="font-medium">{selectedCategory.display_order}</p>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Status</Label>
                <Badge variant={selectedCategory.is_active ? 'success' : 'destructive'}>
                  {selectedCategory.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>

            {canManage && (
              <div className="flex gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => handleEdit()}>
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button variant="destructive" onClick={() => handleDelete()}>
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Enter category name"
              />
            </div>

            <div className="space-y-2">
              <Label>Code *</Label>
              <Input
                value={formData.code}
                onChange={(e) => handleInputChange('code', e.target.value)}
                placeholder="category-code"
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <textarea
                className="w-full min-h-[80px] p-2 border rounded-md text-sm"
                value={formData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Enter description"
              />
            </div>

            <div className="space-y-2">
              <Label>Icon</Label>
              <select
                className="w-full p-2 border rounded-md"
                value={formData.icon}
                onChange={(e) => handleInputChange('icon', e.target.value)}
              >
                {ICON_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {getIconComponent(opt.value)} {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>Display Order</Label>
              <Input
                type="number"
                value={formData.display_order}
                onChange={(e) => handleInputChange('display_order', parseInt(e.target.value))}
                min={0}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => handleInputChange('is_active', e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="is_active">Active</Label>
            </div>

            <div className="flex gap-2 pt-4 border-t">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setIsSidebarOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleSubmit}
                disabled={createCategory.isPending || updateCategory.isPending}
              >
                {(createCategory.isPending || updateCategory.isPending) && (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                )}
                {sidebarMode === 'create' ? 'Create' : 'Update'}
              </Button>
            </div>
          </div>
        )}
      </DetailSidebar>
    </div>
  );
};

export default TemplateCategoriesPage;
