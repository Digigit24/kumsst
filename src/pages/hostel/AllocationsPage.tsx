/**
 * Enhanced Hostel Allocations Page - Phase 2
 * Workflow-based UI with pending requests and room visualization
 */

import { format } from 'date-fns';
import { AlertCircle, Bed, Building2, Calendar, CheckCircle, Search, User, Users, XCircle } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { DetailSidebar } from '../../components/common/DetailSidebar';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { DEFAULT_PAGE_SIZE, DROPDOWN_PAGE_SIZE } from '../../config/app.config';
import { invalidateHostelAllocations } from '../../hooks/swr';
import { useDebounce } from '../../hooks/useDebounce';
import { useCreateHostelAllocation, useDeleteHostelAllocation, useHostelAllocations, useHostels, useRooms, useUpdateHostelAllocation } from '../../hooks/useHostel';
import { AllocationForm } from './components/AllocationForm';

const AllocationsPage = () => {
  const [filters, setFilters] = useState<Record<string, any>>({ page: 1, page_size: DEFAULT_PAGE_SIZE });
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 500);
  const [selectedHostel, setSelectedHostel] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'pending' | 'active'>('active');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarMode, setSidebarMode] = useState<'view' | 'create' | 'edit'>('view');
  const [selected, setSelected] = useState<any | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Fetch data
  const { data: allocationsData } = useHostelAllocations({ ...filters, search: debouncedSearch });
  const { data: hostelsData } = useHostels({ page_size: DROPDOWN_PAGE_SIZE, is_active: true });
  const { data: roomsData } = useRooms({
    page_size: DROPDOWN_PAGE_SIZE,
    is_active: true,
    ...(selectedHostel && { hostel: selectedHostel })
  });

  const create = useCreateHostelAllocation();
  const update = useUpdateHostelAllocation();
  const del = useDeleteHostelAllocation();

  const allocations = allocationsData?.results || [];
  const hostels = hostelsData?.results || [];
  const rooms = roomsData?.results || [];

  // Filter allocations
  const pendingAllocations = allocations.filter(a => !a.is_current && a.is_active);
  const activeAllocations = allocations.filter(a => a.is_current && a.is_active);

  // Group rooms by hostel for better visualization
  const roomsByHostel = rooms.reduce((acc, room) => {
    const hostelId = room.hostel;
    if (!acc[hostelId]) acc[hostelId] = [];
    acc[hostelId].push(room);
    return acc;
  }, {} as Record<number, any[]>);

  const handleAddNew = () => {
    setSelected(null);
    setSidebarMode('create');
    setIsSidebarOpen(true);
  };

  const handleViewAllocation = (allocation: any) => {
    setSelected(allocation);
    setSidebarMode('view');
    setIsSidebarOpen(true);
  };

  const handleEdit = () => setSidebarMode('edit');

  const handleApprove = async (allocation: any) => {
    try {
      await update.mutateAsync({
        id: allocation.id,
        data: { ...allocation, is_current: true }
      });
      toast.success('Allocation approved successfully');
      invalidateHostelAllocations();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to approve allocation');
    }
  };

  const handleReject = async (allocation: any) => {
    try {
      await update.mutateAsync({
        id: allocation.id,
        data: { ...allocation, is_active: false }
      });
      toast.success('Allocation rejected');
      invalidateHostelAllocations();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to reject allocation');
    }
  };

  const handleFormSubmit = async (formData: any) => {
    try {
      if (sidebarMode === 'create') {
        await create.mutateAsync(formData);
        toast.success('Allocation created successfully');
      } else {
        await update.mutateAsync({ id: selected.id, data: formData });
        toast.success('Allocation updated successfully');
      }
      setIsSidebarOpen(false);
      invalidateHostelAllocations();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save allocation');
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
      toast.success('Allocation deleted successfully');
      setDeleteDialogOpen(false);
      setIsSidebarOpen(false);
      setSelected(null);
      invalidateHostelAllocations();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete allocation');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Room Allocations</h1>
          <p className="text-muted-foreground mt-1">
            Manage hostel room and bed allocations
          </p>
        </div>
        <Button onClick={handleAddNew}>
          <User className="h-4 w-4 mr-2" />
          New Allocation
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by student name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          className="px-4 py-2 border rounded-md bg-background"
          value={selectedHostel || ''}
          onChange={(e) => setSelectedHostel(e.target.value ? Number(e.target.value) : null)}
        >
          <option value="">All Hostels</option>
          {hostels.map((hostel) => (
            <option key={hostel.id} value={hostel.id}>
              {hostel.name}
            </option>
          ))}
        </select>
      </div>

      {/* Pending Allocations Section */}
      {pendingAllocations.length > 0 && (
        <Card className="border-orange-200 bg-orange-50/50 dark:bg-orange-950/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                <CardTitle className="text-orange-900 dark:text-orange-100">
                  Pending Allocations ({pendingAllocations.length})
                </CardTitle>
              </div>
              <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300">
                Needs Attention
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingAllocations.map((allocation) => (
              <Card key={allocation.id} className="bg-white dark:bg-gray-900">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="p-2 rounded-full bg-primary/10">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">
                          {allocation.student_name || `Student #${allocation.student}`}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            {allocation.hostel_name}
                          </span>
                          <span className="flex items-center gap-1">
                            <Bed className="h-3 w-3" />
                            Room {allocation.room_number}, Bed {allocation.bed_number}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {allocation.from_date ? format(new Date(allocation.from_date), 'MMM dd, yyyy') : '-'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewAllocation(allocation)}
                      >
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleApprove(allocation)}
                        disabled={update.isPending}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleReject(allocation)}
                        disabled={update.isPending}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Active Allocations - Room Cards */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Active Allocations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
            <TabsList>
              <TabsTrigger value="active">By Room</TabsTrigger>
              <TabsTrigger value="pending">List View</TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-6 mt-6">
              {Object.entries(roomsByHostel).map(([hostelId, hostelRooms]) => {
                const hostel = hostels.find(h => h.id === Number(hostelId));
                if (!hostel) return null;

                return (
                  <div key={hostelId} className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-primary" />
                      {hostel.name}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {hostelRooms.map((room) => {
                        const roomAllocations = activeAllocations.filter(a => a.room === room.id);
                        const occupancyRate = room.capacity > 0
                          ? Math.round((room.occupied_beds / room.capacity) * 100)
                          : 0;
                        const availableBeds = room.capacity - room.occupied_beds;

                        return (
                          <Card
                            key={room.id}
                            className="hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => {
                              // Could navigate to room details or show allocations
                            }}
                          >
                            <CardHeader className="pb-3">
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-base">Room {room.room_number}</CardTitle>
                                <Badge variant={availableBeds > 0 ? 'default' : 'secondary'}>
                                  {availableBeds > 0 ? `${availableBeds} Free` : 'Full'}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">Floor {room.floor}</p>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              {/* Bed Visualization */}
                              <div className="flex gap-1 flex-wrap">
                                {Array.from({ length: room.capacity }).map((_, idx) => (
                                  <div
                                    key={idx}
                                    className={`w-8 h-8 rounded flex items-center justify-center text-xs ${idx < room.occupied_beds
                                      ? 'bg-primary text-primary-foreground'
                                      : 'bg-muted text-muted-foreground'
                                      }`}
                                    title={idx < room.occupied_beds ? 'Occupied' : 'Available'}
                                  >
                                    <Bed className="h-4 w-4" />
                                  </div>
                                ))}
                              </div>

                              {/* Stats */}
                              <div className="text-sm space-y-1">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Occupancy:</span>
                                  <span className="font-semibold">{occupancyRate}%</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Capacity:</span>
                                  <span className="font-semibold">{room.capacity} beds</span>
                                </div>
                              </div>

                              {/* Allocated Students */}
                              {roomAllocations.length > 0 && (
                                <div className="pt-2 border-t">
                                  <p className="text-xs text-muted-foreground mb-1">Students:</p>
                                  <div className="space-y-1">
                                    {roomAllocations.slice(0, 2).map((allocation) => (
                                      <p key={allocation.id} className="text-xs truncate">
                                        • {allocation.student_name || `Student #${allocation.student}`}
                                      </p>
                                    ))}
                                    {roomAllocations.length > 2 && (
                                      <p className="text-xs text-muted-foreground">
                                        +{roomAllocations.length - 2} more
                                      </p>
                                    )}
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </TabsContent>

            <TabsContent value="pending" className="mt-6">
              <div className="space-y-2">
                {activeAllocations.map((allocation) => (
                  <Card
                    key={allocation.id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleViewAllocation(allocation)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-2 rounded-full bg-primary/10">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold">
                              {allocation.student_name || `Student #${allocation.student}`}
                            </p>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                              <span>{allocation.hostel_name}</span>
                              <span>•</span>
                              <span>Room {allocation.room_number}</span>
                              <span>•</span>
                              <span>Bed {allocation.bed_number}</span>
                            </div>
                          </div>
                        </div>
                        <Badge variant="default">Active</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Detail Sidebar */}
      <DetailSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        title={
          sidebarMode === 'create'
            ? 'Create Allocation'
            : sidebarMode === 'edit'
              ? 'Edit Allocation'
              : 'Allocation Details'
        }
        mode={sidebarMode}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        data={selected}
      >
        {(sidebarMode === 'create' || sidebarMode === 'edit') && (
          <AllocationForm
            item={sidebarMode === 'edit' ? selected : null}
            onSubmit={handleFormSubmit}
            onCancel={() => setIsSidebarOpen(false)}
          />
        )}
        {sidebarMode === 'view' && selected && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Student</label>
              <p className="text-base font-semibold">
                {selected.student_name || `Student #${selected.student}`}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Hostel</label>
              <p className="text-base">{selected.hostel_name || `Hostel #${selected.hostel}`}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Room</label>
              <p className="text-base">{selected.room_number || `Room #${selected.room}`}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Bed</label>
              <p className="text-base">{selected.bed_number || `Bed #${selected.bed}`}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">From Date</label>
              <p className="text-base">
                {selected.from_date ? format(new Date(selected.from_date), 'MMM dd, yyyy') : '-'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">To Date</label>
              <p className="text-base">
                {selected.to_date ? format(new Date(selected.to_date), 'MMM dd, yyyy') : '-'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Remarks</label>
              <p className="text-base">{selected.remarks || '-'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Current</label>
              <Badge variant={selected.is_current ? 'default' : 'secondary'}>
                {selected.is_current ? 'Yes' : 'No'}
              </Badge>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <Badge variant={selected.is_active ? 'default' : 'secondary'}>
                {selected.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>
        )}
      </DetailSidebar>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Allocation"
        description={`Are you sure you want to delete the allocation for ${selected?.student_name || 'this student'
          }? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        loading={del.isPending}
      />
    </div>
  );
};

export default AllocationsPage;
