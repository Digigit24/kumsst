import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useStudent360Profile } from '@/hooks/useStudent360';
import { getAvatarClassName, getInitials } from '@/lib/avatar-utils';
import { cn } from '@/lib/utils';
import {
    AlertCircle,
    ArrowLeft,
    BookOpen,
    Calendar,
    CheckCircle2,
    CreditCard,
    FileText,
    GraduationCap,
    Heart,
    Home,
    Mail,
    MapPin,
    Phone,
    Shield,
    User,
    Users,
    Building,
    Clock,
    Award,
    RefreshCw,
} from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

// Progress bar component
const ProgressBar = ({ value, max, color = 'bg-primary' }: { value: number; max: number; color?: string }) => {
    const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0;
    return (
        <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
                className={cn('h-full rounded-full animate-progress', color)}
                style={{ width: `${percentage}%` }}
            />
        </div>
    );
};

// Info row component
const InfoRow = ({ icon: Icon, label, value }: { icon: any; label: string; value: string | null | undefined }) => {
    if (!value) return null;
    return (
        <div className="flex items-center gap-3 py-2">
            <div className="p-2 rounded-lg bg-muted/50">
                <Icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
                <div className="text-xs text-muted-foreground">{label}</div>
                <div className="font-medium">{value}</div>
            </div>
        </div>
    );
};

// Section card component
const SectionCard = ({
    title,
    icon: Icon,
    children,
    className,
}: {
    title: string;
    icon: any;
    children: React.ReactNode;
    className?: string;
}) => (
    <Card className={cn('border-none shadow-lg hover-lift overflow-hidden', className)}>
        <CardHeader className="border-b bg-gradient-to-r from-muted/50 to-transparent px-6 py-4">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10">
                    <Icon className="h-4 w-4 text-primary" />
                </div>
                {title}
            </CardTitle>
        </CardHeader>
        <CardContent className="p-6">{children}</CardContent>
    </Card>
);

// Stat card component
const StatCard = ({
    title,
    value,
    sub,
    icon: Icon,
    color,
    bgColor,
}: {
    title: string;
    value: string | number;
    sub?: string;
    icon: any;
    color: string;
    bgColor: string;
}) => (
    <Card className="border-none shadow-sm hover-lift group overflow-hidden relative">
        <div className={cn('absolute top-0 right-0 opacity-10 group-hover:opacity-20 transition-opacity', color)}>
            <Icon className="w-24 h-24 -mr-6 -mt-6 transform rotate-12" />
        </div>
        <CardContent className="p-5 relative z-10">
            <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">{title}</span>
                <div className={cn('p-2 rounded-xl', bgColor, color)}>
                    <Icon className="h-4 w-4" />
                </div>
            </div>
            <div className="text-2xl font-bold tracking-tight">{value}</div>
            {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
        </CardContent>
    </Card>
);

export const Student360ProfileDetailPage: React.FC = () => {
    const { studentId } = useParams<{ studentId: string }>();
    const navigate = useNavigate();
    const [isRefreshing, setIsRefreshing] = useState(false);

    const { data, isLoading, error, refetch } = useStudent360Profile(
        studentId ? parseInt(studentId) : null,
        {}
    );

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await refetch();
        setTimeout(() => setIsRefreshing(false), 500);
    };

    if (error) {
        return (
            <div className="p-6">
                <Card className="border-destructive/50 bg-destructive/5">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="rounded-full bg-destructive/10 p-3">
                                <AlertCircle className="h-6 w-6 text-destructive" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-destructive">Error Loading Profile</h3>
                                <p className="text-sm text-muted-foreground">{(error as any)?.message || 'Unknown error'}</p>
                            </div>
                        </div>
                        <Button onClick={() => refetch()} variant="destructive" className="mt-4">
                            Retry
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="space-y-6 p-6 animate-fade-in">
                <Skeleton className="h-56 w-full rounded-2xl" />
                <div className="grid gap-4 md:grid-cols-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-28 rounded-xl" />
                    ))}
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                    <Skeleton className="h-64 rounded-xl" />
                    <Skeleton className="h-64 rounded-xl" />
                </div>
            </div>
        );
    }

    const basic = data?.basic_info;
    const avatarColors = getAvatarClassName(basic?.full_name || '');

    return (
        <div className="space-y-6 p-4 md:p-6 animate-fade-in">
            {/* Hero Header */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-primary/70 shadow-xl">
                <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black)]" />
                <div className="relative z-10 p-6 md:p-8 text-primary-foreground">
                    {/* Top bar */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => navigate('/students/360-profile')}
                                className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-white/10"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                            <Badge variant="outline" className="border-white/30 bg-white/10 text-white">
                                360° Profile
                            </Badge>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleRefresh}
                            className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-white/10"
                        >
                            <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
                        </Button>
                    </div>

                    {/* Profile info */}
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                        <Avatar className="h-24 w-24 border-4 border-white/20 shadow-xl">
                            <AvatarFallback className={cn('text-2xl font-bold', avatarColors)}>
                                {getInitials(basic?.full_name || '')}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-3">
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold tracking-tight capitalize">
                                    {basic?.full_name}
                                </h1>
                                <p className="text-white/70 mt-1">{basic?.college_name}</p>
                            </div>
                            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/80">
                                <span className="flex items-center gap-1.5">
                                    <GraduationCap className="h-4 w-4" />
                                    {basic?.admission_number}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Mail className="h-4 w-4" />
                                    {basic?.email}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Phone className="h-4 w-4" />
                                    {basic?.phone}
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <Badge className="bg-white/20 text-white border-0">
                                    {basic?.program_name}
                                </Badge>
                                <Badge className="bg-white/20 text-white border-0">
                                    {basic?.current_class}
                                </Badge>
                                <Badge className="bg-white/20 text-white border-0">
                                    {basic?.academic_year}
                                </Badge>
                                <Badge className={cn(
                                    'border-0',
                                    basic?.is_active ? 'bg-green-500/30 text-green-100' : 'bg-red-500/30 text-red-100'
                                )}>
                                    {basic?.is_active ? 'Active' : 'Inactive'}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 stagger-children">
                <StatCard
                    title="Academic"
                    value={data?.academic?.overall_percentage ? `${data.academic.overall_percentage}%` : 'N/A'}
                    sub={`${data?.academic?.pass_count || 0} Passed / ${data?.academic?.total_exams || 0} Exams`}
                    icon={GraduationCap}
                    color="text-blue-600 dark:text-blue-400"
                    bgColor="bg-blue-100 dark:bg-blue-900/30"
                />
                <StatCard
                    title="Attendance"
                    value={`${data?.attendance?.attendance_rate || 0}%`}
                    sub={`${data?.attendance?.present_days || 0} / ${data?.attendance?.total_days || 0} Days`}
                    icon={CheckCircle2}
                    color={data?.attendance?.is_low_attendance ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}
                    bgColor={data?.attendance?.is_low_attendance ? 'bg-red-100 dark:bg-red-900/30' : 'bg-green-100 dark:bg-green-900/30'}
                />
                <StatCard
                    title="Fee Status"
                    value={`₹${(data?.financial?.total_balance || 0).toLocaleString()}`}
                    sub={data?.financial?.payment_status === 'paid' ? 'All Paid' : `${data?.financial?.overdue_fees_count || 0} Overdue`}
                    icon={CreditCard}
                    color={data?.financial?.payment_status === 'paid' ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}
                    bgColor={data?.financial?.payment_status === 'paid' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-orange-100 dark:bg-orange-900/30'}
                />
                <StatCard
                    title="Library"
                    value={data?.library?.books_issued || 0}
                    sub={`${data?.library?.overdue_books || 0} Overdue`}
                    icon={BookOpen}
                    color="text-purple-600 dark:text-purple-400"
                    bgColor="bg-purple-100 dark:bg-purple-900/30"
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Personal Info */}
                <SectionCard title="Personal Information" icon={User}>
                    <div className="grid gap-1 sm:grid-cols-2">
                        <InfoRow icon={Calendar} label="Date of Birth" value={basic?.date_of_birth} />
                        <InfoRow icon={User} label="Gender" value={basic?.gender} />
                        <InfoRow icon={Heart} label="Blood Group" value={basic?.blood_group} />
                        <InfoRow icon={Building} label="Nationality" value={basic?.nationality} />
                        <InfoRow icon={User} label="Religion" value={basic?.religion} />
                        <InfoRow icon={User} label="Caste" value={basic?.caste} />
                        <InfoRow icon={Shield} label="Aadhar" value={basic?.aadhar_number} />
                        <InfoRow icon={Clock} label="Admission Date" value={basic?.admission_date} />
                    </div>
                </SectionCard>

                {/* Fee Summary */}
                <SectionCard title="Financial Summary" icon={CreditCard}>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Total Due</span>
                            <span className="font-bold text-lg">₹{(data?.financial?.total_due || 0).toLocaleString()}</span>
                        </div>
                        <ProgressBar
                            value={data?.financial?.total_paid || 0}
                            max={data?.financial?.total_due || 1}
                            color="bg-green-500"
                        />
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                <div className="text-lg font-bold text-green-600 dark:text-green-400">₹{(data?.financial?.total_paid || 0).toLocaleString()}</div>
                                <div className="text-xs text-muted-foreground">Paid</div>
                            </div>
                            <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                                <div className="text-lg font-bold text-orange-600 dark:text-orange-400">₹{(data?.financial?.total_balance || 0).toLocaleString()}</div>
                                <div className="text-xs text-muted-foreground">Balance</div>
                            </div>
                            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                <div className="text-lg font-bold text-red-600 dark:text-red-400">₹{(data?.financial?.total_fines || 0).toLocaleString()}</div>
                                <div className="text-xs text-muted-foreground">Fines</div>
                            </div>
                        </div>
                    </div>
                </SectionCard>

                {/* Attendance */}
                <SectionCard title="Attendance Overview" icon={Calendar}>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Attendance Rate</span>
                            <span className={cn(
                                'font-bold text-lg',
                                data?.attendance?.is_low_attendance ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                            )}>
                                {data?.attendance?.attendance_rate || 0}%
                            </span>
                        </div>
                        <ProgressBar
                            value={data?.attendance?.present_days || 0}
                            max={data?.attendance?.total_days || 1}
                            color={data?.attendance?.is_low_attendance ? 'bg-red-500' : 'bg-green-500'}
                        />
                        <div className="grid grid-cols-4 gap-2 text-center">
                            <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                <div className="text-lg font-bold text-green-600 dark:text-green-400">{data?.attendance?.present_days || 0}</div>
                                <div className="text-xs text-muted-foreground">Present</div>
                            </div>
                            <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                <div className="text-lg font-bold text-red-600 dark:text-red-400">{data?.attendance?.absent_days || 0}</div>
                                <div className="text-xs text-muted-foreground">Absent</div>
                            </div>
                            <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                                <div className="text-lg font-bold text-orange-600 dark:text-orange-400">{data?.attendance?.late_days || 0}</div>
                                <div className="text-xs text-muted-foreground">Late</div>
                            </div>
                            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{data?.attendance?.half_days || 0}</div>
                                <div className="text-xs text-muted-foreground">Half</div>
                            </div>
                        </div>
                    </div>
                </SectionCard>

                {/* Guardian Info */}
                <SectionCard title="Guardian Information" icon={Users}>
                    {data?.guardians && data.guardians.length > 0 ? (
                        <div className="space-y-4">
                            {data.guardians.map((guardian: any) => (
                                <div key={guardian.guardian_id} className="flex items-start gap-4 p-3 bg-muted/30 rounded-lg">
                                    <Avatar className="h-12 w-12">
                                        <AvatarFallback className={getAvatarClassName(guardian.name)}>
                                            {getInitials(guardian.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium capitalize">{guardian.name}</div>
                                        <div className="text-sm text-muted-foreground capitalize">{guardian.relation}</div>
                                        <div className="flex gap-4 mt-2 text-sm">
                                            <span className="flex items-center gap-1">
                                                <Phone className="h-3 w-3" /> {guardian.phone}
                                            </span>
                                            {guardian.email && (
                                                <span className="flex items-center gap-1">
                                                    <Mail className="h-3 w-3" /> {guardian.email}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-6 text-muted-foreground">No guardian information</div>
                    )}
                </SectionCard>

                {/* Address */}
                <SectionCard title="Address" icon={MapPin}>
                    {data?.addresses && data.addresses.length > 0 ? (
                        <div className="space-y-4">
                            {data.addresses.map((addr: any, i: number) => (
                                <div key={i} className="p-3 bg-muted/30 rounded-lg">
                                    <Badge variant="outline" className="mb-2 capitalize">{addr.address_type}</Badge>
                                    <p className="text-sm">{addr.address_line1}</p>
                                    {addr.address_line2 && <p className="text-sm">{addr.address_line2}</p>}
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {addr.city}, {addr.state} - {addr.pincode}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-6 text-muted-foreground">No address information</div>
                    )}
                </SectionCard>

                {/* Documents */}
                <SectionCard title="Documents" icon={FileText}>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="flex-1">
                            <div className="flex justify-between text-sm mb-1">
                                <span>Verified</span>
                                <span>{data?.documents?.verified_documents || 0} / {data?.documents?.total_documents || 0}</span>
                            </div>
                            <ProgressBar
                                value={data?.documents?.verified_documents || 0}
                                max={data?.documents?.total_documents || 1}
                                color="bg-green-500"
                            />
                        </div>
                    </div>
                    {data?.documents?.documents && data.documents.documents.length > 0 ? (
                        <div className="space-y-2">
                            {data.documents.documents.map((doc: any) => (
                                <div key={doc.document_id} className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm capitalize">{doc.document_name}</span>
                                    </div>
                                    <Badge variant={doc.is_verified ? 'default' : 'secondary'}>
                                        {doc.is_verified ? 'Verified' : 'Pending'}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-4 text-muted-foreground">No documents uploaded</div>
                    )}
                </SectionCard>

                {/* Certificates */}
                <SectionCard title="Certificates" icon={Award}>
                    {data?.certificates && data.certificates.length > 0 ? (
                        <div className="space-y-2">
                            {data.certificates.map((cert: any) => (
                                <div key={cert.certificate_id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                                    <div>
                                        <div className="font-medium capitalize">{cert.certificate_type}</div>
                                        <div className="text-xs text-muted-foreground">#{cert.certificate_number}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm">{cert.issue_date}</div>
                                        <Badge variant="outline" className="text-xs">Issued</Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-6 text-muted-foreground">No certificates issued</div>
                    )}
                </SectionCard>

                {/* Medical Info */}
                <SectionCard title="Medical Information" icon={Heart}>
                    <div className="grid gap-1 sm:grid-cols-2">
                        <InfoRow icon={Heart} label="Blood Group" value={data?.medical?.blood_group} />
                        <InfoRow icon={User} label="Height" value={data?.medical?.height ? `${data.medical.height} cm` : null} />
                        <InfoRow icon={User} label="Weight" value={data?.medical?.weight ? `${data.medical.weight} kg` : null} />
                        <InfoRow icon={AlertCircle} label="Allergies" value={data?.medical?.allergies} />
                    </div>
                    {!data?.medical?.has_record && (
                        <div className="text-center py-4 text-muted-foreground">No medical records</div>
                    )}
                </SectionCard>
            </div>

            {/* Footer timestamp */}
            <div className="text-center text-xs text-muted-foreground py-4">
                Last updated: {data?.generated_at ? new Date(data.generated_at).toLocaleString() : 'N/A'}
            </div>
        </div>
    );
};

export default Student360ProfileDetailPage;
