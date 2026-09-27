import React, { useEffect, useRef } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  description,
  confirmLabel = 'Confirm',
  isDestructive = true,
  onConfirm,
  onCancel,
}) => {
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
        onCancel();
      }}
      onClose={onCancel}
      className="outline-none"
    >
      <div className="bg-white rounded-xl shadow-2xl w-[90vw] max-w-md overflow-hidden border border-slate-200">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
              isDestructive ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
            }`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-semibold text-slate-800">{title}</h2>
          </div>
          <form method="dialog">
            <button
              type="submit"
              onClick={onCancel}
              className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </form>
        </div>

        <div className="p-5 text-xs text-slate-600 space-y-2">
          <p className="leading-relaxed">{description}</p>
        </div>

        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2 text-xs">
          <form method="dialog">
            <button
              type="submit"
              onClick={onCancel}
              className="px-3.5 py-1.5 font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </form>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onCancel();
            }}
            className={`px-3.5 py-1.5 font-medium text-white rounded-lg shadow-xs transition-colors cursor-pointer ${
              isDestructive
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
};
