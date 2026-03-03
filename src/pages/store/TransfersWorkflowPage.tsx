/**
 * Transfers/MIN Workflow Page - Dispatch workflow for Material Issue Notes
 * Shows fulfillment queue and dispatch tracking
 */

import { DROPDOWN_PAGE_SIZE } from '@/config/app.config';
import { useDebounce, DEBOUNCE_DELAYS } from '@/hooks/useDebounce';
import deliveryTruckGif from '@/assets/delivery-truck.gif';
import { CheckCircle, Eye, FileText, Package, Plus, Truck, XCircle } from 'lucide-react';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { KanbanBoard, KanbanCard, KanbanColumn } from '../../components/workflow/KanbanBoard';
import { useAuth } from '../../hooks/useAuth';
import {
  useConfirmReceipt,
  useCreateMaterialIssue,
  useDispatchMaterialIssue,
  useMaterialIssues,
  usePatchMaterialIssue,
} from '../../hooks/useMaterialIssues';
import { useStoreIndents } from '../../hooks/useStoreIndents';
import { MaterialIssueForm } from './forms/MaterialIssueForm';
import { PrepareDispatchDialog } from './PrepareDispatchDialog';

// Kanban columns for MIN statuses
const MIN_COLUMNS: KanbanColumn[] = [
  {
    id: 'prepared',
    title: 'Prepared',
    status: 'prepared',
    color: 'bg-blue-100',
  },
  {
    id: 'dispatched',
    title: 'Dispatched',
    status: 'dispatched',
    color: 'bg-purple-100',
  },
  {
    id: 'in_transit',
    title: 'In Transit',
    status: 'in_transit',
    color: 'bg-yellow-100',
  },
  {
    id: 'received',
    title: 'Received',
    status: 'received',
    color: 'bg-green-100',
  },
];

export const TransfersWorkflowPage = () => {
  const navigate = useNavigate();

  const location = useLocation();
  const newMinId = location.state?.newMinId;

  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, DEBOUNCE_DELAYS.SEARCH);
  const [dispatchIndentId, setDispatchIndentId] = useState<number | null>(null);
  const [confirmingId, setConfirmingId] = useState<number | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<any | null>(null);

  // Fetch all material issues for the Kanban board (Prepared, Dispatched, etc.)
  const { data, isLoading, refetch } = useMaterialIssues({
    ordering: '-created_at',
    page_size: DROPDOWN_PAGE_SIZE
  });

  const { data: approvedIndentsData, refetch: refetchIndents } = useStoreIndents({
    status: 'super_admin_approved'
  });
  const dispatchMutation = useDispatchMaterialIssue();
  const confirmReceiptMutation = useConfirmReceipt();
  const createMutation = useCreateMaterialIssue();
  const patchMutation = usePatchMaterialIssue();
  const [notePrompt, setNotePrompt] = useState<{
    open: boolean;
    title: string;
    placeholder: string;
  }>({
    open: false,
    title: '',
    placeholder: '',
  });
  const [pendingAction, setPendingAction] = useState<{
    type: 'dispatch' | 'transit' | 'reject' | 'confirm';
    min: any;
  } | null>(null);
  const [noteValue, setNoteValue] = useState('');

  const openNotePrompt = (
    type: 'dispatch' | 'transit' | 'reject' | 'confirm',
    min: any,
    title: string,
    placeholder: string,
    defaultValue = ''
  ) => {
    setPendingAction({ type, min });
    setNotePrompt({
      open: true,
      title,
      placeholder,
    });
    setNoteValue(defaultValue);
  };

  const handleNoteCancel = () => {
    setNotePrompt((prev) => ({ ...prev, open: false }));
    setPendingAction(null);
    setNoteValue('');
  };

  const runDispatch = async (min: any, notes: string) => {
    try {
      await dispatchMutation.mutateAsync({
        id: min.id,
        data: {
          internal_notes: notes || null,
        },
      });
      toast.success('Material dispatched successfully');
      refetch();
    } catch (error: any) {
      const detailItems = error?.response?.data?.detail?.items || error?.detail?.items;
      if (Array.isArray(detailItems) && detailItems.length > 0) {
        toast.warning(detailItems.join(', '));
      } else {
        toast.error(error?.message || 'Failed to dispatch');
      }
    }
  };

  const runStartTransit = async (min: any, notes: string) => {
    try {
      await patchMutation.mutateAsync({
        id: min.id,
        data: {
          status: 'in_transit',
          internal_notes: notes || null,
        },
      });
      toast.success('Transit started successfully');
      refetch();
    } catch (error: any) {
      const detailItems = error?.response?.data?.detail?.items || error?.detail?.items;
      if (Array.isArray(detailItems) && detailItems.length > 0) {
        toast.warning(detailItems.join(', '));
      } else {
        toast.error(error?.message || 'Failed to start transit');
      }
    }
  };

  const runRejectTransit = async (min: any, notes: string) => {
    try {
      await patchMutation.mutateAsync({
        id: min.id,
        data: {
          status: 'prepared',
          notes: notes || null,
        },
      });
      toast.success('Shipment marked as returned. It can be re-dispatched after review.');
      refetch();
    } catch (error: any) {
      const detailItems = error?.response?.data?.detail?.items || error?.detail?.items;
      if (Array.isArray(detailItems) && detailItems.length > 0) {
        toast.warning(detailItems.join(', '));
      } else {
        toast.error(error?.message || 'Failed to mark as returned');
      }
    }
  };

  const runConfirmReceipt = async (min: any, notes: string) => {
    if (confirmingId) return;

    try {
      setConfirmingId(min.id);
      await confirmReceiptMutation.mutateAsync({
        id: min.id,
        data: {
          notes,
        },
      });
      toast.success('Receipt confirmed successfully');
      refetch();
    } catch (error: any) {
      const detailItems = error?.response?.data?.detail?.items || error?.detail?.items;
      if (Array.isArray(detailItems) && detailItems.length > 0) {
        toast.warning(detailItems.join(', '));
      } else {
        toast.error(error?.message || 'Failed to confirm receipt');
      }
    } finally {
      setConfirmingId(null);
    }
  };

  const handleNoteSave = async () => {
    if (!pendingAction) return;
    const notes = noteValue;
    const { type, min } = pendingAction;

    // Close dialog immediately for better UX
    handleNoteCancel();

    // Perform API call in background
    // Since we rely on mutation status for UI disabled states, this should work "optimistically" from a UX perspective
    try {
      if (type === 'dispatch') {
        await runDispatch(min, notes);
      } else if (type === 'transit') {
        await runStartTransit(min, notes);
      } else if (type === 'reject') {
        await runRejectTransit(min, notes);
      } else if (type === 'confirm') {
        const finalNotes = notes || 'Confirmed by college store';
        await runConfirmReceipt(min, finalNotes);
      }
    } catch (error) {
      // Error handling is done in run* functions
      console.error(error);
    }
  };

  const handleCreate = () => {
    setIsCreateDialogOpen(true);
  };

  const handleSubmitNew = async (data: any) => {
    try {
      await createMutation.mutateAsync(data);
      toast.success('Material Issue created successfully');
      setIsCreateDialogOpen(false);
      refetch();
    } catch (error: any) {
      toast.error(typeof error.message === 'string' ? error.message : 'Failed to create Material Issue');
    }
  };

  const handleDispatch = async (min: any) => {
    openNotePrompt('dispatch', min, 'Dispatch Notes (optional)', 'Enter dispatch notes...', min.internal_notes || '');
  };

  const handleStartTransit = async (min: any) => {
    openNotePrompt('transit', min, 'Transit Notes (optional)', 'Enter transit notes...', min.internal_notes || '');
  };

  const handleRejectTransit = async (min: any) => {
    openNotePrompt('reject', min, 'Reason for rejection/return', 'Enter reason...', 'Returned by receiver');
  };

  const handleConfirmReceipt = async (min: any) => {
    if (confirmingId) return; // Prevent multiple clicks
    openNotePrompt('confirm', min, 'Receipt confirmation notes', 'Enter notes...', 'Confirmed by college store');
  };

  const { user } = useAuth();

  // Restricted users (Store Managers & College Admins) cannot Dispatch or Mark In Transit
  // They can only Confirm Receipt
  const isRestrictedUser = ['store_manager', 'college_admin'].includes(user?.user_type || '');

  // Convert MINs to Kanban cards
  const kanbanCards: KanbanCard[] = [];

  // Add real cards
  (data?.results || [])
    .forEach((min: any) => {
      if (debouncedSearchTerm && !min.min_number.toLowerCase().includes(debouncedSearchTerm.toLowerCase())) {
        return;
      }

      const isIsNew = newMinId && min.id === newMinId;

      const isDispatching = dispatchMutation.isPending && dispatchMutation.variables?.id === min.id;
      const isConfirming = confirmReceiptMutation.isPending && confirmReceiptMutation.variables?.id === min.id;
      const isStartingTransit = patchMutation.isPending && patchMutation.variables?.id === min.id && patchMutation.variables?.data?.status === 'in_transit';
      const isRejectingTransit = patchMutation.isPending && patchMutation.variables?.id === min.id && patchMutation.variables?.data?.status === 'prepared';

      const isActionPending = isDispatching || isConfirming || isStartingTransit || isRejectingTransit;

      const card: KanbanCard = {
        id: min.id,
        status: min.status,
        title: min.min_number,
        subtitle: `Issued: ${new Date(min.issue_date).toLocaleDateString()}${min.indent_number ? ` • Indent #${min.indent_number}` : ''}`,
        badges: [
          {
            label: min.receiving_college_name || `College #${min.receiving_college}`,
            variant: 'secondary',
          },
          ...(isIsNew ? [{ label: 'New', variant: 'default' } as const] : [])
        ],
        indicators: [
          {
            icon: Package,
            label: `${min.items?.length || 0} items`,
            color: 'text-blue-500',
          },
          ...(min.indent_number ? [{
            icon: FileText,
            label: `Indent #${min.indent_number}`,
            color: 'text-muted-foreground',
          }] : []),
          {
            icon: FileText,
            label: min.central_store_name || `Store #${min.central_store}`,
            color: 'text-muted-foreground',
          },
        ],
        secondaryActions: [
          {
            label: 'View',
            icon: Eye,
            onClick: () => setSelectedIssue(min),
          },
        ],
      };

      // Add status-specific primary actions
      if (min.status === 'prepared') {
        if (isRestrictedUser) {
          card.primaryAction = {
            label: 'Waiting for Dispatch',
            disabled: true,
            variant: 'secondary',
            onClick: () => { },
          };
        } else {
          card.primaryAction = {
            label: 'Dispatch',
            onClick: () => handleDispatch(min),
            loading: isDispatching,
            disabled: isActionPending
          };
        }
      } else if (min.status === 'dispatched') {
        if (isRestrictedUser) {
          card.primaryAction = {
            label: 'Waiting for Transit',
            disabled: true,
            variant: 'secondary',
            onClick: () => { },
          };
        } else {
          card.primaryAction = {
            label: 'Mark In Transit',
            onClick: () => handleStartTransit(min),
            loading: isStartingTransit,
            disabled: isActionPending
          };
        }
      } else if (min.status === 'in_transit') {
        card.primaryAction = {
          label: 'Confirm Receipt',
          onClick: () => handleConfirmReceipt(min),
          loading: isConfirming,
          disabled: isActionPending,
        };

        // Only allow rejection if authorized
        card.secondaryActions = [
          {
            label: isRejectingTransit ? 'Returning...' : 'Reject / Return',
            icon: XCircle,
            onClick: () => handleRejectTransit(min),
            variant: 'destructive',
          },
          ...(card.secondaryActions || []),
        ];
      }

      kanbanCards.push(card);
    });

  // Add Shimmer Card for New MIN if not yet loaded
  if (newMinId && !data?.results?.find((m: any) => m.id === newMinId)) {
    kanbanCards.unshift({
      id: 'loading-new-min',
      status: 'prepared', // Assume new ones are prepared
      title: 'Creating Issue Note...',
      subtitle: 'Please wait...',
      // We can use a custom render or just push a card that looks loaded
      // Since KanbanCard doesn't support custom content easily, let's make it look like a skeleton using what we have
      badges: [{ label: 'Processing', variant: 'outline' }],
      indicators: [],
      primaryAction: {
        label: 'Loading...',
        disabled: true,
        loading: true,
        onClick: () => { }
      }
    });
  }

  // Custom loading screen with delivery truck animation
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-6">
        <div className="relative">
          <img
            src={deliveryTruckGif}
            alt="Loading material transfers..."
            className="w-64 h-64 object-contain"
          />
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Loading Material Transfers...
          </h3>
          <p className="text-muted-foreground">
            Fetching dispatch queue and tracking info
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
          <h1 className="text-3xl font-bold">Material Transfers</h1>
          <p className="text-muted-foreground">
            Track material issue notes from central stores to colleges
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Create Material Issue
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Input
          placeholder="Search by MIN number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Info Card for Central Store Managers */}
      <div className="bg-blue-50 dark:bg-blue-900/60 border border-blue-200 dark:border-blue-500 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Truck className="h-5 w-5 text-blue-600 dark:text-blue-200 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900 dark:text-blue-50 mb-1">Dispatch Workflow</h3>
            <ul className="text-sm text-blue-800 dark:text-blue-100 space-y-1">
              <li>• <strong>Prepared:</strong> MIN is ready. Click "Dispatch" to send.</li>
              <li>• <strong>Dispatched:</strong> Material left the store. Click "Mark In Transit" when vehicle leaves.</li>
              <li>• <strong>In Transit:</strong> Material is on the way to the college.</li>
              <li>• <strong>Received:</strong> College has confirmed receipt of the material.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <KanbanBoard columns={MIN_COLUMNS} cards={kanbanCards} isLoading={isLoading} />

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-4xl max-w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Material Issue Note</DialogTitle>
          </DialogHeader>
          <MaterialIssueForm
            onSubmit={handleSubmitNew}
            onCancel={() => setIsCreateDialogOpen(false)}
            isSubmitting={createMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Fulfillment Queue Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">Fulfillment Queue</h2>
        <p className="text-muted-foreground mb-4">
          Approved indents ready to be fulfilled and dispatched
        </p>
        {approvedIndentsData?.results && approvedIndentsData.results.length > 0 ? (
          <div className="space-y-3">
            {approvedIndentsData.results.map((indent: any) => (
              <Card key={indent.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="grid grid-cols-12 gap-4 items-center">
                    {/* Indent Info */}
                    <div className="col-span-3">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded">
                          <FileText className="h-5 w-5 text-blue-600 dark:text-blue-200" />
                        </div>
                        <div>
                          <p className="font-semibold">{indent.indent_number}</p>
                          <p className="text-sm text-muted-foreground">
                            {indent.college_name || `College #${indent.college}`}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Priority */}
                    <div className="col-span-2">
                      <p className="text-xs text-muted-foreground mb-1">Priority</p>
                      <Badge
                        variant={
                          indent.priority === 'urgent'
                            ? 'destructive'
                            : indent.priority === 'high'
                              ? 'outline'
                              : 'secondary'
                        }
                        className="capitalize"
                      >
                        {indent.priority}
                      </Badge>
                    </div>

                    {/* Items Count */}
                    <div className="col-span-2">
                      <p className="text-xs text-muted-foreground mb-1">Items</p>
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-blue-500" />
                        <span className="font-semibold">{indent.items?.length || 0}</span>
                      </div>
                    </div>

                    {/* Required By */}
                    <div className="col-span-2">
                      <p className="text-xs text-muted-foreground mb-1">Required By</p>
                      <p className="text-sm">
                        {new Date(indent.required_by_date).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="col-span-3 flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedIssue(indent)}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => setDispatchIndentId(indent.id)}
                      >
                        <Truck className="h-3 w-3 mr-1" />
                        Prepare Dispatch
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="bg-muted/30 rounded-lg p-8 text-center">
            <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
            <p className="text-muted-foreground">
              No approved indents pending fulfillment
              <br />
              All indents have been processed
            </p>
          </div>
        )}
      </div>

      {/* Prepare Dispatch Dialog */}
      <PrepareDispatchDialog
        open={!!dispatchIndentId}
        onOpenChange={(open) => !open && setDispatchIndentId(null)}
        indentId={dispatchIndentId}
        onSuccess={() => {
          refetchIndents();
          refetch();
          setDispatchIndentId(null);
        }}
      />

      {/* Detail dialog for Material Issue / Indent */}
      {selectedIssue && (
        <Dialog open={!!selectedIssue} onOpenChange={() => setSelectedIssue(null)}>
          <DialogContent className="sm:max-w-4xl max-w-[95vw] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between gap-3">
                <span>{selectedIssue.min_number ? `Material Issue #${selectedIssue.min_number}` : `Indent #${selectedIssue.indent_number}`}</span>
                <Badge className="capitalize">{(selectedIssue.status || '').replace(/_/g, ' ') || '—'}</Badge>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Issue Date</Label>
                  <p className="font-semibold">
                    {selectedIssue.issue_date
                      ? new Date(selectedIssue.issue_date).toLocaleDateString()
                      : selectedIssue.required_by_date
                        ? new Date(selectedIssue.required_by_date).toLocaleDateString()
                        : '—'}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Priority</Label>
                  <Badge variant="secondary" className="capitalize">
                    {selectedIssue.priority || 'normal'}
                  </Badge>
                </div>
                <div>
                  <Label className="text-muted-foreground">From Store</Label>
                  <p>{selectedIssue.central_store_name || `Store #${selectedIssue.central_store || '—'}`}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">To College</Label>
                  <p>{selectedIssue.receiving_college_name || selectedIssue.college_name || `College #${selectedIssue.receiving_college || selectedIssue.college || '—'}`}</p>
                </div>
              </div>

              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-muted">
                        <tr>
                          <th className="p-2 text-left">#</th>
                          <th className="p-2 text-left">Item</th>
                          <th className="p-2 text-right">Quantity</th>
                          <th className="p-2 text-left">Unit</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedIssue.items?.length ? (
                          selectedIssue.items.map((item: any, idx: number) => (
                            <tr key={idx} className="border-t">
                              <td className="p-2">{idx + 1}</td>
                              <td className="p-2">
                                <p className="font-medium">
                                  {item.item_name || item.item_display || `Item #${item.central_store_item || item.item}`}
                                </p>
                              </td>
                              <td className="p-2 text-right">
                                {item.quantity || item.requested_quantity || item.issued_quantity || '-'}
                              </td>
                              <td className="p-2">{item.unit || item.unit_name || '-'}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td className="p-3 text-center text-muted-foreground" colSpan={4}>
                              No items available
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setSelectedIssue(null)}>
                  Close
                </Button>
                {selectedIssue.status === 'prepared' && (
                  <Button onClick={() => handleDispatch(selectedIssue)} disabled={dispatchMutation.isPending}>
                    Dispatch
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Shared Note Prompt Dialog */}
      <Dialog open={notePrompt.open} onOpenChange={(open) => !open && handleNoteCancel()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{notePrompt.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <Textarea
              autoFocus
              value={noteValue}
              placeholder={notePrompt.placeholder}
              onChange={(e) => setNoteValue(e.target.value)}
              rows={3}
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={handleNoteCancel}
              >
                Cancel
              </Button>
              <Button
                onClick={handleNoteSave}
              >
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
