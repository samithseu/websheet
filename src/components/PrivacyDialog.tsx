import React, { useEffect, useRef } from 'react';
import { ShieldCheck, X, HardDrive, WifiOff, Lock, CheckCircle2, Layers } from 'lucide-react';

interface PrivacyDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyDialog: React.FC<PrivacyDialogProps> = ({ isOpen, onClose }) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [isOpen]);

  return (
    <dialog
      ref={dialogRef}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClose={onClose}
      className="outline-none"
    >
      <div className="bg-white rounded-xl shadow-2xl w-[90vw] max-w-lg overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">Privacy & Security Guarantee</h2>
              <p className="text-xs text-blue-600 font-medium">100% Client-Side Workbench</p>
            </div>
          </div>
          <form method="dialog">
            <button
              type="submit"
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </form>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs text-slate-600">
          <div className="p-3.5 rounded-lg bg-blue-50/60 border border-blue-100 text-blue-900 flex items-start gap-3">
            <Lock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block text-slate-900">Zero Data Egress</span>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                Your spreadsheets are never uploaded to any remote server or third-party service. All file parsing, table rendering, editing, and file generation happen strictly in your browser's local memory.
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-1">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 shrink-0 mt-0.5">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <p className="font-medium text-slate-800">App-Shell Precaching Only</p>
                <p className="text-slate-500 mt-0.5 leading-relaxed">
                  The Service Worker caches application code, stylesheets, and icons only so WebSheet works offline. Spreadsheet bytes never enter the cache, background sync, or persistent storage because they never leave your active tab.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 shrink-0 mt-0.5">
                <HardDrive className="w-4 h-4" />
              </div>
              <div>
                <p className="font-medium text-slate-800">Direct In-Memory Processing</p>
                <p className="text-slate-500 mt-0.5 leading-relaxed">
                  Files are opened and saved using modern HTML5 File and File System Access APIs. No cloud storage, telemetry, or analytics scripts are bundled.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 shrink-0 mt-0.5">
                <WifiOff className="w-4 h-4" />
              </div>
              <div>
                <p className="font-medium text-slate-800">Offline Standalone PWA</p>
                <p className="text-slate-500 mt-0.5 leading-relaxed">
                  Disconnect your network or enable airplane mode at any time. WebSheet functions entirely standalone without internet access.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 shrink-0 mt-0.5">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <p className="font-medium text-slate-800">Verifiable in DevTools</p>
                <p className="text-slate-500 mt-0.5 leading-relaxed">
                  Open browser Developer Tools (F12) &gt; Network tab. When you create, edit, calculate, or export spreadsheets, zero HTTP network requests are made.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-end">
          <form method="dialog">
            <button
              type="submit"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              Got it
            </button>
          </form>
        </div>
      </div>
    </dialog>
  );
};
