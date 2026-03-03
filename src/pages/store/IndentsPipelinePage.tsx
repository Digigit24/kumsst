/**
 * Indents Pipeline Page - Kanban view for Store Indents
 * Shows indents organized by status columns
 */

import { useDebounce, DEBOUNCE_DELAYS } from '@/hooks/useDebounce';
import deliveryTruckGif from '@/assets/delivery-truck.gif';
import { AlertCircle, Eye, Package, Plus, XCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { KanbanBoard, KanbanCard, KanbanColumn } from '../../components/workflow/KanbanBoard';
import { useAuth } from '../../hooks/useAuth';
import { useMaterialIssues } from '../../hooks/useMaterialIssues';
import {
  useCollegeAdminApprove,
  useCollegeAdminReject,
  useCreateStoreIndent, useStoreIndent, useStoreIndents,
  useSubmitStoreIndent,
  useSuperAdminApprove,
  useSuperAdminReject
} from '../../hooks/useStoreIndents';
import { isSuperAdmin } from '../../utils/auth.utils';
import { StoreIndentPipeline } from './forms/StoreIndentPipeline';
import { IndentDetailView } from './IndentDetailView';
import { PrepareDispatchDialog } from './PrepareDispatchDialog';

// Kanban columns matching indent statuses
const KANBAN_COLUMNS: KanbanColumn[] = [
  {
    id: 'draft',
    title: 'Draft',
    status: 'draft',
    color: 'bg-slate-100',
  },
  {
    id: 'pending_college',
    title: 'Principal Approval',
    status: ['submitted', 'pending_college_approval'],
    color: 'bg-blue-100',
  },
  {
    id: 'pending_super_admin',
    title: 'CEO Approval',
    status: ['college_approved', 'pending_super_admin'],
    color: 'bg-purple-100',
  },
  {
    id: 'approved',
    title: 'Approved',
    status: ['approved', 'super_admin_approved'], // Support both for backward compatibility
    color: 'bg-green-100',
  },
  {
    id: 'partially_fulfilled',
    title: 'Partial',
    status: 'partially_fulfilled',
    color: 'bg-yellow-100',
  },
  {
    id: 'fulfilled',
    title: 'Fulfilled',
    status: 'fulfilled',
    color: 'bg-emerald-100',
  },
  {
    id: 'rejected',
    title: 'Rejected / Cancelled',
    status: ['rejected', 'rejected_by_college', 'rejected_by_super_admin', 'cancelled'],
    color: 'bg-red-100',
  },
];

export const IndentsPipelinePage = () => {
  const { user } = useAuth();
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedIndentId, setSelectedIndentId] = useState<number | null>(null);
  const [dispatchIndentId, setDispatchIndentId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, DEBOUNCE_DELAYS.SEARCH);
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  // Fetch all indents (no default filters) to populate all pipeline columns
  const { data, isLoading, refetch } = useStoreIndents({});
  // const { data, isLoading, refetch } = useStoreIndents(filters); // Previous: bound to filters state
  const createMutation = useCreateStoreIndent();
  const submitMutation = useSubmitStoreIndent();
  const collegeApproveMutation = useCollegeAdminApprove();
  const collegeRejectMutation = useCollegeAdminReject();
  const superAdminApproveMutation = useSuperAdminApprove();
  const superAdminRejectMutation = useSuperAdminReject();
  const { data: selectedIndentData, isLoading: isDetailLoading } = useStoreIndent(selectedIndentId || 0);

  const userRoleForDetail = useMemo(() => {
    switch (user?.user_type) {
      case 'college_admin':
        return 'college_admin';
      case 'super_admin':
        return 'super_admin';
      case 'central_manager':
        return 'central_store';
      default:
        return 'store_manager';
    }
  }, [user]);

  const handleCreate = () => {
    setIsCreateDialogOpen(true);
  };

  const handleSubmitNew = async (data: any) => {
    try {
      await createMutation.mutateAsync(data);
      toast.success('Indent created successfully');
      setIsCreateDialogOpen(false);
      refetch();
    } catch (error: any) {
      console.error("Create indent failed:", error);
      if (error.response?.data) {
        const serverErrors = error.response.data;
        const errorMessages = Object.entries(serverErrors)
          .map(([field, msgs]) => {
            const msgText = Array.isArray(msgs) ? msgs.join(', ') : String(msgs);
            // Capitalize field name and replace underscores
            const formattedField = field.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
            return `${formattedField}: ${msgText}`;
          });

        // Show up to 3 errors to avoid huge toasts
        const displayMessage = errorMessages.length > 3
          ? errorMessages.slice(0, 3).join('\n') + `\n...and ${errorMessages.length - 3} more errors`
          : errorMessages.join('\n');

        toast.error(displayMessage || 'Validation failed');
      } else {
        toast.error(typeof error.message === 'string' ? error.message : 'Failed to create indent');
      }
    }
  };

  const handleSubmitIndent = async (indent: any) => {
    try {
      await submitMutation.mutateAsync({ id: indent.id, data: {} });
      toast.success('Indent submitted for college admin approval');
      refetch();
    } catch (error: any) {
      toast.error(typeof error.message === 'string' ? error.message : 'Failed to submit indent');
    }
  };

  const handleApprove = async (indent: any) => {
    try {
      if (indent.status === 'pending_college_approval') {
        await collegeApproveMutation.mutateAsync({ id: indent.id, data: {} });
        toast.success('Indent approved and forwarded to CEO');
      } else if (indent.status === 'pending_super_admin') {
        await superAdminApproveMutation.mutateAsync({ id: indent.id, data: {} });
        toast.success('Indent approved');
      }
      refetch();
    } catch (error: any) {
      toast.error(typeof error.message === 'string' ? error.message : 'Failed to approve indent');
    }
  };

  const handleReject = async (indent: any, reason?: string) => {
    const rejectionReason = reason ?? prompt('Please provide a rejection reason:');
    if (!rejectionReason) return;

    try {
      if (indent.status === 'pending_college_approval') {
        await collegeRejectMutation.mutateAsync({ id: indent.id, data: { rejection_reason: rejectionReason } });
      } else if (indent.status === 'pending_super_admin') {
        await superAdminRejectMutation.mutateAsync({ id: indent.id, data: { rejection_reason: rejectionReason } });
      }
      toast.success('Indent rejected');
      refetch();
    } catch (error: any) {
      toast.error(typeof error.message === 'string' ? error.message : 'Failed to reject indent');
    }
  };

  // Get stock availability color
  const getStockIndicator = (indent: any) => {
    // This would be calculated based on items availability
    // For now, return a placeholder
    return {
      icon: Package,
      label: `${indent.items?.length || 0} items`,
      color: 'text-blue-500',
    };
  };

  // Fetch material issues to check statuses
  const { data: materialIssues } = useMaterialIssues({});

  const indentStatusMap = useMemo(() => {
    const map = new Map<number, string>();
    if (materialIssues?.results) {
      materialIssues.results.forEach((min: any) => {
        if (min.indent) {
          map.set(min.indent, min.status);
        }
      });
    }
    return map;
  }, [materialIssues]);

  // Convert indents to Kanban cards
  const kanbanCards: KanbanCard[] = (data?.results || [])
    .filter((indent: any) => {
      // Apply search filter
      if (debouncedSearchTerm && !indent.indent_number.toLowerCase().includes(debouncedSearchTerm.toLowerCase())) {
        return false;
      }
      // Apply priority filter
      if (priorityFilter !== 'all' && indent.priority !== priorityFilter) {
        return false;
      }
      return true;
    })
    .map((indent: any) => {
      const card: KanbanCard = {
        id: indent.id,
        status: indent.status,
        title: indent.indent_number,
        subtitle: `Due: ${new Date(indent.required_by_date).toLocaleDateString()}`,
        badges: [
          {
            label: indent.priority,
            variant:
              indent.priority === 'urgent'
                ? 'destructive'
                : indent.priority === 'high'
                  ? 'outline'
                  : 'secondary',
          },
        ],
        indicators: [
          getStockIndicator(indent),
          {
            icon: AlertCircle,
            label: indent.college_name || `College #${indent.college}`,
            color: 'text-muted-foreground',
          },
        ],
        onCardClick: () => setSelectedIndentId(indent.id),
      };

      // Add status-specific actions
      if (indent.status === 'draft') {
        card.primaryAction = {
          label: 'Submit',
          onClick: () => handleSubmitIndent(indent),
        };
        card.secondaryActions = [
          {
            label: 'View',
            icon: Eye,
            onClick: () => setSelectedIndentId(indent.id),
          },
        ];
      } else if (indent.status === 'pending_college_approval') {
        const canApprove = user?.user_type === 'college_admin' || isSuperAdmin(user);

        card.primaryAction = {
          label: canApprove ? 'Approve' : 'Waiting for Approval',
          onClick: canApprove ? () => handleApprove(indent) : () => { },
          disabled: !canApprove,
        };

        // Only show reject if they can approve
        if (canApprove) {
          card.secondaryActions = [
            {
              label: 'Reject',
              icon: XCircle,
              onClick: () => handleReject(indent),
            },
          ];
        }
      } else if (indent.status === 'pending_super_admin') {
        const canApprove = isSuperAdmin(user);

        card.primaryAction = {
          label: canApprove ? 'Approve' : 'Waiting for Approval',
          onClick: canApprove ? () => handleApprove(indent) : () => { },
          disabled: !canApprove,
        };

        // Only show reject if they can approve
        if (canApprove) {
          card.secondaryActions = [
            {
              label: 'Reject',
              icon: XCircle,
              onClick: () => handleReject(indent),
            },
          ];
        }
      } else if (indent.status === 'super_admin_approved' || indent.status === 'approved') {
        const canPrepareMIN = user?.user_type === 'central_manager' || isSuperAdmin(user);
        const existingMinStatus = indentStatusMap.get(indent.id);

        let actionLabel = 'Prepare MIN';
        let isActionDisabled = !canPrepareMIN;
        let onActionClick = canPrepareMIN ? () => {
          // Open the prepare dispatch dialog
          setDispatchIndentId(indent.id);
        } : () => { };

        if (existingMinStatus === 'prepared') {
          actionLabel = 'Prepared';
          isActionDisabled = true; // Disable if already prepared
          onActionClick = () => { };
        } else if (existingMinStatus === 'dispatched') {
          actionLabel = 'Dispatched';
          isActionDisabled = true;
          onActionClick = () => { };
        } else if (existingMinStatus === 'in_transit') {
          actionLabel = 'In Transit';
          isActionDisabled = true;
          onActionClick = () => { };
        }

        card.primaryAction = {
          label: actionLabel,
          disabled: isActionDisabled,
          onClick: onActionClick,
        };
      }

      return card;
    });

  // Custom loading screen with delivery truck animation
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-6">
        <div className="relative">
          <img
            src={deliveryTruckGif}
            alt="Loading indents..."
            className="w-64 h-64 object-contain"
          />
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Loading Indent Pipeline...
          </h3>
          <p className="text-muted-foreground">
            Tracking your indent requests across the supply chain
          </p>
        </div>
        <div className="flex gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Store Indents</h1>
          <p className="text-muted-foreground">Track indent requests through the approval pipeline</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Create Indent
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Input
          placeholder="Search by indent number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Kanban Board */}
      <KanbanBoard columns={KANBAN_COLUMNS} cards={kanbanCards} isLoading={isLoading} />

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Indent</DialogTitle>
          </DialogHeader>
          <StoreIndentPipeline
            onSubmit={handleSubmitNew}
            onCancel={() => setIsCreateDialogOpen(false)}
            isSubmitting={createMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Detail View Dialog - To be implemented */}
      {selectedIndentId && (
        <Dialog open={!!selectedIndentId} onOpenChange={() => setSelectedIndentId(null)}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto p-0">
            {isDetailLoading || !selectedIndentData ? (
              <div className="p-6 text-sm text-muted-foreground">Loading indent details...</div>
            ) : (
              <IndentDetailView
                indent={selectedIndentData}
                onClose={() => setSelectedIndentId(null)}
                onApprove={() => handleApprove(selectedIndentData)}
                onReject={(reason) => handleReject(selectedIndentData, reason)}
                onPrepareDispatch={() => setDispatchIndentId(selectedIndentData.id)}
                userRole={userRoleForDetail as any}
              />
            )}
          </DialogContent>
        </Dialog>
      )}

      {/* Prepare Dispatch Dialog */}
      <PrepareDispatchDialog
        open={!!dispatchIndentId}
        onOpenChange={(open) => !open && setDispatchIndentId(null)}
        indentId={dispatchIndentId}
        onSuccess={() => {
          setDispatchIndentId(null);
          refetch();
        }}
      />
    </div>
  );
};
