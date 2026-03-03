import React from 'react';
import { CreditCard, Download, CheckCircle2, AlertCircle, Clock, Receipt } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useStudentFees, useDownloadFeeReceipt } from '@/hooks/useFees';
import { PageLoader } from '@/components/common/LoadingComponents';

export const Fees: React.FC = () => {
  const { user } = useAuth();
  const studentId = user?.student_id;

  // Use list API with student filter
  // The backend endpoint /api/v1/students/my-fees/ (list) is used to get all fee records.
  // The /{id}/ endpoint is for specific fee record detail and will 404 if passed a student ID.
  const { data: feesData, isLoading, error } = useStudentFees(studentId ? { student: studentId } : {});
  const downloadReceiptMutation = useDownloadFeeReceipt();

  const handleDownloadReceipt = async (paymentId: number, receiptNo: string) => {
    try {
      const blob = await downloadReceiptMutation.mutateAsync(paymentId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Receipt-${receiptNo}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download receipt:', error);
      // You might want to show a toast notification here
    }
  };

  if (isLoading) {
    return <PageLoader />;
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        Failed to load fee details. Please try again later.
      </div>
    );
  }

  // Handle paginated response or direct array
  const feesList = feesData?.results ? feesData.results : (Array.isArray(feesData) ? feesData : []);

  // Calculate summary from the list of fee transactions
  const paidFees = feesList.reduce((total: number, item: any) => {
    return total + (Number(item.amount) || 0);
  }, 0);

  // Since we only have paid fees history, exact total/pending is not available in this API.
  // We'll show Paid Fees and leave others as 0 or derivative for now until a 'pending' API is available.
  const feesSummary = {
    totalFees: paidFees, // Placeholder: assuming paid is part of total, but we don't know the full total yet
    paidFees: paidFees,
    pendingFees: 0,
    dueDate: new Date().toISOString(), // Fallback
  };

  const feeStructure: any[] = []; // No structure data in paid fees list

  const paymentHistory = feesList.map((payment: any) => ({
    id: payment.id,
    receiptNo: payment.transaction_id || `REC-${payment.id}`,
    date: payment.payment_date || payment.created_at || new Date().toISOString(),
    description: payment.remarks || `Fee Payment #${payment.id}`,
    amount: Number(payment.amount) || 0,
    paymentMode: payment.payment_method || 'Unknown',
    status: payment.status || 'completed',
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Fee Management</h1>
        <p className="text-muted-foreground mt-2">
          View and pay your academic fees
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Fees</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{feesSummary.totalFees.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Academic Year 2024-25</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Fees</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ₹{feesSummary.paidFees.toLocaleString()}
            </div>
            <div className="w-full bg-muted rounded-full h-2 mt-2 overflow-hidden">
              <div
                className="h-full bg-green-500"
                style={{ width: `${feesSummary.totalFees > 0 ? (feesSummary.paidFees / feesSummary.totalFees) * 100 : 0}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Fees</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              ₹{feesSummary.pendingFees.toLocaleString()}
            </div>
            <p className="text-xs text-destructive mt-1 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Due: {new Date(feesSummary.dueDate).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Payments */}
      {feeStructure.filter((fee: any) => fee.status === 'pending').length > 0 && (
        <Card className="border-l-4 border-l-destructive">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="h-5 w-5" />
                  Pending Payment
                </CardTitle>
                <CardDescription>Please pay before the due date to avoid late fees</CardDescription>
              </div>
              <Button>
                <CreditCard className="h-4 w-4 mr-2" />
                Pay Now
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {feeStructure
                .filter((fee: any) => fee.status === 'pending')
                .map((fee: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-destructive/10">
                    <div>
                      <p className="font-medium">{fee.category}</p>
                      <p className="text-sm text-muted-foreground">Due: {new Date(feesSummary.dueDate).toLocaleDateString()}</p>
                    </div>
                    <p className="text-xl font-bold">₹{fee.amount.toLocaleString()}</p>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Fee Structure */}
      <Card>
        <CardHeader>
          <CardTitle>Fee Structure</CardTitle>
          <CardDescription>Breakdown of all fees for current academic year</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {feeStructure.length > 0 ? (
              feeStructure.map((fee: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">{fee.category}</p>
                      <div className="flex items-center gap-3">
                        <Badge variant={fee.status === 'paid' ? 'success' : 'destructive'}>
                          {fee.status === 'paid' ? 'Paid' : 'Pending'}
                        </Badge>
                        <p className="text-lg font-bold">₹{fee.amount.toLocaleString()}</p>
                      </div>
                    </div>
                    {fee.status === 'paid' && (
                      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                        <div className="h-full bg-green-500" style={{ width: '100%' }} />
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                No fee structure details available.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Payment History
          </CardTitle>
          <CardDescription>Your previous fee payments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {paymentHistory.map((payment: any) => (
              <div key={payment.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium">{payment.description}</p>
                      <p className="text-sm text-muted-foreground">
                        Receipt No: {payment.receiptNo}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">₹{payment.amount.toLocaleString()}</p>
                      <Badge variant="outline" className="mt-1">{payment.paymentMode}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {new Date(payment.date).toLocaleDateString()}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownloadReceipt(payment.id, payment.receiptNo)}
                      disabled={downloadReceiptMutation.isPending}
                    >
                      <Download className="h-3 w-3 mr-1" />
                      {downloadReceiptMutation.isPending ? 'Downloading...' : 'Download Receipt'}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
