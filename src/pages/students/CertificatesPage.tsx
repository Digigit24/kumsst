/**
 * Certificates Page
 * Manages student certificates with CRUD operations
 */

import { DROPDOWN_PAGE_SIZE } from '@/config/app.config';
import { getCurrentUserCollege, isSuperAdmin } from '@/utils/auth.utils';
import { useEffect, useState } from 'react';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Column, DataTable, FilterConfig } from '../../components/common/DataTable';
import { DetailSidebar } from '../../components/common/DetailSidebar';
import { Badge } from '../../components/ui/badge';
import { useSuperAdminContext } from '../../contexts/SuperAdminContext';
import { invalidateCertificates, useCertificatesSWR } from '../../hooks/swr';
import { useAuth } from '../../hooks/useAuth';
import { useColleges } from '../../hooks/useCore';
import { useDeleteCertificate } from '../../hooks/useStudents';
import type { CertificateFilters, CertificateListItem } from '../../types/students.types';
import { CertificateForm } from './components/CertificateForm';

export const CertificatesPage = () => {
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
      setFilters(prev => ({ ...prev, college: normalized || undefined }));
    }
  }, [selectedCollege, isSuper]);
  const [filters, setFilters] = useState<CertificateFilters>({
    page: 1,
    page_size: 20,
    ...(isSuper ? {} : defaultCollegeId ? { college: defaultCollegeId } : {}),
  });
  const { data, isLoading, error, refresh } = useCertificatesSWR(filters);
  const deleteMutation = useDeleteCertificate();

  const [sidebarMode, setSidebarMode] = useState<'view' | 'create' | 'edit'>('view');
  const [selectedCertificate, setSelectedCertificate] = useState<CertificateListItem | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [certificateToDelete, setCertificateToDelete] = useState<CertificateListItem | null>(null);

  const columns: Column<CertificateListItem>[] = [
    {
      key: 'certificate_number',
      label: 'Certificate No.',
      sortable: true,
      className: 'font-medium',
    },
    {
      key: 'student_name',
      label: 'Student Name',
      sortable: true,
      className: 'font-semibold',
    },
    {
      key: 'certificate_type',
      label: 'Type',
      sortable: true,
      render: (cert) => (
        <Badge variant="outline" className="capitalize">
          {cert.certificate_type.replace('_', ' ')}
        </Badge>
      ),
    },
    {
      key: 'issue_date',
      label: 'Issue Date',
      sortable: true,
      render: (cert) => new Date(cert.issue_date).toLocaleDateString(),
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (cert) => (
        <Badge variant={cert.is_active ? 'default' : 'secondary'}>
          {cert.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
  ];

  const handleRowClick = (certificate: CertificateListItem) => {
    setSelectedCertificate(certificate);
    setSidebarMode('edit');
    setIsSidebarOpen(true);
  };

  const handleAdd = () => {
    setSelectedCertificate(null);
    setSidebarMode('create');
    setIsSidebarOpen(true);
  };

  const handleDelete = (certificate: CertificateListItem) => {
    setCertificateToDelete(certificate);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (certificateToDelete) {
      await deleteMutation.mutate(certificateToDelete.id);
      invalidateCertificates();
      setDeleteDialogOpen(false);
      setCertificateToDelete(null);
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
        if (parsed) {
          return { ...next, college: parsed };
        }
        const { college, ...rest } = next as any;
        return rest;
      }
      return next;
    });
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
        title="Student Certificates"
        description="Manage student certificates (Bonafide, TC, Marksheet, Degree). Click on any row to edit."
        data={data}
        columns={columns}
        isLoading={isLoading}
        error={error?.message}
        onRefresh={refresh}
        onAdd={handleAdd}
        onDelete={handleDelete}
        onRowClick={handleRowClick}
        filters={filters}
        onFiltersChange={handleFiltersChange as any}
        filterConfig={filterConfig}
        searchPlaceholder="Search certificates..."
        addButtonLabel="Issue Certificate"
      />

      <DetailSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        title={
          sidebarMode === 'create'
            ? 'Issue Certificate'
            : sidebarMode === 'edit'
              ? 'Edit Certificate'
              : 'Certificate Details'
        }
        mode={sidebarMode}
      >
        <CertificateForm
          mode={sidebarMode}
          certificateId={selectedCertificate?.id}
          collegeId={selectedCollegeId}
          onSuccess={() => {
            setIsSidebarOpen(false);
            invalidateCertificates();
          }}
          onCancel={() => setIsSidebarOpen(false)}
        />
      </DetailSidebar>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Certificate"
        description={`Are you sure you want to delete the certificate "${certificateToDelete?.certificate_number}" for "${certificateToDelete?.student_name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        loading={deleteMutation.isLoading}
      />
    </div>
  );
};
