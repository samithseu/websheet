import React, { useEffect, useRef } from "react";
import { AlertTriangle, X } from "lucide-react";

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
  confirmLabel = "Confirm",
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
      <div className="bg-white rounded-2xl shadow-2xl w-[90vw] max-w-md overflow-hidden border border-zinc-200/90 ring-1 ring-black/[0.04]">
        <div className="px-5 py-3.5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-7.5 h-7.5 rounded-lg flex items-center justify-center ${
                isDestructive
                  ? "bg-rose-50 text-rose-600 border border-rose-100"
                  : "bg-blue-50 text-blue-600 border border-blue-100"
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-semibold text-zinc-900 tracking-tight">{title}</h2>
          </div>
          <form method="dialog">
            <button
              type="submit"
              onClick={onCancel}
              className="size-7 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg flex items-center justify-center transition-all active:scale-[0.98] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </form>
        </div>

        <div className="p-5 text-xs text-zinc-600 space-y-2">
          <p className="leading-relaxed">{description}</p>
        </div>

        <div className="px-5 py-3 border-t border-zinc-100 bg-zinc-50/50 flex items-center justify-end gap-2 text-xs">
          <form method="dialog">
            <button
              type="submit"
              onClick={onCancel}
              className="h-8 px-3.5 font-medium text-zinc-700 bg-white border border-zinc-200/90 rounded-lg hover:bg-zinc-50 transition-all active:scale-[0.98] shadow-2xs cursor-pointer"
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
            className={`h-8 px-3.5 font-medium text-white rounded-lg shadow-xs transition-all active:scale-[0.98] cursor-pointer ${
              isDestructive
                ? "bg-rose-600 hover:bg-rose-700 border border-rose-600"
                : "bg-blue-600 hover:bg-blue-700 border border-blue-600"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
};
