/**
 * Fee Collections Page - Accountant Module
 * Premium design with modern UI/UX
 */

import { motion } from 'framer-motion';
import {
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  CreditCard,
  Download,
  Plus,
  RefreshCw,
  IndianRupee as Rupee,
  Search,
  TrendingUp,
  User,
  Wallet
} from 'lucide-react';
import { useState } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  XAxis,
  YAxis
} from 'recharts';
import { toast } from 'sonner';
import { DataTable } from '../../components/common/DataTable';
import { DetailSidebar } from '../../components/common/DetailSidebar';
import { PageLoader } from '../../components/common/LoadingComponents';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  useCreateFeeCollection,
  useDeleteFeeCollection,
  useFeeCollectionDetail,
  useFeeCollections,
  useUpdateFeeCollection,
} from '../../hooks/useAccountant';
import { useDebouncedCallback } from '../../hooks/useDebounce';
import type {
  FeeCollection,
  FeeCollectionFilters,
} from '../../types/accountant.types';
import { FeeCollectionForm } from './forms/FeeCollectionForm';

const formatCurrency = (value: number | string) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(typeof value === 'string' ? parseFloat(value) : value);
};

export default function FeeCollectionsPage() {
  const [filters, setFilters] = useState<FeeCollectionFilters>({
    page: 1,
    page_size: 10,
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarMode, setSidebarMode] = useState<'view' | 'create' | 'edit'>('view');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [searchInput, setSearchInput] = useState('');

  const handleSearch = useDebouncedCallback((term: string) => {
    setFilters((prev) => ({ ...prev, search: term, page: 1 }));
  }, 500);

  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchInput(term);
    handleSearch(term);
  };

  // Queries
  const { data, isLoading, error, refetch } = useFeeCollections(filters);
  const { data: selectedItem } = useFeeCollectionDetail(selectedId);

  // Mutations
  const createMutation = useCreateFeeCollection();
  const updateMutation = useUpdateFeeCollection();
  const deleteMutation = useDeleteFeeCollection();

  // Calculate summary stats
  const totalCollections = data?.results?.length || 0;
  const totalAmount = data?.results?.reduce((sum, item) => sum + parseFloat(item.amount), 0) || 0;
  const completedCount = data?.results?.filter(item => item.status === 'completed').length || 0;
  const pendingCount = data?.results?.filter(item => item.status === 'pending').length || 0;

  const columns = [
    {
      key: 'id',
      label: 'ID',
      sortable: true,
      render: (item: FeeCollection) => (
        <span className="font-mono text-xs font-semibold text-primary">#{item.id}</span>
      ),
    },
    {
      key: 'student_name',
      label: 'Student',
      sortable: true,
      render: (item: FeeCollection) => (
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs">
            {item.student_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-sm">{item.student_name}</p>
            <p className="text-xs text-muted-foreground">{item.student_details?.admission_number}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'amount',
      label: 'Amount',
      sortable: true,
      render: (item: FeeCollection) => (
        <span className="font-bold text-sm text-green-600 dark:text-green-400">
          {formatCurrency(item.amount)}
        </span>
      ),
    },
    {
      key: 'payment_method',
      label: 'Payment Method',
      sortable: true,
      render: (item: FeeCollection) => {
        const methodIcons: Record<string, any> = {
          cash: Wallet,
          bank: CreditCard,
          online: CreditCard,
          upi: Rupee,
          card: CreditCard,
        };
        const Icon = methodIcons[item.payment_method] || CreditCard;
        return (
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium capitalize">{item.payment_method}</span>
          </div>
        );
      },
    },
    {
      key: 'payment_date',
      label: 'Payment Date',
      sortable: true,
      render: (item: FeeCollection) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{new Date(item.payment_date).toLocaleDateString('en-IN')}</span>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (item: FeeCollection) => {
        const statusConfig: Record<string, { color: string; icon: any }> = {
          completed: { color: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800', icon: ArrowUpRight },
          pending: { color: 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800', icon: TrendingUp },
          failed: { color: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800', icon: ArrowDownRight },
          cancelled: { color: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-800', icon: ArrowDownRight },
        };
        const config = statusConfig[item.status] || statusConfig.pending;
        const Icon = config.icon;
        return (
          <Badge className={`${config.color} border font-medium capitalize flex items-center gap-1 w-fit`}>
            <Icon className="h-3 w-3" />
            {item.status}
          </Badge>
        );
      },
    },
    {
      key: 'collected_by_name',
      label: 'Collected By',
      sortable: false,
      render: (item: FeeCollection) => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{item.collected_by_name}</span>
        </div>
      ),
    },
  ];

  const handleAddNew = () => {
    setSelectedId(null);
    setSidebarMode('create');
    setIsSidebarOpen(true);
  };

  const handleRowClick = (item: FeeCollection) => {
    setSelectedId(item.id);
    setSidebarMode('view');
    setIsSidebarOpen(true);
  };

  const handleEdit = () => {
    setSidebarMode('edit');
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
    setSelectedId(null);
  };

  const handleFormSubmit = async (data: any) => {
    try {
      if (sidebarMode === 'create') {
        await createMutation.mutateAsync(data);
        toast.success('Fee collection recorded successfully');
      } else if (sidebarMode === 'edit' && selectedId) {
        await updateMutation.mutateAsync({ id: selectedId, data });
        toast.success('Fee collection updated successfully');
      }
      handleCloseSidebar();
      refetch();
    } catch (err: any) {
      toast.error(typeof err.message === 'string' ? err.message : 'Operation failed');
    }
  };

  const handleDelete = async () => {
    if (!selectedId) return;

    if (!confirm('Are you sure you want to delete this fee collection?')) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(selectedId);
      toast.success('Fee collection deleted successfully');
      handleCloseSidebar();
      refetch();
    } catch (err: any) {
      toast.error(typeof err.message === 'string' ? err.message : 'Failed to delete fee collection');
    }
  };

  const handleRefresh = async () => {
    await refetch();
    toast.success('Data refreshed successfully');
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <>
      <motion.div
        className="p-6 space-y-6 min-h-screen bg-transparent"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header Section */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Fee Collections
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Track and manage all student fee payments
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={handleRefresh} variant="outline" size="sm" className="hover:bg-primary/10">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={handleAddNew} size="sm" className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg">
              <Plus className="h-4 w-4 mr-2" />
              New Collection
            </Button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <motion.div variants={itemVariants} whileHover={{ y: -5 }} transition={{ type: 'spring', stiffness: 300 }}>
            <Card className="overflow-hidden relative border-none shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-blue-100 font-medium text-sm flex justify-between items-center">
                  TOTAL COLLECTIONS
                  <Rupee className="h-4 w-4 opacity-70" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {formatCurrency(totalAmount)}
                </div>
                <p className="text-blue-100 text-xs mt-1 opacity-80">
                  {totalCollections} transactions
                </p>
                <div className="absolute -right-6 -bottom-6 opacity-10">
                  <Rupee className="w-32 h-32" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants} whileHover={{ y: -5 }} transition={{ type: 'spring', stiffness: 300 }}>
            <Card className="overflow-hidden relative border-none shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-green-100 font-medium text-sm flex justify-between items-center">
                  COMPLETED
                  <ArrowUpRight className="h-4 w-4 opacity-70" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {completedCount}
                </div>
                <p className="text-green-100 text-xs mt-1 opacity-80">
                  Successful payments
                </p>
                <div className="absolute -right-6 -bottom-6 opacity-10">
                  <ArrowUpRight className="w-32 h-32" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants} whileHover={{ y: -5 }} transition={{ type: 'spring', stiffness: 300 }}>
            <Card className="overflow-hidden relative border-none shadow-lg bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-yellow-100 font-medium text-sm flex justify-between items-center">
                  PENDING
                  <TrendingUp className="h-4 w-4 opacity-70" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {pendingCount}
                </div>
                <p className="text-yellow-100 text-xs mt-1 opacity-80">
                  Awaiting confirmation
                </p>
                <div className="absolute -right-6 -bottom-6 opacity-10">
                  <TrendingUp className="w-32 h-32" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants} whileHover={{ y: -5 }} transition={{ type: 'spring', stiffness: 300 }}>
            <Card className="overflow-hidden relative border-none shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-purple-100 font-medium text-sm flex justify-between items-center">
                  AVG. AMOUNT
                  <Wallet className="h-4 w-4 opacity-70" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {formatCurrency(totalCollections > 0 ? totalAmount / totalCollections : 0)}
                </div>
                <p className="text-purple-100 text-xs mt-1 opacity-80">
                  Per transaction
                </p>
                <div className="absolute -right-6 -bottom-6 opacity-10">
                  <Wallet className="w-32 h-32" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Collections Trend Chart */}
        <motion.div variants={itemVariants}>
          <Card className="border-none shadow-md">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <CardTitle className="text-lg">Collections Trend</CardTitle>
                  <CardDescription>Daily fee collection performance</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={data?.results?.slice(0, 7).reverse().map((item, index) => ({
                      name: new Date(item.payment_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
                      amount: parseFloat(item.amount),
                      date: item.payment_date
                    })) || []}
                    margin={{
                      top: 10,
                      right: 10,
                      left: 0,
                      bottom: 0,
                    }}
                  >
                    <defs>
                      <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                      tickFormatter={(value) => `₹${value / 1000}k`}
                    />
                    <RechartsTooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-background/95 backdrop-blur-sm border rounded-lg shadow-lg p-3 text-sm">
                              <p className="font-medium mb-1">{payload[0].payload.name}</p>
                              <p style={{ color: payload[0].color }}>
                                Amount: {formatCurrency(payload[0].value as number)}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="amount"
                      stroke="#8b5cf6"
                      strokeWidth={3}
                      dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Filters and Search */}
        <motion.div variants={itemVariants}>
          <Card className="border-none shadow-sm bg-muted/40 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 w-full">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by student name, admission number..."
                      value={searchInput}
                      onChange={onSearchChange}
                      className="pl-10 bg-background"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full md:w-auto">
                  <Select
                    value={filters.status || ''}
                    onValueChange={(value) => setFilters({ ...filters, status: value || undefined })}
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={filters.payment_method || ''}
                    onValueChange={(value) => setFilters({ ...filters, payment_method: value || undefined })}
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Payment Method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Methods</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="upi">UPI</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" className="w-full md:w-auto">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Data Table */}
        <motion.div variants={itemVariants}>
          <Card className="border-none shadow-md">
            <DataTable
              title=""
              columns={columns}
              data={data}
              isLoading={isLoading}
              error={error ? (error as any).message : null}
              onRefresh={refetch}
              onRowClick={handleRowClick}
              filters={filters}
              onFiltersChange={(newFilters) => setFilters(newFilters as FeeCollectionFilters)}
              filterConfig={[]}
            />
          </Card>
        </motion.div>
      </motion.div>

      <DetailSidebar
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
        title={
          sidebarMode === 'create'
            ? 'New Fee Collection'
            : sidebarMode === 'edit'
              ? 'Edit Fee Collection'
              : `Fee Collection #${selectedItem?.id}`
        }
        mode={sidebarMode}
        onEdit={sidebarMode === 'view' ? handleEdit : undefined}
        onDelete={sidebarMode === 'view' ? handleDelete : undefined}
      >
        {sidebarMode === 'view' && selectedItem ? (
          <div className="space-y-6 p-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Student
                </label>
                <p className="text-sm font-semibold mt-1">
                  {selectedItem.student_name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {selectedItem.student_details.admission_number}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Amount
                </label>
                <p className="text-sm font-semibold mt-1">
                  {formatCurrency(selectedItem.amount)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Payment Method
                </label>
                <p className="text-sm font-semibold mt-1">
                  {selectedItem.payment_method.toUpperCase()}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Payment Date
                </label>
                <p className="text-sm font-semibold mt-1">
                  {new Date(selectedItem.payment_date).toLocaleDateString(
                    'en-IN'
                  )}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Status
                </label>
                <p className="text-sm font-semibold mt-1 capitalize">
                  {selectedItem.status}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Collected By
                </label>
                <p className="text-sm font-semibold mt-1">
                  {selectedItem.collected_by_name}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Created At
                </label>
                <p className="text-sm font-semibold mt-1">
                  {selectedItem.created_at}
                </p>
              </div>
            </div>
            {selectedItem.remarks && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Remarks
                </label>
                <p className="text-sm mt-1">{selectedItem.remarks}</p>
              </div>
            )}
          </div>
        ) : (
          <FeeCollectionForm
            feeCollection={sidebarMode === 'edit' ? (selectedItem || null) : null}
            onSubmit={handleFormSubmit}
            onCancel={handleCloseSidebar}
          />
        )}
      </DetailSidebar>
    </>
  );
}
