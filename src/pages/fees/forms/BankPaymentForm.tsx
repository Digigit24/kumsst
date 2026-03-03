/**
 * Bank Payment Form Component
 * Create/Edit form for bank payments
 */

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { DROPDOWN_PAGE_SIZE } from '@/config/app.config';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { SearchableSelect, SearchableSelectOption } from '../../../components/ui/searchable-select';
import { Switch } from '../../../components/ui/switch';
import { useFeeCollectionsSWR } from '../../../hooks/swr';

interface BankPaymentFormProps {
  bankPayment: any | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export const BankPaymentForm = ({ bankPayment, onSubmit, onCancel }: BankPaymentFormProps) => {
  const [formData, setFormData] = useState<any>({
    collection: 0,
    bank_name: '',
    branch: '',
    cheque_dd_number: '',
    cheque_dd_date: new Date().toISOString().split('T')[0],
    transaction_id: '',
    is_active: true,
  });

  // Fetch fee collections for dropdown
  const { data: collectionsData, isLoading: isLoadingCollections } = useFeeCollectionsSWR({ page_size: DROPDOWN_PAGE_SIZE });

  // Create options for collections dropdown
  const collectionOptions: SearchableSelectOption[] = useMemo(() => {
    if (!collectionsData?.results) return [];
    return collectionsData.results.map((collection) => ({
      value: collection.id,
      label: `${collection.student_name || 'Student'} - ₹${collection.amount}`,
      subtitle: `Receipt: ${collection.receipt_number || 'N/A'}`,
    }));
  }, [collectionsData]);

  useEffect(() => {
    if (bankPayment) {
      setFormData({
        ...bankPayment,
        cheque_dd_date: bankPayment.cheque_dd_date || new Date().toISOString().split('T')[0],
      });
    }
  }, [bankPayment]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.collection || formData.collection === 0) {
      toast.warning('Please select a fee collection');
      return;
    }
    if (!formData.bank_name || formData.bank_name.trim() === '') {
      toast.warning('Please enter bank name');
      return;
    }

    const userId = localStorage.getItem('kumss_user_id') || undefined;

    const submitData: any = {
      collection: formData.collection,
      bank_name: formData.bank_name,
      branch: formData.branch,
      cheque_dd_number: formData.cheque_dd_number,
      cheque_dd_date: formData.cheque_dd_date,
      transaction_id: formData.transaction_id,
      is_active: formData.is_active,
    };

    // Auto-populate user IDs
    if (!bankPayment && userId) {
      submitData.created_by = userId;
      submitData.updated_by = userId;
    } else if (bankPayment && userId) {
      submitData.updated_by = userId;
    }

    console.log('Submitting bank payment:', submitData);
    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="collection">Fee Collection *</Label>
        <SearchableSelect
          options={collectionOptions}
          value={formData.collection}
          onChange={(value) => setFormData({ ...formData, collection: Number(value) })}
          placeholder="Select fee collection"
          searchPlaceholder="Search collections..."
          isLoading={isLoadingCollections}
          emptyText="No collections available"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="bank_name">Bank Name *</Label>
        <Input
          id="bank_name"
          value={formData.bank_name}
          onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
          placeholder="e.g., State Bank of India"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="branch">Branch</Label>
        <Input
          id="branch"
          value={formData.branch}
          onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
          placeholder="e.g., Main Branch"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="cheque_dd_number">Cheque/DD Number</Label>
          <Input
            id="cheque_dd_number"
            value={formData.cheque_dd_number}
            onChange={(e) => setFormData({ ...formData, cheque_dd_number: e.target.value })}
            placeholder="e.g., 123456"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cheque_dd_date">Cheque/DD Date</Label>
          <Input
            id="cheque_dd_date"
            type="date"
            value={formData.cheque_dd_date}
            onChange={(e) => setFormData({ ...formData, cheque_dd_date: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="transaction_id">Transaction ID</Label>
        <Input
          id="transaction_id"
          value={formData.transaction_id}
          onChange={(e) => setFormData({ ...formData, transaction_id: e.target.value })}
          placeholder="e.g., TXN123456789"
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
          {bankPayment ? 'Update' : 'Create'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
      </div>
    </form>
  );
};
