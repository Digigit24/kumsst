/**
 * Store Indent Pipeline - Multi-step wizard for creating Store Indents
 * Steps: 1. Request Details → 2. Add Items → 3. Review & Submit
 */

import { useQuery } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Edit2,
  FileText,
  Package,
  PackagePlus,
  Plus,
  Trash2,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { CentralStoreDropdown } from '../../../components/common/CentralStoreDropdown';
import { CentralStoreItemDropdown } from '../../../components/common/CentralStoreItemDropdown';
import { UserSearchableDropdown } from '../../../components/common/UserSearchableDropdown';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { SearchableSelect } from '../../../components/ui/searchable-select';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Textarea } from '../../../components/ui/textarea';
import { DROPDOWN_PAGE_SIZE } from '../../../config/app.config';
import { useSuperAdminContext } from '../../../contexts/SuperAdminContext';
import { useAuth } from '../../../hooks/useAuth';
import { useCentralInventory } from '../../../hooks/useCentralInventory';
import { useCentralStores } from '../../../hooks/useCentralStores';
import { useCreateStoreItem } from '../../../hooks/useStore';
import { categoriesApi } from '../../../services/store.service';
import { getCurrentUserCollege } from '../../../utils/auth.utils';

interface StoreIndentPipelineProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

type StepType = 1 | 2 | 3;

type StoreIndentFormValues = {
  indent_number: string;
  required_by_date: string;
  priority: string;
  justification: string;
  college: number | null;
  central_store: number | null;
  requesting_store_manager: string;
  attachments: string;
  remarks: string;
  status: string;
  is_active: boolean;
  items: {
    central_store_item: number | null;
    requested_quantity: number;
    unit: string;
    justification: string;
    is_active: boolean;
  }[];
};

const stepVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 1000 : -1000,
    opacity: 0,
  }),
};

export const StoreIndentPipeline = ({ onSubmit, onCancel, isSubmitting }: StoreIndentPipelineProps) => {
  const [currentStep, setCurrentStep] = useState<StepType>(() => {
    const savedStep = localStorage.getItem('STORE_INDENT_STEP');
    return savedStep ? (parseInt(savedStep) as StepType) : 1;
  });
  const [direction, setDirection] = useState(0);


  const [isCreateItemDialogOpen, setIsCreateItemDialogOpen] = useState(false);
  const [newItemForm, setNewItemForm] = useState({
    code: '',
    name: '',
    category: 0,
    description: '',
    unit: 'Piece',
    stock_quantity: 0,
    min_stock_level: 10,
    price: 0,
    barcode: '',
    image: '',
  });

  const createItemMutation = useCreateStoreItem();

  // Fetch categories for the create item dialog
  const { data: categoriesData } = useQuery({
    queryKey: ['categories-for-select'],
    queryFn: () => categoriesApi.list(),
  });

  const categoryOptions = categoriesData?.results?.map((category: any) => ({
    value: category.id,
    label: `${category.name} (${category.code})`,
  })) || [];

  const { register, handleSubmit, formState: { errors }, control, watch, setValue, trigger, reset } = useForm<StoreIndentFormValues>({
    defaultValues: {
      indent_number: '',
      required_by_date: '',
      priority: 'medium',
      justification: '',
      college: null,
      central_store: null,
      requesting_store_manager: '',
      attachments: '',
      remarks: '',
      status: 'draft',
      is_active: true,
      items: [
        {
          central_store_item: null,
          requested_quantity: 1,
          unit: '',
          justification: '',
          is_active: true,
        },
      ],
    },
    mode: 'onChange',
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  // Load draft on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('STORE_INDENT_DRAFT');
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        if (parsed) {
          // Restore form data
          reset(parsed);

          // Restore step logic if needed? 
          // Often users want to jump back to where they were.
          // But for now, starting at step 1 with data filled is fine.
          // Actually, let's also restore the current step if we saved it?
          // Form data doesn't include 'currentStep' state. 
          // We'll stick to form data.
        }
      } catch (error) {
        console.error('Failed to load draft:', error);
      }
    }
  }, [reset]);

  // Save draft on change
  useEffect(() => {
    const subscription = watch((value) => {
      localStorage.setItem('STORE_INDENT_DRAFT', JSON.stringify(value));
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  // Save current step on change
  useEffect(() => {
    localStorage.setItem('STORE_INDENT_STEP', currentStep.toString());
  }, [currentStep]);

  const centralStoreId = watch('central_store');
  const collegeId = watch('college');
  const allItems = watch('items');
  const { user } = useAuth();
  const { selectedCollege } = useSuperAdminContext();
  const { data: centralStoresData } = useCentralStores({ page_size: DROPDOWN_PAGE_SIZE, is_active: true });
  const { data: inventoryData } = useCentralInventory(
    centralStoreId ? { central_store: centralStoreId, page_size: DROPDOWN_PAGE_SIZE, is_active: true } : { page_size: DROPDOWN_PAGE_SIZE, is_active: true }
  );

  // Auto-select college from header (super admin) or user default
  useEffect(() => {
    const userCollege = getCurrentUserCollege(user as any);
    const headerCollege = selectedCollege;
    const resolved = headerCollege !== null && headerCollege !== undefined ? headerCollege : userCollege;
    if (resolved) {
      setValue('college', resolved, { shouldValidate: true });
    }
  }, [user, selectedCollege, setValue]);

  const getCentralStoreName = (id: number | null | undefined) => {
    if (!id) return null;
    return centralStoresData?.results?.find((s: any) => s.id === Number(id))?.name || null;
  };

  const getItemName = (itemId: number | null | undefined) => {
    if (!itemId) return null;
    const item = inventoryData?.results?.find((i: any) => i.id === Number(itemId));
    return item?.item_display || item?.item_name || null;
  };

  // Step validation
  const validateStep1 = async () => {
    const isValid = await trigger([
      'indent_number',
      'required_by_date',
      'priority',
      'justification',
      'central_store',
    ]);
    return isValid;
  };

  const validateStep2 = async () => {
    if (fields.length === 0) {
      return false;
    }

    const isValid = await trigger('items');

    // Check if at least one item is filled
    const hasValidItem = allItems.some(
      item => item.central_store_item && item.requested_quantity > 0 && item.unit
    );

    return isValid && hasValidItem;
  };

  // Navigation handlers
  const handleNext = async () => {
    let canProceed = false;

    if (currentStep === 1) {
      canProceed = await validateStep1();
    } else if (currentStep === 2) {
      canProceed = await validateStep2();
    }

    if (canProceed) {
      setDirection(1);
      setCurrentStep((prev) => Math.min(prev + 1, 3) as StepType);
    }
  };

  const handleBack = () => {
    setDirection(-1);
    setCurrentStep((prev) => Math.max(prev - 1, 1) as StepType);
  };

  const goToStep = (step: StepType) => {
    setDirection(step > currentStep ? 1 : -1);
    setCurrentStep(step);
  };

  const handleFinalSubmit = handleSubmit((data) => {
    localStorage.removeItem('STORE_INDENT_DRAFT');
    localStorage.removeItem('STORE_INDENT_STEP');
    // Ensure date is in YYYY-MM-DD format
    const formattedData = { ...data };
    if (formattedData.required_by_date && typeof formattedData.required_by_date === 'string') {
      formattedData.required_by_date = formattedData.required_by_date.split('T')[0];
    }
    onSubmit(formattedData);
  });

  const handleCreateNewItem = async () => {
    try {
      await createItemMutation.mutateAsync(newItemForm);
      toast.success('Item created successfully! You can now select it from the dropdown.');
      setIsCreateItemDialogOpen(false);
      resetNewItemForm();
    } catch (err: any) {
      console.error('Create item error:', err);
      toast.error(err?.message || 'Failed to create item');
    }
  };

  const resetNewItemForm = () => {
    setNewItemForm({
      code: '',
      name: '',
      category: 0,
      description: '',
      unit: 'Piece',
      stock_quantity: 0,
      min_stock_level: 10,
      price: 0,
      barcode: '',
      image: '',
    });
  };

  // Step indicators
  const steps = [
    { number: 1, title: 'Request Details', icon: FileText },
    { number: 2, title: 'Add Items', icon: Package },
    { number: 3, title: 'Review & Submit', icon: CheckCircle },
  ];

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${currentStep > step.number
                  ? 'bg-primary border-primary text-primary-foreground'
                  : currentStep === step.number
                    ? 'border-primary text-primary'
                    : 'border-muted text-muted-foreground'
                  }`}
              >
                {currentStep > step.number ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <step.icon className="h-5 w-5" />
                )}
              </div>
              <span
                className={`text-xs mt-1 font-medium ${currentStep >= step.number ? 'text-foreground' : 'text-muted-foreground'
                  }`}
              >
                {step.title}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`h-0.5 flex-1 mx-2 transition-all ${currentStep > step.number ? 'bg-primary' : 'bg-muted'
                  }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="relative overflow-y-auto max-h-[calc(100vh-400px)]">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentStep}
            custom={direction}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            className="w-full"
          >
            {/* Step 1: Request Details */}
            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>Request Details</CardTitle>
                  <CardDescription>
                    Enter the indent information and select the requesting location
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Basic Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="indent_number">
                        Indent Number
                      </Label>
                      <Input
                        id="indent_number"
                        {...register('indent_number')}
                        placeholder="Auto-generated if left blank"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Leave blank to auto-generate sequentially.
                      </p>
                      {errors.indent_number && (
                        <p className="text-xs text-destructive mt-1">{errors.indent_number.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="required_by_date" required>
                        Required By Date
                      </Label>
                      <Input
                        id="required_by_date"
                        type="date"
                        {...register('required_by_date', { required: 'Required by date is required' })}
                      />
                      {errors.required_by_date && (
                        <p className="text-xs text-destructive mt-1">{errors.required_by_date.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Priority */}
                  <div>
                    <Label htmlFor="priority" required>
                      Priority
                    </Label>
                    <Select
                      value={watch('priority')}
                      onValueChange={(value) => setValue('priority', value, { shouldValidate: true })}
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

                  {/* Location Details */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="hidden">
                      <input type="hidden" {...register('college')} />
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

                  {!centralStoreId && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Important:</strong> You must select a Central Store to proceed to the next
                        step.
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Justification */}
                  <div>
                    <Label htmlFor="justification" required>
                      Justification
                    </Label>
                    <Textarea
                      id="justification"
                      {...register('justification', { required: 'Justification is required' })}
                      rows={3}
                      placeholder="Explain why these materials are needed..."
                    />
                    {errors.justification && (
                      <p className="text-xs text-destructive mt-1">{errors.justification.message}</p>
                    )}
                  </div>

                  {/* Optional Fields */}
                  <div>
                    <Controller
                      name="requesting_store_manager"
                      control={control}
                      render={({ field }) => (
                        <UserSearchableDropdown
                          value={field.value}
                          onChange={field.onChange}
                          userType="store_manager"
                          college={collegeId}
                          label="Requesting Store Manager"
                          required={false}
                        />
                      )}
                    />
                  </div>

                  <div>
                    <Label htmlFor="attachments">Attachments (URL)</Label>
                    <Input
                      id="attachments"
                      {...register('attachments')}
                      placeholder="https://example.com/document.pdf"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Add Items */}
            {currentStep === 2 && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Add Items</CardTitle>
                    <CardDescription>
                      Select items from the central store inventory
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setIsCreateItemDialogOpen(true)}
                    >
                      <PackagePlus className="h-4 w-4 mr-1" />
                      Create New Item
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() =>
                        append({
                          central_store_item: null,
                          requested_quantity: 1,
                          unit: '',
                          justification: '',
                          is_active: true,
                        })
                      }
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Item
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {fields.length === 0 && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        You must add at least one item to proceed.
                      </AlertDescription>
                    </Alert>
                  )}

                  {fields.map((field, index) => (
                    <Card key={field.id} className="border-2">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">Item {index + 1}</CardTitle>
                          {fields.length > 1 && (
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => remove(index)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Controller
                            name={`items.${index}.central_store_item`}
                            control={control}
                            rules={{ required: 'Item is required' }}
                            render={({ field }) => (
                              <CentralStoreItemDropdown
                                value={field.value}
                                onChange={field.onChange}
                                centralStoreId={centralStoreId}
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

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor={`items.${index}.requested_quantity`} required>
                              Requested Quantity
                            </Label>
                            <Input
                              id={`items.${index}.requested_quantity`}
                              type="number"
                              min="1"
                              {...register(`items.${index}.requested_quantity`, {
                                required: 'Quantity is required',
                                valueAsNumber: true,
                                min: { value: 1, message: 'Minimum quantity is 1' },
                              })}
                            />
                            {Array.isArray(errors.items) && errors.items[index]?.requested_quantity && (
                              <p className="text-xs text-destructive mt-1">
                                {String(errors.items[index]?.requested_quantity?.message)}
                              </p>
                            )}
                          </div>

                          <div>
                            <Label htmlFor={`items.${index}.unit`} required>
                              Unit
                            </Label>
                            <Input
                              id={`items.${index}.unit`}
                              {...register(`items.${index}.unit`, { required: 'Unit is required' })}
                              placeholder="e.g., pieces, kg, ltr"
                            />
                            {Array.isArray(errors.items) && errors.items[index]?.unit && (
                              <p className="text-xs text-destructive mt-1">
                                {String(errors.items[index]?.unit?.message)}
                              </p>
                            )}
                          </div>
                        </div>

                        <div>
                          <Label htmlFor={`items.${index}.justification`}>Justification (Optional)</Label>
                          <Textarea
                            id={`items.${index}.justification`}
                            {...register(`items.${index}.justification`)}
                            rows={2}
                            placeholder="Reason for this item..."
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Step 3: Review & Submit */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Request Details</CardTitle>
                      <CardDescription>Review your indent information</CardDescription>
                    </div>
                    <Button type="button" size="sm" variant="ghost" onClick={() => goToStep(1)}>
                      <Edit2 className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-muted-foreground">Indent Number</Label>
                        <p className="font-semibold">{watch('indent_number')}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Required By</Label>
                        <p className="font-semibold">
                          {new Date(watch('required_by_date')).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Priority</Label>
                        <Badge className="capitalize">{watch('priority')}</Badge>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Central Store</Label>
                        <p className="font-semibold">
                          {getCentralStoreName(watch('central_store')) || `Store #${watch('central_store')}`}
                        </p>
                      </div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Justification</Label>
                      <p className="text-sm mt-1">{watch('justification')}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Items ({fields.length})</CardTitle>
                      <CardDescription>Review requested items</CardDescription>
                    </div>
                    <Button type="button" size="sm" variant="ghost" onClick={() => goToStep(2)}>
                      <Edit2 className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="border rounded-md">
                      <table className="w-full">
                        <thead className="bg-muted">
                          <tr>
                            <th className="p-2 text-left">#</th>
                            <th className="p-2 text-left">Item</th>
                            <th className="p-2 text-right">Quantity</th>
                            <th className="p-2 text-left">Unit</th>
                            <th className="p-2 text-left">Justification</th>
                          </tr>
                        </thead>
                        <tbody>
                          {allItems.map((item, index) => (
                            <tr key={index} className="border-t">
                              <td className="p-2">{index + 1}</td>
                              <td className="p-2">
                                {getItemName(item.central_store_item) || `Item #${item.central_store_item}`}
                              </td>
                              <td className="p-2 text-right font-semibold">{item.requested_quantity}</td>
                              <td className="p-2">{item.unit}</td>
                              <td className="p-2 text-sm text-muted-foreground">
                                {item.justification || '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Please review all information carefully before submitting. Once submitted, the indent
                    will be sent to your College Admin for approval.
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4 border-t">
        <div>
          {currentStep > 1 && (
            <Button type="button" variant="outline" onClick={handleBack}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          )}
        </div>

        <div className="flex gap-2">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>

          {currentStep < 3 ? (
            <Button type="button" onClick={handleNext}>
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button type="button" onClick={handleFinalSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Indent'}
            </Button>
          )}
        </div>
      </div>

      {/* Create New Item Dialog */}
      <Dialog open={isCreateItemDialogOpen} onOpenChange={setIsCreateItemDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Inventory Item</DialogTitle>
            <DialogDescription>
              Add a new item to the store inventory that you can then select for this indent
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Item Code *</Label>
                <Input
                  placeholder="e.g., ST-001"
                  value={newItemForm.code}
                  onChange={(e) => setNewItemForm({ ...newItemForm, code: e.target.value })}
                />
              </div>
              <div>
                <Label>Category</Label>
                <SearchableSelect
                  options={categoryOptions}
                  value={newItemForm.category}
                  onChange={(value) => setNewItemForm({ ...newItemForm, category: Number(value) || 0 })}
                  placeholder="Select category"
                />
              </div>
            </div>

            <div>
              <Label>Item Name *</Label>
              <Input
                placeholder="e.g., A4 Printing Paper (Ream)"
                value={newItemForm.name}
                onChange={(e) => setNewItemForm({ ...newItemForm, name: e.target.value })}
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                placeholder="Item description..."
                rows={2}
                value={newItemForm.description}
                onChange={(e) => setNewItemForm({ ...newItemForm, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Unit</Label>
                <Select
                  value={newItemForm.unit}
                  onValueChange={(value) => setNewItemForm({ ...newItemForm, unit: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Piece">Piece</SelectItem>
                    <SelectItem value="Box">Box</SelectItem>
                    <SelectItem value="Ream">Ream</SelectItem>
                    <SelectItem value="Set">Set</SelectItem>
                    <SelectItem value="Bottle">Bottle</SelectItem>
                    <SelectItem value="Packet">Packet</SelectItem>
                    <SelectItem value="Kg">Kg</SelectItem>
                    <SelectItem value="Liter">Liter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Price (₹) *</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={newItemForm.price}
                  onChange={(e) => setNewItemForm({ ...newItemForm, price: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Stock Quantity</Label>
                <Input
                  type="number"
                  min="0"
                  value={newItemForm.stock_quantity}
                  onChange={(e) => setNewItemForm({ ...newItemForm, stock_quantity: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label>Min Stock Level</Label>
                <Input
                  type="number"
                  min="0"
                  value={newItemForm.min_stock_level}
                  onChange={(e) => setNewItemForm({ ...newItemForm, min_stock_level: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                After creating the item, you'll be able to select it from the item dropdown in the form above.
              </AlertDescription>
            </Alert>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => { setIsCreateItemDialogOpen(false); resetNewItemForm(); }}>
                Cancel
              </Button>
              <Button
                onClick={handleCreateNewItem}
                disabled={!newItemForm.code || !newItemForm.name || newItemForm.price === 0 || createItemMutation.isPending}
              >
                <Package className="h-4 w-4 mr-2" />
                {createItemMutation.isPending ? 'Creating...' : 'Create Item'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
