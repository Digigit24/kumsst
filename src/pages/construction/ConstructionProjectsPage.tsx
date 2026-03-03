/**
 * Construction Projects Page
 * CRUD for construction projects with DetailSidebar form.
 */

import {
    Building2,
    Edit,
    Eye,
    MapPin,
    Plus,
    Trash2,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { constructionProjectsApi } from '../../api/constructionService';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Column, DataTable, FilterConfig } from '../../components/common/DataTable';
import { DetailSidebar } from '../../components/common/DetailSidebar';
import { AsyncMultiSearchableSelect, AsyncMultiSearchableSelectOption } from '../../components/ui/async-multi-searchable-select';
import { AsyncSearchableSelect, AsyncSearchableSelectOption } from '../../components/ui/async-searchable-select';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';
import { getCollegeId } from '../../config/api.config';
import { DROPDOWN_PAGE_SIZE } from '../../config/app.config';
import { useUsersSWR } from '../../hooks/useAccountsSWR';
import { useAuth } from '../../hooks/useAuth';
import { invalidateProjects, useProjectsSWR } from '../../hooks/useConstructionSWR';
import { userApi } from '../../services/accounts.service';
import type {
    ConstructionProject,
    ConstructionProjectCreateInput,
    ProjectPriority,
    ProjectStatus,
} from '../../types/construction.types';


// ============================================================================
// CONSTANTS
// ============================================================================

const STATUS_OPTIONS: { value: ProjectStatus; label: string }[] = [
    { value: 'planning', label: 'Planning' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'on_hold', label: 'On Hold' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
];

const PRIORITY_OPTIONS: { value: ProjectPriority; label: string }[] = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' },
];

const STATUS_COLORS: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
    planning: 'secondary',
    in_progress: 'default',
    on_hold: 'outline',
    completed: 'outline',
    cancelled: 'destructive',
};

const PRIORITY_COLORS: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
    low: 'secondary',
    medium: 'default',
    high: 'outline',
    critical: 'destructive',
};

// ============================================================================
// FORM DATA
// ============================================================================

interface ProjectFormData {
    project_name: string;
    description: string;
    location_address: string;
    site_latitude: string;
    site_longitude: string;
    site_radius_meters: string;
    status: ProjectStatus;
    priority: ProjectPriority;
    start_date: string;
    expected_end_date: string;
    estimated_budget: string;
    project_head: string;
    assigned_engineers: string[];
}

const defaultFormData: ProjectFormData = {
    project_name: '',
    description: '',
    location_address: '',
    site_latitude: '',
    site_longitude: '',
    site_radius_meters: '',
    status: 'planning',
    priority: 'medium',
    start_date: new Date().toISOString().split('T')[0],
    expected_end_date: '',
    estimated_budget: '',
    project_head: '',
    assigned_engineers: [],
};

// ============================================================================
// COMPONENT
// ============================================================================

export function ConstructionProjectsPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const canManage = user?.user_type !== 'jr_engineer';

    // ── Async user search for dropdowns (SWR-cached) ────────────────────
    const { results: initialUsers, isLoading: loadingUsers } = useUsersSWR({ page_size: DROPDOWN_PAGE_SIZE });
    const [userOptions, setUserOptions] = useState<AsyncSearchableSelectOption[]>([]);
    const [isSearchingUsers, setIsSearchingUsers] = useState(false);

    // Map initial SWR results to option format
    const initialUserOptions: AsyncSearchableSelectOption[] = useMemo(() => {
        return initialUsers.map((u) => ({
            value: String(u.id),
            label: u.full_name || u.username,
            subtitle: `${u.username} • ${u.user_type_display}${u.email ? ' • ' + u.email : ''}`,
        }));
    }, [initialUsers]);

    // Sync initial options into local state when SWR data arrives
    useEffect(() => {
        if (initialUserOptions.length > 0) {
            setUserOptions(initialUserOptions);
        }
    }, [initialUserOptions]);

    const handleUserSearch = useCallback(async (query: string) => {
        if (!query) {
            setUserOptions(initialUserOptions);
            return;
        }
        setIsSearchingUsers(true);
        try {
            const result = await userApi.list({ search: query, page_size: DROPDOWN_PAGE_SIZE });
            setUserOptions(
                (result.results || []).map((u) => ({
                    value: String(u.id),
                    label: u.full_name || u.username,
                    subtitle: `${u.username} • ${u.user_type_display}${u.email ? ' • ' + u.email : ''}`,
                }))
            );
        } catch {
            // Keep existing options on error
        } finally {
            setIsSearchingUsers(false);
        }
    }, [initialUserOptions]);

    // ── State ──────────────────────────────────────────────────────────────
    const [filters, setFilters] = useState<Record<string, any>>({ page: 1, page_size: 10 });
    const { data, isLoading } = useProjectsSWR(filters);

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarMode, setSidebarMode] = useState<'create' | 'edit' | 'view'>('create');
    const [selectedProject, setSelectedProject] = useState<ConstructionProject | null>(null);
    const [formData, setFormData] = useState<ProjectFormData>({ ...defaultFormData });
    const [isSaving, setIsSaving] = useState(false);

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState<number | null>(null);

    // ── Helpers ────────────────────────────────────────────────────────────
    const handleChange = (field: keyof ProjectFormData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const populateForm = (project: ConstructionProject) => {
        setFormData({
            project_name: project.project_name || '',
            description: project.description || '',
            location_address: project.location_address || '',
            site_latitude: project.site_latitude || '',
            site_longitude: project.site_longitude || '',
            site_radius_meters: project.site_radius_meters != null ? String(project.site_radius_meters) : '',
            status: project.status,
            priority: project.priority,
            start_date: project.start_date || '',
            expected_end_date: project.expected_end_date || '',
            estimated_budget: project.estimated_budget || '',
            project_head: project.project_head || '',
            assigned_engineers: project.assigned_engineers || [],
        });
    };

    // ── CRUD handlers ─────────────────────────────────────────────────────
    const handleCreate = () => {
        setSelectedProject(null);
        setFormData({ ...defaultFormData });
        setSidebarMode('create');
        setSidebarOpen(true);
    };

    const handleEdit = (project: ConstructionProject) => {
        setSelectedProject(project);
        populateForm(project);
        setSidebarMode('edit');
        setSidebarOpen(true);
    };

    const handleView = (project: ConstructionProject) => {
        navigate(`/construction/projects/${project.id}`);
    };

    const handleCloseSidebar = () => {
        setSidebarOpen(false);
    };

    const handleSubmitForm = async () => {
        if (!formData.project_name.trim()) {
            toast.error('Project name is required');
            return;
        }
        if (!formData.start_date) {
            toast.error('Start date is required');
            return;
        }

        const collegeId = getCollegeId();

        const payload: ConstructionProjectCreateInput = {
            college: collegeId !== 'all' ? Number(collegeId) : undefined,
            project_name: formData.project_name.trim(),
            description: formData.description.trim() || undefined,
            location_address: formData.location_address.trim() || undefined,
            site_latitude: formData.site_latitude || undefined,
            site_longitude: formData.site_longitude || undefined,
            site_radius_meters: formData.site_radius_meters ? Number(formData.site_radius_meters) : undefined,
            status: formData.status,
            priority: formData.priority,
            start_date: formData.start_date,
            expected_end_date: formData.expected_end_date || undefined,
            estimated_budget: formData.estimated_budget || undefined,
            project_head: formData.project_head || undefined,
            assigned_engineers: formData.assigned_engineers.length > 0 ? formData.assigned_engineers : undefined,
        };

        try {
            setIsSaving(true);
            if (sidebarMode === 'edit' && selectedProject) {
                await constructionProjectsApi.update(selectedProject.id, payload);
                toast.success('Project updated');
            } else {
                await constructionProjectsApi.create(payload);
                toast.success('Project created');
            }
            setSidebarOpen(false);
            await invalidateProjects();
        } catch (err: any) {
            toast.error(err?.message || `Failed to ${sidebarMode === 'edit' ? 'update' : 'create'} project`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteClick = (id: number) => {
        setProjectToDelete(id);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!projectToDelete) return;
        try {
            await constructionProjectsApi.delete(projectToDelete);
            toast.success('Project deleted');
            setDeleteDialogOpen(false);
            setProjectToDelete(null);
            await invalidateProjects();
        } catch (err: any) {
            toast.error(err?.message || 'Failed to delete project');
        }
    };

    // ── Column definitions ────────────────────────────────────────────────
    const columns: Column<ConstructionProject>[] = [
        {
            key: 'project_name',
            label: 'Project Name',
            sortable: true,
            render: (row) => (
                <div>
                    <span className="font-semibold text-sm">{row.project_name}</span>
                    {row.location_address && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                            <MapPin className="h-3 w-3" />
                            {row.location_address}
                        </div>
                    )}
                </div>
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
            key: 'priority',
            label: 'Priority',
            render: (row) => (
                <Badge variant={PRIORITY_COLORS[row.priority] || 'default'} className="capitalize">
                    {row.priority}
                </Badge>
            ),
        },
        {
            key: 'start_date',
            label: 'Start Date',
            sortable: true,
            render: (row) => (
                <span className="text-sm">
                    {new Date(row.start_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
            ),
        },
        {
            key: 'estimated_budget',
            label: 'Budget',
            render: (row) => (
                <span className="text-sm font-medium">
                    {row.estimated_budget ? `₹${parseFloat(row.estimated_budget).toLocaleString('en-IN')}` : '—'}
                </span>
            ),
        },
        {
            key: 'progress_percentage',
            label: 'Progress',
            render: (row) => (
                <div className="flex items-center gap-2 min-w-[100px]">
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all"
                            style={{ width: `${row.progress_percentage || 0}%` }}
                        />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground w-8">{row.progress_percentage || 0}%</span>
                </div>
            ),
        },
        {
            key: 'college_name',
            label: 'College',
            render: (row) => <span className="text-sm">{row.college_name || '—'}</span>,
        },
        {
            key: 'actions',
            label: 'Actions',
            render: (row) => (
                <div className="flex gap-1.5">
                    <Button size="sm" variant="ghost" onClick={() => handleView(row)} title="View">
                        <Eye className="h-4 w-4" />
                    </Button>
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
        },
    ];

    const tableFilters: FilterConfig[] = [
        {
            name: 'status',
            label: 'Status',
            type: 'select',
            options: STATUS_OPTIONS.map((s) => ({ label: s.label, value: s.value })),
        },
        {
            name: 'priority',
            label: 'Priority',
            type: 'select',
            options: PRIORITY_OPTIONS.map((p) => ({ label: p.label, value: p.value })),
        },
    ];

    const isViewMode = sidebarMode === 'view';

    // ── Render ─────────────────────────────────────────────────────────────
    return (
        <div className="p-4 md:p-6 flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold">Construction Projects</h1>
                        <p className="text-xs text-muted-foreground">Manage and track construction projects</p>
                    </div>
                </div>
                {canManage && (
                    <Button onClick={handleCreate}>
                        <Plus className="h-4 w-4 mr-1" /> New Project
                    </Button>
                )}
            </div>

            {/* DataTable */}
            <DataTable
                columns={columns}
                data={data ?? null}
                isLoading={isLoading}
                filters={filters}
                onFiltersChange={setFilters}
                filterConfig={tableFilters}
                searchPlaceholder="Search projects..."
                onRowClick={handleView}
            />

            {/* ── DetailSidebar (Create / Edit / View) ────────────────────── */}
            <DetailSidebar
                isOpen={sidebarOpen}
                onClose={handleCloseSidebar}
                title={
                    sidebarMode === 'create'
                        ? 'New Project'
                        : sidebarMode === 'edit'
                            ? 'Edit Project'
                            : selectedProject?.project_name || 'Project Details'
                }
                subtitle={
                    sidebarMode === 'view'
                        ? `ID #${selectedProject?.id}`
                        : 'Fill in the project details'
                }
                width="2xl"
                mode={sidebarMode}
                footer={
                    !isViewMode ? (
                        <div className="flex items-center justify-end gap-3">
                            <Button variant="outline" onClick={handleCloseSidebar}>
                                Cancel
                            </Button>
                            <Button onClick={handleSubmitForm} disabled={isSaving}>
                                {isSaving ? 'Saving...' : sidebarMode === 'edit' ? 'Update Project' : 'Create Project'}
                            </Button>
                        </div>
                    ) : (
                        <div className="flex items-center justify-end">
                            <Button variant="outline" onClick={handleCloseSidebar}>
                                Close
                            </Button>
                        </div>
                    )
                }
            >
                <div className="space-y-6">
                    {/* ── Project Name ─── */}
                    <div className="space-y-2">
                        <Label>Project Name *</Label>
                        <Input
                            value={formData.project_name}
                            onChange={(e) => handleChange('project_name', e.target.value)}
                            placeholder="e.g. New College Building - Block B"
                            disabled={isViewMode}
                        />
                    </div>

                    {/* ── Description ─── */}
                    <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                            value={formData.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                            placeholder="Brief description of the project..."
                            rows={3}
                            disabled={isViewMode}
                        />
                    </div>

                    {/* ── Status + Priority ─── */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(v) => handleChange('status', v as ProjectStatus)}
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
                            <Label>Priority</Label>
                            <Select
                                value={formData.priority}
                                onValueChange={(v) => handleChange('priority', v as ProjectPriority)}
                                disabled={isViewMode}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {PRIORITY_OPTIONS.map((p) => (
                                        <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* ── Start Date + End Date ─── */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Start Date *</Label>
                            <Input
                                type="date"
                                value={formData.start_date}
                                onChange={(e) => handleChange('start_date', e.target.value)}
                                disabled={isViewMode}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Expected End Date</Label>
                            <Input
                                type="date"
                                value={formData.expected_end_date}
                                onChange={(e) => handleChange('expected_end_date', e.target.value)}
                                disabled={isViewMode}
                            />
                        </div>
                    </div>

                    {/* ── Budget ─── */}
                    <div className="space-y-2">
                        <Label>Estimated Budget (₹)</Label>
                        <Input
                            type="number"
                            value={formData.estimated_budget}
                            onChange={(e) => handleChange('estimated_budget', e.target.value)}
                            placeholder="e.g. 5000000"
                            disabled={isViewMode}
                        />
                    </div>

                    {/* ── Location ─── */}
                    <div className="space-y-2">
                        <Label>Location Address</Label>
                        <Input
                            value={formData.location_address}
                            onChange={(e) => handleChange('location_address', e.target.value)}
                            placeholder="Full site address"
                            disabled={isViewMode}
                        />
                    </div>

                    {/* ── Geofence (Lat, Long, Radius) ─── */}
                    <div className="space-y-3">
                        <Label className="text-sm font-semibold">Geofence Settings</Label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="space-y-1">
                                <Label className="text-xs">Latitude</Label>
                                <Input
                                    value={formData.site_latitude}
                                    onChange={(e) => handleChange('site_latitude', e.target.value)}
                                    placeholder="e.g. 12.9716"
                                    disabled={isViewMode}
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">Longitude</Label>
                                <Input
                                    value={formData.site_longitude}
                                    onChange={(e) => handleChange('site_longitude', e.target.value)}
                                    placeholder="e.g. 77.5946"
                                    disabled={isViewMode}
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">Radius (meters)</Label>
                                <Input
                                    type="number"
                                    value={formData.site_radius_meters}
                                    onChange={(e) => handleChange('site_radius_meters', e.target.value)}
                                    placeholder="e.g. 500"
                                    disabled={isViewMode}
                                />
                            </div>
                        </div>
                    </div>

                    {/* ── Project Head User Selection (Async) ─── */}
                    <div className="space-y-2">
                        <Label>Project Head (Assignee)</Label>
                        <AsyncSearchableSelect
                            options={userOptions}
                            value={formData.project_head}
                            onChange={(v) => handleChange('project_head', String(v))}
                            onSearch={handleUserSearch}
                            isSearching={isSearchingUsers}
                            selectedOption={
                                selectedProject?.project_head
                                    ? {
                                        value: selectedProject.project_head,
                                        label: selectedProject.project_head_name || selectedProject.project_head,
                                    }
                                    : undefined
                            }
                            placeholder="Select a project head..."
                            searchPlaceholder="Search by name, username, or email..."
                            emptyText={loadingUsers ? 'Loading users...' : 'No users found.'}
                            disabled={isViewMode}
                            isLoading={loadingUsers}
                        />
                    </div>

                    {/* ── Assigned Engineers Selection (Async) ─── */}
                    <div className="space-y-2">
                        <Label>Assigned Engineers</Label>
                        <AsyncMultiSearchableSelect
                            options={userOptions as AsyncMultiSearchableSelectOption[]}
                            value={formData.assigned_engineers}
                            onChange={(vals: (string | number)[]) => handleChange('assigned_engineers', vals)}
                            onSearch={handleUserSearch}
                            isSearching={isSearchingUsers}
                            selectedOptions={
                                selectedProject?.assigned_engineers?.length
                                    ? selectedProject.assigned_engineers.map((id, idx) => ({
                                        value: id,
                                        label: selectedProject.assigned_engineer_names?.[idx] || id,
                                    }))
                                    : undefined
                            }
                            placeholder="Select engineers..."
                            searchPlaceholder="Search by name, username, or email..."
                            emptyText={loadingUsers ? 'Loading users...' : 'No users found.'}
                            disabled={isViewMode}
                            isLoading={loadingUsers}
                        />
                    </div>

                    {/* ── View-only info ─── */}
                    {isViewMode && selectedProject && (
                        <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
                            <Label className="text-sm font-semibold">Project Info</Label>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <span className="text-muted-foreground">Progress: </span>
                                    <span className="font-medium">{selectedProject.progress_percentage || 0}%</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Status: </span>
                                    <Badge variant={STATUS_COLORS[selectedProject.status] || 'default'} className="capitalize">
                                        {selectedProject.status.replace(/_/g, ' ')}
                                    </Badge>
                                </div>
                                {selectedProject.college_name && (
                                    <div>
                                        <span className="text-muted-foreground">College: </span>
                                        <span>{selectedProject.college_name}</span>
                                    </div>
                                )}
                                {selectedProject.project_head_name && (
                                    <div>
                                        <span className="text-muted-foreground">Project Head: </span>
                                        <span>{selectedProject.project_head_name}</span>
                                    </div>
                                )}
                                {selectedProject.assigned_engineer_names && selectedProject.assigned_engineer_names.length > 0 && (
                                    <div className="col-span-2">
                                        <span className="text-muted-foreground">Engineers: </span>
                                        <span>{selectedProject.assigned_engineer_names.join(', ')}</span>
                                    </div>
                                )}
                                <div>
                                    <span className="text-muted-foreground">Created: </span>
                                    <span>{new Date(selectedProject.created_at).toLocaleString()}</span>
                                </div>
                                {selectedProject.created_by_name && (
                                    <div>
                                        <span className="text-muted-foreground">Created By: </span>
                                        <span>{selectedProject.created_by_name}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </DetailSidebar>

            {/* ── Confirm Dialog ─────────────────────────────────────────── */}
            <ConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onConfirm={confirmDelete}
                title="Delete Project"
                description="Are you sure you want to delete this project? This action cannot be undone. All related reports, photos, and milestones will also be removed."
            />
        </div>
    );
}
