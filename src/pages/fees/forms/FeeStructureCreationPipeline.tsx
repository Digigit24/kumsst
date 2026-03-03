/**
 * Fee Structure Creation Pipeline - Multi-step wizard for creating Fee Structures
 * Steps: 1. Fee Group Selection → 2. Fee Type Selection → 3. Fee Master Selection → 4. Student Selection & Review
 *
 * This wizard streamlines the fee structure creation process by allowing inline creation
 * of dependencies (fee group, fee type, fee master) if they don't exist yet.
 */

import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  BookOpen,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  IndianRupee,
  Layers,
  Tag,
  User
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Separator } from '../../../components/ui/separator';
import { Switch } from '../../../components/ui/switch';
import { Textarea } from '../../../components/ui/textarea';
import { DROPDOWN_PAGE_SIZE } from '@/config/app.config';
import { useFeeGroupsSWR, useFeeTypesSWR, useFeeMastersSWR } from '../../../hooks/swr';
import { useProgramsSWR } from '../../../hooks/swr';
import { useAuth } from '../../../hooks/useAuth';
import { useAcademicYears } from '../../../hooks/useCore';
import { useStudents } from '../../../hooks/useStudents';
import {
  feeGroupsApi,
  feeMastersApi,
  feeStructuresApi,
  feeTypesApi,
} from '../../../services/fees.service';
import type {
  FeeGroupCreateInput,
  FeeMasterCreateInput,
  FeeStructureCreateInput,
  FeeTypeCreateInput,
} from '../../../types/fees.types';
import { getCurrentUserCollege } from '../../../utils/auth.utils';

interface FeeStructureCreationPipelineProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

type StepType = 1 | 2 | 3 | 4;

type FeeStructureFormValues = {
  // Step 1: Fee Group Selection/Creation
  feeGroupMode: 'existing' | 'create';
  existingFeeGroupId: number | null;
  // Fee Group creation fields
  feeGroup_name: string;
  feeGroup_code: string;
  feeGroup_description: string;

  // Step 2: Fee Type Selection/Creation
  feeTypeMode: 'existing' | 'create';
  existingFeeTypeId: number | null;
  // Fee Type creation fields
  feeType_name: string;
  feeType_code: string;
  feeType_description: string;

  // Step 3: Fee Master Selection/Creation
  feeMasterMode: 'existing' | 'create';
  existingFeeMasterId: number | null;
  // Fee Master creation fields
  feeMaster_program: number | null;
  feeMaster_academic_year: number | null;
  feeMaster_semester: number;
  feeMaster_amount: string;

  // Step 4: Student Selection & Fee Structure Details
  student: number | null;
  amount: string;
  due_date: string;
  is_paid: boolean;
  paid_amount: string;
  balance: string;
  is_active: boolean;
  college: number | null;
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

export const FeeStructureCreationPipeline = ({ onSubmit, onCancel }: FeeStructureCreationPipelineProps) => {
  const [currentStep, setCurrentStep] = useState<StepType>(() => {
    const savedStep = localStorage.getItem('FEE_STRUCTURE_CREATION_STEP');
    return savedStep ? (parseInt(savedStep) as StepType) : 1;
  });
  const [direction, setDirection] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // SWR hooks for dropdown data (replaces manual fetch + useState)
  const { data: feeGroupsData, isLoading: loadingFeeGroups } = useFeeGroupsSWR({ page_size: DROPDOWN_PAGE_SIZE, is_active: true });
  const { data: feeMastersData, isLoading: loadingFeeMasters } = useFeeMastersSWR({ page_size: DROPDOWN_PAGE_SIZE, is_active: true });

  const { user } = useAuth();

  const { register, handleSubmit, formState: { errors }, control, watch, setValue, trigger, reset } = useForm<FeeStructureFormValues>({
    defaultValues: {
      // Fee Group
      feeGroupMode: 'existing',
      existingFeeGroupId: null,
      feeGroup_name: '',
      feeGroup_code: '',
      feeGroup_description: '',

      // Fee Type
      feeTypeMode: 'existing',
      existingFeeTypeId: null,
      feeType_name: '',
      feeType_code: '',
      feeType_description: '',

      // Fee Master
      feeMasterMode: 'existing',
      existingFeeMasterId: null,
      feeMaster_program: null,
      feeMaster_academic_year: null,
      feeMaster_semester: 1,
      feeMaster_amount: '0',

      // Fee Structure
      student: null,
      amount: '0',
      due_date: new Date().toISOString().split('T')[0],
      is_paid: false,
      paid_amount: '0',
      balance: '0',
      is_active: true,
      college: getCurrentUserCollege(user as any) || null,
    },
    mode: 'onChange',
  });

  // Fetch academic data
  const { data: programsData } = useProgramsSWR({ page_size: DROPDOWN_PAGE_SIZE, is_active: true });
  const { data: academicYearsData } = useAcademicYears({ page_size: DROPDOWN_PAGE_SIZE });
  const { data: studentsData } = useStudents({ page_size: DROPDOWN_PAGE_SIZE, is_active: true });

  const programs = programsData?.results || [];
  const academicYears = academicYearsData?.results || [];
  const students = studentsData?.results || [];

  const feeGroupMode = watch('feeGroupMode');
  const feeTypeMode = watch('feeTypeMode');
  const feeMasterMode = watch('feeMasterMode');
  const selectedFeeGroupId = watch('existingFeeGroupId');
  const amount = watch('amount');
  const paidAmount = watch('paid_amount');

  // SWR hook for fee types — conditional on selectedFeeGroupId (pass null to prevent fetching ALL)
  const { data: feeTypesData, isLoading: loadingFeeTypes } = useFeeTypesSWR(
    feeGroupMode === 'existing' && selectedFeeGroupId
      ? { fee_group: selectedFeeGroupId, page_size: DROPDOWN_PAGE_SIZE, is_active: true }
      : null
  );

  // Derive arrays from SWR data
  const existingFeeGroups = feeGroupsData?.results || [];
  const existingFeeTypes = feeTypesData?.results || [];
  const existingFeeMasters = feeMastersData?.results || [];

  // Reset fee type selection when fee group changes
  useEffect(() => {
    if (!(feeGroupMode === 'existing' && selectedFeeGroupId)) {
      setValue('existingFeeTypeId', null);
    }
  }, [feeGroupMode, selectedFeeGroupId, setValue]);

  // Auto-calculate balance
  useEffect(() => {
    const amountValue = parseFloat(amount || '0');
    const paidValue = parseFloat(paidAmount || '0');
    const balance = (amountValue - paidValue).toFixed(2);
    setValue('balance', balance);
  }, [amount, paidAmount, setValue]);

  // Load draft on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('FEE_STRUCTURE_CREATION_DRAFT');
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        if (parsed) {
          reset(parsed);
        }
      } catch (error) {
        // Failed to load draft
      }
    }
  }, [reset]);

  // Save draft on change
  useEffect(() => {
    const subscription = watch((value) => {
      localStorage.setItem('FEE_STRUCTURE_CREATION_DRAFT', JSON.stringify(value));
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  // Save current step on change
  useEffect(() => {
    localStorage.setItem('FEE_STRUCTURE_CREATION_STEP', currentStep.toString());
  }, [currentStep]);

  // Step validation
  const validateStep1 = async () => {
    const mode = watch('feeGroupMode');

    if (mode === 'existing') {
      const existingFeeGroupId = watch('existingFeeGroupId');
      if (!existingFeeGroupId) {
        toast.error('Please select an existing fee group');
        return false;
      }
      return true;
    } else {
      // Validate fee group creation fields
      const isValid = await trigger([
        'feeGroup_name',
        'feeGroup_code',
      ]);

      const name = watch('feeGroup_name');
      const code = watch('feeGroup_code');
      if (!name || name.trim().length === 0) {
        toast.error('Fee group name is required');
        return false;
      }
      if (!code || code.trim().length === 0) {
        toast.error('Fee group code is required');
        return false;
      }

      return isValid;
    }
  };

  const validateStep2 = async () => {
    const mode = watch('feeTypeMode');

    if (mode === 'existing') {
      const existingFeeTypeId = watch('existingFeeTypeId');
      if (!existingFeeTypeId) {
        toast.error('Please select an existing fee type');
        return false;
      }
      return true;
    } else {
      // Validate fee type creation fields
      const isValid = await trigger([
        'feeType_name',
        'feeType_code',
      ]);

      const name = watch('feeType_name');
      const code = watch('feeType_code');
      if (!name || name.trim().length === 0) {
        toast.error('Fee type name is required');
        return false;
      }
      if (!code || code.trim().length === 0) {
        toast.error('Fee type code is required');
        return false;
      }

      return isValid;
    }
  };

  const validateStep3 = async () => {
    const mode = watch('feeMasterMode');

    if (mode === 'existing') {
      const existingFeeMasterId = watch('existingFeeMasterId');
      if (!existingFeeMasterId) {
        toast.error('Please select an existing fee master');
        return false;
      }
      return true;
    } else {
      // Validate fee master creation fields
      const isValid = await trigger([
        'feeMaster_program',
        'feeMaster_academic_year',
        'feeMaster_semester',
        'feeMaster_amount',
      ]);

      const program = watch('feeMaster_program');
      const academicYear = watch('feeMaster_academic_year');
      if (!program) {
        toast.error('Please select a program for the fee master');
        return false;
      }
      if (!academicYear) {
        toast.error('Please select an academic year for the fee master');
        return false;
      }

      return isValid;
    }
  };

  const validateStep4 = async () => {
    const isValid = await trigger(['student', 'amount', 'due_date']);

    const student = watch('student');
    if (!student) {
      toast.error('Please select a student');
      return false;
    }

    return isValid;
  };

  const handleNext = async () => {
    let canProceed = false;

    if (currentStep === 1) {
      canProceed = await validateStep1();
    } else if (currentStep === 2) {
      canProceed = await validateStep2();
    } else if (currentStep === 3) {
      canProceed = await validateStep3();
    } else if (currentStep === 4) {
      canProceed = await validateStep4();
    }

    if (canProceed) {
      setDirection(1);
      setCurrentStep((prev) => Math.min(prev + 1, 4) as StepType);
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

  const handleFinalSubmit = handleSubmit(async (data) => {
    try {
      setIsSubmitting(true);

      let feeGroupId: number;
      let feeTypeId: number;
      let feeMasterId: number;
      const collegeId = data.college ?? getCurrentUserCollege(user as any);

      if (!collegeId) {
        throw new Error('College is required');
      }

      // Step 1: Handle Fee Group (create or use existing)
      if (data.feeGroupMode === 'existing') {
        feeGroupId = data.existingFeeGroupId!;
        toast.info('Using existing fee group...');
      } else {
        toast.info('Creating fee group...');
        const feeGroupData: FeeGroupCreateInput = {
          name: data.feeGroup_name.trim(),
          code: data.feeGroup_code.trim(),
          description: data.feeGroup_description || null,
          college: Number(collegeId),
          is_active: true,
        };

        const createdFeeGroup = await feeGroupsApi.create(feeGroupData);
        if (!createdFeeGroup || !createdFeeGroup.id) {
          throw new Error('Failed to create fee group');
        }
        feeGroupId = createdFeeGroup.id;
        toast.success('Fee group created successfully');
      }

      // Step 2: Handle Fee Type (create or use existing)
      if (data.feeTypeMode === 'existing') {
        feeTypeId = data.existingFeeTypeId!;
        toast.info('Using existing fee type...');
      } else {
        toast.info('Creating fee type...');
        const feeTypeData: FeeTypeCreateInput = {
          fee_group: feeGroupId,
          name: data.feeType_name.trim(),
          code: data.feeType_code.trim(),
          description: data.feeType_description || null,
          college: Number(collegeId),
          is_active: true,
        };

        const createdFeeType = await feeTypesApi.create(feeTypeData);
        if (!createdFeeType || !createdFeeType.id) {
          throw new Error('Failed to create fee type');
        }
        feeTypeId = createdFeeType.id;
        toast.success('Fee type created successfully');
      }

      // Step 3: Handle Fee Master (create or use existing)
      if (data.feeMasterMode === 'existing') {
        feeMasterId = data.existingFeeMasterId!;
        toast.info('Using existing fee master...');
      } else {
        toast.info('Creating fee master...');
        const feeMasterData: FeeMasterCreateInput = {
          program: Number(data.feeMaster_program),
          academic_year: Number(data.feeMaster_academic_year),
          fee_type: feeTypeId,
          semester: Number(data.feeMaster_semester),
          amount: data.feeMaster_amount,
          college: Number(collegeId),
          is_active: true,
        };

        const createdFeeMaster = await feeMastersApi.create(feeMasterData);
        if (!createdFeeMaster || !createdFeeMaster.id) {
          throw new Error('Failed to create fee master');
        }
        feeMasterId = createdFeeMaster.id;
        toast.success('Fee master created successfully');
      }

      // Step 4: Create Fee Structure
      toast.info('Creating fee structure...');
      const feeStructureData: FeeStructureCreateInput = {
        student: Number(data.student),
        fee_master: feeMasterId,
        amount: data.amount,
        due_date: data.due_date,
        is_paid: data.is_paid,
        paid_amount: data.paid_amount,
        balance: data.balance,
        is_active: data.is_active,
      };

      await feeStructuresApi.create(feeStructureData);
      toast.success('Fee structure created successfully!');

      // Clear draft
      localStorage.removeItem('FEE_STRUCTURE_CREATION_DRAFT');
      localStorage.removeItem('FEE_STRUCTURE_CREATION_STEP');

      // Call parent onSubmit
      onSubmit(feeStructureData);
    } catch (err: any) {
      toast.error(typeof err.message === 'string' ? err.message : 'Failed to create fee structure');
    } finally {
      setIsSubmitting(false);
    }
  });

  const steps = [
    { number: 1, title: 'Fee Group', icon: Layers, description: 'Select or create fee group' },
    { number: 2, title: 'Fee Type', icon: Tag, description: 'Select or create fee type' },
    { number: 3, title: 'Fee Master', icon: IndianRupee, description: 'Select or create fee master' },
    { number: 4, title: 'Student', icon: User, description: 'Review & assign' },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header with progress */}
      <div className="border-b bg-muted/30 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Create Fee Structure</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Step {currentStep} of {steps.length}: {steps[currentStep - 1].description}
            </p>
          </div>
          <Button variant="ghost" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between gap-2">
          {steps.map((step, idx) => {
            const StepIcon = step.icon;
            const isCompleted = step.number < currentStep;
            const isCurrent = step.number === currentStep;

            return (
              <div key={step.number} className="flex items-center flex-1">
                <button
                  onClick={() => goToStep(step.number as StepType)}
                  className={`flex items-center gap-3 w-full transition-colors ${isCurrent ? 'text-primary' : isCompleted ? 'text-primary/70' : 'text-muted-foreground'
                    }`}
                  disabled={isSubmitting}
                >
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${isCurrent
                        ? 'border-primary bg-primary text-primary-foreground'
                        : isCompleted
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-muted-foreground/30 bg-background'
                      }`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <StepIcon className="h-5 w-5" />
                    )}
                  </div>
                  <div className="text-left hidden sm:block">
                    <div className="text-sm font-medium">{step.title}</div>
                  </div>
                </button>
                {idx < steps.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 mx-2 transition-colors ${isCompleted ? 'bg-primary' : 'bg-muted-foreground/20'
                      }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="max-w-3xl mx-auto"
          >
            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Layers className="h-5 w-5" />
                    Fee Group Selection
                  </CardTitle>
                  <CardDescription>
                    Choose an existing fee group or create a new one
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Fee Group Mode Selection */}
                  <div className="space-y-3">
                    <Label>Fee Group Option</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <label
                        className={`flex flex-col items-center justify-between rounded-md border-2 p-4 cursor-pointer transition-colors ${feeGroupMode === 'existing'
                            ? 'border-primary bg-primary/5'
                            : 'border-muted bg-popover hover:bg-accent'
                          }`}
                      >
                        <input
                          type="radio"
                          value="existing"
                          {...register('feeGroupMode')}
                          className="sr-only"
                        />
                        <Layers className="mb-3 h-6 w-6" />
                        <div className="text-center">
                          <div className="font-semibold">Existing Group</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Select from existing fee groups
                          </div>
                        </div>
                      </label>
                      <label
                        className={`flex flex-col items-center justify-between rounded-md border-2 p-4 cursor-pointer transition-colors ${feeGroupMode === 'create'
                            ? 'border-primary bg-primary/5'
                            : 'border-muted bg-popover hover:bg-accent'
                          }`}
                      >
                        <input
                          type="radio"
                          value="create"
                          {...register('feeGroupMode')}
                          className="sr-only"
                        />
                        <Tag className="mb-3 h-6 w-6" />
                        <div className="text-center">
                          <div className="font-semibold">New Group</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Create a new fee group
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>

                  <Separator />

                  {feeGroupMode === 'existing' ? (
                    // Existing Fee Group Selection
                    <div className="space-y-2">
                      <Label htmlFor="existingFeeGroup">
                        Select Fee Group <span className="text-destructive">*</span>
                      </Label>
                      <Controller
                        name="existingFeeGroupId"
                        control={control}
                        render={({ field }) => (
                          <Select
                            value={field.value?.toString() || ''}
                            onValueChange={(v) => field.onChange(parseInt(v))}
                          >
                            <SelectTrigger id="existingFeeGroup">
                              <SelectValue
                                placeholder={
                                  loadingFeeGroups
                                    ? 'Loading fee groups...'
                                    : existingFeeGroups.length === 0
                                      ? 'No fee groups available - create a new one'
                                      : 'Select a fee group'
                                }
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {existingFeeGroups.map((group) => (
                                <SelectItem key={group.id} value={group.id.toString()}>
                                  {group.name} ({group.code})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {existingFeeGroups.length === 0 && !loadingFeeGroups && (
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            No fee groups found. Please switch to "New Group" mode to create one.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  ) : (
                    // New Fee Group Creation Form
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="feeGroup_name">
                          Group Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="feeGroup_name"
                          {...register('feeGroup_name', { required: true })}
                          placeholder="e.g., Tuition Fees, Examination Fees"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="feeGroup_code">
                          Group Code <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="feeGroup_code"
                          {...register('feeGroup_code', { required: true })}
                          placeholder="e.g., TF, EF"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="feeGroup_description">Description</Label>
                        <Textarea
                          id="feeGroup_description"
                          {...register('feeGroup_description')}
                          placeholder="Optional description"
                          rows={3}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {currentStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="h-5 w-5" />
                    Fee Type Selection
                  </CardTitle>
                  <CardDescription>
                    Choose an existing fee type or create a new one
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Fee Type Mode Selection */}
                  <div className="space-y-3">
                    <Label>Fee Type Option</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <label
                        className={`flex flex-col items-center justify-between rounded-md border-2 p-4 cursor-pointer transition-colors ${feeTypeMode === 'existing'
                            ? 'border-primary bg-primary/5'
                            : 'border-muted bg-popover hover:bg-accent'
                          }`}
                      >
                        <input
                          type="radio"
                          value="existing"
                          {...register('feeTypeMode')}
                          className="sr-only"
                        />
                        <Tag className="mb-3 h-6 w-6" />
                        <div className="text-center">
                          <div className="font-semibold">Existing Type</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Select from existing fee types
                          </div>
                        </div>
                      </label>
                      <label
                        className={`flex flex-col items-center justify-between rounded-md border-2 p-4 cursor-pointer transition-colors ${feeTypeMode === 'create'
                            ? 'border-primary bg-primary/5'
                            : 'border-muted bg-popover hover:bg-accent'
                          }`}
                      >
                        <input
                          type="radio"
                          value="create"
                          {...register('feeTypeMode')}
                          className="sr-only"
                        />
                        <CreditCard className="mb-3 h-6 w-6" />
                        <div className="text-center">
                          <div className="font-semibold">New Type</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Create a new fee type
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>

                  <Separator />

                  {feeTypeMode === 'existing' ? (
                    // Existing Fee Type Selection
                    <div className="space-y-2">
                      <Label htmlFor="existingFeeType">
                        Select Fee Type <span className="text-destructive">*</span>
                      </Label>
                      <Controller
                        name="existingFeeTypeId"
                        control={control}
                        render={({ field }) => (
                          <Select
                            value={field.value?.toString() || ''}
                            onValueChange={(v) => field.onChange(parseInt(v))}
                          >
                            <SelectTrigger id="existingFeeType">
                              <SelectValue
                                placeholder={
                                  loadingFeeTypes
                                    ? 'Loading fee types...'
                                    : !selectedFeeGroupId
                                      ? 'Please select a fee group first'
                                      : existingFeeTypes.length === 0
                                        ? 'No fee types available - create a new one'
                                        : 'Select a fee type'
                                }
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {existingFeeTypes.map((type) => (
                                <SelectItem key={type.id} value={type.id.toString()}>
                                  {type.name} ({type.code})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {feeGroupMode === 'existing' && existingFeeTypes.length === 0 && !loadingFeeTypes && selectedFeeGroupId && (
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            No fee types found for this group. Please switch to "New Type" mode to create one.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  ) : (
                    // New Fee Type Creation Form
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="feeType_name">
                          Type Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="feeType_name"
                          {...register('feeType_name', { required: true })}
                          placeholder="e.g., Semester Fee, Lab Fee"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="feeType_code">
                          Type Code <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="feeType_code"
                          {...register('feeType_code', { required: true })}
                          placeholder="e.g., SF, LF"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="feeType_description">Description</Label>
                        <Textarea
                          id="feeType_description"
                          {...register('feeType_description')}
                          placeholder="Optional description"
                          rows={3}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {currentStep === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <IndianRupee className="h-5 w-5" />
                    Fee Master Selection
                  </CardTitle>
                  <CardDescription>
                    Choose an existing fee master or create a new one
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Fee Master Mode Selection */}
                  <div className="space-y-3">
                    <Label>Fee Master Option</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <label
                        className={`flex flex-col items-center justify-between rounded-md border-2 p-4 cursor-pointer transition-colors ${feeMasterMode === 'existing'
                            ? 'border-primary bg-primary/5'
                            : 'border-muted bg-popover hover:bg-accent'
                          }`}
                      >
                        <input
                          type="radio"
                          value="existing"
                          {...register('feeMasterMode')}
                          className="sr-only"
                        />
                        <IndianRupee className="mb-3 h-6 w-6" />
                        <div className="text-center">
                          <div className="font-semibold">Existing Master</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Select from existing fee masters
                          </div>
                        </div>
                      </label>
                      <label
                        className={`flex flex-col items-center justify-between rounded-md border-2 p-4 cursor-pointer transition-colors ${feeMasterMode === 'create'
                            ? 'border-primary bg-primary/5'
                            : 'border-muted bg-popover hover:bg-accent'
                          }`}
                      >
                        <input
                          type="radio"
                          value="create"
                          {...register('feeMasterMode')}
                          className="sr-only"
                        />
                        <BookOpen className="mb-3 h-6 w-6" />
                        <div className="text-center">
                          <div className="font-semibold">New Master</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Create a new fee master
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>

                  <Separator />

                  {feeMasterMode === 'existing' ? (
                    // Existing Fee Master Selection
                    <div className="space-y-2">
                      <Label htmlFor="existingFeeMaster">
                        Select Fee Master <span className="text-destructive">*</span>
                      </Label>
                      <Controller
                        name="existingFeeMasterId"
                        control={control}
                        render={({ field }) => (
                          <Select
                            value={field.value?.toString() || ''}
                            onValueChange={(v) => field.onChange(parseInt(v))}
                          >
                            <SelectTrigger id="existingFeeMaster">
                              <SelectValue
                                placeholder={
                                  loadingFeeMasters
                                    ? 'Loading fee masters...'
                                    : existingFeeMasters.length === 0
                                      ? 'No fee masters available - create a new one'
                                      : 'Select a fee master'
                                }
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {existingFeeMasters.map((master) => (
                                <SelectItem key={master.id} value={master.id.toString()}>
                                  {master.fee_type_name} - Sem {master.semester} - ₹{master.amount}
                                  {master.program_name && ` (${master.program_name})`}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {existingFeeMasters.length === 0 && !loadingFeeMasters && (
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            No fee masters found. Please switch to "New Master" mode to create one.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  ) : (
                    // New Fee Master Creation Form
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="feeMaster_program">
                          Program <span className="text-destructive">*</span>
                        </Label>
                        <Controller
                          name="feeMaster_program"
                          control={control}
                          render={({ field }) => (
                            <Select
                              value={field.value?.toString() || ''}
                              onValueChange={(v) => field.onChange(parseInt(v))}
                            >
                              <SelectTrigger id="feeMaster_program">
                                <SelectValue placeholder="Select program" />
                              </SelectTrigger>
                              <SelectContent>
                                {programs.map((prog) => (
                                  <SelectItem key={prog.id} value={prog.id.toString()}>
                                    {prog.name} ({prog.code})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                        {programs.length === 0 && (
                          <p className="text-xs text-amber-600">
                            ⚠️ No programs found. Please create a program first.
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="feeMaster_academic_year">
                          Academic Year <span className="text-destructive">*</span>
                        </Label>
                        <Controller
                          name="feeMaster_academic_year"
                          control={control}
                          render={({ field }) => (
                            <Select
                              value={field.value?.toString() || ''}
                              onValueChange={(v) => field.onChange(parseInt(v))}
                            >
                              <SelectTrigger id="feeMaster_academic_year">
                                <SelectValue placeholder="Select academic year" />
                              </SelectTrigger>
                              <SelectContent>
                                {academicYears.map((year) => (
                                  <SelectItem key={year.id} value={year.id.toString()}>
                                    {year.year || `Academic Year ${year.id}`}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                        {academicYears.length === 0 && (
                          <p className="text-xs text-amber-600">
                            ⚠️ No academic years found. Please create an academic year first.
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="feeMaster_semester">
                            Semester <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="feeMaster_semester"
                            type="number"
                            min="1"
                            max="12"
                            {...register('feeMaster_semester', { required: true, valueAsNumber: true })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="feeMaster_amount">
                            Amount (₹) <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="feeMaster_amount"
                            type="number"
                            step="0.01"
                            min="0"
                            {...register('feeMaster_amount', { required: true })}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {currentStep === 4 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Student Selection & Review
                  </CardTitle>
                  <CardDescription>
                    Review your selections and assign to a student
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Review Summary */}
                  <div className="rounded-lg bg-muted/50 p-4 space-y-3">
                    <h4 className="font-semibold text-sm">Fee Structure Summary</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Fee Group:</span>{' '}
                        <span className="font-medium">
                          {feeGroupMode === 'existing'
                            ? existingFeeGroups.find((g) => g.id === watch('existingFeeGroupId'))?.name || 'Not selected'
                            : watch('feeGroup_name') || 'New group'}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Fee Type:</span>{' '}
                        <span className="font-medium">
                          {feeTypeMode === 'existing'
                            ? existingFeeTypes.find((t) => t.id === watch('existingFeeTypeId'))?.name || 'Not selected'
                            : watch('feeType_name') || 'New type'}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Fee Master:</span>{' '}
                        <span className="font-medium">
                          {feeMasterMode === 'existing'
                            ? existingFeeMasters.find((m) => m.id === watch('existingFeeMasterId'))?.fee_type_name || 'Not selected'
                            : 'New master'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Student & Fee Structure Details */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="student">
                        Student <span className="text-destructive">*</span>
                      </Label>
                      <Controller
                        name="student"
                        control={control}
                        render={({ field }) => (
                          <Select
                            value={field.value?.toString() || ''}
                            onValueChange={(v) => field.onChange(parseInt(v))}
                          >
                            <SelectTrigger id="student">
                              <SelectValue placeholder="Select student" />
                            </SelectTrigger>
                            <SelectContent>
                              {students.map((student) => (
                                <SelectItem key={student.id} value={student.id.toString()}>
                                  {student.full_name || `${student.first_name} ${student.last_name}`}
                                  {student.roll_number && ` (${student.roll_number})`}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {students.length === 0 && (
                        <p className="text-xs text-amber-600">
                          ⚠️ No students found. Please create a student first.
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="amount">
                          Amount (₹) <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="amount"
                          type="number"
                          step="0.01"
                          min="0"
                          {...register('amount', { required: true })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="due_date">
                          Due Date <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="due_date"
                          type="date"
                          {...register('due_date', { required: true })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="paid_amount">Paid Amount (₹)</Label>
                        <Input
                          id="paid_amount"
                          type="number"
                          step="0.01"
                          min="0"
                          {...register('paid_amount')}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="balance">Balance (₹)</Label>
                        <Input
                          id="balance"
                          type="number"
                          step="0.01"
                          {...register('balance')}
                          disabled
                          className="bg-gray-100"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between rounded-lg border p-4 bg-muted/50">
                      <div className="space-y-0.5">
                        <Label className="text-base">Paid Status</Label>
                        <p className="text-xs text-muted-foreground">
                          Mark if this fee is already paid
                        </p>
                      </div>
                      <Controller
                        name="is_paid"
                        control={control}
                        render={({ field }) => (
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        )}
                      />
                    </div>

                    <div className="flex items-center justify-between rounded-lg border p-4 bg-muted/50">
                      <div className="space-y-0.5">
                        <Label className="text-base">Active Status</Label>
                        <p className="text-xs text-muted-foreground">
                          Set whether this fee structure is active
                        </p>
                      </div>
                      <Controller
                        name="is_active"
                        control={control}
                        render={({ field }) => (
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        )}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer with navigation */}
      <div className="border-t p-6 bg-muted/30">
        <div className="flex justify-between gap-4 max-w-3xl mx-auto">
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1 || isSubmitting}
            className="w-32"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          {currentStep < 4 ? (
            <Button type="button" onClick={handleNext} disabled={isSubmitting} className="w-32">
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button type="button" onClick={handleFinalSubmit} disabled={isSubmitting} className="w-32">
              {isSubmitting ? 'Creating...' : 'Create Fee'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
