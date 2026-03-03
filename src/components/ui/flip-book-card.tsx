"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { BookOpen, User, MapPin, Eye, Calendar, Hash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

// Book cover color palettes
const coverColors = [
  { bg: "from-blue-500 to-blue-700", accent: "bg-blue-300", text: "text-blue-50" },
  { bg: "from-emerald-500 to-emerald-700", accent: "bg-emerald-300", text: "text-emerald-50" },
  { bg: "from-amber-500 to-amber-700", accent: "bg-amber-300", text: "text-amber-50" },
  { bg: "from-purple-500 to-purple-700", accent: "bg-purple-300", text: "text-purple-50" },
  { bg: "from-rose-500 to-rose-700", accent: "bg-rose-300", text: "text-rose-50" },
  { bg: "from-cyan-500 to-cyan-700", accent: "bg-cyan-300", text: "text-cyan-50" },
  { bg: "from-orange-500 to-orange-700", accent: "bg-orange-300", text: "text-orange-50" },
  { bg: "from-indigo-500 to-indigo-700", accent: "bg-indigo-300", text: "text-indigo-50" },
  { bg: "from-teal-500 to-teal-700", accent: "bg-teal-300", text: "text-teal-50" },
  { bg: "from-pink-500 to-pink-700", accent: "bg-pink-300", text: "text-pink-50" },
]

const getCoverColor = (id: number) => coverColors[id % coverColors.length]

export interface FlipBookData {
  id: number
  title: string
  author: string
  category_name?: string
  available_quantity: number
  quantity: number
  cover_image?: string | null
  price?: string
  isbn?: string | null
  publisher?: string | null
  location?: string | null
  is_active?: boolean
}

interface FlipBookCardProps {
  book: FlipBookData
  onClick?: (book: FlipBookData) => void
  onView?: (book: FlipBookData) => void
  className?: string
  index?: number
}

export function FlipBookCard({ book, onClick, onView, className, index = 0 }: FlipBookCardProps) {
  const [isFlipped, setIsFlipped] = useState(false)
  const colors = getCoverColor(book.id)
  const isAvailable = book.available_quantity > 0

  const handleClick = () => {
    if (onClick) {
      onClick(book)
    }
  }

  const handleViewClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onView) {
      onView(book)
    } else if (onClick) {
      onClick(book)
    }
  }

  return (
    <div
      className={cn(
        "group perspective-1000 cursor-pointer",
        className
      )}
      style={{
        perspective: "1000px",
        animationDelay: `${index * 50}ms`,
      }}
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
      onClick={handleClick}
    >
      <div
        className="relative w-full transition-transform duration-500 ease-out"
        style={{
          transformStyle: "preserve-3d",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          minHeight: "320px",
        }}
      >
        {/* Front of card - Book Cover */}
        <div
          className="absolute inset-0 w-full h-full rounded-xl overflow-hidden shadow-lg"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          }}
        >
          <div className={cn(
            "w-full h-full bg-gradient-to-br",
            colors.bg
          )}>
            {/* Book spine effect */}
            <div className={cn("absolute left-0 top-0 bottom-0 w-4", colors.accent, "opacity-50")} />

            {/* Decorative elements */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10" />
              <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-black/10" />
              {/* Lines */}
              <div className="absolute top-8 right-6 w-16 h-[2px] bg-white/30 rounded" />
              <div className="absolute top-12 right-8 w-12 h-[2px] bg-white/20 rounded" />
              <div className="absolute bottom-20 right-6 w-20 h-[2px] bg-white/20 rounded" />
            </div>

            {/* Book cover content */}
            <div className="relative h-full flex flex-col items-center justify-center p-6 text-center">
              {/* Cover image or icon */}
              {book.cover_image ? (
                <img
                  src={book.cover_image}
                  alt={book.title}
                  className="w-24 h-32 object-cover rounded-lg shadow-xl mb-4"
                />
              ) : (
                <div className="w-24 h-32 bg-white/20 backdrop-blur-sm rounded-lg shadow-xl mb-4 flex items-center justify-center">
                  <BookOpen className="w-12 h-12 text-white/80" />
                </div>
              )}

              {/* Title */}
              <h3 className={cn("font-bold text-lg line-clamp-2 mb-2", colors.text)}>
                {book.title}
              </h3>

              {/* Author */}
              <p className="text-white/80 text-sm flex items-center gap-1">
                <User className="w-3 h-3" />
                {book.author}
              </p>

              {/* Availability badge */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                <Badge
                  variant={isAvailable ? "default" : "destructive"}
                  className={cn(
                    "shadow-lg",
                    isAvailable ? "bg-green-500 hover:bg-green-600" : ""
                  )}
                >
                  {isAvailable ? `${book.available_quantity} Available` : "Not Available"}
                </Badge>
              </div>

              {/* Inactive overlay */}
              {book.is_active === false && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Badge variant="destructive" className="text-lg px-4 py-2">
                    Inactive
                  </Badge>
                </div>
              )}
            </div>

            {/* Flip hint */}
            <div className="absolute bottom-4 right-4 text-white/60 text-xs flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <span>Hover for details</span>
            </div>
          </div>
        </div>

        {/* Back of card - Book Details */}
        <div
          className="absolute inset-0 w-full h-full rounded-xl overflow-hidden shadow-lg bg-card border border-border"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <div className="h-full flex flex-col">
            {/* Header with color accent */}
            <div className={cn("h-3 bg-gradient-to-r", colors.bg)} />

            {/* Content */}
            <div className="flex-1 p-5 flex flex-col">
              {/* Title and Category */}
              <div className="mb-4">
                <h3 className="font-bold text-lg line-clamp-2 text-foreground mb-1">
                  {book.title}
                </h3>
                {book.category_name && (
                  <Badge variant="secondary" className="text-xs">
                    {book.category_name}
                  </Badge>
                )}
              </div>

              {/* Details */}
              <div className="flex-1 space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{book.author}</span>
                </div>

                {book.publisher && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <BookOpen className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{book.publisher}</span>
                  </div>
                )}

                {book.isbn && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Hash className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate font-mono text-xs">{book.isbn}</span>
                  </div>
                )}

                {book.location && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{book.location}</span>
                  </div>
                )}
              </div>

              {/* Bottom section */}
              <div className="pt-4 mt-auto border-t border-border">
                {/* Availability and Price */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-sm font-semibold",
                      isAvailable ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                    )}>
                      {book.available_quantity}/{book.quantity}
                    </span>
                    <span className="text-xs text-muted-foreground">copies</span>
                  </div>
                  {book.price && (
                    <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                      ₹{book.price}
                    </span>
                  )}
                </div>

                {/* Action Button */}
                <Button
                  className="w-full gap-2"
                  variant="default"
                  onClick={handleViewClick}
                >
                  <Eye className="w-4 h-4" />
                  View Details
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Grid component for displaying multiple flip book cards
interface FlipBookGridProps {
  books: FlipBookData[]
  onBookClick?: (book: FlipBookData) => void
  isLoading?: boolean
  emptyMessage?: string
  className?: string
}

export function FlipBookGrid({
  books,
  onBookClick,
  isLoading = false,
  emptyMessage = "No books found",
  className,
}: FlipBookGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="h-80 rounded-xl bg-muted animate-pulse"
          />
        ))}
      </div>
    )
  }

  if (books.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-20" />
        <p>{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className={cn(
      "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6",
      className
    )}>
      {books.map((book, index) => (
        <FlipBookCard
          key={book.id}
          book={book}
          onClick={onBookClick}
          onView={onBookClick}
          index={index}
        />
      ))}
    </div>
  )
}

export default FlipBookCard
