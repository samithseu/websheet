import React from "react";
import { UploadCloud, FileSpreadsheet } from "lucide-react";

interface DragDropOverlayProps {
  isDragging: boolean;
}

export const DragDropOverlay: React.FC<DragDropOverlayProps> = ({ isDragging }) => {
  if (!isDragging) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center bg-zinc-950/40 backdrop-blur-md transition-all animate-in fade-in duration-100">
      <div className="border-2 border-dashed border-blue-400 bg-white/95 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-150 ring-1 ring-blue-500/10">
        <div className="w-14 h-14 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center mb-3.5 shadow-2xs">
          <UploadCloud className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-zinc-900 tracking-tight">
          Drop spreadsheet file here
        </h3>
        <p className="text-xs text-zinc-500 mt-1.5">
          Supports{" "}
          <span className="font-mono font-medium text-zinc-800">.xlsx, .xls, .csv, .tsv, .ods</span>
        </p>
        <div className="mt-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 text-zinc-700 text-[11px] font-medium border border-zinc-200/80">
          <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
          <span>Processed 100% locally in your browser</span>
        </div>
      </div>
    </div>
  );
};
