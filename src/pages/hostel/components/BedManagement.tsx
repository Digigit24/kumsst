/**
 * BedManagement Component
 * Manage beds for a specific room
 */

import { Bed, Plus, Trash2, Wrench } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '../../../components/common/ConfirmDialog';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '../../../components/ui/dialog';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../../components/ui/select';
import { DROPDOWN_PAGE_SIZE } from '../../../config/app.config';
import { invalidateHostelBeds } from '../../../hooks/swr';
import { useCreateHostelBed, useDeleteHostelBed, useHostelBeds, useUpdateHostelBed } from '../../../hooks/useHostel';

interface BedManagementProps {
    roomId: number;
    roomNumber: string;
    capacity: number;
}

export const BedManagement = ({ roomId, roomNumber, capacity }: BedManagementProps) => {
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedBed, setSelectedBed] = useState<any | null>(null);
    const [formData, setFormData] = useState({
        bed_number: '',
        status: 'available',
        remarks: '',
    });

    // Fetch beds for this room
    const { data: bedsData } = useHostelBeds({ room: roomId, page_size: DROPDOWN_PAGE_SIZE });
    const beds = bedsData?.results || [];

    const createBed = useCreateHostelBed();
    const updateBed = useUpdateHostelBed();
    const deleteBed = useDeleteHostelBed();

    const handleCreateBed = () => {
        setFormData({
            bed_number: (beds.length + 1).toString(),
            status: 'available',
            remarks: '',
        });
        setIsCreateDialogOpen(true);
    };

    const handleEditBed = (bed: any) => {
        setSelectedBed(bed);
        setFormData({
            bed_number: bed.bed_number,
            status: bed.status || 'available',
            remarks: bed.remarks || '',
        });
        setIsEditDialogOpen(true);
    };

    const handleDeleteClick = (bed: any) => {
        setSelectedBed(bed);
        setDeleteDialogOpen(true);
    };

    const handleSubmitCreate = async (e: React.FormEvent) => {
        e.preventDefault();

        if (beds.length >= capacity) {
            toast.error(`Cannot add more beds. Room capacity is ${capacity}`);
            return;
        }

        try {
            await createBed.mutateAsync({
                room: roomId,
                bed_number: formData.bed_number,
                status: formData.status,
                remarks: formData.remarks,
                is_active: true,
            });
            toast.success('Bed created successfully');
            setIsCreateDialogOpen(false);
            invalidateHostelBeds();
        } catch (error: any) {
            toast.error(error?.message || 'Failed to create bed');
        }
    };

    const handleSubmitEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedBed) return;

        try {
            await updateBed.mutateAsync({
                id: selectedBed.id,
                data: {
                    room: roomId,
                    bed_number: formData.bed_number,
                    status: formData.status,
                    remarks: formData.remarks,
                },
            });
            toast.success('Bed updated successfully');
            setIsEditDialogOpen(false);
            invalidateHostelBeds();
        } catch (error: any) {
            toast.error(error?.message || 'Failed to update bed');
        }
    };

    const confirmDelete = async () => {
        if (!selectedBed) return;

        try {
            await deleteBed.mutateAsync(selectedBed.id);
            toast.success('Bed deleted successfully');
            setDeleteDialogOpen(false);
            setSelectedBed(null);
            invalidateHostelBeds();
        } catch (error: any) {
            toast.error(error?.message || 'Failed to delete bed');
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'available':
                return <Badge variant="default">Available</Badge>;
            case 'occupied':
                return <Badge variant="secondary">Occupied</Badge>;
            case 'maintenance':
                return <Badge variant="destructive">Maintenance</Badge>;
            case 'reserved':
                return <Badge variant="outline">Reserved</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'maintenance':
                return <Wrench className="h-4 w-4 text-orange-600" />;
            default:
                return <Bed className="h-4 w-4" />;
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold">Bed Management</h3>
                    <p className="text-sm text-muted-foreground">
                        {beds.length} of {capacity} beds configured
                    </p>
                </div>
                <Button
                    size="sm"
                    onClick={handleCreateBed}
                    disabled={beds.length >= capacity}
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Bed
                </Button>
            </div>

            {beds.length === 0 ? (
                <Card>
                    <CardContent className="p-8 text-center">
                        <Bed className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground">
                            No beds configured for this room
                        </p>
                        <Button
                            size="sm"
                            variant="outline"
                            className="mt-3"
                            onClick={handleCreateBed}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add First Bed
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-2">
                    {beds.map((bed) => (
                        <Card key={bed.id} className="hover:bg-muted/50 transition-colors">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-muted">
                                            {getStatusIcon(bed.status)}
                                        </div>
                                        <div>
                                            <p className="font-semibold">Bed {bed.bed_number}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {bed.remarks || 'No remarks'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {getStatusBadge(bed.status)}
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleEditBed(bed)}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleDeleteClick(bed)}
                                        >
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Create Bed Dialog */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogContent>
                    <form onSubmit={handleSubmitCreate}>
                        <DialogHeader>
                            <DialogTitle>Add Bed to Room {roomNumber}</DialogTitle>
                            <DialogDescription>
                                Create a new bed in this room
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="bed_number">Bed Number *</Label>
                                <Input
                                    id="bed_number"
                                    value={formData.bed_number}
                                    onChange={(e) =>
                                        setFormData({ ...formData, bed_number: e.target.value })
                                    }
                                    placeholder="e.g., 1, 2, A, B"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="status">Status *</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(value) =>
                                        setFormData({ ...formData, status: value })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="available">Available</SelectItem>
                                        <SelectItem value="occupied">Occupied</SelectItem>
                                        <SelectItem value="maintenance">Maintenance</SelectItem>
                                        <SelectItem value="reserved">Reserved</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="remarks">Remarks</Label>
                                <Input
                                    id="remarks"
                                    value={formData.remarks}
                                    onChange={(e) =>
                                        setFormData({ ...formData, remarks: e.target.value })
                                    }
                                    placeholder="Optional notes"
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsCreateDialogOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={createBed.isPending}>
                                {createBed.isPending ? 'Creating...' : 'Create Bed'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Bed Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                    <form onSubmit={handleSubmitEdit}>
                        <DialogHeader>
                            <DialogTitle>Edit Bed {selectedBed?.bed_number}</DialogTitle>
                            <DialogDescription>
                                Update bed information
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit_bed_number">Bed Number *</Label>
                                <Input
                                    id="edit_bed_number"
                                    value={formData.bed_number}
                                    onChange={(e) =>
                                        setFormData({ ...formData, bed_number: e.target.value })
                                    }
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit_status">Status *</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(value) =>
                                        setFormData({ ...formData, status: value })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="available">Available</SelectItem>
                                        <SelectItem value="occupied">Occupied</SelectItem>
                                        <SelectItem value="maintenance">Maintenance</SelectItem>
                                        <SelectItem value="reserved">Reserved</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit_remarks">Remarks</Label>
                                <Input
                                    id="edit_remarks"
                                    value={formData.remarks}
                                    onChange={(e) =>
                                        setFormData({ ...formData, remarks: e.target.value })
                                    }
                                    placeholder="Optional notes"
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsEditDialogOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={updateBed.isPending}>
                                {updateBed.isPending ? 'Updating...' : 'Update Bed'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                title="Delete Bed"
                description={`Are you sure you want to delete Bed ${selectedBed?.bed_number}? This action cannot be undone.`}
                confirmLabel="Delete"
                onConfirm={confirmDelete}
                loading={deleteBed.isPending}
            />
        </div>
    );
};
