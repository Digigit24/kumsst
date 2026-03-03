/**
 * Material Issue Form - Create/Edit material issues
 */

import { Plus, Trash2 } from 'lucide-react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { CentralStoreDropdown } from '../../../components/common/CentralStoreDropdown';
import { StoreIndentDropdown } from '../../../components/common/StoreIndentDropdown';
import { StoreItemDropdown } from '../../../components/common/StoreItemDropdown';
import { UserSearchableDropdown } from '../../../components/common/UserSearchableDropdown';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Switch } from '../../../components/ui/switch';
import { Textarea } from '../../../components/ui/textarea';
import { useAuth } from '../../../hooks/useAuth';
import { useStoreIndent } from '../../../hooks/useStoreIndents';

interface MaterialIssueFormProps {
  materialIssue?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const MaterialIssueForm = ({ materialIssue, onSubmit, onCancel, isSubmitting = false }: MaterialIssueFormProps) => {
  const { register, handleSubmit, formState: { errors }, control, watch, setValue } = useForm({
    defaultValues: materialIssue || {
      min_number: '',
      college: '',
      issue_date: new Date().toISOString().split('T')[0],
      transport_mode: '',
      vehicle_number: '',
      driver_name: '',
      driver_contact: '',
      status: 'prepared',
      dispatch_date: '',
      receipt_date: '',
      min_document: null,
      internal_notes: '',
      receipt_confirmation_notes: '',
      indent: '',
      central_store: '',
      receiving_college: '',
      issued_by: '',
      received_by: '',
      is_active: true,
      items: [
        {
          indent_item: null,
          item: '',
          issued_quantity: 0,
          unit: '',
          batch_number: '',
          remarks: '',
          is_active: true,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const indentId = watch('indent');
  const { data: indentData } = useStoreIndent(indentId ? Number(indentId) : 0);
  const { user } = useAuth();


  // Helper to find indent_item id
  const findIndentItemId = (itemId: number) => {
    if (!indentData?.items) return null;
    const match = indentData.items.find((ii: any) =>
      (typeof ii.central_store_item === 'object' ? ii.central_store_item.id : ii.central_store_item) === itemId
    );
    return match ? match.id : null;
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Material Issue Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="min_number" required>MIN Number</Label>
              <Input
                id="min_number"
                {...register('min_number', { required: 'MIN number is required' })}
                placeholder="Material Issue Number"
              />
              {errors.min_number && <p className="text-sm text-red-500">{String(errors.min_number.message)}</p>}
            </div>

            <div>
              <Label htmlFor="issue_date" required>Issue Date</Label>
              <Input
                id="issue_date"
                type="date"
                {...register('issue_date', { required: 'Issue date is required' })}
              />
              {errors.issue_date && <p className="text-sm text-red-500">{String(errors.issue_date.message)}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status" required>Status</Label>
              <Select
                defaultValue={watch('status')}
                onValueChange={(value) => setValue('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="prepared">Prepared</SelectItem>
                  <SelectItem value="dispatched">Dispatched</SelectItem>
                  <SelectItem value="received">Received</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="transport_mode">Transport Mode</Label>
              <Input
                id="transport_mode"
                {...register('transport_mode')}
                placeholder="e.g., Truck, Van"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Related Entities */}
      <Card>
        <CardHeader>
          <CardTitle>Related Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Controller
                name="indent"
                control={control}
                rules={{ required: 'Indent is required' }}
                render={({ field }) => (
                  <StoreIndentDropdown
                    value={field.value}
                    onChange={field.onChange}
                    status="approved"
                    required
                    error={errors.indent?.message ? String(errors.indent.message) : undefined}
                    label="Store Indent"
                  />
                )}
              />
            </div>

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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Controller
                name="received_by"
                control={control}
                render={({ field }) => (
                  <UserSearchableDropdown
                    value={field.value}
                    onChange={field.onChange}
                    label="Received By"
                    required={false}
                    error={errors.received_by?.message ? String(errors.received_by.message) : undefined}
                  />
                )}
              />
            </div>

            <div>
              <Controller
                name="issued_by"
                control={control}
                render={({ field }) => (
                  <UserSearchableDropdown
                    value={field.value}
                    onChange={field.onChange}
                    label="Issued By"
                    required={false}
                    error={errors.issued_by?.message ? String(errors.issued_by.message) : undefined}
                  />
                )}
              />
            </div>
          </div>


        </CardContent>
      </Card>

      {/* Transport Details */}
      <Card>
        <CardHeader>
          <CardTitle>Transport Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="vehicle_number">Vehicle Number</Label>
              <Input
                id="vehicle_number"
                {...register('vehicle_number')}
                placeholder="e.g., MH-12-AB-1234"
              />
            </div>

            <div>
              <Label htmlFor="driver_name">Driver Name</Label>
              <Input
                id="driver_name"
                {...register('driver_name')}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="driver_contact">Driver Contact</Label>
              <Input
                id="driver_contact"
                {...register('driver_contact')}
                placeholder="Phone number"
              />
            </div>

            <div>
              <Label htmlFor="dispatch_date">Dispatch Date</Label>
              <Input
                id="dispatch_date"
                type="datetime-local"
                {...register('dispatch_date')}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="receipt_date">Receipt Date</Label>
              <Input
                id="receipt_date"
                type="datetime-local"
                {...register('receipt_date')}
              />
            </div>

            <div>
              <Label htmlFor="min_document">MIN Document</Label>
              <Input
                id="min_document"
                type="file"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  setValue('min_document', file);
                }}
              />
              {materialIssue?.min_document && typeof materialIssue.min_document === 'string' && (
                <p className="text-xs text-muted-foreground mt-1">
                  Current: <a href={materialIssue.min_document} target="_blank" rel="noreferrer" className="underline">View Document</a>
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Items */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Issue Items</CardTitle>
          <Button
            type="button"
            size="sm"
            onClick={() =>
              append({
                indent_item: '',
                item: '',
                issued_quantity: 0,
                unit: '',
                batch_number: '',
                remarks: '',
                is_active: true,
              })
            }
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Item
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
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
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Controller
                      name={`items.${index}.item`}
                      control={control}
                      rules={{ required: 'Item is required' }}
                      render={({ field }) => (
                        <StoreItemDropdown
                          value={field.value}
                          onChange={(val) => {
                            field.onChange(val);
                            // Auto-set indent_item id if we have indent data
                            if (val && indentData) {
                              const iId = findIndentItemId(val);
                              if (iId) {
                                setValue(`items.${index}.indent_item`, iId);
                              }
                            }
                          }}
                          required
                          error={
                            Array.isArray(errors.items)
                              ? errors.items[index]?.item?.message
                              : undefined
                          }
                        />
                      )}
                    />
                  </div>

                  <div>
                    <Label htmlFor={`items.${index}.issued_quantity`} required>Issued Quantity</Label>
                    <Input
                      id={`items.${index}.issued_quantity`}
                      type="number"
                      {...register(`items.${index}.issued_quantity`, {
                        required: 'Required',
                        valueAsNumber: true,
                      })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`items.${index}.unit`} required>Unit</Label>
                    <Input
                      id={`items.${index}.unit`}
                      {...register(`items.${index}.unit`, { required: 'Unit is required' })}
                      placeholder="e.g., pieces, kg"
                    />
                  </div>

                  <div>
                    <Label htmlFor={`items.${index}.batch_number`}>Batch Number</Label>
                    <Input
                      id={`items.${index}.batch_number`}
                      {...register(`items.${index}.batch_number`)}
                    />
                  </div>
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

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="internal_notes">Internal Notes</Label>
            <Textarea
              id="internal_notes"
              {...register('internal_notes')}
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="receipt_confirmation_notes">Receipt Confirmation Notes</Label>
            <Textarea
              id="receipt_confirmation_notes"
              {...register('receipt_confirmation_notes')}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Active Status */}
      <div className="flex items-center space-x-2">
        <Switch id="is_active" {...register('is_active')} />
        <Label htmlFor="is_active">Active</Label>
      </div>

      {/* Form Actions */}
      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : materialIssue ? 'Update' : 'Create'} Material Issue
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};
