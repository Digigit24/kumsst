/**
 * Store Indent Form - Create/Edit store indents
 */

import { useAuth } from '@/hooks/useAuth';
import { getCurrentUserCollege } from '@/utils/auth.utils';
import { AlertCircle, Plus, Trash2 } from 'lucide-react';
import { useEffect } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { CentralStoreDropdown } from '../../../components/common/CentralStoreDropdown';
import { CentralStoreItemDropdown } from '../../../components/common/CentralStoreItemDropdown';
import { UserSearchableDropdown } from '../../../components/common/UserSearchableDropdown';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Switch } from '../../../components/ui/switch';
import { Textarea } from '../../../components/ui/textarea';
import { DROPDOWN_PAGE_SIZE } from '../../../config/app.config';
import { useCentralInventory } from '../../../hooks/useCentralInventory';

interface StoreIndentFormProps {
  indent?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export const StoreIndentForm = ({ indent, onSubmit, onCancel }: StoreIndentFormProps) => {
  const { user } = useAuth();

  const { register, handleSubmit, formState: { errors }, control, watch, setValue } = useForm({
    defaultValues: indent || {
      indent_number: '',
      required_by_date: '',
      priority: 'low',
      justification: '',
      status: 'draft',
      approved_date: '',
      rejection_reason: '',
      attachments: '',
      remarks: '',
      college: getCurrentUserCollege(user) || '',
      requesting_store_manager: '',
      central_store: '',
      approval_request: '',
      approved_by: '',
      is_active: true,
      items: [
        {
          item: '',
          requested_quantity: '',
          approved_quantity: '',
          issued_quantity: '',
          pending_quantity: '',
          unit: '',
          justification: '',
          remarks: '',
          central_store_item: '',
          is_active: true,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const centralStoreId = watch('central_store');
  const watchedItems = watch('items');

  // pull central inventory to map item id
  const { data: inventoryData } = useCentralInventory(
    centralStoreId ? { central_store: centralStoreId, page_size: DROPDOWN_PAGE_SIZE, is_active: true } : { page_size: 50 }
  );

  // Clear item selections when central store changes
  useEffect(() => {
    if (centralStoreId && !indent) {
      // Only clear items for new forms, not when editing
      fields.forEach((_, index) => {
        setValue(`items.${index}.central_store_item`, '');
        setValue(`items.${index}.item`, '');
      });
    }
  }, [centralStoreId, indent]);

  // Sync item id from selected central store item
  useEffect(() => {
    const inventory = inventoryData?.results || [];
    if (!inventory.length || !watchedItems?.length) return;

    watchedItems.forEach((itm: any, idx: number) => {
      const inv = inventory.find((i: any) => i.id === Number(itm.central_store_item));
      if (inv && itm?.item !== inv.item) {
        setValue(`items.${idx}.item`, inv.item);
      }
    });
  }, [inventoryData, watchedItems, setValue]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      {/* Warning when no central store selected */}
      {!centralStoreId && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Important:</strong> Please select a Central Store first before adding items.
            <br />
            <span className="text-xs mt-1 block">
              If no items appear, ensure Central Store Inventory has been set up by the CEO.
            </span>
          </AlertDescription>
        </Alert>
      )}
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="indent_number">Indent Number</Label>
              <Input
                id="indent_number"
                placeholder="Auto-generated if left blank"
                {...register('indent_number')}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Leave blank to auto-generate sequentially.
              </p>
              {errors.indent_number && <p className="text-sm text-red-500">{String(errors.indent_number.message)}</p>}
            </div>

            <div>
              <Label htmlFor="required_by_date" required>Required By Date</Label>
              <Input
                id="required_by_date"
                type="date"
                {...register('required_by_date', { required: 'Required by date is required' })}
              />
              {errors.required_by_date && <p className="text-sm text-red-500">{String(errors.required_by_date.message)}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="priority" required>Priority</Label>
              <Select
                defaultValue={watch('priority')}
                onValueChange={(value) => setValue('priority', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                defaultValue={watch('status')}
                onValueChange={(value) => setValue('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="pending_college_approval">Pending College Approval</SelectItem>
                  <SelectItem value="pending_super_admin">Pending CEO</SelectItem>
                  <SelectItem value="super_admin_approved">CEO Approved</SelectItem>
                  <SelectItem value="rejected_by_college">Rejected by College</SelectItem>
                  <SelectItem value="rejected_by_super_admin">Rejected by CEO</SelectItem>
                  <SelectItem value="partially_fulfilled">Partially Fulfilled</SelectItem>
                  <SelectItem value="fulfilled">Fulfilled</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="justification" required>Justification</Label>
            <Textarea
              id="justification"
              {...register('justification', { required: 'Justification is required' })}
              rows={3}
            />
            {errors.justification && <p className="text-sm text-red-500">{String(errors.justification.message)}</p>}
          </div>

          <div>
            <Label htmlFor="remarks">Remarks</Label>
            <Textarea
              id="remarks"
              {...register('remarks')}
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Related Entities */}
      <Card>
        <CardHeader>
          <CardTitle>Related Information</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Controller
                name="central_store"
                control={control}
                rules={{ required: 'Central store is required' }}
                render={({ field }) => (
                  <CentralStoreDropdown
                    value={field.value}
                    onChange={field.onChange}
                    required
                    error={errors.central_store?.message ? String(errors.central_store.message) : undefined}
                  />
                )}
              />
            </div>
          </div>

          <div>
            <Controller
              name="requesting_store_manager"
              control={control}
              render={({ field }) => (
                <UserSearchableDropdown
                  value={field.value}
                  onChange={field.onChange}
                  userType="store_manager"
                  college={getCurrentUserCollege(user)}
                  label="Requesting Store Manager"
                  required={false}
                  error={errors.requesting_store_manager?.message ? String(errors.requesting_store_manager.message) : undefined}
                />
              )}
            />
          </div>

          <div>
            <Label htmlFor="attachments">Attachments (URL)</Label>
            <Input
              id="attachments"
              {...register('attachments')}
              placeholder="Attachment URL"
            />
          </div>
        </CardContent>
      </Card>

      {/* Indent Items */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Indent Items</CardTitle>
          <Button
            type="button"
            size="sm"
            onClick={() =>
              append({
                item: '',
                requested_quantity: '',
                approved_quantity: '',
                issued_quantity: '',
                pending_quantity: '',
                unit: '',
                justification: '',
                remarks: '',
                central_store_item: '',
                is_active: true,
              })
            }
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Item
          </Button>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {fields.map((field, index) => (
            <Card key={field.id} className="border-2">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Item {index + 1}</CardTitle>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-6">
                <div>
                  <Controller
                    name={`items.${index}.central_store_item`}
                    control={control}
                    rules={{ required: 'Item is required' }}
                    render={({ field }) => (
                      <CentralStoreItemDropdown
                        value={field.value}
                        onChange={field.onChange}
                        centralStoreId={watch('central_store')}
                        required
                        error={
                          Array.isArray(errors.items)
                            ? errors.items[index]?.central_store_item?.message
                            : undefined
                        }
                        label="Central Store Item"
                      />
                    )}
                  />
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <input type="hidden" {...register(`items.${index}.item`)} />

                  <div>
                    <Label htmlFor={`items.${index}.requested_quantity`} required>Requested Qty</Label>
                    <Input
                      id={`items.${index}.requested_quantity`}
                      type="number"
                      onWheel={(e) => e.currentTarget.blur()}
                      {...register(`items.${index}.requested_quantity`, {
                        required: 'Required',
                      })}
                    />
                  </div>

                  <div>
                    <Label htmlFor={`items.${index}.approved_quantity`}>Approved Qty</Label>
                    <Input
                      id={`items.${index}.approved_quantity`}
                      type="number"
                      onWheel={(e) => e.currentTarget.blur()}
                      {...register(`items.${index}.approved_quantity`)}
                    />
                  </div>

                  <div>
                    <Label htmlFor={`items.${index}.issued_quantity`}>Issued Qty</Label>
                    <Input
                      id={`items.${index}.issued_quantity`}
                      type="number"
                      onWheel={(e) => e.currentTarget.blur()}
                      {...register(`items.${index}.issued_quantity`)}
                    />
                  </div>

                  <div>
                    <Label htmlFor={`items.${index}.pending_quantity`}>Pending Qty</Label>
                    <Input
                      id={`items.${index}.pending_quantity`}
                      type="number"
                      onWheel={(e) => e.currentTarget.blur()}
                      {...register(`items.${index}.pending_quantity`)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor={`items.${index}.unit`} required>Unit</Label>
                  <Input
                    id={`items.${index}.unit`}
                    {...register(`items.${index}.unit`, { required: 'Unit is required' })}
                    placeholder="e.g., kg, pcs, ltr"
                  />
                </div>

                <div>
                  <Label htmlFor={`items.${index}.justification`}>Justification</Label>
                  <Textarea
                    id={`items.${index}.justification`}
                    {...register(`items.${index}.justification`)}
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor={`items.${index}.remarks`}>Remarks</Label>
                  <Textarea
                    id={`items.${index}.remarks`}
                    {...register(`items.${index}.remarks`)}
                    rows={2}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id={`items.${index}.is_active`}
                    {...register(`items.${index}.is_active`)}
                  />
                  <Label htmlFor={`items.${index}.is_active`}>Active</Label>
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      {/* Active Status */}
      <div className="flex items-center space-x-2">
        <Switch id="is_active" {...register('is_active')} />
        <Label htmlFor="is_active">Active</Label>
      </div>

      {/* Form Actions */}
      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1">
          {indent ? 'Update' : 'Create'} Indent
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};
