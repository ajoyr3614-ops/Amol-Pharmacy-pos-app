/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Building2,
  Plus,
  Search,
  FileText,
  CreditCard,
  X,
  CheckCircle,
  Truck
} from 'lucide-react';
import { Supplier, SupplierPayment, AppSettings, PurchaseTransaction } from '../../types/pharmacy';
import { StorageService } from '../../services/storage';

interface SupplierScreenProps {
  settings: AppSettings;
  onBack: () => void;
  onNavigateNewPurchase: () => void;
}

export const SupplierScreen: React.FC<SupplierScreenProps> = ({ settings, onBack, onNavigateNewPurchase }) => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [purchases, setPurchases] = useState<PurchaseTransaction[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Active Supplier for Ledger / Statement View
  const [activeSupplier, setActiveSupplier] = useState<Supplier | null>(null);

  // Add Supplier Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');

  // Payment to Supplier Modal
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<'cash' | 'online'>('cash');
  const [payNotes, setPayNotes] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setSuppliers(StorageService.getSuppliers());
    setPurchases(StorageService.getPurchases());
  };

  const handleSaveSupplier = () => {
    if (!name.trim() || !companyName.trim()) {
      alert('Supplier name and company name are required.');
      return;
    }

    const newSup: Supplier = {
      id: 'sup-' + Date.now(),
      name: name.trim(),
      companyName: companyName.trim(),
      mobile: mobile.trim(),
      address: address.trim() || 'Dhaka',
      totalBill: 0,
      totalPaid: 0,
      remainingDue: 0,
      createdAt: new Date().toISOString()
    };

    StorageService.saveSupplier(newSup);
    setShowAddModal(false);
    setName('');
    setCompanyName('');
    setMobile('');
    setAddress('');
    loadData();
  };

  const handleRecordPayment = () => {
    if (!activeSupplier || payAmount <= 0) return;

    const payment: SupplierPayment = {
      id: 'sp-' + Date.now(),
      supplierId: activeSupplier.id,
      date: new Date().toISOString(),
      amount: payAmount,
      paymentMethod: payMethod,
      notes: payNotes
    };

    StorageService.recordSupplierPayment(payment);
    setShowPaymentModal(false);
    setPayAmount(0);
    setPayNotes('');
    loadData();

    const updated = StorageService.getSuppliers().find(s => s.id === activeSupplier.id);
    if (updated) setActiveSupplier(updated);
  };

  const supplierPurchases = activeSupplier
    ? purchases.filter(p => p.supplierId === activeSupplier.id)
    : [];

  const supplierPayments = activeSupplier
    ? StorageService.getSupplierPayments(activeSupplier.id)
    : [];

  const filtered = suppliers.filter(
    s =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.mobile.includes(searchQuery)
  );

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
            <h1 className="text-base font-bold tracking-tight">Supplier Management</h1>
            <p className={`text-[11px] ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
              Transaction-Based Ledger &amp; Statements
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs border shadow-xs transition active:scale-95 ${
            isDark ? 'bg-white text-black border-white hover:bg-neutral-200' : 'bg-black text-white border-black hover:bg-neutral-800'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>Add Supplier</span>
        </button>
      </div>

      <div className="p-4 space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search supplier by name, company or mobile..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-cyan-500 shadow-xs"
          />
        </div>

        {/* Supplier Cards */}
        <div className="space-y-2.5">
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
              <Building2 className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-xs font-medium">No suppliers recorded.</p>
            </div>
          ) : (
            filtered.map(sup => (
              <div
                key={sup.id}
                onClick={() => setActiveSupplier(sup)}
                className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between cursor-pointer hover:border-cyan-300 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-800 font-bold flex items-center justify-center text-sm">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">{sup.name}</div>
                    <div className="text-[11px] text-cyan-700 font-semibold">{sup.companyName}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{sup.mobile} • {sup.address}</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-bold text-slate-900">
                    Bills: {settings.currency}{sup.totalBill.toFixed(2)}
                  </div>
                  {sup.remainingDue > 0 ? (
                    <div className="text-xs font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 mt-1">
                      Due: {settings.currency}{sup.remainingDue.toFixed(2)}
                    </div>
                  ) : (
                    <div className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 mt-1">
                      Paid Up
                    </div>
                  )}
                  <span className="text-[10px] text-cyan-700 font-medium underline mt-1 block">
                    Statement
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* --- Supplier Statement / Ledger Modal --- */}
      {activeSupplier && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 bg-gradient-to-r from-cyan-700 to-blue-800 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">{activeSupplier.name}</h3>
                <p className="text-xs text-cyan-100">{activeSupplier.companyName} • {activeSupplier.mobile}</p>
              </div>
              <button
                onClick={() => setActiveSupplier(null)}
                className="p-1 text-white hover:bg-white/20 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3.5 text-xs">
              {/* Ledger Summary */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] text-slate-500 font-medium">Total Invoiced</span>
                  <div className="text-xs font-extrabold text-slate-800 mt-0.5">
                    {settings.currency}{activeSupplier.totalBill.toFixed(2)}
                  </div>
                </div>
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <span className="text-[10px] text-emerald-700 font-medium">Total Paid</span>
                  <div className="text-xs font-extrabold text-emerald-800 mt-0.5">
                    {settings.currency}{activeSupplier.totalPaid.toFixed(2)}
                  </div>
                </div>
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl">
                  <span className="text-[10px] text-rose-700 font-medium">Remaining Due</span>
                  <div className="text-xs font-black text-rose-700 mt-0.5">
                    {settings.currency}{activeSupplier.remainingDue.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Pay Supplier Button */}
              {activeSupplier.remainingDue > 0 && (
                <button
                  onClick={() => setShowPaymentModal(true)}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Pay Supplier ({settings.currency}{activeSupplier.remainingDue.toFixed(2)})</span>
                </button>
              )}

              {/* Purchase Bills History */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <span className="font-bold text-slate-800 block text-xs">Purchase Invoices ({supplierPurchases.length})</span>
                {supplierPurchases.length === 0 ? (
                  <p className="text-[11px] text-slate-400">No purchase invoices from this supplier.</p>
                ) : (
                  supplierPurchases.map(p => (
                    <div key={p.id} className="p-2 bg-white rounded-lg border border-slate-200 flex justify-between">
                      <div>
                        <div className="font-bold font-mono text-slate-800">{p.invoiceNo}</div>
                        <div className="text-[10px] text-slate-400">{new Date(p.date).toLocaleDateString()}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{settings.currency}{p.totalBill.toFixed(2)}</div>
                        <div className="text-[10px] text-slate-500">Paid: {settings.currency}{p.paidAmount.toFixed(2)}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Payment Records */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <span className="font-bold text-slate-800 block text-xs">Payment Disbursements</span>
                {supplierPayments.length === 0 ? (
                  <p className="text-[11px] text-slate-400">No disbursements recorded yet.</p>
                ) : (
                  supplierPayments.map(pay => (
                    <div key={pay.id} className="p-2 bg-white rounded-lg border border-slate-200 flex justify-between">
                      <div>
                        <div className="font-bold text-emerald-700">{settings.currency}{pay.amount.toFixed(2)} ({pay.paymentMethod.toUpperCase()})</div>
                        <div className="text-[10px] text-slate-400">{new Date(pay.date).toLocaleDateString()} • {pay.notes || 'Payment'}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- Add Supplier Modal --- */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl space-y-3">
            <h3 className="font-bold text-sm text-slate-900">Add New Supplier</h3>
            <div className="space-y-2 text-xs">
              <div>
                <label className="text-slate-600 font-semibold block mb-1">Supplier Representative *</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Beximco Pharma Depot"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                />
              </div>
              <div>
                <label className="text-slate-600 font-semibold block mb-1">Company Name *</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  placeholder="e.g. Beximco Pharmaceuticals"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                />
              </div>
              <div>
                <label className="text-slate-600 font-semibold block mb-1">Mobile Number</label>
                <input
                  type="text"
                  value={mobile}
                  onChange={e => setMobile(e.target.value)}
                  placeholder="017xxxxxxxx"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>
              <div>
                <label className="text-slate-600 font-semibold block mb-1">Depot / Office Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="Area / Road / City"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSupplier}
                className="flex-1 py-2 bg-cyan-700 text-white font-bold rounded-xl text-xs hover:bg-cyan-800"
              >
                Save Supplier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Disburse Payment Modal --- */}
      {showPaymentModal && activeSupplier && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl space-y-3">
            <h3 className="font-bold text-sm text-slate-900">Record Supplier Payment</h3>
            <p className="text-xs text-slate-600">
              Supplier: <strong>{activeSupplier.name}</strong> (Due: <strong>{settings.currency}{activeSupplier.remainingDue.toFixed(2)}</strong>)
            </p>

            <div className="space-y-2 text-xs">
              <div>
                <label className="text-slate-600 font-semibold block mb-1">Amount Paid ({settings.currency}):</label>
                <input
                  type="number"
                  min="1"
                  max={activeSupplier.remainingDue}
                  value={payAmount || ''}
                  onChange={e => setPayAmount(parseFloat(e.target.value) || 0)}
                  placeholder="Enter amount..."
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-base"
                />
              </div>
              <div>
                <label className="text-slate-600 font-semibold block mb-1">Payment Method:</label>
                <select
                  value={payMethod}
                  onChange={e => setPayMethod(e.target.value as any)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                >
                  <option value="cash">Cash</option>
                  <option value="online">Bank / Cheque / Online</option>
                </select>
              </div>
              <div>
                <label className="text-slate-600 font-semibold block mb-1">Note (Optional):</label>
                <input
                  type="text"
                  value={payNotes}
                  onChange={e => setPayNotes(e.target.value)}
                  placeholder="e.g. Money Receipt #55"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleRecordPayment}
                className="flex-1 py-2 bg-emerald-600 text-white font-bold rounded-xl text-xs hover:bg-emerald-700"
              >
                Confirm Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
