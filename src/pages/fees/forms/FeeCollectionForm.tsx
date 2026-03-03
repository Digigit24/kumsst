/**
 * Fee Collection Form Component
 * Premium UX with card-select, progressive disclosure, amount suggestions,
 * inline history, receipt preview, real-time validation, and smart defaults
 */

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CardSelect, CardSelectOption } from '@/components/ui/card-select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SearchableSelect, SearchableSelectOption } from '@/components/ui/searchable-select';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { DROPDOWN_PAGE_SIZE } from '@/config/app.config';
import { useFeeCollectionsSWR, useStudentsSWR } from '@/hooks/swr';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import type { FeeCollection, FeeCollectionCreateInput } from '@/types/fees.types';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  Building2,
  ChevronDown,
  Clock,
  IndianRupee,
  Receipt,
  Smartphone,
  Wallet,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

// ============================================================================
// CONSTANTS
// ============================================================================

const PAYMENT_METHODS: CardSelectOption[] = [
  { value: 'cash', label: 'Cash', description: 'Cash payment', icon: Wallet },
  { value: 'bank', label: 'Bank', description: 'Bank transfer', icon: Building2 },
  { value: 'online', label: 'Online', description: 'Digital payment', icon: Smartphone },
];

const QUICK_AMOUNTS = [1000, 2000, 3000, 5000, 10000];

const STORAGE_KEY_PAYMENT_METHOD = 'kumss_fee_last_payment_method';

// ============================================================================
// HELPERS
// ============================================================================

function getStoredPaymentMethod(studentId?: number): string {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY_PAYMENT_METHOD);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (studentId && parsed[studentId]) return parsed[studentId];
      if (parsed._last) return parsed._last;
    }
  } catch { /* ignore */ }
  return 'cash';
}

function storePaymentMethod(method: string, studentId?: number) {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY_PAYMENT_METHOD);
    const parsed = stored ? JSON.parse(stored) : {};
    parsed._last = method;
    if (studentId) parsed[studentId] = method;
    sessionStorage.setItem(STORAGE_KEY_PAYMENT_METHOD, JSON.stringify(parsed));
  } catch { /* ignore */ }
}

// ============================================================================
// TYPES
// ============================================================================

export interface FeeCollectionFormProps {
  feeCollection: FeeCollection | null;
  onSubmit: (data: Partial<FeeCollectionCreateInput>) => void;
  onCancel: () => void;
  /** Pre-fill values from a previous collection (for "Collect Another Similar") */
  prefillData?: Partial<FeeCollectionCreateInput> | null;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const FeeCollectionForm = ({
  feeCollection,
  onSubmit,
  onCancel,
  prefillData,
}: FeeCollectionFormProps) => {
  // --- Context-based IDs (replaces manual localStorage calls) ---
  const { user } = useAuth();

  const userId = user?.id || localStorage.getItem('kumss_user_id') || undefined;
  const collegeId = useMemo(() => {
    // Prefer user's college from auth, fall back to localStorage
    const fromUser = user?.college ?? user?.college_id ?? null;
    if (fromUser) return Number(fromUser);
    const stored = localStorage.getItem('kumss_college_id');
    return stored ? parseInt(stored) : null;
  }, [user]);

  // --- Form state ---
  const [formData, setFormData] = useState<Partial<FeeCollectionCreateInput>>(() => {
    if (prefillData) {
      return {
        student: 0,
        amount: prefillData.amount || '0',
        payment_method: prefillData.payment_method || getStoredPaymentMethod(),
        payment_date: prefillData.payment_date || new Date().toISOString().split('T')[0],
        status: 'completed',
        transaction_id: '',
        remarks: '',
        is_active: true,
        bank_name: '',
        branch: '',
        account_holder_name: '',
        payment_gateway: '',
      };
    }
    return {
      student: 0,
      amount: '0',
      payment_method: getStoredPaymentMethod(),
      payment_date: new Date().toISOString().split('T')[0],
      status: 'completed',
      transaction_id: '',
      remarks: '',
      is_active: true,
      bank_name: '',
      branch: '',
      account_holder_name: '',
      payment_gateway: '',
    };
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showReceiptPreview, setShowReceiptPreview] = useState(false);
  const [amountWarning, setAmountWarning] = useState('');

  // --- Data fetching (SWR-based) ---
  const { data: studentsData, isLoading: isLoadingStudents } = useStudentsSWR({
    page_size: DROPDOWN_PAGE_SIZE,
  });

  // Fetch recent collections for the selected student (inline history)
  const { data: recentCollections } = useFeeCollectionsSWR(
    formData.student && formData.student > 0
      ? { student: formData.student, page_size: 5, ordering: '-payment_date' }
      : null
  );

  // --- Derived data ---
  const studentOptions: SearchableSelectOption[] = useMemo(() => {
    if (!studentsData?.results) return [];
    return studentsData.results.map((student) => ({
      value: student.id,
      label:
        student.full_name ||
        `${student.first_name || ''} ${student.last_name || ''}`.trim() ||
        `Student ${student.id}`,
      subtitle: student.roll_number || student.email || '',
    }));
  }, [studentsData]);

  const selectedStudentName = useMemo(() => {
    if (!formData.student || formData.student === 0) return '';
    const found = studentOptions.find((s) => s.value === formData.student);
    return found?.label || '';
  }, [formData.student, studentOptions]);

  // Previous payment amounts for quick-select chips
  const previousAmounts = useMemo(() => {
    if (!recentCollections?.results?.length) return QUICK_AMOUNTS;
    const amounts = recentCollections.results
      .map((c) => Math.round(parseFloat(c.amount)))
      .filter((a) => a > 0);
    const unique = [...new Set(amounts)];
    return unique.length > 0 ? unique.slice(0, 5) : QUICK_AMOUNTS;
  }, [recentCollections]);

  // --- Effects ---

  // Populate form when editing an existing collection
  useEffect(() => {
    if (feeCollection) {
      setFormData({
        student: feeCollection.student,
        amount: feeCollection.amount,
        payment_method: feeCollection.payment_method,
        payment_date: feeCollection.payment_date,
        status: feeCollection.status,
        transaction_id: feeCollection.transaction_id || '',
        remarks: feeCollection.remarks || '',
        is_active: feeCollection.is_active,
        bank_name: (feeCollection as any).bank_name || '',
        branch: (feeCollection as any).branch || '',
        account_holder_name: (feeCollection as any).account_holder_name || '',
        payment_gateway: (feeCollection as any).payment_gateway || '',
      });
    }
  }, [feeCollection]);

  // Smart default: auto-select stored payment method for student
  useEffect(() => {
    if (formData.student && formData.student > 0 && !feeCollection) {
      const stored = getStoredPaymentMethod(formData.student);
      if (stored !== formData.payment_method) {
        setFormData((prev) => ({ ...prev, payment_method: stored }));
      }
    }
  }, [formData.student, feeCollection]);

  // Inline validation: warn on high amounts
  useEffect(() => {
    const amount = parseFloat(formData.amount || '0');
    if (amount > 100000) {
      setAmountWarning('This is a large amount. Please verify before submitting.');
    } else if (amount < 0) {
      setAmountWarning('Amount cannot be negative.');
    } else {
      setAmountWarning('');
    }
  }, [formData.amount]);

  // --- Handlers ---
  const updateField = useCallback(
    <K extends keyof FeeCollectionCreateInput>(key: K, value: FeeCollectionCreateInput[K]) => {
      setFormData((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const submitData: any = { ...formData };

      // Inject context-based IDs
      if (collegeId) submitData.college = Number(collegeId);
      submitData.collected_by = userId;

      if (!feeCollection && userId) {
        submitData.created_by = userId;
        submitData.updated_by = userId;
      } else if (feeCollection && userId) {
        submitData.updated_by = userId;
      }

      // Store payment method for smart defaults
      if (formData.payment_method) {
        storePaymentMethod(formData.payment_method, formData.student || undefined);
      }

      await onSubmit(submitData);
    } catch (error) {
      console.error("Submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* ---- STUDENT SELECTION ---- */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-xl border bg-card text-card-foreground shadow-sm"
      >
        <div className="flex flex-col space-y-1.5 p-5 border-b bg-muted/20">
          <h3 className="font-semibold leading-none tracking-tight">Student Information</h3>
          <p className="text-sm text-muted-foreground">
            Select the student for this fee collection.
          </p>
        </div>
        <div className="p-5">
          <div className="space-y-2">
            <Label htmlFor="student" className="text-sm font-medium">
              Student <span className="text-destructive">*</span>
            </Label>
            <SearchableSelect
              options={studentOptions}
              value={formData.student}
              onChange={(value) => updateField('student', Number(value))}
              placeholder="Search & select student..."
              isLoading={isLoadingStudents}
              searchPlaceholder="Type name or roll number..."
              emptyText="No students available"
            />
          </div>
        </div>
      </motion.div>

      {/* ---- PAYMENT DETAILS ---- */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="rounded-xl border bg-card text-card-foreground shadow-sm"
      >
        <div className="flex flex-col space-y-1.5 p-5 border-b bg-muted/20">
          <h3 className="font-semibold leading-none tracking-tight">Payment Details</h3>
          <p className="text-sm text-muted-foreground">Enter the amount and payment method.</p>
        </div>
        <div className="p-5 space-y-5">
          {/* Amount with Quick Select chips */}
          <div className="space-y-3">
            <Label htmlFor="amount">
              Amount ({'\u20B9'}) <span className="text-destructive">*</span>
            </Label>

            {/* Quick Amount Chips */}
            <div className="flex flex-wrap gap-2">
              <span className="text-xs text-muted-foreground self-center mr-1">Quick:</span>
              {/* Combine previous amounts and static quick amounts, ensuring uniqueness */}
              {[...new Set([...previousAmounts, ...QUICK_AMOUNTS])].sort((a, b) => a - b).slice(0, 6).map((amt) => (
                <motion.button
                  key={amt}
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => updateField('amount', String(amt))}
                  className={cn(
                    'inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium border transition-all cursor-pointer',
                    formData.amount === String(amt)
                      ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                      : 'bg-muted/50 text-muted-foreground border-transparent hover:bg-muted hover:border-muted-foreground/20'
                  )}
                >
                  <IndianRupee className="h-3 w-3" />
                  {amt.toLocaleString('en-IN')}
                </motion.button>
              ))}
            </div>

            <div className="relative">
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => updateField('amount', e.target.value)}
                placeholder="0.00"
                required
                min="0"
                className={cn(
                  'pl-8',
                  amountWarning && 'border-amber-500 focus-visible:ring-amber-500'
                )}
              />
              <IndianRupee className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>

            {/* Inline validation warning */}
            <AnimatePresence>
              {amountWarning && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 px-3 py-2"
                >
                  <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                  <span className="text-xs text-amber-700 dark:text-amber-400">
                    {amountWarning}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Payment Date */}
          <div className="space-y-2">
            <Label htmlFor="payment_date">
              Payment Date <span className="text-destructive">*</span>
            </Label>
            <Input
              id="payment_date"
              type="date"
              value={formData.payment_date}
              onChange={(e) => updateField('payment_date', e.target.value)}
              required
            />
          </div>

          {/* Payment Method - Card Select */}
          <div className="space-y-2">
            <Label>
              Payment Method <span className="text-destructive">*</span>
            </Label>
            <CardSelect
              options={PAYMENT_METHODS}
              value={formData.payment_method}
              onChange={(value) => updateField('payment_method', value)}
            />
          </div>

          {/* Bank Payment Fields (conditional) */}
          <AnimatePresence>
            {formData.payment_method === 'bank' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="space-y-4 p-4 border rounded-lg bg-muted/10">
                  <h4 className="font-medium text-sm text-muted-foreground">
                    Bank Payment Details
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="bank_name">
                        Bank Name <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="bank_name"
                        value={formData.bank_name ?? ''}
                        onChange={(e) => updateField('bank_name', e.target.value)}
                        placeholder="Enter bank name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="branch">Branch</Label>
                      <Input
                        id="branch"
                        value={formData.branch ?? ''}
                        onChange={(e) => updateField('branch', e.target.value)}
                        placeholder="Enter branch name"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="account_holder_name">Account Holder Name</Label>
                    <Input
                      id="account_holder_name"
                      value={formData.account_holder_name ?? ''}
                      onChange={(e) => updateField('account_holder_name', e.target.value)}
                      placeholder="Enter account holder name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="transaction_id">Transaction/Reference ID</Label>
                    <Input
                      id="transaction_id"
                      value={formData.transaction_id ?? ''}
                      onChange={(e) => updateField('transaction_id', e.target.value)}
                      placeholder="Enter transaction/reference number"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Online Payment Fields (conditional) */}
          <AnimatePresence>
            {formData.payment_method === 'online' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="space-y-4 p-4 border rounded-lg bg-muted/10">
                  <h4 className="font-medium text-sm text-muted-foreground">
                    Online Payment Details
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="payment_gateway">
                        Payment Gateway <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="payment_gateway"
                        value={formData.payment_gateway ?? ''}
                        onChange={(e) => updateField('payment_gateway', e.target.value)}
                        placeholder="e.g., Razorpay, PayU, Paytm"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="transaction_id">
                        Transaction ID <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="transaction_id"
                        value={formData.transaction_id ?? ''}
                        onChange={(e) => updateField('transaction_id', e.target.value)}
                        placeholder="Enter transaction ID"
                        required
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">
              Status <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.status}
              onValueChange={(value) => updateField('status', value)}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </motion.div>

      {/* ---- ADVANCED FIELDS (Collapsible) ---- */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
          <CollapsibleTrigger className="flex w-full items-center gap-2 rounded-lg border bg-card px-4 py-3 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors cursor-pointer">
            <ChevronDown
              className={cn(
                'h-4 w-4 transition-transform duration-200',
                showAdvanced && 'rotate-180'
              )}
            />
            <span>
              {showAdvanced ? 'Hide' : 'Show'} additional details
            </span>
            <span className="text-xs opacity-60">(Remarks{formData.payment_method === 'cash' ? ', Transaction ID' : ''})</span>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="mt-3 rounded-xl border bg-card p-5 space-y-4"
            >
              {formData.payment_method === 'cash' && (
                <div className="space-y-2">
                  <Label htmlFor="transaction_id_cash">Transaction/Reference ID</Label>
                  <Input
                    id="transaction_id_cash"
                    value={formData.transaction_id ?? ''}
                    onChange={(e) => updateField('transaction_id', e.target.value)}
                    placeholder="Optional reference number"
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="remarks">Remarks</Label>
                <Textarea
                  id="remarks"
                  value={formData.remarks ?? ''}
                  onChange={(e) => updateField('remarks', e.target.value)}
                  placeholder="Any additional notes about this payment..."
                  rows={3}
                />
              </div>
            </motion.div>
          </CollapsibleContent>
        </Collapsible>
      </motion.div>

      {/* ---- RECEIPT PREVIEW ---- */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
      >
        <button
          type="button"
          onClick={() => setShowReceiptPreview(!showReceiptPreview)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <Receipt className="h-4 w-4" />
          <span>{showReceiptPreview ? 'Hide' : 'Preview'} Receipt</span>
        </button>

        <AnimatePresence>
          {showReceiptPreview && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="mt-3 rounded-xl border-2 border-dashed border-muted-foreground/20 bg-muted/10 p-5">
                <div className="text-center mb-4">
                  <h4 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">
                    Fee Receipt Preview
                  </h4>
                  <div className="w-12 h-0.5 bg-primary/40 mx-auto mt-2" />
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Student:</span>
                    <span className="font-medium">{selectedStudentName || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount:</span>
                    <span className="font-bold text-emerald-600">
                      {'\u20B9'}
                      {parseFloat(formData.amount || '0').toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date:</span>
                    <span>{formData.payment_date || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Method:</span>
                    <span className="capitalize">{formData.payment_method || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge
                      variant={
                        formData.status === 'completed'
                          ? 'success'
                          : formData.status === 'pending'
                            ? 'secondary'
                            : 'destructive'
                      }
                      className="text-xs"
                    >
                      {formData.status?.replace(/\b\w/g, (l) => l.toUpperCase()) || '—'}
                    </Badge>
                  </div>
                  {formData.transaction_id && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Transaction ID:</span>
                      <span className="font-mono text-xs">{formData.transaction_id}</span>
                    </div>
                  )}
                  {formData.remarks && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Remarks:</span>
                      <span className="text-right max-w-[60%] truncate">{formData.remarks}</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ---- INLINE RECENT PAYMENTS HISTORY ---- */}
      <AnimatePresence>
        {formData.student && formData.student > 0 && recentCollections?.results?.length ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="rounded-xl border bg-card shadow-sm"
          >
            <div className="flex items-center gap-2 px-5 py-3 border-b bg-muted/20">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Recent Payments</span>
              <Badge variant="secondary" className="text-xs ml-auto">
                {recentCollections.results.length}
              </Badge>
            </div>
            <ScrollArea className="max-h-40">
              <div className="divide-y">
                {recentCollections.results.map((collection) => (
                  <div
                    key={collection.id}
                    className="flex items-center justify-between px-5 py-2.5 text-sm hover:bg-muted/10 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted/50">
                        <IndianRupee className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                      <div>
                        <span className="font-medium">
                          {'\u20B9'}
                          {parseFloat(collection.amount).toLocaleString('en-IN')}
                        </span>
                        <span className="text-muted-foreground ml-2 text-xs capitalize">
                          {collection.payment_method}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          collection.status === 'completed'
                            ? 'success'
                            : collection.status === 'pending'
                              ? 'secondary'
                              : 'destructive'
                        }
                        className="text-xs"
                      >
                        {collection.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {collection.payment_date}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* ---- ACTIONS ---- */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex gap-2 pt-4 border-t mt-1"
      >
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Processing...
            </span>
          ) : (
            feeCollection ? 'Update' : 'Collect Fee'
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1"
        >
          Cancel
        </Button>
      </motion.div>
    </form>
  );
};
