/**
 * Program Form Component
 * Form for creating and editing programs
 */

import { DROPDOWN_PAGE_SIZE } from '@/config/app.config';
import { useAuth } from '@/hooks/useAuth';
import { getCurrentUserCollege } from '@/utils/auth.utils';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { InlineCreateFaculty } from '../../../components/common/InlineCreateFaculty';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { SearchableSelectWithCreate } from '../../../components/ui/searchable-select-with-create';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Switch } from '../../../components/ui/switch';
import { Textarea } from '../../../components/ui/textarea';
import { facultyApi, programApi } from '../../../services/academic.service';
import type { FacultyListItem, Program, ProgramCreateInput, ProgramUpdateInput } from '../../../types/academic.types';

interface ProgramFormProps {
    mode: 'view' | 'create' | 'edit';
    programId?: number;
    onSuccess: () => void;
    onCancel: () => void;
}

const PROGRAM_TYPES = [
    { value: 'undergraduate', label: 'Undergraduate' },
    { value: 'postgraduate', label: 'Postgraduate' },
    { value: 'diploma', label: 'Diploma' },
    { value: 'certificate', label: 'Certificate' },
];

const DURATION_TYPES = [
    { value: 'years', label: 'Years' },
    { value: 'months', label: 'Months' },
    { value: 'semesters', label: 'Semesters' },
];

export function ProgramForm({ mode, programId, onSuccess, onCancel }: ProgramFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [program, setProgram] = useState<Program | null>(null);
    const [faculties, setFaculties] = useState<FacultyListItem[]>([]);
    const [isLoadingFaculties, setIsLoadingFaculties] = useState(false);
    const [showFacultyModal, setShowFacultyModal] = useState(false);

    const { user } = useAuth();
    const [formData, setFormData] = useState<ProgramCreateInput>({
        college: getCurrentUserCollege(user as any) || 0,
        faculty: 0,
        code: '',
        name: '',
        short_name: '',
        program_type: 'undergraduate',
        duration: 4,
        duration_type: 'years',
        total_credits: null,
        description: '',
        display_order: 0,
        is_active: true,
    });

    // Fetch faculties for dropdown
    useEffect(() => {
        fetchFaculties();
    }, []);

    // Fetch program data if editing or viewing
    useEffect(() => {
        if ((mode === 'edit' || mode === 'view') && programId) {
            fetchProgram();
        }
    }, [mode, programId]);

    const fetchFaculties = async () => {
        try {
            setIsLoadingFaculties(true);
            const data = await facultyApi.list({ page_size: DROPDOWN_PAGE_SIZE });
            setFaculties(data.results);
        } catch (err) {
            // Failed to fetch faculties
        } finally {
            setIsLoadingFaculties(false);
        }
    };

    const handleFacultyCreated = async (facultyId: number) => {
        await fetchFaculties();
        setFormData({ ...formData, faculty: facultyId });
        setShowFacultyModal(false);
    };

    const fetchProgram = async () => {
        if (!programId) return;

        try {
            setIsFetching(true);
            setError(null);
            const data = await programApi.get(programId);
            setProgram(data);
            setFormData({
                college: data.college,
                faculty: data.faculty,
                code: data.code,
                name: data.name,
                short_name: data.short_name,
                program_type: data.program_type,
                duration: data.duration,
                duration_type: data.duration_type,
                total_credits: data.total_credits,
                description: data.description || '',
                display_order: data.display_order,
                is_active: data.is_active,
            });
        } catch (err: any) {
            setError(typeof err.message === 'string' ? err.message : 'Failed to fetch program');
        } finally {
            setIsFetching(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.faculty) {
            setError('Please select a faculty');
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            if (mode === 'create') {
                await programApi.create(formData);
            } else if (mode === 'edit' && programId) {
                await programApi.update(programId, formData as ProgramUpdateInput);
            }

            onSuccess();
            onSuccess();
        } catch (err: any) {
            const message = err.message || 'Failed to save program';
            setError(message);
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (field: keyof ProgramCreateInput, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    if (isFetching) {
        return (
            <div className="flex items-center justify-center py-8">
                <p className="text-muted-foreground">Loading program data...</p>
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



            {/* Faculty Selection */}
            <div className="space-y-2">
                <Label htmlFor="faculty">
                    Faculty <span className="text-destructive">*</span>
                </Label>
                <SearchableSelectWithCreate
                    value={formData.faculty?.toString() || ''}
                    onChange={(value: string | number) => handleChange('faculty', parseInt(String(value)))}
                    options={faculties.map((faculty) => ({
                        value: faculty.id.toString(),
                        label: faculty.name,
                    }))}
                    placeholder="Search or create faculty..."
                    onCreateNew={() => setShowFacultyModal(true)}
                    createButtonText="Create New Faculty"
                    disabled={isViewMode}
                    showCreateButton={!isViewMode}
                    isLoading={isLoadingFaculties}
                />
            </div>

            {/* Code */}
            <div className="space-y-2">
                <Label htmlFor="code">
                    Program Code <span className="text-destructive">*</span>
                </Label>
                <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => handleChange('code', e.target.value)}
                    placeholder="e.g., BSC-CS, MBA, BTECH"
                    disabled={isViewMode}
                    required
                />
            </div>

            {/* Name */}
            <div className="space-y-2">
                <Label htmlFor="name">
                    Program Name <span className="text-destructive">*</span>
                </Label>
                <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="e.g., Bachelor of Science in Computer Science"
                    disabled={isViewMode}
                    required
                />
            </div>

            {/* Short Name */}
            <div className="space-y-2">
                <Label htmlFor="short_name">
                    Short Name <span className="text-destructive">*</span>
                </Label>
                <Input
                    id="short_name"
                    value={formData.short_name}
                    onChange={(e) => handleChange('short_name', e.target.value)}
                    placeholder="e.g., BSc CS"
                    disabled={isViewMode}
                    required
                />
            </div>

            {/* Program Type */}
            <div className="space-y-2">
                <Label htmlFor="program_type">
                    Program Type <span className="text-destructive">*</span>
                </Label>
                <Select
                    value={formData.program_type}
                    onValueChange={(value) => handleChange('program_type', value)}
                    disabled={isViewMode}
                >
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {PROGRAM_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                                {type.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Duration */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="duration">
                        Duration <span className="text-destructive">*</span>
                    </Label>
                    <Input
                        id="duration"
                        type="number"
                        value={formData.duration}
                        onChange={(e) => handleChange('duration', e.target.value === '' ? ('' as any) : parseInt(e.target.value))}
                        min={1}
                        disabled={isViewMode}
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="duration_type">Duration Type</Label>
                    <Select
                        value={formData.duration_type}
                        onValueChange={(value) => handleChange('duration_type', value)}
                        disabled={isViewMode}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {DURATION_TYPES.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                    {type.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Total Credits */}
            <div className="space-y-2">
                <Label htmlFor="total_credits">Total Credits (Optional)</Label>
                <Input
                    id="total_credits"
                    type="number"
                    value={formData.total_credits || ''}
                    onChange={(e) => handleChange('total_credits', e.target.value === '' ? null : parseInt(e.target.value))}
                    placeholder="e.g., 120"
                    min={1}
                    disabled={isViewMode}
                />
            </div>

            {/* Description */}
            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                    id="description"
                    value={formData.description || ''}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="Enter program description..."
                    disabled={isViewMode}
                    rows={3}
                />
            </div>

            {/* Display Order */}
            <div className="space-y-2">
                <Label htmlFor="display_order">Display Order</Label>
                <Input
                    id="display_order"
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => handleChange('display_order', e.target.value === '' ? ('' as any) : parseInt(e.target.value))}
                    disabled={isViewMode}
                />
            </div>

            {/* Active Status */}
            <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                    <Label htmlFor="is_active">Active Status</Label>
                    <p className="text-sm text-muted-foreground">
                        Inactive programs won't be available for selection
                    </p>
                </div>
                <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => handleChange('is_active', checked)}
                    disabled={isViewMode}
                />
            </div>

            {/* View Mode Info */}
            {isViewMode && program && (
                <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
                    <div className="text-sm">
                        <span className="text-muted-foreground">Created:</span>{' '}
                        {new Date(program.created_at).toLocaleString()}
                        {program.created_by && ` by ${program.created_by.full_name}`}
                    </div>
                    <div className="text-sm">
                        <span className="text-muted-foreground">Last Updated:</span>{' '}
                        {new Date(program.updated_at).toLocaleString()}
                        {program.updated_by && ` by ${program.updated_by.full_name}`}
                    </div>
                </div>
            )}

            {/* Actions */}
            {!isViewMode && (
                <div className="flex gap-3 pt-4 border-t">
                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1"
                    >
                        {isLoading ? 'Saving...' : mode === 'create' ? 'Create Program' : 'Update Program'}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                </div>
            )}

            {/* Inline Faculty Creation Modal */}
            <InlineCreateFaculty
                open={showFacultyModal}
                onOpenChange={setShowFacultyModal}
                onSuccess={handleFacultyCreated}
                collegeId={formData.college || undefined}
            />
        </form>
    );
}