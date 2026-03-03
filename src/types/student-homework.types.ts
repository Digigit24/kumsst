export interface StudentHomework {
    id: number;
    title: string;
    description: string;
    attachment: string | null;
    subject: number;
    subject_name: string;
    teacher_name: string;
    assigned_date: string;
    due_date: string;
    submission_status: 'pending' | 'submitted' | 'graded';
    submission_id: number | null;
}

export interface StudentHomeworkSubmission {
    id: number;
    homework: number;
    homework_title: string;
    student: number;
    student_name: string;
    submission_file: string | null;
    submission_text: string;
    status: 'pending' | 'submitted' | 'approved' | 'rejected' | 'graded';
    completion_date: string;
    remarks: string | null;
    checked_by: number | null;
    checked_date: string | null;
    created_at: string;
    updated_at: string;
}

export interface CreateSubmissionPayload {
    homework: number;
    submission_file?: File;
    submission_text?: string;
    status?: string;
    completion_date?: string;
    remarks?: string;
}

export interface HomeworkFilters {
    page?: number;
    page_size?: number;
    ordering?: string;
    search?: string;
    subject?: number;
}
