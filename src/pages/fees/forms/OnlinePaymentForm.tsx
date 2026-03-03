/**
 * Online Payment Form Component
 * Create/Edit form for online payments
 */

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { DROPDOWN_PAGE_SIZE } from '@/config/app.config';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { SearchableSelect, SearchableSelectOption } from '../../../components/ui/searchable-select';
import { Switch } from '../../../components/ui/switch';
import { Textarea } from '../../../components/ui/textarea';
import { useFeeCollectionsSWR } from '../../../hooks/swr';

interface OnlinePaymentFormProps {
  onlinePayment: any | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export const OnlinePaymentForm = ({ onlinePayment, onSubmit, onCancel }: OnlinePaymentFormProps) => {
  const [formData, setFormData] = useState<any>({
    collection: 0,
    gateway: '',
    transaction_id: '',
    order_id: '',
    payment_mode: '',
    status: 'pending',
    response_data: '',
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
    if (onlinePayment) {
      setFormData(onlinePayment);
    }
  }, [onlinePayment]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.collection || formData.collection === 0) {
      toast.warning('Please select a fee collection');
      return;
    }
    if (!formData.gateway || formData.gateway.trim() === '') {
      toast.warning('Please enter payment gateway');
      return;
    }

    const userId = localStorage.getItem('kumss_user_id') || undefined;

    const submitData: any = {
      collection: formData.collection,
      gateway: formData.gateway,
      transaction_id: formData.transaction_id,
      order_id: formData.order_id,
      payment_mode: formData.payment_mode,
      status: formData.status,
      response_data: formData.response_data,
      is_active: formData.is_active,
    };

    // Auto-populate user IDs
    if (!onlinePayment && userId) {
      submitData.created_by = userId;
      submitData.updated_by = userId;
    } else if (onlinePayment && userId) {
      submitData.updated_by = userId;
    }

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
        <Label htmlFor="gateway">Payment Gateway *</Label>
        <Input
          id="gateway"
          value={formData.gateway}
          onChange={(e) => setFormData({ ...formData, gateway: e.target.value })}
          placeholder="e.g., Razorpay, PayU, Paytm"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="transaction_id">Transaction ID</Label>
          <Input
            id="transaction_id"
            value={formData.transaction_id}
            onChange={(e) => setFormData({ ...formData, transaction_id: e.target.value })}
            placeholder="e.g., TXN123456789"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="order_id">Order ID</Label>
          <Input
            id="order_id"
            value={formData.order_id}
            onChange={(e) => setFormData({ ...formData, order_id: e.target.value })}
            placeholder="e.g., ORD123456"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="payment_mode">Payment Mode</Label>
        <Input
          id="payment_mode"
          value={formData.payment_mode}
          onChange={(e) => setFormData({ ...formData, payment_mode: e.target.value })}
          placeholder="e.g., Credit Card, Debit Card, UPI, Net Banking"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status *</Label>
        <select
          id="status"
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="pending">Pending</option>
          <option value="success">Success</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="response_data">Response Data</Label>
        <Textarea
          id="response_data"
          value={formData.response_data || ''}
          onChange={(e) => setFormData({ ...formData, response_data: e.target.value })}
          placeholder="Gateway response data (JSON or text)"
          rows={4}
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
          {onlinePayment ? 'Update' : 'Create'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
      </div>
    </form>
  );
};
