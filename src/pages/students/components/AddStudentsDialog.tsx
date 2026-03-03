import { DROPDOWN_PAGE_SIZE } from '@/config/app.config';
import { useDebounce, DEBOUNCE_DELAYS } from '@/hooks/useDebounce';
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Checkbox } from '../../../components/ui/checkbox';
import { ScrollArea } from '../../../components/ui/scroll-area';
import { useStudents, useAddStudentsToGroup } from '../../../hooks/useStudents';

interface AddStudentsDialogProps {
    isOpen: boolean;
    onClose: () => void;
    groupId: number;
    collegeId?: number | null;
    onSuccess: () => void;
}

export const AddStudentsDialog = ({ isOpen, onClose, groupId, collegeId, onSuccess }: AddStudentsDialogProps) => {
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, DEBOUNCE_DELAYS.SEARCH);
    const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);
    const { mutate: addStudents, isLoading: isSaving } = useAddStudentsToGroup();

    // Fetch students with search
    const { data: studentsData, isLoading: isLoadingStudents } = useStudents({
        page: 1,
        page_size: DROPDOWN_PAGE_SIZE,
        college: collegeId || undefined,
        search: debouncedSearchTerm,
        is_active: true,
    });

    const handleToggleStudent = (studentId: number) => {
        setSelectedStudentIds(prev =>
            prev.includes(studentId)
                ? prev.filter(id => id !== studentId)
                : [...prev, studentId]
        );
    };

    const handleSubmit = async () => {
        if (selectedStudentIds.length === 0) return;

        try {
            await addStudents({ id: groupId, studentIds: selectedStudentIds });
            onSuccess();
            onClose();
            setSelectedStudentIds([]);
            setSearchTerm('');
        } catch (error) {
            // Failed to add students
        }
    };

    const handleClose = () => {
        onClose();
        setSelectedStudentIds([]);
        setSearchTerm('');
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Add Students to Group</DialogTitle>
                    <DialogDescription>
                        Search and select students to add to this group.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <Input
                        placeholder="Search students by name or admission number..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />

                    <div className="border rounded-md h-[300px] overflow-hidden flex flex-col">
                        <ScrollArea className="h-full">
                            {isLoadingStudents ? (
                                <div className="flex items-center justify-center h-full p-4">
                                    <span className="text-sm text-muted-foreground">Loading students...</span>
                                </div>
                            ) : studentsData?.results.length === 0 ? (
                                <div className="flex items-center justify-center h-full p-4">
                                    <span className="text-sm text-muted-foreground">No students found</span>
                                </div>
                            ) : (
                                <div className="p-2 space-y-1">
                                    {studentsData?.results.map((student) => (
                                        <div
                                            key={student.id}
                                            className={`flex items-start space-x-3 p-2 rounded-md transition-colors hover:bg-muted/50 cursor-pointer ${selectedStudentIds.includes(student.id) ? 'bg-muted' : ''
                                                }`}
                                            onClick={() => handleToggleStudent(student.id)}
                                        >
                                            <Checkbox
                                                checked={selectedStudentIds.includes(student.id)}
                                                onCheckedChange={() => handleToggleStudent(student.id)}
                                                id={`student-${student.id}`}
                                            />
                                            <div className="grid gap-1.5 leading-none">
                                                <label
                                                    htmlFor={`student-${student.id}`}
                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                                >
                                                    {student.full_name}
                                                </label>
                                                <p className="text-xs text-muted-foreground">
                                                    {student.admission_number} • {student.current_class_name || 'No Class'}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    </div>

                    <div className="text-xs text-muted-foreground text-right">
                        {selectedStudentIds.length} students selected
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleClose} disabled={isSaving}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={isSaving || selectedStudentIds.length === 0}>
                        {isSaving ? (
                            <>
                                <span className="animate-spin mr-2">⏳</span>
                                Adding...
                            </>
                        ) : (
                            `Add Selected (${selectedStudentIds.length})`
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
