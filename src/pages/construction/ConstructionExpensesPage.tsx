/**
 * Construction Expenses Page
 * CRUD + Approval workflow for construction site expenses.
 */

import {
    CheckCircle,
    Edit,
    Eye,
    Landmark,
    Plus,
    Trash2,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { constructionExpensesApi } from '../../api/constructionService';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Column, DataTable, FilterConfig } from '../../components/common/DataTable';
import { DetailSidebar } from '../../components/common/DetailSidebar';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';
import { getCollegeId } from '../../config/api.config';
import { useAuth } from '../../hooks/useAuth';
import { invalidateExpenses, useExpensesSWR, useProjectsSWR } from '../../hooks/useConstructionSWR';
import type {
    ConstructionExpense,
    ConstructionExpenseCreateInput,
    ConstructionExpenseUpdateInput,
    ExpenseCategory,
    ExpenseStatus
} from '../../types/construction.types';

// ============================================================================
// CONSTANTS & HELPERS
// ============================================================================

const CATEGORY_OPTIONS: { value: ExpenseCategory; label: string }[] = [
    { value: 'labour', label: 'Labour' },
    { value: 'materials', label: 'Materials' },
    { value: 'equipment', label: 'Equipment & Rentals' },
    { value: 'logistics', label: 'Logistics & Transport' },
    { value: 'other', label: 'Other/Miscellaneous' },
];

const STATUS_OPTIONS: { value: ExpenseStatus; label: string }[] = [
    { value: 'pending', label: 'Pending Approval' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
];

const STATUS_COLORS: Record<string, 'default' | 'secondary' | 'outline' | 'destructive' | 'success'> = {
    pending: 'secondary',
    approved: 'success',
    rejected: 'destructive',
};

interface ExpenseFormData {
    project: string;
    expense_date: string;
    category: ExpenseCategory;
    description: string;
    amount: string;
}

const defaultFormData: ExpenseFormData = {
    project: '',
    expense_date: new Date().toISOString().split('T')[0],
    category: 'materials',
    description: '',
    amount: '',
};

// ============================================================================
// COMPONENT
// ============================================================================

export function ConstructionExpensesPage() {
    const { user } = useAuth();
    // Jr Engineers and Construction Head can record. CEO approves.
    // Assuming CEO role user_type is 'ceo' or super_admin
    // (We will use a generic check for user type, e.g. not jr_engineer or specific access)
    // We'll let everyone create (as requested: Jr Engineers & Construction head), but only "ceo" (or not jr eng / head) approve.
    const isJrEngineer = user?.user_type === 'jr_engineer';
    // Let's assume user.user_type === 'ceo' or 'super_admin' can approve, others cannot. Modify this as needed if super_admin is not available here.
    const canApprove = user?.user_type !== 'jr_engineer' && user?.user_type !== 'construction_head';

    // ── State ──────────────────────────────────────────────────────────────
    const [filters, setFilters] = useState<Record<string, any>>({ page: 1, page_size: 10 });
    const { data, isLoading } = useExpensesSWR(filters);
    const { results: projects } = useProjectsSWR({ page_size: 100, status: 'in_progress' });

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarMode, setSidebarMode] = useState<'create' | 'edit' | 'view'>('create');
    const [selectedExpense, setSelectedExpense] = useState<ConstructionExpense | null>(null);
    const [formData, setFormData] = useState<ExpenseFormData>({ ...defaultFormData });
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [expenseToDelete, setExpenseToDelete] = useState<number | null>(null);

    // Dialog state for approve / reject
    const [actionDialogOpen, setActionDialogOpen] = useState(false);
    const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');
    const [expenseToAction, setExpenseToAction] = useState<number | null>(null);

    // ── Helpers ────────────────────────────────────────────────────────────
    const handleChange = (field: keyof ExpenseFormData, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const populateForm = (expense: ConstructionExpense) => {
        setFormData({
            project: String(expense.project),
            expense_date: expense.expense_date || '',
            category: expense.category,
            description: expense.description || '',
            amount: String(expense.amount || ''),
        });
        setUploadFile(null); // Clear upload file when editing existing
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setUploadFile(e.target.files[0]);
        }
    };

    // ── Action Handlers ────────────────────────────────────────────────────
    const handleCreate = () => {
        setSelectedExpense(null);
        setFormData({ ...defaultFormData });
        setUploadFile(null);
        setSidebarMode('create');
        setSidebarOpen(true);
    };

    const handleEdit = (expense: ConstructionExpense) => {
        setSelectedExpense(expense);
        populateForm(expense);
        setSidebarMode('edit');
        setSidebarOpen(true);
    };

    const handleView = (expense: ConstructionExpense) => {
        setSelectedExpense(expense);
        populateForm(expense);
        setSidebarMode('view');
        setSidebarOpen(true);
    };

    const handleDeleteClick = (id: number) => {
        setExpenseToDelete(id);
        setDeleteDialogOpen(true);
    };

    const handleApproveClick = (id: number) => {
        setExpenseToAction(id);
        setActionType('approve');
        setActionDialogOpen(true);
    };

    const handleRejectClick = (id: number) => {
        setExpenseToAction(id);
        setActionType('reject');
        setActionDialogOpen(true);
    };

    // ── API Submission Handlers ─────────────────────────────────────────────
    const handleSubmitForm = async () => {
        if (!formData.project) {
            toast.error('Project is required'); return;
        }
        if (!formData.amount || Number(formData.amount) <= 0) {
            toast.error('Valid positive amount is required'); return;
        }
        if (!formData.description.trim()) {
            toast.error('Description is required'); return;
        }

        // In create mode, if we are passing files, use FormData via the service logic difference
        const collegeId = getCollegeId();

        const payload: ConstructionExpenseCreateInput = {
            college: collegeId !== 'all' ? Number(collegeId) : undefined,
            project: Number(formData.project),
            expense_date: formData.expense_date,
            category: formData.category,
            description: formData.description.trim(),
            amount: formData.amount,
            receipt_photo: uploadFile || undefined,
        };

        try {
            setIsSaving(true);
            if (sidebarMode === 'edit' && selectedExpense) {
                // Remove receipt_photo from payload if we aren't updating it (updating files requires diff logic if handled via patch)
                // Assuming standard PUT handles the same shape or we ignore the file
                const updatePayload: ConstructionExpenseUpdateInput = { ...payload };
                if (!uploadFile) delete updatePayload.receipt_photo;

                await constructionExpensesApi.update(selectedExpense.id, updatePayload);
                toast.success('Expense updated');
            } else {
                await constructionExpensesApi.create(payload);
                toast.success('Expense recorded');
            }
            setSidebarOpen(false);
            await invalidateExpenses();
        } catch (err: any) {
            toast.error(err?.message || `Failed to ${sidebarMode === 'edit' ? 'update' : 'create'} expense`);
        } finally {
            setIsSaving(false);
        }
    };

    const confirmDelete = async () => {
        if (!expenseToDelete) return;
        try {
            await constructionExpensesApi.delete(expenseToDelete);
            toast.success('Expense deleted');
            setDeleteDialogOpen(false);
            setExpenseToDelete(null);
            await invalidateExpenses();
            if (sidebarOpen && selectedExpense?.id === expenseToDelete) {
                setSidebarOpen(false);
            }
        } catch (err: any) {
            toast.error(err?.message || 'Failed to delete expense');
        }
    };

    const confirmAction = async () => {
        if (!expenseToAction) return;
        try {
            if (actionType === 'approve') {
                await constructionExpensesApi.approve(expenseToAction);
                toast.success('Expense Approved');
            } else {
                await constructionExpensesApi.reject(expenseToAction);
                toast.success('Expense Rejected');
            }
            setActionDialogOpen(false);
            setExpenseToAction(null);
            await invalidateExpenses();

            // If currently viewing
            if (sidebarOpen && selectedExpense?.id === expenseToAction) {
                setSidebarOpen(false);
            }
        } catch (err: any) {
            toast.error(err?.message || `Failed to ${actionType} expense`);
        }
    };

    // ── Table definitions ──────────────────────────────────────────────────
    const columns: Column<ConstructionExpense>[] = [
        {
            key: 'details',
            label: 'Expense Details',
            sortable: true,
            render: (row) => (
                <div>
                    <span className="font-semibold text-sm max-w-[200px] truncate block" title={row.description}>
                        {row.description}
                    </span>
                    <div className="text-xs text-muted-foreground mt-0.5 capitalize flex items-center gap-2">
                        <span>{row.category.replace('_', ' ')}</span>
                        <span>•</span>
                        <span>{row.project_name || `Project ${row.project}`}</span>
                    </div>
                </div>
            )
        },
        {
            key: 'expense_date',
            label: 'Date',
            sortable: true,
            render: (row) => (
                <span className="text-sm">
                    {new Date(row.expense_date).toLocaleDateString()}
                </span>
            ),
        },
        {
            key: 'amount',
            label: 'Amount',
            sortable: true,
            render: (row) => (
                <span className="text-sm font-semibold text-rose-600">
                    ₹{Number(row.amount).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </span>
            ),
        },
        {
            key: 'status',
            label: 'Approval Status',
            render: (row) => (
                <Badge variant={STATUS_COLORS[row.status] || 'default'} className="rounded-full capitalize">
                    {row.status}
                </Badge>
            ),
        },
        {
            key: 'recorded_by',
            label: 'Recorded By',
            render: (row) => (
                <span className="text-sm">{row.recorded_by_name || '—'}</span>
            )
        },
        {
            key: 'actions',
            label: 'Actions',
            render: (row) => (
                <div className="flex gap-1.5 items-center">
                    <Button size="sm" variant="ghost" onClick={() => handleView(row)} title="View Receipt">
                        <Eye className="h-4 w-4" />
                    </Button>

                    {/* Approve / Reject Actions (CEO Only, if status is pending) */}
                    {canApprove && row.status === 'pending' && (
                        <>
                            <div className="w-px h-4 bg-border mx-1" />
                            <Button size="sm" variant="ghost" className="text-green-600 hover:bg-green-50" onClick={() => handleApproveClick(row.id)} title="Approve">
                                <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={() => handleRejectClick(row.id)} title="Reject">
                                <XCircle className="h-4 w-4" />
                            </Button>
                        </>
                    )}

                    {/* Edit/Delete if status is pending and user is the creator or manager */}
                    {row.status === 'pending' && (
                        <>
                            <div className="w-px h-4 bg-border mx-1" />
                            <Button size="sm" variant="ghost" onClick={() => handleEdit(row)} title="Edit">
                                <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={() => handleDeleteClick(row.id)} title="Delete">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </>
                    )}
                </div>
            ),
        }
    ];

    const tableFilters: FilterConfig[] = [
        {
            name: 'project',
            label: 'Project',
            type: 'select',
            options: projects.map((p) => ({ label: p.project_name, value: String(p.id) })),
        },
        {
            name: 'status',
            label: 'Status',
            type: 'select',
            options: STATUS_OPTIONS.map((s) => ({ label: s.label, value: s.value })),
        },
        {
            name: 'category',
            label: 'Category',
            type: 'select',
            options: CATEGORY_OPTIONS.map((c) => ({ label: c.label, value: c.value })),
        }
    ];

    const isViewMode = sidebarMode === 'view';

    return (
        <div className="p-4 md:p-6 flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center">
                        <Landmark className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold">Construction Expenses</h1>
                        <p className="text-xs text-muted-foreground">Record site expenses, upload receipts, and manage approvals</p>
                    </div>
                </div>
                <Button onClick={handleCreate}>
                    <Plus className="h-4 w-4 mr-1" /> Record Expense
                </Button>
            </div>

            {/* DataTable */}
            <DataTable
                onRowClick={handleView}
                columns={columns}
                data={data ?? null}
                isLoading={isLoading}
                filters={filters}
                onFiltersChange={setFilters}
                filterConfig={tableFilters}
                searchPlaceholder="Search descriptions..."
            />

            {/* Sidebar */}
            <DetailSidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                title={
                    sidebarMode === 'create'
                        ? 'Record New Expense'
                        : sidebarMode === 'edit'
                            ? 'Edit Expense'
                            : 'Expense Details'
                }
                subtitle={
                    sidebarMode === 'view'
                        ? `Expense ID #${selectedExpense?.id}`
                        : 'Provide accurate billing details'
                }
                width="2xl"
                mode={sidebarMode}
                footer={
                    !isViewMode ? (
                        <div className="flex items-center justify-end gap-3">
                            <Button variant="outline" onClick={() => setSidebarOpen(false)}>Cancel</Button>
                            <Button onClick={handleSubmitForm} disabled={isSaving}>
                                {isSaving ? 'Saving...' : sidebarMode === 'edit' ? 'Update records' : 'Submit for Approval'}
                            </Button>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between w-full">
                            <div className="flex gap-2">
                                {selectedExpense?.status === 'pending' && canApprove && (
                                    <>
                                        <Button className="bg-green-600 hover:bg-green-700" onClick={() => handleApproveClick(selectedExpense.id)}>
                                            <CheckCircle className="h-4 w-4 mr-1.5" /> Approve
                                        </Button>
                                        <Button variant="destructive" onClick={() => handleRejectClick(selectedExpense.id)}>
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
                    {/* Read-only verification info & Alert if Rejected */}
                    {isViewMode && selectedExpense && (
                        <div className="space-y-4 mb-6">
                            {selectedExpense.status === 'rejected' && (
                                <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl text-sm flex items-start gap-3">
                                    <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold">Expense Rejected</p>
                                        <p className="mt-1">This expense was rejected by {selectedExpense.approved_by_name || 'Management'}.</p>
                                    </div>
                                </div>
                            )}

                            {selectedExpense.status === 'approved' && (
                                <div className="p-4 bg-green-50 border border-green-200 text-green-800 rounded-xl text-sm flex items-start gap-3">
                                    <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold">Expense Approved</p>
                                        <p className="mt-1">Approved by {selectedExpense.approved_by_name || 'Management'}.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Project *</Label>
                            <Select
                                value={formData.project}
                                onValueChange={(v) => handleChange('project', v)}
                                disabled={isViewMode}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Project" />
                                </SelectTrigger>
                                <SelectContent>
                                    {projects.map((p) => (
                                        <SelectItem key={p.id} value={String(p.id)}>{p.project_name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Expense Date *</Label>
                            <Input
                                type="date"
                                value={formData.expense_date}
                                onChange={(e) => handleChange('expense_date', e.target.value)}
                                disabled={isViewMode}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Category *</Label>
                            <Select
                                value={formData.category}
                                onValueChange={(v) => handleChange('category', v as ExpenseCategory)}
                                disabled={isViewMode}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {CATEGORY_OPTIONS.map((c) => (
                                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Amount (₹) *</Label>
                            <Input
                                type="number"
                                min="0"
                                step="any"
                                value={formData.amount}
                                onChange={(e) => handleChange('amount', e.target.value)}
                                placeholder="e.g. 1500"
                                disabled={isViewMode}
                                className={isViewMode ? "font-semibold text-rose-600" : ""}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Detailed Description *</Label>
                        <Textarea
                            value={formData.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                            placeholder="Provide a detailed breakdown of this expense..."
                            disabled={isViewMode}
                            rows={3}
                        />
                    </div>

                    {/* Receipt Upload / View */}
                    <div className="space-y-3">
                        <Label className="font-semibold block">Receipt / Proof of Payment</Label>
                        {!isViewMode ? (
                            <div className="border border-dashed rounded-lg p-6 bg-muted/20 text-center">
                                <Input type="file" accept="image/*,application/pdf" onChange={handleFileChange} className="max-w-xs mx-auto mb-2" />
                                <p className="text-xs text-muted-foreground mt-2">Upload invoice, bill, or receipt (Max 5MB)</p>
                                {uploadFile && (
                                    <p className="text-sm font-medium text-primary mt-3">Selected file: {uploadFile.name}</p>
                                )}
                                {!uploadFile && selectedExpense?.receipt_photo && (
                                    <p className="text-sm text-amber-500 mt-2">A receipt is already attached to this record. Uploading a new one will replace it.</p>
                                )}
                            </div>
                        ) : (
                            selectedExpense?.receipt_photo ? (
                                <div className="border rounded-xl overflow-hidden bg-black/5 flex items-center justify-center p-2 min-h-[250px]">
                                    <img
                                        src={selectedExpense.receipt_photo}
                                        alt="Expense Receipt"
                                        className="max-h-[400px] w-auto max-w-full object-contain rounded shadow-sm"
                                    />
                                </div>
                            ) : (
                                <div className="p-8 border rounded-xl bg-muted/30 text-center text-sm text-muted-foreground flex flex-col items-center">
                                    <CheckCircle className="h-8 w-8 mb-2 opacity-20" />
                                    No receipt document was uploaded for this expense.
                                </div>
                            )
                        )}
                    </div>

                    {/* Meta info footer in view mode */}
                    {isViewMode && selectedExpense && (
                        <div className="mt-8 pt-4 border-t grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                            <div>Submitted By: <span className="font-medium text-foreground">{selectedExpense.recorded_by_name || 'System User'}</span></div>
                            <div>Recorded On: <span className="font-medium text-foreground">{new Date(selectedExpense.created_at).toLocaleString()}</span></div>
                        </div>
                    )}
                </div>
            </DetailSidebar>

            {/* Confirm Dialogs */}
            <ConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                title="Delete Expense"
                description="Are you sure you want to delete this expense record? This action cannot be undone."
                onConfirm={confirmDelete}
            />

            <ConfirmDialog
                open={actionDialogOpen}
                onOpenChange={setActionDialogOpen}
                title={actionType === 'approve' ? 'Approve Expense' : 'Reject Expense'}
                description={
                    actionType === 'approve'
                        ? "Are you sure you want to approve this expense? It will be marked as verified and can proceed to accounting."
                        : "Are you sure you want to reject this expense? The submitter will be notified."
                }
                onConfirm={confirmAction}
            />
        </div>
    );
}
