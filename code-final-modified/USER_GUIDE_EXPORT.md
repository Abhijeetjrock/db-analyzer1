# User Guide: Exporting Table Comparison Results

## Overview
The Compare Tables feature now includes an **Export to Excel** option that allows you to download comparison results in a professionally formatted Excel file.

## How to Use

### Step 1: Perform Table Comparison
1. Navigate to the **Source-Target Comparison** page
2. Connect to your source database
3. Connect to your target database
4. Enter the table names you want to compare
5. Select comparison options:
   - ✓ Compare Structure (Columns, Data Types)
   - ✓ Compare Row Count
   - ☐ Compare Indexes
   - ✓ Compare Constraints (Primary Key, Foreign Keys)
6. Click **"Compare Tables"**

### Step 2: Review Results
- Wait for the comparison to complete
- Review the comparison results displayed on screen
- The results will show:
  - Summary of differences
  - Structure differences (if any)
  - Row count differences (if any)
  - Index differences (if selected and available)
  - Constraint differences (if selected and available)

### Step 3: Export to Excel
1. After the comparison completes, an **"📥 Export to Excel"** button will appear
2. Click the **"Export to Excel"** button
3. The button will show "⏳ Exporting..." while generating the file
4. The Excel file will automatically download to your default downloads folder
5. A success message will appear: "✓ Comparison exported to Excel successfully!"

## Understanding the Excel Report

### File Structure
The exported Excel file contains multiple sheets, each focusing on a specific aspect of the comparison:

#### 1. Summary Sheet
- **Purpose**: High-level overview of the comparison
- **Contents**:
  - Source and Target table names
  - Total number of differences found
  - Breakdown by category (Structure, Indexes, Constraints)
  - Row count comparison

**Example:**
```
Table Comparison Report
Generated: 2024-01-15 14:30:22

Source Table: PROD_SCHEMA.CUSTOMER_DATA
Target Table: TEST_SCHEMA.CUSTOMER_DATA

Comparison Results:
Total Differences: 8
Structure Differences: 5
Index Differences: 2
Constraint Differences: 1
Row Count - Source: 10,000
Row Count - Target: 9,850
Row Count Different: Yes
```

#### 2. Structure Differences Sheet
- **Purpose**: Shows column-level differences
- **Color Coding**:
  - 🟢 **Green rows**: Columns added in target (missing in source)
  - 🔴 **Red rows**: Columns removed in target (missing in target)
  - 🟡 **Yellow rows**: Columns modified (different data type, length, or nullable)
- **Columns**:
  - Column Name
  - Difference Type
  - Source (column definition)
  - Target (column definition)
  - Status

**Example:**
| Column Name | Difference Type | Source | Target | Status |
|-------------|----------------|---------|---------|---------|
| EMAIL | Missing in Target | VARCHAR2(100) Y | N/A | REMOVED |
| MOBILE_NO | Missing in Source | N/A | VARCHAR2(20) Y | ADDED |
| ADDRESS | Modified | VARCHAR2(200) Y | VARCHAR2(500) Y | MODIFIED |

#### 3. Row Count Difference Sheet
- **Purpose**: Shows row count comparison
- **Contents**:
  - Source row count
  - Target row count
  - Absolute difference

**Example:**
| Metric | Value |
|--------|-------|
| Source Rows | 10,000 |
| Target Rows | 9,850 |
| Difference | 150 |

#### 4. Index Differences Sheet
- **Purpose**: Shows index differences between tables
- **Color Coding**:
  - 🟢 **Green rows**: Indexes only in target
  - 🔴 **Red rows**: Indexes only in source (missing in target)
- **Columns**:
  - Index Name
  - Type (NORMAL, UNIQUE, etc.)
  - Status

**Example:**
| Index Name | Type | Status |
|------------|------|---------|
| IDX_CUSTOMER_EMAIL | NORMAL | MISSING IN TARGET |
| IDX_CUSTOMER_ID_NAME | BITMAP | MISSING IN SOURCE |

#### 5. Constraint Differences Sheet
- **Purpose**: Shows constraint differences (Primary Keys, Foreign Keys)
- **Color Coding**:
  - 🟢 **Green rows**: Constraints only in target
  - 🔴 **Red rows**: Constraints only in source
  - 🟡 **Yellow rows**: Constraints modified
- **Columns**:
  - Constraint Name
  - Type (PRIMARY KEY, FOREIGN KEY)
  - Source Value (column list)
  - Target Value (column list)
  - Status

**Example:**
| Constraint Name | Type | Source Value | Target Value | Status |
|-----------------|------|--------------|--------------|---------|
| PK_CUSTOMER | PRIMARY KEY | CUSTOMER_ID | CUSTOMER_ID, REGION_ID | MODIFIED |
| FK_CUSTOMER_REGION | FOREIGN KEY | REGION_ID | None | MISSING IN TARGET |

## File Naming Convention
Files are automatically named with the following format:
```
comparison_<source_table>_vs_<target_table>_<timestamp>.xlsx
```

**Examples:**
- `comparison_SCHEMA1_ORDERS_vs_SCHEMA2_ORDERS_20240115_143022.xlsx`
- `comparison_PROD_CUSTOMERS_vs_TEST_CUSTOMERS_20240115_150530.xlsx`

## Tips for Best Results

### Before Exporting
1. **Review on Screen First**: Check the results before exporting to ensure the comparison ran correctly
2. **Select Relevant Options**: Only compare what you need (e.g., uncheck indexes if not relevant)
3. **Check Connection**: Ensure both database connections are stable

### Working with the Export
1. **Open in Excel**: The file opens in Microsoft Excel, LibreOffice Calc, or Google Sheets
2. **Use Filters**: Excel's filter feature works great on the data sheets
3. **Sort Data**: You can sort by status or column name to group similar changes
4. **Create Pivot Tables**: For large comparisons, pivot tables can provide additional insights
5. **Share Results**: Email or share the file with team members for review

### Interpreting Results
1. **Green Items**: New additions - review if they should be in source
2. **Red Items**: Deletions - verify if these should be removed
3. **Yellow Items**: Modifications - check if changes are intentional
4. **Row Count Differences**: May indicate data sync issues

## Troubleshooting

### Export Button Not Appearing
- **Cause**: No comparison has been run yet
- **Solution**: Click "Compare Tables" first

### Export Button Greyed Out
- **Cause**: Export already in progress
- **Solution**: Wait for current export to complete

### Download Fails
- **Cause**: Browser blocked the download or network issue
- **Solution**: 
  1. Check browser's download settings
  2. Ensure pop-ups are not blocked
  3. Try again

### Empty Excel File
- **Cause**: No differences were found
- **Solution**: This is normal if tables are identical - Summary sheet will show "0 differences"

### Formatting Issues
- **Cause**: Excel version compatibility
- **Solution**: 
  1. Save as .xlsx format
  2. Use Excel 2010 or later
  3. Update to latest version of LibreOffice/Excel

## Best Practices

### For Documentation
1. Export results before and after migrations
2. Keep exports as part of change management documentation
3. Use exports for audit trails

### For Analysis
1. Export multiple comparisons and compare over time
2. Use Excel formulas to analyze trends
3. Create dashboards from exported data

### For Collaboration
1. Share exports with DBAs for review
2. Attach to change requests
3. Include in deployment documentation

## Security Notes
- Exported files contain table metadata (structure, constraints)
- Do **NOT** include actual data rows
- Safe to share with authorized team members
- Consider marking files as "Internal Use Only" if containing sensitive schema information

## Support
If you encounter issues with the export feature:
1. Check the browser console for error messages
2. Verify both database connections are active
3. Ensure you have sufficient disk space for the download
4. Contact your system administrator if problems persist

---

**Version**: 2.0  
**Last Updated**: January 2024  
**Feature**: Table Comparison Export
