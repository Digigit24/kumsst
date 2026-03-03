/**
 * Class Form Component
 * Form for creating and editing classes
 */

import { DROPDOWN_PAGE_SIZE } from '@/config/app.config';
import { useSuperAdminContext } from '@/contexts/SuperAdminContext';
import { useAuth } from '@/hooks/useAuth';
import { getCurrentUserCollege, isSuperAdmin } from '@/utils/auth.utils';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { InlineCreateAcademicSession } from '../../../components/common/InlineCreateAcademicSession';
import { InlineCreateProgram } from '../../../components/common/InlineCreateProgram';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { SearchableSelectWithCreate } from '../../../components/ui/searchable-select-with-create';
import { Switch } from '../../../components/ui/switch';
import { useProgramsSWR } from '../../../hooks/useAcademicSWR';
import { useAcademicSessionsSWR } from '../../../hooks/useCoreSWR';
import { classApi } from '../../../services/academic.service';
import type { Class, ClassCreateInput } from '../../../types/academic.types';

interface ClassFormProps {
    mode: 'view' | 'create' | 'edit';
    classId?: number;
    onSuccess: () => void;
    onCancel: () => void;
}

export function ClassForm({ mode, classId, onSuccess, onCancel }: ClassFormProps) {
    const { user } = useAuth();
    const { selectedCollege } = useSuperAdminContext();
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [classData, setClassData] = useState<Class | null>(null);
    const [showProgramModal, setShowProgramModal] = useState(false);
    const [showSessionModal, setShowSessionModal] = useState(false);

    // Loading states for inline creation
    const [isCreatingProgram, setIsCreatingProgram] = useState(false);
    const [isCreatingSession, setIsCreatingSession] = useState(false);

    // Use SWR hooks for cached data fetching
    const { results: sessions = [], isLoading: isLoadingSessions, refresh: refetchSessions } = useAcademicSessionsSWR({ page_size: DROPDOWN_PAGE_SIZE });
    const { results: programs = [], isLoading: isLoadingPrograms, refresh: refetchPrograms } = useProgramsSWR({ page_size: DROPDOWN_PAGE_SIZE });

    // Get initial college from global selection or user's college
    const getInitialCollege = () => {
        if (isSuperAdmin(user as any)) {
            return selectedCollege || 0;
        }
        return getCurrentUserCollege(user as any) || 0;
    };

    const [formData, setFormData] = useState<ClassCreateInput>({
        college: getInitialCollege(),
        program: 0,
        academic_session: 0,
        name: '',
        semester: 1,
        year: 1,
        max_students: 60,
        is_active: true,
    });

    useEffect(() => {
        // Update college if user loads late
        if (!formData.college && mode === 'create') {
            setFormData(prev => ({ ...prev, college: getCurrentUserCollege(user as any) || 0 }));
        }
    }, [user, mode, formData.college]);

    useEffect(() => {
        if ((mode === 'edit' || mode === 'view') && classId) {
            fetchClass();
        }
    }, [mode, classId]);

    // Auto-update college field when global selection changes (for super admins in create mode)
    useEffect(() => {
        if (mode === 'create' && isSuperAdmin(user as any) && selectedCollege !== undefined) {
            setFormData(prev => ({ ...prev, college: selectedCollege || 0 }));
        }
    }, [selectedCollege, user, mode]);

    const handleProgramCreated = async (programId: number) => {
        setIsCreatingProgram(true);
        try {
            await refetchPrograms();
            setFormData({ ...formData, program: programId });
        } finally {
            setIsCreatingProgram(false);
            setShowProgramModal(false);
        }
    };

    const handleSessionCreated = async (sessionId: number) => {
        setIsCreatingSession(true);
        try {
            await refetchSessions();
            setFormData(prev => ({ ...prev, academic_session: sessionId }));
        } finally {
            setIsCreatingSession(false);
            setShowSessionModal(false);
        }
    };

    const fetchClass = async () => {
        if (!classId) return;

        try {
            setIsFetching(true);
            const data = await classApi.get(classId);
            setClassData(data);
            setFormData({
                college: data.college,
                program: data.program,
                academic_session: data.academic_session,
                name: data.name,
                semester: data.semester,
                year: data.year,
                max_students: data.max_students,
                is_active: data.is_active,
            });
        } catch (err: any) {
            setError(typeof err.message === 'string' ? err.message : 'Failed to fetch class');
        } finally {
            setIsFetching(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setIsLoading(true);
            setError(null);

            // ✅ Log the data being sent for debugging
            console.log('Submitting class data:', formData);

            if (mode === 'create') {
                await classApi.create(formData);
            } else if (mode === 'edit' && classId) {
                await classApi.update(classId, formData);
            }

            onSuccess();
        } catch (err: any) {
            const message = err.message || 'Failed to save class';
            setError(message);
            toast.error(message);
            console.error('Class form error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    if (isFetching) {
        return <div className="flex items-center justify-center py-8"><p className="text-muted-foreground">Loading...</p></div>;
    }

    const isViewMode = mode === 'view';

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {error && <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4"><p className="text-sm text-destructive">{error}</p></div>}

            {/* College is now auto-populated from header selection */}



            <div className="space-y-2">
                <Label>Program <span className="text-destructive">*</span></Label>
                <SearchableSelectWithCreate
                    value={formData.program?.toString() || ''}
                    onChange={(value: string | number) => setFormData({ ...formData, program: parseInt(String(value)) })}
                    options={programs.map((p) => ({
                        value: p.id.toString(),
                        label: p.name,
                    }))}
                    placeholder="Search or create program..."
                    onCreateNew={() => setShowProgramModal(true)}
                    createButtonText="Create New Program"
                    disabled={isViewMode}
                    showCreateButton={!isViewMode}
                    isLoading={isLoadingPrograms || isCreatingProgram}
                />
            </div>

            <div className="space-y-2">
                <Label>Academic Session <span className="text-destructive">*</span></Label>
                <SearchableSelectWithCreate
                    value={formData.academic_session?.toString() || ''}
                    onChange={(value: string | number) => setFormData({ ...formData, academic_session: parseInt(String(value)) })}
                    options={sessions.map((s) => ({
                        value: s.id.toString(),
                        label: s.name,
                    }))}
                    placeholder="Search or create session..."
                    onCreateNew={() => setShowSessionModal(true)}
                    createButtonText="Create New Session"
                    disabled={isViewMode}
                    showCreateButton={!isViewMode}
                    isLoading={isLoadingSessions || isCreatingSession}
                />
            </div>

            <div className="space-y-2">
                <Label>Class Name <span className="text-destructive">*</span></Label>
                <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., BSc CS - Sem 1"
                    disabled={isViewMode}
                    required
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Semester</Label>
                    <Input
                        type="number"
                        value={formData.semester}
                        onChange={(e) => setFormData({ ...formData, semester: e.target.value === '' ? ('' as any) : parseInt(e.target.value) })}
                        min={1}
                        max={12}
                        disabled={isViewMode}
                    />
                </div>
                <div className="space-y-2">
                    <Label>Year</Label>
                    <Input
                        type="number"
                        value={formData.year}
                        onChange={(e) => setFormData({ ...formData, year: e.target.value === '' ? ('' as any) : parseInt(e.target.value) })}
                        min={1}
                        max={6}
                        disabled={isViewMode}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label>Max Students</Label>
                <Input
                    type="number"
                    value={formData.max_students}
                    onChange={(e) => setFormData({ ...formData, max_students: e.target.value === '' ? ('' as any) : parseInt(e.target.value) })}
                    min={1}
                    disabled={isViewMode}
                />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
                <Label>Active Status</Label>
                <Switch
                    checked={formData.is_active}
                    onCheckedChange={(c) => setFormData({ ...formData, is_active: c })}
                    disabled={isViewMode}
                />
            </div>

            {!isViewMode && (
                <div className="flex gap-3 pt-4 border-t">
                    <Button type="submit" disabled={isLoading} className="flex-1">
                        {isLoading ? 'Saving...' : mode === 'create' ? 'Create Class' : 'Update Class'}
                    </Button>
                    <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                        Cancel
                    </Button>
                </div>
            )}

            {/* Inline Program Creation Modal */}
            <InlineCreateProgram
                open={showProgramModal}
                onOpenChange={setShowProgramModal}
                onSuccess={handleProgramCreated}
                collegeId={formData.college || undefined}
            />

            <InlineCreateAcademicSession
                open={showSessionModal}
                onOpenChange={setShowSessionModal}
                onSuccess={handleSessionCreated}
                collegeId={formData.college || undefined}
            />
        </form>
    );
}