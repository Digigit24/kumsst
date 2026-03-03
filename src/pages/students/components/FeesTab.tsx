/**
 * Fees Tab for Student Detail Page
 * Shows fee structure, payment history, and pending fees
 */

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useFeeStudentDrillDown } from '@/hooks/useFeeDrillDown';
import { cn } from '@/lib/utils';
import {
  AlertCircle,
  CheckCircle,
  CreditCard,
  Download,
  History,
  IndianRupee,
  TrendingDown,
  TrendingUp
} from 'lucide-react';
import React from 'react';

interface FeesTabProps {
  studentId: number;
}

// Format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString();
};

export const FeesTab: React.FC<FeesTabProps> = ({ studentId }) => {
  const { data, isLoading, error, refetch } = useFeeStudentDrillDown(studentId);

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center text-center">
              <AlertCircle className="h-10 w-10 text-red-500 mb-2" />
              <p className="text-red-500 font-medium">Failed to load fee details</p>
              <p className="text-sm text-red-400 mb-4">{(error as any)?.message}</p>
              <Button onClick={() => refetch()} variant="outline" className="border-red-200 hover:bg-red-100">
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate pending fees logic - reusing logic from FeeStudentDrillDown or using API metrics
  const pendingFees = data?.metrics?.total_outstanding || 0;

  return (
    <div className="space-y-6">
      {/* Fee Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-32" />
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Total Fees</p>
                  <p className="text-2xl font-bold mt-1">
                    {data?.metrics?.total_due != null ? formatCurrency(data.metrics.total_due) : '-'}
                  </p>
                </div>
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <IndianRupee className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-32" />
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Paid</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                    {data?.metrics?.total_collected != null ? formatCurrency(data.metrics.total_collected) : '-'}
                  </p>
                </div>
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <TrendingDown className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-32" />
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Pending / Balance</p>
                  <p className={cn(
                    "text-2xl font-bold mt-1",
                    pendingFees > 0 ? "text-orange-600 dark:text-orange-400" : "text-blue-600 dark:text-blue-400"
                  )}>
                    {data?.metrics?.total_outstanding != null ? formatCurrency(data.metrics.total_outstanding) : '-'}
                  </p>
                </div>
                <div className="p-3 bg-orange-500/10 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-32" />
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Transactions</p>
                  <p className="text-2xl font-bold mt-1">
                    {data?.payment_history ? data.payment_history.length : '-'}
                  </p>
                </div>
                <div className="p-3 bg-purple-500/10 rounded-lg">
                  <History className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Pending Fees Warning */}
      {!isLoading && pendingFees > 0 && (
        <Card className="border-orange-500/50 bg-orange-500/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-sm mb-1">Pending Payment</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  You have a pending amount of <span className="font-bold">{formatCurrency(pendingFees)}</span>.
                  Please make the payment before the due date to avoid late fees.
                </p>
                <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Pay Now
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Fee Structure */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Fee Structure
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (data?.fee_structures && data.fee_structures.length > 0) ? (
            <>
              {/* Desktop: Table view */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fee Type</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Paid</TableHead>
                      <TableHead className="text-right">Balance</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.fee_structures.map((item: any, i: number) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">
                          <div className="flex flex-col">
                            <span>{item.fee_type_name}</span>
                            <span className="text-xs text-muted-foreground">{item.academic_year} (Sem {item.semester})</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">{formatDate(item.due_date)}</TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(item.amount_due)}</TableCell>
                        <TableCell className="text-right text-green-600">{formatCurrency(item.amount_paid)}</TableCell>
                        <TableCell className="text-right text-red-600">{formatCurrency(item.balance)}</TableCell>
                        <TableCell className="text-center">
                          <Badge
                            className={
                              item.payment_status === 'paid'
                                ? 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400'
                                : item.payment_status === 'partial'
                                  ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400'
                                  : 'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400'
                            }
                          >
                            {item.payment_status ? item.payment_status.toUpperCase() : 'PENDING'}
                          </Badge>
                          {item.is_overdue && item.payment_status !== 'paid' && (
                            <span className="block text-[10px] text-red-500 font-semibold mt-1">OVERDUE</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile: Card view */}
              <div className="md:hidden space-y-3">
                {data.fee_structures.map((item: any, i: number) => (
                  <div key={i} className="rounded-xl border border-border/50 bg-muted/20 p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-sm">{item.fee_type_name}</p>
                        <p className="text-xs text-muted-foreground">{item.academic_year} (Sem {item.semester})</p>
                      </div>
                      <div className="ml-2 text-right shrink-0">
                        <Badge
                          className={
                            item.payment_status === 'paid'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : item.payment_status === 'partial'
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          }
                        >
                          {item.payment_status ? item.payment_status.toUpperCase() : 'PENDING'}
                        </Badge>
                        {item.is_overdue && item.payment_status !== 'paid' && (
                          <p className="text-[10px] text-red-500 font-semibold mt-1">OVERDUE</p>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <span className="text-xs text-muted-foreground">Due</span>
                        <p className="font-medium">{formatDate(item.due_date)}</p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Amount</span>
                        <p className="font-medium">{formatCurrency(item.amount_due)}</p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Balance</span>
                        <p className="font-medium text-red-600">{formatCurrency(item.balance)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              No fee structure records found.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            Payment History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (data?.payment_history && data.payment_history.length > 0) ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Collected By</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.payment_history.map((payment: any, i: number) => (
                  <TableRow key={i}>
                    <TableCell className="font-mono text-xs font-medium">{payment.transaction_id || '-'}</TableCell>
                    <TableCell className="text-sm">{formatDate(payment.payment_date)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs uppercase">{payment.payment_method}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{payment.collected_by_name || '-'}</TableCell>
                    <TableCell className="text-right font-bold text-green-600">{formatCurrency(payment.amount)}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                        <Download className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No payments recorded yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
