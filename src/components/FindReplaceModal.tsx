import React, { useState, useEffect } from 'react';
import { X, Search, Replace, ChevronDown, ChevronUp } from 'lucide-react';
import type { XSpreadsheetData } from '../utils/spreadsheetConverter';

interface FindMatch {
  sheetIndex: number;
  sheetName: string;
  rowIndex: number;
  colIndex: number;
  cellRef: string;
  originalText: string;
}

interface FindReplaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  spreadsheetData: XSpreadsheetData;
  onSelectCell: (sheetIndex: number, rowIndex: number, colIndex: number) => void;
  onReplaceCell: (sheetIndex: number, rowIndex: number, colIndex: number, newText: string) => void;
  onReplaceAll: (newSpreadsheetData: XSpreadsheetData, count: number) => void;
}

export const FindReplaceModal: React.FC<FindReplaceModalProps> = ({
  isOpen,
  onClose,
  spreadsheetData,
  onSelectCell,
  onReplaceCell,
  onReplaceAll,
}) => {
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [matchCase, setMatchCase] = useState(false);
  const [matches, setMatches] = useState<FindMatch[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [message, setMessage] = useState('');

  // Re-scan when findText, matchCase, or spreadsheetData changes
  useEffect(() => {
    if (!isOpen || !findText.trim()) {
      setMatches([]);
      setCurrentIndex(-1);
      setMessage('');
      return;
    }

    const results: FindMatch[] = [];
    const query = matchCase ? findText : findText.toLowerCase();

    spreadsheetData.forEach((sheet, sheetIdx) => {
      const sheetName = sheet.name || `Sheet${sheetIdx + 1}`;
      const rows = sheet.rows || {};

      Object.keys(rows).forEach((rStr) => {
        const r = parseInt(rStr, 10);
        const row = rows[r];
        if (!row || !row.cells) return;

        Object.keys(row.cells).forEach((cStr) => {
          const c = parseInt(cStr, 10);
          const cell = row.cells[c];
          if (!cell || cell.text === undefined || cell.text === null) return;

          const cellStr = String(cell.text);
          const targetStr = matchCase ? cellStr : cellStr.toLowerCase();

          if (targetStr.includes(query)) {
            const colLetter = String.fromCharCode(65 + c);
            const cellRef = `${colLetter}${r + 1}`;
            results.push({
              sheetIndex: sheetIdx,
              sheetName,
              rowIndex: r,
              colIndex: c,
              cellRef,
              originalText: cellStr,
            });
          }
        });
      });
    });

    setMatches(results);
    if (results.length > 0) {
      setCurrentIndex(0);
      setMessage(`${results.length} match${results.length > 1 ? 'es' : ''} found`);
      onSelectCell(results[0].sheetIndex, results[0].rowIndex, results[0].colIndex);
    } else {
      setCurrentIndex(-1);
      setMessage('No matches found');
    }
  }, [findText, matchCase, isOpen, spreadsheetData, onSelectCell]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (matches.length === 0) return;
    const nextIdx = (currentIndex + 1) % matches.length;
    setCurrentIndex(nextIdx);
    const m = matches[nextIdx];
    onSelectCell(m.sheetIndex, m.rowIndex, m.colIndex);
  };

  const handlePrev = () => {
    if (matches.length === 0) return;
    const prevIdx = (currentIndex - 1 + matches.length) % matches.length;
    setCurrentIndex(prevIdx);
    const m = matches[prevIdx];
    onSelectCell(m.sheetIndex, m.rowIndex, m.colIndex);
  };

  const handleReplaceCurrent = () => {
    if (matches.length === 0 || currentIndex === -1) return;
    const m = matches[currentIndex];
    const regex = new RegExp(
      findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
      matchCase ? 'g' : 'gi'
    );
    const updated = m.originalText.replace(regex, replaceText);
    onReplaceCell(m.sheetIndex, m.rowIndex, m.colIndex, updated);
  };

  const handleReplaceAllClick = () => {
    if (!findText.trim()) return;

    let count = 0;
    const regex = new RegExp(
      findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
      matchCase ? 'g' : 'gi'
    );

    // Deep clone data
    const newData: XSpreadsheetData = JSON.parse(JSON.stringify(spreadsheetData));

    newData.forEach((sheet) => {
      const rows = sheet.rows || {};
      Object.keys(rows).forEach((rStr) => {
        const r = parseInt(rStr, 10);
        const row = rows[r];
        if (!row || !row.cells) return;

        Object.keys(row.cells).forEach((cStr) => {
          const c = parseInt(cStr, 10);
          const cell = row.cells[c];
          if (!cell || cell.text === undefined || cell.text === null) return;

          const cellStr = String(cell.text);
          if (regex.test(cellStr)) {
            cell.text = cellStr.replace(regex, replaceText);
            count++;
          }
        });
      });
    });

    if (count > 0) {
      onReplaceAll(newData, count);
      setMessage(`Replaced ${count} occurrence${count > 1 ? 's' : ''}`);
    } else {
      setMessage('No occurrences found to replace');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-600" />
            <h2 className="text-sm font-semibold text-slate-800">Find & Replace</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-xs">
          {/* Find */}
          <div className="space-y-1">
            <label className="font-medium text-slate-700 block">Find</label>
            <div className="relative flex items-center">
              <input
                type="text"
                value={findText}
                onChange={(e) => setFindText(e.target.value)}
                placeholder="Text or number to find..."
                autoFocus
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 pr-16"
              />
              {matches.length > 0 && (
                <span className="absolute right-2.5 text-[11px] font-mono text-slate-400">
                  {currentIndex + 1}/{matches.length}
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
              placeholder="Replacement text..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          {/* Options */}
          <div className="flex items-center gap-4 pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600">
              <input
                type="checkbox"
                checked={matchCase}
                onChange={(e) => setMatchCase(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span>Match case</span>
            </label>
          </div>

          {/* Status message */}
          {message && (
            <div className="p-2 rounded bg-slate-100 text-slate-600 font-medium text-[11px]">
              {message}
              {matches.length > 0 && currentIndex >= 0 && (
                <span className="ml-2 font-mono text-emerald-700">
                  ({matches[currentIndex].sheetName} ! {matches[currentIndex].cellRef})
                </span>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <div className="flex items-center gap-1.5">
              <button
                onClick={handlePrev}
                disabled={matches.length === 0}
                className="p-1.5 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                title="Previous match"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <button
                onClick={handleNext}
                disabled={matches.length === 0}
                className="p-1.5 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                title="Next match"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleReplaceCurrent}
                disabled={matches.length === 0}
                className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Replace className="w-3.5 h-3.5" />
                Replace
              </button>
              <button
                onClick={handleReplaceAllClick}
                disabled={!findText.trim()}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium shadow-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Replace All
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
