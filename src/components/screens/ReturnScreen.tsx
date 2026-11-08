/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  RotateCcw,
  Plus,
  Search,
  CheckCircle,
  AlertTriangle,
  X,
  FileText
} from 'lucide-react';
import { ReturnRecord, AppSettings, Medicine, UnitType } from '../../types/pharmacy';
import { StorageService } from '../../services/storage';

interface ReturnScreenProps {
  settings: AppSettings;
  onBack: () => void;
}

export const ReturnScreen: React.FC<ReturnScreenProps> = ({ settings, onBack }) => {
  const [returns, setReturns] = useState<ReturnRecord[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  // Return Form
  const [returnType, setReturnType] = useState<'sale_return' | 'purchase_return'>('sale_return');
  const [referenceInvoiceNo, setReferenceInvoiceNo] = useState('');
  const [partyName, setPartyName] = useState('');
  const [selectedMedId, setSelectedMedId] = useState('');
  const [unit, setUnit] = useState<UnitType>('strip');
  const [quantity, setQuantity] = useState<number>(1);
  const [refundAmount, setRefundAmount] = useState<number>(0);
  const [reason, setReason] = useState('Patient recovery / unused dosage');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setReturns(StorageService.getReturns());
    const meds = StorageService.getMedicines();
    setMedicines(meds);
    if (meds.length > 0) {
      setSelectedMedId(meds[0].id);
      setRefundAmount(meds[0].salePricePerPiece * 10);
    }
  };

  const selectedMed = medicines.find(m => m.id === selectedMedId);

  const getMultiplier = (u: UnitType, med?: Medicine): number => {
    if (!med) return 1;
    if (u === 'strip') return med.conversion.piecesPerStrip || 10;
    if (u === 'box') return med.conversion.piecesPerBox || 100;
    return 1;
  };

  const handleSaveReturn = () => {
    if (!selectedMed || refundAmount <= 0) {
      alert('Please select medicine and valid refund amount.');
      return;
    }

    const mult = getMultiplier(unit, selectedMed);
    const totalPieces = quantity * mult;

    const newReturn: ReturnRecord = {
      id: 'ret-' + Date.now(),
      type: returnType,
      referenceInvoiceNo: referenceInvoiceNo.trim() || `REF-${Date.now().toString().slice(-4)}`,
      date: new Date().toISOString(),
      partyName: partyName.trim() || (returnType === 'sale_return' ? 'Retail Customer' : 'Company Depot'),
      medicineId: selectedMed.id,
      medicineName: selectedMed.name,
      quantity,
      unit,
      totalPieces,
      unitPrice: refundAmount / quantity,
      refundAmount,
      reason
    };

    StorageService.processReturn(newReturn);
    setShowAddModal(false);
    loadData();
    alert(`Return processed! Stock for "${selectedMed.name}" has been adjusted by ${totalPieces} pieces.`);
  };

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
            <h1 className="text-base font-bold tracking-tight">Return Management</h1>
            <p className={`text-[11px] ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
              Sales Return &amp; Purchase Return
            </p>
          </div>
        </div>

        {settings.returnsEnabled && (
          <button
            onClick={() => setShowAddModal(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs border shadow-xs transition active:scale-95 ${
              isDark ? 'bg-white text-black border-white hover:bg-neutral-200' : 'bg-black text-white border-black hover:bg-neutral-800'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Process Return</span>
          </button>
        )}
      </div>

      <div className="p-4 space-y-3">
        {/* Policy notice */}
        {settings.returnNoticeBangla && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-center">
            <span className="text-xs font-bold text-rose-800 font-['Hind_Siliguri',sans-serif]">
              {settings.returnNoticeBangla}
            </span>
          </div>
        )}

        {/* Returns History */}
        <div className="space-y-2.5">
          {returns.length === 0 ? (
            <div className="py-16 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
              <RotateCcw className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-xs font-medium">No return transactions recorded.</p>
            </div>
          ) : (
            returns.map(ret => (
              <div
                key={ret.id}
                className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        ret.type === 'sale_return'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {ret.type === 'sale_return' ? 'SALES RETURN (+STOCK)' : 'PURCHASE RETURN (-STOCK)'}
                    </span>
                    <span className="text-xs font-extrabold text-slate-900">{ret.medicineName}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Party: <strong>{ret.partyName}</strong> • Ref: {ret.referenceInvoiceNo}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Reason: {ret.reason} • Qty: {ret.quantity} {ret.unit} ({ret.totalPieces} Pcs)
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-black text-rose-700">
                    {settings.currency}{ret.refundAmount.toFixed(2)}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {new Date(ret.date).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* --- Add Return Modal --- */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl space-y-3">
            <h3 className="font-bold text-sm text-slate-900">Process Return</h3>
            <p className="text-xs text-slate-500">Automatically recalculates stock &amp; finances.</p>

            <div className="space-y-2 text-xs">
              <div>
                <label className="text-slate-600 font-semibold block mb-1">Return Type:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setReturnType('sale_return')}
                    className={`py-2 rounded-xl font-bold text-xs border ${
                      returnType === 'sale_return'
                        ? 'bg-rose-50 border-rose-500 text-rose-900'
                        : 'bg-white border-slate-200 text-slate-700'
                    }`}
                  >
                    Customer Return
                  </button>
                  <button
                    type="button"
                    onClick={() => setReturnType('purchase_return')}
                    className={`py-2 rounded-xl font-bold text-xs border ${
                      returnType === 'purchase_return'
                        ? 'bg-blue-50 border-blue-500 text-blue-900'
                        : 'bg-white border-slate-200 text-slate-700'
                    }`}
                  >
                    Supplier Return
                  </button>
                </div>
              </div>

              <div>
                <label className="text-slate-600 font-semibold block mb-1">Select Medicine:</label>
                <select
                  value={selectedMedId}
                  onChange={e => setSelectedMedId(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                >
                  {medicines.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.genericName})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-600 block mb-1">Unit:</label>
                  <select
                    value={unit}
                    onChange={e => setUnit(e.target.value as any)}
                    className="w-full p-1.5 bg-slate-50 border border-slate-300 rounded-lg uppercase font-bold"
                  >
                    <option value="strip">Strip</option>
                    <option value="piece">Piece</option>
                    <option value="box">Box</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-600 block mb-1">Quantity:</label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={e => setQuantity(parseInt(e.target.value) || 1)}
                    className="w-full p-1.5 bg-slate-50 border border-slate-300 rounded-lg text-center font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-600 font-semibold block mb-1">Refund Amount ({settings.currency}):</label>
                <input
                  type="number"
                  step="any"
                  value={refundAmount || ''}
                  onChange={e => setRefundAmount(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="text-slate-600 font-semibold block mb-1">Party Name (Customer/Supplier):</label>
                <input
                  type="text"
                  value={partyName}
                  onChange={e => setPartyName(e.target.value)}
                  placeholder="e.g. Walking Customer or Beximco Depot"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="text-slate-600 font-semibold block mb-1">Original Invoice # (Optional):</label>
                <input
                  type="text"
                  value={referenceInvoiceNo}
                  onChange={e => setReferenceInvoiceNo(e.target.value)}
                  placeholder="INV-XXXX"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="text-slate-600 font-semibold block mb-1">Reason for Return:</label>
                <select
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                >
                  <option value="Patient recovery / unused dosage">Patient recovery / unused dosage</option>
                  <option value="Wrong medicine purchased">Wrong medicine purchased</option>
                  <option value="Doctor altered prescription">Doctor altered prescription</option>
                  <option value="Expired / Defective strip">Expired / Defective strip</option>
                </select>
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
                onClick={handleSaveReturn}
                className="flex-1 py-2 bg-rose-700 text-white font-bold rounded-xl text-xs hover:bg-rose-800"
              >
                Confirm Return
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
