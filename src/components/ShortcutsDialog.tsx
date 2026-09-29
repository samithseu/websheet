import React, { useEffect, useRef } from 'react';
import { X, Keyboard, Smartphone } from 'lucide-react';

interface ShortcutsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShortcutItem {
  key: string;
  description: string;
}

const SHORTCUTS: ShortcutItem[] = [
  { key: 'Ctrl + S / ⌘ + S', description: 'Quick save spreadsheet as .xlsx' },
  { key: 'Ctrl + O / ⌘ + O', description: 'Open local spreadsheet file' },
  { key: 'Ctrl + F / ⌘ + F', description: 'Find & Replace in spreadsheet' },
  { key: 'Ctrl + Z / ⌘ + Z', description: 'Undo last change' },
  { key: 'Ctrl + Y / ⌘ + Y', description: 'Redo last change' },
  { key: 'Ctrl + C / ⌘ + C', description: 'Copy selected cells' },
  { key: 'Ctrl + X / ⌘ + X', description: 'Cut selected cells' },
  { key: 'Ctrl + V / ⌘ + V', description: 'Paste cells' },
  { key: 'Ctrl + P / ⌘ + P', description: 'Print sheet / Export to PDF' },
  { key: 'Enter', description: 'Edit selected cell / commit edit and move down' },
  { key: 'Tab', description: 'Commit cell edit and move right' },
  { key: 'Escape', description: 'Cancel edit or close active modal' },
  { key: 'Arrow Keys', description: 'Navigate between cells' },
];

export const ShortcutsDialog: React.FC<ShortcutsDialogProps> = ({ isOpen, onClose }) => {
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
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Keyboard className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-800">Keyboard Shortcuts & Help</h2>
              <p className="text-xs text-slate-500">Quick controls for workbench users</p>
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

        <div className="p-6 max-h-[60vh] overflow-y-auto divide-y divide-slate-100">
          {SHORTCUTS.map((s) => (
            <div key={s.key} className="py-2.5 flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">{s.description}</span>
              <kbd className="px-2 py-1 font-mono text-[11px] font-semibold text-slate-700 bg-slate-100 border border-slate-200 rounded-md shadow-2xs">
                {s.key}
              </kbd>
            </div>
          ))}

          {/* iOS / Mobile Home Screen Tip */}
          <div className="pt-3 pb-1">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-start gap-2.5">
              <Smartphone className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-600 leading-relaxed">
                <strong className="font-semibold text-slate-800 block">Add to Home Screen (iOS / iPadOS)</strong>
                Tap the <span className="font-medium text-slate-700">Share</span> button in Safari, then select <span className="font-medium text-slate-700">&ldquo;Add to Home Screen&rdquo;</span> to install WebSheet as a standalone app.
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex justify-end">
          <form method="dialog">
            <button
              type="submit"
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Close
            </button>
          </form>
        </div>
      </div>
    </dialog>
  );
};
