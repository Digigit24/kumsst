/**
 * Fee Type Form Component
 * Create/Edit form for fee types
 */

import { useEffect, useMemo, useState } from 'react';
import { DROPDOWN_PAGE_SIZE } from '@/config/app.config';
import { InlineCreateFeeGroup } from '../../../components/common/InlineCreateFeeGroup';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { SearchableSelectWithCreate } from '../../../components/ui/searchable-select-with-create';
import { Textarea } from '../../../components/ui/textarea';
import { useFeeGroupsSWR, invalidateFeeGroups } from '../../../hooks/swr';
import { FeeType, FeeTypeCreateInput } from '../../../types/fees.types';

interface FeeTypeFormProps {
  feeType: FeeType | null;
  onSubmit: (data: Partial<FeeTypeCreateInput>) => void;
  onCancel: () => void;
}

export const FeeTypeForm = ({ feeType, onSubmit, onCancel }: FeeTypeFormProps) => {
  const [showFeeGroupModal, setShowFeeGroupModal] = useState(false);
  const [formData, setFormData] = useState<Partial<FeeTypeCreateInput>>({
    name: '',
    code: '',
    description: '',
    college: 0,
    fee_group: 0,
    is_active: true,
  });

  // Fetch fee groups for dropdown
  const { data: feeGroupsData, isLoading: isLoadingFeeGroups } = useFeeGroupsSWR({ page_size: DROPDOWN_PAGE_SIZE });

  // Create options for fee groups dropdown
  const feeGroupOptions = useMemo(() => {
    if (!feeGroupsData?.results) return [];
    return feeGroupsData.results.map((group) => ({
      value: group.id,
      label: group.name,
      subtitle: group.description || '',
    }));
  }, [feeGroupsData]);

  useEffect(() => {
    if (feeType) {
      setFormData({
        name: feeType.name,
        code: feeType.code,
        description: feeType.description || '',
        college: feeType.college,
        fee_group: feeType.fee_group,
        is_active: feeType.is_active,
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
  }, [feeType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const userId = localStorage.getItem('kumss_user_id') || undefined;
    const submitData: any = { ...formData };

    if (!feeType && userId) {
      submitData.created_by = userId;
      submitData.updated_by = userId;
    } else if (feeType && userId) {
      submitData.updated_by = userId;
    }

    onSubmit(submitData);
  };

  const handleFeeGroupCreated = async (feeGroupId: number) => {
    await invalidateFeeGroups();
    setFormData(prev => ({ ...prev, fee_group: feeGroupId }));
    setShowFeeGroupModal(false);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Basic Details */}
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="flex flex-col space-y-1.5 p-6 border-b bg-muted/20">
            <h3 className="font-semibold leading-none tracking-tight">Basic Details</h3>
            <p className="text-sm text-muted-foreground">Define the fee type identifier.</p>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name <span className="text-destructive">*</span></Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter fee type name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="code">Code <span className="text-destructive">*</span></Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="Enter fee type code"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Classification & Description */}
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="flex flex-col space-y-1.5 p-6 border-b bg-muted/20">
            <h3 className="font-semibold leading-none tracking-tight">Classification</h3>
            <p className="text-sm text-muted-foreground">Assign a group and description.</p>
          </div>
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fee_group">Fee Group <span className="text-destructive">*</span></Label>
              <SearchableSelectWithCreate
                options={feeGroupOptions}
                value={formData.fee_group || ''}
                onChange={(value) => setFormData({ ...formData, fee_group: Number(value) })}
                placeholder="Select fee group"
                searchPlaceholder="Search fee groups..."
                emptyText="No fee groups available"
                isLoading={isLoadingFeeGroups}
                onCreateNew={() => setShowFeeGroupModal(true)}
                createButtonText="Create New Fee Group"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description ?? ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter description (optional)"
                rows={3}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-4 border-t mt-2">
          <Button type="submit" className="flex-1">
            {feeType ? 'Update' : 'Create'}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
        </div>
      </form>

      <InlineCreateFeeGroup
        open={showFeeGroupModal}
        onOpenChange={setShowFeeGroupModal}
        onSuccess={handleFeeGroupCreated}
        collegeId={formData.college}
      />
    </>
  );
};
