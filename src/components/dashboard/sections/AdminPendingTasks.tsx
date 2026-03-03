import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLeaveApplications } from '@/hooks/useHR';
import { useStudents } from '@/hooks/useStudents';
import { usePendingApprovals } from '@/hooks/useApprovals';
import { usePendingSuperAdminApprovals } from '@/hooks/useStoreIndents';

export const AdminPendingTasks: React.FC = () => {
  const navigate = useNavigate();

  // Fetch real data
  const { data: leaveData } = useLeaveApplications({ status: 'pending', page_size: 1 });
  const { data: studentsData } = useStudents({ is_active: false, page_size: 1 });
  const { data: approvalsData } = usePendingApprovals({ page_size: 1 });
  const { data: storeApprovalsData } = usePendingSuperAdminApprovals({ page_size: 1 });

  const pendingLeaves = leaveData?.count || 0;
  const pendingAdmissions = studentsData?.count || 0;

  // Combine pending system approvals and pending store approvals
  const generalApprovals = approvalsData?.count || 0;
  const storeApprovals = storeApprovalsData?.count || 0;
  const totalPendingApprovals = generalApprovals + storeApprovals;

  const pendingTasks = [
    {
      id: 3,
      title: 'Pending CEO Approvals',
      count: totalPendingApprovals,
      priority: 'high' as const,
      route: storeApprovals > 0 ? '/store/super-admin-approvals' : '/approvals/pending' // Direct to store approvals if that's where the volume is, or keep generic.
      // Better yet: separate them if distinct routes? 
      // User asked to "Display all pending CEO approvals". 
      // If I direct to one, I miss the other. 
      // But /approvals/pending is the generic place. 
      // If store approvals are NOT in /approvals/pending, then they are separate.
      // Let's list them as separate tasks if both exist, or sum them if user considers them "CEO Approvals".
      // Given the specific complaint, "it is not showing the data from... store/super-admin...", I should likely add a specific item for it.
    },
    {
      id: 1,
      title: 'Review admission applications',
      count: pendingAdmissions,
      priority: 'high' as const,
      route: '/students/list?status=inactive'
    },
    {
      id: 2,
      title: 'Approve leave requests',
      count: pendingLeaves,
      priority: 'medium' as const,
      route: '/hr/leave-approvals'
    },
  ];

  // Refined Logic:
  // 1. Store Indents (Super Admin) -> /store/super-admin-approvals
  // 2. Generic Approvals -> /approvals/pending

  const tasksToList = [];

  if (storeApprovals > 0) {
    tasksToList.push({
      id: 'store-approvals',
      title: 'Pending Store Indents (CEO)',
      count: storeApprovals,
      priority: 'high' as const,
      route: '/store/super-admin-approvals'
    });
  }

  if (generalApprovals > 0) {
    tasksToList.push({
      id: 'general-approvals',
      title: 'Other Pending Approvals',
      count: generalApprovals,
      priority: 'high' as const,
      route: '/approvals/pending'
    });
  }

  // If both are zero, maybe show "Pending CEO Approvals" as 0? No, existing logic hides 0 counts.

  if (pendingAdmissions > 0) {
    tasksToList.push({
      id: 'admissions',
      title: 'Review admission applications',
      count: pendingAdmissions,
      priority: 'high' as const,
      route: '/students/list?status=inactive'
    });
  }

  if (pendingLeaves > 0) {
    tasksToList.push({
      id: 'leaves',
      title: 'Approve leave requests',
      count: pendingLeaves,
      priority: 'medium' as const,
      route: '/hr/leave-approvals'
    });
  }

  // Filter is redundant if we push selectively, but safe to keep checking count > 0 if logic changes
  const finalTasks = tasksToList.filter(t => t.count > 0);

  if (finalTasks.length === 0) {
    return (
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Pending Tasks
          </CardTitle>
          <CardDescription>Items requiring your attention</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <CheckCircle2 className="h-12 w-12 mb-2 text-green-500" />
            <p className="font-medium">All caught up!</p>
            <p className="text-sm">No pending tasks found.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Pending Tasks
        </CardTitle>
        <CardDescription>Items requiring your attention</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {finalTasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer"
              onClick={() => navigate(task.route)}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{task.title}</p>
                  <Badge
                    variant={
                      task.priority === 'high' ? 'destructive' :
                        task.priority === 'medium' ? 'warning' : 'default'
                    }
                  >
                    {task.priority || 'default'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{task.count} pending items</p>
              </div>
              <div className="text-2xl font-bold text-primary">{task.count}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
