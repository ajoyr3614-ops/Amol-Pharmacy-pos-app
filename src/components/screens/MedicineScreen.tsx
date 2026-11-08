/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Plus,
  Search,
  Package,
  Layers,
  Calendar,
  AlertTriangle,
  Edit2,
  Trash2,
  Barcode as BarcodeIcon,
  X,
  Check,
  Tag
} from 'lucide-react';
import { Medicine, MedicineBatch, AppSettings, UnitConversion } from '../../types/pharmacy';
import { StorageService } from '../../services/storage';
import { BarcodeService } from '../../services/barcode';

import { CameraBarcodeScannerModal } from '../CameraBarcodeScannerModal';

interface MedicineScreenProps {
  settings: AppSettings;
  onBack: () => void;
  onPrintBarcodeSticker?: (med: Medicine) => void;
  initialBarcodeToAdd?: string | null;
  onClearInitialBarcode?: () => void;
}

export const MedicineScreen: React.FC<MedicineScreenProps> = ({
  settings,
  onBack,
  onPrintBarcodeSticker,
  initialBarcodeToAdd,
  onClearInitialBarcode
}) => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [genericName, setGenericName] = useState('');
  const [category, setCategory] = useState('Tablet');
  const [company, setCompany] = useState('');
  const [barcode, setBarcode] = useState('');
  const [purchasePrice, setPurchasePrice] = useState<number>(0);
  const [salePrice, setSalePrice] = useState<number>(0);
  const [stockQuantity, setStockQuantity] = useState<number>(0);
  const [piecesPerStrip, setPiecesPerStrip] = useState<number>(10);
  const [piecesPerBox, setPiecesPerBox] = useState<number>(100);
  const [minStockAlert, setMinStockAlert] = useState<number>(15);

  // Multi-Batch state in Add/Edit modal
  const [batches, setBatches] = useState<MedicineBatch[]>([]);

  useEffect(() => {
    loadMedicines();
  }, []);

  useEffect(() => {
    if (initialBarcodeToAdd) {
      setEditingMedicine(null);
      setName('');
      setGenericName('');
      setCategory('Tablet');
      setCompany('');
      setBarcode(initialBarcodeToAdd);
      setPurchasePrice(0);
      setSalePrice(0);
      setStockQuantity(0);
      setPiecesPerStrip(10);
      setPiecesPerBox(100);
      setMinStockAlert(15);
      setBatches([]);
      setShowAddEditModal(true);
      onClearInitialBarcode?.();
    }
  }, [initialBarcodeToAdd, onClearInitialBarcode]);

  const loadMedicines = () => {
    setMedicines(StorageService.getMedicines());
  };

  const openAddModal = () => {
    setEditingMedicine(null);
    setName('');
    setGenericName('');
    setCategory('Tablet');
    setCompany('');
    setBarcode(BarcodeService.generateBarcodeNumber());
    setPurchasePrice(0);
    setSalePrice(0);
    setStockQuantity(0);
    setPiecesPerStrip(10);
    setPiecesPerBox(100);
    setMinStockAlert(15);
    setBatches([]);
    setShowAddEditModal(true);
  };

  const openEditModal = (med: Medicine) => {
    setEditingMedicine(med);
    setName(med.name);
    setGenericName(med.genericName);
    setCategory(med.category);
    setCompany(med.company);
    setBarcode(med.barcode);
    setPurchasePrice(med.purchasePricePerPiece);
    setSalePrice(med.salePricePerPiece);
    setStockQuantity(med.stockInPieces);
    setPiecesPerStrip(med.conversion.piecesPerStrip || 10);
    setPiecesPerBox(med.conversion.piecesPerBox || 100);
    setMinStockAlert(med.minStockAlert || 15);
    setBatches(med.batches || []);
    setShowAddEditModal(true);
  };

  const handleAddBatchRow = () => {
    const newBatch: MedicineBatch = {
      id: 'batch-' + Date.now(),
      batchNumber: '', // Optional!
      expiryDate: new Date(Date.now() + 86400000 * 365).toISOString().split('T')[0],
      purchasePricePerPiece: purchasePrice || 0,
      stockInPieces: 50,
      createdAt: new Date().toISOString()
    };
    setBatches([...batches, newBatch]);
  };

  const handleRemoveBatchRow = (id: string) => {
    setBatches(batches.filter(b => b.id !== id));
  };

  const handleSaveMedicine = () => {
    if (!name.trim()) {
      alert('Product name is required.');
      return;
    }

    // Auto calculate stock in pieces from batches if batches exist
    let totalStock = stockQuantity;
    if (batches.length > 0) {
      totalStock = batches.reduce((sum, b) => sum + (b.stockInPieces || 0), 0);
    }

    const conversion: UnitConversion = {
      piecesPerStrip: piecesPerStrip || 10,
      piecesPerBox: piecesPerBox || 100
    };

    const newMed: Medicine = {
      id: editingMedicine ? editingMedicine.id : 'med-' + Date.now(),
      name: name.trim(),
      genericName: genericName.trim() || 'General',
      category,
      company: company.trim() || 'General Pharma',
      barcode: barcode.trim() || BarcodeService.generateBarcodeNumber(),
      purchasePricePerPiece: purchasePrice,
      salePricePerPiece: salePrice,
      stockInPieces: totalStock,
      conversion,
      minStockAlert,
      batches: batches.length > 0 ? batches : [
        {
          id: 'batch-default-' + Date.now(),
          batchNumber: '',
          expiryDate: new Date(Date.now() + 86400000 * 365).toISOString().split('T')[0],
          purchasePricePerPiece: purchasePrice,
          stockInPieces: totalStock,
          createdAt: new Date().toISOString()
        }
      ],
      createdAt: editingMedicine ? editingMedicine.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    StorageService.saveMedicine(newMed);
    setShowAddEditModal(false);
    loadMedicines();
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this medicine?')) {
      StorageService.deleteMedicine(id);
      loadMedicines();
    }
  };

  // Filter medicines
  const filtered = medicines.filter(m => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.genericName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.barcode.includes(searchQuery);
    const matchesCat = selectedCategory === 'all' || m.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const categories = ['all', 'Tablet', 'Capsule', 'Syrup', 'Injection', 'Ointment', 'Eye Drop', 'Suspension'];

  const isDark = settings.theme === 'dark';

  return (
    <div className={`min-h-full flex flex-col pb-20 ${isDark ? 'bg-black text-white' : 'bg-neutral-100 text-black'}`}>
      {/* Top Header */}
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
            <h1 className="text-base font-bold tracking-tight">Medicine &amp; Products</h1>
            <p className={`text-[11px] ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
              Multi-Batch &amp; Unit Conversions
            </p>
          </div>
        </div>

        <button
          onClick={openAddModal}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs border shadow-xs transition active:scale-95 ${
            isDark ? 'bg-white text-black border-white hover:bg-neutral-200' : 'bg-black text-white border-black hover:bg-neutral-800'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>Add Medicine</span>
        </button>
      </div>

      {/* Search & Category Filter */}
      <div className="p-4 flex flex-col gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by medicine, generic name, company or barcode..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 shadow-xs"
          />
        </div>

        {/* Categories Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Medicines List */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
              <Package className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-xs font-medium">No medicines found matching criteria.</p>
            </div>
          ) : (
            filtered.map(med => {
              const isLow = med.stockInPieces <= (med.minStockAlert || 15);
              return (
                <div
                  key={med.id}
                  className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-2.5 transition hover:shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
                          {med.category}
                        </span>
                        <span className="text-xs font-bold text-slate-900">{med.name}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{med.genericName}</p>
                      <p className="text-[11px] text-teal-700 font-medium">{med.company}</p>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-extrabold text-slate-900">
                        {settings.currency}{med.salePricePerPiece.toFixed(2)} / pc
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Cost: {settings.currency}{med.purchasePricePerPiece.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {/* Stock & Unit Conversions Badge */}
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">Total Stock:</span>
                      <span
                        className={`font-black px-2 py-0.5 rounded ${
                          isLow
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {med.stockInPieces} Pcs
                        {med.conversion.piecesPerStrip > 1 && (
                          <span className="font-normal text-[10px] text-slate-600 ml-1">
                            (~{(med.stockInPieces / med.conversion.piecesPerStrip).toFixed(1)} strips)
                          </span>
                        )}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-600 font-mono">
                      Barcode: {med.barcode}
                    </div>
                  </div>

                  {/* Batches Preview */}
                  {med.batches && med.batches.length > 0 && (
                    <div className="text-[11px] text-slate-600 flex flex-wrap gap-1.5">
                      <span className="font-semibold text-slate-700">Batches ({med.batches.length}):</span>
                      {med.batches.map(b => (
                        <span
                          key={b.id}
                          className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px] text-slate-700 font-mono"
                        >
                          {b.batchNumber || 'Default'} • Exp: {b.expiryDate} • {b.stockInPieces} pcs
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Action Bar */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                    <div className="text-[10px] text-slate-400">
                      1 Strip = {med.conversion.piecesPerStrip} pcs • 1 Box = {med.conversion.piecesPerBox} pcs
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(med)}
                        className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition"
                        title="Edit Medicine"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(med.id)}
                        className="p-1.5 hover:bg-rose-50 rounded-lg text-rose-600 transition"
                        title="Delete Medicine"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* --- Add / Edit Medicine Modal --- */}
      {showAddEditModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 bg-gradient-to-r from-teal-700 to-emerald-700 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">
                  {editingMedicine ? 'Edit Medicine' : 'Add New Medicine'}
                </h3>
                <p className="text-xs text-teal-100">Multi-Batch &amp; Piece/Strip/Box Units</p>
              </div>
              <button
                onClick={() => setShowAddEditModal(false)}
                className="p-1 text-white hover:bg-white/20 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3.5 text-xs">
              {/* Product Name & Generic */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Product Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Napa Extra 500mg+65mg"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Generic Name</label>
                  <input
                    type="text"
                    value={genericName}
                    onChange={e => setGenericName(e.target.value)}
                    placeholder="e.g. Paracetamol + Caffeine"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              {/* Category & Company */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                  >
                    {categories.filter(c => c !== 'all').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Company / Manufacturer</label>
                  <input
                    type="text"
                    value={company}
                    onChange={e => setCompany(e.target.value)}
                    placeholder="e.g. Square Pharmaceuticals"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              {/* Barcode & Auto Generate */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700">Barcode (Unique)</label>
                  <button
                    type="button"
                    onClick={() => setBarcode(BarcodeService.generateBarcodeNumber())}
                    className="text-[11px] text-teal-700 font-bold hover:underline"
                  >
                    Generate New Barcode
                  </button>
                </div>
                <input
                  type="text"
                  value={barcode}
                  onChange={e => setBarcode(e.target.value)}
                  placeholder="Scan or enter barcode..."
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs"
                />
              </div>

              {/* Pricing (Base: Per Piece) */}
              <div className="p-3 bg-teal-50/60 rounded-2xl border border-teal-200">
                <span className="font-extrabold text-teal-900 block mb-2">Base Pricing (Per Piece)</span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-600 block mb-1 font-semibold">Purchase Price ({settings.currency}):</label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={purchasePrice || ''}
                      onChange={e => setPurchasePrice(parseFloat(e.target.value) || 0)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-xl font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 block mb-1 font-semibold">Sale Price ({settings.currency}):</label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={salePrice || ''}
                      onChange={e => setSalePrice(parseFloat(e.target.value) || 0)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-xl font-bold text-teal-700"
                    />
                  </div>
                </div>
              </div>

              {/* Unit Conversion Settings */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="font-extrabold text-slate-800 block mb-2">
                  Unit Conversion Settings (Configurable per Medicine)
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-600 block mb-1 font-medium">1 Strip = (Pieces):</label>
                    <input
                      type="number"
                      min="1"
                      value={piecesPerStrip}
                      onChange={e => setPiecesPerStrip(parseInt(e.target.value) || 1)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-xl font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 block mb-1 font-medium">1 Box = (Pieces):</label>
                    <input
                      type="number"
                      min="1"
                      value={piecesPerBox}
                      onChange={e => setPiecesPerBox(parseInt(e.target.value) || 1)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-xl font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Multi-Batch System Section */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="font-extrabold text-slate-800">Multi-Batch System</span>
                    <p className="text-[10px] text-slate-500">
                      Batch number is optional. Each batch stores its own expiry, cost and stock.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddBatchRow}
                    className="px-2.5 py-1 bg-teal-600 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 hover:bg-teal-700"
                  >
                    <Plus className="w-3 h-3" /> Add Batch
                  </button>
                </div>

                {batches.length === 0 ? (
                  <div>
                    <label className="text-slate-600 block mb-1 font-medium">
                      Direct Stock Quantity (In Pieces):
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={stockQuantity}
                      onChange={e => setStockQuantity(parseInt(e.target.value) || 0)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-xl font-bold"
                    />
                  </div>
                ) : (
                  <div className="space-y-2 mt-2">
                    {batches.map((batch, bIdx) => (
                      <div key={batch.id} className="p-2.5 bg-white rounded-xl border border-slate-200 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[11px] text-teal-800">Batch #{bIdx + 1}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveBatchRow(batch.id)}
                            className="text-rose-600 hover:text-rose-800"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <span className="text-[10px] text-slate-500">Batch No (Optional)</span>
                            <input
                              type="text"
                              value={batch.batchNumber}
                              onChange={e => {
                                const val = e.target.value;
                                setBatches(batches.map(b => b.id === batch.id ? { ...b, batchNumber: val } : b));
                              }}
                              placeholder="e.g. B-01"
                              className="w-full p-1.5 bg-slate-50 border border-slate-300 rounded text-xs font-mono"
                            />
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500">Expiry Date</span>
                            <input
                              type="date"
                              value={batch.expiryDate}
                              onChange={e => {
                                const val = e.target.value;
                                setBatches(batches.map(b => b.id === batch.id ? { ...b, expiryDate: val } : b));
                              }}
                              className="w-full p-1.5 bg-slate-50 border border-slate-300 rounded text-xs"
                            />
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500">Stock (Pieces)</span>
                            <input
                              type="number"
                              value={batch.stockInPieces}
                              onChange={e => {
                                const val = parseInt(e.target.value) || 0;
                                setBatches(batches.map(b => b.id === batch.id ? { ...b, stockInPieces: val } : b));
                              }}
                              className="w-full p-1.5 bg-slate-50 border border-slate-300 rounded text-xs font-bold"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex gap-2">
              <button
                type="button"
                onClick={() => setShowAddEditModal(false)}
                className="flex-1 py-2.5 bg-slate-200 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveMedicine}
                className="flex-1 py-2.5 bg-teal-600 text-white font-bold rounded-xl text-xs hover:bg-teal-700 shadow"
              >
                Save Medicine
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
