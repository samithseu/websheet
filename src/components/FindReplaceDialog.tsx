import React, { useState, useEffect, useRef, useMemo } from "react";
import { X, Search, ChevronDown, ChevronUp } from "lucide-react";
import type { XSpreadsheetData } from "../utils/spreadsheetConverter";
import {
  searchWorkbook,
  replaceSingleOccurrence,
  replaceAllOccurrences,
} from "../utils/findReplace";

interface FindReplaceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  spreadsheetData: XSpreadsheetData;
  onSelectCell: (sheetIndex: number, rowIndex: number, colIndex: number) => void;
  onUpdateData: (newData: XSpreadsheetData, message?: string) => void;
}

export const FindReplaceDialog: React.FC<FindReplaceDialogProps> = ({
  isOpen,
  onClose,
  spreadsheetData,
  onSelectCell,
  onUpdateData,
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [matchCase, setMatchCase] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Sync native dialog showModal / close
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

  const handleClose = () => {
    setStatusMessage(null);
    onClose();
  };

  // Compute matches declaratively using pure search function
  const matches = useMemo(() => {
    if (!isOpen || !findText.trim()) return [];
    return searchWorkbook(spreadsheetData, findText, matchCase);
  }, [isOpen, findText, matchCase, spreadsheetData]);

  // Ensure current index is within bounds
  const safeIndex = matches.length > 0 ? Math.min(currentIndex, matches.length - 1) : -1;

  // Navigate to current match when matches or safeIndex change
  const navigateToMatch = (idx: number) => {
    if (matches[idx]) {
      const m = matches[idx];
      onSelectCell(m.sheetIndex, m.rowIndex, m.colIndex);
    }
  };

  const handleNext = () => {
    if (matches.length === 0) return;
    const nextIdx = (safeIndex + 1) % matches.length;
    setCurrentIndex(nextIdx);
    navigateToMatch(nextIdx);
  };

  const handlePrev = () => {
    if (matches.length === 0) return;
    const prevIdx = (safeIndex - 1 + matches.length) % matches.length;
    setCurrentIndex(prevIdx);
    navigateToMatch(prevIdx);
  };

  const handleReplaceCurrent = () => {
    if (matches.length === 0 || safeIndex < 0) return;
    const currentMatch = matches[safeIndex];
    const updatedData = replaceSingleOccurrence(
      spreadsheetData,
      currentMatch,
      findText,
      replaceText,
      matchCase,
    );
    onUpdateData(updatedData, `Replaced cell ${currentMatch.cellRef}`);
    setStatusMessage(`Replaced cell ${currentMatch.cellRef}`);
  };

  const handleReplaceAll = () => {
    if (!findText.trim()) return;
    const { data: updatedData, count } = replaceAllOccurrences(
      spreadsheetData,
      findText,
      replaceText,
      matchCase,
    );
    const msg =
      count > 0
        ? `Replaced ${count} occurrence${count > 1 ? "s" : ""}`
        : "No occurrences found to replace";
    onUpdateData(updatedData, msg);
    setStatusMessage(msg);
  };

  return (
    <dialog
      ref={dialogRef}
      onCancel={(e) => {
        e.preventDefault();
        handleClose();
      }}
      onClose={handleClose}
      className="outline-none"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-[90vw] max-w-md overflow-hidden border border-zinc-200/90 ring-1 ring-black/[0.04]">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-7.5 h-7.5 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <Search className="w-3.5 h-3.5" />
            </div>
            <h2 className="text-sm font-semibold text-zinc-900 tracking-tight">Find & Replace</h2>
          </div>
          <form method="dialog">
            <button
              type="submit"
              onClick={handleClose}
              className="size-7 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg flex items-center justify-center transition-all active:scale-[0.98] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Form Body */}
        <div className="p-5 space-y-4 text-xs">
          {/* Find */}
          <div className="space-y-1.5">
            <label className="font-medium text-zinc-700 block">Find</label>
            <div className="relative flex items-center">
              <input
                type="text"
                value={findText}
                onChange={(e) => {
                  setFindText(e.target.value);
                  setCurrentIndex(0);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleNext();
                }}
                placeholder="Search text or formula..."
                className="w-full px-3 py-2 bg-zinc-50/70 border border-zinc-200/90 rounded-lg text-xs font-sans text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-500 transition-all pr-20 shadow-2xs"
                autoFocus
              />
              {findText.trim() && (
                <div className="absolute right-2 flex items-center gap-1">
                  <span className="text-[10px] font-mono font-medium tabular-nums text-zinc-500 bg-zinc-100 border border-zinc-200/80 px-1.5 py-0.5 rounded-md">
                    {matches.length > 0 ? `${safeIndex + 1}/${matches.length}` : "0"}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Replace */}
          <div className="space-y-1.5">
            <label className="font-medium text-zinc-700 block">Replace with</label>
            <input
              type="text"
              value={replaceText}
              onChange={(e) => setReplaceText(e.target.value)}
              placeholder="Replacement text..."
              className="w-full px-3 py-2 bg-zinc-50/70 border border-zinc-200/90 rounded-lg text-xs font-sans text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-500 transition-all shadow-2xs"
            />
          </div>

          {/* Options */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none text-zinc-700">
              <input
                type="checkbox"
                checked={matchCase}
                onChange={(e) => {
                  setMatchCase(e.target.checked);
                  setCurrentIndex(0);
                }}
                className="rounded border-zinc-300 text-blue-600 focus:ring-blue-600 w-3.5 h-3.5 cursor-pointer"
              />
              <span>Match case</span>
            </label>

            {/* Navigation buttons */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrev}
                disabled={matches.length === 0}
                className="size-7 text-zinc-600 border border-zinc-200/90 bg-white hover:bg-zinc-50 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs transition-all active:scale-[0.98] flex items-center justify-center cursor-pointer"
                title="Previous match"
              >
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                disabled={matches.length === 0}
                className="size-7 text-zinc-600 border border-zinc-200/90 bg-white hover:bg-zinc-50 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs transition-all active:scale-[0.98] flex items-center justify-center cursor-pointer"
                title="Next match"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Active Match Details */}
          {matches.length > 0 && safeIndex >= 0 && (
            <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200/80 text-zinc-600 text-[11px] flex items-center justify-between">
              <span>
                Match at sheet{" "}
                <strong className="text-zinc-900 font-semibold">
                  {matches[safeIndex].sheetName}
                </strong>
                , cell{" "}
                <strong className="text-zinc-900 font-mono font-semibold">
                  {matches[safeIndex].cellRef}
                </strong>
              </span>
              <button
                type="button"
                onClick={() => navigateToMatch(safeIndex)}
                className="text-blue-600 hover:underline font-medium cursor-pointer"
              >
                Jump to cell
              </button>
            </div>
          )}

          {/* Status Message */}
          {statusMessage && (
            <div className="p-2 text-center text-[11px] font-medium text-zinc-700 bg-zinc-100 rounded-lg">
              {statusMessage}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="px-5 py-3 border-t border-zinc-100 bg-zinc-50/50 flex items-center justify-between text-xs">
          <form method="dialog">
            <button
              type="submit"
              onClick={handleClose}
              className="h-8 px-3.5 font-medium text-zinc-700 bg-white border border-zinc-200/90 rounded-lg hover:bg-zinc-50 transition-all active:scale-[0.98] shadow-2xs cursor-pointer"
            >
              Close
            </button>
          </form>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReplaceCurrent}
              disabled={matches.length === 0}
              className="h-8 px-3 font-medium text-zinc-700 bg-white border border-zinc-200/90 rounded-lg hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs transition-all active:scale-[0.98] cursor-pointer"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={handleReplaceAll}
              disabled={matches.length === 0}
              className="h-8 px-3.5 font-medium text-white bg-blue-600 hover:bg-blue-700 border border-blue-600 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed shadow-xs transition-all active:scale-[0.98] cursor-pointer"
            >
              Replace All
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
};
