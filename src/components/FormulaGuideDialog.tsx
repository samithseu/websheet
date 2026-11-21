import React, { useEffect, useRef } from "react";
import { X, Plus } from "lucide-react";

interface FormulaGuideDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertFormula: (formulaTemplate: string) => void;
}

interface FormulaItem {
  name: string;
  syntax: string;
  description: string;
  example: string;
  template: string;
}

const FORMULAS: FormulaItem[] = [
  {
    name: "SUM",
    syntax: "=SUM(number1, [number2], ...)",
    description: "Calculates the sum of a range or list of numbers.",
    example: "=SUM(A1:A10)",
    template: "=SUM()",
  },
  {
    name: "AVERAGE",
    syntax: "=AVERAGE(number1, [number2], ...)",
    description: "Calculates the arithmetic mean of a range of numbers.",
    example: "=AVERAGE(B2:B20)",
    template: "=AVERAGE()",
  },
  {
    name: "MAX",
    syntax: "=MAX(number1, [number2], ...)",
    description: "Returns the largest value from a set of numbers.",
    example: "=MAX(C1:C15)",
    template: "=MAX()",
  },
  {
    name: "MIN",
    syntax: "=MIN(number1, [number2], ...)",
    description: "Returns the smallest value from a set of numbers.",
    example: "=MIN(D1:D15)",
    template: "=MIN()",
  },
  {
    name: "IF",
    syntax: "=IF(condition, value_if_true, value_if_false)",
    description: "Returns one value if condition is TRUE and another if FALSE.",
    example: '=IF(A1>50, "Pass", "Fail")',
    template: '=IF(A1>0, "Yes", "No")',
  },
  {
    name: "AND",
    syntax: "=AND(logical1, [logical2], ...)",
    description: "Returns TRUE if all arguments evaluate to TRUE.",
    example: "=AND(A1>10, B1<20)",
    template: "=AND(A1>0, B1>0)",
  },
  {
    name: "OR",
    syntax: "=OR(logical1, [logical2], ...)",
    description: "Returns TRUE if any argument evaluates to TRUE.",
    example: '=OR(A1="Yes", B1="Yes")',
    template: "=OR(A1=1, B1=1)",
  },
  {
    name: "CONCAT",
    syntax: "=CONCAT(text1, [text2], ...)",
    description: "Combines the text from multiple ranges and/or strings.",
    example: '=CONCAT(A1, " ", B1)',
    template: "=CONCAT(A1, B1)",
  },
  {
    name: "Arithmetic Math",
    syntax: "=[cell/number] [+, -, *, /, ^] [cell/number]",
    description: "Direct mathematical calculations with standard operators.",
    example: "=A1*1.08 + B2",
    template: "=A1*B1",
  },
];

export const FormulaGuideDialog: React.FC<FormulaGuideDialogProps> = ({
  isOpen,
  onClose,
  onInsertFormula,
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
        onClose();
      }}
      onClose={onClose}
      className="outline-none"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-[90vw] max-w-2xl max-h-[85vh] flex flex-col border border-zinc-200/90 overflow-hidden ring-1 ring-black/[0.04]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-mono font-bold text-sm border border-blue-100">
              fx
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-900 tracking-tight">
                Formulas Reference
              </h2>
              <p className="text-xs text-zinc-500">Supported calculations and function syntax</p>
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

        {/* Content */}
        <div className="overflow-y-auto p-6 space-y-3">
          <div className="grid grid-cols-1 gap-2.5">
            {FORMULAS.map((item) => (
              <div
                key={item.name}
                className="p-3.5 rounded-xl border border-zinc-200/80 hover:border-zinc-300 hover:bg-zinc-50/50 bg-white transition-all shadow-2xs group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-zinc-900 text-xs">{item.name}</span>
                      <code className="text-[11px] px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700 font-mono border border-zinc-200/60">
                        {item.syntax}
                      </code>
                    </div>
                    <p className="text-xs text-zinc-600 mt-1 leading-relaxed">{item.description}</p>
                    <div className="flex items-center gap-2 mt-2 text-[11px] text-zinc-500 font-medium">
                      <span>Example:</span>
                      <code className="font-mono text-xs text-zinc-800 bg-zinc-50 border border-zinc-200 px-1.5 py-0.5 rounded">
                        {item.example}
                      </code>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onInsertFormula(item.template);
                      onClose();
                    }}
                    className="flex items-center gap-1 h-7 px-2.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200/60 rounded-lg hover:bg-blue-100/80 transition-all active:scale-[0.98] shadow-2xs cursor-pointer shrink-0"
                    title={`Insert ${item.template} into cell`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Insert</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-600 leading-relaxed">
            <strong className="font-semibold text-zinc-900 block mb-0.5">
              Instant Calculation Tip
            </strong>
            Type an equals sign <code className="font-mono font-semibold text-zinc-800">=</code> in
            any cell or the formula bar to begin a formula. Click or drag across cells in the grid
            to automatically reference coordinate ranges like{" "}
            <code className="font-mono text-zinc-800">A1:B10</code>. Parentheses close automatically
            when pressing Enter.
          </div>
        </div>

        {/* Footer */}
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
