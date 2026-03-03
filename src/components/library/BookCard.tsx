/**
 * BookCard Component - Visual card for displaying books in grid view
 * Light, modern design with soft colors
 */

import { motion } from 'framer-motion';
import {
  BookOpen,
  Eye,
  MapPin,
  MoreVertical,
  Pencil,
  Trash2,
  User,
} from 'lucide-react';
import type { Book } from '../../types/library.types';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';

// Light, pastel book cover colors
const coverStyles = [
  {
    bg: 'bg-gradient-to-br from-blue-100 to-indigo-200',
    icon: 'text-blue-500',
    accent: 'bg-blue-400',
  },
  {
    bg: 'bg-gradient-to-br from-emerald-100 to-teal-200',
    icon: 'text-emerald-500',
    accent: 'bg-emerald-400',
  },
  {
    bg: 'bg-gradient-to-br from-amber-100 to-orange-200',
    icon: 'text-amber-500',
    accent: 'bg-amber-400',
  },
  {
    bg: 'bg-gradient-to-br from-purple-100 to-violet-200',
    icon: 'text-purple-500',
    accent: 'bg-purple-400',
  },
  {
    bg: 'bg-gradient-to-br from-rose-100 to-pink-200',
    icon: 'text-rose-500',
    accent: 'bg-rose-400',
  },
  {
    bg: 'bg-gradient-to-br from-cyan-100 to-sky-200',
    icon: 'text-cyan-500',
    accent: 'bg-cyan-400',
  },
  {
    bg: 'bg-gradient-to-br from-lime-100 to-green-200',
    icon: 'text-lime-600',
    accent: 'bg-lime-400',
  },
  {
    bg: 'bg-gradient-to-br from-fuchsia-100 to-pink-200',
    icon: 'text-fuchsia-500',
    accent: 'bg-fuchsia-400',
  },
];

const getCoverStyle = (id: number) => {
  return coverStyles[id % coverStyles.length];
};

const getAvailabilityColor = (available: number, total: number) => {
  const ratio = available / total;
  if (ratio === 0) return 'destructive';
  if (ratio < 0.3) return 'warning';
  return 'success';
};

interface BookCardProps {
  book: Book;
  onView: (book: Book) => void;
  onEdit?: (book: Book) => void;
  onDelete?: (book: Book) => void;
  isStudent?: boolean;
  index?: number;
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.3,
      ease: 'easeOut',
    },
  }),
};

export function BookCard({
  book,
  onView,
  onEdit,
  onDelete,
  isStudent = false,
  index = 0,
}: BookCardProps) {
  const availabilityBadge = getAvailabilityColor(
    book.available_quantity,
    book.quantity
  );
  const coverStyle = getCoverStyle(book.id);

  return (
    <motion.div
      variants={cardVariants as any}
      initial="hidden"
      animate="visible"
      custom={index}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
    >
      <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 h-full border-0 shadow-md bg-white dark:bg-slate-900">
        {/* Book Cover */}
        <div className={`h-36 ${coverStyle.bg} relative overflow-hidden`}>
          {/* Decorative elements */}
          <div className="absolute inset-0">
            {/* Book spine effect */}
            <div className={`absolute left-0 top-0 bottom-0 w-3 ${coverStyle.accent} opacity-40`} />

            {/* Decorative circles */}
            <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white/30" />
            <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-white/20" />

            {/* Pattern lines */}
            <div className="absolute top-8 right-8 w-12 h-[2px] bg-white/40 rounded" />
            <div className="absolute top-12 right-6 w-8 h-[2px] bg-white/30 rounded" />
          </div>

          {/* Book icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white/80 dark:bg-slate-800/80 rounded-xl p-4 shadow-lg backdrop-blur-sm">
              <BookOpen className={`h-10 w-10 ${coverStyle.icon}`} />
            </div>
          </div>

          {/* Status badge */}
          {!book.is_active && (
            <Badge
              variant="destructive"
              className="absolute top-2 left-2 text-xs shadow-md"
            >
              Inactive
            </Badge>
          )}

          {/* Quick actions on hover */}
          {!isStudent && book.is_active && (
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-8 w-8 bg-white/95 hover:bg-white shadow-md"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onView(book)}>
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                  {onEdit && (
                    <DropdownMenuItem onClick={() => onEdit(book)}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <DropdownMenuItem
                      onClick={() => onDelete(book)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        {/* Book Info */}
        <CardContent className="p-4 space-y-3">
          {/* Title */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <h3 className="font-semibold text-sm line-clamp-2 min-h-[2.5rem] cursor-default text-slate-800 dark:text-slate-100">
                  {book.title}
                </h3>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">{book.title}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Author */}
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
            <User className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="text-xs truncate">{book.author}</span>
          </div>

          {/* Category & Location */}
          <div className="flex items-center justify-between gap-2">
            {book.category_name && (
              <Badge
                variant="secondary"
                className="text-xs truncate max-w-[60%] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
              >
                {book.category_name}
              </Badge>
            )}
            {book.location && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1 text-slate-400">
                      <MapPin className="h-3 w-3" />
                      <span className="text-xs truncate max-w-[60px]">
                        {book.location}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Location: {book.location}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>

          {/* Availability & Price */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Badge variant={availabilityBadge as any} className="text-xs font-medium">
                {book.available_quantity}/{book.quantity}
              </Badge>
              <span className="text-xs text-slate-400">available</span>
            </div>
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
              ₹{book.price}
            </span>
          </div>

          {/* View button - always visible but subtle */}
          <Button
            variant="ghost"
            size="sm"
            className="w-full mt-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
            onClick={() => onView(book)}
          >
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default BookCard;
