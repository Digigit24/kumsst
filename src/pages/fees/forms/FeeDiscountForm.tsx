/**
 * Fee Discount Form Component
 * Create/Edit form for fee discounts
 */

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Label } from '../../../components/ui/label';
import { Switch } from '../../../components/ui/switch';

interface FeeDiscountFormProps {
  feeDiscount: any | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export const FeeDiscountForm = ({ feeDiscount, onSubmit, onCancel }: FeeDiscountFormProps) => {
  const [formData, setFormData] = useState<any>({
    name: '',
    code: '',
    discount_type: 'percentage',
    discount_value: '0',
    description: '',
    max_discount_amount: null,
    eligibility_criteria: '',
    is_active: true,
    college: parseInt(localStorage.getItem('kumss_college_id') || '1'),
  });

  useEffect(() => {
    if (feeDiscount) {
      // Map backend fields to frontend form state
      const mappedData = {
        ...feeDiscount,
        discount_value: feeDiscount.discount_type === 'percentage'
          ? feeDiscount.percentage
          : feeDiscount.amount,
        eligibility_criteria: feeDiscount.criteria || '',
        college: feeDiscount.college || parseInt(localStorage.getItem('kumss_college_id') || '1'),
      };
      setFormData(mappedData);
    }
  }, [feeDiscount]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.name || formData.name.trim() === '') {
      toast.warning('Please enter a discount name');
      return;
    }
    if (!formData.code || formData.code.trim() === '') {
      toast.warning('Please enter a discount code');
      return;
    }

    const userId = localStorage.getItem('kumss_user_id') || undefined;

    // Map frontend fields to backend schema
    // Parse numeric fields
    const discountVal = parseFloat(formData.discount_value || '0');
    let maxDiscountAmount = null;
    if (formData.max_discount_amount !== null && formData.max_discount_amount !== '') {
      maxDiscountAmount = parseFloat(formData.max_discount_amount);
    }

    // Map frontend fields to backend schema
    const submitData: any = {
      name: formData.name,
      code: formData.code,
      discount_type: formData.discount_type,
      is_active: formData.is_active,
      criteria: formData.eligibility_criteria || '',
      college: formData.college,
      description: formData.description || '',
      max_discount_amount: maxDiscountAmount,
      discount_value: discountVal,
    };

    // Handle amount/percentage mapping
    // We send 'amount' as the value in all cases to satisfy potential backend requirements
    // We also send 'percentage' correctly contextually
    if (formData.discount_type === 'percentage') {
      submitData.percentage = discountVal;
      // User requested to send Max Discount Amount in 'amount' field for percentage discounts
      submitData.amount = maxDiscountAmount || 0;
    } else {
      submitData.amount = discountVal;
      submitData.percentage = 0;
    }

    // Auto-populate user IDs
    if (!feeDiscount && userId) {
      submitData.created_by = userId;
      submitData.updated_by = userId;
    } else if (feeDiscount && userId) {
      submitData.updated_by = userId;
    }

    console.log('Submitting fee discount:', submitData);
    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Discount Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Merit Scholarship"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="code">Code *</Label>
        <Input
          id="code"
          value={formData.code}
          onChange={(e) => setFormData({ ...formData, code: e.target.value })}
          placeholder="e.g., MERIT-25"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="discount_type">Discount Type *</Label>
        <select
          id="discount_type"
          className="w-full p-2 border rounded"
          value={formData.discount_type}
          onChange={(e) => setFormData({ ...formData, discount_type: e.target.value as 'percentage' | 'fixed' })}
          required
        >
          <option value="percentage">Percentage</option>
          <option value="fixed">Fixed Amount</option>
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="discount_value">
          {formData.discount_type === 'percentage' ? 'Discount Percentage *' : 'Discount Amount *'}
        </Label>
        <Input
          id="discount_value"
          type="number"
          value={formData.discount_value}
          onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
          placeholder={formData.discount_type === 'percentage' ? 'e.g., 25' : 'e.g., 5000'}
          min="0"
          max={formData.discount_type === 'percentage' ? '100' : undefined}
          step={formData.discount_type === 'percentage' ? '0.01' : '0.01'}
          required
        />
      </div>

      {formData.discount_type === 'percentage' && (
        <div className="space-y-2">
          <Label htmlFor="max_discount_amount">Max Discount Amount</Label>
          <Input
            id="max_discount_amount"
            type="number"
            value={formData.max_discount_amount || ''}
            onChange={(e) => setFormData({ ...formData, max_discount_amount: e.target.value ? parseFloat(e.target.value) : null })}
            placeholder="e.g., 20000"
            min="0"
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="eligibility_criteria">Eligibility Criteria</Label>
        <Textarea
          id="eligibility_criteria"
          value={formData.eligibility_criteria || ''}
          onChange={(e) => setFormData({ ...formData, eligibility_criteria: e.target.value })}
          placeholder="e.g., CGPA >= 8.5"
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description || ''}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Description of the discount"
          rows={3}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="is_active">Active</Label>
        <Switch
          id="is_active"
          checked={formData.is_active}
          onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1">
          {feeDiscount ? 'Update' : 'Create'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
      </div>
    </form>
  );
};
