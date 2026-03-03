import { useEffect, useMemo, useState } from 'react';
import { DROPDOWN_PAGE_SIZE } from '@/config/app.config';
import { InlineCreateFeeStructure } from '../../../components/common/InlineCreateFeeStructure';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { SearchableSelectWithCreate } from '../../../components/ui/searchable-select-with-create';
import { useFeeStructuresSWR, invalidateFeeStructures } from '../../../hooks/swr';
import { FeeInstallment, FeeInstallmentCreateInput } from '../../../types/fees.types';

interface FeeInstallmentFormProps {
  feeInstallment: FeeInstallment | null;
  onSubmit: (data: Partial<FeeInstallmentCreateInput>) => void;
  onCancel: () => void;
}

export const FeeInstallmentForm = ({ feeInstallment, onSubmit, onCancel }: FeeInstallmentFormProps) => {
  const [showStructureModal, setShowStructureModal] = useState(false);
  const [formData, setFormData] = useState<Partial<FeeInstallmentCreateInput>>({
    fee_structure: 0,
    installment_number: 1,
    installment_name: '',
    amount: '0',
    due_date: new Date().toISOString().split('T')[0],
    college: 0,
    is_active: true,
  });

  // Fetch dropdown data
  const { data: feeStructuresData, isLoading: isLoadingStructures } = useFeeStructuresSWR({ page_size: DROPDOWN_PAGE_SIZE });

  // Create options for dropdowns
  const feeStructureOptions = useMemo(() => {
    if (!feeStructuresData?.results) return [];
    return feeStructuresData.results.map((structure) => ({
      value: structure.id,
      label: `${structure.student_name || 'Student'} - ${structure.fee_master_name || 'Fee'}`,
      subtitle: `₹${structure.amount} • Due: ${structure.due_date} • Balance: ₹${structure.balance}`,
    }));
  }, [feeStructuresData]);

  useEffect(() => {
    if (feeInstallment) {
      setFormData({
        fee_structure: feeInstallment.fee_structure,
        installment_number: feeInstallment.installment_number,
        installment_name: feeInstallment.installment_name,
        amount: feeInstallment.amount,
        due_date: feeInstallment.due_date,
        college: feeInstallment.college,
        is_active: feeInstallment.is_active,
      });
    } else {
      // Auto-populate college from user data
      const storedUser = localStorage.getItem('kumss_user');
      let collegeId = 1;

      if (storedUser) {
        const user = JSON.parse(storedUser);
        if (user?.college) {
          collegeId = user.college;
        } else if (user?.user_roles && user.user_roles.length > 0) {
          const primaryRole = user.user_roles.find((r: any) => r.is_primary) || user.user_roles[0];
          collegeId = primaryRole.college_id || 1;
        }
      }

      setFormData(prev => ({ ...prev, college: collegeId }));
    }
  }, [feeInstallment]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const collegeId = localStorage.getItem('kumss_college_id');
    const userId = localStorage.getItem('kumss_user_id') || undefined;
    const submitData: any = { ...formData };

    // Auto-populate college ID if not already set
    if (collegeId && !submitData.college) {
      submitData.college = parseInt(collegeId);
    }

    // Populate student ID from selected fee structure
    if (submitData.fee_structure && feeStructuresData?.results) {
      const selectedStructure = feeStructuresData.results.find(s => s.id === submitData.fee_structure);
      if (selectedStructure) {
        submitData.student = selectedStructure.student;
      }
    }

    if (!feeInstallment && userId) {
      submitData.created_by = userId;
      submitData.updated_by = userId;
    } else if (feeInstallment && userId) {
      submitData.updated_by = userId;
    }

    onSubmit(submitData);
  };

  const handleStructureCreated = async (structureId: number) => {
    await invalidateFeeStructures();
    setFormData(prev => ({ ...prev, fee_structure: structureId }));
    setShowStructureModal(false);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fee_structure">Fee Structure *</Label>
          <SearchableSelectWithCreate
            options={feeStructureOptions}
            value={formData.fee_structure || ''}
            onChange={(value) => setFormData({ ...formData, fee_structure: Number(value) })}
            placeholder="Select fee structure"
            isLoading={isLoadingStructures}
            searchPlaceholder="Search fee structures..."
            emptyText="No fee structures available"
            disabled={!!feeInstallment}
            onCreateNew={() => setShowStructureModal(true)}
            createButtonText="Create New Fee Structure"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="installment_number">Installment Number *</Label>
          <Input
            id="installment_number"
            type="number"
            value={formData.installment_number}
            onChange={(e) => setFormData({ ...formData, installment_number: parseInt(e.target.value) || 1 })}
            placeholder="Enter installment number"
            required
            min="1"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="installment_name">Installment Name *</Label>
          <Input
            id="installment_name"
            value={formData.installment_name}
            onChange={(e) => setFormData({ ...formData, installment_name: e.target.value })}
            placeholder="Enter installment name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">Amount (₹) *</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            placeholder="0.00"
            required
            min="0"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="due_date">Due Date *</Label>
          <Input
            id="due_date"
            type="date"
            value={formData.due_date}
            onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
            required
          />
        </div>

        <div className="flex gap-2 pt-4">
          <Button type="submit" className="flex-1">
            {feeInstallment ? 'Update' : 'Create'}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
        </div>
      </form>

      <InlineCreateFeeStructure
        open={showStructureModal}
        onOpenChange={setShowStructureModal}
        onSuccess={handleStructureCreated}
        collegeId={formData.college}
      />
    </>
  );
};
