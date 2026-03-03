/**
 * Student Groups Page
 * Manage student groups (Morning Batch, Evening Batch, etc.)
 */

import { DROPDOWN_PAGE_SIZE } from '@/config/app.config';
import { Trash2 } from 'lucide-react'; // Import Icon
import { useState } from 'react';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Column, DataTable, FilterConfig } from '../../components/common/DataTable';
import { DetailSidebar } from '../../components/common/DetailSidebar';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button'; // Import Button
import { invalidateStudentGroups, useStudentGroupsSWR } from '../../hooks/swr';
import { useAuth } from '../../hooks/useAuth';
import { useColleges } from '../../hooks/useCore';
import { useDeleteStudentGroup, useRemoveStudentsFromGroup, useStudentGroup } from '../../hooks/useStudents';
import type { StudentGroupFilters, StudentGroupListItem } from '../../types/students.types';
import { getCurrentUserCollege, isSuperAdmin } from '../../utils/auth.utils';
import { AddStudentsDialog } from './components/AddStudentsDialog'; // Import Dialog
import { StudentGroupForm } from './components/StudentGroupForm';

export const StudentGroupsPage = () => {
  const { user } = useAuth();
  const isSuper = isSuperAdmin(user as any);
  const defaultCollege = getCurrentUserCollege(user as any);
  const [selectedCollegeId, setSelectedCollegeId] = useState<number | null>(
    isSuper ? null : defaultCollege
  );
  const [filters, setFilters] = useState<StudentGroupFilters>({
    page: 1,
    page_size: 20,
    ...(isSuper ? {} : defaultCollege ? { college: defaultCollege } : {}),
  });
  const { data, isLoading, error, refresh } = useStudentGroupsSWR(filters);
  const deleteMutation = useDeleteStudentGroup();
  const removeStudentsMutation = useRemoveStudentsFromGroup();

  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [sidebarMode, setSidebarMode] = useState<'view' | 'create' | 'edit'>('view');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAddStudentDialogOpen, setIsAddStudentDialogOpen] = useState(false); // New State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<StudentGroupListItem | null>(null);
  const [studentToRemove, setStudentToRemove] = useState<{ id: number, full_name: string } | null>(null);

  const { data: selectedGroup, refetch: refetchGroup } = useStudentGroup(selectedGroupId); // Destructure refetch
  const { data: collegesData } = useColleges({ page_size: DROPDOWN_PAGE_SIZE, is_active: true });

  const handleCollegeChange = (collegeId: number | string) => {
    const parsed = collegeId === '' ? null : Number(collegeId);
    const normalized = Number.isFinite(parsed) ? (parsed as number) : null;
    setSelectedCollegeId(normalized);
    setFilters(prev => {
      const next = { ...prev, page: 1 };
      if (normalized) return { ...next, college: normalized };
      const { college, ...rest } = next as any;
      return rest;
    });
  };

  // Define table columns
  const columns: Column<StudentGroupListItem>[] = [
    {
      key: 'name',
      label: 'Group Name',
      sortable: true,
      render: (group) => (
        <span className="font-medium">{group.name}</span>
      ),
    },
    {
      key: 'college_name',
      label: 'College',
      render: (group) => (
        <span className="text-sm text-muted-foreground">{group.college_name}</span>
      ),
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (group) => (
        <Badge variant={group.is_active ? 'success' : 'destructive'}>
          {group.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
  ];

  // Define filter configuration
  const filterConfig: FilterConfig[] = [
    ...(isSuper ? [{
      name: 'college',
      label: 'College',
      type: 'select' as const,
      options: collegesData?.results.map(c => ({ value: c.id.toString(), label: c.name })) || [],
    }] : []),
    {
      name: 'is_active',
      label: 'Active Status',
      type: 'select',
      options: [
        { value: 'true', label: 'Active' },
        { value: 'false', label: 'Inactive' },
      ],
    },
  ];

  const handleRowClick = (group: StudentGroupListItem) => {
    setSelectedGroupId(group.id);
    setSidebarMode('view');
    setIsSidebarOpen(true);
  };

  const handleAdd = () => {
    setSelectedGroupId(null);
    setSidebarMode('create');
    setIsSidebarOpen(true);
  };

  const handleEdit = () => {
    setSidebarMode('edit');
  };

  const handleDelete = (group: StudentGroupListItem) => {
    setGroupToDelete(group);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (groupToDelete) {
      await deleteMutation.mutate(groupToDelete.id);
      invalidateStudentGroups();
      setDeleteDialogOpen(false);
      setGroupToDelete(null);
    }
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
    setSelectedGroupId(null);
  };

  const initiateRemoveStudent = (student: { id: number, full_name: string }) => {
    setStudentToRemove(student);
  };

  const confirmRemoveStudent = async () => {
    if (selectedGroupId && studentToRemove) {
      try {
        await removeStudentsMutation.mutate({ id: selectedGroupId, studentIds: [studentToRemove.id] });
        refetchGroup();
        setStudentToRemove(null);
      } catch (error) {
        // Failed to remove student
      }
    }
  };

  const handleFormSuccess = () => {
    invalidateStudentGroups();
    // Keep sidebar open if editing/creating to show result?
    // Usually standard behavior is close. But if we are in 'view' mode (after adding students), we want to stay in view mode.
    // This function is seemingly for the GroupForm (create/edit group).
    if (sidebarMode === 'create' || sidebarMode === 'edit') {
      handleCloseSidebar();
    }
  };

  const handleAddStudentsSuccess = () => {
    refetchGroup();
    // We don't close sidebar here, just the AddStudentsDialog closes itself via its own logic/props
  };

  return (
    <div className="p-6 transition-all duration-300 ease-in-out">

      <DataTable
        title="Student Groups"
        description="Manage student groups such as Morning Batch, Evening Batch, Hostel Students, etc."
        data={data}
        columns={columns}
        isLoading={isLoading}
        error={error?.message}
        onRefresh={refresh}
        onAdd={handleAdd}
        onDelete={handleDelete}
        onRowClick={handleRowClick}
        filters={filters}
        onFiltersChange={setFilters}
        filterConfig={filterConfig}
        searchPlaceholder="Search groups by name..."
        addButtonLabel="Add Group"
      />

      {/* Detail/Create/Edit Sidebar */}
      <DetailSidebar
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
        title={
          sidebarMode === 'create'
            ? 'Add New Group'
            : sidebarMode === 'edit'
              ? 'Edit Group'
              : selectedGroup?.name || 'Group Details'
        }
        mode={sidebarMode}
        width="lg"
      >
        {sidebarMode === 'create' && (
          <StudentGroupForm
            mode="create"
            onSuccess={handleFormSuccess}
            onCancel={handleCloseSidebar}
          />
        )}

        {sidebarMode === 'edit' && selectedGroup && (
          <StudentGroupForm
            mode="edit"
            group={selectedGroup}
            onSuccess={handleFormSuccess}
            onCancel={handleCloseSidebar}
          />
        )}

        {sidebarMode === 'view' && selectedGroup && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Header Actions */}
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsAddStudentDialogOpen(true)}
              >
                Add Students
              </Button>
              <Button
                onClick={handleEdit}
              >
                Edit Group
              </Button>
            </div>

            {/* Group Details */}
            <div className="space-y-6">
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">Basic Information</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-muted-foreground">Group Name</label>
                    <p className="font-medium text-lg">{selectedGroup.name}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">College</label>
                    <p className="font-medium">{selectedGroup.college_name}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Status</label>
                    <div className="mt-1">
                      <Badge variant={selectedGroup.is_active ? 'success' : 'destructive'}>
                        {selectedGroup.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                  {selectedGroup.description && (
                    <div>
                      <label className="text-sm text-muted-foreground">Description</label>
                      <p className="text-sm">{selectedGroup.description}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Students List (New Section) */}
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">Students ({(selectedGroup as any).students?.length || 0})</h3>
                  {/* Optional: Add a small button here too? No, main buttons are at top */}
                </div>

                {(selectedGroup as any).students && (selectedGroup as any).students.length > 0 ? (
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                    {(selectedGroup as any).students.map((student: any) => (
                      <div key={student.id} className="flex justify-between items-center p-2 bg-background rounded border">
                        <div>
                          <p className="font-medium text-sm">{student.full_name}</p>
                          <p className="text-xs text-muted-foreground">{student.admission_number}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => initiateRemoveStudent(student)}
                          disabled={removeStudentsMutation.isLoading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground text-center py-4">
                    No students in this group yet.
                  </div>
                )}
              </div>

              {/* Audit Information */}
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">Audit Information</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <label className="text-xs text-muted-foreground">Created At</label>
                    <p>{new Date(selectedGroup.created_at).toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Updated At</label>
                    <p>{new Date(selectedGroup.updated_at).toLocaleString()}</p>
                  </div>
                  {selectedGroup.created_by && (
                    <div>
                      <label className="text-xs text-muted-foreground">Created By</label>
                      <p>{selectedGroup.created_by.first_name} {selectedGroup.created_by.last_name}</p>
                    </div>
                  )}
                  {selectedGroup.updated_by && (
                    <div>
                      <label className="text-xs text-muted-foreground">Updated By</label>
                      <p>{selectedGroup.updated_by.first_name} {selectedGroup.updated_by.last_name}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </DetailSidebar>

      <ConfirmDialog
        open={!!studentToRemove}
        onOpenChange={(open) => !open && setStudentToRemove(null)}
        title="Remove Student from Group"
        description={`Are you sure you want to remove "${studentToRemove?.full_name}" from this group?`}
        confirmLabel="Remove"
        onConfirm={confirmRemoveStudent}
        loading={removeStudentsMutation.isLoading}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Student Group"
        description={`Are you sure you want to delete the group "${groupToDelete?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        loading={deleteMutation.isLoading}
      />

      {/* Add Students Dialog */}
      {selectedGroupId && (
        <AddStudentsDialog
          isOpen={isAddStudentDialogOpen}
          onClose={() => setIsAddStudentDialogOpen(false)}
          groupId={selectedGroupId}
          collegeId={selectedGroup?.college}
          onSuccess={handleAddStudentsSuccess}
        />
      )}
    </div>
  );
};
