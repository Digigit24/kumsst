/**
 * CategoryShelfView - Display books with 3D flip cards organized by category
 * Beautiful way to browse the library collection with flip card animations
 */

import { Bookshelf3D } from '@/components/ui/3d-bookshelf';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FlipBookGrid, type FlipBookData } from '@/components/ui/flip-book-card';
import type { Book } from '@/types/library.types';
import { ArrowLeft, FolderOpen } from 'lucide-react';
import { useMemo, useState } from 'react';
import LibraryLoader from './LibraryLoader';

// Category card colors
const categoryColors = [
  { bg: "from-blue-500 to-blue-600", icon: "text-blue-100" },
  { bg: "from-emerald-500 to-emerald-600", icon: "text-emerald-100" },
  { bg: "from-purple-500 to-purple-600", icon: "text-purple-100" },
  { bg: "from-amber-500 to-amber-600", icon: "text-amber-100" },
  { bg: "from-rose-500 to-rose-600", icon: "text-rose-100" },
  { bg: "from-cyan-500 to-cyan-600", icon: "text-cyan-100" },
  { bg: "from-indigo-500 to-indigo-600", icon: "text-indigo-100" },
  { bg: "from-teal-500 to-teal-600", icon: "text-teal-100" },
]

interface CategoryShelfViewProps {
  books: Book[];
  categories: { id: number; name: string }[];
  isLoading: boolean;
  onBookClick: (book: Book) => void;
  emptyMessage?: string;
}

export function CategoryShelfView({
  books,
  categories,
  isLoading,
  onBookClick,
  emptyMessage = 'No books found in the library',
}: CategoryShelfViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Group books by category
  const booksByCategory = useMemo(() => {
    const grouped: Record<string, Book[]> = {};

    books.forEach((book) => {
      const categoryName = book.category_name || 'Uncategorized';
      if (!grouped[categoryName]) {
        grouped[categoryName] = [];
      }
      grouped[categoryName].push(book);
    });

    return grouped;
  }, [books]);

  // Get category list with book counts
  const categoryList = useMemo(() => {
    return Object.entries(booksByCategory).map(([name, categoryBooks], index) => {
      // Try to find the original category object to get ID
      const originalCat = categories.find(c => c.name === name);
      return {
        id: originalCat?.id || index, // Fallback to index if mismatch
        name,
        count: categoryBooks.length,
        availableCount: categoryBooks.filter(b => b.available_quantity > 0).length,
        color: categoryColors[index % categoryColors.length],
        previewBooks: categoryBooks.slice(0, 3),
      };
    });
  }, [booksByCategory, categories]);

  // Get books for selected category
  const selectedCategoryBooks = selectedCategory
    ? booksByCategory[selectedCategory] || []
    : [];

  // Convert books to FlipBookData format
  const flipBookData: FlipBookData[] = useMemo(() => {
    return selectedCategoryBooks.map((book) => ({
      id: book.id,
      title: book.title,
      author: book.author,
      category_name: book.category_name,
      available_quantity: book.available_quantity,
      quantity: book.quantity,
      cover_image: book.cover_image,
      price: book.price,
      isbn: book.isbn,
      publisher: book.publisher,
      location: book.location,
      is_active: book.is_active,
    }));
  }, [selectedCategoryBooks]);

  const handleCategoryClick = (categoryName: string) => {
    setSelectedCategory(categoryName);
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
  };

  const handleBookClick = (flipBook: FlipBookData) => {
    const fullBook = books.find((b) => b.id === flipBook.id);
    if (fullBook) {
      onBookClick(fullBook);
    }
  };

  if (isLoading) {
    return <LibraryLoader />;
  }

  if (books.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <FolderOpen className="w-16 h-16 mx-auto mb-4 opacity-20" />
        <p>{emptyMessage}</p>
      </div>
    );
  }

  // Show selected category's books with flip cards
  if (selectedCategory) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToCategories}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Categories
          </Button>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-base px-3 py-1">
              {selectedCategory}
            </Badge>
            <span className="text-muted-foreground">
              ({selectedCategoryBooks.length} books)
            </span>
          </div>
        </div>

        <FlipBookGrid
          books={flipBookData}
          onBookClick={handleBookClick}
          emptyMessage={`No books in ${selectedCategory}`}
        />
      </div>
    );
  }

  // Show category cards
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {categoryList.length} categories with {books.length} total books
        </p>
        <p className="text-sm text-muted-foreground">
          Click a category to browse books
        </p>
      </div>

      <Bookshelf3D
        categories={categoryList}
        onCategoryClick={handleCategoryClick}
      />
    </div>
  );
}

export default CategoryShelfView;
