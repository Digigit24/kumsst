/**
 * Permissions Management Page
 * Manage role-based permissions
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Switch } from '../../components/ui/switch';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import {
  Shield,
  Users,
  BookOpen,
  GraduationCap,
  DollarSign,
  Package,
  MessageSquare,
  Settings,
  FileText,
  Save,
  RefreshCw,
  Lock,
  Unlock,
  CheckCircle2,
  XCircle,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { permissionsApi } from '../../services/core.service';
import type { UserPermissionsJSON, PermissionDetail } from '../../types/permissions.types';

const PermissionsPage = () => {
  const queryClient = useQueryClient();
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [permissions, setPermissions] = useState<UserPermissionsJSON>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [existingPermissionId, setExistingPermissionId] = useState<number | null>(null);

  // Fetch existing permissions when role is selected
  const { data: existingPermissions, isLoading: isLoadingPermissions } = useQuery({
    queryKey: ['permissions', selectedRole],
    queryFn: async () => {
      if (!selectedRole) return null;
      const collegeId = localStorage.getItem('kumss_college_id');
      const response = await permissionsApi.list({
        college: collegeId ? parseInt(collegeId) : undefined,
        role: selectedRole
      });
      return response.results?.[0] || null;
    },
    enabled: !!selectedRole,
  });

  // Load existing permissions into state
  useEffect(() => {
    if (existingPermissions) {
      setExistingPermissionId(existingPermissions.id);
      setPermissions(existingPermissions.permissions_json || {});
    } else {
      setExistingPermissionId(null);
      setPermissions({});
    }
    setHasChanges(false);
  }, [existingPermissions]);

  // Mutation for saving permissions
  const savePermissionsMutation = useMutation({
    mutationFn: async (data: any) => {
      // Use update if permission exists, otherwise create
      if (existingPermissionId) {
        return permissionsApi.update(existingPermissionId, data);
      } else {
        return permissionsApi.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
      toast.success(`Permissions ${existingPermissionId ? 'updated' : 'created'} successfully for ${roles.find(r => r.value === selectedRole)?.label}`);
      setHasChanges(false);
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to save permissions');
    },
  });

  // Role options
  const roles = [
    { value: 'super_admin', label: 'Super Admin', color: 'text-red-600' },
    { value: 'college_admin', label: 'College Admin', color: 'text-blue-600' },
    { value: 'teacher', label: 'Teacher', color: 'text-green-600' },
    { value: 'student', label: 'Student', color: 'text-purple-600' },
    { value: 'parent', label: 'Parent', color: 'text-orange-600' },
  ];

  // Permission modules with icons and permissions
  const permissionModules = [
    {
      module: 'students',
      displayName: 'Students',
      icon: GraduationCap,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      permissions: [
        { action: 'read', label: 'View Students', description: 'Can view student list and details' },
        { action: 'create', label: 'Create Students', description: 'Can add new students' },
        { action: 'update', label: 'Edit Students', description: 'Can modify student information' },
        { action: 'delete', label: 'Delete Students', description: 'Can remove students' },
      ],
    },
    {
      module: 'classes',
      displayName: 'Classes',
      icon: BookOpen,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      permissions: [
        { action: 'read', label: 'View Classes', description: 'Can view class list and details' },
        { action: 'create', label: 'Create Classes', description: 'Can create new classes' },
        { action: 'update', label: 'Edit Classes', description: 'Can modify class information' },
        { action: 'delete', label: 'Delete Classes', description: 'Can remove classes' },
      ],
    },
    {
      module: 'subjects',
      displayName: 'Subjects',
      icon: BookOpen,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
      permissions: [
        { action: 'read', label: 'View Subjects', description: 'Can view subjects' },
        { action: 'create', label: 'Create Subjects', description: 'Can create subjects' },
        { action: 'update', label: 'Edit Subjects', description: 'Can edit subjects' },
        { action: 'delete', label: 'Delete Subjects', description: 'Can delete subjects' },
      ],
    },
    {
      module: 'attendance',
      displayName: 'Attendance',
      icon: CheckCircle2,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      permissions: [
        { action: 'read', label: 'View Attendance', description: 'Can view attendance records' },
        { action: 'create', label: 'Mark Attendance', description: 'Can mark student attendance' },
        { action: 'update', label: 'Edit Attendance', description: 'Can modify attendance records' },
        { action: 'delete', label: 'Delete Attendance', description: 'Can delete attendance records' },
      ],
    },
    {
      module: 'examinations',
      displayName: 'Examinations',
      icon: FileText,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
      permissions: [
        { action: 'read', label: 'View Exams', description: 'Can view exam schedules and results' },
        { action: 'create', label: 'Create Exams', description: 'Can create exam schedules' },
        { action: 'update', label: 'Edit Exams', description: 'Can modify exam details' },
        { action: 'delete', label: 'Delete Exams', description: 'Can delete exams' },
      ],
    },
    {
      module: 'fees',
      displayName: 'Fees',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      permissions: [
        { action: 'read', label: 'View Fee Records', description: 'Can view fee structures and payments' },
        { action: 'create', label: 'Create Fees', description: 'Can create fee records' },
        { action: 'update', label: 'Edit Fees', description: 'Can modify fee information' },
        { action: 'delete', label: 'Delete Fees', description: 'Can remove fee records' },
      ],
    },
    {
      module: 'library',
      displayName: 'Library',
      icon: BookOpen,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      permissions: [
        { action: 'read', label: 'View Library', description: 'Can view library items' },
        { action: 'create', label: 'Add Books', description: 'Can add library items' },
        { action: 'update', label: 'Edit Library', description: 'Can modify library items' },
        { action: 'delete', label: 'Delete Items', description: 'Can remove library items' },
      ],
    },
    {
      module: 'staff',
      displayName: 'Staff/HR',
      icon: Users,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-100',
      permissions: [
        { action: 'read', label: 'View Staff', description: 'Can view staff records' },
        { action: 'create', label: 'Add Staff', description: 'Can add new staff members' },
        { action: 'update', label: 'Edit Staff', description: 'Can modify staff information' },
        { action: 'delete', label: 'Delete Staff', description: 'Can remove staff records' },
      ],
    },
  ];

  // Get default scope based on selected role
  const getDefaultScope = () => {
    switch (selectedRole) {
      case 'super_admin':
      case 'college_admin':
        return 'all';
      case 'teacher':
        return 'team';
      case 'student':
      case 'parent':
        return 'mine';
      default:
        return 'all';
    }
  };

  const handlePermissionToggle = (moduleName: string, action: string) => {
    setPermissions(prev => {
      const modulePerms = prev[moduleName] || {};
      const actionPerm = modulePerms[action as keyof typeof modulePerms] as PermissionDetail | undefined;
      const willBeEnabled = !(actionPerm?.enabled ?? false);

      return {
        ...prev,
        [moduleName]: {
          ...modulePerms,
          [action]: {
            enabled: willBeEnabled,
            scope: willBeEnabled ? (actionPerm?.scope || getDefaultScope()) : 'none',
          },
        },
      };
    });
    setHasChanges(true);
  };

  const handleScopeChange = (moduleName: string, action: string, newScope: string) => {
    setPermissions(prev => {
      const modulePerms = prev[moduleName] || {};
      const actionPerm = modulePerms[action as keyof typeof modulePerms] as PermissionDetail | undefined;

      if (!actionPerm?.enabled) return prev; // Don't change scope if permission is disabled

      return {
        ...prev,
        [moduleName]: {
          ...modulePerms,
          [action]: {
            enabled: true,
            scope: newScope,
          },
        },
      };
    });
    setHasChanges(true);
  };

  const handleSelectAll = (moduleName: string, modulePermissions: any[]) => {
    const modulePerms = permissions[moduleName] || {};
    const allEnabled = modulePermissions.every(p => {
      const actionPerm = modulePerms[p.action as keyof typeof modulePerms] as PermissionDetail | undefined;
      return actionPerm?.enabled === true;
    });

    const defaultScope = getDefaultScope();
    const newModulePerms: any = {};
    const willEnable = !allEnabled;

    modulePermissions.forEach(p => {
      newModulePerms[p.action] = {
        enabled: willEnable,
        scope: willEnable ? defaultScope : 'none',
      };
    });

    setPermissions(prev => ({
      ...prev,
      [moduleName]: newModulePerms,
    }));
    setHasChanges(true);
  };

  const getPermissionScope = (moduleName: string, action: string): string => {
    const modulePerms = permissions[moduleName];
    if (!modulePerms) return getDefaultScope();
    const actionPerm = modulePerms[action as keyof typeof modulePerms] as PermissionDetail | undefined;
    return actionPerm?.scope || getDefaultScope();
  };

  const handleSave = () => {
    if (!selectedRole) {
      toast.error('Please select a role first');
      return;
    }

    // Prepare permissions data - only include enabled permissions
    const filteredPermissions: UserPermissionsJSON = {};

    permissionModules.forEach(module => {
      const modulePerms = permissions[module.module] || {};
      const enabledPerms: any = {};

      module.permissions.forEach(perm => {
        const actionPerm = modulePerms[perm.action as keyof typeof modulePerms] as PermissionDetail | undefined;

        // Only include if enabled is true
        if (actionPerm?.enabled === true) {
          enabledPerms[perm.action] = {
            enabled: true,
            scope: actionPerm.scope || getDefaultScope(),
          };
        }
      });

      // Only add module if it has at least one enabled permission
      if (Object.keys(enabledPerms).length > 0) {
        filteredPermissions[module.module] = enabledPerms;
      }
    });

    const collegeId = localStorage.getItem('kumss_college_id');

    const data = {
      college: collegeId ? parseInt(collegeId) : 0,
      role: selectedRole,
      permissions_json: filteredPermissions,
      is_active: true,
    };

    savePermissionsMutation.mutate(data);
  };

  const handleReset = () => {
    setPermissions({});
    setHasChanges(false);
    toast.info('Permissions reset');
  };

  const getEnabledCount = (moduleName: string, modulePermissions: any[]) => {
    const modulePerms = permissions[moduleName] || {};
    return modulePermissions.filter(p => {
      const actionPerm = modulePerms[p.action as keyof typeof modulePerms] as PermissionDetail | undefined;
      return actionPerm?.enabled === true;
    }).length;
  };

  const isPermissionEnabled = (moduleName: string, action: string): boolean => {
    const modulePerms = permissions[moduleName];
    if (!modulePerms) return false;
    const actionPerm = modulePerms[action as keyof typeof modulePerms] as PermissionDetail | undefined;
    return actionPerm?.enabled === true;
  };

  return (
    <div className="min-h-screen p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            Role Permissions
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage access control and permissions for different user roles
          </p>
        </div>
        <div className="flex gap-2">
          {hasChanges && (
            <Button variant="outline" onClick={handleReset}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          )}
          <Button
            onClick={handleSave}
            disabled={!selectedRole || !hasChanges || savePermissionsMutation.isPending || isLoadingPermissions}
          >
            {savePermissionsMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {existingPermissionId ? 'Updating...' : 'Saving...'}
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {existingPermissionId ? 'Update Permissions' : 'Save Permissions'}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Role Selector Card */}
      <Card className="border-2 border-primary/20 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Select Role
          </CardTitle>
          <CardDescription>
            Choose a role to view and configure its permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select a role to manage permissions" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      <div className="flex items-center gap-2">
                        <Shield className={`h-4 w-4 ${role.color}`} />
                        <span className="font-medium">{role.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedRole && (
              <Badge variant="default" className="h-12 px-6 text-base">
                {roles.find(r => r.value === selectedRole)?.label}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Permissions Grid */}
      {selectedRole ? (
        isLoadingPermissions ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Loader2 className="h-12 w-12 mx-auto mb-4 text-primary animate-spin" />
              <h3 className="text-lg font-semibold mb-2">Loading Permissions...</h3>
              <p className="text-muted-foreground">
                Fetching existing permissions for {roles.find(r => r.value === selectedRole)?.label}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {permissionModules.map((module) => {
            const Icon = module.icon;
            const enabledCount = getEnabledCount(module.module, module.permissions);
            const totalCount = module.permissions.length;
            const allEnabled = enabledCount === totalCount;

            return (
              <Card key={module.module} className="overflow-hidden hover:shadow-lg transition-all">
                <CardHeader className={`${module.bgColor} border-b`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-white flex items-center justify-center shadow-sm">
                        <Icon className={`h-5 w-5 ${module.color}`} />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{module.displayName}</CardTitle>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {enabledCount} of {totalCount} enabled
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant={allEnabled ? "default" : "outline"}
                      onClick={() => handleSelectAll(module.module, module.permissions)}
                    >
                      {allEnabled ? <Unlock className="h-4 w-4 mr-1" /> : <Lock className="h-4 w-4 mr-1" />}
                      {allEnabled ? 'Enabled' : 'Enable All'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {module.permissions.map((permission) => {
                      const permKey = `${module.module}-${permission.action}`;
                      const isEnabled = isPermissionEnabled(module.module, permission.action);
                      const currentScope = getPermissionScope(module.module, permission.action);

                      return (
                        <div
                          key={permKey}
                          className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors"
                        >
                          <Switch
                            id={permKey}
                            checked={isEnabled}
                            onCheckedChange={() => handlePermissionToggle(module.module, permission.action)}
                            className="mt-0.5"
                          />
                          <div className="flex-1">
                            <Label
                              htmlFor={permKey}
                              className="cursor-pointer font-medium text-sm"
                            >
                              {permission.label}
                            </Label>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {permission.description}
                            </p>
                            {isEnabled && (
                              <div className="mt-2">
                                <Select
                                  value={currentScope}
                                  onValueChange={(value) => handleScopeChange(module.module, permission.action, value)}
                                >
                                  <SelectTrigger className="h-8 w-32 text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="mine">
                                      <span className="text-xs">Mine Only</span>
                                    </SelectItem>
                                    <SelectItem value="team">
                                      <span className="text-xs">Team/Class</span>
                                    </SelectItem>
                                    <SelectItem value="department">
                                      <span className="text-xs">Department</span>
                                    </SelectItem>
                                    <SelectItem value="all">
                                      <span className="text-xs">All Data</span>
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            )}
                          </div>
                          {isEnabled && (
                            <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
          </div>
        )
      ) : (
        <Card className="border-dashed border-2">
          <CardContent className="p-12 text-center">
            <Shield className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-20" />
            <h3 className="text-lg font-semibold mb-2">No Role Selected</h3>
            <p className="text-muted-foreground">
              Please select a role above to view and manage its permissions
            </p>
          </CardContent>
        </Card>
      )}

      {/* Summary Card */}
      {selectedRole && (
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Total Permissions Enabled</h3>
                <p className="text-3xl font-bold text-primary mt-1">
                  {Object.values(permissions).reduce((count, modulePerms) => {
                    if (!modulePerms) return count;
                    return count + Object.values(modulePerms).filter((perm: any) => perm?.enabled === true).length;
                  }, 0)}
                </p>
              </div>
              <div className="text-right">
                <h3 className="text-sm font-medium text-muted-foreground">For Role</h3>
                <p className="text-lg font-semibold mt-1">
                  {roles.find(r => r.value === selectedRole)?.label}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PermissionsPage;
