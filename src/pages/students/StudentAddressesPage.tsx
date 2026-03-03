/**
 * Student Addresses Page
 * Displays all student addresses with CRUD operations
 */

import { DROPDOWN_PAGE_SIZE } from '@/config/app.config';
import { getCurrentUserCollege, isSuperAdmin } from '@/utils/auth.utils';
import { MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Column, DataTable, FilterConfig } from '../../components/common/DataTable';
import { DetailSidebar } from '../../components/common/DetailSidebar';
import { Badge } from '../../components/ui/badge';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { useSuperAdminContext } from '../../contexts/SuperAdminContext';
import { invalidateStudentAddresses, useStudentAddressesSWR, useStudentsSWR } from '../../hooks/swr';
import { useAuth } from '../../hooks/useAuth';
import { useColleges } from '../../hooks/useCore';
import { useDeleteStudentAddress } from '../../hooks/useStudents';
import type { StudentAddressListItem } from '../../types/students.types';
import { StudentAddressForm } from './components/StudentAddressForm';

export const StudentAddressesPage = () => {
  const { user } = useAuth();
  const { selectedCollege } = useSuperAdminContext();
  const isSuper = isSuperAdmin(user as any);
  const defaultCollegeId = getCurrentUserCollege(user as any);
  const { data: collegesData } = useColleges({ page_size: DROPDOWN_PAGE_SIZE, is_active: true });

  const [selectedCollegeId, setSelectedCollegeId] = useState<number | null>(
    isSuper ? (selectedCollege || null) : defaultCollegeId
  );

  // Sync global college selection
  useEffect(() => {
    if (isSuper && selectedCollege !== undefined) {
      const normalized = selectedCollege || null;
      setSelectedCollegeId(normalized);
      setSelectedStudentId(null);
      setFilters(prev => ({ ...prev, college: normalized || undefined }));
    }
  }, [selectedCollege, isSuper]);
  const [filters, setFilters] = useState({
    page: 1,
    page_size: 20,
    ...(isSuper ? {} : defaultCollegeId ? { college: defaultCollegeId } : {}),
  });
  const { data, isLoading, error, refresh } = useStudentAddressesSWR(filters);
  const studentFilters = {
    page_size: DROPDOWN_PAGE_SIZE,
    is_active: true,
    ...(selectedCollegeId ? { college: selectedCollegeId } : {}),
  };
  const { data: studentsData } = useStudentsSWR(studentFilters);
  const deleteMutation = useDeleteStudentAddress();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<StudentAddressListItem | null>(null);
  const [addressDialogOpen, setAddressDialogOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);

  const normalizeCollegeId = (value: any): number | null => {
    if (value === '' || value === undefined || value === null) return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  };

  const handleCollegeChange = (collegeId: number | string) => {
    const parsedId = collegeId === '' ? null : Number(collegeId);
    const normalized = Number.isFinite(parsedId) ? (parsedId as number) : null;
    setSelectedCollegeId(normalized);
    setSelectedStudentId(null);
    setFilters((prev) => {
      const next = { ...prev, page: 1 };
      if (normalized) {
        return { ...next, college: normalized };
      }
      const { college, ...rest } = next as any;
      return rest;
    });
  };

  // Define table columns
  const columns: Column<any>[] = [
    {
      key: 'address_type',
      label: 'Type',
      render: (address: any) => (
        <Badge variant="outline" className="capitalize">
          {address.address_type}
        </Badge>
      ),
    },
    {
      key: 'student_name',
      label: 'Student',
      render: (address: any) => address.student_name || `Student #${address.student}`,
    },
    {
      key: 'address',
      label: 'Address',
      render: (address: any) => (
        <div className="flex items-start gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
          <div>
            <p className="font-medium">{address.address_line1}</p>
            {address.address_line2 && (
              <p className="text-sm text-muted-foreground">{address.address_line2}</p>
            )}
            <p className="text-sm text-muted-foreground">
              {address.city}, {address.state} - {address.pincode}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'country',
      label: 'Country',
      render: (address) => address.country,
    },
  ];

  const handleAdd = () => {
    setSelectedAddress(null);
    setSelectedStudentId(null);
    setAddressDialogOpen(true);
  };

  const handleDelete = (address: any) => {
    setSelectedAddress(address);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedAddress) {
      await deleteMutation.mutate(selectedAddress.id);
      invalidateStudentAddresses();
      setDeleteDialogOpen(false);
      setSelectedAddress(null);
    }
  };

  const handleFormSuccess = () => {
    invalidateStudentAddresses();
    setAddressDialogOpen(false);
    setSelectedStudentId(null);
  };

  const handleFiltersChange = (newFilters: Record<string, any>) => {
    setFilters((prev) => {
      const next = { ...prev, ...newFilters };
      if (isSuper && Object.prototype.hasOwnProperty.call(newFilters, 'college')) {
        const parsed = normalizeCollegeId(newFilters.college);
        setSelectedCollegeId(parsed);
        setSelectedStudentId(null);
        if (parsed) {
          return { ...next, college: parsed };
        }
        const { college, ...rest } = next as any;
        return rest;
      }
      return next;
    });
  };

  useEffect(() => {
    if (!selectedCollegeId) {
      setSelectedStudentId(null);
    }
  }, [selectedCollegeId]);

  const filteredStudents =
    studentsData?.results?.filter((student) =>
      selectedCollegeId ? student.college === selectedCollegeId : true
    ) || [];
  const disableStudentSelection = isSuper && !selectedCollegeId;

  // Define filter configuration
  const filterConfig: FilterConfig[] = [
    ...(isSuper ? [{
      name: 'college',
      label: 'College',
      type: 'select' as const,
      options: [
        { value: '', label: 'All Colleges' },
        ...(collegesData?.results.map(c => ({ value: c.id.toString(), label: c.name })) || [])
      ],
    }] : []),
  ];

  return (
    <div className="p-4 md:p-6 animate-fade-in">

      <DataTable
        title="Student Addresses"
        description="Manage all student addresses across the system"
        data={data}
        columns={columns}
        isLoading={isLoading}
        error={error?.message}
        onRefresh={refresh}
        onAdd={handleAdd}
        onDelete={handleDelete}
        filters={filters}
        onFiltersChange={handleFiltersChange as any}
        filterConfig={filterConfig}
        searchPlaceholder="Search by student, city, state..."
        addButtonLabel="Add Address"
      />

      {/* Add Address Dialog with Student Selector */}
      {/* Add Address Dialog with Student Selector */}
      <DetailSidebar
        isOpen={addressDialogOpen}
        onClose={() => setAddressDialogOpen(false)}
        title="Add Address"
        subtitle="Select a student and add their address"
        mode="create"
      >
        <div className="space-y-4">
          {/* Student Selector */}
          <div className="space-y-2">
            <Label>Select Student <span className="text-destructive">*</span></Label>
            <Select
              value={selectedStudentId?.toString() || ''}
              disabled={disableStudentSelection}
              onValueChange={(value) => setSelectedStudentId(parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder={disableStudentSelection ? "Select college to load students" : "Choose a student..."} />
              </SelectTrigger>
              <SelectContent>
                {filteredStudents.map((student) => (
                  <SelectItem key={student.id} value={student.id.toString()}>
                    {student.full_name} ({student.admission_number})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Show address form only when student is selected */}
          {selectedStudentId ? (
            <StudentAddressForm
              mode="create"
              studentId={selectedStudentId}
              onSuccess={handleFormSuccess}
              onCancel={() => setAddressDialogOpen(false)}
            />
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <MapPin className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Please select a student to add address</p>
            </div>
          )}
        </div>
      </DetailSidebar>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Address"
        description="Are you sure you want to delete this address? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        loading={deleteMutation.isLoading}
      />
    </div>
  );
};
