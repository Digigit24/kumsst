/**
 * Sale Item Form Component
 */

import { useState, useEffect } from 'react';
import { Label } from '../../../components/ui/label';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { Switch } from '../../../components/ui/switch';
import { SearchableSelect } from '../../../components/ui/searchable-select';
import { useQuery } from '@tanstack/react-query';
import { salesApi, storeItemsApi } from '../../../services/store.service';

interface SaleItemFormProps {
  saleItem?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const SaleItemForm = ({ saleItem, onSubmit, onCancel, isSubmitting = false }: SaleItemFormProps) => {
  const [formData, setFormData] = useState<any>({
    sale: 0,
    item: 0,
    quantity: 1,
    unit_price: '0',
    total_price: '0',
    is_active: true,
  });

  // Fetch sales for dropdown
  const { data: salesData } = useQuery({
    queryKey: ['sales-for-select'],
    queryFn: () => salesApi.list(),
  });

  // Fetch items for dropdown
  const { data: itemsData } = useQuery({
    queryKey: ['items-for-select'],
    queryFn: () => storeItemsApi.list(),
  });

  useEffect(() => {
    if (saleItem) {
      setFormData({
        sale: saleItem.sale || 0,
        item: saleItem.item || 0,
        quantity: saleItem.quantity || 1,
        unit_price: String(saleItem.unit_price || '0'),
        total_price: String(saleItem.total_price || '0'),
        is_active: saleItem.is_active ?? true,
      });
    }
  }, [saleItem]);

  // Auto-calculate total price when quantity or unit_price changes
  useEffect(() => {
    const quantity = parseInt(formData.quantity) || 0;
    const unitPrice = parseFloat(formData.unit_price) || 0;
    const totalPrice = (quantity * unitPrice).toFixed(2);

    if (formData.total_price !== totalPrice) {
      setFormData((prev: any) => ({
        ...prev,
        total_price: totalPrice,
      }));
    }
  }, [formData.quantity, formData.unit_price]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const salesOptions = salesData?.results?.map((sale: any) => ({
    value: sale.id,
    label: `${sale.sale_number || `Sale #${sale.id}`} - ${sale.sold_to || 'N/A'}`,
  })) || [];

  const itemsOptions = itemsData?.results?.map((item: any) => ({
    value: item.id,
    label: `${item.name || `Item #${item.id}`} ${item.item_code ? `(${item.item_code})` : ''}`,
  })) || [];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="sale">Sale *</Label>
        <SearchableSelect
          options={salesOptions}
          value={formData.sale}
          onChange={(value) => setFormData({ ...formData, sale: value })}
          placeholder="Select sale"
        />
      </div>

      <div>
        <Label htmlFor="item">Item *</Label>
        <SearchableSelect
          options={itemsOptions}
          value={formData.item}
          onChange={(value) => setFormData({ ...formData, item: value })}
          placeholder="Select item"
        />
      </div>

      <div>
        <Label htmlFor="quantity">Quantity *</Label>
        <Input
          id="quantity"
          type="number"
          min="1"
          value={formData.quantity}
          onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
          required
        />
      </div>

      <div>
        <Label htmlFor="unit_price">Unit Price *</Label>
        <Input
          id="unit_price"
          type="number"
          step="0.01"
          min="0"
          value={formData.unit_price}
          onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
          required
        />
      </div>

      <div>
        <Label htmlFor="total_price">Total Price (Auto-calculated)</Label>
        <Input
          id="total_price"
          type="number"
          step="0.01"
          value={formData.total_price}
          readOnly
          className="bg-muted"
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="is_active"
          checked={formData.is_active}
          onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
        />
        <Label htmlFor="is_active" className="cursor-pointer">
          Active
        </Label>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" loading={isSubmitting}>
          {saleItem ? 'Update' : 'Create'} Sale Item
        </Button>
      </div>
    </form>
  );
};

export default SaleItemForm;
