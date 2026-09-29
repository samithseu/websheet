import React, { useState, useRef, useEffect } from 'react';
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
  ArrowDownToLine,
} from 'lucide-react';
import { SAMPLE_TEMPLATES } from '../utils/sampleData';

interface HeaderProps {
  filename: string;
  onFilenameChange: (name: string) => void;
  onNavigateHome: () => void;
  onRequestNewSpreadsheet: () => void;
  onOpenFileClick: () => void;
  onExport: (format: 'xlsx' | 'csv' | 'json' | 'html') => void;
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

  const deferredInstallPrompt = propDeferredInstallPrompt !== undefined ? propDeferredInstallPrompt : localDeferredInstallPrompt;

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

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
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
    if (outcome === 'accepted') {
      setLocalDeferredInstallPrompt(null);
    }
  };

  const handleNameSubmit = () => {
    setIsEditingName(false);
    let trimmed = tempName.trim();
    if (!trimmed) trimmed = 'Spreadsheet';
    if (!trimmed.endsWith('.xlsx') && !trimmed.endsWith('.csv') && !trimmed.endsWith('.ods')) {
      trimmed += '.xlsx';
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
    const popoverEl = (e.currentTarget.closest('[popover]') as HTMLElement);
    if (popoverEl && typeof (popoverEl as any).hidePopover === 'function') {
      (popoverEl as any).hidePopover();
    }
  };

  return (
    <header className="no-print bg-white border-b border-slate-200 select-none shrink-0 z-30">
      {/* Top Application Bar */}
      <div className="h-12 px-4 flex items-center justify-between gap-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          {/* Brand Icon & Name with Home Navigation */}
          <button
            type="button"
            onClick={onNavigateHome}
            className="flex items-center gap-2 cursor-pointer hover:opacity-85 transition-opacity"
            title="Return to Home Screen"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <FileSpreadsheet className="w-4.5 h-4.5" />
            </div>
            <span className="font-bold text-base text-slate-900 tracking-tight hidden sm:inline">
              Web<span className="text-blue-600">Sheet</span>
            </span>
          </button>

          <div className="h-4 w-px bg-slate-200 hidden sm:block" />

          {/* Editable Document Filename */}
          <div className="flex items-center">
            {isEditingName ? (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  onBlur={handleNameSubmit}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleNameSubmit();
                    if (e.key === 'Escape') {
                      setTempName(filename);
                      setIsEditingName(false);
                    }
                  }}
                  autoFocus
                  className="px-2 py-1 text-xs font-medium text-slate-800 bg-slate-100 border border-blue-500 rounded-lg focus:outline-none ring-1 ring-blue-500 w-44 sm:w-64"
                />
                <button
                  type="button"
                  onClick={handleNameSubmit}
                  className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setTempName(filename);
                  setIsEditingName(true);
                }}
                className="group flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Click to rename document"
              >
                <span className="truncate max-w-[140px] sm:max-w-[240px]">{filename}</span>
                <Edit2 className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            )}
          </div>
        </div>

        {/* Right action controls */}
        <div className="flex items-center gap-2">
          {/* Chromium PWA Install Button */}
          {deferredInstallPrompt && (
            <button
              type="button"
              onClick={handleInstallClick}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
              title="Install WebSheet to your device"
            >
              <ArrowDownToLine className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Install</span>
            </button>
          )}

          {/* Privacy badge */}
          <button
            type="button"
            onClick={onOpenPrivacyModal}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium hover:bg-slate-200/70 transition-colors cursor-pointer"
            title="100% Client-Side Private. Click to view privacy guarantee."
          >
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Client-Side Private</span>
          </button>

          {/* Open Button */}
          <button
            type="button"
            onClick={onOpenFileClick}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            <FolderOpen className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Open</span>
          </button>

          {/* Save / Export Split Control with Popover API */}
          <div className="inline-flex rounded-lg shadow-2xs">
            <button
              type="button"
              onClick={() => onExport('xlsx')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-l-lg transition-colors border-r border-blue-700/40 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Save (.xlsx)</span>
            </button>
            <button
              type="button"
              ref={exportBtnRef}
              popoverTarget="menu-export"
              className="px-2 py-1.5 text-white bg-blue-600 hover:bg-blue-700 rounded-r-lg transition-colors flex items-center justify-center cursor-pointer"
              title="More export options"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Help & Shortcuts Button */}
          <button
            type="button"
            onClick={onOpenShortcutsModal}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Keyboard Shortcuts & Help"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Secondary Menu Bar: File, Edit, Templates, Formulas, Privacy */}
      <div className="h-8 px-3 flex items-center gap-1 text-xs text-slate-700">
        {/* File Menu Trigger */}
        <button
          type="button"
          ref={fileBtnRef}
          popoverTarget="menu-file"
          className="px-2.5 py-1 rounded-lg font-medium hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
        >
          File
        </button>

        {/* Edit Menu Trigger */}
        <button
          type="button"
          ref={editBtnRef}
          popoverTarget="menu-edit"
          className="px-2.5 py-1 rounded-lg font-medium hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
        >
          Edit
        </button>

        {/* Templates Menu Trigger */}
        <button
          type="button"
          ref={templatesBtnRef}
          popoverTarget="menu-templates"
          className="px-2.5 py-1 rounded-lg font-medium hover:bg-slate-100 text-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>Templates</span>
        </button>

        {/* Formulas Guide Trigger */}
        <button
          type="button"
          onClick={onOpenFormulaGuide}
          className="px-2.5 py-1 rounded-lg font-medium hover:bg-slate-100 text-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
        >
          <span className="font-bold text-blue-600 font-mono text-[11px]">fx</span>
          <span>Formulas</span>
        </button>

        {/* Privacy Dialog Trigger */}
        <button
          type="button"
          onClick={onOpenPrivacyModal}
          className="px-2.5 py-1 rounded-lg font-medium hover:bg-slate-100 text-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
          <span>Privacy</span>
        </button>
      </div>

      {/* Native HTML Popovers */}

      {/* 1. File Menu Popover */}
      <div
        id="menu-file"
        popover="auto"
        onToggle={(e: any) => {
          if (e.newState === 'open') {
            positionPopover(e.currentTarget, fileBtnRef.current);
          }
        }}
        className="w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 text-xs z-50"
      >
        <button
          type="button"
          onClick={(e) => {
            closePopover(e);
            onNavigateHome();
          }}
          className="w-full px-3 py-1.5 text-left text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2 cursor-pointer"
        >
          <Home className="w-4 h-4 text-slate-500" />
          <span>Home Screen</span>
        </button>
        <div className="my-1 border-t border-slate-100" />
        <button
          type="button"
          onClick={(e) => {
            closePopover(e);
            onRequestNewSpreadsheet();
          }}
          className="w-full px-3 py-1.5 text-left text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2 cursor-pointer"
        >
          <FilePlus className="w-4 h-4 text-slate-500" />
          <span>New Spreadsheet</span>
        </button>
        <button
          type="button"
          onClick={(e) => {
            closePopover(e);
            onOpenFileClick();
          }}
          className="w-full px-3 py-1.5 text-left text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center justify-between cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-slate-500" />
            <span>Open File...</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">Ctrl+O</span>
        </button>
        <div className="my-1 border-t border-slate-100" />
        <button
          type="button"
          onClick={(e) => {
            closePopover(e);
            onExport('xlsx');
          }}
          className="w-full px-3 py-1.5 text-left text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center justify-between cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4 text-blue-600" />
            <span>Save as Excel (.xlsx)</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">Ctrl+S</span>
        </button>
        <button
          type="button"
          onClick={(e) => {
            closePopover(e);
            onExport('csv');
          }}
          className="w-full px-3 py-1.5 text-left text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2 cursor-pointer"
        >
          <FileText className="w-4 h-4 text-slate-500" />
          <span>Export Active Sheet as CSV</span>
        </button>
        <button
          type="button"
          onClick={(e) => {
            closePopover(e);
            onExport('json');
          }}
          className="w-full px-3 py-1.5 text-left text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2 cursor-pointer"
        >
          <Code className="w-4 h-4 text-slate-500" />
          <span>Export as JSON</span>
        </button>
        <button
          type="button"
          onClick={(e) => {
            closePopover(e);
            onExport('html');
          }}
          className="w-full px-3 py-1.5 text-left text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2 cursor-pointer"
        >
          <Globe className="w-4 h-4 text-slate-500" />
          <span>Export as HTML Table</span>
        </button>
        <div className="my-1 border-t border-slate-100" />
        <button
          type="button"
          onClick={(e) => {
            closePopover(e);
            onPrint();
          }}
          className="w-full px-3 py-1.5 text-left text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center justify-between cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print / PDF View</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">Ctrl+P</span>
        </button>
      </div>

      {/* 2. Edit Menu Popover */}
      <div
        id="menu-edit"
        popover="auto"
        onToggle={(e: any) => {
          if (e.newState === 'open') {
            positionPopover(e.currentTarget, editBtnRef.current);
          }
        }}
        className="w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 text-xs z-50"
      >
        <button
          type="button"
          onClick={(e) => {
            closePopover(e);
            onUndo();
          }}
          className="w-full px-3 py-1.5 text-left text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center justify-between cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Undo2 className="w-4 h-4 text-slate-500" />
            <span>Undo</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">Ctrl+Z</span>
        </button>
        <button
          type="button"
          onClick={(e) => {
            closePopover(e);
            onRedo();
          }}
          className="w-full px-3 py-1.5 text-left text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center justify-between cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Redo2 className="w-4 h-4 text-slate-500" />
            <span>Redo</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">Ctrl+Y</span>
        </button>
        <div className="my-1 border-t border-slate-100" />
        <button
          type="button"
          onClick={(e) => {
            closePopover(e);
            onOpenFindReplace();
          }}
          className="w-full px-3 py-1.5 text-left text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center justify-between cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-500" />
            <span>Find & Replace</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">Ctrl+F</span>
        </button>
        <div className="my-1 border-t border-slate-100" />
        <button
          type="button"
          onClick={(e) => {
            closePopover(e);
            onRequestClearSheet();
          }}
          className="w-full px-3 py-1.5 text-left text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
        >
          <Trash2 className="w-4 h-4 text-red-500" />
          <span>Clear Active Sheet</span>
        </button>
        <button
          type="button"
          onClick={(e) => {
            closePopover(e);
            onRequestDeleteSheet?.();
          }}
          className="w-full px-3 py-1.5 text-left text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
        >
          <Trash2 className="w-4 h-4 text-red-500" />
          <span>Delete Active Sheet</span>
        </button>
      </div>

      {/* 3. Templates Menu Popover */}
      <div
        id="menu-templates"
        popover="auto"
        onToggle={(e: any) => {
          if (e.newState === 'open') {
            positionPopover(e.currentTarget, templatesBtnRef.current);
          }
        }}
        className="w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 text-xs z-50"
      >
        <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
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
            className="w-full px-3 py-2 text-left text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex flex-col cursor-pointer"
          >
            <span className="font-semibold text-slate-800">{tmpl.name}</span>
            <span className="text-[11px] text-slate-500">{tmpl.description}</span>
          </button>
        ))}
      </div>

      {/* 4. Export Menu Popover */}
      <div
        id="menu-export"
        popover="auto"
        onToggle={(e: any) => {
          if (e.newState === 'open') {
            positionPopover(e.currentTarget, exportBtnRef.current);
          }
        }}
        className="w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1 text-xs z-50"
      >
        <button
          type="button"
          onClick={(e) => {
            closePopover(e);
            onExport('xlsx');
          }}
          className="w-full px-3.5 py-2 text-left text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2.5 cursor-pointer"
        >
          <FileSpreadsheet className="w-4 h-4 text-blue-600" />
          <div>
            <div className="font-semibold">Microsoft Excel (.xlsx)</div>
            <div className="text-[10px] text-slate-400">Preserves formulas & multi-sheet</div>
          </div>
        </button>
        <button
          type="button"
          onClick={(e) => {
            closePopover(e);
            onExport('csv');
          }}
          className="w-full px-3.5 py-2 text-left text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2.5 cursor-pointer"
        >
          <FileText className="w-4 h-4 text-slate-600" />
          <div>
            <div className="font-semibold">CSV (.csv)</div>
            <div className="text-[10px] text-slate-400">Current active sheet only</div>
          </div>
        </button>
        <button
          type="button"
          onClick={(e) => {
            closePopover(e);
            onExport('json');
          }}
          className="w-full px-3.5 py-2 text-left text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2.5 cursor-pointer"
        >
          <Code className="w-4 h-4 text-slate-600" />
          <div>
            <div className="font-semibold">JSON Data (.json)</div>
            <div className="text-[10px] text-slate-400">Structured array objects</div>
          </div>
        </button>
        <button
          type="button"
          onClick={(e) => {
            closePopover(e);
            onExport('html');
          }}
          className="w-full px-3.5 py-2 text-left text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2.5 cursor-pointer"
        >
          <Globe className="w-4 h-4 text-slate-600" />
          <div>
            <div className="font-semibold">HTML Table (.html)</div>
            <div className="text-[10px] text-slate-400">Web-viewable table</div>
          </div>
        </button>
        <div className="my-1 border-t border-slate-100" />
        <button
          type="button"
          onClick={(e) => {
            closePopover(e);
            onPrint();
          }}
          className="w-full px-3.5 py-2 text-left text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2.5 cursor-pointer"
        >
          <Printer className="w-4 h-4 text-slate-600" />
          <div>
            <div className="font-semibold">Print / Save as PDF</div>
          </div>
        </button>
      </div>
    </header>
  );
};
