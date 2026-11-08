/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  ArrowLeft,
  LayoutDashboard,
  ShoppingCart,
  Truck,
  DollarSign,
  TrendingUp,
  Users,
  Building2,
  Package,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { AppSettings, PharmacySummary } from '../../types/pharmacy';

interface SummaryScreenProps {
  settings: AppSettings;
  summary: PharmacySummary;
  onBack: () => void;
  onNavigate: (screen: string) => void;
}

export const SummaryScreen: React.FC<SummaryScreenProps> = ({ settings, summary, onBack, onNavigate }) => {
  const isDark = settings.theme === 'dark';

  const summaryCards = [
    {
      id: 'today_sales',
      title: "Today's Sales",
      value: `${settings.currency}${summary.todaySales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      subtitle: "Total retail memos billed today",
      icon: ShoppingCart,
      actionScreen: 'sales_history'
    },
    {
      id: 'today_purchase',
      title: "Today's Purchase",
      value: `${settings.currency}${summary.todayPurchase.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      subtitle: "Supplier invoices recorded today",
      icon: Truck,
      actionScreen: 'purchase_history'
    },
    {
      id: 'today_expenses',
      title: "Today's Expenses",
      value: `${settings.currency}${summary.todayExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      subtitle: "Daily shop operating expenses",
      icon: DollarSign,
      actionScreen: 'expenses'
    },
    {
      id: 'total_profit',
      title: "Total Profit",
      value: `${settings.currency}${summary.totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      subtitle: "Gross profit minus total expenses",
      icon: TrendingUp,
      actionScreen: 'reports'
    },
    {
      id: 'total_customer_due',
      title: "Total Customer Due",
      value: `${settings.currency}${summary.totalCustomerDue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      subtitle: "Outstanding customer receivables",
      icon: Users,
      actionScreen: 'customers'
    },
    {
      id: 'total_supplier_due',
      title: "Total Supplier Due",
      value: `${settings.currency}${summary.totalSupplierDue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      subtitle: "Payable debt to distributors",
      icon: Building2,
      actionScreen: 'suppliers'
    },
    {
      id: 'total_customers',
      title: "Total Customers",
      value: `${summary.totalCustomers}`,
      subtitle: "Registered customer ledger accounts",
      icon: Users,
      actionScreen: 'customers'
    },
    {
      id: 'total_suppliers',
      title: "Total Suppliers",
      value: `${summary.totalSuppliers}`,
      subtitle: "Registered pharma distributors",
      icon: Building2,
      actionScreen: 'suppliers'
    },
    {
      id: 'total_products',
      title: "Total Products",
      value: `${summary.totalProducts}`,
      subtitle: "Medicine inventory catalog count",
      icon: Package,
      actionScreen: 'medicines'
    },
    {
      id: 'low_stock',
      title: "Low Stock",
      value: `${summary.lowStockCount} Items`,
      subtitle: `Items below threshold (${settings.lowStockThreshold} pcs)`,
      icon: AlertTriangle,
      actionScreen: 'stock'
    },
    {
      id: 'expiring_medicines',
      title: "Expiring Medicines",
      value: `${summary.expiringMedicinesCount} Items`,
      subtitle: `Expiring within ${settings.expiryWarningDays} days`,
      icon: Clock,
      actionScreen: 'stock'
    }
  ];

  return (
    <div className={`min-h-full pb-20 ${isDark ? 'bg-black text-white' : 'bg-white text-black'}`}>
      {/* Header */}
      <div className={`px-4 py-3.5 border-b sticky top-0 z-20 flex items-center justify-between ${
        isDark ? 'bg-black border-neutral-800' : 'bg-white border-neutral-200'
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
            <h1 className="text-base font-bold tracking-tight">Dashboard Summary</h1>
            <p className={`text-[11px] ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
              11 Real-Time Business Metrics
            </p>
          </div>
        </div>

        <div className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg border ${
          isDark ? 'bg-neutral-900 border-neutral-800 text-neutral-300' : 'bg-neutral-100 border-neutral-300 text-neutral-700'
        }`}>
          {settings.currency} (BDT)
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {summaryCards.map(card => {
            const IconComp = card.icon;
            return (
              <div
                key={card.id}
                onClick={() => onNavigate(card.actionScreen)}
                className={`p-4 rounded-2xl border cursor-pointer transition flex items-start justify-between ${
                  isDark
                    ? 'bg-neutral-950 border-neutral-800 hover:border-neutral-600'
                    : 'bg-white border-neutral-200 hover:border-neutral-400 shadow-xs'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${
                    isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-neutral-100 border-neutral-200 text-black'
                  }`}>
                    <IconComp className="w-5 h-5" />
                  </div>
                  <div>
                    <span className={`text-xs font-medium ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>
                      {card.title}
                    </span>
                    <div className="text-lg font-black tracking-tight mt-0.5">
                      {card.value}
                    </div>
                    <p className={`text-[11px] mt-0.5 ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>
                      {card.subtitle}
                    </p>
                  </div>
                </div>

                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                  isDark ? 'bg-neutral-900 border-neutral-800 text-neutral-300' : 'bg-neutral-100 border-neutral-200 text-neutral-700'
                }`}>
                  View
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
