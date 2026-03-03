import { DROPDOWN_PAGE_SIZE } from '@/config/app.config';
import { DetailSidebar } from '@/components/common/DetailSidebar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useSubmitHomework, useStudentHomework } from '@/hooks/useStudentHomework';
import type { StudentHomework } from '@/types/student-homework.types';
import { AlertCircle, CheckCircle2, Clock, Download, FileText, Loader2, Upload } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';

export const Homework: React.FC = () => {
    const [activeTab, setActiveTab] = useState('all');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [selectedHomework, setSelectedHomework] = useState<StudentHomework | null>(null);

    // Submission state
    const [submissionFile, setSubmissionFile] = useState<File | null>(null);
    const [submissionText, setSubmissionText] = useState('');
    const submitHomeworkMutation = useSubmitHomework();
    const isSubmitting = submitHomeworkMutation.isPending;

    // Fetch homework
    const { data, isLoading, error } = useStudentHomework({ page_size: DROPDOWN_PAGE_SIZE });
    const homeworkList = data?.results || [];

    const handleViewDetails = (homework: StudentHomework) => {
        setSelectedHomework(homework);
        setIsSidebarOpen(true);
        // Reset form
        setSubmissionFile(null);
        setSubmissionText('');
    };

    const handleCloseSidebar = () => {
        setIsSidebarOpen(false);
        setSelectedHomework(null);
    };

    const handleSubmit = async () => {
        if (!selectedHomework) return;
        if (!submissionFile && !submissionText) {
            toast.error("Please provide a file or text to submit");
            return;
        }

        try {
            await submitHomeworkMutation.mutateAsync({
                homework: selectedHomework.id,
                submission_file: submissionFile || undefined,
                submission_text: submissionText,
                status: 'submitted'
            });

            toast.success("Homework submitted successfully!");
            handleCloseSidebar();
        } catch (error: any) {
            console.error(error);
            toast.error("Failed to submit homework");
        }
    };

    // Filters
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const pendingHomework = homeworkList.filter(h => h.submission_status === 'pending');
    const submittedHomework = homeworkList.filter(h => h.submission_status === 'submitted' || h.submission_status === 'graded');

    // Helper to calculate days remaining/overdue correctly
    const getDaysDifference = (dateString: string) => {
        const targetDate = new Date(dateString);
        targetDate.setHours(0, 0, 0, 0);
        const diffTime = targetDate.getTime() - today.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">My Homework</h1>
                    <p className="text-muted-foreground mt-2">
                        View and submit your daily homework
                    </p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Homework</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{homeworkList.length}</div>
                        <p className="text-xs text-muted-foreground mt-1">All assignments</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending</CardTitle>
                        <Clock className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{pendingHomework.length}</div>
                        <p className="text-xs text-muted-foreground mt-1">To be submitted</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Submitted</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-indigo-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{submittedHomework.length}</div>
                        <p className="text-xs text-muted-foreground mt-1">Completed</p>
                    </CardContent>
                </Card>
            </div>

            {/* Loading / Error / Content */}
            {isLoading && (
                <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            )}

            {error && (
                <Card className="border-destructive/50 bg-destructive/10">
                    <CardContent className="pt-6 text-center text-destructive">
                        <p>Failed to load homework. Please try again later.</p>
                    </CardContent>
                </Card>
            )}

            {!isLoading && !error && (
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full max-w-md grid-cols-2">
                        <TabsTrigger value="all">All Homework</TabsTrigger>
                        <TabsTrigger value="pending">Pending</TabsTrigger>
                    </TabsList>

                    <TabsContent value="all" className="mt-6 space-y-4">
                        {homeworkList.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">No homework found.</div>
                        ) : (
                            homeworkList.map(homework => (
                                <HomeworkCard
                                    key={homework.id}
                                    homework={homework}
                                    onClick={() => handleViewDetails(homework)}
                                    getDaysDifference={getDaysDifference}
                                />
                            ))
                        )}
                    </TabsContent>

                    <TabsContent value="pending" className="mt-6 space-y-4">
                        {pendingHomework.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">No pending homework!</div>
                        ) : (
                            pendingHomework.map(homework => (
                                <HomeworkCard
                                    key={homework.id}
                                    homework={homework}
                                    onClick={() => handleViewDetails(homework)}
                                    getDaysDifference={getDaysDifference}
                                />
                            ))
                        )}
                    </TabsContent>
                </Tabs>
            )}

            {/* Detail Sidebar */}
            <DetailSidebar
                isOpen={isSidebarOpen}
                onClose={handleCloseSidebar}
                title={selectedHomework?.title || 'Homework Details'}
                mode="view"
                width="lg"
            >
                {selectedHomework && (
                    <div className="space-y-6">
                        {/* Details Header */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <Badge variant="outline">{selectedHomework.subject_name}</Badge>
                                <span className="text-sm text-muted-foreground">
                                    Due: {new Date(selectedHomework.due_date).toLocaleDateString()}
                                </span>
                            </div>
                            <h2 className="text-xl font-semibold">{selectedHomework.title}</h2>
                        </div>

                        {/* Description */}
                        <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 border text-sm">
                            <p className="whitespace-pre-wrap">{selectedHomework.description}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-muted-foreground">Assigned By:</span>
                                <p className="font-medium">{selectedHomework.teacher_name || 'N/A'}</p>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Assigned Date:</span>
                                <p className="font-medium">{new Date(selectedHomework.assigned_date).toLocaleDateString()}</p>
                            </div>
                        </div>

                        {selectedHomework.attachment && (
                            <div>
                                <h3 className="text-sm font-medium mb-2">Attachment</h3>
                                <Button variant="outline" size="sm" asChild>
                                    <a href={selectedHomework.attachment} target="_blank" rel="noopener noreferrer">
                                        <Download className="h-4 w-4 mr-2" />
                                        Download Attachment
                                    </a>
                                </Button>
                            </div>
                        )}

                        <div className="border-t pt-6">
                            <h3 className="text-lg font-semibold mb-4">Your Submission</h3>

                            {selectedHomework.submission_status === 'submitted' || selectedHomework.submission_status === 'graded' ? (
                                <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4 flex items-center gap-3">
                                    <CheckCircle2 className="h-6 w-6 text-indigo-600" />
                                    <div>
                                        <h4 className="font-medium text-indigo-800 dark:text-indigo-300">Submitted</h4>
                                        <p className="text-sm text-indigo-700 dark:text-indigo-400">You have already submitted this homework.</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Submission Text</label>
                                        <Textarea
                                            placeholder="Type your answer or notes here..."
                                            value={submissionText}
                                            onChange={(e) => setSubmissionText(e.target.value)}
                                            rows={4}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Attach File (Optional)</label>
                                        <Input
                                            type="file"
                                            onChange={(e) => setSubmissionFile(e.target.files?.[0] || null)}
                                        />
                                    </div>
                                    <Button
                                        className="w-full"
                                        onClick={handleSubmit}
                                        disabled={isSubmitting || (!submissionFile && !submissionText)}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Submitting...
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="h-4 w-4 mr-2" />
                                                Submit Homework
                                            </>
                                        )}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </DetailSidebar>
        </div>
    );
};

const HomeworkCard = ({
    homework,
    onClick,
    getDaysDifference
}: {
    homework: StudentHomework;
    onClick: () => void;
    getDaysDifference: (date: string) => number;
}) => {
    const daysLeft = getDaysDifference(homework.due_date);
    const isOverdue = daysLeft < 0;
    const isSubmitted = homework.submission_status === 'submitted' || homework.submission_status === 'graded';
    const isUrgent = daysLeft >= 0 && daysLeft <= 3;

    return (
        <Card
            onClick={onClick}
            className="group hover:shadow-lg transition-all duration-300 border-border/40 bg-gradient-to-br from-card to-muted/20 hover:to-muted/30 cursor-pointer overflow-hidden relative"
        >
            {/* Decorative Background Elements */}
            <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-primary/5 group-hover:bg-primary/10 transition-colors blur-2xl pointer-events-none" />
            <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full border-2 border-primary/5 pointer-events-none" />
            <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full border border-dashed border-primary/5 pointer-events-none opacity-50" />
            <div className="absolute bottom-8 right-8 h-2 w-2 rounded-full bg-primary/10 pointer-events-none" />

            <CardContent className="p-6 relative">
                {/* Top Meta Row */}
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                        <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-wider">
                            #{homework.id}
                        </span>
                        <span className="text-xs font-medium text-muted-foreground">
                            {homework.subject_name}
                        </span>
                    </div>

                    {isSubmitted ? (
                        <Badge variant="outline" className="border-indigo-200 text-indigo-700 bg-indigo-50 font-normal">
                            Submitted
                        </Badge>
                    ) : isOverdue ? (
                        <Badge variant="destructive" className="font-normal">
                            Overdue
                        </Badge>
                    ) : isUrgent ? (
                        <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-200 font-normal">
                            Urgent
                        </Badge>
                    ) : null}
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                    {homework.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-muted-foreground line-clamp-2 mb-6">
                    {homework.description || `Assigned by ${homework.teacher_name}`}
                </p>

                {/* Footer Meta */}
                <div className="flex items-center justify-between pt-4 border-t border-border/40">
                    <div className="flex gap-4 text-xs text-muted-foreground font-medium">
                        <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Due: {new Date(homework.due_date).toLocaleDateString()}</span>
                        </div>
                    </div>

                    <div className={`p-1.5 rounded-full transition-colors ${isSubmitted ? 'bg-indigo-100 text-indigo-600' : 'bg-muted text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground'}`}>
                        {isSubmitted ? <CheckCircle2 className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

import { ArrowRight } from 'lucide-react';
