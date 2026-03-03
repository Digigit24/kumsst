/**
 * Class Teacher Creation Pipeline - Multi-step wizard for assigning Class Teachers
 * Steps: 1. Teacher Selection → 2. Class Selection → 3. Section Selection → 4. Assignment Details & Review
 *
 * This wizard streamlines the class teacher assignment process by allowing inline creation
 * of dependencies (teacher, class, section) if they don't exist yet.
 */

import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  BookOpen,
  Calendar,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Layers,
  User,
  UserCircle,
  Users
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { DROPDOWN_PAGE_SIZE } from '../../../config/app.config';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Separator } from '../../../components/ui/separator';
import { Switch } from '../../../components/ui/switch';
import { useSuperAdminContext } from '../../../contexts/SuperAdminContext';
import { useAllSectionsSWR, useClassesSWR, useProgramsSWR } from '../../../hooks/useAcademicSWR';
import { useTeachersSWR } from '../../../hooks/useAccountsSWR';
import { useAuth } from '../../../hooks/useAuth';
import { useAcademicSessionsSWR } from '../../../hooks/useCoreSWR';
import { classTeacherApi } from '../../../services/academic.service';
import { getCurrentUserCollege, isSuperAdmin } from '../../../utils/auth.utils';

interface ClassTeacherCreationPipelineProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

type StepType = 1 | 2 | 3 | 4;

type ClassTeacherFormValues = {
  // Step 1: Teacher Selection
  teacherId: string;
  teacherMode: 'existing' | 'create';

  // Teacher Creation Fields
  teacher_first_name?: string;
  teacher_last_name?: string;
  teacher_username?: string;
  teacher_email?: string;
  teacher_password?: string;
  teacher_confirmPassword?: string;
  teacher_phone?: string;
  teacher_gender?: string;
  teacher_date_of_birth?: string;

  existingTeacherId?: number;

  // Step 2: Class Selection
  classId: number | null;
  classMode: 'existing' | 'create';
  existingClassId?: number;

  // Class Creation Fields
  class_program?: number;
  class_name?: string;
  class_code?: string;
  class_start_date?: string;
  class_end_date?: string;
  class_is_active?: boolean;
  class_semester?: number; // Added
  class_year?: number;     // Added
  class_max_students?: number; // Added

  // Step 3: Section Selection
  sectionId: number | null;
  sectionMode: 'existing' | 'create';
  existingSectionId?: number;

  // Section Creation Fields
  section_name?: string;
  section_max_students?: number;

  // Step 4: Assignment Details
  academic_session: number | null;
  assigned_from: string;
  assigned_to: string;
  is_active: boolean;
  college: number | null;
};

const GENDERS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

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

export const ClassTeacherCreationPipeline = ({ onSubmit, onCancel }: ClassTeacherCreationPipelineProps) => {
  const [currentStep, setCurrentStep] = useState<StepType>(() => {
    const savedStep = localStorage.getItem('CLASS_TEACHER_CREATION_STEP');
    return savedStep ? (parseInt(savedStep) as StepType) : 1;
  });
  const [direction, setDirection] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Inline creation modal states
  const [showClassModal, setShowClassModal] = useState(false);
  const [showSectionModal, setShowSectionModal] = useState(false);

  const { user } = useAuth();
  const { selectedCollege } = useSuperAdminContext();

  const { register, handleSubmit, formState: { errors }, control, watch, setValue, trigger, reset } = useForm<ClassTeacherFormValues>({
    defaultValues: {
      teacherId: '',
      teacherMode: 'existing',
      classId: null,
      classMode: 'existing',
      sectionId: null,
      sectionMode: 'existing',
      academic_session: null,
      assigned_from: new Date().toISOString().split('T')[0],
      assigned_to: '',
      is_active: true,
      college: (selectedCollege ?? getCurrentUserCollege(user as any)) || null,
    },
    mode: 'onChange',
  });

  // Fetch data using SWR hooks (cached and shared across components)
  const { results: programs = [] } = useProgramsSWR({ page_size: DROPDOWN_PAGE_SIZE, is_active: true });
  const { results: sessions = [] } = useAcademicSessionsSWR({ page_size: DROPDOWN_PAGE_SIZE });
  const { results: classes = [], refresh: refetchClasses, isLoading: loadingClasses } = useClassesSWR({ page_size: DROPDOWN_PAGE_SIZE, is_active: true });
  // Use shared prefetched sections cache
  const { results: allSections = [], refresh: refetchSections, isLoading: loadingSections } = useAllSectionsSWR();
  const { results: teachers = [], isLoading: loadingTeachers } = useTeachersSWR({ page_size: DROPDOWN_PAGE_SIZE, is_active: true });

  // Watch form values
  const selectedClassId = watch('classId');
  const selectedTeacherId = watch('teacherId');

  // Define modes for steps
  const teacherMode = watch('teacherMode');
  const classMode = watch('classMode');
  const sectionMode = watch('sectionMode');

  // Derived lists
  const existingTeachers = teachers;
  const existingClasses = classes;
  const existingSections = selectedClassId
    ? allSections.filter(section => section.class_obj === selectedClassId)
    : [];

  // Filter sections based on selected class
  const filteredSections = selectedClassId
    ? allSections.filter(section => section.class_obj === selectedClassId)
    : [];

  // Clear section when class changes
  useEffect(() => {
    if (selectedClassId) {
      setValue('sectionId', null);
    }
  }, [selectedClassId, setValue]);

  // Inline creation success handlers
  const handleClassCreated = async (classId: number) => {
    await refetchClasses();
    setValue('classId', classId);
    setShowClassModal(false);
  };

  const handleSectionCreated = async (sectionId: number) => {
    await refetchSections();
    setValue('sectionId', sectionId);
    setShowSectionModal(false);
  };

  // Load draft on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('CLASS_TEACHER_CREATION_DRAFT');
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
      localStorage.setItem('CLASS_TEACHER_CREATION_DRAFT', JSON.stringify(value));
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  // Save current step on change
  useEffect(() => {
    localStorage.setItem('CLASS_TEACHER_CREATION_STEP', currentStep.toString());
  }, [currentStep]);

  // Step validation
  const validateStep1 = async () => {
    const mode = watch('teacherMode');
    if (mode === 'existing') {
      const teacherId = watch('existingTeacherId');
      if (!teacherId) {
        toast.error('Please select a teacher');
        return false;
      }
      setValue('teacherId', String(teacherId));
    } else {
      const isValid = await trigger(['teacher_first_name', 'teacher_last_name', 'teacher_username', 'teacher_email', 'teacher_password']);
      if (!isValid) return false;
    }
    return true;
  };

  const validateStep2 = async () => {
    const mode = watch('classMode');
    if (mode === 'existing') {
      const classId = watch('existingClassId');
      if (!classId) {
        toast.error('Please select a class');
        return false;
      }
      setValue('classId', classId);
    } else {
      const isValid = await trigger(['class_program', 'class_name']);
      if (!isValid) return false;
    }
    return true;
  };

  const validateStep3 = async () => {
    const mode = watch('sectionMode');
    if (mode === 'existing') {
      const sectionId = watch('existingSectionId');
      if (!sectionId) {
        toast.error('Please select a section');
        return false;
      }
      setValue('sectionId', sectionId);
    } else {
      const isValid = await trigger(['section_name']);
      if (!isValid) return false;
    }
    return true;
  };

  const validateStep4 = async () => {
    const isValid = await trigger(['academic_session', 'assigned_from']);

    const academicSession = watch('academic_session');
    if (!academicSession) {
      toast.error('Please select an academic session');
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

  const handleFinalSubmit = async () => {
    // Manually trigger validation and get form data
    const isValid = await validateStep4();
    if (!isValid) {
      return;
    }

    const data = watch();

    try {
      setIsSubmitting(true);

      // For super admins, use selectedCollege from context; for regular users, use their assigned college
      const collegeId = data.college ?? selectedCollege ?? getCurrentUserCollege(user as any);

      if (!collegeId) {
        throw new Error('College is required. Super admins must select a college from the header dropdown.');
      }

      // Create Class Teacher Assignment
      toast.info('Assigning class teacher...');
      const classTeacherData = {
        class_obj: Number(data.classId),
        section: Number(data.sectionId),
        teacher: data.teacherId,
        academic_session: Number(data.academic_session),
        assigned_from: data.assigned_from,
        assigned_to: data.assigned_to || null,
        is_active: data.is_active,
        college: Number(collegeId),
      };

      await classTeacherApi.create(classTeacherData);
      toast.success('Class teacher assigned successfully!');

      // Clear draft
      localStorage.removeItem('CLASS_TEACHER_CREATION_DRAFT');
      localStorage.removeItem('CLASS_TEACHER_CREATION_STEP');

      // Call parent onSubmit
      onSubmit(classTeacherData);
    } catch (err: any) {
      toast.error(typeof err.message === 'string' ? err.message : 'Failed to assign class teacher');
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { number: 1, title: 'Teacher', icon: UserCircle, description: 'Select or create teacher' },
    { number: 2, title: 'Class', icon: BookOpen, description: 'Select or create class' },
    { number: 3, title: 'Section', icon: Layers, description: 'Select or create section' },
    { number: 4, title: 'Assignment', icon: Calendar, description: 'Review & assign' },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header with progress */}
      <div className="border-b bg-muted/30 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Assign Class Teacher</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Step {currentStep} of {steps.length}: {steps[currentStep - 1].description}
            </p>
          </div>
          <Button variant="ghost" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        </div>

        {/* Super Admin College Selection Warning */}
        {isSuperAdmin(user as any) && !selectedCollege && (
          <Alert className="mb-4 border-amber-500 bg-amber-50">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <strong>College Not Selected:</strong> Please select a college from the dropdown in the header before creating a class teacher assignment.
            </AlertDescription>
          </Alert>
        )}

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
                    <UserCircle className="h-5 w-5" />
                    Teacher Selection
                  </CardTitle>
                  <CardDescription>
                    Choose an existing teacher or create a new teacher account
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-6">
                  {/* Teacher Mode Selection */}
                  <div className="space-y-3">
                    <Label>Teacher Account</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <label
                        className={`flex flex-col items-center justify-between rounded-md border-2 p-4 cursor-pointer transition-colors ${teacherMode === 'existing'
                          ? 'border-primary bg-primary/5'
                          : 'border-muted bg-popover hover:bg-accent'
                          }`}
                      >
                        <input
                          type="radio"
                          value="existing"
                          {...register('teacherMode')}
                          className="sr-only"
                        />
                        <Users className="mb-3 h-6 w-6" />
                        <div className="text-center">
                          <div className="font-semibold">Existing Teacher</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Select from existing teachers
                          </div>
                        </div>
                      </label>
                      <label
                        className={`flex flex-col items-center justify-between rounded-md border-2 p-4 cursor-pointer transition-colors ${teacherMode === 'create'
                          ? 'border-primary bg-primary/5'
                          : 'border-muted bg-popover hover:bg-accent'
                          }`}
                      >
                        <input
                          type="radio"
                          value="create"
                          {...register('teacherMode')}
                          className="sr-only"
                        />
                        <User className="mb-3 h-6 w-6" />
                        <div className="text-center">
                          <div className="font-semibold">New Teacher</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Create a new teacher account
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>

                  <Separator />

                  {teacherMode === 'existing' ? (
                    // Existing Teacher Selection
                    <div className="space-y-2">
                      <Label htmlFor="existingTeacher">
                        Select Teacher <span className="text-destructive">*</span>
                      </Label>
                      <Controller
                        name="existingTeacherId"
                        control={control}
                        render={({ field }) => (
                          <Select value={field.value ? String(field.value) : undefined} onValueChange={field.onChange}>
                            <SelectTrigger id="existingTeacher">
                              <SelectValue
                                placeholder={
                                  loadingTeachers
                                    ? 'Loading teachers...'
                                    : existingTeachers.length === 0
                                      ? 'No teachers available - create a new one'
                                      : 'Select a teacher'
                                }
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {existingTeachers.map((teacher) => (
                                <SelectItem key={teacher.id} value={teacher.id}>
                                  {teacher.full_name || teacher.username}
                                  {teacher.email && ` (${teacher.email})`}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {existingTeachers.length === 0 && !loadingTeachers && (
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            No teachers found. Please switch to "New Teacher" mode to create one.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  ) : (
                    // New Teacher Creation Form
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="teacher_first_name">
                            First Name <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="teacher_first_name"
                            {...register('teacher_first_name', { required: true })}
                            placeholder="John"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="teacher_last_name">
                            Last Name <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="teacher_last_name"
                            {...register('teacher_last_name', { required: true })}
                            placeholder="Doe"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="teacher_username">
                          Username <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="teacher_username"
                          {...register('teacher_username', { required: true })}
                          placeholder="john.doe"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="teacher_email">
                          Email <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="teacher_email"
                          type="email"
                          {...register('teacher_email', { required: true })}
                          placeholder="john.doe@example.com"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="teacher_password">
                            Password <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="teacher_password"
                            type="password"
                            {...register('teacher_password', { required: true })}
                            placeholder="••••••••"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="teacher_confirmPassword">
                            Confirm Password <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="teacher_confirmPassword"
                            type="password"
                            {...register('teacher_confirmPassword', { required: true })}
                            placeholder="••••••••"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="teacher_phone">Phone</Label>
                          <Input
                            id="teacher_phone"
                            {...register('teacher_phone')}
                            placeholder="+1234567890"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="teacher_gender">Gender</Label>
                          <Controller
                            name="teacher_gender"
                            control={control}
                            render={({ field }) => (
                              <Select value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger id="teacher_gender">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {GENDERS.map((g) => (
                                    <SelectItem key={g.value} value={g.value}>
                                      {g.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="teacher_date_of_birth">Date of Birth</Label>
                        <Input
                          id="teacher_date_of_birth"
                          type="date"
                          {...register('teacher_date_of_birth')}
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
                    <BookOpen className="h-5 w-5" />
                    Class Selection
                  </CardTitle>
                  <CardDescription>
                    Choose an existing class or create a new one
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-6">
                  {/* Class Mode Selection */}
                  <div className="space-y-3">
                    <Label>Class Option</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <label
                        className={`flex flex-col items-center justify-between rounded-md border-2 p-4 cursor-pointer transition-colors ${classMode === 'existing'
                          ? 'border-primary bg-primary/5'
                          : 'border-muted bg-popover hover:bg-accent'
                          }`}
                      >
                        <input
                          type="radio"
                          value="existing"
                          {...register('classMode')}
                          className="sr-only"
                        />
                        <BookOpen className="mb-3 h-6 w-6" />
                        <div className="text-center">
                          <div className="font-semibold">Existing Class</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Select from existing classes
                          </div>
                        </div>
                      </label>
                      <label
                        className={`flex flex-col items-center justify-between rounded-md border-2 p-4 cursor-pointer transition-colors ${classMode === 'create'
                          ? 'border-primary bg-primary/5'
                          : 'border-muted bg-popover hover:bg-accent'
                          }`}
                      >
                        <input
                          type="radio"
                          value="create"
                          {...register('classMode')}
                          className="sr-only"
                        />
                        <GraduationCap className="mb-3 h-6 w-6" />
                        <div className="text-center">
                          <div className="font-semibold">New Class</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Create a new class
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>

                  <Separator />

                  {classMode === 'existing' ? (
                    // Existing Class Selection
                    <div className="space-y-2">
                      <Label htmlFor="existingClass">
                        Select Class <span className="text-destructive">*</span>
                      </Label>
                      <Controller
                        name="existingClassId"
                        control={control}
                        render={({ field }) => (
                          <Select
                            value={field.value?.toString() || ''}
                            onValueChange={(v) => field.onChange(parseInt(v))}
                          >
                            <SelectTrigger id="existingClass">
                              <SelectValue
                                placeholder={
                                  loadingClasses
                                    ? 'Loading classes...'
                                    : existingClasses.length === 0
                                      ? 'No classes available - create a new one'
                                      : 'Select a class'
                                }
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {existingClasses.map((cls) => (
                                <SelectItem key={cls.id} value={cls.id.toString()}>
                                  {cls.name} - {cls.program_name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {existingClasses.length === 0 && !loadingClasses && (
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            No classes found. Please switch to "New Class" mode to create one.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  ) : (
                    // New Class Creation Form
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="class_program">
                          Program <span className="text-destructive">*</span>
                        </Label>
                        <Controller
                          name="class_program"
                          control={control}
                          render={({ field }) => (
                            <Select
                              value={field.value?.toString() || ''}
                              onValueChange={(v) => field.onChange(parseInt(v))}
                            >
                              <SelectTrigger id="class_program">
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
                        <Label htmlFor="class_name">
                          Class Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="class_name"
                          {...register('class_name', { required: true })}
                          placeholder="e.g., BCA 2024 Batch"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="class_semester">
                            Semester <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="class_semester"
                            type="number"
                            min="1"
                            max="12"
                            {...register('class_semester', { required: true, valueAsNumber: true })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="class_year">
                            Year <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="class_year"
                            type="number"
                            min="1"
                            max="6"
                            {...register('class_year', { required: true, valueAsNumber: true })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="class_max_students">Max Students</Label>
                          <Input
                            id="class_max_students"
                            type="number"
                            min="1"
                            {...register('class_max_students', { valueAsNumber: true })}
                          />
                        </div>
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
                    <Layers className="h-5 w-5" />
                    Section Selection
                  </CardTitle>
                  <CardDescription>
                    Choose an existing section or create a new one for the selected class
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-6">
                  {/* Section Mode Selection */}
                  <div className="space-y-3">
                    <Label>Section Option</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <label
                        className={`flex flex-col items-center justify-between rounded-md border-2 p-4 cursor-pointer transition-colors ${sectionMode === 'existing'
                          ? 'border-primary bg-primary/5'
                          : 'border-muted bg-popover hover:bg-accent'
                          }`}
                      >
                        <input
                          type="radio"
                          value="existing"
                          {...register('sectionMode')}
                          className="sr-only"
                        />
                        <Layers className="mb-3 h-6 w-6" />
                        <div className="text-center">
                          <div className="font-semibold">Existing Section</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Select from existing sections
                          </div>
                        </div>
                      </label>
                      <label
                        className={`flex flex-col items-center justify-between rounded-md border-2 p-4 cursor-pointer transition-colors ${sectionMode === 'create'
                          ? 'border-primary bg-primary/5'
                          : 'border-muted bg-popover hover:bg-accent'
                          }`}
                      >
                        <input
                          type="radio"
                          value="create"
                          {...register('sectionMode')}
                          className="sr-only"
                        />
                        <Layers className="mb-3 h-6 w-6" />
                        <div className="text-center">
                          <div className="font-semibold">New Section</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Create a new section
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>

                  <Separator />

                  {sectionMode === 'existing' ? (
                    // Existing Section Selection
                    <div className="space-y-2">
                      <Label htmlFor="existingSection">
                        Select Section <span className="text-destructive">*</span>
                      </Label>
                      <Controller
                        name="existingSectionId"
                        control={control}
                        render={({ field }) => (
                          <Select
                            value={field.value?.toString() || ''}
                            onValueChange={(v) => field.onChange(parseInt(v))}
                          >
                            <SelectTrigger id="existingSection">
                              <SelectValue
                                placeholder={
                                  loadingSections
                                    ? 'Loading sections...'
                                    : !selectedClassId
                                      ? 'Please select a class first'
                                      : existingSections.length === 0
                                        ? 'No sections available - create a new one'
                                        : 'Select a section'
                                }
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {existingSections.map((sec) => (
                                <SelectItem key={sec.id} value={sec.id.toString()}>
                                  {sec.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {classMode === 'existing' && existingSections.length === 0 && !loadingSections && selectedClassId && (
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            No sections found for this class. Please switch to "New Section" mode to create one.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  ) : (
                    // New Section Creation Form
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="section_name">
                          Section Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="section_name"
                          {...register('section_name', { required: true })}
                          placeholder="e.g., Section A, Morning Batch"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="section_max_students">Maximum Students</Label>
                        <Input
                          id="section_max_students"
                          type="number"
                          min="1"
                          {...register('section_max_students', { valueAsNumber: true })}
                        />
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
                    <Calendar className="h-5 w-5" />
                    Assignment Details & Review
                  </CardTitle>
                  <CardDescription>
                    Review your selections and set assignment details
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-6">
                  {/* Review Summary */}
                  <div className="rounded-lg bg-muted/50 p-4 space-y-3">
                    <h4 className="font-semibold text-sm">Assignment Summary</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Teacher:</span>{' '}
                        <span className="font-medium">
                          {teacherMode === 'existing'
                            ? existingTeachers.find((t) => t.id === String(watch('existingTeacherId')))?.full_name || 'Not selected'
                            : `${watch('teacher_first_name')} ${watch('teacher_last_name')}` || 'New teacher'}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Class:</span>{' '}
                        <span className="font-medium">
                          {classMode === 'existing'
                            ? existingClasses.find((c) => c.id === watch('existingClassId'))?.name || 'Not selected'
                            : watch('class_name') || 'New class'}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Section:</span>{' '}
                        <span className="font-medium">
                          {sectionMode === 'existing'
                            ? existingSections.find((s) => s.id === watch('existingSectionId'))?.name || 'Not selected'
                            : watch('section_name') || 'New section'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Assignment Details */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="academic_session">
                        Academic Session <span className="text-destructive">*</span>
                      </Label>
                      <Controller
                        name="academic_session"
                        control={control}
                        render={({ field }) => (
                          <Select
                            value={field.value?.toString() || ''}
                            onValueChange={(v) => field.onChange(parseInt(v))}
                          >
                            <SelectTrigger id="academic_session">
                              <SelectValue placeholder="Select academic session" />
                            </SelectTrigger>
                            <SelectContent>
                              {sessions.map((session) => (
                                <SelectItem key={session.id} value={session.id.toString()}>
                                  {session.name}
                                  {session.is_active && (
                                    <Badge variant="secondary" className="ml-2">
                                      Active
                                    </Badge>
                                  )}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="assigned_from">
                          Assignment Start Date <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="assigned_from"
                          type="date"
                          {...register('assigned_from', { required: true })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="assigned_to">
                          Assignment End Date <span className="text-muted-foreground text-xs">(Optional)</span>
                        </Label>
                        <Input
                          id="assigned_to"
                          type="date"
                          {...register('assigned_to')}
                          min={watch('assigned_from')}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between rounded-lg border p-4 bg-muted/50">
                      <div className="space-y-0.5">
                        <Label className="text-base">Active Status</Label>
                        <p className="text-xs text-muted-foreground">
                          Set whether this assignment is active
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
              {isSubmitting ? 'Assigning...' : 'Assign Teacher'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
