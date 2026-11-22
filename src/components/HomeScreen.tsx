import React, { useState } from "react";
import {
  FileSpreadsheet,
  Plus,
  FolderOpen,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  ArrowDownToLine,
  TrendingUp,
  GraduationCap,
  DollarSign,
  Upload,
  WifiOff,
  Keyboard,
  Cpu,
} from "lucide-react";
import { SAMPLE_TEMPLATES } from "../utils/sampleData";
import { GithubIcon } from "./icons/GithubIcon";
import { WebSheetLogo } from "./icons/WebSheetLogo";

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
    if (e.dataTransfer?.types?.includes("Files")) {
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
      className="h-full w-full flex-1 min-h-0 bg-zinc-50/50 text-zinc-900 flex flex-col font-sans select-none overflow-y-auto"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Top Navbar: Translucent Sticky Bar */}
      <header className="shrink-0 h-14 px-4 sm:px-8 flex items-center justify-between border-b border-zinc-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-3">
          {/* WebSheet Logo Mark */}
          <WebSheetLogo size={32} className="shrink-0" />

          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-zinc-950 tracking-tight">WebSheet</span>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium text-zinc-600 bg-zinc-100 border border-zinc-200/80">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Offline PWA</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Chromium PWA Install Button */}
          {deferredInstallPrompt && onInstallClick && (
            <button
              type="button"
              onClick={onInstallClick}
              className="flex items-center gap-1.5 h-8 px-3 text-xs font-medium text-zinc-700 bg-white hover:bg-zinc-50 border border-zinc-200/90 rounded-lg transition-all active:scale-[0.98] cursor-pointer shadow-2xs"
              title="Install WebSheet to your device"
            >
              <ArrowDownToLine className="w-3.5 h-3.5 text-zinc-600" />
              <span className="hidden sm:inline">Install App</span>
            </button>
          )}

          {/* Privacy Guarantee Pill */}
          <button
            type="button"
            onClick={onOpenPrivacyModal}
            className="hidden sm:flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-medium text-zinc-700 bg-zinc-50 border border-zinc-200/80 hover:bg-zinc-100 hover:border-zinc-300 transition-all active:scale-[0.98] cursor-pointer shadow-2xs"
            title="100% Client-Side Private"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-zinc-800" />
            <span>Client-Side Private</span>
          </button>

          {/* Shortcuts Modal Trigger */}
          <button
            type="button"
            onClick={onOpenShortcutsModal}
            className="size-8 text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100 rounded-lg transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center"
            title="Shortcuts & Help"
            aria-label="Keyboard shortcuts"
          >
            <Keyboard className="w-4 h-4" />
          </button>

          {/* GitHub Link */}
          <a
            href="https://github.com/samithseu/websheet"
            target="_blank"
            rel="noopener noreferrer"
            className="size-8 text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100 rounded-lg transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center"
            title="View source on GitHub"
            aria-label="GitHub repository"
          >
            <GithubIcon className="w-4 h-4" />
          </a>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-8 py-10 flex flex-col justify-center gap-10">
        {/* Hero Section */}
        <div className="text-center max-w-2xl mx-auto space-y-3.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium text-zinc-600 bg-zinc-100/80 border border-zinc-200/80 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
            <span>Zero Server Egress • In-Memory Spreadsheet Engine</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-zinc-900 leading-[1.12]">
            Spreadsheets, simplified and private.
          </h1>
          <p className="text-sm sm:text-base text-zinc-600 max-w-xl mx-auto leading-relaxed">
            Create, view, and edit Excel and CSV files directly in your browser. Instant launch,
            zero server uploads, 100% offline.
          </p>
        </div>

        {/* In-Session Quick Resume Card (if workbook active) */}
        {hasActiveSession && onResumeEditing && (
          <div className="bg-white border border-zinc-200/90 rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4 shadow-2xs hover:border-zinc-300 transition-all">
            <div className="flex items-center gap-3.5 text-left min-w-0">
              <WebSheetLogo size={40} className="shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                  Active Session
                </p>
                <p className="text-sm font-semibold text-zinc-900 truncate max-w-xs sm:max-w-md mt-0.5 font-mono">
                  {activeFilename || "Untitled_Spreadsheet.xlsx"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onResumeEditing}
              className="flex items-center gap-2 h-9 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-medium rounded-lg shadow-xs transition-all active:scale-[0.98] cursor-pointer shrink-0"
            >
              <span>Resume Editing</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Primary Action Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          {/* 1. Create New Spreadsheet */}
          <button
            type="button"
            onClick={onNewSpreadsheet}
            className="group relative bg-white border border-zinc-200/90 rounded-2xl p-6 sm:p-7 text-left hover:border-blue-300 hover:ring-2 hover:ring-blue-600/10 hover:shadow-xs transition-all duration-200 cursor-pointer flex flex-col justify-between gap-6"
          >
            <div className="flex items-start justify-between">
              <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all duration-200 flex items-center justify-center shadow-2xs">
                <Plus className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium text-zinc-500 group-hover:text-blue-600 transition-colors flex items-center gap-1">
                New Sheet{" "}
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-zinc-900 group-hover:text-zinc-950 transition-colors">
                New Spreadsheet
              </h2>
              <p className="text-xs sm:text-sm text-zinc-500 mt-1 leading-relaxed">
                Start from scratch with a clean, unformatted workbook grid.
              </p>
            </div>
          </button>

          {/* 2. Import / Open File (with Dropzone & Format Chips) */}
          <button
            type="button"
            onClick={onOpenFileClick}
            className={`group relative rounded-2xl p-6 sm:p-7 text-left transition-all duration-200 cursor-pointer flex flex-col justify-between gap-6 ${
              isDropZoneActive
                ? "border-blue-600 bg-blue-50/40 ring-2 ring-blue-600/20 shadow-md"
                : "bg-white border border-zinc-200/90 hover:border-blue-300 hover:ring-2 hover:ring-blue-600/10 hover:shadow-xs"
            }`}
          >
            <div className="flex items-start justify-between">
              <div
                className={`w-11 h-11 rounded-xl border transition-all duration-200 flex items-center justify-center shadow-2xs ${
                  isDropZoneActive
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-zinc-100 text-zinc-900 border-zinc-200/80 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600"
                }`}
              >
                {isDropZoneActive ? (
                  <Upload className="w-5 h-5" />
                ) : (
                  <FolderOpen className="w-5 h-5" />
                )}
              </div>
              <span className="text-xs font-medium text-zinc-500 group-hover:text-blue-600 transition-colors flex items-center gap-1">
                Browse or Drop{" "}
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-1.5 flex-wrap">
                {[".xlsx", ".csv", ".ods", ".tsv"].map((ext) => (
                  <span
                    key={ext}
                    className="font-mono text-[10px] font-medium px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-600 border border-zinc-200/60"
                  >
                    {ext}
                  </span>
                ))}
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-zinc-900 group-hover:text-zinc-950 transition-colors">
                  Open Spreadsheet
                </h2>
                <p className="text-xs sm:text-sm text-zinc-500 mt-1 leading-relaxed">
                  Open local spreadsheet files or drag & drop directly onto this card.
                </p>
              </div>
            </div>
          </button>
        </div>

        {/* Templates Gallery */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-zinc-900" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Start with a template
              </h3>
            </div>
            <span className="text-[11px] text-zinc-400 font-medium">
              Ready-to-use formulas & layouts
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {SAMPLE_TEMPLATES.map((tmpl) => {
              let IconComponent = FileSpreadsheet;
              let categoryTag = "General";
              let featureBadge = "Formulas";

              if (tmpl.id === "monthly-budget") {
                IconComponent = DollarSign;
                categoryTag = "Personal Finance";
                featureBadge = "Formulas & Totals";
              } else if (tmpl.id === "sales-tracker") {
                IconComponent = TrendingUp;
                categoryTag = "Revenue & Pipeline";
                featureBadge = "Quarterly Sums";
              } else if (tmpl.id === "student-grades") {
                IconComponent = GraduationCap;
                categoryTag = "Academic & Grading";
                featureBadge = "Weighted GPA";
              }

              return (
                <button
                  key={tmpl.id}
                  type="button"
                  onClick={() => onSelectTemplate(tmpl.id)}
                  className="group bg-white border border-zinc-200/80 rounded-xl p-4 text-left hover:border-blue-300 hover:ring-2 hover:ring-blue-600/10 hover:shadow-xs transition-all duration-150 cursor-pointer flex flex-col justify-between gap-3.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-lg bg-zinc-100 border border-zinc-200/60 text-zinc-800 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-colors">
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-medium text-zinc-600 bg-zinc-50 border border-zinc-200/60 px-2 py-0.5 rounded-full">
                      {categoryTag}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-semibold text-zinc-900 group-hover:text-blue-600 transition-colors">
                      {tmpl.name}
                    </h4>
                    <p className="text-[11px] text-zinc-500 mt-1 line-clamp-2 leading-relaxed">
                      {tmpl.description}
                    </p>
                  </div>
                  <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-[10px] text-zinc-400 group-hover:text-blue-600 transition-colors">
                    <span className="font-mono">{featureBadge}</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Value Propositions / Trust Grid (4-card Bento) */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Architecture & Security Guarantees
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
            {/* Card 1: Zero Server Egress */}
            <div className="bg-zinc-50/60 border border-zinc-200/80 rounded-2xl p-5 sm:p-6 flex flex-col justify-between gap-4 hover:border-zinc-300 transition-all">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-white border border-zinc-200/80 text-zinc-900 flex items-center justify-center shadow-2xs">
                  <ShieldCheck className="w-4.5 h-4.5 text-zinc-900" />
                </div>
                <span className="text-[10px] font-mono font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full">
                  0 network egress
                </span>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-zinc-900">Client-Side Memory Sandbox</h4>
                <p className="text-xs text-zinc-600 mt-1 leading-relaxed">
                  Spreadsheet files and formulas run entirely inside browser RAM. Zero files,
                  telemetry, or cell data ever touch a remote server or third-party service.
                </p>
              </div>
            </div>

            {/* Card 2: Offline-First PWA */}
            <div className="bg-zinc-50/60 border border-zinc-200/80 rounded-2xl p-5 sm:p-6 flex flex-col justify-between gap-4 hover:border-zinc-300 transition-all">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-white border border-zinc-200/80 text-zinc-900 flex items-center justify-center shadow-2xs">
                  <WifiOff className="w-4.5 h-4.5 text-zinc-900" />
                </div>
                <span className="text-[10px] font-mono font-medium text-zinc-700 bg-zinc-100 border border-zinc-200/60 px-2 py-0.5 rounded-full">
                  App shell cached
                </span>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-zinc-900">Offline & Installable PWA</h4>
                <p className="text-xs text-zinc-600 mt-1 leading-relaxed">
                  Precached via modern Service Worker. Install as a standalone desktop or mobile
                  application and work seamlessly without an internet connection.
                </p>
              </div>
            </div>

            {/* Card 3: SheetJS High-Fidelity Engine */}
            <div className="bg-zinc-50/60 border border-zinc-200/80 rounded-2xl p-5 sm:p-6 flex flex-col justify-between gap-4 hover:border-zinc-300 transition-all">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-white border border-zinc-200/80 text-zinc-900 flex items-center justify-center shadow-2xs">
                  <Cpu className="w-4.5 h-4.5 text-zinc-900" />
                </div>
                <span className="font-mono text-[10px] text-zinc-600 bg-zinc-100 border border-zinc-200/60 px-2 py-0.5 rounded-full">
                  .xlsx • .csv • .ods • .tsv
                </span>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-zinc-900">
                  High-Fidelity Translation Engine
                </h4>
                <p className="text-xs text-zinc-600 mt-1 leading-relaxed">
                  Hardened SheetJS translation layer supporting merges, formula evaluations,
                  multiline auto-fit, and export roundtripping without data corruption.
                </p>
              </div>
            </div>

            {/* Card 4: Keyboard-First Workflow */}
            <div className="bg-zinc-50/60 border border-zinc-200/80 rounded-2xl p-5 sm:p-6 flex flex-col justify-between gap-4 hover:border-zinc-300 transition-all">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-white border border-zinc-200/80 text-zinc-900 flex items-center justify-center shadow-2xs">
                  <Keyboard className="w-4.5 h-4.5 text-zinc-900" />
                </div>
                <span className="text-[10px] font-mono font-medium text-zinc-700 bg-zinc-100 border border-zinc-200/60 px-2 py-0.5 rounded-full">
                  Universal hotkeys
                </span>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-zinc-900">
                  Keyboard-First & Sandboxed PDF
                </h4>
                <p className="text-xs text-zinc-600 mt-1 leading-relaxed">
                  Universal hotkeys (⌘S, ⌘O, ⌘F, ⌘P), multi-cell aggregate calculations (SUM, AVG,
                  MIN, MAX), and sandboxed iframe virtual print engine.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Minimalist Typographic Footer */}
      <footer className="shrink-0 py-6 border-t border-zinc-200/80 bg-white/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-800">WebSheet</span>
            <span className="text-zinc-300">•</span>
            <span>100% Client-Side Private</span>
            <span className="text-zinc-300">•</span>
            <span className="font-mono text-[11px] text-zinc-400 bg-zinc-100 border border-zinc-200/60 px-1.5 py-0.5 rounded">
              v1.0.0
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium text-zinc-600">
            <button
              type="button"
              onClick={onOpenPrivacyModal}
              className="hover:text-zinc-950 transition-all active:scale-[0.98] cursor-pointer"
            >
              Privacy Guarantee
            </button>
            <button
              type="button"
              onClick={onOpenShortcutsModal}
              className="hover:text-zinc-950 transition-all active:scale-[0.98] cursor-pointer"
            >
              Shortcuts
            </button>
            <a
              href="https://github.com/samithseu/websheet"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-zinc-950 transition-all active:scale-[0.98]"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
