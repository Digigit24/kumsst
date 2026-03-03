import {
    CheckCircle,
    Edit,
    Eye,
    Flag,
    Plus,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { milestonesApi } from '../../../api/constructionService';
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
import { invalidateMilestones, useMilestonesSWR } from '../../../hooks/useConstructionSWR';
import type { ConstructionProject, Milestone, MilestoneCreateInput, MilestoneStatus, MilestoneUpdateInput } from '../../../types/construction.types';

// ============================================================================
// CONSTANTS & HELPERS
// ============================================================================

const STATUS_OPTIONS: { value: MilestoneStatus; label: string }[] = [
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'overdue', label: 'Overdue' },
];

const STATUS_COLORS: Record<string, 'default' | 'secondary' | 'outline' | 'destructive' | 'success'> = {
    pending: 'secondary',
    in_progress: 'default',
    completed: 'success',
    overdue: 'destructive',
};

interface MilestoneFormData {
    project: string;
    milestone_name: string;
    description: string;
    expected_date: string;
    actual_completion_date: string;
    status: MilestoneStatus;
    completion_percentage: string;
    estimated_cost: string;
    actual_cost: string;
}

const defaultFormData: MilestoneFormData = {
    project: '',
    milestone_name: '',
    description: '',
    expected_date: '',
    actual_completion_date: '',
    status: 'pending',
    completion_percentage: '0',
    estimated_cost: '',
    actual_cost: '',
};


export function ProjectMilestonesTab({ project }: { project: ConstructionProject }) {
    const { user } = useAuth();
    // Jr Engineers are read-only; CEO/Construction Heads can manage and verify
    const canManage = user?.user_type !== 'jr_engineer';
    const canVerify = user?.user_type !== 'jr_engineer';

    // ── State ──────────────────────────────────────────────────────────────
    const [filters, setFilters] = useState<Record<string, any>>({
        page: 1,
        page_size: 10,
        project: project.id // Scoped strictly to this project
    });
    const { data, isLoading } = useMilestonesSWR(filters);

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarMode, setSidebarMode] = useState<'create' | 'edit' | 'view'>('create');
    const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
    const [formData, setFormData] = useState<MilestoneFormData>({ ...defaultFormData, project: String(project.id) });
    const [isSaving, setIsSaving] = useState(false);

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [milestoneToDelete, setMilestoneToDelete] = useState<number | null>(null);

    const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
    const [milestoneToVerify, setMilestoneToVerify] = useState<number | null>(null);
    const [ceoRemarks, setCeoRemarks] = useState('');

    // ── Helpers ────────────────────────────────────────────────────────────
    const handleChange = (field: keyof MilestoneFormData, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const populateForm = (milestone: Milestone) => {
        setFormData({
            project: String(milestone.project),
            milestone_name: milestone.milestone_name || '',
            description: milestone.description || '',
            expected_date: milestone.expected_date || '',
            actual_completion_date: milestone.actual_completion_date || '',
            status: milestone.status,
            completion_percentage: String(milestone.completion_percentage || 0),
            estimated_cost: milestone.estimated_cost ? String(milestone.estimated_cost) : '',
            actual_cost: milestone.actual_cost ? String(milestone.actual_cost) : '',
        });
    };

    // ── Action Handlers ────────────────────────────────────────────────────
    const handleCreate = () => {
        setSelectedMilestone(null);
        setFormData({ ...defaultFormData, project: String(project.id) });
        setSidebarMode('create');
        setSidebarOpen(true);
    };

    const handleEdit = (milestone: Milestone) => {
        setSelectedMilestone(milestone);
        populateForm(milestone);
        setSidebarMode('edit');
        setSidebarOpen(true);
    };

    const handleView = (milestone: Milestone) => {
        setSelectedMilestone(milestone);
        populateForm(milestone);
        setSidebarMode('view');
        setSidebarOpen(true);
    };

    const handleCloseSidebar = () => {
        setSidebarOpen(false);
    };

    const handleDeleteClick = (id: number) => {
        setMilestoneToDelete(id);
        setDeleteDialogOpen(true);
    };

    const handleVerifyClick = (id: number) => {
        setMilestoneToVerify(id);
        setCeoRemarks('');
        setVerifyDialogOpen(true);
    };

    // ── API Submission Handlers ─────────────────────────────────────────────
    const handleSubmitForm = async () => {
        if (!formData.project) {
            toast.error('Project is required');
            return;
        }
        if (!formData.milestone_name.trim()) {
            toast.error('Milestone name is required');
            return;
        }

        const collegeId = getCollegeId();

        const payload: MilestoneCreateInput = {
            college: collegeId !== 'all' ? Number(collegeId) : undefined,
            project: Number(formData.project),
            milestone_name: formData.milestone_name.trim(),
            description: formData.description.trim() || undefined,
            expected_date: formData.expected_date || undefined,
            actual_completion_date: formData.actual_completion_date || undefined,
            status: formData.status,
            completion_percentage: Number(formData.completion_percentage) || 0,
            estimated_cost: formData.estimated_cost ? formData.estimated_cost : undefined,
            actual_cost: formData.actual_cost ? formData.actual_cost : undefined,
        };

        try {
            setIsSaving(true);
            if (sidebarMode === 'edit' && selectedMilestone) {
                await milestonesApi.update(selectedMilestone.id, payload as MilestoneUpdateInput);
                toast.success('Milestone updated');
            } else {
                await milestonesApi.create(payload);
                toast.success('Milestone created');
            }
            setSidebarOpen(false);
            await invalidateMilestones();
        } catch (err: any) {
            toast.error(err?.message || `Failed to ${sidebarMode === 'edit' ? 'update' : 'create'} milestone`);
        } finally {
            setIsSaving(false);
        }
    };

    const confirmDelete = async () => {
        if (!milestoneToDelete) return;
        try {
            await milestonesApi.delete(milestoneToDelete);
            toast.success('Milestone deleted');
            setDeleteDialogOpen(false);
            setMilestoneToDelete(null);
            await invalidateMilestones();
            if (sidebarOpen && selectedMilestone?.id === milestoneToDelete) {
                setSidebarOpen(false);
            }
        } catch (err: any) {
            toast.error(err?.message || 'Failed to delete milestone');
        }
    };

    const confirmVerify = async () => {
        if (!milestoneToVerify) return;
        try {
            await milestonesApi.verify(milestoneToVerify, ceoRemarks.trim() || undefined);
            toast.success('Milestone verified');
            setVerifyDialogOpen(false);
            setMilestoneToVerify(null);
            await invalidateMilestones();
            if (sidebarOpen && selectedMilestone?.id === milestoneToVerify) {
                setSidebarOpen(false);
            }
        } catch (err: any) {
            toast.error(err?.message || 'Failed to verify milestone');
        }
    };

    // ── Table definitions ──────────────────────────────────────────────────
    const columns: Column<Milestone>[] = [
        {
            key: 'milestone_name',
            label: 'Milestone',
            sortable: true,
            render: (row) => (
                <div>
                    <span className="font-semibold text-sm">{row.milestone_name}</span>
                    <div className="text-xs text-muted-foreground mt-0.5 max-w-[200px] truncate" title={row.description || ''}>
                        {row.description || 'No description'}
                    </div>
                </div>
            )
        },
        {
            key: 'status',
            label: 'Status',
            render: (row) => (
                <Badge variant={STATUS_COLORS[row.status] || 'default'} className="capitalize">
                    {row.status.replace(/_/g, ' ')}
                </Badge>
            ),
        },
        {
            key: 'progress',
            label: 'Progress',
            render: (row) => (
                <div className="flex items-center gap-2 min-w-[100px]">
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all"
                            style={{ width: `${row.completion_percentage || 0}%` }}
                        />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground w-8">{row.completion_percentage || 0}%</span>
                </div>
            ),
        },
        {
            key: 'expected_date',
            label: 'Expected Date',
            sortable: true,
            render: (row) => (
                <span className="text-sm">
                    {row.expected_date ? new Date(row.expected_date).toLocaleDateString() : '—'}
                </span>
            ),
        },
        {
            key: 'verified_by_ceo',
            label: 'Verification',
            render: (row) => (
                <Badge variant={row.verified_by_ceo ? 'success' : 'secondary'} className="rounded-full">
                    {row.verified_by_ceo ? 'Verified' : 'Pending'}
                </Badge>
            ),
        },
        {
            key: 'actions',
            label: 'Actions',
            render: (row) => (
                <div className="flex gap-1.5">
                    <Button size="sm" variant="ghost" onClick={() => handleView(row)} title="View">
                        <Eye className="h-4 w-4" />
                    </Button>
                    {!row.verified_by_ceo && canVerify && (
                        <Button size="sm" variant="outline" className="text-green-600 border-green-200 hover:bg-green-50" onClick={() => handleVerifyClick(row.id)} title="Verify Milestone">
                            <CheckCircle className="h-4 w-4" />
                        </Button>
                    )}
                    {canManage && (
                        <>
                            <Button size="sm" variant="outline" onClick={() => handleEdit(row)} title="Edit">
                                <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDeleteClick(row.id)} title="Delete">
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
            name: 'status',
            label: 'Status',
            type: 'select',
            options: STATUS_OPTIONS.map((s) => ({ label: s.label, value: s.value })),
        },
        {
            name: 'verified_by_ceo',
            label: 'Verified',
            type: 'select',
            options: [
                { value: 'true', label: 'Verified' },
                { value: 'false', label: 'Pending' }
            ],
        }
    ];

    const isViewMode = sidebarMode === 'view';

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
                        <Flag className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold">Milestones</h2>
                        <p className="text-sm text-muted-foreground">Track project milestones and verify completions</p>
                    </div>
                </div>
                {canManage && (
                    <Button onClick={handleCreate}>
                        <Plus className="h-4 w-4 mr-1" /> New Milestone
                    </Button>
                )}
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
                searchPlaceholder="Search milestones..."
                disablePagination={false}
            />

            {/* Sidebar */}
            <DetailSidebar
                isOpen={sidebarOpen}
                onClose={handleCloseSidebar}
                title={
                    sidebarMode === 'create'
                        ? 'New Milestone'
                        : sidebarMode === 'edit'
                            ? 'Edit Milestone'
                            : selectedMilestone?.milestone_name || 'Milestone Details'
                }
                subtitle={
                    sidebarMode === 'view'
                        ? `ID #${selectedMilestone?.id} — ${project.project_name}`
                        : `Fill in milestone information for ${project.project_name}`
                }
                width="2xl"
                mode={sidebarMode}
                footer={
                    !isViewMode ? (
                        <div className="flex items-center justify-end gap-3">
                            <Button variant="outline" onClick={handleCloseSidebar}>Cancel</Button>
                            <Button onClick={handleSubmitForm} disabled={isSaving}>
                                {isSaving ? 'Saving...' : sidebarMode === 'edit' ? 'Update Milestone' : 'Create Milestone'}
                            </Button>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between w-full">
                            <div>
                                {selectedMilestone && !selectedMilestone.verified_by_ceo && canVerify && (
                                    <Button onClick={() => handleVerifyClick(selectedMilestone.id)} className="bg-green-600 hover:bg-green-700">
                                        <CheckCircle className="h-4 w-4 mr-2" /> Mark as Verified
                                    </Button>
                                )}
                            </div>
                            <Button variant="outline" onClick={handleCloseSidebar}>Close</Button>
                        </div>
                    )
                }
            >
                <div className="space-y-6">
                    {/* Project & Name */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Project *</Label>
                            <div className="p-2 border border-border rounded-md bg-muted/50 text-sm font-medium">
                                {project.project_name}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Milestone Name *</Label>
                            <Input
                                value={formData.milestone_name}
                                onChange={(e) => handleChange('milestone_name', e.target.value)}
                                placeholder="e.g. Foundation Complete"
                                disabled={isViewMode}
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                            value={formData.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                            placeholder="Details about this milestone..."
                            disabled={isViewMode}
                        />
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Expected Date</Label>
                            <Input
                                type="date"
                                value={formData.expected_date}
                                onChange={(e) => handleChange('expected_date', e.target.value)}
                                disabled={isViewMode}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Actual Completion Date</Label>
                            <Input
                                type="date"
                                value={formData.actual_completion_date}
                                onChange={(e) => handleChange('actual_completion_date', e.target.value)}
                                disabled={isViewMode}
                            />
                        </div>
                    </div>

                    {/* Status & Progress */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(v) => handleChange('status', v as MilestoneStatus)}
                                disabled={isViewMode}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {STATUS_OPTIONS.map((s) => (
                                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Completion %</Label>
                            <div className="flex items-center gap-3">
                                <Input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={formData.completion_percentage}
                                    onChange={(e) => handleChange('completion_percentage', e.target.value)}
                                    disabled={isViewMode}
                                />
                                <span className="text-muted-foreground">%</span>
                            </div>
                        </div>
                    </div>

                    {/* Cost */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Estimated Cost (₹)</Label>
                            <Input
                                type="number"
                                value={formData.estimated_cost}
                                onChange={(e) => handleChange('estimated_cost', e.target.value)}
                                placeholder="e.g. 500000"
                                disabled={isViewMode}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Actual Cost (₹)</Label>
                            <Input
                                type="number"
                                value={formData.actual_cost}
                                onChange={(e) => handleChange('actual_cost', e.target.value)}
                                placeholder="Actual spent..."
                                disabled={isViewMode}
                            />
                        </div>
                    </div>

                    {/* Read-only verification info */}
                    {isViewMode && selectedMilestone && (
                        <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3 mt-6">
                            <Label className="text-sm font-semibold">Verification & Audit Info</Label>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <span className="text-muted-foreground">CEO Verification: </span>
                                    <Badge variant={selectedMilestone.verified_by_ceo ? 'success' : 'secondary'}>
                                        {selectedMilestone.verified_by_ceo ? 'Verified' : 'Pending'}
                                    </Badge>
                                </div>
                                {selectedMilestone.verification_date && (
                                    <div>
                                        <span className="text-muted-foreground">Verified On: </span>
                                        <span>{new Date(selectedMilestone.verification_date).toLocaleDateString()}</span>
                                    </div>
                                )}
                                {selectedMilestone.ceo_remarks && (
                                    <div className="col-span-2">
                                        <span className="text-muted-foreground">CEO Remarks: </span>
                                        <span className="block mt-1 p-2 bg-background border rounded">{selectedMilestone.ceo_remarks}</span>
                                    </div>
                                )}
                                <div>
                                    <span className="text-muted-foreground">Created By: </span>
                                    <span>{selectedMilestone.created_by_name || '—'}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Last Updated: </span>
                                    <span>{new Date(selectedMilestone.updated_at).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </DetailSidebar>

            {/* Confirm Dialogs */}
            <ConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                title="Delete Milestone"
                description="Are you sure you want to delete this milestone? This cannot be undone."
                onConfirm={confirmDelete}
            />

            <ConfirmDialog
                open={verifyDialogOpen}
                onOpenChange={setVerifyDialogOpen}
                title="Verify Milestone"
                description={
                    <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            As the CEO or Construction Head, you are verifying the completion of this milestone.
                        </p>
                        <div className="space-y-2">
                            <Label>Remarks (Optional)</Label>
                            <Textarea
                                placeholder="Enter any specific remarks or observations..."
                                value={ceoRemarks}
                                onChange={(e) => setCeoRemarks(e.target.value)}
                            />
                        </div>
                    </div>
                }
                onConfirm={confirmVerify}
            />
        </div>
    );
}

