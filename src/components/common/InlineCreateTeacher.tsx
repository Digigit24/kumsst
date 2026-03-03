/**
 * InlineCreateTeacher Component
 * Allows creating a new Teacher without leaving the current form
 */

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { userApi } from '@/services/accounts.service';
import type { UserCreateInput } from '@/types/accounts.types';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { InlineCreateModal } from './InlineCreateModal';

interface InlineCreateTeacherProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: (teacherId: string) => void;
    collegeId?: number;
}

const GENDERS = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
];

export function InlineCreateTeacher({
    open,
    onOpenChange,
    onSuccess,
    collegeId,
}: InlineCreateTeacherProps) {
    const [isLoading, setIsLoading] = useState(false);

    const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<UserCreateInput>({
        defaultValues: {
            user_type: 'teacher',
            is_active: true,
            first_name: '',
            last_name: '',
            username: '',
            email: '',
            password: '',
            password_confirm: '',
        },
    });

    const onSubmit = async (data: UserCreateInput) => {
        try {
            setIsLoading(true);

            // Validate passwords match
            if (data.password !== data.password_confirm) {
                toast.error('Passwords do not match');
                return;
            }

            // Remove college from payload - backend gets it from x-college-id header
            const { college, ...payload } = data;
            const newTeacher = await userApi.create(payload as UserCreateInput);
            toast.success('Teacher created successfully');
            reset();
            onSuccess(newTeacher.id);
            onOpenChange(false);
        } catch (error: any) {
            console.error('Create teacher error:', error);
            const errorMessage = error.errors
                ? Object.entries(error.errors).map(([key, val]) => `${key}: ${val}`).join(', ')
                : error.message || 'Failed to create teacher';
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        reset();
    };

    return (
        <InlineCreateModal
            open={open}
            onOpenChange={onOpenChange}
            title="Create New Teacher"
            description="Add a new teacher account to the system"
            onSubmit={handleSubmit(onSubmit)}
            onCancel={handleCancel}
            isLoading={isLoading}
            size="lg"
        >
            <div className="grid gap-4">
                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="first_name">
                            First Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="first_name"
                            {...register('first_name', { required: 'First name is required' })}
                            placeholder="John"
                        />
                        {errors.first_name && (
                            <p className="text-sm text-destructive">{errors.first_name.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="last_name">
                            Last Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="last_name"
                            {...register('last_name', { required: 'Last name is required' })}
                            placeholder="Doe"
                        />
                        {errors.last_name && (
                            <p className="text-sm text-destructive">{errors.last_name.message}</p>
                        )}
                    </div>
                </div>

                {/* Username */}
                <div className="space-y-2">
                    <Label htmlFor="username">
                        Username <span className="text-destructive">*</span>
                    </Label>
                    <Input
                        id="username"
                        {...register('username', {
                            required: 'Username is required',
                            pattern: {
                                value: /^[a-z0-9_]+$/,
                                message: 'Username must be lowercase letters, numbers, and underscores only'
                            }
                        })}
                        placeholder="john.doe"
                    />
                    {errors.username && (
                        <p className="text-sm text-destructive">{errors.username.message}</p>
                    )}
                    <p className="text-xs text-muted-foreground">Lowercase letters, numbers, and underscores only</p>
                </div>

                {/* Email */}
                <div className="space-y-2">
                    <Label htmlFor="email">
                        Email <span className="text-destructive">*</span>
                    </Label>
                    <Input
                        id="email"
                        type="email"
                        {...register('email', {
                            required: 'Email is required',
                            pattern: {
                                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                message: 'Invalid email format'
                            }
                        })}
                        placeholder="john.doe@example.com"
                    />
                    {errors.email && (
                        <p className="text-sm text-destructive">{errors.email.message}</p>
                    )}
                </div>

                {/* Password Fields */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="password">
                            Password <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="password"
                            type="password"
                            {...register('password', {
                                required: 'Password is required',
                                minLength: {
                                    value: 8,
                                    message: 'Password must be at least 8 characters'
                                }
                            })}
                            placeholder="••••••••"
                        />
                        {errors.password && (
                            <p className="text-sm text-destructive">{errors.password.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password_confirm">
                            Confirm Password <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="password_confirm"
                            type="password"
                            {...register('password_confirm', { required: 'Please confirm password' })}
                            placeholder="••••••••"
                        />
                        {errors.password_confirm && (
                            <p className="text-sm text-destructive">{errors.password_confirm.message}</p>
                        )}
                    </div>
                </div>

                {/* Optional Fields */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                            id="phone"
                            {...register('phone')}
                            placeholder="+1234567890"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="gender">Gender</Label>
                        <Select
                            value={watch('gender') || undefined}
                            onValueChange={(value) => setValue('gender', value as any)}
                        >
                            <SelectTrigger id="gender">
                                <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                            <SelectContent>
                                {GENDERS.map((g) => (
                                    <SelectItem key={g.value} value={g.value}>
                                        {g.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Date of Birth */}
                <div className="space-y-2">
                    <Label htmlFor="date_of_birth">Date of Birth</Label>
                    <Input
                        id="date_of_birth"
                        type="date"
                        {...register('date_of_birth')}
                    />
                </div>
            </div>
        </InlineCreateModal>
    );
}
