/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Wifi,
  Battery,
  Signal
} from 'lucide-react';
import { AppSettings } from '../types/pharmacy';

interface AndroidFrameProps {
  settings: AppSettings;
  children: React.ReactNode;
  onOpenSourceViewer: () => void;
  onNavigateHome: () => void;
  currentScreenTitle: string;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({
  settings,
  children,
  onNavigateHome
}) => {
  const isDark = settings.theme === 'dark';

  return (
    <div className={`min-h-screen w-full flex flex-col items-center justify-start ${
      isDark ? 'bg-black text-white' : 'bg-neutral-100 text-black'
    }`}>
      {/* Device Frame: Fills mobile screens directly, styled as crisp device on larger screens */}
      <div
        className={`w-full max-w-[440px] min-h-screen sm:min-h-[860px] sm:my-4 sm:rounded-[40px] sm:shadow-2xl sm:border-4 flex flex-col transition-all duration-300 relative ${
          isDark
            ? 'bg-black border-neutral-800'
            : 'bg-white border-neutral-300 shadow-neutral-300/40'
        }`}
      >
        {/* Inner Screen Bezel */}
        <div className={`w-full flex-1 sm:rounded-[32px] overflow-hidden flex flex-col relative ${
          isDark ? 'bg-black' : 'bg-white'
        }`}>
          {/* Android Status Bar */}
          <div className={`w-full px-5 py-2.5 flex items-center justify-between text-xs font-semibold select-none z-30 shrink-0 border-b ${
            isDark ? 'bg-black text-white border-neutral-900' : 'bg-white text-black border-neutral-100'
          }`}>
            <span>10:45</span>

            {/* Camera punch hole cutout */}
            <div className={`w-3.5 h-3.5 rounded-full ${isDark ? 'bg-neutral-900' : 'bg-neutral-200'}`} />

            <div className="flex items-center gap-2">
              <Signal className="w-3.5 h-3.5" />
              <Wifi className="w-3.5 h-3.5" />
              <div className="flex items-center gap-0.5">
                <span className="text-[10px]">98%</span>
                <Battery className={`w-4 h-4 ${isDark ? 'fill-white' : 'fill-black'}`} />
              </div>
            </div>
          </div>

          {/* Interactive Screen Content Area */}
          <div className={`w-full flex-1 overflow-y-auto relative flex flex-col ${
            isDark ? 'bg-black text-white' : 'bg-white text-black'
          }`}>
            {children}
          </div>

          {/* Android Navigation Gesture Pill / Bar */}
          <div className={`w-full py-2.5 flex items-center justify-center shrink-0 border-t ${
            isDark ? 'bg-black border-neutral-900' : 'bg-white border-neutral-100'
          }`}>
            <button
              onClick={onNavigateHome}
              title="Tap to return to Dashboard"
              className={`w-28 h-1 rounded-full transition cursor-pointer active:scale-95 ${
                isDark ? 'bg-neutral-700 hover:bg-neutral-500' : 'bg-neutral-300 hover:bg-neutral-500'
              }`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
