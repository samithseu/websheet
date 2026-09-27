import React, { useState } from 'react';

export interface SelectionStats {
  count: number;
  numericCount: number;
  sum: number;
  avg: number;
  min: number;
  max: number;
}

interface FormulaBarProps {
  activeCellCoord: string;
  activeCellText: string;
  onCommitCellText: (text: string) => void;
  onOpenFormulaGuide: () => void;
  selectionStats: SelectionStats | null;
}

export const FormulaBar: React.FC<FormulaBarProps> = ({
  activeCellCoord,
  activeCellText,
  onCommitCellText,
  onOpenFormulaGuide,
  selectionStats,
}) => {
  const [inputText, setInputText] = useState(activeCellText);
  const [prevCoord, setPrevCoord] = useState(activeCellCoord);
  const [prevText, setPrevText] = useState(activeCellText);

  // Synchronize when the active cell changes
  if (activeCellCoord !== prevCoord || activeCellText !== prevText) {
    setPrevCoord(activeCellCoord);
    setPrevText(activeCellText);
    setInputText(activeCellText);
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onCommitCellText(inputText);
    } else if (e.key === 'Escape') {
      setInputText(activeCellText);
    }
  };

  const handleBlur = () => {
    if (inputText !== activeCellText) {
      onCommitCellText(inputText);
    }
  };

  const formatNumber = (num: number) => {
    if (Number.isInteger(num)) return num.toLocaleString();
    return num.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  };

  return (
    <div className="no-print h-9 px-3 bg-white border-b border-slate-200 flex items-center justify-between gap-2 shrink-0 select-none text-xs">
      {/* Left: Coordinate + fx + Formula Input */}
      <div className="flex items-center gap-1.5 flex-1 max-w-4xl min-w-0">
        {/* Cell Coordinate Badge */}
        <div
          className="h-6 px-2.5 bg-slate-50 border border-slate-200 rounded-md font-mono font-semibold text-slate-700 flex items-center justify-center min-w-13 text-center"
          title="Active cell reference"
        >
          {activeCellCoord || 'A1'}
        </div>

        {/* fx button */}
        <button
          type="button"
          onClick={onOpenFormulaGuide}
          className="h-6 px-2 rounded-md text-blue-600 bg-blue-50 hover:bg-blue-100 font-semibold text-xs flex items-center justify-center border border-blue-200 transition-colors cursor-pointer"
          title="Insert formula or open reference guide"
        >
          fx
        </button>

        <div className="h-4 w-px bg-slate-200 mx-0.5" />

        {/* Formula Input */}
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder="Enter text, number, or formula starting with '='"
          className="flex-1 h-6.5 px-2 text-xs font-mono text-slate-800 bg-white border border-slate-200 rounded-md focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-400 placeholder:font-sans"
        />
      </div>

      {/* Right: Selection Quick Statistics */}
      {selectionStats && selectionStats.count > 1 && (
        <div className="hidden lg:flex items-center gap-2 text-[11px] text-slate-600 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200 shrink-0 font-medium">
          <span>
            Count: <strong className="font-semibold text-slate-800 font-mono">{selectionStats.count}</strong>
          </span>

          {selectionStats.numericCount > 0 && (
            <>
              <div className="h-3 w-px bg-slate-200" />
              <span>
                Sum: <strong className="font-semibold text-blue-700 font-mono">{formatNumber(selectionStats.sum)}</strong>
              </span>
              <div className="h-3 w-px bg-slate-200" />
              <span>
                Avg: <strong className="font-semibold text-slate-800 font-mono">{formatNumber(selectionStats.avg)}</strong>
              </span>
              <div className="h-3 w-px bg-slate-200" />
              <span>
                Min: <strong className="font-semibold text-slate-800 font-mono">{formatNumber(selectionStats.min)}</strong>
              </span>
              <div className="h-3 w-px bg-slate-200" />
              <span>
                Max: <strong className="font-semibold text-slate-800 font-mono">{formatNumber(selectionStats.max)}</strong>
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
};
