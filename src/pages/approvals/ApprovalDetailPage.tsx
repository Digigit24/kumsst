/**
 * Approval Detail Page
 * Displays detailed information about an approval request
 * Shows approve/reject buttons only if user is an approver
 */

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useApproval, useReviewApproval } from '@/hooks/useApprovals';
import { format } from 'date-fns';
import { AlertCircle, ArrowLeft, CheckCircle2, Clock, FileText, User, XCircle } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'approved':
      return 'default';
    case 'rejected':
      return 'destructive';
    case 'pending':
      return 'secondary';
    default:
      return 'outline';
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'urgent':
      return 'destructive';
    case 'high':
      return 'default';
    case 'medium':
      return 'secondary';
    case 'low':
      return 'outline';
    default:
      return 'secondary';
  }
};

const getTypeLabel = (type: string) => {
  switch (type) {
    case 'fee_payment':
      return 'Fee Payment';
    case 'leave_request':
      return 'Leave Request';
    case 'document_request':
      return 'Document Request';
    case 'store_indent':
      return 'Store Indent';
    default:
      return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
};

export const ApprovalDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const approvalId = id ? parseInt(id) : 0;

  const { data: approval, isLoading, error } = useApproval(approvalId);
  const reviewMutation = useReviewApproval();

  const [comments, setComments] = useState('');
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  const handleApprove = async () => {
    try {
      await reviewMutation.mutateAsync({
        id: approvalId,
        data: { action: 'approve', comment: comments },
      });
      toast.success('Approval request approved successfully');
      setShowApproveDialog(false);
      navigate('/approvals/pending');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to approve request');
    }
  };

  const handleReject = async () => {
    if (!comments.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    try {
      await reviewMutation.mutateAsync({
        id: approvalId,
        data: { action: 'reject', comment: comments },
      });
      toast.success('Approval request rejected');
      setShowRejectDialog(false);
      navigate('/approvals/pending');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to reject request');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading approval details...</p>
        </div>
      </div>
    );
  }

  if (error || !approval) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p className="text-lg font-medium">Error loading approval details</p>
        <p className="text-sm text-muted-foreground">{error?.message || 'Approval not found'}</p>
        <Button variant="outline" onClick={() => navigate('/approvals/pending')}>
          Back to Approvals
        </Button>
      </div>
    );
  }

  const isUserApprover = approval.is_user_approver;
  const canReview = isUserApprover && approval.status === 'pending';

  // Debug logging
  console.log('Approval Debug:', {
    isUserApprover,
    status: approval.status,
    canReview,
    approvers: approval.approvers,
  });

  return (
    <div className="space-y-6">
      {/* Debug Info - Remove this after testing */}
      {!canReview && (
        <Card className="border-yellow-500 bg-yellow-50">
          <CardContent className="pt-6">
            <p className="text-sm text-yellow-800">
              <strong>Debug Info:</strong> Review buttons hidden.
              Status: {approval.status} |
              Is Approver: {isUserApprover ? 'Yes' : 'No'} |
              Can Review: {canReview ? 'Yes' : 'No'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-foreground">{approval.title}</h1>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <Badge variant={getStatusColor(approval.status)}>
              {approval.status}
            </Badge>
            <Badge variant={getPriorityColor(approval.priority)}>
              {approval.priority} priority
            </Badge>
            <Badge variant="outline">
              {getTypeLabel(approval.request_type)}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description Card */}
          <Card>
            <CardHeader>
              <CardTitle>Request Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Description</Label>
                <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                  {approval.description}
                </p>
              </div>

              {approval.metadata && Object.keys(approval.metadata).length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Additional Information</Label>
                  <div className="mt-2 space-y-2">
                    {Object.entries(approval.metadata).map(([key, value]) => (
                      <div key={key} className="flex gap-2 text-sm">
                        <span className="font-medium text-muted-foreground min-w-[120px]">
                          {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:
                        </span>
                        <span>{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Store Indent Details - Only shown for store_indent type */}
          {approval.request_type === 'store_indent' && approval.metadata && (
            <Card>
              <CardHeader>
                <CardTitle>Indent Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-xs text-muted-foreground">Indent Number</Label>
                    <p className="font-medium mt-1">
                      {typeof approval.metadata === 'string'
                        ? JSON.parse(approval.metadata).indent_number
                        : approval.metadata.indent_number}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Required By</Label>
                    <p className="mt-1">
                      {new Date(
                        typeof approval.metadata === 'string'
                          ? JSON.parse(approval.metadata).required_by_date
                          : approval.metadata.required_by_date
                      ).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Total Items</Label>
                    <p className="mt-1">
                      {typeof approval.metadata === 'string'
                        ? JSON.parse(approval.metadata).total_items
                        : approval.metadata.total_items}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-2"
                  onClick={() => navigate('/store/indents')}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  View Full Indent Details
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Review Section - Shows for pending approvals */}
          {approval.status === 'pending' && (
            <Card>
              <CardHeader>
                <CardTitle>Review Request</CardTitle>
                {!isUserApprover && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Note: You may not be listed as an approver, but you can still review this request.
                  </p>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="comments">Comments</Label>
                  <Textarea
                    id="comments"
                    placeholder="Add your comments (required for rejection)"
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    rows={4}
                    className="mt-1"
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => setShowApproveDialog(true)}
                    disabled={reviewMutation.isPending}
                    className="flex-1"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => setShowRejectDialog(true)}
                    disabled={reviewMutation.isPending}
                    className="flex-1"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Review History - Only shown if already reviewed */}
          {approval.status !== 'pending' && approval.review_comments && (
            <Card>
              <CardHeader>
                <CardTitle>Review Decision</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  {approval.status === 'approved' ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  <span className="font-medium">
                    {approval.status === 'approved' ? 'Approved' : 'Rejected'}
                  </span>
                  {approval.reviewer_name && (
                    <span className="text-sm text-muted-foreground">
                      by {approval.reviewer_name}
                    </span>
                  )}
                </div>
                {approval.reviewed_at && (
                  <p className="text-sm text-muted-foreground">
                    on {format(new Date(approval.reviewed_at), 'PPpp')}
                  </p>
                )}
                <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">{approval.review_comments}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Request Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Request Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <Label className="text-xs text-muted-foreground">Requester</Label>
                <div className="flex items-center gap-2 mt-1">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{approval.requester_name || `User #${approval.requester}`}</span>
                </div>
                {approval.requester_email && (
                  <p className="text-xs text-muted-foreground ml-6">{approval.requester_email}</p>
                )}
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Created</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{format(new Date(approval.created_at), 'PPpp')}</span>
                </div>
              </div>

              {approval.updated_at !== approval.created_at && (
                <div>
                  <Label className="text-xs text-muted-foreground">Last Updated</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{format(new Date(approval.updated_at), 'PPpp')}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Approvers Card */}
          {approval.approvers && approval.approvers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Approvers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {approval.approvers.map((approver) => (
                    <div key={approver.id} className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p>{approver.name}</p>
                        {approver.email && (
                          <p className="text-xs text-muted-foreground">{approver.email}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Approve Dialog */}
      <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Request?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to approve this request? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleApprove} disabled={reviewMutation.isPending}>
              {reviewMutation.isPending ? 'Approving...' : 'Approve'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Dialog */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Request?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject this request? Please ensure you've provided a reason in the comments field.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReject}
              disabled={reviewMutation.isPending || !comments.trim()}
              className="bg-destructive hover:bg-destructive/90"
            >
              {reviewMutation.isPending ? 'Rejecting...' : 'Reject'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ApprovalDetailPage;
