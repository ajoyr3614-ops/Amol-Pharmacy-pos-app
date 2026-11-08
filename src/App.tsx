/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { StorageService } from './services/storage';
import { AppSettings, PharmacySummary, SaleTransaction } from './types/pharmacy';
import { AndroidFrame } from './components/AndroidFrame';
import { Dashboard } from './components/Dashboard';
import { PosScreen } from './components/screens/PosScreen';
import { MedicineScreen } from './components/screens/MedicineScreen';
import { PurchaseScreen } from './components/screens/PurchaseScreen';
import { StockScreen } from './components/screens/StockScreen';
import { CustomerScreen } from './components/screens/CustomerScreen';
import { SupplierScreen } from './components/screens/SupplierScreen';
import { SalesHistoryScreen, PurchaseHistoryScreen } from './components/screens/HistoryScreens';
import { ReturnScreen } from './components/screens/ReturnScreen';
import { ExpenseScreen } from './components/screens/ExpenseScreen';
import { ReportsScreen } from './components/screens/ReportsScreen';
import { BarcodeScreen } from './components/screens/BarcodeScreen';
import { NotificationScreen } from './components/screens/NotificationScreen';
import { BackupRestoreScreen } from './components/screens/BackupRestoreScreen';
import { SettingsScreen } from './components/screens/SettingsScreen';
import { ExpiryDeliveryScreen } from './components/screens/ExpiryDeliveryScreen';
import { MedicineOrderScreen } from './components/screens/MedicineOrderScreen';
import { SummaryScreen } from './components/screens/SummaryScreen';
import { ThermalReceiptModal } from './components/ThermalReceiptModal';
import { AndroidProjectViewerModal } from './components/AndroidProjectViewerModal';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<string>('dashboard');
  const [settings, setSettings] = useState<AppSettings>(() => {
    StorageService.initializeIfEmpty();
    return StorageService.getSettings();
  });
  const [summary, setSummary] = useState<PharmacySummary>(() => {
    return StorageService.getSummary();
  });

  // Active Sale for Thermal Receipt Preview Modal
  const [activeReceiptSale, setActiveReceiptSale] = useState<SaleTransaction | null>(null);

  // Barcode pending for new medicine creation
  const [pendingBarcodeToAdd, setPendingBarcodeToAdd] = useState<string | null>(null);

  // Android Project Source Explorer Modal
  const [showSourceViewer, setShowSourceViewer] = useState(false);

  // Reload summary when screen changes
  useEffect(() => {
    setSummary(StorageService.getSummary());
  }, [currentScreen]);

  const handleUpdateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    setSummary(StorageService.getSummary());
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'dashboard':
        return (
          <Dashboard
            settings={settings}
            summary={summary}
            onNavigate={screen => setCurrentScreen(screen)}
          />
        );

      case 'summary':
        return (
          <SummaryScreen
            settings={settings}
            summary={summary}
            onBack={() => setCurrentScreen('dashboard')}
            onNavigate={screen => setCurrentScreen(screen)}
          />
        );

      case 'pos':
        return (
          <PosScreen
            settings={settings}
            onBack={() => setCurrentScreen('dashboard')}
            onOpenReceipt={sale => setActiveReceiptSale(sale)}
            onNavigateMedicine={barcode => {
              setPendingBarcodeToAdd(barcode || null);
              setCurrentScreen('medicines');
            }}
          />
        );

      case 'medicines':
        return (
          <MedicineScreen
            settings={settings}
            onBack={() => setCurrentScreen('dashboard')}
            initialBarcodeToAdd={pendingBarcodeToAdd}
            onClearInitialBarcode={() => setPendingBarcodeToAdd(null)}
          />
        );

      case 'purchase':
        return (
          <PurchaseScreen
            settings={settings}
            onBack={() => setCurrentScreen('dashboard')}
            onNavigateHistory={() => setCurrentScreen('purchase_history')}
          />
        );

      case 'stock':
        return (
          <StockScreen
            settings={settings}
            onBack={() => setCurrentScreen('dashboard')}
          />
        );

      case 'customers':
        return (
          <CustomerScreen
            settings={settings}
            onBack={() => setCurrentScreen('dashboard')}
          />
        );

      case 'suppliers':
        return (
          <SupplierScreen
            settings={settings}
            onBack={() => setCurrentScreen('dashboard')}
            onNavigateNewPurchase={() => setCurrentScreen('purchase')}
          />
        );

      case 'sales_history':
        return (
          <SalesHistoryScreen
            settings={settings}
            onBack={() => setCurrentScreen('dashboard')}
            onOpenReceipt={sale => setActiveReceiptSale(sale)}
          />
        );

      case 'purchase_history':
        return (
          <PurchaseHistoryScreen
            settings={settings}
            onBack={() => setCurrentScreen('dashboard')}
          />
        );

      case 'returns':
        return (
          <ReturnScreen
            settings={settings}
            onBack={() => setCurrentScreen('dashboard')}
          />
        );

      case 'expenses':
        return (
          <ExpenseScreen
            settings={settings}
            onBack={() => setCurrentScreen('dashboard')}
          />
        );

      case 'reports':
        return (
          <ReportsScreen
            settings={settings}
            onBack={() => setCurrentScreen('dashboard')}
          />
        );

      case 'barcode':
        return (
          <BarcodeScreen
            settings={settings}
            onBack={() => setCurrentScreen('dashboard')}
          />
        );

      case 'notifications':
        return (
          <NotificationScreen
            settings={settings}
            onBack={() => setCurrentScreen('dashboard')}
            onNavigateScreen={screen => setCurrentScreen(screen)}
          />
        );

      case 'backup_restore':
        return (
          <BackupRestoreScreen
            settings={settings}
            onBack={() => setCurrentScreen('dashboard')}
          />
        );

      case 'settings':
        return (
          <SettingsScreen
            settings={settings}
            onBack={() => setCurrentScreen('dashboard')}
            onUpdateSettings={handleUpdateSettings}
          />
        );

      case 'expiry_delivery':
        return (
          <ExpiryDeliveryScreen
            settings={settings}
            onBack={() => setCurrentScreen('dashboard')}
          />
        );

      case 'medicine_order':
        return (
          <MedicineOrderScreen
            settings={settings}
            onBack={() => setCurrentScreen('dashboard')}
          />
        );

      default:
        return (
          <Dashboard
            settings={settings}
            summary={summary}
            onNavigate={screen => setCurrentScreen(screen)}
          />
        );
    }
  };

  return (
    <AndroidFrame
      settings={settings}
      currentScreenTitle={currentScreen}
      onNavigateHome={() => setCurrentScreen('dashboard')}
      onOpenSourceViewer={() => setShowSourceViewer(true)}
    >
      {renderScreen()}

      {/* --- Thermal Receipt Modal --- */}
      {activeReceiptSale && (
        <ThermalReceiptModal
          sale={activeReceiptSale}
          settings={settings}
          onClose={() => {
            setActiveReceiptSale(null);
            setSummary(StorageService.getSummary());
          }}
        />
      )}

      {/* --- Android Project & Source Explorer Modal --- */}
      {showSourceViewer && (
        <AndroidProjectViewerModal onClose={() => setShowSourceViewer(false)} />
      )}
    </AndroidFrame>
  );
}
