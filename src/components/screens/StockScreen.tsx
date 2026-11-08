/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Layers,
  Search,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Filter,
  Plus,
  Minus,
  Edit3,
  XCircle,
  HelpCircle
} from 'lucide-react';
import { Medicine, AppSettings } from '../../types/pharmacy';
import { StorageService } from '../../services/storage';

interface StockScreenProps {
  settings: AppSettings;
  onBack: () => void;
}

export const StockScreen: React.FC<StockScreenProps> = ({ settings, onBack }) => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [activeTab, setActiveTab] = useState<
    'all' | 'batch_wise' | 'low_stock' | 'out_of_stock' | 'negative' | 'near_expiry' | 'damaged'
  >('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Adjustment Modal
  const [selectedMedForAdjustment, setSelectedMedForAdjustment] = useState<Medicine | null>(null);
  const [adjustmentDelta, setAdjustmentDelta] = useState<number>(0);
  const [adjustmentReason, setAdjustmentReason] = useState('Manual physical count adjustment');

  useEffect(() => {
    loadMedicines();
  }, []);

  const loadMedicines = () => {
    setMedicines(StorageService.getMedicines());
  };

  const handleSaveAdjustment = () => {
    if (!selectedMedForAdjustment) return;
    const med = selectedMedForAdjustment;
    med.stockInPieces += adjustmentDelta;

    // Also adjust default batch if exists
    if (med.batches && med.batches.length > 0) {
      med.batches[0].stockInPieces += adjustmentDelta;
    }

    StorageService.saveMedicine(med);
    setSelectedMedForAdjustment(null);
    setAdjustmentDelta(0);
    loadMedicines();
  };

  const nowTime = Date.now();
  const nearExpiryThreshold = nowTime + settings.expiryWarningDays * 86400000;

  // Filter based on tab & query
  const filtered = medicines.filter(m => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.genericName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.company.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === 'low_stock') {
      return m.stockInPieces > 0 && m.stockInPieces <= (m.minStockAlert || 15);
    }
    if (activeTab === 'out_of_stock') {
      return m.stockInPieces === 0;
    }
    if (activeTab === 'negative') {
      return m.stockInPieces < 0; // Explicit negative stock
    }
    if (activeTab === 'near_expiry') {
      return m.batches?.some(b => new Date(b.expiryDate).getTime() <= nearExpiryThreshold);
    }
    return true;
  });

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
            <h1 className="text-base font-bold tracking-tight">Stock / Inventory</h1>
            <p className={`text-[11px] ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
              Base Unit: Pieces • Negative Stock: {settings.negativeStockAllowed ? 'ON' : 'OFF'}
            </p>
          </div>
        </div>

        <div className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg border ${
          isDark ? 'bg-neutral-900 border-neutral-800 text-neutral-300' : 'bg-neutral-100 border-neutral-300 text-neutral-700'
        }`}>
          Total Products: {medicines.length}
        </div>
      </div>

      <div className="p-4 space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search medicine stock..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 shadow-xs"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          {[
            { id: 'all', label: 'All Stock' },
            { id: 'batch_wise', label: 'Batch-wise' },
            { id: 'low_stock', label: 'Low Stock' },
            { id: 'negative', label: 'Negative Stock (ON)' },
            { id: 'out_of_stock', label: 'Out of Stock' },
            { id: 'near_expiry', label: 'Near Expiry' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-full font-semibold whitespace-nowrap transition ${
                activeTab === tab.id
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Negative Stock Explanation Alert */}
        <div className="p-3 bg-teal-50/70 border border-teal-200 rounded-xl text-xs text-teal-900 flex items-start gap-2">
          <HelpCircle className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
          <div>
            <strong>Negative Stock Rule (Active):</strong> If current stock is 10 and you sell 12, the
            sale is allowed and stock displays as <strong>-2</strong>. When subsequent purchases arrive,
            the balance is restored correctly.
          </div>
        </div>

        {/* Inventory Cards */}
        <div className="space-y-2.5">
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
              <Layers className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-xs font-medium">No stock records found for selected filter.</p>
            </div>
          ) : (
            filtered.map(med => {
              const isNegative = med.stockInPieces < 0;
              const isZero = med.stockInPieces === 0;
              const isLow = med.stockInPieces > 0 && med.stockInPieces <= (med.minStockAlert || 15);

              return (
                <div
                  key={med.id}
                  className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-2.5"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{med.name}</span>
                        <span className="text-[10px] px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded">
                          {med.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{med.genericName} • {med.company}</p>
                    </div>

                    {/* Stock Status Badge */}
                    <div className="text-right">
                      <div
                        className={`text-base font-black px-2.5 py-0.5 rounded-lg inline-block ${
                          isNegative
                            ? 'bg-red-100 text-red-800 border border-red-300 animate-pulse'
                            : isZero
                            ? 'bg-slate-100 text-slate-700'
                            : isLow
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {med.stockInPieces} Pcs
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {isNegative
                          ? 'Deficit (Negative Stock)'
                          : isZero
                          ? 'Out of Stock'
                          : isLow
                          ? 'Low Stock Warning'
                          : 'In Stock'}
                      </div>
                    </div>
                  </div>

                  {/* Batch Details if Batch-wise tab or available */}
                  {(activeTab === 'batch_wise' || med.batches?.length > 1) && (
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5 text-xs">
                      <span className="font-bold text-slate-700 block text-[11px]">
                        Batch-wise Breakdown ({med.batches.length}):
                      </span>
                      {med.batches.map(b => (
                        <div key={b.id} className="flex justify-between text-slate-600 font-mono text-[11px]">
                          <span>Batch: {b.batchNumber || 'Default'}</span>
                          <span>Exp: {b.expiryDate}</span>
                          <span className="font-bold text-slate-800">{b.stockInPieces} Pcs</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Adjustment Trigger */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                    <span className="text-[11px] text-slate-400 font-mono">
                      Rate: {settings.currency}{med.salePricePerPiece.toFixed(2)}/pc • Cost: {settings.currency}{med.purchasePricePerPiece.toFixed(2)}
                    </span>
                    <button
                      onClick={() => {
                        setSelectedMedForAdjustment(med);
                        setAdjustmentDelta(0);
                      }}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold text-[11px] flex items-center gap-1 transition"
                    >
                      <Edit3 className="w-3 h-3" /> Adjust Stock
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* --- Stock Adjustment Modal --- */}
      {selectedMedForAdjustment && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl space-y-3">
            <h3 className="font-bold text-sm text-slate-900">
              Manual Stock Adjustment
            </h3>
            <p className="text-xs text-slate-600">
              {selectedMedForAdjustment.name} (Current: <strong>{selectedMedForAdjustment.stockInPieces} Pcs</strong>)
            </p>

            <div className="space-y-2 text-xs">
              <div>
                <label className="text-slate-600 font-semibold block mb-1">
                  Stock Change (+ to add, - to subtract in pieces):
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustmentDelta(adjustmentDelta - 10)}
                    className="px-2.5 py-1 bg-slate-100 rounded-lg font-bold text-rose-600"
                  >
                    -10
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustmentDelta(adjustmentDelta - 1)}
                    className="px-2.5 py-1 bg-slate-100 rounded-lg font-bold text-rose-600"
                  >
                    -1
                  </button>
                  <input
                    type="number"
                    value={adjustmentDelta}
                    onChange={e => setAdjustmentDelta(parseInt(e.target.value) || 0)}
                    className="flex-1 text-center font-bold bg-slate-50 border border-slate-300 rounded-lg p-1"
                  />
                  <button
                    type="button"
                    onClick={() => setAdjustmentDelta(adjustmentDelta + 1)}
                    className="px-2.5 py-1 bg-slate-100 rounded-lg font-bold text-emerald-600"
                  >
                    +1
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustmentDelta(adjustmentDelta + 10)}
                    className="px-2.5 py-1 bg-slate-100 rounded-lg font-bold text-emerald-600"
                  >
                    +10
                  </button>
                </div>
              </div>

              <div>
                <label className="text-slate-600 font-semibold block mb-1">Reason / Note:</label>
                <select
                  value={adjustmentReason}
                  onChange={e => setAdjustmentReason(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                >
                  <option value="Manual physical count adjustment">Manual physical count adjustment</option>
                  <option value="Damaged / Broken medicine write-off">Damaged / Broken medicine write-off</option>
                  <option value="Expired medicine removal">Expired medicine removal</option>
                  <option value="Sample received from representative">Sample received from representative</option>
                </select>
              </div>

              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex justify-between font-bold text-xs">
                <span>New Resulting Stock:</span>
                <span className="text-teal-700">
                  {selectedMedForAdjustment.stockInPieces + adjustmentDelta} Pieces
                </span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setSelectedMedForAdjustment(null)}
                className="flex-1 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAdjustment}
                className="flex-1 py-2 bg-teal-600 text-white font-bold rounded-xl text-xs hover:bg-teal-700"
              >
                Apply Adjustment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
