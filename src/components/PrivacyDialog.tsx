import React, { useEffect, useRef } from "react";
import { ShieldCheck, X, HardDrive, WifiOff, Lock, CheckCircle2, Layers } from "lucide-react";

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
      <div className="bg-white rounded-2xl shadow-2xl w-[90vw] max-w-lg overflow-hidden border border-zinc-200/90 ring-1 ring-black/[0.04]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shadow-2xs">
              <ShieldCheck className="w-4.5 h-4.5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-900 tracking-tight">
                Privacy & Security Guarantee
              </h2>
              <p className="text-xs text-zinc-500 font-medium">100% Client-Side Workbench</p>
            </div>
          </div>
          <form method="dialog">
            <button
              type="submit"
              onClick={onClose}
              className="size-7 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg flex items-center justify-center transition-all active:scale-[0.98] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs text-zinc-600">
          <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/80 text-zinc-900 flex items-start gap-3">
            <Lock className="w-4 h-4 text-zinc-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block text-zinc-950">Zero Data Egress</span>
              <p className="text-xs text-zinc-600 mt-0.5 leading-relaxed">
                Your spreadsheets are never uploaded to any remote server or third-party service.
                All file parsing, table rendering, editing, and file generation happen strictly in
                your browser's local memory.
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-1">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-zinc-100 border border-zinc-200/60 flex items-center justify-center text-zinc-700 shrink-0 mt-0.5">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <p className="font-medium text-zinc-900">App-Shell Precaching Only</p>
                <p className="text-zinc-500 mt-0.5 leading-relaxed">
                  The Service Worker caches application code, stylesheets, and icons only so
                  WebSheet works offline. Spreadsheet bytes never enter the cache, background sync,
                  or persistent storage because they never leave your active tab.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-zinc-100 border border-zinc-200/60 flex items-center justify-center text-zinc-700 shrink-0 mt-0.5">
                <HardDrive className="w-4 h-4" />
              </div>
              <div>
                <p className="font-medium text-zinc-900">Direct In-Memory Processing</p>
                <p className="text-zinc-500 mt-0.5 leading-relaxed">
                  Files are opened and saved using modern HTML5 File and File System Access APIs. No
                  cloud storage, telemetry, or analytics scripts are bundled.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-zinc-100 border border-zinc-200/60 flex items-center justify-center text-zinc-700 shrink-0 mt-0.5">
                <WifiOff className="w-4 h-4" />
              </div>
              <div>
                <p className="font-medium text-zinc-900">Offline Standalone PWA</p>
                <p className="text-zinc-500 mt-0.5 leading-relaxed">
                  Disconnect your network or enable airplane mode at any time. WebSheet functions
                  entirely standalone without internet access.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-zinc-100 border border-zinc-200/60 flex items-center justify-center text-zinc-700 shrink-0 mt-0.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <p className="font-medium text-zinc-900">Verifiable in DevTools</p>
                <p className="text-zinc-500 mt-0.5 leading-relaxed">
                  Open browser Developer Tools (F12) &gt; Network tab. When you create, edit,
                  calculate, or export spreadsheets, zero HTTP network requests are made.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-zinc-100 bg-zinc-50/50 flex items-center justify-end">
          <form method="dialog">
            <button
              type="submit"
              onClick={onClose}
              className="h-8 px-4 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 border border-blue-600 rounded-lg shadow-xs transition-all active:scale-[0.98] cursor-pointer"
            >
              Got it
            </button>
          </form>
        </div>
      </div>
    </dialog>
  );
};
