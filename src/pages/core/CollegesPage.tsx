/**
 * Colleges Page - Manage colleges
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Building2, Globe, Hash, Mail, MapPin, Phone, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Column, DataTable, FilterConfig } from '../../components/common/DataTable';
import { DetailSidebar } from '../../components/common/DetailSidebar';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { useDeleteCollege } from '../../hooks/useCore';
import { collegeApi } from '../../services/core.service';
import { CollegeForm } from './components/CollegeForm';

const CollegesPage = () => {
    const queryClient = useQueryClient();
    const [filters, setFilters] = useState<any>({ page: 1, page_size: 20 });
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [sidebarMode, setSidebarMode] = useState<'view' | 'create' | 'edit'>('view');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['colleges', filters],
        queryFn: () => collegeApi.list(filters),
    });

    const { data: selected } = useQuery({
        queryKey: ['college', selectedId],
        queryFn: () => (selectedId ? collegeApi.get(selectedId) : null),
        enabled: !!selectedId,
    });

    const deleteMutation = useDeleteCollege();

    const columns: Column<any>[] = [
        {
            key: 'code',
            label: 'Code',
            sortable: true,
            render: (item) => <span className="font-medium">{item.code}</span>,
        },
        {
            key: 'name',
            label: 'College Name',
            sortable: true,
            render: (item) => (
                <div className="flex items-center gap-3">
                    <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center shadow-sm"
                        style={{
                            background: `linear-gradient(135deg, ${item.primary_color || '#3b82f6'} 0%, ${item.secondary_color || '#8b5cf6'} 100%)`,
                        }}
                    >
                        <Building2 className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <p className="font-semibold text-base">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.short_name}</p>
                    </div>
                </div>
            ),
        },
        {
            key: 'location',
            label: 'Location',
            render: (item) => (
                <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{item.city}, {item.state}</span>
                </div>
            ),
        },
        {
            key: 'contact',
            label: 'Contact',
            render: (item) => (
                <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs">{item.email}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs">{item.phone}</span>
                    </div>
                </div>
            ),
        },
        {
            key: 'is_main',
            label: 'Type',
            render: (item) => item.is_main ? <Badge variant="default">Main</Badge> : <Badge variant="outline">Branch</Badge>,
        },
        {
            key: 'is_active',
            label: 'Status',
            render: (item) => (
                <Badge variant={item.is_active ? 'success' : 'destructive'}>
                    {item.is_active ? 'Active' : 'Inactive'}
                </Badge>
            ),
        },
    ];

    const filterConfig: FilterConfig[] = [
        {
            name: 'is_active',
            label: 'Status',
            type: 'select',
            options: [
                { value: 'true', label: 'Active' },
                { value: 'false', label: 'Inactive' },
            ],
        },
        {
            name: 'is_main',
            label: 'Type',
            type: 'select',
            options: [
                { value: 'true', label: 'Main' },
                { value: 'false', label: 'Branch' },
            ],
        },
    ];

    const handleSubmit = async (formData: any) => {
        if (sidebarMode === 'create') {
            await collegeApi.create(formData);
            toast.success('College created successfully');
        } else if (selected) {
            await collegeApi.update(selected.id, formData);
            toast.success('College updated successfully');
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;

        try {
            await deleteMutation.mutate(deleteId);
            toast.success('College deleted successfully');
            setDeleteId(null);
            setIsSidebarOpen(false);
            setSelectedId(null);
            refetch();
        } catch (error: any) {
            toast.error(typeof error.message === 'string' ? error.message : 'Failed to delete college');
        }
    };

    const mobileCardRender = (item: any) => (
        <div
            className="rounded-xl border border-border/50 bg-card p-4 shadow-sm active:bg-muted/50 transition-colors cursor-pointer"
            onClick={() => {
                setSelectedId(item.id);
                setSidebarMode('view');
                setIsSidebarOpen(true);
            }}
        >
            <div className="flex items-start gap-4 mb-3">
                <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center shadow-sm shrink-0"
                    style={{
                        background: `linear-gradient(135deg, ${item.primary_color || '#3b82f6'} 0%, ${item.secondary_color || '#8b5cf6'} 100%)`,
                    }}
                >
                    <Building2 className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base leading-tight mb-1">{item.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{item.code} • {item.short_name}</p>
                    <div className="flex flex-wrap gap-2">
                        <Badge variant={item.is_main ? 'default' : 'outline'} className="text-[10px] px-1.5 h-5">
                            {item.is_main ? 'Main' : 'Branch'}
                        </Badge>
                        <Badge variant={item.is_active ? 'success' : 'destructive'} className="text-[10px] px-1.5 h-5">
                            {item.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                    </div>
                </div>
            </div>

            <div className="space-y-2 pt-3 border-t border-border/40">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{item.city}, {item.state}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                    <span className="truncate">{item.email}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                    <span className="truncate">{item.phone}</span>
                </div>
            </div>
        </div>
    );

    return (
        <div className="p-4 md:p-6">
            <DataTable
                title="Colleges"
                description="Manage your educational institutions"
                data={data ?? null}
                columns={columns}
                isLoading={isLoading}
                error={error ? error.message : null}
                onRefresh={refetch}
                onAdd={() => {
                    setSelectedId(null);
                    setSidebarMode('create');
                    setIsSidebarOpen(true);
                }}
                onRowClick={(item) => {
                    setSelectedId(item.id);
                    setSidebarMode('view');
                    setIsSidebarOpen(true);
                }}
                filters={filters}
                onFiltersChange={setFilters}
                filterConfig={filterConfig}
                searchPlaceholder="Search colleges..."
                addButtonLabel="Add College"
                mobileCardRender={mobileCardRender}
            />

            <DetailSidebar
                isOpen={isSidebarOpen}
                onClose={() => {
                    setIsSidebarOpen(false);
                    setSelectedId(null);
                }}
                title={
                    sidebarMode === 'create'
                        ? 'Add New College'
                        : sidebarMode === 'edit'
                            ? 'Edit College'
                            : selected?.name || 'College Details'
                }
                mode={sidebarMode}
                width="lg"
            >
                {sidebarMode === 'create' && (
                    <CollegeForm
                        mode="create"
                        onSuccess={() => {
                            queryClient.invalidateQueries({ queryKey: ['colleges'] });
                            setIsSidebarOpen(false);
                        }}
                        onCancel={() => setIsSidebarOpen(false)}
                        onSubmit={handleSubmit}
                    />
                )}

                {sidebarMode === 'edit' && selected && (
                    <CollegeForm
                        mode="edit"
                        college={selected}
                        onSuccess={() => {
                            queryClient.invalidateQueries({ queryKey: ['colleges'] });
                            queryClient.invalidateQueries({ queryKey: ['college', selectedId] });
                            setIsSidebarOpen(false);
                        }}
                        onCancel={() => setIsSidebarOpen(false)}
                        onSubmit={handleSubmit}
                    />
                )}

                {sidebarMode === 'view' && selected && (
                    <div className="space-y-6">
                        <div className="flex justify-end gap-2">
                            <Button onClick={() => setSidebarMode('edit')} variant="default" size="sm">
                                Edit
                            </Button>
                            <Button
                                onClick={() => setDeleteId(selected.id)}
                                variant="destructive"
                                size="sm"
                                className="flex items-center gap-2"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete
                            </Button>
                        </div>

                        {/* College Preview Card */}
                        <div
                            className="rounded-xl overflow-hidden shadow-sm relative group"
                            style={{
                                background: `linear-gradient(135deg, ${selected.primary_color || '#3b82f6'} 0%, ${selected.secondary_color || '#8b5cf6'} 100%)`,
                            }}
                        >
                            <div className="p-6 text-white relative z-10">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h2 className="text-2xl font-bold mb-2">{selected.name}</h2>
                                        <div className="flex flex-wrap items-center gap-3 text-white/90 text-sm">
                                            <span className="bg-white/20 px-2 py-0.5 rounded text-white font-medium backdrop-blur-sm">
                                                {selected.code}
                                            </span>
                                            <span>•</span>
                                            <span>{selected.short_name}</span>
                                        </div>
                                    </div>
                                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center shrink-0">
                                        <Building2 className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                            </div>
                            {/* Decorative background pattern */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none" />
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full blur-xl -ml-12 -mb-12 pointer-events-none" />
                        </div>

                        <div className="space-y-4">
                            {/* Basic Information */}
                            <div className="bg-muted/50 p-4 rounded-lg border border-border/50">
                                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border/50">
                                    <Building2 className="w-4 h-4 text-primary" />
                                    <h3 className="font-semibold">Basic Information</h3>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs text-muted-foreground uppercase tracking-wider font-medium">College Code</label>
                                        <p className="font-medium mt-1">{selected.code}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Short Name</label>
                                        <p className="font-medium mt-1">{selected.short_name}</p>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Full Name</label>
                                        <p className="font-medium mt-1 text-lg leading-snug">{selected.name}</p>
                                    </div>
                                    {selected.established_date && (
                                        <div>
                                            <label className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Established</label>
                                            <p className="font-medium mt-1">
                                                {new Date(selected.established_date).toLocaleDateString(undefined, {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                    )}
                                    {selected.affiliation_number && (
                                        <div>
                                            <label className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Affiliation Number</label>
                                            <p className="font-medium mt-1">{selected.affiliation_number}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Contact Information */}
                            <div className="bg-muted/50 p-4 rounded-lg border border-border/50">
                                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border/50">
                                    <Phone className="w-4 h-4 text-primary" />
                                    <h3 className="font-semibold">Contact Details</h3>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-1 block">Email</label>
                                        <a href={`mailto:${selected.email}`} className="flex items-center gap-2 text-primary hover:underline font-medium">
                                            <Mail className="w-3.5 h-3.5" />
                                            <span className="break-all">{selected.email}</span>
                                        </a>
                                    </div>
                                    <div>
                                        <label className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-1 block">Phone</label>
                                        <a href={`tel:${selected.phone}`} className="flex items-center gap-2 font-medium">
                                            <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                                            <span>{selected.phone}</span>
                                        </a>
                                    </div>
                                    {selected.website && (
                                        <div className="sm:col-span-2">
                                            <label className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-1 block">Website</label>
                                            <a
                                                href={selected.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 text-primary hover:underline font-medium"
                                            >
                                                <Globe className="w-3.5 h-3.5" />
                                                <span className="break-all">{selected.website}</span>
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Address */}
                            <div className="bg-muted/50 p-4 rounded-lg border border-border/50">
                                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border/50">
                                    <MapPin className="w-4 h-4 text-primary" />
                                    <h3 className="font-semibold">Location & Address</h3>
                                </div>
                                <div className="flex gap-3">

                                    <div className="space-y-1 text-sm">
                                        <p className="font-medium">{selected.address_line1}</p>
                                        {selected.address_line2 && <p className="text-muted-foreground">{selected.address_line2}</p>}
                                        <p className="text-muted-foreground">
                                            {selected.city}, {selected.state} - <span className="font-medium text-foreground">{selected.pincode}</span>
                                        </p>
                                        <p className="text-muted-foreground">{selected.country}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Settings & Status */}
                            <div className="bg-muted/50 p-4 rounded-lg border border-border/50">
                                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border/50">
                                    <Hash className="w-4 h-4 text-primary" />
                                    <h3 className="font-semibold">Configuration</h3>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Main University</span>
                                        <div>
                                            <Badge variant={selected.is_main ? 'default' : 'secondary'} className="mt-1">
                                                {selected.is_main ? 'Main Campus' : 'Branch Campus'}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Status</span>
                                        <div>
                                            <Badge variant={selected.is_active ? 'success' : 'destructive'} className="mt-1">
                                                {selected.is_active ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Display Priority</span>
                                        <div className="mt-1">
                                            <Badge variant="outline" className="font-mono">
                                                Order: {selected.display_order}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </DetailSidebar>

            {/* Delete Confirmation */}
            <ConfirmDialog
                open={deleteId !== null}
                onClose={() => setDeleteId(null)}
                onConfirm={handleDelete}
                title="Delete College"
                description="Are you sure you want to delete this college? This action cannot be undone and may affect related data."
                variant="destructive"
            />
        </div>
    );
};

export default CollegesPage;
