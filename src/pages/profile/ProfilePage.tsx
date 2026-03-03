import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { centralStoreApi } from '@/services/store.service';
import { userProfileApi } from '@/services/accounts.service';
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  User as UserIcon,
  GraduationCap,
  MapPin,
  Building,
  Linkedin,
  Globe,
  Briefcase,
  BookOpen,
  CreditCard,
  Users,
  Store,
  Pencil,
  Loader2,
  X,
  Save,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { UserProfileUpdateInput } from '@/types/accounts.types';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: profileData, isLoading, error } = useUserProfile();
  const [activeTab, setActiveTab] = React.useState('personal');
  const [editing, setEditing] = React.useState(false);
  const [formData, setFormData] = React.useState<Partial<UserProfileUpdateInput>>({});

  const isStudent = user?.user_type === 'student';

  const startEditing = () => {
    if (!profileData) return;
    setFormData({
      nationality: profileData.nationality || '',
      religion: profileData.religion || '',
      caste: profileData.caste || '',
      blood_group: profileData.blood_group || '',
      address_line1: profileData.address_line1 || '',
      address_line2: profileData.address_line2 || '',
      city: profileData.city || '',
      state: profileData.state || '',
      pincode: profileData.pincode || '',
      country: profileData.country || '',
      emergency_contact_name: profileData.emergency_contact_name || '',
      emergency_contact_phone: profileData.emergency_contact_phone || '',
      emergency_contact_relation: profileData.emergency_contact_relation || '',
      linkedin_url: profileData.linkedin_url || '',
      website_url: profileData.website_url || '',
      bio: profileData.bio || '',
    });
    setEditing(true);
  };

  const cancelEditing = () => {
    setEditing(false);
    setFormData({});
    mutation.reset();
  };

  const handleFieldChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const mutation = useMutation({
    mutationFn: (data: Partial<UserProfileUpdateInput>) =>
      userProfileApi.patchMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      setEditing(false);
      setFormData({});
    },
  });

  const handleSave = () => {
    mutation.mutate(formData);
  };

  const { data: centralStoreData } = useQuery({
    queryKey: ['centralStoreProfile', user?.user_type],
    queryFn: async () => {
      const response = await centralStoreApi.list({ page_size: 1 });
      return response.results?.[0];
    },
    enabled: user?.user_type === 'central_manager',
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen p-6 space-y-6 animate-fade-in">
        <div className="flex items-center gap-4">
          <Skeleton className="h-24 w-24 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Skeleton className="h-32 w-full rounded-lg" />
          <Skeleton className="h-32 w-full rounded-lg" />
          <Skeleton className="h-32 w-full rounded-lg" />
          <Skeleton className="h-32 w-full rounded-lg" />
        </div>
        <Skeleton className="h-96 w-full rounded-lg" />
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="p-6 min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="text-destructive text-5xl">⚠</div>
              <h2 className="text-xl font-semibold">Profile Not Found</h2>
              <p className="text-muted-foreground">{error instanceof Error ? error.message : 'Unable to load profile details'}</p>
              <Button onClick={() => window.location.reload()}>
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen pb-8 animate-fade-in">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background p-6 md:p-8 border-b">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(-1)}
              className="transition-all hover:scale-105"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <Badge variant={profileData.is_active ? 'default' : 'destructive'} className="animate-scale-in">
                {profileData.is_active ? 'Active' : 'Inactive'}
              </Badge>
              <Badge variant="outline">{user?.user_type_display || 'User'}</Badge>
              {!isStudent && !editing && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={startEditing}
                  className="ml-2 transition-all hover:scale-105"
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              )}
              {!isStudent && editing && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={cancelEditing}
                    className="ml-2"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={mutation.isPending}
                  >
                    {mutation.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Save
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* User Profile Header */}
          <div className="flex items-start gap-6 flex-wrap">
            <Avatar className="h-24 w-24 border-4 border-background shadow-xl transition-transform hover:scale-105">
              <AvatarFallback className="text-2xl font-bold bg-primary text-primary-foreground">
                {getInitials(profileData.user_name || 'User')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                  Hey! {profileData.user_name} <span className="inline-block animate-bounce">👋</span>
                </h1>
              </div>
              <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Briefcase className="h-4 w-4" />
                  {profileData.department_name || 'No Department'}
                </span>
                <Separator orientation="vertical" className="h-4" />
                <span className="flex items-center gap-1">
                  <Building className="h-4 w-4" />
                  {profileData.college_name}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 md:px-8 -mt-4">
        {/* Quick Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="overflow-hidden animate-slide-in shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="font-medium text-sm truncate" title={user?.email}>{user?.email || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden animate-slide-in shadow-sm hover:shadow-md transition-shadow" style={{ animationDelay: '50ms' }}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <Phone className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="font-medium text-sm">{user?.phone || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden animate-slide-in shadow-sm hover:shadow-md transition-shadow" style={{ animationDelay: '100ms' }}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-500/10 rounded-lg">
                  <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Joined</p>
                  <p className="font-medium text-sm">{formatDate(profileData.created_at)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden animate-slide-in shadow-sm hover:shadow-md transition-shadow" style={{ animationDelay: '150ms' }}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-orange-500/10 rounded-lg">
                  <MapPin className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Location</p>
                  <p className="font-medium text-sm truncate">{profileData.city || 'N/A'}, {profileData.country || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="w-full overflow-x-auto overflow-y-hidden scrollbar-hide pb-1">
            <TabsList className="inline-flex w-auto min-w-full md:min-w-0">
              <TabsTrigger value="personal">
                <UserIcon className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Personal</span>
                <span className="sm:hidden">Personal</span>
              </TabsTrigger>
              {user?.user_type === 'student' && (
                <TabsTrigger value="academic">
                  <GraduationCap className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Academic</span>
                  <span className="sm:hidden">Academic</span>
                </TabsTrigger>
              )}
              <TabsTrigger value="professional">
                <Briefcase className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Professional</span>
                <span className="sm:hidden">Work</span>
              </TabsTrigger>
              {user?.user_type === 'central_manager' && (
                <TabsTrigger value="central-store">
                  <Store className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Central Store</span>
                  <span className="sm:hidden">Store</span>
                </TabsTrigger>
              )}
              <TabsTrigger value="contact">
                <MapPin className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Contact</span>
                <span className="sm:hidden">Contact</span>
              </TabsTrigger>
              <TabsTrigger value="social">
                <Globe className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Social & Bio</span>
                <span className="sm:hidden">Social</span>
              </TabsTrigger>
              {user?.user_type === 'teacher' && (
                <TabsTrigger value="assigned">
                  <BookOpen className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Assigned Classes</span>
                  <span className="sm:hidden">Classes</span>
                </TabsTrigger>
              )}
            </TabsList>
          </div>

          <TabsContent value="personal">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                  <UserIcon className="h-5 w-5 text-primary" />
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                    <p className="font-medium">{profileData.user_name}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-muted-foreground">Username</label>
                    <p className="font-medium">{user?.username}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-muted-foreground">Nationality</label>
                    {editing ? (
                      <Input value={formData.nationality || ''} onChange={(e) => handleFieldChange('nationality', e.target.value)} placeholder="Nationality" />
                    ) : (
                      <p className="font-medium">{profileData.nationality || 'N/A'}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-muted-foreground">Religion</label>
                    {editing ? (
                      <Input value={formData.religion || ''} onChange={(e) => handleFieldChange('religion', e.target.value)} placeholder="Religion" />
                    ) : (
                      <p className="font-medium">{profileData.religion || 'N/A'}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-muted-foreground">Caste</label>
                    {editing ? (
                      <Input value={formData.caste || ''} onChange={(e) => handleFieldChange('caste', e.target.value)} placeholder="Caste" />
                    ) : (
                      <p className="font-medium">{profileData.caste || 'N/A'}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-muted-foreground">Blood Group</label>
                    {editing ? (
                      <Input value={formData.blood_group || ''} onChange={(e) => handleFieldChange('blood_group', e.target.value)} placeholder="e.g. O+" />
                    ) : (
                      <p className="font-medium">{profileData.blood_group || 'N/A'}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-muted-foreground">Gender</label>
                    <p className="font-medium capitalize">{user?.gender || 'N/A'}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-muted-foreground">Date of Birth</label>
                    <p className="font-medium">{formatDate(user?.date_of_birth)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {user?.user_type === 'student' && (
            <TabsContent value="academic">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-primary" />
                    Academic Information
                  </h3>
                  {profileData.student_profile ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Admission Info */}
                      <div className="p-4 rounded-xl border bg-card/50 hover:bg-card hover:shadow-sm transition-all">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 rounded-lg bg-primary/10 text-primary">
                            <CreditCard className="h-4 w-4" />
                          </div>
                          <span className="text-sm font-medium text-muted-foreground">Admission Details</span>
                        </div>
                        <div className="space-y-1">
                          <p className="text-2xl font-bold tracking-tight">{profileData.student_profile.admission_number}</p>
                          <p className="text-xs text-muted-foreground">Student ID</p>
                        </div>
                      </div>

                      {/* Program Info */}
                      <div className="p-4 rounded-xl border bg-card/50 hover:bg-card hover:shadow-sm transition-all">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600">
                            <BookOpen className="h-4 w-4" />
                          </div>
                          <span className="text-sm font-medium text-muted-foreground">Program</span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="text-lg font-semibold">{profileData.student_profile.program_name}</p>
                            <Badge variant="secondary">{profileData.student_profile.program_short_name}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">Current Enrolled Program</p>
                        </div>
                      </div>

                      {/* Class Info */}
                      <div className="p-4 rounded-xl border bg-card/50 hover:bg-card hover:shadow-sm transition-all">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600">
                            <Users className="h-4 w-4" />
                          </div>
                          <span className="text-sm font-medium text-muted-foreground">Class & Section</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <p className="text-xl font-semibold">{profileData.student_profile.class_name}</p>
                          <span className="text-muted-foreground">-</span>
                          <p className="text-lg text-foreground/80">{profileData.student_profile.section_name}</p>
                        </div>
                      </div>

                      {/* Semester Info */}
                      <div className="p-4 rounded-xl border bg-card/50 hover:bg-card hover:shadow-sm transition-all">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 rounded-lg bg-orange-500/10 text-orange-600">
                            <Calendar className="h-4 w-4" />
                          </div>
                          <span className="text-sm font-medium text-muted-foreground">Current Semester</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-3xl font-bold text-primary">{profileData.student_profile.semester}</span>
                          <span className="text-sm text-muted-foreground mb-1 self-end">th Semester</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-muted-foreground space-y-3">
                      <GraduationCap className="h-12 w-12 opacity-20" />
                      <p>No academic detailed information available.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          <TabsContent value="professional">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-primary" />
                  Professional Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-muted-foreground">College</label>
                    <p className="font-medium">{profileData.college_name}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-muted-foreground">Department</label>
                    <p className="font-medium">{profileData.department_name}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-muted-foreground">User Type</label>
                    <p className="font-medium capitalize">{user?.user_type_display}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-muted-foreground">Joined At</label>
                    <p className="font-medium">{formatDate(profileData.created_at)}</p>
                  </div>

                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact">
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      Address Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="col-span-1 md:col-span-2 space-y-1">
                        <label className="text-sm font-medium text-muted-foreground">Address Line 1</label>
                        {editing ? (
                          <Input value={formData.address_line1 || ''} onChange={(e) => handleFieldChange('address_line1', e.target.value)} placeholder="Address Line 1" />
                        ) : (
                          <p className="font-medium">{profileData.address_line1 || 'N/A'}</p>
                        )}
                      </div>
                      <div className="col-span-1 md:col-span-2 space-y-1">
                        <label className="text-sm font-medium text-muted-foreground">Address Line 2</label>
                        {editing ? (
                          <Input value={formData.address_line2 || ''} onChange={(e) => handleFieldChange('address_line2', e.target.value)} placeholder="Address Line 2" />
                        ) : (
                          <p className="font-medium">{profileData.address_line2 || 'N/A'}</p>
                        )}
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-muted-foreground">City</label>
                        {editing ? (
                          <Input value={formData.city || ''} onChange={(e) => handleFieldChange('city', e.target.value)} placeholder="City" />
                        ) : (
                          <p className="font-medium">{profileData.city || 'N/A'}</p>
                        )}
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-muted-foreground">State</label>
                        {editing ? (
                          <Input value={formData.state || ''} onChange={(e) => handleFieldChange('state', e.target.value)} placeholder="State" />
                        ) : (
                          <p className="font-medium">{profileData.state || 'N/A'}</p>
                        )}
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-muted-foreground">Pincode</label>
                        {editing ? (
                          <Input value={formData.pincode || ''} onChange={(e) => handleFieldChange('pincode', e.target.value)} placeholder="Pincode" />
                        ) : (
                          <p className="font-medium">{profileData.pincode || 'N/A'}</p>
                        )}
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-muted-foreground">Country</label>
                        {editing ? (
                          <Input value={formData.country || ''} onChange={(e) => handleFieldChange('country', e.target.value)} placeholder="Country" />
                        ) : (
                          <p className="font-medium">{profileData.country || 'N/A'}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                      <Phone className="h-5 w-5 text-primary" />
                      Emergency Contact
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-muted-foreground">Name</label>
                        {editing ? (
                          <Input value={formData.emergency_contact_name || ''} onChange={(e) => handleFieldChange('emergency_contact_name', e.target.value)} placeholder="Contact Name" />
                        ) : (
                          <p className="font-medium">{profileData.emergency_contact_name || 'N/A'}</p>
                        )}
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-muted-foreground">Relation</label>
                        {editing ? (
                          <Input value={formData.emergency_contact_relation || ''} onChange={(e) => handleFieldChange('emergency_contact_relation', e.target.value)} placeholder="e.g. Father, Spouse" />
                        ) : (
                          <p className="font-medium">{profileData.emergency_contact_relation || 'N/A'}</p>
                        )}
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-muted-foreground">Phone</label>
                        {editing ? (
                          <Input type="tel" value={formData.emergency_contact_phone || ''} onChange={(e) => handleFieldChange('emergency_contact_phone', e.target.value)} placeholder="Phone Number" />
                        ) : (
                          <p className="font-medium">{profileData.emergency_contact_phone || 'N/A'}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="social">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                  <Globe className="h-5 w-5 text-primary" />
                  Social & Bio
                </h3>
                <div className="space-y-6">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-muted-foreground">Bio</label>
                    {editing ? (
                      <textarea
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        value={formData.bio || ''}
                        onChange={(e) => handleFieldChange('bio', e.target.value)}
                        placeholder="Write a short bio..."
                      />
                    ) : (
                      <p className="font-medium leading-relaxed">{profileData.bio || 'No bio available'}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Linkedin className="h-4 w-4" /> LinkedIn
                      </label>
                      {editing ? (
                        <Input value={formData.linkedin_url || ''} onChange={(e) => handleFieldChange('linkedin_url', e.target.value)} placeholder="https://linkedin.com/in/..." />
                      ) : profileData.linkedin_url ? (
                        <a
                          href={profileData.linkedin_url}
                          target="_blank"
                          rel="noreferrer"
                          className="font-medium text-blue-600 hover:underline truncate block"
                        >
                          {profileData.linkedin_url}
                        </a>
                      ) : (
                        <p className="font-medium text-muted-foreground">N/A</p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Globe className="h-4 w-4" /> Website
                      </label>
                      {editing ? (
                        <Input value={formData.website_url || ''} onChange={(e) => handleFieldChange('website_url', e.target.value)} placeholder="https://..." />
                      ) : profileData.website_url ? (
                        <a
                          href={profileData.website_url}
                          target="_blank"
                          rel="noreferrer"
                          className="font-medium text-blue-600 hover:underline truncate block"
                        >
                          {profileData.website_url}
                        </a>
                      ) : (
                        <p className="font-medium text-muted-foreground">N/A</p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {user?.user_type === 'teacher' && (
            <TabsContent value="assigned">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    Assigned Classes
                  </h3>
                  {profileData.teacher_profile?.assigned_classes && profileData.teacher_profile.assigned_classes.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {profileData.teacher_profile.assigned_classes.map((cls) => (
                        <div key={cls.assignment_id} className="p-6 border rounded-xl hover:shadow-lg transition-all bg-card group">
                          <div className="flex justify-between items-start mb-4">
                            <h4 className="text-lg font-semibold text-primary line-clamp-2 leading-tight group-hover:text-primary/80 transition-colors" title={cls.subject_name}>
                              {cls.subject_name}
                            </h4>
                            <Badge variant="secondary" className="text-sm px-2 py-0.5 shrink-0">
                              Sem {cls.semester}
                            </Badge>
                          </div>
                          <div className="space-y-3 text-sm text-muted-foreground">
                            <div className="flex justify-between items-center border-b pb-2 border-border/50">
                              <span>Program</span>
                              <span className="font-medium text-foreground text-right">{cls.program_name}</span>
                            </div>
                            <div className="flex justify-between items-center border-b pb-2 border-border/50">
                              <span>Short Name</span>
                              <span className="font-medium text-foreground text-right">{cls.program_short_name}</span>
                            </div>
                            <div className="flex justify-between items-center border-b pb-2 border-border/50">
                              <span>Class</span>
                              <span className="font-medium text-foreground text-right">{cls.class_name}</span>
                            </div>
                            <div className="flex justify-between items-center pt-1">
                              <span>Section</span>
                              <span className="font-medium text-foreground text-right">{cls.section_name}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-20" />
                      <p>No classes assigned yet.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {user?.user_type === 'central_manager' && (
            <TabsContent value="central-store">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                    <Store className="h-5 w-5 text-primary" />
                    Central Store Details
                  </h3>
                  {centralStoreData ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-muted-foreground">Store Name</label>
                        <p className="font-medium text-lg">{centralStoreData.store_name}</p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-muted-foreground">Store Code</label>
                        <Badge variant="outline">{centralStoreData.store_code}</Badge>
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-muted-foreground">Location</label>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <p className="font-medium">{centralStoreData.location || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-muted-foreground">Main Contact</label>
                        <div className="flex items-center gap-1">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <p className="font-medium">{centralStoreData.contact_phone || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="space-y-1 md:col-span-2">
                        <label className="text-sm font-medium text-muted-foreground">Description</label>
                        <p className="font-medium text-muted-foreground italic">{centralStoreData.description || 'No description available.'}</p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-muted-foreground">Status</label>
                        <Badge variant={centralStoreData.is_active ? "default" : "destructive"}>
                          {centralStoreData.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Store className="h-12 w-12 mx-auto mb-3 opacity-20" />
                      <p>No central store assigned or found.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>

      {/* Error message when save fails */}
      {mutation.isError && (
        <div className="max-w-7xl mx-auto px-6 md:px-8 mt-4">
          <p className="text-sm text-destructive">
            {(mutation.error as any)?.message || 'Failed to update profile.'}
          </p>
        </div>
      )}
    </div >
  );
}
