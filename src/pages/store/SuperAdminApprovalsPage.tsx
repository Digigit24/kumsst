/**
 * CEO Approvals Page
 * Super admins can approve or reject store indents from all colleges
 */

import { CheckCircle, XCircle, FileText } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Column, DataTable } from '../../components/common/DataTable';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import {
  usePendingSuperAdminApprovals,
  useSuperAdminApprove,
  useSuperAdminReject,
} from '../../hooks/useStoreIndents';

export const SuperAdminApprovalsPage = () => {
  const [filters, setFilters] = useState<Record<string, any>>({ page: 1, page_size: 10 });
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedIndent, setSelectedIndent] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  const { data, isLoading, refetch } = usePendingSuperAdminApprovals(filters);
  const approveMutation = useSuperAdminApprove();
  const rejectMutation = useSuperAdminReject();

  const handleApprove = async (indent: any) => {
    try {
      await approveMutation.mutateAsync({ id: indent.id, data: {} });
      toast.success('Indent approved. Ready for material issuance.');
      refetch();
    } catch (error: any) {
      toast.error(typeof error.message === 'string' ? error.message : 'Failed to approve indent');
    }
  };

  const handleRejectClick = (indent: any) => {
    setSelectedIndent(indent);
    setRejectionReason('');
    setRejectDialogOpen(true);
  };

  const handleRejectConfirm = async () => {
    if (!selectedIndent) return;

    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    try {
      await rejectMutation.mutateAsync({
        id: selectedIndent.id,
        data: { rejection_reason: rejectionReason },
      });
      toast.success('Indent rejected successfully');
      setRejectDialogOpen(false);
      setSelectedIndent(null);
      setRejectionReason('');
      refetch();
    } catch (error: any) {
      toast.error(typeof error.message === 'string' ? error.message : 'Failed to reject indent');
    }
  };

  const handleViewDetails = (indent: any) => {
    setSelectedIndent(indent);
    setViewDialogOpen(true);
  };

  const getPriorityVariant = (priority: string): 'default' | 'secondary' | 'outline' | 'destructive' => {
    const variants: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
      low: 'secondary',
      medium: 'default',
      high: 'outline',
      urgent: 'destructive',
    };
    return variants[priority] || 'default';
  };

  const columns: Column<any>[] = [
    {
      key: 'indent_number',
      label: 'Indent Number',
      render: (row) => <span className="font-semibold">{row.indent_number}</span>,
      sortable: true,
    },
    {
      key: 'college',
      label: 'College',
      render: (row) => `College #${row.college}`,
    },
    {
      key: 'required_by_date',
      label: 'Required By',
      render: (row) => new Date(row.required_by_date).toLocaleDateString(),
      sortable: true,
    },
    {
      key: 'priority',
      label: 'Priority',
      render: (row) => (
        <Badge variant={getPriorityVariant(row.priority)} className="capitalize">
          {row.priority}
        </Badge>
      ),
    },
    {
      key: 'items_count',
      label: 'Items',
      render: (row) => row.items?.length || 0,
    },
    {
      key: 'justification',
      label: 'Justification',
      render: (row) => (
        <span className="max-w-md truncate block" title={row.justification}>
          {row.justification}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => handleViewDetails(row)}>
            <FileText className="h-4 w-4 mr-1" />
            View
          </Button>
          <Button size="sm" variant="outline" onClick={() => handleApprove(row)}>
            <CheckCircle className="h-4 w-4 mr-1" />
            Approve
          </Button>
          <Button size="sm" variant="destructive" onClick={() => handleRejectClick(row)}>
            <XCircle className="h-4 w-4 mr-1" />
            Reject
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <DataTable
        title="Pending CEO Approvals"
        description="Final approval for store indents from all colleges"
        columns={columns}
        data={data}
        isLoading={isLoading}
        error={null}
        onRefresh={refetch}
        onFiltersChange={setFilters}
        filters={filters}
      />

      {/* View Details Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-3xl max-w-[95vw] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Indent Details</DialogTitle>
          </DialogHeader>
          {selectedIndent && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Indent Number</Label>
                  <p className="font-semibold">{selectedIndent.indent_number}</p>
                </div>
                <div>
                  <Label>College</Label>
                  <p>College #{selectedIndent.college}</p>
                </div>
                <div>
                  <Label>Required By</Label>
                  <p>{new Date(selectedIndent.required_by_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label>Priority</Label>
                  <Badge variant={getPriorityVariant(selectedIndent.priority)} className="capitalize">
                    {selectedIndent.priority}
                  </Badge>
                </div>
              </div>

              <div>
                <Label>Justification</Label>
                <p className="text-sm">{selectedIndent.justification}</p>
              </div>

              {selectedIndent.remarks && (
                <div>
                  <Label>Remarks</Label>
                  <p className="text-sm">{selectedIndent.remarks}</p>
                </div>
              )}

              <div>
                <Label>Items Requested</Label>
                <div className="border rounded-md mt-2">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="p-2 text-left">Item</th>
                        <th className="p-2 text-right">Quantity</th>
                        <th className="p-2 text-left">Unit</th>
                        {selectedIndent.items?.[0]?.justification && (
                          <th className="p-2 text-left">Justification</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {selectedIndent.items?.map((item: any, index: number) => (
                        <tr key={index} className="border-t">
                          <td className="p-2">Item #{item.central_store_item}</td>
                          <td className="p-2 text-right">{item.requested_quantity}</td>
                          <td className="p-2">{item.unit}</td>
                          {item.justification && (
                            <td className="p-2 text-sm text-muted-foreground">{item.justification}</td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Indent</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Please provide a reason for rejecting this indent request.
            </p>
            <div>
              <Label required>Rejection Reason</Label>
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter reason for rejection (e.g., budget constraints, insufficient justification)..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRejectConfirm}>
              Reject Indent
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
