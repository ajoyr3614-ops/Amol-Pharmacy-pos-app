/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  TrendingUp,
  BarChart3,
  Calendar,
  DollarSign,
  Download,
  Layers,
  CreditCard,
  Building2,
  Users
} from 'lucide-react';
import {
  SaleTransaction,
  PurchaseTransaction,
  ExpenseRecord,
  Medicine,
  Customer,
  Supplier,
  AppSettings
} from '../../types/pharmacy';
import { StorageService } from '../../services/storage';

interface ReportsScreenProps {
  settings: AppSettings;
  onBack: () => void;
}

export const ReportsScreen: React.FC<ReportsScreenProps> = ({ settings, onBack }) => {
  const [sales, setSales] = useState<SaleTransaction[]>([]);
  const [purchases, setPurchases] = useState<PurchaseTransaction[]>([]);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  const [reportTab, setReportTab] = useState<'sales' | 'purchase' | 'financial' | 'stock'>('financial');
  const [dateFilter, setDateFilter] = useState<'today' | 'weekly' | 'monthly' | 'yearly' | 'all'>('all');

  useEffect(() => {
    setSales(StorageService.getSales());
    setPurchases(StorageService.getPurchases());
    setExpenses(StorageService.getExpenses());
    setMedicines(StorageService.getMedicines());
    setCustomers(StorageService.getCustomers());
    setSuppliers(StorageService.getSuppliers());
  }, []);

  // Filter sales by date
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  const filterByDate = (dateIso: string) => {
    if (dateFilter === 'all') return true;
    const d = new Date(dateIso);
    if (dateFilter === 'today') return dateIso.startsWith(todayStr);
    if (dateFilter === 'weekly') {
      const oneWeekAgo = new Date(now.getTime() - 7 * 86400000);
      return d >= oneWeekAgo;
    }
    if (dateFilter === 'monthly') {
      const oneMonthAgo = new Date(now.getTime() - 30 * 86400000);
      return d >= oneMonthAgo;
    }
    if (dateFilter === 'yearly') {
      const oneYearAgo = new Date(now.getTime() - 365 * 86400000);
      return d >= oneYearAgo;
    }
    return true;
  };

  const filteredSales = sales.filter(s => filterByDate(s.date));
  const filteredPurchases = purchases.filter(p => filterByDate(p.date));
  const filteredExpenses = expenses.filter(e => filterByDate(e.date));

  // Financial Calculations
  const totalSalesRevenue = filteredSales.reduce((sum, s) => sum + s.grandTotal, 0);
  const totalPurchasesCost = filteredPurchases.reduce((sum, p) => sum + p.totalBill, 0);
  const totalExpenseSum = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Sold Items Cost Calculation for Gross Profit
  let costOfGoodsSold = 0;
  filteredSales.forEach(s => {
    s.items.forEach(it => {
      const med = medicines.find(m => m.id === it.medicineId);
      const costRate = med ? med.purchasePricePerPiece : 0;
      costOfGoodsSold += costRate * it.totalPieces;
    });
  });

  const grossProfit = Math.max(0, totalSalesRevenue - costOfGoodsSold);
  const netProfit = Math.max(0, grossProfit - totalExpenseSum);

  // Cash vs Online Balance Collected
  const totalCashCollected = filteredSales.reduce((sum, s) => sum + (s.payments.cash || 0), 0);
  const totalOnlineCollected = filteredSales.reduce((sum, s) => sum + (s.payments.online || 0), 0);

  // Outstanding Dues
  const totalCustomerDue = customers.reduce((sum, c) => sum + (c.dueBalance || 0), 0);
  const totalSupplierDue = suppliers.reduce((sum, s) => sum + (s.remainingDue || 0), 0);

  // Stock inventory valuation
  const totalStockPieces = medicines.reduce((sum, m) => sum + m.stockInPieces, 0);
  const totalInventoryValuation = medicines.reduce((sum, m) => sum + (m.stockInPieces * m.purchasePricePerPiece), 0);
  const negativeStockItems = medicines.filter(m => m.stockInPieces < 0);
  const lowStockItems = medicines.filter(m => m.stockInPieces > 0 && m.stockInPieces <= (m.minStockAlert || 15));

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
            <h1 className="text-base font-bold tracking-tight">Business Reports</h1>
            <p className={`text-[11px] ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
              Financial &amp; Stock Analytics
            </p>
          </div>
        </div>

        <button
          onClick={() => window.print()}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs border shadow-xs transition active:scale-95 ${
            isDark ? 'bg-white text-black border-white hover:bg-neutral-200' : 'bg-black text-white border-black hover:bg-neutral-800'
          }`}
        >
          <Download className="w-4 h-4" />
          <span>Export / Print</span>
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Navigation Tabs */}
        <div className="grid grid-cols-4 gap-1 bg-white p-1 rounded-2xl border border-slate-200 shadow-xs text-xs">
          {[
            { id: 'financial', label: 'Financial' },
            { id: 'sales', label: 'Sales' },
            { id: 'purchase', label: 'Purchase' },
            { id: 'stock', label: 'Stock Valuation' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setReportTab(tab.id as any)}
              className={`py-2 rounded-xl font-bold transition text-center ${
                reportTab === tab.id
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Date Filter Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'all', label: 'All Time' },
            { id: 'today', label: 'Today' },
            { id: 'weekly', label: 'Last 7 Days' },
            { id: 'monthly', label: 'Last 30 Days' },
            { id: 'yearly', label: 'This Year' }
          ].map(d => (
            <button
              key={d.id}
              onClick={() => setDateFilter(d.id as any)}
              className={`px-3 py-1.5 rounded-full font-semibold whitespace-nowrap transition ${
                dateFilter === d.id
                  ? 'bg-slate-800 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>

        {/* --- Financial Report Tab --- */}
        {reportTab === 'financial' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-xs text-slate-500 font-medium">Gross Profit:</span>
                <div className="text-xl font-extrabold text-teal-700 mt-1">
                  {settings.currency}{grossProfit.toFixed(2)}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Revenue minus cost of sold items
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-xs text-slate-500 font-medium">Net Profit:</span>
                <div className="text-xl font-extrabold text-emerald-700 mt-1">
                  {settings.currency}{netProfit.toFixed(2)}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Gross profit minus shop expenses
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2 text-xs">
              <h3 className="font-bold text-slate-800 uppercase tracking-wider text-xs border-b border-slate-100 pb-2">
                Income &amp; Expense Breakdown
              </h3>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-600">Total Sales Revenue:</span>
                <span className="font-bold text-slate-900">{settings.currency}{totalSalesRevenue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-600">Total Purchases:</span>
                <span className="font-bold text-slate-900">{settings.currency}{totalPurchasesCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-600">Operating Expenses:</span>
                <span className="font-bold text-rose-600">-{settings.currency}{totalExpenseSum.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-600">Cash Collections:</span>
                <span className="font-bold text-slate-900">{settings.currency}{totalCashCollected.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-600">Online / Digital Collections:</span>
                <span className="font-bold text-slate-900">{settings.currency}{totalOnlineCollected.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50 text-rose-700">
                <span className="font-medium">Total Customer Due Receivable:</span>
                <span className="font-bold">{settings.currency}{totalCustomerDue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 text-purple-700">
                <span className="font-medium">Total Supplier Due Payable:</span>
                <span className="font-bold">{settings.currency}{totalSupplierDue.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {/* --- Sales Report Tab --- */}
        {reportTab === 'sales' && (
          <div className="space-y-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex justify-between items-center">
              <div>
                <span className="text-xs text-slate-500 font-medium">Sales Memos Count:</span>
                <div className="text-lg font-bold text-slate-900">{filteredSales.length} Memos</div>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500 font-medium">Sales Volume:</span>
                <div className="text-lg font-black text-teal-700">{settings.currency}{totalSalesRevenue.toFixed(2)}</div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">
                Recent Invoices in Period
              </h3>
              <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                {filteredSales.map(s => (
                  <div key={s.id} className="py-2.5 flex justify-between text-xs">
                    <div>
                      <div className="font-bold font-mono text-slate-900">{s.invoiceNo}</div>
                      <div className="text-[10px] text-slate-500">
                        {new Date(s.date).toLocaleDateString()} • {s.customerName} ({s.items.length} items)
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{settings.currency}{s.grandTotal.toFixed(2)}</div>
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${s.remainingDue > 0 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {s.remainingDue > 0 ? `Due ${settings.currency}${s.remainingDue}` : 'PAID'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* --- Purchase Report Tab --- */}
        {reportTab === 'purchase' && (
          <div className="space-y-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex justify-between items-center">
              <div>
                <span className="text-xs text-slate-500 font-medium">Purchase Invoices:</span>
                <div className="text-lg font-bold text-slate-900">{filteredPurchases.length} Invoices</div>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500 font-medium">Total Invoiced:</span>
                <div className="text-lg font-black text-amber-700">{settings.currency}{totalPurchasesCost.toFixed(2)}</div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">
                Purchases by Supplier
              </h3>
              <div className="divide-y divide-slate-100">
                {filteredPurchases.map(p => (
                  <div key={p.id} className="py-2.5 flex justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-900">{p.supplierName} ({p.companyName})</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {p.invoiceNo} • {new Date(p.date).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{settings.currency}{p.totalBill.toFixed(2)}</div>
                      <div className="text-[10px] text-slate-500">Paid: {settings.currency}{p.paidAmount.toFixed(2)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* --- Stock Valuation Report Tab --- */}
        {reportTab === 'stock' && (
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-slate-500 font-medium">Total Stock Pieces:</span>
                <div className="text-xl font-black text-slate-900 mt-1">{totalStockPieces} Pcs</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Across {medicines.length} products</div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-slate-500 font-medium">Batch Inventory Cost:</span>
                <div className="text-xl font-black text-teal-700 mt-1">
                  {settings.currency}{totalInventoryValuation.toFixed(2)}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Calculated at purchase cost</div>
              </div>
            </div>

            {negativeStockItems.length > 0 && (
              <div className="bg-rose-50 border border-rose-200 p-3 rounded-2xl space-y-1">
                <span className="font-bold text-rose-800 block text-xs">
                  Negative Stock Items ({negativeStockItems.length}):
                </span>
                {negativeStockItems.map(m => (
                  <div key={m.id} className="flex justify-between text-rose-700">
                    <span>{m.name}</span>
                    <strong className="font-mono">{m.stockInPieces} Pcs</strong>
                  </div>
                ))}
              </div>
            )}

            {lowStockItems.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-2xl space-y-1">
                <span className="font-bold text-amber-800 block text-xs">
                  Low Stock Items ({lowStockItems.length}):
                </span>
                {lowStockItems.map(m => (
                  <div key={m.id} className="flex justify-between text-amber-800">
                    <span>{m.name}</span>
                    <strong className="font-mono">{m.stockInPieces} Pcs (Alert: {m.minStockAlert})</strong>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
