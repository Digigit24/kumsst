/**
 * Sale Form Component - Modern POS Interface
 * Improved UX/UI with split "Workspace" and "Receipt" views
 */

import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import {
  Briefcase,
  Calendar,
  CreditCard,
  DollarSign,
  Minus,
  Plus,
  Receipt,
  ShoppingCart,
  Smartphone,
  Trash2,
  User,
  Wallet
} from 'lucide-react';
import { useEffect, useState } from 'react';
import shoppingCartGif from '../../../assets/shopping-cart.gif';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { SearchableSelect } from '../../../components/ui/searchable-select';
import { Separator } from '../../../components/ui/separator';
import { useStoreItems } from '../../../hooks/useStore';
import { studentApi } from '../../../services/students.service';

interface SaleFormProps {
  sale?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

interface CartItem {
  itemId: number;
  uniqueId: string;
  itemCode: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  unit: string;
}

export const SaleForm = ({ sale, onSubmit, onCancel }: SaleFormProps) => {
  const [formData, setFormData] = useState<any>({
    student: 0,
    teacher: 0,
    sale_date: new Date().toISOString().split('T')[0],
    total_amount: '0',
    payment_method: 'cash',
    payment_status: 'completed',
    remarks: '',
    guest_name: '',
    is_active: true,
  });

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<number>(0);
  const [selectedQty, setSelectedQty] = useState<number>(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);

  // Queries
  const { data: studentsData } = useQuery({
    queryKey: ['students-for-select'],
    queryFn: () => studentApi.list(),
  });

  const { data: storeItemsData, isLoading: isStoreLoading } = useStoreItems();
  const availableItems = storeItemsData?.results || [];

  // Effects
  useEffect(() => {
    if (sale) {
      setIsInitializing(true);
      setFormData({
        student: sale.student || 0,
        teacher: sale.teacher || 0,
        sale_date: sale.sale_date || new Date().toISOString().split('T')[0],
        total_amount: String(sale.total_amount || '0'),
        payment_method: sale.payment_method || 'cash',
        payment_status: sale.payment_status || 'pending',
        remarks: sale.remarks || '',
        is_active: sale.is_active ?? true,
      });

      if (storeItemsData?.results && sale.items && sale.items.length > 0) {
        const loadedItems = sale.items.map((sItem: any) => {
          const storeItem = storeItemsData.results.find((i: any) => i.id === sItem.item_id);
          return {
            itemId: sItem.item_id,
            uniqueId: `edit-${sItem.id}-${Date.now()}`,
            itemCode: storeItem?.code || 'N/A',
            itemName: sItem.item_name,
            quantity: sItem.quantity,
            unitPrice: parseFloat(sItem.unit_price),
            totalPrice: parseFloat(sItem.total_price),
            unit: storeItem?.unit || 'Pc'
          };
        });
        setCartItems(loadedItems);
      }

      // Artificial delay to show the GIF as requested
      const timer = setTimeout(() => setIsInitializing(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [sale, storeItemsData?.results]);

  useEffect(() => {
    const total = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
    setFormData((prev: any) => ({ ...prev, total_amount: total.toFixed(2) }));
  }, [cartItems]);

  // Options
  const studentsOptions = [
    { value: 0, label: 'Walk-in / Guest' },
    ...(studentsData?.results?.map((student: any) => ({
      value: student.id,
      label: student.full_name || `${student.first_name} ${student.last_name}`,
    })) || [])
  ];

  const itemOptions = availableItems.map((item: any) => ({
    value: item.id,
    label: `${item.name}`,
    subLabel: `${item.code} • ₹${item.price} • ${item.stock_quantity} in stock`,
    price: parseFloat(item.price || 0),
    stock: item.stock_quantity,
    unit: item.unit,
    name: item.name,
    code: item.code
  }));

  // Handlers
  const handleAddItem = () => {
    if (!selectedItemId || selectedQty <= 0) return;
    const itemInfo = itemOptions.find((i: any) => i.value === selectedItemId);

    if (!itemInfo) return;

    // Add logic here to handle duplicate items or stock checks if needed
    const newItem: CartItem = {
      itemId: selectedItemId,
      uniqueId: `${selectedItemId}-${Date.now()}`,
      itemCode: itemInfo.code,
      itemName: itemInfo.name,
      quantity: selectedQty,
      unitPrice: itemInfo.price,
      totalPrice: itemInfo.price * selectedQty,
      unit: itemInfo.unit || 'Pc'
    };

    // Check for duplicate to merge
    const existingIndex = cartItems.findIndex(i => i.itemId === selectedItemId);
    if (existingIndex >= 0) {
      const updated = [...cartItems];
      updated[existingIndex].quantity += selectedQty;
      updated[existingIndex].totalPrice = updated[existingIndex].quantity * updated[existingIndex].unitPrice;
      setCartItems(updated);
    } else {
      setCartItems([...cartItems, newItem]);
    }

    setSelectedItemId(0);
    setSelectedQty(1);
  };

  const handleRemoveItem = (index: number) => {
    const newCart = [...cartItems];
    newCart.splice(index, 1);
    setCartItems(newCart);
  };

  const handleUpdateQty = (index: number, newQty: number) => {
    if (newQty < 1) return;
    const newCart = [...cartItems];
    newCart[index].quantity = newQty;
    newCart[index].totalPrice = newCart[index].unitPrice * newQty;
    setCartItems(newCart);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate processing time for the GIF to play
    setTimeout(() => {
      const submitData = { ...formData };
      if (submitData.student === 0) {
        delete submitData.student;
        // Handle guest name
        if (formData.guest_name) {
          submitData.guest_name = formData.guest_name;
          // Append to remarks as a fallback ensures visibility
          submitData.remarks = submitData.remarks
            ? `${submitData.remarks} | Guest: ${formData.guest_name}`
            : `Guest: ${formData.guest_name}`;
        }
      }
      if (submitData.teacher === 0) delete submitData.teacher;
      submitData.items = cartItems;
      onSubmit(submitData);
    }, 2500);
  };

  const paymentMethods = [
    { id: 'cash', label: 'Cash', icon: DollarSign, color: 'text-green-600', bg: 'bg-green-100' },
    { id: 'upi', label: 'UPI / QR', icon: Smartphone, color: 'text-blue-600', bg: 'bg-blue-100' },
    { id: 'card', label: 'Card', icon: CreditCard, color: 'text-purple-600', bg: 'bg-purple-100' },
    { id: 'wallet', label: 'Wallet', icon: Wallet, color: 'text-orange-600', bg: 'bg-orange-100' },
    { id: 'bank_transfer', label: 'Bank', icon: Briefcase, color: 'text-gray-600', bg: 'bg-gray-100' },
  ];

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);

  return (
    <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-6 h-full min-h-[500px]">

      {/* 🟢 LEFT PANEL: WORKSPACE */}
      <div className="flex-1 space-y-6">

        {/* Customer & Date Header */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Customer</Label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground z-10" />
              <SearchableSelect
                options={studentsOptions}
                value={formData.student}
                onChange={(v) => setFormData({ ...formData, student: v })}
                placeholder="Walk-in Customer / Select Student"
                className="pl-9"
              />
            </div>
            {/* Manual Name Input for Quest/Walk-in */}
            {formData.student === 0 && (
              <div className="mt-2 animate-in fade-in slide-in-from-top-1">
                <Input
                  placeholder="Enter Guest / Customer Name"
                  value={formData.guest_name || ''}
                  onChange={(e) => setFormData({ ...formData, guest_name: e.target.value })}
                  className="bg-yellow-50/50 border-yellow-200 focus-visible:ring-yellow-400"
                />
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Date</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground z-10" />
              <Input
                type="date"
                value={formData.sale_date}
                onChange={(e) => setFormData({ ...formData, sale_date: e.target.value })}
                className="pl-9"
              />
            </div>
          </div>
        </div>

        {/* Product Selector */}
        <Card className="border-dashed border-2 shadow-sm bg-muted/20">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-primary" />
                Add Products
              </Label>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex-1">
                <SearchableSelect
                  options={itemOptions}
                  value={selectedItemId}
                  onChange={(v) => setSelectedItemId(Number(v))}
                  placeholder="Search for items..."
                  className="h-11 text-base"
                />
                {selectedItemId !== 0 && (
                  <div className="mt-2 text-xs text-muted-foreground flex gap-4">
                    <span>Price: <span className="font-medium text-foreground">{formatCurrency(itemOptions.find(i => i.value === selectedItemId)?.price || 0)}</span></span>
                    <span>Stock: <span className="font-medium text-foreground">{itemOptions.find(i => i.value === selectedItemId)?.stock}</span></span>
                  </div>
                )}
              </div>

              <div className="flex gap-4 items-end">
                <div className="w-32">
                  <Label className="text-xs mb-1.5 block">Quantity</Label>
                  <div className="flex items-center">
                    <Button type="button" variant="outline" size="icon" className="h-10 w-10 rounded-r-none" onClick={() => setSelectedQty(Math.max(1, selectedQty - 1))}>
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input
                      type="number"
                      min="1"
                      className="h-10 rounded-none text-center border-x-0"
                      value={selectedQty}
                      onChange={(e) => setSelectedQty(parseInt(e.target.value) || 1)}
                    />
                    <Button type="button" variant="outline" size="icon" className="h-10 w-10 rounded-l-none" onClick={() => setSelectedQty(selectedQty + 1)}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Button
                  type="button"
                  size="lg"
                  className="flex-1 h-10"
                  onClick={handleAddItem}
                  disabled={!selectedItemId}
                >
                  Add Item
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <div>
          <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-3 block">Payment Method</Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {paymentMethods.map((method) => {
              const isActive = formData.payment_method === method.id;
              const Icon = method.icon;
              return (
                <div
                  key={method.id}
                  onClick={() => setFormData({ ...formData, payment_method: method.id })}
                  className={cn(
                    "cursor-pointer rounded-xl border-2 p-3 flex flex-col items-center justify-center gap-2 transition-all duration-200 hover:shadow-md",
                    isActive ? `border-primary bg-primary/5 shadow-sm` : "border-transparent bg-white shadow-sm hover:border-gray-200"
                  )}
                >
                  <div className={cn("h-10 w-10 rounded-full flex items-center justify-center", isActive ? "bg-primary text-primary-foreground" : method.bg)}>
                    <Icon className={cn("h-5 w-5", isActive ? "text-white" : method.color)} />
                  </div>
                  <span className={cn("text-xs font-medium text-center", isActive ? "text-primary" : "text-gray-600")}>{method.label}</span>
                </div>
              )
            })}
          </div>
        </div>

      </div>

      {/* 🔴 RIGHT PANEL: RECEIPT / CART */}
      <div className="w-full lg:w-96 flex flex-col h-full">
        <div className="bg-white rounded-xl shadow-lg border flex-1 flex flex-col overflow-hidden relative">

          {/* Processing Overlay */}
          {(isProcessing || isInitializing || isStoreLoading) && (
            <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-300">
              <img
                src={shoppingCartGif}
                alt="Processing Sale"
                className="h-48 w-48 object-contain mix-blend-multiply"
              />
              <h3 className="text-xl font-bold text-primary mt-2 animate-pulse">
                {isProcessing ? 'Processing Sale...' : 'Loading Details...'}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">Please wait...</p>
            </div>
          )}

          {/* Receipt Header */}
          <div className="p-5 bg-gray-50 border-b flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Receipt className="h-5 w-5 text-gray-500" />
                Current Sale
              </h3>
              <p className="text-xs text-muted-foreground">Order #{Math.floor(Math.random() * 10000)}</p>
            </div>
            <Badge variant={formData.payment_status === 'completed' ? 'default' : 'secondary'}>
              {formData.payment_status}
            </Badge>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50/50">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-8 opacity-50">
                <ShoppingCart className="h-12 w-12 mb-3" />
                <p className="text-sm font-medium">Cart is empty</p>
                <p className="text-xs">Add items from the left</p>
              </div>
            ) : (
              cartItems.map((item, index) => (
                <div key={item.uniqueId} className="group flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 shadow-sm transition-all hover:shadow-md hover:border-primary/20">
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="text-base font-semibold truncate text-gray-900">{item.itemName}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{item.itemCode} • ₹{item.unitPrice}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {/* Qty Stepper */}
                    <div className="flex items-center bg-secondary rounded-md h-8 border shadow-sm">
                      <button
                        type="button"
                        onClick={() => handleUpdateQty(index, item.quantity - 1)}
                        className="h-full w-8 flex items-center justify-center hover:bg-white rounded-l text-muted-foreground disabled:opacity-30 transition-colors"
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="text-sm font-mono font-medium w-8 text-center">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => handleUpdateQty(index, item.quantity + 1)}
                        className="h-full w-8 flex items-center justify-center hover:bg-white rounded-r text-muted-foreground transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="text-right min-w-[80px]">
                      <p className="text-base font-bold font-mono text-gray-900">₹{item.totalPrice}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-md opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Receipt Footer */}
          <div className="p-5 bg-gray-50 border-t space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Subtotal</span>
                <span>{formatCurrency(parseFloat(formData.total_amount))}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Tax (0%)</span>
                <span>₹0.00</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between items-end">
                <span className="text-base font-semibold text-gray-900">Total Amount</span>
                <span className="text-2xl font-bold text-primary">{formatCurrency(parseFloat(formData.total_amount))}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button type="button" variant="outline" className="w-full" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" size="lg" className="w-full shadow-lg shadow-primary/20" disabled={cartItems.length === 0}>
                Checkout
              </Button>
            </div>
          </div>

          {/* Decorative Zigzag Bottom (Receipt feel) */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-[linear-gradient(45deg,transparent_25%,rgba(0,0,0,0.05)_25%,rgba(0,0,0,0.05)_50%,transparent_50%,transparent_75%,rgba(0,0,0,0.05)_75%,rgba(0,0,0,0.05)_100%)] bg-[length:10px_10px]" />
        </div>
      </div>

    </form>
  );
};

export default SaleForm;
