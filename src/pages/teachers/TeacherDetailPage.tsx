/**
 * Teacher Detail Page with Edit Mode
 * Displays teacher details using a structure similar to Student Profile
 */

import {
    ArrowLeft,
    Briefcase,
    Calendar,
    ChevronLeft,
    ChevronRight,
    User as UserIcon,
    Phone,
    Mail,
    MapPin,
    GraduationCap,
    Award,
    BookOpen,
    Edit,
    Save,
    X,
    CreditCard,

    Building,
    Globe,
    Linkedin,
    School,
    Book,
    Layers
} from 'lucide-react';
import React, { useRef, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Separator } from '../../components/ui/separator';
import { Skeleton } from '../../components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { useTeacher, useUpdateTeacher } from '../../hooks/useTeachers';
import type { TeacherUpdateInput } from '../../types/teachers.types';

export const TeacherDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const teacherId = id ? parseInt(id) : null;

    const { data: teacher, isLoading, error, refetch } = useTeacher(teacherId);
    const updateMutation = useUpdateTeacher();

    const [activeTab, setActiveTab] = useState('personal');
    const [isEditMode, setIsEditMode] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Scroll ref for tabs
    const tabsListRef = useRef<HTMLDivElement>(null);

    // Form state
    const [formData, setFormData] = useState<any>({});

    // Initialize form data when teacher loads
    useEffect(() => {
        if (teacher && !isEditMode) {
            setFormData({
                // Personal
                first_name: teacher.first_name,
                middle_name: teacher.middle_name || '',
                last_name: teacher.last_name,
                date_of_birth: teacher.date_of_birth,
                gender: teacher.gender,
                email: teacher.email,
                phone: teacher.phone || '',
                alternate_phone: teacher.alternate_phone || '',
                address: teacher.address || '',

                // Professional
                employee_id: teacher.employee_id,
                joining_date: teacher.joining_date,
                qualification: teacher.qualifications || '',  // Note: JSON says 'qualifications'
                specialization: teacher.specialization || '',
                experience_details: teacher.experience_details || '',
                resignation_date: teacher.resignation_date || '',

                // Other
                custom_attributes: teacher.custom_attributes || '',
            });
        }
    }, [teacher, isEditMode]);

    const handleEdit = () => {
        setIsEditMode(true);
    };

    const handleCancel = () => {
        setIsEditMode(false);
        // Reset form relies on useEffect to sync with 'teacher' data
    };

    const handleSave = async () => {
        if (!teacher || !teacherId) return;

        try {
            setIsSaving(true);

            const updateData: TeacherUpdateInput = {
                first_name: formData.first_name,
                middle_name: formData.middle_name,
                last_name: formData.last_name,
                date_of_birth: formData.date_of_birth,
                gender: formData.gender,
                email: formData.email,
                phone: formData.phone,
                alternate_phone: formData.alternate_phone,
                address: formData.address,
                joining_date: formData.joining_date,
                qualifications: formData.qualification,
                specialization: formData.specialization,
                experience_details: formData.experience_details,
                resignation_date: formData.resignation_date || null,
                // Note: some fields like employee_id might be read-only on backend, 
                // but including them in case they are editable. 
                // Typically IDs are not editable.
            };

            await updateMutation.mutate({ id: teacherId, data: updateData });
            await refetch();
            setIsEditMode(false);
        } catch (error) {

            // alert('Failed to save changes. Please try again.'); // Using UI toast would be better but keeping simple
        } finally {
            setIsSaving(false);
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

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
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

    if (error || !teacher) {
        return (
            <div className="p-6 min-h-screen flex items-center justify-center">
                <Card className="max-w-md w-full">
                    <CardContent className="p-6">
                        <div className="text-center space-y-4">
                            <div className="text-destructive text-5xl">⚠</div>
                            <h2 className="text-xl font-semibold">Teacher Not Found</h2>
                            <p className="text-muted-foreground">{error || 'Unable to load teacher details'}</p>
                            <Button onClick={() => navigate('/teachers')}>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Teachers
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
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 p-6 md:p-8 border-b border-indigo-100 dark:border-indigo-900/50">
                <div className="max-w-7xl mx-auto space-y-6">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate('/teachers')}
                            className="bg-white/50 dark:bg-black/20 hover:bg-white dark:hover:bg-black/40 transition-all hover:scale-105"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                        </Button>
                        <div className="flex gap-2">
                            <Badge variant={teacher.is_active ? 'success' : 'destructive'} className="animate-scale-in">
                                {teacher.is_active ? 'Active' : 'Inactive'}
                            </Badge>

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
                                        disabled={isSaving}
                                        className="bg-green-600 hover:bg-green-700"
                                    >
                                        {isSaving ? 'Saving...' : (
                                            <>
                                                <Save className="h-4 w-4 mr-2" />
                                                Save Changes
                                            </>
                                        )}
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Teacher Profile Header */}
                    <div className="flex items-start gap-6 flex-wrap">
                        <Avatar className="h-24 w-24 border-4 border-white dark:border-gray-800 shadow-xl transition-transform hover:scale-105 ring-2 ring-indigo-100 dark:ring-indigo-900">
                            <AvatarFallback className="text-2xl font-bold bg-indigo-600 text-white">
                                {getInitials(teacher.full_name)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-2">
                            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                                {teacher.full_name}
                            </h1>
                            <div className="flex flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-300">
                                <span className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/50 dark:bg-black/20">
                                    <CreditCard className="h-4 w-4 text-indigo-500" />
                                    <span className="font-medium text-xs uppercase tracking-wide opacity-70">ID:</span>
                                    {teacher.employee_id}
                                </span>
                                <span className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/50 dark:bg-black/20">
                                    <Briefcase className="h-4 w-4 text-purple-500" />
                                    <span className="font-medium text-xs uppercase tracking-wide opacity-70">Faculty:</span>
                                    {teacher.faculty_name || 'N/A'}
                                </span>
                                <span className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/50 dark:bg-black/20">
                                    <Award className="h-4 w-4 text-amber-500" />
                                    <span className="font-medium text-xs uppercase tracking-wide opacity-70">Specialization:</span>
                                    {teacher.specialization || 'General'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 md:px-8 -mt-8 relative z-10">
                {/* Quick Info Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow bg-white dark:bg-gray-800">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                                    <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Email</p>
                                    <p className="font-semibold text-sm truncate">{teacher.email}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow bg-white dark:bg-gray-800">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                                    <Phone className="h-5 w-5 text-green-600 dark:text-green-400" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Phone</p>
                                    <p className="font-semibold text-sm">{teacher.phone || 'N/A'}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow bg-white dark:bg-gray-800">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                                    <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Joined</p>
                                    <p className="font-semibold text-sm">{teacher.joining_date}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow bg-white dark:bg-gray-800">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
                                    <Building className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">College</p>
                                    <p className="font-semibold text-sm truncate">{teacher.college_name || 'N/A'}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">

                    {/* Scrollable Tabs Header */}
                    <div className="flex items-center gap-2 bg-white dark:bg-gray-800/50 p-1 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 shrink-0 rounded-lg md:hidden lg:flex"
                            onClick={() => scrollTabs('left')}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>

                        <div
                            ref={tabsListRef}
                            className="w-full overflow-x-auto overflow-y-hidden scrollbar-hide py-1 scroll-smooth"
                        >
                            <TabsList className="inline-flex w-auto min-w-full md:min-w-0 bg-transparent h-auto p-0 gap-1">
                                <TabsTrigger
                                    value="personal"
                                    className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 dark:data-[state=active]:bg-indigo-900/30 dark:data-[state=active]:text-indigo-300 px-4 py-2 h-auto rounded-lg"
                                >
                                    <UserIcon className="h-4 w-4 mr-2" />
                                    <span>Personal Info</span>
                                </TabsTrigger>
                                <TabsTrigger
                                    value="professional"
                                    className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 dark:data-[state=active]:bg-indigo-900/30 dark:data-[state=active]:text-indigo-300 px-4 py-2 h-auto rounded-lg"
                                >
                                    <Briefcase className="h-4 w-4 mr-2" />
                                    <span>Professional</span>
                                </TabsTrigger>
                                <TabsTrigger
                                    value="classes"
                                    className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 dark:data-[state=active]:bg-indigo-900/30 dark:data-[state=active]:text-indigo-300 px-4 py-2 h-auto rounded-lg"
                                >
                                    <Book className="h-4 w-4 mr-2" />
                                    <span>Classes</span>
                                </TabsTrigger>
                                <TabsTrigger
                                    value="contact"
                                    className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 dark:data-[state=active]:bg-indigo-900/30 dark:data-[state=active]:text-indigo-300 px-4 py-2 h-auto rounded-lg"
                                >
                                    <MapPin className="h-4 w-4 mr-2" />
                                    <span>Address & Contact</span>
                                </TabsTrigger>
                                <TabsTrigger
                                    value="qualifications"
                                    className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 dark:data-[state=active]:bg-indigo-900/30 dark:data-[state=active]:text-indigo-300 px-4 py-2 h-auto rounded-lg"
                                >
                                    <GraduationCap className="h-4 w-4 mr-2" />
                                    <span>Qualifications</span>
                                </TabsTrigger>
                                <TabsTrigger
                                    value="college"
                                    className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 dark:data-[state=active]:bg-indigo-900/30 dark:data-[state=active]:text-indigo-300 px-4 py-2 h-auto rounded-lg"
                                >
                                    <School className="h-4 w-4 mr-2" />
                                    <span>College</span>
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 shrink-0 rounded-lg md:hidden lg:flex"
                            onClick={() => scrollTabs('right')}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Personal Info Tab */}
                    <TabsContent value="personal" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <Card className="border-none shadow-md">
                            <CardContent className="p-6">
                                <h3 className="text-lg font-semibold mb-6 flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
                                    <UserIcon className="h-5 w-5" />
                                    Personal Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                    {/* First Name */}
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-muted-foreground">First Name</label>
                                        {isEditMode ? (
                                            <Input
                                                value={formData.first_name}
                                                onChange={(e) => handleChange('first_name', e.target.value)}
                                                className="border-indigo-200 focus:ring-indigo-500"
                                            />
                                        ) : (
                                            <p className="font-medium text-base">{teacher.first_name}</p>
                                        )}
                                    </div>

                                    {/* Middle Name */}
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-muted-foreground">Middle Name</label>
                                        {isEditMode ? (
                                            <Input
                                                value={formData.middle_name}
                                                onChange={(e) => handleChange('middle_name', e.target.value)}
                                                className="border-indigo-200 focus:ring-indigo-500"
                                            />
                                        ) : (
                                            <p className="font-medium text-base">{teacher.middle_name || '-'}</p>
                                        )}
                                    </div>

                                    {/* Last Name */}
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-muted-foreground">Last Name</label>
                                        {isEditMode ? (
                                            <Input
                                                value={formData.last_name}
                                                onChange={(e) => handleChange('last_name', e.target.value)}
                                                className="border-indigo-200 focus:ring-indigo-500"
                                            />
                                        ) : (
                                            <p className="font-medium text-base">{teacher.last_name}</p>
                                        )}
                                    </div>

                                    {/* Date of Birth */}
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-muted-foreground">Date of Birth</label>
                                        {isEditMode ? (
                                            <Input
                                                type="date"
                                                value={formData.date_of_birth}
                                                onChange={(e) => handleChange('date_of_birth', e.target.value)}
                                                className="border-indigo-200 focus:ring-indigo-500"
                                            />
                                        ) : (
                                            <p className="font-medium text-base">{teacher.date_of_birth}</p>
                                        )}
                                    </div>

                                    {/* Gender */}
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-muted-foreground">Gender</label>
                                        {isEditMode ? (
                                            <Select value={formData.gender} onValueChange={(value) => handleChange('gender', value)}>
                                                <SelectTrigger className="border-indigo-200 focus:ring-indigo-500">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="male">Male</SelectItem>
                                                    <SelectItem value="female">Female</SelectItem>
                                                    <SelectItem value="other">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        ) : (
                                            <p className="font-medium text-base capitalize">{teacher.gender}</p>
                                        )}
                                    </div>

                                    {/* Additional Profile Fields */}
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-muted-foreground">Nationality</label>
                                        <p className="font-medium text-base">{(teacher as any).profile?.nationality || 'N/A'}</p>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-muted-foreground">Blood Group</label>
                                        <p className="font-medium text-base">{(teacher as any).profile?.blood_group || 'N/A'}</p>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-muted-foreground">Caste</label>
                                        <p className="font-medium text-base">{(teacher as any).profile?.caste || 'N/A'}</p>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-muted-foreground">Religion</label>
                                        <p className="font-medium text-base">{(teacher as any).profile?.religion || 'N/A'}</p>
                                    </div>

                                    {/* Social Links */}
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-muted-foreground">LinkedIn</label>
                                        {(teacher as any).profile?.linkedin_url ? (
                                            <a href={(teacher as any).profile.linkedin_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-indigo-600 hover:underline">
                                                <Linkedin className="h-4 w-4" />
                                                View Profile
                                            </a>
                                        ) : (
                                            <p className="font-medium text-base">N/A</p>
                                        )}
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-muted-foreground">Website</label>
                                        {(teacher as any).profile?.website_url ? (
                                            <a href={(teacher as any).profile.website_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-indigo-600 hover:underline">
                                                <Globe className="h-4 w-4" />
                                                Visit Website
                                            </a>
                                        ) : (
                                            <p className="font-medium text-base">N/A</p>
                                        )}
                                    </div>

                                    {/* Bio */}
                                    <div className="space-y-1.5 col-span-1 md:col-span-2">
                                        <label className="text-sm font-medium text-muted-foreground">Bio</label>
                                        <p className="font-medium text-base">{(teacher as any).profile?.bio || 'No bio available.'}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Professional Info Tab */}
                    <TabsContent value="professional" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <Card className="border-none shadow-md">
                            <CardContent className="p-6">
                                <h3 className="text-lg font-semibold mb-6 flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
                                    <Briefcase className="h-5 w-5" />
                                    Employment Details
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-muted-foreground">Employee ID</label>
                                        <p className="font-medium text-base">{teacher.employee_id}</p>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-muted-foreground">Joining Date</label>
                                        {isEditMode ? (
                                            <Input
                                                type="date"
                                                value={formData.joining_date}
                                                onChange={(e) => handleChange('joining_date', e.target.value)}
                                                className="border-indigo-200 focus:ring-indigo-500"
                                            />
                                        ) : (
                                            <p className="font-medium text-base">{teacher.joining_date}</p>
                                        )}
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-muted-foreground">Faculty / Department</label>
                                        <p className="font-medium text-base">{teacher.faculty_name || 'N/A'}</p>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-muted-foreground">Specialization</label>
                                        {isEditMode ? (
                                            <Input
                                                value={formData.specialization}
                                                onChange={(e) => handleChange('specialization', e.target.value)}
                                                className="border-indigo-200 focus:ring-indigo-500"
                                            />
                                        ) : (
                                            <p className="font-medium text-base">{teacher.specialization || 'N/A'}</p>
                                        )}
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-muted-foreground">Experience Details</label>
                                        {isEditMode ? (
                                            <Input
                                                value={formData.experience_details}
                                                onChange={(e) => handleChange('experience_details', e.target.value)}
                                                className="border-indigo-200 focus:ring-indigo-500"
                                            />
                                        ) : (
                                            <p className="font-medium text-base">{teacher.experience_details || 'N/A'}</p>
                                        )}
                                    </div>

                                    {/* Resignation Date (Conditional) */}
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-muted-foreground">Resignation Date</label>
                                        {isEditMode ? (
                                            <Input
                                                type="date"
                                                value={formData.resignation_date}
                                                onChange={(e) => handleChange('resignation_date', e.target.value)}
                                                className="border-indigo-200 focus:ring-indigo-500"
                                            />
                                        ) : (
                                            <p className="font-medium text-base">{teacher.resignation_date || '-'}</p>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Address & Contact Tab */}
                    <TabsContent value="contact" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <Card className="border-none shadow-md">
                            <CardContent className="p-6">
                                <h3 className="text-lg font-semibold mb-6 flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
                                    <MapPin className="h-5 w-5" />
                                    Address & Contact
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-muted-foreground">Email</label>
                                        {isEditMode ? (
                                            <Input
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => handleChange('email', e.target.value)}
                                                className="border-indigo-200 focus:ring-indigo-500"
                                            />
                                        ) : (
                                            <p className="font-medium text-base">{teacher.email}</p>
                                        )}
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-muted-foreground">Phone</label>
                                        {isEditMode ? (
                                            <Input
                                                value={formData.phone}
                                                onChange={(e) => handleChange('phone', e.target.value)}
                                                className="border-indigo-200 focus:ring-indigo-500"
                                            />
                                        ) : (
                                            <p className="font-medium text-base">{teacher.phone || '-'}</p>
                                        )}
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-muted-foreground">Alternate Phone</label>
                                        {isEditMode ? (
                                            <Input
                                                value={formData.alternate_phone}
                                                onChange={(e) => handleChange('alternate_phone', e.target.value)}
                                                className="border-indigo-200 focus:ring-indigo-500"
                                            />
                                        ) : (
                                            <p className="font-medium text-base">{teacher.alternate_phone || '-'}</p>
                                        )}
                                    </div>

                                    <div className="space-y-1.5 md:col-span-2">
                                        <label className="text-sm font-medium text-muted-foreground">Address</label>
                                        {isEditMode ? (
                                            <Input
                                                value={formData.address}
                                                onChange={(e) => handleChange('address', e.target.value)}
                                                className="border-indigo-200 focus:ring-indigo-500"
                                            />
                                        ) : (
                                            <div className="font-medium text-base">
                                                {(teacher as any).profile ? (
                                                    <>
                                                        <p>{(teacher as any).profile.address_line1}</p>
                                                        {(teacher as any).profile.address_line2 && <p>{(teacher as any).profile.address_line2}</p>}
                                                        <p>
                                                            {[(teacher as any).profile.city, (teacher as any).profile.state, (teacher as any).profile.pincode]
                                                                .filter(Boolean)
                                                                .join(', ')}
                                                        </p>
                                                        <p>{(teacher as any).profile.country}</p>
                                                    </>
                                                ) : (
                                                    teacher.address || 'N/A'
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Emergency Contact */}
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-muted-foreground">Emergency Contact Name</label>
                                        <p className="font-medium text-base">{(teacher as any).profile?.emergency_contact_name || 'N/A'}</p>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-muted-foreground">Emergency Contact Phone</label>
                                        <p className="font-medium text-base">{(teacher as any).profile?.emergency_contact_phone || 'N/A'}</p>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-muted-foreground">Relation</label>
                                        <p className="font-medium text-base">{(teacher as any).profile?.emergency_contact_relation || 'N/A'}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Qualifications Tab */}
                    <TabsContent value="qualifications" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <Card className="border-none shadow-md">
                            <CardContent className="p-6">
                                <h3 className="text-lg font-semibold mb-6 flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
                                    <BookOpen className="h-5 w-5" />
                                    Qualifications
                                </h3>
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-muted-foreground">Academic Qualifications</label>
                                        {isEditMode ? (
                                            // Using text area for long text
                                            <textarea
                                                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 border-indigo-200 focus:ring-indigo-500"
                                                value={formData.qualification}
                                                onChange={(e) => handleChange('qualification', e.target.value)}
                                            />
                                        ) : (
                                            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800">
                                                <p className="font-medium text-base whitespace-pre-wrap">{teacher.qualifications || 'No qualifications listed.'}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Classes Tab */}
                    <TabsContent value="classes" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <Card className="border-none shadow-md">
                            <CardContent className="p-6">
                                <h3 className="text-lg font-semibold mb-6 flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
                                    <Book className="h-5 w-5" />
                                    Assigned Classes
                                </h3>
                                {(teacher as any).assigned_classes && (teacher as any).assigned_classes.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {(teacher as any).assigned_classes.map((cls: any, index: number) => (
                                            <div
                                                key={cls.assignment_id || index}
                                                className="group flex flex-col bg-white dark:bg-gray-900 border border-indigo-100 dark:border-gray-800 rounded-2xl shadow-sm hover:shadow-xl hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-300"
                                            >
                                                {/* Header with Program */}
                                                <div className="px-5 py-4 bg-indigo-50/50 dark:bg-indigo-950/20 border-b border-indigo-50 dark:border-indigo-900/10 flex justify-between items-center rounded-t-2xl">
                                                    <div className="flex items-center gap-2">
                                                        <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse group-hover:scale-125 transition-transform" />
                                                        <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 tracking-wide uppercase">
                                                            {cls.program_short_name}
                                                        </span>
                                                    </div>
                                                    <Badge className="bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900 shadow-sm hover:bg-white">
                                                        Sem {cls.semester}
                                                    </Badge>
                                                </div>

                                                <div className="p-5 flex flex-col flex-1">
                                                    {/* Subject */}
                                                    <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 leading-tight mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                        {cls.subject_name}
                                                    </h4>
                                                    <p className="text-xs text-muted-foreground mb-5 line-clamp-1" title={cls.program_name}>
                                                        {cls.program_name}
                                                    </p>

                                                    <div className="mt-auto grid grid-cols-2 gap-3">
                                                        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800/50 group-hover:bg-indigo-50/30 dark:group-hover:bg-indigo-900/10 transition-colors">
                                                            <div className="p-1.5 rounded-lg bg-white dark:bg-gray-700 shadow-sm text-indigo-500">
                                                                <School className="h-4 w-4" />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="text-[10px] text-muted-foreground font-medium uppercase">Class</p>
                                                                <p className="text-sm font-semibold truncate" title={cls.class_name}>{cls.class_name}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800/50 group-hover:bg-indigo-50/30 dark:group-hover:bg-indigo-900/10 transition-colors">
                                                            <div className="p-1.5 rounded-lg bg-white dark:bg-gray-700 shadow-sm text-pink-500">
                                                                <Layers className="h-4 w-4" />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="text-[10px] text-muted-foreground font-medium uppercase">Section</p>
                                                                <p className="text-sm font-semibold truncate" title={cls.section_name}>{cls.section_name}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50/50 dark:bg-gray-900/50">
                                        <div className="p-4 bg-white dark:bg-gray-800 rounded-full shadow-sm mb-4">
                                            <Book className="h-8 w-8 text-muted-foreground" />
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No Classes Assigned</h3>
                                        <p className="text-sm text-muted-foreground max-w-sm mt-1">
                                            This teacher has not been assigned to any classes or subjects yet.
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* College Tab */}
                    <TabsContent value="college" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <Card className="border-none shadow-md">
                            <CardContent className="p-6">
                                <h3 className="text-lg font-semibold mb-6 flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
                                    <School className="h-5 w-5" />
                                    College Information
                                </h3>
                                {(teacher as any).college_detail || teacher.college_name ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium text-muted-foreground">College Name</label>
                                            <p className="font-medium text-base">{(teacher as any).college_detail?.name || teacher.college_name || 'N/A'}</p>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium text-muted-foreground">Code</label>
                                            <p className="font-medium text-base">{(teacher as any).college_detail?.code || 'N/A'}</p>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium text-muted-foreground">City</label>
                                            <p className="font-medium text-base">{(teacher as any).college_detail?.city || 'N/A'}</p>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium text-muted-foreground">State</label>
                                            <p className="font-medium text-base">{(teacher as any).college_detail?.state || 'N/A'}</p>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium text-muted-foreground">Country</label>
                                            <p className="font-medium text-base">{(teacher as any).college_detail?.country || 'N/A'}</p>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium text-muted-foreground">Status</label>
                                            <Badge variant={(teacher as any).college_detail?.is_active ? 'success' : 'destructive'}>
                                                {(teacher as any).college_detail?.is_active ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground">No college details available.</p>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Timestamps Section */}
                    <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground mt-4 px-2">
                        <div>
                            Created At: {(teacher as any).created_at || 'N/A'}
                        </div>
                        <div className="text-right">
                            Updated At: {(teacher as any).updated_at || 'N/A'}
                        </div>
                    </div>
                </Tabs>
            </div>
        </div>
    );
};
