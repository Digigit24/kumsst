/**
 * Unified Approvals Inbox - Single page for all approval types
 * Shows pending approvals across different modules (Indents, Requirements, GRN, etc.)
 */

import { CheckCircle, Clock, Eye } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader } from '../../components/ui/card';
import { Checkbox } from '../../components/ui/checkbox';
import { Dialog, DialogContent } from '../../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import {
  useCollegeAdminApprove,
  useCollegeAdminReject,
  usePendingCollegeApprovals,
  usePendingSuperAdminApprovals,
  useSuperAdminApprove,
  useSuperAdminReject,
} from '../../hooks/useStoreIndents';
import { getUserType } from '../../utils/permissions';
import { IndentDetailView } from './IndentDetailView';

export const UnifiedApprovalsPage = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [selectedIndent, setSelectedIndent] = useState<any>(null);
  const [filters, setFilters] = useState<Record<string, any>>({ page: 1, page_size: 50 });

  // Get current user's role to determine which approvals to fetch
  const userType = useMemo(() => getUserType(), []);
  const isCollegeAdmin = userType === 'college_admin';
  const isSuperAdmin = userType === 'super_admin';

  // College Admin hooks - conditionally enabled
  const collegeQuery = usePendingCollegeApprovals(filters);
  const {
    data: collegePendingData,
    isLoading: collegeLoading,
    refetch: refetchCollege,
  } = isCollegeAdmin ? collegeQuery : { data: null, isLoading: false, refetch: () => { } };
  const collegeApproveMutation = useCollegeAdminApprove();
  const collegeRejectMutation = useCollegeAdminReject();

  // CEO hooks - conditionally enabled
  const superAdminQuery = usePendingSuperAdminApprovals(filters);
  const {
    data: superAdminPendingData,
    isLoading: superAdminLoading,
    refetch: refetchSuperAdmin,
  } = isSuperAdmin ? superAdminQuery : { data: null, isLoading: false, refetch: () => { } };
  const superAdminApproveMutation = useSuperAdminApprove();
  const superAdminRejectMutation = useSuperAdminReject();

  // Show only the relevant approvals based on user role
  const pendingApprovals = useMemo(() => {
    const approvals: any[] = [];

    if (isCollegeAdmin && collegePendingData?.results) {
      approvals.push(
        ...collegePendingData.results.map((item: any) => ({
          ...item,
          approvalType: 'college',
        }))
      );
    }

    if (isSuperAdmin && superAdminPendingData?.results) {
      approvals.push(
        ...superAdminPendingData.results.map((item: any) => ({
          ...item,
          approvalType: 'super_admin',
        }))
      );
    }

    return approvals;
  }, [isCollegeAdmin, isSuperAdmin, collegePendingData, superAdminPendingData]);

  const isLoading = (isCollegeAdmin && collegeLoading) || (isSuperAdmin && superAdminLoading);

  const handleApprove = async (item: any, isBatch = false) => {
    try {
      if (item.approvalType === 'college') {
        await collegeApproveMutation.mutateAsync({ id: item.id, data: {} });
        toast.success('Indent approved and forwarded to CEO');
        refetchCollege();
      } else if (item.approvalType === 'super_admin') {
        await superAdminApproveMutation.mutateAsync({ id: item.id, data: {} });
        toast.success('Indent approved');
        refetchSuperAdmin();
      }

      if (isBatch) {
        setSelectedItems(prev => prev.filter(id => id !== item.id));
      }
    } catch (error: any) {
      toast.error(typeof error.message === 'string' ? error.message : 'Failed to approve');
    }
  };

  const handleReject = async (item: any, reason: string) => {
    try {
      if (item.approvalType === 'college') {
        await collegeRejectMutation.mutateAsync({ id: item.id, data: { rejection_reason: reason } });
        refetchCollege();
      } else if (item.approvalType === 'super_admin') {
        await superAdminRejectMutation.mutateAsync({ id: item.id, data: { rejection_reason: reason } });
        refetchSuperAdmin();
      }
      toast.success('Indent rejected');
    } catch (error: any) {
      toast.error(typeof error.message === 'string' ? error.message : 'Failed to reject');
    }
  };

  const handleBatchApprove = async () => {
    if (selectedItems.length === 0) {
      toast.error('Please select items to approve');
      return;
    }

    const itemsToApprove = pendingApprovals.filter(item => selectedItems.includes(item.id));

    for (const item of itemsToApprove) {
      await handleApprove(item, true);
    }

    setSelectedItems([]);
    toast.success(`${itemsToApprove.length} items approved`);
  };

  const handleSelectAll = () => {
    if (selectedItems.length === pendingApprovals.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(pendingApprovals.map(item => item.id));
    }
  };

  const toggleSelection = (id: number) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
    );
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

  const getWaitingTime = (createdAt: string) => {
    const hours = Math.floor(
      (new Date().getTime() - new Date(createdAt).getTime()) / (1000 * 60 * 60)
    );
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Approvals</h1>
          <p className="text-muted-foreground">Review and approve pending requests</p>
        </div>
        {selectedItems.length > 0 && (
          <div className="flex gap-2">
            <Badge variant="secondary">{selectedItems.length} selected</Badge>
            <Button onClick={handleBatchApprove}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve Selected
            </Button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending">
            Pending
            {pendingApprovals.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {pendingApprovals.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">Loading...</div>
          ) : pendingApprovals.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">All caught up!</h3>
                <p className="text-muted-foreground">No pending approvals at the moment.</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Batch actions bar */}
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <Checkbox
                  checked={selectedItems.length === pendingApprovals.length}
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-sm text-muted-foreground">Select All</span>
              </div>

              {/* Approval list */}
              <div className="space-y-3">
                {pendingApprovals.map((item: any) => (
                  <Card
                    key={item.id}
                    className="hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start gap-4">
                        {/* Checkbox */}
                        <Checkbox
                          checked={selectedItems.includes(item.id)}
                          onCheckedChange={() => toggleSelection(item.id)}
                          onClick={(e) => e.stopPropagation()}
                        />

                        {/* Content */}
                        <div
                          className="flex-1 grid grid-cols-12 gap-4"
                          onClick={() => setSelectedIndent(item)}
                        >
                          {/* Type & Number */}
                          <div className="col-span-3">
                            <Badge variant="outline" className="mb-2">
                              {item.approvalType === 'college' ? 'College' : 'CEO'}
                            </Badge>
                            <p className="font-semibold">{item.indent_number}</p>
                            <p className="text-xs text-muted-foreground">Store Indent</p>
                          </div>

                          {/* College/Requester */}
                          <div className="col-span-2">
                            <p className="text-xs text-muted-foreground">Requester</p>
                            <p className="text-sm font-medium">
                              {item.college_name || `College #${item.college}`}
                            </p>
                          </div>

                          {/* Priority */}
                          <div className="col-span-1">
                            <p className="text-xs text-muted-foreground mb-1">Priority</p>
                            <Badge variant={getPriorityVariant(item.priority)} className="capitalize">
                              {item.priority}
                            </Badge>
                          </div>

                          {/* Waiting time */}
                          <div className="col-span-1">
                            <p className="text-xs text-muted-foreground mb-1">Waiting</p>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <span className="text-sm font-semibold">
                                {getWaitingTime(item.created_at)}
                              </span>
                            </div>
                          </div>

                          {/* Justification preview */}
                          <div className="col-span-3">
                            <p className="text-xs text-muted-foreground mb-1">Justification</p>
                            <p className="text-sm truncate" title={item.justification}>
                              {item.justification}
                            </p>
                          </div>

                          {/* Actions */}
                          <div className="col-span-2 flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedIndent(item);
                              }}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              View
                            </Button>
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleApprove(item);
                              }}
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Approve
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="approved">
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              Approved items view to be implemented
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rejected">
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              Rejected items view to be implemented
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Detail View Dialog */}
      {selectedIndent && (
        <Dialog open={!!selectedIndent} onOpenChange={() => setSelectedIndent(null)}>
          <DialogContent className="sm:max-w-4xl max-w-[95vw] max-h-[90vh] p-0">
            <IndentDetailView
              indent={selectedIndent}
              onClose={() => setSelectedIndent(null)}
              onApprove={async () => {
                await handleApprove(selectedIndent);
                setSelectedIndent(null);
              }}
              onReject={async (reason) => {
                await handleReject(selectedIndent, reason);
                setSelectedIndent(null);
              }}
              userRole={
                selectedIndent.approvalType === 'college' ? 'college_admin' : 'super_admin'
              }
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
