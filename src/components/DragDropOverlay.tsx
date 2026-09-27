import React from 'react';
import { UploadCloud, FileSpreadsheet } from 'lucide-react';

interface DragDropOverlayProps {
  isDragging: boolean;
}

export const DragDropOverlay: React.FC<DragDropOverlayProps> = ({ isDragging }) => {
  if (!isDragging) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center bg-slate-900/30 backdrop-blur-xs transition-all animate-in fade-in duration-100">
      <div className="border-3 border-dashed border-blue-500 bg-white/95 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-150">
        <div className="w-16 h-16 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
          <UploadCloud className="w-8 h-8 animate-bounce" />
        </div>
        <h3 className="text-lg font-bold text-slate-800">Drop spreadsheet file here</h3>
        <p className="text-xs text-slate-600 mt-1.5">
          Supports <span className="font-semibold text-blue-600">.xlsx, .xls, .csv, .tsv, .ods</span>
        </p>
        <div className="mt-3.5 flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200">
          <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
          <span>Processes 100% locally in your browser</span>
        </div>
      </div>
    </div>
  );
};
