import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Plus,
  FolderOpen,
  ArrowRight,
  ShieldCheck,
  HelpCircle,
  Sparkles,
  ArrowDownToLine,
  TrendingUp,
  GraduationCap,
  DollarSign,
  Upload,
} from 'lucide-react';
import { SAMPLE_TEMPLATES } from '../utils/sampleData';

export interface HomeScreenProps {
  onNewSpreadsheet: () => void;
  onOpenFileClick: () => void;
  onSelectTemplate: (templateId: string) => void;
  hasActiveSession?: boolean;
  activeFilename?: string;
  onResumeEditing?: () => void;
  onOpenPrivacyModal: () => void;
  onOpenShortcutsModal: () => void;
  deferredInstallPrompt?: any;
  onInstallClick?: () => void;
  onDropFile?: (file: File) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNewSpreadsheet,
  onOpenFileClick,
  onSelectTemplate,
  hasActiveSession,
  activeFilename,
  onResumeEditing,
  onOpenPrivacyModal,
  onOpenShortcutsModal,
  deferredInstallPrompt,
  onInstallClick,
  onDropFile,
}) => {
  const [isDropZoneActive, setIsDropZoneActive] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer?.types?.includes('Files')) {
      setIsDropZoneActive(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDropZoneActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDropZoneActive(false);
    if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
      onDropFile?.(e.dataTransfer.files[0]);
    }
  };

  return (
    <div
      className="h-full w-full flex-1 min-h-0 bg-slate-50 text-slate-800 flex flex-col font-sans select-none overflow-y-auto"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Top Navbar */}
      <header className="shrink-0 h-14 px-6 sm:px-10 flex items-center justify-between border-b border-slate-200/80 bg-white/80 backdrop-blur-xs sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
            <FileSpreadsheet className="w-4.5 h-4.5" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-bold text-base text-slate-900 tracking-tight">
              Web<span className="text-blue-600">Sheet</span>
            </span>
            <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
              Offline PWA
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {deferredInstallPrompt && onInstallClick && (
            <button
              type="button"
              onClick={onInstallClick}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
              title="Install WebSheet to your device"
            >
              <ArrowDownToLine className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Install App</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenPrivacyModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium hover:bg-slate-200/70 transition-colors cursor-pointer"
            title="100% Client-Side Private"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">Client-Side Private</span>
          </button>

          <button
            type="button"
            onClick={onOpenShortcutsModal}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Shortcuts & Help"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 sm:px-10 py-10 flex flex-col justify-center gap-10">
        {/* Hero Section */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Spreadsheets, simplified and private
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Create, view, and edit Excel and CSV files directly in your browser.
            Instant start, zero server uploads, 100% offline.
          </p>
        </div>

        {/* In-Session Quick Resume Card (if workbook active) */}
        {hasActiveSession && onResumeEditing && (
          <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                  Open Workbook
                </p>
                <p className="text-sm font-bold text-slate-900 truncate max-w-xs sm:max-w-md">
                  {activeFilename || 'Untitled_Spreadsheet.xlsx'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onResumeEditing}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
            >
              <span>Resume Editing</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Primary Action Buttons / Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* 1. Create New Spreadsheet */}
          <button
            type="button"
            onClick={onNewSpreadsheet}
            className="group relative bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 text-left hover:border-blue-500 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between gap-6"
          >
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors flex items-center justify-center shadow-2xs">
                <Plus className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold text-blue-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                New Sheet <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                New Spreadsheet
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Start from scratch with a clean, blank spreadsheet grid.
              </p>
            </div>
          </button>

          {/* 2. Import / Open File */}
          <button
            type="button"
            onClick={onOpenFileClick}
            className={`group relative bg-white border rounded-2xl p-6 sm:p-8 text-left transition-all duration-200 cursor-pointer flex flex-col justify-between gap-6 ${
              isDropZoneActive
                ? 'border-blue-500 bg-blue-50/50 shadow-md ring-2 ring-blue-500/20'
                : 'border-slate-200 hover:border-blue-500 hover:shadow-md'
            }`}
          >
            <div className="flex items-start justify-between">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-2xs transition-colors ${
                  isDropZoneActive
                    ? 'bg-blue-600 text-white'
                    : 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white'
                }`}
              >
                {isDropZoneActive ? <Upload className="w-6 h-6" /> : <FolderOpen className="w-6 h-6" />}
              </div>
              <span className="text-xs font-semibold text-emerald-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                Browse or Drop <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                Open Spreadsheet
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Open .xlsx, .xls, .csv, .tsv, or .ods from your device or drag & drop.
              </p>
            </div>
          </button>
        </div>

        {/* Templates Gallery */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
              Start with a template
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {SAMPLE_TEMPLATES.map((tmpl) => {
              let IconComponent = FileSpreadsheet;
              let iconBg = 'bg-blue-50 text-blue-600';

              if (tmpl.id === 'monthly-budget') {
                IconComponent = DollarSign;
                iconBg = 'bg-indigo-50 text-indigo-600';
              } else if (tmpl.id === 'sales-tracker') {
                IconComponent = TrendingUp;
                iconBg = 'bg-emerald-50 text-emerald-600';
              } else if (tmpl.id === 'student-grades') {
                IconComponent = GraduationCap;
                iconBg = 'bg-amber-50 text-amber-600';
              }

              return (
                <button
                  key={tmpl.id}
                  type="button"
                  onClick={() => onSelectTemplate(tmpl.id)}
                  className="group bg-white border border-slate-200 rounded-xl p-4 text-left hover:border-blue-500 hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between gap-3"
                >
                  <div className="flex items-center justify-between">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconBg}`}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                    {tmpl.id === 'monthly-budget' && (
                      <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200/60">
                        Borders & Formulas
                      </span>
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {tmpl.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                      {tmpl.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="shrink-0 py-6 text-center text-xs text-slate-500 border-t border-slate-200/80 bg-white">
        <p>100% Client-Side Private • Spreadsheets never leave your computer • Works Offline</p>
      </footer>
    </div>
  );
};
