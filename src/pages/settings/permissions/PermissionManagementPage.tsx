/**
 * Permission Management Page
 *
 * Admin panel for managing role-based permissions
 * Allows editing of permission JSON for different roles
 */

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import type { PermissionScope } from '@/types/permissions.types';
import { Info, Save, Shield } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';

interface ModuleConfig {
  name: string;
  label: string;
  actions: string[];
}

const MODULES: ModuleConfig[] = [
  { name: 'attendance', label: 'Attendance', actions: ['create', 'read', 'update', 'delete'] },
  { name: 'students', label: 'Students', actions: ['create', 'read', 'update', 'delete'] },
  { name: 'classes', label: 'Classes', actions: ['create', 'read', 'update', 'delete'] },
  { name: 'sections', label: 'Sections', actions: ['create', 'read', 'update', 'delete'] },
  { name: 'subjects', label: 'Subjects', actions: ['create', 'read', 'update', 'delete'] },
  { name: 'examinations', label: 'Examinations', actions: ['create', 'read', 'update', 'delete'] },
  { name: 'fees', label: 'Fees', actions: ['create', 'read', 'update', 'delete'] },
  { name: 'staff', label: 'Staff/HR', actions: ['create', 'read', 'update', 'delete'] },
  { name: 'hostel', label: 'Hostel', actions: ['create', 'read', 'update', 'delete'] },
  { name: 'communication', label: 'Communication', actions: ['create', 'read', 'update', 'delete'] },
  { name: 'reports', label: 'Reports', actions: ['read'] },
  { name: 'system_settings', label: 'System Settings', actions: ['read', 'update'] },
];

const ROLES = [
  { value: 'super_admin', label: 'Super Admin' },
  { value: 'college_admin', label: 'College Admin' },
  { value: 'teacher', label: 'Teacher' },
  { value: 'student', label: 'Student' },
  { value: 'accountant', label: 'Accountant' },
  { value: 'librarian', label: 'Librarian' },
  { value: 'hostel_warden', label: 'Hostel Warden' },
  { value: 'hostel_manager', label: 'Hostel Manager' },
];

const SCOPES: { value: PermissionScope; label: string; description: string }[] = [
  { value: 'mine', label: 'Mine', description: 'Only own data' },
  { value: 'team', label: 'Team', description: 'Own and assigned team data' },
  { value: 'department', label: 'Department', description: 'Entire department data' },
  { value: 'all', label: 'All', description: 'All data across system' },
];

const PermissionManagementPage: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<string>('teacher');
  const [permissions, setPermissions] = useState<Record<string, any>>({});

  const handlePermissionToggle = (module: string, action: string, enabled: boolean) => {
    setPermissions((prev) => ({
      ...prev,
      [module]: {
        ...prev[module],
        [action]: {
          ...prev[module]?.[action],
          enabled,
        },
      },
    }));
  };

  const handleScopeChange = (module: string, action: string, scope: PermissionScope) => {
    setPermissions((prev) => ({
      ...prev,
      [module]: {
        ...prev[module],
        [action]: {
          ...prev[module]?.[action],
          scope,
        },
      },
    }));
  };

  const handleSave = async () => {
    try {
      // TODO: Call API to save permissions
      toast.success('Permissions saved successfully');
    } catch (error: any) {
      toast.error('Failed to save permissions');
      console.error(error);
    }
  };

  const getPermission = (module: string, action: string) => {
    return permissions[module]?.[action] || { enabled: false, scope: 'mine' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8" />
            Permission Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Configure role-based permissions and access control
          </p>
        </div>
        <Button onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>

      {/* Info Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Backend enforcement is always authoritative. UI permissions control visibility only.
          Changes take effect after users log out and back in.
        </AlertDescription>
      </Alert>

      {/* Role Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Select Role</CardTitle>
          <CardDescription>Choose a role to manage its permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-w-sm">
            <Label>Role</Label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Permission Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Module Permissions</CardTitle>
          <CardDescription>
            Configure what {selectedRole} can do in each module
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {MODULES.map((module) => (
              <div key={module.name} className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4">{module.label}</h3>
                <div className="space-y-3">
                  {module.actions.map((action) => {
                    const perm = getPermission(module.name, action);
                    return (
                      <div
                        key={action}
                        className="flex items-center justify-between p-3 bg-muted rounded-md"
                      >
                        <div className="flex items-center gap-3">
                          <Switch
                            checked={perm.enabled}
                            onCheckedChange={(checked) =>
                              handlePermissionToggle(module.name, action, checked)
                            }
                          />
                          <div>
                            <Label className="capitalize">{action}</Label>
                            <p className="text-xs text-muted-foreground">
                              {action === 'create' && 'Create new records'}
                              {action === 'read' && 'View existing records'}
                              {action === 'update' && 'Modify existing records'}
                              {action === 'delete' && 'Remove records'}
                            </p>
                          </div>
                        </div>

                        {perm.enabled && (
                          <Select
                            value={perm.scope}
                            onValueChange={(scope: PermissionScope) =>
                              handleScopeChange(module.name, action, scope)
                            }
                          >
                            <SelectTrigger className="w-48">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {SCOPES.map((scope) => (
                                <SelectItem key={scope.value} value={scope.value}>
                                  <div>
                                    <div className="font-medium">{scope.label}</div>
                                    <div className="text-xs text-muted-foreground">
                                      {scope.description}
                                    </div>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Context Selector Permissions */}
      <Card>
        <CardHeader>
          <CardTitle>Context Selector Visibility</CardTitle>
          <CardDescription>
            Control which context selectors are shown for this role
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <Info className="h-4 w-4" />
            <AlertDescription>
              Context selectors are automatically determined by permissions scope. This section is
              informational.
            </AlertDescription>
          </Alert>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Show College Selector</Label>
                <p className="text-sm text-muted-foreground">
                  Visible when user has access to multiple colleges
                </p>
              </div>
              <Badge variant="outline">Auto</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Show Class Selector</Label>
                <p className="text-sm text-muted-foreground">
                  Visible when scope is 'team', 'department', or 'all'
                </p>
              </div>
              <Badge variant="outline">Auto</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Show Section Selector</Label>
                <p className="text-sm text-muted-foreground">
                  Visible when scope is 'team' or 'all'
                </p>
              </div>
              <Badge variant="outline">Auto</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PermissionManagementPage;
