import { DROPDOWN_PAGE_SIZE } from '@/config/app.config';
import { getCurrentUserCollege, isSuperAdmin } from '@/utils/auth.utils';
import { isAdmin, isTeacher } from '@/utils/permissions';
import { Heart } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Column, DataTable, FilterConfig } from '../../components/common/DataTable';
import { DetailSidebar } from '../../components/common/DetailSidebar';

import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';
import { invalidateStudentMedicalRecords, useStudentMedicalRecordsSWR, useStudentsSWR } from '../../hooks/swr';
import { useAuth } from '../../hooks/useAuth';
import { useColleges } from '../../hooks/useCore';
import { useCreateMedicalRecord, useDeleteMedicalRecord, useUpdateMedicalRecord } from '../../hooks/useMedicalRecords';
import type { StudentMedicalRecord } from '../../types/students.types';
import { MedicalRecordDetails } from './components/MedicalRecordDetails';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const MedicalRecordsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isSuper = isSuperAdmin(user as any);
  const defaultCollegeId = getCurrentUserCollege(user as any);
  const { data: collegesData } = useColleges({ page_size: DROPDOWN_PAGE_SIZE, is_active: true });

  const [selectedCollegeId, setSelectedCollegeId] = useState<number | null>(
    isSuper ? null : defaultCollegeId
  );
  const [filters, setFilters] = useState({
    page: 1,
    page_size: 20,
    ...(isSuper ? {} : defaultCollegeId ? { college: defaultCollegeId } : {}),
  });
  const { data, isLoading, error, refresh } = useStudentMedicalRecordsSWR(filters);
  const studentFilters = {
    page_size: DROPDOWN_PAGE_SIZE,
    is_active: true,
    ...(selectedCollegeId ? { college: selectedCollegeId } : {}),
  };
  const { data: studentsData } = useStudentsSWR(studentFilters);
  const createMutation = useCreateMedicalRecord();
  const updateMutation = useUpdateMedicalRecord();
  const deleteMutation = useDeleteMedicalRecord();

  const canManageRecords = isAdmin() || isTeacher();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<StudentMedicalRecord | null>(null);
  const [medicalDialogOpen, setMedicalDialogOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const [formData, setFormData] = useState({
    blood_group: '',
    height: '',
    weight: '',
    allergies: '',
    medical_conditions: '',
    medications: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relation: '',
    health_insurance_provider: '',
    health_insurance_number: '',
    last_checkup_date: '',
    is_active: true,
  });

  const errorMessage = error instanceof Error ? error.message : null;

  // Define table columns
  const columns: Column<StudentMedicalRecord>[] = [
    {
      key: 'student_name',
      label: 'Student',
      render: (record) => record.student_name || `Student #${record.student}`,
    },
    {
      key: 'blood_group',
      label: 'Blood Group',
      render: (record) => record.blood_group || '-',
    },
    {
      key: 'emergency_contact_name',
      label: 'Emergency Contact',
      render: (record) => (
        <div>
          <p className="font-medium">{record.emergency_contact_name || '-'}</p>
          <p className="text-xs text-muted-foreground">{record.emergency_contact_phone || '-'}</p>
        </div>
      ),
    },
    {
      key: 'health_insurance_provider',
      label: 'Insurance',
      render: (record) => record.health_insurance_provider || '-',
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (record) => (
        <Badge variant={record.is_active ? 'success' : 'secondary'}>
          {record.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
  ];

  const handleRowClick = (record: StudentMedicalRecord) => {
    setSelectedRecord(record);
    setIsDetailOpen(true);
  };

  const handleAdd = () => {
    if (isSuper && !selectedCollegeId) {
      toast.warning('Please select a college before adding medical records.');
      return;
    }
    setSelectedRecord(null);
    setSelectedStudentId(null);
    setFormData({
      blood_group: '',
      height: '',
      weight: '',
      allergies: '',
      medical_conditions: '',
      medications: '',
      emergency_contact_name: '',
      emergency_contact_phone: '',
      emergency_contact_relation: '',
      health_insurance_provider: '',
      health_insurance_number: '',
      last_checkup_date: '',
      is_active: true,
    });
    setMedicalDialogOpen(true);
  };

  const handleEdit = (record: StudentMedicalRecord) => {
    setIsDetailOpen(false);
    setSelectedRecord(record);
    setSelectedStudentId(record.student);
    setFormData({
      blood_group: record.blood_group || '',
      height: record.height?.toString() || '',
      weight: record.weight?.toString() || '',
      allergies: record.allergies || '',
      medical_conditions: record.medical_conditions || '',
      medications: record.medications || '',
      emergency_contact_name: record.emergency_contact_name || '',
      emergency_contact_phone: record.emergency_contact_phone || '',
      emergency_contact_relation: record.emergency_contact_relation || '',
      health_insurance_provider: record.health_insurance_provider || '',
      health_insurance_number: record.health_insurance_number || '',
      last_checkup_date: record.last_checkup_date || '',
      is_active: record.is_active,
    });
    setMedicalDialogOpen(true);
  };

  // Keep handleDelete for direct calls if any leftover, but primarily used for context
  const handleDelete = (record: StudentMedicalRecord) => {
    if (isSuper && !selectedCollegeId) {
      toast.warning('Please select a college before deleting medical records.');
      return;
    }
    setSelectedRecord(record);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedRecord) {
      await deleteMutation.mutateAsync(selectedRecord.id);
      invalidateStudentMedicalRecords();
      setDeleteDialogOpen(false);
      setIsDetailOpen(false); // Close details after delete
      setSelectedRecord(null);
    }
  };

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

  const handleSubmit = async () => {
    if (!selectedStudentId) {
      toast.warning('Please select a student');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        student: selectedStudentId,
        blood_group: formData.blood_group || null,
        height: formData.height || null,
        weight: formData.weight || null,
        allergies: formData.allergies || null,
        medical_conditions: formData.medical_conditions || null,
        medications: formData.medications || null,
        emergency_contact_name: formData.emergency_contact_name || null,
        emergency_contact_phone: formData.emergency_contact_phone || null,
        emergency_contact_relation: formData.emergency_contact_relation || null,
        health_insurance_provider: formData.health_insurance_provider || null,
        health_insurance_number: formData.health_insurance_number || null,
        last_checkup_date: formData.last_checkup_date || null,
        is_active: formData.is_active,
      };

      if (selectedRecord) {
        await updateMutation.mutateAsync({
          id: selectedRecord.id,
          data: payload,
        });
      } else {
        await createMutation.mutateAsync(payload);
      }

      invalidateStudentMedicalRecords();
      setMedicalDialogOpen(false);
      setSelectedStudentId(null);
      setSelectedRecord(null);
    } catch (err) {
      console.error('Failed to save medical record:', err);
      toast.error('Failed to save medical record. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
        title="Student Medical Records"
        description="Manage all student medical records across the system. Click on a row to view details."
        data={data || null}
        columns={columns}
        isLoading={isLoading}
        error={errorMessage}
        onRefresh={refresh}
        onAdd={canManageRecords ? handleAdd : undefined}
        onRowClick={handleRowClick}
        filters={filters}
        onFiltersChange={handleFiltersChange as any}
        filterConfig={filterConfig}
        searchPlaceholder="Search by student, blood group..."
        addButtonLabel="Add Medical Record"
      />

      <DetailSidebar
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title="Medical Record Details"
        mode="view"
      >
        {selectedRecord && (
          <MedicalRecordDetails
            recordId={selectedRecord.id}
            onDelete={() => setDeleteDialogOpen(true)}
            onEdit={() => handleEdit(selectedRecord)}
          />
        )}
      </DetailSidebar>

      {/* Add Medical Record Dialog with Student Selector */}
      {/* Add Medical Record Dialog with Student Selector */}
      <DetailSidebar
        isOpen={medicalDialogOpen}
        onClose={() => setMedicalDialogOpen(false)}
        title={selectedRecord ? "Edit Medical Record" : "Add Medical Record"}
        subtitle={selectedRecord ? "Update medical information" : "Select a student and add their medical information"}
        mode={selectedRecord ? 'edit' : 'create'}
        width="lg"
        footer={
          (selectedStudentId || selectedRecord) && (
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setMedicalDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} loading={isSubmitting}>
                {selectedRecord ? "Update Medical Record" : "Save Medical Record"}
              </Button>
            </div>
          )
        }
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

          {/* Show medical form only when student is selected */}
          {selectedStudentId ? (
            <div className="space-y-4 border-t pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Blood Group</Label>
                  <Select
                    value={formData.blood_group}
                    onValueChange={(value) => setFormData({ ...formData, blood_group: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select blood group" />
                    </SelectTrigger>
                    <SelectContent>
                      {BLOOD_GROUPS.map((bg) => (
                        <SelectItem key={bg} value={bg}>
                          {bg}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Height (cm)</Label>
                  <Input
                    type="number"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                    placeholder="e.g., 170"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Weight (kg)</Label>
                  <Input
                    type="number"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    placeholder="e.g., 65"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Last Checkup Date</Label>
                  <Input
                    type="date"
                    value={formData.last_checkup_date}
                    onChange={(e) => setFormData({ ...formData, last_checkup_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Allergies</Label>
                <Textarea
                  value={formData.allergies}
                  onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                  placeholder="List any known allergies..."
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Medical Conditions</Label>
                <Textarea
                  value={formData.medical_conditions}
                  onChange={(e) => setFormData({ ...formData, medical_conditions: e.target.value })}
                  placeholder="List any existing medical conditions..."
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Current Medications</Label>
                <Textarea
                  value={formData.medications}
                  onChange={(e) => setFormData({ ...formData, medications: e.target.value })}
                  placeholder="List any current medications..."
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label>Emergency Contact Name</Label>
                  <Input
                    value={formData.emergency_contact_name}
                    onChange={(e) => setFormData({ ...formData, emergency_contact_name: e.target.value })}
                    placeholder="Enter emergency contact name"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Emergency Contact Phone</Label>
                    <Input
                      value={formData.emergency_contact_phone}
                      onChange={(e) => setFormData({ ...formData, emergency_contact_phone: e.target.value })}
                      placeholder="Enter phone number"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Relation</Label>
                    <Input
                      value={formData.emergency_contact_relation}
                      onChange={(e) => setFormData({ ...formData, emergency_contact_relation: e.target.value })}
                      placeholder="e.g., Father, Mother"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Health Insurance Provider</Label>
                  <Input
                    value={formData.health_insurance_provider}
                    onChange={(e) => setFormData({ ...formData, health_insurance_provider: e.target.value })}
                    placeholder="Enter provider name"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Insurance Number</Label>
                  <Input
                    value={formData.health_insurance_number}
                    onChange={(e) => setFormData({ ...formData, health_insurance_number: e.target.value })}
                    placeholder="Enter policy number"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Heart className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Please select a student to add medical record</p>
            </div>
          )}
        </div>
      </DetailSidebar>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Medical Record"
        description="Are you sure you want to delete this medical record? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        loading={deleteMutation.isPending}
      />
    </div>
  );
};
