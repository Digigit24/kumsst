/**
 * Class Teacher Form Component
 * Enhanced with section support and better UX
 */

import { DROPDOWN_PAGE_SIZE } from '@/config/app.config';
import { useAuth } from '@/hooks/useAuth';
import { getCurrentUserCollege } from '@/utils/auth.utils';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { InlineCreateClass } from '../../../components/common/InlineCreateClass';
import { InlineCreateSection } from '../../../components/common/InlineCreateSection';
import { InlineCreateTeacher } from '../../../components/common/InlineCreateTeacher';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { SearchableSelectWithCreate } from '../../../components/ui/searchable-select-with-create';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Switch } from '../../../components/ui/switch';
import { useAllSectionsSWR, useClassesSWR } from '../../../hooks/useAcademicSWR';
import { useTeachersSWR } from '../../../hooks/useAccountsSWR';
import { useAcademicSessionsSWR } from '../../../hooks/useCoreSWR';
import { classTeacherApi } from '../../../services/academic.service';
import type { ClassTeacherCreateInput } from '../../../types/academic.types';

interface ClassTeacherFormProps {
    mode: 'view' | 'create' | 'edit';
    classTeacherId?: number;
    onSuccess: () => void;
    onCancel: () => void;
}

export function ClassTeacherForm({ mode, classTeacherId, onSuccess, onCancel }: ClassTeacherFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showTeacherModal, setShowTeacherModal] = useState(false);
    const [showClassModal, setShowClassModal] = useState(false);
    const [showSectionModal, setShowSectionModal] = useState(false);

    // Loading states for inline creation
    const [isCreatingClass, setIsCreatingClass] = useState(false);
    const [isCreatingSection, setIsCreatingSection] = useState(false);
    const [isCreatingTeacher, setIsCreatingTeacher] = useState(false);

    const { user } = useAuth();

    const [formData, setFormData] = useState<ClassTeacherCreateInput>({
        class_obj: 0,
        section: 0,
        teacher: '',
        academic_session: 0,
        assigned_from: new Date().toISOString().split('T')[0],
        is_active: true,
        college: getCurrentUserCollege(user as any) || 0,
    });

    // Use SWR hooks for cached data fetching
    const { results: sessions = [], isLoading: isLoadingSessions } = useAcademicSessionsSWR({ page_size: DROPDOWN_PAGE_SIZE });
    const { results: classes = [], isLoading: loadingClasses, refresh: refetchClasses } = useClassesSWR({ page_size: DROPDOWN_PAGE_SIZE });
    const { results: allSections = [], isLoading: loadingSections, refresh: refetchSections } = useAllSectionsSWR();
    const { results: teachers = [], isLoading: loadingTeachers, refresh: refetchTeachers } = useTeachersSWR({ page_size: DROPDOWN_PAGE_SIZE });

    // Filter sections based on selected class
    const sections = formData.class_obj
        ? allSections.filter(s => s.class_obj === formData.class_obj)
        : [];

    useEffect(() => {
        if ((mode === 'edit' || mode === 'view') && classTeacherId) {
            fetchClassTeacher();
        }
    }, [mode, classTeacherId]);

    // Reset section when class changes
    useEffect(() => {
        if (!formData.class_obj) {
            setFormData(prev => ({ ...prev, section: 0 }));
        }
    }, [formData.class_obj]);

    const handleTeacherCreated = async (teacherId: string) => {
        setIsCreatingTeacher(true);
        try {
            await refetchTeachers();
            setFormData({ ...formData, teacher: teacherId });
        } finally {
            setIsCreatingTeacher(false);
            setShowTeacherModal(false);
        }
    };

    const handleClassCreated = async (classId: number) => {
        setIsCreatingClass(true);
        try {
            await refetchClasses();
            setFormData({ ...formData, class_obj: classId, section: 0 });
        } finally {
            setIsCreatingClass(false);
            setShowClassModal(false);
        }
    };

    const handleSectionCreated = async (sectionId: number) => {
        setIsCreatingSection(true);
        try {
            await refetchSections();
            setFormData({ ...formData, section: sectionId });
        } finally {
            setIsCreatingSection(false);
            setShowSectionModal(false);
        }
    };

    const fetchClassTeacher = async () => {
        if (!classTeacherId) return;
        try {
            setIsFetching(true);
            const data = await classTeacherApi.get(classTeacherId);

            // Note: ClassTeacher doesn't have academic_session, 
            // so we'll need to fetch it or use a default
            setFormData({
                class_obj: data.class_obj,
                section: data.section,
                teacher: data.teacher,
                academic_session: 0, // This needs to be fetched separately or derived
                assigned_from: data.assigned_from,
                assigned_to: data.assigned_to || undefined,
                is_current: data.is_current,
                is_active: data.is_active,
            });
        } catch (err: any) {
            setError(typeof err.message === 'string' ? err.message : 'Failed to fetch class teacher');
        } finally {
            setIsFetching(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.class_obj) {
            setError('Please select a class');
            return;
        }
        if (!formData.academic_session) {
            setError('Please select an academic session');
            return;
        }
        if (!formData.teacher || !formData.teacher.trim()) {
            setError('Please select a teacher');
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            if (mode === 'create') {
                await classTeacherApi.create(formData);
            } else if (mode === 'edit' && classTeacherId) {
                await classTeacherApi.update(classTeacherId, formData);
            }

            onSuccess();
        } catch (err: any) {
            const message = err.message || 'Failed to save class teacher';
            setError(message);
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    if (isFetching) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center space-y-3">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Loading class teacher details...</p>
                </div>
            </div>
        );
    }

    const isViewMode = mode === 'view';
    const selectedClass = classes.find(c => c.id === formData.class_obj);

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {error && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                        <div>
                            <h4 className="text-sm font-semibold text-destructive">Error</h4>
                            <p className="text-sm text-destructive/90 mt-1">{error}</p>
                        </div>
                    </div>
                </div>
            )}



            {/* Class Selection */}
            <div className="space-y-2">
                <Label htmlFor="class">
                    Class <span className="text-destructive">*</span>
                </Label>
                <SearchableSelectWithCreate
                    value={formData.class_obj?.toString() || ''}
                    onChange={(value: string | number) => setFormData({ ...formData, class_obj: parseInt(String(value)), section: 0 })}
                    options={classes.map((c) => ({
                        value: c.id.toString(),
                        label: `${c.name} - ${c.program_name}`,
                    }))}
                    placeholder="Search or create class..."
                    onCreateNew={() => setShowClassModal(true)}
                    createButtonText="Create New Class"
                    disabled={isViewMode}
                    isLoading={(loadingClasses && classes.length === 0) || isCreatingClass}
                    showCreateButton={!isViewMode}
                />
                {selectedClass && (
                    <p className="text-xs text-muted-foreground">
                        {selectedClass.program_name} • {selectedClass.session_name}
                    </p>
                )}
            </div>

            {/* Section Selection (Required) */}
            <div className="space-y-2">
                <Label htmlFor="section">
                    Section <span className="text-destructive">*</span>
                </Label>
                <SearchableSelectWithCreate
                    value={formData.section?.toString() || ''}
                    onChange={(value: string | number) => setFormData({ ...formData, section: parseInt(String(value)) })}
                    options={sections.map((s) => ({
                        value: s.id.toString(),
                        label: s.name,
                    }))}
                    placeholder={
                        !formData.class_obj ? "Select a class first" : "Search or create section..."
                    }
                    onCreateNew={() => setShowSectionModal(true)}
                    createButtonText="Create New Section"
                    disabled={isViewMode || !formData.class_obj}
                    isLoading={(loadingSections && allSections.length === 0) || isCreatingSection}
                    showCreateButton={!isViewMode && !!formData.class_obj}
                />
                {sections.length === 0 && Boolean(formData.class_obj) && !loadingSections && (
                    <p className="text-xs text-amber-600">
                        ⚠️ No sections found for this class. Click "Create New Section" to add one.
                    </p>
                )}
            </div>

            {/* Academic Session */}
            <div className="space-y-2">
                <Label htmlFor="session">
                    Academic Session <span className="text-destructive">*</span>
                </Label>
                <Select
                    value={formData.academic_session?.toString()}
                    onValueChange={(v) => setFormData({ ...formData, academic_session: parseInt(v) })}
                    disabled={isViewMode || isLoadingSessions}
                >
                    <SelectTrigger id="session">
                        <SelectValue placeholder="Select academic session" />
                    </SelectTrigger>
                    <SelectContent>
                        {sessions.map((s) => (
                            <SelectItem key={s.id} value={s.id.toString()}>
                                {s.name} {s.is_active && <span className="text-xs text-green-600 ml-2">(Active)</span>}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Teacher */}
            <div className="space-y-2">
                <Label htmlFor="teacher">
                    Teacher <span className="text-destructive">*</span>
                </Label>
                <SearchableSelectWithCreate
                    value={formData.teacher || ''}
                    onChange={(value: string | number) => setFormData({ ...formData, teacher: String(value) })}
                    options={teachers.map((teacher) => ({
                        value: teacher.id,
                        label: `${teacher.full_name || teacher.username}${teacher.email ? ` (${teacher.email})` : ''}`,
                    }))}
                    placeholder="Search or create teacher..."
                    onCreateNew={() => setShowTeacherModal(true)}
                    createButtonText="Create New Teacher"
                    disabled={isViewMode}
                    isLoading={(loadingTeachers && teachers.length === 0) || isCreatingTeacher}
                    showCreateButton={!isViewMode}
                />
                {teachers.length === 0 && !loadingTeachers && (
                    <p className="text-xs text-amber-600">
                        ⚠️ No teachers found. Click "Create New Teacher" to add one.
                    </p>
                )}
            </div>

            {/* Assigned From Date */}
            <div className="space-y-2">
                <Label htmlFor="assigned_from">
                    Assignment Start Date <span className="text-destructive">*</span>
                </Label>
                <Input
                    id="assigned_from"
                    type="date"
                    value={formData.assigned_from}
                    onChange={(e) => setFormData({ ...formData, assigned_from: e.target.value })}
                    disabled={isViewMode}
                    required
                />
                <p className="text-xs text-muted-foreground">
                    The date from which this teacher assignment is effective
                </p>
            </div>

            {/* Assigned To Date (Optional) */}
            <div className="space-y-2">
                <Label htmlFor="assigned_to">
                    Assignment End Date <span className="text-muted-foreground text-xs">(Optional)</span>
                </Label>
                <Input
                    id="assigned_to"
                    type="date"
                    value={formData.assigned_to || ''}
                    onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value || undefined })}
                    disabled={isViewMode}
                    min={formData.assigned_from}
                />
                <p className="text-xs text-muted-foreground">
                    Leave blank if the assignment is ongoing
                </p>
            </div>

            {/* Active Status */}
            <div className="flex items-center justify-between rounded-lg border p-4 bg-muted/50">
                <div className="space-y-0.5">
                    <Label className="text-base">Active Status</Label>
                    <p className="text-xs text-muted-foreground">
                        {formData.is_active ? 'This assignment is active' : 'This assignment is inactive'}
                    </p>
                </div>
                <Switch
                    checked={formData.is_active}
                    onCheckedChange={(c) => setFormData({ ...formData, is_active: c })}
                    disabled={isViewMode}
                />
            </div>

            {/* View Mode Info */}
            {isViewMode && classTeacherId && (
                <div className="rounded-lg bg-muted/50 p-4 space-y-2 text-sm">
                    <h4 className="font-semibold">Assignment Details</h4>
                    <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                        <span>Assignment ID:</span>
                        <span className="font-mono">#{classTeacherId}</span>
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            {!isViewMode && (
                <div className="flex gap-3 pt-4 border-t">
                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1"
                    >
                        {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        {isLoading ? 'Saving...' : mode === 'create' ? 'Assign Class Teacher' : 'Update Assignment'}
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

            {/* Inline Teacher Creation Modal */}
            <InlineCreateTeacher
                open={showTeacherModal}
                onOpenChange={setShowTeacherModal}
                onSuccess={handleTeacherCreated}
                collegeId={formData.college || undefined}
            />

            {/* Inline Class Creation Modal */}
            <InlineCreateClass
                open={showClassModal}
                onOpenChange={setShowClassModal}
                onSuccess={handleClassCreated}
                collegeId={formData.college || undefined}
            />

            {/* Inline Section Creation Modal */}
            {Boolean(formData.class_obj) && (
                <InlineCreateSection
                    open={showSectionModal}
                    onOpenChange={setShowSectionModal}
                    onSuccess={handleSectionCreated}
                    classId={formData.class_obj}
                    collegeId={formData.college || undefined}
                />
            )}
        </form>
    );
}