import { AlertCircle, FileText, Loader2, Calendar, User, Eye, Download, GraduationCap } from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useMyProgressCards } from '@/hooks/useExamination';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const ProgressCards = () => {
    const { data, isLoading, error, refetch } = useMyProgressCards();

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-muted-foreground animate-pulse">Loading reports...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <div className="bg-destructive/10 p-4 rounded-full">
                    <AlertCircle className="h-8 w-8 text-destructive" />
                </div>
                <h3 className="text-lg font-semibold">Failed to load progress cards</h3>
                <Button variant="outline" onClick={() => refetch()}>Try Again</Button>
            </div>
        );
    }

    const progressCards = data?.results || [];

    return (
        <div className="space-y-8 p-6">
            {/* Header */}
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">My Progress Cards</h1>
                <p className="text-muted-foreground">
                    Access and download your academic performance reports and report cards.
                </p>
            </div>

            {progressCards.length === 0 ? (
                <Card className="border-dashed bg-muted/30">
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="rounded-full bg-background p-4 shadow-sm ring-1 ring-border mb-4">
                            <FileText className="h-10 w-10 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">No Reports Available</h3>
                        <p className="text-muted-foreground max-w-sm mx-auto">
                            You don't have any progress cards generated yet. They will appear here once your exams are graded and finalized.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {progressCards.map((card: any) => {
                        const date = card.issue_date ? new Date(card.issue_date) : new Date();
                        const month = format(date, 'MMM').toUpperCase();
                        const day = format(date, 'dd');

                        return (
                            <div
                                key={card.id}
                                className="group flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl border bg-card hover:shadow-md hover:border-primary/20 transition-all duration-300"
                            >
                                {/* Date Box */}
                                <div className="flex-shrink-0 flex flex-col items-center justify-center w-16 h-16 rounded-lg bg-primary/5 text-primary border border-primary/10">
                                    <span className="text-xs font-bold tracking-wider">{month}</span>
                                    <span className="text-2xl font-bold leading-none">{day}</span>
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0 space-y-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-lg font-bold text-foreground truncate">{card.exam_name || 'Progress Report'}</h3>
                                        <Badge variant="secondary" className="text-[10px] hidden sm:inline-flex">PDF</Badge>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-1.5">
                                            <User className="h-3.5 w-3.5" />
                                            <span className="truncate">{card.student_name}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Action */}
                                <div className="w-full sm:w-auto mt-2 sm:mt-0">
                                    {card.card_file ? (
                                        <Button variant="outline" className="w-full sm:w-auto border-primary/20 hover:bg-primary/5 hover:text-primary" asChild>
                                            <a href={card.card_file} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                                                <Download className="h-4 w-4" /> Download
                                            </a>
                                        </Button>
                                    ) : (
                                        <Button variant="ghost" disabled className="w-full sm:w-auto gap-2 text-muted-foreground">
                                            <AlertCircle className="h-4 w-4" /> Pending
                                        </Button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ProgressCards;
