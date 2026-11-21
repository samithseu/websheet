import React, { useEffect, useRef } from "react";
import { X, Keyboard, Smartphone } from "lucide-react";

interface ShortcutsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShortcutItem {
  key: string;
  description: string;
}

const SHORTCUTS: ShortcutItem[] = [
  { key: "Ctrl + S / ⌘ + S", description: "Quick save spreadsheet as .xlsx" },
  { key: "Ctrl + O / ⌘ + O", description: "Open local spreadsheet file" },
  { key: "Ctrl + F / ⌘ + F", description: "Find & Replace in spreadsheet" },
  { key: "Ctrl + Z / ⌘ + Z", description: "Undo last change" },
  { key: "Ctrl + Y / ⌘ + Y", description: "Redo last change" },
  { key: "Ctrl + C / ⌘ + C", description: "Copy selected cells" },
  { key: "Ctrl + X / ⌘ + X", description: "Cut selected cells" },
  { key: "Ctrl + V / ⌘ + V", description: "Paste cells" },
  { key: "Ctrl + P / ⌘ + P", description: "Print sheet / Export to PDF" },
  { key: "Enter", description: "Edit selected cell / commit edit and move down" },
  { key: "Tab", description: "Commit cell edit and move right" },
  { key: "Escape", description: "Cancel edit or close active modal" },
  { key: "Arrow Keys", description: "Navigate between cells" },
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
      <div className="bg-white rounded-2xl shadow-2xl w-[90vw] max-w-lg overflow-hidden border border-zinc-200/90 ring-1 ring-black/[0.04]">
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shadow-2xs">
              <Keyboard className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-900 tracking-tight">
                Keyboard Shortcuts & Help
              </h2>
              <p className="text-xs text-zinc-500">Quick controls for workbench users</p>
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

        <div className="p-6 max-h-[60vh] overflow-y-auto divide-y divide-zinc-100">
          {SHORTCUTS.map((s) => (
            <div key={s.key} className="py-2.5 flex items-center justify-between text-xs">
              <span className="text-zinc-600 font-medium">{s.description}</span>
              <kbd className="px-2 py-0.5 font-mono text-[11px] font-semibold text-zinc-700 bg-zinc-100 border border-zinc-200 rounded-md shadow-[inset_0_-1px_0_rgba(0,0,0,0.08)]">
                {s.key}
              </kbd>
            </div>
          ))}

          {/* iOS / Mobile Home Screen Tip */}
          <div className="pt-3 pb-1">
            <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/80 flex items-start gap-2.5">
              <Smartphone className="w-4 h-4 text-zinc-700 shrink-0 mt-0.5" />
              <div className="text-xs text-zinc-600 leading-relaxed">
                <strong className="font-semibold text-zinc-900 block">
                  Add to Home Screen (iOS / iPadOS)
                </strong>
                Tap the <span className="font-medium text-zinc-800">Share</span> button in Safari,
                then select{" "}
                <span className="font-medium text-zinc-800">&ldquo;Add to Home Screen&rdquo;</span>{" "}
                to install WebSheet as a standalone app.
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-3 border-t border-zinc-100 bg-zinc-50/50 flex justify-end">
          <form method="dialog">
            <button
              type="submit"
              onClick={onClose}
              className="h-8 px-4 text-xs font-medium text-zinc-700 bg-white border border-zinc-200/90 rounded-lg hover:bg-zinc-50 transition-all active:scale-[0.98] shadow-2xs cursor-pointer"
            >
              Close
            </button>
          </form>
        </div>
      </div>
    </dialog>
  );
};
