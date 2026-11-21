import React, { useState } from "react";
import { autoCloseParentheses } from "../utils/spreadsheetConverter";

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
  onTextChange?: (text: string) => void;
  onOpenFormulaGuide: () => void;
  selectionStats: SelectionStats | null;
}

export const FormulaBar: React.FC<FormulaBarProps> = ({
  activeCellCoord,
  activeCellText,
  onCommitCellText,
  onTextChange,
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
    if (e.key === "Enter") {
      const closed = autoCloseParentheses(inputText);
      setInputText(closed);
      onCommitCellText(closed);
    } else if (e.key === "Escape") {
      setInputText(activeCellText);
    }
  };

  const handleBlur = () => {
    if (inputText !== activeCellText) {
      const textToCommit = inputText.startsWith("=") ? autoCloseParentheses(inputText) : inputText;
      onCommitCellText(textToCommit);
    }
  };

  const formatNumber = (num: number) => {
    if (Number.isInteger(num)) return num.toLocaleString();
    return num.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  };

  return (
    <div className="no-print h-9 px-3 bg-white/95 backdrop-blur-xs border-b border-zinc-200/80 flex items-center justify-between gap-3 shrink-0 select-none text-xs">
      {/* Left: Coordinate + fx + Formula Input */}
      <div className="flex items-center gap-1.5 flex-1 max-w-4xl min-w-0">
        {/* Cell Coordinate Badge */}
        <div
          className="h-6.5 px-2.5 bg-zinc-100/90 border border-zinc-200 rounded-lg font-mono font-semibold text-zinc-800 flex items-center justify-center min-w-13 text-center text-xs tracking-tight tabular-nums shadow-2xs"
          title="Active cell reference"
        >
          {activeCellCoord || "A1"}
        </div>

        {/* fx button with tactile micro-interaction */}
        <button
          type="button"
          onClick={onOpenFormulaGuide}
          className="h-6.5 px-2 rounded-lg text-blue-700 bg-blue-50 hover:bg-blue-100/80 active:scale-[0.98] border border-blue-200/60 font-mono text-xs font-semibold flex items-center justify-center transition-all shadow-2xs cursor-pointer"
          title="Insert formula or open reference guide"
        >
          fx
        </button>

        <div className="h-4 w-px bg-zinc-200 mx-0.5" />

        {/* Formula Input */}
        <input
          type="text"
          value={inputText}
          onChange={(e) => {
            const val = e.target.value;
            setInputText(val);
            onTextChange?.(val);
          }}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder="Enter text, number, or formula starting with '='"
          className="flex-1 h-6.5 px-2.5 text-xs font-mono text-zinc-900 bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-500 transition-all placeholder:text-zinc-400 placeholder:font-sans shadow-2xs"
        />
      </div>

      {/* Right: Selection Quick Statistics Chips with Tabular Figures */}
      {selectionStats && selectionStats.count > 1 && (
        <div className="hidden lg:flex items-center gap-2.5 text-[11px] text-zinc-500 bg-zinc-50 border border-zinc-200/80 px-2.5 py-1 rounded-full shadow-2xs shrink-0 font-medium">
          <span>
            Count:{" "}
            <strong className="font-semibold text-zinc-800 font-mono tabular-nums">
              {selectionStats.count}
            </strong>
          </span>

          {selectionStats.numericCount > 0 && (
            <>
              <div className="h-3 w-px bg-zinc-200" />
              <span>
                Sum:{" "}
                <strong className="font-semibold text-zinc-950 font-mono tabular-nums">
                  {formatNumber(selectionStats.sum)}
                </strong>
              </span>
              <div className="h-3 w-px bg-zinc-200" />
              <span>
                Avg:{" "}
                <strong className="font-semibold text-zinc-800 font-mono tabular-nums">
                  {formatNumber(selectionStats.avg)}
                </strong>
              </span>
              <div className="h-3 w-px bg-zinc-200" />
              <span>
                Min:{" "}
                <strong className="font-semibold text-zinc-800 font-mono tabular-nums">
                  {formatNumber(selectionStats.min)}
                </strong>
              </span>
              <div className="h-3 w-px bg-zinc-200" />
              <span>
                Max:{" "}
                <strong className="font-semibold text-zinc-800 font-mono tabular-nums">
                  {formatNumber(selectionStats.max)}
                </strong>
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
};
