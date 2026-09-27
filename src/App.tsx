import { useState, useRef, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { FormulaBar, type SelectionStats } from './components/FormulaBar';
import { SpreadsheetGrid, type SpreadsheetGridRef } from './components/SpreadsheetGrid';
import { DragDropOverlay } from './components/DragDropOverlay';
import { FindReplaceDialog } from './components/FindReplaceDialog';
import { FormulaGuideDialog } from './components/FormulaGuideDialog';
import { PrivacyDialog } from './components/PrivacyDialog';
import { ShortcutsDialog } from './components/ShortcutsDialog';
import { ConfirmDialog } from './components/ConfirmDialog';
import {
  readSpreadsheetFile,
  workbookToXSpreadsheet,
  xSpreadsheetToWorkbook,
  workbookToXlsxBlob,
  workbookToCsvBlob,
  workbookToJsonBlob,
  workbookToHtmlBlob,
  triggerBlobDownload,
  createEmptySheet,
  type XSpreadsheetData,
} from './utils/spreadsheetConverter';
import { SAMPLE_TEMPLATES } from './utils/sampleData';

export function App() {
  const [filename, setFilename] = useState('Monthly_Budget.xlsx');
  const [spreadsheetData, setSpreadsheetData] = useState<XSpreadsheetData>(
    SAMPLE_TEMPLATES[0].data
  );
  const [activeCellCoord, setActiveCellCoord] = useState('A1');
  const [activeCellText, setActiveCellText] = useState('');
  const [activeCellRow, setActiveCellRow] = useState(0);
  const [activeCellCol, setActiveCellCol] = useState(0);
  const [selectionStats, setSelectionStats] = useState<SelectionStats | null>(null);

  // Dialogs state
  const [isDragging, setIsDragging] = useState(false);
  const [isFindReplaceOpen, setIsFindReplaceOpen] = useState(false);
  const [isFormulaGuideOpen, setIsFormulaGuideOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);

  // Destructive action confirmation state
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmLabel: string;
    onConfirm: () => void;
  } | null>(null);

  // Status live region toast with strict timer cleanup
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const gridRef = useRef<SpreadsheetGridRef>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = useCallback((msg: string) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
      toastTimeoutRef.current = null;
    }, 3200);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  // Handle local spreadsheet file opening
  const handleFileUpload = useCallback(
    async (file: File) => {
      try {
        const wb = await readSpreadsheetFile(file);
        const data = workbookToXSpreadsheet(wb);
        setSpreadsheetData(data);
        setFilename(file.name);
        gridRef.current?.loadData(data);
        showToast(`Successfully opened "${file.name}" locally`);
      } catch (err: any) {
        console.error('Failed to read spreadsheet file:', err);
        showToast(`Failed to parse file: ${err?.message || 'Invalid spreadsheet file'}`);
      }
    },
    [showToast]
  );

  // Open file with showOpenFilePicker if supported, fallback to <input type="file">
  const handleOpenFileClick = useCallback(async () => {
    if ('showOpenFilePicker' in window) {
      try {
        const [handle] = await (window as any).showOpenFilePicker({
          types: [
            {
              description: 'Spreadsheet files',
              accept: {
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
                'application/vnd.ms-excel': ['.xls'],
                'text/csv': ['.csv'],
                'text/tab-separated-values': ['.tsv'],
                'application/vnd.oasis.opendocument.spreadsheet': ['.ods'],
              },
            },
          ],
        });
        const file = await handle.getFile();
        await handleFileUpload(file);
        return;
      } catch (err: any) {
        if (err.name === 'AbortError') return;
      }
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  }, [handleFileUpload]);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  // Unified Exporter reading live grid instance and active sheet
  const handleExport = useCallback(
    async (format: 'xlsx' | 'csv' | 'json' | 'html') => {
      try {
        const currentData = gridRef.current?.getData() || spreadsheetData;
        const activeSheetName = gridRef.current?.getActiveSheetName() || 'Sheet1';
        const wb = xSpreadsheetToWorkbook(currentData);

        let blob: Blob;
        let ext: string;
        let mimeType: string;

        if (format === 'xlsx') {
          blob = workbookToXlsxBlob(wb);
          ext = '.xlsx';
          mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        } else if (format === 'csv') {
          blob = workbookToCsvBlob(wb, activeSheetName);
          ext = '.csv';
          mimeType = 'text/csv';
        } else if (format === 'json') {
          blob = workbookToJsonBlob(wb, activeSheetName);
          ext = '.json';
          mimeType = 'application/json';
        } else {
          blob = workbookToHtmlBlob(wb, activeSheetName);
          ext = '.html';
          mimeType = 'text/html';
        }

        const baseName = filename.replace(/\.[^.]+$/, '') || 'Spreadsheet';
        const targetName = `${baseName}${ext}`;

        // Save via native showSaveFilePicker if available
        if ('showSaveFilePicker' in window) {
          try {
            const handle = await (window as any).showSaveFilePicker({
              suggestedName: targetName,
              types: [
                {
                  description: `${format.toUpperCase()} file`,
                  accept: { [mimeType]: [ext] },
                },
              ],
            });
            const writable = await handle.createWritable();
            await writable.write(blob);
            await writable.close();
            showToast(`Saved "${targetName}" to your device`);
            return;
          } catch (pickerErr: any) {
            if (pickerErr.name === 'AbortError') return;
          }
        }

        // Standard blob download fallback
        triggerBlobDownload(blob, targetName);
        showToast(`Saved "${targetName}" to your device`);
      } catch (err: any) {
        console.error('Failed to export:', err);
        showToast(`Export error: ${err?.message || 'Failed to export'}`);
      }
    },
    [filename, spreadsheetData, showToast]
  );

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  // Destructive Actions: Confirm before executing
  const handleRequestNewSpreadsheet = useCallback(() => {
    setConfirmConfig({
      isOpen: true,
      title: 'Create new spreadsheet?',
      description: 'Any unsaved changes in your current workbook will be lost. Create a new blank sheet?',
      confirmLabel: 'Create New',
      onConfirm: () => {
        const emptyData = [createEmptySheet('Sheet1')];
        setSpreadsheetData(emptyData);
        setFilename('Untitled_Spreadsheet.xlsx');
        gridRef.current?.loadData(emptyData);
        showToast('Created new blank spreadsheet');
      },
    });
  }, [showToast]);

  const handleRequestClearSheet = useCallback(() => {
    setConfirmConfig({
      isOpen: true,
      title: 'Clear active sheet?',
      description: 'This will remove all rows, cells, and values from the current sheet. This cannot be undone.',
      confirmLabel: 'Clear Sheet',
      onConfirm: () => {
        gridRef.current?.clearCurrentSheet();
        showToast('Cleared active sheet');
      },
    });
  }, [showToast]);

  const handleRequestLoadTemplate = useCallback(
    (templateId: string) => {
      const tmpl = SAMPLE_TEMPLATES.find((t) => t.id === templateId);
      if (!tmpl) return;

      setConfirmConfig({
        isOpen: true,
        title: `Load template "${tmpl.name}"?`,
        description: 'Loading this template will replace your current spreadsheet data.',
        confirmLabel: 'Load Template',
        onConfirm: () => {
          setSpreadsheetData(tmpl.data);
          setFilename(tmpl.filename);
          gridRef.current?.loadData(tmpl.data);
          showToast(`Loaded template: "${tmpl.name}"`);
        },
      });
    },
    [showToast]
  );

  // Edit actions
  const handleUndo = useCallback(() => {
    gridRef.current?.undo();
  }, []);

  const handleRedo = useCallback(() => {
    gridRef.current?.redo();
  }, []);

  // Cell editing via FormulaBar
  const handleCommitCellText = useCallback(
    (newText: string) => {
      gridRef.current?.setCellText(activeCellRow, activeCellCol, newText);
      setActiveCellText(newText);
    },
    [activeCellRow, activeCellCol]
  );

  // Insert formula from FormulaGuide
  const handleInsertFormula = useCallback(
    (formulaTemplate: string) => {
      gridRef.current?.setCellText(activeCellRow, activeCellCol, formulaTemplate);
      setActiveCellText(formulaTemplate);
      showToast(`Inserted formula into ${activeCellCoord}`);
    },
    [activeCellRow, activeCellCol, activeCellCoord, showToast]
  );

  // Active cell / stats callbacks
  const handleActiveCellChange = useCallback(
    (coord: string, text: string, rowIndex: number, colIndex: number) => {
      setActiveCellCoord(coord);
      setActiveCellText(text);
      setActiveCellRow(rowIndex);
      setActiveCellCol(colIndex);
    },
    []
  );

  const handleSelectionStatsChange = useCallback((stats: SelectionStats | null) => {
    setSelectionStats(stats);
  }, []);

  // Window-level Drag & Drop
  useEffect(() => {
    let dragCounter = 0;

    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      dragCounter++;
      if (e.dataTransfer?.types?.includes('Files')) {
        setIsDragging(true);
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      dragCounter--;
      if (dragCounter <= 0) {
        setIsDragging(false);
        dragCounter = 0;
      }
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      dragCounter = 0;
      setIsDragging(false);

      if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
        handleFileUpload(e.dataTransfer.files[0]);
      }
    };

    window.addEventListener('dragenter', handleDragEnter);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('drop', handleDrop);

    return () => {
      window.removeEventListener('dragenter', handleDragEnter);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('drop', handleDrop);
    };
  }, [handleFileUpload]);

  // Window-level Keyboard Shortcuts (Universal Ctrl/Cmd)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;

      if (isCmdOrCtrl && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleExport('xlsx');
      } else if (isCmdOrCtrl && e.key.toLowerCase() === 'o') {
        e.preventDefault();
        handleOpenFileClick();
      } else if (isCmdOrCtrl && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setIsFindReplaceOpen(true);
      } else if (isCmdOrCtrl && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        handlePrint();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleExport, handleOpenFileClick, handlePrint]);

  return (
    <div className="w-full h-full flex flex-col overflow-hidden bg-slate-50 font-sans">
      {/* Hidden File Input for Open File picker fallback */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept=".xlsx,.xls,.csv,.tsv,.ods"
        className="hidden"
      />

      {/* Top Application Header & Menu Bar */}
      <Header
        filename={filename}
        onFilenameChange={setFilename}
        onRequestNewSpreadsheet={handleRequestNewSpreadsheet}
        onOpenFileClick={handleOpenFileClick}
        onExport={handleExport}
        onPrint={handlePrint}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onRequestClearSheet={handleRequestClearSheet}
        onOpenFindReplace={() => setIsFindReplaceOpen(true)}
        onOpenFormulaGuide={() => setIsFormulaGuideOpen(true)}
        onOpenPrivacyModal={() => setIsPrivacyModalOpen(true)}
        onOpenShortcutsModal={() => setIsShortcutsModalOpen(true)}
        onRequestLoadTemplate={handleRequestLoadTemplate}
      />

      {/* Formula & Coordinate Bar */}
      <FormulaBar
        activeCellCoord={activeCellCoord}
        activeCellText={activeCellText}
        onCommitCellText={handleCommitCellText}
        onOpenFormulaGuide={() => setIsFormulaGuideOpen(true)}
        selectionStats={selectionStats}
      />

      {/* Main Grid View */}
      <div className="flex-1 w-full relative flex flex-col overflow-hidden">
        <SpreadsheetGrid
          ref={gridRef}
          initialData={spreadsheetData}
          onDataChange={(newData) => setSpreadsheetData(newData)}
          onActiveCellChange={handleActiveCellChange}
          onSelectionStatsChange={handleSelectionStatsChange}
        />
      </div>

      {/* Drag & Drop Visual Indicator */}
      <DragDropOverlay isDragging={isDragging} />

      {/* Native <dialog> Modals */}
      <FindReplaceDialog
        isOpen={isFindReplaceOpen}
        onClose={() => setIsFindReplaceOpen(false)}
        spreadsheetData={spreadsheetData}
        onSelectCell={(sheetIdx, r, c) => gridRef.current?.selectCell(sheetIdx, r, c)}
        onUpdateData={(newData, msg) => {
          gridRef.current?.loadData(newData);
          setSpreadsheetData(newData);
          if (msg) showToast(msg);
        }}
      />

      <FormulaGuideDialog
        isOpen={isFormulaGuideOpen}
        onClose={() => setIsFormulaGuideOpen(false)}
        onInsertFormula={handleInsertFormula}
      />

      <PrivacyDialog
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
      />

      <ShortcutsDialog
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
      />

      {confirmConfig && (
        <ConfirmDialog
          isOpen={confirmConfig.isOpen}
          title={confirmConfig.title}
          description={confirmConfig.description}
          confirmLabel={confirmConfig.confirmLabel}
          onConfirm={confirmConfig.onConfirm}
          onCancel={() => setConfirmConfig(null)}
        />
      )}

      {/* Live Region Toast Notification */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="fixed bottom-10 right-6 z-50 pointer-events-none"
      >
        {toastMessage && (
          <div className="bg-slate-900 text-white text-xs px-4 py-2.5 rounded-lg shadow-xl flex items-center gap-2 pointer-events-auto border border-slate-800 animate-in fade-in slide-in-from-bottom-2 duration-150">
            <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
