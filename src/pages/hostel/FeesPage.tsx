/**
 * Enhanced Hostel Fees Page - Phase 4: Fee Management Dashboard
 * Visual fee tracking with student-centric views and overdue payment alerts
 */

import { format, isBefore, parseISO } from 'date-fns';
import { AlertCircle, CheckCircle, CreditCard, DollarSign, Search, TrendingDown, TrendingUp, User, Users, XCircle } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { DetailSidebar } from '../../components/common/DetailSidebar';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Progress } from '../../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { DROPDOWN_PAGE_SIZE } from '../../config/app.config';
import { invalidateHostelFees } from '../../hooks/swr';
import { useDebounce } from '../../hooks/useDebounce';
import { useCreateHostelFee, useDeleteHostelFee, useHostelAllocations, useHostelFees, useUpdateHostelFee } from '../../hooks/useHostel';
import { FeeForm } from './components/FeeForm';

const FeesPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 500);
  const [viewMode, setViewMode] = useState<'overview' | 'pending' | 'paid' | 'overdue'>('overview');
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarMode, setSidebarMode] = useState<'view' | 'create' | 'edit'>('view');
  const [selected, setSelected] = useState<any | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Fetch data
  const { data: feesData } = useHostelFees({ page_size: DROPDOWN_PAGE_SIZE, is_active: true, search: debouncedSearch });
  const { data: allocationsData } = useHostelAllocations({ page_size: DROPDOWN_PAGE_SIZE, is_active: true, is_current: true });

  const create = useCreateHostelFee();
  const update = useUpdateHostelFee();
  const del = useDeleteHostelFee();

  const fees = feesData?.results || [];
  const allocations = allocationsData?.results || [];

  // Calculate statistics
  const totalFees = fees.length;
  const paidFees = fees.filter(f => f.is_paid).length;
  const unpaidFees = fees.filter(f => !f.is_paid).length;
  const overdueFees = fees.filter(f => !f.is_paid && f.due_date && isBefore(parseISO(f.due_date), new Date())).length;

  const totalAmount = fees.reduce((sum, f) => sum + parseFloat(f.amount || '0'), 0);
  const paidAmount = fees.filter(f => f.is_paid).reduce((sum, f) => sum + parseFloat(f.amount || '0'), 0);
  const pendingAmount = totalAmount - paidAmount;

  const collectionRate = totalFees > 0 ? Math.round((paidFees / totalFees) * 100) : 0;

  // Group fees by student
  const feesByStudent = fees.reduce((acc, fee) => {
    const allocation = allocations.find(a => a.id === fee.allocation);
    if (!allocation) return acc;

    const studentId = allocation.student;
    const studentName = allocation.student_name || `Student #${studentId}`;

    if (!acc[studentId]) {
      acc[studentId] = {
        studentId,
        studentName,
        hostelName: allocation.hostel_name,
        roomNumber: allocation.room_number,
        fees: [],
        totalAmount: 0,
        paidAmount: 0,
        pendingAmount: 0,
        overdueFees: 0,
      };
    }

    acc[studentId].fees.push(fee);
    acc[studentId].totalAmount += parseFloat(fee.amount || '0');
    if (fee.is_paid) {
      acc[studentId].paidAmount += parseFloat(fee.amount || '0');
    } else {
      acc[studentId].pendingAmount += parseFloat(fee.amount || '0');
      if (fee.due_date && isBefore(parseISO(fee.due_date), new Date())) {
        acc[studentId].overdueFees++;
      }
    }

    return acc;
  }, {} as Record<number, any>);

  const studentFeesList = Object.values(feesByStudent);

  // Filter fees
  const filteredFees = fees.filter(fee => {
    if (selectedMonth && fee.month !== selectedMonth) return false;
    if (selectedYear && fee.year !== selectedYear) return false;

    const allocation = allocations.find(a => a.id === fee.allocation);
    if (searchQuery && allocation) {
      const studentName = allocation.student_name?.toLowerCase() || '';
      return studentName.includes(searchQuery.toLowerCase());
    }

    return true;
  });

  const pendingFees = filteredFees.filter(f => !f.is_paid);
  const paidFeesList = filteredFees.filter(f => f.is_paid);
  const overdueFeesList = filteredFees.filter(f => !f.is_paid && f.due_date && isBefore(parseISO(f.due_date), new Date()));

  const handleAddNew = () => {
    setSelected(null);
    setSidebarMode('create');
    setIsSidebarOpen(true);
  };

  const handleViewFee = (fee: any) => {
    setSelected(fee);
    setSidebarMode('view');
    setIsSidebarOpen(true);
  };

  const handleEdit = () => setSidebarMode('edit');

  const handleMarkAsPaid = async (fee: any) => {
    try {
      await update.mutateAsync({
        id: fee.id,
        data: { ...fee, is_paid: true, paid_date: new Date().toISOString().split('T')[0] }
      });
      toast.success('Fee marked as paid');
      invalidateHostelFees();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update fee');
    }
  };

  const handleFormSubmit = async (formData: any) => {
    try {
      if (sidebarMode === 'create') {
        await create.mutateAsync(formData);
        toast.success('Fee created successfully');
      } else {
        await update.mutateAsync({ id: selected.id, data: formData });
        toast.success('Fee updated successfully');
      }
      setIsSidebarOpen(false);
      invalidateHostelFees();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save fee');
    }
  };

  const handleDeleteClick = () => {
    if (!selected) return;
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selected) return;
    try {
      await del.mutateAsync(selected.id);
      toast.success('Fee deleted successfully');
      setDeleteDialogOpen(false);
      setIsSidebarOpen(false);
      setSelected(null);
      invalidateHostelFees();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete fee');
    }
  };

  const getMonthName = (month: number) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[month - 1] || month;
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Fee Management</h1>
          <p className="text-muted-foreground mt-1">
            Track hostel fee payments and collections
          </p>
        </div>
        <Button onClick={handleAddNew}>
          <CreditCard className="h-4 w-4 mr-2" />
          Add Fee Record
        </Button>
      </div>

      {/* Statistics Cards */}
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Collection */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
          <div className="absolute -right-6 -top-6 bg-white/10 h-32 w-32 rounded-full blur-3xl group-hover:bg-white/20 transition-all" />
          <div className="absolute right-4 top-4 opacity-20">
            <DollarSign className="w-12 h-12" />
          </div>
          <CardContent className="p-6 relative z-10">
            <p className="text-emerald-100 font-medium text-sm mb-1 uppercase tracking-wider">Total Collection</p>
            <h3 className="text-3xl font-bold mb-4">₹{paidAmount.toLocaleString()}</h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-emerald-100">
                <span>{paidFees} Transactions</span>
                <span>{Math.round((paidFees / totalFees) * 100)}% Goal</span>
              </div>
              <div className="h-1.5 w-full bg-black/20 rounded-full overflow-hidden">
                <div className="h-full bg-white/90 rounded-full" style={{ width: `${collectionRate}%` }} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pending Amount */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-500 to-orange-600 text-white relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
          <div className="absolute -right-6 -top-6 bg-white/10 h-32 w-32 rounded-full blur-3xl group-hover:bg-white/20 transition-all" />
          <div className="absolute right-4 top-4 opacity-20">
            <TrendingDown className="w-12 h-12" />
          </div>
          <CardContent className="p-6 relative z-10">
            <p className="text-amber-100 font-medium text-sm mb-1 uppercase tracking-wider">Pending Amount</p>
            <h3 className="text-3xl font-bold mb-4">₹{pendingAmount.toLocaleString()}</h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-amber-100">
                <span>{unpaidFees} Students Pending</span>
                <span>Due Soon</span>
              </div>
              <div className="h-1.5 w-full bg-black/20 rounded-full overflow-hidden">
                <div className="h-full bg-white/90 rounded-full" style={{ width: `${(pendingAmount / totalAmount) * 100}%` }} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Overdue Fees */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-rose-500 to-red-600 text-white relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
          <div className="absolute -right-6 -top-6 bg-white/10 h-32 w-32 rounded-full blur-3xl group-hover:bg-white/20 transition-all" />
          <div className="absolute right-4 top-4 opacity-20">
            <AlertCircle className="w-12 h-12" />
          </div>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-rose-100 font-medium text-sm uppercase tracking-wider">Overdue Fees</p>
              <Badge variant="secondary" className="bg-white/20 text-white border-0 hover:bg-white/30 text-[10px] px-1.5 h-5">
                {overdueFees}
              </Badge>
            </div>
            <h3 className="text-3xl font-bold mb-4">{overdueFees} <span className="text-lg font-normal opacity-80">Accounts</span></h3>

            <div className="flex items-center gap-2 text-xs text-rose-100 mt-6 bg-white/10 p-2 rounded-lg">
              <AlertCircle className="w-4 h-4" />
              <span>Requires immediate attention</span>
            </div>
          </CardContent>
        </Card>

        {/* Collection Rate */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
          <div className="absolute -right-6 -top-6 bg-white/10 h-32 w-32 rounded-full blur-3xl group-hover:bg-white/20 transition-all" />
          <div className="absolute right-4 top-4 opacity-20">
            <TrendingUp className="w-12 h-12" />
          </div>
          <CardContent className="p-6 relative z-10">
            <p className="text-blue-100 font-medium text-sm mb-1 uppercase tracking-wider">Collection Rate</p>
            <h3 className="text-3xl font-bold mb-4">{collectionRate}%</h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-blue-100">
                <span>Current Performance</span>
                <span>Excellent</span>
              </div>
              <div className="h-1.5 w-full bg-black/20 rounded-full overflow-hidden">
                <div className="h-full bg-white/90 rounded-full" style={{ width: `${collectionRate}%` }} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by student name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          className="px-4 py-2 border rounded-md bg-background"
          value={selectedMonth || ''}
          onChange={(e) => setSelectedMonth(e.target.value ? Number(e.target.value) : null)}
        >
          <option value="">All Months</option>
          {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
            <option key={month} value={month}>
              {getMonthName(month)}
            </option>
          ))}
        </select>
        <select
          className="px-4 py-2 border rounded-md bg-background"
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
        >
          {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      {/* Overdue Alerts */}
      {overdueFeesList.length > 0 && (
        <Card className="border-red-200 bg-red-50/50 dark:bg-red-950/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <CardTitle className="text-red-900 dark:text-red-100">
                  Overdue Payments ({overdueFeesList.length})
                </CardTitle>
              </div>
              <Badge variant="destructive">Action Required</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {overdueFeesList.slice(0, 5).map((fee) => {
              const allocation = allocations.find(a => a.id === fee.allocation);
              const daysOverdue = Math.floor((new Date().getTime() - new Date(fee.due_date).getTime()) / (1000 * 60 * 60 * 24));

              return (
                <Card key={fee.id} className="bg-white dark:bg-gray-900">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="p-2 rounded-full bg-red-100 dark:bg-red-950/30">
                          <User className="h-4 w-4 text-red-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold">
                            {allocation?.student_name || `Student #${allocation?.student}`}
                          </p>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                            <span>{getMonthName(fee.month)} {fee.year}</span>
                            <span>•</span>
                            <span>₹{fee.amount}</span>
                            <span>•</span>
                            <span className="text-red-600 font-semibold">
                              {daysOverdue} days overdue
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewFee(fee)}
                        >
                          View
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleMarkAsPaid(fee)}
                          disabled={update.isPending}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Mark Paid
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {overdueFeesList.length > 5 && (
              <p className="text-sm text-muted-foreground text-center pt-2">
                +{overdueFeesList.length - 5} more overdue payments
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Fee Records
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">By Student</TabsTrigger>
              <TabsTrigger value="pending">
                Pending ({pendingFees.length})
              </TabsTrigger>
              <TabsTrigger value="paid">
                Paid ({paidFeesList.length})
              </TabsTrigger>
              <TabsTrigger value="overdue">
                Overdue ({overdueFeesList.length})
              </TabsTrigger>
            </TabsList>

            {/* By Student View */}
            <TabsContent value="overview" className="space-y-3 mt-6">
              {studentFeesList.map((student) => (
                <Card key={student.studentId} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="p-2 rounded-full bg-primary/10">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{student.studentName}</h3>
                            {student.overdueFees > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                {student.overdueFees} Overdue
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                            <span>{student.hostelName}</span>
                            <span>•</span>
                            <span>Room {student.roomNumber}</span>
                            <span>•</span>
                            <span>{student.fees.length} fee records</span>
                          </div>

                          {/* Payment Progress */}
                          <div className="mt-3 space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Payment Progress</span>
                              <span className="font-semibold">
                                ₹{student.paidAmount.toLocaleString()} / ₹{student.totalAmount.toLocaleString()}
                              </span>
                            </div>
                            <Progress
                              value={student.totalAmount > 0 ? (student.paidAmount / student.totalAmount) * 100 : 0}
                              className="h-2"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Pending</p>
                        <p className="text-lg font-bold text-orange-600">
                          ₹{student.pendingAmount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {/* Pending Fees */}
            <TabsContent value="pending" className="space-y-2 mt-6">
              {pendingFees.map((fee) => {
                const allocation = allocations.find(a => a.id === fee.allocation);
                const isOverdue = fee.due_date && isBefore(parseISO(fee.due_date), new Date());

                return (
                  <Card
                    key={fee.id}
                    className={`cursor-pointer hover:bg-muted/50 transition-colors ${isOverdue ? 'border-red-200' : ''}`}
                    onClick={() => handleViewFee(fee)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${isOverdue ? 'bg-red-100 dark:bg-red-950/30' : 'bg-orange-100 dark:bg-orange-950/30'}`}>
                            <CreditCard className={`h-4 w-4 ${isOverdue ? 'text-red-600' : 'text-orange-600'}`} />
                          </div>
                          <div>
                            <p className="font-semibold">
                              {allocation?.student_name || `Student #${allocation?.student}`}
                            </p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>{getMonthName(fee.month)} {fee.year}</span>
                              <span>•</span>
                              <span>Due: {fee.due_date ? format(parseISO(fee.due_date), 'MMM dd, yyyy') : '-'}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="font-bold text-lg">₹{fee.amount}</p>
                            {isOverdue && (
                              <Badge variant="destructive" className="text-xs">Overdue</Badge>
                            )}
                          </div>
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAsPaid(fee);
                            }}
                            disabled={update.isPending}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Mark Paid
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </TabsContent>

            {/* Paid Fees */}
            <TabsContent value="paid" className="space-y-2 mt-6">
              {paidFeesList.map((fee) => {
                const allocation = allocations.find(a => a.id === fee.allocation);

                return (
                  <Card
                    key={fee.id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleViewFee(fee)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-green-100 dark:bg-green-950/30">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <p className="font-semibold">
                              {allocation?.student_name || `Student #${allocation?.student}`}
                            </p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>{getMonthName(fee.month)} {fee.year}</span>
                              <span>•</span>
                              <span>Paid: {fee.paid_date ? format(parseISO(fee.paid_date), 'MMM dd, yyyy') : '-'}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">₹{fee.amount}</p>
                          <Badge variant="default" className="text-xs">Paid</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </TabsContent>

            {/* Overdue Fees */}
            <TabsContent value="overdue" className="space-y-2 mt-6">
              {overdueFeesList.map((fee) => {
                const allocation = allocations.find(a => a.id === fee.allocation);
                const daysOverdue = Math.floor((new Date().getTime() - new Date(fee.due_date).getTime()) / (1000 * 60 * 60 * 24));

                return (
                  <Card
                    key={fee.id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors border-red-200"
                    onClick={() => handleViewFee(fee)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-red-100 dark:bg-red-950/30">
                            <XCircle className="h-4 w-4 text-red-600" />
                          </div>
                          <div>
                            <p className="font-semibold">
                              {allocation?.student_name || `Student #${allocation?.student}`}
                            </p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>{getMonthName(fee.month)} {fee.year}</span>
                              <span>•</span>
                              <span className="text-red-600 font-semibold">
                                {daysOverdue} days overdue
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="font-bold text-lg text-red-600">₹{fee.amount}</p>
                            <Badge variant="destructive" className="text-xs">Overdue</Badge>
                          </div>
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAsPaid(fee);
                            }}
                            disabled={update.isPending}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Mark Paid
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Detail Sidebar */}
      <DetailSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        title={
          sidebarMode === 'create'
            ? 'Create Fee Record'
            : sidebarMode === 'edit'
              ? 'Edit Fee Record'
              : 'Fee Details'
        }
        mode={sidebarMode}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        data={selected}
      >
        {(sidebarMode === 'create' || sidebarMode === 'edit') && (
          <FeeForm
            item={sidebarMode === 'edit' ? selected : null}
            onSubmit={handleFormSubmit}
            onCancel={() => setIsSidebarOpen(false)}
          />
        )}
        {sidebarMode === 'view' && selected && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Allocation</label>
              <p className="text-base font-semibold">Allocation #{selected.allocation}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Month</label>
              <p className="text-base">{getMonthName(selected.month)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Year</label>
              <p className="text-base">{selected.year}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Amount</label>
              <p className="text-base font-bold text-lg">₹{selected.amount}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Due Date</label>
              <p className="text-base">
                {selected.due_date ? format(parseISO(selected.due_date), 'MMM dd, yyyy') : '-'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Payment Status</label>
              <Badge variant={selected.is_paid ? 'default' : 'destructive'}>
                {selected.is_paid ? 'Paid' : 'Unpaid'}
              </Badge>
            </div>
            {selected.is_paid && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Paid Date</label>
                <p className="text-base">
                  {selected.paid_date ? format(parseISO(selected.paid_date), 'MMM dd, yyyy') : '-'}
                </p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-muted-foreground">Remarks</label>
              <p className="text-base">{selected.remarks || '-'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <Badge variant={selected.is_active ? 'default' : 'secondary'}>
                {selected.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>
        )}
      </DetailSidebar>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Fee Record"
        description="Are you sure you want to delete this fee record? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        loading={del.isPending}
      />
    </div>
  );
};

export default FeesPage;
