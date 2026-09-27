import React from 'react';
import { UploadCloud, FileSpreadsheet } from 'lucide-react';

interface DragDropOverlayProps {
  isDragging: boolean;
}

export const DragDropOverlay: React.FC<DragDropOverlayProps> = ({ isDragging }) => {
  if (!isDragging) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center bg-emerald-950/20 backdrop-blur-xs transition-all animate-in fade-in duration-100">
      <div className="border-4 border-dashed border-emerald-500 bg-white/95 rounded-2xl p-10 max-w-md w-full mx-4 shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-150">
        <div className="w-20 h-20 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
          <UploadCloud className="w-10 h-10 animate-bounce" />
        </div>
        <h3 className="text-xl font-bold text-slate-800">Drop your spreadsheet here</h3>
        <p className="text-sm text-slate-600 mt-2">
          Supports <span className="font-semibold text-emerald-700">.xlsx, .xls, .csv, .tsv, .ods</span>
        </p>
        <div className="mt-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-medium border border-emerald-200">
          <FileSpreadsheet className="w-4 h-4" />
          <span>Processes 100% locally in your browser</span>
        </div>
      </div>
    </div>
  );
};
