import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useMaterialIssues } from '@/hooks/useStore';
import { ArrowRight, Calendar, User } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';

export const StoreManagerRecentActivity: React.FC = () => {
    const navigate = useNavigate();
    // Fetch real Material Issues data (last 5)
    const { data, isLoading } = useMaterialIssues({ page_size: 5 });

    const issues = data?.results || [];

    if (isLoading) {
        return (
            <Card className="col-span-3 border-none shadow-sm h-full">
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-12 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="col-span-3 border-none shadow-sm bg-white dark:bg-card h-full">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Material Issues</CardTitle>
                <Button
                    variant="ghost"
                    className="text-sm text-primary hover:text-primary/80"
                    onClick={() => navigate('/store/material-issues')}
                >
                    View All <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent border-b border-slate-100 dark:border-slate-800">
                            <TableHead className="pl-6">Issue ID</TableHead>
                            <TableHead>Issued To</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right pr-6">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {issues.length > 0 ? (
                            issues.map((issue: any) => (
                                <TableRow
                                    key={issue.id}
                                    className="hover:bg-slate-50 dark:hover:bg-slate-900/50 cursor-pointer border-b border-slate-50 dark:border-slate-800 last:border-0"
                                    onClick={() => navigate(`/store/material-issues?id=${issue.id}`)}
                                >
                                    <TableCell className="pl-6 font-medium">
                                        {issue.issue_number || `#${issue.id}`}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className="p-1 bg-slate-100 dark:bg-slate-800 rounded-full">
                                                <User className="h-3 w-3 text-slate-500" />
                                            </div>
                                            <span className="text-sm text-muted-foreground">{issue.issued_to_name || 'Staff Member'}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Calendar className="h-3 w-3" />
                                            <span className="text-sm">{new Date(issue.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right pr-6">
                                        <Badge variant="secondary" className="capitalize">
                                            {issue.status?.replace(/_/g, ' ') || 'Pending'}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                                    No recent material issues found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};
