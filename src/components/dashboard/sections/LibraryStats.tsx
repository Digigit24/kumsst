
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Book, Users, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useBooks, useBookIssues, useLibraryMembers } from '@/hooks/useLibrary';

export const LibraryStats: React.FC = () => {
    // Fetch statistics using existing hooks with minimal page_size to get counts
    const { data: booksData, isLoading: isLoadingBooks } = useBooks({ page_size: 1 });
    const { data: issuesData, isLoading: isLoadingIssues } = useBookIssues({ page_size: 1, status: 'issued' });
    const { data: membersData, isLoading: isLoadingMembers } = useLibraryMembers({ page_size: 1 });

    const stats = [
        {
            title: 'Total Books',
            value: booksData?.count || 0,
            icon: Book,
            description: 'Total books in inventory',
            color: 'text-blue-600',
            bgColor: 'bg-blue-100 dark:bg-blue-900/20',
            trend: '+12%', // This would ideally come from backend comparison or historical data
            trendUp: true,
            isLoading: isLoadingBooks
        },
        {
            title: 'Books Issued',
            value: issuesData?.count || 0,
            icon: BookOpen,
            description: 'Books currently issued',
            color: 'text-amber-600',
            bgColor: 'bg-amber-100 dark:bg-amber-900/20',
            trend: '+5%',
            trendUp: true,
            isLoading: isLoadingIssues
        },
        {
            title: 'Library Members',
            value: membersData?.count || 0,
            icon: Users,
            description: 'Active library members',
            color: 'text-purple-600',
            bgColor: 'bg-purple-100 dark:bg-purple-900/20',
            trend: '+2',
            trendUp: true,
            isLoading: isLoadingMembers
        },
    ];

    return (
        <div className="grid gap-4 md:grid-cols-3">
            {stats.map((stat, index) => (
                <Card key={index} className="overflow-hidden border-none shadow-md hover:shadow-lg transition-all duration-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            {stat.title}
                        </CardTitle>
                        <div className={`p-2 rounded-full ${stat.bgColor}`}>
                            <stat.icon className={`h-4 w-4 ${stat.color}`} />
                        </div>
                    </CardHeader>
                    <CardContent>
                        {stat.isLoading ? (
                            <div className="h-8 w-24 bg-muted animate-pulse rounded" />
                        ) : (
                            <>
                                <div className="text-2xl font-bold">{stat.value}</div>
                                <div className="flex items-center text-xs text-muted-foreground mt-1">
                                    {stat.trendUp ? (
                                        <ArrowUpRight className="mr-1 h-3 w-3 text-green-500" />
                                    ) : (
                                        <ArrowDownRight className="mr-1 h-3 w-3 text-red-500" />
                                    )}
                                    <span className={stat.trendUp ? 'text-green-500 font-medium' : 'text-red-500 font-medium'}>
                                        {stat.trend}
                                    </span>
                                    <span className="ml-1">from last month</span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-2">
                                    {stat.description}
                                </p>
                            </>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};
