/**
 * BookDetailsView Component - Compact sidebar book details display
 */

import { motion } from 'framer-motion';
import {
  Barcode,
  BookCopy,
  BookOpen,
  Building2,
  Calendar,
  CheckCircle,
  FileText,
  Globe,
  Hash,
  IndianRupee,
  Layers,
  MapPin,
  Pencil,
  Trash2,
  User,
} from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import type { Book } from '../../types/library.types';

// Light, pastel book cover colors (same as BookCard)
const coverStyles = [
  { bg: 'from-blue-100 to-indigo-100', icon: 'text-blue-500', accent: 'border-blue-300' },
  { bg: 'from-emerald-100 to-teal-100', icon: 'text-emerald-500', accent: 'border-emerald-300' },
  { bg: 'from-amber-100 to-orange-100', icon: 'text-amber-500', accent: 'border-amber-300' },
  { bg: 'from-purple-100 to-violet-100', icon: 'text-purple-500', accent: 'border-purple-300' },
  { bg: 'from-rose-100 to-pink-100', icon: 'text-rose-500', accent: 'border-rose-300' },
  { bg: 'from-cyan-100 to-sky-100', icon: 'text-cyan-500', accent: 'border-cyan-300' },
  { bg: 'from-lime-100 to-green-100', icon: 'text-lime-600', accent: 'border-lime-300' },
  { bg: 'from-fuchsia-100 to-pink-100', icon: 'text-fuchsia-500', accent: 'border-fuchsia-300' },
];

const getCoverStyle = (id: number) => coverStyles[id % coverStyles.length];

interface BookDetailsViewProps {
  book: Book;
  onEdit?: () => void;
  onDelete?: () => void;
  isStudent?: boolean;
}

export function BookDetailsView({
  book,
  onEdit,
  onDelete,
  isStudent = false,
}: BookDetailsViewProps) {
  const coverStyle = getCoverStyle(book.id);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-4"
    >
      {/* Compact Header with Stats on Right */}
      <div className={`bg-gradient-to-r ${coverStyle.bg} rounded-xl p-4 relative overflow-hidden`}>
        <div className="flex gap-4">
          {/* Book Icon */}
          <div className="bg-white/90 dark:bg-slate-800/90 rounded-xl p-3 shadow-sm h-fit">
            <BookOpen className={`h-8 w-8 ${coverStyle.icon}`} />
          </div>

          {/* Title & Author */}
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-slate-800 dark:text-white line-clamp-2 text-base">
              {book.title}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 flex items-center gap-1 mt-1">
              <User className="h-3 w-3" />
              {book.author}
            </p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              <Badge
                variant={book.is_active ? 'success' : 'destructive'}
                className="text-xs"
              >
                {book.is_active ? 'Active' : 'Inactive'}
              </Badge>
              {book.category_name && (
                <Badge variant="secondary" className="text-xs bg-white/70">
                  {book.category_name}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Row - Compact */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center border border-blue-100 dark:border-blue-800">
          <BookCopy className="h-4 w-4 text-blue-500 mx-auto mb-1" />
          <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{book.quantity}</p>
          <p className="text-[10px] font-medium text-slate-500 uppercase">Total</p>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3 text-center border border-emerald-100 dark:border-emerald-800">
          <CheckCircle className="h-4 w-4 text-emerald-500 mx-auto mb-1" />
          <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{book.available_quantity}</p>
          <p className="text-[10px] font-medium text-slate-500 uppercase">Available</p>
        </div>
        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 text-center border border-amber-100 dark:border-amber-800">
          <IndianRupee className="h-4 w-4 text-amber-500 mx-auto mb-1" />
          <p className="text-lg font-bold text-amber-600 dark:text-amber-400">{book.price}</p>
          <p className="text-[10px] font-medium text-slate-500 uppercase">Price</p>
        </div>
      </div>

      {/* Compact Details List */}
      <div className="space-y-1.5">
        <DetailRow icon={<Hash className="h-3.5 w-3.5" />} label="ISBN" value={book.isbn} mono />
        <DetailRow icon={<Building2 className="h-3.5 w-3.5" />} label="Publisher" value={book.publisher} />
        <DetailRow icon={<Layers className="h-3.5 w-3.5" />} label="Edition" value={book.edition} />
        <DetailRow icon={<Calendar className="h-3.5 w-3.5" />} label="Year" value={book.publication_year} />
        <DetailRow icon={<Globe className="h-3.5 w-3.5" />} label="Language" value={book.language} />
        <DetailRow icon={<FileText className="h-3.5 w-3.5" />} label="Pages" value={book.pages} />
        <DetailRow icon={<MapPin className="h-3.5 w-3.5" />} label="Location" value={book.location} />
        <DetailRow icon={<Barcode className="h-3.5 w-3.5" />} label="Barcode" value={book.barcode} mono />
      </div>

      {/* Description */}
      {book.description && (
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
          <p className="text-xs font-medium text-slate-400 uppercase mb-1">Description</p>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {book.description}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      {!isStudent && (onEdit || onDelete) && (
        <div className="flex gap-2 pt-2">
          {onEdit && (
            <Button
              onClick={onEdit}
              size="sm"
              className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
            >
              <Pencil className="h-3.5 w-3.5 mr-1.5" />
              Edit
            </Button>
          )}
          {onDelete && (
            <Button
              onClick={onDelete}
              size="sm"
              variant="outline"
              className="flex-1 border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-800"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              Delete
            </Button>
          )}
        </div>
      )}
    </motion.div>
  );
}

// Compact detail row component
function DetailRow({
  icon,
  label,
  value,
  mono = false
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
      <span className="text-slate-400">{icon}</span>
      <span className="text-xs text-slate-500 w-20 flex-shrink-0">{label}</span>
      <span className={`text-sm text-slate-700 dark:text-slate-200 truncate ${mono ? 'font-mono text-xs' : ''}`}>
        {value || 'N/A'}
      </span>
    </div>
  );
}

export default BookDetailsView;
