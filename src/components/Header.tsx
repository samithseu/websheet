import React, { useState, useRef, useEffect } from "react";
import {
  FileSpreadsheet,
  FolderOpen,
  Download,
  FilePlus,
  Home,
  Printer,
  FileText,
  Code,
  Globe,
  Undo2,
  Redo2,
  Search,
  Sparkles,
  ShieldCheck,
  HelpCircle,
  ChevronDown,
  Trash2,
  Check,
  Edit2,
  X,
  ArrowDownToLine,
} from "lucide-react";
import { SAMPLE_TEMPLATES } from "../utils/sampleData";
import { GithubIcon } from "./icons/GithubIcon";

interface HeaderProps {
  filename: string;
  onFilenameChange: (name: string) => void;
  onNavigateHome: () => void;
  onRequestNewSpreadsheet: () => void;
  onOpenFileClick: () => void;
  onExport: (format: "xlsx" | "csv" | "json" | "html") => void;
  onPrint: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onRequestClearSheet: () => void;
  onRequestDeleteSheet?: () => void;
  onOpenFindReplace: () => void;
  onOpenFormulaGuide: () => void;
  onOpenPrivacyModal: () => void;
  onOpenShortcutsModal: () => void;
  onRequestLoadTemplate: (templateId: string) => void;
  deferredInstallPrompt?: any;
  onInstallClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  filename,
  onFilenameChange,
  onNavigateHome,
  onRequestNewSpreadsheet,
  onOpenFileClick,
  onExport,
  onPrint,
  onUndo,
  onRedo,
  onRequestClearSheet,
  onRequestDeleteSheet,
  onOpenFindReplace,
  onOpenFormulaGuide,
  onOpenPrivacyModal,
  onOpenShortcutsModal,
  onRequestLoadTemplate,
  deferredInstallPrompt: propDeferredInstallPrompt,
  onInstallClick: propOnInstallClick,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(filename);
  const [localDeferredInstallPrompt, setLocalDeferredInstallPrompt] = useState<any>(null);

  const deferredInstallPrompt =
    propDeferredInstallPrompt !== undefined
      ? propDeferredInstallPrompt
      : localDeferredInstallPrompt;

  // Trigger button refs for native Popover positioning
  const fileBtnRef = useRef<HTMLButtonElement>(null);
  const editBtnRef = useRef<HTMLButtonElement>(null);
  const templatesBtnRef = useRef<HTMLButtonElement>(null);
  const exportBtnRef = useRef<HTMLButtonElement>(null);

  // Listen for Chromium beforeinstallprompt event if not provided via props
  useEffect(() => {
    if (propDeferredInstallPrompt !== undefined) return;
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setLocalDeferredInstallPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, [propDeferredInstallPrompt]);

  const handleInstallClick = async () => {
    if (propOnInstallClick) {
      propOnInstallClick();
      return;
    }
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    const { outcome } = await deferredInstallPrompt.userChoice;
    if (outcome === "accepted") {
      setLocalDeferredInstallPrompt(null);
    }
  };

  const handleNameSubmit = () => {
    setIsEditingName(false);
    let trimmed = tempName.trim();
    if (!trimmed) trimmed = "Spreadsheet";
    if (!trimmed.endsWith(".xlsx") && !trimmed.endsWith(".csv") && !trimmed.endsWith(".ods")) {
      trimmed += ".xlsx";
    }
    onFilenameChange(trimmed);
  };

  const positionPopover = (popoverEl: HTMLElement, triggerEl: HTMLElement | null) => {
    if (!triggerEl) return;
    const rect = triggerEl.getBoundingClientRect();
    popoverEl.style.top = `${rect.bottom + 4}px`;
    const popoverWidth = popoverEl.offsetWidth || 240;
    const maxLeft = window.innerWidth - popoverWidth - 8;
    const calculatedLeft = Math.max(8, Math.min(rect.left, maxLeft));
    popoverEl.style.left = `${calculatedLeft}px`;
  };

  const closePopover = (e: React.MouseEvent) => {
    const popoverEl = e.currentTarget.closest("[popover]") as HTMLElement;
    if (popoverEl && typeof (popoverEl as any).hidePopover === "function") {
      (popoverEl as any).hidePopover();
    }
  };

  return (
    <header className="no-print bg-white/95 backdrop-blur-md border-b border-zinc-200/80 select-none shrink-0 z-30">
      {/* Top Application Bar */}
      <div className="h-12 px-3 sm:px-4 flex items-center justify-between gap-3 border-b border-zinc-100">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {/* Brand Icon & Name with Home Navigation */}
          <button
            type="button"
            onClick={onNavigateHome}
            className="group flex items-center gap-2 cursor-pointer transition-all active:scale-95"
            title="Return to Home Screen"
          >
            <div className="w-7.5 h-7.5 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs border border-blue-500 ring-1 ring-blue-400/20 group-hover:bg-blue-700 transition-colors">
              <FileSpreadsheet className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-sm tracking-tight text-zinc-950 hidden sm:inline">
              Web<span className="text-zinc-500 font-normal">Sheet</span>
            </span>
          </button>

          <div className="h-4 w-px bg-zinc-200 hidden sm:block" />

          {/* Inline Filename Editing Pill */}
          <div className="flex items-center">
            {isEditingName ? (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  onBlur={handleNameSubmit}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleNameSubmit();
                    if (e.key === "Escape") {
                      setTempName(filename);
                      setIsEditingName(false);
                    }
                  }}
                  autoFocus
                  className="px-2.5 py-1 text-xs font-mono font-medium text-zinc-900 bg-white border border-zinc-300 rounded-lg shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-500 w-36 sm:w-56 transition-all"
                />
                <button
                  type="button"
                  onClick={handleNameSubmit}
                  className="size-7 text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 rounded-lg flex items-center justify-center transition-all active:scale-[0.98] cursor-pointer"
                  title="Save name"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTempName(filename);
                    setIsEditingName(false);
                  }}
                  className="size-7 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg flex items-center justify-center transition-all active:scale-[0.98] cursor-pointer"
                  title="Cancel"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setTempName(filename);
                  setIsEditingName(true);
                }}
                className="group flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-medium text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 border border-transparent hover:border-zinc-200/60 transition-all active:scale-[0.98] cursor-pointer"
                title="Click to rename document"
              >
                <span className="truncate max-w-[130px] sm:max-w-[220px]">{filename}</span>
                <Edit2 className="w-3 h-3 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            )}
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Chromium PWA Install Button */}
          {deferredInstallPrompt && (
            <button
              type="button"
              onClick={handleInstallClick}
              className="flex items-center gap-1.5 h-8 px-2.5 text-xs font-medium text-zinc-700 bg-white hover:bg-zinc-50 border border-zinc-200/90 rounded-lg transition-all active:scale-[0.98] cursor-pointer shadow-2xs"
              title="Install WebSheet to your device"
            >
              <ArrowDownToLine className="w-3.5 h-3.5 text-zinc-600" />
              <span className="hidden md:inline">Install</span>
            </button>
          )}

          {/* Client-Side Privacy Pill */}
          <button
            type="button"
            onClick={onOpenPrivacyModal}
            className="hidden lg:flex items-center gap-1.5 h-8 px-3 rounded-full bg-zinc-100 text-zinc-600 hover:text-zinc-950 border border-zinc-200/80 text-xs font-medium hover:bg-zinc-200/70 transition-all active:scale-[0.98] cursor-pointer shadow-2xs"
            title="100% Client-Side Private. Click to view privacy guarantee."
          >
            <ShieldCheck className="w-3.5 h-3.5 text-zinc-800" />
            <span>Client-Side Private</span>
          </button>

          {/* Open Button */}
          <button
            type="button"
            onClick={onOpenFileClick}
            className="flex items-center gap-1.5 h-8 px-2.5 text-xs font-medium text-zinc-700 bg-white border border-zinc-200/90 hover:bg-zinc-50 hover:text-zinc-950 rounded-lg shadow-2xs transition-all active:scale-[0.98] cursor-pointer"
          >
            <FolderOpen className="w-3.5 h-3.5 text-zinc-500" />
            <span className="hidden sm:inline">Open</span>
          </button>

          {/* High-Contrast Favicon Blue Split Save Button */}
          <div className="inline-flex rounded-lg shadow-xs border border-blue-700 overflow-hidden">
            <button
              type="button"
              onClick={() => onExport("xlsx")}
              className="flex items-center gap-1.5 h-8 px-3 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] border-r border-blue-700 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-white" />
              <span>Save (.xlsx)</span>
            </button>
            <button
              type="button"
              ref={exportBtnRef}
              popoverTarget="menu-export"
              className="h-8 px-2 text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center cursor-pointer"
              title="More export options"
            >
              <ChevronDown className="w-3.5 h-3.5 text-white" />
            </button>
          </div>

          {/* Shortcuts & Help Button */}
          <button
            type="button"
            onClick={onOpenShortcutsModal}
            className="size-8 text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100 rounded-lg transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center"
            title="Keyboard Shortcuts & Help"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* GitHub Repository Link */}
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
      </div>

      {/* Secondary Menu Bar: File, Edit, Templates, Formulas, Privacy */}
      <div className="h-8 px-3 flex items-center gap-0.5 text-xs text-zinc-600 bg-zinc-50/50 border-b border-zinc-100">
        {/* File Menu Trigger */}
        <button
          type="button"
          ref={fileBtnRef}
          popoverTarget="menu-file"
          className="h-6.5 px-2.5 rounded-lg font-medium hover:bg-zinc-200/60 hover:text-zinc-950 transition-all active:scale-[0.98] cursor-pointer"
        >
          File
        </button>

        {/* Edit Menu Trigger */}
        <button
          type="button"
          ref={editBtnRef}
          popoverTarget="menu-edit"
          className="h-6.5 px-2.5 rounded-lg font-medium hover:bg-zinc-200/60 hover:text-zinc-950 transition-all active:scale-[0.98] cursor-pointer"
        >
          Edit
        </button>

        {/* Templates Menu Trigger */}
        <button
          type="button"
          ref={templatesBtnRef}
          popoverTarget="menu-templates"
          className="h-6.5 px-2.5 rounded-lg font-medium hover:bg-zinc-200/60 hover:text-zinc-950 transition-all active:scale-[0.98] flex items-center gap-1 cursor-pointer"
        >
          <Sparkles className="w-3 h-3 text-zinc-500" />
          <span>Templates</span>
        </button>

        <div className="h-3.5 w-px bg-zinc-200 mx-1" />

        {/* Formulas Guide Trigger */}
        <button
          type="button"
          onClick={onOpenFormulaGuide}
          className="h-6.5 px-2.5 rounded-lg font-medium hover:bg-zinc-200/60 hover:text-zinc-950 transition-all active:scale-[0.98] flex items-center gap-1 cursor-pointer"
        >
          <span className="font-semibold text-blue-600 font-mono text-[11px]">fx</span>
          <span>Formulas</span>
        </button>

        {/* Privacy Dialog Trigger */}
        <button
          type="button"
          onClick={onOpenPrivacyModal}
          className="h-6.5 px-2.5 rounded-lg font-medium hover:bg-zinc-200/60 hover:text-zinc-950 transition-all active:scale-[0.98] flex items-center gap-1 cursor-pointer"
        >
          <ShieldCheck className="w-3 h-3 text-zinc-500" />
          <span>Privacy</span>
        </button>
      </div>

      {/* Native HTML Popovers with Chánh Đại Floating Glass Surfaces */}

      {/* 1. File Menu Popover */}
      <div
        id="menu-file"
        popover="auto"
        onToggle={(e: any) => {
          if (e.newState === "open") {
            positionPopover(e.currentTarget, fileBtnRef.current);
          }
        }}
        className="w-56 bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-zinc-200/90 p-1 text-xs z-50"
      >
        <button
          type="button"
          onClick={(e) => {
            closePopover(e);
            onNavigateHome();
          }}
          className="w-full px-2.5 py-1.5 text-left text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100/80 rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
        >
          <Home className="w-3.5 h-3.5 text-zinc-500" />
          <span>Home Screen</span>
        </button>
        <div className="my-1 border-t border-zinc-100" />
        <button
          type="button"
          onClick={(e) => {
            closePopover(e);
            onRequestNewSpreadsheet();
          }}
          className="w-full px-2.5 py-1.5 text-left text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100/80 rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
        >
          <FilePlus className="w-3.5 h-3.5 text-zinc-500" />
          <span>New Spreadsheet</span>
        </button>
        <button
          type="button"
          onClick={(e) => {
            closePopover(e);
            onOpenFileClick();
          }}
          className="w-full px-2.5 py-1.5 text-left text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100/80 rounded-lg flex items-center justify-between transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <FolderOpen className="w-3.5 h-3.5 text-zinc-500" />
            <span>Open File...</span>
          </div>
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-medium text-zinc-500 bg-zinc-100 border border-zinc-200/80 rounded shadow-2xs">
            Ctrl+O
          </kbd>
        </button>
        <div className="my-1 border-t border-zinc-100" />
        <button
          type="button"
          onClick={(e) => {
            closePopover(e);
            onExport("xlsx");
          }}
          className="w-full px-2.5 py-1.5 text-left text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100/80 rounded-lg flex items-center justify-between transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Download className="w-3.5 h-3.5 text-zinc-800" />
            <span>Save as Excel (.xlsx)</span>
          </div>
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-medium text-zinc-500 bg-zinc-100 border border-zinc-200/80 rounded shadow-2xs">
            Ctrl+S
          </kbd>
        </button>
        <button
          type="button"
          onClick={(e) => {
            closePopover(e);
            onExport("csv");
          }}
          className="w-full px-2.5 py-1.5 text-left text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100/80 rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
        >
          <FileText className="w-3.5 h-3.5 text-zinc-500" />
          <span>Export Sheet as CSV</span>
        </button>
        <button
          type="button"
          onClick={(e) => {
            closePopover(e);
            onExport("json");
          }}
          className="w-full px-2.5 py-1.5 text-left text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100/80 rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
        >
          <Code className="w-3.5 h-3.5 text-zinc-500" />
          <span>Export as JSON</span>
        </button>
        <button
          type="button"
          onClick={(e) => {
            closePopover(e);
            onExport("html");
          }}
          className="w-full px-2.5 py-1.5 text-left text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100/80 rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
        >
          <Globe className="w-3.5 h-3.5 text-zinc-500" />
          <span>Export as HTML Table</span>
        </button>
        <div className="my-1 border-t border-zinc-100" />
        <button
          type="button"
          onClick={(e) => {
            closePopover(e);
            onPrint();
          }}
          className="w-full px-2.5 py-1.5 text-left text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100/80 rounded-lg flex items-center justify-between transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Printer className="w-3.5 h-3.5 text-zinc-500" />
            <span>Print / PDF View</span>
          </div>
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-medium text-zinc-500 bg-zinc-100 border border-zinc-200/80 rounded shadow-2xs">
            Ctrl+P
          </kbd>
        </button>
      </div>

      {/* 2. Edit Menu Popover */}
      <div
        id="menu-edit"
        popover="auto"
        onToggle={(e: any) => {
          if (e.newState === "open") {
            positionPopover(e.currentTarget, editBtnRef.current);
          }
        }}
        className="w-52 bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-zinc-200/90 p-1 text-xs z-50"
      >
        <button
          type="button"
          onClick={(e) => {
            closePopover(e);
            onUndo();
          }}
          className="w-full px-2.5 py-1.5 text-left text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100/80 rounded-lg flex items-center justify-between transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Undo2 className="w-3.5 h-3.5 text-zinc-500" />
            <span>Undo</span>
          </div>
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-medium text-zinc-500 bg-zinc-100 border border-zinc-200/80 rounded shadow-2xs">
            Ctrl+Z
          </kbd>
        </button>
        <button
          type="button"
          onClick={(e) => {
            closePopover(e);
            onRedo();
          }}
          className="w-full px-2.5 py-1.5 text-left text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100/80 rounded-lg flex items-center justify-between transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Redo2 className="w-3.5 h-3.5 text-zinc-500" />
            <span>Redo</span>
          </div>
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-medium text-zinc-500 bg-zinc-100 border border-zinc-200/80 rounded shadow-2xs">
            Ctrl+Y
          </kbd>
        </button>
        <div className="my-1 border-t border-zinc-100" />
        <button
          type="button"
          onClick={(e) => {
            closePopover(e);
            onOpenFindReplace();
          }}
          className="w-full px-2.5 py-1.5 text-left text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100/80 rounded-lg flex items-center justify-between transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-zinc-500" />
            <span>Find & Replace</span>
          </div>
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-medium text-zinc-500 bg-zinc-100 border border-zinc-200/80 rounded shadow-2xs">
            Ctrl+F
          </kbd>
        </button>
        <div className="my-1 border-t border-zinc-100" />
        <button
          type="button"
          onClick={(e) => {
            closePopover(e);
            onRequestClearSheet();
          }}
          className="w-full px-2.5 py-1.5 text-left text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5 text-rose-500" />
          <span>Clear Active Sheet</span>
        </button>
        <button
          type="button"
          onClick={(e) => {
            closePopover(e);
            onRequestDeleteSheet?.();
          }}
          className="w-full px-2.5 py-1.5 text-left text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5 text-rose-500" />
          <span>Delete Active Sheet</span>
        </button>
      </div>

      {/* 3. Templates Menu Popover */}
      <div
        id="menu-templates"
        popover="auto"
        onToggle={(e: any) => {
          if (e.newState === "open") {
            positionPopover(e.currentTarget, templatesBtnRef.current);
          }
        }}
        className="w-64 bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-zinc-200/90 p-1 text-xs z-50"
      >
        <div className="px-2.5 py-1 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
          Sample Spreadsheets
        </div>
        {SAMPLE_TEMPLATES.map((tmpl) => (
          <button
            key={tmpl.id}
            type="button"
            onClick={(e) => {
              closePopover(e);
              onRequestLoadTemplate(tmpl.id);
            }}
            className="w-full px-2.5 py-1.5 text-left text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100/80 rounded-lg flex flex-col transition-colors cursor-pointer"
          >
            <span className="font-semibold text-zinc-900">{tmpl.name}</span>
            <span className="text-[11px] text-zinc-500 line-clamp-1">{tmpl.description}</span>
          </button>
        ))}
      </div>

      {/* 4. Export Menu Popover */}
      <div
        id="menu-export"
        popover="auto"
        onToggle={(e: any) => {
          if (e.newState === "open") {
            positionPopover(e.currentTarget, exportBtnRef.current);
          }
        }}
        className="w-56 bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-zinc-200/90 p-1 text-xs z-50"
      >
        <button
          type="button"
          onClick={(e) => {
            closePopover(e);
            onExport("xlsx");
          }}
          className="w-full px-2.5 py-2 text-left text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100/80 rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer"
        >
          <FileSpreadsheet className="w-4 h-4 text-zinc-900" />
          <div>
            <div className="font-semibold text-zinc-900">Microsoft Excel (.xlsx)</div>
            <div className="text-[10px] text-zinc-400">Preserves formulas & multi-sheet</div>
          </div>
        </button>
        <button
          type="button"
          onClick={(e) => {
            closePopover(e);
            onExport("csv");
          }}
          className="w-full px-2.5 py-2 text-left text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100/80 rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer"
        >
          <FileText className="w-4 h-4 text-zinc-600" />
          <div>
            <div className="font-semibold text-zinc-900">CSV (.csv)</div>
            <div className="text-[10px] text-zinc-400">Current active sheet only</div>
          </div>
        </button>
        <button
          type="button"
          onClick={(e) => {
            closePopover(e);
            onExport("json");
          }}
          className="w-full px-2.5 py-2 text-left text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100/80 rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer"
        >
          <Code className="w-4 h-4 text-zinc-600" />
          <div>
            <div className="font-semibold text-zinc-900">JSON Data (.json)</div>
            <div className="text-[10px] text-zinc-400">Structured array objects</div>
          </div>
        </button>
        <button
          type="button"
          onClick={(e) => {
            closePopover(e);
            onExport("html");
          }}
          className="w-full px-2.5 py-2 text-left text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100/80 rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer"
        >
          <Globe className="w-4 h-4 text-zinc-600" />
          <div>
            <div className="font-semibold text-zinc-900">HTML Table (.html)</div>
            <div className="text-[10px] text-zinc-400">Web-viewable table</div>
          </div>
        </button>
        <div className="my-1 border-t border-zinc-100" />
        <button
          type="button"
          onClick={(e) => {
            closePopover(e);
            onPrint();
          }}
          className="w-full px-2.5 py-2 text-left text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100/80 rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer"
        >
          <Printer className="w-4 h-4 text-zinc-600" />
          <div>
            <div className="font-semibold text-zinc-900">Print / Save as PDF</div>
          </div>
        </button>
      </div>
    </header>
  );
};
