// Library Management Mock Data

export type BookStatus = 'available' | 'issued' | 'reserved' | 'maintenance' | 'lost';
export type IssueStatus = 'active' | 'overdue' | 'returned' | 'renewed';
export type BookCategory = 'textbook' | 'reference' | 'fiction' | 'magazine' | 'journal' | 'research';
export type FineStatus = 'pending' | 'paid' | 'waived';

export interface Book {
  id: number;
  isbn: string;
  title: string;
  author: string;
  publisher: string;
  category: BookCategory;
  edition: string;
  yearPublished: number;
  totalCopies: number;
  availableCopies: number;
  issuedCopies: number;
  reservedCopies: number;
  shelf: string;
  coverImage?: string;
  description: string;
  status: BookStatus;
}

export interface IssuedBook {
  id: number;
  bookId: number;
  bookTitle: string;
  bookAuthor: string;
  isbn: string;
  studentId: string;
  studentName: string;
  studentClass: string;
  issueDate: string;
  dueDate: string;
  returnDate?: string;
  status: IssueStatus;
  renewalCount: number;
  maxRenewals: number;
  fineAmount: number;
}

export interface BookReservation {
  id: number;
  bookId: number;
  bookTitle: string;
  bookAuthor: string;
  studentId: string;
  studentName: string;
  reservationDate: string;
  expiryDate: string;
  status: 'active' | 'expired' | 'fulfilled' | 'cancelled';
  notificationSent: boolean;
}

export interface LibraryFine {
  id: number;
  studentId: string;
  studentName: string;
  studentClass: string;
  bookTitle: string;
  reason: string;
  amount: number;
  issueDate: string;
  paidDate?: string;
  status: FineStatus;
  waiveReason?: string;
}

export interface LibraryStats {
  totalBooks: number;
  availableBooks: number;
  issuedBooks: number;
  overdueBooks: number;
  totalFines: number;
  studentsWithBooks: number;
}

// Mock Data
export const mockBooks: Book[] = [
  {
    id: 1,
    isbn: '978-0-13-468599-1',
    title: 'Introduction to Algorithms',
    author: 'Thomas H. Cormen, Charles E. Leiserson',
    publisher: 'MIT Press',
    category: 'textbook',
    edition: '4th Edition',
    yearPublished: 2022,
    totalCopies: 15,
    availableCopies: 8,
    issuedCopies: 6,
    reservedCopies: 1,
    shelf: 'CS-A-101',
    description: 'A comprehensive introduction to algorithms and data structures',
    status: 'available',
  },
  {
    id: 2,
    isbn: '978-0-13-235088-4',
    title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
    author: 'Robert C. Martin',
    publisher: 'Prentice Hall',
    category: 'reference',
    edition: '1st Edition',
    yearPublished: 2008,
    totalCopies: 10,
    availableCopies: 3,
    issuedCopies: 7,
    reservedCopies: 0,
    shelf: 'CS-B-205',
    description: 'Best practices for writing clean, maintainable code',
    status: 'available',
  },
  {
    id: 3,
    isbn: '978-0-596-52068-7',
    title: 'JavaScript: The Good Parts',
    author: 'Douglas Crockford',
    publisher: "O'Reilly Media",
    category: 'textbook',
    edition: '1st Edition',
    yearPublished: 2008,
    totalCopies: 8,
    availableCopies: 0,
    issuedCopies: 8,
    reservedCopies: 0,
    shelf: 'CS-C-312',
    description: 'Essential JavaScript programming techniques',
    status: 'issued',
  },
  {
    id: 4,
    isbn: '978-0-134-68592-4',
    title: 'Database System Concepts',
    author: 'Abraham Silberschatz, Henry F. Korth',
    publisher: 'McGraw-Hill',
    category: 'textbook',
    edition: '7th Edition',
    yearPublished: 2020,
    totalCopies: 12,
    availableCopies: 5,
    issuedCopies: 6,
    reservedCopies: 1,
    shelf: 'CS-D-415',
    description: 'Comprehensive guide to database management systems',
    status: 'available',
  },
  {
    id: 5,
    isbn: '978-1-59327-928-8',
    title: 'Python Crash Course',
    author: 'Eric Matthes',
    publisher: 'No Starch Press',
    category: 'textbook',
    edition: '3rd Edition',
    yearPublished: 2023,
    totalCopies: 20,
    availableCopies: 12,
    issuedCopies: 8,
    reservedCopies: 0,
    shelf: 'CS-E-520',
    description: 'A hands-on, project-based introduction to Python programming',
    status: 'available',
  },
  {
    id: 6,
    isbn: '978-0-262-03384-8',
    title: 'Artificial Intelligence: A Modern Approach',
    author: 'Stuart Russell, Peter Norvig',
    publisher: 'Prentice Hall',
    category: 'reference',
    edition: '4th Edition',
    yearPublished: 2020,
    totalCopies: 10,
    availableCopies: 4,
    issuedCopies: 5,
    reservedCopies: 1,
    shelf: 'CS-F-625',
    description: 'The leading textbook in Artificial Intelligence',
    status: 'available',
  },
  {
    id: 7,
    isbn: '978-1-234-56789-0',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    publisher: 'Scribner',
    category: 'fiction',
    edition: 'Classic Edition',
    yearPublished: 1925,
    totalCopies: 5,
    availableCopies: 3,
    issuedCopies: 2,
    reservedCopies: 0,
    shelf: 'FIC-A-100',
    description: 'Classic American novel set in the Jazz Age',
    status: 'available',
  },
  {
    id: 8,
    isbn: '978-0-987-65432-1',
    title: 'IEEE Computer Magazine - Jan 2024',
    author: 'IEEE Computer Society',
    publisher: 'IEEE',
    category: 'magazine',
    edition: 'Vol 57, Issue 1',
    yearPublished: 2024,
    totalCopies: 3,
    availableCopies: 2,
    issuedCopies: 1,
    reservedCopies: 0,
    shelf: 'MAG-A-001',
    description: 'Latest trends in computer science and technology',
    status: 'available',
  },
];

export const mockIssuedBooks: IssuedBook[] = [
  {
    id: 1,
    bookId: 2,
    bookTitle: 'Clean Code: A Handbook of Agile Software Craftsmanship',
    bookAuthor: 'Robert C. Martin',
    isbn: '978-0-13-235088-4',
    studentId: 'STU001',
    studentName: 'Rahul Sharma',
    studentClass: 'BTech CSE - 3rd Year',
    issueDate: '2024-12-01',
    dueDate: '2024-12-15',
    status: 'active',
    renewalCount: 0,
    maxRenewals: 2,
    fineAmount: 0,
  },
  {
    id: 2,
    bookId: 3,
    bookTitle: 'JavaScript: The Good Parts',
    bookAuthor: 'Douglas Crockford',
    isbn: '978-0-596-52068-7',
    studentId: 'STU002',
    studentName: 'Priya Patel',
    studentClass: 'BTech IT - 2nd Year',
    issueDate: '2024-11-20',
    dueDate: '2024-12-04',
    status: 'overdue',
    renewalCount: 1,
    maxRenewals: 2,
    fineAmount: 220,
  },
  {
    id: 3,
    bookId: 1,
    bookTitle: 'Introduction to Algorithms',
    bookAuthor: 'Thomas H. Cormen',
    isbn: '978-0-13-468599-1',
    studentId: 'STU003',
    studentName: 'Amit Kumar',
    studentClass: 'BTech CSE - 4th Year',
    issueDate: '2024-12-10',
    dueDate: '2024-12-24',
    status: 'active',
    renewalCount: 0,
    maxRenewals: 2,
    fineAmount: 0,
  },
  {
    id: 4,
    bookId: 4,
    bookTitle: 'Database System Concepts',
    bookAuthor: 'Abraham Silberschatz',
    isbn: '978-0-134-68592-4',
    studentId: 'STU004',
    studentName: 'Sneha Reddy',
    studentClass: 'BTech CSE - 3rd Year',
    issueDate: '2024-11-25',
    dueDate: '2024-12-09',
    status: 'overdue',
    renewalCount: 2,
    maxRenewals: 2,
    fineAmount: 170,
  },
  {
    id: 5,
    bookId: 5,
    bookTitle: 'Python Crash Course',
    bookAuthor: 'Eric Matthes',
    isbn: '978-1-59327-928-8',
    studentId: 'STU001',
    studentName: 'Rahul Sharma',
    studentClass: 'BTech CSE - 3rd Year',
    issueDate: '2024-10-15',
    dueDate: '2024-10-29',
    returnDate: '2024-10-28',
    status: 'returned',
    renewalCount: 0,
    maxRenewals: 2,
    fineAmount: 0,
  },
  {
    id: 6,
    bookId: 6,
    bookTitle: 'Artificial Intelligence: A Modern Approach',
    bookAuthor: 'Stuart Russell',
    isbn: '978-0-262-03384-8',
    studentId: 'STU005',
    studentName: 'Vikram Singh',
    studentClass: 'MTech AI - 1st Year',
    issueDate: '2024-12-05',
    dueDate: '2024-12-19',
    status: 'active',
    renewalCount: 0,
    maxRenewals: 2,
    fineAmount: 0,
  },
];

export const mockReservations: BookReservation[] = [
  {
    id: 1,
    bookId: 3,
    bookTitle: 'JavaScript: The Good Parts',
    bookAuthor: 'Douglas Crockford',
    studentId: 'STU006',
    studentName: 'Ananya Iyer',
    reservationDate: '2024-12-15',
    expiryDate: '2024-12-22',
    status: 'active',
    notificationSent: false,
  },
  {
    id: 2,
    bookId: 1,
    bookTitle: 'Introduction to Algorithms',
    bookAuthor: 'Thomas H. Cormen',
    studentId: 'STU007',
    studentName: 'Karthik Menon',
    reservationDate: '2024-12-18',
    expiryDate: '2024-12-25',
    status: 'active',
    notificationSent: false,
  },
  {
    id: 3,
    bookId: 6,
    bookTitle: 'Artificial Intelligence: A Modern Approach',
    bookAuthor: 'Stuart Russell',
    studentId: 'STU008',
    studentName: 'Divya Nair',
    reservationDate: '2024-12-10',
    expiryDate: '2024-12-17',
    status: 'expired',
    notificationSent: true,
  },
];

export const mockFines: LibraryFine[] = [
  {
    id: 1,
    studentId: 'STU002',
    studentName: 'Priya Patel',
    studentClass: 'BTech IT - 2nd Year',
    bookTitle: 'JavaScript: The Good Parts',
    reason: 'Book overdue by 22 days',
    amount: 220,
    issueDate: '2024-12-04',
    status: 'pending',
  },
  {
    id: 2,
    studentId: 'STU004',
    studentName: 'Sneha Reddy',
    studentClass: 'BTech CSE - 3rd Year',
    bookTitle: 'Database System Concepts',
    reason: 'Book overdue by 17 days',
    amount: 170,
    issueDate: '2024-12-09',
    status: 'pending',
  },
  {
    id: 3,
    studentId: 'STU009',
    studentName: 'Arjun Kapoor',
    studentClass: 'BTech ECE - 2nd Year',
    bookTitle: 'Introduction to Algorithms',
    reason: 'Book damaged - water spillage',
    amount: 500,
    issueDate: '2024-11-20',
    paidDate: '2024-12-01',
    status: 'paid',
  },
  {
    id: 4,
    studentId: 'STU010',
    studentName: 'Meera Gupta',
    studentClass: 'BTech CSE - 1st Year',
    bookTitle: 'Clean Code',
    reason: 'Book overdue by 5 days',
    amount: 50,
    issueDate: '2024-12-10',
    status: 'waived',
    waiveReason: 'First-time offender, medical emergency',
  },
];

export const mockLibraryStats: LibraryStats = {
  totalBooks: 83,
  availableBooks: 37,
  issuedBooks: 42,
  overdueBooks: 8,
  totalFines: 1240,
  studentsWithBooks: 28,
};

// Helper Functions
export const getBookById = (id: number): Book | undefined => {
  return mockBooks.find(book => book.id === id);
};

export const getIssuedBooksByStudent = (studentId: string): IssuedBook[] => {
  return mockIssuedBooks.filter(
    issue => issue.studentId === studentId && (issue.status === 'active' || issue.status === 'overdue')
  );
};

export const getReservationsByStudent = (studentId: string): BookReservation[] => {
  return mockReservations.filter(
    reservation => reservation.studentId === studentId && reservation.status === 'active'
  );
};

export const getFinesByStudent = (studentId: string): LibraryFine[] => {
  return mockFines.filter(fine => fine.studentId === studentId);
};

export const getPendingFinesByStudent = (studentId: string): number => {
  return mockFines
    .filter(fine => fine.studentId === studentId && fine.status === 'pending')
    .reduce((total, fine) => total + fine.amount, 0);
};

export const canIssueBook = (studentId: string): { allowed: boolean; reason?: string } => {
  const issuedBooks = getIssuedBooksByStudent(studentId);
  const pendingFines = getPendingFinesByStudent(studentId);

  if (issuedBooks.length >= 5) {
    return { allowed: false, reason: 'Maximum 5 books can be issued at a time' };
  }

  if (pendingFines > 0) {
    return { allowed: false, reason: `Please clear pending fines of ₹${pendingFines}` };
  }

  const hasOverdueBooks = issuedBooks.some(book => book.status === 'overdue');
  if (hasOverdueBooks) {
    return { allowed: false, reason: 'Please return overdue books first' };
  }

  return { allowed: true };
};

export const calculateFine = (dueDate: string, returnDate: string = new Date().toISOString()): number => {
  const due = new Date(dueDate);
  const returned = new Date(returnDate);
  const diffTime = returned.getTime() - due.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return 0;

  // ₹10 per day fine
  return diffDays * 10;
};

export const getBookStatusColor = (status: BookStatus): string => {
  switch (status) {
    case 'available':
      return 'default';
    case 'issued':
      return 'secondary';
    case 'reserved':
      return 'outline';
    case 'maintenance':
      return 'destructive';
    case 'lost':
      return 'destructive';
    default:
      return 'default';
  }
};

export const getIssueStatusColor = (status: IssueStatus): string => {
  switch (status) {
    case 'active':
      return 'default';
    case 'overdue':
      return 'destructive';
    case 'returned':
      return 'secondary';
    case 'renewed':
      return 'outline';
    default:
      return 'default';
  }
};
