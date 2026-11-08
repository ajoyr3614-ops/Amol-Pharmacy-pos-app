/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Barcode as BarcodeIcon,
  Search,
  Plus,
  Minus,
  Trash2,
  Printer,
  CheckCircle,
  CreditCard,
  User,
  Percent,
  DollarSign,
  AlertCircle,
  FileDown,
  Share2,
  X,
  Camera
} from 'lucide-react';
import {
  Medicine,
  CartItem,
  UnitType,
  SaleTransaction,
  AppSettings,
  Customer
} from '../../types/pharmacy';
import { StorageService } from '../../services/storage';

import { CameraBarcodeScannerModal } from '../CameraBarcodeScannerModal';

interface PosScreenProps {
  settings: AppSettings;
  onBack: () => UnitType | any;
  onOpenReceipt: (sale: SaleTransaction) => void;
  onNavigateMedicine?: (barcodeToAdd?: string) => void;
}

export const PosScreen: React.FC<PosScreenProps> = ({ settings, onBack, onOpenReceipt, onNavigateMedicine }) => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);

  // Barcode Popup State
  const [selectedMedForPopup, setSelectedMedForPopup] = useState<Medicine | null>(null);
  const [popupUnit, setPopupUnit] = useState<UnitType>('piece');
  const [popupQuantity, setPopupQuantity] = useState(1);
  const [selectedBatchId, setSelectedBatchId] = useState<string>('');

  // Discount State (Applied once to whole memo subtotal)
  const [discountType, setDiscountType] = useState<'fixed' | 'percentage' | 'adjustment'>('fixed');
  const [discountValue, setDiscountValue] = useState<number>(0);

  // Payment Breakdown
  const [cashAmount, setCashAmount] = useState<number>(0);
  const [onlineAmount, setOnlineAmount] = useState<number>(0);

  // Customer Selection & Due Popup
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [showCustomerDueModal, setShowCustomerDueModal] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerMobile, setNewCustomerMobile] = useState('');
  const [newCustomerAddress, setNewCustomerAddress] = useState('');

  // Barcode Scanner Modal State
  const [showCameraScanner, setShowCameraScanner] = useState(false);
  const [manualBarcode, setManualBarcode] = useState('');
  const [notFoundBarcode, setNotFoundBarcode] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setMedicines(StorageService.getMedicines());
    setCustomers(StorageService.getCustomers());
  };

  // Trigger barcode lookup
  const handleBarcodeScanned = (barcodeCode: string) => {
    const trimmed = barcodeCode.trim();
    if (!trimmed) return;
    const found = medicines.find(
      m => m.barcode.toLowerCase() === trimmed.toLowerCase() ||
           m.barcode.replace(/\D/g, '') === trimmed.replace(/\D/g, '')
    );
    if (found) {
      setNotFoundBarcode(null);
      openProductPopup(found);
      setSearchQuery('');
      setManualBarcode('');
      setShowCameraScanner(false);
    } else {
      setNotFoundBarcode(trimmed);
      setShowCameraScanner(true);
    }
  };

  // Global USB and Bluetooth Barcode Scanner listener (Rapid keystroke buffer)
  useEffect(() => {
    let buffer = '';
    let lastKeyTime = Date.now();

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // If user is currently focused on an input element, let normal typing occur
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
        return;
      }

      const currentTime = Date.now();
      const timeDiff = currentTime - lastKeyTime;
      lastKeyTime = currentTime;

      if (e.key === 'Enter' || e.key === 'Tab') {
        const code = buffer.trim();
        buffer = '';
        if (code.length >= 3) {
          e.preventDefault();
          handleBarcodeScanned(code);
        }
        return;
      }

      if (e.key.length === 1) {
        if (timeDiff > 100) {
          buffer = '';
        }
        buffer += e.key;
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [medicines]);

  // Open Product Information Popup
  const openProductPopup = (medicine: Medicine) => {
    setSelectedMedForPopup(medicine);
    setPopupUnit('piece');
    setPopupQuantity(1);
    setSelectedBatchId(medicine.batches?.[0]?.id || '');
  };

  // Calculate unit multiplier & price for popup
  const getUnitMultiplier = (unit: UnitType, med: Medicine): number => {
    if (unit === 'strip') return med.conversion.piecesPerStrip || 10;
    if (unit === 'box') return med.conversion.piecesPerBox || 100;
    return 1;
  };

  const getUnitPrice = (unit: UnitType, med: Medicine): number => {
    const mult = getUnitMultiplier(unit, med);
    return med.salePricePerPiece * mult;
  };

  // Add Cart from popup
  const handleAddToCartFromPopup = () => {
    if (!selectedMedForPopup) return;
    const med = selectedMedForPopup;
    const mult = getUnitMultiplier(popupUnit, med);
    const totalPieces = popupQuantity * mult;
    const unitPrice = getUnitPrice(popupUnit, med);
    const lineTotal = unitPrice * popupQuantity;

    const selectedBatch = med.batches.find(b => b.id === selectedBatchId);

    const newItem: CartItem = {
      id: 'cart-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      medicineId: med.id,
      medicineName: med.name,
      genericName: med.genericName,
      batchId: selectedBatch?.id,
      batchNumber: selectedBatch?.batchNumber,
      expiryDate: selectedBatch?.expiryDate,
      selectedUnit: popupUnit,
      unitMultiplier: mult,
      quantity: popupQuantity,
      totalPieces,
      pricePerUnit: unitPrice,
      lineTotal
    };

    setCart(prev => [...prev, newItem]);
    // Close popup automatically and keep on POS screen
    setSelectedMedForPopup(null);
  };

  // Cart operations
  const updateCartQty = (itemId: string, newQty: number) => {
    if (newQty <= 0) {
      removeCartItem(itemId);
      return;
    }
    setCart(prev =>
      prev.map(item => {
        if (item.id === itemId) {
          const totalPieces = newQty * item.unitMultiplier;
          const lineTotal = newQty * item.pricePerUnit;
          return { ...item, quantity: newQty, totalPieces, lineTotal };
        }
        return item;
      })
    );
  };

  const removeCartItem = (itemId: string) => {
    setCart(prev => prev.filter(i => i.id !== itemId));
  };

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.lineTotal, 0);

  let discountAmount = 0;
  if (discountType === 'percentage') {
    discountAmount = (subtotal * (discountValue || 0)) / 100;
  } else if (discountType === 'fixed') {
    discountAmount = discountValue || 0;
  } else if (discountType === 'adjustment') {
    // Manual price adjustment sets grand total directly
    discountAmount = Math.max(0, subtotal - (discountValue || 0));
  }
  discountAmount = Math.min(subtotal, Math.max(0, discountAmount));

  const grandTotal = Math.max(0, subtotal - discountAmount);
  const totalPaid = cashAmount + onlineAmount;
  const remainingDue = Math.max(0, grandTotal - totalPaid);

  // Auto fill payment to grandTotal if cash/online are 0
  const handleQuickPayFullCash = () => {
    setCashAmount(grandTotal);
    setOnlineAmount(0);
  };

  const handleQuickPayFullOnline = () => {
    setOnlineAmount(grandTotal);
    setCashAmount(0);
  };

  // Complete Sale
  const handleCompleteSale = (forceProceedWithDue = false) => {
    if (cart.length === 0) {
      alert('Cart is empty. Please add medicines first.');
      return;
    }

    // If there is outstanding due and no customer attached, show customer registration modal
    if (remainingDue > 0 && !selectedCustomerId && !forceProceedWithDue) {
      setShowCustomerDueModal(true);
      return;
    }

    const selectedCust = customers.find(c => c.id === selectedCustomerId);

    const saleInvoice: SaleTransaction = {
      id: 'sale-' + Date.now(),
      invoiceNo: `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`,
      date: new Date().toISOString(),
      customerId: selectedCust?.id,
      customerName: selectedCust?.name || (remainingDue === 0 ? 'Walking Customer' : 'Unregistered Due Customer'),
      customerMobile: selectedCust?.mobile || '',
      items: cart,
      subtotal,
      discountType,
      discountValue,
      discountAmount,
      grandTotal,
      paymentMethod:
        cashAmount > 0 && onlineAmount > 0
          ? 'mixed'
          : cashAmount > 0
          ? 'cash'
          : onlineAmount > 0
          ? 'online'
          : 'due',
      payments: {
        cash: cashAmount,
        online: onlineAmount,
        due: remainingDue
      },
      paidAmount: totalPaid,
      remainingDue,
      status: remainingDue === 0 ? 'paid' : totalPaid > 0 ? 'partial' : 'due',
      notes: ''
    };

    // Save and update Room/local storage database
    StorageService.processSale(saleInvoice);

    // Refresh state
    setCart([]);
    setCashAmount(0);
    setOnlineAmount(0);
    setDiscountValue(0);
    setSelectedCustomerId('');
    loadData();

    // Show thermal memo preview modal immediately
    onOpenReceipt(saleInvoice);
  };

  // Filter medicines for live search
  const filteredMedicines = medicines.filter(
    m =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.genericName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.barcode.includes(searchQuery)
  );

  const isDark = settings.theme === 'dark';

  return (
    <div className={`min-h-full flex flex-col pb-16 ${isDark ? 'bg-black text-white' : 'bg-neutral-100 text-black'}`}>
      {/* Top Bar */}
      <div className={`px-4 py-3.5 border-b shadow-xs flex items-center justify-between sticky top-0 z-20 ${
        isDark ? 'bg-black border-neutral-800 text-white' : 'bg-white border-neutral-200 text-black'
      }`}>
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className={`p-1.5 rounded-xl border transition ${
              isDark ? 'border-neutral-800 hover:bg-neutral-900 text-white' : 'border-neutral-200 hover:bg-neutral-100 text-black'
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-base font-bold tracking-tight">POS / Retail Sales</h1>
            <p className={`text-[11px] ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
              Direct Billing &amp; Thermal Memos
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowCameraScanner(true)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs border shadow-xs transition active:scale-95 ${
            isDark ? 'bg-neutral-900 border-neutral-700 text-white hover:bg-neutral-800' : 'bg-neutral-100 border-neutral-300 text-black hover:bg-neutral-200'
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>Scan Barcode</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="p-3 flex-1 flex flex-col gap-3">
        {/* Medicine Search & Barcode Quick Field */}
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleBarcodeScanned(searchQuery);
              }}
              placeholder="Scan barcode or type medicine name / generic..."
              className="w-full pl-9 pr-20 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            {searchQuery && (
              <button
                onClick={() => handleBarcodeScanned(searchQuery)}
                className="absolute right-2 top-1.5 px-2.5 py-1 bg-teal-600 text-white rounded-lg text-xs font-semibold hover:bg-teal-700"
              >
                Find
              </button>
            )}
          </div>

          {/* Quick Match Pills when typing */}
          {searchQuery && (
            <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl">
              {filteredMedicines.length === 0 ? (
                <div className="p-3 text-xs text-slate-500 text-center">No medicines matched.</div>
              ) : (
                filteredMedicines.slice(0, 6).map(med => (
                  <div
                    key={med.id}
                    onClick={() => {
                      openProductPopup(med);
                      setSearchQuery('');
                    }}
                    className="p-2.5 hover:bg-teal-50/70 cursor-pointer flex items-center justify-between transition"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900">{med.name}</div>
                      <div className="text-[10px] text-slate-500">
                        {med.genericName} • Stock: {med.stockInPieces} Pcs
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-extrabold text-teal-700">
                        {settings.currency}{med.salePricePerPiece.toFixed(2)} / pc
                      </div>
                      <span className="text-[10px] text-teal-600 font-semibold underline">Select</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* --- Memo / Cart Display (Always Below Search, Never navigated away) --- */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs flex-1 flex flex-col overflow-hidden">
          <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-500"></span>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Cart Items ({cart.length})
              </h2>
            </div>
            {cart.length > 0 && (
              <button
                onClick={() => setCart([])}
                className="text-[11px] text-rose-600 font-semibold hover:underline flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" /> Clear Cart
              </button>
            )}
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-2 divide-y divide-slate-100">
            {cart.length === 0 ? (
              <div className="py-12 text-center text-slate-400 flex flex-col items-center justify-center">
                <BarcodeIcon className="w-12 h-12 text-slate-300 mb-2 stroke-1" />
                <p className="text-xs font-medium">Cart is currently empty.</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Scan a barcode or search above to add medicines.
                </p>
              </div>
            ) : (
              cart.map((item, index) => (
                <div key={item.id} className="py-2.5 px-2 flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-800 truncate">
                        {index + 1}. {item.medicineName}
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 uppercase">
                        {item.selectedUnit}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {settings.currency}{item.pricePerUnit.toFixed(2)} / {item.selectedUnit} • Total: {item.totalPieces} Pcs
                    </div>
                  </div>

                  {/* Quantity adjustment & Remove */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => updateCartQty(item.id, item.quantity - 1)}
                      className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center text-xs font-bold text-slate-900">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateCartQty(item.id, item.quantity + 1)}
                      className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                    <div className="w-16 text-right font-bold text-xs text-slate-900">
                      {settings.currency}{item.lineTotal.toFixed(2)}
                    </div>
                    <button
                      onClick={() => removeCartItem(item.id)}
                      className="p-1 hover:text-rose-600 text-slate-400 ml-1 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Subtotal & Discount Area */}
          <div className="p-3 bg-slate-50 border-t border-slate-200 space-y-2">
            {/* Customer Picker (Optional) */}
            <div className="flex items-center justify-between text-xs gap-2">
              <span className="text-slate-600 font-medium flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-400" /> Customer (Optional):
              </span>
              <select
                value={selectedCustomerId}
                onChange={e => setSelectedCustomerId(e.target.value)}
                className="text-xs bg-white border border-slate-300 rounded-lg px-2 py-1 max-w-[200px]"
              >
                <option value="">Walking Customer</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.mobile}) {c.dueBalance > 0 ? `[Due: ${settings.currency}${c.dueBalance}]` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Whole-Memo Discount Configuration */}
            <div className="flex items-center justify-between text-xs gap-2">
              <span className="text-slate-600 font-medium flex items-center gap-1">
                <Percent className="w-3.5 h-3.5 text-slate-400" /> Discount:
              </span>
              <div className="flex items-center gap-1.5">
                <select
                  value={discountType}
                  onChange={e => setDiscountType(e.target.value as any)}
                  className="text-xs bg-white border border-slate-300 rounded-lg px-1.5 py-1"
                >
                  <option value="fixed">Fixed ({settings.currency})</option>
                  <option value="percentage">% Percent</option>
                </select>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={discountValue || ''}
                  onChange={e => setDiscountValue(parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className="w-16 bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs text-right"
                />
              </div>
            </div>

            {/* Financial Summary */}
            <div className="pt-2 border-t border-slate-200 space-y-1 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-semibold">{settings.currency}{subtotal.toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span>Discount:</span>
                  <span>-{settings.currency}{discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-black text-slate-900 pt-1 border-t border-dashed border-slate-300">
                <span>Grand Total:</span>
                <span className="text-teal-700">{settings.currency}{grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Multi-Payment Methods */}
            <div className="pt-2 border-t border-slate-200">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-bold text-slate-700">Payment Breakdown:</span>
                <div className="flex gap-1.5">
                  <button
                    onClick={handleQuickPayFullCash}
                    className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded hover:bg-emerald-200"
                  >
                    All Cash
                  </button>
                  <button
                    onClick={handleQuickPayFullOnline}
                    className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-800 font-bold rounded hover:bg-blue-200"
                  >
                    All Online
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[10px] text-slate-500 font-medium">Cash Paid ({settings.currency}):</label>
                  <input
                    type="number"
                    min="0"
                    value={cashAmount || ''}
                    onChange={e => setCashAmount(parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs font-bold text-slate-800"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 font-medium">Online / bKash / Card:</label>
                  <input
                    type="number"
                    min="0"
                    value={onlineAmount || ''}
                    onChange={e => setOnlineAmount(parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs font-bold text-slate-800"
                  />
                </div>
              </div>

              <div className="mt-2 flex items-center justify-between text-xs">
                <span className="text-slate-600">Total Paid: <strong className="text-slate-900">{settings.currency}{totalPaid.toFixed(2)}</strong></span>
                {remainingDue > 0 ? (
                  <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                    Remaining Due: {settings.currency}{remainingDue.toFixed(2)}
                  </span>
                ) : (
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Full Paid
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex gap-2">
              <button
                onClick={() => handleCompleteSale(false)}
                className={`flex-1 py-3 rounded-xl font-bold text-sm border shadow-sm flex items-center justify-center gap-1.5 transition active:scale-98 ${
                  isDark
                    ? 'bg-white text-black border-white hover:bg-neutral-200'
                    : 'bg-black text-white border-black hover:bg-neutral-800'
                }`}
              >
                <CheckCircle className="w-4 h-4" />
                <span>Save &amp; Print Memo</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- Product Information Popup Modal (When Barcode is scanned) --- */}
      {selectedMedForPopup && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`rounded-3xl max-w-sm w-full p-5 shadow-2xl border flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150 ${
            isDark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-white border-neutral-200 text-black'
          }`}>
            <div className="flex items-start justify-between">
              <div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                  isDark ? 'bg-neutral-900 border-neutral-700 text-neutral-300' : 'bg-neutral-100 border-neutral-300 text-neutral-700'
                }`}>
                  {selectedMedForPopup.category}
                </span>
                <h3 className="text-base font-extrabold mt-1">
                  {selectedMedForPopup.name}
                </h3>
                <p className={`text-xs ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>{selectedMedForPopup.genericName}</p>
                <p className={`text-[11px] font-semibold mt-0.5 ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>{selectedMedForPopup.company}</p>
              </div>
              <button
                onClick={() => setSelectedMedForPopup(null)}
                className={`p-1 rounded-full ${isDark ? 'text-neutral-400 hover:text-white' : 'text-neutral-500 hover:text-black'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Available stock & Multi-Batch */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs flex items-center justify-between">
              <div>
                <span className="text-slate-500 text-[11px]">Available Stock:</span>
                <div className="text-sm font-extrabold text-slate-800">
                  {selectedMedForPopup.stockInPieces} Pieces
                </div>
              </div>
              <div className="text-right">
                <span className="text-slate-500 text-[11px]">Barcode:</span>
                <div className="font-mono text-xs font-bold text-slate-700">{selectedMedForPopup.barcode}</div>
              </div>
            </div>

            {/* Unit Selection: Piece, Strip, Box */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Select Unit (Base: Piece):
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['piece', 'strip', 'box'] as UnitType[]).map(unit => {
                  const mult = getUnitMultiplier(unit, selectedMedForPopup);
                  const price = getUnitPrice(unit, selectedMedForPopup);
                  const isSelected = popupUnit === unit;
                  return (
                    <button
                      key={unit}
                      type="button"
                      onClick={() => setPopupUnit(unit)}
                      className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-center ${
                        isSelected
                          ? 'border-teal-600 bg-teal-50 text-teal-900 font-bold shadow-xs'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-xs uppercase font-extrabold">{unit}</span>
                      <span className="text-[10px] text-slate-500 mt-0.5">({mult} pcs)</span>
                      <span className="text-[11px] font-bold text-teal-700 mt-1">
                        {settings.currency}{price.toFixed(2)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity Input */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Quantity in {popupUnit.toUpperCase()}:
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPopupQuantity(Math.max(1, popupQuantity - 1))}
                  className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold text-slate-700 text-base"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  value={popupQuantity}
                  onChange={e => setPopupQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="flex-1 py-2 text-center text-base font-extrabold bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500"
                />
                <button
                  type="button"
                  onClick={() => setPopupQuantity(popupQuantity + 1)}
                  className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold text-slate-700 text-base"
                >
                  +
                </button>
              </div>
            </div>

            {/* Total Calculation */}
            <div className="p-3 bg-teal-50/70 border border-teal-200 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[11px] text-teal-800">Calculated Line Total:</span>
                <div className="text-xs text-teal-700 font-medium">
                  {popupQuantity} {popupUnit} = {popupQuantity * getUnitMultiplier(popupUnit, selectedMedForPopup)} Pcs
                </div>
              </div>
              <div className="text-lg font-black text-teal-800">
                {settings.currency}
                {(getUnitPrice(popupUnit, selectedMedForPopup) * popupQuantity).toFixed(2)}
              </div>
            </div>

            {/* Actions: Add Cart and Cancel */}
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setSelectedMedForPopup(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddToCartFromPopup}
                className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs shadow transition active:scale-95"
              >
                Add Cart
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Outstanding Due Customer Info Registration Popup --- */}
      {showCustomerDueModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl flex flex-col gap-3">
            <div className="flex items-center gap-2 text-amber-600 font-bold text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>Outstanding Due: Customer Required</span>
            </div>
            <p className="text-xs text-slate-600">
              This memo has an outstanding due of <strong>{settings.currency}{remainingDue.toFixed(2)}</strong>.
              Please record customer details to track their ledger.
            </p>

            <div className="space-y-2 text-xs">
              <div>
                <label className="text-[11px] text-slate-600 font-semibold">Customer Name *</label>
                <input
                  type="text"
                  value={newCustomerName}
                  onChange={e => setNewCustomerName(e.target.value)}
                  placeholder="e.g. Kalam Mia"
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-600 font-semibold">Mobile Number *</label>
                <input
                  type="text"
                  value={newCustomerMobile}
                  onChange={e => setNewCustomerMobile(e.target.value)}
                  placeholder="017xxxxxxxx"
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-600 font-semibold">Address</label>
                <input
                  type="text"
                  value={newCustomerAddress}
                  onChange={e => setNewCustomerAddress(e.target.value)}
                  placeholder="Area / Village / City"
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowCustomerDueModal(false)}
                className="flex-1 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!newCustomerName || !newCustomerMobile) {
                    alert('Please enter customer name and mobile.');
                    return;
                  }
                  const newCust: Customer = {
                    id: 'cust-' + Date.now(),
                    customerId: `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
                    name: newCustomerName,
                    mobile: newCustomerMobile,
                    address: newCustomerAddress || 'Local Area',
                    dueBalance: 0,
                    createdAt: new Date().toISOString()
                  };
                  StorageService.saveCustomer(newCust);
                  setSelectedCustomerId(newCust.id);
                  setShowCustomerDueModal(false);
                  // Now proceed with sale
                  setTimeout(() => handleCompleteSale(true), 100);
                }}
                className="flex-1 py-2 bg-teal-600 text-white font-bold rounded-xl text-xs hover:bg-teal-700"
              >
                Save &amp; Proceed
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Real Camera / USB / BT Barcode Scanner Modal --- */}
      <CameraBarcodeScannerModal
        isOpen={showCameraScanner}
        onClose={() => {
          setShowCameraScanner(false);
          setNotFoundBarcode(null);
        }}
        onBarcodeDetected={handleBarcodeScanned}
        medicines={medicines}
        notFoundBarcode={notFoundBarcode}
        onClearNotFound={() => setNotFoundBarcode(null)}
        onAddNewMedicineWithBarcode={barcode => {
          setShowCameraScanner(false);
          setNotFoundBarcode(null);
          onNavigateMedicine?.(barcode);
        }}
      />
    </div>
  );
};
