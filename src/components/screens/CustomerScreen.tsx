/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Users,
  Plus,
  Search,
  Phone,
  MapPin,
  CreditCard,
  History,
  X,
  Camera,
  CheckCircle,
  FileText
} from 'lucide-react';
import { Customer, CustomerPayment, AppSettings, SaleTransaction } from '../../types/pharmacy';
import { StorageService } from '../../services/storage';

interface CustomerScreenProps {
  settings: AppSettings;
  onBack: () => void;
}

export const CustomerScreen: React.FC<CustomerScreenProps> = ({ settings, onBack }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [sales, setSales] = useState<SaleTransaction[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Customer for Profile View
  const [activeCustomer, setActiveCustomer] = useState<Customer | null>(null);

  // Add / Edit Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  // Payment Collection Modal
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'online'>('cash');
  const [paymentNotes, setPaymentNotes] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setCustomers(StorageService.getCustomers());
    setSales(StorageService.getSales());
  };

  const handleSaveCustomer = () => {
    if (!name.trim() || !mobile.trim()) {
      alert('Name and mobile number are required.');
      return;
    }

    const newCust: Customer = {
      id: 'cust-' + Date.now(),
      customerId: `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
      name: name.trim(),
      mobile: mobile.trim(),
      address: address.trim() || 'Local Area',
      dueBalance: 0, // No opening balance as per prompt rule
      notes: notes.trim(),
      createdAt: new Date().toISOString()
    };

    StorageService.saveCustomer(newCust);
    setShowAddModal(false);
    setName('');
    setMobile('');
    setAddress('');
    setNotes('');
    loadData();
  };

  const handleRecordPayment = () => {
    if (!activeCustomer || paymentAmount <= 0) return;

    const payment: CustomerPayment = {
      id: 'cp-' + Date.now(),
      customerId: activeCustomer.id,
      date: new Date().toISOString(),
      amount: paymentAmount,
      paymentMethod,
      notes: paymentNotes
    };

    StorageService.recordCustomerPayment(payment);
    setShowPaymentModal(false);
    setPaymentAmount(0);
    setPaymentNotes('');
    loadData();
    // Update active customer reference
    const updated = StorageService.getCustomers().find(c => c.id === activeCustomer.id);
    if (updated) setActiveCustomer(updated);
  };

  // Customer sales and payments
  const customerSales = activeCustomer
    ? sales.filter(s => s.customerId === activeCustomer.id)
    : [];

  const customerPayments = activeCustomer
    ? StorageService.getCustomerPayments(activeCustomer.id)
    : [];

  const totalCustomerPurchases = customerSales.reduce((sum, s) => sum + s.grandTotal, 0);
  const totalCustomerPaid = customerSales.reduce((sum, s) => sum + s.paidAmount, 0) +
    customerPayments.reduce((sum, p) => sum + p.amount, 0);

  const filtered = customers.filter(
    c =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.mobile.includes(searchQuery) ||
      c.customerId.toLowerCase().includes(searchQuery.toLowerCase())
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
            <h1 className="text-base font-bold tracking-tight">Customer Management</h1>
            <p className={`text-[11px] ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
              Profiles, Dues &amp; Payment Collections
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
          <span>Add Customer</span>
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
            placeholder="Search customer by name, mobile or ID..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 shadow-xs"
          />
        </div>

        {/* Customer List */}
        <div className="space-y-2.5">
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
              <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-xs font-medium">No customers found.</p>
            </div>
          ) : (
            filtered.map(c => (
              <div
                key={c.id}
                onClick={() => setActiveCustomer(c)}
                className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between cursor-pointer hover:border-purple-300 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-sm">
                    {c.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900">{c.name}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded">
                        {c.customerId}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                      <span>{c.mobile}</span> • <span>{c.address}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  {c.dueBalance > 0 ? (
                    <div className="text-xs font-extrabold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                      Due: {settings.currency}{c.dueBalance.toFixed(2)}
                    </div>
                  ) : (
                    <div className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Clear
                    </div>
                  )}
                  <span className="text-[10px] text-purple-600 font-medium underline mt-1 block">
                    View Profile
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* --- Customer Profile / Ledger Modal --- */}
      {activeCustomer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 bg-gradient-to-r from-purple-700 to-indigo-800 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">{activeCustomer.name}</h3>
                <p className="text-xs text-purple-100 font-mono">
                  {activeCustomer.customerId} • {activeCustomer.mobile}
                </p>
              </div>
              <button
                onClick={() => setActiveCustomer(null)}
                className="p-1 text-white hover:bg-white/20 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3.5 text-xs">
              {/* Profile Metrics Summary */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] text-slate-500 font-medium">Total Purchase</span>
                  <div className="text-xs font-extrabold text-slate-800 mt-0.5">
                    {settings.currency}{totalCustomerPurchases.toFixed(2)}
                  </div>
                </div>
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <span className="text-[10px] text-emerald-700 font-medium">Total Paid</span>
                  <div className="text-xs font-extrabold text-emerald-800 mt-0.5">
                    {settings.currency}{totalCustomerPaid.toFixed(2)}
                  </div>
                </div>
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl">
                  <span className="text-[10px] text-rose-700 font-medium">Remaining Due</span>
                  <div className="text-xs font-black text-rose-700 mt-0.5">
                    {settings.currency}{activeCustomer.dueBalance.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Payment Collection Button */}
              {activeCustomer.dueBalance > 0 && (
                <button
                  onClick={() => setShowPaymentModal(true)}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Collect Payment ({settings.currency}{activeCustomer.dueBalance.toFixed(2)})</span>
                </button>
              )}

              {/* Purchase History */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <span className="font-bold text-slate-800 block text-xs">Purchase History ({customerSales.length})</span>
                {customerSales.length === 0 ? (
                  <p className="text-[11px] text-slate-400">No purchases found for this customer.</p>
                ) : (
                  customerSales.map(s => (
                    <div key={s.id} className="p-2 bg-white rounded-lg border border-slate-200 flex justify-between">
                      <div>
                        <div className="font-bold font-mono text-slate-800">{s.invoiceNo}</div>
                        <div className="text-[10px] text-slate-400">{new Date(s.date).toLocaleDateString()}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{settings.currency}{s.grandTotal.toFixed(2)}</div>
                        <div className="text-[10px] text-slate-500">Paid: {settings.currency}{s.paidAmount.toFixed(2)}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Payment History */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <span className="font-bold text-slate-800 block text-xs">Due Payment Collections</span>
                {customerPayments.length === 0 ? (
                  <p className="text-[11px] text-slate-400">No standalone payment collections yet.</p>
                ) : (
                  customerPayments.map(p => (
                    <div key={p.id} className="p-2 bg-white rounded-lg border border-slate-200 flex justify-between">
                      <div>
                        <div className="font-bold text-emerald-700">{settings.currency}{p.amount.toFixed(2)} ({p.paymentMethod.toUpperCase()})</div>
                        <div className="text-[10px] text-slate-400">{new Date(p.date).toLocaleDateString()} • {p.notes || 'Routine Collection'}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- Add Customer Modal --- */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl space-y-3">
            <h3 className="font-bold text-sm text-slate-900">Add New Customer</h3>
            <p className="text-xs text-slate-500">Automatic Customer ID will be generated.</p>

            <div className="space-y-2 text-xs">
              <div>
                <label className="text-slate-600 font-semibold block mb-1">Customer Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Kalam Mia"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>
              <div>
                <label className="text-slate-600 font-semibold block mb-1">Mobile Number *</label>
                <input
                  type="text"
                  value={mobile}
                  onChange={e => setMobile(e.target.value)}
                  placeholder="017xxxxxxxx"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>
              <div>
                <label className="text-slate-600 font-semibold block mb-1">Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="Street / Area / Market"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>
              <div>
                <label className="text-slate-600 font-semibold block mb-1">Notes</label>
                <input
                  type="text"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Optional customer notes..."
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
                onClick={handleSaveCustomer}
                className="flex-1 py-2 bg-purple-700 text-white font-bold rounded-xl text-xs hover:bg-purple-800"
              >
                Save Customer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Collect Payment Modal --- */}
      {showPaymentModal && activeCustomer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl space-y-3">
            <h3 className="font-bold text-sm text-slate-900">Collect Due Payment</h3>
            <p className="text-xs text-slate-600">
              Customer: <strong>{activeCustomer.name}</strong> (Due: <strong>{settings.currency}{activeCustomer.dueBalance.toFixed(2)}</strong>)
            </p>

            <div className="space-y-2 text-xs">
              <div>
                <label className="text-slate-600 font-semibold block mb-1">Amount to Collect ({settings.currency}):</label>
                <input
                  type="number"
                  min="1"
                  max={activeCustomer.dueBalance}
                  value={paymentAmount || ''}
                  onChange={e => setPaymentAmount(parseFloat(e.target.value) || 0)}
                  placeholder="Enter amount..."
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-base"
                />
              </div>
              <div>
                <label className="text-slate-600 font-semibold block mb-1">Payment Method:</label>
                <select
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value as any)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                >
                  <option value="cash">Cash</option>
                  <option value="online">Online / bKash / Card</option>
                </select>
              </div>
              <div>
                <label className="text-slate-600 font-semibold block mb-1">Note (Optional):</label>
                <input
                  type="text"
                  value={paymentNotes}
                  onChange={e => setPaymentNotes(e.target.value)}
                  placeholder="e.g. Receipt #12 or bKash TrxID"
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
