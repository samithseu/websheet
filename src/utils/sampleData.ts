import type { XSpreadsheetData } from './spreadsheetConverter';

export interface SampleTemplate {
  id: string;
  name: string;
  description: string;
  filename: string;
  data: XSpreadsheetData;
}

export const SAMPLE_TEMPLATES: SampleTemplate[] = [
  {
    id: 'monthly-budget',
    name: 'Monthly Budget',
    description: 'Personal income and expense tracker with formulas',
    filename: 'Monthly_Budget.xlsx',
    data: [
      {
        name: 'Summary',
        merges: ['A1:D1', 'A3:D3', 'A10:D10'],
        cols: {
          0: { width: 180 },
          1: { width: 120 },
          2: { width: 120 },
          3: { width: 140 },
        },
        styles: [
          // 0: Main Title Header
          {
            font: { bold: true, size: 12 },
            bgcolor: '#f1f5f9',
            color: '#0f172a',
            align: 'left',
            border: {
              top: ['thin', '#94a3b8'],
              bottom: ['thin', '#94a3b8'],
              left: ['thin', '#94a3b8'],
              right: ['thin', '#94a3b8'],
            },
          },
          // 1: Section Category Banner ("INCOME", "EXPENSES")
          {
            font: { bold: true, size: 10 },
            bgcolor: '#e2e8f0',
            color: '#1e293b',
            align: 'left',
            border: {
              top: ['thin', '#94a3b8'],
              bottom: ['thin', '#94a3b8'],
              left: ['thin', '#94a3b8'],
              right: ['thin', '#94a3b8'],
            },
          },
          // 2: Table Column Header (Text - Left)
          {
            font: { bold: true, size: 10 },
            bgcolor: '#f8fafc',
            color: '#334155',
            align: 'left',
            border: {
              top: ['thin', '#cbd5e1'],
              bottom: ['medium', '#64748b'],
              left: ['thin', '#cbd5e1'],
              right: ['thin', '#cbd5e1'],
            },
          },
          // 3: Table Column Header (Numeric - Right)
          {
            font: { bold: true, size: 10 },
            bgcolor: '#f8fafc',
            color: '#334155',
            align: 'right',
            border: {
              top: ['thin', '#cbd5e1'],
              bottom: ['medium', '#64748b'],
              left: ['thin', '#cbd5e1'],
              right: ['thin', '#cbd5e1'],
            },
          },
          // 4: Data Cell (Text - Left)
          {
            align: 'left',
            border: {
              top: ['thin', '#e2e8f0'],
              bottom: ['thin', '#e2e8f0'],
              left: ['thin', '#cbd5e1'],
              right: ['thin', '#cbd5e1'],
            },
          },
          // 5: Data Cell (Numeric / Formula - Right)
          {
            align: 'right',
            border: {
              top: ['thin', '#e2e8f0'],
              bottom: ['thin', '#e2e8f0'],
              left: ['thin', '#cbd5e1'],
              right: ['thin', '#cbd5e1'],
            },
          },
          // 6: Total / Summary Row (Label - Left)
          {
            font: { bold: true, size: 10 },
            bgcolor: '#f8fafc',
            color: '#0f172a',
            align: 'left',
            border: {
              top: ['thin', '#94a3b8'],
              bottom: ['medium', '#64748b'],
              left: ['thin', '#cbd5e1'],
              right: ['thin', '#cbd5e1'],
            },
          },
          // 7: Total / Summary Row (Values - Right)
          {
            font: { bold: true, size: 10 },
            bgcolor: '#f8fafc',
            color: '#0f172a',
            align: 'right',
            border: {
              top: ['thin', '#94a3b8'],
              bottom: ['medium', '#64748b'],
              left: ['thin', '#cbd5e1'],
              right: ['thin', '#cbd5e1'],
            },
          },
        ],
        rows: {
          0: {
            cells: {
              0: { text: 'Monthly Personal Budget & Expenses', merge: [0, 3], style: 0 },
            },
          },
          2: {
            cells: {
              0: { text: 'INCOME', merge: [0, 3], style: 1 },
            },
          },
          3: {
            cells: {
              0: { text: 'Source', style: 2 },
              1: { text: 'Expected ($)', style: 3 },
              2: { text: 'Actual ($)', style: 3 },
              3: { text: 'Difference ($)', style: 3 },
            },
          },
          4: {
            cells: {
              0: { text: 'Primary Salary', style: 4 },
              1: { text: '4500', style: 5 },
              2: { text: '4500', style: 5 },
              3: { text: '=C5-B5', style: 5 },
            },
          },
          5: {
            cells: {
              0: { text: 'Freelance & Consulting', style: 4 },
              1: { text: '1200', style: 5 },
              2: { text: '1450', style: 5 },
              3: { text: '=C6-B6', style: 5 },
            },
          },
          6: {
            cells: {
              0: { text: 'Investments / Dividends', style: 4 },
              1: { text: '300', style: 5 },
              2: { text: '280', style: 5 },
              3: { text: '=C7-B7', style: 5 },
            },
          },
          7: {
            cells: {
              0: { text: 'Total Income', style: 6 },
              1: { text: '=SUM(B5:B7)', style: 7 },
              2: { text: '=SUM(C5:C7)', style: 7 },
              3: { text: '=C8-B8', style: 7 },
            },
          },
          9: {
            cells: {
              0: { text: 'EXPENSES', merge: [0, 3], style: 1 },
            },
          },
          10: {
            cells: {
              0: { text: 'Category', style: 2 },
              1: { text: 'Budget ($)', style: 3 },
              2: { text: 'Actual ($)', style: 3 },
              3: { text: 'Remaining ($)', style: 3 },
            },
          },
          11: {
            cells: {
              0: { text: 'Rent / Mortgage', style: 4 },
              1: { text: '1800', style: 5 },
              2: { text: '1800', style: 5 },
              3: { text: '=B12-C12', style: 5 },
            },
          },
          12: {
            cells: {
              0: { text: 'Groceries & Dining', style: 4 },
              1: { text: '600', style: 5 },
              2: { text: '645', style: 5 },
              3: { text: '=B13-C13', style: 5 },
            },
          },
          13: {
            cells: {
              0: { text: 'Utilities & Internet', style: 4 },
              1: { text: '250', style: 5 },
              2: { text: '230', style: 5 },
              3: { text: '=B14-C14', style: 5 },
            },
          },
          14: {
            cells: {
              0: { text: 'Transportation / Fuel', style: 4 },
              1: { text: '200', style: 5 },
              2: { text: '190', style: 5 },
              3: { text: '=B15-C15', style: 5 },
            },
          },
          15: {
            cells: {
              0: { text: 'Entertainment & Hobbies', style: 4 },
              1: { text: '250', style: 5 },
              2: { text: '310', style: 5 },
              3: { text: '=B16-C16', style: 5 },
            },
          },
          16: {
            cells: {
              0: { text: 'Total Expenses', style: 6 },
              1: { text: '=SUM(B12:B16)', style: 7 },
              2: { text: '=SUM(C12:C16)', style: 7 },
              3: { text: '=B17-C17', style: 7 },
            },
          },
          18: {
            cells: {
              0: { text: 'Net Savings', style: 6 },
              1: { text: '=B8-B17', style: 7 },
              2: { text: '=C8-C17', style: 7 },
              3: { text: '=C19-B19', style: 7 },
            },
          },
        },
      },
    ],
  },
  {
    id: 'sales-tracker',
    name: 'Sales Tracker',
    description: 'Quarterly product sales by region with units & revenue',
    filename: 'Quarterly_Sales.xlsx',
    data: [
      {
        name: 'Q1 Sales',
        merges: ['A1:F1'],
        cols: {
          0: { width: 140 },
          1: { width: 120 },
          2: { width: 100 },
          3: { width: 100 },
          4: { width: 120 },
          5: { width: 130 },
        },
        rows: {
          0: {
            cells: {
              0: { text: 'Quarterly Product Sales Report', merge: [0, 5] },
            },
          },
          2: {
            cells: {
              0: { text: 'Product' },
              1: { text: 'Region' },
              2: { text: 'Units Sold' },
              3: { text: 'Unit Price' },
              4: { text: 'Total Revenue' },
              5: { text: 'Commission (5%)' },
            },
          },
          3: {
            cells: {
              0: { text: 'MacBook Pro M3' },
              1: { text: 'North America' },
              2: { text: '42' },
              3: { text: '1999' },
              4: { text: '=C4*D4' },
              5: { text: '=E4*0.05' },
            },
          },
          4: {
            cells: {
              0: { text: 'iPad Air' },
              1: { text: 'Europe' },
              2: { text: '78' },
              3: { text: '599' },
              4: { text: '=C5*D5' },
              5: { text: '=E5*0.05' },
            },
          },
          5: {
            cells: {
              0: { text: 'Dell XPS 15' },
              1: { text: 'Asia Pacific' },
              2: { text: '35' },
              3: { text: '1499' },
              4: { text: '=C6*D6' },
              5: { text: '=E6*0.05' },
            },
          },
          6: {
            cells: {
              0: { text: 'Sony WH-1000XM5' },
              1: { text: 'North America' },
              2: { text: '120' },
              3: { text: '399' },
              4: { text: '=C7*D7' },
              5: { text: '=E7*0.05' },
            },
          },
          7: {
            cells: {
              0: { text: 'Logitech MX Master 3S' },
              1: { text: 'Latin America' },
              2: { text: '160' },
              3: { text: '99' },
              4: { text: '=C8*D8' },
              5: { text: '=E8*0.05' },
            },
          },
          8: {
            cells: {
              0: { text: 'Totals' },
              1: { text: '' },
              2: { text: '=SUM(C4:C8)' },
              3: { text: '=AVERAGE(D4:D8)' },
              4: { text: '=SUM(E4:E8)' },
              5: { text: '=SUM(F4:F8)' },
            },
          },
        },
      },
    ],
  },
  {
    id: 'student-grades',
    name: 'Gradebook Tracker',
    description: 'Student test scores, assignment grades, and class averages',
    filename: 'Class_Gradebook.xlsx',
    data: [
      {
        name: 'Computer Science 101',
        merges: ['A1:G1'],
        cols: {
          0: { width: 160 },
          1: { width: 100 },
          2: { width: 100 },
          3: { width: 100 },
          4: { width: 100 },
          5: { width: 110 },
          6: { width: 90 },
        },
        rows: {
          0: {
            cells: {
              0: { text: 'CS 101 - Student Performance & Grades', merge: [0, 6] },
            },
          },
          2: {
            cells: {
              0: { text: 'Student Name' },
              1: { text: 'Homework (20%)' },
              2: { text: 'Midterm (30%)' },
              3: { text: 'Project (20%)' },
              4: { text: 'Final Exam (30%)' },
              5: { text: 'Weighted Average' },
              6: { text: 'Passed?' },
            },
          },
          3: {
            cells: {
              0: { text: 'Alice Johnson' },
              1: { text: '95' },
              2: { text: '88' },
              3: { text: '92' },
              4: { text: '94' },
              5: { text: '=B4*0.2+C4*0.3+D4*0.2+E4*0.3' },
              6: { text: '=IF(F4>=70,"YES","NO")' },
            },
          },
          4: {
            cells: {
              0: { text: 'Bob Smith' },
              1: { text: '80' },
              2: { text: '74' },
              3: { text: '85' },
              4: { text: '78' },
              5: { text: '=B5*0.2+C5*0.3+D5*0.2+E5*0.3' },
              6: { text: '=IF(F5>=70,"YES","NO")' },
            },
          },
          5: {
            cells: {
              0: { text: 'Charlie Davis' },
              1: { text: '65' },
              2: { text: '60' },
              3: { text: '70' },
              4: { text: '62' },
              5: { text: '=B6*0.2+C6*0.3+D6*0.2+E6*0.3' },
              6: { text: '=IF(F6>=70,"YES","NO")' },
            },
          },
          6: {
            cells: {
              0: { text: 'Diana Prince' },
              1: { text: '98' },
              2: { text: '95' },
              3: { text: '100' },
              4: { text: '97' },
              5: { text: '=B7*0.2+C7*0.3+D7*0.2+E7*0.3' },
              6: { text: '=IF(F7>=70,"YES","NO")' },
            },
          },
          7: {
            cells: {
              0: { text: 'Evan Wright' },
              1: { text: '72' },
              2: { text: '81' },
              3: { text: '78' },
              4: { text: '85' },
              5: { text: '=B8*0.2+C8*0.3+D8*0.2+E8*0.3' },
              6: { text: '=IF(F8>=70,"YES","NO")' },
            },
          },
          8: {
            cells: {
              0: { text: 'Class Average' },
              1: { text: '=AVERAGE(B4:B8)' },
              2: { text: '=AVERAGE(C4:C8)' },
              3: { text: '=AVERAGE(D4:D8)' },
              4: { text: '=AVERAGE(E4:E8)' },
              5: { text: '=AVERAGE(F4:F8)' },
              6: { text: '' },
            },
          },
        },
      },
    ],
  },
];
