/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Camera,
  CameraOff,
  X,
  Barcode as BarcodeIcon,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  PlusCircle,
  HelpCircle,
  Keyboard
} from 'lucide-react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Medicine } from '../types/pharmacy';

interface CameraBarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBarcodeDetected: (barcode: string) => void;
  medicines: Medicine[];
  notFoundBarcode: string | null;
  onClearNotFound: () => void;
  onAddNewMedicineWithBarcode?: (barcode: string) => void;
}

export const CameraBarcodeScannerModal: React.FC<CameraBarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  onBarcodeDetected,
  medicines,
  notFoundBarcode,
  onClearNotFound,
  onAddNewMedicineWithBarcode
}) => {
  const [cameraState, setCameraState] = useState<'initializing' | 'active' | 'permission_denied' | 'no_camera' | 'error'>('initializing');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [manualInput, setManualInput] = useState('');
  const [successScanned, setSuccessScanned] = useState<string | null>(null);

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const isScanningRef = useRef<boolean>(false);
  const isProcessingRef = useRef<boolean>(false);
  const scannerContainerId = 'amol-camera-viewfinder';

  // Play a brief high-pitched confirmation chime upon successful detection
  const playBeep = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch {
      // AudioContext may be restricted by autoplay policy
    }
    // Haptic feedback if supported
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate(80);
      } catch {}
    }
  };

  // Safe scanner stopper
  const stopScanner = useCallback(async () => {
    if (html5QrCodeRef.current && isScanningRef.current) {
      try {
        isScanningRef.current = false;
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      } catch (err) {
        console.warn('Error stopping html5-qrcode scanner:', err);
      }
    }
  }, []);

  // Initialize and start camera
  const startCamera = useCallback(async () => {
    if (!isOpen) return;
    setCameraState('initializing');
    setErrorMessage('');
    isProcessingRef.current = false;

    // First stop previous instance if any
    await stopScanner();

    // Check if mediaDevices is supported
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraState('error');
      setErrorMessage('Camera access is not supported by this browser environment or requires HTTPS.');
      return;
    }

    try {
      const html5QrCode = new Html5Qrcode(scannerContainerId, {
        formatsToSupport: [
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.ITF,
          Html5QrcodeSupportedFormats.QR_CODE
        ],
        verbose: false
      });
      html5QrCodeRef.current = html5QrCode;

      const config = {
        fps: 15,
        qrbox: { width: 240, height: 130 },
        aspectRatio: 1.777778
      };

      await html5QrCode.start(
        { facingMode: 'environment' },
        config,
        (decodedText: string) => {
          if (isProcessingRef.current) return;
          const cleaned = decodedText.trim();
          if (!cleaned) return;

          isProcessingRef.current = true;
          playBeep();
          setSuccessScanned(cleaned);

          setTimeout(() => {
            onBarcodeDetected(cleaned);
            // Lock briefly so same barcode isn't spammed
            setTimeout(() => {
              isProcessingRef.current = false;
              setSuccessScanned(null);
            }, 1000);
          }, 350);
        },
        () => {
          // Frame read with no barcode - ignore
        }
      );

      isScanningRef.current = true;
      setCameraState('active');
    } catch (err: any) {
      console.error('Camera start failed:', err);
      const str = String(err?.message || err);
      if (str.includes('NotAllowedError') || str.includes('Permission') || str.includes('denied')) {
        setCameraState('permission_denied');
        setErrorMessage('Camera permission was denied. Please allow camera access in your browser or Android settings.');
      } else if (str.includes('NotFoundError') || str.includes('DevicesNotFoundError')) {
        setCameraState('no_camera');
        setErrorMessage('No camera device detected on this hardware.');
      } else {
        setCameraState('error');
        setErrorMessage(str || 'Could not start camera feed.');
      }
    }
  }, [isOpen, onBarcodeDetected, stopScanner]);

  useEffect(() => {
    if (isOpen) {
      // Small delay to ensure the container div is mounted in the DOM
      const timer = setTimeout(() => {
        startCamera();
      }, 150);
      return () => {
        clearTimeout(timer);
        stopScanner();
      };
    } else {
      stopScanner();
    }
  }, [isOpen, startCamera, stopScanner]);

  // USB / Bluetooth Barcode Scanner listener (Rapid keystroke buffer)
  useEffect(() => {
    if (!isOpen) return;

    let buffer = '';
    let lastKeyTime = Date.now();

    const handleKeyDown = (e: KeyboardEvent) => {
      // If user is focused on the manual text input, let them type normally
      if (document.activeElement?.tagName === 'INPUT') {
        if (e.key === 'Enter') {
          e.preventDefault();
          const target = document.activeElement as HTMLInputElement;
          const val = target.value.trim();
          if (val) {
            playBeep();
            onBarcodeDetected(val);
          }
        }
        return;
      }

      const currentTime = Date.now();
      const timeDiff = currentTime - lastKeyTime;
      lastKeyTime = currentTime;

      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        const code = buffer.trim();
        buffer = '';
        if (code.length >= 3) {
          playBeep();
          onBarcodeDetected(code);
        }
        return;
      }

      if (e.key.length === 1) {
        // USB scanners type very quickly (under 50ms)
        if (timeDiff > 100) {
          buffer = ''; // Reset if slow human typing outside input
        }
        buffer += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onBarcodeDetected]);

  if (!isOpen) return null;

  const handleManualSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = manualInput.trim();
    if (trimmed) {
      playBeep();
      onBarcodeDetected(trimmed);
      setManualInput('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-sm w-full p-4 sm:p-5 shadow-2xl flex flex-col gap-3.5 border border-neutral-200 text-neutral-900 max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-100 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-900">
              <BarcodeIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900">Barcode Scanner</h3>
              <p className="text-[10px] text-neutral-500 font-medium">Camera &amp; USB / Bluetooth Scanner</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl border border-neutral-200 bg-neutral-50 text-neutral-600 hover:text-black hover:bg-neutral-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Not Found Alert Dialog */}
        {notFoundBarcode && (
          <div className="p-3 bg-neutral-50 border border-neutral-300 rounded-2xl text-xs space-y-2 animate-in zoom-in-95">
            <div className="flex items-center gap-2 text-neutral-900 font-bold">
              <AlertCircle className="w-4 h-4 text-neutral-700" />
              <span>Medicine Not Found</span>
            </div>
            <p className="text-[11px] text-neutral-600">
              No medicine found in database with barcode:
              <strong className="block font-mono text-xs text-neutral-900 mt-0.5 bg-white p-1 rounded border border-neutral-200">
                {notFoundBarcode}
              </strong>
            </p>
            <div className="flex gap-2 pt-1">
              <button
                onClick={onClearNotFound}
                className="flex-1 py-1.5 px-2 bg-neutral-200 hover:bg-neutral-300 rounded-xl font-bold text-[11px] text-neutral-800 transition"
              >
                Scan Again
              </button>
              {onAddNewMedicineWithBarcode && (
                <button
                  onClick={() => onAddNewMedicineWithBarcode(notFoundBarcode)}
                  className="flex-1 py-1.5 px-2 bg-black text-white hover:bg-neutral-800 rounded-xl font-bold text-[11px] flex items-center justify-center gap-1 transition shadow-xs"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Add Medicine</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Live Camera Viewfinder */}
        <div className="relative w-full rounded-2xl overflow-hidden bg-black border border-neutral-800 shadow-inner min-h-[190px] flex items-center justify-center">
          {/* HTML5-QRCode Mount Node */}
          <div
            id={scannerContainerId}
            className="w-full h-full min-h-[190px] flex items-center justify-center overflow-hidden"
          />

          {/* Active Overlay Viewfinder Graphics */}
          {cameraState === 'active' && (
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              {/* Target Aim Box */}
              <div
                className={`w-56 h-28 border-2 rounded-xl flex items-center justify-center transition-all ${
                  successScanned
                    ? 'border-emerald-400 bg-emerald-500/20 scale-105'
                    : 'border-white/80'
                }`}
              >
                {/* Red Laser Scanning Beam */}
                {!successScanned ? (
                  <div className="w-full h-0.5 bg-red-500 shadow-[0_0_8px_red] animate-pulse" />
                ) : (
                  <div className="flex items-center gap-1.5 bg-black/80 px-2.5 py-1 rounded-full text-white text-[11px] font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Scanned!</span>
                  </div>
                )}
              </div>
              <span className="text-[10px] text-white/90 font-mono mt-2 bg-black/60 px-2 py-0.5 rounded-full">
                Align barcode within frame
              </span>
            </div>
          )}

          {/* Camera Initializing */}
          {cameraState === 'initializing' && (
            <div className="absolute inset-0 bg-neutral-900/90 flex flex-col items-center justify-center text-white gap-2 p-4 text-center">
              <RefreshCw className="w-6 h-6 animate-spin text-neutral-400" />
              <span className="text-xs font-semibold">Opening phone camera...</span>
            </div>
          )}

          {/* Camera Permission Denied */}
          {cameraState === 'permission_denied' && (
            <div className="absolute inset-0 bg-neutral-900 flex flex-col items-center justify-center text-white gap-2 p-4 text-center">
              <CameraOff className="w-7 h-7 text-neutral-400" />
              <p className="text-xs font-bold">Camera Permission Denied</p>
              <p className="text-[11px] text-neutral-400 max-w-xs">
                Please allow camera access in browser permissions or use manual barcode entry below.
              </p>
              <button
                onClick={startCamera}
                className="mt-2 px-3 py-1.5 bg-white text-black text-xs font-bold rounded-xl hover:bg-neutral-200 transition"
              >
                Request Again
              </button>
            </div>
          )}

          {/* No Camera / Other Error */}
          {(cameraState === 'no_camera' || cameraState === 'error') && (
            <div className="absolute inset-0 bg-neutral-900 flex flex-col items-center justify-center text-white gap-2 p-4 text-center">
              <AlertCircle className="w-7 h-7 text-neutral-400" />
              <p className="text-xs font-bold">Camera Unavailable</p>
              <p className="text-[11px] text-neutral-400 max-w-xs">{errorMessage}</p>
              <button
                onClick={startCamera}
                className="mt-1 px-3 py-1.5 bg-neutral-800 text-white border border-neutral-700 text-xs font-bold rounded-xl hover:bg-neutral-700 transition"
              >
                Retry
              </button>
            </div>
          )}
        </div>

        {/* Manual Barcode / Scanner Gun Entry */}
        <form onSubmit={handleManualSubmit} className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <label className="font-bold text-neutral-700 flex items-center gap-1.5">
              <Keyboard className="w-3.5 h-3.5" />
              <span>Manual Entry / Scanner Gun:</span>
            </label>
            <span className="text-[10px] text-neutral-400 font-mono">USB &amp; BT Auto-detect</span>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={manualInput}
              onChange={e => setManualInput(e.target.value)}
              placeholder="Type or scan barcode..."
              className="flex-1 px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs font-mono font-bold text-neutral-900 focus:outline-none focus:border-black"
            />
            <button
              type="submit"
              className="px-3.5 py-2 bg-black text-white font-bold text-xs rounded-xl hover:bg-neutral-800 transition shadow-xs active:scale-95"
            >
              Lookup
            </button>
          </div>
        </form>

        {/* Sample Medicines Barcode Quick Test Buttons */}
        <div>
          <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">
            Active Inventory Barcodes (Quick Test):
          </span>
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
            {medicines.slice(0, 6).map(m => (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  playBeep();
                  onBarcodeDetected(m.barcode);
                }}
                className="px-2 py-1 bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 text-neutral-800 text-[10px] font-mono rounded-lg transition active:scale-95 text-left"
              >
                <span className="font-sans font-bold block truncate max-w-[120px]">{m.name}</span>
                <span className="text-neutral-500 text-[9px]">{m.barcode}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Supported Formats Info */}
        <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-[10px] text-neutral-400">
          <span>Formats: EAN-13, EAN-8, UPC, Code 128, QR</span>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-600 font-bold hover:underline"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
