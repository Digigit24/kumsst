import { DROPDOWN_PAGE_SIZE } from '@/config/app.config';
import { DetailSidebar } from '@/components/common/DetailSidebar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useAssignments, useCreateSubmission, useMySubmissions } from '@/hooks/useAssignments';
import { useAuth } from '@/hooks/useAuth';
import type { Assignment } from '@/types/assignments.types';
import { AlertCircle, ArrowRight, Calendar, CheckCircle2, Clock, Download, FileText, Loader2, Upload } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';


const AssignmentCard = ({
  assignment,
  submittedAssignmentIds,
  onClick
}: {
  assignment: Assignment,
  submittedAssignmentIds: Set<number>,
  onClick: (assignment: Assignment) => void
}) => {
  const today = new Date();
  const getDaysLeft = (dueDate: string) => {
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const daysLeft = getDaysLeft(assignment.due_date);
  const isOverdue = daysLeft < 0;
  const isUrgent = daysLeft >= 0 && daysLeft <= 3;
  const isSubmitted = submittedAssignmentIds.has(assignment.id);

  return (
    <Card
      onClick={() => onClick(assignment)}
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
              #{assignment.id}
            </span>
            <span className="text-xs font-medium text-muted-foreground">
              {assignment.subject_name}
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
          {assignment.title}
        </h3>

        {/* Description/Teacher */}
        <p className="text-sm text-muted-foreground line-clamp-2 mb-6">
          {assignment.description || `Assigned by ${assignment.teacher_name}`}
        </p>

        {/* Footer Meta */}
        <div className="flex items-center justify-between pt-4 border-t border-border/40">
          <div className="flex gap-4 text-xs text-muted-foreground font-medium">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>{new Date(assignment.due_date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              <span>{assignment.max_marks} pts</span>
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

export const Assignments: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const { user } = useAuth();

  // Submission state
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);
  const [submissionComment, setSubmissionComment] = useState('');
  const createSubmissionMutation = useCreateSubmission();
  const isSubmitting = createSubmissionMutation.isPending;

  // Fetch assignments
  const { data, isLoading, error } = useAssignments({ page_size: DROPDOWN_PAGE_SIZE, status: 'active' });
  const assignments = data?.results || [];

  // Fetch my submissions to check status
  const { data: submissionsData, refetch: refetchSubmissions } = useMySubmissions({ page_size: DROPDOWN_PAGE_SIZE });

  const submittedAssignmentIds = useMemo(() => {
    const ids = new Set<number>();
    if (submissionsData?.results) {
      submissionsData.results.forEach(sub => ids.add(sub.assignment));
    }
    return ids;
  }, [submissionsData]);

  const handleSubmitAssignment = async () => {
    if (!selectedAssignment || !submissionFile) {
      toast.error("Please upload a file to submit");
      return;
    }

    try {
      const formData = new FormData();
      formData.append('assignment', String(selectedAssignment.id));

      const studentId = (user as any)?.student_id;
      if (studentId) {
        formData.append('student', String(studentId));
      } else {
        console.warn("Student ID not found in user object");
      }

      formData.append('submission_file', submissionFile);
      if (submissionComment) {
        formData.append('comments', submissionComment);
      }

      await createSubmissionMutation.mutateAsync(formData);

      toast.success("Assignment submitted successfully!");
      setSubmissionFile(null);
      setSubmissionComment('');
      setIsSidebarOpen(false);
      refetchSubmissions(); // Update submission status
    } catch (error: any) {
      console.error(error);
      toast.error(typeof error.message === 'string' ? error.message : "Failed to submit assignment");
    }
  };

  // Filter assignments by status
  const today = new Date();
  const pendingAssignments = assignments.filter(a => {
    const dueDate = new Date(a.due_date);
    return dueDate >= today && !submittedAssignmentIds.has(a.id);
  });

  const overdueAssignments = assignments.filter(a => {
    const dueDate = new Date(a.due_date);
    return dueDate < today && !submittedAssignmentIds.has(a.id);
  });

  const urgentAssignments = pendingAssignments.filter(a => {
    const dueDate = new Date(a.due_date);
    const daysLeft = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysLeft <= 3;
  });

  const getDaysLeft = (dueDate: string) => {
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleViewDetails = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setIsSidebarOpen(true);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
    setSelectedAssignment(null);
  };

  const isSubmitted = selectedAssignment ? submittedAssignmentIds.has(selectedAssignment.id) : false;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">My Assignments</h1>
        <p className="text-muted-foreground mt-2">
          View and submit your assignments
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assignments.length}</div>
            <p className="text-xs text-muted-foreground mt-1">All active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingAssignments.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Due upcoming</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Urgent</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{urgentAssignments.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Due within 3 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{overdueAssignments.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Past deadline</p>
          </CardContent>
        </Card>
      </div>

      {/* Loading and Error States */}
      {isLoading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading assignments...</p>
        </div>
      )}

      {error && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="h-12 w-12 text-destructive mb-4" />
              <h3 className="text-lg font-semibold mb-2">Unable to Load Assignments</h3>
              <p className="text-muted-foreground max-w-md mb-4">
                {error.message?.includes('404')
                  ? 'The student assignments endpoint is not yet available on the backend. Please contact your administrator to implement the /api/v1/students/assignments/ endpoint.'
                  : `Failed to load assignments: ${error.message}`}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && (
        <>
          {/* Tabs for All/Pending/Overdue */}
          {/* Tabs for All/Pending/Overdue */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full max-w-2xl grid-cols-5">
              <TabsTrigger value="all">All ({assignments.length})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({pendingAssignments.length})</TabsTrigger>
              <TabsTrigger value="submitted">Submitted ({submittedAssignmentIds.size})</TabsTrigger>
              <TabsTrigger value="urgent">Urgent ({urgentAssignments.length})</TabsTrigger>
              <TabsTrigger value="overdue">Overdue ({overdueAssignments.length})</TabsTrigger>
            </TabsList>

            {/* All Assignments */}
            <TabsContent value="all" className="mt-6">
              {assignments.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No assignments available</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {assignments.map((assignment) => (
                    <AssignmentCard
                      key={assignment.id}
                      assignment={assignment}
                      submittedAssignmentIds={submittedAssignmentIds}
                      onClick={handleViewDetails}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Pending Assignments */}
            <TabsContent value="pending" className="mt-6">
              {pendingAssignments.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <CheckCircle2 className="h-12 w-12 mx-auto text-green-600 mb-4" />
                    <p className="text-muted-foreground">No pending assignments!</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pendingAssignments.map((assignment) => (
                    <AssignmentCard
                      key={assignment.id}
                      assignment={assignment}
                      submittedAssignmentIds={submittedAssignmentIds}
                      onClick={handleViewDetails}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Submitted Assignments */}
            <TabsContent value="submitted" className="mt-6">
              {assignments.filter(a => submittedAssignmentIds.has(a.id)).length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No submitted assignments yet</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {assignments
                    .filter(a => submittedAssignmentIds.has(a.id))
                    .map((assignment) => (
                      <AssignmentCard
                        key={assignment.id}
                        assignment={assignment}
                        submittedAssignmentIds={submittedAssignmentIds}
                        onClick={handleViewDetails}
                      />
                    ))}
                </div>
              )}
            </TabsContent>

            {/* Urgent Assignments */}
            <TabsContent value="urgent" className="mt-6">
              {urgentAssignments.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <CheckCircle2 className="h-12 w-12 mx-auto text-green-600 mb-4" />
                    <p className="text-muted-foreground">No urgent assignments</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {urgentAssignments.map((assignment) => (
                    <AssignmentCard
                      key={assignment.id}
                      assignment={assignment}
                      submittedAssignmentIds={submittedAssignmentIds}
                      onClick={handleViewDetails}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Overdue Assignments */}
            <TabsContent value="overdue" className="mt-6">
              {overdueAssignments.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <CheckCircle2 className="h-12 w-12 mx-auto text-green-600 mb-4" />
                    <p className="text-muted-foreground">No overdue assignments!</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {overdueAssignments.map((assignment) => (
                    <AssignmentCard
                      key={assignment.id}
                      assignment={assignment}
                      submittedAssignmentIds={submittedAssignmentIds}
                      onClick={handleViewDetails}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </>
      )}

      {/* Detail Sidebar */}
      <DetailSidebar
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
        title={selectedAssignment?.title || 'Assignment Details'}
        mode="view"
        width="lg"
      >
        {selectedAssignment && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Title</h3>
              <p className="mt-1 text-lg font-semibold">{selectedAssignment.title}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Subject</h3>
                <p className="mt-1">{selectedAssignment.subject_name}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Class</h3>
                <p className="mt-1">
                  {selectedAssignment.class_name}
                  {selectedAssignment.section_name && ` - ${selectedAssignment.section_name}`}
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Description & Instructions</h3>
              <p className="mt-1 whitespace-pre-wrap">{selectedAssignment.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Due Date</h3>
                <p className="mt-1 font-medium">
                  {new Date(selectedAssignment.due_date).toLocaleDateString()}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Maximum Marks</h3>
                <p className="mt-1 font-medium">{selectedAssignment.max_marks}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Assigned On</h3>
                <p className="mt-1">
                  {selectedAssignment.assigned_date
                    ? new Date(selectedAssignment.assigned_date).toLocaleDateString()
                    : selectedAssignment.created_at
                      ? new Date(selectedAssignment.created_at).toLocaleDateString()
                      : 'N/A'}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Teacher</h3>
                <p className="mt-1">{selectedAssignment.teacher_name || 'N/A'}</p>
              </div>
            </div>

            {selectedAssignment.assignment_file && (
              <div className="pt-2">
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Assignment File</h3>
                <div className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-border/50 bg-gradient-to-r from-muted/30 to-muted/10 hover:shadow-md hover:border-primary/20 transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
                      <FileText className="h-6 w-6" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                        Reference Document
                      </span>
                      <span className="text-xs text-muted-foreground mt-0.5">
                        Download to view the complete assignment details
                      </span>
                    </div>
                  </div>
                  <div className="shrink-0 sm:ml-auto">
                    <Button
                      variant="default"
                      className="w-full sm:w-auto rounded-full shadow-sm hover:scale-105 transition-all shadow-primary/25 h-10 px-6 font-medium"
                      asChild
                    >
                      <a href={selectedAssignment.assignment_file} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                        <Download className="h-4 w-4" />
                        Download PDF
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Submission Section */}
            <div className="pt-4 border-t space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">
                {isSubmitted ? "Submission Status" : "Submit Assignment"}
              </h3>

              {isSubmitted ? (
                <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-6 w-6 text-indigo-600" />
                    <div>
                      <h4 className="font-semibold text-indigo-900">Assignment Submitted</h4>
                      <p className="text-sm text-indigo-700">
                        You have successfully submitted this assignment.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Input
                      type="file"
                      id="submission-file"
                      onChange={(e) => setSubmissionFile(e.target.files?.[0] || null)}
                    />
                    <p className="text-xs text-muted-foreground">Upload your completed assignment (PDF, Docx, Image)</p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm text-foreground">Comments (Optional)</h4>
                    <Textarea
                      placeholder="Add any comments for the teacher..."
                      value={submissionComment}
                      onChange={(e) => setSubmissionComment(e.target.value)}
                    />
                  </div>

                  <Button
                    className="w-full"
                    size="lg"
                    disabled={!submissionFile || isSubmitting}
                    onClick={handleSubmitAssignment}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Submit Assignment
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
