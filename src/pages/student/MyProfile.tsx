import React, { useState } from 'react';
import { User as UserIcon, Mail, Phone, MapPin, Calendar, BookOpen, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { studentApi, studentGuardianApi } from '@/services/students.service';
import { getMediaBaseUrl } from '@/config/api.config';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';

export const MyProfile: React.FC = () => {
  const { user } = useAuth();

  const { data: student, isLoading: isStudentLoading } = useQuery({
    queryKey: ['student-profile', user?.student_id],
    queryFn: async () => {
      if (!user?.student_id) return null;
      return studentApi.get(user.student_id);
    },
    enabled: !!user?.student_id
  });

  const { data: guardiansResponse, isLoading: isGuardianLoading } = useQuery({
    queryKey: ['student-guardians', user?.student_id],
    queryFn: async () => {
      if (!user?.student_id) return null;
      return studentGuardianApi.list({ student: user.student_id });
    },
    enabled: !!user?.student_id
  });

  const isLoading = isStudentLoading || isGuardianLoading;

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <UserIcon className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold">Profile Not Found</h2>
        <p className="text-muted-foreground">Unable to load student profile details.</p>
      </div>
    );
  }

  // Calculate initials for avatar fallback
  const initials = student.full_name
    ? student.full_name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
    : 'TP';

  // Find primary guardian or the first one
  const primaryGuardianRelation = guardiansResponse?.results?.find(g => g.is_primary) || guardiansResponse?.results?.[0];
  const guardian = primaryGuardianRelation?.guardian_details;

  // Determine profile photo URL
  const photoUrl = user?.avatar || student?.profile_photo || student?.photo;
  const [imgError, setImgError] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
        <p className="text-muted-foreground mt-2">
          View and manage your profile information
        </p>
      </div>

      {/* Profile Overview Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Profile Picture */}
            <div className="flex-shrink-0">
              {photoUrl && !imgError ? (
                <img
                  src={photoUrl.startsWith('http') ? photoUrl : `${getMediaBaseUrl()}${photoUrl}`}
                  alt={student.full_name}
                  className="h-32 w-32 rounded-full object-cover border-4 border-background shadow-lg"
                  onError={() => setImgError(true)}
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="h-32 w-32 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                  {initials}
                </div>
              )}
            </div>

            {/* Basic Info */}
            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-2xl font-bold">{student.full_name}</h2>
                <p className="text-muted-foreground">Student ID: {student.admission_number}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{student.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{student.phone || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">DOB: {new Date(student.date_of_birth).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Blood Group: {student.blood_group || 'N/A'}</span>
                </div>
              </div>

              {/* <Button variant="outline">Edit Profile</Button> */}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Two Column Layout */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Academic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Academic Information
            </CardTitle>
            <CardDescription>Your current academic details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between py-2 border-b">
              <span className="text-sm text-muted-foreground">Class</span>
              <span className="font-medium">{student.current_class_name || 'N/A'}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-sm text-muted-foreground">Section</span>
              <span className="font-medium">{student.current_section_name || 'N/A'}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-sm text-muted-foreground">Roll Number</span>
              <span className="font-medium">{student.roll_number || 'N/A'}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-sm text-muted-foreground">Program</span>
              <span className="font-medium">{student.program_name}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-sm text-muted-foreground">Admission Type</span>
              <span className="font-medium capitalize">{student.admission_type}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-sm text-muted-foreground">Admission Date</span>
              <span className="font-medium">{new Date(student.admission_date).toLocaleDateString()}</span>
            </div>
          </CardContent>
        </Card>

        {/* Guardian Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="h-5 w-5" />
              Guardian Information
            </CardTitle>
            <CardDescription>Primary guardian details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {guardian ? (
              <>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-sm text-muted-foreground">Name</span>
                  <span className="font-medium">{guardian.full_name}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-sm text-muted-foreground">Relationship</span>
                  <Badge>{guardian.relation}</Badge>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-sm text-muted-foreground">Phone</span>
                  <span className="font-medium">{guardian.phone}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-sm text-muted-foreground">Email</span>
                  <span className="font-medium text-sm">{guardian.email || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-sm text-muted-foreground">Occupation</span>
                  <span className="font-medium">{guardian.occupation || 'N/A'}</span>
                </div>
              </>
            ) : (
              <div className="text-muted-foreground text-center py-4">No guardian information available</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Address Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Address Information
          </CardTitle>
          <CardDescription>Details & Contact</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="text-sm font-medium">Personal Information</div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-muted-foreground">Nationality:</div>
              <div>{student.nationality}</div>

              <div className="text-muted-foreground">Religion:</div>
              <div>{student.religion || 'N/A'}</div>

              <div className="text-muted-foreground">Caste:</div>
              <div>{student.caste || 'N/A'}</div>

              <div className="text-muted-foreground">Mother Tongue:</div>
              <div>{student.mother_tongue || 'N/A'}</div>
            </div>
          </div>

          {student.aadhar_number && (
            <div className="pt-2 border-t">
              <span className="text-sm text-muted-foreground">Aadhar Number: </span>
              <span className="text-sm font-medium">{student.aadhar_number}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const ProfileSkeleton = () => (
  <div className="space-y-6">
    <div className="space-y-2">
      <Skeleton className="h-10 w-48" />
      <Skeleton className="h-4 w-64" />
    </div>
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row gap-6">
          <Skeleton className="h-32 w-32 rounded-full" />
          <div className="flex-1 space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
    <div className="grid gap-6 md:grid-cols-2">
      <Skeleton className="h-64 w-full rounded-xl" />
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  </div>
);
