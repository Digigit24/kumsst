import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  GraduationCap,
  IndianRupee,
  ClipboardList,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useUsers } from '@/hooks/useAccounts';
import { useFinanceDashboardStats } from '@/hooks/useFinance';
import { useStudents } from '@/hooks/useStudents';

export const AdminKeyMetrics: React.FC = () => {
  const navigate = useNavigate();

  // Fetch real data
  const { data: studentsData, isLoading: isLoadingStudents } = useStudents({ page_size: 1, is_active: true });
  const { data: staffData, isLoading: isLoadingStaff } = useUsers({ user_type: 'teacher', page_size: 1, is_active: true });
  const { data: financeData, isLoading: isLoadingFinance } = useFinanceDashboardStats();

  const totalStudents = studentsData?.count || 0;
  const totalTeachers = staffData?.count || 0;
  const totalRevenue = financeData?.current_year?.income || 0;

  // Note: Average attendance API is not available globally yet.
  const averageAttendance = 0;

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`;
    return `₹${amount.toLocaleString()}`;
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/students/list')}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Students</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoadingStudents ? '...' : totalStudents.toLocaleString()}
          </div>
          <div className="flex items-center gap-1 mt-1">
            <p className="text-xs text-muted-foreground">Active students</p>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/teachers')}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Teaching Staff</CardTitle>
          <GraduationCap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoadingStaff ? '...' : totalTeachers.toLocaleString()}
          </div>
          <div className="flex items-center gap-1 mt-1">
            <p className="text-xs text-muted-foreground">Active teachers</p>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/income-dashboard')}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Revenue (This Year)</CardTitle>
          <IndianRupee className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoadingFinance ? '...' : formatCurrency(totalRevenue)}
          </div>
          <div className="flex items-center gap-1 mt-1">
            <p className="text-xs text-muted-foreground">Total collections</p>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/attendance/students')}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg. Attendance</CardTitle>
          <ClipboardList className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            N/A
          </div>
          <Badge variant="outline" className="mt-1">
            Data Pending
          </Badge>
        </CardContent>
      </Card>
    </div>
  );
};
