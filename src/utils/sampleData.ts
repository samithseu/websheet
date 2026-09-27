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
        rows: {
          0: {
            cells: {
              0: { text: 'Monthly Personal Budget & Expenses' },
            },
          },
          2: {
            cells: {
              0: { text: 'INCOME' },
            },
          },
          3: {
            cells: {
              0: { text: 'Source' },
              1: { text: 'Expected ($)' },
              2: { text: 'Actual ($)' },
              3: { text: 'Difference ($)' },
            },
          },
          4: {
            cells: {
              0: { text: 'Primary Salary' },
              1: { text: '4500' },
              2: { text: '4500' },
              3: { text: '=C5-B5' },
            },
          },
          5: {
            cells: {
              0: { text: 'Freelance & Consulting' },
              1: { text: '1200' },
              2: { text: '1450' },
              3: { text: '=C6-B6' },
            },
          },
          6: {
            cells: {
              0: { text: 'Investments / Dividends' },
              1: { text: '300' },
              2: { text: '280' },
              3: { text: '=C7-B7' },
            },
          },
          7: {
            cells: {
              0: { text: 'Total Income' },
              1: { text: '=SUM(B5:B7)' },
              2: { text: '=SUM(C5:C7)' },
              3: { text: '=C8-B8' },
            },
          },
          9: {
            cells: {
              0: { text: 'EXPENSES' },
            },
          },
          10: {
            cells: {
              0: { text: 'Category' },
              1: { text: 'Budget ($)' },
              2: { text: 'Actual ($)' },
              3: { text: 'Remaining ($)' },
            },
          },
          11: {
            cells: {
              0: { text: 'Rent / Mortgage' },
              1: { text: '1800' },
              2: { text: '1800' },
              3: { text: '=B12-C12' },
            },
          },
          12: {
            cells: {
              0: { text: 'Groceries & Dining' },
              1: { text: '600' },
              2: { text: '645' },
              3: { text: '=B13-C13' },
            },
          },
          13: {
            cells: {
              0: { text: 'Utilities & Internet' },
              1: { text: '250' },
              2: { text: '230' },
              3: { text: '=B14-C14' },
            },
          },
          14: {
            cells: {
              0: { text: 'Transportation / Fuel' },
              1: { text: '200' },
              2: { text: '190' },
              3: { text: '=B15-C15' },
            },
          },
          15: {
            cells: {
              0: { text: 'Entertainment & Hobbies' },
              1: { text: '250' },
              2: { text: '310' },
              3: { text: '=B16-C16' },
            },
          },
          16: {
            cells: {
              0: { text: 'Total Expenses' },
              1: { text: '=SUM(B12:B16)' },
              2: { text: '=SUM(C12:C16)' },
              3: { text: '=B17-C17' },
            },
          },
          18: {
            cells: {
              0: { text: 'Net Savings' },
              1: { text: '=B8-B17' },
              2: { text: '=C8-C17' },
              3: { text: '=C19-B19' },
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
              0: { text: 'Quarterly Product Sales Report' },
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
              0: { text: 'CS 101 - Student Performance & Grades' },
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
