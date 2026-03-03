import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { Package } from 'lucide-react';
import { toast } from 'sonner';
import { useCreateRequirement } from '../../../hooks/useProcurement';
import { RequirementForm } from './forms/RequirementForm';
import { ProcurementRequirementCreateInput } from '../../../types/store.types';

interface CreateRequirementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const CreateRequirementDialog = ({
  open,
  onOpenChange,
  onSuccess,
}: CreateRequirementDialogProps) => {
  const createMutation = useCreateRequirement();

  const handleSubmit = async (data: ProcurementRequirementCreateInput) => {
    try {
      await createMutation.mutateAsync(data);
      toast.success('Requirement created successfully!');
      onSuccess?.();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Create requirement error:', error);
      toast.error(typeof error.message === 'string' ? error.message : 'Failed to create requirement');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Create Procurement Requirement
          </DialogTitle>
        </DialogHeader>
        <RequirementForm
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
};
