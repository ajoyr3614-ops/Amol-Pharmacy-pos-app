/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ArrowLeft,
  Archive,
  Download,
  Upload,
  RefreshCw,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  Code2,
  Terminal,
  X
} from 'lucide-react';
import { AppSettings } from '../../types/pharmacy';
import { StorageService } from '../../services/storage';
import { AndroidProjectExporter } from '../../services/androidProjectZip';

interface BackupRestoreScreenProps {
  settings: AppSettings;
  onBack: () => void;
}

export const BackupRestoreScreen: React.FC<BackupRestoreScreenProps> = ({ settings, onBack }) => {
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [showRestoreConfirmModal, setShowRestoreConfirmModal] = useState(false);
  const [pendingBackupContent, setPendingBackupContent] = useState<string | null>(null);
  const [isExportingZip, setIsExportingZip] = useState(false);
  const [showApkGuide, setShowApkGuide] = useState(false);

  const isDark = settings.theme === 'dark';

  const handleDownloadBackup = () => {
    const jsonStr = StorageService.exportFullBackup();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const dateStr = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `AmolPharmacy-Backup-${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setStatusMessage('Backup file downloaded successfully!');
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleDownloadProjectZip = async () => {
    setIsExportingZip(true);
    try {
      const blob = await AndroidProjectExporter.exportZip();
      AndroidProjectExporter.downloadZip(blob);
      setStatusMessage('Android Studio project .zip exported successfully!');
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (e) {
      console.error(e);
      alert('Failed to package project zip.');
    } finally {
      setIsExportingZip(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = ev => {
      const content = ev.target?.result as string;
      if (content) {
        setPendingBackupContent(content);
        setShowRestoreConfirmModal(true);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleConfirmRestore = () => {
    if (!pendingBackupContent) return;
    const result = StorageService.importFullBackup(pendingBackupContent);
    setShowRestoreConfirmModal(false);
    setPendingBackupContent(null);

    if (result.success) {
      alert('Database restored successfully! Reloading...');
      window.location.reload();
    } else {
      alert(result.message);
    }
  };

  const handleResetToDemo = () => {
    if (confirm('Reset to factory demo data? All records will be replaced with standard sample medicines.')) {
      StorageService.resetToDefault();
      alert('Factory data restored.');
      window.location.reload();
    }
  };

  return (
    <div className={`min-h-full flex flex-col pb-20 ${isDark ? 'bg-black text-white' : 'bg-white text-black'}`}>
      {/* Header */}
      <div className={`px-4 py-3.5 border-b flex items-center justify-between sticky top-0 z-20 ${
        isDark ? 'bg-neutral-950 border-neutral-800' : 'bg-white border-neutral-200'
      }`}>
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className={`p-1.5 rounded-xl border transition ${
              isDark ? 'border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-white' : 'border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-black'
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-base font-bold">Backup &amp; Restore</h1>
            <p className={`text-[11px] ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
              Room Database &amp; Local Storage
            </p>
          </div>
        </div>

        <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded border ${
          isDark ? 'bg-neutral-900 border-neutral-800 text-neutral-300' : 'bg-neutral-100 border-neutral-300 text-neutral-700'
        }`}>
          Offline Safe
        </span>
      </div>

      <div className="p-4 space-y-3.5 max-w-lg mx-auto w-full">
        {statusMessage && (
          <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 border ${
            isDark ? 'bg-neutral-900 border-neutral-700 text-white' : 'bg-neutral-100 border-neutral-300 text-black'
          }`}>
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Protection Info */}
        <div className={`p-4 rounded-2xl border flex items-center gap-3.5 ${
          isDark ? 'bg-neutral-950 border-neutral-800' : 'bg-neutral-50 border-neutral-200'
        }`}>
          <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${
            isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-white border-neutral-300 text-black'
          }`}>
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold">Data Protection &amp; Migration</h3>
            <p className={`text-[11px] mt-0.5 ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
              Exports the entire pharmacy database (Medicines, Batches, Sales, Purchases, Ledgers, Expenses) into a portable backup file.
            </p>
          </div>
        </div>

        {/* 1. Create Backup */}
        <div className={`p-4 rounded-2xl border space-y-2.5 ${
          isDark ? 'bg-neutral-950 border-neutral-800' : 'bg-white border-neutral-200 shadow-xs'
        }`}>
          <h4 className="text-xs font-bold uppercase tracking-wider">
            1. Create Local Backup File
          </h4>
          <p className={`text-xs ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
            Save a timestamped JSON backup file to your phone's storage or transfer to another device.
          </p>

          <button
            onClick={handleDownloadBackup}
            className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition cursor-pointer active:scale-95 ${
              isDark
                ? 'bg-white text-black border-white hover:bg-neutral-200'
                : 'bg-black text-white border-black hover:bg-neutral-800'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Download Full Backup (JSON)</span>
          </button>
        </div>

        {/* 2. Restore Backup */}
        <div className={`p-4 rounded-2xl border space-y-2.5 ${
          isDark ? 'bg-neutral-950 border-neutral-800' : 'bg-white border-neutral-200 shadow-xs'
        }`}>
          <h4 className="text-xs font-bold uppercase tracking-wider">
            2. Restore from Backup File
          </h4>
          <p className={`text-xs ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
            Select a previously exported backup file to restore your pharmacy data.
          </p>

          <label className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition cursor-pointer active:scale-95 ${
            isDark
              ? 'bg-neutral-900 border-neutral-800 text-white hover:bg-neutral-800'
              : 'bg-neutral-100 border-neutral-300 text-black hover:bg-neutral-200'
          }`}>
            <Upload className="w-4 h-4" />
            <span>Choose Backup File to Restore</span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>
        </div>

        {/* 3. Native Android Project & APK */}
        <div className={`p-4 rounded-2xl border space-y-2.5 ${
          isDark ? 'bg-neutral-950 border-neutral-800' : 'bg-white border-neutral-200 shadow-xs'
        }`}>
          <h4 className="text-xs font-bold uppercase tracking-wider">
            3. Android Studio Project (.ZIP)
          </h4>
          <p className={`text-xs ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
            Export the complete buildable Kotlin &amp; Room Database Android Studio project.
          </p>

          <div className="flex gap-2">
            <button
              onClick={handleDownloadProjectZip}
              disabled={isExportingZip}
              className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border transition cursor-pointer ${
                isDark
                  ? 'bg-neutral-900 border-neutral-800 text-white hover:bg-neutral-800'
                  : 'bg-neutral-100 border-neutral-300 text-black hover:bg-neutral-200'
              }`}
            >
              <Code2 className="w-4 h-4" />
              <span>{isExportingZip ? 'Packaging...' : 'Export Project .zip'}</span>
            </button>
            <button
              onClick={() => setShowApkGuide(true)}
              className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border transition cursor-pointer ${
                isDark
                  ? 'bg-neutral-900 border-neutral-800 text-white hover:bg-neutral-800'
                  : 'bg-neutral-100 border-neutral-300 text-black hover:bg-neutral-200'
              }`}
            >
              <Terminal className="w-4 h-4" />
              <span>APK Guide</span>
            </button>
          </div>
        </div>

        {/* 4. Reset Demo Data */}
        <div className={`p-4 rounded-2xl border space-y-2 ${
          isDark ? 'bg-neutral-950 border-neutral-800' : 'bg-white border-neutral-200 shadow-xs'
        }`}>
          <h4 className="text-xs font-bold uppercase tracking-wider">
            Factory Data Reset
          </h4>
          <p className={`text-xs ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
            Restore sample medicines and reset to default values.
          </p>

          <button
            onClick={handleResetToDemo}
            className={`w-full py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border transition ${
              isDark
                ? 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                : 'bg-neutral-100 border-neutral-300 text-neutral-600 hover:text-black'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Demo Database</span>
          </button>
        </div>
      </div>

      {/* --- APK Guide Modal --- */}
      {showApkGuide && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`rounded-3xl max-w-sm w-full p-5 border shadow-2xl space-y-3 ${
            isDark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-white border-neutral-200 text-black'
          }`}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm">Building the Android APK</h3>
              <button
                onClick={() => setShowApkGuide(false)}
                className={`p-1 rounded-lg border ${
                  isDark ? 'border-neutral-800 bg-neutral-900 text-white' : 'border-neutral-200 bg-neutral-50 text-black'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="text-xs space-y-2 font-mono">
              <p className="font-sans">Open project in Android Studio and run:</p>
              <div className={`p-2.5 rounded-xl border ${
                isDark ? 'bg-neutral-900 border-neutral-800 text-neutral-200' : 'bg-neutral-100 border-neutral-300 text-neutral-800'
              }`}>
                ./gradlew assembleDebug
              </div>
              <p className="font-sans text-[11px] opacity-75">
                Output APK location:<br />
                <span className="font-mono text-[10px]">app/build/outputs/apk/debug/app-debug.apk</span>
              </p>
            </div>
            <button
              onClick={() => setShowApkGuide(false)}
              className={`w-full py-2 rounded-xl font-bold text-xs border ${
                isDark ? 'bg-white text-black border-white' : 'bg-black text-white border-black'
              }`}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* --- Confirmation Modal Before Restoring --- */}
      {showRestoreConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`rounded-3xl max-w-sm w-full p-5 border shadow-2xl space-y-3 ${
            isDark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-white border-neutral-200 text-black'
          }`}>
            <div className="w-10 h-10 rounded-full bg-neutral-800 text-white flex items-center justify-center mx-auto">
              <AlertTriangle className="w-5 h-5" />
            </div>

            <h3 className="font-bold text-sm text-center">
              Confirm Database Replacement
            </h3>
            <p className={`text-xs text-center ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>
              Restoring this file will <strong>replace all existing records</strong> on this phone with the contents of the backup file.
            </p>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  setShowRestoreConfirmModal(false);
                  setPendingBackupContent(null);
                }}
                className={`flex-1 py-2 rounded-xl font-bold text-xs border ${
                  isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-neutral-100 border-neutral-200 text-black'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRestore}
                className={`flex-1 py-2 rounded-xl font-bold text-xs border ${
                  isDark ? 'bg-white text-black border-white hover:bg-neutral-200' : 'bg-black text-white border-black hover:bg-neutral-800'
                }`}
              >
                Yes, Restore Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
