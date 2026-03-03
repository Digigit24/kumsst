/**
 * Users Management Page
 * Complete CRUD interface for user management
 */

import { useAuth } from '@/hooks/useAuth';
import { isSuperAdmin } from '@/utils/auth.utils';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import { Column, DataTable, FilterConfig } from '../../components/common/DataTable';
import { DetailSidebar } from '../../components/common/DetailSidebar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../components/ui/alert-dialog';
import { Badge } from '../../components/ui/badge';
import { userApi } from '../../services/accounts.service';
import type { UserFilters, UserListItem } from '../../types/accounts.types';
import {
  MoreHorizontal,
  Shield,
  Clock,
  Activity,
  Mail,
  User as UserIcon,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { UserForm } from './components/UserForm';

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// Generate a consistent gradient based on username
const getGradient = (username: string) => {
  const colors = [
    'from-blue-500 to-cyan-400',
    'from-purple-500 to-pink-400',
    'from-orange-500 to-amber-400',
    'from-emerald-500 to-green-400',
    'from-indigo-500 to-purple-400'
  ];
  const index = username.length % colors.length;
  return colors[index];
};

const UsersPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<UserFilters>({ page: 1, page_size: 20 });
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [sidebarMode, setSidebarMode] = useState<'view' | 'create' | 'edit'>('view');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  // Fetch users list
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['users', filters],
    queryFn: () => userApi.list(filters),
  });

  // Fetch selected user details
  const { data: selectedUser } = useQuery({
    queryKey: ['user', selectedUserId],
    queryFn: () => selectedUserId ? userApi.get(selectedUserId) : null,
    enabled: !!selectedUserId,
  });

  // Define table columns
  const columns: Column<UserListItem>[] = [
    {
      key: 'username',
      label: 'Username',
      sortable: true,
      render: (user) => (
        <code className="px-2 py-1 bg-muted rounded text-sm font-medium">
          {user.username}
        </code>
      ),
    },
    {
      key: 'full_name',
      label: 'Full Name',
      sortable: true,
      render: (user) => (
        <div>
          <p className="font-medium text-sm">{user.full_name}</p>
          <p className="text-xs text-muted-foreground">{user.email}</p>
        </div>
      ),
    },
    {
      key: 'user_type_display',
      label: 'User Type',
      render: (user) => (
        <Badge variant="outline">{user.user_type_display}</Badge>
      ),
    },
    {
      key: 'college_name',
      label: 'College',
      render: (user) => (
        <span className="text-sm">{user.college_name || 'N/A'}</span>
      ),
    },
    {
      key: 'is_verified',
      label: 'Verified',
      render: (user) => (
        user.is_verified ? (
          <Badge variant="default">Verified</Badge>
        ) : (
          <Badge variant="secondary">Not Verified</Badge>
        )
      ),
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (user) => (
        <Badge variant={user.is_active ? 'success' : 'destructive'}>
          {user.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
  ];

  // Define filter configuration
  const filterConfig: FilterConfig[] = [
    {
      name: 'is_active',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'true', label: 'Active' },
        { value: 'false', label: 'Inactive' },
      ],
    },
    {
      name: 'is_verified',
      label: 'Verification',
      type: 'select',
      options: [
        { value: 'true', label: 'Verified' },
        { value: 'false', label: 'Not Verified' },
      ],
    },
    {
      name: 'user_type',
      label: 'User Type',
      type: 'select',
      options: [
        { value: 'super_admin', label: 'Super Admin' },
        { value: 'college_admin', label: 'College Admin' },
        { value: 'teacher', label: 'Teacher' },
        { value: 'student', label: 'Student' },
        { value: 'parent', label: 'Parent' },
        { value: 'staff', label: 'Staff' },
        { value: 'central_manager', label: 'Central Store Manager' },
        { value: 'accountant', label: 'Accountant' },
        { value: 'construction_head', label: 'Construction Head' },
        { value: 'jr_engineer', label: 'Jr Engineer' },
        { value: 'clerk', label: 'Clerk' },
      ],
    },
    ...(isSuperAdmin(user as any) ? [{
      name: 'college',
      label: 'College',
      type: 'select' as const,
      options: (() => {
        return [];
      })()
    }] : []),
  ];

  const handleRowClick = (user: UserListItem) => {
    setSelectedUserId(user.id);
    setSidebarMode('view');
    setIsSidebarOpen(true);
  };

  const handleAdd = () => {
    setSelectedUserId(null);
    setSidebarMode('create');
    setIsSidebarOpen(true);
  };

  const handleEdit = () => {
    setSidebarMode('edit');
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
    setSelectedUserId(null);
  };

  const handleFormSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['users'] });
    if (selectedUserId) {
      queryClient.invalidateQueries({ queryKey: ['user', selectedUserId] });
    }
    handleCloseSidebar();
  };

  const handleSubmit = async (formData: any) => {
    if (sidebarMode === 'create') {
      await userApi.create(formData);
    } else if (selectedUser) {
      await userApi.update(selectedUser.id, formData);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const idToDelete = deleteId;
    setPendingDeleteId(idToDelete);
    setDeleteId(null); // Close the confirmation dialog
    setIsDeleting(true);

    try {
      await userApi.delete(idToDelete);
      toast.success('User deleted successfully');

      // Invalidate and wait for refresh to ensure the row stays "deleting" 
      // until it actually disappears from the data
      await queryClient.invalidateQueries({ queryKey: ['users'] });

      if (selectedUserId === idToDelete) {
        handleCloseSidebar();
      }
    } catch (error: any) {
      toast.error(typeof error.message === 'string' ? error.message : 'Failed to delete user');
      // Reset pending ID on error so it returns to normal
      setPendingDeleteId(null);
    } finally {
      setIsDeleting(false);
      // We clear pendingDeleteId after invalidateQueries is done or if it failed
      setPendingDeleteId(null);
    }
  };

  return (
    <div className="p-6">
      <DataTable
        title="Users"
        description="Manage users in the system"
        data={data ?? null}
        columns={columns}
        isLoading={isLoading}
        error={error instanceof Error ? error.message : error ? String(error) : null}
        onRefresh={refetch}
        onAdd={handleAdd}
        onRowClick={handleRowClick}
        filters={filters}
        onFiltersChange={setFilters}
        filterConfig={filterConfig}
        searchPlaceholder="Search by username, name, or email..."
        addButtonLabel="Add User"
        rowClassName={(item) =>
          item.id === pendingDeleteId
            ? 'opacity-50 !bg-red-100 dark:!bg-red-900/30 pointer-events-none transition-all duration-300'
            : ''
        }
      />

      {/* Detail/Create/Edit Sidebar */}
      <DetailSidebar
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
        title={
          sidebarMode === 'create'
            ? 'Add New User'
            : sidebarMode === 'edit'
              ? 'Edit User'
              : selectedUser?.full_name || 'User Details'
        }
        mode={sidebarMode}
        width="xl"
      >
        {sidebarMode === 'create' && (
          <UserForm
            mode="create"
            onSuccess={handleFormSuccess}
            onCancel={handleCloseSidebar}
            onSubmit={handleSubmit}
          />
        )}

        {sidebarMode === 'edit' && selectedUser && (
          <UserForm
            mode="edit"
            user={selectedUser}
            onSuccess={handleFormSuccess}
            onCancel={handleCloseSidebar}
            onSubmit={handleSubmit}
          />
        )}

        {sidebarMode === 'view' && selectedUser && (
          <div className="flex flex-col h-full bg-muted/10">
            {/* Cover Image & Header */}
            <div className="relative">
              <div className={`h-32 w-full bg-gradient-to-r ${getGradient(selectedUser.username)}`} />
              <div className="absolute top-4 right-4 flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-md"
                  onClick={handleEdit}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-white/20 hover:bg-red-500/80 text-white border-0 backdrop-blur-md"
                  onClick={() => setDeleteId(selectedUser.id)}
                  disabled={isDeleting && pendingDeleteId === selectedUser.id}
                >
                  {isDeleting && pendingDeleteId === selectedUser.id ? 'Deleting...' : 'Delete'}
                </Button>
              </div>

              <div className="px-6 pb-4 flex flex-col relative z-10">


                <div className="mt-4 space-y-1">
                  <h2 className="text-2xl font-bold tracking-tight text-foreground">{selectedUser.full_name}</h2>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-3.5 w-3.5" />
                    <span className="text-sm">{selectedUser.email}</span>
                  </div>
                  <div className="flex items-center gap-3 pt-2">
                    <Badge variant={selectedUser.is_active ? 'success' : 'destructive'} className="rounded-full">
                      {selectedUser.is_active ? 'Active Account' : 'Inactive Account'}
                    </Badge>
                    <Badge variant="outline" className="rounded-full bg-background">
                      {selectedUser.user_type_display}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto hidden-scrollbar p-6 space-y-6">

              {/* Key Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-background p-4 rounded-xl border shadow-sm space-y-1">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Verification</span>
                  <div className="flex items-center gap-2">
                    {selectedUser.is_verified ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-orange-500" />
                    )}
                    <span className="font-semibold text-sm">
                      {selectedUser.is_verified ? 'Verified' : 'Pending'}
                    </span>
                  </div>
                </div>
                <div className="bg-background p-4 rounded-xl border shadow-sm space-y-1">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Role</span>
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    <span className="font-semibold text-sm truncate">
                      {selectedUser.is_staff ? 'Staff Member' : 'Regular User'}
                    </span>
                  </div>
                </div>
              </div>

              {/* General Information Card */}
              <Card className="border-none shadow-sm bg-background">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <UserIcon className="h-4 w-4 text-primary" />
                    Personal Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 pt-2">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Username</p>
                      <p className="text-sm font-medium mt-0.5">{selectedUser.username}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">College</p>
                      <p className="text-sm font-medium mt-0.5 truncate" title={selectedUser.college_name || ''}>
                        {selectedUser.college_name || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Phone</p>
                      <p className="text-sm font-medium mt-0.5">{selectedUser.phone || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Gender</p>
                      <p className="text-sm font-medium mt-0.5 capitalize">{selectedUser.gender_display || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Date of Birth</p>
                      <p className="text-sm font-medium mt-0.5">
                        {selectedUser.date_of_birth ? new Date(selectedUser.date_of_birth).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* System Activity Card */}
              <Card className="border-none shadow-sm bg-background">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Activity className="h-4 w-4 text-primary" />
                    Activity Log
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-2">
                  <div className="flex items-start gap-3 relative pb-4 border-l-2 border-muted ml-1.5 pl-4 last:pb-0">
                    <div className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-green-500 ring-4 ring-background" />
                    <div>
                      <p className="text-sm font-medium">Last Login</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {selectedUser.last_login ? new Date(selectedUser.last_login).toLocaleString() : 'Never logged in'}
                      </p>
                      {selectedUser.last_login_ip && (
                        <code className="text-[10px] bg-muted px-1.5 py-0.5 rounded mt-1 inline-block">
                          IP: {selectedUser.last_login_ip}
                        </code>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-3 relative pb-4 border-l-2 border-muted ml-1.5 pl-4 last:pb-0">
                    <div className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-blue-500 ring-4 ring-background" />
                    <div>
                      <p className="text-sm font-medium">Account Updated</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(selectedUser.updated_at).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 relative border-l-2 border-transparent ml-1.5 pl-4">
                    <div className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-purple-500 ring-4 ring-background" />
                    <div>
                      <p className="text-sm font-medium">Joined System</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(selectedUser.date_joined).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

            </div>
          </div>
        )}
      </DetailSidebar>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UsersPage;
