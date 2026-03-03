/**
 * Teacher Creation Pipeline - Multi-step wizard for creating Teachers
 * Steps: 1. Account Details → 2. Personal Information → 3. Employment Details → 4. Professional & Contact → 5. Review & Submit
 *
 * This wizard streamlines the teacher creation process by combining user account creation
 * and teacher record creation into a single, guided workflow.
 */

import { DROPDOWN_PAGE_SIZE } from '@/config/app.config';
import { AnimatePresence, motion } from 'framer-motion';
import {
    AlertCircle,
    Briefcase,
    CheckCircle,
    ChevronLeft,
    ChevronRight,
    ClipboardCheck,
    Edit2,
    GraduationCap,
    Mail,
    User,
    UserCircle
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { InlineCreateFaculty } from '../../../components/common/InlineCreateFaculty';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { SearchableSelectWithCreate } from '../../../components/ui/searchable-select-with-create';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Textarea } from '../../../components/ui/textarea';
import { useSuperAdminContext } from '../../../contexts/SuperAdminContext';
import { invalidateFaculties, useFacultiesSWR } from '../../../hooks/swr';
import { useUsersSWR } from '../../../hooks/useAccounts';
import { useAuth } from '../../../hooks/useAuth';
import { teachersApi } from '../../../services/teachers.service';
import { getCurrentUserCollege, isSuperAdmin } from '../../../utils/auth.utils';

interface TeacherCreationPipelineProps {
    onSubmit: (data: any) => void;
    onCancel: () => void;
}

type StepType = 1 | 2 | 3 | 4 | 5;

type TeacherCreationFormValues = {
    // Step 1: Account Details
    accountMode: 'create' | 'existing';
    existingUserId: string;
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
    address: string;

    // Step 3: Employment Details
    joining_date: string;
    faculty: number | null;

    // Step 4: Professional & Contact Information
    phone: string;
    alternate_phone: string;
    specialization: string;
    qualifications: string;
    experience_details: string;
    photo: string;
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

export const TeacherCreationPipeline = ({ onSubmit, onCancel }: TeacherCreationPipelineProps) => {
    const [currentStep, setCurrentStep] = useState<StepType>(() => {
        const savedStep = localStorage.getItem('TEACHER_CREATION_STEP');
        return savedStep ? (parseInt(savedStep) as StepType) : 1;
    });
    const [direction, setDirection] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { user } = useAuth();
    const { selectedCollege } = useSuperAdminContext();

    // Get initial college
    const getInitialCollege = () => {
        if (isSuperAdmin(user as any)) {
            return selectedCollege;
        }
        return getCurrentUserCollege(user as any) || null;
    };

    const { register, handleSubmit, formState: { errors }, watch, setValue, trigger, reset } = useForm<TeacherCreationFormValues>({
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
            address: '',

            // Employment Details
            joining_date: new Date().toISOString().split('T')[0],
            faculty: null,

            // Professional & Contact Information
            phone: '',
            alternate_phone: '',
            specialization: '',
            qualifications: '',
            experience_details: '',
            photo: '',
        },
        mode: 'onChange',
    });

    // Inline creation modal states
    const [showFacultyModal, setShowFacultyModal] = useState(false);

    // Fetch faculties
    const { data: facultiesData } = useFacultiesSWR({ page_size: DROPDOWN_PAGE_SIZE, is_active: true });

    // Fetch existing teacher users for linking option
    // ✅ Uses SWR — cached for 10 min, no re-fetch on form close/reopen
    const { results: teacherUsersList, isLoading: isUsersLoading } = useUsersSWR({
        user_type: 'teacher',
        page_size: DROPDOWN_PAGE_SIZE
    });

    // Watch form values
    const watchedValues = watch();
    const accountMode = watch('accountMode');
    const password = watch('password');
    const college = watch('college');

    // Auto-save draft to localStorage
    useEffect(() => {
        const draftData = watchedValues;
        localStorage.setItem('TEACHER_CREATION_DRAFT', JSON.stringify(draftData));
        localStorage.setItem('TEACHER_CREATION_STEP', String(currentStep));
        localStorage.setItem('TEACHER_CREATION_TIMESTAMP', String(Date.now()));
    }, [watchedValues, currentStep]);

    // Load draft from localStorage on mount
    useEffect(() => {
        const savedDraft = localStorage.getItem('TEACHER_CREATION_DRAFT');
        const savedTimestamp = localStorage.getItem('TEACHER_CREATION_TIMESTAMP');

        if (savedDraft) {
            // Check for expiration (1 hour)
            if (savedTimestamp) {
                const now = Date.now();
                const diff = now - parseInt(savedTimestamp, 10);
                // 1 hour = 60 * 60 * 1000 = 3600000 ms
                if (diff > 3600000) {
                    clearDraft();
                    return;
                }
            }

            try {
                const parsedDraft = JSON.parse(savedDraft);
                if (parsedDraft) {
                    reset(parsedDraft);
                }
            } catch (err) {
                clearDraft();
            }
        }
    }, [reset]);

    const clearDraft = () => {
        localStorage.removeItem('TEACHER_CREATION_DRAFT');
        localStorage.removeItem('TEACHER_CREATION_STEP');
        localStorage.removeItem('TEACHER_CREATION_TIMESTAMP');
    };

    // Update college when selectedCollege changes
    useEffect(() => {
        if (isSuperAdmin(user as any) && selectedCollege) {
            setValue('college', selectedCollege);
        }
    }, [selectedCollege, user, setValue]);

    // Step navigation
    const nextStep = async () => {
        const isValid = await validateCurrentStep();
        if (isValid) {
            setDirection(1);
            setCurrentStep((prev) => Math.min(prev + 1, 5) as StepType);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const prevStep = () => {
        setDirection(-1);
        setCurrentStep((prev) => Math.max(prev - 1, 1) as StepType);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const goToStep = (step: StepType) => {
        setDirection(step > currentStep ? 1 : -1);
        setCurrentStep(step);
    };

    // Validation for each step
    const validateCurrentStep = async (): Promise<boolean> => {
        let fieldsToValidate: (keyof TeacherCreationFormValues)[] = [];

        switch (currentStep) {
            case 1:
                if (accountMode === 'create') {
                    fieldsToValidate = ['username', 'password', 'confirmPassword', 'email'];
                } else {
                    fieldsToValidate = ['existingUserId'];
                }
                break;
            case 2:
                fieldsToValidate = ['first_name', 'last_name', 'date_of_birth', 'gender'];
                break;
            case 3:
                fieldsToValidate = ['joining_date', 'faculty'];
                break;
            case 4:
                fieldsToValidate = ['phone', 'email'];
                break;
            default:
                return true;
        }

        const result = await trigger(fieldsToValidate);
        return result;
    };

    // Final submission handler
    const handleFinalSubmit = async (formData: TeacherCreationFormValues) => {
        try {
            setIsSubmitting(true);

            // New API: Create teacher directly with user credentials in a single request
            const teacherPayload: any = {
                college: formData.college!,
                joining_date: formData.joining_date,
                faculty: formData.faculty!,
                first_name: formData.first_name,
                middle_name: formData.middle_name || '',
                last_name: formData.last_name,
                date_of_birth: formData.date_of_birth,
                gender: formData.gender,
                email: formData.email,
                phone: formData.phone,
                alternate_phone: formData.alternate_phone || '',
                address: formData.address || '',
                specialization: formData.specialization || '',
                qualifications: formData.qualifications || '',
                experience_details: formData.experience_details || '',
                is_active: true,
                // Include password for new user creation
                ...(formData.accountMode === 'create' && {
                    password: formData.password,
                }),
            };

            // Don't include photo field - it expects file upload, not string
            // If you want to support photo uploads, implement file upload separately

            const teacherResult = await teachersApi.create(teacherPayload);

            toast.success('Teacher created successfully!');
            clearDraft();
            onSubmit(teacherResult);
        } catch (error: any) {
            // Parse field-specific errors
            if (error.errors && typeof error.errors === 'object') {
                Object.entries(error.errors).forEach(([field, messages]) => {
                    if (Array.isArray(messages)) {
                        toast.error(`${field}: ${messages.join(', ')}`);
                    } else if (typeof messages === 'string') {
                        toast.error(`${field}: ${messages}`);
                    }
                });
            } else {
                toast.error(typeof error.message === 'string' ? error.message : 'Failed to create teacher');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // Step 1: Account Details
    const renderStep1 = () => (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <UserCircle className="w-5 h-5" />
                        User Account
                    </CardTitle>
                    <CardDescription>
                        Choose to create a new user account or link to an existing one
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Account Mode Selection */}
                    <div className="space-y-2">
                        <Label>Account Mode</Label>
                        <Select
                            value={accountMode}
                            onValueChange={(value: 'create' | 'existing') => setValue('accountMode', value)}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="create">Create New User Account</SelectItem>
                                <SelectItem value="existing">Link to Existing User</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {accountMode === 'create' ? (
                        <>

                            {/* Username */}
                            <div className="space-y-2">
                                <Label htmlFor="username">Username *</Label>
                                <Input
                                    id="username"
                                    {...register('username', {
                                        required: 'Username is required',
                                        minLength: { value: 3, message: 'Username must be at least 3 characters' },
                                        pattern: {
                                            value: /^[a-z0-9_]+$/,
                                            message: 'Username must be lowercase letters, numbers, and underscores only'
                                        }
                                    })}
                                    placeholder="johndoe"
                                />
                                {errors.username && (
                                    <p className="text-sm text-destructive">{errors.username.message}</p>
                                )}
                            </div>

                            {/* Email */}
                            <div className="space-y-2">
                                <Label htmlFor="email">Email *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    {...register('email', {
                                        required: 'Email is required',
                                        pattern: {
                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                            message: 'Invalid email address'
                                        }
                                    })}
                                    placeholder="teacher@example.com"
                                />
                                {errors.email && (
                                    <p className="text-sm text-destructive">{errors.email.message}</p>
                                )}
                            </div>

                            {/* Password */}
                            <div className="space-y-2">
                                <Label htmlFor="password">Password *</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    {...register('password', {
                                        required: 'Password is required',
                                        minLength: { value: 8, message: 'Password must be at least 8 characters' }
                                    })}
                                    placeholder="••••••••"
                                />
                                {errors.password && (
                                    <p className="text-sm text-destructive">{errors.password.message}</p>
                                )}
                            </div>

                            {/* Confirm Password */}
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    {...register('confirmPassword', {
                                        required: 'Please confirm your password',
                                        validate: value => value === password || 'Passwords do not match'
                                    })}
                                    placeholder="••••••••"
                                />
                                {errors.confirmPassword && (
                                    <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
                                )}
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Existing User Selection */}
                            <div className="space-y-2">
                                <Label htmlFor="existingUserId">Select Existing Teacher User *</Label>
                                <Select
                                    value={watchedValues.existingUserId}
                                    onValueChange={(value) => setValue('existingUserId', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a user..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {isUsersLoading ? (
                                            <SelectItem value="" disabled>Loading users...</SelectItem>
                                        ) : teacherUsersList?.length ? (
                                            teacherUsersList.map((user) => (
                                                <SelectItem key={user.id} value={String(user.id)}>
                                                    {user.username} ({user.email})
                                                </SelectItem>
                                            ))
                                        ) : (
                                            <SelectItem value="" disabled>No teacher users available</SelectItem>
                                        )}
                                    </SelectContent>
                                </Select>
                                {errors.existingUserId && (
                                    <p className="text-sm text-destructive">{errors.existingUserId.message}</p>
                                )}
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );

    // Step 2: Personal Information
    const renderStep2 = () => (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Personal Information
                    </CardTitle>
                    <CardDescription>
                        Enter the teacher's personal details
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* First Name */}
                    <div className="space-y-2">
                        <Label htmlFor="first_name">First Name *</Label>
                        <Input
                            id="first_name"
                            {...register('first_name', { required: 'First name is required' })}
                            placeholder="John"
                        />
                        {errors.first_name && (
                            <p className="text-sm text-destructive">{errors.first_name.message}</p>
                        )}
                    </div>

                    {/* Middle Name */}
                    <div className="space-y-2">
                        <Label htmlFor="middle_name">Middle Name</Label>
                        <Input
                            id="middle_name"
                            {...register('middle_name')}
                            placeholder="Michael"
                        />
                    </div>

                    {/* Last Name */}
                    <div className="space-y-2">
                        <Label htmlFor="last_name">Last Name *</Label>
                        <Input
                            id="last_name"
                            {...register('last_name', { required: 'Last name is required' })}
                            placeholder="Doe"
                        />
                        {errors.last_name && (
                            <p className="text-sm text-destructive">{errors.last_name.message}</p>
                        )}
                    </div>

                    {/* Date of Birth */}
                    <div className="space-y-2">
                        <Label htmlFor="date_of_birth">Date of Birth *</Label>
                        <Input
                            id="date_of_birth"
                            type="date"
                            {...register('date_of_birth', { required: 'Date of birth is required' })}
                        />
                        {errors.date_of_birth && (
                            <p className="text-sm text-destructive">{errors.date_of_birth.message}</p>
                        )}
                    </div>

                    {/* Gender */}
                    <div className="space-y-2">
                        <Label htmlFor="gender">Gender *</Label>
                        <Select
                            value={watchedValues.gender}
                            onValueChange={(value) => setValue('gender', value)}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {GENDERS.map((gender) => (
                                    <SelectItem key={gender.value} value={gender.value}>
                                        {gender.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.gender && (
                            <p className="text-sm text-destructive">{errors.gender.message}</p>
                        )}
                    </div>

                    {/* Address */}
                    <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Textarea
                            id="address"
                            {...register('address')}
                            placeholder="Enter full address"
                            rows={3}
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );

    // Step 3: Employment Details
    const renderStep3 = () => (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Briefcase className="w-5 h-5" />
                        Employment Details
                    </CardTitle>
                    <CardDescription>
                        Enter employment-related information
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Joining Date */}
                    <div className="space-y-2">
                        <Label htmlFor="joining_date">Joining Date *</Label>
                        <Input
                            id="joining_date"
                            type="date"
                            {...register('joining_date', { required: 'Joining date is required' })}
                        />
                        {errors.joining_date && (
                            <p className="text-sm text-destructive">{errors.joining_date.message}</p>
                        )}
                    </div>

                    {/* Faculty */}
                    <div className="space-y-2">
                        <Label htmlFor="faculty">Faculty *</Label>
                        <SearchableSelectWithCreate
                            value={watchedValues.faculty || ''}
                            onChange={(value) => setValue('faculty', Number(value))}
                            options={facultiesData?.results?.map(fac => ({
                                value: fac.id,
                                label: fac.name
                            })) || []}
                            placeholder="Select or search faculty..."
                            onCreateNew={() => setShowFacultyModal(true)}
                            searchPlaceholder="Search faculties..."
                            emptyText="No faculties found"
                        />
                        {errors.faculty && (
                            <p className="text-sm text-destructive">{errors.faculty.message}</p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Inline Create Faculty Modal */}
            <InlineCreateFaculty
                open={showFacultyModal}
                onOpenChange={setShowFacultyModal}
                onSuccess={(newFacultyId) => {
                    setValue('faculty', newFacultyId);
                    invalidateFaculties();
                    setShowFacultyModal(false);
                }}
                collegeId={watchedValues.college!}
            />
        </div>
    );

    // Step 4: Professional & Contact Information
    const renderStep4 = () => (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Mail className="w-5 h-5" />
                        Professional & Contact Information
                    </CardTitle>
                    <CardDescription>
                        Enter professional qualifications and contact details
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Phone */}
                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone *</Label>
                        <Input
                            id="phone"
                            {...register('phone', {
                                required: 'Phone number is required',
                                pattern: {
                                    value: /^[0-9]{10}$/,
                                    message: 'Phone number must be 10 digits'
                                }
                            })}
                            placeholder="9876543210"
                        />
                        {errors.phone && (
                            <p className="text-sm text-destructive">{errors.phone.message}</p>
                        )}
                    </div>

                    {/* Alternate Phone */}
                    <div className="space-y-2">
                        <Label htmlFor="alternate_phone">Alternate Phone</Label>
                        <Input
                            id="alternate_phone"
                            {...register('alternate_phone', {
                                pattern: {
                                    value: /^[0-9]{10}$/,
                                    message: 'Phone number must be 10 digits'
                                }
                            })}
                            placeholder="9876543211"
                        />
                        {errors.alternate_phone && (
                            <p className="text-sm text-destructive">{errors.alternate_phone.message}</p>
                        )}
                    </div>

                    {/* Specialization */}
                    <div className="space-y-2">
                        <Label htmlFor="specialization">Specialization</Label>
                        <Input
                            id="specialization"
                            {...register('specialization')}
                            placeholder="e.g., Computer Science, Mathematics"
                        />
                    </div>

                    {/* Qualifications */}
                    <div className="space-y-2">
                        <Label htmlFor="qualifications">Qualifications</Label>
                        <Textarea
                            id="qualifications"
                            {...register('qualifications')}
                            placeholder="e.g., Ph.D. in Computer Science, M.Tech in AI"
                            rows={3}
                        />
                    </div>

                    {/* Experience Details */}
                    <div className="space-y-2">
                        <Label htmlFor="experience_details">Experience Details</Label>
                        <Textarea
                            id="experience_details"
                            {...register('experience_details')}
                            placeholder="Describe teaching and professional experience"
                            rows={4}
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );

    // Step 5: Review & Submit
    const renderStep5 = () => (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5" />
                        Review & Submit
                    </CardTitle>
                    <CardDescription>
                        Review all information before submitting
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Account Details */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium">Account Details</h3>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => goToStep(1)}
                            >
                                <Edit2 className="w-4 h-4 mr-1" />
                                Edit
                            </Button>
                        </div>
                        <div className="space-y-1 text-sm">
                            <p><span className="text-muted-foreground">Mode:</span> {watchedValues.accountMode === 'create' ? 'Create New Account' : 'Link Existing User'}</p>
                            {watchedValues.accountMode === 'create' && (
                                <>
                                    <p><span className="text-muted-foreground">Username:</span> {watchedValues.username}</p>
                                    <p><span className="text-muted-foreground">Email:</span> {watchedValues.email}</p>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Personal Information */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium">Personal Information</h3>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => goToStep(2)}
                            >
                                <Edit2 className="w-4 h-4 mr-1" />
                                Edit
                            </Button>
                        </div>
                        <div className="space-y-1 text-sm">
                            <p><span className="text-muted-foreground">Name:</span> {watchedValues.first_name} {watchedValues.middle_name} {watchedValues.last_name}</p>
                            <p><span className="text-muted-foreground">Date of Birth:</span> {watchedValues.date_of_birth}</p>
                            <p><span className="text-muted-foreground">Gender:</span> {watchedValues.gender}</p>
                            {watchedValues.address && (
                                <p><span className="text-muted-foreground">Address:</span> {watchedValues.address}</p>
                            )}
                        </div>
                    </div>

                    {/* Employment Details */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium">Employment Details</h3>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => goToStep(3)}
                            >
                                <Edit2 className="w-4 h-4 mr-1" />
                                Edit
                            </Button>
                        </div>
                        <div className="space-y-1 text-sm">
                            <p><span className="text-muted-foreground">Joining Date:</span> {watchedValues.joining_date}</p>
                            <p>
                                <span className="text-muted-foreground">Faculty:</span>{' '}
                                {facultiesData?.results?.find(f => f.id === watchedValues.faculty)?.name || watchedValues.faculty}
                            </p>
                        </div>
                    </div>

                    {/* Professional & Contact */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium">Professional & Contact</h3>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => goToStep(4)}
                            >
                                <Edit2 className="w-4 h-4 mr-1" />
                                Edit
                            </Button>
                        </div>
                        <div className="space-y-1 text-sm">
                            <p><span className="text-muted-foreground">Phone:</span> {watchedValues.phone}</p>
                            {watchedValues.alternate_phone && (
                                <p><span className="text-muted-foreground">Alternate Phone:</span> {watchedValues.alternate_phone}</p>
                            )}
                            {watchedValues.specialization && (
                                <p><span className="text-muted-foreground">Specialization:</span> {watchedValues.specialization}</p>
                            )}
                            {watchedValues.qualifications && (
                                <p><span className="text-muted-foreground">Qualifications:</span> {watchedValues.qualifications}</p>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Submit Warning */}
            <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                    Please review all information carefully before submitting. Once submitted, a teacher account will be created.
                </AlertDescription>
            </Alert>
        </div>
    );

    // Progress indicator
    const renderProgressSteps = () => {
        const steps = [
            { id: 1, label: 'Account', icon: UserCircle },
            { id: 2, label: 'Personal', icon: User },
            { id: 3, label: 'Employment', icon: Briefcase },
            { id: 4, label: 'Professional', icon: GraduationCap },
            { id: 5, label: 'Review', icon: ClipboardCheck },
        ];

        // Calculate progress within the current step
        const getStepProgress = () => {
            let fields: string[] = [];
            // Define required fields for each step
            switch (currentStep) {
                case 1:
                    fields = accountMode === 'create'
                        ? ['username', 'password', 'confirmPassword', 'email']
                        : ['existingUserId'];
                    break;
                case 2:
                    fields = ['first_name', 'last_name', 'date_of_birth', 'gender'];
                    break;
                case 3:
                    fields = ['joining_date', 'faculty'];
                    break;
                case 4:
                    fields = ['phone'];
                    break;
                default:
                    return 0; // Step 5 has no fields to fill, just review
            }

            if (fields.length === 0) return 0;

            const filledCount = fields.reduce((acc, field) => {
                const value = watchedValues[field as keyof TeacherCreationFormValues];
                return acc + (value ? 1 : 0);
            }, 0);

            return filledCount / fields.length;
        };

        const totalSteps = steps.length;
        const stepSegmentWidth = 100 / (totalSteps - 1);
        const baseProgress = (currentStep - 1) * stepSegmentWidth;
        const currentStepProgress = currentStep < totalSteps ? (getStepProgress() * stepSegmentWidth) : 0;
        const totalProgress = Math.min(baseProgress + currentStepProgress, 100);

        return (
            <div className="relative mb-12 px-2">
                {/* Background Line */}
                <div className="absolute top-5 left-0 w-full h-1 bg-muted -z-10 rounded-full" />

                {/* Active Progress Line */}
                <div
                    className="absolute top-5 left-0 h-1 bg-primary -z-10 transition-all duration-500 ease-in-out rounded-full"
                    style={{ width: `${totalProgress}%` }}
                />

                <div className="flex justify-between w-full">
                    {steps.map((step) => {
                        const isCompleted = currentStep > step.id;
                        const isCurrent = currentStep === step.id;
                        const Icon = step.icon;

                        return (
                            <div
                                key={step.id}
                                className={`flex flex-col items-center gap-2 ${step.id < currentStep ? 'cursor-pointer' : 'cursor-default'}`}
                                onClick={() => step.id < currentStep && goToStep(step.id as StepType)}
                            >
                                <div
                                    className={`
                                        flex h-10 w-10 items-center justify-center rounded-full border-2 
                                        transition-all duration-300 bg-background z-10
                                        ${isCompleted
                                            ? 'border-primary bg-primary text-primary-foreground'
                                            : isCurrent
                                                ? 'border-primary text-primary ring-4 ring-primary/20 scale-110 shadow-lg'
                                                : 'border-muted text-muted-foreground'
                                        }
                                    `}
                                >
                                    {isCompleted ? (
                                        <CheckCircle className="h-5 w-5" />
                                    ) : (
                                        <Icon className="h-5 w-5" />
                                    )}
                                </div>
                                <span className={`
                                    text-xs font-medium whitespace-nowrap transition-colors duration-300 select-none
                                    ${isCurrent ? 'text-primary font-bold' : isCompleted ? 'text-foreground' : 'text-muted-foreground'}
                                `}>
                                    {step.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const stepTitles = {
        1: 'Account Details',
        2: 'Personal Information',
        3: 'Employment Details',
        4: 'Professional & Contact',
        5: 'Review & Submit',
    };

    return (
        <div className="p-6">
            {/* Progress Steps */}
            {renderProgressSteps()}

            {/* Step Content */}
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    // Only submit if we're on step 5
                    if (currentStep === 5) {
                        handleSubmit(handleFinalSubmit)(e);
                    }
                }}
                onKeyDown={(e) => {
                    // Prevent Enter key from submitting the form
                    if (e.key === 'Enter' && e.target instanceof HTMLInputElement) {
                        e.preventDefault();
                    }
                }}
            >
                <AnimatePresence custom={direction} mode="wait">
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
                    >
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold mb-2">{stepTitles[currentStep]}</h2>
                        </div>

                        {currentStep === 1 && renderStep1()}
                        {currentStep === 2 && renderStep2()}
                        {currentStep === 3 && renderStep3()}
                        {currentStep === 4 && renderStep4()}
                        {currentStep === 5 && renderStep5()}
                    </motion.div>
                </AnimatePresence>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t">
                    <div>
                        {currentStep > 1 && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={prevStep}
                            >
                                <ChevronLeft className="w-4 h-4 mr-2" />
                                Previous
                            </Button>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onCancel}
                        >
                            Cancel
                        </Button>
                        {currentStep < 5 ? (
                            <Button
                                key="next-step-btn"
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    nextStep();
                                }}
                            >
                                Next
                                <ChevronRight className="w-4 h-4 ml-2" />
                            </Button>
                        ) : (
                            <Button
                                key="submit-teacher-btn"
                                type="submit"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Creating...' : 'Create Teacher'}
                            </Button>
                        )}
                    </div>
                </div>
            </form>
        </div>
    );
};
