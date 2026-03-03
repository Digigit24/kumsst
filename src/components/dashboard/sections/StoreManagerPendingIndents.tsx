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
import { useStoreIndents } from '@/hooks/useStore';
import { ArrowRight, Calendar, User } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';

export const StoreManagerPendingIndents: React.FC = () => {
    const navigate = useNavigate();
    // Fetch only pending indents, limiting to 5 for the dashboard
    const { data, isLoading } = useStoreIndents({ status: 'pending_college_approval', page_size: 5 });

    const indents = data?.results || [];

    if (isLoading) {
        return (
            <Card className="col-span-4 border-none shadow-sm h-full">
                <CardHeader>
                    <CardTitle>Needs Attention</CardTitle>
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
        <Card className="col-span-4 border-none shadow-sm bg-white dark:bg-card h-full">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Needs Attention</CardTitle>
                <Button
                    variant="ghost"
                    className="text-sm text-primary hover:text-primary/80"
                    onClick={() => navigate('/store/indents-pipeline')}
                >
                    View All <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent border-b border-slate-100 dark:border-slate-800">
                            <TableHead className="pl-6">Indent No</TableHead>
                            <TableHead>Requested By</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Priority</TableHead>
                            <TableHead className="text-right pr-6">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {indents.length > 0 ? (
                            indents.map((indent: any) => (
                                <TableRow
                                    key={indent.id}
                                    className="hover:bg-slate-50 dark:hover:bg-slate-900/50 cursor-pointer border-b border-slate-50 dark:border-slate-800 last:border-0"
                                    onClick={() => navigate(`/store/indents-pipeline?id=${indent.id}`)}
                                >
                                    <TableCell className="pl-6 font-medium">
                                        {indent.indent_number}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className="p-1 bg-slate-100 dark:bg-slate-800 rounded-full">
                                                <User className="h-3 w-3 text-slate-500" />
                                            </div>
                                            <span className="text-sm text-muted-foreground">{indent.requesting_store_manager_name || 'Unknown'}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Calendar className="h-3 w-3" />
                                            <span className="text-sm">{new Date(indent.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant="outline"
                                            className={`
                        capitalize
                        ${indent.priority === 'urgent' ? 'border-red-200 text-red-600 bg-red-50 dark:bg-red-900/20 dark:border-red-900' : ''}
                        ${indent.priority === 'high' ? 'border-orange-200 text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-900' : ''}
                        ${indent.priority === 'medium' ? 'border-blue-200 text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-900' : ''}
                        ${indent.priority === 'low' ? 'border-slate-200 text-slate-600 bg-slate-50 dark:bg-slate-900/20 dark:border-slate-900' : ''}
                      `}
                                        >
                                            {indent.priority}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right pr-6">
                                        <Button size="sm" variant="outline" className="h-8">Review</Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                                    No pending indents needing attention.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};
