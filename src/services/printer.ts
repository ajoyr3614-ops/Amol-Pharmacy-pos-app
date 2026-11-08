/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SaleTransaction, AppSettings, PurchaseTransaction, ReturnRecord } from '../types/pharmacy';

export type PaperSize = '58mm' | '80mm' | 'a4';

export class ThermalPrinterService {
  /**
   * Generates clean HTML for thermal/A4 printing
   */
  static generateSalesMemoHtml(
    sale: SaleTransaction,
    settings: AppSettings,
    paperSize: PaperSize
  ): string {
    const is58 = paperSize === '58mm';
    const isA4 = paperSize === 'a4';
    const widthStyle = is58 ? 'max-width: 58mm;' : isA4 ? 'max-width: 210mm; padding: 24px;' : 'max-width: 80mm;';

    const itemsRows = sale.items
      .map(
        (item, idx) => `
      <tr style="border-bottom: 1px dashed #ccc; font-size: ${is58 ? '10px' : isA4 ? '13px' : '11px'};">
        <td style="padding: 4px 2px; text-align: left;">
          <div><strong>${idx + 1}. ${item.medicineName}</strong></div>
          <div style="font-size: 9px; color: #666;">${item.genericName || ''} ${item.batchNumber ? `(B: ${item.batchNumber})` : ''}</div>
        </td>
        <td style="padding: 4px 2px; text-align: center;">${item.quantity} ${item.selectedUnit}</td>
        <td style="padding: 4px 2px; text-align: right;">${settings.currency}${item.pricePerUnit.toFixed(2)}</td>
        <td style="padding: 4px 2px; text-align: right;"><strong>${settings.currency}${item.lineTotal.toFixed(2)}</strong></td>
      </tr>
    `
      )
      .join('');

    return `
      <div id="printable-receipt" style="font-family: 'Plus Jakarta Sans', monospace, sans-serif; margin: 0 auto; ${widthStyle} color: #000; background: #fff; padding: 12px; box-sizing: border-box;">
        <div style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 8px; margin-bottom: 8px;">
          <h2 style="margin: 0 0 4px 0; font-size: ${is58 ? '16px' : isA4 ? '24px' : '18px'}; font-weight: 800; text-transform: uppercase;">
            ${settings.pharmacyName}
          </h2>
          <div style="font-size: ${is58 ? '9px' : '11px'}; color: #333;">${settings.address}</div>
          <div style="font-size: ${is58 ? '9px' : '11px'}; color: #333;">Phone: ${settings.mobileNumber}</div>
          <div style="font-size: 10px; font-weight: bold; margin-top: 4px; padding: 2px 6px; background: #eee; display: inline-block; border-radius: 4px;">
            RETAIL SALES MEMO
          </div>
        </div>

        <div style="font-size: ${is58 ? '9px' : '11px'}; margin-bottom: 8px; line-height: 1.4;">
          <div style="display: flex; justify-content: space-between;">
            <span><strong>Invoice:</strong> ${sale.invoiceNo}</span>
            <span><strong>Date:</strong> ${new Date(sale.date).toLocaleDateString()} ${new Date(sale.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          ${
            sale.customerName
              ? `<div style="display: flex; justify-content: space-between; margin-top: 2px;">
                  <span><strong>Customer:</strong> ${sale.customerName}</span>
                  <span>${sale.customerMobile || ''}</span>
                </div>`
              : '<div><strong>Customer:</strong> Walking Customer</div>'
          }
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 8px;">
          <thead>
            <tr style="border-top: 1px solid #000; border-bottom: 1px solid #000; font-size: ${is58 ? '9px' : '11px'};">
              <th style="text-align: left; padding: 4px 2px;">Item</th>
              <th style="text-align: center; padding: 4px 2px;">Qty</th>
              <th style="text-align: right; padding: 4px 2px;">Rate</th>
              <th style="text-align: right; padding: 4px 2px;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRows}
          </tbody>
        </table>

        <div style="border-top: 1px solid #000; padding-top: 4px; font-size: ${is58 ? '10px' : '12px'};">
          <div style="display: flex; justify-content: space-between; padding: 1px 0;">
            <span>Subtotal:</span>
            <span>${settings.currency}${sale.subtotal.toFixed(2)}</span>
          </div>
          ${
            sale.discountAmount > 0
              ? `<div style="display: flex; justify-content: space-between; padding: 1px 0; color: #b91c1c;">
                  <span>Discount:</span>
                  <span>-${settings.currency}${sale.discountAmount.toFixed(2)}</span>
                </div>`
              : ''
          }
          <div style="display: flex; justify-content: space-between; padding: 4px 0; border-top: 1px dashed #000; border-bottom: 1px dashed #000; font-weight: bold; font-size: ${is58 ? '12px' : '14px'};">
            <span>Grand Total:</span>
            <span>${settings.currency}${sale.grandTotal.toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 1px 0; margin-top: 2px;">
            <span>Paid Amount (${sale.paymentMethod.toUpperCase()}):</span>
            <span>${settings.currency}${sale.paidAmount.toFixed(2)}</span>
          </div>
          ${
            sale.remainingDue > 0
              ? `<div style="display: flex; justify-content: space-between; padding: 1px 0; font-weight: bold; color: #dc2626;">
                  <span>Due Balance:</span>
                  <span>${settings.currency}${sale.remainingDue.toFixed(2)}</span>
                </div>`
              : `<div style="display: flex; justify-content: space-between; padding: 1px 0; color: #15803d; font-weight: bold;">
                  <span>Status:</span>
                  <span>PAID</span>
                </div>`
          }
        </div>

        ${
          settings.returnsEnabled && settings.returnNoticeBangla
            ? `<div style="text-align: center; margin-top: 10px; padding: 6px; border: 1px dashed #999; border-radius: 4px; font-size: ${is58 ? '9px' : '10px'}; font-family: 'Hind Siliguri', sans-serif; font-weight: 600;">
                ${settings.returnNoticeBangla}
              </div>`
            : ''
        }

        <div style="text-align: center; margin-top: 8px; font-size: ${is58 ? '8px' : '10px'}; color: #666; border-top: 1px solid #eee; padding-top: 6px;">
          <div>Thank you for choosing ${settings.pharmacyName}!</div>
          <div>Get well soon. Please consult your physician for dosage.</div>
        </div>
      </div>
    `;
  }

  static triggerBrowserPrint(): void {
    window.print();
  }
}
