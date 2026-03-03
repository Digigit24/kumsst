/**
 * Procurement Requirement Form
 */

import { Plus, Trash2 } from 'lucide-react';
import { useEffect } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { CategoryDropdown } from '../../../../components/common/CategoryDropdown';
import { CentralStoreDropdown } from '../../../../components/common/CentralStoreDropdown';
import { Button } from '../../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { Textarea } from '../../../../components/ui/textarea';
import { ProcurementRequirement } from '../../../../types/store.types';

interface RequirementFormProps {
  requirement?: ProcurementRequirement | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export const RequirementForm = ({ requirement, onSubmit, onCancel }: RequirementFormProps) => {
  const { register, handleSubmit, formState: { errors }, control, watch, setValue, reset } = useForm({
    defaultValues: {
      title: '',
      description: '',
      requirement_number: '',
      required_by_date: '',
      urgency: 'low',
      status: 'draft',
      estimated_budget: '',
      justification: '',
      central_store: '',
      items: [
        {
          item_description: '',
          quantity: '',
          unit: '',
          estimated_unit_price: '',
          estimated_total: '',
          specifications: '',
          remarks: '',
          category: '',
        },
      ],
    },
  });

  useEffect(() => {
    if (requirement) {
      reset({
        title: requirement.title,
        description: requirement.description,
        requirement_number: requirement.requirement_number || '',
        required_by_date: requirement.required_by_date,
        urgency: requirement.urgency,
        status: requirement.status,
        estimated_budget: requirement.estimated_budget,
        justification: requirement.justification,
        central_store: requirement.central_store.toString(),
        items: requirement.items?.map((item: any) => ({
          item_description: item.item_description,
          quantity: item.quantity,
          unit: item.unit,
          estimated_unit_price: item.estimated_unit_price,
          estimated_total: item.estimated_total,
          specifications: item.specifications,
          remarks: item.remarks,
          category: item.category?.toString(),
        })) || [],
      });
    }
  }, [requirement, reset]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const onFormSubmit = (data: any) => {
    // Process data to match API expectations
    const payload = {
      ...data,
      requirement_number: data.requirement_number || `REQ-${Date.now()}`,
      central_store: Number(data.central_store),
      estimated_budget: data.estimated_budget.toString(),
      items: data.items.map((item: any) => ({
        ...item,
        category: item.category ? Number(item.category) : undefined,
        quantity: item.quantity ? Number(item.quantity) : 0,
      })),
    };
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="flex flex-col gap-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          {requirement && <p className="text-sm text-muted-foreground">Requirement #: {requirement.requirement_number}</p>}
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="required_by_date" required>Required By Date</Label>
              <Input
                id="required_by_date"
                type="date"
                {...register('required_by_date', { required: 'Required by date is required' })}
              />
              {errors.required_by_date && <p className="text-sm text-red-500">{errors.required_by_date.message}</p>}
            </div>

            <div>
              <Label htmlFor="title" required>Title</Label>
              <Input
                id="title"
                {...register('title', { required: 'Title is required' })}
              />
              {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="requirement_number" required>Requirement Number</Label>
              <Input
                id="requirement_number"
                placeholder="Auto-generated if left blank"
                {...register('requirement_number')}
              />
              {errors.requirement_number && <p className="text-sm text-red-500">{errors.requirement_number.message as string}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="description" required>Description</Label>
            <Textarea
              id="description"
              {...register('description', { required: 'Description is required' })}
              rows={3}
            />
            {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="urgency" required>Urgency</Label>
              <Select
                defaultValue={watch('urgency')}
                onValueChange={(value) => setValue('urgency', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select urgency" />
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
                disabled={!requirement} // Disable status change on creation, default is draft
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  {/* Add other statuses if editable */}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="estimated_budget">Estimated Budget</Label>
              <Input
                id="estimated_budget"
                type="number"
                step="0.01"
                {...register('estimated_budget')}
                placeholder="0.00"
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
                    error={errors.central_store?.message}
                  />
                )}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="justification" required>Justification</Label>
            <Textarea
              id="justification"
              {...register('justification', { required: 'Justification is required' })}
              rows={3}
            />
            {errors.justification && <p className="text-sm text-red-500">{errors.justification.message as string}</p>}
          </div>
        </CardContent>
      </Card>

      {/* Items */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Requirement Items</CardTitle>
          <Button
            type="button"
            size="sm"
            onClick={() =>
              append({
                item_description: '',
                quantity: '',
                unit: '',
                estimated_unit_price: '',
                estimated_total: '',
                specifications: '',
                remarks: '',
                category: '',
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
                  <Label htmlFor={`items.${index}.item_description`} required>Item Description</Label>
                  <Input
                    id={`items.${index}.item_description`}
                    {...register(`items.${index}.item_description`, { required: 'Item description is required' })}
                  />
                  {errors.items?.[index]?.item_description && (
                    <p className="text-sm text-red-500">{errors.items[index].item_description.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor={`items.${index}.quantity`} required>Quantity</Label>
                    <Input
                      id={`items.${index}.quantity`}
                      type="number"
                      onWheel={(e) => e.currentTarget.blur()}
                      {...register(`items.${index}.quantity`, {
                        required: 'Required',
                        min: { value: 0.0001, message: 'Must be greater than 0' }
                      })}
                    />
                    {errors.items?.[index]?.quantity && (
                      <p className="text-sm text-red-500">{errors.items[index].quantity.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor={`items.${index}.unit`} required>Unit</Label>
                    <Input
                      id={`items.${index}.unit`}
                      {...register(`items.${index}.unit`, { required: 'Unit is required' })}
                      placeholder="e.g., kg, pcs, ltr"
                    />
                    {errors.items?.[index]?.unit && (
                      <p className="text-sm text-red-500">{errors.items[index].unit.message}</p>
                    )}
                  </div>

                  <div>
                    <Controller
                      name={`items.${index}.category`}
                      control={control}
                      render={({ field }) => (
                        <CategoryDropdown
                          value={field.value}
                          onChange={field.onChange}
                          showLabel={true}
                          error={errors.items?.[index]?.category?.message}
                        />
                      )}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`items.${index}.estimated_unit_price`}>Est. Unit Price</Label>
                    <Input
                      id={`items.${index}.estimated_unit_price`}
                      type="number"
                      step="0.01"
                      {...register(`items.${index}.estimated_unit_price`)}
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <Label htmlFor={`items.${index}.estimated_total`}>Est. Total</Label>
                    <Input
                      id={`items.${index}.estimated_total`}
                      type="number"
                      step="0.01"
                      {...register(`items.${index}.estimated_total`)}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor={`items.${index}.specifications`}>Specifications</Label>
                  <Textarea
                    id={`items.${index}.specifications`}
                    {...register(`items.${index}.specifications`)}
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
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1">
          {requirement ? 'Update' : 'Create'} Requirement
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};
