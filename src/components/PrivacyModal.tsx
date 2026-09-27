import React from 'react';
import { ShieldCheck, X, HardDrive, WifiOff, Lock, CheckCircle2 } from 'lucide-react';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-emerald-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Privacy & Security Guarantee</h2>
              <p className="text-xs text-emerald-700 font-medium">100% Client-Side Architecture</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-sm text-slate-600">
          <div className="p-3.5 rounded-lg bg-emerald-50/70 border border-emerald-100 text-emerald-900 flex items-start gap-3">
            <Lock className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block">Zero Data Egress</span>
              <p className="text-xs text-emerald-800 mt-0.5 leading-relaxed">
                Your spreadsheets are never uploaded to any remote server or third-party service. All file parsing, table rendering, editing, and file generation happen strictly in your browser's local memory.
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 shrink-0 mt-0.5">
                <HardDrive className="w-4 h-4" />
              </div>
              <div>
                <p className="font-medium text-slate-800 text-xs">Direct In-Memory Processing</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Files are decoded directly using modern HTML5 File APIs and WebAssembly/JavaScript parsing.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 shrink-0 mt-0.5">
                <WifiOff className="w-4 h-4" />
              </div>
              <div>
                <p className="font-medium text-slate-800 text-xs">Offline Capable</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  You can turn off Wi-Fi or disconnect your internet completely—WebSheet will continue functioning without interruption.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 shrink-0 mt-0.5">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <p className="font-medium text-slate-800 text-xs">Verifiable in DevTools</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Open Developer Tools (F12) &gt; Network tab. When you open, edit, or save a sheet, you will see zero requests made.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
