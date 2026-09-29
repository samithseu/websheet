import type { XSpreadsheetData, XSpreadsheetSheet } from '../utils/spreadsheetConverter';

export interface XSpreadsheetDataProxy {
  name: string;
  getData: () => XSpreadsheetSheet;
  setCellText: (r: number, c: number, text: string, state?: string) => void;
  getCell: (r: number, c: number) => { text?: string | number; value?: any } | undefined;
  rows: {
    clear: () => void;
  };
}

export interface XSpreadsheetCell {
  text?: string | number;
  value?: any;
}

export interface XSpreadsheetInstance {
  loadData: (data: XSpreadsheetData) => XSpreadsheetInstance;
  getData: () => XSpreadsheetData;
  cellText: (r: number, c: number, text: string, sheetIndex?: number) => XSpreadsheetInstance;
  cell: (r: number, c: number, sheetIndex?: number) => XSpreadsheetCell | undefined;
  reRender: () => XSpreadsheetInstance;
  on: (event: string, handler: (...args: any[]) => void) => XSpreadsheetInstance;
  change: (handler: (data: any) => void) => XSpreadsheetInstance;
  deleteSheet?: () => void;
  sheet: {
    data: XSpreadsheetDataProxy;
    undo: () => void;
    redo: () => void;
    reload: () => void;
  };
  datas: XSpreadsheetDataProxy[];
  bottombar?: {
    menu?: {
      items?: Array<{ el?: HTMLElement }>;
    };
    items?: Array<any>;
    activeEl?: any;
    deleteEl?: any;
    deleteItem?: () => [number, number] | [number];
  };
}

export function getSpreadsheetFactory(): ((container: HTMLElement, options?: any) => XSpreadsheetInstance) | null {
  if (typeof window !== 'undefined' && 'x_spreadsheet' in window) {
    return (window as any).x_spreadsheet as (container: HTMLElement, options?: any) => XSpreadsheetInstance;
  }
  return null;
}
