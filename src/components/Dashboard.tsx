/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  TrendingUp,
  Users,
  Truck,
  RotateCcw,
  Receipt,
  FileText,
  Barcode as BarcodeIcon,
  Bell,
  Settings,
  Archive,
  Calendar,
  DollarSign,
  Layers,
  Building2,
  FolderSync
} from 'lucide-react';
import { AppSettings, PharmacySummary } from '../types/pharmacy';

interface DashboardProps {
  settings: AppSettings;
  summary: PharmacySummary;
  onNavigate: (screen: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ settings, summary, onNavigate }) => {
  const isDark = settings.theme === 'dark';

  // 18 Action Modules styled as clean native Android app icon squircles
  const actionButtons = [
    {
      id: 'summary',
      title: 'Dashboard Summary',
      icon: LayoutDashboard,
      badge: '11'
    },
    {
      id: 'pos',
      title: 'POS / Sales',
      icon: ShoppingCart,
      badge: 'Sale'
    },
    {
      id: 'medicines',
      title: 'Medicine / Product',
      icon: Package
    },
    {
      id: 'purchase',
      title: 'Purchase',
      icon: Truck
    },
    {
      id: 'stock',
      title: 'Stock / Inventory',
      icon: Layers
    },
    {
      id: 'customers',
      title: 'Customer',
      icon: Users
    },
    {
      id: 'suppliers',
      title: 'Supplier',
      icon: Building2
    },
    {
      id: 'sales_history',
      title: 'Sales History',
      icon: Receipt
    },
    {
      id: 'purchase_history',
      title: 'Purchase History',
      icon: FileText
    },
    {
      id: 'returns',
      title: 'Return',
      icon: RotateCcw
    },
    {
      id: 'expenses',
      title: 'Expenses',
      icon: DollarSign
    },
    {
      id: 'reports',
      title: 'Reports',
      icon: TrendingUp
    },
    {
      id: 'barcode',
      title: 'Barcode',
      icon: BarcodeIcon
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: Bell,
      badge: summary.lowStockCount > 0 || summary.expiringMedicinesCount > 0
        ? `${summary.lowStockCount + summary.expiringMedicinesCount}`
        : undefined
    },
    {
      id: 'backup_restore',
      title: 'Backup & Restore',
      icon: Archive
    },
    {
      id: 'settings',
      title: 'Settings',
      icon: Settings
    },
    {
      id: 'expiry_delivery',
      title: 'Expiry Delivery',
      icon: FolderSync
    },
    {
      id: 'medicine_order',
      title: 'Medicine Order',
      icon: Calendar
    }
  ];

  return (
    <div className={`min-h-full pb-20 ${isDark ? 'bg-black text-white' : 'bg-white text-black'}`}>
      {/* --- Minimalist Header (Dynamic Pharmacy Name & Actions) --- */}
      <div className={`px-5 pt-5 pb-4 border-b ${
        isDark ? 'bg-neutral-950 border-neutral-800' : 'bg-white border-neutral-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="min-w-0 pr-2">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full shrink-0 ${isDark ? 'bg-white' : 'bg-black'}`}></span>
              <span className={`text-[10px] uppercase tracking-wider font-semibold truncate ${
                isDark ? 'text-neutral-400' : 'text-neutral-500'
              }`}>
                Offline Room DB • Native Android
              </span>
            </div>

            {/* Dynamic Pharmacy Name */}
            <h1 className="text-xl font-black tracking-tight mt-0.5 truncate">
              {settings.pharmacyName}
            </h1>
            <p className={`text-[11px] truncate mt-0.5 ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
              {settings.address}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onNavigate('notifications')}
              className={`relative p-2.5 rounded-2xl border transition active:scale-95 cursor-pointer ${
                isDark
                  ? 'border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-white'
                  : 'border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-black'
              }`}
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {(summary.lowStockCount > 0 || summary.expiringMedicinesCount > 0) && (
                <span className={`absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold ${
                  isDark ? 'bg-white text-black' : 'bg-black text-white'
                }`}>
                  {summary.lowStockCount + summary.expiringMedicinesCount}
                </span>
              )}
            </button>
            <button
              onClick={() => onNavigate('settings')}
              className={`p-2.5 rounded-2xl border transition active:scale-95 cursor-pointer ${
                isDark
                  ? 'border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-white'
                  : 'border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-black'
              }`}
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* --- Action Buttons (Squircle Android App Icon Grid like reference image) --- */}
      <div className="px-3 sm:px-5 mt-5">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-y-4 gap-x-2">
          {actionButtons.map((btn) => {
            const IconComp = btn.icon;
            const isHighlight = btn.id === 'summary';

            return (
              <button
                key={btn.id}
                onClick={() => onNavigate(btn.id)}
                className="flex flex-col items-center text-center group cursor-pointer active:scale-90 transition-transform py-1 px-1"
              >
                {/* Squircle Launcher Icon Tile */}
                <div className="relative">
                  <div
                    className={`w-15 h-15 sm:w-16 sm:h-16 rounded-[22px] flex items-center justify-center transition-all border shadow-xs ${
                      isHighlight
                        ? isDark
                          ? 'bg-neutral-800 border-neutral-600 text-white group-hover:bg-neutral-700'
                          : 'bg-neutral-200 border-neutral-400 text-black group-hover:bg-neutral-300'
                        : isDark
                        ? 'bg-neutral-900 border-neutral-800 text-neutral-200 group-hover:bg-neutral-800 group-hover:border-neutral-700 group-hover:text-white'
                        : 'bg-neutral-100 border-neutral-300 text-neutral-800 group-hover:bg-neutral-200 group-hover:border-neutral-400 group-hover:text-black'
                    }`}
                  >
                    <IconComp className="w-7 h-7 sm:w-8 sm:h-8" strokeWidth={1.8} />
                  </div>

                  {btn.badge && (
                    <span
                      className={`absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full text-[9px] font-bold flex items-center justify-center border shadow-xs ${
                        isDark
                          ? 'bg-white text-black border-neutral-900'
                          : 'bg-black text-white border-white'
                      }`}
                    >
                      {btn.badge}
                    </span>
                  )}
                </div>

                {/* Clean Label underneath icon */}
                <span
                  className={`text-[11px] font-semibold leading-tight mt-2 max-w-[84px] text-center line-clamp-2 transition-colors ${
                    isHighlight
                      ? isDark
                        ? 'text-white font-bold'
                        : 'text-black font-bold'
                      : isDark
                      ? 'text-neutral-300 group-hover:text-white'
                      : 'text-neutral-700 group-hover:text-black'
                  }`}
                >
                  {btn.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
