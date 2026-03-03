import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Users, FileText, CreditCard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const AdminManagementLinks: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Management</CardTitle>
        <CardDescription>HR and System settings</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-2">
        <Button variant="ghost" className="justify-start gap-2" onClick={() => navigate('/hr/staff')}>
          <Users className="h-4 w-4" />
          HR Management
        </Button>
        <Button variant="ghost" className="justify-start gap-2" onClick={() => navigate('/hr/payroll')}>
          <CreditCard className="h-4 w-4" />
          Payroll
        </Button>
        <Button variant="ghost" className="justify-start gap-2" onClick={() => navigate('/settings/general')}>
          <Settings className="h-4 w-4" />
          System Settings
        </Button>
        <Button variant="ghost" className="justify-start gap-2" onClick={() => navigate('/reports')}>
          <FileText className="h-4 w-4" />
          Reports
        </Button>
      </CardContent>
    </Card>
  );
};
