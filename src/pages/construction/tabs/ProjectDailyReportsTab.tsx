import {
    CheckCircle,
    ClipboardList,
    Edit,
    Eye,
    Minus,
    Plus,
    RotateCcw,
    Send,
    Trash2,
    X,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { dailyReportsApi } from '../../../api/constructionService';
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
import { invalidateDailyReports, useDailyReportsSWR } from '../../../hooks/useConstructionSWR';
import type {
    ConstructionProject,
    DailyReport,
    DailyReportCreateInput,
    LabourCategory,
    LabourLog,
    WeatherType,
} from '../../../types/construction.types';


// ============================================================================
// CONSTANTS
// ============================================================================

const WEATHER_OPTIONS: { value: WeatherType; label: string }[] = [
    { value: 'sunny', label: '☀️ Sunny' },
    { value: 'cloudy', label: '☁️ Cloudy' },
    { value: 'rainy', label: '🌧️ Rainy' },
    { value: 'stormy', label: '⛈️ Stormy' },
];

const LABOUR_CATEGORIES: { value: LabourCategory; label: string }[] = [
    { value: 'mason', label: 'Mason' },
    { value: 'carpenter', label: 'Carpenter' },
    { value: 'electrician', label: 'Electrician' },
    { value: 'plumber', label: 'Plumber' },
    { value: 'painter', label: 'Painter' },
    { value: 'welder', label: 'Welder' },
    { value: 'helper', label: 'Helper' },
    { value: 'supervisor', label: 'Supervisor' },
    { value: 'other', label: 'Other' },
];

const STATUS_COLORS: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
    draft: 'secondary',
    submitted: 'default',
    approved: 'outline',
    rejected: 'destructive',
    revision_requested: 'destructive',
};

const emptyLabourLog = (): Omit<LabourLog, 'id'> => ({
    labour_category: 'mason',
    count: 0,
    hours_worked: '8',
    wage_per_day: '0',
    contractor_name: '',
    remarks: '',
});

// ============================================================================
// FORM DATA TYPE
// ============================================================================

interface DailyReportFormData {
    project: string;
    report_date: string;
    weather: WeatherType;
    work_summary: string;
    labour_count_skilled: string;
    labour_count_unskilled: string;
    materials_used_summary: string;
    issues_or_delays: string;
    labour_logs: Omit<LabourLog, 'id'>[];
}

const defaultFormData: DailyReportFormData = {
    project: '', // Will be injected via props if in scoped mode
    report_date: new Date().toISOString().split('T')[0],
    weather: 'sunny',
    work_summary: '',
    labour_count_skilled: '',
    labour_count_unskilled: '',
    materials_used_summary: '',
    issues_or_delays: '',
    labour_logs: [],
};


// ============================================================================
// COMPONENT
// ============================================================================

export function ProjectDailyReportsTab({ project }: { project: ConstructionProject }) {

    // We strictly filter reports for this specific project only
    const [filters, setFilters] = useState<Record<string, any>>({
        page: 1,
        page_size: 10,
        project: project.id
    });
    const { data, isLoading } = useDailyReportsSWR(filters);

    const [drawerOpen, setDrawerOpen] = useState(false);
    const [drawerMode, setDrawerMode] = useState<'create' | 'edit' | 'view'>('create');
    const [selectedReport, setSelectedReport] = useState<DailyReport | null>(null);
    const [formData, setFormData] = useState<DailyReportFormData>({ ...defaultFormData, project: String(project.id) });
    const [isSaving, setIsSaving] = useState(false);

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [reportToDelete, setReportToDelete] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Approval-related
    const [approveDialogOpen, setApproveDialogOpen] = useState(false);
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    const [revisionDialogOpen, setRevisionDialogOpen] = useState(false);
    const [actionReportId, setActionReportId] = useState<number | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [ceoRemarks, setCeoRemarks] = useState('');
    const [isActioning, setIsActioning] = useState(false);

    // ── Helpers ────────────────────────────────────────────────────────────
    const handleChange = (field: keyof DailyReportFormData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const addLabourLog = () => {
        setFormData(prev => ({
            ...prev,
            labour_logs: [...prev.labour_logs, emptyLabourLog()],
        }));
    };

    const removeLabourLog = (index: number) => {
        setFormData(prev => ({
            ...prev,
            labour_logs: prev.labour_logs.filter((_, i) => i !== index),
        }));
    };

    const updateLabourLog = (index: number, field: keyof Omit<LabourLog, 'id'>, value: any) => {
        setFormData(prev => ({
            ...prev,
            labour_logs: prev.labour_logs.map((log, i) =>
                i === index ? { ...log, [field]: value } : log
            ),
        }));
    };

    const populateForm = (report: DailyReport) => {
        setFormData({
            project: String(report.project),
            report_date: report.report_date,
            weather: report.weather || 'sunny',
            work_summary: report.work_summary || '',
            labour_count_skilled: report.labour_count_skilled != null ? String(report.labour_count_skilled) : '',
            labour_count_unskilled: report.labour_count_unskilled != null ? String(report.labour_count_unskilled) : '',
            materials_used_summary: report.materials_used_summary || '',
            issues_or_delays: report.issues_or_delays || '',
            labour_logs: (report.labour_logs || []).map(({ id, ...rest }) => rest),
        });
    };

    // ── CRUD handlers ─────────────────────────────────────────────────────
    const handleCreate = () => {
        setSelectedReport(null);
        setFormData({ ...defaultFormData, project: String(project.id) });
        setDrawerMode('create');
        setDrawerOpen(true);
    };

    const handleEdit = (report: DailyReport) => {
        setSelectedReport(report);
        populateForm(report);
        setDrawerMode('edit');
        setDrawerOpen(true);
    };

    const handleView = (report: DailyReport) => {
        setSelectedReport(report);
        populateForm(report);
        setDrawerMode('view');
        setDrawerOpen(true);
    };

    const handleSubmitForm = async () => {
        if (!formData.project) {
            toast.error('Please select a project');
            return;
        }
        if (!formData.work_summary.trim()) {
            toast.error('Work summary is required');
            return;
        }

        const collegeId = getCollegeId();

        const payload: DailyReportCreateInput = {
            college: collegeId !== 'all' ? Number(collegeId) : undefined,
            project: Number(formData.project),
            report_date: formData.report_date,
            weather: formData.weather,
            work_summary: formData.work_summary.trim(),
            labour_count_skilled: formData.labour_count_skilled ? Number(formData.labour_count_skilled) : undefined,
            labour_count_unskilled: formData.labour_count_unskilled ? Number(formData.labour_count_unskilled) : undefined,
            materials_used_summary: formData.materials_used_summary.trim() || undefined,
            issues_or_delays: formData.issues_or_delays.trim() || undefined,
            labour_logs: formData.labour_logs.length > 0 ? formData.labour_logs : undefined,
        };

        try {
            setIsSaving(true);
            if (drawerMode === 'edit' && selectedReport) {
                await dailyReportsApi.update(selectedReport.id, payload);
                toast.success('Daily report updated');
            } else {
                await dailyReportsApi.create(payload);
                toast.success('Daily report created');
            }
            setDrawerOpen(false);
            await invalidateDailyReports();
        } catch (err: any) {
            toast.error(err?.message || `Failed to ${drawerMode === 'edit' ? 'update' : 'create'} report`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteClick = (id: number) => {
        setReportToDelete(id);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!reportToDelete) return;
        try {
            setIsDeleting(true);
            await dailyReportsApi.delete(reportToDelete);
            toast.success('Report deleted');
            setDeleteDialogOpen(false);
            setReportToDelete(null);
            await invalidateDailyReports();
        } catch (err: any) {
            toast.error(err?.message || 'Failed to delete report');
        } finally {
            setIsDeleting(false);
        }
    };

    // ── Workflow actions ──────────────────────────────────────────────────
    const handleSubmitForApproval = async (report: DailyReport) => {
        try {
            setIsActioning(true);
            await dailyReportsApi.submit(report.id);
            toast.success('Report submitted for CEO approval');
            await invalidateDailyReports();
        } catch (err: any) {
            toast.error(err?.message || 'Failed to submit report');
        } finally {
            setIsActioning(false);
        }
    };

    const confirmApprove = async () => {
        if (!actionReportId) return;
        try {
            setIsActioning(true);
            await dailyReportsApi.approve(actionReportId);
            toast.success('Report approved');
            setApproveDialogOpen(false);
            await invalidateDailyReports();
        } catch (err: any) {
            toast.error(err?.message || 'Failed to approve report');
        } finally {
            setIsActioning(false);
        }
    };

    const confirmReject = async () => {
        if (!actionReportId) return;
        try {
            setIsActioning(true);
            await dailyReportsApi.reject(actionReportId, rejectionReason);
            toast.success('Report rejected');
            setRejectDialogOpen(false);
            setRejectionReason('');
            await invalidateDailyReports();
        } catch (err: any) {
            toast.error(err?.message || 'Failed to reject report');
        } finally {
            setIsActioning(false);
        }
    };

    const confirmRequestRevision = async () => {
        if (!actionReportId) return;
        try {
            setIsActioning(true);
            await dailyReportsApi.requestRevision(actionReportId, ceoRemarks);
            toast.success('Revision requested from engineer');
            setRevisionDialogOpen(false);
            setCeoRemarks('');
            await invalidateDailyReports();
        } catch (err: any) {
            toast.error(err?.message || 'Failed to request revision');
        } finally {
            setIsActioning(false);
        }
    };

    // ── Column definitions ────────────────────────────────────────────────
    const columns: Column<DailyReport>[] = [
        {
            key: 'report_date',
            label: 'Date',
            render: (row) => (
                <span className="font-semibold">
                    {new Date(row.report_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
            ),
            sortable: true,
        },
        // Explicitly skipped project name column here because this is for a specific project.
        {
            key: 'weather',
            label: 'Weather',
            render: (row) => {
                const opt = WEATHER_OPTIONS.find((w) => w.value === row.weather);
                return <span className="text-sm">{opt?.label || row.weather || '—'}</span>;
            },
        },
        {
            key: 'work_summary',
            label: 'Summary',
            render: (row) => (
                <span className="text-sm text-muted-foreground line-clamp-2 max-w-[200px]" title={row.work_summary}>
                    {row.work_summary || '—'}
                </span>
            ),
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
            key: 'created_by_name',
            label: 'Reported By',
            render: (row) => row.reported_by_name || row.created_by_name || '—',
        },
        {
            key: 'actions',
            label: 'Actions',
            render: (row) => (
                <div className="flex gap-1.5 flex-wrap">
                    {/* View */}
                    <Button size="sm" variant="ghost" onClick={() => handleView(row)} title="View">
                        <Eye className="h-4 w-4" />
                    </Button>

                    {/* Edit — only drafts / revision_requested */}
                    {(row.status === 'draft' || row.status === 'revision_requested') && (
                        <Button size="sm" variant="outline" onClick={() => handleEdit(row)} title="Edit">
                            <Edit className="h-4 w-4" />
                        </Button>
                    )}

                    {/* Submit for approval */}
                    {(row.status === 'draft' || row.status === 'revision_requested') && (
                        <Button size="sm" onClick={() => handleSubmitForApproval(row)} disabled={isActioning} title="Submit for approval">
                            <Send className="h-4 w-4 mr-1" /> Submit
                        </Button>
                    )}

                    {/* CEO Actions — only submitted */}
                    {row.status === 'submitted' && (
                        <>
                            <Button
                                size="sm"
                                variant="outline"
                                className="text-green-600 border-green-200 hover:bg-green-50"
                                onClick={() => { setActionReportId(row.id); setApproveDialogOpen(true); }}
                                title="Approve"
                            >
                                <CheckCircle className="h-4 w-4 mr-1" /> Approve
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 border-red-200 hover:bg-red-50"
                                onClick={() => { setActionReportId(row.id); setRejectDialogOpen(true); }}
                                title="Reject"
                            >
                                <X className="h-4 w-4 mr-1" /> Reject
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                className="text-amber-600 border-amber-200 hover:bg-amber-50"
                                onClick={() => { setActionReportId(row.id); setRevisionDialogOpen(true); }}
                                title="Request Revision"
                            >
                                <RotateCcw className="h-4 w-4 mr-1" /> Revise
                            </Button>
                        </>
                    )}

                    {/* Delete — only draft */}
                    {row.status === 'draft' && (
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteClick(row.id)} title="Delete">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            ),
        },
    ];

    const tableFilters: FilterConfig[] = [
        {
            name: 'status',
            label: 'Status',
            type: 'select',
            options: [
                { label: 'Draft', value: 'draft' },
                { label: 'Submitted', value: 'submitted' },
                { label: 'Approved', value: 'approved' },
                { label: 'Rejected', value: 'rejected' },
                { label: 'Revision Requested', value: 'revision_requested' },
            ],
        }
    ];

    // ── View mode flag ────────────────────────────────────────────────────
    const isViewMode = drawerMode === 'view';

    // ── Render ─────────────────────────────────────────────────────────────
    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                        <ClipboardList className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold">Daily Reports</h2>
                        <p className="text-sm text-muted-foreground">Submit and review daily reports for this project.</p>
                    </div>
                </div>
                <Button onClick={handleCreate}>
                    <Plus className="h-4 w-4 mr-1" /> New Report
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
                searchPlaceholder="Search reports..."
                disablePagination={false}
            />

            {/* ── DetailSidebar (Create / Edit / View) ─────────────────────── */}
            <DetailSidebar
                isOpen={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                title={
                    drawerMode === 'create'
                        ? 'New Daily Report'
                        : drawerMode === 'edit'
                            ? 'Edit Daily Report'
                            : 'Daily Report Details'
                }
                subtitle={
                    drawerMode === 'view'
                        ? `Report #${selectedReport?.id} — ${project.project_name}`
                        : `Fill in the daily site progress report for ${project.project_name}`
                }
                width="2xl"
                mode={drawerMode}
                footer={
                    !isViewMode ? (
                        <div className="flex items-center justify-end gap-3">
                            <Button variant="outline" onClick={() => setDrawerOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleSubmitForm} disabled={isSaving}>
                                {isSaving ? 'Saving...' : drawerMode === 'edit' ? 'Update Report' : 'Create Report'}
                            </Button>
                        </div>
                    ) : (
                        <div className="flex items-center justify-end">
                            <Button variant="outline" onClick={() => setDrawerOpen(false)}>
                                Close
                            </Button>
                        </div>
                    )
                }
            >
                <div className="space-y-6">
                    {/* ── Row 1 : Project + Date ─── */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            {/* Project is fixed to the current project context */}
                            <Label>Project *</Label>
                            <div className="p-2 border border-border rounded-md bg-muted/50 text-sm font-medium">
                                {project.project_name}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Report Date *</Label>
                            <Input
                                type="date"
                                value={formData.report_date}
                                onChange={(e) => handleChange('report_date', e.target.value)}
                                disabled={isViewMode}
                            />
                        </div>
                    </div>

                    {/* ── Row 2: Weather ─── */}
                    <div className="space-y-2">
                        <Label>Weather</Label>
                        <Select
                            value={formData.weather}
                            onValueChange={(v) => handleChange('weather', v as WeatherType)}
                            disabled={isViewMode}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {WEATHER_OPTIONS.map((w) => (
                                    <SelectItem key={w.value} value={w.value}>
                                        {w.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* ── Work Summary ─── */}
                    <div className="space-y-2">
                        <Label>Work Summary *</Label>
                        <Textarea
                            value={formData.work_summary}
                            onChange={(e) => handleChange('work_summary', e.target.value)}
                            placeholder="Describe today's work progress..."
                            rows={4}
                            disabled={isViewMode}
                        />
                    </div>

                    {/* ── Labour Counts ─── */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Skilled Labour Count</Label>
                            <Input
                                type="number"
                                value={formData.labour_count_skilled}
                                onChange={(e) => handleChange('labour_count_skilled', e.target.value)}
                                placeholder="e.g. 12"
                                disabled={isViewMode}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Unskilled Labour Count</Label>
                            <Input
                                type="number"
                                value={formData.labour_count_unskilled}
                                onChange={(e) => handleChange('labour_count_unskilled', e.target.value)}
                                placeholder="e.g. 25"
                                disabled={isViewMode}
                            />
                        </div>
                    </div>

                    {/* ── Materials Used ─── */}
                    <div className="space-y-2">
                        <Label>Materials Used Summary</Label>
                        <Textarea
                            value={formData.materials_used_summary}
                            onChange={(e) => handleChange('materials_used_summary', e.target.value)}
                            placeholder="Cement 50 bags, Sand 2 trucks, Steel 500 kg..."
                            rows={2}
                            disabled={isViewMode}
                        />
                    </div>

                    {/* ── Issues / Delays ─── */}
                    <div className="space-y-2">
                        <Label>Issues or Delays</Label>
                        <Textarea
                            value={formData.issues_or_delays}
                            onChange={(e) => handleChange('issues_or_delays', e.target.value)}
                            placeholder="Any issues, delays, or blockers..."
                            rows={2}
                            disabled={isViewMode}
                        />
                    </div>

                    {/* ── Labour Logs (dynamic rows) ─── */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label className="text-sm font-semibold">Labour Logs</Label>
                            {!isViewMode && (
                                <Button type="button" size="sm" variant="outline" onClick={addLabourLog}>
                                    <Plus className="h-3.5 w-3.5 mr-1" /> Add Labour
                                </Button>
                            )}
                        </div>

                        {formData.labour_logs.length === 0 && (
                            <p className="text-xs text-muted-foreground italic">No labour logs added.</p>
                        )}

                        {formData.labour_logs.map((log, idx) => (
                            <div
                                key={idx}
                                className="rounded-xl border border-border bg-muted/30 p-4 space-y-3"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-muted-foreground">
                                        Labour #{idx + 1}
                                    </span>
                                    {!isViewMode && (
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="ghost"
                                            className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                                            onClick={() => removeLabourLog(idx)}
                                        >
                                            <Minus className="h-3.5 w-3.5" />
                                        </Button>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    <div className="space-y-1">
                                        <Label className="text-xs">Category</Label>
                                        <Select
                                            value={log.labour_category}
                                            onValueChange={(v) =>
                                                updateLabourLog(idx, 'labour_category', v as LabourCategory)
                                            }
                                            disabled={isViewMode}
                                        >
                                            <SelectTrigger className="h-8 text-xs">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {LABOUR_CATEGORIES.map((c) => (
                                                    <SelectItem key={c.value} value={c.value}>
                                                        {c.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-1">
                                        <Label className="text-xs">Count</Label>
                                        <Input
                                            type="number"
                                            className="h-8 text-xs"
                                            value={log.count}
                                            onChange={(e) => updateLabourLog(idx, 'count', Number(e.target.value))}
                                            disabled={isViewMode}
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <Label className="text-xs">Hours Worked</Label>
                                        <Input
                                            className="h-8 text-xs"
                                            value={log.hours_worked}
                                            onChange={(e) => updateLabourLog(idx, 'hours_worked', e.target.value)}
                                            disabled={isViewMode}
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <Label className="text-xs">Wage / Day (₹)</Label>
                                        <Input
                                            className="h-8 text-xs"
                                            value={log.wage_per_day}
                                            onChange={(e) => updateLabourLog(idx, 'wage_per_day', e.target.value)}
                                            disabled={isViewMode}
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <Label className="text-xs">Contractor</Label>
                                        <Input
                                            className="h-8 text-xs"
                                            value={log.contractor_name || ''}
                                            onChange={(e) => updateLabourLog(idx, 'contractor_name', e.target.value)}
                                            placeholder="Optional"
                                            disabled={isViewMode}
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <Label className="text-xs">Remarks</Label>
                                        <Input
                                            className="h-8 text-xs"
                                            value={log.remarks || ''}
                                            onChange={(e) => updateLabourLog(idx, 'remarks', e.target.value)}
                                            placeholder="Optional"
                                            disabled={isViewMode}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* ── View-only status info ─── */}
                    {isViewMode && selectedReport && (
                        <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-2">
                            <Label className="text-sm font-semibold">Status Information</Label>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <span className="text-muted-foreground">Status: </span>
                                    <Badge variant={STATUS_COLORS[selectedReport.status] || 'default'} className="capitalize">
                                        {selectedReport.status.replace(/_/g, ' ')}
                                    </Badge>
                                </div>
                                {selectedReport.submitted_at && (
                                    <div>
                                        <span className="text-muted-foreground">Submitted: </span>
                                        <span>{new Date(selectedReport.submitted_at).toLocaleString()}</span>
                                    </div>
                                )}
                                {selectedReport.rejection_reason && (
                                    <div className="col-span-2">
                                        <span className="text-muted-foreground">Rejection Reason: </span>
                                        <span className="text-destructive">{selectedReport.rejection_reason}</span>
                                    </div>
                                )}
                                {selectedReport.ceo_remarks && (
                                    <div className="col-span-2">
                                        <span className="text-muted-foreground">CEO Remarks: </span>
                                        <span>{selectedReport.ceo_remarks}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </DetailSidebar>

            {/* ── Confirm Dialogs ─────────────────────────────────────────── */}
            <ConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onConfirm={confirmDelete}
                title="Delete Daily Report"
                description="Are you sure you want to delete this report? This action cannot be undone."
            />

            <ConfirmDialog
                open={approveDialogOpen}
                onOpenChange={setApproveDialogOpen}
                onConfirm={confirmApprove}
                title="Approve Daily Report"
                description="Are you sure you want to approve this daily report?"
            />

            {/* Reject Dialog with reason input */}
            <ConfirmDialog
                open={rejectDialogOpen}
                onOpenChange={(open) => { setRejectDialogOpen(open); if (!open) setRejectionReason(''); }}
                onConfirm={confirmReject}
                title="Reject Daily Report"
                description={
                    <div className="space-y-3">
                        <p>Are you sure you want to reject this report? Please provide a reason.</p>
                        <Textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Reason for rejection..."
                            rows={3}
                        />
                    </div>
                }
            />

            {/* Revision Dialog with CEO remarks */}
            <ConfirmDialog
                open={revisionDialogOpen}
                onOpenChange={(open) => { setRevisionDialogOpen(open); if (!open) setCeoRemarks(''); }}
                onConfirm={confirmRequestRevision}
                title="Request Revision"
                description={
                    <div className="space-y-3">
                        <p>Request the engineer to revise this report. Add your remarks below.</p>
                        <Textarea
                            value={ceoRemarks}
                            onChange={(e) => setCeoRemarks(e.target.value)}
                            placeholder="CEO remarks / revision instructions..."
                            rows={3}
                        />
                    </div>
                }
            />
        </div>
    );
}
