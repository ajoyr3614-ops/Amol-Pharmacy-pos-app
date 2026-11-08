/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ArrowLeft,
  Store,
  Printer,
  Bell,
  Globe,
  Sliders,
  CheckCircle,
  Sun,
  Moon
} from 'lucide-react';
import { AppSettings } from '../../types/pharmacy';
import { StorageService } from '../../services/storage';

interface SettingsScreenProps {
  settings: AppSettings;
  onBack: () => void;
  onUpdateSettings: (newSettings: AppSettings) => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ settings, onBack, onUpdateSettings }) => {
  const [pharmacyName, setPharmacyName] = useState(settings.pharmacyName);
  const [ownerName, setOwnerName] = useState(settings.ownerName);
  const [mobileNumber, setMobileNumber] = useState(settings.mobileNumber);
  const [address, setAddress] = useState(settings.address);
  const [currency, setCurrency] = useState(settings.currency);
  const [language, setLanguage] = useState(settings.language);
  const [theme, setTheme] = useState<'light' | 'dark'>(settings.theme || 'light');
  const [negativeStockAllowed, setNegativeStockAllowed] = useState(settings.negativeStockAllowed);
  const [returnsEnabled, setReturnsEnabled] = useState(settings.returnsEnabled);
  const [returnNoticeBangla, setReturnNoticeBangla] = useState(settings.returnNoticeBangla);
  const [defaultPrinterSize, setDefaultPrinterSize] = useState(settings.defaultPrinterSize);
  const [lowStockThreshold, setLowStockThreshold] = useState(settings.lowStockThreshold);
  const [expiryWarningDays, setExpiryWarningDays] = useState(settings.expiryWarningDays);

  const [savedSuccess, setSavedSuccess] = useState(false);

  const isDark = theme === 'dark';

  const handleSave = (overridingTheme?: 'light' | 'dark') => {
    if (!pharmacyName.trim()) {
      alert('Pharmacy name cannot be blank.');
      return;
    }

    const targetTheme = overridingTheme || theme;

    const updated: AppSettings = {
      ...settings,
      pharmacyName: pharmacyName.trim(),
      ownerName: ownerName.trim(),
      mobileNumber: mobileNumber.trim(),
      address: address.trim(),
      currency,
      language,
      theme: targetTheme,
      negativeStockAllowed,
      returnsEnabled,
      returnNoticeBangla,
      defaultPrinterSize,
      lowStockThreshold,
      expiryWarningDays
    };

    StorageService.saveSettings(updated);
    onUpdateSettings(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleSelectTheme = (selected: 'light' | 'dark') => {
    setTheme(selected);
    handleSave(selected);
  };

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
            <h1 className="text-base font-bold tracking-tight">App &amp; Business Settings</h1>
            <p className={`text-[11px] ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
              Theme Choice (White / Dark) • Shop &amp; Thermal POS
            </p>
          </div>
        </div>

        <button
          onClick={() => handleSave()}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold text-xs border transition active:scale-95 ${
            isDark
              ? 'bg-white text-black border-white hover:bg-neutral-200'
              : 'bg-black text-white border-black hover:bg-neutral-800'
          }`}
        >
          <CheckCircle className="w-4 h-4" />
          <span>Save</span>
        </button>
      </div>

      <div className="p-4 space-y-4 max-w-lg mx-auto w-full text-xs">
        {savedSuccess && (
          <div className={`p-3 rounded-2xl border text-xs font-bold flex items-center gap-2 ${
            isDark ? 'bg-neutral-900 border-neutral-700 text-white' : 'bg-neutral-100 border-neutral-300 text-black'
          }`}>
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>Settings saved successfully!</span>
          </div>
        )}

        {/* --- Theme Selector (White & Dark Mode Choice - Explicit User Request) --- */}
        <div className={`p-4 rounded-2xl border space-y-3 ${
          isDark ? 'bg-neutral-950 border-neutral-800' : 'bg-white border-neutral-200 shadow-xs'
        }`}>
          <div className="flex items-center justify-between border-b pb-2.5 border-neutral-200 dark:border-neutral-800">
            <div>
              <span className="font-bold text-xs uppercase tracking-wider block">
                Theme Choice (White &amp; Dark Only)
              </span>
              <p className={`text-[10px] mt-0.5 ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                Clean monochrome design with no rainbow colors
              </p>
            </div>
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${
              isDark ? 'bg-neutral-800 border-neutral-700 text-white' : 'bg-neutral-100 border-neutral-300 text-black'
            }`}>
              {isDark ? 'DARK ACTIVE' : 'WHITE ACTIVE'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleSelectTheme('light')}
              className={`p-3.5 rounded-xl border flex flex-col items-center justify-center gap-2 transition cursor-pointer ${
                theme === 'light'
                  ? 'bg-neutral-100 border-black text-black font-black ring-2 ring-black/10'
                  : 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-white border border-neutral-300 flex items-center justify-center text-black">
                <Sun className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider">White Mode</span>
              <span className="text-[10px] text-neutral-500">Pure clean white UI</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectTheme('dark')}
              className={`p-3.5 rounded-xl border flex flex-col items-center justify-center gap-2 transition cursor-pointer ${
                theme === 'dark'
                  ? 'bg-neutral-900 border-white text-white font-black ring-2 ring-white/20'
                  : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:bg-neutral-900'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-black border border-neutral-700 flex items-center justify-center text-white">
                <Moon className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider">Dark Mode</span>
              <span className="text-[10px] text-neutral-400">Deep midnight dark UI</span>
            </button>
          </div>
        </div>

        {/* 1. Pharmacy Profile */}
        <div className={`p-4 rounded-2xl border space-y-3 ${
          isDark ? 'bg-neutral-950 border-neutral-800' : 'bg-white border-neutral-200 shadow-xs'
        }`}>
          <div className="flex items-center gap-2 border-b pb-2 border-neutral-200 dark:border-neutral-800">
            <Store className="w-4 h-4" />
            <h3 className="font-bold uppercase tracking-wider text-xs">
              Pharmacy &amp; Business Profile
            </h3>
          </div>

          <div className="space-y-2.5">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-bold">Pharmacy / Shop Name *</label>
                <span className={`text-[10px] ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                  (Dynamically updates everywhere)
                </span>
              </div>
              <input
                type="text"
                value={pharmacyName}
                onChange={e => setPharmacyName(e.target.value)}
                placeholder="e.g. Amol Pharmacy or Rahman Pharmacy"
                className={`w-full p-2.5 rounded-xl font-bold text-sm border focus:outline-none ${
                  isDark ? 'bg-neutral-900 border-neutral-700 text-white' : 'bg-neutral-50 border-neutral-300 text-black'
                }`}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-semibold block mb-1">Owner Name</label>
                <input
                  type="text"
                  value={ownerName}
                  onChange={e => setOwnerName(e.target.value)}
                  placeholder="e.g. Md. Amol Hossain"
                  className={`w-full p-2 rounded-xl font-medium border focus:outline-none ${
                    isDark ? 'bg-neutral-900 border-neutral-700 text-white' : 'bg-neutral-50 border-neutral-300 text-black'
                  }`}
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Mobile / Phone</label>
                <input
                  type="text"
                  value={mobileNumber}
                  onChange={e => setMobileNumber(e.target.value)}
                  placeholder="+880 1712-xxxxxx"
                  className={`w-full p-2 rounded-xl font-medium border focus:outline-none ${
                    isDark ? 'bg-neutral-900 border-neutral-700 text-white' : 'bg-neutral-50 border-neutral-300 text-black'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="font-semibold block mb-1">Shop Address</label>
              <input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="Shop number, Road, Area, Dhaka"
                className={`w-full p-2 rounded-xl border focus:outline-none ${
                  isDark ? 'bg-neutral-900 border-neutral-700 text-white' : 'bg-neutral-50 border-neutral-300 text-black'
                }`}
              />
            </div>
          </div>
        </div>

        {/* 2. Localization & Currency */}
        <div className={`p-4 rounded-2xl border space-y-3 ${
          isDark ? 'bg-neutral-950 border-neutral-800' : 'bg-white border-neutral-200 shadow-xs'
        }`}>
          <div className="flex items-center gap-2 border-b pb-2 border-neutral-200 dark:border-neutral-800">
            <Globe className="w-4 h-4" />
            <h3 className="font-bold uppercase tracking-wider text-xs">
              Currency &amp; Language
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold block mb-1">Currency Symbol</label>
              <select
                value={currency}
                onChange={e => setCurrency(e.target.value)}
                className={`w-full p-2 rounded-xl font-bold border focus:outline-none ${
                  isDark ? 'bg-neutral-900 border-neutral-700 text-white' : 'bg-neutral-50 border-neutral-300 text-black'
                }`}
              >
                <option value="৳">৳ (BDT Taka Symbol)</option>
                <option value="BDT">BDT (Code)</option>
                <option value="$">$ (USD)</option>
              </select>
            </div>

            <div>
              <label className="font-semibold block mb-1">Language</label>
              <select
                value={language}
                onChange={e => setLanguage(e.target.value as any)}
                className={`w-full p-2 rounded-xl font-bold border focus:outline-none ${
                  isDark ? 'bg-neutral-900 border-neutral-700 text-white' : 'bg-neutral-50 border-neutral-300 text-black'
                }`}
              >
                <option value="en">English</option>
                <option value="bn">বাংলা (Bengali)</option>
              </select>
            </div>
          </div>
        </div>

        {/* 3. POS & Inventory Rules */}
        <div className={`p-4 rounded-2xl border space-y-3 ${
          isDark ? 'bg-neutral-950 border-neutral-800' : 'bg-white border-neutral-200 shadow-xs'
        }`}>
          <div className="flex items-center gap-2 border-b pb-2 border-neutral-200 dark:border-neutral-800">
            <Sliders className="w-4 h-4" />
            <h3 className="font-bold uppercase tracking-wider text-xs">
              Inventory &amp; Sales Rules
            </h3>
          </div>

          {/* Negative Stock Toggle */}
          <div className={`flex items-center justify-between p-3 rounded-xl border ${
            isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-neutral-50 border-neutral-200'
          }`}>
            <div>
              <span className="font-bold block text-xs">
                Negative Stock Allowance (Default: ON)
              </span>
              <p className={`text-[10px] mt-0.5 ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                Permit selling beyond current stock; balance shows negative and restores on purchase.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setNegativeStockAllowed(!negativeStockAllowed)}
              className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition ${
                negativeStockAllowed
                  ? isDark ? 'bg-white justify-end' : 'bg-black justify-end'
                  : 'bg-neutral-400 justify-start'
              }`}
            >
              <span className={`w-4 h-4 rounded-full shadow ${
                negativeStockAllowed
                  ? isDark ? 'bg-black' : 'bg-white'
                  : 'bg-white'
              }`} />
            </button>
          </div>

          {/* Return Enabled Toggle */}
          <div className={`flex items-center justify-between p-3 rounded-xl border ${
            isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-neutral-50 border-neutral-200'
          }`}>
            <div>
              <span className="font-bold block text-xs">
                Allow Sales &amp; Purchase Returns
              </span>
              <p className={`text-[10px] mt-0.5 ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                Enable or disable return operations and memo refund vouchers.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setReturnsEnabled(!returnsEnabled)}
              className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition ${
                returnsEnabled
                  ? isDark ? 'bg-white justify-end' : 'bg-black justify-end'
                  : 'bg-neutral-400 justify-start'
              }`}
            >
              <span className={`w-4 h-4 rounded-full shadow ${
                returnsEnabled
                  ? isDark ? 'bg-black' : 'bg-white'
                  : 'bg-white'
              }`} />
            </button>
          </div>

          <div>
            <label className="font-semibold block mb-1">
              Bangla Memo Footer Note:
            </label>
            <input
              type="text"
              value={returnNoticeBangla}
              onChange={e => setReturnNoticeBangla(e.target.value)}
              className={`w-full p-2 rounded-xl font-['Hind_Siliguri',sans-serif] font-medium border focus:outline-none ${
                isDark ? 'bg-neutral-900 border-neutral-700 text-white' : 'bg-neutral-50 border-neutral-300 text-black'
              }`}
            />
          </div>
        </div>

        {/* 4. Thermal Printer Settings */}
        <div className={`p-4 rounded-2xl border space-y-3 ${
          isDark ? 'bg-neutral-950 border-neutral-800' : 'bg-white border-neutral-200 shadow-xs'
        }`}>
          <div className="flex items-center gap-2 border-b pb-2 border-neutral-200 dark:border-neutral-800">
            <Printer className="w-4 h-4" />
            <h3 className="font-bold uppercase tracking-wider text-xs">
              Thermal Printer &amp; Paper Size
            </h3>
          </div>

          <div>
            <label className="font-semibold block mb-1">Default Paper Size</label>
            <div className="grid grid-cols-3 gap-2">
              {(['58mm', '80mm', 'a4'] as const).map(size => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setDefaultPrinterSize(size)}
                  className={`p-2.5 rounded-xl border font-bold uppercase transition ${
                    defaultPrinterSize === size
                      ? isDark
                        ? 'bg-neutral-800 border-white text-white'
                        : 'bg-neutral-100 border-black text-black'
                      : isDark
                      ? 'bg-neutral-900 border-neutral-800 text-neutral-400'
                      : 'bg-neutral-50 border-neutral-200 text-neutral-600'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={() => handleSave()}
          className={`w-full py-3 rounded-xl font-bold text-sm border transition active:scale-98 ${
            isDark
              ? 'bg-white text-black border-white hover:bg-neutral-200'
              : 'bg-black text-white border-black hover:bg-neutral-800 shadow-md'
          }`}
        >
          Save All Settings
        </button>
      </div>
    </div>
  );
};
