/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  FolderSync,
  Folder,
  FolderOpen,
  Plus,
  Calendar,
  X,
  Building2,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { ExpiryDeliveryRecord, AppSettings, UnitType } from '../../types/pharmacy';
import { StorageService } from '../../services/storage';

interface ExpiryDeliveryScreenProps {
  settings: AppSettings;
  onBack: () => void;
}

export const ExpiryDeliveryScreen: React.FC<ExpiryDeliveryScreenProps> = ({ settings, onBack }) => {
  const isDark = settings.theme === 'dark';
  const [records, setRecords] = useState<ExpiryDeliveryRecord[]>([]);
  const [selectedCompanyFolder, setSelectedCompanyFolder] = useState<string | null>(null);

  // Add Expiry Delivery Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [companyName, setCompanyName] = useState('Beximco Pharmaceuticals');
  const [medicineName, setMedicineName] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [quantity, setQuantity] = useState<number>(10);
  const [unit, setUnit] = useState<UnitType>('strip');
  const [totalReturnAmount, setTotalReturnAmount] = useState<number>(0);
  const [supplierName, setSupplierName] = useState('');
  const [deliveryDate, setDeliveryDate] = useState(new Date().toISOString().split('T')[0]);

  // Record Payment Modal
  const [selectedRecordForPayment, setSelectedRecordForPayment] = useState<ExpiryDeliveryRecord | null>(null);
  const [receiveAmount, setReceiveAmount] = useState<number>(0);
  const [paymentNote, setPaymentNote] = useState('');

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = () => {
    setRecords(StorageService.getExpiryDeliveries());
  };

  const handleSaveRecord = () => {
    if (!companyName.trim() || !medicineName.trim() || totalReturnAmount <= 0) {
      alert('Company name, medicine name, and total return amount are required.');
      return;
    }

    const newRecord: ExpiryDeliveryRecord = {
      id: 'ed-' + Date.now(),
      companyName: companyName.trim(),
      medicineName: medicineName.trim(),
      batchNumber: batchNumber.trim(),
      quantity,
      unit,
      totalPieces: quantity * (unit === 'strip' ? 10 : unit === 'box' ? 100 : 1),
      deliveryDate,
      totalReturnAmount,
      supplierName: supplierName.trim() || 'Direct Company Return',
      amountReceived: 0,
      remainingDue: totalReturnAmount,
      status: 'unpaid',
      payments: [],
      createdAt: new Date().toISOString()
    };

    StorageService.saveExpiryDelivery(newRecord);
    setShowAddModal(false);
    setMedicineName('');
    setBatchNumber('');
    setTotalReturnAmount(0);
    loadRecords();
  };

  const handleCollectCompanyPayment = () => {
    if (!selectedRecordForPayment || receiveAmount <= 0) return;
    StorageService.recordExpiryDeliveryPayment(selectedRecordForPayment.id, receiveAmount, paymentNote);
    setSelectedRecordForPayment(null);
    setReceiveAmount(0);
    setPaymentNote('');
    loadRecords();
  };

  // Group records into folders based on Company Name
  const companyFolders = records.reduce<Record<string, ExpiryDeliveryRecord[]>>((acc, r) => {
    const comp = r.companyName || 'General Company';
    if (!acc[comp]) acc[comp] = [];
    acc[comp].push(r);
    return acc;
  }, {});

  const companyList = Object.keys(companyFolders);

  return (
    <div className={`min-h-full flex flex-col pb-20 ${isDark ? 'bg-black text-white' : 'bg-white text-black'}`}>
      {/* Header - Minimalist Monochrome */}
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
            <h1 className="text-base font-bold">Expiry Delivery</h1>
            <p className={`text-[11px] ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
              Organized in Company Folders
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs border transition ${
            isDark
              ? 'bg-white text-black border-white hover:bg-neutral-200'
              : 'bg-black text-white border-black hover:bg-neutral-800'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>New Delivery</span>
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Navigation Breadcrumb / Folder Selector */}
        {selectedCompanyFolder ? (
          <div className={`flex items-center justify-between p-3 rounded-2xl border ${
            isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-neutral-50 border-neutral-200'
          }`}>
            <div className="flex items-center gap-2.5">
              <FolderOpen className="w-5 h-5" />
              <div>
                <span className={`text-[10px] font-bold uppercase tracking-wider block ${
                  isDark ? 'text-neutral-400' : 'text-neutral-500'
                }`}>Company Folder:</span>
                <h3 className="text-sm font-extrabold">{selectedCompanyFolder}</h3>
              </div>
            </div>
            <button
              onClick={() => setSelectedCompanyFolder(null)}
              className={`px-3 py-1.5 border font-bold text-xs rounded-xl transition ${
                isDark ? 'bg-neutral-800 border-neutral-700 text-white hover:bg-neutral-700' : 'bg-white border-neutral-300 text-black hover:bg-neutral-100'
              }`}
            >
              All Folders
            </button>
          </div>
        ) : (
          <div>
            <h2 className={`text-xs font-bold uppercase tracking-wider mb-2.5 ${
              isDark ? 'text-neutral-400' : 'text-neutral-600'
            }`}>
              Company Folders ({companyList.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {companyList.length === 0 ? (
                <div className={`col-span-full py-14 text-center rounded-2xl border ${
                  isDark ? 'bg-neutral-950 border-neutral-800 text-neutral-500' : 'bg-neutral-50 border-neutral-200 text-neutral-400'
                }`}>
                  <FolderSync className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-xs font-medium">No expiry delivery records yet.</p>
                  <p className="text-[11px] mt-1">
                    Tap "New Delivery" to create a company return folder.
                  </p>
                </div>
              ) : (
                companyList.map(comp => {
                  const recs = companyFolders[comp];
                  const totalReturn = recs.reduce((sum, r) => sum + r.totalReturnAmount, 0);
                  const totalDue = recs.reduce((sum, r) => sum + r.remainingDue, 0);

                  return (
                    <div
                      key={comp}
                      onClick={() => setSelectedCompanyFolder(comp)}
                      className={`p-4 rounded-2xl border cursor-pointer flex items-center justify-between transition ${
                        isDark
                          ? 'bg-neutral-950 border-neutral-800 hover:border-neutral-600'
                          : 'bg-white border-neutral-200 hover:border-neutral-400 shadow-xs'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${
                          isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-neutral-100 border-neutral-200'
                        }`}>
                          <Folder className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-extrabold">{comp}</h4>
                          <span className={`text-[11px] font-semibold ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                            {recs.length} {recs.length === 1 ? 'Record' : 'Records'}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xs font-bold font-mono">
                          {settings.currency}{totalReturn.toFixed(2)}
                        </div>
                        {totalDue > 0 ? (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border block mt-1 ${
                            isDark ? 'bg-neutral-900 border-neutral-700 text-white' : 'bg-neutral-100 border-neutral-300 text-black'
                          }`}>
                            Due: {settings.currency}{totalDue.toFixed(2)}
                          </span>
                        ) : (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border block mt-1 ${
                            isDark ? 'bg-neutral-900 border-neutral-700 text-neutral-400' : 'bg-neutral-100 border-neutral-200 text-neutral-600'
                          }`}>
                            Full Paid
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Records inside Selected Company Folder */}
        {selectedCompanyFolder && (
          <div className="space-y-3">
            <h3 className={`text-xs font-bold uppercase tracking-wider ${
              isDark ? 'text-neutral-400' : 'text-neutral-600'
            }`}>
              Delivery Records in {selectedCompanyFolder} ({companyFolders[selectedCompanyFolder]?.length || 0})
            </h3>

            <div className="space-y-2.5">
              {companyFolders[selectedCompanyFolder]?.map(rec => (
                <div
                  key={rec.id}
                  className={`p-4 rounded-2xl border space-y-2.5 ${
                    isDark ? 'bg-neutral-950 border-neutral-800' : 'bg-white border-neutral-200 shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold">{rec.medicineName}</span>
                        {rec.batchNumber && (
                          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                            isDark ? 'bg-neutral-900 border-neutral-800 text-neutral-400' : 'bg-neutral-100 border-neutral-200 text-neutral-600'
                          }`}>
                            Batch: {rec.batchNumber}
                          </span>
                        )}
                      </div>
                      <div className={`text-[11px] mt-0.5 ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                        Delivered on: {rec.deliveryDate} • Supplier: <strong>{rec.supplierName}</strong>
                      </div>
                      <div className={`text-[11px] font-medium ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>
                        Qty: {rec.quantity} {rec.unit.toUpperCase()} ({rec.totalPieces} Pieces)
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-black font-mono">
                        {settings.currency}{rec.totalReturnAmount.toFixed(2)}
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border inline-block mt-1 ${
                          isDark
                            ? 'bg-neutral-900 border-neutral-700 text-white'
                            : 'bg-neutral-100 border-neutral-300 text-black'
                        }`}
                      >
                        {rec.status.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Payment Breakdown Bar */}
                  <div className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                    isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-neutral-50 border-neutral-200'
                  }`}>
                    <div>
                      <span className={isDark ? 'text-neutral-400' : 'text-neutral-500'}>Received: </span>
                      <strong className="font-mono">{settings.currency}{rec.amountReceived.toFixed(2)}</strong>
                    </div>
                    {rec.remainingDue > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="font-bold font-mono">
                          Due: {settings.currency}{rec.remainingDue.toFixed(2)}
                        </span>
                        <button
                          onClick={() => {
                            setSelectedRecordForPayment(rec);
                            setReceiveAmount(rec.remainingDue);
                          }}
                          className={`px-2.5 py-1 rounded-lg font-bold text-[10px] border transition ${
                            isDark
                              ? 'bg-white text-black border-white hover:bg-neutral-200'
                              : 'bg-black text-white border-black hover:bg-neutral-800'
                          }`}
                        >
                          Collect Money
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Payment history */}
                  {rec.payments?.length > 0 && (
                    <div className={`text-[10px] space-y-0.5 pt-1.5 border-t ${
                      isDark ? 'border-neutral-800 text-neutral-400' : 'border-neutral-100 text-neutral-500'
                    }`}>
                      <span className="font-semibold block">Settlement History:</span>
                      {rec.payments.map((p, i) => (
                        <div key={i} className="flex justify-between font-mono">
                          <span>{new Date(p.date).toLocaleDateString()} • {p.notes || 'Received'}</span>
                          <span className="font-bold">+{settings.currency}{p.amount.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* --- Add Expiry Delivery Modal --- */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3">
          <div className={`rounded-3xl max-w-sm w-full p-5 border shadow-2xl space-y-3.5 ${
            isDark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-white border-neutral-200 text-black'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">Record Expiry Delivery</h3>
                <p className={`text-xs ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                  Grouped into company folders for settlement.
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className={`p-1 rounded-lg border ${
                  isDark ? 'border-neutral-800 bg-neutral-900 text-white' : 'border-neutral-200 bg-neutral-50 text-black'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <label className={`font-semibold block mb-1 ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>Company Name *</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  placeholder="e.g. Beximco / Square / Incepta"
                  className={`w-full p-2 border rounded-xl font-bold ${
                    isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-neutral-50 border-neutral-300 text-black'
                  }`}
                />
              </div>
              <div>
                <label className={`font-semibold block mb-1 ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>Medicine Name *</label>
                <input
                  type="text"
                  value={medicineName}
                  onChange={e => setMedicineName(e.target.value)}
                  placeholder="e.g. Napa Extra / Seclo 20"
                  className={`w-full p-2 border rounded-xl ${
                    isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-neutral-50 border-neutral-300 text-black'
                  }`}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={`block mb-1 ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>Quantity:</label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={e => setQuantity(parseInt(e.target.value) || 1)}
                    className={`w-full p-2 border rounded-xl text-center font-bold ${
                      isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-neutral-50 border-neutral-300 text-black'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block mb-1 ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>Unit:</label>
                  <select
                    value={unit}
                    onChange={e => setUnit(e.target.value as any)}
                    className={`w-full p-2 border rounded-xl uppercase font-bold ${
                      isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-neutral-50 border-neutral-300 text-black'
                    }`}
                  >
                    <option value="strip">Strip</option>
                    <option value="box">Box</option>
                    <option value="piece">Piece</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={`font-semibold block mb-1 ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>
                  Total Return Amount ({settings.currency}) *
                </label>
                <input
                  type="number"
                  step="any"
                  value={totalReturnAmount || ''}
                  onChange={e => setTotalReturnAmount(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className={`w-full p-2 border rounded-xl font-bold font-mono ${
                    isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-neutral-50 border-neutral-300 text-black'
                  }`}
                />
              </div>
              <div>
                <label className={`font-semibold block mb-1 ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>Supplier Sent Through:</label>
                <input
                  type="text"
                  value={supplierName}
                  onChange={e => setSupplierName(e.target.value)}
                  placeholder="e.g. Beximco Depot Representative"
                  className={`w-full p-2 border rounded-xl ${
                    isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-neutral-50 border-neutral-300 text-black'
                  }`}
                />
              </div>
              <div>
                <label className={`font-semibold block mb-1 ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>Delivery Date:</label>
                <input
                  type="date"
                  value={deliveryDate}
                  onChange={e => setDeliveryDate(e.target.value)}
                  className={`w-full p-2 border rounded-xl ${
                    isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-neutral-50 border-neutral-300 text-black'
                  }`}
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowAddModal(false)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold border ${
                  isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-neutral-100 border-neutral-200 text-black'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveRecord}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold border ${
                  isDark ? 'bg-white text-black border-white hover:bg-neutral-200' : 'bg-black text-white border-black hover:bg-neutral-800'
                }`}
              >
                Save Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Collect Company Payment Modal --- */}
      {selectedRecordForPayment && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`rounded-3xl max-w-sm w-full p-5 border shadow-2xl space-y-3.5 ${
            isDark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-white border-neutral-200 text-black'
          }`}>
            <h3 className="font-bold text-sm">Record Company Refund</h3>
            <p className={`text-xs ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
              Company: <strong>{selectedRecordForPayment.companyName}</strong> (Due: <strong>{settings.currency}{selectedRecordForPayment.remainingDue.toFixed(2)}</strong>)
            </p>

            <div className="space-y-2.5 text-xs">
              <div>
                <label className={`font-semibold block mb-1 ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>
                  Amount Received ({settings.currency}):
                </label>
                <input
                  type="number"
                  min="1"
                  max={selectedRecordForPayment.remainingDue}
                  value={receiveAmount || ''}
                  onChange={e => setReceiveAmount(parseFloat(e.target.value) || 0)}
                  className={`w-full p-2 border rounded-xl font-bold font-mono ${
                    isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-neutral-50 border-neutral-300 text-black'
                  }`}
                />
              </div>
              <div>
                <label className={`font-semibold block mb-1 ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>
                  Note / Settlement Voucher:
                </label>
                <input
                  type="text"
                  value={paymentNote}
                  onChange={e => setPaymentNote(e.target.value)}
                  placeholder="e.g. Credit memo adjustment"
                  className={`w-full p-2 border rounded-xl ${
                    isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-neutral-50 border-neutral-300 text-black'
                  }`}
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setSelectedRecordForPayment(null)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold border ${
                  isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-neutral-100 border-neutral-200 text-black'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleCollectCompanyPayment}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold border ${
                  isDark ? 'bg-white text-black border-white hover:bg-neutral-200' : 'bg-black text-white border-black hover:bg-neutral-800'
                }`}
              >
                Save Settlement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
