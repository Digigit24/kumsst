/**
 * Classrooms Page
 */

import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Column, DataTable } from '../../components/common/DataTable';
import { DetailSidebar } from '../../components/common/DetailSidebar';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { useDeleteClassroom } from '../../hooks/useAcademic';
import { invalidateClassrooms, useClassroomsSWR } from '../../hooks/useAcademicSWR';
import type { ClassroomFilters, ClassroomListItem } from '../../types/academic.types';
import { ClassroomForm } from './components/ClassroomForm';

export default function ClassroomsPage() {
    const [filters, setFilters] = useState<ClassroomFilters>({ page: 1, page_size: 20 });
    const { data, isLoading, error, refresh } = useClassroomsSWR(filters);

    const [sidebarMode, setSidebarMode] = useState<'view' | 'create' | 'edit'>('view');
    const [selectedClassroom, setSelectedClassroom] = useState<ClassroomListItem | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const deleteMutation = useDeleteClassroom();

    const columns: Column<ClassroomListItem>[] = [
        { key: 'code', label: 'Code', sortable: true, className: 'font-medium' },
        { key: 'name', label: 'Room Name', sortable: true, className: 'font-semibold' },
        { key: 'room_type', label: 'Type', render: (room) => <Badge variant="outline">{room.room_type}</Badge> },
        { key: 'capacity', label: 'Capacity', sortable: true, render: (room) => `${room.capacity} students` },
        { key: 'college_name', label: 'College', sortable: true },
        {
            key: 'is_active',
            label: 'Status',
            render: (room) => <Badge variant={room.is_active ? 'default' : 'secondary'}>{room.is_active ? 'Available' : 'Unavailable'}</Badge>,
        },
    ];

    const handleRowClick = (classroom: ClassroomListItem) => {
        setSelectedClassroom(classroom);
        setSidebarMode('view');
        setIsSidebarOpen(true);
    };

    const handleDelete = async () => {
        if (!deleteId) return;

        try {
            await deleteMutation.mutate(deleteId);
            toast.success('Classroom deleted successfully');
            setDeleteId(null);
            setIsSidebarOpen(false);
            await invalidateClassrooms();
        } catch (error: any) {
            toast.error(typeof error.message === 'string' ? error.message : 'Failed to delete classroom');
        }
    };

    return (
        <div className="p-4 md:p-6 animate-fade-in">
            <DataTable
                title="Classrooms"
                description="Manage classrooms and their availability. Click on any row to view details."
                data={data}
                columns={columns}
                isLoading={isLoading}
                error={error?.message}
                onRefresh={refresh}
                onAdd={() => { setSelectedClassroom(null); setSidebarMode('create'); setIsSidebarOpen(true); }}
                onRowClick={handleRowClick}
                filters={filters}
                onFiltersChange={setFilters}
                searchPlaceholder="Search classrooms..."
                addButtonLabel="Add Classroom"
            />

            <DetailSidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                title={sidebarMode === 'create' ? 'Create Classroom' : sidebarMode === 'edit' ? 'Edit Classroom' : 'Classroom Details'}
                mode={sidebarMode}
            >
                <ClassroomForm mode={sidebarMode} classroomId={selectedClassroom?.id} onSuccess={async () => { setIsSidebarOpen(false); await invalidateClassrooms(); }} onCancel={() => setIsSidebarOpen(false)} />

                {sidebarMode === 'view' && selectedClassroom && (
                    <div className="flex gap-3 pt-4 border-t mt-4">
                        <Button
                            className="flex-1"
                            onClick={() => setSidebarMode('edit')}
                        >
                            Edit
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => setDeleteId(selectedClassroom.id)}
                            className="flex items-center gap-2"
                        >
                            <Trash2 className="w-4 h-4" />
                            Delete
                        </Button>
                    </div>
                )}
            </DetailSidebar>

            <ConfirmDialog
                open={deleteId !== null}
                onClose={() => setDeleteId(null)}
                onConfirm={handleDelete}
                title="Delete Classroom"
                description="Are you sure you want to delete this classroom? This action cannot be undone."
                variant="destructive"
            />
        </div>
    );
}