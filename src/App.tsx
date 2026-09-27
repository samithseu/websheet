import { useState, useRef, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { FormulaBar, type SelectionStats } from './components/FormulaBar';
import { SpreadsheetGrid, type SpreadsheetGridRef } from './components/SpreadsheetGrid';
import { DragDropOverlay } from './components/DragDropOverlay';
import { FindReplaceModal } from './components/FindReplaceModal';
import { FormulaGuideModal } from './components/FormulaGuideModal';
import { PrivacyModal } from './components/PrivacyModal';
import { ShortcutsModal } from './components/ShortcutsModal';
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

  // Modals state
  const [isDragging, setIsDragging] = useState(false);
  const [isFindReplaceOpen, setIsFindReplaceOpen] = useState(false);
  const [isFormulaGuideOpen, setIsFormulaGuideOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);

  // Notification / Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const gridRef = useRef<SpreadsheetGridRef>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  }, []);

  // Handle spreadsheet file upload
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

  // Trigger file input
  const handleOpenFileClick = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  // Create new blank sheet
  const handleNewSpreadsheet = useCallback(() => {
    const emptyData = [createEmptySheet('Sheet1')];
    setSpreadsheetData(emptyData);
    setFilename('Untitled_Spreadsheet.xlsx');
    gridRef.current?.loadData(emptyData);
    showToast('Created new blank spreadsheet');
  }, [showToast]);

  // Save / Export handlers
  const handleSaveXlsx = useCallback(() => {
    try {
      const currentData = gridRef.current?.getData() || spreadsheetData;
      const wb = xSpreadsheetToWorkbook(currentData);
      const blob = workbookToXlsxBlob(wb);
      const targetName = filename.endsWith('.xlsx')
        ? filename
        : filename.replace(/\.[^.]+$/, '') + '.xlsx';
      triggerBlobDownload(blob, targetName);
      showToast(`Saved "${targetName}" to your device`);
    } catch (err: any) {
      console.error('Failed to save .xlsx:', err);
      showToast(`Save error: ${err?.message || 'Failed to export'}`);
    }
  }, [filename, spreadsheetData, showToast]);

  const handleExportCsv = useCallback(() => {
    try {
      const currentData = gridRef.current?.getData() || spreadsheetData;
      const wb = xSpreadsheetToWorkbook(currentData);
      const blob = workbookToCsvBlob(wb);
      const targetName = filename.replace(/\.[^.]+$/, '') + '.csv';
      triggerBlobDownload(blob, targetName);
      showToast(`Exported "${targetName}"`);
    } catch (err: any) {
      console.error('Failed to export .csv:', err);
      showToast(`Export error: ${err?.message || 'Failed to export CSV'}`);
    }
  }, [filename, spreadsheetData, showToast]);

  const handleExportJson = useCallback(() => {
    try {
      const currentData = gridRef.current?.getData() || spreadsheetData;
      const wb = xSpreadsheetToWorkbook(currentData);
      const blob = workbookToJsonBlob(wb);
      const targetName = filename.replace(/\.[^.]+$/, '') + '.json';
      triggerBlobDownload(blob, targetName);
      showToast(`Exported "${targetName}"`);
    } catch (err: any) {
      console.error('Failed to export .json:', err);
      showToast(`Export error: ${err?.message || 'Failed to export JSON'}`);
    }
  }, [filename, spreadsheetData, showToast]);

  const handleExportHtml = useCallback(() => {
    try {
      const currentData = gridRef.current?.getData() || spreadsheetData;
      const wb = xSpreadsheetToWorkbook(currentData);
      const blob = workbookToHtmlBlob(wb);
      const targetName = filename.replace(/\.[^.]+$/, '') + '.html';
      triggerBlobDownload(blob, targetName);
      showToast(`Exported "${targetName}"`);
    } catch (err: any) {
      console.error('Failed to export .html:', err);
      showToast(`Export error: ${err?.message || 'Failed to export HTML'}`);
    }
  }, [filename, spreadsheetData, showToast]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  // Template loader
  const handleLoadSampleTemplate = useCallback(
    (templateId: string) => {
      const tmpl = SAMPLE_TEMPLATES.find((t) => t.id === templateId);
      if (tmpl) {
        setSpreadsheetData(tmpl.data);
        setFilename(tmpl.filename);
        gridRef.current?.loadData(tmpl.data);
        showToast(`Loaded template: "${tmpl.name}"`);
      }
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

  const handleClearSheet = useCallback(() => {
    gridRef.current?.clearCurrentSheet();
    showToast('Cleared active sheet');
  }, [showToast]);

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

  // Window-level Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const isCmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      if (isCmdOrCtrl && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSaveXlsx();
      } else if (isCmdOrCtrl && e.key.toLowerCase() === 'o') {
        e.preventDefault();
        handleOpenFileClick();
      } else if (isCmdOrCtrl && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setIsFindReplaceOpen(true);
      } else if (isCmdOrCtrl && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        handlePrint();
      } else if (e.key === 'Escape') {
        setIsFindReplaceOpen(false);
        setIsFormulaGuideOpen(false);
        setIsPrivacyModalOpen(false);
        setIsShortcutsModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSaveXlsx, handleOpenFileClick, handlePrint]);

  return (
    <div className="w-full h-full flex flex-col overflow-hidden bg-slate-50">
      {/* Hidden File Input for Open File picker */}
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
        onNewSpreadsheet={handleNewSpreadsheet}
        onOpenFileClick={handleOpenFileClick}
        onSaveXlsx={handleSaveXlsx}
        onExportCsv={handleExportCsv}
        onExportJson={handleExportJson}
        onExportHtml={handleExportHtml}
        onPrint={handlePrint}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onClearSheet={handleClearSheet}
        onOpenFindReplace={() => setIsFindReplaceOpen(true)}
        onOpenFormulaGuide={() => setIsFormulaGuideOpen(true)}
        onOpenPrivacyModal={() => setIsPrivacyModalOpen(true)}
        onOpenShortcutsModal={() => setIsShortcutsModalOpen(true)}
        onLoadSampleTemplate={handleLoadSampleTemplate}
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

      {/* Modals */}
      <FindReplaceModal
        isOpen={isFindReplaceOpen}
        onClose={() => setIsFindReplaceOpen(false)}
        spreadsheetData={spreadsheetData}
        onSelectCell={(sheetIdx, r, c) => gridRef.current?.selectCell(sheetIdx, r, c)}
        onReplaceCell={(_sheetIdx, r, c, newText) => {
          gridRef.current?.setCellText(r, c, newText);
          showToast(`Replaced text in cell`);
        }}
        onReplaceAll={(newData, count) => {
          gridRef.current?.loadData(newData);
          setSpreadsheetData(newData);
          showToast(`Replaced ${count} occurrences across spreadsheet`);
        }}
      />

      <FormulaGuideModal
        isOpen={isFormulaGuideOpen}
        onClose={() => setIsFormulaGuideOpen(false)}
        onInsertFormula={handleInsertFormula}
      />

      <PrivacyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
      />

      <ShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-12 right-6 z-50 bg-slate-900/90 text-white text-xs px-4 py-2.5 rounded-lg shadow-xl backdrop-blur-xs flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

export default App;
