/**
 * Fee Group Form Component
 * Create/Edit form for fee groups
 */

import { useState, useEffect } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { FeeGroup, FeeGroupCreateInput } from '../../../types/fees.types';

interface FeeGroupFormProps {
  feeGroup: FeeGroup | null;
  onSubmit: (data: Partial<FeeGroupCreateInput>) => void;
  onCancel: () => void;
}

export const FeeGroupForm = ({ feeGroup, onSubmit, onCancel }: FeeGroupFormProps) => {
  const [formData, setFormData] = useState<Partial<FeeGroupCreateInput>>({
    name: '',
    code: '',
    description: '',
    college: 0,
    is_active: true,
  });

  useEffect(() => {
    if (feeGroup) {
      setFormData({
        name: feeGroup.name,
        code: feeGroup.code,
        description: feeGroup.description || '',
        college: feeGroup.college,
        is_active: feeGroup.is_active,
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
  }, [feeGroup]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const userId = localStorage.getItem('kumss_user_id') || undefined;
    const submitData: any = { ...formData };

    if (!feeGroup && userId) {
      submitData.created_by = userId;
      submitData.updated_by = userId;
    } else if (feeGroup && userId) {
      submitData.updated_by = userId;
    }

    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Enter fee group name"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="code">Code *</Label>
        <Input
          id="code"
          value={formData.code}
          onChange={(e) => setFormData({ ...formData, code: e.target.value })}
          placeholder="Enter fee group code"
          required
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

      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1">
          {feeGroup ? 'Update' : 'Create'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
      </div>
    </form>
  );
};
