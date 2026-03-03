import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AssignmentForm } from './components/AssignmentForm';
import { useCreateAssignment } from '@/hooks/useAssignments';
import { toast } from 'sonner';
import type { AssignmentCreateInput } from '@/types/assignments.types';

export const CreateAssignmentPage: React.FC = () => {
  const navigate = useNavigate();
  const createMutation = useCreateAssignment();

  const handleSubmit = async (data: AssignmentCreateInput | FormData) => {
    try {
      await createMutation.mutateAsync(data);
      toast.success('Assignment created successfully!');
      navigate('/assignments/list');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to create assignment');
    }
  };

  const handleCancel = () => {
    navigate('/assignments/list');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Create Assignment</h1>
        <p className="text-muted-foreground mt-2">
          Create a new assignment for your students
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assignment Details</CardTitle>
        </CardHeader>
        <CardContent>
          <AssignmentForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={createMutation.isPending}
          />
        </CardContent>
      </Card>
    </div>
  );
};
