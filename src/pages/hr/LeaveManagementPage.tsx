/**
 * Leave Management Hub — Premium Edition
 * Glassmorphism header · Gradient stat cards · Animated tabs · Rich cards
 */

import {
    AlertCircle,
    ArrowRight,
    BadgeCheck,
    Briefcase,
    CalendarDays,
    Check,
    CheckCircle2,
    ChevronRight,
    Clock,
    FileText,
    Loader2,
    Pencil,
    Plus,
    Search,
    Settings,
    Sparkles,
    ThumbsDown,
    ThumbsUp,
    Trash2,
    TrendingUp,
    Users,
    X,
    XCircle,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { DetailSidebar } from '../../components/common/DetailSidebar';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import {
    useCreateLeaveApplication,
    useCreateLeaveApproval,
    useCreateLeaveBalance,
    useCreateLeaveType,
    useDeleteLeaveApplication,
    useDeleteLeaveBalance,
    useDeleteLeaveType,
    useLeaveApplications,
    useLeaveBalances,
    useLeaveTypes,
    useUpdateLeaveApplication,
    useUpdateLeaveBalance,
    useUpdateLeaveType,
} from '../../hooks/useHR';
import { cn } from '../../lib/utils';
import { LeaveApplicationForm } from './forms/LeaveApplicationForm';
import { LeaveBalanceForm } from './forms/LeaveBalanceForm';
import { LeaveTypeForm } from './forms/LeaveTypeForm';

// ─── Types ────────────────────────────────────────────────────────────────────
type Tab = 'overview' | 'applications' | 'approvals' | 'balances' | 'settings';

// ─── Status config ────────────────────────────────────────────────────────────
const statusConfig: Record<string, { label: string; color: string; bg: string; border: string; dot: string; icon: React.ReactNode }> = {
    pending: {
        label: 'Pending',
        color: 'text-amber-700 dark:text-amber-300',
        bg: 'bg-amber-50 dark:bg-amber-900/30',
        border: 'border-amber-200 dark:border-amber-700',
        dot: 'bg-amber-400',
        icon: <Clock className="h-3 w-3" />,
    },
    approved: {
        label: 'Approved',
        color: 'text-emerald-700 dark:text-emerald-300',
        bg: 'bg-emerald-50 dark:bg-emerald-900/30',
        border: 'border-emerald-200 dark:border-emerald-700',
        dot: 'bg-emerald-500',
        icon: <CheckCircle2 className="h-3 w-3" />,
    },
    rejected: {
        label: 'Rejected',
        color: 'text-rose-700 dark:text-rose-300',
        bg: 'bg-rose-50 dark:bg-rose-900/30',
        border: 'border-rose-200 dark:border-rose-700',
        dot: 'bg-rose-500',
        icon: <XCircle className="h-3 w-3" />,
    },
};

const StatusBadge = ({ status }: { status: string }) => {
    const cfg = statusConfig[status] || statusConfig.pending;
    return (
        <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border', cfg.color, cfg.bg, cfg.border)}>
            <span className={cn('h-1.5 w-1.5 rounded-full', cfg.dot)} />
            {cfg.label}
        </span>
    );
};

// ─── Balance Bar ──────────────────────────────────────────────────────────────
const BalanceBar = ({ total, used, label }: { total: number; used: number; label: string }) => {
    const balance = total - used;
    const pct = total > 0 ? Math.round((balance / total) * 100) : 0;
    const gradient = pct > 50 ? 'from-emerald-400 to-emerald-500' : pct > 25 ? 'from-amber-400 to-orange-400' : 'from-rose-400 to-rose-500';
    const textColor = pct > 50 ? 'text-emerald-600 dark:text-emerald-400' : pct > 25 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400';
    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-foreground truncate pr-2">{label}</span>
                <span className={cn('font-bold tabular-nums shrink-0', textColor)}>{balance}/{total}d</span>
            </div>
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div className={cn('h-full rounded-full bg-gradient-to-r transition-all duration-700', gradient)} style={{ width: `${pct}%` }} />
            </div>
            <div className="flex justify-between text-[11px] text-muted-foreground">
                <span>{used} used</span>
                <span>{pct}% remaining</span>
            </div>
        </div>
    );
};

// ─── Inline Approve/Reject ────────────────────────────────────────────────────
const ApproveRejectPanel = ({ app, onApprove, onReject, isLoading }: {
    app: any; onApprove: (id: number, r: string) => void; onReject: (id: number, r: string) => void; isLoading: boolean;
}) => {
    const [remarks, setRemarks] = useState('');
    const [open, setOpen] = useState(false);
    if (app.status !== 'pending') return null;
    return (
        <div className="mt-3 pt-3 border-t border-border/40 space-y-2">
            {!open ? (
                <div className="flex gap-2">
                    <button
                        onClick={() => setOpen(true)}
                        disabled={isLoading}
                        className="flex-1 flex items-center justify-center gap-1.5 h-8 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold transition-all shadow-sm hover:shadow-emerald-200 dark:hover:shadow-emerald-900"
                    >
                        <ThumbsUp className="h-3.5 w-3.5" /> Approve
                    </button>
                    <button
                        onClick={() => { onReject(app.id, ''); }}
                        disabled={isLoading}
                        className="flex-1 flex items-center justify-center gap-1.5 h-8 rounded-lg border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-xs font-semibold transition-all"
                    >
                        <ThumbsDown className="h-3.5 w-3.5" /> Reject
                    </button>
                </div>
            ) : (
                <div className="space-y-2 p-3 rounded-xl bg-muted/40 border border-border/50 animate-in slide-in-from-top-2 duration-200">
                    <Label className="text-xs font-medium text-muted-foreground">Remarks (optional)</Label>
                    <Textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Add a note..." rows={2} className="text-sm resize-none" />
                    <div className="flex gap-2">
                        <button
                            onClick={() => { onApprove(app.id, remarks); setOpen(false); }}
                            disabled={isLoading}
                            className="flex-1 flex items-center justify-center gap-1.5 h-8 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold transition-all"
                        >
                            {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                            Confirm
                        </button>
                        <button onClick={() => setOpen(false)} className="px-3 h-8 rounded-lg text-xs text-muted-foreground hover:bg-muted transition-all">Cancel</button>
                    </div>
                </div>
            )}
        </div>
    );
};

// ─── Application Card ─────────────────────────────────────────────────────────
const AVATAR_COLORS = [
    'from-violet-500 to-purple-600',
    'from-blue-500 to-cyan-500',
    'from-emerald-500 to-teal-500',
    'from-orange-500 to-amber-500',
    'from-rose-500 to-pink-500',
    'from-indigo-500 to-blue-600',
];
const getAvatarColor = (name: string) => AVATAR_COLORS[(name?.charCodeAt(0) || 0) % AVATAR_COLORS.length];

const ApplicationCard = ({ app, onApprove, onReject, onEdit, onDelete, isApproving }: {
    app: any; onApprove: (id: number, r: string) => void; onReject: (id: number, r: string) => void;
    onEdit: (a: any) => void; onDelete: (a: any) => void; isApproving: boolean;
}) => {
    const fromDate = new Date(app.from_date);
    const toDate = new Date(app.to_date);
    const name = app.teacher_name || `Teacher #${app.teacher}`;
    const avatarGrad = getAvatarColor(name);
    const statusStripe = { pending: 'bg-amber-400', approved: 'bg-emerald-500', rejected: 'bg-rose-500' }[app.status as string] || 'bg-muted';

    return (
        <div className={cn(
            'group relative bg-card border rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5',
            app.status === 'pending' && 'border-amber-200/70 dark:border-amber-800/50',
            app.status === 'approved' && 'border-emerald-200/70 dark:border-emerald-800/50',
            app.status === 'rejected' && 'border-rose-200/70 dark:border-rose-800/50 opacity-80',
        )}>
            {/* Top accent stripe */}
            <div className={cn('h-1 w-full', statusStripe)} />

            <div className="p-4">
                {/* Header row */}
                <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className={cn('h-10 w-10 rounded-xl bg-gradient-to-br flex items-center justify-center shrink-0 text-white font-bold text-sm shadow-sm', avatarGrad)}>
                            {name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                            <p className="font-semibold text-foreground truncate text-sm">{name}</p>
                            <p className="text-xs text-muted-foreground truncate">{app.leave_type_name || 'Leave'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                        <StatusBadge status={app.status} />
                        {app.status === 'pending' && (
                            <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => onEdit(app)} className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-muted transition-colors">
                                    <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                                </button>
                                <button onClick={() => onDelete(app)} className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors">
                                    <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Date range pill */}
                <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/50 text-xs text-muted-foreground">
                    <CalendarDays className="h-3.5 w-3.5 shrink-0 text-primary/60" />
                    <span className="font-medium text-foreground">{fromDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                    <ArrowRight className="h-3 w-3" />
                    <span className="font-medium text-foreground">{toDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    <span className="ml-auto font-bold text-foreground">{app.total_days}d</span>
                </div>

                {/* Reason */}
                {app.reason && (
                    <p className="mt-2.5 text-xs text-muted-foreground italic line-clamp-2 px-1">"{app.reason}"</p>
                )}

                <ApproveRejectPanel app={app} onApprove={onApprove} onReject={onReject} isLoading={isApproving} />
            </div>
        </div>
    );
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon, gradient, onClick }: {
    label: string; value: number; icon: React.ReactNode; gradient: string; onClick?: () => void;
}) => (
    <button
        onClick={onClick}
        className={cn(
            'relative overflow-hidden rounded-2xl p-5 text-left transition-all duration-200 hover:scale-[1.02] hover:shadow-xl w-full',
            'bg-gradient-to-br text-white shadow-lg',
            gradient
        )}
    >
        <div className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition-opacity" />
        <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-white/10" />
        <div className="absolute -right-2 -bottom-6 h-16 w-16 rounded-full bg-white/10" />
        <div className="relative">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-white/80 text-xs font-medium uppercase tracking-wider">{label}</p>
                    <p className="text-4xl font-bold mt-1 tabular-nums">{value}</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
                    {icon}
                </div>
            </div>
        </div>
    </button>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const LeaveManagementPage = () => {
    const [activeTab, setActiveTab] = useState<Tab>('overview');
    const [appSearch, setAppSearch] = useState('');
    const [balSearch, setBalSearch] = useState('');
    const [appStatusFilter, setAppStatusFilter] = useState('all');

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarMode, setSidebarMode] = useState<'create' | 'edit' | 'view'>('create');
    const [sidebarType, setSidebarType] = useState<'application' | 'balance' | 'type'>('application');
    const [selectedItem, setSelectedItem] = useState<any>(null);

    // Data
    const { data: appsData, isLoading: appsLoading, refetch: refreshApps } = useLeaveApplications({ page_size: 100 });
    const { data: balsData, isLoading: balsLoading, refetch: refreshBals } = useLeaveBalances({ page_size: 100 });
    const { data: typesData, isLoading: typesLoading, refetch: refreshTypes } = useLeaveTypes({ page_size: 100 });

    // Mutations
    const createApp = useCreateLeaveApplication();
    const updateApp = useUpdateLeaveApplication();
    const deleteApp = useDeleteLeaveApplication();
    const createApproval = useCreateLeaveApproval();
    const createBal = useCreateLeaveBalance();
    const updateBal = useUpdateLeaveBalance();
    const deleteBal = useDeleteLeaveBalance();
    const createType = useCreateLeaveType();
    const updateType = useUpdateLeaveType();
    const deleteType = useDeleteLeaveType();

    const apps = appsData?.results || [];
    const bals = balsData?.results || [];
    const types = typesData?.results || [];

    const stats = useMemo(() => {
        const pending = apps.filter((a: any) => a.status === 'pending').length;
        const approved = apps.filter((a: any) => a.status === 'approved').length;
        const rejected = apps.filter((a: any) => a.status === 'rejected').length;
        const totalDays = apps.filter((a: any) => a.status === 'approved').reduce((s: number, a: any) => s + (a.total_days || 0), 0);
        return { pending, approved, rejected, total: apps.length, totalDays };
    }, [apps]);

    const filteredApps = useMemo(() => {
        let list = apps;
        if (appStatusFilter !== 'all') list = list.filter((a: any) => a.status === appStatusFilter);
        if (appSearch) {
            const q = appSearch.toLowerCase();
            list = list.filter((a: any) => (a.teacher_name || '').toLowerCase().includes(q) || (a.leave_type_name || '').toLowerCase().includes(q));
        }
        return list;
    }, [apps, appStatusFilter, appSearch]);

    const filteredBals = useMemo(() => {
        if (!balSearch) return bals;
        const q = balSearch.toLowerCase();
        return bals.filter((b: any) => (b.teacher_name || '').toLowerCase().includes(q) || (b.leave_type_name || '').toLowerCase().includes(q));
    }, [bals, balSearch]);

    // ── Handlers ──────────────────────────────────────────────────────────────
    const openSidebar = (type: typeof sidebarType, mode: typeof sidebarMode, item?: any) => {
        setSidebarType(type); setSidebarMode(mode); setSelectedItem(item || null); setSidebarOpen(true);
    };

    const handleApprove = async (appId: number, remarks: string) => {
        try {
            await createApproval.mutateAsync({ application: appId, status: 'approved', approval_date: new Date().toISOString().split('T')[0], remarks });
            toast.success('Leave approved ✓');
            refreshApps();
        } catch (err: any) { toast.error(err?.message || 'Failed to approve'); }
    };

    const handleReject = async (appId: number, remarks: string) => {
        try {
            await createApproval.mutateAsync({ application: appId, status: 'rejected', approval_date: new Date().toISOString().split('T')[0], remarks });
            toast.success('Leave rejected');
            refreshApps();
        } catch (err: any) { toast.error(err?.message || 'Failed to reject'); }
    };

    const handleAppSubmit = async (data: any) => {
        try {
            if (sidebarMode === 'create') { await createApp.mutateAsync(data); toast.success('Application submitted ✓'); }
            else { await updateApp.mutateAsync({ id: selectedItem.id, data }); toast.success('Application updated'); }
            setSidebarOpen(false); refreshApps();
        } catch (err: any) { toast.error(err?.message || 'Failed to save'); }
    };

    const handleDeleteApp = async (app: any) => {
        if (!window.confirm(`Delete leave application for ${app.teacher_name}?`)) return;
        try { await deleteApp.mutateAsync(app.id); toast.success('Deleted'); refreshApps(); }
        catch (err: any) { toast.error(err?.message || 'Failed to delete'); }
    };

    const handleBalSubmit = async (data: any) => {
        try {
            if (sidebarMode === 'create') { await createBal.mutateAsync(data); toast.success('Balance created'); }
            else { await updateBal.mutateAsync({ id: selectedItem.id, data }); toast.success('Balance updated'); }
            setSidebarOpen(false); refreshBals();
        } catch (err: any) { toast.error(err?.message || 'Failed to save'); }
    };

    const handleDeleteBal = async (bal: any) => {
        if (!window.confirm(`Delete balance for ${bal.teacher_name}?`)) return;
        try { await deleteBal.mutateAsync(bal.id); toast.success('Deleted'); refreshBals(); }
        catch (err: any) { toast.error(err?.message || 'Failed to delete'); }
    };

    const handleTypeSubmit = async (data: any) => {
        try {
            if (sidebarMode === 'create') { await createType.mutateAsync(data); toast.success('Leave type created'); }
            else { await updateType.mutateAsync({ id: selectedItem.id, data }); toast.success('Leave type updated'); }
            setSidebarOpen(false); refreshTypes();
        } catch (err: any) { toast.error(err?.message || 'Failed to save'); }
    };

    const handleDeleteType = async (type: any) => {
        if (!window.confirm(`Delete leave type "${type.name}"?`)) return;
        try { await deleteType.mutateAsync(type.id); toast.success('Deleted'); refreshTypes(); }
        catch (err: any) { toast.error(err?.message || 'Failed to delete'); }
    };

    // ── Tabs ──────────────────────────────────────────────────────────────────
    const tabs: { id: Tab; label: string; icon: React.ReactNode; badge?: number }[] = [
        { id: 'overview', label: 'Overview', icon: <TrendingUp className="h-4 w-4" /> },
        { id: 'applications', label: 'Applications', icon: <FileText className="h-4 w-4" />, badge: stats.pending || undefined },
        { id: 'approvals', label: 'Approvals', icon: <BadgeCheck className="h-4 w-4" />, badge: stats.pending || undefined },
        { id: 'balances', label: 'Balances', icon: <Users className="h-4 w-4" /> },
        { id: 'settings', label: 'Leave Types', icon: <Settings className="h-4 w-4" /> },
    ];

    const renderSidebarContent = () => {
        if (sidebarType === 'application') return <LeaveApplicationForm item={sidebarMode === 'edit' ? selectedItem : null} onSubmit={handleAppSubmit} onCancel={() => setSidebarOpen(false)} />;
        if (sidebarType === 'balance') return <LeaveBalanceForm item={sidebarMode === 'edit' ? selectedItem : null} onSubmit={handleBalSubmit} onCancel={() => setSidebarOpen(false)} />;
        if (sidebarType === 'type') return <LeaveTypeForm item={sidebarMode === 'edit' ? selectedItem : null} onSubmit={handleTypeSubmit} onCancel={() => setSidebarOpen(false)} />;
        return null;
    };

    const sidebarTitle = { application: sidebarMode === 'create' ? 'Apply for Leave' : 'Edit Application', balance: sidebarMode === 'create' ? 'Add Leave Balance' : 'Edit Balance', type: sidebarMode === 'create' ? 'New Leave Type' : 'Edit Leave Type' }[sidebarType];
    const hasNoTypes = !typesLoading && types.length === 0;

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-300">

            {/* ── Premium Header ── */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-violet-600 p-6 text-white shadow-xl">
                {/* Decorative circles */}
                <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10" />
                <div className="absolute right-16 -bottom-10 h-28 w-28 rounded-full bg-white/10" />
                <div className="absolute right-4 top-4 h-12 w-12 rounded-full bg-white/10" />

                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                            <Briefcase className="h-7 w-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Leave Management</h1>
                            <p className="text-white/70 text-sm mt-0.5">Applications · Approvals · Balances · Policies</p>
                        </div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        {activeTab === 'applications' && (
                            <button onClick={() => openSidebar('application', 'create')} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-primary font-semibold text-sm hover:bg-white/90 transition-all shadow-md hover:shadow-lg">
                                <Plus className="h-4 w-4" /> Apply for Leave
                            </button>
                        )}
                        {activeTab === 'balances' && (
                            <button onClick={() => openSidebar('balance', 'create')} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-primary font-semibold text-sm hover:bg-white/90 transition-all shadow-md">
                                <Plus className="h-4 w-4" /> Add Balance
                            </button>
                        )}
                        {activeTab === 'settings' && (
                            <button onClick={() => openSidebar('type', 'create')} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-primary font-semibold text-sm hover:bg-white/90 transition-all shadow-md">
                                <Plus className="h-4 w-4" /> New Leave Type
                            </button>
                        )}
                        {activeTab === 'overview' && (
                            <button onClick={() => openSidebar('application', 'create')} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white font-semibold text-sm transition-all border border-white/30">
                                <Plus className="h-4 w-4" /> Quick Apply
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* ── No Leave Types Warning ── */}
            {hasNoTypes && activeTab !== 'settings' && (
                <div className="flex items-start gap-4 p-4 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
                    <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <p className="font-semibold text-amber-800 dark:text-amber-300">No Leave Types Configured</p>
                        <p className="text-sm text-amber-700 dark:text-amber-400 mt-0.5">Configure at least one leave type before staff can apply for leave.</p>
                    </div>
                    <Button size="sm" variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-100 shrink-0" onClick={() => setActiveTab('settings')}>
                        Configure <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                </div>
            )}

            {/* ── Tab Navigation ── */}
            <div className="flex gap-1 p-1.5 bg-muted/50 rounded-2xl border border-border/40 overflow-x-auto">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                            'relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap flex-1 justify-center',
                            activeTab === tab.id
                                ? 'bg-background text-foreground shadow-md border border-border/50'
                                : 'text-muted-foreground hover:text-foreground hover:bg-background/60'
                        )}
                    >
                        {tab.icon}
                        <span className="hidden sm:inline">{tab.label}</span>
                        {tab.badge && tab.badge > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
                                {tab.badge > 9 ? '9+' : tab.badge}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* ══════════════════════════════════════════════════════════════════
                OVERVIEW TAB
            ══════════════════════════════════════════════════════════════════ */}
            {activeTab === 'overview' && (
                <div className="space-y-6">
                    {/* Gradient Stat Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard label="Total Applications" value={stats.total} gradient="from-blue-500 to-indigo-600" icon={<FileText className="h-5 w-5 text-white" />} onClick={() => setActiveTab('applications')} />
                        <StatCard label="Pending Review" value={stats.pending} gradient="from-amber-500 to-orange-500" icon={<Clock className="h-5 w-5 text-white" />} onClick={() => setActiveTab('approvals')} />
                        <StatCard label="Approved" value={stats.approved} gradient="from-emerald-500 to-teal-500" icon={<CheckCircle2 className="h-5 w-5 text-white" />} />
                        <StatCard label="Days Approved" value={stats.totalDays} gradient="from-violet-500 to-purple-600" icon={<CalendarDays className="h-5 w-5 text-white" />} />
                    </div>

                    {/* Two-column summary */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Pending Approvals */}
                        <Card className="border-border/50 shadow-sm">
                            <CardHeader className="pb-3 border-b border-border/40">
                                <CardTitle className="text-sm font-semibold flex items-center justify-between">
                                    <span className="flex items-center gap-2">
                                        <span className="h-7 w-7 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                                            <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                        </span>
                                        Pending Approvals
                                        {stats.pending > 0 && <span className="ml-1 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-bold">{stats.pending}</span>}
                                    </span>
                                    {stats.pending > 0 && (
                                        <button onClick={() => setActiveTab('approvals')} className="text-xs text-primary hover:underline flex items-center gap-1">
                                            View all <ChevronRight className="h-3.5 w-3.5" />
                                        </button>
                                    )}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-3">
                                {appsLoading ? Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-14 rounded-xl bg-muted/30 animate-pulse" />) :
                                    apps.filter((a: any) => a.status === 'pending').length === 0 ? (
                                        <div className="text-center py-10">
                                            <div className="h-12 w-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-3">
                                                <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                                            </div>
                                            <p className="text-sm font-medium text-foreground">All caught up!</p>
                                            <p className="text-xs text-muted-foreground mt-1">No pending approvals.</p>
                                        </div>
                                    ) : apps.filter((a: any) => a.status === 'pending').slice(0, 3).map((app: any) => (
                                        <ApplicationCard key={app.id} app={app} onApprove={handleApprove} onReject={handleReject} onEdit={(a) => openSidebar('application', 'edit', a)} onDelete={handleDeleteApp} isApproving={createApproval.isPending} />
                                    ))
                                }
                            </CardContent>
                        </Card>

                        {/* Leave Types */}
                        <Card className="border-border/50 shadow-sm">
                            <CardHeader className="pb-3 border-b border-border/40">
                                <CardTitle className="text-sm font-semibold flex items-center justify-between">
                                    <span className="flex items-center gap-2">
                                        <span className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
                                            <Sparkles className="h-4 w-4 text-primary" />
                                        </span>
                                        Leave Types
                                    </span>
                                    <button onClick={() => setActiveTab('settings')} className="text-xs text-primary hover:underline flex items-center gap-1">
                                        Manage <ChevronRight className="h-3.5 w-3.5" />
                                    </button>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-2">
                                {typesLoading ? Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-12 rounded-xl bg-muted/30 animate-pulse" />) :
                                    types.length === 0 ? (
                                        <div className="text-center py-10">
                                            <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3">
                                                <Settings className="h-6 w-6 text-muted-foreground/50" />
                                            </div>
                                            <p className="text-sm font-medium">No leave types yet</p>
                                            <button onClick={() => setActiveTab('settings')} className="mt-3 flex items-center gap-1.5 mx-auto px-3 py-1.5 rounded-lg border text-xs font-medium hover:bg-muted transition-colors">
                                                <Plus className="h-3.5 w-3.5" /> Add Leave Type
                                            </button>
                                        </div>
                                    ) : types.map((type: any) => (
                                        <div key={type.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors border border-border/30">
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-xs font-bold text-primary font-mono">
                                                    {type.code?.substring(0, 2)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold">{type.name}</p>
                                                    <p className="text-xs text-muted-foreground">{type.max_days_per_year} days/yr · {type.is_paid ? 'Paid' : 'Unpaid'}</p>
                                                </div>
                                            </div>
                                            <Badge variant={type.is_active ? 'default' : 'secondary'} className="text-xs">{type.is_active ? 'Active' : 'Inactive'}</Badge>
                                        </div>
                                    ))
                                }
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}

            {/* ══════════════════════════════════════════════════════════════════
                APPLICATIONS TAB
            ══════════════════════════════════════════════════════════════════ */}
            {activeTab === 'applications' && (
                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search by teacher or leave type..." value={appSearch} onChange={(e) => setAppSearch(e.target.value)} className="pl-9 rounded-xl" />
                        </div>
                        <div className="flex gap-1.5 p-1 bg-muted/50 rounded-xl border border-border/40">
                            {(['all', 'pending', 'approved', 'rejected'] as const).map((s) => (
                                <button key={s} onClick={() => setAppStatusFilter(s)} className={cn(
                                    'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize',
                                    appStatusFilter === s ? 'bg-background text-foreground shadow-sm border border-border/50' : 'text-muted-foreground hover:text-foreground'
                                )}>
                                    {s === 'all' ? 'All' : s}
                                    {s === 'pending' && stats.pending > 0 && <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-amber-500 text-white text-[10px]">{stats.pending}</span>}
                                </button>
                            ))}
                        </div>
                    </div>

                    {appsLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-44 rounded-2xl bg-muted/20 animate-pulse" />)}
                        </div>
                    ) : filteredApps.length === 0 ? (
                        <div className="text-center py-24 border-2 border-dashed border-border/40 rounded-2xl">
                            <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
                                <FileText className="h-8 w-8 text-muted-foreground/40" />
                            </div>
                            <h3 className="text-lg font-semibold">No Applications Found</h3>
                            <p className="text-muted-foreground mt-1 text-sm">{appSearch || appStatusFilter !== 'all' ? 'Try adjusting your filters.' : 'No leave applications submitted yet.'}</p>
                            {!appSearch && appStatusFilter === 'all' && (
                                <Button className="mt-4" onClick={() => openSidebar('application', 'create')}><Plus className="h-4 w-4 mr-2" /> Apply for Leave</Button>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {filteredApps.map((app: any) => (
                                <ApplicationCard key={app.id} app={app} onApprove={handleApprove} onReject={handleReject} onEdit={(a) => openSidebar('application', 'edit', a)} onDelete={handleDeleteApp} isApproving={createApproval.isPending} />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ══════════════════════════════════════════════════════════════════
                APPROVALS TAB
            ══════════════════════════════════════════════════════════════════ */}
            {activeTab === 'approvals' && (
                <div className="space-y-4">
                    {stats.pending > 0 && (
                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-200 dark:border-amber-800">
                            <div className="h-10 w-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shrink-0">
                                <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div>
                                <p className="font-semibold text-amber-800 dark:text-amber-300">{stats.pending} application{stats.pending !== 1 ? 's' : ''} awaiting your decision</p>
                                <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">Click Approve or Reject on each card to take action.</p>
                            </div>
                        </div>
                    )}
                    {appsLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-48 rounded-2xl bg-muted/20 animate-pulse" />)}</div>
                    ) : apps.filter((a: any) => a.status === 'pending').length === 0 ? (
                        <div className="text-center py-24 border-2 border-dashed border-border/40 rounded-2xl">
                            <div className="h-16 w-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4">
                                <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                            </div>
                            <h3 className="text-lg font-semibold">All Clear!</h3>
                            <p className="text-muted-foreground mt-1 text-sm">No pending leave applications to review.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {apps.filter((a: any) => a.status === 'pending').map((app: any) => (
                                <ApplicationCard key={app.id} app={app} onApprove={handleApprove} onReject={handleReject} onEdit={(a) => openSidebar('application', 'edit', a)} onDelete={handleDeleteApp} isApproving={createApproval.isPending} />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ══════════════════════════════════════════════════════════════════
                BALANCES TAB
            ══════════════════════════════════════════════════════════════════ */}
            {activeTab === 'balances' && (
                <div className="space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search by teacher or leave type..." value={balSearch} onChange={(e) => setBalSearch(e.target.value)} className="pl-9 rounded-xl" />
                    </div>
                    {balsLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-36 rounded-2xl bg-muted/20 animate-pulse" />)}</div>
                    ) : filteredBals.length === 0 ? (
                        <div className="text-center py-24 border-2 border-dashed border-border/40 rounded-2xl">
                            <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
                                <Users className="h-8 w-8 text-muted-foreground/40" />
                            </div>
                            <h3 className="text-lg font-semibold">No Balances Found</h3>
                            <p className="text-muted-foreground mt-1 text-sm">{balSearch ? 'Try a different search.' : 'No leave balances configured yet.'}</p>
                            {!balSearch && <Button className="mt-4" onClick={() => openSidebar('balance', 'create')}><Plus className="h-4 w-4 mr-2" /> Add Balance</Button>}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filteredBals.map((bal: any) => {
                                const name = bal.teacher_name || `Teacher #${bal.teacher}`;
                                const avatarGrad = getAvatarColor(name);
                                return (
                                    <Card key={bal.id} className="border-border/50 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
                                        <div className="h-1 w-full bg-gradient-to-r from-primary/60 to-violet-500/60" />
                                        <CardContent className="p-5">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={cn('h-10 w-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-white font-bold text-sm shadow-sm', avatarGrad)}>
                                                        {name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-sm">{name}</p>
                                                        <p className="text-xs text-muted-foreground">{bal.academic_year_name || `Year #${bal.academic_year}`}</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-1">
                                                    <button onClick={() => openSidebar('balance', 'edit', bal)} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-muted transition-colors">
                                                        <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                                                    </button>
                                                    <button onClick={() => handleDeleteBal(bal)} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors">
                                                        <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                                                    </button>
                                                </div>
                                            </div>
                                            <BalanceBar total={bal.total_days} used={bal.used_days} label={bal.leave_type_name} />
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* ══════════════════════════════════════════════════════════════════
                LEAVE TYPES (SETTINGS) TAB
            ══════════════════════════════════════════════════════════════════ */}
            {activeTab === 'settings' && (
                <div className="space-y-4">
                    {typesLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-36 rounded-2xl bg-muted/20 animate-pulse" />)}</div>
                    ) : types.length === 0 ? (
                        <div className="text-center py-24 border-2 border-dashed border-border/40 rounded-2xl">
                            <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
                                <Settings className="h-8 w-8 text-muted-foreground/40" />
                            </div>
                            <h3 className="text-lg font-semibold">No Leave Types Yet</h3>
                            <p className="text-muted-foreground mt-1 text-sm max-w-sm mx-auto">Define leave categories like Casual, Medical, or Annual leave.</p>
                            <Button className="mt-4" onClick={() => openSidebar('type', 'create')}><Plus className="h-4 w-4 mr-2" /> Create First Leave Type</Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {types.map((type: any) => (
                                <Card key={type.id} className={cn('border-border/50 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group overflow-hidden', !type.is_active && 'opacity-60')}>
                                    <div className="h-1 w-full bg-gradient-to-r from-primary/60 to-violet-500/60" />
                                    <CardContent className="p-5">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-sm font-bold text-primary font-mono border border-primary/20">
                                                    {type.code?.substring(0, 2)}
                                                </div>
                                                <div>
                                                    <p className="font-bold">{type.name}</p>
                                                    <p className="text-xs text-muted-foreground font-mono">{type.code}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => openSidebar('type', 'edit', type)} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-muted transition-colors">
                                                    <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                                                </button>
                                                <button onClick={() => handleDeleteType(type)} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors">
                                                    <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted text-xs font-medium">
                                                <CalendarDays className="h-3 w-3" /> {type.max_days_per_year} days/yr
                                            </span>
                                            <span className={cn('inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium',
                                                type.is_paid ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
                                            )}>
                                                {type.is_paid ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                                                {type.is_paid ? 'Paid' : 'Unpaid'}
                                            </span>
                                            <Badge variant={type.is_active ? 'default' : 'secondary'} className="text-xs">{type.is_active ? 'Active' : 'Inactive'}</Badge>
                                        </div>
                                        {type.description && <p className="mt-3 text-xs text-muted-foreground line-clamp-2">{type.description}</p>}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ── Sidebar ── */}
            <DetailSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} title={sidebarTitle} mode={sidebarMode} width="md">
                <div className="py-2">{renderSidebarContent()}</div>
            </DetailSidebar>
        </div>
    );
};

export default LeaveManagementPage;
