/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Bell,
  AlertTriangle,
  Clock,
  Users,
  Building2,
  Calendar,
  CheckCircle,
  TrendingUp,
  Sliders
} from 'lucide-react';
import { AppSettings, Medicine, Customer, Supplier, MedicineOrder } from '../../types/pharmacy';
import { StorageService } from '../../services/storage';

interface NotificationScreenProps {
  settings: AppSettings;
  onBack: () => void;
  onNavigateScreen: (screen: string) => void;
}

export const NotificationScreen: React.FC<NotificationScreenProps> = ({ settings, onBack, onNavigateScreen }) => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [orders, setOrders] = useState<MedicineOrder[]>([]);

  useEffect(() => {
    setMedicines(StorageService.getMedicines());
    setCustomers(StorageService.getCustomers());
    setSuppliers(StorageService.getSuppliers());
    setOrders(StorageService.getMedicineOrders());
  }, []);

  const nowTime = Date.now();
  const expiryThreshold = nowTime + settings.expiryWarningDays * 86400000;

  // Compute notifications dynamically
  const lowStockAlerts = medicines.filter(m => m.stockInPieces > 0 && m.stockInPieces <= (m.minStockAlert || 15));
  const outOfStockAlerts = medicines.filter(m => m.stockInPieces <= 0);
  const expiringAlerts = medicines.filter(m =>
    m.batches?.some(b => new Date(b.expiryDate).getTime() <= expiryThreshold)
  );
  const customerDueAlerts = customers.filter(c => c.dueBalance > 0);
  const supplierDueAlerts = suppliers.filter(s => s.remainingDue > 0);
  const pendingOrdersAlerts = orders.filter(o => o.status === 'due_today' || o.status === 'overdue');

  const totalAlerts =
    lowStockAlerts.length +
    outOfStockAlerts.length +
    expiringAlerts.length +
    customerDueAlerts.length +
    supplierDueAlerts.length +
    pendingOrdersAlerts.length;

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
            <h1 className="text-base font-bold tracking-tight">Notifications &amp; Alerts</h1>
            <p className={`text-[11px] ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
              Android System Notifications &amp; In-App Feed
            </p>
          </div>
        </div>

        <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-full border ${
          isDark ? 'bg-neutral-900 border-neutral-800 text-neutral-300' : 'bg-neutral-100 border-neutral-300 text-neutral-700'
        }`}>
          {totalAlerts} Active Alerts
        </span>
      </div>

      <div className="p-4 space-y-4">
        {/* Daily Summary Card */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900">WorkManager Daily Summary</h3>
              <p className="text-[11px] text-slate-500">Android WorkManager triggers every evening at 8:00 PM</p>
            </div>
          </div>
          <button
            onClick={() => onNavigateScreen('reports')}
            className="px-3 py-1.5 bg-amber-600 text-white rounded-xl text-xs font-bold hover:bg-amber-700"
          >
            View Summary
          </button>
        </div>

        {/* 1. Low & Out of Stock Alerts */}
        {(lowStockAlerts.length > 0 || outOfStockAlerts.length > 0) && (
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-orange-600" /> Stock Level Warnings
            </span>
            <div className="space-y-2">
              {outOfStockAlerts.map(m => (
                <div key={m.id} className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-red-900">{m.name}</span>
                    <p className="text-[11px] text-red-700">Out of Stock ({m.stockInPieces} Pcs left)</p>
                  </div>
                  <button
                    onClick={() => onNavigateScreen('purchase')}
                    className="px-2.5 py-1 bg-red-600 text-white rounded-lg font-bold text-[10px]"
                  >
                    Order Stock
                  </button>
                </div>
              ))}
              {lowStockAlerts.map(m => (
                <div key={m.id} className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-amber-900">{m.name}</span>
                    <p className="text-[11px] text-amber-700">Low Stock: Only {m.stockInPieces} Pcs left (Alert threshold: {m.minStockAlert})</p>
                  </div>
                  <button
                    onClick={() => onNavigateScreen('purchase')}
                    className="px-2.5 py-1 bg-amber-600 text-white rounded-lg font-bold text-[10px]"
                  >
                    Restock
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. Expiring Medicines Alerts */}
        {expiringAlerts.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-red-600" /> Near Expiry Medicines
            </span>
            <div className="space-y-2">
              {expiringAlerts.map(m => (
                <div key={m.id} className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs shadow-xs">
                  <div>
                    <span className="font-bold text-slate-900">{m.name}</span>
                    <p className="text-[11px] text-slate-500">{m.company} • Stock: {m.stockInPieces} Pcs</p>
                    <p className="text-[10px] text-rose-600 font-bold mt-0.5">
                      Batch Expiry: {m.batches?.[0]?.expiryDate || 'Soon'}
                    </p>
                  </div>
                  <button
                    onClick={() => onNavigateScreen('expiry_delivery')}
                    className="px-2.5 py-1 bg-purple-700 text-white rounded-lg font-bold text-[10px]"
                  >
                    Return to Company
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. Medicine Order Delivery Warnings */}
        {pendingOrdersAlerts.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-emerald-600" /> Medicine Order Due Reminders
            </span>
            <div className="space-y-2">
              {pendingOrdersAlerts.map(o => (
                <div key={o.id} className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-emerald-900">{o.companyName} ({o.orderNumber})</span>
                    <p className="text-[11px] text-emerald-800">
                      Expected Delivery: <strong>{o.expectedDeliveryDate}</strong> ({o.status.toUpperCase()})
                    </p>
                  </div>
                  <button
                    onClick={() => onNavigateScreen('medicine_order')}
                    className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg font-bold text-[10px]"
                  >
                    Open Order
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. Customer Outstanding Dues */}
        {customerDueAlerts.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-purple-600" /> Customer Dues ({customerDueAlerts.length})
            </span>
            <div className="space-y-2">
              {customerDueAlerts.map(c => (
                <div key={c.id} className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs shadow-xs">
                  <div>
                    <span className="font-bold text-slate-900">{c.name}</span>
                    <p className="text-[11px] text-slate-500">{c.mobile}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-rose-600">{settings.currency}{c.dueBalance.toFixed(2)}</span>
                    <button
                      onClick={() => onNavigateScreen('customers')}
                      className="block text-[10px] text-purple-700 font-bold underline mt-0.5"
                    >
                      Collect
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
