import { DetailSidebar } from '@/components/common/DetailSidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { API_BASE_URL } from '@/config/api.config';
import { DROPDOWN_PAGE_SIZE } from '@/config/app.config';
import { useCreateSyllabus, useDeleteSyllabus, useDownloadSyllabusFile } from '@/hooks/useAcademic';
import { useClassesSWR, useSubjectAssignmentsSWR, useSyllabusListSWR } from '@/hooks/useAcademicSWR';
import { useAuth } from '@/hooks/useAuth';
import type { SyllabusCreateInput } from '@/types/academic.types';
import { BookOpen, Download, Eye, FileText, Loader2, Plus, Trash2, Upload } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';

export const SyllabusPage: React.FC = () => {
  const { user } = useAuth();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // Fetch subject assignments for the logged-in teacher
  const { data: assignmentsData, isLoading: isLoadingAssignments } = useSubjectAssignmentsSWR({
    teacher: user?.id,
    is_active: true,
    page_size: DROPDOWN_PAGE_SIZE,
  });

  // Fetch syllabus list
  const { data: syllabusData, isLoading: isLoadingSyllabus, refresh: refetchSyllabus } = useSyllabusListSWR({
    page_size: DROPDOWN_PAGE_SIZE,
  });

  // Fetch classes to get academic_session data
  const { data: classesData, isLoading: isLoadingClasses } = useClassesSWR({
    page_size: DROPDOWN_PAGE_SIZE,
    is_active: true,
  });

  const { mutate: createSyllabus, isLoading: isCreating } = useCreateSyllabus();
  const { mutate: deleteSyllabus, isLoading: isDeleting } = useDeleteSyllabus();
  const { mutate: downloadFile, isLoading: isDownloading } = useDownloadSyllabusFile();
  const [loadingFileId, setLoadingFileId] = useState<number | null>(null);

  // Get unique subjects from assignments
  const subjectOptions = useMemo(() => {
    if (!assignmentsData?.results) return [];
    const subjectMap = new Map();
    assignmentsData.results.forEach(assignment => {
      if (!subjectMap.has(assignment.subject)) {
        subjectMap.set(assignment.subject, {
          id: assignment.subject,
          name: assignment.subject_name,
        });
      }
    });
    return Array.from(subjectMap.values());
  }, [assignmentsData]);

  // Get classes for selected subject
  const classOptions = useMemo(() => {
    if (!assignmentsData?.results || !selectedSubject) return [];
    return assignmentsData.results
      .filter(a => a.subject === parseInt(selectedSubject))
      .map(a => ({
        id: a.class_obj,
        name: a.class_name,
        section: a.section,
        sectionName: a.section_name,
      }));
  }, [assignmentsData, selectedSubject]);

  // Create a lookup map for class ID to academic_session
  const classAcademicSessionMap = useMemo(() => {
    if (!classesData?.results) return new Map<number, number>();
    const map = new Map<number, number>();
    classesData.results.forEach(cls => {
      map.set(cls.id, cls.academic_session);
    });
    return map;
  }, [classesData]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedSubject || !selectedClass || !title || !pdfFile) {
      toast.error('Please fill all required fields');
      return;
    }

    const selectedClassData = classOptions.find(c => `${c.id}-${c.section || 0}` === selectedClass);

    if (!selectedClassData) {
      toast.error('Invalid class selection');
      return;
    }

    try {
      // Get academic_session from the pre-fetched class data
      const academicSession = classAcademicSessionMap.get(selectedClassData.id);

      if (!academicSession) {
        toast.error('Could not find academic session for selected class');
        return;
      }

      const input: SyllabusCreateInput = {
        subject: parseInt(selectedSubject),
        class_obj: selectedClassData.id,
        section: selectedClassData.section || undefined,
        academic_session: academicSession,
        title,
        description: description || undefined,
        file: pdfFile,
      };

      await createSyllabus(input);
      toast.success('Syllabus uploaded successfully');
      setIsAddDialogOpen(false);
      resetForm();
      refetchSyllabus();
    } catch (error: any) {
      toast.error(typeof error.message === 'string' ? error.message : 'Failed to upload syllabus');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await deleteSyllabus(deleteId);
      toast.success('Syllabus deleted successfully');
      setDeleteId(null);
      refetchSyllabus();
    } catch (error: any) {
      toast.error(typeof error.message === 'string' ? error.message : 'Failed to delete syllabus');
    }
  };

  const resetForm = () => {
    setSelectedSubject('');
    setSelectedClass('');
    setTitle('');
    setDescription('');
    setPdfFile(null);
  };

  const handleViewPdf = async (syllabusId: number, pdfUrl: string) => {
    try {
      setLoadingFileId(syllabusId);

      // If it's an external link (S3, etc), just open it directly to avoid CORS issues with fetch
      if (pdfUrl.startsWith('http')) {
        window.open(pdfUrl, '_blank');
        return;
      }

      const blob = await downloadFile(pdfUrl);
      if (!blob) throw new Error('Failed to load file');
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      // Clean up the URL after a short delay
      setTimeout(() => window.URL.revokeObjectURL(url), 1000);
    } catch (error: any) {
      // Fallback: try opening the URL directly if blob fetch failed
      if (pdfUrl) {
        const fullUrl = pdfUrl.startsWith('http') ? pdfUrl : `${API_BASE_URL}${pdfUrl}`;
        window.open(fullUrl, '_blank');
      } else {
        toast.error(typeof error.message === 'string' ? error.message : 'Failed to open PDF');
      }
    } finally {
      setLoadingFileId(null);
    }
  };

  const handleDownloadPdf = async (syllabusId: number, pdfUrl: string, title: string) => {
    try {
      setLoadingFileId(syllabusId);
      const blob = await downloadFile(pdfUrl);

      if (!blob) {
        throw new Error('Failed to download file');
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${title}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('PDF downloaded successfully');
    } catch (error: any) {
      // Fallback: If blob fetch fails (e.g. CORS), try direct link opening
      // We can't easily force "download" attribute on cross-origin, but we can open it
      if (pdfUrl) {
        const fullUrl = pdfUrl.startsWith('http') ? pdfUrl : `${API_BASE_URL}${pdfUrl}`;
        // Try to open in new tab - browser might download it if headers are set, or just view it
        window.open(fullUrl, '_blank');
        toast.info('Opening file directly due to download restriction...');
      } else {
        toast.error(typeof error.message === 'string' ? error.message : 'Failed to download PDF');
      }
    } finally {
      setLoadingFileId(null);
    }
  };

  const isLoading = isLoadingAssignments || isLoadingSyllabus || isLoadingClasses;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading syllabus...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Syllabus Management</h1>
          <p className="text-muted-foreground mt-2">
            Upload and manage syllabus PDFs for your subjects
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Syllabus
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Syllabi</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{syllabusData?.results?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Uploaded documents</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Subjects</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subjectOptions.length}</div>
            <p className="text-xs text-muted-foreground">Active subjects</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Classes</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assignmentsData?.results?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Subject assignments</p>
          </CardContent>
        </Card>
      </div>

      {/* Syllabus List */}
      {syllabusData?.results && syllabusData.results.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {syllabusData.results.map((syllabus) => (
            <Card key={syllabus.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{syllabus.title}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {syllabus.subject_name}
                    </p>
                  </div>
                  <FileText className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm">
                    <span className="font-medium">Class:</span> {syllabus.class_name}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Uploaded by:</span> {syllabus.uploaded_by_name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Uploaded: {syllabus.created_at}
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleViewPdf(syllabus.id, syllabus.file_url)}
                      disabled={loadingFileId === syllabus.id || !syllabus.file_url}
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
                      disabled={loadingFileId === syllabus.id || !syllabus.file_url}
                    >
                      {loadingFileId === syllabus.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setDeleteId(syllabus.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium">No syllabus uploaded yet</p>
            <p className="text-sm text-muted-foreground mt-2">
              Click "Add Syllabus" to upload your first syllabus PDF
            </p>
          </CardContent>
        </Card>
      )}

      {/* Add Syllabus Side Drawer */}
      {/* Add Syllabus Side Drawer */}
      <DetailSidebar
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        title="Upload Syllabus"
        mode="create"
      >
        <div className="space-y-1 pb-4 border-b mb-6">
          <p className="text-sm text-muted-foreground">
            Upload a PDF syllabus for your subject
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Subject <span className="text-destructive">*</span></Label>
            <Select
              value={selectedSubject}
              onValueChange={(value) => {
                setSelectedSubject(value);
                setSelectedClass('');
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent>
                {subjectOptions.map((subject) => (
                  <SelectItem key={subject.id} value={String(subject.id)}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="class">Class <span className="text-destructive">*</span></Label>
            <Select
              value={selectedClass}
              onValueChange={setSelectedClass}
              disabled={!selectedSubject}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select class" />
              </SelectTrigger>
              <SelectContent>
                {classOptions.map((cls) => (
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
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pdf">PDF File <span className="text-destructive">*</span></Label>
            <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
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
                <Upload className="h-10 w-10 text-muted-foreground" />
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

          <div className="flex gap-2 pt-6">
            <Button type="submit" className="flex-1" disabled={isCreating}>
              {isCreating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Upload Syllabus
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsAddDialogOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DetailSidebar>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Syllabus</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this syllabus? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 pt-4">
            <Button
              variant="destructive"
              className="flex-1"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setDeleteId(null)}
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
