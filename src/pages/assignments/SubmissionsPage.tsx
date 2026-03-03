import { AnimatedFolder } from '@/components/ui/3d-folder';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { API_BASE_URL, getDefaultHeaders } from '@/config/api.config';
import { DROPDOWN_PAGE_SIZE } from '@/config/app.config';
import { useAssignmentsSWR, useClassesSWR, useSectionsFilteredByClass, useSubjectsSWR } from '@/hooks/useAcademicSWR';
import { useAssignment, useGradeSubmission, useSubmissions } from '@/hooks/useAssignments';
import { useAuth } from '@/hooks/useAuth';
import { AlertCircle, ArrowLeft, Calendar, CheckCircle, Clock, Download, Eye, FileText, FolderOpen, Grid3X3, Loader2 } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

export const SubmissionsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlAssignmentId = searchParams.get('id');
  const { user } = useAuth();
  const isTeacher = user?.user_type === 'teacher';

  // View mode: folders or filters
  const [viewMode, setViewMode] = useState<'folders' | 'filters'>(urlAssignmentId ? 'filters' : 'folders');
  const [selectedSubjectFolder, setSelectedSubjectFolder] = useState<string | null>(null);

  // State for filters (Admin view)
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<number | null>(urlAssignmentId ? parseInt(urlAssignmentId) : null);
  const [downloadingSubmissionId, setDownloadingSubmissionId] = useState<number | null>(null);

  // Filter Data Hooks
  const { results: classes = [] } = useClassesSWR({ page_size: DROPDOWN_PAGE_SIZE });
  // Prefetch all sections once, filter client-side by class — instant switching
  const { results: sections = [] } = useSectionsFilteredByClass(selectedClassId);
  const { results: subjects = [] } = useSubjectsSWR({ page_size: DROPDOWN_PAGE_SIZE });

  // Fetch assignments list based on filters
  const { results: assignmentsList = [] } = useAssignmentsSWR({
    class_obj: selectedClassId || undefined, // Note: backend expects 'class_obj' or 'class_id' depending on implementation, usually 'class_obj' for filters
    section: selectedSectionId || undefined,
    subject: selectedSubjectId || undefined,
    page_size: DROPDOWN_PAGE_SIZE
  });

  // Update selected assignment if URL changes
  useEffect(() => {
    if (urlAssignmentId) {
      setSelectedAssignmentId(parseInt(urlAssignmentId));
    }
  }, [urlAssignmentId]);


  // Fetch assignment details for the SELECTED assignment
  const {
    data: assignment,
    isLoading: isLoadingAssignment,
    error: assignmentError,
  } = useAssignment(selectedAssignmentId || 0);

  // Fetch submissions for the SELECTED assignment
  const {
    data: submissionsData,
    isLoading: isLoadingSubmissions,
    error: submissionsError,
    refetch,
  } = useSubmissions({
    assignment: selectedAssignmentId || undefined,
    page_size: DROPDOWN_PAGE_SIZE,
  });

  const gradeMutation = useGradeSubmission();

  const submissions = submissionsData?.results || [];

  // Calculate statistics
  const stats = useMemo(() => {
    const totalStudents = assignment?.total_students || submissions.length;
    const submittedCount = submissions.filter(s => s.status !== 'pending').length;
    const gradedCount = submissions.filter(s => s.status === 'graded').length;

    return {
      totalStudents,
      submittedCount,
      gradedCount,
    };
  }, [submissions, assignment]);

  const handleGrade = async (submissionId: number) => {
    const marks = prompt('Enter marks obtained:');
    if (!marks) return;

    const marksNum = parseFloat(marks);
    if (isNaN(marksNum) || marksNum < 0 || marksNum > (assignment?.max_marks || 100)) {
      toast.error(`Marks must be between 0 and ${assignment?.max_marks || 100}`);
      return;
    }

    const feedback = prompt('Enter feedback (optional):') || '';

    try {
      await gradeMutation.mutateAsync({
        id: submissionId,
        data: {
          marks_obtained: marksNum,
          feedback,
        },
      });
      toast.success('Submission graded successfully');
      refetch();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to grade submission');
    }
  };

  const handleDownloadSubmission = async (id: number, url: string, studentName: string) => {
    if (!url) return;
    try {
      setDownloadingSubmissionId(id);

      const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
      const isS3Link = fullUrl.includes('amazonaws.com') || fullUrl.includes('digitaloceanspaces.com');

      const fetchOptions: RequestInit = {
        method: 'GET',
        credentials: isS3Link ? 'omit' : 'include',
      };

      if (!isS3Link) {
        const token = localStorage.getItem('access_token');
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const defaultHeaders = getDefaultHeaders();
        if (defaultHeaders['X-College-ID']) headers['X-College-ID'] = defaultHeaders['X-College-ID'];
        fetchOptions.headers = headers;
      }

      const response = await fetch(fullUrl, fetchOptions);
      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      // Determine extension
      let extension = 'pdf';
      if (url.toLowerCase().includes('.jpg') || url.toLowerCase().includes('.jpeg')) extension = 'jpg';
      else if (url.toLowerCase().includes('.png')) extension = 'png';
      else if (url.toLowerCase().includes('.doc')) extension = 'doc';
      else if (url.toLowerCase().includes('.docx')) extension = 'docx';
      else if (url.toLowerCase().includes('.zip')) extension = 'zip';

      const filename = `submission_${studentName.replace(/\s+/g, '_')}_${id}.${extension}`;

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      toast.success("Downloaded successfully");

    } catch (e) {
      toast.error("Failed to download. Opening in new tab instead.");
      window.open(url, '_blank');
    } finally {
      setDownloadingSubmissionId(null);
    }
  };

  // Simplified loading check: only if we have selected an ID 
  const isFetchingData = (selectedAssignmentId && (isLoadingAssignment || isLoadingSubmissions));

  // Error check: only if we have selected an ID and it failed
  const hasError = selectedAssignmentId && (assignmentError || !assignment);

  // If NO assignment selected yet (and not loading/error from a selection), show the filter UI
  if (!selectedAssignmentId && !isLoadingAssignment) {
    // Show Empty/Filter State driven by the return below
  }

  /* 
     RENDER LOGIC:
     1. Filters Section (Always visible for Admins, maybe hidden if URL ID provided? No, good to keep it to switch contexts)
     2. Content Section
        - Loading
        - Error
        - Dashboard/Submissions List
  */


  // Group assignments by subject for folder view
  const assignmentsBySubject = useMemo(() => {
    return assignmentsList.reduce<Record<string, typeof assignmentsList>>((acc, assignment) => {
      const subject = assignment.subject_name || 'Uncategorized';
      if (!acc[subject]) {
        acc[subject] = [];
      }
      acc[subject].push(assignment);
      return acc;
    }, {});
  }, [assignmentsList]);

  const subjectFolders = useMemo(() => {
    return Object.entries(assignmentsBySubject).map(([subjectName, subjectAssignments]) => ({
      subjectName,
      assignments: subjectAssignments,
      folderItems: subjectAssignments.slice(0, 3).map(a => ({
        id: String(a.id),
        title: a.title,
      }))
    }));
  }, [assignmentsBySubject]);

  const handleFolderClick = (subjectName: string) => {
    setSelectedSubjectFolder(subjectName);
  };

  const handleBackToFolders = () => {
    setSelectedSubjectFolder(null);
    setSelectedAssignmentId(null);
    setSearchParams({});
  };

  const handleSelectAssignment = (assignmentId: number) => {
    setSelectedAssignmentId(assignmentId);
    setSearchParams({ id: String(assignmentId) });
    setViewMode('filters');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Assignment Submissions</h1>
          <p className="text-muted-foreground mt-2">
            Review and grade student submissions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'folders' ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setViewMode('folders');
              setSelectedSubjectFolder(null);
              setSelectedAssignmentId(null);
              setSearchParams({});
            }}
            className="gap-2"
          >
            <FolderOpen className="h-4 w-4" />
            Browse by Subject
          </Button>
          <Button
            variant={viewMode === 'filters' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('filters')}
            className="gap-2"
          >
            <Grid3X3 className="h-4 w-4" />
            Filter View
          </Button>
        </div>
      </div>

      {/* Folder View - Browse by Subject */}
      {viewMode === 'folders' && !selectedAssignmentId && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {selectedSubjectFolder ? (
                <>
                  <Button variant="ghost" size="sm" onClick={handleBackToFolders} className="gap-2 mr-2">
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <Badge variant="secondary" className="text-base px-3 py-1">
                    {selectedSubjectFolder}
                  </Badge>
                  <span className="text-muted-foreground text-sm font-normal">
                    - Select an assignment to view submissions
                  </span>
                </>
              ) : (
                'Browse Assignments by Subject'
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedSubjectFolder ? (
              // Show subject folders
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 place-items-center">
                {subjectFolders.length === 0 ? (
                  <div className="col-span-full text-center py-12 text-muted-foreground">
                    <FolderOpen className="h-16 w-16 mx-auto mb-4 opacity-20" />
                    <p>No assignments found. Try using the filter view.</p>
                  </div>
                ) : (
                  subjectFolders.map((folder) => (
                    <AnimatedFolder
                      key={folder.subjectName}
                      title={folder.subjectName}
                      items={folder.folderItems}
                      itemCount={folder.assignments.length}
                      onFolderClick={() => handleFolderClick(folder.subjectName)}
                      showLightbox={false}
                    />
                  ))
                )}
              </div>
            ) : (
              // Show assignments in selected subject folder
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {assignmentsBySubject[selectedSubjectFolder]?.map((assignment, index) => {
                  // Subtle color accents for left border
                  const colors = [
                    'border-l-blue-500',
                    'border-l-purple-500',
                    'border-l-emerald-500',
                    'border-l-orange-500',
                    'border-l-cyan-500',
                    'border-l-pink-500',
                  ];
                  const colorClass = colors[index % colors.length];

                  return (
                    <Card
                      key={assignment.id}
                      className={`group cursor-pointer hover:shadow-md transition-all duration-300 bg-card border border-l-4 ${colorClass}`}
                      onClick={() => handleSelectAssignment(assignment.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <Badge className="text-xs font-medium" variant={assignment.status === 'active' ? 'default' : 'secondary'}>
                            {assignment.status || 'active'}
                          </Badge>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(assignment.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        <h3 className="font-semibold text-base line-clamp-2 mb-2 text-foreground">
                          {assignment.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          {assignment.class_name} {assignment.section_name && `• ${assignment.section_name}`}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-3 border-t">
                          <FileText className="h-3.5 w-3.5" />
                          <span>Click to view submissions</span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Filters Section - Useful for Admins or finding specific assignments */}
      {viewMode === 'filters' && (
        <Card className="p-4 bg-muted/20">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <span className="text-sm font-medium">Class</span>
              <SearchableSelect
                options={classes.map(c => ({ value: c.id, label: c.name }))}
                value={selectedClassId || undefined}
                onChange={(val) => {
                  setSelectedClassId(Number(val));
                  setSelectedSectionId(null); // Reset section
                  setSelectedAssignmentId(null); // Reset assignment
                }}
                placeholder="Select Class"
              />
            </div>
            <div className="space-y-1">
              <span className="text-sm font-medium">Section</span>
              <SearchableSelect
                options={sections.map(s => ({ value: s.id, label: s.name }))}
                value={selectedSectionId || undefined}
                onChange={(val) => {
                  setSelectedSectionId(val ? Number(val) : null);
                  setSelectedAssignmentId(null);
                }}
                placeholder="Select Section"
                disabled={!selectedClassId}
              />
            </div>
            <div className="space-y-1">
              <span className="text-sm font-medium">Subject</span>
              <SearchableSelect
                options={subjects.map(s => ({ value: s.id, label: s.name }))}
                value={selectedSubjectId || undefined}
                onChange={(val) => {
                  setSelectedSubjectId(val ? Number(val) : null);
                  setSelectedAssignmentId(null);
                }}
                placeholder="Select Subject"
              />
            </div>
            <div className="space-y-1">
              <span className="text-sm font-medium">Assignment</span>
              <SearchableSelect
                options={assignmentsList.map(a => ({ value: a.id, label: a.title }))}
                value={selectedAssignmentId || undefined}
                onChange={(val) => {
                  const id = val ? Number(val) : null;
                  setSelectedAssignmentId(id);
                  // Optionally update URL to reflect selection
                  if (id) setSearchParams({ id: String(id) });
                  else setSearchParams({});
                }}
                placeholder="Select Assignment"
                isLoading={!assignmentsList && selectedClassId} // Rough loading indicator
                emptyText="No assignments found"
              />
            </div>
          </div>
        </Card>
      )}

      {isFetchingData ? (
        <div className="flex items-center justify-center p-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading submissions...</p>
          </div>
        </div>
      ) : hasError ? (
        <div className="flex items-center justify-center p-12">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
            <p className="text-lg font-medium">Failed to load assignment</p>
            <p className="text-sm text-muted-foreground mt-2">
              {assignmentError?.message || 'Assignment not found. Please select a valid assignment.'}
            </p>
          </div>
        </div>
      ) : !selectedAssignmentId ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground border-2 border-dashed rounded-xl">
          <FileText className="h-16 w-16 mb-4 opacity-20" />
          <h3 className="text-lg font-medium">No Assignment Selected</h3>
          <p className="max-w-sm text-center mt-2">
            Please select an assignment from the filters above to view student submissions.
          </p>
        </div>
      ) : (assignment && (
        <>
          {/* Existing Content rendered only if assignment exists */}

          <Card>
            <CardHeader>
              <CardTitle>
                {assignment.title} - {assignment.class_name}
                {assignment.section_name && ` - ${assignment.section_name}`}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Subject: {assignment.subject_name} • Due: {new Date(assignment.due_date).toLocaleDateString()} • Max Marks: {assignment.max_marks}
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3 mb-6">
                <Card className="border">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-muted-foreground">Total Students</span>
                    </div>
                    <div className="text-2xl font-semibold">{stats.totalStudents}</div>
                  </CardContent>
                </Card>

                <Card className="border">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-muted-foreground">Submitted</span>
                    </div>
                    <div className="text-2xl font-semibold">{stats.submittedCount}</div>
                  </CardContent>
                </Card>

                <Card className="border">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-muted-foreground">Graded</span>
                    </div>
                    <div className="text-2xl font-semibold">{stats.gradedCount}</div>
                  </CardContent>
                </Card>
              </div>

              {submissions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No submissions yet</p>
                  <p className="text-sm mt-2">Submissions will appear here once students submit their work</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {submissions.map((submission) => {
                    // Determine card color based on status
                    const statusColors = {
                      graded: { border: 'border-l-green-500', bg: 'from-green-50/30', badge: 'success' },
                      submitted: { border: 'border-l-blue-500', bg: 'from-blue-50/30', badge: 'default' },
                      pending: { border: 'border-l-orange-500', bg: 'from-orange-50/30', badge: 'secondary' }
                    };
                    const colors = statusColors[submission.status as keyof typeof statusColors] || statusColors.pending;

                    return (
                      <Card
                        key={submission.id}
                        className="group relative overflow-hidden transition-all duration-300 bg-card hover:bg-muted/10 border-border/40 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:hover:shadow-[0_8px_30px_rgb(255,255,255,0.02)] flex flex-col"
                      >
                        {/* Dynamic Status Left Indicator Line */}
                        <div
                          className={`absolute left-0 top-0 bottom-0 w-1.5 transition-colors duration-300 ${submission.status === 'graded'
                            ? 'bg-emerald-500'
                            : submission.status === 'submitted'
                              ? 'bg-blue-500'
                              : 'bg-amber-500'
                            }`}
                        />

                        <CardContent className="p-5 pl-7 flex flex-col h-full">
                          {/* Header: Avatar, Info, Badge */}
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex gap-3 items-center">
                              {/* Avatar Block */}
                              <div className={`relative h-12 w-12 rounded-xl flex items-center justify-center overflow-hidden backdrop-blur-md border border-white/10 dark:border-black/10 shadow-sm transition-colors shrink-0 ${submission.status === 'graded' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10' :
                                submission.status === 'submitted' ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10' :
                                  'bg-amber-50 text-amber-600 dark:bg-amber-500/10'
                                }`}>
                                <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent dark:from-white/5 pointer-events-none" />
                                <span className="text-lg font-bold z-10">
                                  {(submission.student_name || 'U')[0].toUpperCase()}
                                </span>
                              </div>
                              <div className="min-w-0">
                                <h3 className="font-semibold text-base text-foreground group-hover:text-primary transition-colors truncate" title={submission.student_name || 'Unknown Student'}>
                                  {submission.student_name || 'Unknown Student'}
                                </h3>
                                {submission.student_roll_number && (
                                  <p className="text-xs text-muted-foreground truncate">
                                    ID: {submission.student_roll_number}
                                  </p>
                                )}
                              </div>
                            </div>
                            <Badge
                              className={`shrink-0 ml-2 px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase border ${submission.status === 'graded'
                                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                                : submission.status === 'submitted'
                                  ? 'bg-blue-500/10 text-blue-600 border-blue-500/20'
                                  : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                                }`}
                            >
                              {submission.status === 'graded' ? 'Graded' : submission.status === 'submitted' ? 'Submitted' : 'Pending'}
                            </Badge>
                          </div>

                          <div className="flex flex-col flex-1">
                            {/* Meta Tags */}
                            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground border-b border-border/40 pb-3 mb-3">
                              {submission.is_late && (
                                <span className="inline-flex items-center font-medium text-destructive bg-destructive/10 px-1.5 rounded-sm">
                                  <Clock className="h-3 w-3 mr-1" />
                                  Late
                                </span>
                              )}
                              {submission.submitted_date && (
                                <span className="flex items-center gap-1.5 opacity-80">
                                  <Calendar className="h-3.5 w-3.5" />
                                  {new Date(submission.submitted_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </span>
                              )}
                            </div>

                            {/* Submission Text */}
                            {submission.submission_text && (
                              <div className="text-sm text-foreground/80 leading-relaxed bg-muted/40 p-3 rounded-xl border border-border/40 line-clamp-3 hover:line-clamp-none transition-all mb-4">
                                {submission.submission_text}
                              </div>
                            )}

                            {/* Grade Display */}
                            {submission.marks_obtained !== null && submission.marks_obtained !== undefined && (
                              <div className="mt-auto flex items-start gap-3 p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-500/10">
                                <div className="shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400">
                                  <CheckCircle className="h-4 w-4" />
                                </div>
                                <div className="min-w-0">
                                  <div className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                                    Score: {submission.marks_obtained} <span className="text-emerald-700/60 dark:text-emerald-400/60 font-medium">/ {assignment?.max_marks || 100}</span>
                                  </div>
                                  {submission.feedback && (
                                    <p className="text-xs mt-0.5 text-emerald-800/80 dark:text-emerald-300/80 italic truncate" title={submission.feedback}>
                                      "{submission.feedback}"
                                    </p>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          {submission.submission_file && (
                            <div className="mt-4 pt-4 border-t border-border/40 flex items-center gap-2 mt-auto">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.open(submission.submission_file!, '_blank')}
                                className="flex-1 h-9 rounded-lg font-medium text-xs bg-background shadow-sm hover:shadow-md transition-all"
                              >
                                <Eye className="h-3.5 w-3.5 mr-2 opacity-70" />
                                View
                              </Button>
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => handleDownloadSubmission(submission.id, submission.submission_file!, submission.student_name || 'student')}
                                disabled={downloadingSubmissionId === submission.id}
                                className="flex-1 h-9 rounded-lg font-medium text-xs shadow-sm hover:shadow-md transition-all"
                              >
                                {downloadingSubmissionId === submission.id ? (
                                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin opacity-70" />
                                ) : (
                                  <Download className="h-3.5 w-3.5 mr-1.5 opacity-70" />
                                )}
                                Download
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      ))}
    </div>
  );
};
