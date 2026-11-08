/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import JsBarcode from 'jsbarcode';

export class BarcodeService {
  /**
   * Generates a unique 12-digit EAN/Code128 barcode number
   */
  static generateBarcodeNumber(): string {
    const prefix = '890'; // Common retail prefix
    const random = Math.floor(100000000 + Math.random() * 900000000).toString();
    return prefix + random.slice(0, 9);
  }

  /**
   * Render barcode to an SVG element or canvas
   */
  static renderBarcodeToSvg(text: string, element: SVGSVGElement, options?: { height?: number; width?: number; displayValue?: boolean }) {
    try {
      JsBarcode(element, text, {
        format: 'CODE128',
        width: options?.width || 2,
        height: options?.height || 50,
        displayValue: options?.displayValue !== false,
        font: 'monospace',
        fontSize: 14,
        margin: 5,
        background: '#ffffff',
        lineColor: '#000000'
      });
    } catch (e) {
      console.warn('Barcode rendering error:', e);
    }
  }
}
