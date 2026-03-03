/**
 * Library Fines Page - Accountant Module
 * Premium design with modern UI/UX
 */

import { motion } from 'framer-motion';
import {
  ArrowDownRight,
  ArrowUpRight,
  Book,
  BookOpen,
  Calendar,
  IndianRupee,
  TrendingUp,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';
import { toast } from 'sonner';
import { DataTable } from '../../components/common/DataTable';
import { DetailSidebar } from '../../components/common/DetailSidebar';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { useCreateLibraryFine, useLibraryFines, useUpdateLibraryFine } from '../../hooks/useAccountant';
import type { LibraryFine, LibraryFineFilters } from '../../types/accountant.types';
import { LibraryFineForm } from './forms/LibraryFineForm';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 100,
    },
  },
};

export default function LibraryFinesPage() {
  const [filters, setFilters] = useState<LibraryFineFilters>({
    page: 1,
    page_size: 10,
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarMode, setSidebarMode] = useState<'view' | 'create' | 'edit'>('create');
  const [selectedFine, setSelectedFine] = useState<LibraryFine | null>(null);

  const { data, isLoading, error, refetch } = useLibraryFines(filters);
  const updateMutation = useUpdateLibraryFine();
  const createMutation = useCreateLibraryFine();

  const handleAddNew = () => {
    setSelectedFine(null);
    setSidebarMode('create');
    setIsSidebarOpen(true);
  };

  const handleRowClick = (fine: LibraryFine) => {
    setSelectedFine(fine);
    setSidebarMode('view');
    setIsSidebarOpen(true);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  const handleFormSubmit = async (data: any) => {
    try {
      if (sidebarMode === 'create') {
        await createMutation.mutateAsync(data);
        toast.success('Library fine created successfully');
      } else if (sidebarMode === 'edit' && selectedFine) {
        await updateMutation.mutateAsync({ id: selectedFine.id, data });
        toast.success('Library fine updated successfully');
      }
      handleCloseSidebar();
      refetch();
    } catch (err: any) {
      toast.error(typeof err.message === 'string' ? err.message : 'Operation failed');
    }
  };

  const handleMarkAsPaid = async (id: number) => {
    try {
      await updateMutation.mutateAsync({
        id,
        data: { is_paid: true, paid_date: new Date().toISOString().split('T')[0] },
      });
      toast.success('Library fine marked as paid');
      refetch();
    } catch (err: any) {
      toast.error(typeof err.message === 'string' ? err.message : 'Failed to update fine');
    }
  };

  // Calculate statistics
  const stats = useMemo(() => {
    if (!data?.results) return null;

    const totalFines = data.results.reduce((sum, fine) => sum + parseFloat(fine.amount), 0);
    const paidFines = data.results.filter((fine) => fine.is_paid).length;
    const unpaidFines = data.results.filter((fine) => !fine.is_paid).length;
    const avgFine = data.results.length > 0 ? totalFines / data.results.length : 0;

    return {
      total: totalFines,
      paid: paidFines,
      unpaid: unpaidFines,
      average: avgFine,
      count: data.results.length,
    };
  }, [data]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const columns = [
    {
      key: 'id',
      label: 'ID',
      sortable: true,
      render: (item: LibraryFine) => (
        <span className="font-mono font-semibold text-primary">#{item.id}</span>
      ),
    },
    {
      key: 'student_name',
      label: 'Student',
      render: (item: LibraryFine) => {
        const name = item.student_name || `Member #${item.member}`;
        const initials = name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2);

        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8 border-2 border-background">
              <AvatarFallback className="text-xs font-semibold bg-gradient-to-br from-orange-500 to-red-500 text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <span className="font-medium">{name}</span>
              <p className="text-xs text-muted-foreground">{item.member_id}</p>
            </div>
          </div>
        );
      },
    },
    {
      key: 'amount',
      label: 'Amount',
      sortable: true,
      render: (item: LibraryFine) => (
        <span className={`font-semibold text-lg ${item.is_paid ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
          {formatCurrency(parseFloat(item.amount))}
        </span>
      ),
    },
    {
      key: 'reason',
      label: 'Reason',
      render: (item: LibraryFine) => (
        <div className="flex items-center gap-2">
          <Book className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm">{item.reason}</span>
        </div>
      ),
    },
    {
      key: 'fine_date',
      label: 'Fine Date',
      sortable: true,
      render: (item: LibraryFine) => (
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          {new Date(item.fine_date).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })}
        </div>
      ),
    },
    {
      key: 'is_paid',
      label: 'Status',
      sortable: true,
      render: (item: LibraryFine) => (
        <Badge variant={item.is_paid ? 'success' : 'warning'}>
          {item.is_paid && <ArrowUpRight className="w-3 h-3 mr-1" />}
          {!item.is_paid && <ArrowDownRight className="w-3 h-3 mr-1" />}
          {item.is_paid ? 'Paid' : 'Unpaid'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (item: LibraryFine) =>
        !item.is_paid ? (
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              handleMarkAsPaid(item.id);
            }}
          >
            Mark as Paid
          </Button>
        ) : null,
    },
  ];

  return (
    <motion.div
      className="p-4 md:p-6 flex flex-col gap-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Fines */}
          <motion.div variants={itemVariants}>
            <Card className="border-none shadow-md bg-gradient-to-br from-blue-500 to-blue-600 text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-blue-100">
                    Total Fines
                  </CardTitle>
                  <BookOpen className="w-5 h-5 text-blue-200" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{formatCurrency(stats.total)}</div>
                <p className="text-xs text-blue-100 mt-1">{stats.count} fines</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Paid Fines */}
          <motion.div variants={itemVariants}>
            <Card className="border-none shadow-md bg-gradient-to-br from-green-500 to-green-600 text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-green-100">
                    Paid
                  </CardTitle>
                  <ArrowUpRight className="w-5 h-5 text-green-200" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.paid}</div>
                <p className="text-xs text-green-100 mt-1">
                  {((stats.paid / stats.count) * 100).toFixed(1)}% collection rate
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Unpaid Fines */}
          <motion.div variants={itemVariants}>
            <Card className="border-none shadow-md bg-gradient-to-br from-yellow-500 to-yellow-600 text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-yellow-100">
                    Unpaid
                  </CardTitle>
                  <ArrowDownRight className="w-5 h-5 text-yellow-200" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.unpaid}</div>
                <p className="text-xs text-yellow-100 mt-1">Pending collection</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Average Fine */}
          <motion.div variants={itemVariants}>
            <Card className="border-none shadow-md bg-gradient-to-br from-red-500 to-red-600 text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-red-100">
                    Average Fine
                  </CardTitle>
                  <IndianRupee className="w-5 h-5 text-red-200" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{formatCurrency(stats.average)}</div>
                <p className="text-xs text-red-100 mt-1">Per fine</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}

      {/* Fines Trend Chart */}
      <motion.div variants={itemVariants}>
        <Card className="border-none shadow-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <TrendingUp className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <CardTitle className="text-lg">Library Fines Trend</CardTitle>
                <CardDescription>Daily library fine collections</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={
                    data?.results
                      ?.slice(0, 7)
                      .reverse()
                      .map((item) => ({
                        name: new Date(item.fine_date).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                        }),
                        amount: parseFloat(item.amount),
                        date: item.fine_date,
                      })) || []
                  }
                  margin={{
                    top: 10,
                    right: 10,
                    left: 0,
                    bottom: 0,
                  }}
                >
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
                    tickFormatter={(value) => `₹${value}`}
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
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Data Table */}
      <motion.div variants={itemVariants}>
        <DataTable
          title="Library Fines"
          description="Track library fines and overdue book penalties"
          columns={columns}
          data={data || { results: [], count: 0, next: null, previous: null }}
          isLoading={isLoading}
          error={error ? (error as any).message : null}
          onRefresh={refetch}
          filters={filters}
          onFiltersChange={setFilters}
          onAdd={handleAddNew}
          onRowClick={handleRowClick}
          addButtonLabel="Add Library Fine"
          filterConfig={[
            {
              name: 'is_paid',
              label: 'Status',
              type: 'select',
              options: [
                { value: '', label: 'All' },
                { value: 'true', label: 'Paid' },
                { value: 'false', label: 'Unpaid' },
              ],
            },
          ]}
          searchPlaceholder="Search by member name, ID..."
        />
      </motion.div>

      <DetailSidebar
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
        title={
          sidebarMode === 'create'
            ? 'New Library Fine'
            : sidebarMode === 'edit'
              ? 'Edit Library Fine'
              : `Library Fine #${selectedFine?.id}`
        }
        mode={sidebarMode}
        onEdit={sidebarMode === 'view' ? () => setSidebarMode('edit') : undefined}
      >
        {sidebarMode === 'view' && selectedFine ? (
          <div className="space-y-6 p-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Student/Member
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs bg-primary/10 text-primary">
                      {(selectedFine.student_name || selectedFine.member_name || 'M')
                        .slice(0, 2)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold">
                      {selectedFine.student_name || selectedFine.member_name}
                    </p>
                    <p className="text-xs text-muted-foreground">{selectedFine.member_id}</p>
                  </div>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Amount
                </label>
                <p className="text-sm font-semibold mt-1">
                  {formatCurrency(parseFloat(selectedFine.amount))}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Fine Date
                </label>
                <p className="text-sm font-semibold mt-1">
                  {new Date(selectedFine.fine_date).toLocaleDateString('en-IN')}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Status
                </label>
                <Badge variant={selectedFine.is_paid ? 'success' : 'warning'} className="mt-1">
                  {selectedFine.is_paid ? 'Paid' : 'Unpaid'}
                </Badge>
              </div>
              {selectedFine.book_title && (
                <div className="col-span-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Book
                  </label>
                  <div className="flex items-center gap-2 mt-1 p-2 bg-muted/50 rounded-md">
                    <Book className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{selectedFine.book_title}</span>
                  </div>
                </div>
              )}
              {selectedFine.paid_date && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Paid Date
                  </label>
                  <p className="text-sm font-semibold mt-1">
                    {new Date(selectedFine.paid_date).toLocaleDateString('en-IN')}
                  </p>
                </div>
              )}
            </div>
            {selectedFine.reason && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Reason
                </label>
                <div className="mt-1 p-3 bg-muted/30 rounded-md text-sm">
                  {selectedFine.reason}
                </div>
              </div>
            )}
          </div>
        ) : (
          <LibraryFineForm
            libraryFine={sidebarMode === 'edit' ? selectedFine : null}
            onSubmit={handleFormSubmit}
            onCancel={handleCloseSidebar}
            isSubmitting={createMutation.isPending || updateMutation.isPending}
          />
        )}
      </DetailSidebar>
    </motion.div>
  );
}
