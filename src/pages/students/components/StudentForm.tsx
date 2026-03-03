/**
 * Student Form Component - Matches backend API structure
 */

import { DROPDOWN_PAGE_SIZE } from '@/config/app.config';
import { useSuperAdminContext } from '@/contexts/SuperAdminContext';
import { useAuth } from '@/hooks/useAuth';
import { getCurrentUserCollege, isSuperAdmin } from '@/utils/auth.utils';
import { useEffect, useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { useAllSectionsSWR, useClassesSWR, useProgramsSWR } from '../../../hooks/useAcademicSWR';
import { useUsersSWR } from '../../../hooks/useAccounts';
import { useAcademicYearsSWR } from '../../../hooks/useCoreSWR';
import { studentApi } from '../../../services/students.service';

interface StudentFormProps {
    mode: 'view' | 'create' | 'edit';
    studentId?: number;
    onSuccess: () => void;
    onCancel: () => void;
}

interface StudentFormData {
    user?: string; // UUID - optional for create, backend may auto-create
    college: number | null;
    admission_number: string;
    admission_date: string;
    admission_type: string;
    roll_number: string;
    registration_number: string;
    program: number;
    current_class: number | null;
    current_section: number | null;
    academic_year: number;
    category: number | null;
    group: number | null;
    first_name: string;
    middle_name: string;
    last_name: string;
    date_of_birth: string;
    gender: string;
    blood_group: string;
    email: string;
    phone: string;
    alternate_phone: string;
    photo: string;
    nationality: string;
    religion: string;
    caste: string;
    mother_tongue: string;
    aadhar_number: string;
    pan_number: string;
    is_active: boolean;
    is_alumni: boolean;
    disabled_date: string;
    disable_reason: string;
    optional_subjects: number[];
    custom_fields: Record<string, any>;
}

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

export function StudentForm({ mode, studentId, onSuccess, onCancel }: StudentFormProps) {
    const { user } = useAuth();
    const { selectedCollege } = useSuperAdminContext();
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState("basic");

    // Get initial college - use global selection if super admin, otherwise use user's college
    const getInitialCollege = () => {
        if (isSuperAdmin(user as any)) {
            return selectedCollege || 1;
        }
        return getCurrentUserCollege(user as any) || 1;
    };

    const [formData, setFormData] = useState<StudentFormData>({
        user: '', // Will be auto-generated or manually entered
        college: getInitialCollege(),
        admission_number: '',
        admission_date: new Date().toISOString().split('T')[0],
        admission_type: 'regular',
        roll_number: '',
        registration_number: '',
        program: 0,
        current_class: null,
        current_section: null,
        academic_year: 0,
        category: null,
        group: null,
        first_name: '',
        middle_name: '',
        last_name: '',
        date_of_birth: '',
        gender: 'male',
        blood_group: '',
        email: '',
        phone: '',
        alternate_phone: '',
        photo: '',
        nationality: 'Indian',
        religion: '',
        caste: '',
        mother_tongue: '',
        aadhar_number: '',
        pan_number: '',
        is_active: true,
        is_alumni: false,
        disabled_date: '',
        disable_reason: '',
        optional_subjects: [],
        custom_fields: {},
    });

    const { results: programs = [] } = useProgramsSWR({ page_size: DROPDOWN_PAGE_SIZE, is_active: true });
    const { results: classes = [] } = useClassesSWR({ page_size: DROPDOWN_PAGE_SIZE, is_active: true });
    // Use shared prefetched sections cache
    const { results: sections = [] } = useAllSectionsSWR();
    const { results: years = [] } = useAcademicYearsSWR({ page_size: DROPDOWN_PAGE_SIZE });
    // Fetch all student-type users so we can show names/emails instead of raw UUIDs
    const { data: studentUsersData, isLoading: isUsersLoading, error: usersError } = useUsersSWR({ user_type: 'student', page_size: DROPDOWN_PAGE_SIZE });
    const hasStudentUsers = (studentUsersData?.results?.length || 0) > 0;

    useEffect(() => {
        if ((mode === 'edit' || mode === 'view') && studentId) {
            fetchStudent();
        } else if (mode === 'create') {
            // College is already initialized via state using utility
            // If super admin and no college set, keep it null or strict
            if (isSuperAdmin(user as any) && !formData.college) {
                setFormData(prev => ({ ...prev, college: null }));
            } else if (!formData.college) {
                setFormData(prev => ({ ...prev, college: getCurrentUserCollege(user as any) }));
            }
        }
    }, [mode, studentId, user]);

    // Auto-update college field when global selection changes (for super admins)
    useEffect(() => {
        if (isSuperAdmin(user as any) && selectedCollege !== undefined) {
            setFormData(prev => ({ ...prev, college: selectedCollege }));
        }
    }, [selectedCollege, user]);

    // Default academic year to current (or first) once loaded
    useEffect(() => {
        if (!formData.academic_year && years.length) {
            const current = years.find((y: any) => y.is_current);
            const fallback = years[0];
            setFormData(prev => ({
                ...prev,
                academic_year: (current?.id ?? fallback?.id) || prev.academic_year,
            }));
        }
    }, [formData.academic_year, years]);

    const handleUserSelect = (userId: string) => {
        const selected = studentUsersData?.results.find((u: any) => u.id === userId);
        const fullNameParts = (selected?.full_name || '').trim().split(/\s+/).filter(Boolean);
        const derivedFirst = fullNameParts[0] || '';
        const derivedLast = fullNameParts.slice(1).join(' ');

        setFormData((prev) => ({
            ...prev,
            user: userId,
            email: prev.email || selected?.email || '',
            first_name: prev.first_name || derivedFirst,
            last_name: prev.last_name || derivedLast || prev.last_name,
        }));
    };

    const fetchStudent = async () => {
        if (!studentId) return;
        try {
            setIsFetching(true);
            const data = await studentApi.get(studentId);
            setFormData({
                user: data.user?.toString() || '',
                college: data.college,
                admission_number: data.admission_number,
                admission_date: data.admission_date,
                admission_type: data.admission_type,
                roll_number: data.roll_number || '',
                registration_number: data.registration_number,
                program: data.program,
                current_class: data.current_class,
                current_section: data.current_section,
                academic_year: data.academic_year,
                category: data.category,
                group: data.group,
                first_name: data.first_name,
                middle_name: data.middle_name || '',
                last_name: data.last_name,
                date_of_birth: data.date_of_birth,
                gender: data.gender,
                blood_group: data.blood_group || '',
                email: data.email,
                phone: data.phone || '',
                alternate_phone: data.alternate_phone || '',
                nationality: data.nationality || 'Indian',
                religion: data.religion || '',
                caste: data.caste || '',
                mother_tongue: data.mother_tongue || '',
                aadhar_number: data.aadhar_number || '',
                pan_number: data.pan_number || '',
                photo: data.photo || '',
                is_active: data.is_active,
                is_alumni: data.is_alumni,
                disabled_date: data.disabled_date || '',
                disable_reason: data.disable_reason || '',
                optional_subjects: data.optional_subjects || [],
                custom_fields: data.custom_fields || {},
            });
        } catch (err: any) {
            setError(typeof err.message === 'string' ? err.message : 'Failed to fetch student');
        } finally {
            setIsFetching(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.user?.trim()) {
            setError('Please provide the user ID/UUID for this student');
            return;
        }

        if (isSuperAdmin(user as any) && !formData.college) {
            setError('College is required');
            return;
        }

        if (!formData.first_name || !formData.last_name || !formData.email || !formData.admission_number || !formData.registration_number || !formData.date_of_birth) {
            setError('Please fill all required fields (marked with *)');
            return;
        }

        if (!formData.program || formData.program === 0) {
            setError('Please select a program');
            return;
        }

        if (!formData.academic_year || formData.academic_year === 0) {
            setError('Please select an academic year');
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            // Prepare payload matching backend structure
            const payload = {
                user: formData.user?.trim(), // Required by backend (accounts user id/uuid)
                college: formData.college,
                admission_number: formData.admission_number,
                admission_date: formData.admission_date,
                admission_type: formData.admission_type,
                roll_number: formData.roll_number || null,
                registration_number: formData.registration_number,
                program: formData.program,
                current_class: formData.current_class || null,
                current_section: formData.current_section || null,
                academic_year: formData.academic_year,
                category: formData.category || null,
                group: formData.group || null,
                first_name: formData.first_name,
                middle_name: formData.middle_name || null,
                last_name: formData.last_name,
                date_of_birth: formData.date_of_birth,
                gender: formData.gender,
                blood_group: formData.blood_group || null,
                email: formData.email,
                phone: formData.phone || null,
                alternate_phone: formData.alternate_phone || null,
                photo: formData.photo || null,
                nationality: formData.nationality || 'Indian',
                religion: formData.religion || null,
                caste: formData.caste || null,
                mother_tongue: formData.mother_tongue || null,
                aadhar_number: formData.aadhar_number || null,
                pan_number: formData.pan_number || null,
                is_active: formData.is_active,
                is_alumni: formData.is_alumni,
                disabled_date: formData.disabled_date || null,
                disable_reason: formData.disable_reason || null,
                optional_subjects: formData.optional_subjects.length > 0 ? formData.optional_subjects : [],
                custom_fields: formData.custom_fields || {},
            };

            if (mode === 'create') {
                await studentApi.create(payload as any);
            } else if (mode === 'edit' && studentId) {
                await studentApi.update(studentId, payload as any);
            }
            onSuccess();
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Failed to save student');
        } finally {
            setIsLoading(false);
        }
    };

    if (isFetching) {
        return (
            <div className="flex items-center justify-center py-8">
                <p className="text-muted-foreground">Loading...</p>
            </div>
        );
    }

    const isViewMode = mode === 'view';

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {error && (
                <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4">
                    <p className="text-sm text-destructive">{error}</p>
                </div>
            )}

            <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
            >

                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="basic">Basic Info</TabsTrigger>
                    <TabsTrigger value="academic">Academic</TabsTrigger>
                    <TabsTrigger value="contact">Contact</TabsTrigger>
                </TabsList>

                {/* BASIC INFO TAB */}
                <TabsContent value="basic" className="space-y-4 mt-4">
                    <div className="space-y-2">
                        <Label>User (accounts) <span className="text-destructive">*</span></Label>
                        {hasStudentUsers ? (
                            <Select
                                value={formData.user || undefined}
                                onValueChange={handleUserSelect}
                                disabled={isViewMode || isUsersLoading}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={isUsersLoading ? 'Loading users...' : 'Select linked user'} />
                                </SelectTrigger>
                                <SelectContent>
                                    {studentUsersData?.results.map((u) => (
                                        <SelectItem key={u.id} value={u.id}>
                                            {u.full_name || u.username} ({u.email})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        ) : (
                            <Input
                                value={formData.user}
                                onChange={(e) => setFormData({ ...formData, user: e.target.value })}
                                placeholder={isUsersLoading ? 'Loading users...' : 'Enter linked user ID/UUID'}
                                disabled={isViewMode || isUsersLoading}
                                required
                            />
                        )}
                        {!hasStudentUsers && !isUsersLoading && (
                            <p className="text-xs text-muted-foreground">
                                No student users found for this college. Create a student user in Accounts, then paste its ID/UUID here.
                            </p>
                        )}
                        {usersError && <p className="text-xs text-destructive">Failed to load student users: {usersError instanceof Error ? usersError.message : String(usersError)}</p>}
                    </div>

                    {/* College is now auto-populated from header selection */}

                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="first_name">
                                First Name <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="first_name"
                                value={formData.first_name}
                                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                disabled={isViewMode}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="middle_name">Middle Name</Label>
                            <Input
                                id="middle_name"
                                value={formData.middle_name}
                                onChange={(e) => setFormData({ ...formData, middle_name: e.target.value })}
                                disabled={isViewMode}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="last_name">
                                Last Name <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="last_name"
                                value={formData.last_name}
                                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                disabled={isViewMode}
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="date_of_birth">
                                Date of Birth <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="date_of_birth"
                                type="date"
                                value={formData.date_of_birth}
                                onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                                disabled={isViewMode}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>
                                Gender <span className="text-destructive">*</span>
                            </Label>
                            <Select
                                value={formData.gender}
                                onValueChange={(v) => setFormData({ ...formData, gender: v })}
                                disabled={isViewMode}
                            >
                                <SelectTrigger>
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
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Blood Group</Label>
                            <Select
                                value={formData.blood_group || undefined}
                                onValueChange={(v) => setFormData({ ...formData, blood_group: v })}
                                disabled={isViewMode}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select blood group" />
                                </SelectTrigger>
                                <SelectContent>
                                    {BLOOD_GROUPS.map((bg) => (
                                        <SelectItem key={bg} value={bg}>
                                            {bg}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="nationality">Nationality</Label>
                            <Input
                                id="nationality"
                                value={formData.nationality}
                                onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                                disabled={isViewMode}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="religion">Religion</Label>
                            <Input
                                id="religion"
                                value={formData.religion}
                                onChange={(e) => setFormData({ ...formData, religion: e.target.value })}
                                disabled={isViewMode}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="caste">Caste</Label>
                            <Input
                                id="caste"
                                value={formData.caste}
                                onChange={(e) => setFormData({ ...formData, caste: e.target.value })}
                                disabled={isViewMode}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="mother_tongue">Mother Tongue</Label>
                            <Input
                                id="mother_tongue"
                                value={formData.mother_tongue}
                                onChange={(e) => setFormData({ ...formData, mother_tongue: e.target.value })}
                                disabled={isViewMode}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="aadhar_number">Aadhar Number</Label>
                            <Input
                                id="aadhar_number"
                                value={formData.aadhar_number}
                                onChange={(e) => setFormData({ ...formData, aadhar_number: e.target.value })}
                                placeholder="XXXX-XXXX-XXXX"
                                maxLength={12}
                                disabled={isViewMode}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="pan_number">PAN Number</Label>
                            <Input
                                id="pan_number"
                                value={formData.pan_number}
                                onChange={(e) => setFormData({ ...formData, pan_number: e.target.value.toUpperCase() })}
                                placeholder="ABCDE1234F"
                                maxLength={10}
                                disabled={isViewMode}
                            />
                        </div>
                    </div>
                </TabsContent>

                {/* ACADEMIC TAB */}
                <TabsContent value="academic" className="space-y-4 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="admission_number">
                                Admission Number <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="admission_number"
                                value={formData.admission_number}
                                onChange={(e) => setFormData({ ...formData, admission_number: e.target.value })}
                                placeholder="e.g., ADM2024001"
                                disabled={isViewMode}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="registration_number">
                                Registration Number <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="registration_number"
                                value={formData.registration_number}
                                onChange={(e) => setFormData({ ...formData, registration_number: e.target.value })}
                                placeholder="e.g., REG2024001"
                                disabled={isViewMode}
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="roll_number">Roll Number</Label>
                            <Input
                                id="roll_number"
                                value={formData.roll_number}
                                onChange={(e) => setFormData({ ...formData, roll_number: e.target.value })}
                                placeholder="e.g., 001"
                                disabled={isViewMode}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="admission_date">
                                Admission Date <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="admission_date"
                                type="date"
                                value={formData.admission_date}
                                onChange={(e) => setFormData({ ...formData, admission_date: e.target.value })}
                                disabled={isViewMode}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>
                            Admission Type <span className="text-destructive">*</span>
                        </Label>
                        <Select
                            value={formData.admission_type}
                            onValueChange={(v) => setFormData({ ...formData, admission_type: v })}
                            disabled={isViewMode}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {ADMISSION_TYPES.map((t) => (
                                    <SelectItem key={t.value} value={t.value}>
                                        {t.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>
                            Program <span className="text-destructive">*</span>
                        </Label>
                        <Select
                            value={formData.program?.toString()}
                            onValueChange={(v) => setFormData({ ...formData, program: parseInt(v) })}
                            disabled={isViewMode}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select program" />
                            </SelectTrigger>
                            <SelectContent>
                                {programs.map((p) => (
                                    <SelectItem key={p.id} value={p.id.toString()}>
                                        {p.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Current Class</Label>
                            <Select
                                value={formData.current_class?.toString() || undefined}
                                onValueChange={(v) => setFormData({ ...formData, current_class: v ? parseInt(v) : null })}
                                disabled={isViewMode}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select class (optional)" />
                                </SelectTrigger>
                                <SelectContent>
                                    {classes.map((c) => (
                                        <SelectItem key={c.id} value={c.id.toString()}>
                                            {c.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Current Section</Label>
                            <Select
                                value={formData.current_section?.toString() || undefined}
                                onValueChange={(v) => setFormData({ ...formData, current_section: v ? parseInt(v) : null })}
                                disabled={isViewMode || !formData.current_class}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select section (optional)" />
                                </SelectTrigger>
                                <SelectContent>
                                    {sections.map((s) => (
                                        <SelectItem key={s.id} value={s.id.toString()}>
                                            {s.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>
                            Academic Year <span className="text-destructive">*</span>
                        </Label>
                        <Select
                            value={formData.academic_year?.toString()}
                            onValueChange={(v) => setFormData({ ...formData, academic_year: parseInt(v) })}
                            disabled={isViewMode}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select year" />
                            </SelectTrigger>
                            <SelectContent>
                                {years.map((y) => (
                                    <SelectItem key={y.id} value={y.id.toString()}>
                                        {y.year} {y.is_current && '(Current)'}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </TabsContent>

                {/* CONTACT TAB */}
                <TabsContent value="contact" className="space-y-4 mt-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">
                            Email <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="student@example.com"
                            disabled={isViewMode}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                                id="phone"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="+91 XXXXX XXXXX"
                                disabled={isViewMode}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="alternate_phone">Alternate Phone</Label>
                            <Input
                                id="alternate_phone"
                                value={formData.alternate_phone}
                                onChange={(e) => setFormData({ ...formData, alternate_phone: e.target.value })}
                                placeholder="+91 XXXXX XXXXX"
                                disabled={isViewMode}
                            />
                        </div>
                    </div>
                </TabsContent>
            </Tabs>

            {
                !isViewMode && (
                    <div className="flex gap-3 pt-4 border-t sticky bottom-0 bg-background">
                        <Button type="submit" disabled={isLoading} className="flex-1">
                            {isLoading ? 'Saving...' : mode === 'create' ? 'Create Student' : 'Update Student'}
                        </Button>
                        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                            Cancel
                        </Button>
                    </div>
                )
            }
        </form >
    );
}
