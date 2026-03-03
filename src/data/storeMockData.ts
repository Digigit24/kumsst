/**
 * Store Management Mock Data
 * Comprehensive data for inventory, vendors, stock, sales, and print requests
 */

export type ItemCategory = 'stationery' | 'equipment' | 'consumables' | 'books' | 'electronics' | 'furniture' | 'printing';
export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock' | 'overstocked';
export type PrintRequestStatus = 'pending' | 'approved' | 'in_progress' | 'completed' | 'rejected';
export type PrintPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface StoreItem {
  id: number;
  itemCode: string;
  name: string;
  category: ItemCategory;
  description: string;
  unit: string;
  currentStock: number;
  minStockLevel: number;
  maxStockLevel: number;
  reorderPoint: number;
  unitPrice: number;
  totalValue: number;
  status: StockStatus;
  location: string;
  lastRestocked: string;
  supplier?: string;
}

export interface Vendor {
  id: number;
  vendorCode: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  category: string;
  rating: number;
  totalOrders: number;
  totalAmount: number;
  paymentTerms: string;
  status: 'active' | 'inactive';
  joinedDate: string;
}

export interface StockReceive {
  id: number;
  receiveNumber: string;
  date: string;
  vendor: string;
  vendorId: number;
  items: StockReceiveItem[];
  totalQuantity: number;
  totalAmount: number;
  receivedBy: string;
  status: 'pending' | 'received' | 'verified';
  invoiceNumber?: string;
}

export interface StockReceiveItem {
  itemId: number;
  itemName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface StoreSale {
  id: number;
  saleNumber: string;
  date: string;
  soldTo: string;
  soldToType: 'student' | 'teacher' | 'staff' | 'external';
  items: StoreSaleItem[];
  totalQuantity: number;
  totalAmount: number;
  paymentMode: 'cash' | 'card' | 'upi' | 'credit';
  status: 'completed' | 'pending' | 'cancelled';
  issuedBy: string;
}

export interface StoreSaleItem {
  itemId: number;
  itemName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface PrintRequest {
  id: number;
  requestNumber: string;
  title: string;
  requestedBy: string;
  requestedByRole: 'teacher' | 'admin' | 'department';
  requestDate: string;
  requiredDate: string;
  priority: PrintPriority;
  status: PrintRequestStatus;
  documentType: 'question_paper' | 'answer_sheet' | 'certificate' | 'form' | 'notice';
  copies: number;
  paperType: 'A4' | 'A3' | 'Legal' | 'Letter';
  colorType: 'black_white' | 'color';
  bindingType?: 'staple' | 'spiral' | 'none';
  totalPages: number;
  totalSheets: number;
  estimatedCost: number;
  actualCost?: number;
  notes?: string;
  approvedBy?: string;
  approvedDate?: string;
  completedDate?: string;
  assignedTo?: string;
}

// Mock Store Items
export const mockStoreItems: StoreItem[] = [
  {
    id: 1,
    itemCode: 'ST-001',
    name: 'A4 Printing Paper (Ream)',
    category: 'stationery',
    description: '80 GSM white printing paper, 500 sheets per ream',
    unit: 'Ream',
    currentStock: 45,
    minStockLevel: 20,
    maxStockLevel: 100,
    reorderPoint: 30,
    unitPrice: 250,
    totalValue: 11250,
    status: 'in_stock',
    location: 'Store Room A, Shelf 1',
    lastRestocked: '2025-12-15',
    supplier: 'JK Paper Supplies',
  },
  {
    id: 2,
    itemCode: 'ST-002',
    name: 'Blue Ball Pens (Box)',
    category: 'stationery',
    description: 'Reynolds ball pens, 50 pieces per box',
    unit: 'Box',
    currentStock: 8,
    minStockLevel: 10,
    maxStockLevel: 50,
    reorderPoint: 15,
    unitPrice: 200,
    totalValue: 1600,
    status: 'low_stock',
    location: 'Store Room A, Shelf 2',
    lastRestocked: '2025-11-20',
    supplier: 'Office Mart',
  },
  {
    id: 3,
    itemCode: 'EQ-001',
    name: 'Whiteboard Markers (Set)',
    category: 'equipment',
    description: 'Assorted colors, 12 pieces per set',
    unit: 'Set',
    currentStock: 0,
    minStockLevel: 5,
    maxStockLevel: 30,
    reorderPoint: 8,
    unitPrice: 180,
    totalValue: 0,
    status: 'out_of_stock',
    location: 'Store Room B, Shelf 1',
    lastRestocked: '2025-10-05',
    supplier: 'Office Mart',
  },
  {
    id: 4,
    itemCode: 'PR-001',
    name: 'Printer Toner Cartridge (Black)',
    category: 'printing',
    description: 'Compatible with HP LaserJet printers',
    unit: 'Piece',
    currentStock: 12,
    minStockLevel: 5,
    maxStockLevel: 20,
    reorderPoint: 7,
    unitPrice: 2500,
    totalValue: 30000,
    status: 'in_stock',
    location: 'Store Room C, Cabinet 1',
    lastRestocked: '2025-12-20',
    supplier: 'Tech Supplies Co.',
  },
  {
    id: 5,
    itemCode: 'ST-003',
    name: 'Notebooks (180 Pages)',
    category: 'stationery',
    description: 'Single line notebooks for students',
    unit: 'Piece',
    currentStock: 250,
    minStockLevel: 100,
    maxStockLevel: 500,
    reorderPoint: 150,
    unitPrice: 45,
    totalValue: 11250,
    status: 'in_stock',
    location: 'Store Room A, Shelf 3',
    lastRestocked: '2025-12-10',
    supplier: 'Classmate Distributors',
  },
  {
    id: 6,
    itemCode: 'EQ-002',
    name: 'Stapler (Heavy Duty)',
    category: 'equipment',
    description: 'Can staple up to 50 sheets',
    unit: 'Piece',
    currentStock: 15,
    minStockLevel: 5,
    maxStockLevel: 15,
    reorderPoint: 7,
    unitPrice: 350,
    totalValue: 5250,
    status: 'overstocked',
    location: 'Store Room B, Shelf 2',
    lastRestocked: '2025-12-22',
    supplier: 'Office Mart',
  },
  {
    id: 7,
    itemCode: 'CON-001',
    name: 'Sanitizer (5 Liter)',
    category: 'consumables',
    description: 'Hand sanitizer for dispensers',
    unit: 'Bottle',
    currentStock: 18,
    minStockLevel: 10,
    maxStockLevel: 40,
    reorderPoint: 15,
    unitPrice: 450,
    totalValue: 8100,
    status: 'in_stock',
    location: 'Store Room D, Shelf 1',
    lastRestocked: '2025-12-18',
    supplier: 'Hygiene Solutions',
  },
  {
    id: 8,
    itemCode: 'EL-001',
    name: 'LED Tube Light',
    category: 'electronics',
    description: '20W LED tube light, white',
    unit: 'Piece',
    currentStock: 3,
    minStockLevel: 10,
    maxStockLevel: 30,
    reorderPoint: 12,
    unitPrice: 320,
    totalValue: 960,
    status: 'low_stock',
    location: 'Store Room C, Shelf 2',
    lastRestocked: '2025-11-15',
    supplier: 'Electrical Supplies Ltd.',
  },
];

// Mock Vendors
export const mockVendors: Vendor[] = [
  {
    id: 1,
    vendorCode: 'VEN-001',
    name: 'JK Paper Supplies',
    contactPerson: 'Rajesh Kumar',
    email: 'sales@jkpaper.com',
    phone: '+91-9876543210',
    address: 'Industrial Area, Sector 15, Delhi',
    category: 'Stationery',
    rating: 4.5,
    totalOrders: 45,
    totalAmount: 2250000,
    paymentTerms: 'Net 30 days',
    status: 'active',
    joinedDate: '2024-01-15',
  },
  {
    id: 2,
    vendorCode: 'VEN-002',
    name: 'Office Mart',
    contactPerson: 'Priya Sharma',
    email: 'contact@officemart.com',
    phone: '+91-9876543211',
    address: 'Commercial Complex, MG Road, Bangalore',
    category: 'Office Supplies',
    rating: 4.2,
    totalOrders: 68,
    totalAmount: 1850000,
    paymentTerms: 'Net 15 days',
    status: 'active',
    joinedDate: '2023-08-20',
  },
  {
    id: 3,
    vendorCode: 'VEN-003',
    name: 'Tech Supplies Co.',
    contactPerson: 'Amit Patel',
    email: 'sales@techsupplies.com',
    phone: '+91-9876543212',
    address: 'Tech Park, Whitefield, Bangalore',
    category: 'Electronics & IT',
    rating: 4.8,
    totalOrders: 32,
    totalAmount: 3200000,
    paymentTerms: 'Net 45 days',
    status: 'active',
    joinedDate: '2023-05-10',
  },
  {
    id: 4,
    vendorCode: 'VEN-004',
    name: 'Classmate Distributors',
    contactPerson: 'Suresh Reddy',
    email: 'info@classmate.com',
    phone: '+91-9876543213',
    address: 'Wholesale Market, Hyderabad',
    category: 'Books & Stationery',
    rating: 4.3,
    totalOrders: 52,
    totalAmount: 1680000,
    paymentTerms: 'Net 30 days',
    status: 'active',
    joinedDate: '2023-11-05',
  },
  {
    id: 5,
    vendorCode: 'VEN-005',
    name: 'Hygiene Solutions',
    contactPerson: 'Meena Joseph',
    email: 'sales@hygienesol.com',
    phone: '+91-9876543214',
    address: 'Industrial Estate, Pune',
    category: 'Consumables',
    rating: 4.0,
    totalOrders: 28,
    totalAmount: 980000,
    paymentTerms: 'Net 20 days',
    status: 'active',
    joinedDate: '2024-03-12',
  },
];

// Mock Stock Receives
export const mockStockReceives: StockReceive[] = [
  {
    id: 1,
    receiveNumber: 'RCV-2025-001',
    date: '2025-12-22',
    vendor: 'Office Mart',
    vendorId: 2,
    items: [
      { itemId: 6, itemName: 'Stapler (Heavy Duty)', quantity: 10, unitPrice: 350, totalPrice: 3500 },
      { itemId: 2, itemName: 'Blue Ball Pens (Box)', quantity: 5, unitPrice: 200, totalPrice: 1000 },
    ],
    totalQuantity: 15,
    totalAmount: 4500,
    receivedBy: 'Store Manager',
    status: 'received',
    invoiceNumber: 'INV-OM-2025-456',
  },
  {
    id: 2,
    receiveNumber: 'RCV-2025-002',
    date: '2025-12-20',
    vendor: 'Tech Supplies Co.',
    vendorId: 3,
    items: [
      { itemId: 4, itemName: 'Printer Toner Cartridge (Black)', quantity: 6, unitPrice: 2500, totalPrice: 15000 },
    ],
    totalQuantity: 6,
    totalAmount: 15000,
    receivedBy: 'IT Manager',
    status: 'verified',
    invoiceNumber: 'INV-TS-2025-789',
  },
  {
    id: 3,
    receiveNumber: 'RCV-2025-003',
    date: '2025-12-26',
    vendor: 'JK Paper Supplies',
    vendorId: 1,
    items: [
      { itemId: 1, itemName: 'A4 Printing Paper (Ream)', quantity: 20, unitPrice: 250, totalPrice: 5000 },
    ],
    totalQuantity: 20,
    totalAmount: 5000,
    receivedBy: 'Store Manager',
    status: 'pending',
    invoiceNumber: 'INV-JK-2025-123',
  },
];

// Mock Store Sales
export const mockStoreSales: StoreSale[] = [
  {
    id: 1,
    saleNumber: 'SALE-2025-001',
    date: '2025-12-23',
    soldTo: 'Mathematics Department',
    soldToType: 'staff',
    items: [
      { itemId: 1, itemName: 'A4 Printing Paper (Ream)', quantity: 5, unitPrice: 250, totalPrice: 1250 },
      { itemId: 2, itemName: 'Blue Ball Pens (Box)', quantity: 2, unitPrice: 200, totalPrice: 400 },
    ],
    totalQuantity: 7,
    totalAmount: 1650,
    paymentMode: 'credit',
    status: 'completed',
    issuedBy: 'Store Clerk',
  },
  {
    id: 2,
    saleNumber: 'SALE-2025-002',
    date: '2025-12-24',
    soldTo: 'Rahul Kumar (Student)',
    soldToType: 'student',
    items: [
      { itemId: 5, itemName: 'Notebooks (180 Pages)', quantity: 5, unitPrice: 45, totalPrice: 225 },
    ],
    totalQuantity: 5,
    totalAmount: 225,
    paymentMode: 'cash',
    status: 'completed',
    issuedBy: 'Store Clerk',
  },
  {
    id: 3,
    saleNumber: 'SALE-2025-003',
    date: '2025-12-25',
    soldTo: 'Physics Lab',
    soldToType: 'staff',
    items: [
      { itemId: 3, itemName: 'Whiteboard Markers (Set)', quantity: 3, unitPrice: 180, totalPrice: 540 },
      { itemId: 6, itemName: 'Stapler (Heavy Duty)', quantity: 1, unitPrice: 350, totalPrice: 350 },
    ],
    totalQuantity: 4,
    totalAmount: 890,
    paymentMode: 'credit',
    status: 'completed',
    issuedBy: 'Store Manager',
  },
];

// Mock Print Requests
export const mockPrintRequests: PrintRequest[] = [
  {
    id: 1,
    requestNumber: 'PR-2025-001',
    title: 'Final Semester Exam - Mathematics',
    requestedBy: 'Dr. Ramesh Kumar',
    requestedByRole: 'teacher',
    requestDate: '2025-12-20T10:30:00Z',
    requiredDate: '2025-12-28',
    priority: 'urgent',
    status: 'pending',
    documentType: 'question_paper',
    copies: 150,
    paperType: 'A4',
    colorType: 'black_white',
    bindingType: 'staple',
    totalPages: 8,
    totalSheets: 1200,
    estimatedCost: 3600,
    notes: 'Urgent: Required for semester exams. Please ensure quality printing with no smudges.',
  },
  {
    id: 2,
    requestNumber: 'PR-2025-002',
    title: 'Mid-Term Test - Physics',
    requestedBy: 'Prof. Anjali Verma',
    requestedByRole: 'teacher',
    requestDate: '2025-12-21T14:15:00Z',
    requiredDate: '2025-12-27',
    priority: 'high',
    status: 'approved',
    documentType: 'question_paper',
    copies: 120,
    paperType: 'A4',
    colorType: 'black_white',
    bindingType: 'staple',
    totalPages: 6,
    totalSheets: 720,
    estimatedCost: 2160,
    approvedBy: 'HOD - Science',
    approvedDate: '2025-12-21T16:00:00Z',
    notes: 'Include diagrams clearly. Use good quality paper.',
  },
  {
    id: 3,
    requestNumber: 'PR-2025-003',
    title: 'Answer Sheets for Final Exams',
    requestedBy: 'Examination Department',
    requestedByRole: 'admin',
    requestDate: '2025-12-22T09:00:00Z',
    requiredDate: '2025-12-29',
    priority: 'urgent',
    status: 'in_progress',
    documentType: 'answer_sheet',
    copies: 500,
    paperType: 'A4',
    colorType: 'black_white',
    bindingType: 'none',
    totalPages: 12,
    totalSheets: 6000,
    estimatedCost: 12000,
    approvedBy: 'Principal',
    approvedDate: '2025-12-22T10:00:00Z',
    assignedTo: 'Print Operator - Rajesh',
    notes: 'Bulk printing required. Coordinate with examination office.',
  },
  {
    id: 4,
    requestNumber: 'PR-2025-004',
    title: 'Chemistry Practical Exam',
    requestedBy: 'Dr. Suresh Nair',
    requestedByRole: 'teacher',
    requestDate: '2025-12-23T11:45:00Z',
    requiredDate: '2025-12-30',
    priority: 'normal',
    status: 'approved',
    documentType: 'question_paper',
    copies: 80,
    paperType: 'A4',
    colorType: 'black_white',
    bindingType: 'staple',
    totalPages: 4,
    totalSheets: 320,
    estimatedCost: 960,
    approvedBy: 'HOD - Science',
    approvedDate: '2025-12-23T15:00:00Z',
  },
  {
    id: 5,
    requestNumber: 'PR-2025-005',
    title: 'Student Certificates - Annual Day',
    requestedBy: 'Admin Office',
    requestedByRole: 'admin',
    requestDate: '2025-12-24T10:00:00Z',
    requiredDate: '2026-01-05',
    priority: 'normal',
    status: 'completed',
    documentType: 'certificate',
    copies: 200,
    paperType: 'A4',
    colorType: 'color',
    bindingType: 'none',
    totalPages: 1,
    totalSheets: 200,
    estimatedCost: 2000,
    actualCost: 1950,
    approvedBy: 'Principal',
    approvedDate: '2025-12-24T12:00:00Z',
    completedDate: '2025-12-25T16:00:00Z',
    assignedTo: 'Print Operator - Sunil',
    notes: 'Use certificate paper. Color printing required.',
  },
  {
    id: 6,
    requestNumber: 'PR-2025-006',
    title: 'Library Notice - New Book Arrival',
    requestedBy: 'Librarian',
    requestedByRole: 'admin',
    requestDate: '2025-12-25T09:30:00Z',
    requiredDate: '2025-12-27',
    priority: 'low',
    status: 'rejected',
    documentType: 'notice',
    copies: 50,
    paperType: 'A4',
    colorType: 'color',
    bindingType: 'none',
    totalPages: 1,
    totalSheets: 50,
    estimatedCost: 150,
    notes: 'Rejected: Use digital notice board instead to save paper.',
  },
];

// Helper Functions
export const getStockStatusColor = (status: StockStatus): string => {
  switch (status) {
    case 'in_stock': return 'success';
    case 'low_stock': return 'warning';
    case 'out_of_stock': return 'destructive';
    case 'overstocked': return 'default';
    default: return 'default';
  }
};

export const getPrintRequestStatusColor = (status: PrintRequestStatus): string => {
  switch (status) {
    case 'pending': return 'warning';
    case 'approved': return 'default';
    case 'in_progress': return 'default';
    case 'completed': return 'success';
    case 'rejected': return 'destructive';
    default: return 'default';
  }
};

export const getPrintPriorityColor = (priority: PrintPriority): string => {
  switch (priority) {
    case 'urgent': return 'destructive';
    case 'high': return 'warning';
    case 'normal': return 'default';
    case 'low': return 'secondary';
    default: return 'default';
  }
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const getStoreStatistics = () => {
  const items = mockStoreItems;
  const requests = mockPrintRequests;

  return {
    totalItems: items.length,
    totalValue: items.reduce((sum, item) => sum + item.totalValue, 0),
    lowStockItems: items.filter(i => i.status === 'low_stock').length,
    outOfStockItems: items.filter(i => i.status === 'out_of_stock').length,
    pendingPrintRequests: requests.filter(r => r.status === 'pending').length,
    urgentPrintRequests: requests.filter(r => r.priority === 'urgent' && r.status !== 'completed' && r.status !== 'rejected').length,
  };
};
