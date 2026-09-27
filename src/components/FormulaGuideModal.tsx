import React from 'react';
import { X, Code2, Plus } from 'lucide-react';

interface FormulaGuideModalProps {
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
    name: 'SUM',
    syntax: '=SUM(number1, [number2], ...)',
    description: 'Calculates the sum of a range or list of numbers.',
    example: '=SUM(A1:A10)',
    template: '=SUM()',
  },
  {
    name: 'AVERAGE',
    syntax: '=AVERAGE(number1, [number2], ...)',
    description: 'Calculates the arithmetic mean of a range of numbers.',
    example: '=AVERAGE(B2:B20)',
    template: '=AVERAGE()',
  },
  {
    name: 'MAX',
    syntax: '=MAX(number1, [number2], ...)',
    description: 'Returns the largest value from a set of numbers.',
    example: '=MAX(C1:C15)',
    template: '=MAX()',
  },
  {
    name: 'MIN',
    syntax: '=MIN(number1, [number2], ...)',
    description: 'Returns the smallest value from a set of numbers.',
    example: '=MIN(D1:D15)',
    template: '=MIN()',
  },
  {
    name: 'IF',
    syntax: '=IF(condition, value_if_true, value_if_false)',
    description: 'Returns one value if condition is TRUE and another if FALSE.',
    example: '=IF(A1>50, "Pass", "Fail")',
    template: '=IF(A1>0, "Yes", "No")',
  },
  {
    name: 'AND',
    syntax: '=AND(logical1, [logical2], ...)',
    description: 'Returns TRUE if all arguments evaluate to TRUE.',
    example: '=AND(A1>10, B1<20)',
    template: '=AND(A1>0, B1>0)',
  },
  {
    name: 'OR',
    syntax: '=OR(logical1, [logical2], ...)',
    description: 'Returns TRUE if any argument evaluates to TRUE.',
    example: '=OR(A1="Yes", B1="Yes")',
    template: '=OR(A1=1, B1=1)',
  },
  {
    name: 'CONCAT',
    syntax: '=CONCAT(text1, [text2], ...)',
    description: 'Combines the text from multiple ranges and/or strings.',
    example: '=CONCAT(A1, " ", B1)',
    template: '=CONCAT(A1, B1)',
  },
  {
    name: 'Arithmetic Math',
    syntax: '=[cell/number] [+, -, *, /, ^] [cell/number]',
    description: 'Direct mathematical calculations with standard operators.',
    example: '=A1*1.08 + B2',
    template: '=A1*B1',
  },
];

export const FormulaGuideModal: React.FC<FormulaGuideModalProps> = ({
  isOpen,
  onClose,
  onInsertFormula,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              fx
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-800">Formulas Reference</h2>
              <p className="text-xs text-slate-500">Supported calculations and function syntax</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-1 gap-3">
            {FORMULAS.map((item) => (
              <div
                key={item.name}
                className="p-4 rounded-lg border border-slate-200/80 hover:border-emerald-300 hover:bg-emerald-50/20 transition-all group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-800 text-sm">{item.name}</span>
                      <code className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono">
                        {item.syntax}
                      </code>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{item.description}</p>
                    <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
                      <Code2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>Example:</span>
                      <code className="font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                        {item.example}
                      </code>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      onInsertFormula(item.template);
                      onClose();
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors whitespace-nowrap"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Insert
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Formulas evaluate automatically inside the browser engine.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
