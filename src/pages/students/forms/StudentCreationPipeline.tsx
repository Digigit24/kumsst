/**
 * Student Creation Pipeline - Multi-step wizard for creating Students
 * Steps: 1. Account Details → 2. Personal Information → 3. Academic Details → 4. Contact Information → 5. Review & Submit
 *
 * This wizard streamlines the student creation process by combining user account creation
 * and student record creation into a single, guided workflow.
 */

import { AnimatePresence, motion } from 'framer-motion';
import {
    AlertCircle,
    CheckCircle,
    ChevronLeft,
    ChevronRight,
    Edit2,
    GraduationCap,
    Mail,
    User,
    UserCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { InlineCreateClass } from '../../../components/common/InlineCreateClass';
import { InlineCreateProgram } from '../../../components/common/InlineCreateProgram';
import { InlineCreateSection } from '../../../components/common/InlineCreateSection';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { SearchableSelectWithCreate } from '../../../components/ui/searchable-select-with-create';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { useSuperAdminContext } from '../../../contexts/SuperAdminContext';
import { invalidateClasses, invalidatePrograms, invalidateSections, useAllSectionsSWR, useClassesSWR, useProgramsSWR } from '../../../hooks/useAcademicSWR';
import { useUsers } from '../../../hooks/useAccounts';
import { useAuth } from '../../../hooks/useAuth';
import { useAcademicYearsSWR, useCollegesSWR } from '../../../hooks/useCoreSWR';
import { DROPDOWN_PAGE_SIZE } from '@/config/app.config';
import { studentApi } from '../../../services/students.service';
import { getCurrentUserCollege, isSuperAdmin } from '../../../utils/auth.utils';

interface StudentCreationPipelineProps {
    onSubmit: (data: any) => void;
    onCancel: () => void;
}

type StepType = 1 | 2 | 3 | 4 | 5;

type StudentCreationFormValues = {
    // Step 1: Account Details
    accountMode: 'create' | 'existing'; // New: choose between creating new user or linking existing
    existingUserId: string; // For linking existing user
    username: string;
    password: string;
    confirmPassword: string;
    email: string;
    college: number | null;

    // Step 2: Personal Information
    first_name: string;
    middle_name: string;
    last_name: string;
    date_of_birth: string;
    gender: string;
    blood_group: string;
    nationality: string;
    religion: string;
    caste: string;
    mother_tongue: string;
    aadhar_number: string;
    pan_number: string;

    // Step 3: Academic Details
    admission_number: string;
    admission_date: string;
    admission_type: string;
    registration_number: string;
    roll_number: string;
    program: number | null;
    current_class: number | null;
    current_section: number | null;
    academic_year: number | null;

    // Step 4: Contact Information
    phone: string;
    alternate_phone: string;
    photo: string | File | null;
};

const ADMISSION_TYPES = [
    { value: 'regular', label: 'Regular' },
    { value: 'lateral', label: 'Lateral Entry' },
    { value: 'transfer', label: 'Transfer' },
    { value: 'management', label: 'Management Quota' },
];

const GENDERS = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
];

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

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

export const StudentCreationPipeline = ({ onSubmit, onCancel }: StudentCreationPipelineProps) => {
    const [currentStep, setCurrentStep] = useState<StepType>(() => {
        const savedStep = localStorage.getItem('STUDENT_CREATION_STEP');
        return savedStep ? (parseInt(savedStep) as StepType) : 1;
    });
    const [direction, setDirection] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { user } = useAuth();
    const { selectedCollege } = useSuperAdminContext();
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // Get initial college - use global selection if super admin, otherwise use user's college
    const getInitialCollege = () => {
        if (isSuperAdmin(user as any)) {
            return selectedCollege;
        }
        return getCurrentUserCollege(user as any) || null;
    };

    const { register, handleSubmit, formState: { errors }, control, watch, setValue, trigger, reset } = useForm<StudentCreationFormValues>({
        defaultValues: {
            // Account Details
            accountMode: 'create',
            existingUserId: '',
            username: '',
            password: '',
            confirmPassword: '',
            email: '',
            college: getInitialCollege(),

            // Personal Information
            first_name: '',
            middle_name: '',
            last_name: '',
            date_of_birth: '',
            gender: 'male',
            blood_group: '',
            nationality: 'Indian',
            religion: '',
            caste: '',
            mother_tongue: '',
            aadhar_number: '',
            pan_number: '',

            // Academic Details
            admission_number: '',
            admission_date: new Date().toISOString().split('T')[0],
            admission_type: 'regular',
            registration_number: '',
            roll_number: '',
            program: null,
            current_class: null,
            current_section: null,
            academic_year: null,

            // Contact Information
            phone: '',
            alternate_phone: '',
            photo: null,
        },
        mode: 'onChange',
    });

    // Inline creation modal states
    const [showProgramModal, setShowProgramModal] = useState(false);
    const [showClassModal, setShowClassModal] = useState(false);
    const [showSectionModal, setShowSectionModal] = useState(false);

    // Fetch academic data — all using SWR hooks for shared cache across app
    const { results: programs = [] } = useProgramsSWR({ page_size: DROPDOWN_PAGE_SIZE, is_active: true });
    const { results: classes = [] } = useClassesSWR({ page_size: DROPDOWN_PAGE_SIZE, is_active: true });
    // Use shared prefetched sections cache
    const { results: sections = [] } = useAllSectionsSWR();
    const { results: years = [] } = useAcademicYearsSWR({ page_size: DROPDOWN_PAGE_SIZE });
    const { results: colleges = [] } = useCollegesSWR({ page_size: DROPDOWN_PAGE_SIZE });


    // Fetch existing student users for linking option
    const { data: studentUsersData, isLoading: isUsersLoading } = useUsers({
        user_type: 'student',
        page_size: DROPDOWN_PAGE_SIZE
    });

    const studentUsers = studentUsersData?.results || [];

    const accountMode = watch('accountMode');
    const selectedProgram = watch('program');
    const selectedClass = watch('current_class');
    const academicYearValue = watch('academic_year');

    // Inline creation success handlers — invalidate global cache so all components get fresh data
    const handleProgramCreated = async (programId: number) => {
        await invalidatePrograms();
        setValue('program', programId);
        setShowProgramModal(false);
    };

    const handleClassCreated = async (classId: number) => {
        await invalidateClasses();
        setValue('current_class', classId);
        setShowClassModal(false);
    };

    const handleSectionCreated = async (sectionId: number) => {
        await invalidateSections();
        setValue('current_section', sectionId);
        setShowSectionModal(false);
    };

    // Load draft on mount
    useEffect(() => {
        const savedDraft = localStorage.getItem('STUDENT_CREATION_DRAFT');
        const savedTimestamp = localStorage.getItem('STUDENT_CREATION_TIMESTAMP');

        if (savedDraft) {
            // Check for expiration (1 hour)
            if (savedTimestamp) {
                const now = Date.now();
                const diff = now - parseInt(savedTimestamp, 10);
                if (diff > 3600000) { // 1 hour
                    localStorage.removeItem('STUDENT_CREATION_DRAFT');
                    localStorage.removeItem('STUDENT_CREATION_STEP');
                    localStorage.removeItem('STUDENT_CREATION_TIMESTAMP');
                    return;
                }
            }

            try {
                const parsed = JSON.parse(savedDraft);
                if (parsed) {
                    reset(parsed);
                }
            } catch (error) {
                localStorage.removeItem('STUDENT_CREATION_DRAFT');
                localStorage.removeItem('STUDENT_CREATION_STEP');
                localStorage.removeItem('STUDENT_CREATION_TIMESTAMP');
            }
        }
    }, [reset]);

    // Save draft on change
    useEffect(() => {
        const subscription = watch((value) => {
            localStorage.setItem('STUDENT_CREATION_DRAFT', JSON.stringify(value));
            localStorage.setItem('STUDENT_CREATION_TIMESTAMP', String(Date.now()));
        });
        return () => subscription.unsubscribe();
    }, [watch]);

    // Save current step on change
    useEffect(() => {
        localStorage.setItem('STUDENT_CREATION_STEP', currentStep.toString());
    }, [currentStep]);

    // Auto-update college field when global selection changes (for super admins)
    useEffect(() => {
        if (isSuperAdmin(user as any) && selectedCollege !== undefined) {
            setValue('college', selectedCollege);
        }
    }, [selectedCollege, user, setValue]);

    // Default academic year to current (or first available) once loaded
    useEffect(() => {
        if (!academicYearValue && years.length) {
            const current = years.find((y: any) => y.is_current);
            const fallback = years[0];
            setValue('academic_year', (current?.id ?? fallback?.id) || null, { shouldValidate: true });
        }
    }, [academicYearValue, years, setValue]);

    // Manage photo preview URL
    const photoValue = watch('photo');
    useEffect(() => {
        if (photoValue instanceof File) {
            const url = URL.createObjectURL(photoValue);
            setPreviewUrl(url);
            return () => URL.revokeObjectURL(url);
        } else if (typeof photoValue === 'string' && photoValue) {
            setPreviewUrl(photoValue);
        } else {
            setPreviewUrl(null);
        }
    }, [photoValue]);

    // Step validation
    const validateStep1 = async () => {
        const mode = watch('accountMode');
        const college = watch('college');

        // Check if college is selected (for super admins)
        if (isSuperAdmin(user as any) && !college) {
            toast.error('Please select a college first', {
                description: 'Super admins must select a college before creating a student',
                duration: 5000,
            });
            return false;
        }

        if (mode === 'existing') {
            // For existing user, only validate user selection and college
            const isValid = await trigger(['existingUserId', 'college']);

            const existingUserId = watch('existingUserId');
            if (!existingUserId) {
                toast.error('Please select an existing user', {
                    description: 'You must select a user to link to this student record',
                });
                return false;
            }

            if (!isValid) {
                toast.error('Validation Error', {
                    description: 'Please fix the errors in the account selection step',
                });
            }

            return isValid;
        } else {
            // For new user, validate all account fields
            const isValid = await trigger([
                'username',
                'password',
                'confirmPassword',
                'email',
                'college',
            ]);

            // Check password match
            const password = watch('password');
            const confirmPassword = watch('confirmPassword');
            if (password !== confirmPassword) {
                toast.error('Passwords do not match', {
                    description: 'Please ensure both password fields are identical',
                });
                return false;
            }

            // Check password strength
            if (password.length < 8) {
                toast.error('Weak Password', {
                    description: 'Password must be at least 8 characters long',
                });
                return false;
            }

            if (!isValid) {
                toast.error('Incomplete Account Details', {
                    description: 'Please fill in all required account fields marked with *',
                });
            }

            return isValid;
        }
    };

    const validateStep2 = async () => {
        const isValid = await trigger([
            'first_name',
            'last_name',
            'date_of_birth',
            'gender',
        ]);

        if (!isValid) {
            toast.error('Incomplete Personal Details', {
                description: 'Please fill in all required personal information (Name, DOB, Gender).',
            });
        }
        return isValid;
    };

    const validateStep3 = async () => {
        const isValid = await trigger([
            'admission_date',
            'program',
            'academic_year',
        ]);

        if (!isValid) {
            toast.error('Incomplete Academic Details', {
                description: 'Please select a Program, Academic Year, and Admission Date.',
            });
        }
        return isValid;
    };

    const validateStep4 = async () => {
        const isValid = await trigger(['phone']);

        if (!isValid) {
            toast.error('Incomplete Contact Details', {
                description: 'A valid phone number is required for communication.',
            });
        }
        return isValid;
    };

    // Navigation handlers
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
            setCurrentStep((prev) => Math.min(prev + 1, 5) as StepType);
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
            const collegeId = data.college ?? getCurrentUserCollege(user as any);

            if (!collegeId) {
                toast.error('College is required');
                setIsSubmitting(false);
                return;
            }

            // Handle photo separately if it's a file
            const photoFile = data.photo instanceof File ? data.photo : null;

            // Construct payload
            const studentPayload: any = {
                college: Number(collegeId),
                // admission_number and registration_number are auto-generated
                admission_date: data.admission_date,
                admission_type: data.admission_type,
                roll_number: data.roll_number || null,
                program: Number(data.program),
                current_class: data.current_class ? Number(data.current_class) : null,
                current_section: data.current_section ? Number(data.current_section) : null,
                academic_year: Number(data.academic_year),
                first_name: data.first_name,
                middle_name: data.middle_name || null,
                last_name: data.last_name,
                date_of_birth: data.date_of_birth,
                gender: data.gender,
                blood_group: data.blood_group || null,
                email: data.email,
                phone: data.phone,
                alternate_phone: data.alternate_phone || null,
                photo: photoFile ? null : (data.photo as string || null),
                nationality: data.nationality,
                religion: data.religion || null,
                caste: data.caste || null,
                mother_tongue: data.mother_tongue || null,
                aadhar_number: data.aadhar_number || null,
                pan_number: data.pan_number || null,
                is_active: true,
                is_alumni: false,
            };

            if (data.accountMode === 'existing') {
                // Use existing user
                studentPayload.user = data.existingUserId;
                toast.info('Creating student record for existing user...');
            } else {
                // Create new user (nested)
                // Omit 'user' field, include 'user_data'
                studentPayload.user_data = {
                    username: data.username.toLowerCase().trim(),
                    password: data.password,
                    password_confirm: data.password,
                    email: data.email,
                    first_name: data.first_name,
                    middle_name: data.middle_name || null,
                    last_name: data.last_name,
                    user_type: 'student',
                    college: Number(collegeId),
                    phone: data.phone,
                    gender: data.gender,
                    date_of_birth: data.date_of_birth || null,
                    is_active: true,
                };
                toast.info('Creating student and user account...');
            }

            // Single API call
            const finalStudent = await studentApi.create(studentPayload);

            // Upload photo if present (Step 2)
            if (photoFile) {
                try {
                    const formData = new FormData();
                    formData.append('photo', photoFile);
                    await studentApi.patch(finalStudent.id, formData);
                    toast.success('Photo uploaded successfully');
                } catch (photoErr) {
                    toast.warning('Student created, but failed to upload photo');
                }
            }

            toast.success('Student created successfully!');

            // Clear localStorage
            localStorage.removeItem('STUDENT_CREATION_DRAFT');
            localStorage.removeItem('STUDENT_CREATION_STEP');
            localStorage.removeItem('STUDENT_CREATION_TIMESTAMP');

            onSubmit(finalStudent);
        } catch (err: any) {
            const errorData = err?.errors || err?.response?.data || err?.data;

            // Handle nested user_data errors
            if (errorData?.user_data) {
                const userDataErrors = errorData.user_data;
                if (userDataErrors.username) {
                    toast.error('Username Error', { description: userDataErrors.username[0] });
                    setDirection(-1);
                    setCurrentStep(1 as StepType);
                    return;
                }
                if (userDataErrors.password) {
                    toast.error('Password Error', { description: userDataErrors.password[0] });
                    setDirection(-1);
                    setCurrentStep(1 as StepType);
                    return;
                }
            }

            // Handle regular errors
            if (errorData?.username) {
                const usernameError = Array.isArray(errorData.username) ? errorData.username[0] : errorData.username;
                toast.error('Username Error', { description: usernameError });
                setDirection(-1);
                setCurrentStep(1 as StepType);
            } else if (errorData?.user) {
                const userMsg = Array.isArray(errorData.user) ? errorData.user[0] : errorData.user;
                toast.error('User Account Error', { description: userMsg });
                // Switch to existing-user mode to avoid repeated failure if needed
                setValue('accountMode', 'existing');
                setDirection(-1);
                setCurrentStep(1 as StepType);
            } else if (errorData?.email) {
                toast.error('Email Error', { description: Array.isArray(errorData.email) ? errorData.email[0] : errorData.email });
                setDirection(-1);
                setCurrentStep(1 as StepType);
            } else if (errorData?.date_of_birth) {
                toast.error('Date of Birth Error', { description: Array.isArray(errorData.date_of_birth) ? errorData.date_of_birth[0] : errorData.date_of_birth });
                setDirection(-1);
                setCurrentStep(2 as StepType);
            } else {
                toast.error('Failed to create student', {
                    description: err.message || JSON.stringify(errorData) || 'Please check the form',
                    duration: 5000,
                });
            }
        } finally {
            setIsSubmitting(false);
        }
    });

    // Step indicators
    const steps = [
        { number: 1, title: 'Account', icon: User },
        { number: 2, title: 'Personal Info', icon: UserCircle },
        { number: 3, title: 'Academic', icon: GraduationCap },
        { number: 4, title: 'Contact', icon: Mail },
        { number: 5, title: 'Review', icon: CheckCircle },
    ];

    return (
        <div className="flex flex-col gap-6">
            {/* Progress Indicator */}
            {/* Progress Indicator */}
            <div className="flex items-center justify-between px-2 py-4">
                {steps.map((step, index) => {
                    const isCompleted = currentStep > step.number;
                    const isCurrent = currentStep === step.number;

                    return (
                        <div key={step.number} className="flex items-center flex-1 last:flex-none">
                            <div className="flex flex-col items-center relative z-10">
                                <motion.div
                                    initial={false}
                                    animate={{
                                        backgroundColor: isCompleted ? 'hsl(var(--primary))' : 'hsl(var(--background))',
                                        borderColor: isCompleted || isCurrent ? 'hsl(var(--primary))' : 'hsl(var(--muted))',
                                        color: isCompleted ? 'hsl(var(--primary-foreground))' : isCurrent ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))',
                                        scale: isCurrent ? 1.2 : 1,
                                        boxShadow: isCompleted || isCurrent
                                            ? "0 0 25px -5px hsl(var(--primary) / 0.5)"
                                            : "none",
                                    }}
                                    whileHover={{ scale: 1.1 }}
                                    transition={{ duration: 0.3 }}
                                    className={`flex items-center justify-center w-12 h-12 rounded-full border-2 select-none z-10
                                        ${isCurrent ? 'ring-4 ring-primary/20' : ''}
                                        cursor-pointer transition-shadow bg-background
                                    `}
                                    onClick={() => isCompleted && goToStep(step.number as StepType)}
                                >
                                    <AnimatePresence mode="wait">
                                        {isCompleted ? (
                                            <motion.div
                                                key="check"
                                                initial={{ scale: 0, rotate: -180, opacity: 0 }}
                                                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                                                exit={{ scale: 0, rotate: 180, opacity: 0 }}
                                                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                            >
                                                <CheckCircle className="h-6 w-6" />
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                key="icon"
                                                initial={{ scale: 0, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                exit={{ scale: 0, opacity: 0 }}
                                            >
                                                <step.icon className="h-5 w-5" />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                                <span
                                    className={`text-xs mt-3 text-center min-w-[80px] transition-all duration-300
                                        ${isCurrent || isCompleted
                                            ? 'text-primary font-bold translate-y-1'
                                            : 'text-muted-foreground font-medium'
                                        }`}
                                >
                                    {step.title}
                                </span>

                                {/* Animated Status Dot for current step */}
                                {isCurrent && (
                                    <motion.div
                                        className="absolute -bottom-2 w-1.5 h-1.5 rounded-full bg-primary"
                                        initial={{ opacity: 0, scale: 0 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        layoutId="activeStepDot"
                                    />
                                )}
                            </div>

                            {/* Connector Line */}
                            {index < steps.length - 1 && (
                                <div className="h-1 flex-1 mx-4 bg-muted relative rounded-full overflow-hidden -mt-8">
                                    <motion.div
                                        className="absolute top-0 left-0 h-full bg-primary"
                                        initial={{ width: '0%' }}
                                        animate={{ width: isCompleted ? '100%' : '0%' }}
                                        transition={{ duration: 0.5, ease: "easeInOut" }}
                                    />
                                    {/* Animated pulse for current step connector */}
                                    {isCurrent && (
                                        <motion.div
                                            className="absolute top-0 left-0 h-full bg-primary/30"
                                            initial={{ x: '-100%' }}
                                            animate={{ x: '100%' }}
                                            transition={{
                                                repeat: Infinity,
                                                duration: 1.5,
                                                ease: "linear",
                                                repeatDelay: 0.5
                                            }}
                                        />
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Step Content */}
            <div className="relative overflow-x-hidden w-full">
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
                        {/* Step 1: Account Details */}
                        {currentStep === 1 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Account Details</CardTitle>
                                    <CardDescription>
                                        {accountMode === 'create'
                                            ? 'Create login credentials for the student'
                                            : 'Link to an existing user account'}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex flex-col gap-6">
                                    {/* Account Mode Selection */}
                                    <div>
                                        <Label>Account Type</Label>
                                        <div className="flex gap-4 mt-2">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    value="create"
                                                    {...register('accountMode')}
                                                    className="w-4 h-4"
                                                />
                                                <span>Create New User Account</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    value="existing"
                                                    {...register('accountMode')}
                                                    className="w-4 h-4"
                                                />
                                                <span>Link Existing User</span>
                                            </label>
                                        </div>
                                    </div>

                                    {/* Existing User Selection */}
                                    {accountMode === 'existing' && (
                                        <div>
                                            <Label htmlFor="existingUserId" required>
                                                Select Existing User
                                            </Label>
                                            <Select
                                                value={watch('existingUserId')}
                                                onValueChange={(value) => {
                                                    setValue('existingUserId', value, { shouldValidate: true });
                                                    // Pre-fill form with existing user details
                                                    const selectedUser = studentUsers.find((u: any) => u.id === value) as any;
                                                    if (selectedUser) {
                                                        setValue('email', selectedUser.email || '');
                                                        setValue('first_name', selectedUser.first_name || '');
                                                        setValue('last_name', selectedUser.last_name || '');
                                                        setValue('phone', selectedUser.phone || '');
                                                        if (selectedUser.date_of_birth) setValue('date_of_birth', selectedUser.date_of_birth);
                                                        if (selectedUser.gender) setValue('gender', selectedUser.gender);
                                                    }
                                                }}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a user" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {isUsersLoading ? (
                                                        <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                                                            Loading users...
                                                        </div>
                                                    ) : studentUsers.length === 0 ? (
                                                        <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                                                            No student users available
                                                        </div>
                                                    ) : (
                                                        studentUsers.map((user: any) => (
                                                            <SelectItem key={user.id} value={user.id}>
                                                                {user.full_name || user.username} ({user.email})
                                                            </SelectItem>
                                                        ))
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            {errors.existingUserId && (
                                                <p className="text-xs text-destructive mt-1">{errors.existingUserId.message}</p>
                                            )}
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Select a user who doesn't have a student record yet
                                            </p>
                                        </div>
                                    )}

                                    {/* New User Creation Fields */}
                                    {accountMode === 'create' && (
                                        <>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="col-span-2">
                                                    <Label htmlFor="username" required>
                                                        Username
                                                    </Label>
                                                    <Input
                                                        id="username"
                                                        {...register('username', {
                                                            required: accountMode === 'create' ? 'Username is required' : false,
                                                            minLength: { value: 3, message: 'Username must be at least 3 characters' },
                                                            pattern: {
                                                                value: /^[a-z0-9_]+$/,
                                                                message: 'Username must be lowercase letters, numbers, and underscores only'
                                                            }
                                                        })}
                                                        placeholder="student.username"
                                                        className="lowercase"
                                                    />
                                                    {errors.username && (
                                                        <p className="text-xs text-destructive mt-1">{errors.username.message}</p>
                                                    )}
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        Lowercase letters, numbers, and underscores only
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <Label htmlFor="password" required>
                                                        Password
                                                    </Label>
                                                    <Input
                                                        id="password"
                                                        type="password"
                                                        {...register('password', {
                                                            required: accountMode === 'create' ? 'Password is required' : false,
                                                            minLength: { value: 8, message: 'Password must be at least 8 characters' }
                                                        })}
                                                        placeholder="Enter password"
                                                    />
                                                    {errors.password && (
                                                        <p className="text-xs text-destructive mt-1">{errors.password.message}</p>
                                                    )}
                                                </div>

                                                <div>
                                                    <Label htmlFor="confirmPassword" required>
                                                        Confirm Password
                                                    </Label>
                                                    <Input
                                                        id="confirmPassword"
                                                        type="password"
                                                        {...register('confirmPassword', {
                                                            required: accountMode === 'create' ? 'Please confirm password' : false
                                                        })}
                                                        placeholder="Re-enter password"
                                                    />
                                                    {errors.confirmPassword && (
                                                        <p className="text-xs text-destructive mt-1">{errors.confirmPassword.message}</p>
                                                    )}
                                                </div>
                                            </div>

                                            <div>
                                                <Label htmlFor="email" required>
                                                    Email Address
                                                </Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    {...register('email', {
                                                        required: accountMode === 'create' ? 'Email is required' : false,
                                                        pattern: {
                                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                            message: 'Invalid email address'
                                                        }
                                                    })}
                                                    placeholder="student@example.com"
                                                />
                                                {errors.email && (
                                                    <p className="text-xs text-destructive mt-1">{errors.email.message}</p>
                                                )}
                                            </div>

                                            <Alert>
                                                <AlertCircle className="h-4 w-4" />
                                                <AlertDescription>
                                                    <strong>Important:</strong> The username and password will be used by the student to log into the system.
                                                </AlertDescription>
                                            </Alert>
                                        </>
                                    )}

                                    {/* College is now auto-populated from header selection */}
                                </CardContent>
                            </Card>
                        )}

                        {/* Step 2: Personal Information */}
                        {currentStep === 2 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Personal Information</CardTitle>
                                    <CardDescription>
                                        Enter the student's personal and identity details
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex flex-col gap-6">
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <Label htmlFor="first_name" required>
                                                First Name
                                            </Label>
                                            <Input
                                                id="first_name"
                                                {...register('first_name', { required: 'First name is required' })}
                                                placeholder="John"
                                            />
                                            {errors.first_name && (
                                                <p className="text-xs text-destructive mt-1">{errors.first_name.message}</p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="middle_name">
                                                Middle Name
                                            </Label>
                                            <Input
                                                id="middle_name"
                                                {...register('middle_name')}
                                                placeholder="Michael"
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="last_name" required>
                                                Last Name
                                            </Label>
                                            <Input
                                                id="last_name"
                                                {...register('last_name', { required: 'Last name is required' })}
                                                placeholder="Doe"
                                            />
                                            {errors.last_name && (
                                                <p className="text-xs text-destructive mt-1">{errors.last_name.message}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="date_of_birth" required>
                                                Date of Birth
                                            </Label>
                                            <Input
                                                id="date_of_birth"
                                                type="date"
                                                {...register('date_of_birth', { required: 'Date of birth is required' })}
                                            />
                                            {errors.date_of_birth && (
                                                <p className="text-xs text-destructive mt-1">{errors.date_of_birth.message}</p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="gender" required>
                                                Gender
                                            </Label>
                                            <Select
                                                value={watch('gender')}
                                                onValueChange={(value) => setValue('gender', value, { shouldValidate: true })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select gender" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {GENDERS.map(gender => (
                                                        <SelectItem key={gender.value} value={gender.value}>
                                                            {gender.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <Label htmlFor="blood_group">
                                                Blood Group
                                            </Label>
                                            <Select
                                                value={watch('blood_group')}
                                                onValueChange={(value) => setValue('blood_group', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select blood group" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {BLOOD_GROUPS.map(bg => (
                                                        <SelectItem key={bg} value={bg}>
                                                            {bg}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div>
                                            <Label htmlFor="nationality">
                                                Nationality
                                            </Label>
                                            <Input
                                                id="nationality"
                                                {...register('nationality')}
                                                placeholder="Indian"
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="religion">
                                                Religion
                                            </Label>
                                            <Input
                                                id="religion"
                                                {...register('religion')}
                                                placeholder="Religion"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <Label htmlFor="caste">
                                                Caste
                                            </Label>
                                            <Input
                                                id="caste"
                                                {...register('caste')}
                                                placeholder="Caste"
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="mother_tongue">
                                                Mother Tongue
                                            </Label>
                                            <Input
                                                id="mother_tongue"
                                                {...register('mother_tongue')}
                                                placeholder="Mother tongue"
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="aadhar_number">
                                                Aadhar Number
                                            </Label>
                                            <Input
                                                id="aadhar_number"
                                                {...register('aadhar_number')}
                                                placeholder="1234 5678 9012"
                                                maxLength={12}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="pan_number">
                                                PAN Number
                                            </Label>
                                            <Input
                                                id="pan_number"
                                                {...register('pan_number')}
                                                placeholder="ABCDE1234F"
                                                maxLength={10}
                                                className="uppercase"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Step 3: Academic Details */}
                        {currentStep === 3 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Academic Details</CardTitle>
                                    <CardDescription>
                                        Enter admission and academic information
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex flex-col gap-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="admission_date" required>
                                                Admission Date
                                            </Label>
                                            <Input
                                                id="admission_date"
                                                type="date"
                                                {...register('admission_date', { required: 'Admission date is required' })}
                                            />
                                            {errors.admission_date && (
                                                <p className="text-xs text-destructive mt-1">{errors.admission_date.message}</p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="roll_number">
                                                Roll Number
                                            </Label>
                                            <Input
                                                id="roll_number"
                                                {...register('roll_number')}
                                                placeholder="ROLL-001"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="admission_type">
                                            Admission Type
                                        </Label>
                                        <Select
                                            value={watch('admission_type')}
                                            onValueChange={(value) => setValue('admission_type', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select admission type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {ADMISSION_TYPES.map(type => (
                                                    <SelectItem key={type.value} value={type.value}>
                                                        {type.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label htmlFor="program" required>
                                            Program
                                        </Label>
                                        <SearchableSelectWithCreate
                                            options={programs.map((program: any) => ({
                                                value: program.id,
                                                label: `${program.name} (${program.code})`,
                                                subtitle: program.faculty_name,
                                            }))}
                                            value={selectedProgram || undefined}
                                            onChange={(value) => setValue('program', value as number, { shouldValidate: true })}
                                            onCreateNew={() => setShowProgramModal(true)}
                                            placeholder="Select program"
                                            searchPlaceholder="Search programs..."
                                            emptyText="No programs found"
                                            emptyActionText="Create a program to continue"
                                            createButtonText="Create New Program"
                                        />
                                        {errors.program && (
                                            <p className="text-xs text-destructive mt-1">Program is required</p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="current_class">
                                                Class
                                            </Label>
                                            <SearchableSelectWithCreate
                                                options={classes.map((cls: any) => ({
                                                    value: cls.id,
                                                    label: cls.name,
                                                    subtitle: cls.program_name,
                                                }))}
                                                value={selectedClass || undefined}
                                                onChange={(value) => {
                                                    setValue('current_class', value as number);
                                                    // Clear section when class changes
                                                    setValue('current_section', null);
                                                }}
                                                onCreateNew={() => setShowClassModal(true)}
                                                placeholder="Select class"
                                                searchPlaceholder="Search classes..."
                                                emptyText="No classes found"
                                                emptyActionText="Create a class to continue"
                                                createButtonText="Create New Class"
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="current_section">
                                                Section
                                            </Label>
                                            <SearchableSelectWithCreate
                                                options={sections
                                                    .filter((section: any) => !selectedClass || section.class_obj === selectedClass)
                                                    .map((section: any) => ({
                                                        value: section.id,
                                                        label: section.name,
                                                        subtitle: section.class_name,
                                                    }))}
                                                value={watch('current_section') || undefined}
                                                onChange={(value) => setValue('current_section', value as number)}
                                                onCreateNew={() => {
                                                    if (!selectedClass) {
                                                        toast.error('Please select a class first');
                                                        return;
                                                    }
                                                    setShowSectionModal(true);
                                                }}
                                                placeholder="Select section"
                                                searchPlaceholder="Search sections..."
                                                emptyText="No sections found for this class"
                                                emptyActionText="Create a section to continue"
                                                createButtonText="Create New Section"
                                                disabled={!selectedClass}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="academic_year" required>
                                            Academic Year
                                        </Label>
                                        <Select
                                            value={watch('academic_year')?.toString()}
                                            onValueChange={(value) => setValue('academic_year', parseInt(value), { shouldValidate: true })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select academic year" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {years.map((year: any) => (
                                                    <SelectItem key={year.id} value={year.id.toString()}>
                                                        {year.year || year.name || `Year #${year.id}`} {year.is_current && '(Current)'}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.academic_year && (
                                            <p className="text-xs text-destructive mt-1">Academic year is required</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Step 4: Contact Information */}
                        {currentStep === 4 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Contact Information</CardTitle>
                                    <CardDescription>
                                        Enter contact details and photo
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex flex-col gap-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="phone" required>
                                                Phone Number
                                            </Label>
                                            <Input
                                                id="phone"
                                                type="tel"
                                                {...register('phone', {
                                                    required: 'Phone number is required',
                                                    pattern: {
                                                        value: /^[0-9]{10}$/,
                                                        message: 'Phone number must be 10 digits'
                                                    }
                                                })}
                                                placeholder="9876543210"
                                                maxLength={10}
                                            />
                                            {errors.phone && (
                                                <p className="text-xs text-destructive mt-1">{errors.phone.message}</p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="alternate_phone">
                                                Alternate Phone
                                            </Label>
                                            <Input
                                                id="alternate_phone"
                                                type="tel"
                                                {...register('alternate_phone')}
                                                placeholder="9876543210"
                                                maxLength={10}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="photo">
                                            Student Photo
                                        </Label>
                                        <div className="flex gap-4 items-center mt-2">
                                            {/* Preview */}
                                            {previewUrl && (
                                                <div className="relative h-16 w-16 min-w-[4rem] rounded-full overflow-hidden border bg-muted">
                                                    <img
                                                        src={previewUrl}
                                                        alt="Preview"
                                                        className="h-full w-full object-cover"
                                                    />
                                                </div>
                                            )}

                                            <div className="flex-1">
                                                <Input
                                                    id="photo"
                                                    type="file"
                                                    accept="image/jpeg,image/png,image/webp"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            if (file.size > 2 * 1024 * 1024) {
                                                                toast.error("File size must be less than 2MB");
                                                                e.target.value = '';
                                                                return;
                                                            }
                                                            setValue('photo', file);
                                                        }
                                                    }}
                                                    className="cursor-pointer"
                                                />
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    Upload a photo (JPG, PNG). Max 2MB.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <Alert>
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>
                                            Phone number will be used for communication and notifications.
                                        </AlertDescription>
                                    </Alert>
                                </CardContent>
                            </Card>
                        )}

                        {/* Step 5: Review & Submit */}
                        {currentStep === 5 && (
                            <div className="flex flex-col gap-6">
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between">
                                        <div>
                                            <CardTitle>Account Details</CardTitle>
                                            <CardDescription>Review account information</CardDescription>
                                        </div>
                                        <Button type="button" size="sm" variant="ghost" onClick={() => goToStep(1)}>
                                            <Edit2 className="h-4 w-4 mr-1" />
                                            Edit
                                        </Button>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label className="text-muted-foreground">Username</Label>
                                                <p className="font-semibold">{watch('username')}</p>
                                            </div>
                                            <div>
                                                <Label className="text-muted-foreground">Email</Label>
                                                <p className="font-semibold">{watch('email')}</p>
                                            </div>
                                            <div>
                                                <Label className="text-muted-foreground">College</Label>
                                                <p className="font-semibold">
                                                    {colleges.find((c: any) => c.id === watch('college'))?.name || `College #${watch('college')}`}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between">
                                        <div>
                                            <CardTitle>Personal Information</CardTitle>
                                            <CardDescription>Review personal details</CardDescription>
                                        </div>
                                        <Button type="button" size="sm" variant="ghost" onClick={() => goToStep(2)}>
                                            <Edit2 className="h-4 w-4 mr-1" />
                                            Edit
                                        </Button>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="grid grid-cols-3 gap-4">
                                            <div>
                                                <Label className="text-muted-foreground">Full Name</Label>
                                                <p className="font-semibold">
                                                    {watch('first_name')} {watch('middle_name')} {watch('last_name')}
                                                </p>
                                            </div>
                                            <div>
                                                <Label className="text-muted-foreground">Date of Birth</Label>
                                                <p className="font-semibold">
                                                    {watch('date_of_birth') ? new Date(watch('date_of_birth')).toLocaleDateString() : '-'}
                                                </p>
                                            </div>
                                            <div>
                                                <Label className="text-muted-foreground">Gender</Label>
                                                <Badge className="capitalize">{watch('gender')}</Badge>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div>
                                                <Label className="text-muted-foreground">Blood Group</Label>
                                                <p className="font-semibold">{watch('blood_group') || '-'}</p>
                                            </div>
                                            <div>
                                                <Label className="text-muted-foreground">Nationality</Label>
                                                <p className="font-semibold">{watch('nationality')}</p>
                                            </div>
                                            <div>
                                                <Label className="text-muted-foreground">Religion</Label>
                                                <p className="font-semibold">{watch('religion') || '-'}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between">
                                        <div>
                                            <CardTitle>Academic Details</CardTitle>
                                            <CardDescription>Review academic information</CardDescription>
                                        </div>
                                        <Button type="button" size="sm" variant="ghost" onClick={() => goToStep(3)}>
                                            <Edit2 className="h-4 w-4 mr-1" />
                                            Edit
                                        </Button>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label className="text-muted-foreground">Admission Number</Label>
                                                <p className="font-semibold">{watch('admission_number')}</p>
                                            </div>
                                            <div>
                                                <Label className="text-muted-foreground">Registration Number</Label>
                                                <p className="font-semibold">{watch('registration_number')}</p>
                                            </div>
                                            <div>
                                                <Label className="text-muted-foreground">Admission Date</Label>
                                                <p className="font-semibold">
                                                    {watch('admission_date') ? new Date(watch('admission_date')).toLocaleDateString() : '-'}
                                                </p>
                                            </div>
                                            <div>
                                                <Label className="text-muted-foreground">Admission Type</Label>
                                                <Badge className="capitalize">{watch('admission_type')}</Badge>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between">
                                        <div>
                                            <CardTitle>Contact Information</CardTitle>
                                            <CardDescription>Review contact details</CardDescription>
                                        </div>
                                        <Button type="button" size="sm" variant="ghost" onClick={() => goToStep(4)}>
                                            <Edit2 className="h-4 w-4 mr-1" />
                                            Edit
                                        </Button>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label className="text-muted-foreground">Phone</Label>
                                                <p className="font-semibold">{watch('phone')}</p>
                                            </div>
                                            {watch('alternate_phone') && (
                                                <div>
                                                    <Label className="text-muted-foreground">Alternate Phone</Label>
                                                    <p className="font-semibold">{watch('alternate_phone')}</p>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>

                                <Alert>
                                    <CheckCircle className="h-4 w-4" />
                                    <AlertDescription>
                                        Please review all information carefully before submitting. This will create both a user account and a student record.
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

                    {currentStep < 5 ? (
                        <Button type="button" onClick={handleNext}>
                            Next
                            <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    ) : (
                        <Button type="button" onClick={handleFinalSubmit} disabled={isSubmitting}>
                            {isSubmitting ? 'Creating Student...' : 'Create Student'}
                        </Button>
                    )}
                </div>
            </div>

            {/* Inline Creation Modals */}
            <InlineCreateProgram
                open={showProgramModal}
                onOpenChange={setShowProgramModal}
                onSuccess={handleProgramCreated}
                collegeId={watch('college') || undefined}
            />

            <InlineCreateClass
                open={showClassModal}
                onOpenChange={setShowClassModal}
                onSuccess={handleClassCreated}
                programId={selectedProgram || undefined}
                collegeId={watch('college') || undefined}
            />

            <InlineCreateSection
                open={showSectionModal}
                onOpenChange={setShowSectionModal}
                onSuccess={handleSectionCreated}
                classId={selectedClass || 0}
                collegeId={watch('college') || undefined}
            />
        </div>
    );
};
