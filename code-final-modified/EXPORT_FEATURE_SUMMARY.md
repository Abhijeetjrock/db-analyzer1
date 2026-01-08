# Export Feature for Compare Tables Page

## Summary
Added an export to Excel functionality for the table comparison page, allowing users to export comparison results (structure mismatches, row count differences, indexes, and constraints) in a clean, formatted Excel file.

## Changes Made

### 1. Frontend Changes

#### HTML (source-target-new.html)
- **Location**: `templates/source-target-new.html`
- **Changes**: 
  - Added an "Export to Excel" button next to the "Compare Tables" button
  - Button is initially hidden and only shows when comparison results are available
  - Button has a green style (btn-success) with an icon

#### JavaScript (source-target-dual.js)
- **Location**: `static/js/source-target-dual.js`
- **Changes**:
  1. Added `lastComparisonData` global variable to store comparison results
  2. Updated `displayComparisonResults()` function to:
     - Store comparison data in the global variable
     - Show the export button when results are displayed
  3. Added `exportComparisonToExcel()` function to:
     - Send comparison data to the backend
     - Download the generated Excel file
     - Show loading state during export
     - Display success message after export
  4. Added `showExportSuccessMessage()` function for user feedback

### 2. Backend Changes

#### API Endpoint (app.py)
- **Location**: `app.py`
- **Endpoint**: `/api/export-comparison` (POST)
- **Changes**:
  - Created new endpoint to handle comparison export requests
  - Generates a comprehensive Excel workbook with multiple sheets:
    1. **Summary Sheet**: Overview of comparison with table names and difference counts
    2. **Structure Differences Sheet**: Column-level differences with color coding
       - Green: Added columns
       - Red: Removed columns
       - Yellow: Modified columns
    3. **Row Count Difference Sheet**: Row count comparison
    4. **Index Differences Sheet**: Index comparison with color coding
    5. **Constraint Differences Sheet**: Primary key and constraint comparison with color coding
  - Uses openpyxl for Excel generation with professional styling
  - Auto-adjusts column widths for readability
  - Returns file with timestamp-based naming

## Features

### Excel Export Details
- **File Naming**: `comparison_<source_table>_vs_<target_table>_<timestamp>.xlsx`
- **Professional Formatting**:
  - Blue headers with white text
  - Orange section headers
  - Color-coded differences (green/red/yellow)
  - Bordered cells for clarity
  - Auto-adjusted column widths
  - Merged cells for titles

### User Experience
- Export button only appears after successful comparison
- Loading state during export with visual feedback
- Success notification after download
- Automatic file download with descriptive filename
- Error handling with user-friendly messages

## Usage

1. Connect to source and target databases
2. Enter table names and select comparison options
3. Click "Compare Tables"
4. Review the comparison results
5. Click "Export to Excel" button (appears after comparison)
6. Excel file downloads automatically

## Export Structure Example

```
📊 table_comparison_SCHEMA1_TABLE1_vs_SCHEMA2_TABLE2_20240115_143022.xlsx
│
├── Summary
│   ├── Table Comparison Report
│   ├── Source Table: SCHEMA1.TABLE1
│   ├── Target Table: SCHEMA2.TABLE2
│   └── Comparison Results
│       ├── Total Differences: 5
│       ├── Structure Differences: 3
│       ├── Index Differences: 1
│       └── Constraint Differences: 1
│
├── Structure Differences
│   └── Column Name | Difference Type | Source | Target | Status
│       ├── COLUMN1 | Missing in Target | VARCHAR2(50) | N/A | REMOVED
│       ├── COLUMN2 | Missing in Source | N/A | NUMBER(10) | ADDED
│       └── COLUMN3 | Modified | VARCHAR2(100) Y | VARCHAR2(200) Y | MODIFIED
│
├── Row Count Difference
│   └── Metric | Value
│       ├── Source Rows | 1000
│       ├── Target Rows | 950
│       └── Difference | 50
│
├── Index Differences
│   └── Index Name | Type | Status
│       └── IDX_COLUMN1 | NORMAL | MISSING IN TARGET
│
└── Constraint Differences
    └── Constraint Name | Type | Source Value | Target Value | Status
        └── PK_TABLE1 | PRIMARY KEY | ID, CODE | ID | MODIFIED
```

## Technical Details

### Color Coding
- **Green (RGB: 198, 239, 206)**: Items added in target
- **Red (RGB: 255, 199, 206)**: Items removed/missing in target
- **Yellow (RGB: 255, 235, 156)**: Items modified between source and target
- **Blue (RGB: 68, 114, 196)**: Headers
- **Orange (RGB: 255, 192, 0)**: Section headers

### Dependencies
- openpyxl (already in requirements.txt)
- Flask send_file for file download
- No additional frontend libraries needed

## Testing Checklist

- [x] Export button appears after comparison
- [x] Export button hidden before comparison
- [x] Excel file downloads successfully
- [x] Summary sheet shows correct information
- [x] Structure differences are color-coded correctly
- [x] Row count differences are displayed
- [x] Index differences are shown (when available)
- [x] Constraint differences are shown (when available)
- [x] Filename includes table names and timestamp
- [x] Success message appears after export
- [x] Error handling works for failed exports

## Files Modified

1. `templates/source-target-new.html` - Added export button
2. `static/js/source-target-dual.js` - Added export functionality
3. `app.py` - Added `/api/export-comparison` endpoint

## Future Enhancements (Optional)

1. Add export format options (CSV, PDF)
2. Include SQL scripts to fix differences
3. Add filtering options for export (e.g., only structure differences)
4. Email export functionality
5. Schedule automatic comparisons with export
6. Add charts/graphs to summary sheet
7. Export history/comparison logs
