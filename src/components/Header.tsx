import React, { useState, useRef, useEffect } from 'react';
import {
  FileSpreadsheet,
  FolderOpen,
  Download,
  FilePlus,
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
} from 'lucide-react';
import { SAMPLE_TEMPLATES } from '../utils/sampleData';

interface HeaderProps {
  filename: string;
  onFilenameChange: (name: string) => void;
  onNewSpreadsheet: () => void;
  onOpenFileClick: () => void;
  onSaveXlsx: () => void;
  onExportCsv: () => void;
  onExportJson: () => void;
  onExportHtml: () => void;
  onPrint: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onClearSheet: () => void;
  onOpenFindReplace: () => void;
  onOpenFormulaGuide: () => void;
  onOpenPrivacyModal: () => void;
  onOpenShortcutsModal: () => void;
  onLoadSampleTemplate: (templateId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  filename,
  onFilenameChange,
  onNewSpreadsheet,
  onOpenFileClick,
  onSaveXlsx,
  onExportCsv,
  onExportJson,
  onExportHtml,
  onPrint,
  onUndo,
  onRedo,
  onClearSheet,
  onOpenFindReplace,
  onOpenFormulaGuide,
  onOpenPrivacyModal,
  onOpenShortcutsModal,
  onLoadSampleTemplate,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(filename);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const menuBarRef = useRef<HTMLDivElement>(null);
  const exportBtnRef = useRef<HTMLDivElement>(null);


  // Click outside to close menus
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuBarRef.current && !menuBarRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
      if (exportBtnRef.current && !exportBtnRef.current.contains(e.target as Node)) {
        setIsExportMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNameSubmit = () => {
    setIsEditingName(false);
    let trimmed = tempName.trim();
    if (!trimmed) trimmed = 'Spreadsheet';
    if (!trimmed.endsWith('.xlsx') && !trimmed.endsWith('.csv') && !trimmed.endsWith('.ods')) {
      trimmed += '.xlsx';
    }
    onFilenameChange(trimmed);
  };

  return (
    <header className="no-print bg-white border-b border-slate-200 select-none shrink-0 z-30">
      {/* Top Bar: Brand, Filename, Privacy, Action Buttons */}
      <div className="h-12 px-4 flex items-center justify-between gap-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          {/* Brand Icon & Name */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <span className="font-bold text-base text-slate-800 tracking-tight hidden sm:inline">
              Web<span className="text-emerald-600">Sheet</span>
            </span>
          </div>

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
                  className="px-2 py-1 text-sm font-medium text-slate-800 bg-slate-100 border border-emerald-500 rounded-md focus:outline-none ring-1 ring-emerald-500 w-44 sm:w-64"
                />
                <button
                  onClick={handleNameSubmit}
                  className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setTempName(filename);
                  setIsEditingName(true);
                }}
                className="group flex items-center gap-1.5 px-2 py-1 rounded-md text-sm font-medium text-slate-800 hover:bg-slate-100 transition-colors"
                title="Click to rename document"
              >
                <span className="truncate max-w-[140px] sm:max-w-[240px]">{filename}</span>
                <Edit2 className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            )}
          </div>
        </div>

        {/* Center / Right controls */}
        <div className="flex items-center gap-2">
          {/* Privacy badge */}
          <button
            onClick={onOpenPrivacyModal}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-xs font-medium hover:bg-emerald-100/70 transition-colors"
            title="Your data never leaves your device. Click to learn more."
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>100% Client-Side Private</span>
          </button>

          {/* Open Button */}
          <button
            onClick={onOpenFileClick}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-2xs transition-colors"
          >
            <FolderOpen className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Open</span>
          </button>

          {/* Save / Export Split Button */}
          <div className="relative" ref={exportBtnRef}>
            <div className="inline-flex rounded-lg shadow-2xs">
              <button
                onClick={onSaveXlsx}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-l-lg transition-colors border-r border-emerald-700/30"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save (.xlsx)</span>
              </button>
              <button
                onClick={() => setIsExportMenuOpen((prev) => !prev)}
                className="px-2 py-1.5 text-white bg-emerald-600 hover:bg-emerald-700 rounded-r-lg transition-colors flex items-center justify-center"
                title="More export options"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Export Dropdown Menu */}
            {isExportMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-50 text-xs animate-in fade-in-80 duration-100">
                <button
                  onClick={() => {
                    setIsExportMenuOpen(false);
                    onSaveXlsx();
                  }}
                  className="w-full px-3.5 py-2 text-left text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 flex items-center gap-2.5"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <div>
                    <div className="font-semibold">Microsoft Excel (.xlsx)</div>
                    <div className="text-[10px] text-slate-400">Preserves formulas & multiple sheets</div>
                  </div>
                </button>
                <button
                  onClick={() => {
                    setIsExportMenuOpen(false);
                    onExportCsv();
                  }}
                  className="w-full px-3.5 py-2 text-left text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 flex items-center gap-2.5"
                >
                  <FileText className="w-4 h-4 text-blue-600" />
                  <div>
                    <div className="font-semibold">CSV (.csv)</div>
                    <div className="text-[10px] text-slate-400">Current active sheet only</div>
                  </div>
                </button>
                <button
                  onClick={() => {
                    setIsExportMenuOpen(false);
                    onExportJson();
                  }}
                  className="w-full px-3.5 py-2 text-left text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 flex items-center gap-2.5"
                >
                  <Code className="w-4 h-4 text-purple-600" />
                  <div>
                    <div className="font-semibold">JSON Data (.json)</div>
                    <div className="text-[10px] text-slate-400">Structured array objects</div>
                  </div>
                </button>
                <button
                  onClick={() => {
                    setIsExportMenuOpen(false);
                    onExportHtml();
                  }}
                  className="w-full px-3.5 py-2 text-left text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 flex items-center gap-2.5"
                >
                  <Globe className="w-4 h-4 text-amber-600" />
                  <div>
                    <div className="font-semibold">HTML Table (.html)</div>
                    <div className="text-[10px] text-slate-400">Web-viewable table</div>
                  </div>
                </button>
                <div className="my-1 border-t border-slate-100" />
                <button
                  onClick={() => {
                    setIsExportMenuOpen(false);
                    onPrint();
                  }}
                  className="w-full px-3.5 py-2 text-left text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 flex items-center gap-2.5"
                >
                  <Printer className="w-4 h-4 text-slate-600" />
                  <div>
                    <div className="font-semibold">Print / Save as PDF</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Help Button */}
          <button
            onClick={onOpenShortcutsModal}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            title="Keyboard Shortcuts & Help"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Menu Bar: File, Edit, Templates, Formulas, Privacy */}
      <div className="h-8 px-3 flex items-center gap-1 text-xs text-slate-700" ref={menuBarRef}>
        {/* File Menu */}
        <div className="relative">
          <button
            onClick={() => setActiveMenu(activeMenu === 'file' ? null : 'file')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              activeMenu === 'file' ? 'bg-slate-100 text-slate-900' : 'hover:bg-slate-100 text-slate-700'
            }`}
          >
            File
          </button>
          {activeMenu === 'file' && (
            <div className="absolute left-0 mt-1 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs animate-in fade-in-80 duration-100">
              <button
                onClick={() => {
                  setActiveMenu(null);
                  onNewSpreadsheet();
                }}
                className="w-full px-3 py-1.5 text-left text-slate-700 hover:bg-slate-50 hover:text-emerald-700 flex items-center gap-2"
              >
                <FilePlus className="w-4 h-4 text-slate-500" />
                <span>New Spreadsheet</span>
              </button>
              <button
                onClick={() => {
                  setActiveMenu(null);
                  onOpenFileClick();
                }}
                className="w-full px-3 py-1.5 text-left text-slate-700 hover:bg-slate-50 hover:text-emerald-700 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <FolderOpen className="w-4 h-4 text-slate-500" />
                  <span>Open File...</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Ctrl+O</span>
              </button>
              <div className="my-1 border-t border-slate-100" />
              <button
                onClick={() => {
                  setActiveMenu(null);
                  onSaveXlsx();
                }}
                className="w-full px-3 py-1.5 text-left text-slate-700 hover:bg-slate-50 hover:text-emerald-700 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4 text-emerald-600" />
                  <span>Save as Excel (.xlsx)</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Ctrl+S</span>
              </button>
              <button
                onClick={() => {
                  setActiveMenu(null);
                  onExportCsv();
                }}
                className="w-full px-3 py-1.5 text-left text-slate-700 hover:bg-slate-50 hover:text-emerald-700 flex items-center gap-2"
              >
                <FileText className="w-4 h-4 text-blue-500" />
                <span>Export Active Sheet as CSV</span>
              </button>
              <button
                onClick={() => {
                  setActiveMenu(null);
                  onExportJson();
                }}
                className="w-full px-3 py-1.5 text-left text-slate-700 hover:bg-slate-50 hover:text-emerald-700 flex items-center gap-2"
              >
                <Code className="w-4 h-4 text-purple-500" />
                <span>Export as JSON</span>
              </button>
              <button
                onClick={() => {
                  setActiveMenu(null);
                  onExportHtml();
                }}
                className="w-full px-3 py-1.5 text-left text-slate-700 hover:bg-slate-50 hover:text-emerald-700 flex items-center gap-2"
              >
                <Globe className="w-4 h-4 text-amber-500" />
                <span>Export as HTML Table</span>
              </button>
              <div className="my-1 border-t border-slate-100" />
              <button
                onClick={() => {
                  setActiveMenu(null);
                  onPrint();
                }}
                className="w-full px-3 py-1.5 text-left text-slate-700 hover:bg-slate-50 hover:text-emerald-700 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Printer className="w-4 h-4 text-slate-500" />
                  <span>Print / PDF View</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Ctrl+P</span>
              </button>
            </div>
          )}
        </div>

        {/* Edit Menu */}
        <div className="relative">
          <button
            onClick={() => setActiveMenu(activeMenu === 'edit' ? null : 'edit')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              activeMenu === 'edit' ? 'bg-slate-100 text-slate-900' : 'hover:bg-slate-100 text-slate-700'
            }`}
          >
            Edit
          </button>
          {activeMenu === 'edit' && (
            <div className="absolute left-0 mt-1 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs animate-in fade-in-80 duration-100">
              <button
                onClick={() => {
                  setActiveMenu(null);
                  onUndo();
                }}
                className="w-full px-3 py-1.5 text-left text-slate-700 hover:bg-slate-50 hover:text-emerald-700 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Undo2 className="w-4 h-4 text-slate-500" />
                  <span>Undo</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Ctrl+Z</span>
              </button>
              <button
                onClick={() => {
                  setActiveMenu(null);
                  onRedo();
                }}
                className="w-full px-3 py-1.5 text-left text-slate-700 hover:bg-slate-50 hover:text-emerald-700 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Redo2 className="w-4 h-4 text-slate-500" />
                  <span>Redo</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Ctrl+Y</span>
              </button>
              <div className="my-1 border-t border-slate-100" />
              <button
                onClick={() => {
                  setActiveMenu(null);
                  onOpenFindReplace();
                }}
                className="w-full px-3 py-1.5 text-left text-slate-700 hover:bg-slate-50 hover:text-emerald-700 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-slate-500" />
                  <span>Find & Replace</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Ctrl+F</span>
              </button>
              <div className="my-1 border-t border-slate-100" />
              <button
                onClick={() => {
                  setActiveMenu(null);
                  onClearSheet();
                }}
                className="w-full px-3 py-1.5 text-left text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4 text-red-500" />
                <span>Clear Active Sheet</span>
              </button>
            </div>
          )}
        </div>

        {/* Templates Menu */}
        <div className="relative">
          <button
            onClick={() => setActiveMenu(activeMenu === 'templates' ? null : 'templates')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors flex items-center gap-1 ${
              activeMenu === 'templates' ? 'bg-slate-100 text-slate-900' : 'hover:bg-slate-100 text-slate-700'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Templates</span>
          </button>
          {activeMenu === 'templates' && (
            <div className="absolute left-0 mt-1 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs animate-in fade-in-80 duration-100">
              <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Sample Spreadsheets
              </div>
              {SAMPLE_TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.id}
                  onClick={() => {
                    setActiveMenu(null);
                    onLoadSampleTemplate(tmpl.id);
                  }}
                  className="w-full px-3 py-2 text-left text-slate-700 hover:bg-slate-50 hover:text-emerald-700 flex flex-col"
                >
                  <span className="font-semibold text-slate-800">{tmpl.name}</span>
                  <span className="text-[11px] text-slate-500">{tmpl.description}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Formulas Menu */}
        <button
          onClick={onOpenFormulaGuide}
          className="px-2.5 py-1 rounded-md font-medium hover:bg-slate-100 text-slate-700 transition-colors flex items-center gap-1"
        >
          <span className="font-bold text-emerald-700 font-mono text-[11px]">fx</span>
          <span>Formulas</span>
        </button>

        {/* Privacy Info */}
        <button
          onClick={onOpenPrivacyModal}
          className="px-2.5 py-1 rounded-md font-medium hover:bg-slate-100 text-slate-700 transition-colors flex items-center gap-1"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Privacy</span>
        </button>
      </div>
    </header>
  );
};
