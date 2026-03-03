
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { AlertCircle, BookOpen } from 'lucide-react';

export interface StackedBook {
    id: number;
    title: string;
    author: string;
    dueDate: string;
    isOverdue: boolean;
    returnDate?: string | null;
    status?: string;
}

interface BookStackProps {
    books: StackedBook[];
    onBookClick?: (book: StackedBook) => void;
    emptyMessage?: string;
}

// Wrapper to handle the hover state properly with Framer Motion logic
export function BookStack(props: BookStackProps) {
    if (props.books.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
                <BookOpen className="w-12 h-12 mb-3 opacity-20" />
                <p>{props.emptyMessage || "No books in this stack"}</p>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center py-10">
            <motion.div
                className="relative w-72 h-96 perspective-1000 group mx-auto"
                initial="stacked"
                whileHover="fanned"
            >
                {props.books.map((book, index) => {
                    return (
                        <motion.div
                            key={book.id}
                            className={cn(
                                "absolute inset-0 rounded-lg shadow-xl cursor-pointer bg-white dark:bg-slate-800 border-[1px] border-slate-200 dark:border-slate-700 overflow-hidden",
                                "transition-shadow duration-300",
                                book.isOverdue ? "shadow-red-500/10 border-red-200" : "shadow-slate-500/10"
                            )}
                            style={{
                                zIndex: props.books.length - index,
                                backfaceVisibility: 'hidden',
                                transformStyle: 'preserve-3d',
                            }}
                            variants={{
                                stacked: {
                                    rotateZ: (index % 2 === 0 ? 1 : -1) * (index + 2), // More rotation
                                    y: index * -15, // Larger vertical offset to see all books
                                    x: (index % 2 === 0 ? 5 : -5) + (index * 2), // Zigzag stack
                                    scale: 1,
                                },
                                fanned: {
                                    rotateZ: (index - (props.books.length - 1) / 2) * 12,
                                    y: (index * -50) - 20,
                                    x: (index - (props.books.length - 1) / 2) * 60,
                                    scale: 1.1,
                                    transition: { type: 'spring', stiffness: 260, damping: 20, delay: index * 0.05 }
                                }
                            }}
                            onClick={() => props.onBookClick && props.onBookClick(book)}
                        >
                            {/* Book Spine Color (Left Border) */}
                            <div className={cn(
                                "absolute top-0 bottom-0 left-0 w-4 bg-gradient-to-r",
                                book.isOverdue ? "from-red-600 to-red-500" : "from-blue-600 to-blue-500"
                            )} />

                            {/* Content */}
                            <div className="pl-8 pr-6 py-6 h-full flex flex-col">
                                <div className="flex justify-between items-start">
                                    <Badge variant={book.isOverdue ? "destructive" : "outline"} className="mb-2">
                                        {book.isOverdue ? "Overdue" : "Due Soon"}
                                    </Badge>
                                    {book.isOverdue && <AlertCircle className="w-5 h-5 text-red-500" />}
                                </div>

                                <h3 className="text-xl font-bold font-serif text-slate-800 dark:text-slate-100 leading-snug mb-1">
                                    {book.title}
                                </h3>
                                <p className="text-sm text-slate-500 italic mb-6">by {book.author}</p>

                                <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-700">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Due Date</span>
                                        <span className={cn("font-mono font-medium", book.isOverdue ? "text-red-600" : "text-slate-700 dark:text-slate-300")}>
                                            {new Date(book.dueDate).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}

                {/* Shadow Base */}
                <div className="absolute -bottom-10 left-10 right-10 h-6 bg-black/20 blur-xl rounded-full z-[-1]" />
            </motion.div>
        </div>
    );
}
