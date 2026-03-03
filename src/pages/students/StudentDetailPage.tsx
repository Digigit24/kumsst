/**
 * Student Detail Page with Edit Mode
 * Complete CRUD functionality with inline editing
 */

import {
  ArrowLeft,
  Award,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  CreditCard,
  Edit,
  FileText,
  GraduationCap,
  Heart,
  Mail,
  MapPin,
  Phone,
  Save,
  TrendingUp,
  Upload,
  User,
  X
} from 'lucide-react';
import React, { ChangeEvent, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useNavigate, useParams } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Separator } from '../../components/ui/separator';
import { Skeleton } from '../../components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { useStudent } from '../../hooks/useStudents';
import { studentApi } from '../../services/students.service';
import { AddressTab } from './components/AddressTab';
import { AttendanceTab } from './components/AttendanceTab';
import { CertificatesTab } from './components/CertificatesTab';
import { DocumentsTab } from './components/DocumentsTab';
import { FeesTab } from './components/FeesTab';
import { GuardiansTab } from './components/GuardiansTab';
import { MedicalTab } from './components/MedicalTab';
import { PromotionsTab } from './components/PromotionsTab';

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const StudentDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const studentId = id ? parseInt(id) : null;

  const { data: student, isLoading, error, refetch } = useStudent(studentId);
  const [activeTab, setActiveTab] = useState('personal');
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Scroll ref for tabs
  const tabsListRef = useRef<HTMLDivElement>(null);

  // Form state
  const [formData, setFormData] = useState<any>({});

  // Initialize form data when student loads
  React.useEffect(() => {
    if (student && !isEditMode) {
      setFormData({
        // Personal
        first_name: student.first_name,
        middle_name: student.middle_name || '',
        last_name: student.last_name,
        date_of_birth: student.date_of_birth,
        gender: student.gender,
        blood_group: student.blood_group || '',
        nationality: student.nationality,
        religion: student.religion || '',
        caste: student.caste || '',
        mother_tongue: student.mother_tongue || '',
        aadhar_number: student.aadhar_number || '',
        pan_number: student.pan_number || '',
        // Academic
        roll_number: student.roll_number || '',
        current_class: student.current_class,
        current_section: student.current_section,
        category: student.category,
        group: student.group,
        // Contact
        email: student.email,
        phone: student.phone || '',
        alternate_phone: student.alternate_phone || '',
      });
    }
  }, [student, isEditMode]);

  const handleEdit = () => {
    setIsEditMode(true);
  };

  const handleCancel = () => {
    setIsEditMode(false);
    setPhotoFile(null);
    setPhotoPreview(null);
    // Reset form data
    if (student) {
      setFormData({
        first_name: student.first_name,
        middle_name: student.middle_name || '',
        last_name: student.last_name,
        date_of_birth: student.date_of_birth,
        gender: student.gender,
        blood_group: student.blood_group || '',
        nationality: student.nationality,
        religion: student.religion || '',
        caste: student.caste || '',
        mother_tongue: student.mother_tongue || '',
        aadhar_number: student.aadhar_number || '',
        pan_number: student.pan_number || '',
        roll_number: student.roll_number || '',
        current_class: student.current_class,
        current_section: student.current_section,
        category: student.category,
        group: student.group,
        email: student.email,
        phone: student.phone || '',
        alternate_phone: student.alternate_phone || '',
      });
    }
  };

  const handleSave = async () => {
    if (!student) return;

    try {
      setIsSaving(true);

      let payload: any = formData;

      if (photoFile) {
        const data = new FormData();
        // Append text fields
        Object.entries(formData).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            data.append(key, String(value));
          }
        });
        // Append photo
        data.append('photo', photoFile);
        payload = data;
      }

      await studentApi.patch(student.id, payload);
      await refetch();
      setIsEditMode(false);
      setPhotoFile(null);
      setPhotoPreview(null);
    } catch (error) {
      console.error('Failed to save:', error);
      toast.error('Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("File size must be less than 2MB");
        return;
      }
      setPhotoFile(file);
      const url = URL.createObjectURL(file);
      setPhotoPreview(url);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const scrollTabs = (direction: 'left' | 'right') => {
    if (tabsListRef.current) {
      const amount = 200;
      tabsListRef.current.scrollBy({
        left: direction === 'left' ? -amount : amount,
        behavior: 'smooth'
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen p-6 space-y-6 animate-fade-in">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-md" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <Skeleton className="h-48 w-full rounded-lg" />
        <Skeleton className="h-96 w-full rounded-lg" />
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="p-6 min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="text-destructive text-5xl">⚠</div>
              <h2 className="text-xl font-semibold">Student Not Found</h2>
              <p className="text-muted-foreground">{error || 'Unable to load student details'}</p>
              <Button onClick={() => navigate('/students/list')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Students
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-8 animate-fade-in">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background p-6 md:p-8 border-b">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/students/list')}
              className="transition-all hover:scale-105"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex gap-2">
              <Badge variant={student.is_active ? 'success' : 'destructive'} className="animate-scale-in">
                {student.is_active ? 'Active' : 'Inactive'}
              </Badge>
              {student.is_alumni && <Badge variant="outline">Alumni</Badge>}

              {/* Edit/Save/Cancel Buttons */}
              {!isEditMode ? (
                <Button size="sm" variant="default" onClick={handleEdit} className="hover:scale-105 transition-all">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              ) : (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isSaving}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    variant="default"
                    onClick={handleSave}
                    loading={isSaving}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Student Profile Header */}
          <div className="flex items-start gap-6 flex-wrap">
            <div className="relative group">
              <Avatar className="h-24 w-24 border-4 border-background shadow-xl transition-transform hover:scale-105">
                {photoPreview || student.photo ? (
                  <AvatarImage src={photoPreview || student.photo || undefined} alt={student.full_name} />
                ) : (
                  <AvatarFallback className="text-2xl font-bold bg-primary text-primary-foreground">
                    {getInitials(student.full_name)}
                  </AvatarFallback>
                )}
              </Avatar>
              {isEditMode && (
                <>
                  <label
                    htmlFor="photo-upload"
                    className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white z-10"
                    title="Upload Photo"
                  >
                    <Upload className="h-6 w-6" />
                  </label>
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </>
              )}
            </div>
            <div className="flex-1 space-y-2">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{student.full_name}</h1>
              <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <CreditCard className="h-4 w-4" />
                  {student.admission_number}
                </span>
                <Separator orientation="vertical" className="h-4" />
                <span className="flex items-center gap-1">
                  <GraduationCap className="h-4 w-4" />
                  {student.program_name}
                </span>
                {student.current_class_name && (
                  <>
                    <Separator orientation="vertical" className="h-4" />
                    <span>{student.current_class_name}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 md:px-8 -mt-4">
        {/* Quick Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card variant="elevated" className="overflow-hidden animate-slide-in">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="font-medium text-sm truncate">{student.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="elevated" className="overflow-hidden animate-slide-in" style={{ animationDelay: '50ms' }}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <Phone className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="font-medium text-sm">{student.phone || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="elevated" className="overflow-hidden animate-slide-in" style={{ animationDelay: '100ms' }}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-500/10 rounded-lg">
                  <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Admission Date</p>
                  <p className="font-medium text-sm">{student.admission_date}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="elevated" className="overflow-hidden animate-slide-in" style={{ animationDelay: '150ms' }}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-orange-500/10 rounded-lg">
                  <GraduationCap className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Class</p>
                  <p className="font-medium text-sm">{student.current_class_name || 'Not Assigned'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">

          {/* Scrollable Tabs Header */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 shrink-0 rounded-full shadow-sm md:hidden lg:flex"
              onClick={() => scrollTabs('left')}
              title="Scroll Left"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div
              ref={tabsListRef}
              className="w-full overflow-x-auto overflow-y-hidden scrollbar-hide pb-1 scroll-smooth"
            >
              <TabsList className="inline-flex w-auto min-w-full md:min-w-0">
                <TabsTrigger value="personal">
                  <User className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Personal Info</span>
                  <span className="sm:hidden">Personal</span>
                </TabsTrigger>
                <TabsTrigger value="academic">
                  <GraduationCap className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Academic</span>
                  <span className="sm:hidden">Academic</span>
                </TabsTrigger>
                <TabsTrigger value="contact">
                  <Phone className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Contact</span>
                  <span className="sm:hidden">Contact</span>
                </TabsTrigger>
                <TabsTrigger value="guardians">
                  <User className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Guardians</span>
                  <span className="sm:hidden">Guardians</span>
                </TabsTrigger>
                <TabsTrigger value="documents">
                  <FileText className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Documents</span>
                  <span className="sm:hidden">Docs</span>
                </TabsTrigger>
                <TabsTrigger value="medical">
                  <Heart className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Medical</span>
                  <span className="sm:hidden">Medical</span>
                </TabsTrigger>
                <TabsTrigger value="address">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Address</span>
                  <span className="sm:hidden">Address</span>
                </TabsTrigger>
                <TabsTrigger value="promotions">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Promotions</span>
                  <span className="sm:hidden">Promo</span>
                </TabsTrigger>
                <TabsTrigger value="certificates">
                  <Award className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Certificates</span>
                  <span className="sm:hidden">Certs</span>
                </TabsTrigger>
                <TabsTrigger value="attendance">
                  <ClipboardList className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Attendance</span>
                  <span className="sm:hidden">Attend</span>
                </TabsTrigger>
                <TabsTrigger value="fees">
                  <CreditCard className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Fees</span>
                  <span className="sm:hidden">Fees</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 shrink-0 rounded-full shadow-sm md:hidden lg:flex"
              onClick={() => scrollTabs('right')}
              title="Scroll Right"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Personal Info Tab - WITH EDIT MODE */}
          <TabsContent value="personal">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* First Name */}
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-muted-foreground">First Name</label>
                    {isEditMode ? (
                      <Input
                        value={formData.first_name}
                        onChange={(e) => handleChange('first_name', e.target.value)}
                      />
                    ) : (
                      <p className="font-medium">{student.first_name}</p>
                    )}
                  </div>

                  {/* Middle Name */}
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-muted-foreground">Middle Name</label>
                    {isEditMode ? (
                      <Input
                        value={formData.middle_name}
                        onChange={(e) => handleChange('middle_name', e.target.value)}
                      />
                    ) : (
                      <p className="font-medium">{student.middle_name || 'N/A'}</p>
                    )}
                  </div>

                  {/* Last Name */}
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-muted-foreground">Last Name</label>
                    {isEditMode ? (
                      <Input
                        value={formData.last_name}
                        onChange={(e) => handleChange('last_name', e.target.value)}
                      />
                    ) : (
                      <p className="font-medium">{student.last_name}</p>
                    )}
                  </div>

                  {/* Date of Birth */}
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-muted-foreground">Date of Birth</label>
                    {isEditMode ? (
                      <Input
                        type="date"
                        value={formData.date_of_birth}
                        onChange={(e) => handleChange('date_of_birth', e.target.value)}
                      />
                    ) : (
                      <p className="font-medium">{student.date_of_birth}</p>
                    )}
                  </div>

                  {/* Gender */}
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-muted-foreground">Gender</label>
                    {isEditMode ? (
                      <Select value={formData.gender} onValueChange={(value) => handleChange('gender', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="font-medium capitalize">{student.gender}</p>
                    )}
                  </div>

                  {/* Blood Group */}
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-muted-foreground">Blood Group</label>
                    {isEditMode ? (
                      <Select value={formData.blood_group} onValueChange={(value) => handleChange('blood_group', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select blood group" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A+">A+</SelectItem>
                          <SelectItem value="A-">A-</SelectItem>
                          <SelectItem value="B+">B+</SelectItem>
                          <SelectItem value="B-">B-</SelectItem>
                          <SelectItem value="AB+">AB+</SelectItem>
                          <SelectItem value="AB-">AB-</SelectItem>
                          <SelectItem value="O+">O+</SelectItem>
                          <SelectItem value="O-">O-</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="font-medium">{student.blood_group || 'Not Specified'}</p>
                    )}
                  </div>

                  {/* Nationality */}
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-muted-foreground">Nationality</label>
                    {isEditMode ? (
                      <Input
                        value={formData.nationality}
                        onChange={(e) => handleChange('nationality', e.target.value)}
                      />
                    ) : (
                      <p className="font-medium">{student.nationality}</p>
                    )}
                  </div>

                  {/* Religion */}
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-muted-foreground">Religion</label>
                    {isEditMode ? (
                      <Input
                        value={formData.religion}
                        onChange={(e) => handleChange('religion', e.target.value)}
                      />
                    ) : (
                      <p className="font-medium">{student.religion || 'Not Specified'}</p>
                    )}
                  </div>

                  {/* Caste */}
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-muted-foreground">Caste</label>
                    {isEditMode ? (
                      <Input
                        value={formData.caste}
                        onChange={(e) => handleChange('caste', e.target.value)}
                      />
                    ) : (
                      <p className="font-medium">{student.caste || 'Not Specified'}</p>
                    )}
                  </div>

                  {/* Mother Tongue */}
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-muted-foreground">Mother Tongue</label>
                    {isEditMode ? (
                      <Input
                        value={formData.mother_tongue}
                        onChange={(e) => handleChange('mother_tongue', e.target.value)}
                      />
                    ) : (
                      <p className="font-medium">{student.mother_tongue || 'Not Specified'}</p>
                    )}
                  </div>

                  {/* Aadhar Number */}
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-muted-foreground">Aadhar Number</label>
                    {isEditMode ? (
                      <Input
                        value={formData.aadhar_number}
                        onChange={(e) => handleChange('aadhar_number', e.target.value)}
                      />
                    ) : (
                      <p className="font-medium">{student.aadhar_number || 'Not Provided'}</p>
                    )}
                  </div>

                  {/* PAN Number */}
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-muted-foreground">PAN Number</label>
                    {isEditMode ? (
                      <Input
                        value={formData.pan_number}
                        onChange={(e) => handleChange('pan_number', e.target.value)}
                      />
                    ) : (
                      <p className="font-medium">{student.pan_number || 'Not Provided'}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Academic Info Tab - WITH EDIT MODE */}
          <TabsContent value="academic">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-primary" />
                  Current Academic Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-muted-foreground">Admission Number</label>
                    <p className="font-medium">{student.admission_number}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-muted-foreground">Registration Number</label>
                    <p className="font-medium">{student.registration_number}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-muted-foreground">Admission Date</label>
                    <p className="font-medium">{student.admission_date}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-muted-foreground">Admission Type</label>
                    <p className="font-medium">{student.admission_type}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-muted-foreground">Program</label>
                    <p className="font-medium">{student.program_name}</p>
                  </div>

                  {/* Roll Number - Editable */}
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-muted-foreground">Roll Number</label>
                    {isEditMode ? (
                      <Input
                        value={formData.roll_number}
                        onChange={(e) => handleChange('roll_number', e.target.value)}
                      />
                    ) : (
                      <p className="font-medium">{student.roll_number || 'Not Assigned'}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-muted-foreground">Current Class</label>
                    <p className="font-medium">{student.current_class_name || 'Not Assigned'}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-muted-foreground">Section</label>
                    <p className="font-medium">{student.current_section_name || 'Not Assigned'}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-muted-foreground">Category</label>
                    <p className="font-medium">{student.category_name || 'Not Specified'}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-muted-foreground">Group</label>
                    <p className="font-medium">{student.group_name || 'Not Specified'}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-muted-foreground">Previous School</label>
                    <p className="font-medium">{student.custom_fields?.previous_school || 'Not Specified'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contact Tab - WITH EDIT MODE */}
          <TabsContent value="contact">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                  <Phone className="h-5 w-5 text-primary" />
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Email */}
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-muted-foreground">Email Address</label>
                    {isEditMode ? (
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                      />
                    ) : (
                      <p className="font-medium">{student.email}</p>
                    )}
                  </div>

                  {/* Phone */}
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
                    {isEditMode ? (
                      <Input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                      />
                    ) : (
                      <p className="font-medium">{student.phone || 'Not Provided'}</p>
                    )}
                  </div>

                  {/* Alternate Phone */}
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-muted-foreground">Alternate Phone</label>
                    {isEditMode ? (
                      <Input
                        type="tel"
                        value={formData.alternate_phone}
                        onChange={(e) => handleChange('alternate_phone', e.target.value)}
                      />
                    ) : (
                      <p className="font-medium">{student.alternate_phone || 'Not Provided'}</p>
                    )}
                  </div>
                </div>
                <Separator className="my-6" />
                <p className="text-sm text-muted-foreground">
                  Detailed addresses available in Address module
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Other Tabs - No edit mode, just display */}
          <TabsContent value="guardians">
            <GuardiansTab studentId={student.id} />
          </TabsContent>

          <TabsContent value="documents">
            <DocumentsTab studentId={student.id} />
          </TabsContent>

          <TabsContent value="medical">
            <MedicalTab studentId={student.id} />
          </TabsContent>

          <TabsContent value="address">
            <AddressTab studentId={student.id} />
          </TabsContent>

          <TabsContent value="promotions">
            <PromotionsTab studentId={student.id} />
          </TabsContent>

          <TabsContent value="certificates">
            <CertificatesTab studentId={student.id} />
          </TabsContent>

          <TabsContent value="attendance">
            <AttendanceTab studentId={student.id} />
          </TabsContent>

          <TabsContent value="fees">
            <FeesTab studentId={student.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
