/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Receipt,
  FileText,
  Search,
  Printer,
  Calendar,
  CreditCard,
  User,
  Truck
} from 'lucide-react';
import { SaleTransaction, PurchaseTransaction, AppSettings } from '../../types/pharmacy';
import { StorageService } from '../../services/storage';

interface HistoryScreenProps {
  settings: AppSettings;
  onBack: () => void;
  onOpenReceipt?: (sale: SaleTransaction) => void;
}

export const SalesHistoryScreen: React.FC<HistoryScreenProps> = ({ settings, onBack, onOpenReceipt }) => {
  const [sales, setSales] = useState<SaleTransaction[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'partial' | 'due'>('all');

  useEffect(() => {
    setSales(StorageService.getSales());
  }, []);

  const filtered = sales.filter(s => {
    const matchesSearch =
      s.invoiceNo.toLowerCase().includes(search.toLowerCase()) ||
      (s.customerName && s.customerName.toLowerCase().includes(search.toLowerCase())) ||
      (s.customerMobile && s.customerMobile.includes(search));
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const isDark = settings.theme === 'dark';

  return (
    <div className={`min-h-full flex flex-col pb-20 ${isDark ? 'bg-black text-white' : 'bg-neutral-100 text-black'}`}>
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
            <h1 className="text-base font-bold tracking-tight">Sales History</h1>
            <p className={`text-[11px] ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
              Retail Sales Memos &amp; Thermal Receipts
            </p>
          </div>
        </div>
        <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-full border ${
          isDark ? 'bg-neutral-900 border-neutral-800 text-neutral-300' : 'bg-neutral-100 border-neutral-300 text-neutral-700'
        }`}>
          {sales.length} Invoices
        </span>
      </div>

      <div className="p-4 space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search invoice number, customer name or phone..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 shadow-xs"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto text-xs pb-1">
          {(['all', 'paid', 'partial', 'due'] as const).map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-full font-semibold uppercase text-[11px] transition ${
                statusFilter === st
                  ? 'bg-indigo-700 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="space-y-2.5">
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
              <Receipt className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-xs font-medium">No sales memos found.</p>
            </div>
          ) : (
            filtered.map(s => (
              <div
                key={s.id}
                className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-slate-900">{s.invoiceNo}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${
                        s.status === 'paid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : s.status === 'partial'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {s.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    {new Date(s.date).toLocaleDateString()} {new Date(s.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Customer: <strong>{s.customerName}</strong>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {s.items.length} Medicines ({s.items.reduce((sum, i) => sum + i.totalPieces, 0)} Pcs) • Paid: {settings.currency}{s.paidAmount.toFixed(2)}
                  </div>
                </div>

                <div className="text-right flex flex-col items-end gap-1.5">
                  <div className="text-sm font-black text-slate-900">
                    {settings.currency}{s.grandTotal.toFixed(2)}
                  </div>
                  {onOpenReceipt && (
                    <button
                      onClick={() => onOpenReceipt(s)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 text-indigo-700 border border-slate-200 rounded-lg text-xs font-bold flex items-center gap-1 transition"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Reprint</span>
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export const PurchaseHistoryScreen: React.FC<HistoryScreenProps> = ({ settings, onBack }) => {
  const [purchases, setPurchases] = useState<PurchaseTransaction[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setPurchases(StorageService.getPurchases());
  }, []);

  const filtered = purchases.filter(p =>
    p.invoiceNo.toLowerCase().includes(search.toLowerCase()) ||
    p.supplierName.toLowerCase().includes(search.toLowerCase()) ||
    p.companyName.toLowerCase().includes(search.toLowerCase())
  );

  const isDark = settings.theme === 'dark';

  return (
    <div className={`min-h-full flex flex-col pb-20 ${isDark ? 'bg-black text-white' : 'bg-neutral-100 text-black'}`}>
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
            <h1 className="text-base font-bold tracking-tight">Purchase History</h1>
            <p className={`text-[11px] ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
              Supplier Invoices &amp; Inward Stock
            </p>
          </div>
        </div>
        <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-full border ${
          isDark ? 'bg-neutral-900 border-neutral-800 text-neutral-300' : 'bg-neutral-100 border-neutral-300 text-neutral-700'
        }`}>
          {purchases.length} Invoices
        </span>
      </div>

      <div className="p-4 space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search supplier, company or invoice #..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 shadow-xs"
          />
        </div>

        <div className="space-y-2.5">
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
              <FileText className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-xs font-medium">No purchase invoices found.</p>
            </div>
          ) : (
            filtered.map(p => (
              <div
                key={p.id}
                className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-slate-900">{p.invoiceNo}</span>
                    <span className="text-xs font-bold text-orange-800">{p.companyName}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    {new Date(p.date).toLocaleDateString()} • Supplier: <strong>{p.supplierName}</strong>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {p.items.length} Medicines ({p.items.reduce((sum, i) => sum + i.totalPieces, 0)} Pcs inward)
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-black text-slate-900">
                    {settings.currency}{p.totalBill.toFixed(2)}
                  </div>
                  <div className="text-[11px] text-emerald-700 font-semibold">
                    Paid: {settings.currency}{p.paidAmount.toFixed(2)}
                  </div>
                  {p.remainingDue > 0 && (
                    <span className="text-[10px] font-bold text-rose-600 block mt-0.5">
                      Due: {settings.currency}{p.remainingDue.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
