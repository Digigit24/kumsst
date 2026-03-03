import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Users, GraduationCap, TrendingUp, Mail, Phone, Calendar, BookOpen, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { teachersApi } from '@/services/teachers.service';
import { classTeacherApi } from '@/services/academic.service';
import { DROPDOWN_PAGE_SIZE } from '@/config/app.config';

export const TeacherStudentsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedSection, setSelectedSection] = useState<string>('all');

  // Fetch students using the new API
  const { data, isLoading } = useQuery({
    queryKey: ['teacher-students'],
    queryFn: () => teachersApi.getMyStudents({ page_size: DROPDOWN_PAGE_SIZE }),
  });

  // Fetch teacher's assigned classes and sections
  const { data: classTeachersData } = useQuery({
    queryKey: ['teacher-class-assignments'],
    queryFn: () => classTeacherApi.list({ teacher: user?.id, page_size: DROPDOWN_PAGE_SIZE }),
    enabled: !!user?.id,
  });

  // Map API response to UI model
  const myStudents = useMemo(() => {
    if (!data?.results) return [];

    return data.results.map((student: any) => ({
      id: student.id,
      name: student.full_name,
      class: student.current_class_name || 'N/A',
      classId: student.current_class || null,
      section: student.current_section_name || 'N/A',
      sectionId: student.current_section || null,
      rollNo: student.admission_number,
      attendance: 0, // TODO: Fetch separately if needed
      email: student.email,
      phone: student.phone || 'N/A',
      // Note: These fields are not in the list response provided, so defaulting them.
      // If they are needed, we might need to fetch details for the specific student on click.
      dateOfBirth: student.date_of_birth || null,
      guardianName: 'N/A',
      guardianPhone: 'N/A',
      subjects: [],
    }));
  }, [data]);

  // Extract unique classes and sections from teacher's assignments
  const availableClassesAndSections = useMemo(() => {
    if (!classTeachersData?.results) return { classes: [], sections: [] };

    const classes = new Map<number, string>();
    const sections = new Map<number, { name: string; classId: number }>();

    classTeachersData.results.forEach((assignment: any) => {
      if (assignment.class_obj && assignment.class_name) {
        classes.set(assignment.class_obj, assignment.class_name);
      }
      if (assignment.section && assignment.section_name) {
        sections.set(assignment.section, {
          name: assignment.section_name,
          classId: assignment.class_obj,
        });
      }
    });

    return {
      classes: Array.from(classes.entries()).map(([id, name]) => ({ id, name })),
      sections: Array.from(sections.entries()).map(([id, data]) => ({ id, ...data })),
    };
  }, [classTeachersData]);

  // Filter students based on selected class and section
  const filteredStudents = useMemo(() => {
    return myStudents.filter((student) => {
      if (selectedClass !== 'all' && student.classId?.toString() !== selectedClass) {
        return false;
      }
      if (selectedSection !== 'all' && student.sectionId?.toString() !== selectedSection) {
        return false;
      }
      return true;
    });
  }, [myStudents, selectedClass, selectedSection]);

  // Get sections available for the selected class
  const sectionsForClass = useMemo(() => {
    if (selectedClass === 'all') {
      return availableClassesAndSections.sections;
    }
    return availableClassesAndSections.sections.filter(
      (s) => s.classId.toString() === selectedClass
    );
  }, [selectedClass, availableClassesAndSections.sections]);

  const stats = useMemo(() => ({
    totalStudents: filteredStudents.length,
    avgAttendance: 0,
    activeClasses: new Set(filteredStudents.map(s => s.classId)).size,
  }), [filteredStudents]);

  const handleViewDetails = (student: any) => {
    setSelectedStudent(student);
    setIsDetailsOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your students...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">My Students</h1>
        <p className="text-muted-foreground mt-2">
          View and manage students from your classes
        </p>
      </div>

      {/* Filter Section */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Students</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Select Class</label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="All Classes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {availableClassesAndSections.classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id.toString()}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Select Section</label>
              <Select
                value={selectedSection}
                onValueChange={setSelectedSection}
                disabled={selectedClass === 'all' && sectionsForClass.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Sections" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sections</SelectItem>
                  {sectionsForClass.map((section) => (
                    <SelectItem key={section.id} value={section.id.toString()}>
                      {section.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              Across {stats.activeClasses} {stats.activeClasses === 1 ? 'class' : 'classes'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Attendance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">Coming soon</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Classes</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeClasses}</div>
            <p className="text-xs text-muted-foreground">Current semester</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Student List ({filteredStudents.length} students)</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredStudents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No students found in the selected class and section</p>
              <p className="text-sm mt-2">Try selecting different filters</p>
            </div>
          ) : (
            <>
              {/* Desktop: Table view */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium">Admission No</th>
                      <th className="text-left p-3 font-medium">Name</th>
                      <th className="text-left p-3 font-medium">Class</th>
                      <th className="text-left p-3 font-medium">Section</th>
                      <th className="text-left p-3 font-medium">Email</th>
                      <th className="text-left p-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((student) => (
                      <tr key={student.id} className="border-b hover:bg-muted/50">
                        <td className="p-3">{student.rollNo}</td>
                        <td className="p-3">{student.name}</td>
                        <td className="p-3">{student.class}</td>
                        <td className="p-3">{student.section}</td>
                        <td className="p-3 text-sm text-muted-foreground">{student.email}</td>
                        <td className="p-3">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDetails(student)}
                          >
                            View Details
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile: Card view */}
              <div className="md:hidden space-y-3">
                {filteredStudents.map((student) => (
                  <div key={student.id} className="rounded-xl border border-border/50 bg-card p-4 shadow-sm">
                    <div className="flex items-start justify-between mb-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-base">{student.name}</p>
                        <p className="text-sm text-muted-foreground font-mono">{student.rollNo}</p>
                      </div>
                      <Badge variant="secondary" className="ml-2 shrink-0">{student.class} - {student.section}</Badge>
                    </div>
                    {student.email && (
                      <p className="text-sm text-muted-foreground mb-3 truncate">{student.email}</p>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full min-h-[44px]"
                      onClick={() => handleViewDetails(student)}
                    >
                      View Details
                    </Button>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Student Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-2xl max-w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Student Details</DialogTitle>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Name</p>
                  <p className="text-base font-semibold">{selectedStudent.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Admission Number</p>
                  <p className="text-base font-semibold">{selectedStudent.rollNo}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Class</p>
                  <p className="text-base">{selectedStudent.class}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Date of Birth</p>
                  <p className="text-base">{new Date(selectedStudent.dateOfBirth).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Contact Info */}
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Contact Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="text-sm">{selectedStudent.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Phone</p>
                      <p className="text-sm">{selectedStudent.phone}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Guardian Info */}
              {selectedStudent.guardianName !== 'N/A' && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">Guardian Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Guardian Name</p>
                      <p className="text-sm">{selectedStudent.guardianName}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Guardian Phone</p>
                      <p className="text-sm">{selectedStudent.guardianPhone}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-4 border-t">
                <Button onClick={() => setIsDetailsOpen(false)} className="flex-1">
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
