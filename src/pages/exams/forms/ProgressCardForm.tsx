import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useStudents } from '@/hooks/useStudents';
import { useExams } from '@/hooks/useExamination';
import type { ProgressCard, ProgressCardCreateInput } from '@/types/examination.types';
import { DROPDOWN_PAGE_SIZE } from '@/config/app.config';
import { Loader2 } from 'lucide-react';

interface ProgressCardFormProps {
    initialData?: ProgressCard;
    onSubmit: (data: any) => void;
    onCancel: () => void;
    isLoading?: boolean;
}

export const ProgressCardForm = ({
    initialData,
    onSubmit,
    onCancel,
    isLoading,
}: ProgressCardFormProps) => {
    const [selectedStudent, setSelectedStudent] = useState<string>(
        initialData?.student ? String(initialData.student) : ''
    );
    const [selectedExam, setSelectedExam] = useState<string>(
        initialData?.exam ? String(initialData.exam) : ''
    );

    const { register, handleSubmit, setValue, formState: { errors } } = useForm<ProgressCardCreateInput>({
        defaultValues: {
            student: initialData?.student || undefined,
            exam: initialData?.exam || undefined,
            issue_date: initialData?.issue_date || new Date().toISOString().split('T')[0],
        },
    });

    // Fetch students and exams for dropdowns
    const { data: studentsData, isLoading: isStudentsLoading } = useStudents({ page_size: DROPDOWN_PAGE_SIZE });
    const { data: examsData, isLoading: isExamsLoading } = useExams({ page_size: DROPDOWN_PAGE_SIZE });

    useEffect(() => {
        if (initialData) {
            setValue('issue_date', initialData.issue_date);
        }
    }, [initialData, setValue]);

    const onFormSubmit = (data: ProgressCardCreateInput) => {
        const formData = new FormData();
        formData.append('student', selectedStudent);
        formData.append('exam', selectedExam);
        formData.append('issue_date', data.issue_date);

        if (data.card_file && data.card_file.length > 0) {
            formData.append('card_file', data.card_file[0]);
        }

        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Student Selection */}
                <div className="space-y-2">
                    <Label htmlFor="student">Student</Label>
                    <Select
                        value={selectedStudent}
                        onValueChange={(value) => {
                            setSelectedStudent(value);
                            setValue('student', parseInt(value));
                        }}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select Student" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                            {isStudentsLoading ? (
                                <div className="flex items-center justify-center p-2 text-sm text-muted-foreground">
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Loading students...
                                </div>
                            ) : (
                                studentsData?.results.map((student) => (
                                    <SelectItem key={student.id} value={String(student.id)}>
                                        {student.full_name} ({student.admission_number})
                                    </SelectItem>
                                ))
                            )}
                        </SelectContent>
                    </Select>
                    {errors.student && <span className="text-sm text-red-500">Student is required</span>}
                </div>

                {/* Exam Selection */}
                <div className="space-y-2">
                    <Label htmlFor="exam">Exam</Label>
                    <Select
                        value={selectedExam}
                        onValueChange={(value) => {
                            setSelectedExam(value);
                            setValue('exam', parseInt(value));
                        }}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select Exam" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                            {isExamsLoading ? (
                                <div className="flex items-center justify-center p-2 text-sm text-muted-foreground">
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Loading exams...
                                </div>
                            ) : (
                                examsData?.results.map((exam: any) => (
                                    <SelectItem key={exam.id} value={String(exam.id)}>
                                        {exam.name}
                                    </SelectItem>
                                ))
                            )}
                        </SelectContent>
                    </Select>
                    {errors.exam && <span className="text-sm text-red-500">Exam is required</span>}
                </div>

                {/* Issue Date */}
                <div className="space-y-2">
                    <Label htmlFor="issue_date">Issue Date</Label>
                    <Input
                        id="issue_date"
                        type="date"
                        {...register('issue_date', { required: 'Issue date is required' })}
                    />
                    {errors.issue_date && (
                        <span className="text-sm text-red-500">{errors.issue_date.message}</span>
                    )}
                </div>

                {/* Card File */}
                <div className="space-y-2">
                    <Label htmlFor="card_file">Card File</Label>
                    <Input
                        id="card_file"
                        type="file"
                        {...register('card_file', { required: !initialData && 'Card file is required' })}
                    />
                    {errors.card_file && (
                        <span className="text-sm text-red-500">{errors.card_file.message}</span>
                    )}
                </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {initialData ? 'Update' : 'Create'}
                </Button>
            </div>
        </form>
    );
};
