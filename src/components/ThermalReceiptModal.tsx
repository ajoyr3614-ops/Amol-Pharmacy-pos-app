/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Printer,
  Download,
  Share2,
  X,
  FileText,
  CheckCircle,
  Copy
} from 'lucide-react';
import { SaleTransaction, AppSettings } from '../types/pharmacy';
import { ThermalPrinterService, PaperSize } from '../services/printer';

interface ThermalReceiptModalProps {
  sale: SaleTransaction;
  settings: AppSettings;
  onClose: () => void;
}

export const ThermalReceiptModal: React.FC<ThermalReceiptModalProps> = ({ sale, settings, onClose }) => {
  const [paperSize, setPaperSize] = useState<PaperSize>(settings.defaultPrinterSize || '80mm');
  const [copied, setCopied] = useState(false);

  const receiptHtml = ThermalPrinterService.generateSalesMemoHtml(sale, settings, paperSize);

  const handlePrint = () => {
    ThermalPrinterService.triggerBrowserPrint();
  };

  const handleShare = async () => {
    const textMemo = `
*** ${settings.pharmacyName} ***
Invoice: ${sale.invoiceNo}
Date: ${new Date(sale.date).toLocaleDateString()}
Customer: ${sale.customerName || 'Walking'}
Items:
${sale.items.map(it => `- ${it.medicineName} (${it.quantity} ${it.selectedUnit}): ${settings.currency}${it.lineTotal.toFixed(2)}`).join('\n')}
Grand Total: ${settings.currency}${sale.grandTotal.toFixed(2)}
Paid: ${settings.currency}${sale.paidAmount.toFixed(2)}
Due: ${settings.currency}${sale.remainingDue.toFixed(2)}
Status: ${sale.status.toUpperCase()}
${settings.returnsEnabled && settings.returnNoticeBangla ? settings.returnNoticeBangla : ''}
`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Sales Memo - ${sale.invoiceNo}`,
          text: textMemo
        });
      } catch (_) {}
    } else {
      navigator.clipboard.writeText(textMemo);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3">
      <div className="bg-slate-100 rounded-3xl max-w-lg w-full max-h-[95vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Top Controls Bar */}
        <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-teal-400" />
            <div>
              <h3 className="font-bold text-xs">Print Thermal Memo Preview</h3>
              <p className="text-[10px] text-slate-400 font-mono">{sale.invoiceNo}</p>
            </div>
          </div>

          {/* Paper Size Selector (58mm, 80mm, A4) */}
          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl">
            {(['58mm', '80mm', 'a4'] as PaperSize[]).map(size => (
              <button
                key={size}
                onClick={() => setPaperSize(size)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition ${
                  paperSize === size
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {size}
              </button>
            ))}
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Receipt Preview (Looks like realistic thermal paper) */}
        <div className="flex-1 overflow-y-auto p-4 flex justify-center bg-slate-200">
          <div
            className="bg-white shadow-xl rounded-sm border border-slate-300 transition-all duration-200"
            dangerouslySetInnerHTML={{ __html: receiptHtml }}
          />
        </div>

        {/* Action Buttons */}
        <div className="p-3.5 bg-white border-t border-slate-200 flex items-center gap-2">
          <button
            onClick={handleShare}
            className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition"
          >
            <Share2 className="w-4 h-4 text-slate-600" />
            <span>{copied ? 'Copied Text Memo!' : 'Share Memo'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex-1 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>Print ({paperSize.toUpperCase()})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
