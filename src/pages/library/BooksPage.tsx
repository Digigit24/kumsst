/**
 * Books Page - Library Module
 * Enhanced UI with Grid/Table view, Stats, and Category filtering
 */

import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  BookCheck,
  BookOpen,
  Library,
  Plus,
  RefreshCw,
  Search,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { Column, DataTable, FilterConfig } from '../../components/common/DataTable';
import { DetailSidebar } from '../../components/common/DetailSidebar';
import {
  BookCard,
  BookDetailsView,
  CategoryPills,
  LibraryStats,
  ViewToggle,
  type StatItem,
  type ViewMode
} from '../../components/library';
import LibraryLoader from '../../components/library/LibraryLoader';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { DROPDOWN_PAGE_SIZE } from '../../config/app.config';
import { invalidateBooks, useBookCategoriesSWR, useBooksSWR } from '../../hooks/swr';
import { useAuth } from '../../hooks/useAuth';
import { useDebounce } from '../../hooks/useDebounce';
import {
  useCreateBook,
  useDeleteBook,
  useUpdateBook,
} from '../../hooks/useLibrary';
import { Book } from '../../types/library.types';
import { BookForm } from './forms/BookForm';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const BooksPage = () => {
  const { user } = useAuth();
  const [filters, setFilters] = useState<Record<string, any>>({ page: 1, page_size: 20 });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarMode, setSidebarMode] = useState<'view' | 'create' | 'edit'>('view');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Check if user is student (students can only view, not add/edit/delete)
  const isStudent = user?.user_type === 'student';

  // Fetch books and categories
  const { data, isLoading, error } = useBooksSWR({
    ...filters,
    category: selectedCategory || undefined,
    search: debouncedSearchQuery || undefined,
  });
  const { data: categoriesData, isLoading: categoriesLoading } = useBookCategoriesSWR({
    is_active: true,
    page_size: DROPDOWN_PAGE_SIZE,
  });

  // Mutations
  const createBook = useCreateBook();
  const updateBook = useUpdateBook();
  const deleteBook = useDeleteBook();

  // Extract books array and pagination info
  const books: Book[] = useMemo(() => {
    if (Array.isArray(data)) return data;
    if (data?.results) return data.results;
    return [];
  }, [data]);

  const totalCount = useMemo(() => {
    if (Array.isArray(data)) return data.length;
    if (data?.count) return data.count;
    return 0;
  }, [data]);

  // Calculate statistics
  const stats: StatItem[] = useMemo(() => {
    const totalBooks = totalCount;
    const availableBooks = books.reduce((sum, b) => sum + (b.available_quantity || 0), 0);
    const totalQuantity = books.reduce((sum, b) => sum + (b.quantity || 0), 0);
    const issuedBooks = totalQuantity - availableBooks;
    const lowStock = books.filter((b) => b.available_quantity === 0).length;

    return [
      {
        label: 'Total Books',
        value: totalBooks,
        icon: Library,
        color: 'blue',
      },
      {
        label: 'Available',
        value: availableBooks,
        icon: BookCheck,
        color: 'green',
      },
      {
        label: 'Issued',
        value: issuedBooks,
        icon: BookOpen,
        color: 'orange',
      },
      {
        label: 'Out of Stock',
        value: lowStock,
        icon: AlertTriangle,
        color: 'red',
      },
    ];
  }, [books, totalCount]);

  // Categories for pills
  const categories = useMemo(() => {
    if (Array.isArray(categoriesData)) return categoriesData;
    if (categoriesData?.results) return categoriesData.results;
    return [];
  }, [categoriesData]);

  // Table columns
  const columns: Column<Book>[] = useMemo(() => [
    { key: 'title', label: 'Title', sortable: true },
    { key: 'author', label: 'Author', sortable: true },
    { key: 'isbn', label: 'ISBN', sortable: false },
    { key: 'category_name', label: 'Category', sortable: false },
    { key: 'publisher', label: 'Publisher', sortable: false },
    {
      key: 'quantity',
      label: 'Qty',
      render: (book) => (
        <span className="font-medium">
          {book.available_quantity}/{book.quantity}
        </span>
      ),
    },
    {
      key: 'price',
      label: 'Price',
      render: (book) => <span className="font-medium">₹{book.price}</span>,
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (book) => (
        <Badge variant={book.is_active ? 'success' : 'destructive'}>
          {book.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
  ], []);

  const filterConfig: FilterConfig[] = useMemo(() => [
    {
      name: 'is_active',
      label: 'Status',
      type: 'select',
      options: [
        { value: '', label: 'All' },
        { value: 'true', label: 'Active' },
        { value: 'false', label: 'Inactive' },
      ],
    },
  ], []);

  const handleAddNew = () => {
    setSelectedBook(null);
    setSidebarMode('create');
    setIsSidebarOpen(true);
  };

  const handleRowClick = (book: Book) => {
    setSelectedBook(book);
    setSidebarMode('view');
    setIsSidebarOpen(true);
  };

  const handleEdit = (book?: Book) => {
    if (book) setSelectedBook(book);
    setSidebarMode('edit');
    setIsSidebarOpen(true);
  };

  const handleFormSubmit = async (data: Partial<Book>) => {
    try {
      if (sidebarMode === 'create') {
        await createBook.mutateAsync(data);
        toast.success('Book created successfully');
      } else if (sidebarMode === 'edit' && selectedBook) {
        await updateBook.mutateAsync({ id: selectedBook.id, data });
        toast.success('Book updated successfully');
      }
      setIsSidebarOpen(false);
      setSelectedBook(null);
      invalidateBooks();
    } catch (err: any) {
      toast.error(err?.message || 'An error occurred');
    }
  };

  const handleDelete = async (book?: Book) => {
    const bookToDelete = book || selectedBook;
    if (!bookToDelete) return;

    if (confirm(`Are you sure you want to delete "${bookToDelete.title}"?`)) {
      try {
        await deleteBook.mutateAsync(bookToDelete.id);
        toast.success('Book deleted successfully');
        setIsSidebarOpen(false);
        setSelectedBook(null);
        invalidateBooks();
      } catch (err: any) {
        toast.error(err?.message || 'Failed to delete book');
      }
    }
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  const handleCategoryChange = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
    setFilters((prev) => ({ ...prev, page: 1 }));
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setFilters((prev) => ({ ...prev, page: 1 }));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col gap-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Library Books</h1>
          <p className="text-muted-foreground">
            Browse and manage the library collection
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ViewToggle value={viewMode} onChange={setViewMode} />
          {!isStudent && (
            <Button onClick={handleAddNew} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Book
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <LibraryStats stats={stats} />

      {/* Category Pills */}
      <CategoryPills
        categories={categories}
        selectedCategory={selectedCategory}
        onSelect={handleCategoryChange}
        totalBooks={totalCount}
        isLoading={categoriesLoading}
      />

      {/* Search Bar (for Grid/Shelf view) */}
      {viewMode === 'grid' && (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search books by title, author, ISBN..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => invalidateBooks()}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content */}
      <AnimatePresence mode="wait">
        {viewMode === 'table' ? (
          <motion.div
            key="table"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <DataTable
              title=""
              columns={columns}
              data={data}
              isLoading={isLoading}
              error={error?.message}
              onRefresh={() => invalidateBooks()}
              onAdd={isStudent ? undefined : handleAddNew}
              onRowClick={handleRowClick}
              filters={filters}
              onFiltersChange={setFilters}
              filterConfig={filterConfig}
              searchPlaceholder="Search books by title, author, ISBN..."
              addButtonLabel="Add Book"
              hideToolbar
            />
          </motion.div>
        ) : (
          <motion.div
            key="grid"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {isLoading ? (
              <LibraryLoader />
            ) : books.length === 0 ? (
              <Card>
                <CardContent className="py-16">
                  <div className="text-center text-muted-foreground">
                    <BookOpen className="h-16 w-16 mx-auto mb-4 opacity-30" />
                    <h3 className="text-lg font-medium mb-2">No books found</h3>
                    <p className="text-sm">
                      {searchQuery || selectedCategory
                        ? 'Try adjusting your search or filters'
                        : 'Add your first book to get started'}
                    </p>
                    {!isStudent && !searchQuery && !selectedCategory && (
                      <Button onClick={handleAddNew} className="mt-4 gap-2">
                        <Plus className="h-4 w-4" />
                        Add First Book
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
              >
                {books.map((book, index) => (
                  <BookCard
                    key={book.id}
                    book={book}
                    index={index}
                    onView={handleRowClick}
                    onEdit={isStudent ? undefined : handleEdit}
                    onDelete={isStudent ? undefined : handleDelete}
                    isStudent={isStudent}
                  />
                ))}
              </motion.div>
            )}

            {/* Pagination for Grid */}
            {!isLoading && books.length > 0 && (
              <div className="flex items-center justify-between pt-4">
                <p className="text-sm text-muted-foreground">
                  Showing {books.length} of {totalCount} books
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={filters.page === 1}
                    onClick={() =>
                      setFilters((prev) => ({ ...prev, page: prev.page - 1 }))
                    }
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={books.length < filters.page_size}
                    onClick={() =>
                      setFilters((prev) => ({ ...prev, page: prev.page + 1 }))
                    }
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detail Sidebar */}
      <DetailSidebar
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
        title={
          sidebarMode === 'create'
            ? 'Add New Book'
            : selectedBook?.title || 'Book Details'
        }
        mode={sidebarMode}
      >
        {sidebarMode === 'view' && selectedBook ? (
          <BookDetailsView
            book={selectedBook}
            onEdit={() => handleEdit()}
            onDelete={() => handleDelete()}
            isStudent={isStudent}
          />
        ) : (
          <BookForm
            book={sidebarMode === 'edit' ? selectedBook : null}
            onSubmit={handleFormSubmit}
            onCancel={handleCloseSidebar}
          />
        )}
      </DetailSidebar>
    </motion.div>
  );
};

export default BooksPage;
