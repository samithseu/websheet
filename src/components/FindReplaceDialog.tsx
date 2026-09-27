import React, { useState, useEffect, useRef, useMemo } from 'react';
import { X, Search, Replace, ChevronDown, ChevronUp } from 'lucide-react';
import type { XSpreadsheetData } from '../utils/spreadsheetConverter';
import {
  searchWorkbook,
  replaceSingleOccurrence,
  replaceAllOccurrences,
} from '../utils/findReplace';

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
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
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
      matchCase
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
      matchCase
    );
    const msg = count > 0
      ? `Replaced ${count} occurrence${count > 1 ? 's' : ''}`
      : 'No occurrences found to replace';
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
      <div className="bg-white rounded-xl shadow-2xl w-[90vw] max-w-md overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Search className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-semibold text-slate-800">Find & Replace</h2>
          </div>
          <form method="dialog">
            <button
              type="submit"
              onClick={handleClose}
              className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Form Body */}
        <div className="p-5 space-y-4 text-xs">
          {/* Find */}
          <div className="space-y-1">
            <label className="font-medium text-slate-700 block">Find</label>
            <div className="relative flex items-center">
              <input
                type="text"
                value={findText}
                onChange={(e) => {
                  setFindText(e.target.value);
                  setCurrentIndex(0);
                  setStatusMessage(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleNext();
                  }
                }}
                placeholder="Text or number to find..."
                autoFocus
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-sans focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-16"
              />
              {matches.length > 0 && (
                <span className="absolute right-2.5 text-[11px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                  {safeIndex + 1}/{matches.length}
                </span>
              )}
            </div>
          </div>

          {/* Replace */}
          <div className="space-y-1">
            <label className="font-medium text-slate-700 block">Replace with</label>
            <input
              type="text"
              value={replaceText}
              onChange={(e) => setReplaceText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleReplaceCurrent();
                }
              }}
              placeholder="Replacement text..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-sans focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Options */}
          <div className="flex items-center gap-4 pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600">
              <input
                type="checkbox"
                checked={matchCase}
                onChange={(e) => {
                  setMatchCase(e.target.checked);
                  setCurrentIndex(0);
                }}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span>Match case</span>
            </label>
          </div>

          {/* Feedback & Match coordinates */}
          {(statusMessage || (matches.length > 0 && safeIndex >= 0)) && (
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 font-medium text-[11px] flex items-center justify-between">
              <span>{statusMessage || `${matches.length} match${matches.length > 1 ? 'es' : ''} found`}</span>
              {matches.length > 0 && safeIndex >= 0 && (
                <span className="font-mono text-blue-700 font-semibold">
                  {matches[safeIndex].sheetName} ! {matches[safeIndex].cellRef}
                </span>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handlePrev}
                disabled={matches.length === 0}
                className="p-1.5 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                title="Previous match"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                disabled={matches.length === 0}
                className="p-1.5 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                title="Next match"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleReplaceCurrent}
                disabled={matches.length === 0 || safeIndex < 0}
                className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <Replace className="w-3.5 h-3.5" />
                <span>Replace</span>
              </button>
              <button
                type="button"
                onClick={handleReplaceAll}
                disabled={!findText.trim()}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Replace All
              </button>
            </div>
          </div>
        </div>
      </div>
    </dialog>
  );
};
