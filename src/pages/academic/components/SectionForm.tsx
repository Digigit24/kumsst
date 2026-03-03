/**
 * Section Form Component - WITH COLLEGE DROPDOWN + INLINE CLASS CREATION
 */

import { DROPDOWN_PAGE_SIZE } from '@/config/app.config';
import { getCurrentUserCollege } from '@/utils/auth.utils';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { InlineCreateClass } from '../../../components/common/InlineCreateClass';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { SearchableSelectWithCreate } from '../../../components/ui/searchable-select-with-create';
import { Switch } from '../../../components/ui/switch';
import { useActiveCollegeId } from '../../../contexts/SuperAdminContext';
import { useClassesSWR, invalidateClasses } from '../../../hooks/useAcademicSWR';
import { useAuth } from '../../../hooks/useAuth';
import { sectionApi } from '../../../services/academic.service';
import type { ClassFilters, SectionCreateInput } from '../../../types/academic.types';

interface SectionFormProps {
    mode: 'view' | 'create' | 'edit';
    sectionId?: number;
    onSuccess: () => void;
    onCancel: () => void;
}

export function SectionForm({ mode, sectionId, onSuccess, onCancel }: SectionFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showClassModal, setShowClassModal] = useState(false);

    const { user } = useAuth();
    const activeCollegeId = useActiveCollegeId();

    // Use activeCollegeId (from context/header) or fall back to user's college
    // This fixes the issue for Super Admins who select college in header
    const initialCollege = activeCollegeId || getCurrentUserCollege(user as any) || 0;

    const [selectedCollege, setSelectedCollege] = useState<number>(initialCollege);

    // SWR hook for cached class data — replaces manual classApi.list() calls
    const classFilters: ClassFilters | null = useMemo(
        () => selectedCollege ? { college: selectedCollege, page_size: DROPDOWN_PAGE_SIZE, is_active: true } : null,
        [selectedCollege]
    );
    const { results: classes, isLoading: isLoadingClasses, refresh: refetchClasses } = useClassesSWR(classFilters);

    const [formData, setFormData] = useState<SectionCreateInput>({
        college: initialCollege,
        class_obj: 0,
        name: '',
        max_students: 60,
        is_active: true,
    });

    // Sync with activeCollegeId changes
    useEffect(() => {
        if (activeCollegeId) {
            setSelectedCollege(activeCollegeId);
            setFormData(prev => ({ ...prev, college: activeCollegeId }));
        }
    }, [activeCollegeId]);

    // Load section data for edit mode
    useEffect(() => {
        if ((mode === 'edit' || mode === 'view') && sectionId) {
            fetchSection();
        }
    }, [mode, sectionId]);

    const fetchSection = async () => {
        if (!sectionId) return;
        try {
            setIsFetching(true);
            const data = await sectionApi.get(sectionId);
            setFormData({
                class_obj: data.class_obj,
                name: data.name,
                max_students: data.max_students,
                is_active: data.is_active,
            });

            // Find the class to get its college
            const matchingClass = classes.find(c => c.id === data.class_obj);
            if (matchingClass) {
                setSelectedCollege(matchingClass.college);
            }
        } catch (err: any) {
            setError(typeof err.message === 'string' ? err.message : 'Failed to fetch section');
        } finally {
            setIsFetching(false);
        }
    };

    const handleCollegeChange = (collegeId: string) => {
        const id = parseInt(collegeId);
        setSelectedCollege(id);
        // Reset class selection AND update formData college
        setFormData({ ...formData, college: id, class_obj: 0 });
    };

    const handleClassCreated = async (classId: number) => {
        await invalidateClasses();
        await refetchClasses();
        setFormData({ ...formData, class_obj: classId });
        setShowClassModal(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!selectedCollege || selectedCollege === 0) {
            setError('Please select a college first');
            return;
        }

        if (!formData.class_obj || formData.class_obj === 0) {
            setError('Please select a class');
            return;
        }

        if (!formData.name || formData.name.trim() === '') {
            setError('Please enter a section name');
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            // Prepare payload
            const payload = {
                class_obj: formData.class_obj,
                name: formData.name.trim(),
                max_students: formData.max_students,
                is_active: formData.is_active,
            };

            if (mode === 'create') {
                await sectionApi.create(payload);
            } else if (mode === 'edit' && sectionId) {
                await sectionApi.update(sectionId, payload);
            }
            onSuccess();
        } catch (err: any) {
            const errorMessage =
                (typeof err.response?.data?.message === 'string' ? err.response.data.message : null) ||
                (typeof err.response?.data?.detail === 'string' ? err.response.data.detail : null) ||
                (typeof err.message === 'string' ? err.message : null) ||
                'Failed to save section. Please check your inputs and try again.';
            setError(errorMessage);
            toast.error(errorMessage);
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
    const selectedClass = classes.find(c => c.id === formData.class_obj);

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {error && (
                <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4">
                    <p className="text-sm font-semibold text-destructive mb-2">Error:</p>
                    <p className="text-sm text-destructive">{error}</p>
                </div>
            )}



            {/* Class Selection */}
            <div className="space-y-2">
                <Label>
                    Class <span className="text-destructive">*</span>
                </Label>
                <SearchableSelectWithCreate
                    options={classes.map((c) => ({
                        value: c.id,
                        label: c.name,
                        subtitle: c.program_name,
                    }))}
                    value={formData.class_obj}
                    onChange={(value) => setFormData({ ...formData, class_obj: value as number })}
                    onCreateNew={() => {
                        if (!selectedCollege) {
                            toast.error('Please select a college first');
                            return;
                        }
                        setShowClassModal(true);
                    }}
                    placeholder={!selectedCollege ? "Select college first" : "Select class"}
                    searchPlaceholder="Search classes..."
                    emptyText={!selectedCollege ? "Select a college first" : "No classes found for this college"}
                    emptyActionText="Create a class to continue"
                    createButtonText="Create New Class"
                    disabled={isViewMode || !selectedCollege}
                    isLoading={isLoadingClasses}
                />
                {selectedClass && (
                    <p className="text-xs text-muted-foreground">
                        Selected: {selectedClass.name} - {selectedClass.program_name}
                    </p>
                )}
            </div>

            {/* Section Details */}
            <div className="space-y-4 pt-2 border-t">

                <div className="space-y-2">
                    <Label htmlFor="name">
                        Section Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g., Section A, Section B, Morning Batch"
                        disabled={isViewMode}
                        required
                    />
                    <p className="text-xs text-muted-foreground">
                        Use descriptive names like "Section A", "Morning Batch", "Group 1"
                    </p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="max_students">Maximum Students</Label>
                    <Input
                        id="max_students"
                        type="number"
                        min="1"
                        max="200"
                        value={formData.max_students}
                        onChange={(e) => setFormData({ ...formData, max_students: e.target.value === '' ? ('' as any) : parseInt(e.target.value) })}
                        disabled={isViewMode}
                    />
                    <p className="text-xs text-muted-foreground">
                        Maximum number of students allowed in this section
                    </p>
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                        <Label>Active Status</Label>
                        <p className="text-xs text-muted-foreground">
                            Enable this section for new admissions
                        </p>
                    </div>
                    <Switch
                        checked={formData.is_active}
                        onCheckedChange={(c) => setFormData({ ...formData, is_active: c })}
                        disabled={isViewMode}
                    />
                </div>
            </div>

            {!isViewMode && (
                <div className="flex gap-3 pt-4 border-t">
                    <Button type="submit" disabled={isLoading || !selectedCollege} className="flex-1">
                        {isLoading ? 'Saving...' : mode === 'create' ? 'Create Section' : 'Update Section'}
                    </Button>
                    <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                        Cancel
                    </Button>
                </div>
            )}

            {/* Inline Creation Modal */}
            <InlineCreateClass
                open={showClassModal}
                onOpenChange={setShowClassModal}
                onSuccess={handleClassCreated}
                collegeId={selectedCollege}
            />
        </form>
    );
}