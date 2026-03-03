import {
    CheckCircle,
    Edit,
    Eye,
    Plus,
    Send,
    Trash2,
    Wrench,
    X,
    XCircle
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { materialRequestsApi } from '../../../api/constructionService';
import { ConfirmDialog } from '../../../components/common/ConfirmDialog';
import { Column, DataTable, FilterConfig } from '../../../components/common/DataTable';
import { DetailSidebar } from '../../../components/common/DetailSidebar';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Textarea } from '../../../components/ui/textarea';
import { getCollegeId } from '../../../config/api.config';
import { useAuth } from '../../../hooks/useAuth';
import { invalidateMaterialRequests, useMaterialRequestsSWR } from '../../../hooks/useConstructionSWR';
import type {
    ConstructionProject,
    MaterialRequest,
    MaterialRequestCreateInput,
    MaterialRequestItem,
    MaterialRequestPriority
} from '../../../types/construction.types';

// ============================================================================
// CONSTANTS
// ============================================================================

const PRIORITY_OPTIONS: { value: MaterialRequestPriority; label: string }[] = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' },
];

const STATUS_COLORS: Record<string, 'default' | 'secondary' | 'outline' | 'destructive' | 'success'> = {
    draft: 'secondary',
    submitted: 'outline',
    approved: 'success',
    rejected: 'destructive',
};


export function ProjectMaterialsTab({ project: projectData }: { project: ConstructionProject }) {
    const { user } = useAuth();
    // Assuming CEO / Super Admin can approve
    const canApprove = user?.user_type !== 'jr_engineer' && user?.user_type !== 'construction_head';

    // ── State ──────────────────────────────────────────────────────────────
    const [filters, setFilters] = useState<Record<string, any>>({
        page: 1,
        page_size: 10,
        project: projectData.id // Scoped strictly to this project
    });
    const { data, isLoading } = useMaterialRequestsSWR(filters);

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarMode, setSidebarMode] = useState<'create' | 'edit' | 'view'>('create');
    const [selectedRequest, setSelectedRequest] = useState<MaterialRequest | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Form data
    const [project, setProject] = useState(String(projectData.id));
    const [priority, setPriority] = useState<MaterialRequestPriority>('medium');
    const [justification, setJustification] = useState('');
    const [items, setItems] = useState<MaterialRequestItem[]>([]);

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [requestToDelete, setRequestToDelete] = useState<number | null>(null);

    const [actionDialogOpen, setActionDialogOpen] = useState(false);
    const [actionType, setActionType] = useState<'submit' | 'approve' | 'reject'>('submit');
    const [requestToAction, setRequestToAction] = useState<number | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');

    // ── Form Helpers ──────────────────────────────────────────────────────
    const populateForm = (req: MaterialRequest) => {
        setProject(String(req.project));
        setPriority(req.priority);
        setJustification(req.justification || '');
        setItems(req.items?.length ? req.items : []);
    };

    const resetForm = () => {
        setProject(String(projectData.id));
        setPriority('medium');
        setJustification('');
        setItems([{ item_name: '', quantity: '', unit: '', description: '', estimated_cost: '' } as unknown as MaterialRequestItem]);
    };

    // Item Management
    const addItemRow = () => {
        setItems([...items, { item_name: '', quantity: '', unit: '', description: '', estimated_cost: '' } as unknown as MaterialRequestItem]);
    };

    const updateItemRow = (index: number, field: keyof MaterialRequestItem, val: any) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: val };
        setItems(newItems);
    };

    const removeItemRow = (index: number) => {
        if (items.length <= 1) return;
        const newItems = [...items];
        newItems.splice(index, 1);
        setItems(newItems);
    };

    // ── Action Handlers ────────────────────────────────────────────────────
    const handleCreate = () => {
        setSelectedRequest(null);
        resetForm();
        setSidebarMode('create');
        setSidebarOpen(true);
    };

    const handleEdit = (req: MaterialRequest) => {
        setSelectedRequest(req);
        populateForm(req);
        setSidebarMode('edit');
        setSidebarOpen(true);
    };

    const handleView = (req: MaterialRequest) => {
        setSelectedRequest(req);
        populateForm(req);
        setSidebarMode('view');
        setSidebarOpen(true);
    };

    const handleDeleteClick = (id: number) => {
        setRequestToDelete(id);
        setDeleteDialogOpen(true);
    };

    const handleWorkflowClick = (id: number, type: 'submit' | 'approve' | 'reject') => {
        setRequestToAction(id);
        setActionType(type);
        setRejectionReason('');
        setActionDialogOpen(true);
    };

    // ── Submissions ────────────────────────────────────────────────────────
    const handleSaveForm = async () => {
        if (!project) { toast.error('Project is required'); return; }
        if (!justification.trim()) { toast.error('Justification is required'); return; }

        const filteredItems = items.filter(i => i.item_name.trim() && i.quantity && i.unit.trim());
        if (filteredItems.length === 0) {
            toast.error('At least one valid item is required (name, quantity, unit)'); return;
        }

        const collegeId = getCollegeId();

        const payload: MaterialRequestCreateInput = {
            college: collegeId !== 'all' ? Number(collegeId) : undefined,
            project: Number(project),
            priority,
            justification: justification.trim(),
            items: filteredItems.map(item => ({
                id: item.id,
                item_name: item.item_name.trim(),
                quantity: item.quantity,
                unit: item.unit.trim(),
                description: item.description?.trim() || undefined,
                estimated_cost: item.estimated_cost || undefined,
            })),
        };

        try {
            setIsSaving(true);
            if (sidebarMode === 'edit' && selectedRequest) {
                await materialRequestsApi.update(selectedRequest.id, payload);
                toast.success('Request updated successfully');
            } else {
                await materialRequestsApi.create(payload);
                toast.success('Material request drafted successfully');
            }
            setSidebarOpen(false);
            await invalidateMaterialRequests();
        } catch (err: any) {
            toast.error(err?.message || `Failed to ${sidebarMode === 'edit' ? 'update' : 'create'} request`);
        } finally {
            setIsSaving(false);
        }
    };

    const confirmDelete = async () => {
        if (!requestToDelete) return;
        try {
            await materialRequestsApi.delete(requestToDelete);
            toast.success('Request deleted');
            setDeleteDialogOpen(false);
            setRequestToDelete(null);
            await invalidateMaterialRequests();
        } catch (err: any) {
            toast.error(err?.message || 'Failed to delete request');
        }
    };

    const confirmWorkflowAction = async () => {
        if (!requestToAction) return;
        try {
            if (actionType === 'submit') {
                await materialRequestsApi.submit(requestToAction);
                toast.success('Request submitted for approval');
            } else if (actionType === 'approve') {
                await materialRequestsApi.ceoApprove(requestToAction);
                toast.success('Request approved');
            } else if (actionType === 'reject') {
                await materialRequestsApi.ceoReject(requestToAction, rejectionReason);
                toast.success('Request rejected');
            }
            setActionDialogOpen(false);
            setRequestToAction(null);
            await invalidateMaterialRequests();
            if (sidebarOpen && selectedRequest?.id === requestToAction) {
                setSidebarOpen(false);
            }
        } catch (err: any) {
            toast.error(err?.message || `Failed to ${actionType} request`);
        }
    };

    // ── Table definitions ──────────────────────────────────────────────────
    const columns: Column<MaterialRequest>[] = [
        {
            key: 'project',
            label: 'Project',
            sortable: true,
            render: (row) => (
                <div>
                    <span className="font-semibold text-sm">{row.project_name || `Project #${row.project}`}</span>
                    <div className="text-xs text-muted-foreground mt-0.5 truncate max-w-[200px]" title={row.justification}>
                        {row.justification}
                    </div>
                </div>
            )
        },
        {
            key: 'items',
            label: 'Total Items',
            render: (row) => (
                <Badge variant="outline" className="rounded-full bg-muted/50">
                    {row.items?.length || 0} Items
                </Badge>
            )
        },
        {
            key: 'priority',
            label: 'Priority',
            render: (row) => (
                <Badge variant={
                    row.priority === 'critical' ? 'destructive' :
                        row.priority === 'high' ? 'outline' :
                            row.priority === 'medium' ? 'default' : 'secondary'
                } className="capitalize">
                    {row.priority}
                </Badge>
            )
        },
        {
            key: 'status',
            label: 'Status',
            render: (row) => (
                <Badge variant={STATUS_COLORS[row.status] || 'default'} className="capitalize rounded-full">
                    {row.status}
                </Badge>
            )
        },
        {
            key: 'requested_by',
            label: 'Requested By',
            render: (row) => (
                <span className="text-sm">{row.requested_by_name || '—'}</span>
            )
        },
        {
            key: 'actions',
            label: 'Actions',
            render: (row) => (
                <div className="flex gap-1.5 items-center">
                    <Button size="sm" variant="ghost" onClick={() => handleView(row)} title="View Detail">
                        <Eye className="h-4 w-4" />
                    </Button>

                    {row.status === 'draft' && (
                        <>
                            <div className="w-px h-4 bg-border mx-1" />
                            <Button size="sm" variant="ghost" className="text-blue-600 hover:bg-blue-50" onClick={() => handleWorkflowClick(row.id, 'submit')} title="Submit for Approval">
                                <Send className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => handleEdit(row)} title="Edit Draft">
                                <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={() => handleDeleteClick(row.id)} title="Delete Draft">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </>
                    )}

                    {row.status === 'submitted' && canApprove && (
                        <>
                            <div className="w-px h-4 bg-border mx-1" />
                            <Button size="sm" variant="ghost" className="text-green-600 hover:bg-green-50" onClick={() => handleWorkflowClick(row.id, 'approve')} title="Approve Request">
                                <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={() => handleWorkflowClick(row.id, 'reject')} title="Reject Request">
                                <XCircle className="h-4 w-4" />
                            </Button>
                        </>
                    )}
                </div>
            )
        }
    ];

    const tableFilters: FilterConfig[] = [
        {
            name: 'status',
            label: 'Status',
            type: 'select',
            options: [
                { value: 'draft', label: 'Draft' },
                { value: 'submitted', label: 'Submitted' },
                { value: 'approved', label: 'Approved' },
                { value: 'rejected', label: 'Rejected' },
            ],
        },
        {
            name: 'priority',
            label: 'Priority',
            type: 'select',
            options: PRIORITY_OPTIONS.map((p) => ({ label: p.label, value: p.value })),
        }
    ];

    const isViewMode = sidebarMode === 'view';

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-500 to-sky-600 flex items-center justify-center">
                        <Wrench className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold">Material Requests</h2>
                        <p className="text-sm text-muted-foreground">Draft and approve material indents from sites</p>
                    </div>
                </div>
                <Button onClick={handleCreate}>
                    <Plus className="h-4 w-4 mr-1" /> Draft Request
                </Button>
            </div>

            <DataTable
                onRowClick={handleView}
                columns={columns}
                data={data ?? null}
                isLoading={isLoading}
                filters={filters}
                onFiltersChange={setFilters}
                filterConfig={tableFilters}
            />

            <DetailSidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                title={
                    sidebarMode === 'create' ? 'Draft Material Request' :
                        sidebarMode === 'edit' ? 'Edit Request' : 'Request Details'
                }
                subtitle={
                    sidebarMode === 'view' ? `Request ID #${selectedRequest?.id} — ${projectData.project_name}` : `Fill in the indent details for ${projectData.project_name}`
                }
                width="3xl"
                mode={sidebarMode}
                footer={
                    !isViewMode ? (
                        <div className="flex items-center justify-end gap-3">
                            <Button variant="outline" onClick={() => setSidebarOpen(false)}>Cancel</Button>
                            <Button onClick={handleSaveForm} disabled={isSaving}>
                                {isSaving ? 'Saving...' : 'Save Draft'}
                            </Button>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between w-full">
                            <div className="flex gap-2">
                                {selectedRequest?.status === 'draft' && (
                                    <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => handleWorkflowClick(selectedRequest.id, 'submit')}>
                                        <Send className="h-4 w-4 mr-1.5" /> Submit for Approval
                                    </Button>
                                )}
                                {selectedRequest?.status === 'submitted' && canApprove && (
                                    <>
                                        <Button className="bg-green-600 hover:bg-green-700" onClick={() => handleWorkflowClick(selectedRequest.id, 'approve')}>
                                            <CheckCircle className="h-4 w-4 mr-1.5" /> Approve Request
                                        </Button>
                                        <Button variant="destructive" onClick={() => handleWorkflowClick(selectedRequest.id, 'reject')}>
                                            <XCircle className="h-4 w-4 mr-1.5" /> Reject
                                        </Button>
                                    </>
                                )}
                            </div>
                            <Button variant="outline" onClick={() => setSidebarOpen(false)}>Close</Button>
                        </div>
                    )
                }
            >
                <div className="space-y-6">
                    {/* View mode alerts */}
                    {isViewMode && selectedRequest && (
                        <div className="space-y-4 mb-6">
                            {selectedRequest.status === 'rejected' && (
                                <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl text-sm flex items-start gap-3">
                                    <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold">Request Rejected</p>
                                        <p className="mt-1">Reason: {selectedRequest.rejection_reason || 'No reason provided.'}</p>
                                    </div>
                                </div>
                            )}
                            {selectedRequest.status === 'approved' && (
                                <div className="p-4 bg-green-50 border border-green-200 text-green-800 rounded-xl text-sm flex items-start gap-3">
                                    <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold">Request Approved</p>
                                        <p className="mt-1">This request has been approved and moved to the store for fulfillment.</p>
                                    </div>
                                </div>
                            )}
                            {selectedRequest.status === 'submitted' && (
                                <div className="p-4 bg-blue-50 border border-blue-200 text-blue-800 rounded-xl text-sm flex items-start gap-3">
                                    <Send className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold">Pending Approval</p>
                                        <p className="mt-1">This request is waiting for CEO/Head approval.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Metadata Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b pb-6">
                        <div className="space-y-2">
                            <Label>Project *</Label>
                            <div className="p-2 border border-border rounded-md bg-muted/50 text-sm font-medium">
                                {projectData.project_name}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Priority Level</Label>
                            <Select value={priority} onValueChange={(v) => setPriority(v as MaterialRequestPriority)} disabled={isViewMode}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {PRIORITY_OPTIONS.map((p) => (
                                        <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label>Justification / Reason *</Label>
                            <Textarea
                                value={justification}
                                onChange={(e) => setJustification(e.target.value)}
                                placeholder="Why are these materials needed?"
                                disabled={isViewMode}
                                rows={2}
                            />
                        </div>
                    </div>

                    {/* Items Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-sm font-semibold">Material Line Items</Label>
                            {!isViewMode && (
                                <Button size="sm" variant="outline" onClick={addItemRow} className="h-8">
                                    <Plus className="h-3 w-3 mr-1" /> Add Row
                                </Button>
                            )}
                        </div>

                        {items.length === 0 && <p className="text-sm text-muted-foreground m-0">No items added.</p>}

                        <div className="space-y-3">
                            {items.map((item, index) => (
                                <div key={index} className="grid grid-cols-12 gap-3 p-3 bg-muted/20 border rounded-lg relative">
                                    <div className="col-span-12 md:col-span-4">
                                        <Label className="text-xs text-muted-foreground mb-1 block">Item Name *</Label>
                                        <Input
                                            value={item.item_name}
                                            onChange={(e) => updateItemRow(index, 'item_name', e.target.value)}
                                            disabled={isViewMode}
                                            placeholder="Ext. Wire Roll"
                                            className="h-8 text-sm"
                                        />
                                    </div>
                                    <div className="col-span-6 md:col-span-2">
                                        <Label className="text-xs text-muted-foreground mb-1 block">Qty *</Label>
                                        <Input
                                            type="number"
                                            value={item.quantity}
                                            onChange={(e) => updateItemRow(index, 'quantity', e.target.value)}
                                            disabled={isViewMode}
                                            placeholder="5"
                                            className="h-8 text-sm"
                                        />
                                    </div>
                                    <div className="col-span-6 md:col-span-2">
                                        <Label className="text-xs text-muted-foreground mb-1 block">Unit *</Label>
                                        <Input
                                            value={item.unit}
                                            onChange={(e) => updateItemRow(index, 'unit', e.target.value)}
                                            disabled={isViewMode}
                                            placeholder="Pcs/Kg/M"
                                            className="h-8 text-sm uppercase"
                                        />
                                    </div>
                                    <div className="col-span-10 md:col-span-3">
                                        <Label className="text-xs text-muted-foreground mb-1 block">Est. Cost (₹)</Label>
                                        <Input
                                            type="number"
                                            value={item.estimated_cost || ''}
                                            onChange={(e) => updateItemRow(index, 'estimated_cost', e.target.value)}
                                            disabled={isViewMode}
                                            placeholder="2500"
                                            className="h-8 text-sm"
                                        />
                                    </div>
                                    {!isViewMode && (
                                        <div className="col-span-2 md:col-span-1 flex items-end justify-end pb-0.5">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                                                onClick={() => removeItemRow(index)}
                                                disabled={items.length === 1}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    )}
                                    <div className="col-span-12">
                                        <Input
                                            value={item.description || ''}
                                            onChange={(e) => updateItemRow(index, 'description', e.target.value)}
                                            disabled={isViewMode}
                                            placeholder="Specific variant details..."
                                            className="h-8 text-xs bg-transparent border-dashed"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {isViewMode && selectedRequest && (
                        <div className="mt-8 pt-4 border-t flex items-center justify-between text-xs text-muted-foreground">
                            <span>Requested by: <b className="text-foreground">{selectedRequest.requested_by_name || '—'}</b></span>
                            <span>{new Date(selectedRequest.created_at).toLocaleString()}</span>
                        </div>
                    )}
                </div>
            </DetailSidebar>

            {/* Confirm Dialogs */}
            <ConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                title="Delete Draft"
                description="Are you sure you want to delete this material request draft?"
                onConfirm={confirmDelete}
            />

            <ConfirmDialog
                open={actionDialogOpen}
                onOpenChange={setActionDialogOpen}
                title={
                    actionType === 'submit' ? 'Submit Request' :
                        actionType === 'approve' ? 'Approve Request' : 'Reject Request'
                }
                description={
                    actionType === 'submit' ? "Submit this request for CEO approval. You will not be able to edit it once submitted." :
                        actionType === 'approve' ? "Approving this request will automatically link it to the store indent system." :
                            (
                                <div className="space-y-3">
                                    <p className="text-sm text-muted-foreground">Please provide a reason for rejecting this material request.</p>
                                    <Textarea
                                        placeholder="Rejection reason..."
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                    />
                                </div>
                            )
                }
                onConfirm={confirmWorkflowAction}
            />
        </div>
    );
}

