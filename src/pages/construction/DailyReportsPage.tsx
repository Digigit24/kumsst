/**
 * Daily Reports Page - Construction Module
 * CRUD + approval workflow for daily site reports with DetailSidebar form.
 */

import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import {
    Building2,
    Calendar,
    CheckCircle,
    ClipboardList,
    Clock,
    Edit,
    Eye,
    HardHat,
    ListChecks,
    MapPin,
    MessageSquare,
    Minus,
    Plus,
    RotateCcw,
    Send,
    Target,
    Trash2,
    Umbrella,
    Users,
    Wrench,
    X
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import {
    dailyReportsApi,
} from '../../api/constructionService';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Column, DataTable, FilterConfig } from '../../components/common/DataTable';
import { DetailSidebar } from '../../components/common/DetailSidebar';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Separator } from '../../components/ui/separator';
import { Textarea } from '../../components/ui/textarea';
import { getCollegeId } from '../../config/api.config';
import { invalidateDailyReports, useDailyReportsSWR, useProjectsSWR } from '../../hooks/useConstructionSWR';
import type {
    DailyReport,
    DailyReportCreateInput,
    LabourCategory,
    LabourLog,
    WeatherType
} from '../../types/construction.types';

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
    project: '',
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

export function DailyReportsPage() {
    // ── State ──────────────────────────────────────────────────────────────
    const [filters, setFilters] = useState<Record<string, any>>({ page: 1, page_size: 10 });
    const { data, isLoading } = useDailyReportsSWR(filters);
    const { results: projects } = useProjectsSWR({ page_size: 500 });

    const [drawerOpen, setDrawerOpen] = useState(false);
    const [drawerMode, setDrawerMode] = useState<'create' | 'edit' | 'view'>('create');
    const [selectedReport, setSelectedReport] = useState<DailyReport | null>(null);
    const [formData, setFormData] = useState<DailyReportFormData>({ ...defaultFormData });
    const [isSaving, setIsSaving] = useState(false);

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
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
        setFormData({ ...defaultFormData });
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
        setViewDialogOpen(true);
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
        {
            key: 'project_name',
            label: 'Project',
            render: (row) => row.project_name || `Project #${row.project}`,
        },
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
        },
        {
            name: 'project',
            label: 'Project',
            type: 'select',
            options: projects.map((p) => ({ label: p.project_name, value: String(p.id) })),
        },
    ];

    // ── View mode flag ────────────────────────────────────────────────────
    const isViewMode = drawerMode === 'view';

    // ── Render ─────────────────────────────────────────────────────────────
    return (
        <div className="p-4 md:p-6 flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                        <ClipboardList className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold">Daily Reports</h1>
                        <p className="text-xs text-muted-foreground">Submit and review daily site reports</p>
                    </div>
                </div>
                <Button onClick={handleCreate}>
                    <Plus className="h-4 w-4 mr-1" /> New Report
                </Button>
            </div>

            {/* DataTable */}
            <DataTable
                columns={columns}
                data={data ?? null}
                isLoading={isLoading}
                filters={filters}
                onFiltersChange={setFilters}
                filterConfig={tableFilters}
                searchPlaceholder="Search reports..."
                onRowClick={handleView}
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
                        ? `Report #${selectedReport?.id} — ${selectedReport?.project_name || ''}`
                        : 'Fill in the daily site progress report'
                }
                width="2xl"
                mode={drawerMode}
                footer={
                    <div className="flex items-center justify-end gap-3">
                        <Button variant="outline" onClick={() => setDrawerOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSubmitForm} disabled={isSaving}>
                            {isSaving ? 'Saving...' : drawerMode === 'edit' ? 'Update Report' : 'Create Report'}
                        </Button>
                    </div>
                }
            >
                <div className="space-y-6">
                    {/* ── Row 1 : Project + Date ─── */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Project *</Label>
                            <Select
                                value={formData.project}
                                onValueChange={(v) => handleChange('project', v)}
                                disabled={isViewMode}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select project" />
                                </SelectTrigger>
                                <SelectContent>
                                    {projects.map((p) => (
                                        <SelectItem key={p.id} value={String(p.id)}>
                                            {p.project_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
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

            {/* ── Premium Report View Dialog ─────────────────────────────── */}
            <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
                <DialogContent className="sm:max-w-3xl w-[95vw] p-0 border-0 bg-white dark:bg-[#0B1120] rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden [&>button]:z-[100] [&>button]:right-4 sm:[&>button]:right-6 [&>button]:top-4 sm:[&>button]:top-6 [&>button]:bg-white/80 dark:[&>button]:bg-slate-800/80 backdrop-blur-sm [&>button]:p-2 sm:[&>button]:p-2.5 [&>button]:rounded-xl sm:[&>button]:rounded-2xl transition-all [&>button]:border [&>button]:border-slate-200/50 dark:[&>button]:border-slate-700/50 [&>button]:opacity-100 flex flex-col max-h-[85vh]">
                    {selectedReport && (
                        <div className="relative flex-1 min-h-0 flex flex-col">
                            {/* Premium Background Elements */}
                            <div className="absolute top-0 left-0 w-full h-[300px] pointer-events-none overflow-hidden">
                                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[100%] bg-emerald-500/10 dark:bg-emerald-500/20 rounded-full blur-[100px] animate-pulse" />
                                <div className="absolute top-[10%] right-[-5%] w-[40%] h-[80%] bg-teal-500/10 dark:bg-teal-500/15 rounded-full blur-[80px] animate-pulse delay-700" />
                            </div>

                            <ScrollArea className="flex-1 w-full h-full overflow-y-auto">
                                <div className="p-6 sm:p-8 relative z-10">
                                    <DialogHeader className="mb-6 p-0 space-y-3">
                                        <div className="flex flex-wrap items-center gap-3">
                                            <Badge
                                                className={cn(
                                                    "uppercase text-[10px] font-black tracking-widest px-4 py-1.5 rounded-full border-0 shadow-sm transition-all hover:scale-105",
                                                    STATUS_COLORS[selectedReport.status] === 'default' ? "bg-emerald-500 text-white" :
                                                        STATUS_COLORS[selectedReport.status] === 'secondary' ? "bg-amber-500 text-white" :
                                                            STATUS_COLORS[selectedReport.status] === 'outline' ? "bg-blue-500 text-white" :
                                                                "bg-red-500 text-white"
                                                )}
                                            >
                                                <span className="w-2 h-2 rounded-full bg-white mr-2 inline-block animate-pulse" />
                                                {selectedReport.status.replace(/_/g, ' ')}
                                            </Badge>
                                            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 flex items-center gap-1.5 uppercase tracking-widest">
                                                <Target className="w-3 h-3" />
                                                Report #{selectedReport.id}
                                            </span>
                                        </div>
                                        <DialogTitle className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 leading-[1.2] tracking-tight text-left">
                                            {selectedReport.project_name || 'Project Progress'}
                                        </DialogTitle>
                                    </DialogHeader>

                                    <div className="space-y-10">
                                        {/* Core Stats Bar */}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {[
                                                { label: 'Report Date', value: format(new Date(selectedReport.report_date), 'MMM d, yyyy'), icon: Calendar, color: 'text-emerald-500' },
                                                { label: 'Weather', value: WEATHER_OPTIONS.find(w => w.value === selectedReport.weather)?.label || selectedReport.weather, icon: Umbrella, color: 'text-sky-500' },
                                                { label: 'Skilled Labs', value: selectedReport.labour_count_skilled ?? 0, icon: Users, color: 'text-blue-500' },
                                                { label: 'Unskilled Labs', value: selectedReport.labour_count_unskilled ?? 0, icon: HardHat, color: 'text-teal-500' },
                                            ].map((stat, i) => (
                                                <div key={i} className="flex flex-col gap-2 p-4 rounded-3xl bg-slate-50/80 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-700/30 backdrop-blur-md">
                                                    <div className={cn("p-2 w-fit rounded-xl bg-white dark:bg-slate-800 shadow-sm", stat.color)}>
                                                        <stat.icon className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
                                                        <p className="text-sm font-bold text-slate-900 dark:text-white">{stat.value}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <Separator className="bg-slate-100 dark:bg-slate-800/60" />

                                        {/* Work Summary Section */}
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2">
                                                <ListChecks className="w-5 h-5 text-emerald-500" />
                                                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Work Summary</h3>
                                            </div>
                                            <div className="p-6 md:p-8 rounded-[2rem] bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/20 dark:to-slate-900/20 border border-slate-100 dark:border-slate-800/60 shadow-sm">
                                                <p className="text-[1.1rem] leading-[1.8] text-slate-600 dark:text-slate-300 whitespace-pre-wrap font-medium">
                                                    {selectedReport.work_summary}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Grid for Materials & Issues */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-2">
                                                    <Wrench className="w-5 h-5 text-teal-500" />
                                                    <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight uppercase">Materials Used</h3>
                                                </div>
                                                <div className="p-6 rounded-3xl bg-slate-50/50 dark:bg-slate-800/10 border border-slate-100 dark:border-slate-800/60 min-h-[140px]">
                                                    <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 font-medium">
                                                        {selectedReport.materials_used_summary || 'No material data reported for this period.'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-5 h-5 text-red-500" />
                                                    <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight uppercase">Issues & Delays</h3>
                                                </div>
                                                <div className="p-6 rounded-3xl bg-slate-50/50 dark:bg-slate-800/10 border border-slate-100 dark:border-slate-800/60 min-h-[140px]">
                                                    <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 font-medium">
                                                        {selectedReport.issues_or_delays || 'The project proceeded according to schedule with no major issues reported.'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Labour Logs Section */}
                                        {selectedReport.labour_logs && selectedReport.labour_logs.length > 0 && (
                                            <div className="space-y-6">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <Users className="w-5 h-5 text-blue-500" />
                                                        <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight uppercase">Detailed Labour Logs</h3>
                                                    </div>
                                                    <Badge variant="outline" className="rounded-xl px-4 py-1 text-xs font-bold bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/30 text-blue-600 dark:text-blue-400">
                                                        {selectedReport.labour_logs.length} Skilled Categories
                                                    </Badge>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {selectedReport.labour_logs.map((log, idx) => (
                                                        <div key={idx} className="group relative p-6 rounded-[2rem] bg-white dark:bg-[#151b2b] border border-slate-100 dark:border-slate-800/80 shadow-sm hover:shadow-md hover:border-blue-500/30 transition-all duration-300 overflow-hidden text-left">
                                                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-colors" />

                                                            <div className="relative z-10 space-y-4">
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex flex-col">
                                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Category</span>
                                                                        <span className="text-lg font-black text-slate-900 dark:text-white mt-1 capitalize">{log.labour_category}</span>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Strength</span>
                                                                        <div className="flex items-center gap-1.5 mt-1 justify-end">
                                                                            <span className="text-xl font-black text-blue-500">{log.count}</span>
                                                                            <span className="text-xs font-bold text-slate-400">Units</span>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50 dark:border-slate-800/50">
                                                                    <div>
                                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Duration</p>
                                                                        <p className="text-xs font-bold text-slate-900 dark:text-white mt-1 text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-teal-500 inline-block">{log.hours_worked} Hours</p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Wages (₹)</p>
                                                                        <p className="text-xs font-bold text-slate-900 dark:text-white mt-1">₹ {log.wage_per_day}/day</p>
                                                                    </div>
                                                                    {log.contractor_name && (
                                                                        <div className="col-span-2">
                                                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contractor</p>
                                                                            <p className="text-xs font-bold text-slate-900 dark:text-white mt-1 truncate">{log.contractor_name}</p>
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                {log.remarks && (
                                                                    <div className="pt-2 italic text-[10px] text-slate-500 dark:text-slate-500 border-t border-dashed border-slate-100 dark:border-slate-800">
                                                                        "{log.remarks}"
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Status Info (History/Remarks) */}
                                        {(selectedReport.status !== 'draft') && (
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-2">
                                                    <MessageSquare className="w-5 h-5 text-amber-500" />
                                                    <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight uppercase">CEO Feedback & History</h3>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="p-6 rounded-3xl bg-amber-50/30 dark:bg-amber-500/5 border border-amber-100/50 dark:border-amber-500/20 text-left">
                                                        <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">CEO Remarks</span>
                                                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mt-2">
                                                            {selectedReport.ceo_remarks || 'No remarks provided by CEO.'}
                                                        </p>
                                                    </div>
                                                    {selectedReport.rejection_reason && (
                                                        <div className="p-6 rounded-3xl bg-red-50/30 dark:bg-red-500/5 border border-red-100/50 dark:border-red-500/20 text-left">
                                                            <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Rejection Reason</span>
                                                            <p className="text-sm font-bold text-red-700 dark:text-red-400 mt-2">
                                                                {selectedReport.rejection_reason}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Reporter/Footer Section */}
                                        <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-6 p-8 rounded-[2.5rem] bg-slate-900 dark:bg-slate-800/40 text-white relative overflow-hidden group shadow-xl">
                                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/20 to-teal-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                                            <div className="flex items-center gap-4 relative z-10 w-full md:w-auto">
                                                <Avatar className="h-16 w-14 rounded-2xl border-2 border-white/20 shadow-2xl">
                                                    <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-500 text-white font-black text-xl">
                                                        {(selectedReport.reported_by_name || selectedReport.created_by_name || 'AD').split(' ').map(n => n[0]).join('').toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="space-y-1 text-left">
                                                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest leading-none">Reported By</p>
                                                    <h4 className="text-xl font-black tracking-tight">{selectedReport.reported_by_name || selectedReport.created_by_name || 'Administrator'}</h4>
                                                    <div className="flex items-center gap-3 text-xs font-bold text-white/60">
                                                        <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> KUMSS Engineering</span>
                                                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> Site Office</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="relative z-10 text-center md:text-right hidden sm:block">
                                                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest leading-none mb-2">Authenticity Guaranteed</p>
                                                <div className="flex items-center gap-2 bg-emerald-500/20 px-4 py-2 rounded-2xl border border-emerald-500/30">
                                                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                                                    <span className="text-xs font-black tracking-wide text-emerald-400 uppercase">Electronically Signed</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </ScrollArea>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
