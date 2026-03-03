/**
 * Construction Geofence Violations Page
 * Displays photos that are mapped outside of their allowed project zones.
 * Allows CEO/Head to review, verify, or delete them.
 */

import {
    CheckCircle,
    Eye,
    MapPin,
    Trash2
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { constructionPhotosApi } from '../../api/constructionService';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Column, DataTable, FilterConfig } from '../../components/common/DataTable';
import { DetailSidebar } from '../../components/common/DetailSidebar';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { useAuth } from '../../hooks/useAuth';
import { invalidateGeofenceViolations, useGeofenceViolationsSWR, useProjectsSWR } from '../../hooks/useConstructionSWR';
import type { ConstructionPhoto } from '../../types/construction.types';

// ============================================================================
// COMPONENT
// ============================================================================

export function GeofenceViolationsPage() {
    const { user } = useAuth();
    // CEO/Construction head can verify and manage restricted items
    const canVerify = user?.user_type !== 'jr_engineer';

    // ── State ──────────────────────────────────────────────────────────────
    const [filters, setFilters] = useState<Record<string, any>>({ page: 1, page_size: 10 });
    const { data, isLoading } = useGeofenceViolationsSWR(filters);
    const { results: projects } = useProjectsSWR({ page_size: 100, status: 'in_progress' });

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [selectedPhoto, setSelectedPhoto] = useState<ConstructionPhoto | null>(null);

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [photoToDelete, setPhotoToDelete] = useState<number | null>(null);

    const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
    const [photoToVerify, setPhotoToVerify] = useState<number | null>(null);

    // ── Handlers ───────────────────────────────────────────────────────────
    const handleView = (photo: ConstructionPhoto) => {
        setSelectedPhoto(photo);
        setSidebarOpen(true);
    };

    const handleDeleteClick = (id: number) => {
        setPhotoToDelete(id);
        setDeleteDialogOpen(true);
    };

    const handleVerifyClick = (id: number) => {
        setPhotoToVerify(id);
        setVerifyDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!photoToDelete) return;
        try {
            await constructionPhotosApi.delete(photoToDelete);
            toast.success('Photo deleted');
            setDeleteDialogOpen(false);
            setPhotoToDelete(null);
            await invalidateGeofenceViolations();
            if (sidebarOpen && selectedPhoto?.id === photoToDelete) {
                setSidebarOpen(false);
            }
        } catch (err: any) {
            toast.error(err?.message || 'Failed to delete photo');
        }
    };

    const confirmVerify = async () => {
        if (!photoToVerify) return;
        try {
            await constructionPhotosApi.verify(photoToVerify);
            toast.success('Photo marked as verified');
            setVerifyDialogOpen(false);
            setPhotoToVerify(null);
            await invalidateGeofenceViolations();
            if (sidebarOpen && selectedPhoto?.id === photoToVerify) {
                setSidebarOpen(false);
            }
        } catch (err: any) {
            toast.error(err?.message || 'Failed to verify photo');
        }
    };

    // ── Table Definitions ──────────────────────────────────────────────────
    const columns: Column<ConstructionPhoto>[] = [
        {
            key: 'photo',
            label: 'Image',
            render: (row) => (
                <div
                    className="h-12 w-16 bg-muted rounded overflow-hidden cursor-pointer"
                    onClick={() => handleView(row)}
                >
                    <img src={row.photo} alt="Violation Photo" className="h-full w-full object-cover hover:scale-110 transition" />
                </div>
            )
        },
        {
            key: 'caption',
            label: 'Issue / Caption',
            render: (row) => (
                <div>
                    <span className="font-semibold text-sm">{row.caption || 'No Caption Provided'}</span>
                    {row.photo_type && (
                        <div className="text-xs text-muted-foreground mt-0.5 capitalize flex items-center gap-1">
                            {row.photo_type.replace('_', ' ')}
                            {row.is_within_geofence === false && <Badge variant="destructive" className="ml-1 h-4 text-[10px] px-1">Out of Bounds</Badge>}
                        </div>
                    )}
                </div>
            ),
        },
        {
            key: 'distance_from_site_meters',
            label: 'Distance (Meters)',
            render: (row) => (
                <span className="text-sm font-medium text-destructive">
                    {row.distance_from_site_meters ? `${row.distance_from_site_meters}m` : 'Unknown'}
                </span>
            )
        },
        {
            key: 'is_verified',
            label: 'Verification',
            render: (row) => (
                <Badge variant={row.is_verified ? 'success' : 'secondary'} className="rounded-full">
                    {row.is_verified ? 'Verified' : 'Pending'}
                </Badge>
            )
        },
        {
            key: 'uploaded_by',
            label: 'Uploaded By',
            render: (row) => (
                <span className="text-sm">{row.uploaded_by_name || 'System User'}</span>
            )
        },
        {
            key: 'created_at',
            label: 'Timestamp',
            sortable: true,
            render: (row) => (
                <span className="text-sm">{new Date(row.created_at).toLocaleString()}</span>
            )
        },
        {
            key: 'actions',
            label: 'Actions',
            render: (row) => (
                <div className="flex gap-1.5 flex-nowrap">
                    <Button size="sm" variant="ghost" onClick={() => handleView(row)} title="View Detail">
                        <Eye className="h-4 w-4" />
                    </Button>
                    {!row.is_verified && canVerify && (
                        <Button size="sm" variant="outline" className="text-green-600 border-green-200 hover:bg-green-50" onClick={() => handleVerifyClick(row.id)} title="Verify Issue">
                            <CheckCircle className="h-4 w-4" />
                        </Button>
                    )}
                    {canVerify && (
                        <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={() => handleDeleteClick(row.id)} title="Delete Photo">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            ),
        }
    ];

    const tableFilters: FilterConfig[] = [
        {
            name: 'photo_type',
            label: 'Photo Type',
            type: 'select',
            options: [
                { value: 'issue', label: 'Issue' },
                { value: 'progress', label: 'Progress' }
            ],
        },
        {
            name: 'is_verified',
            label: 'Verification',
            type: 'select',
            options: [
                { value: 'true', label: 'Verified' },
                { value: 'false', label: 'Pending' }
            ],
        },
    ];

    return (
        <div className="p-4 md:p-6 flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center">
                        <MapPin className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold">Geofence Violations</h1>
                        <p className="text-xs text-muted-foreground">Monitor photos captured outside of authorized site boundaries</p>
                    </div>
                </div>
            </div>

            <DataTable
                onRowClick={handleView}
                columns={columns}
                data={data ?? null}
                isLoading={isLoading}
                filters={filters}
                onFiltersChange={setFilters}
                filterConfig={tableFilters}
                searchPlaceholder="Search violations..."
            />

            {/* View Detail Sidebar */}
            <DetailSidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                title="Violation Details"
                subtitle={`Photo ID #${selectedPhoto?.id}`}
                width="2xl"
                mode="view"
                footer={
                    <div className="flex items-center justify-between w-full">
                        <div>
                            {selectedPhoto && !selectedPhoto.is_verified && canVerify && (
                                <Button onClick={() => handleVerifyClick(selectedPhoto.id)} className="bg-green-600 hover:bg-green-700">
                                    <CheckCircle className="h-4 w-4 mr-2" /> Mark as Verified / Resolved
                                </Button>
                            )}
                        </div>
                        <Button variant="outline" onClick={() => setSidebarOpen(false)}>Close</Button>
                    </div>
                }
            >
                <div className="space-y-6">
                    {selectedPhoto && (
                        <div className="space-y-6">
                            <div className="bg-muted rounded-xl bg-black/5 overflow-hidden shadow border relative flex items-center justify-center min-h-[300px]">
                                <img src={selectedPhoto.photo} alt="Construction Site" className="max-h-[500px] w-auto max-w-full object-contain" />

                                <div className="absolute top-3 left-3 flex flex-col gap-2">
                                    <Badge variant={selectedPhoto.is_verified ? 'success' : 'secondary'} className="shadow-sm">
                                        {selectedPhoto.is_verified ? 'Verified Photo' : 'Pending Verification'}
                                    </Badge>
                                    {selectedPhoto.is_within_geofence === false && (
                                        <Badge variant="destructive" className="shadow-sm">Out of Bounds Violation</Badge>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                                <div>
                                    <Label className="text-xs text-muted-foreground">Coordinates</Label>
                                    <p className="font-medium mt-0.5">{selectedPhoto.latitude ? `${selectedPhoto.latitude}, ${selectedPhoto.longitude}` : 'Unknown'}</p>
                                </div>
                                <div>
                                    <Label className="text-xs text-muted-foreground">Uploaded By</Label>
                                    <p className="font-medium mt-0.5">{selectedPhoto.uploaded_by_name || 'System'}</p>
                                </div>
                                <div>
                                    <Label className="text-xs text-muted-foreground">Photo Type</Label>
                                    <p className="font-medium mt-0.5 capitalize">{selectedPhoto.photo_type?.replace(/_/g, ' ') || 'N/A'}</p>
                                </div>
                                <div>
                                    <Label className="text-xs text-muted-foreground">Timestamp</Label>
                                    <p className="font-medium mt-0.5">{new Date(selectedPhoto.created_at).toLocaleString()}</p>
                                </div>
                            </div>

                            {selectedPhoto.caption && (
                                <div>
                                    <Label className="text-xs text-muted-foreground">Caption / Notes</Label>
                                    <p className="text-sm mt-1 bg-muted/30 p-3 rounded-lg border">{selectedPhoto.caption}</p>
                                </div>
                            )}

                            {/* Geo Metadata */}
                            <div className="border border-red-200 rounded-xl p-4 bg-red-50/50">
                                <div className="flex items-center gap-2 mb-3 text-red-700">
                                    <MapPin className="h-4 w-4" />
                                    <Label className="font-bold m-0 text-red-700">Flagged Location Metadata</Label>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm text-red-900">
                                    <div>
                                        <span className="text-xs opacity-70">Latitude:</span>
                                        <p className="font-mono mt-0.5 font-medium">{selectedPhoto.latitude || 'Not recorded'}</p>
                                    </div>
                                    <div>
                                        <span className="text-xs opacity-70">Longitude:</span>
                                        <p className="font-mono mt-0.5 font-medium">{selectedPhoto.longitude || 'Not recorded'}</p>
                                    </div>
                                    {selectedPhoto.gps_accuracy_meters != null && (
                                        <div>
                                            <span className="text-xs opacity-70">Accuracy (Device):</span>
                                            <p className="font-mono mt-0.5 font-medium">± {selectedPhoto.gps_accuracy_meters}m</p>
                                        </div>
                                    )}
                                    {selectedPhoto.device_info && (
                                        <div className="col-span-2 mt-1 pt-3 border-t border-red-100">
                                            <span className="text-xs opacity-70">Device Setup:</span>
                                            <p className="mt-0.5 font-mono text-xs font-medium">{selectedPhoto.device_info}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </DetailSidebar>

            <ConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                title="Delete Photo"
                description="Are you sure you want to delete this violation photo? This cannot be undone."
                onConfirm={confirmDelete}
            />

            <ConfirmDialog
                open={verifyDialogOpen}
                onOpenChange={setVerifyDialogOpen}
                title="Verify Violation"
                description="Are you sure you want to mark this geofence violation as reviewed and verified?"
                onConfirm={confirmVerify}
            />
        </div>
    );
}
