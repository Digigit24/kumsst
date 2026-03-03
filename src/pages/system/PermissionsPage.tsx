/**
 * System Permissions Reference Page
 * Comprehensive view of all available permissions in the KUMSS ERP system
 */

import { useState, useMemo } from 'react';
import { useDebounce, DEBOUNCE_DELAYS } from '../../hooks/useDebounce';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  Shield,
  Search,
  FileText,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  DollarSign,
  Building2,
  Settings,
  BarChart3,
  FileCheck,
  Briefcase,
  Globe,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  Edit,
  Trash2,
  Plus,
  Package,
  Bell,
} from 'lucide-react';

// ============================================================================
// PERMISSION DEFINITIONS
// ============================================================================

interface PermissionAction {
  key: string;
  name: string;
  description: string;
  icon: any;
  color: string;
}

interface PermissionModule {
  key: string;
  name: string;
  description: string;
  category: 'core' | 'academic' | 'financial' | 'administration' | 'reports';
  icon: any;
  actions: PermissionAction[];
}

const PERMISSION_ACTIONS: Record<string, PermissionAction> = {
  view: { key: 'view', name: 'View', description: 'View and read data', icon: Eye, color: 'text-blue-600' },
  create: { key: 'create', name: 'Create', description: 'Create new records', icon: Plus, color: 'text-green-600' },
  edit: { key: 'edit', name: 'Edit', description: 'Modify existing records', icon: Edit, color: 'text-orange-600' },
  delete: { key: 'delete', name: 'Delete', description: 'Remove records', icon: Trash2, color: 'text-red-600' },
  export: { key: 'export', name: 'Export', description: 'Export data to files', icon: FileText, color: 'text-purple-600' },
};

const PERMISSION_MODULES: PermissionModule[] = [
  {
    key: 'users',
    name: 'User Management',
    description: 'Manage system users, authentication, and access control',
    category: 'core',
    icon: Users,
    actions: [
      PERMISSION_ACTIONS.view,
      PERMISSION_ACTIONS.create,
      PERMISSION_ACTIONS.edit,
      PERMISSION_ACTIONS.delete,
      { key: 'manage_permissions', name: 'Manage Permissions', description: 'Assign roles and permissions', icon: Shield, color: 'text-indigo-600' },
      { key: 'reset_password', name: 'Reset Password', description: 'Reset user passwords', icon: Lock, color: 'text-yellow-600' },
    ],
  },
  {
    key: 'students',
    name: 'Student Management',
    description: 'Manage student records, enrollment, and academic information',
    category: 'academic',
    icon: GraduationCap,
    actions: [
      PERMISSION_ACTIONS.view,
      PERMISSION_ACTIONS.create,
      PERMISSION_ACTIONS.edit,
      PERMISSION_ACTIONS.delete,
      PERMISSION_ACTIONS.export,
      { key: 'view_academic', name: 'View Academic Records', description: 'Access student academic history', icon: FileText, color: 'text-blue-600' },
      { key: 'edit_academic', name: 'Edit Academic Records', description: 'Modify academic information', icon: Edit, color: 'text-orange-600' },
      { key: 'view_sensitive', name: 'View Sensitive Data', description: 'Access sensitive student information', icon: EyeOff, color: 'text-red-600' },
    ],
  },
  {
    key: 'teachers',
    name: 'Teacher Management',
    description: 'Manage teaching staff and course assignments',
    category: 'academic',
    icon: Briefcase,
    actions: [
      PERMISSION_ACTIONS.view,
      PERMISSION_ACTIONS.create,
      PERMISSION_ACTIONS.edit,
      PERMISSION_ACTIONS.delete,
      { key: 'assign_courses', name: 'Assign Courses', description: 'Assign teachers to courses', icon: BookOpen, color: 'text-green-600' },
      { key: 'view_schedule', name: 'View Schedule', description: 'View teaching schedules', icon: Calendar, color: 'text-blue-600' },
    ],
  },
  {
    key: 'courses',
    name: 'Course Management',
    description: 'Manage courses, subjects, and curriculum',
    category: 'academic',
    icon: BookOpen,
    actions: [
      PERMISSION_ACTIONS.view,
      PERMISSION_ACTIONS.create,
      PERMISSION_ACTIONS.edit,
      PERMISSION_ACTIONS.delete,
      { key: 'manage_enrollment', name: 'Manage Enrollment', description: 'Handle student course enrollment', icon: Users, color: 'text-green-600' },
      { key: 'manage_syllabus', name: 'Manage Syllabus', description: 'Edit course syllabus and content', icon: FileText, color: 'text-purple-600' },
    ],
  },
  {
    key: 'classes',
    name: 'Class Management',
    description: 'Manage academic classes and sections',
    category: 'academic',
    icon: Building2,
    actions: [
      PERMISSION_ACTIONS.view,
      PERMISSION_ACTIONS.create,
      PERMISSION_ACTIONS.edit,
      PERMISSION_ACTIONS.delete,
      { key: 'assign_teachers', name: 'Assign Teachers', description: 'Assign teachers to classes', icon: Users, color: 'text-blue-600' },
    ],
  },
  {
    key: 'attendance',
    name: 'Attendance Management',
    description: 'Track and manage student and staff attendance',
    category: 'academic',
    icon: Calendar,
    actions: [
      PERMISSION_ACTIONS.view,
      { key: 'mark', name: 'Mark Attendance', description: 'Record attendance', icon: CheckCircle2, color: 'text-green-600' },
      PERMISSION_ACTIONS.edit,
      PERMISSION_ACTIONS.delete,
      { key: 'reports', name: 'Generate Reports', description: 'Create attendance reports', icon: BarChart3, color: 'text-purple-600' },
      PERMISSION_ACTIONS.export,
    ],
  },
  {
    key: 'examinations',
    name: 'Examination Management',
    description: 'Manage exams, results, and assessments',
    category: 'academic',
    icon: FileCheck,
    actions: [
      PERMISSION_ACTIONS.view,
      PERMISSION_ACTIONS.create,
      PERMISSION_ACTIONS.edit,
      PERMISSION_ACTIONS.delete,
      { key: 'manage_marks', name: 'Manage Marks', description: 'Enter and edit exam marks', icon: Edit, color: 'text-orange-600' },
      { key: 'publish_results', name: 'Publish Results', description: 'Publish exam results', icon: Globe, color: 'text-green-600' },
      { key: 'view_analytics', name: 'View Analytics', description: 'Access exam analytics', icon: BarChart3, color: 'text-blue-600' },
    ],
  },
  {
    key: 'library',
    name: 'Library Management',
    description: 'Manage library resources, books, and transactions',
    category: 'administration',
    icon: BookOpen,
    actions: [
      PERMISSION_ACTIONS.view,
      { key: 'issue_books', name: 'Issue Books', description: 'Issue books to members', icon: FileText, color: 'text-green-600' },
      { key: 'return_books', name: 'Return Books', description: 'Process book returns', icon: CheckCircle2, color: 'text-blue-600' },
      { key: 'manage_inventory', name: 'Manage Inventory', description: 'Manage library inventory', icon: Package, color: 'text-purple-600' },
      { key: 'manage_fines', name: 'Manage Fines', description: 'Handle overdue fines', icon: DollarSign, color: 'text-red-600' },
    ],
  },
  {
    key: 'finance',
    name: 'Financial Management',
    description: 'Manage fees, payments, and financial transactions',
    category: 'financial',
    icon: DollarSign,
    actions: [
      PERMISSION_ACTIONS.view,
      { key: 'create_fees', name: 'Create Fees', description: 'Create fee structures', icon: Plus, color: 'text-green-600' },
      { key: 'collect_fees', name: 'Collect Fees', description: 'Process fee payments', icon: DollarSign, color: 'text-blue-600' },
      { key: 'issue_refunds', name: 'Issue Refunds', description: 'Process refunds', icon: XCircle, color: 'text-red-600' },
      { key: 'view_reports', name: 'View Reports', description: 'View financial reports', icon: BarChart3, color: 'text-purple-600' },
      PERMISSION_ACTIONS.export,
    ],
  },
  {
    key: 'departments',
    name: 'Department Management',
    description: 'Manage academic and administrative departments',
    category: 'administration',
    icon: Building2,
    actions: [
      PERMISSION_ACTIONS.view,
      PERMISSION_ACTIONS.create,
      PERMISSION_ACTIONS.edit,
      PERMISSION_ACTIONS.delete,
      { key: 'assign_staff', name: 'Assign Staff', description: 'Assign staff to departments', icon: Users, color: 'text-blue-600' },
    ],
  },
  {
    key: 'colleges',
    name: 'College Management',
    description: 'Manage college/institution information',
    category: 'core',
    icon: Building2,
    actions: [
      PERMISSION_ACTIONS.view,
      PERMISSION_ACTIONS.create,
      PERMISSION_ACTIONS.edit,
      PERMISSION_ACTIONS.delete,
      { key: 'manage_settings', name: 'Manage Settings', description: 'Configure college settings', icon: Settings, color: 'text-purple-600' },
    ],
  },
  {
    key: 'reports',
    name: 'Reports & Analytics',
    description: 'Access system reports and analytics',
    category: 'reports',
    icon: BarChart3,
    actions: [
      PERMISSION_ACTIONS.view,
      PERMISSION_ACTIONS.create,
      PERMISSION_ACTIONS.export,
      { key: 'academic_reports', name: 'Academic Reports', description: 'Access academic reports', icon: GraduationCap, color: 'text-blue-600' },
      { key: 'financial_reports', name: 'Financial Reports', description: 'Access financial reports', icon: DollarSign, color: 'text-green-600' },
      { key: 'custom_reports', name: 'Custom Reports', description: 'Create custom reports', icon: FileText, color: 'text-purple-600' },
    ],
  },
  {
    key: 'settings',
    name: 'System Settings',
    description: 'Manage system configuration and preferences',
    category: 'administration',
    icon: Settings,
    actions: [
      PERMISSION_ACTIONS.view,
      PERMISSION_ACTIONS.edit,
      { key: 'system_config', name: 'System Configuration', description: 'Configure system settings', icon: Settings, color: 'text-red-600' },
      { key: 'manage_roles', name: 'Manage Roles', description: 'Create and edit roles', icon: Shield, color: 'text-indigo-600' },
      { key: 'manage_notifications', name: 'Manage Notifications', description: 'Configure notifications', icon: Bell, color: 'text-yellow-600' },
    ],
  },
];

// ============================================================================
// COMPONENT
// ============================================================================

export const PermissionsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, DEBOUNCE_DELAYS.SEARCH);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Filter modules
  const filteredModules = useMemo(() => {
    return PERMISSION_MODULES.filter((module) => {
      const matchesSearch =
        module.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        module.description.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        module.actions.some(
          (action) =>
            action.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
            action.description.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
        );

      const matchesCategory = categoryFilter === 'all' || module.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [debouncedSearchQuery, categoryFilter]);

  // Category stats
  const categoryStats = useMemo(() => {
    return {
      core: PERMISSION_MODULES.filter((m) => m.category === 'core').length,
      academic: PERMISSION_MODULES.filter((m) => m.category === 'academic').length,
      financial: PERMISSION_MODULES.filter((m) => m.category === 'financial').length,
      administration: PERMISSION_MODULES.filter((m) => m.category === 'administration').length,
      reports: PERMISSION_MODULES.filter((m) => m.category === 'reports').length,
    };
  }, []);

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      core: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
      academic: 'bg-green-500/10 text-green-700 dark:text-green-400',
      financial: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
      administration: 'bg-purple-500/10 text-purple-700 dark:text-purple-400',
      reports: 'bg-pink-500/10 text-pink-700 dark:text-pink-400',
    };
    return colors[category] || 'bg-gray-500/10 text-gray-700 dark:text-gray-400';
  };

  return (
    <div className="min-h-screen p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">System Permissions</h1>
        </div>
        <p className="text-muted-foreground">
          Comprehensive reference of all available permissions in the KUMSS ERP system
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Modules</p>
                <p className="text-2xl font-bold mt-1">{PERMISSION_MODULES.length}</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg">
                <Shield className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Core</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                  {categoryStats.core}
                </p>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Academic</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                  {categoryStats.academic}
                </p>
              </div>
              <div className="p-3 bg-green-500/10 rounded-lg">
                <GraduationCap className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Financial</p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">
                  {categoryStats.financial}
                </p>
              </div>
              <div className="p-3 bg-yellow-500/10 rounded-lg">
                <DollarSign className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Admin</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                  {categoryStats.administration}
                </p>
              </div>
              <div className="p-3 bg-purple-500/10 rounded-lg">
                <Settings className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search modules or permissions..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="core">Core</SelectItem>
                <SelectItem value="academic">Academic</SelectItem>
                <SelectItem value="financial">Financial</SelectItem>
                <SelectItem value="administration">Administration</SelectItem>
                <SelectItem value="reports">Reports</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Permission Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredModules.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            <Shield className="h-16 w-16 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">No permissions found</p>
            <p className="text-sm">Try adjusting your search or filter</p>
          </div>
        ) : (
          filteredModules.map((module) => {
            const Icon = module.icon;
            return (
              <Card key={module.key} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{module.name}</CardTitle>
                        <Badge className={`mt-1 ${getCategoryColor(module.category)}`}>
                          {module.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <CardDescription className="mt-2">{module.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-muted-foreground">Available Permissions:</p>
                    <div className="grid grid-cols-1 gap-2">
                      {module.actions.map((action) => {
                        const ActionIcon = action.icon;
                        return (
                          <div
                            key={action.key}
                            className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                          >
                            <ActionIcon className={`h-5 w-5 mt-0.5 ${action.color}`} />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm">{action.name}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {action.description}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Footer Info */}
      <Card className="bg-muted/30">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="font-semibold">About Permissions</p>
              <p className="text-sm text-muted-foreground mt-1">
                Permissions are assigned through roles in the User Management section. Each role can have
                multiple permissions from different modules. Permissions control what actions users can
                perform and what data they can access in the system.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PermissionsPage;
