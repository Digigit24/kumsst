/**
 * Quality Inspection Form
 */

import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Switch } from '../../../../components/ui/switch';
import { Textarea } from '../../../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';

interface InspectionFormProps {
  inspection?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export const InspectionForm = ({ inspection, onSubmit, onCancel }: InspectionFormProps) => {
  const { register, handleSubmit, formState: { errors }, control, watch, setValue } = useForm({
    defaultValues: inspection || {
      grn: '',
      inspection_date: '',
      inspector: '',
      overall_status: 'pending',
      quality_rating: 0,
      packaging_condition: '',
      labeling_condition: '',
      documentation_status: '',
      recommendation: '',
      findings: '',
      corrective_actions: '',
      remarks: '',
      metadata: '',
      is_active: true,
      items: [
        {
          item_description: '',
          inspected_quantity: 0,
          accepted_quantity: 0,
          rejected_quantity: 0,
          defect_quantity: 0,
          unit: '',
          visual_inspection: '',
          dimensional_check: '',
          functional_test: '',
          quality_parameters: '',
          defects_noted: '',
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Inspection Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="grn" required>GRN ID</Label>
              <Input
                id="grn"
                type="number"
                {...register('grn', { required: 'GRN is required', valueAsNumber: true })}
                placeholder="Goods Receipt Note ID"
              />
              {errors.grn && <p className="text-sm text-red-500">{String(errors.grn.message)}</p>}
            </div>

            <div>
              <Label htmlFor="inspection_date" required>Inspection Date</Label>
              <Input
                id="inspection_date"
                type="date"
                {...register('inspection_date', { required: 'Inspection date is required' })}
              />
              {errors.inspection_date && <p className="text-sm text-red-500">{String(errors.inspection_date.message)}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="inspector">Inspector ID</Label>
              <Input
                id="inspector"
                type="number"
                {...register('inspector', { valueAsNumber: true })}
                placeholder="Inspector user ID"
              />
            </div>

            <div>
              <Label htmlFor="overall_status">Overall Status</Label>
              <Select
                defaultValue={watch('overall_status')}
                onValueChange={(value) => setValue('overall_status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="passed">Passed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="partial">Partial Pass</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quality_rating">Quality Rating (0-10)</Label>
              <Input
                id="quality_rating"
                type="number"
                min="0"
                max="10"
                step="0.1"
                {...register('quality_rating', { valueAsNumber: true })}
                placeholder="0-10"
              />
            </div>

            <div>
              <Label htmlFor="recommendation">Recommendation</Label>
              <Select
                defaultValue={watch('recommendation')}
                onValueChange={(value) => setValue('recommendation', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select recommendation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="accept">Accept</SelectItem>
                  <SelectItem value="reject">Reject</SelectItem>
                  <SelectItem value="conditional">Conditional Accept</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="packaging_condition">Packaging Condition</Label>
              <Select
                defaultValue={watch('packaging_condition')}
                onValueChange={(value) => setValue('packaging_condition', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="excellent">Excellent</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="fair">Fair</SelectItem>
                  <SelectItem value="poor">Poor</SelectItem>
                  <SelectItem value="damaged">Damaged</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="labeling_condition">Labeling Condition</Label>
              <Select
                defaultValue={watch('labeling_condition')}
                onValueChange={(value) => setValue('labeling_condition', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="proper">Proper</SelectItem>
                  <SelectItem value="incomplete">Incomplete</SelectItem>
                  <SelectItem value="missing">Missing</SelectItem>
                  <SelectItem value="damaged">Damaged</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="documentation_status">Documentation Status</Label>
              <Select
                defaultValue={watch('documentation_status')}
                onValueChange={(value) => setValue('documentation_status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="complete">Complete</SelectItem>
                  <SelectItem value="incomplete">Incomplete</SelectItem>
                  <SelectItem value="missing">Missing</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="findings">Inspection Findings</Label>
            <Textarea
              id="findings"
              {...register('findings')}
              rows={3}
              placeholder="Detailed findings and observations"
            />
          </div>

          <div>
            <Label htmlFor="corrective_actions">Corrective Actions Required</Label>
            <Textarea
              id="corrective_actions"
              {...register('corrective_actions')}
              rows={2}
              placeholder="Actions to be taken if any issues found"
            />
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

      {/* Items */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Item-wise Inspection</CardTitle>
          <Button
            type="button"
            size="sm"
            onClick={() =>
              append({
                item_description: '',
                inspected_quantity: 0,
                accepted_quantity: 0,
                rejected_quantity: 0,
                defect_quantity: 0,
                unit: '',
                visual_inspection: '',
                dimensional_check: '',
                functional_test: '',
                quality_parameters: '',
                defects_noted: '',
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
                <div>
                  <Label htmlFor={`items.${index}.item_description`} required>Item Description</Label>
                  <Input
                    id={`items.${index}.item_description`}
                    {...register(`items.${index}.item_description`, { required: 'Item description is required' })}
                  />
                  {Array.isArray(errors.items) && errors.items[index]?.item_description && (
                    <p className="text-sm text-red-500">
                      {String(errors.items[index]?.item_description?.message)}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor={`items.${index}.inspected_quantity`} required>Inspected Qty</Label>
                    <Input
                      id={`items.${index}.inspected_quantity`}
                      type="number"
                      {...register(`items.${index}.inspected_quantity`, {
                        required: 'Required',
                        valueAsNumber: true,
                      })}
                    />
                  </div>

                  <div>
                    <Label htmlFor={`items.${index}.accepted_quantity`}>Accepted Qty</Label>
                    <Input
                      id={`items.${index}.accepted_quantity`}
                      type="number"
                      {...register(`items.${index}.accepted_quantity`, { valueAsNumber: true })}
                    />
                  </div>

                  <div>
                    <Label htmlFor={`items.${index}.rejected_quantity`}>Rejected Qty</Label>
                    <Input
                      id={`items.${index}.rejected_quantity`}
                      type="number"
                      {...register(`items.${index}.rejected_quantity`, { valueAsNumber: true })}
                    />
                  </div>

                  <div>
                    <Label htmlFor={`items.${index}.defect_quantity`}>Defect Qty</Label>
                    <Input
                      id={`items.${index}.defect_quantity`}
                      type="number"
                      {...register(`items.${index}.defect_quantity`, { valueAsNumber: true })}
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

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor={`items.${index}.visual_inspection`}>Visual Inspection</Label>
                    <Select
                      defaultValue={watch(`items.${index}.visual_inspection`)}
                      onValueChange={(value) => setValue(`items.${index}.visual_inspection`, value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select result" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pass">Pass</SelectItem>
                        <SelectItem value="fail">Fail</SelectItem>
                        <SelectItem value="na">N/A</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor={`items.${index}.dimensional_check`}>Dimensional Check</Label>
                    <Select
                      defaultValue={watch(`items.${index}.dimensional_check`)}
                      onValueChange={(value) => setValue(`items.${index}.dimensional_check`, value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select result" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pass">Pass</SelectItem>
                        <SelectItem value="fail">Fail</SelectItem>
                        <SelectItem value="na">N/A</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor={`items.${index}.functional_test`}>Functional Test</Label>
                    <Select
                      defaultValue={watch(`items.${index}.functional_test`)}
                      onValueChange={(value) => setValue(`items.${index}.functional_test`, value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select result" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pass">Pass</SelectItem>
                        <SelectItem value="fail">Fail</SelectItem>
                        <SelectItem value="na">N/A</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor={`items.${index}.quality_parameters`}>Quality Parameters</Label>
                  <Textarea
                    id={`items.${index}.quality_parameters`}
                    {...register(`items.${index}.quality_parameters`)}
                    rows={2}
                    placeholder="Specific quality parameters checked"
                  />
                </div>

                <div>
                  <Label htmlFor={`items.${index}.defects_noted`}>Defects Noted</Label>
                  <Textarea
                    id={`items.${index}.defects_noted`}
                    {...register(`items.${index}.defects_noted`)}
                    rows={2}
                    placeholder="Any defects or issues found"
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
          {inspection ? 'Update' : 'Create'} Inspection
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};
