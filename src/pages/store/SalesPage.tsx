/**
 * Sales Page - Store Sales Management
 */

import { useQueryClient } from '@tanstack/react-query';
import {
  AlertCircle,
  Banknote,
  CheckCircle2,
  Clock,
  CreditCard,
  DollarSign,
  Smartphone,
  TrendingUp,
  Wallet,
  XCircle
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Column, DataTable, FilterConfig } from '../../components/common/DataTable';
import { DetailSidebar } from '../../components/common/DetailSidebar';
import { StoreManagerSalesChart } from '../../components/dashboard/sections/StoreManagerSalesChart';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { useAuth } from '../../hooks/useAuth';
import { useColleges } from '../../hooks/useCore';
import { useCreateBulkSale, useCreateSale, useCreateSaleItem, useDeleteSale, useSale, useSales, useUpdateSale } from '../../hooks/useStore';
import { SaleForm } from './forms/SaleForm';

// Delay must match the sidebar close animation duration
const SIDEBAR_CLOSE_DELAY = 300;

const SalesPage = () => {
  const [filters, setFilters] = useState<Record<string, any>>({ page: 1, page_size: 10, ordering: '-created_at' });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarMode, setSidebarMode] = useState<'view' | 'create' | 'edit'>('view');
  const [selectedSale, setSelectedSale] = useState<any | null>(null);
  const [selectedSaleId, setSelectedSaleId] = useState<number | null>(null);

  // Fetch full detail of the selected sale
  const { data: saleDetail, isLoading: isSaleDetailLoading } = useSale(selectedSaleId);

  // Main Data for Table
  const { data, isLoading, error, refetch: refresh } = useSales(filters);

  const { user } = useAuth();
  // Fetch colleges for filter (only needed for central_manager/super_admin)
  const { data: collegesData } = useColleges({ page_size: 100 });

  const createSale = useCreateSale();
  const createBulkSale = useCreateBulkSale();
  const updateSale = useUpdateSale();
  const deleteSale = useDeleteSale();
  const createSaleItem = useCreateSaleItem();
  const queryClient = useQueryClient();

  // Calculate Stats from main paginated data
  const stats = useMemo(() => {
    if (!data?.results) return { totalRevenue: 0, totalSales: 0, avgSale: 0 };

    const results = data.results;
    const totalRevenue = results.reduce((sum: number, sale: any) => sum + parseFloat(sale.total_amount || 0), 0);
    const totalSales = data.count ?? results.length;
    const avgSale = results.length > 0 ? totalRevenue / results.length : 0;

    return { totalRevenue, totalSales, avgSale };
  }, [data]);

  // Sanitize Error Message
  const getErrorMessage = () => {
    if (!error) return null;
    const err = error as any;
    // ... existing error logic ...
    return err.message || "An error occurred while loading sales.";
  };

  const errorMessage = getErrorMessage();

  const formatCurrency = (amount: string | number) => {
    const num = parseFloat(String(amount));
    if (isNaN(num)) return '₹0.00';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(num);
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method?.toLowerCase()) {
      case 'cash': return <Banknote className="h-4 w-4" />;
      case 'card': return <CreditCard className="h-4 w-4" />;
      case 'upi': return <Smartphone className="h-4 w-4" />;
      case 'wallet': return <Wallet className="h-4 w-4" />;
      default: return <Banknote className="h-4 w-4" />;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusConfig: any = {
      pending: { variant: 'secondary', icon: Clock, className: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
      completed: { variant: 'default', icon: CheckCircle2, className: 'bg-green-100 text-green-700 border-green-300' },
      failed: { variant: 'destructive', icon: XCircle, className: 'bg-red-100 text-red-700 border-red-300' },
      refunded: { variant: 'outline', icon: AlertCircle, className: 'bg-blue-100 text-blue-700 border-blue-300' },
      cancelled: { variant: 'outline', icon: XCircle, className: 'bg-gray-100 text-gray-700 border-gray-300' },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className={`gap-1 ${config.className}`}>
        <Icon className="h-3 w-3" />
        <span className="capitalize">{status}</span>
      </Badge>
    );
  };

  const columns: Column<any>[] = [
    {
      key: 'id',
      label: 'Sale ID',
      render: (sale) => (
        <span className="font-mono text-sm font-semibold text-primary">
          #{String(sale.id).padStart(6, '0')}
        </span>
      ),
      sortable: true,
    },
    {
      key: 'sale_date',
      label: 'Date',
      render: (sale) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium">
            {sale.sale_date ? new Date(sale.sale_date).toLocaleDateString('en-IN', {
              day: '2-digit', month: 'short', year: 'numeric'
            }) : 'N/A'}
          </span>
          <span className="text-xs text-muted-foreground">
            {sale.sale_date ? new Date(sale.sale_date).toLocaleDateString('en-IN', { weekday: 'short' }) : ''}
          </span>
        </div>
      ),
      sortable: true,
    },
    ...(['central_manager', 'super_admin'].includes(user?.user_type || '') ? [{
      key: 'college_name', // Assuming backend sends college_name
      label: 'College',
      render: (sale: any) => (
        <span className="text-xs text-muted-foreground">
          {sale.college_name || '-'}
        </span>
      ),
      sortable: true,
    } as Column<any>] : []),
    {
      key: 'customer',
      label: 'Customer',
      render: (sale) => {
        // Extract walk-in name from remarks e.g. "Guest: Digvijay"
        const guestName = (!sale.student_name && !sale.teacher_name && sale.remarks)
          ? sale.remarks.replace(/^Guest:\s*/i, '').trim() || 'Walk-in Customer'
          : null;
        const displayName = sale.student_name || sale.teacher_name || guestName || 'Walk-in Customer';
        const role = sale.student_name ? 'Student' : sale.teacher_name ? 'Staff' : 'Guest';
        return (
          <div className="flex flex-col">
            <span className="font-medium text-sm">{displayName}</span>
            <span className="text-xs text-muted-foreground">{role}</span>
          </div>
        );
      },
      sortable: false,
    },
    {
      key: 'items',
      label: 'Items',
      render: (sale) => {
        const items: any[] = sale.items || [];
        if (items.length === 0) return <span className="text-xs text-muted-foreground">—</span>;
        return (
          <div className="flex flex-col gap-0.5">
            {items.map((item: any, i: number) => (
              <span key={i} className="text-xs">
                <span className="font-medium">{item.item_name}</span>
                <span className="text-muted-foreground"> ×{item.quantity}</span>
              </span>
            ))}
          </div>
        );
      },
      sortable: false,
    },
    {
      key: 'total_amount',
      label: 'Amount',
      render: (sale) => (
        <span className="font-bold font-mono">
          {formatCurrency(sale.total_amount)}
        </span>
      ),
      sortable: true
    },
    {
      key: 'payment_method',
      label: 'Method',
      render: (sale) => (
        <div className="flex items-center gap-1.5 text-sm">
          {getPaymentMethodIcon(sale.payment_method)}
          <span className="capitalize">{sale.payment_method}</span>
        </div>
      ),
      sortable: true
    },
    {
      key: 'payment_status',
      label: 'Status',
      render: (sale) => getPaymentStatusBadge(sale.payment_status),
      sortable: true
    }
  ];

  const collegeOptions = collegesData?.results?.map((c: any) => ({
    value: c.id,
    label: c.name
  })) || [];

  const filterConfig: FilterConfig[] = [
    {
      name: 'search',
      label: 'Search',
      type: 'text',
      placeholder: 'Search by ID or Customer...'
    },
    ...(['central_manager', 'super_admin'].includes(user?.user_type || '') ? [{
      name: 'college',
      label: 'College',
      type: 'select' as const,
      options: [
        { value: '', label: 'All Colleges' },
        ...collegeOptions
      ]
    }] : []),
    {
      name: 'payment_method',
      label: 'Payment Method',
      type: 'select',
      options: [
        { value: '', label: 'All' },
        { value: 'cash', label: 'Cash' },
        { value: 'card', label: 'Card' },
        { value: 'upi', label: 'UPI' },
      ],
    },
    {
      name: 'payment_status',
      label: 'Payment Status',
      type: 'select',
      options: [
        { value: '', label: 'All' },
        { value: 'pending', label: 'Pending' },
        { value: 'completed', label: 'Completed' },
      ],
    },
  ];

  const handleAddNew = () => {
    setSelectedSale(null);
    setSidebarMode('create');
    setIsSidebarOpen(true);
  };

  const handleRowClick = (sale: any) => {
    setSelectedSale(sale);       // optimistic: use row data immediately
    setSelectedSaleId(sale.id);  // triggers useSale to fetch full detail
    setSidebarMode('view');
    setIsSidebarOpen(true);
  };

  const handleEdit = () => {
    setSidebarMode('edit');
  };

  const handleFormSubmit = async (data: any) => {
    try {
      if (sidebarMode === 'create') {
        const { items, ...saleData } = data;
        const hasMultipleItems = items && items.length >= 2;

        if (hasMultipleItems) {
          // ✅ BULK API: create sale + all items in one request
          const bulkPayload = {
            ...saleData,
            items: items.map((item: any) => ({
              item: item.itemId,
              quantity: item.quantity,
              unit_price: String(item.unitPrice),
              total_price: String(item.totalPrice),
              is_active: true,
            })),
          };
          await createBulkSale.mutateAsync(bulkPayload);
        } else {
          // ✅ NORMAL API: create sale, then create item(s) individually
          const newSale = await createSale.mutateAsync(saleData);
          if (items && items.length > 0 && newSale?.id) {
            await Promise.all(items.map((item: any) =>
              createSaleItem.mutateAsync({
                sale: newSale.id,
                item: item.itemId,
                quantity: item.quantity,
                unit_price: item.unitPrice,
                total_price: item.totalPrice,
                is_active: true,
              })
            ));
          }
        }

        queryClient.invalidateQueries({ queryKey: ['store-items'] });
        toast.success('Sale created successfully');
      } else if (sidebarMode === 'edit' && selectedSale) {
        const { items, ...saleData } = data;
        await updateSale.mutateAsync({ id: selectedSale.id, data: saleData });
        toast.success('Sale updated successfully');
      }
      setIsSidebarOpen(false);
      setTimeout(() => {
        setSelectedSale(null);
        setSidebarMode('view');
        refresh();
      }, SIDEBAR_CLOSE_DELAY);
    } catch (err: any) {
      toast.error(err?.message || 'An error occurred');
    }
  };

  const handleDelete = async () => {
    if (!selectedSale) return;
    if (confirm('Are you sure you want to delete this sale?')) {
      try {
        await deleteSale.mutateAsync(selectedSale.id);
        toast.success('Sale deleted successfully');
        setIsSidebarOpen(false);
        setTimeout(() => {
          setSelectedSale(null);
          setSidebarMode('view');
          refresh();
        }, SIDEBAR_CLOSE_DELAY);
      } catch (err: any) {
        toast.error(err?.message || 'Failed to delete sale');
      }
    }
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
    setTimeout(() => {
      setSelectedSale(null);
      setSelectedSaleId(null);
      setSidebarMode('view');
    }, SIDEBAR_CLOSE_DELAY);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Sales Overview</h1>
        <p className="text-muted-foreground">Manage POS transactions and view sales performance.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white border-none shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-green-100">Total Revenue (Current Page)</CardTitle>
            <DollarSign className="h-4 w-4 text-green-100" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
            <p className="text-xs text-green-100 mt-1">From current page transactions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Transactions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSales}</div>
            <p className="text-xs text-muted-foreground mt-1">All processed sales</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Sale Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.avgSale)}</div>
            <p className="text-xs text-muted-foreground mt-1">Per transaction</p>
          </CardContent>
        </Card>
      </div>

      {/* Chart Section */}
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-3">
          <StoreManagerSalesChart salesData={data} isLoading={isLoading} />
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        title="Recent Transactions"
        description="List of all sales transactions"
        columns={columns}
        data={data}
        isLoading={isLoading}
        error={errorMessage ? "Unable to display list" : null}
        onRefresh={refresh}
        onAdd={handleAddNew}
        onRowClick={handleRowClick}
        filters={filters}
        onFiltersChange={setFilters}
        filterConfig={filterConfig}
        searchPlaceholder="Search sales..."
        addButtonLabel="New Sale"
      />

      {/* Detail Sidebar */}
      <DetailSidebar
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
        title={sidebarMode === 'create' ? 'Create New Sale' : `Sale ID #${selectedSale?.id}`}
        mode={sidebarMode}
        width={sidebarMode === 'create' ? '5xl' : 'xl'}
      >
        {sidebarMode === 'view' && selectedSale ? (
          isSaleDetailLoading ? (
            // Skeleton while fetching sale detail
            <div className="space-y-4 animate-pulse">
              <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-lg border flex flex-col items-center gap-3">
                <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="h-10 w-40 bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="h-6 w-20 bg-slate-200 dark:bg-slate-700 rounded-full" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="space-y-1">
                    <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
                    <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
                  </div>
                ))}
              </div>
              <div className="h-32 bg-slate-100 dark:bg-slate-800 rounded-lg" />
            </div>
          ) : (() => {
            // Use fresh API data if available, fallback to row data
            const sale = saleDetail ?? selectedSale;
            const guestName = (!sale.student_name && !sale.teacher_name && sale.remarks)
              ? sale.remarks.replace(/^Guest:\s*/i, '').trim() || 'Walk-in'
              : null;
            const customerName = sale.student_name || sale.teacher_name || guestName || 'Walk-in Customer';
            return (
              <div className="space-y-6">
                <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-lg border flex flex-col items-center justify-center gap-2">
                  <p className="text-muted-foreground text-sm">Total Amount</p>
                  <p className="text-4xl font-bold text-primary">{formatCurrency(sale.total_amount)}</p>
                  {getPaymentStatusBadge(sale.payment_status)}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase font-semibold">Customer</p>
                    <p className="font-medium">{customerName}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase font-semibold">Date</p>
                    <p className="font-medium">{new Date(sale.sale_date).toLocaleDateString()}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase font-semibold">Payment Method</p>
                    <p className="font-medium capitalize">{sale.payment_method}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase font-semibold">Sold By</p>
                    <p className="font-medium">{sale.sold_by_name || '—'}</p>
                  </div>
                  {sale.remarks ? (
                    <div className="col-span-2 space-y-1">
                      <p className="text-xs text-muted-foreground uppercase font-semibold">Remarks</p>
                      <p className="font-medium">{sale.remarks}</p>
                    </div>
                  ) : null}
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Items</h4>
                  <div className="border rounded-md overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-100 dark:bg-slate-800">
                        <tr>
                          <th className="p-2 text-left">Item</th>
                          <th className="p-2 text-center">Qty</th>
                          <th className="p-2 text-right">Unit Price</th>
                          <th className="p-2 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sale.items?.length > 0 ? sale.items.map((item: any, i: number) => (
                          <tr key={i} className="border-t">
                            <td className="p-2">{item.item_name}</td>
                            <td className="p-2 text-center">{item.quantity}</td>
                            <td className="p-2 text-right">{formatCurrency(item.unit_price)}</td>
                            <td className="p-2 text-right">{formatCurrency(item.total_price)}</td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan={4} className="p-4 text-center text-muted-foreground text-xs">No items recorded</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={handleEdit} className="flex-1">Edit Sale</Button>
                  <Button onClick={handleDelete} variant="destructive">Delete</Button>
                </div>
              </div>
            );
          })()
        ) : (
          <SaleForm
            sale={sidebarMode === 'edit' ? (saleDetail ?? selectedSale) : null}
            onSubmit={handleFormSubmit}
            onCancel={handleCloseSidebar}
          />
        )}
      </DetailSidebar>
    </div>
  );
};

export default SalesPage;
