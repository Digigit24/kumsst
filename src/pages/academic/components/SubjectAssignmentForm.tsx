/**
 * Subject Assignment Form Component
 */

import { DROPDOWN_PAGE_SIZE } from '@/config/app.config';
import { useAuth } from '@/hooks/useAuth';
import { getCurrentUserCollege } from '@/utils/auth.utils';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { InlineCreateClass } from '../../../components/common/InlineCreateClass';
import { InlineCreateSection } from '../../../components/common/InlineCreateSection';
import { InlineCreateSubject } from '../../../components/common/InlineCreateSubject';
import { Button } from '../../../components/ui/button';
import { Label } from '../../../components/ui/label';
import { SearchableSelectWithCreate } from '../../../components/ui/searchable-select-with-create';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Switch } from '../../../components/ui/switch';
import { useActiveCollegeId } from '../../../contexts/SuperAdminContext';
import {
    invalidateSubjectAssignments,
    useClassesSWR,
    useSectionsSWR,
    useSubjectsSWR
} from '../../../hooks/useAcademicSWR';
import { useTeachersSWR } from '../../../hooks/useAccountsSWR';
import { subjectAssignmentApi } from '../../../services/academic.service';
import type { SubjectAssignmentCreateInput } from '../../../types/academic.types';

interface SubjectAssignmentFormProps {
    mode: 'view' | 'create' | 'edit';
    subjectAssignmentId?: number;
    onSuccess: () => void;
    onCancel: () => void;
}

export function SubjectAssignmentForm({ mode, subjectAssignmentId, onSuccess, onCancel }: SubjectAssignmentFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Inline creation modal states
    const [showClassModal, setShowClassModal] = useState(false);
    const [showSectionModal, setShowSectionModal] = useState(false);
    const [showSubjectModal, setShowSubjectModal] = useState(false);

    const { user } = useAuth();
    const activeCollegeId = useActiveCollegeId();
    const initialCollege = activeCollegeId || getCurrentUserCollege(user as any) || 0;

    const [formData, setFormData] = useState<SubjectAssignmentCreateInput>({
        college: initialCollege,
        subject: 0,
        class_obj: 0,
        section: null,
        teacher: null,
        lab_instructor: null,
        is_optional: false,
        is_active: true,
    });

    // SWR Data Fetching
    const { results: subjects, isLoading: loadingSubjects, refresh: refreshSubjects } = useSubjectsSWR({
        page_size: DROPDOWN_PAGE_SIZE,
        is_active: true
    });

    const { results: classes, isLoading: loadingClasses, refresh: refreshClasses } = useClassesSWR({
        page_size: DROPDOWN_PAGE_SIZE,
        is_active: true
    });

    const { results: teachers, isLoading: loadingTeachers } = useTeachersSWR({
        page_size: DROPDOWN_PAGE_SIZE,
        is_active: true
    });

    // Fetch sections only when class is selected
    const { results: sections, isLoading: loadingSections, refresh: refreshSections } = useSectionsSWR(
        formData.class_obj
            ? {
                class_obj: formData.class_obj,
                page_size: DROPDOWN_PAGE_SIZE,
                is_active: true
            }
            : null
    );

    // Sync with activeCollegeId changes
    useEffect(() => {
        if (activeCollegeId) {
            setFormData(prev => ({ ...prev, college: activeCollegeId }));
        }
    }, [activeCollegeId]);

    useEffect(() => {
        if ((mode === 'edit' || mode === 'view') && subjectAssignmentId) {
            fetchSubjectAssignment();
        }
    }, [mode, subjectAssignmentId]);

    // Reset section when class changes
    useEffect(() => {
        if (!formData.class_obj) {
            setFormData(prev => ({ ...prev, section: null }));
        }
    }, [formData.class_obj]);

    const fetchSubjectAssignment = async () => {
        if (!subjectAssignmentId) return;
        try {
            setIsFetching(true);
            const data = await subjectAssignmentApi.get(subjectAssignmentId);
            setFormData({
                subject: data.subject,
                class_obj: data.class_obj, // This will trigger sections SWR
                section: data.section,
                teacher: data.teacher,
                lab_instructor: data.lab_instructor,
                is_optional: data.is_optional,
                is_active: data.is_active,
            });
        } catch (err: any) {
            setError(typeof err.message === 'string' ? err.message : 'Failed to fetch subject assignment');
        } finally {
            setIsFetching(false);
        }
    };

    // Inline creation success handlers
    const handleSubjectCreated = async (subjectId: number) => {
        await refreshSubjects();
        setFormData(prev => ({ ...prev, subject: subjectId }));
        setShowSubjectModal(false);
    };

    const handleClassCreated = async (classId: number) => {
        await refreshClasses();
        setFormData(prev => ({ ...prev, class_obj: classId, section: null }));
        setShowClassModal(false);
    };

    const handleSectionCreated = async (sectionId: number) => {
        await refreshSections();
        setFormData(prev => ({ ...prev, section: sectionId }));
        setShowSectionModal(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.subject) {
            setError('Please select a subject');
            return;
        }
        if (!formData.class_obj) {
            setError('Please select a class');
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            if (mode === 'create') {
                await subjectAssignmentApi.create(formData);
            } else if (mode === 'edit' && subjectAssignmentId) {
                await subjectAssignmentApi.update(subjectAssignmentId, formData);
            }

            await invalidateSubjectAssignments();
            onSuccess();
        } catch (err: any) {
            const message = err.message || 'Failed to save subject assignment';
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
                    <p className="text-sm text-muted-foreground">Loading subject assignment...</p>
                </div>
            </div>
        );
    }

    const isViewMode = mode === 'view';
    const loadingData = loadingSubjects || loadingClasses || loadingTeachers;

    return (
        <>
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

                {/* Subject */}
                <div className="space-y-2">
                    <Label htmlFor="subject">
                        Subject <span className="text-destructive">*</span>
                    </Label>
                    <SearchableSelectWithCreate
                        options={subjects.map((s) => ({
                            value: s.id,
                            label: `${s.name} (${s.code})`,
                            subtitle: s.subject_type,
                        }))}
                        value={formData.subject}
                        onChange={(value) => setFormData({ ...formData, subject: value as number })}
                        onCreateNew={() => setShowSubjectModal(true)}
                        placeholder="Select subject"
                        searchPlaceholder="Search subjects..."
                        emptyText="No subjects found"
                        emptyActionText="Create a subject to continue"
                        createButtonText="Create New Subject"
                        disabled={isViewMode}
                        isLoading={loadingSubjects}
                    />
                </div>

                {/* Class */}
                <div className="space-y-2">
                    <Label htmlFor="class_obj">
                        Class <span className="text-destructive">*</span>
                    </Label>
                    <SearchableSelectWithCreate
                        options={classes.map((c) => ({
                            value: c.id,
                            label: c.name,
                            subtitle: c.program_name,
                        }))}
                        value={formData.class_obj}
                        onChange={(value) => setFormData({ ...formData, class_obj: value as number, section: null })}
                        onCreateNew={() => setShowClassModal(true)}
                        placeholder="Select class"
                        searchPlaceholder="Search classes..."
                        emptyText="No classes found"
                        emptyActionText="Create a class to continue"
                        createButtonText="Create New Class"
                        disabled={isViewMode}
                        isLoading={loadingClasses}
                    />
                </div>

                {/* Section (Optional) */}
                <div className="space-y-2">
                    <Label htmlFor="section">
                        Section <span className="text-muted-foreground text-xs">(Optional)</span>
                    </Label>
                    <SearchableSelectWithCreate
                        options={sections.map((s) => ({
                            value: s.id,
                            label: s.name,
                            subtitle: s.class_name,
                        }))}
                        value={formData.section || undefined}
                        onChange={(value) => setFormData({ ...formData, section: value as number | null })}
                        onCreateNew={() => {
                            if (!formData.class_obj) {
                                toast.error('Please select a class first');
                                return;
                            }
                            setShowSectionModal(true);
                        }}
                        placeholder={
                            !formData.class_obj ? "Select a class first" :
                                sections.length === 0 ? "No sections for this class" :
                                    "Select section (optional)"
                        }
                        searchPlaceholder="Search sections..."
                        emptyText="No sections found for this class"
                        emptyActionText="Create a section to continue"
                        createButtonText="Create New Section"
                        disabled={isViewMode || !formData.class_obj}
                        isLoading={loadingSections}
                    />
                    <p className="text-xs text-muted-foreground">
                        Leave blank to assign to all sections of the class
                    </p>
                </div>

                {/* Teacher (Optional) */}
                <div className="space-y-2">
                    <Label htmlFor="teacher">
                        Teacher
                    </Label>
                    <Select
                        value={formData.teacher ? String(formData.teacher) : undefined}
                        onValueChange={(v) => setFormData({ ...formData, teacher: v || null })}
                        disabled={isViewMode || loadingTeachers}
                    >
                        <SelectTrigger id="teacher">
                            <SelectValue placeholder={loadingTeachers ? "Loading..." : "Select teacher"} />
                        </SelectTrigger>
                        <SelectContent>
                            {teachers.map((t) => (
                                <SelectItem key={t.id} value={t.id.toString()}>
                                    {t.full_name || t.username} {t.email && `(${t.email})`}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Lab Instructor (Optional) */}
                <div className="space-y-2">
                    <Label htmlFor="lab_instructor">
                        Lab Instructor <span className="text-muted-foreground text-xs">(Optional)</span>
                    </Label>
                    <Select
                        value={formData.lab_instructor ? String(formData.lab_instructor) : undefined}
                        onValueChange={(v) => setFormData({ ...formData, lab_instructor: v || null })}
                        disabled={isViewMode || loadingTeachers}
                    >
                        <SelectTrigger id="lab_instructor">
                            <SelectValue placeholder={loadingTeachers ? "Loading..." : "Select lab instructor (optional)"} />
                        </SelectTrigger>
                        <SelectContent>
                            {teachers.map((t) => (
                                <SelectItem key={t.id} value={t.id.toString()}>
                                    {t.full_name || t.username} {t.email && `(${t.email})`}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Is Optional */}
                <div className="flex items-center justify-between rounded-lg border p-4 bg-muted/50">
                    <div className="space-y-0.5">
                        <Label className="text-base">Optional Subject</Label>
                        <p className="text-xs text-muted-foreground">
                            {formData.is_optional ? 'This is an optional subject for students' : 'This is a mandatory subject'}
                        </p>
                    </div>
                    <Switch
                        checked={formData.is_optional}
                        onCheckedChange={(c) => setFormData({ ...formData, is_optional: c })}
                        disabled={isViewMode}
                    />
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

                {/* Action Buttons */}
                {!isViewMode && (
                    <div className="flex gap-3 pt-4 border-t">
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1"
                        >
                            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            {isLoading ? 'Saving...' : mode === 'create' ? 'Create Subject Assignment' : 'Update Subject Assignment'}
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
            </form>

            {/* Inline Creation Modals */}
            <InlineCreateSubject
                open={showSubjectModal}
                onOpenChange={setShowSubjectModal}
                onSuccess={handleSubjectCreated}
                collegeId={formData.college}
            />

            <InlineCreateClass
                open={showClassModal}
                onOpenChange={setShowClassModal}
                onSuccess={handleClassCreated}
                collegeId={formData.college}
            />

            <InlineCreateSection
                open={showSectionModal}
                onOpenChange={setShowSectionModal}
                onSuccess={handleSectionCreated}
                classId={formData.class_obj || 0}
                collegeId={formData.college}
            />
        </>
    );
}
