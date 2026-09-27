import React from 'react';
import { X, Keyboard } from 'lucide-react';

interface ShortcutsModalProps {
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
  { key: 'Enter', description: 'Commit cell edit and move down' },
  { key: 'Tab', description: 'Commit cell edit and move right' },
  { key: 'Escape', description: 'Cancel edit or close active modal' },
  { key: 'Arrow Keys', description: 'Navigate between cells' },
];

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <Keyboard className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">Keyboard Shortcuts</h2>
              <p className="text-xs text-slate-500">Quick controls for power users</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto divide-y divide-slate-100">
          {SHORTCUTS.map((s) => (
            <div key={s.key} className="py-2.5 flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">{s.description}</span>
              <kbd className="px-2 py-1 font-mono text-[11px] font-semibold text-slate-700 bg-slate-100 border border-slate-200 rounded shadow-xs">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
