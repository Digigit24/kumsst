import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { DROPDOWN_PAGE_SIZE } from '@/config/app.config';
import { useCreateSyllabus, useDownloadSyllabusFile } from '@/hooks/useAcademic';
import { useClassesSWR, useSubjectAssignmentsSWR, useSyllabusListSWR } from '@/hooks/useAcademicSWR';
import { useAuth } from '@/hooks/useAuth';
import { useStudentsSWR } from '@/hooks/useStudentsSWR';
import type { SyllabusCreateInput } from '@/types/academic.types';
import { BookOpen, Clock, Download, Eye, FileText, Loader2, Plus, Settings, Upload, Users } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export const TeacherSubjectsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [syllabusDialogOpen, setSyllabusDialogOpen] = useState(false);
  const [manageDialogOpen, setManageDialogOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<any>(null);
  const [loadingFileId, setLoadingFileId] = useState<number | null>(null);

  // Upload form state
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  // Fetch subject assignments for the logged-in teacher
  const { data: assignmentsData, isLoading: isLoadingAssignments } = useSubjectAssignmentsSWR({
    teacher: user?.id,
    is_active: true,
    page_size: DROPDOWN_PAGE_SIZE,
  });

  const { data: studentsData, isLoading: isLoadingStudents } = useStudentsSWR({
    is_active: true,
    page_size: DROPDOWN_PAGE_SIZE,
  });

  // Fetch syllabus list
  const { data: syllabusData, isLoading: isLoadingSyllabus, refresh: refetchSyllabus } = useSyllabusListSWR({
    page_size: DROPDOWN_PAGE_SIZE,
  });

  // Fetch classes to get academic_session data
  const { data: classesData } = useClassesSWR({
    page_size: DROPDOWN_PAGE_SIZE,
    is_active: true,
  });

  const { mutate: downloadFile } = useDownloadSyllabusFile();
  const { mutate: createSyllabus, isLoading: isCreating } = useCreateSyllabus();

  // Create a lookup map for class ID to academic_session
  const classAcademicSessionMap = useMemo(() => {
    if (!classesData?.results) return new Map<number, number>();
    const map = new Map<number, number>();
    classesData.results.forEach(cls => {
      map.set(cls.id, cls.academic_session);
    });
    return map;
  }, [classesData]);

  // Get class options for selected subject
  const classOptionsForSubject = useMemo(() => {
    if (!assignmentsData?.results || !selectedSubject) return [];
    return assignmentsData.results
      .filter(a => a.subject === selectedSubject.id)
      .map(a => ({
        id: a.class_obj,
        name: a.class_name,
        section: a.section,
        sectionName: a.section_name,
      }));
  }, [assignmentsData, selectedSubject]);

  // Group assignments by subject and calculate statistics
  const mySubjects = useMemo(() => {
    if (!assignmentsData?.results) return [];

    const subjectMap = new Map();

    assignmentsData.results.forEach(assignment => {
      const subjectId = assignment.subject;

      if (!subjectMap.has(subjectId)) {
        subjectMap.set(subjectId, {
          id: subjectId,
          name: assignment.subject_name,
          code: assignment.subject_details?.code || `SUB-${subjectId}`,
          classes: [],
          classIds: new Set(),
          sectionIds: new Set(),
          students: 0,
        });
      }

      const subject = subjectMap.get(subjectId);
      const classLabel = assignment.section_name
        ? `${assignment.class_name} - ${assignment.section_name}`
        : assignment.class_name;

      if (!subject.classes.includes(classLabel)) {
        subject.classes.push(classLabel);
      }

      subject.classIds.add(assignment.class_obj);
      if (assignment.section) {
        subject.sectionIds.add(assignment.section);
      }
    });

    // Calculate student counts for each subject
    if (studentsData?.results) {
      subjectMap.forEach(subject => {
        const studentCount = studentsData.results.filter(student => {
          if (!student.current_class || !subject.classIds.has(student.current_class)) {
            return false;
          }
          if (subject.sectionIds.size > 0 && student.current_section) {
            return subject.sectionIds.has(student.current_section);
          }
          return true;
        }).length;
        subject.students = studentCount;
      });
    }

    return Array.from(subjectMap.values()).map(({ classIds, sectionIds, ...subject }) => subject);
  }, [assignmentsData, studentsData]);

  const stats = useMemo(() => ({
    totalSubjects: mySubjects.length,
    totalStudents: mySubjects.reduce((sum, subject) => sum + subject.students, 0),
    totalClasses: new Set(assignmentsData?.results?.map(a => `${a.class_obj}-${a.section}`) || []).size,
  }), [mySubjects, assignmentsData]);

  const isLoading = isLoadingAssignments || isLoadingStudents || isLoadingSyllabus;

  // Get syllabi for the selected subject
  const getSubjectSyllabi = (subjectId: number) => {
    if (!syllabusData?.results) return [];
    return syllabusData.results.filter(s => s.subject === subjectId);
  };

  const handleViewPdf = async (syllabusId: number, pdfUrl: string | undefined) => {
    if (!pdfUrl) {
      toast.error('PDF file not available');
      return;
    }
    try {
      setLoadingFileId(syllabusId);
      const blob = await downloadFile(pdfUrl);
      if (!blob) throw new Error('Failed to download file');
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      setTimeout(() => window.URL.revokeObjectURL(url), 1000);
    } catch (error: any) {
      toast.error(typeof error.message === 'string' ? error.message : 'Failed to open PDF');
    } finally {
      setLoadingFileId(null);
    }
  };

  const handleDownloadPdf = async (syllabusId: number, pdfUrl: string | undefined, syllabus_title: string) => {
    if (!pdfUrl) {
      toast.error('PDF file not available');
      return;
    }
    try {
      setLoadingFileId(syllabusId);
      const blob = await downloadFile(pdfUrl);
      if (!blob) throw new Error('Failed to download file');
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${syllabus_title}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('PDF downloaded successfully');
    } catch (error: any) {
      toast.error(typeof error.message === 'string' ? error.message : 'Failed to download PDF');
    } finally {
      setLoadingFileId(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.error('Please select a PDF file');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size should be less than 10MB');
        return;
      }
      setPdfFile(file);
    }
  };

  const resetUploadForm = () => {
    setSelectedClass('');
    setTitle('');
    setDescription('');
    setPdfFile(null);
  };

  const handleUploadSyllabus = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedSubject || !selectedClass || !title || !pdfFile) {
      toast.error('Please fill all required fields');
      return;
    }

    const selectedClassData = classOptionsForSubject.find(c => `${c.id}-${c.section || 0}` === selectedClass);

    if (!selectedClassData) {
      toast.error('Invalid class selection');
      return;
    }

    const academicSession = classAcademicSessionMap.get(selectedClassData.id);

    if (!academicSession) {
      toast.error('Could not find academic session for selected class');
      return;
    }

    try {
      const input: SyllabusCreateInput = {
        subject: selectedSubject.id,
        class_obj: selectedClassData.id,
        section: selectedClassData.section || undefined,
        academic_session: academicSession,
        title,
        description: description || undefined,
        file: pdfFile,
      };

      await createSyllabus(input);
      toast.success('Syllabus uploaded successfully');
      setUploadDialogOpen(false);
      resetUploadForm();
      refetchSyllabus();
    } catch (error: any) {
      toast.error(typeof error.message === 'string' ? error.message : 'Failed to upload syllabus');
    }
  };

  const openUploadDialog = () => {
    setSyllabusDialogOpen(false);
    resetUploadForm();
    setUploadDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your subjects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">My Subjects</h1>
        <p className="text-muted-foreground mt-2">
          Manage subjects you teach and view related information
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Subjects</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSubjects}</div>
            <p className="text-xs text-muted-foreground">Active subjects</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">Across all subjects</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClasses}</div>
            <p className="text-xs text-muted-foreground">Unique class sections</p>
          </CardContent>
        </Card>
      </div>

      {mySubjects.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium">No subjects assigned yet</p>
            <p className="text-sm text-muted-foreground mt-2">
              Contact your administrator to get subject assignments
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {mySubjects.map((subject) => (
            <Card key={subject.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{subject.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{subject.code}</p>
                  </div>
                  <BookOpen className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{subject.students} students</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">Classes:</p>
                    <div className="flex flex-wrap gap-2">
                      {subject.classes.map((cls: string, idx: number) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-primary/10 text-primary"
                        >
                          {cls}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setSelectedSubject(subject);
                        setSyllabusDialogOpen(true);
                      }}
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      View Syllabus
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        setSelectedSubject(subject);
                        setManageDialogOpen(true);
                      }}
                    >
                      <Settings className="h-4 w-4 mr-1" />
                      Manage
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Syllabus Dialog */}
      <Dialog open={syllabusDialogOpen} onOpenChange={setSyllabusDialogOpen}>
        <DialogContent className="sm:max-w-3xl max-w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Subject Syllabus</DialogTitle>
            <DialogDescription>
              {selectedSubject && `${selectedSubject.name} (${selectedSubject.code})`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedSubject && getSubjectSyllabi(selectedSubject.id).length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {getSubjectSyllabi(selectedSubject.id).map((syllabus) => (
                  <div
                    key={syllabus.id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-muted/20"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-primary" />
                      <div>
                        <p className="font-medium">{syllabus.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {syllabus.class_name}{syllabus.section_name ? ` - ${syllabus.section_name}` : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewPdf(syllabus.id, syllabus.file_url)}
                        disabled={loadingFileId !== null}
                      >
                        {loadingFileId === syllabus.id ? (
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <Eye className="h-4 w-4 mr-1" />
                        )}
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownloadPdf(syllabus.id, syllabus.file_url, syllabus.title)}
                        disabled={loadingFileId !== null}
                      >
                        {loadingFileId === syllabus.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border p-8 text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium">No Syllabus Uploaded</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Upload a syllabus PDF for this subject
                </p>
              </div>
            )}
            <div className="flex gap-2 pt-4 border-t">
              <Button
                onClick={openUploadDialog}
                className="flex-1"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Syllabus
              </Button>
              <Button variant="outline" onClick={() => setSyllabusDialogOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Upload Syllabus Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="sm:max-w-lg max-w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Upload Syllabus</DialogTitle>
            <DialogDescription>
              {selectedSubject && `Upload syllabus for ${selectedSubject.name}`}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUploadSyllabus} className="space-y-4">
            <div className="space-y-2">
              <Label>Subject</Label>
              <Input
                value={selectedSubject?.name || ''}
                disabled
                className="bg-muted"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="class">Class <span className="text-destructive">*</span></Label>
              <Select
                value={selectedClass}
                onValueChange={setSelectedClass}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {classOptionsForSubject.map((cls) => (
                    <SelectItem
                      key={`${cls.id}-${cls.section || 0}`}
                      value={`${cls.id}-${cls.section || 0}`}
                    >
                      {cls.name}{cls.sectionName ? ` - ${cls.sectionName}` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title <span className="text-destructive">*</span></Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Complete Syllabus 2024-25"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pdf">PDF File <span className="text-destructive">*</span></Label>
              <div className="border-2 border-dashed rounded-lg p-4 text-center hover:border-primary/50 transition-colors">
                <input
                  type="file"
                  id="pdf"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="pdf"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  {pdfFile ? (
                    <div className="space-y-1">
                      <span className="text-sm font-medium">{pdfFile.name}</span>
                      <p className="text-xs text-muted-foreground">Click to change file</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <span className="text-sm font-medium">Click to upload PDF</span>
                      <p className="text-xs text-muted-foreground">Maximum file size: 10MB</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1" disabled={isCreating}>
                {isCreating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Upload Syllabus
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setUploadDialogOpen(false);
                  resetUploadForm();
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Manage Subject Dialog */}
      <Dialog open={manageDialogOpen} onOpenChange={setManageDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Subject</DialogTitle>
            <DialogDescription>
              {selectedSubject && `${selectedSubject.name} (${selectedSubject.code})`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="h-24 flex-col gap-2"
                onClick={() => {
                  setManageDialogOpen(false);
                  navigate('/assignments/list');
                }}
              >
                <Plus className="h-6 w-6" />
                <span>Create Assignment</span>
              </Button>
              <Button
                variant="outline"
                className="h-24 flex-col gap-2"
                onClick={() => {
                  setManageDialogOpen(false);
                  navigate('/assignments/list');
                }}
              >
                <FileText className="h-6 w-6" />
                <span>View Assignments</span>
              </Button>
              <Button
                variant="outline"
                className="h-24 flex-col gap-2"
                onClick={() => {
                  setManageDialogOpen(false);
                  navigate('/library/books');
                }}
              >
                <BookOpen className="h-6 w-6" />
                <span>Study Materials</span>
              </Button>
              <Button
                variant="outline"
                className="h-24 flex-col gap-2"
                onClick={() => {
                  setManageDialogOpen(false);
                  navigate('/exams/marks-entry');
                }}
              >
                <Users className="h-6 w-6" />
                <span>Manage Grades</span>
              </Button>
            </div>
            <div className="flex gap-2 pt-4 border-t">
              <Button onClick={() => setManageDialogOpen(false)} className="flex-1">
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
