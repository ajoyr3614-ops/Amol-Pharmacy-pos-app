/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Truck,
  Plus,
  Trash2,
  CheckCircle,
  Building2,
  Calendar,
  DollarSign
} from 'lucide-react';
import {
  Medicine,
  Supplier,
  PurchaseItem,
  PurchaseTransaction,
  AppSettings,
  UnitType
} from '../../types/pharmacy';
import { StorageService } from '../../services/storage';

interface PurchaseScreenProps {
  settings: AppSettings;
  onBack: () => void;
  onNavigateHistory: () => void;
}

export const PurchaseScreen: React.FC<PurchaseScreenProps> = ({ settings, onBack, onNavigateHistory }) => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);

  // Purchase Form
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [invoiceNo, setInvoiceNo] = useState(`PUR-${Date.now().toString().slice(-6)}`);
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);

  // Item List in Purchase
  const [items, setItems] = useState<PurchaseItem[]>([]);

  // Add Item Temp State
  const [selectedMedId, setSelectedMedId] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState(new Date(Date.now() + 86400000 * 365).toISOString().split('T')[0]);
  const [itemUnit, setItemUnit] = useState<UnitType>('box');
  const [quantity, setQuantity] = useState(5);
  const [costPerPiece, setCostPerPiece] = useState(2.0);

  // Payment Breakdown
  const [cashPaid, setCashPaid] = useState<number>(0);
  const [onlinePaid, setOnlinePaid] = useState<number>(0);

  useEffect(() => {
    setSuppliers(StorageService.getSuppliers());
    const meds = StorageService.getMedicines();
    setMedicines(meds);
    if (meds.length > 0) {
      setSelectedMedId(meds[0].id);
      setCostPerPiece(meds[0].purchasePricePerPiece);
    }
  }, []);

  const selectedSupplier = suppliers.find(s => s.id === selectedSupplierId);
  const selectedMed = medicines.find(m => m.id === selectedMedId);

  const getMultiplier = (unit: UnitType, med?: Medicine): number => {
    if (!med) return 1;
    if (unit === 'strip') return med.conversion.piecesPerStrip || 10;
    if (unit === 'box') return med.conversion.piecesPerBox || 100;
    return 1;
  };

  const handleAddItem = () => {
    if (!selectedMed) return;
    const mult = getMultiplier(itemUnit, selectedMed);
    const totalPieces = quantity * mult;
    const lineTotal = totalPieces * costPerPiece;

    const newItem: PurchaseItem = {
      medicineId: selectedMed.id,
      medicineName: selectedMed.name,
      batchNumber: batchNumber.trim() || `B-${Date.now().toString().slice(-4)}`,
      expiryDate,
      unit: itemUnit,
      quantity,
      totalPieces,
      costPerPiece,
      lineTotal
    };

    setItems([...items, newItem]);
    setBatchNumber('');
  };

  const removeItem = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  const totalBill = items.reduce((sum, i) => sum + i.lineTotal, 0);
  const totalPaid = cashPaid + onlinePaid;
  const remainingDue = Math.max(0, totalBill - totalPaid);

  const handleCompletePurchase = () => {
    if (!selectedSupplierId) {
      alert('Please select a supplier.');
      return;
    }
    if (items.length === 0) {
      alert('Please add at least one medicine item to the purchase invoice.');
      return;
    }

    const purchase: PurchaseTransaction = {
      id: 'pur-' + Date.now(),
      invoiceNo,
      supplierId: selectedSupplier!.id,
      supplierName: selectedSupplier!.name,
      companyName: selectedSupplier!.companyName,
      date: new Date(purchaseDate).toISOString(),
      items,
      totalBill,
      paidAmount: totalPaid,
      remainingDue,
      paymentMethod:
        cashPaid > 0 && onlinePaid > 0
          ? 'partial'
          : cashPaid > 0
          ? 'cash'
          : onlinePaid > 0
          ? 'online'
          : 'credit',
      payments: {
        cash: cashPaid,
        online: onlinePaid,
        due: remainingDue
      },
      status: remainingDue === 0 ? 'paid' : totalPaid > 0 ? 'partial' : 'due',
      notes: ''
    };

    StorageService.processPurchase(purchase);
    alert('Purchase saved! Medicine stock and supplier ledger updated successfully.');
    onNavigateHistory();
  };

  const isDark = settings.theme === 'dark';

  return (
    <div className={`min-h-full flex flex-col pb-20 ${isDark ? 'bg-black text-white' : 'bg-neutral-100 text-black'}`}>
      {/* Header */}
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
            <h1 className="text-base font-bold tracking-tight">Purchase Management</h1>
            <p className={`text-[11px] ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
              Stock Inward &amp; Supplier Ledger
            </p>
          </div>
        </div>

        <button
          onClick={onNavigateHistory}
          className={`text-xs font-bold px-3 py-1.5 rounded-xl border shadow-xs transition active:scale-95 ${
            isDark ? 'bg-neutral-900 border-neutral-700 text-white hover:bg-neutral-800' : 'bg-neutral-100 border-neutral-300 text-black hover:bg-neutral-200'
          }`}
        >
          Purchase History
        </button>
      </div>

      <div className="p-4 space-y-4 max-w-2xl mx-auto w-full">
        {/* Supplier & Invoice Info Card */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
            Supplier &amp; Bill Information
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-slate-600 font-medium block mb-1">Select Supplier *</label>
              <select
                value={selectedSupplierId}
                onChange={e => setSelectedSupplierId(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
              >
                <option value="">-- Choose Supplier --</option>
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.companyName})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-slate-600 font-medium block mb-1">Invoice / Memo No:</label>
              <input
                type="text"
                value={invoiceNo}
                onChange={e => setInvoiceNo(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs"
              />
            </div>

            <div>
              <label className="text-slate-600 font-medium block mb-1">Purchase Date:</label>
              <input
                type="date"
                value={purchaseDate}
                onChange={e => setPurchaseDate(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>

            {selectedSupplier && (
              <div className="p-2 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between">
                <span className="text-amber-900 font-medium">Current Supplier Due:</span>
                <span className="font-extrabold text-amber-800">
                  {settings.currency}{selectedSupplier.remainingDue.toFixed(2)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Add Product to Purchase */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
            Add Medicines to Invoice
          </span>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-600 font-medium block mb-1">Select Medicine:</label>
              <select
                value={selectedMedId}
                onChange={e => {
                  const id = e.target.value;
                  setSelectedMedId(id);
                  const m = medicines.find(med => med.id === id);
                  if (m) setCostPerPiece(m.purchasePricePerPiece);
                }}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
              >
                {medicines.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.genericName}) • Stock: {m.stockInPieces} pcs
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div>
                <label className="text-slate-600 block mb-1">Unit:</label>
                <select
                  value={itemUnit}
                  onChange={e => setItemUnit(e.target.value as any)}
                  className="w-full p-1.5 bg-slate-50 border border-slate-300 rounded-lg uppercase font-bold"
                >
                  <option value="piece">Piece</option>
                  <option value="strip">Strip</option>
                  <option value="box">Box</option>
                </select>
              </div>

              <div>
                <label className="text-slate-600 block mb-1">Quantity:</label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={e => setQuantity(parseInt(e.target.value) || 1)}
                  className="w-full p-1.5 bg-slate-50 border border-slate-300 rounded-lg font-bold text-center"
                />
              </div>

              <div>
                <label className="text-slate-600 block mb-1">Cost / Piece ({settings.currency}):</label>
                <input
                  type="number"
                  step="any"
                  value={costPerPiece}
                  onChange={e => setCostPerPiece(parseFloat(e.target.value) || 0)}
                  className="w-full p-1.5 bg-slate-50 border border-slate-300 rounded-lg font-bold text-teal-700"
                />
              </div>

              <div>
                <label className="text-slate-600 block mb-1">Batch # (Optional):</label>
                <input
                  type="text"
                  value={batchNumber}
                  onChange={e => setBatchNumber(e.target.value)}
                  placeholder="Auto if blank"
                  className="w-full p-1.5 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="text-[11px] text-slate-500">
                Calculated: {quantity} {itemUnit} ={' '}
                <strong>{quantity * getMultiplier(itemUnit, selectedMed)} Pieces</strong> (Line Total:{' '}
                <strong>
                  {settings.currency}
                  {(quantity * getMultiplier(itemUnit, selectedMed) * costPerPiece).toFixed(2)}
                </strong>
                )
              </div>
              <button
                type="button"
                onClick={handleAddItem}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs flex items-center gap-1 shadow-xs"
              >
                <Plus className="w-4 h-4" /> Add Item
              </button>
            </div>
          </div>
        </div>

        {/* Items List */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-3 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-700 flex justify-between">
            <span>Invoice Items ({items.length})</span>
            <span>Total: {settings.currency}{totalBill.toFixed(2)}</span>
          </div>

          <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto">
            {items.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                No medicines added to this purchase bill yet.
              </div>
            ) : (
              items.map((it, idx) => (
                <div key={idx} className="p-3 text-xs flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-800">{it.medicineName}</div>
                    <div className="text-[11px] text-slate-500">
                      {it.quantity} {it.unit} ({it.totalPieces} pcs) • Batch: {it.batchNumber} • Exp: {it.expiryDate}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-extrabold text-slate-900">
                      {settings.currency}{it.lineTotal.toFixed(2)}
                    </span>
                    <button onClick={() => removeItem(idx)} className="text-rose-500 hover:text-rose-700">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Bill Summary & Payment Section */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
            Payment &amp; Supplier Due Allocation
          </span>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-slate-600 font-medium block mb-1">Cash Paid ({settings.currency}):</label>
              <input
                type="number"
                min="0"
                value={cashPaid || ''}
                onChange={e => setCashPaid(parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
              />
            </div>
            <div>
              <label className="text-slate-600 font-medium block mb-1">Online / Bank Transfer:</label>
              <input
                type="number"
                min="0"
                value={onlinePaid || ''}
                onChange={e => setOnlinePaid(parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
              />
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
            <div className="flex justify-between text-slate-600">
              <span>Total Bill Amount:</span>
              <span className="font-bold">{settings.currency}{totalBill.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Total Paid:</span>
              <span className="font-bold text-emerald-700">{settings.currency}{totalPaid.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-extrabold pt-1 border-t border-slate-200">
              <span className="text-rose-700">Remaining Supplier Due:</span>
              <span className="text-rose-700">{settings.currency}{remainingDue.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={handleCompletePurchase}
            className="w-full py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-1.5 transition active:scale-98"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Save Purchase &amp; Update Stock</span>
          </button>
        </div>
      </div>
    </div>
  );
};
