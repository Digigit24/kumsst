/**
 * Enhanced Rooms Page - Phase 3: Visual Room Management
 * Interactive room grid with bed visualization and floor navigation
 */

import { Bed, Building2, DoorClosed, Grid3x3, List, Plus, Settings, Users, Wrench } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { DetailSidebar } from '../../components/common/DetailSidebar';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { DROPDOWN_PAGE_SIZE } from '../../config/app.config';
import { invalidateRooms } from '../../hooks/swr';
import { useCreateRoom, useDeleteRoom, useHostelAllocations, useHostelBeds, useHostels, useRooms, useUpdateRoom } from '../../hooks/useHostel';
import { BedManagement } from './components/BedManagement';
import { RoomForm } from './components/RoomForm';

const RoomsPage = () => {
  const [selectedHostel, setSelectedHostel] = useState<number | null>(null);
  const [selectedFloor, setSelectedFloor] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarMode, setSidebarMode] = useState<'view' | 'create' | 'edit'>('view');
  const [selected, setSelected] = useState<any | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roomDetailsTab, setRoomDetailsTab] = useState('details');

  // Fetch data
  const { data: hostelsData, isLoading: hostelsLoading } = useHostels({ page_size: DROPDOWN_PAGE_SIZE, is_active: true });
  const { data: roomsData, isLoading: roomsLoading } = useRooms({
    page_size: DROPDOWN_PAGE_SIZE,
    is_active: true,
    ...(selectedHostel && { hostel: selectedHostel }),
  });
  const { data: allocationsData, isLoading: allocationsLoading } = useHostelAllocations({ page_size: DROPDOWN_PAGE_SIZE, is_active: true, is_current: true });
  const { data: bedsData, isLoading: bedsLoading } = useHostelBeds({ page_size: DROPDOWN_PAGE_SIZE, is_active: true });

  const create = useCreateRoom();
  const update = useUpdateRoom();
  const del = useDeleteRoom();

  const hostels = hostelsData?.results || [];
  const rooms = roomsData?.results || [];
  const allocations = allocationsData?.results || [];
  const beds = bedsData?.results || [];

  // Get unique floors
  const floors = ['all', ...Array.from(new Set(rooms.map(r => r.floor))).sort()];

  // Filter rooms by floor
  const filteredRooms = selectedFloor === 'all'
    ? rooms
    : rooms.filter(r => r.floor === selectedFloor);

  // Group rooms by floor for grid view
  const roomsByFloor = filteredRooms.reduce((acc, room) => {
    const floor = room.floor || 'Unknown';
    if (!acc[floor]) acc[floor] = [];
    acc[floor].push(room);
    return acc;
  }, {} as Record<string, any[]>);

  // Get room status
  const getRoomStatus = (room: any) => {
    const availableBeds = room.capacity - room.occupied_beds;
    if (availableBeds === 0) return { label: 'Full', color: 'bg-red-500', textColor: 'text-red-600' };
    if (availableBeds <= room.capacity * 0.25) return { label: 'Almost Full', color: 'bg-amber-500', textColor: 'text-amber-600' };
    if (room.occupied_beds === 0) return { label: 'Empty', color: 'bg-slate-400', textColor: 'text-slate-600' };
    return { label: 'Available', color: 'bg-emerald-500', textColor: 'text-emerald-600' };
  };

  // Get bed status for a specific bed
  const getBedStatus = (roomId: number, bedIndex: number) => {
    const roomBeds = beds.filter(b => b.room === roomId);
    if (bedIndex >= roomBeds.length) return 'available';
    const bed = roomBeds[bedIndex];
    return bed.status || 'available';
  };

  // Get students in room
  const getRoomStudents = (roomId: number) => {
    return allocations.filter(a => a.room === roomId);
  };

  const handleAddNew = () => {
    setSelected(null);
    setSidebarMode('create');
    setIsSidebarOpen(true);
  };

  const handleViewRoom = (room: any) => {
    setSelected(room);
    setSidebarMode('view');
    setIsSidebarOpen(true);
  };

  const handleEdit = () => setSidebarMode('edit');

  const handleFormSubmit = async (formData: any) => {
    try {
      if (sidebarMode === 'create') {
        await create.mutateAsync(formData);
        toast.success('Room created successfully');
      } else {
        await update.mutateAsync({ id: selected.id, data: formData });
        toast.success('Room updated successfully');
      }
      setIsSidebarOpen(false);
      invalidateRooms();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save room');
    }
  };

  const handleDeleteClick = () => {
    if (!selected) return;
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selected) return;
    try {
      await del.mutateAsync(selected.id);
      toast.success('Room deleted successfully');
      setDeleteDialogOpen(false);
      setIsSidebarOpen(false);
      setSelected(null);
      invalidateRooms();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete room');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Room Management</h1>
          <p className="text-muted-foreground mt-1">
            Visual room layout with bed status
          </p>
        </div>
        <Button onClick={handleAddNew}>
          <Plus className="h-4 w-4 mr-2" />
          Add Room
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <select
            className="px-4 py-2 border rounded-md bg-background min-w-[200px]"
            value={selectedHostel || ''}
            onChange={(e) => {
              setSelectedHostel(e.target.value ? Number(e.target.value) : null);
              setSelectedFloor('all');
            }}
          >
            <option value="">All Hostels</option>
            {hostels.map((hostel) => (
              <option key={hostel.id} value={hostel.id}>
                {hostel.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <DoorClosed className="h-4 w-4 text-muted-foreground" />
          <select
            className="px-4 py-2 border rounded-md bg-background"
            value={selectedFloor}
            onChange={(e) => setSelectedFloor(e.target.value)}
          >
            {floors.map((floor) => (
              <option key={floor} value={floor}>
                {floor === 'all' ? 'All Floors' : `Floor ${floor}`}
              </option>
            ))}
          </select>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid3x3 className="h-4 w-4 mr-2" />
            Grid
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4 mr-2" />
            List
          </Button>
        </div>
      </div>

      {/* Legend */}
      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <div className="flex items-center gap-6 text-sm">
            <span className="font-semibold">Legend:</span>
            <div className="flex items-center gap-2">
              <Bed className="h-4 w-4 text-primary" />
              <span>Occupied</span>
            </div>
            <div className="flex items-center gap-2">
              <Bed className="h-4 w-4 text-muted-foreground" />
              <span>Available</span>
            </div>
            <div className="flex items-center gap-2">
              <Wrench className="h-4 w-4 text-orange-500" />
              <span>Maintenance</span>
            </div>
            <div className="ml-auto flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span>Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <span>Almost Full</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span>Full</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-slate-400" />
                <span>Empty</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      {filteredRooms.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <DoorClosed className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Rooms Found</h3>
            <p className="text-muted-foreground mb-4">
              {selectedFloor === 'all'
                ? 'No rooms available'
                : `No rooms found on Floor ${selectedFloor}`}
            </p>
            <Button onClick={handleAddNew}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Room
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
          <TabsContent value="grid" className="space-y-8 mt-0">
            {Object.entries(roomsByFloor).map(([floor, floorRooms]) => (
              <div key={floor} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <DoorClosed className="h-6 w-6 text-primary" />
                    Floor {floor}
                  </h2>
                  <Badge variant="outline">
                    {floorRooms.length} {floorRooms.length === 1 ? 'Room' : 'Rooms'}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {floorRooms.map((room) => {
                    const status = getRoomStatus(room);
                    const students = getRoomStudents(room.id);
                    const occupancyRate = room.capacity > 0
                      ? Math.round((room.occupied_beds / room.capacity) * 100)
                      : 0;

                    return (
                      <Card
                        key={room.id}
                        className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-muted/60"
                        onClick={() => handleViewRoom(room)}
                      >
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="text-xs font-medium text-emerald-600 mb-1">
                                {room.hostel_name}
                              </div>
                              <Badge variant="outline" className="mb-2 font-normal text-muted-foreground border-transparent px-0 text-xs">
                                {room.room_type_name || 'Standard'}
                              </Badge>
                              <CardTitle className="text-2xl font-bold tracking-tight">
                                {room.room_number}
                              </CardTitle>
                            </div>
                            <div className="text-right">
                              <Badge
                                variant="secondary"
                                className={`
                                  font-medium
                                  ${status.label === 'Full' ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400' :
                                    status.label === 'Available' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' :
                                      status.label === 'Almost Full' ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400' :
                                        'bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-400'}
                                `}
                              >
                                {status.label}
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>

                        <CardContent className="space-y-6">
                          {/* Bed Grid */}
                          <div>
                            <div className="flex items-center justify-between mb-3 text-xs text-muted-foreground">
                              <span>Capacity</span>
                              <span className="font-medium text-foreground">{room.occupied_beds}/{room.capacity} Beds</span>
                            </div>
                            <div className="grid grid-cols-4 gap-3">
                              {Array.from({ length: room.capacity }).map((_, idx) => {
                                const isOccupied = idx < room.occupied_beds;
                                const bedStatus = getBedStatus(room.id, idx);

                                return (
                                  <div
                                    key={idx}
                                    className={`
                                      aspect-square rounded-lg flex items-center justify-center transition-all duration-300 relative
                                      ${bedStatus === 'maintenance'
                                        ? 'bg-amber-50 border-2 border-dashed border-amber-200 text-amber-500'
                                        : isOccupied
                                          ? 'bg-primary text-primary-foreground shadow-md'
                                          : 'bg-muted/30 border-2 border-dashed border-muted hover:border-primary/30 hover:bg-primary/5'
                                      }
                                    `}
                                    title={`Bed ${idx + 1}`}
                                  >
                                    {bedStatus === 'maintenance' ? (
                                      <Wrench className="h-4 w-4" />
                                    ) : isOccupied ? (
                                      <Users className="h-4 w-4" />
                                    ) : (
                                      <span className="text-[10px] font-medium text-muted-foreground/50">{idx + 1}</span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Footer Info */}
                          <div className="h-8 flex items-center justify-between">
                            {/* Student Avatars */}
                            {students.length > 0 ? (
                              <div className="flex -space-x-2 overflow-hidden">
                                {students.slice(0, 4).map((student, i) => (
                                  <div
                                    key={student.id}
                                    className="inline-block h-8 w-8 rounded-full ring-2 ring-background bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-medium text-muted-foreground"
                                    title={student.student_name}
                                  >
                                    {student.student_name?.[0] || 'S'}
                                  </div>
                                ))}
                                {students.length > 4 && (
                                  <div className="inline-block h-8 w-8 rounded-full ring-2 ring-background bg-slate-100 flex items-center justify-center text-[10px] font-medium text-muted-foreground">
                                    +{students.length - 4}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="text-sm text-muted-foreground italic">
                                Vacant
                              </div>
                            )}

                            {/* View Action */}
                            <Button
                              size="sm"
                              variant="ghost"
                              className="opacity-0 group-hover:opacity-100 transition-opacity -mr-2 text-primary hover:text-primary hover:bg-primary/10"
                            >
                              Manage <Settings className="ml-2 h-3 w-3" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="list" className="mt-0">
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {filteredRooms.map((room) => {
                    const status = getRoomStatus(room);
                    const students = getRoomStudents(room.id);

                    return (
                      <div
                        key={room.id}
                        className="p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => handleViewRoom(room)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            <div className={`w-3 h-3 rounded-full ${status.color}`} />
                            <div className="flex-1">
                              <div className="flex items-center gap-3">
                                <h3 className="font-semibold">Room {room.room_number}</h3>
                                <Badge variant="outline" className="text-xs">
                                  Floor {room.floor}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                <span>{room.room_type_name || 'Standard'}</span>
                                <span>•</span>
                                <span>
                                  {room.occupied_beds}/{room.capacity} beds occupied
                                </span>
                                {students.length > 0 && (
                                  <>
                                    <span>•</span>
                                    <span>{students.length} students</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <Badge variant={status.label === 'Full' ? 'destructive' : 'default'}>
                            {status.label}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Detail Sidebar */}
      <DetailSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        title={
          sidebarMode === 'create'
            ? 'Create Room'
            : sidebarMode === 'edit'
              ? 'Edit Room'
              : 'Room Details'
        }
        mode={sidebarMode}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        data={selected}
      >
        {(sidebarMode === 'create' || sidebarMode === 'edit') && (
          <RoomForm
            item={sidebarMode === 'edit' ? selected : null}
            onSubmit={handleFormSubmit}
            onCancel={() => setIsSidebarOpen(false)}
          />
        )}
        {sidebarMode === 'view' && selected && (
          <Tabs value={roomDetailsTab} onValueChange={setRoomDetailsTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Room Details</TabsTrigger>
              <TabsTrigger value="beds">Manage Beds</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Room Number</label>
                <p className="text-base font-semibold">{selected.room_number}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Hostel</label>
                <p className="text-base">{selected.hostel_name || `Hostel #${selected.hostel}`}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Room Type</label>
                <p className="text-base">
                  {selected.room_type_name || `Type #${selected.room_type}`}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Floor</label>
                <p className="text-base">{selected.floor}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Capacity</label>
                <p className="text-base">{selected.capacity} beds</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Occupied Beds</label>
                <p className="text-base">{selected.occupied_beds}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Available Beds</label>
                <p className="text-base font-semibold text-green-600">
                  {selected.capacity - selected.occupied_beds}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <Badge variant={selected.is_active ? 'default' : 'secondary'}>
                  {selected.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </TabsContent>

            <TabsContent value="beds" className="mt-4">
              <BedManagement
                roomId={selected.id}
                roomNumber={selected.room_number}
                capacity={selected.capacity}
              />
            </TabsContent>
          </Tabs>
        )}
      </DetailSidebar>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Room"
        description={`Are you sure you want to delete room ${selected?.room_number}? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        loading={del.isPending}
      />
    </div>
  );
};

export default RoomsPage;
