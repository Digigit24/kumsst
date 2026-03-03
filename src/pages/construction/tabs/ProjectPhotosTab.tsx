import {
    Camera,
    CheckCircle,
    Eye,
    MapPin,
    Plus,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { constructionPhotosApi } from '../../../api/constructionService';
import { ConfirmDialog } from '../../../components/common/ConfirmDialog';
import { Column, DataTable, FilterConfig } from '../../../components/common/DataTable';
import { DetailSidebar } from '../../../components/common/DetailSidebar';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { getCollegeId } from '../../../config/api.config';
import { useAuth } from '../../../hooks/useAuth';
import { invalidatePhotos, usePhotosSWR } from '../../../hooks/useConstructionSWR';
import type { ConstructionPhoto, ConstructionProject, PhotoType } from '../../../types/construction.types';

const PHOTO_TYPE_OPTIONS: { value: PhotoType; label: string }[] = [
    { value: 'site_overview', label: 'Site Overview' },
    { value: 'progress', label: 'Work Progress' },
    { value: 'issue', label: 'Issue / Defect' },
    { value: 'material', label: 'Material Delivery' },
    { value: 'other', label: 'Other' },
];

export function ProjectPhotosTab({ project: projectData }: { project: ConstructionProject }) {
    const { user } = useAuth();
    // CEO/Construction head can verify and manage photos. Jr engineers can only upload and view.
    const canVerify = user?.user_type !== 'jr_engineer';

    // ── State ──────────────────────────────────────────────────────────────
    const [filters, setFilters] = useState<Record<string, any>>({
        page: 1,
        page_size: 10,
        project: projectData.id // Scoped strictly to this project
    });
    const { data, isLoading } = usePhotosSWR(filters);

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarMode, setSidebarMode] = useState<'create' | 'view'>('create');
    const [selectedPhoto, setSelectedPhoto] = useState<ConstructionPhoto | null>(null);
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [formData, setFormData] = useState({
        project: String(projectData.id),
        photo_type: 'progress' as PhotoType,
        caption: '',
    });
    const [isSaving, setIsSaving] = useState(false);

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [photoToDelete, setPhotoToDelete] = useState<number | null>(null);

    const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
    const [photoToVerify, setPhotoToVerify] = useState<number | null>(null);

    // ── Handlers ───────────────────────────────────────────────────────────
    const handleUploadClick = () => {
        setSelectedPhoto(null);
        setUploadFile(null);
        setFormData({ project: String(projectData.id), photo_type: 'progress', caption: '' });
        setSidebarMode('create');
        setSidebarOpen(true);
    };

    const handleView = (photo: ConstructionPhoto) => {
        setSelectedPhoto(photo);
        setSidebarMode('view');
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
            await invalidatePhotos();
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
            if (sidebarOpen && selectedPhoto?.id === photoToVerify) {
                // If viewing the photo, close the sidebar or refresh it
                handleView({ ...selectedPhoto, is_verified: true });
            }
            await invalidatePhotos();
        } catch (err: any) {
            toast.error(err?.message || 'Failed to verify photo');
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setUploadFile(e.target.files[0]);
        }
    };

    const handleSubmitUpload = async () => {
        if (!formData.project) {
            toast.error('Please select a project');
            return;
        }
        if (!uploadFile) {
            toast.error('Please select an image file to upload');
            return;
        }

        const collegeId = getCollegeId();

        try {
            setIsSaving(true);

            // Note: In a real app we'd extract GPS data from EXIF here using a library 
            // or use browser Geolocation API and pass it to lat/lon fields.
            // For now, we mock some generic coordinates or leave them blank

            await constructionPhotosApi.create({
                college: collegeId !== 'all' ? Number(collegeId) : undefined,
                project: Number(formData.project),
                photo: uploadFile as any, // Typed as File in our api call
                photo_type: formData.photo_type,
                caption: formData.caption,
            });

            toast.success('Photo uploaded successfully');
            setSidebarOpen(false);
            await invalidatePhotos();
        } catch (err: any) {
            toast.error(err?.message || 'Failed to upload photo');
        } finally {
            setIsSaving(false);
        }
    };

    // ── Table config ───────────────────────────────────────────────────────
    const columns: Column<ConstructionPhoto>[] = [
        {
            key: 'photo',
            label: 'Image',
            render: (row) => (
                <div
                    className="h-12 w-16 bg-muted rounded overflow-hidden cursor-pointer"
                    onClick={() => handleView(row)}
                >
                    <img src={row.photo} alt="Site Photo" className="h-full w-full object-cover hover:scale-110 transition" />
                </div>
            )
        },
        {
            key: 'project_name',
            label: 'Project',
            render: (row) => (
                <div>
                    <span className="font-semibold text-sm">{row.project_name || `Project #${row.project}`}</span>
                    {row.photo_type && (
                        <div className="text-xs text-muted-foreground mt-0.5 capitalize">
                            {row.photo_type.replace('_', ' ')}
                        </div>
                    )}
                </div>
            ),
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
            key: 'is_geofence_violation',
            label: 'Geofence Status',
            render: (row) => (
                row.is_geofence_violation ? (
                    <Badge variant="destructive" className="rounded-full text-xs">Violation</Badge>
                ) : (
                    <Badge variant="outline" className="rounded-full text-xs text-green-600 bg-green-50 border-green-200">Valid Entry</Badge>
                )
            )
        },
        {
            key: 'uploaded_by_name',
            label: 'Uploaded By',
            render: (row) => (
                <div>
                    <span className="text-sm">{row.uploaded_by_name || '—'}</span>
                    <div className="text-xs text-muted-foreground mt-0.5">
                        {new Date(row.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </div>
                </div>
            )
        },
        {
            key: 'actions',
            label: 'Actions',
            render: (row) => (
                <div className="flex gap-1.5">
                    <Button size="sm" variant="ghost" onClick={() => handleView(row)} title="View Detail">
                        <Eye className="h-4 w-4" />
                    </Button>
                    {!row.is_verified && canVerify && (
                        <Button size="sm" variant="outline" className="text-green-600 border-green-200 hover:bg-green-50" onClick={() => handleVerifyClick(row.id)} title="Verify Photo">
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
            name: 'is_geofence_violation',
            label: 'Geofence Violated',
            type: 'select',
            options: [
                { label: 'Yes', value: 'true' },
                { label: 'No', value: 'false' }
            ]
        }
    ];

    const isViewMode = sidebarMode === 'view';

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                        <Camera className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold">Site Photos</h2>
                        <p className="text-sm text-muted-foreground">Upload and manage construction site photos</p>
                    </div>
                </div>
                <Button onClick={handleUploadClick}>
                    <Plus className="h-4 w-4 mr-1" /> Upload Photo
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

            {/* View / Upload Sidebar */}
            <DetailSidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                title={sidebarMode === 'create' ? 'Upload Photo' : 'Photo Details'}
                subtitle={sidebarMode === 'create' ? `Add a new image for ${projectData.project_name}` : `ID #${selectedPhoto?.id} — ${projectData.project_name}`}
                width="2xl"
                mode={sidebarMode}
                footer={
                    sidebarMode === 'create' ? (
                        <div className="flex items-center justify-end gap-3">
                            <Button variant="outline" onClick={() => setSidebarOpen(false)}>Cancel</Button>
                            <Button onClick={handleSubmitUpload} disabled={isSaving}>
                                {isSaving ? 'Uploading...' : 'Upload Photo'}
                            </Button>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between w-full">
                            <div>
                                {selectedPhoto && !selectedPhoto.is_verified && canVerify && (
                                    <Button onClick={() => handleVerifyClick(selectedPhoto.id)} className="bg-green-600 hover:bg-green-700">
                                        <CheckCircle className="h-4 w-4 mr-2" /> Mark as Verified
                                    </Button>
                                )}
                            </div>
                            <Button variant="outline" onClick={() => setSidebarOpen(false)}>Close</Button>
                        </div>
                    )
                }
            >
                <div className="space-y-6">
                    {sidebarMode === 'create' ? (
                        <>
                            {/* Create Form */}
                            <div className="space-y-2">
                                <Label>Project *</Label>
                                <div className="p-2 border border-border rounded-md bg-muted/50 text-sm font-medium">
                                    {projectData.project_name}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Photo Type</Label>
                                <Select value={formData.photo_type} onValueChange={(v) => setFormData(p => ({ ...p, photo_type: v as PhotoType }))}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {PHOTO_TYPE_OPTIONS.map((o) => (
                                            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Photo File *</Label>
                                <Input type="file" accept="image/*" onChange={handleFileChange} className="cursor-pointer" />
                                {uploadFile && (
                                    <p className="text-xs text-muted-foreground mt-1">Selected: {uploadFile.name} ({(uploadFile.size / 1024 / 1024).toFixed(2)}MB)</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label>Caption / Notes</Label>
                                <Input
                                    value={formData.caption}
                                    onChange={(e) => setFormData(p => ({ ...p, caption: e.target.value }))}
                                    placeholder="Enter any relevant details about this photo..."
                                />
                            </div>
                        </>
                    ) : (
                        <>
                            {/* View Details */}
                            {selectedPhoto && (
                                <div className="space-y-6">
                                    <div className="bg-muted rounded-xl overflow-hidden shadow border relative flex items-center justify-center min-h-[300px] bg-black/5">
                                        <img src={selectedPhoto.photo} alt="Construction Site" className="max-h-[500px] w-auto max-w-full object-contain" />

                                        <div className="absolute top-3 left-3 flex flex-col gap-2">
                                            <Badge variant={selectedPhoto.is_verified ? 'success' : 'secondary'} className="shadow-sm">
                                                {selectedPhoto.is_verified ? 'Verified Photo' : 'Pending Verification'}
                                            </Badge>
                                            {selectedPhoto.is_geofence_violation && (
                                                <Badge variant="destructive" className="shadow-sm">Geofence Violation</Badge>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                                        <div>
                                            <Label className="text-xs text-muted-foreground">Project</Label>
                                            <p className="font-medium mt-0.5">{selectedPhoto.project_name || `#${selectedPhoto.project}`}</p>
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
                                    <div className="border rounded-xl p-4 bg-background">
                                        <div className="flex items-center gap-2 mb-3">
                                            <MapPin className="h-4 w-4 text-primary" />
                                            <Label className="font-semibold m-0">Geo-Location Metadata</Label>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="text-xs text-muted-foreground">Latitude:</span>
                                                <p className="font-mono mt-0.5">{selectedPhoto.latitude || 'Not recorded'}</p>
                                            </div>
                                            <div>
                                                <span className="text-xs text-muted-foreground">Longitude:</span>
                                                <p className="font-mono mt-0.5">{selectedPhoto.longitude || 'Not recorded'}</p>
                                            </div>
                                            {selectedPhoto.gps_accuracy_meters != null && (
                                                <div>
                                                    <span className="text-xs text-muted-foreground">Accuracy:</span>
                                                    <p className="font-mono mt-0.5">± {selectedPhoto.gps_accuracy_meters}m</p>
                                                </div>
                                            )}
                                            {selectedPhoto.device_info && (
                                                <div className="col-span-2 mt-1 pt-3 border-t">
                                                    <span className="text-xs text-muted-foreground">Device Info:</span>
                                                    <p className="mt-0.5 font-mono text-xs">{selectedPhoto.device_info}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </DetailSidebar>

            <ConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                title="Delete Photo"
                description="Are you sure you want to delete this photo? This cannot be undone."
                onConfirm={confirmDelete}
            />

            <ConfirmDialog
                open={verifyDialogOpen}
                onOpenChange={setVerifyDialogOpen}
                title="Verify Photo"
                description="Are you sure you want to mark this photo as verified? This confirms the site progress."
                onConfirm={confirmVerify}
            />
        </div>
    );
}

