import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useFeeStudentDrillDown } from '@/hooks/useFeeDrillDown';
import {
    AlertCircle,
    Banknote,
    Calendar,
    ChevronLeft,
    CreditCard,
    History,
    IndianRupee,
    PiggyBank,
    Receipt,
    Wallet
} from 'lucide-react';
import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

export const FeeStudentDrillDown: React.FC = () => {
    const { studentId } = useParams<{ studentId: string }>();
    const navigate = useNavigate();
    const [filters, setFilters] = useState({});
    const { data, isLoading, error, refetch } = useFeeStudentDrillDown(studentId ? parseInt(studentId) : null, filters);

    if (error) {
        return (
            <div className="p-6">
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="pt-6">
                        <div className="flex flex-col items-center justify-center text-center space-y-4">
                            <AlertCircle className="h-12 w-12 text-red-500" />
                            <p className="text-red-600 font-medium">Unable to load student fee details</p>
                            <p className="text-sm text-red-500/80 max-w-md">{(error as any)?.message || 'An unexpected error occurred.'}</p>
                            <Button onClick={() => refetch()} variant="outline" className="border-red-200 text-red-600 hover:bg-red-100">
                                Try Again
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString();
    };

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'paid': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'partial': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'pending': return 'bg-rose-100 text-rose-700 border-rose-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    }

    return (
        <div className="space-y-8 p-6 animate-fade-in bg-slate-50/50 min-h-screen">
            {/* Context Navigation */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                    <Link
                        to="/finance/drilldown"
                        className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 font-medium"
                    >
                        <Wallet className="h-3.5 w-3.5" />
                        Finance
                    </Link>
                    <span className="text-muted-foreground/40">/</span>
                    <Link
                        to="#"
                        className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 font-medium"
                    >
                        Student Drilldown
                    </Link>
                </div>
            </div>

            {/* Profile Header Card */}
            <div className="relative overflow-hidden rounded-3xl bg-white shadow-xl border border-indigo-100">
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                    <IndianRupee className="w-64 h-64 -mr-16 -mt-16 text-indigo-900" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-50/50 via-white to-white pointer-events-none" />

                <div className="relative z-10 p-6 md:p-8">
                    <div className="flex flex-col lg:flex-row justify-between gap-8">
                        <div className="flex-1 space-y-6 w-full">
                            <div className="space-y-4">
                                <div className="flex items-start md:items-center gap-4 flex-col md:flex-row">
                                    <div className="flex items-center gap-3 w-full md:w-auto">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => navigate(-1)}
                                            className="h-8 w-8 -ml-2 rounded-full hover:bg-indigo-50 text-indigo-600 shrink-0"
                                        >
                                            <ChevronLeft className="h-5 w-5" />
                                        </Button>
                                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
                                            {data?.student_name || <Skeleton className="h-8 w-48 inline-block" />}
                                        </h1>
                                    </div>
                                    <Badge variant="outline" className="bg-indigo-50 text-indigo-600 border-indigo-200 ml-9 md:ml-0">
                                        {data?.roll_number || 'No Roll #'}
                                    </Badge>
                                </div>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500 pl-0 md:pl-9">
                                    <div className="flex items-center gap-1.5 min-w-fit">
                                        <Receipt className="h-4 w-4 opacity-70" />
                                        <span className="font-mono">{data?.admission_number}</span>
                                    </div>
                                    <div className="hidden sm:block w-px h-4 bg-slate-300" />
                                    <div className="flex items-center gap-1.5 min-w-fit">
                                        <span className="font-medium text-slate-700">{data?.class_name}</span>
                                        <span className="text-slate-400">•</span>
                                        <span>{data?.section_name}</span>
                                    </div>
                                    <div className="hidden sm:block w-px h-4 bg-slate-300" />
                                    <div className="flex items-center gap-1.5 min-w-fit w-full sm:w-auto">
                                        <span>{data?.program_name}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Stats Row */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                                <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-indigo-500 mb-1">Total Due</p>
                                    <p className="text-xl md:text-2xl font-bold text-indigo-700 break-words">{data?.total_due !== undefined ? formatCurrency(data.total_due) : <Skeleton className="h-8 w-24" />}</p>
                                </div>
                                <div className="p-4 rounded-xl bg-green-50/50 border border-green-100">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-green-600 mb-1">Total Paid</p>
                                    <p className="text-xl md:text-2xl font-bold text-green-700 break-words">{data?.total_paid !== undefined ? formatCurrency(data.total_paid) : <Skeleton className="h-8 w-24" />}</p>
                                </div>
                                <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-100">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-amber-600 mb-1">Balance</p>
                                    <p className="text-xl md:text-2xl font-bold text-amber-700 break-words">{data?.total_balance !== undefined ? formatCurrency(data.total_balance) : <Skeleton className="h-8 w-24" />}</p>
                                </div>
                                <div className="p-4 rounded-xl bg-rose-50/50 border border-rose-100">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-rose-600 mb-1">Total Fines</p>
                                    <p className="text-xl md:text-2xl font-bold text-rose-700 break-words">{data?.total_fines !== undefined ? formatCurrency(data.total_fines) : <Skeleton className="h-8 w-24" />}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">

                {/* Left Column: Fee Breakdown & Fines */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Fee Structures Table */}
                    <Card className="border shadow-sm overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b pb-4">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                    <Banknote className="h-5 w-5 text-slate-500" />
                                    Fee Structures
                                </CardTitle>
                                <Badge variant="secondary" className="font-mono">
                                    {data?.fee_structures?.length || 0} Records
                                </Badge>
                            </div>
                        </CardHeader>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-slate-50 sticky top-0 z-10 drop-shadow-sm">
                                    <TableRow>
                                        <TableHead className="pl-6 whitespace-nowrap">Fee Details</TableHead>
                                        <TableHead className="whitespace-nowrap">Session</TableHead>
                                        <TableHead className="whitespace-nowrap">Due Date</TableHead>
                                        <TableHead className="text-right whitespace-nowrap">Amount</TableHead>
                                        <TableHead className="text-right whitespace-nowrap">Paid</TableHead>
                                        <TableHead className="text-right whitespace-nowrap">Balance</TableHead>
                                        <TableHead className="text-center pr-6 whitespace-nowrap">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        [1, 2, 3].map(i => (
                                            <TableRow key={i}>
                                                <TableCell colSpan={7}><Skeleton className="h-10 w-full" /></TableCell>
                                            </TableRow>
                                        ))
                                    ) : data?.fee_structures && data.fee_structures.length > 0 ? (
                                        data.fee_structures.map((fee: any, idx: number) => (
                                            <TableRow key={idx} className="group hover:bg-slate-50/50 transition-colors">
                                                <TableCell className="pl-6 py-4 whitespace-nowrap">
                                                    <div className="font-medium text-slate-900">{fee.fee_type_name}</div>
                                                    <div className="text-xs text-muted-foreground font-mono mt-0.5">{fee.fee_type_code}</div>
                                                </TableCell>
                                                <TableCell className="py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium">{fee.academic_year}</div>
                                                    <div className="text-xs text-muted-foreground">Semester {fee.semester}</div>
                                                </TableCell>
                                                <TableCell className="py-4 font-mono text-sm text-slate-600 whitespace-nowrap">
                                                    {formatDate(fee.due_date)}
                                                </TableCell>
                                                <TableCell className="text-right py-4 font-medium whitespace-nowrap">
                                                    {formatCurrency(fee.amount_due)}
                                                </TableCell>
                                                <TableCell className="text-right py-4 text-emerald-600 font-medium whitespace-nowrap">
                                                    {formatCurrency(fee.amount_paid)}
                                                </TableCell>
                                                <TableCell className="text-right py-4 text-rose-600 font-semibold whitespace-nowrap">
                                                    {formatCurrency(fee.balance)}
                                                </TableCell>
                                                <TableCell className="text-center pr-6 py-4 whitespace-nowrap">
                                                    <div className="flex flex-col items-center gap-1">
                                                        <Badge variant="outline" className={`border-0 font-semibold ${getStatusColor(fee.payment_status)}`}>
                                                            {fee.payment_status?.toUpperCase() || 'PENDING'}
                                                        </Badge>
                                                        {fee.is_overdue && fee.payment_status?.toLowerCase() !== 'paid' && (
                                                            <span className="text-[10px] font-bold text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded uppercase tracking-wide">
                                                                Overdue
                                                            </span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                                                No fee structure records found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </Card>

                    {/* Fines & Discounts Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Fines */}
                        <Card className="border shadow-sm">
                            <CardHeader className="bg-slate-50/50 border-b pb-3">
                                <CardTitle className="text-base font-semibold flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4 text-rose-500" />
                                    Active Fines
                                </CardTitle>
                            </CardHeader>
                            <div className="p-0">
                                {data?.fines && data.fines.length > 0 ? (
                                    <div className="divide-y">
                                        {/* Implement Fine Items Loop Here if data existed */}
                                        <div className="p-4 text-sm text-slate-500">Fine details would appear here.</div>
                                    </div>
                                ) : (
                                    <div className="p-8 text-center text-sm text-muted-foreground flex flex-col items-center">
                                        <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center mb-2">
                                            <CreditCard className="h-4 w-4 text-slate-400" />
                                        </div>
                                        No active fines.
                                    </div>
                                )}
                            </div>
                        </Card>

                        {/* Discounts */}
                        <Card className="border shadow-sm">
                            <CardHeader className="bg-slate-50/50 border-b pb-3">
                                <CardTitle className="text-base font-semibold flex items-center gap-2">
                                    <PiggyBank className="h-4 w-4 text-green-500" />
                                    Applied Discounts
                                </CardTitle>
                            </CardHeader>
                            <div className="p-0">
                                {data?.discounts && data.discounts.length > 0 ? (
                                    <div className="divide-y">
                                        {/* Implement Discount Items Loop Here if data existed */}
                                        <div className="p-4 text-sm text-slate-500">Discount details would appear here.</div>
                                    </div>
                                ) : (
                                    <div className="p-8 text-center text-sm text-muted-foreground flex flex-col items-center">
                                        <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center mb-2">
                                            <PiggyBank className="h-4 w-4 text-slate-400" />
                                        </div>
                                        No active discounts.
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>
                </div>

                {/* Right Column: Payment History & Info */}
                <div className="space-y-8 lg:sticky lg:top-6 self-start">
                    <Card className="border shadow-sm flex flex-col max-h-[80vh]">
                        <CardHeader className="bg-slate-50/50 border-b pb-4 shrink-0">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                    <History className="h-5 w-5 text-purple-500" />
                                    Payment History
                                </CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0 flex-1 overflow-y-auto custom-scrollbar">
                            {isLoading ? (
                                <div className="p-6 space-y-4">
                                    <Skeleton className="h-12 w-full" />
                                    <Skeleton className="h-12 w-full" />
                                </div>
                            ) : data?.payment_history && data.payment_history.length > 0 ? (
                                <div className="divide-y">
                                    {data.payment_history.map((payment: any, i: number) => (
                                        <div key={i} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between group">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-slate-900">{formatCurrency(payment.amount)}</span>
                                                    <Badge variant="outline" className="text-[10px] uppercase bg-slate-100/50 text-slate-600 border-slate-200">
                                                        {payment.payment_method}
                                                    </Badge>
                                                </div>
                                                <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                                                    <Calendar className="h-3 w-3" />
                                                    {formatDate(payment.payment_date)}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-[10px] font-mono text-slate-400 group-hover:text-slate-600 transition-colors">
                                                    #{payment.transaction_id || 'N/A'}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-48 text-center text-muted-foreground p-6">
                                    <History className="h-10 w-10 mb-3 opacity-20" />
                                    <p>No payment history available.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

            </div>
        </div>
    );
};
