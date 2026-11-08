/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Barcode as BarcodeIcon,
  Printer,
  RefreshCw,
  Camera,
  Check,
  Copy,
  ScanLine
} from 'lucide-react';
import { Medicine, AppSettings } from '../../types/pharmacy';
import { StorageService } from '../../services/storage';
import { BarcodeService } from '../../services/barcode';
import { CameraBarcodeScannerModal } from '../CameraBarcodeScannerModal';

interface BarcodeScreenProps {
  settings: AppSettings;
  onBack: () => void;
}

export const BarcodeScreen: React.FC<BarcodeScreenProps> = ({ settings, onBack }) => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [selectedMedId, setSelectedMedId] = useState<string>('');
  const [customBarcode, setCustomBarcode] = useState('');
  const [stickerCopies, setStickerCopies] = useState<number>(4);
  const [copied, setCopied] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  const barcodeSvgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    const meds = StorageService.getMedicines();
    setMedicines(meds);
    if (meds.length > 0) {
      setSelectedMedId(meds[0].id);
      setCustomBarcode(meds[0].barcode);
    }
  }, []);

  const selectedMed = medicines.find(m => m.id === selectedMedId);

  useEffect(() => {
    if (barcodeSvgRef.current && customBarcode) {
      BarcodeService.renderBarcodeToSvg(customBarcode, barcodeSvgRef.current, {
        height: 48,
        width: 2,
        displayValue: true
      });
    }
  }, [customBarcode, selectedMedId]);

  const handleGenerateNew = () => {
    const newCode = BarcodeService.generateBarcodeNumber();
    setCustomBarcode(newCode);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(customBarcode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrintStickers = () => {
    window.print();
  };

  const isDark = settings.theme === 'dark';

  return (
    <div className={`min-h-full flex flex-col pb-20 ${isDark ? 'bg-black text-white' : 'bg-white text-black'}`}>
      {/* Header */}
      <div className={`px-4 py-3.5 border-b shadow-xs flex items-center justify-between sticky top-0 z-20 ${
        isDark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-white border-neutral-200 text-black'
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
            <h1 className="text-base font-bold tracking-tight">Barcode System</h1>
            <p className={`text-[11px] ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
              Generator &amp; Scanner Test
            </p>
          </div>
        </div>

        <button
          onClick={handlePrintStickers}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs border shadow-xs transition active:scale-95 ${
            isDark ? 'bg-white text-black border-white hover:bg-neutral-200' : 'bg-black text-white border-black hover:bg-neutral-800'
          }`}
        >
          <Printer className="w-4 h-4" />
          <span>Print Stickers</span>
        </button>
      </div>

      <div className="p-4 space-y-4 max-w-lg mx-auto w-full">
        {/* Medicine Selector & Scanner Trigger */}
        <div className={`p-4 rounded-2xl border space-y-3 ${
          isDark ? 'bg-neutral-950 border-neutral-800' : 'bg-white border-neutral-200 shadow-xs'
        }`}>
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider block">
              Select Medicine:
            </label>
            <button
              onClick={() => setShowScanner(true)}
              className={`text-xs font-bold flex items-center gap-1 px-2.5 py-1 rounded-lg border transition ${
                isDark ? 'bg-neutral-900 border-neutral-700 text-white hover:bg-neutral-800' : 'bg-neutral-100 border-neutral-300 text-black hover:bg-neutral-200'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Scan with Camera</span>
            </button>
          </div>

          <select
            value={selectedMedId}
            onChange={e => {
              const id = e.target.value;
              setSelectedMedId(id);
              const m = medicines.find(med => med.id === id);
              if (m) setCustomBarcode(m.barcode);
            }}
            className={`w-full p-2.5 border rounded-xl text-xs font-bold ${
              isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-neutral-50 border-neutral-300 text-black'
            }`}
          >
            {medicines.map(m => (
              <option key={m.id} value={m.id}>
                {m.name} — Barcode: {m.barcode}
              </option>
            ))}
          </select>

          {/* Barcode Field & Generator */}
          <div>
            <div className="flex justify-between items-center mb-1 text-xs">
              <span className="font-semibold">Barcode Value:</span>
              <button
                onClick={handleGenerateNew}
                className="font-bold hover:underline flex items-center gap-1 text-[11px]"
              >
                <RefreshCw className="w-3 h-3" /> Generate Random Code128
              </button>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={customBarcode}
                onChange={e => setCustomBarcode(e.target.value)}
                className={`flex-1 p-2 border rounded-xl font-mono text-sm font-bold ${
                  isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-neutral-50 border-neutral-300 text-black'
                }`}
              />
              <button
                onClick={handleCopy}
                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 border transition ${
                  isDark ? 'bg-neutral-900 border-neutral-800 text-white hover:bg-neutral-800' : 'bg-neutral-100 border-neutral-300 text-black hover:bg-neutral-200'
                }`}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Number of stickers to preview */}
          <div className="flex items-center justify-between text-xs pt-1">
            <span className="font-semibold">Print Copies:</span>
            <div className="flex items-center gap-2">
              {[2, 4, 8, 16].map(count => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setStickerCopies(count)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition ${
                    stickerCopies === count
                      ? isDark
                        ? 'bg-white text-black border-white'
                        : 'bg-black text-white border-black'
                      : isDark
                      ? 'bg-neutral-900 border-neutral-800 text-neutral-400'
                      : 'bg-neutral-100 border-neutral-300 text-neutral-600'
                  }`}
                >
                  {count}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Live Barcode Rendering Preview */}
        <div className={`p-4 rounded-2xl border space-y-3 ${
          isDark ? 'bg-neutral-950 border-neutral-800' : 'bg-white border-neutral-200 shadow-xs'
        }`}>
          <h4 className="text-xs font-bold uppercase tracking-wider">
            Live Barcode Rendering (EAN / Code128)
          </h4>

          {/* SVG Barcode rendered in pure high-contrast */}
          <div className="p-4 bg-white rounded-xl border border-neutral-300 flex flex-col items-center justify-center min-h-[100px]">
            <svg ref={barcodeSvgRef} className="max-w-full" />
            {selectedMed && (
              <div className="text-center mt-2">
                <div className="text-xs font-bold text-black">{selectedMed.name}</div>
                <div className="text-[11px] text-neutral-700">MRP: {settings.currency}{selectedMed.salePricePerPiece.toFixed(2)}</div>
              </div>
            )}
          </div>
        </div>

        {/* Multi-Sticker Sheet Preview (Printable Area) */}
        <div className={`p-4 rounded-2xl border space-y-3 ${
          isDark ? 'bg-neutral-950 border-neutral-800' : 'bg-white border-neutral-200 shadow-xs'
        }`}>
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider">
              Sticker Sheet Preview ({stickerCopies} Labels)
            </h4>
            <span className="text-[10px] font-mono text-neutral-500">Thermal 50mm x 30mm</span>
          </div>

          <div className="grid grid-cols-2 gap-2 p-2 bg-neutral-100 rounded-xl border border-neutral-300">
            {Array.from({ length: stickerCopies }).map((_, i) => (
              <div
                key={i}
                className="bg-white p-2 rounded-lg border border-neutral-300 shadow-xs text-center flex flex-col items-center justify-between text-black min-h-[90px]"
              >
                <div className="text-[10px] font-extrabold truncate w-full">{settings.pharmacyName}</div>
                <div className="text-[11px] font-bold text-neutral-900 truncate w-full">
                  {selectedMed?.name || 'Medicine'}
                </div>
                <div className="font-mono text-sm tracking-widest font-black my-1">
                  ||||||| | ||| ||||
                </div>
                <div className="text-[9px] font-mono text-neutral-600">{customBarcode}</div>
                <div className="text-[10px] font-extrabold text-neutral-900 mt-0.5">
                  MRP: {settings.currency}{selectedMed?.salePricePerPiece.toFixed(2) || '0.00'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Camera Barcode Scanner Modal */}
      <CameraBarcodeScannerModal
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onBarcodeDetected={barcode => {
          setCustomBarcode(barcode);
          const found = medicines.find(m => m.barcode.toLowerCase() === barcode.toLowerCase());
          if (found) {
            setSelectedMedId(found.id);
          }
          setShowScanner(false);
        }}
        medicines={medicines}
        notFoundBarcode={null}
        onClearNotFound={() => {}}
      />
    </div>
  );
};
