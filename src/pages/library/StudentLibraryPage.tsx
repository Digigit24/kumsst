import React, { useState } from 'react';
import { useDebounce, DEBOUNCE_DELAYS } from '@/hooks/useDebounce';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import {
  Book,
  BookOpen,
  Search,
  Filter,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Calendar,
  DollarSign,
  BookMarked,
  RefreshCw,
  Eye,
} from 'lucide-react';
import {
  mockBooks,
  mockIssuedBooks,
  mockFines,
  mockReservations,
  mockLibraryStats,
  getIssuedBooksByStudent,
  getFinesByStudent,
  getReservationsByStudent,
  getPendingFinesByStudent,
  canIssueBook,
  getBookStatusColor,
  getIssueStatusColor,
  type Book as BookType,
  type IssuedBook,
  type LibraryFine,
  type BookReservation,
  type BookCategory,
} from '@/data/libraryMockData';

const StudentLibraryPage: React.FC = () => {
  // Current student ID - in real app, get from auth context
  const currentStudentId = 'STU001';
  const currentStudentName = 'Rahul Sharma';

  const [activeTab, setActiveTab] = useState<'browse' | 'issued' | 'fines' | 'reservations'>('browse');
  const [books, setBooks] = useState<BookType[]>(mockBooks);
  const [issuedBooks, setIssuedBooks] = useState<IssuedBook[]>(getIssuedBooksByStudent(currentStudentId));
  const [fines, setFines] = useState<LibraryFine[]>(getFinesByStudent(currentStudentId));
  const [reservations, setReservations] = useState<BookReservation[]>(getReservationsByStudent(currentStudentId));

  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, DEBOUNCE_DELAYS.SEARCH);
  const [categoryFilter, setCategoryFilter] = useState<BookCategory | 'all'>('all');
  const [selectedBook, setSelectedBook] = useState<BookType | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const pendingFines = getPendingFinesByStudent(currentStudentId);
  const canIssue = canIssueBook(currentStudentId);

  // Filter books based on search and category
  const filteredBooks = books.filter(book => {
    const matchesSearch =
      book.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
      book.isbn.includes(debouncedSearchQuery);

    const matchesCategory = categoryFilter === 'all' || book.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const handleViewDetails = (book: BookType) => {
    setSelectedBook(book);
    setDetailsOpen(true);
  };

  const handleIssueRequest = (book: BookType) => {
    if (!canIssue.allowed) {
      toast.error(canIssue.reason);
      return;
    }
    toast.success(`Issue request for "${book.title}" submitted successfully!`);
  };

  const handleReserveBook = (book: BookType) => {
    toast.success(`Reservation for "${book.title}" created successfully!`);
  };

  const handleRenewBook = (issuedBook: IssuedBook) => {
    if (issuedBook.renewalCount >= issuedBook.maxRenewals) {
      toast.error('Maximum renewals reached for this book');
      return;
    }
    toast.success(`Book "${issuedBook.bookTitle}" renewed successfully!`);
  };

  const handlePayFine = (fine: LibraryFine) => {
    toast.success(`Payment of ₹${fine.amount} initiated for fine #${fine.id}`);
  };

  const stats = [
    { label: 'Books Issued', value: issuedBooks.length, icon: BookOpen, color: 'text-blue-600 dark:text-blue-400' },
    { label: 'Overdue Books', value: issuedBooks.filter(b => b.status === 'overdue').length, icon: AlertCircle, color: 'text-red-600 dark:text-red-400' },
    { label: 'Pending Fines', value: `₹${pendingFines}`, icon: DollarSign, color: 'text-orange-600 dark:text-orange-400' },
    { label: 'Reservations', value: reservations.length, icon: BookMarked, color: 'text-green-600 dark:text-green-400' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Library</h1>
        <p className="text-muted-foreground mt-1">Browse, issue, and manage your books</p>
      </div>

      {/* Warning Banner */}
      {!canIssue.allowed && (
        <Card className="border-orange-200 dark:border-orange-900 bg-orange-50 dark:bg-orange-950/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400 flex-shrink-0" />
              <div>
                <p className="font-medium text-orange-900 dark:text-orange-100">Book Issue Restricted</p>
                <p className="text-sm text-orange-700 dark:text-orange-300">{canIssue.reason}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className={cn('text-2xl font-bold mt-1', stat.color)}>{stat.value}</p>
                </div>
                <stat.icon className={cn('h-8 w-8', stat.color)} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b pb-2">
        <Button
          variant={activeTab === 'browse' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('browse')}
          className="gap-2"
        >
          <Search className="h-4 w-4" />
          Browse Books
        </Button>
        <Button
          variant={activeTab === 'issued' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('issued')}
          className="gap-2"
        >
          <BookOpen className="h-4 w-4" />
          My Books ({issuedBooks.length})
        </Button>
        <Button
          variant={activeTab === 'fines' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('fines')}
          className="gap-2"
        >
          <DollarSign className="h-4 w-4" />
          Fines ({fines.filter(f => f.status === 'pending').length})
        </Button>
        <Button
          variant={activeTab === 'reservations' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('reservations')}
          className="gap-2"
        >
          <BookMarked className="h-4 w-4" />
          Reservations ({reservations.length})
        </Button>
      </div>

      {/* Browse Books Tab */}
      {activeTab === 'browse' && (
        <div className="space-y-4">
          {/* Search and Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by title, author, or ISBN..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value as BookCategory | 'all')}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="textbook">Textbook</SelectItem>
                    <SelectItem value="reference">Reference</SelectItem>
                    <SelectItem value="fiction">Fiction</SelectItem>
                    <SelectItem value="magazine">Magazine</SelectItem>
                    <SelectItem value="journal">Journal</SelectItem>
                    <SelectItem value="research">Research</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Books Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBooks.map((book) => (
              <Card key={book.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base line-clamp-2">{book.title}</CardTitle>
                      <CardDescription className="line-clamp-1">{book.author}</CardDescription>
                    </div>
                    <Badge variant={getBookStatusColor(book.status) as any}>
                      {book.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">ISBN:</span>
                      <span className="font-mono text-xs">{book.isbn}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Publisher:</span>
                      <span className="truncate ml-2">{book.publisher}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Edition:</span>
                      <span>{book.edition}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shelf:</span>
                      <span className="font-medium">{book.shelf}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="text-muted-foreground">Available:</span>
                      <span className={cn(
                        'font-bold',
                        book.availableCopies > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                      )}>
                        {book.availableCopies}/{book.totalCopies}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewDetails(book)}
                      className="flex-1 gap-1"
                    >
                      <Eye className="h-3 w-3" />
                      Details
                    </Button>
                    {book.availableCopies > 0 ? (
                      <Button
                        size="sm"
                        onClick={() => handleIssueRequest(book)}
                        className="flex-1 gap-1"
                        disabled={!canIssue.allowed}
                      >
                        <BookOpen className="h-3 w-3" />
                        Issue
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleReserveBook(book)}
                        className="flex-1 gap-1"
                      >
                        <BookMarked className="h-3 w-3" />
                        Reserve
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredBooks.length === 0 && (
            <Card>
              <CardContent className="py-12">
                <div className="text-center text-muted-foreground">
                  <Book className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No books found matching your criteria</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Issued Books Tab */}
      {activeTab === 'issued' && (
        <div className="space-y-4">
          {issuedBooks.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No books currently issued</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            issuedBooks.map((issuedBook) => (
              <Card key={issuedBook.id}>
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-lg">{issuedBook.bookTitle}</h3>
                          <p className="text-sm text-muted-foreground">{issuedBook.bookAuthor}</p>
                        </div>
                        <Badge variant={getIssueStatusColor(issuedBook.status) as any}>
                          {issuedBook.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Issue Date</p>
                            <p className="font-medium">{new Date(issuedBook.issueDate).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Due Date</p>
                            <p className={cn(
                              'font-medium',
                              issuedBook.status === 'overdue' && 'text-red-600 dark:text-red-400'
                            )}>
                              {new Date(issuedBook.dueDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <RefreshCw className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Renewals</p>
                            <p className="font-medium">{issuedBook.renewalCount}/{issuedBook.maxRenewals}</p>
                          </div>
                        </div>
                        {issuedBook.fineAmount > 0 && (
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                            <div>
                              <p className="text-xs text-muted-foreground">Fine</p>
                              <p className="font-medium text-orange-600 dark:text-orange-400">₹{issuedBook.fineAmount}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex sm:flex-col gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRenewBook(issuedBook)}
                        disabled={issuedBook.renewalCount >= issuedBook.maxRenewals || issuedBook.status === 'overdue'}
                        className="gap-1 flex-1 sm:flex-none"
                      >
                        <RefreshCw className="h-3 w-3" />
                        Renew
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Fines Tab */}
      {activeTab === 'fines' && (
        <div className="space-y-4">
          {fines.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-3 opacity-50 text-green-600" />
                  <p>No fines - You're all clear!</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            fines.map((fine) => (
              <Card key={fine.id} className={cn(
                fine.status === 'pending' && 'border-orange-200 dark:border-orange-900'
              )}>
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row gap-4 items-start">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold">{fine.bookTitle}</h3>
                          <p className="text-sm text-muted-foreground">{fine.reason}</p>
                        </div>
                        <Badge variant={fine.status === 'pending' ? 'destructive' : fine.status === 'paid' ? 'default' : 'secondary'}>
                          {fine.status}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm">
                        <div>
                          <p className="text-xs text-muted-foreground">Fine Amount</p>
                          <p className="font-bold text-lg text-orange-600 dark:text-orange-400">₹{fine.amount}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Issue Date</p>
                          <p className="font-medium">{new Date(fine.issueDate).toLocaleDateString()}</p>
                        </div>
                        {fine.paidDate && (
                          <div>
                            <p className="text-xs text-muted-foreground">Paid Date</p>
                            <p className="font-medium">{new Date(fine.paidDate).toLocaleDateString()}</p>
                          </div>
                        )}
                        {fine.waiveReason && (
                          <div className="col-span-full">
                            <p className="text-xs text-muted-foreground">Waive Reason</p>
                            <p className="text-sm">{fine.waiveReason}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {fine.status === 'pending' && (
                      <Button
                        size="sm"
                        onClick={() => handlePayFine(fine)}
                        className="gap-1"
                      >
                        <DollarSign className="h-3 w-3" />
                        Pay Now
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Reservations Tab */}
      {activeTab === 'reservations' && (
        <div className="space-y-4">
          {reservations.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center text-muted-foreground">
                  <BookMarked className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No active reservations</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            reservations.map((reservation) => (
              <Card key={reservation.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold">{reservation.bookTitle}</h3>
                          <p className="text-sm text-muted-foreground">{reservation.bookAuthor}</p>
                        </div>
                        <Badge variant={reservation.status === 'active' ? 'default' : 'secondary'}>
                          {reservation.status}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm">
                        <div>
                          <p className="text-xs text-muted-foreground">Reserved On</p>
                          <p className="font-medium">{new Date(reservation.reservationDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Expires On</p>
                          <p className="font-medium">{new Date(reservation.expiryDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Notification</p>
                          <p className="font-medium">{reservation.notificationSent ? 'Sent' : 'Pending'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Book Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-2xl max-w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedBook?.title}</DialogTitle>
            <DialogDescription>{selectedBook?.author}</DialogDescription>
          </DialogHeader>
          {selectedBook && (
            <ScrollArea className="max-h-[400px]">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">ISBN</p>
                    <p className="font-medium font-mono">{selectedBook.isbn}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Publisher</p>
                    <p className="font-medium">{selectedBook.publisher}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Edition</p>
                    <p className="font-medium">{selectedBook.edition}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Year</p>
                    <p className="font-medium">{selectedBook.yearPublished}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Category</p>
                    <p className="font-medium capitalize">{selectedBook.category}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Shelf Location</p>
                    <p className="font-medium">{selectedBook.shelf}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total Copies</p>
                    <p className="font-medium">{selectedBook.totalCopies}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Available</p>
                    <p className={cn(
                      'font-medium',
                      selectedBook.availableCopies > 0 ? 'text-green-600' : 'text-red-600'
                    )}>
                      {selectedBook.availableCopies}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-muted-foreground mb-2">Description</p>
                  <p className="text-sm">{selectedBook.description}</p>
                </div>

                <div className="flex gap-2 pt-4">
                  {selectedBook.availableCopies > 0 ? (
                    <Button
                      onClick={() => {
                        handleIssueRequest(selectedBook);
                        setDetailsOpen(false);
                      }}
                      className="flex-1 gap-2"
                      disabled={!canIssue.allowed}
                    >
                      <BookOpen className="h-4 w-4" />
                      Issue This Book
                    </Button>
                  ) : (
                    <Button
                      variant="secondary"
                      onClick={() => {
                        handleReserveBook(selectedBook);
                        setDetailsOpen(false);
                      }}
                      className="flex-1 gap-2"
                    >
                      <BookMarked className="h-4 w-4" />
                      Reserve This Book
                    </Button>
                  )}
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentLibraryPage;
