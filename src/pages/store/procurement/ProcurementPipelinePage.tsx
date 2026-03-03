/**
 * Procurement Pipeline Page - Kanban view for Requirements through GRN
 * Shows procurement workflow: REQ → QUOT → PO → GRN → Posted
 */

import { useDebounce, DEBOUNCE_DELAYS } from '@/hooks/useDebounce';
import deliveryTruckGif from '@/assets/delivery-truck.gif';
import { useQueryClient } from '@tanstack/react-query';
import { DollarSign, Eye, FileText, Package, Plus, ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '../../../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import { Input } from '../../../components/ui/input';
import { KanbanBoard, KanbanCard, KanbanColumn } from '../../../components/workflow/KanbanBoard';
import { requirementKeys, useRequirements } from '../../../hooks/useProcurement';
import { approvalsApi } from '../../../services/approvals.service';
import { procurementRequirementsApi } from '../../../services/store.service';
import { ProcurementRequirement } from '../../../types/store.types';
import { CreateRequirementDialog } from './CreateRequirementDialog';
import { QuotationSelectionDialog } from './QuotationSelectionDialog';
import { RequirementDetailDialog } from './RequirementDetailDialog';

// Kanban columns for procurement workflow
const PROCUREMENT_COLUMNS: KanbanColumn[] = [

  {
    id: 'pending_approval',
    title: 'Pending Approval',
    status: 'pending_approval',
    color: 'bg-blue-100',
  },
  {
    id: 'approved',
    title: 'Approved',
    status: 'approved',
    color: 'bg-green-100',
  },
  {
    id: 'quotations',
    title: 'Quotations Received',
    status: 'quotations_received',
    color: 'bg-purple-100',
  },
  {
    id: 'po_created',
    title: 'PO Created',
    status: 'po_created',
    color: 'bg-yellow-100',
  },
  {
    id: 'fulfilled',
    title: 'Fulfilled / Cancelled',
    status: ['fulfilled', 'cancelled'],
    color: 'bg-emerald-100',
  },
];

export const ProcurementPipelinePage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, DEBOUNCE_DELAYS.SEARCH);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedRequirementId, setSelectedRequirementId] = useState<number | null>(null);
  const [showQuotationDialog, setShowQuotationDialog] = useState(false);
  const [quotationRequirementId, setQuotationRequirementId] = useState<number | null>(null);
  const [optimisticStatuses, setOptimisticStatuses] = useState<Record<number, string>>({});
  const [isExecuting, setIsExecuting] = useState(false);

  // Confirmation Dialog State
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    action: 'submit' | 'approve' | 'reject' | null;
    id: number | null;
    endpointFn: ((id: number, data?: any) => Promise<any>) | null;
  }>({
    isOpen: false,
    action: null,
    id: null,
    endpointFn: null,
  });

  const { data, isLoading, refetch } = useRequirements(filters);

  // Trigger confirmation dialog
  const handleStatusChange = (
    id: number,
    action: 'submit' | 'approve' | 'reject',
    endpointFn: ((id: number, data?: any) => Promise<any>) | null
  ) => {
    setConfirmState({
      isOpen: true,
      action,
      id,
      endpointFn,
    });
  };

  // Execute action after confirmation
  const executeStatusChange = async () => {
    const { id, action, endpointFn } = confirmState;
    if (!id) return;

    // Determine next status for optimistic move
    const nextStatus =
      action === 'submit'
        ? 'submitted'
        : action === 'approve'
          ? 'approved'
          : action === 'reject'
            ? 'cancelled'
            : undefined;

    // Optimistic move: update Kanban immediately and close dialog
    if (nextStatus) {
      setOptimisticStatuses((prev) => ({ ...prev, [id]: nextStatus }));
    }
    setIsExecuting(true);
    setConfirmState((prev) => ({ ...prev, isOpen: false }));

    try {
      if (endpointFn) {
        // Handle actions with direct endpoints (like submit)
        await endpointFn(id, {});
      } else if (action === 'approve' || action === 'reject') {
        // Handle actions requiring the Approvals API
        // First, fetch the latest requirement details to get the approval_request ID
        const detail = await procurementRequirementsApi.get(id);

        if (!detail?.approval_request) {
          // If no approval request ID, we can't use the generic approvals API.
          // Check if we can use the direct endpoint as a fallback (though typically direct logic is inside the service)
          // If we are here, it means we probably wanted to use the generic review endpoint.
          throw new Error("No active approval request found for this requirement. It may have been deleted or the requirement is not in a pending state.");
        }

        console.log(`Attempting to ${action} approval request #${detail.approval_request}`);

        try {
          await approvalsApi.review(detail.approval_request, { action });
        } catch (approvalError: any) {
          console.error("Approval API Error:", approvalError);
          if (approvalError.message?.includes("No ApprovalRequest matches")) {
            throw new Error(`The approval request (ID: ${detail.approval_request}) was not found in the system. Please verify the request status.`);
          }
          throw approvalError;
        }
      }

      // Add a small delay for backend signals to propagate
      await new Promise(resolve => setTimeout(resolve, 500));

      // Invalidate queries to ensure fresh data
      queryClient.invalidateQueries({ queryKey: requirementKeys.lists() });
      queryClient.invalidateQueries({ queryKey: requirementKeys.detail(id) });

      refetch();
      toast.success(`Requirement ${action}d successfully`);

    } catch (error: any) {
      console.error(`Error ${action}ing requirement:`, error);

      let errorMessage = `Failed to ${action} requirement.`;
      if (error && typeof error === 'object') {
        errorMessage += ` ${error.message || error.detail || JSON.stringify(error)}`;
      } else {
        errorMessage += ` ${String(error)}`;
      }
      toast.error(errorMessage);
      // Revert optimistic status on failure
      if (nextStatus) {
        setOptimisticStatuses((prev) => {
          const copy = { ...prev };
          delete copy[id];
          return copy;
        });
      }
    } finally {
      setIsExecuting(false);
      // Reset confirm state
      setConfirmState({ isOpen: false, action: null, id: null, endpointFn: null });
    }
  };

  // Convert requirements to Kanban cards
  const kanbanCards: KanbanCard[] = (data?.results || [])
    .filter((req: ProcurementRequirement) => {
      if (debouncedSearchTerm && !req.requirement_number.toLowerCase().includes(debouncedSearchTerm.toLowerCase())) {
        return false;
      }
      return true;
    })
    .map((req: ProcurementRequirement) => {
      const effectiveStatus = optimisticStatuses[req.id] ?? req.status;
      const card: KanbanCard = {
        id: req.id,
        status: effectiveStatus,
        title: req.requirement_number,
        subtitle: `Due: ${new Date(req.required_by_date).toLocaleDateString()}`,
        // ... (keep existing properties)
        badges: [
          {
            label: req.urgency,
            variant:
              req.urgency === 'urgent'
                ? 'destructive'
                : req.urgency === 'high'
                  ? 'outline'
                  : 'secondary',
          },
        ],
        indicators: [
          {
            icon: Package,
            label: `${req.items?.length || 0} items`,
            color: 'text-blue-500',
          },
          {
            icon: FileText,
            label: `Store #${req.central_store}`,
            color: 'text-muted-foreground',
          },
        ],
        onCardClick: () => setSelectedRequirementId(req.id),
        secondaryActions: [
          {
            label: 'View',
            icon: Eye,
            onClick: () => setSelectedRequirementId(req.id),
          },
        ],
      };

      // Add status-specific actions
      if (effectiveStatus === 'draft') {
        card.primaryAction = {
          label: 'Submit',
          onClick: () => {
            handleStatusChange(req.id, 'submit', procurementRequirementsApi.submitForApproval);
          },
        };
      } else if (effectiveStatus === 'submitted' || effectiveStatus === 'pending_approval') {
        card.primaryAction = {
          label: 'Approve',
          onClick: () => {
            handleStatusChange(req.id, 'approve', null);
          },
        };
        card.secondaryActions?.push({
          label: 'Reject',
          icon: FileText,
          onClick: () => {
            handleStatusChange(req.id, 'reject', null);
          }
        })
      } else if (effectiveStatus === 'approved') {
        card.primaryAction = {
          label: 'Add Quotations',
          onClick: () => setSelectedRequirementId(req.id),
        };
      } else if (effectiveStatus === 'quotations_received') {
        card.primaryAction = {
          label: 'Select & Create PO',
          onClick: () => {
            setQuotationRequirementId(req.id);
            setShowQuotationDialog(true);
          },
        };
      } else if (effectiveStatus === 'po_created') {
        card.primaryAction = {
          label: 'Receive Goods',
          onClick: () => setSelectedRequirementId(req.id),
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
            alt="Loading procurement pipeline..."
            className="w-64 h-64 object-contain"
          />
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Loading Procurement Pipeline...
          </h3>
          <p className="text-muted-foreground">
            Fetching requirements and workflow status
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
          <h1 className="text-3xl font-bold">Requirement Pipeline</h1>
          <p className="text-muted-foreground">
            Track requirements from submission to fulfillment
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Requirement
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Input
          placeholder="Search by requirement number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 dark:bg-blue-900/60 border border-blue-200 dark:border-blue-500 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <ShoppingCart className="h-5 w-5 text-blue-600 dark:text-blue-200 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900 dark:text-blue-50 mb-1">Procurement Workflow</h3>
            <ul className="text-sm text-blue-800 dark:text-blue-100 space-y-1">
              <li>
                • <strong>Draft → Submit:</strong> Create requirement and submit for approval
              </li>
              <li>
                • <strong>Approved → Quotations:</strong> Collect quotations from vendors
              </li>
              <li>
                • <strong>Select Quote → PO:</strong> Choose best quotation and create purchase order
              </li>
              <li>
                • <strong>PO → GRN:</strong> Receive goods and post to inventory
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <KanbanBoard columns={PROCUREMENT_COLUMNS} cards={kanbanCards} isLoading={isLoading} />

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4 mt-8">
        <div className="bg-muted/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-5 w-5 text-blue-500" />
            <h3 className="font-semibold">Requirements</h3>
          </div>
          <p className="text-3xl font-bold">{data?.results?.length || 0}</p>
        </div>
        <div className="bg-muted/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-5 w-5 text-purple-500" />
            <h3 className="font-semibold">Quotations</h3>
          </div>
          <p className="text-3xl font-bold">-</p>
          <p className="text-xs text-muted-foreground">To be calculated</p>
        </div>
        <div className="bg-muted/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <ShoppingCart className="h-5 w-5 text-green-500" />
            <h3 className="font-semibold">Purchase Orders</h3>
          </div>
          <p className="text-3xl font-bold">-</p>
          <p className="text-xs text-muted-foreground">To be calculated</p>
        </div>
        <div className="bg-muted/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Package className="h-5 w-5 text-emerald-500" />
            <h3 className="font-semibold">Goods Receipts</h3>
          </div>
          <p className="text-3xl font-bold">-</p>
          <p className="text-xs text-muted-foreground">To be calculated</p>
        </div>
      </div>

      {/* Create Requirement Dialog */}
      <CreateRequirementDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={() => {
          refetch();
          setIsCreateDialogOpen(false);
        }}
      />

      {/* Requirement Detail Dialog */}
      <RequirementDetailDialog
        open={!!selectedRequirementId}
        onOpenChange={(open) => !open && setSelectedRequirementId(null)}
        requirementId={selectedRequirementId}
        onSuccess={() => {
          refetch();
          setSelectedRequirementId(null);
        }}
      />

      {/* Quotation Selection Dialog */}
      <QuotationSelectionDialog
        open={showQuotationDialog}
        onOpenChange={setShowQuotationDialog}
        requirementId={quotationRequirementId}
        onSuccess={() => {
          refetch();
          setShowQuotationDialog(false);
          setQuotationRequirementId(null);
        }}
      />

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmState.isOpen}
        onOpenChange={(open) => !open && setConfirmState(prev => ({ ...prev, isOpen: false }))}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Action</DialogTitle>
            <DialogDescription>
              Are you sure you want to <strong>{confirmState.action}</strong> this requirement?
              {confirmState.action === 'reject' && (
                <span className="block mt-2 text-red-500">This action cannot be undone.</span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
            >
              Cancel
            </Button>
            <Button
              variant={confirmState.action === 'reject' ? 'destructive' : 'default'}
              onClick={executeStatusChange}
              disabled={isExecuting}
            >
              {isExecuting ? 'Processing...' : `Confirm ${confirmState.action && confirmState.action.charAt(0).toUpperCase() + confirmState.action.slice(1)}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
