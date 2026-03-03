import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { API_ENDPOINTS, buildApiUrl } from '@/config/api.config';
import { useSuperAdminContext } from '@/contexts/SuperAdminContext';
import { useQuery } from '@tanstack/react-query';
import {
    AlertCircle,
    Search,
    UserCircle,
    Users
} from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Student {
    id: number;
    admission_number: string;
    registration_number: string;
    full_name: string;
    email: string;
    phone: string;
    college_name: string;
    program_name: string;
    current_class_name: string | null;
    current_section_name: string | null;
    is_active: boolean;
}

export const Student360ProfileSearchPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const { selectedCollege } = useSuperAdminContext();

    // Debounce search
    React.useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(searchQuery);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Fetch students list
    const { data: students, isLoading, error } = useQuery({
        queryKey: ['students-list', debouncedQuery, selectedCollege],
        queryFn: async () => {
            const token = localStorage.getItem('kumss_auth_token');
            const url = buildApiUrl(
                debouncedQuery
                    ? `${API_ENDPOINTS.students.list}?search=${encodeURIComponent(debouncedQuery)}`
                    : API_ENDPOINTS.students.list
            );

            const headers: HeadersInit = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            };

            if (selectedCollege) {
                headers['X-College-Id'] = selectedCollege.toString();
            }

            const response = await fetch(url, {
                headers,
            });

            if (!response.ok) {
                throw new Error('Failed to fetch students');
            }

            const data = await response.json();
            return data.results || data || [];
        },
        enabled: true,
        staleTime: 2 * 60 * 1000,
    });

    const handleViewProfile = (studentId: number) => {
        navigate(`/students/360-profile/${studentId}`);
    };

    return (
        <div className="space-y-8 p-6 animate-fade-in bg-slate-50/50 dark:bg-slate-950 min-h-screen">
            {/* Hero Header */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 shadow-2xl">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                <div className="relative z-10 p-8 md:p-10 text-white">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="space-y-2">
                            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                                Student 360° Profile
                            </h1>
                            <p className="text-blue-100 text-lg">
                                Comprehensive view of student academic, attendance, fees, and more
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-lg border border-white/20">
                                <div className="text-sm text-blue-200">Total Students</div>
                                <div className="font-semibold text-2xl">{students?.length || 0}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search Section */}
            <Card className="border-none shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                <CardHeader className="border-b bg-muted/30 dark:bg-muted/10 px-6 py-5">
                    <CardTitle className="text-xl font-bold text-gray-800 dark:text-gray-100">Search Students</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            placeholder="Search by name, roll number, or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 h-12 text-base"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Students List */}
            <Card className="border-none shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm overflow-hidden">
                <CardHeader className="border-b bg-muted/30 dark:bg-muted/10 px-6 py-5">
                    <CardTitle className="text-xl font-bold text-gray-800 dark:text-gray-100">
                        {debouncedQuery ? 'Search Results' : 'All Students'}
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {error ? (
                        <div className="p-6">
                            <div className="flex items-center gap-3 text-red-600">
                                <AlertCircle className="h-5 w-5" />
                                <p>Failed to load students. Please try again.</p>
                            </div>
                        </div>
                    ) : isLoading ? (
                        <div className="space-y-4 p-6">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <Skeleton key={i} className="h-16 w-full rounded-xl" />
                            ))}
                        </div>
                    ) : students && students.length > 0 ? (
                        <>
                            {/* Desktop: Table view */}
                            <div className="hidden md:block">
                                <Table>
                                    <TableHeader className="bg-muted/30 dark:bg-muted/10">
                                        <TableRow className="hover:bg-transparent border-none">
                                            <TableHead className="pl-6 h-12">Student Name</TableHead>
                                            <TableHead>Admission Number</TableHead>
                                            <TableHead>Class</TableHead>
                                            <TableHead>Section</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead className="text-right pr-6 h-12">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {students.map((student: Student, index: number) => (
                                            <TableRow
                                                key={student.id}
                                                className={`cursor-pointer transition-colors border-b border-muted/50 dark:border-slate-800 last:border-0 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 ${index % 2 === 0 ? 'bg-white dark:bg-slate-900/30' : 'bg-slate-50/30 dark:bg-slate-800/30'}`}
                                                onClick={() => handleViewProfile(student.id)}
                                            >
                                                <TableCell className="font-medium pl-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                                                            <UserCircle className="h-6 w-6" />
                                                        </div>
                                                        <div>
                                                            <div className="text-base text-gray-900 dark:text-gray-100">
                                                                {student.full_name}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary" className="font-mono">
                                                        {student.admission_number}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">
                                                    {student.current_class_name || '-'}
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">
                                                    {student.current_section_name || '-'}
                                                </TableCell>
                                                <TableCell className="text-muted-foreground text-sm">
                                                    {student.email || '-'}
                                                </TableCell>
                                                <TableCell className="text-right pr-6">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleViewProfile(student.id);
                                                        }}
                                                    >
                                                        View 360° Profile
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Mobile: Card view */}
                            <div className="md:hidden space-y-3 p-3">
                                {students.map((student: Student) => (
                                    <div
                                        key={student.id}
                                        className="rounded-xl border border-border/50 bg-card p-4 shadow-sm cursor-pointer active:bg-muted/50 transition-colors"
                                        onClick={() => handleViewProfile(student.id)}
                                    >
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="h-10 w-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                                                <UserCircle className="h-6 w-6" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-semibold text-base truncate">{student.full_name}</p>
                                                <Badge variant="secondary" className="font-mono text-xs mt-0.5">
                                                    {student.admission_number}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                                            <div>
                                                <span className="text-xs text-muted-foreground">Class</span>
                                                <p className="font-medium">{student.current_class_name || '-'}</p>
                                            </div>
                                            <div>
                                                <span className="text-xs text-muted-foreground">Section</span>
                                                <p className="font-medium">{student.current_section_name || '-'}</p>
                                            </div>
                                            {student.email && (
                                                <div className="col-span-2">
                                                    <span className="text-xs text-muted-foreground">Email</span>
                                                    <p className="font-medium truncate">{student.email}</p>
                                                </div>
                                            )}
                                        </div>
                                        <Button
                                            className="w-full min-h-[44px] text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800"
                                            variant="outline"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleViewProfile(student.id);
                                            }}
                                        >
                                            View 360° Profile
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="p-12 text-center">
                            <Users className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                            <p className="text-muted-foreground text-lg">
                                {debouncedQuery ? 'No students found matching your search.' : 'No students available.'}
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};
