/**
 * Indent Detail View - Shows indent details with workflow Stepper
 * Used in slide-over or dialog to show full indent information
 */

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { FileText, Package, CheckCircle, XCircle, Clock, Truck, UserCheck } from 'lucide-react';
import { Stepper, StepperStep } from '../../components/workflow/Stepper';
import { SmartActionBar, ActionBarAction } from '../../components/workflow/SmartActionBar';
import { Badge } from '../../components/ui/badge';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface IndentDetailViewProps {
  indent: any;
  onClose: () => void;
  onApprove?: () => Promise<void>;
  onReject?: (reason: string) => Promise<void>;
  onPrepareDispatch?: () => void;
  userRole?: 'store_manager' | 'college_admin' | 'super_admin' | 'central_store';
}

export const IndentDetailView = ({
  indent,
  onClose,
  onApprove,
  onReject,
  onPrepareDispatch,
  userRole,
}: IndentDetailViewProps) => {
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Map status to stepper steps
  const getSteps = (): StepperStep[] => {
    const steps: StepperStep[] = [
      {
        id: 'draft',
        title: 'Draft Created',
        icon: FileText,
        status: indent.status === 'draft' ? 'current' : 'completed',
        timestamp: new Date(indent.created_at).toLocaleString(),
        user: indent.requesting_store_manager_name || 'Store Manager',
      },
      {
        id: 'pending_college',
        title: 'Principal Approval',
        icon: UserCheck,
        status:
          indent.status === 'draft'
            ? 'upcoming'
            : indent.status === 'pending_college_approval'
            ? 'current'
            : indent.status === 'rejected_by_college'
            ? 'rejected'
            : 'completed',
        timestamp: indent.college_approved_at
          ? new Date(indent.college_approved_at).toLocaleString()
          : undefined,
        user: indent.college_admin_name,
        notes: indent.status === 'rejected_by_college' ? indent.rejection_reason : undefined,
      },
      {
        id: 'pending_super_admin',
        title: 'CEO Approval',
        icon: CheckCircle,
        status:
          ['draft', 'pending_college_approval', 'rejected_by_college'].includes(indent.status)
            ? 'upcoming'
            : indent.status === 'pending_super_admin'
            ? 'current'
            : indent.status === 'rejected_by_super_admin'
            ? 'rejected'
            : 'completed',
        timestamp: indent.super_admin_approved_at
          ? new Date(indent.super_admin_approved_at).toLocaleString()
          : undefined,
        user: indent.super_admin_name,
        notes: indent.status === 'rejected_by_super_admin' ? indent.rejection_reason : undefined,
      },
      {
        id: 'allocation',
        title: 'Stock Allocation',
        icon: Package,
        status:
          indent.status === 'super_admin_approved'
            ? 'current'
            : ['fulfilled', 'partially_fulfilled'].includes(indent.status)
            ? 'completed'
            : 'upcoming',
      },
      {
        id: 'dispatch',
        title: 'Dispatch',
        icon: Truck,
        status:
          indent.status === 'partially_fulfilled'
            ? 'current'
            : indent.status === 'fulfilled'
            ? 'completed'
            : 'upcoming',
      },
      {
        id: 'fulfilled',
        title: 'Fulfilled',
        icon: CheckCircle,
        status: indent.status === 'fulfilled' ? 'completed' : 'upcoming',
      },
    ];

    return steps;
  };

  // Determine actions based on status and role
  const getActions = (): { primary?: ActionBarAction; secondary: ActionBarAction[]; more: ActionBarAction[] } => {
    const actions: { primary?: ActionBarAction; secondary: ActionBarAction[]; more: ActionBarAction[] } = {
      secondary: [],
      more: [],
    };

    // Principal actions
    if (userRole === 'college_admin' && indent.status === 'pending_college_approval') {
      actions.primary = {
        label: 'Approve',
        icon: CheckCircle,
        onClick: async () => {
          if (onApprove) {
            setIsLoading(true);
            try {
              await onApprove();
            } finally {
              setIsLoading(false);
            }
          }
        },
        loading: isLoading,
      };
      actions.secondary.push({
        label: 'Reject',
        icon: XCircle,
        variant: 'destructive',
        onClick: () => setShowRejectForm(true),
      });
    }

    // CEO actions
    if (userRole === 'super_admin' && indent.status === 'pending_super_admin') {
      actions.primary = {
        label: 'Approve',
        icon: CheckCircle,
        onClick: async () => {
          if (onApprove) {
            setIsLoading(true);
            try {
              await onApprove();
            } finally {
              setIsLoading(false);
            }
          }
        },
        loading: isLoading,
      };
      actions.secondary.push({
        label: 'Reject',
        icon: XCircle,
        variant: 'destructive',
        onClick: () => setShowRejectForm(true),
      });
    }

    // Central Store actions
    if (userRole === 'central_store' && indent.status === 'super_admin_approved') {
      actions.primary = {
        label: 'Prepare Dispatch',
        icon: Truck,
        onClick: () => onPrepareDispatch && onPrepareDispatch(),
      };
    }

    // More actions (always available)


    return actions;
  };

  const steps = getSteps();
  const actions = getActions();

  const handleRejectSubmit = async () => {
    if (!rejectionReason.trim()) {
      toast.warning('Please provide a rejection reason');
      return;
    }

    if (onReject) {
      setIsLoading(true);
      try {
        await onReject(rejectionReason);
        setShowRejectForm(false);
        setRejectionReason('');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const getPriorityVariant = (priority: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
      low: 'secondary',
      medium: 'default',
      high: 'outline',
      urgent: 'destructive',
    };
    return variants[priority] || 'default';
  };

  return (
    <div className="flex flex-col h-full">
      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Stepper */}
          <div className="lg:w-1/3 xl:w-1/4">
            <Stepper steps={steps} orientation="vertical" />
          </div>

          {/* Details column */}
          <div className="flex-1 space-y-4">
            {/* Request Details */}
            <Card>
              <CardHeader>
                <CardTitle>Request Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Indent Number</Label>
                    <p className="font-semibold">{indent.indent_number}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Required By</Label>
                    <p className="font-semibold">
                      {new Date(indent.required_by_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Priority</Label>
                    <Badge variant={getPriorityVariant(indent.priority)} className="capitalize">
                      {indent.priority}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Status</Label>
                    <Badge className="capitalize">{indent.status.replace(/_/g, ' ')}</Badge>
                  </div>
                </div>

                <div>
                  <Label className="text-muted-foreground">College</Label>
                  <p>{indent.college_name || `College #${indent.college}`}</p>
                </div>

                <div>
                  <Label className="text-muted-foreground">Central Store</Label>
                  <p>{indent.central_store_name || `Store #${indent.central_store}`}</p>
                </div>

                <div>
                  <Label className="text-muted-foreground">Justification</Label>
                  <p className="text-sm">{indent.justification}</p>
                </div>

                {indent.remarks && (
                  <div>
                    <Label className="text-muted-foreground">Remarks</Label>
                    <p className="text-sm">{indent.remarks}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Items */}
            <Card>
              <CardHeader>
                <CardTitle>Items Requested ({indent.items?.length || 0})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded-md">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="p-2 text-left">#</th>
                        <th className="p-2 text-left">Item</th>
                        <th className="p-2 text-right">Requested</th>
                        <th className="p-2 text-right">Approved</th>
                        <th className="p-2 text-right">Issued</th>
                        <th className="p-2 text-right">Pending</th>
                        <th className="p-2 text-left">Unit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {indent.items?.map((item: any, index: number) => (
                        <tr key={index} className="border-t">
                          <td className="p-2">{index + 1}</td>
                          <td className="p-2">
                            <div>
                              <p className="font-medium">
                                {item.central_store_item_name ||
                                  item.store_item_name ||
                                  `Item #${item.central_store_item}`}
                              </p>
                              {item.justification && (
                                <p className="text-xs text-muted-foreground">{item.justification}</p>
                              )}
                            </div>
                          </td>
                          <td className="p-2 text-right">{item.requested_quantity}</td>
                          <td className="p-2 text-right">
                            {item.approved_quantity ?? item.requested_quantity ?? 0}
                          </td>
                          <td className="p-2 text-right">{item.issued_quantity ?? 0}</td>
                          <td className="p-2 text-right font-semibold">
                            {item.pending_quantity ?? Math.max(
                              (item.approved_quantity ?? item.requested_quantity ?? 0) -
                                (item.issued_quantity ?? 0),
                              0
                            )}
                          </td>
                          <td className="p-2">{item.unit || item.unit_name || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Rejection Form */}
            {showRejectForm && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2 mt-2">
                    <Label>Rejection Reason *</Label>
                    <Textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Enter reason for rejection..."
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <button
                        className="px-3 py-1 bg-destructive text-destructive-foreground rounded text-sm"
                        onClick={handleRejectSubmit}
                        disabled={isLoading}
                      >
                        {isLoading ? 'Rejecting...' : 'Confirm Reject'}
                      </button>
                      <button
                        className="px-3 py-1 bg-muted rounded text-sm"
                        onClick={() => {
                          setShowRejectForm(false);
                          setRejectionReason('');
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </div>

      {/* Smart Action Bar */}
      <SmartActionBar
        primaryAction={actions.primary}
        secondaryActions={actions.secondary}
        moreActions={actions.more}
        onClose={onClose}
      />
    </div>
  );
};
