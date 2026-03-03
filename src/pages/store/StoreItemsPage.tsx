/**
 * Store Items Page
 * Main inventory management interface
 */

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useStoreItemsSWR } from '@/hooks/swr';
import { useAuth } from '@/hooks/useAuth';
import { useColleges } from '@/hooks/useCore';
import { DEBOUNCE_DELAYS, useDebounce } from '@/hooks/useDebounce';
import { useCreateStoreItem, useDeleteStoreItem, useUpdateStoreItem } from '@/hooks/useStore';
import { categoriesApi, storeItemsApi } from '@/services/store.service';
import { useQuery } from '@tanstack/react-query';
import {
  AlertTriangle,
  BarChart3,
  Download,
  Edit,
  Package,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  TrendingDown,
  TrendingUp
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';

type ItemCategory = 'stationery' | 'equipment' | 'consumables' | 'books' | 'electronics' | 'furniture' | 'printing';
type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock' | 'overstocked';

const getStockStatusColor = (status: StockStatus): string => {
  switch (status) {
    case 'in_stock': return 'success';
    case 'low_stock': return 'warning';
    case 'out_of_stock': return 'destructive';
    case 'overstocked': return 'default';
    default: return 'default';
  }
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const StoreItemsPage: React.FC = () => {
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, DEBOUNCE_DELAYS.SEARCH);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [collegeFilter, setCollegeFilter] = useState<string>('all');
  const [isExporting, setIsExporting] = useState(false);

  const { user } = useAuth();
  const isCentralManager = user?.user_type === 'central_manager';

  // API hooks
  // Fetch colleges for filter (only needed for central_manager/super_admin)
  const { data: collegesData } = useColleges({ page_size: 100 });

  const queryFilters = useMemo(() => {
    const filters: any = {};
    if (collegeFilter !== 'all') {
      filters.college = collegeFilter;
    }
    return filters;
  }, [collegeFilter]);

  const { data: itemsData, isLoading, error, refresh } = useStoreItemsSWR(queryFilters);
  const createItem = useCreateStoreItem();
  const updateItem = useUpdateStoreItem();
  const deleteItem = useDeleteStoreItem();

  // Fetch categories for dropdown
  const { data: categoriesData } = useQuery({
    queryKey: ['categories-for-select'],
    queryFn: () => categoriesApi.list(),
  });

  const items = itemsData?.results || [];

  // Prepare category options for SearchableSelect
  const categoryOptions = categoriesData?.results?.map((category: any) => ({
    value: category.id,
    label: `${category.name} (${category.code})`,
  })) || [];

  // Quick lookup for rendering category names in list
  const categoryLookup = useMemo(() => {
    const map: Record<number, string> = {};
    (categoriesData?.results || []).forEach((category: any) => {
      map[category.id] = category.name || category.code || `Category #${category.id}`;
    });
    return map;
  }, [categoriesData]);

  const categoryFilterOptions = useMemo(() => [
    { value: 'all', label: 'All Categories' },
    ...(categoriesData?.results?.map((category: any) => ({
      value: String(category.id),
      label: `${category.name} (${category.code})`,
    })) || []),
  ], [categoriesData]);

  const collegeOptions = useMemo(() => [
    { value: 'all', label: 'All Colleges' },
    ...(collegesData?.results?.map((college: any) => ({
      value: String(college.id),
      label: college.name,
    })) || []),
  ], [collegesData]);

  // Form state
  const [itemForm, setItemForm] = useState({
    code: '',
    name: '',
    category: 0,
    description: '',
    unit: 'Piece',
    stock_quantity: 0,
    min_stock_level: 10,
    price: 0,
    barcode: '',
    image: '',
  });

  // Calculate statistics
  const stats = useMemo(() => {
    return {
      totalItems: items.length,
      totalValue: items.reduce((sum: number, item: any) => sum + (parseFloat(item.price || 0) * parseInt(item.stock_quantity || 0)), 0),
      lowStockItems: items.filter((i: any) => i.stock_quantity > 0 && i.stock_quantity < i.min_stock_level).length,
      outOfStockItems: items.filter((i: any) => i.stock_quantity <= 0).length,
    };
  }, [items]);

  // Filter items
  const filteredItems = items.filter((item: any) => {
    const matchesSearch =
      item.name?.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
      item.code?.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(debouncedSearchQuery.toLowerCase());

    const itemCategoryName = categoryLookup[item.category] || item.category_name;
    const matchesCategory =
      categoryFilter === 'all' ||
      String(item.category) === categoryFilter ||
      itemCategoryName?.toLowerCase() === categoryFilter.toLowerCase();
    const itemStatus = item.stock_quantity <= 0
      ? 'out_of_stock'
      : item.stock_quantity < item.min_stock_level
        ? 'low_stock'
        : 'in_stock';

    const matchesStatus = statusFilter === 'all' || itemStatus === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleCreateItem = async () => {
    try {
      await createItem.mutateAsync(itemForm);
      toast.success('Item created successfully');
      setIsCreateOpen(false);
      resetForm();
      refresh();
    } catch (err: any) {
      console.error('Create item error:', err);
      toast.error(err?.message || 'Failed to create item');
    }
  };

  const handleUpdateItem = async () => {
    if (!selectedItem) return;

    try {
      await updateItem.mutateAsync({ id: selectedItem.id, data: itemForm });
      toast.success('Item updated successfully');
      setSelectedItem(null);
      resetForm();
      refresh();
    } catch (err: any) {
      console.error('Update item error:', err);
      toast.error(err?.message || 'Failed to update item');
    }
  };

  const handleDeleteItem = async (id: number) => {
    if (confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteItem.mutateAsync(id);
        toast.success('Item deleted successfully');
        refresh();
      } catch (err: any) {
        toast.error(err?.message || 'Failed to delete item');
      }
    }
  };

  const handleEditItem = (item: any) => {
    setSelectedItem(item);
    setItemForm({
      code: item.code || '',
      name: item.name || '',
      category: item.category || 0,
      description: item.description || '',
      unit: item.unit || 'Piece',
      stock_quantity: item.stock_quantity || 0,
      min_stock_level: item.min_stock_level || 10,
      price: item.price || 0,
      barcode: item.barcode || '',
      image: item.image || '',
    });
  };

  const handleExportPdf = async () => {
    try {
      setIsExporting(true);
      const filters: any = {};
      if (collegeFilter !== 'all') filters.college = collegeFilter;
      if (categoryFilter !== 'all') filters.category = categoryFilter;
      if (statusFilter !== 'all') filters.status = statusFilter;
      if (debouncedSearchQuery) filters.search = debouncedSearchQuery;

      const blob = await storeItemsApi.exportPdf(filters);

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `inventory_export_${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Inventory PDF generated successfully');
    } catch (err: any) {
      console.error('Export error:', err);
      toast.error(err?.message || 'Failed to export inventory');
    } finally {
      setIsExporting(false);
    }
  };

  const resetForm = () => {
    setItemForm({
      code: '',
      name: '',
      category: 0,
      description: '',
      unit: 'Piece',
      stock_quantity: 0,
      min_stock_level: 10,
      price: 0,
      barcode: '',
      image: '',
    });
  };

  const getStatusIcon = (status: StockStatus) => {
    switch (status) {
      case 'in_stock': return null;
      case 'low_stock': return <AlertTriangle className="h-4 w-4" />;
      case 'out_of_stock': return <AlertTriangle className="h-4 w-4" />;
      case 'overstocked': return <TrendingUp className="h-4 w-4" />;
      default: return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading store items...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-center mb-2">Error Loading Items</h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              {error?.message || 'Failed to load store items'}
            </p>
            <Button onClick={() => refresh()} className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Package className="h-8 w-8 text-primary" />
            Store Inventory
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage store items and track inventory levels
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="gap-2">
              <Plus className="h-5 w-5" />
              Add New Item
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl max-w-[95vw] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Item</DialogTitle>
              <DialogDescription>
                Add a new item to the store inventory
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Item Code *</label>
                  <Input
                    placeholder="e.g., ST-001"
                    value={itemForm.code}
                    onChange={(e) => setItemForm({ ...itemForm, code: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Category</label>
                  <SearchableSelect
                    options={categoryOptions}
                    value={itemForm.category}
                    onChange={(value) => setItemForm({ ...itemForm, category: Number(value) })}
                    placeholder="Select category"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Item Name *</label>
                <Input
                  placeholder="e.g., A4 Printing Paper (Ream)"
                  value={itemForm.name}
                  onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Description</label>
                <Textarea
                  placeholder="Item description..."
                  rows={2}
                  value={itemForm.description}
                  onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Unit</label>
                  <Select
                    value={itemForm.unit}
                    onValueChange={(value) => setItemForm({ ...itemForm, unit: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Piece">Piece</SelectItem>
                      <SelectItem value="Box">Box</SelectItem>
                      <SelectItem value="Ream">Ream</SelectItem>
                      <SelectItem value="Set">Set</SelectItem>
                      <SelectItem value="Bottle">Bottle</SelectItem>
                      <SelectItem value="Packet">Packet</SelectItem>
                      <SelectItem value="Kg">Kg</SelectItem>
                      <SelectItem value="Liter">Liter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Price (₹) *</label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={itemForm.price}
                    onChange={(e) => setItemForm({ ...itemForm, price: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Stock Quantity</label>
                  <Input
                    type="number"
                    min="0"
                    value={itemForm.stock_quantity}
                    onChange={(e) => setItemForm({ ...itemForm, stock_quantity: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Min Stock Level</label>
                  <Input
                    type="number"
                    min="0"
                    value={itemForm.min_stock_level}
                    onChange={(e) => setItemForm({ ...itemForm, min_stock_level: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Barcode (Optional)</label>
                  <Input
                    placeholder="Barcode"
                    value={itemForm.barcode}
                    onChange={(e) => setItemForm({ ...itemForm, barcode: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Image URL (Optional)</label>
                  <Input
                    placeholder="Image URL"
                    value={itemForm.image}
                    onChange={(e) => setItemForm({ ...itemForm, image: e.target.value })}
                  />
                </div>
              </div>

              {/* Value Calculation */}
              <div className="p-4 bg-accent/30 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total Stock Value:</span>
                  <span className="text-lg font-bold text-primary">
                    {formatCurrency(itemForm.stock_quantity * itemForm.price)}
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => { setIsCreateOpen(false); resetForm(); }}>
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateItem}
                  disabled={!itemForm.code || !itemForm.name || itemForm.price === 0}
                >
                  <Package className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stock Alerts Banner */}
      {(stats.lowStockItems > 0 || stats.outOfStockItems > 0) && (
        <Card className="border-orange-500 bg-orange-500/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
              <div className="flex-1">
                <h4 className="font-semibold">Inventory Alerts</h4>
                <p className="text-sm text-muted-foreground">
                  {stats.outOfStockItems > 0 && `${stats.outOfStockItems} items out of stock`}
                  {stats.outOfStockItems > 0 && stats.lowStockItems > 0 && ' • '}
                  {stats.lowStockItems > 0 && `${stats.lowStockItems} items low on stock`}
                </p>
              </div>
              <Button
                variant="default"
                className="bg-orange-600 hover:bg-orange-700"
                onClick={() => setStatusFilter('low_stock')}
              >
                View Items
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Items</p>
                <p className="text-2xl font-bold mt-1">{stats.totalItems}</p>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold text-primary mt-1">{formatCurrency(stats.totalValue)}</p>
              </div>
              <div className="p-3 bg-green-500/10 rounded-lg">
                <BarChart3 className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Low Stock</p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-1">{stats.lowStockItems}</p>
              </div>
              <div className="p-3 bg-orange-500/10 rounded-lg">
                <TrendingDown className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Out of Stock</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">{stats.outOfStockItems}</p>
              </div>
              <div className="p-3 bg-red-500/10 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Items List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <CardTitle>Inventory Items</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{filteredItems.length} items</Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportPdf}
                disabled={isExporting}
              >
                {isExporting ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className="space-y-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search items by name, code, or description..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className={`grid grid-cols-1 sm:grid-cols-${isCentralManager ? '3' : '2'} gap-3`}>
              {isCentralManager && (
                <Select value={collegeFilter} onValueChange={setCollegeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by college" />
                  </SelectTrigger>
                  <SelectContent>
                    {collegeOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  {categoryFilterOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="in_stock">In Stock</SelectItem>
                  <SelectItem value="low_stock">Low Stock</SelectItem>
                  <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                  <SelectItem value="overstocked">Overstocked</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Items Table */}

          {/* Empty state */}
          {filteredItems.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="h-16 w-16 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium">No items found</p>
              <p className="text-sm">Add items to your inventory to get started</p>
            </div>
          )}

          {filteredItems.length > 0 && (
            <>
              {/* Desktop: Table view */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-sm">Item Code</th>
                      <th className="text-left py-3 px-4 font-medium text-sm">Name</th>
                      <th className="text-left py-3 px-4 font-medium text-sm">Category</th>
                      <th className="text-right py-3 px-4 font-medium text-sm">Stock</th>
                      <th className="text-right py-3 px-4 font-medium text-sm">Unit Price</th>
                      <th className="text-right py-3 px-4 font-medium text-sm">Total Value</th>
                      <th className="text-center py-3 px-4 font-medium text-sm">Status</th>
                      <th className="text-right py-3 px-4 font-medium text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.map((item: any) => (
                      <tr key={item.id} className="border-b hover:bg-accent/50 transition-colors">
                        <td className="py-3 px-4">
                          <p className="font-medium text-sm">{item.code}</p>
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-medium text-sm">{item.name}</p>
                          <p className="text-xs text-muted-foreground">{item.description}</p>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline" className="capitalize">
                            {categoryLookup[item.category] || item.category_name || `Category #${item.category}`}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <p className="font-medium">{item.stock_quantity}</p>
                          <p className="text-xs text-muted-foreground">{item.unit}</p>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <p className="text-sm">{formatCurrency(parseFloat(item.price || 0))}</p>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <p className="font-medium">{formatCurrency(parseFloat(item.price || 0) * parseInt(item.stock_quantity || 0))}</p>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge variant={item.stock_quantity <= 0 ? 'destructive' : item.stock_quantity < item.min_stock_level ? 'warning' : 'success'} className="gap-1">
                            {item.stock_quantity <= 0 ? 'Out of Stock' : item.stock_quantity < item.min_stock_level ? 'Low Stock' : 'In Stock'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="sm" onClick={() => handleEditItem(item)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteItem(item.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile: Card view */}
              <div className="md:hidden space-y-3 p-3">
                {filteredItems.map((item: any) => (
                  <div key={item.id} className="rounded-xl border border-border/50 bg-card p-4 shadow-sm">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-base truncate">{item.name}</p>
                        <p className="text-sm text-muted-foreground">{item.code}</p>
                      </div>
                      <Badge variant={item.stock_quantity <= 0 ? 'destructive' : item.stock_quantity < item.min_stock_level ? 'warning' : 'success'} className="ml-2 shrink-0">
                        {item.stock_quantity <= 0 ? 'Out of Stock' : item.stock_quantity < item.min_stock_level ? 'Low Stock' : 'In Stock'}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                      <div>
                        <span className="text-xs text-muted-foreground">Category</span>
                        <p className="font-medium truncate">{categoryLookup[item.category] || item.category_name || '-'}</p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Stock</span>
                        <p className="font-medium">{item.stock_quantity} {item.unit}</p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Unit Price</span>
                        <p className="font-medium">{formatCurrency(parseFloat(item.price || 0))}</p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Total Value</span>
                        <p className="font-medium">{formatCurrency(parseFloat(item.price || 0) * parseInt(item.stock_quantity || 0))}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1 min-h-[44px]" onClick={() => handleEditItem(item)}>
                        <Edit className="h-4 w-4 mr-1.5" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" className="min-h-[44px] text-destructive hover:bg-destructive/10 border-destructive/30" onClick={() => handleDeleteItem(item.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      {selectedItem && (
        <Dialog open={!!selectedItem} onOpenChange={() => { setSelectedItem(null); resetForm(); }}>
          <DialogContent className="sm:max-w-2xl max-w-[95vw] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Item</DialogTitle>
              <DialogDescription>
                Update item details and inventory levels
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              {/* Same form fields as create */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Item Code *</label>
                  <Input
                    value={itemForm.code}
                    onChange={(e) => setItemForm({ ...itemForm, code: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Category</label>
                  <SearchableSelect
                    options={categoryOptions}
                    value={itemForm.category}
                    onChange={(value) => setItemForm({ ...itemForm, category: Number(value) })}
                    placeholder="Select category"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Item Name *</label>
                <Input
                  value={itemForm.name}
                  onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Description</label>
                <Textarea
                  rows={2}
                  value={itemForm.description}
                  onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Unit</label>
                  <Select
                    value={itemForm.unit}
                    onValueChange={(value) => setItemForm({ ...itemForm, unit: value })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Piece">Piece</SelectItem>
                      <SelectItem value="Box">Box</SelectItem>
                      <SelectItem value="Ream">Ream</SelectItem>
                      <SelectItem value="Set">Set</SelectItem>
                      <SelectItem value="Bottle">Bottle</SelectItem>
                      <SelectItem value="Packet">Packet</SelectItem>
                      <SelectItem value="Kg">Kg</SelectItem>
                      <SelectItem value="Liter">Liter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Price (₹) *</label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={itemForm.price}
                    onChange={(e) => setItemForm({ ...itemForm, price: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Stock Quantity</label>
                  <Input
                    type="number"
                    min="0"
                    value={itemForm.stock_quantity}
                    onChange={(e) => setItemForm({ ...itemForm, stock_quantity: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Min Stock Level</label>
                  <Input
                    type="number"
                    min="0"
                    value={itemForm.min_stock_level}
                    onChange={(e) => setItemForm({ ...itemForm, min_stock_level: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Barcode (Optional)</label>
                  <Input
                    placeholder="Barcode"
                    value={itemForm.barcode}
                    onChange={(e) => setItemForm({ ...itemForm, barcode: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Image URL (Optional)</label>
                  <Input
                    placeholder="Image URL"
                    value={itemForm.image}
                    onChange={(e) => setItemForm({ ...itemForm, image: e.target.value })}
                  />
                </div>
              </div>

              <div className="p-4 bg-accent/30 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total Stock Value:</span>
                  <span className="text-lg font-bold text-primary">
                    {formatCurrency(itemForm.stock_quantity * itemForm.price)}
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => { setSelectedItem(null); resetForm(); }}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateItem}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Update Item
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default StoreItemsPage;
