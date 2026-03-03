/**
 * Fee Receipt Form Component
 * Create/Edit form for fee receipts
 */

import { useEffect, useMemo, useState } from 'react';
import { DROPDOWN_PAGE_SIZE } from '@/config/app.config';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { SearchableSelect, SearchableSelectOption } from '../../../components/ui/searchable-select';
import { useFeeCollectionsSWR } from '../../../hooks/swr';
import { FeeReceipt, FeeReceiptCreateInput } from '../../../types/fees.types';

interface FeeReceiptFormProps {
  feeReceipt: FeeReceipt | null;
  onSubmit: (data: Partial<FeeReceiptCreateInput>) => void;
  onCancel: () => void;
}

export const FeeReceiptForm = ({ feeReceipt, onSubmit, onCancel }: FeeReceiptFormProps) => {
  const [formData, setFormData] = useState<Partial<FeeReceiptCreateInput>>({
    receipt_number: '',
    receipt_file: '',
    collection: 0,
    is_active: true,
  });

  // Fetch fee collections for dropdown
  const { data: collectionsData, isLoading: isLoadingCollections } = useFeeCollectionsSWR({ page_size: DROPDOWN_PAGE_SIZE });

  // Create options for collections dropdown
  const collectionOptions: SearchableSelectOption[] = useMemo(() => {
    if (!collectionsData?.results) return [];
    return collectionsData.results.map((collection) => ({
      value: collection.id,
      label: `Receipt #${collection.receipt_number || collection.id}`,
      subtitle: `${collection.student_name || ''} • ₹${collection.net_amount || collection.amount_paid}`,
    }));
  }, [collectionsData]);

  useEffect(() => {
    if (feeReceipt) {
      setFormData({
        receipt_number: feeReceipt.receipt_number,
        receipt_file: feeReceipt.receipt_file,
        collection: feeReceipt.collection,
        is_active: feeReceipt.is_active,
      });
    }
  }, [feeReceipt]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const collegeId = localStorage.getItem('kumss_college_id');
    const userId = localStorage.getItem('kumss_user_id') || undefined;
    const submitData: any = { ...formData };

    // Auto-populate college ID
    if (collegeId) {
      submitData.college = parseInt(collegeId);
    }

    if (!feeReceipt && userId) {
      submitData.created_by = userId;
      submitData.updated_by = userId;
    } else if (feeReceipt && userId) {
      submitData.updated_by = userId;
    }

    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="receipt_number">Receipt Number *</Label>
        <Input
          id="receipt_number"
          value={formData.receipt_number}
          onChange={(e) => setFormData({ ...formData, receipt_number: e.target.value })}
          placeholder="Enter receipt number"
          required
        />
      </div>

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
        <Label htmlFor="receipt_file">Receipt File URL *</Label>
        <Input
          id="receipt_file"
          value={formData.receipt_file}
          onChange={(e) => setFormData({ ...formData, receipt_file: e.target.value })}
          placeholder="Enter receipt file URL or path"
          required
        />
        <p className="text-xs text-muted-foreground">
          Enter the URL or path to the receipt file (PDF, image, etc.)
        </p>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1">
          {feeReceipt ? 'Update' : 'Create'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
      </div>
    </form>
  );
};
