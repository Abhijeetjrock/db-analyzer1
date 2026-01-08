let analysisData = null;

// Check authentication on page load
document.addEventListener('DOMContentLoaded', async function() {
    await checkAuthentication();
});

async function checkAuthentication() {
    try {
        const response = await fetch('/api/check-auth');
        const data = await response.json();
        
        if (!data.authenticated) {
            // Redirect to login page
            window.location.href = '/login';
        } else {
            // Display user information based on database type
            const usernameEl = document.getElementById('username');
            const dbType = data.db_type || 'Unknown';
            
            if (dbType === 'oracle' || dbType === 'snowflake') {
                usernameEl.textContent = `${data.username} (${dbType.toUpperCase()})`;
            } else if (dbType === 'databricks') {
                usernameEl.textContent = `${data.server} (Databricks)`;
            } else {
                usernameEl.textContent = `Connected (${dbType})`;
            }
        }
    } catch (error) {
        console.error('Error checking authentication:', error);
        window.location.href = '/login';
    }
}

async function logout() {
    if (confirm('Are you sure you want to logout?')) {
        try {
            const response = await fetch('/api/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Redirect to login page
                window.location.href = '/login';
            } else {
                alert('Logout failed. Please try again.');
            }
        } catch (error) {
            console.error('Logout error:', error);
            alert('Error during logout. Please try again.');
        }
    }
}

function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all buttons
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    if (tabName === 'analyze') {
        document.getElementById('analyze-tab').classList.add('active');
        document.querySelectorAll('.tab-button')[0].classList.add('active');
    } else if (tabName === 'compare') {
        document.getElementById('compare-tab').classList.add('active');
        document.querySelectorAll('.tab-button')[1].classList.add('active');
    } else if (tabName === 'compareSourceTarget') {
        document.getElementById('compareSourceTarget-tab').classList.add('active');
        document.querySelectorAll('.tab-button')[2].classList.add('active');
    } else if (tabName === 'sqlQueryCompare') {
        document.getElementById('sqlQueryCompare-tab').classList.add('active');
        document.querySelectorAll('.tab-button')[3].classList.add('active');
    }
}

function updateFileName(inputId) {
    const input = document.getElementById(inputId);
    const fileNameDiv = document.getElementById(`${inputId}Name`);
    
    if (input.files.length > 0) {
        fileNameDiv.textContent = `📄 ${input.files[0].name}`;
        fileNameDiv.style.color = 'var(--success-color)';
    } else {
        fileNameDiv.textContent = '';
    }
}

async function analyzeTables() {
    const tableNamesInput = document.getElementById('tableNames').value.trim();
    const defaultSchema = document.getElementById('defaultSchema').value.trim();
    
    if (!tableNamesInput) {
        showError('Please enter at least one table name');
        return;
    }
    
    // Parse table names (handle both newlines and commas)
    const tableNames = tableNamesInput
        .split(/[\n,]+/)
        .map(t => t.trim())
        .filter(t => t.length > 0);
    
    const requestData = {
        tables: tableNames
    };
    
    if (defaultSchema) {
        requestData.owner = defaultSchema;
    }
    
    showLoading();
    hideError();
    hideResults();
    
    try {
        const response = await fetch('/api/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            analysisData = data.data;
            displayResults(data.data);
            document.getElementById('exportBtn').disabled = false;
        } else {
            showError(data.error || 'Analysis failed');
        }
    } catch (error) {
        showError(`Error: ${error.message}`);
    } finally {
        hideLoading();
    }
}

function displayResults(data) {
    const resultsDiv = document.getElementById('results');
    const resultsContent = document.getElementById('resultsContent');
    
    let html = '';
    
    data.forEach(table => {
        const owner = table.count?.owner || 'N/A';
        const fullName = owner !== 'N/A' ? `${owner}.${table.table_name}` : table.table_name;
        
        html += `
            <div class="table-result">
                <h4>${fullName}</h4>
                <div class="info-grid">
                    <div class="info-item">
                        <div class="info-label">Row Count</div>
                        <div class="info-value">${table.count?.row_count?.toLocaleString() || 'N/A'}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Columns</div>
                        <div class="info-value">${table.structure?.length || 0}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Indexes</div>
                        <div class="info-value">${table.indexes?.length || 0}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Partitions</div>
                        <div class="info-value">${table.partitions?.length || 0}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Primary Key</div>
                        <div class="info-value">${table.primary_key?.constraint_name ? 'Yes' : 'No'}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Foreign Keys</div>
                        <div class="info-value">${table.foreign_keys?.length || 0}</div>
                    </div>
                </div>
            </div>
        `;
    });
    
    resultsContent.innerHTML = html;
    resultsDiv.style.display = 'block';
}

async function exportToExcel() {
    if (!analysisData) {
        showError('No analysis data available. Please analyze tables first.');
        return;
    }
    
    try {
        const response = await fetch('/api/export', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ data: analysisData })
        });
        
        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `oracle_table_analysis_${new Date().getTime()}.xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } else {
            const error = await response.json();
            showError(error.error || 'Export failed');
        }
    } catch (error) {
        showError(`Error: ${error.message}`);
    }
}

async function compareFiles() {
    const file1 = document.getElementById('file1').files[0];
    const file2 = document.getElementById('file2').files[0];
    
    if (!file1 || !file2) {
        showCompareError('Please select both files');
        return;
    }
    
    const formData = new FormData();
    formData.append('file1', file1);
    formData.append('file2', file2);
    
    showCompareLoading();
    hideCompareError();
    hideCompareResults();
    
    try {
        const response = await fetch('/api/compare', {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            const contentType = response.headers.get('content-type');
            
            if (contentType && contentType.includes('application/json')) {
                const data = await response.json();
                
                if (data.identical) {
                    showCompareResults(`
                        <div class="success-message">
                            <h4>✅ Files are Identical</h4>
                            <p>The two files are identical. No differences found.</p>
                        </div>
                    `);
                }
            } else {
                // Download the comparison report
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `comparison_result_${new Date().getTime()}.xlsx`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                
                showCompareResults(`
                    <div class="success-message">
                        <h4>✅ Comparison Complete</h4>
                        <p>Differences found! The comparison report has been downloaded.</p>
                    </div>
                `);
            }
        } else {
            const error = await response.json();
            showCompareError(error.error || 'Comparison failed');
        }
    } catch (error) {
        showCompareError(`Error: ${error.message}`);
    } finally {
        hideCompareLoading();
    }
}

function showLoading() {
    document.getElementById('loading').style.display = 'block';
}

function hideLoading() {
    document.getElementById('loading').style.display = 'none';
}

function showError(message) {
    const errorDiv = document.getElementById('error');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}

function hideError() {
    document.getElementById('error').style.display = 'none';
}

function hideResults() {
    document.getElementById('results').style.display = 'none';
}

function showCompareLoading() {
    document.getElementById('compareLoading').style.display = 'block';
}

function hideCompareLoading() {
    document.getElementById('compareLoading').style.display = 'none';
}

function showCompareError(message) {
    const errorDiv = document.getElementById('compareError');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}

function hideCompareError() {
    document.getElementById('compareError').style.display = 'none';
}

function showCompareResults(html) {
    const resultsDiv = document.getElementById('compareResults');
    resultsDiv.innerHTML = html;
    resultsDiv.style.display = 'block';
}

function hideCompareResults() {
    document.getElementById('compareResults').style.display = 'none';
}

// Compare Source-Target Tables
async function compareSourceTarget() {
    const sourceTable = document.getElementById('sourceTableName').value.trim();
    const sourceSchema = document.getElementById('sourceSchema').value.trim();
    const targetTable = document.getElementById('targetTableName').value.trim();
    const targetSchema = document.getElementById('targetSchema').value.trim();
    
    // Get comparison options
    const compareStructure = document.getElementById('compareStructure').checked;
    const compareRowCount = document.getElementById('compareRowCount').checked;
    const compareIndexes = document.getElementById('compareIndexes').checked;
    const compareConstraints = document.getElementById('compareConstraints').checked;
    
    // Validation
    if (!sourceTable || !targetTable) {
        showSTError('Please enter both source and target table names');
        return;
    }
    
    // Show loading
    document.getElementById('stLoading').style.display = 'block';
    document.getElementById('stResults').style.display = 'none';
    document.getElementById('stError').style.display = 'none';
    
    try {
        const response = await fetch('/api/compare-source-target', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                source: {
                    table: sourceTable,
                    schema: sourceSchema || null
                },
                target: {
                    table: targetTable,
                    schema: targetSchema || null
                },
                options: {
                    structure: compareStructure,
                    rowCount: compareRowCount,
                    indexes: compareIndexes,
                    constraints: compareConstraints
                }
            })
        });
        
        const data = await response.json();
        
        document.getElementById('stLoading').style.display = 'none';
        
        if (data.success) {
            displaySTResults(data);
        } else {
            showSTError(data.error || 'Comparison failed');
        }
    } catch (error) {
        document.getElementById('stLoading').style.display = 'none';
        showSTError('Error: ' + error.message);
    }
}

function displaySTResults(data) {
    const resultsContent = document.getElementById('stResultsContent');
    const differences = data.differences;
    
    let html = '';
    
    // Summary
    html += `<div class="comparison-summary">`;
    html += `<h4>Comparison Summary</h4>`;
    html += `<div class="summary-grid">`;
    html += `<div class="summary-item"><strong>Source:</strong> ${data.source_table}</div>`;
    html += `<div class="summary-item"><strong>Target:</strong> ${data.target_table}</div>`;
    html += `<div class="summary-item"><strong>Total Differences:</strong> ${differences.total_count}</div>`;
    html += `<div class="summary-item ${differences.total_count === 0 ? 'success' : 'warning'}">`;
    html += `<strong>Status:</strong> ${differences.total_count === 0 ? '✓ Tables are identical' : '⚠ Differences found'}`;
    html += `</div>`;
    html += `</div></div>`;
    
    // If no differences
    if (differences.total_count === 0) {
        html += `<div class="success-message">`;
        html += `<h3>✓ Success!</h3>`;
        html += `<p>The source and target tables are identical based on selected comparison options.</p>`;
        html += `</div>`;
        resultsContent.innerHTML = html;
        document.getElementById('stResults').style.display = 'block';
        return;
    }
    
    // Structure differences
    if (differences.structure && differences.structure.length > 0) {
        html += `<div class="diff-section">`;
        html += `<h4>📋 Structure Differences (${differences.structure.length})</h4>`;
        html += `<table class="diff-table">`;
        html += `<thead><tr><th>Column</th><th>Type</th><th>Source</th><th>Target</th></tr></thead><tbody>`;
        differences.structure.forEach(diff => {
            html += `<tr class="diff-row-${diff.type}">`;
            html += `<td>${diff.column_name}</td>`;
            html += `<td>${diff.diff_type}</td>`;
            html += `<td>${diff.source_value || 'N/A'}</td>`;
            html += `<td>${diff.target_value || 'N/A'}</td>`;
            html += `</tr>`;
        });
        html += `</tbody></table></div>`;
    }
    
    // Row count difference
    if (differences.row_count && differences.row_count.different) {
        html += `<div class="diff-section">`;
        html += `<h4>🔢 Row Count Difference</h4>`;
        html += `<table class="diff-table">`;
        html += `<thead><tr><th>Source Rows</th><th>Target Rows</th><th>Difference</th></tr></thead><tbody>`;
        html += `<tr>`;
        html += `<td>${differences.row_count.source}</td>`;
        html += `<td>${differences.row_count.target}</td>`;
        html += `<td class="warning">${differences.row_count.difference}</td>`;
        html += `</tr></tbody></table></div>`;
    }
    
    // Index differences
    if (differences.indexes && differences.indexes.length > 0) {
        html += `<div class="diff-section">`;
        html += `<h4>🔑 Index Differences (${differences.indexes.length})</h4>`;
        html += `<table class="diff-table">`;
        html += `<thead><tr><th>Index Name</th><th>Type</th><th>Status</th></tr></thead><tbody>`;
        differences.indexes.forEach(diff => {
            html += `<tr>`;
            html += `<td>${diff.index_name}</td>`;
            html += `<td>${diff.diff_type}</td>`;
            html += `<td class="${diff.status === 'missing_in_target' ? 'warning' : 'info'}">${diff.status}</td>`;
            html += `</tr>`;
        });
        html += `</tbody></table></div>`;
    }
    
    // Constraint differences
    if (differences.constraints && differences.constraints.length > 0) {
        html += `<div class="diff-section">`;
        html += `<h4>🔗 Constraint Differences (${differences.constraints.length})</h4>`;
        html += `<table class="diff-table">`;
        html += `<thead><tr><th>Constraint Name</th><th>Type</th><th>Source Value</th><th>Target Value</th><th>Status</th></tr></thead><tbody>`;
        differences.constraints.forEach(diff => {
            let statusClass = 'info';
            if (diff.status === 'missing_in_target') {
                statusClass = 'warning';
            } else if (diff.status === 'missing_in_source') {
                statusClass = 'info';
            } else if (diff.status === 'modified') {
                statusClass = 'warning';
            }
            
            html += `<tr>`;
            html += `<td>${diff.constraint_name}</td>`;
            html += `<td>${diff.constraint_type}</td>`;
            html += `<td>${diff.source_value || 'N/A'}</td>`;
            html += `<td>${diff.target_value || 'N/A'}</td>`;
            html += `<td class="${statusClass}">${diff.status.replace(/_/g, ' ').toUpperCase()}</td>`;
            html += `</tr>`;
        });
        html += `</tbody></table></div>`;
    }
    
    resultsContent.innerHTML = html;
    document.getElementById('stResults').style.display = 'block';
}

function showSTError(message) {
    const errorDiv = document.getElementById('stError');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}

// SQL Query Comparison
let queryComparisonData = null;

async function compareQueryData() {
    const sourceQuery = document.getElementById('sourceQuery').value.trim();
    const targetQuery = document.getElementById('targetQuery').value.trim();
    
    if (!sourceQuery || !targetQuery) {
        showQueryError('Please enter both source and target SQL queries');
        return;
    }
    
    document.getElementById('queryLoading').style.display = 'block';
    document.getElementById('queryResults').style.display = 'none';
    document.getElementById('queryError').style.display = 'none';
    document.getElementById('exportQueryBtn').disabled = true;
    
    const requestBody = {
        source_query: sourceQuery,
        target_query: targetQuery
    };
    
    const apiResponse = await fetch('/api/compare-query-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
    });
    
    const result = await apiResponse.json();
    document.getElementById('queryLoading').style.display = 'none';
    
    if (result.success) {
        queryComparisonData = result;
        displayQueryResults(result);
        document.getElementById('exportQueryBtn').disabled = false;
    } else {
        showQueryError(result.error || 'Query comparison failed');
    }
}

function displayQueryResults(result) {
    const content = document.getElementById('queryResultsContent');
    const summary = result.summary;
    const diffs = result.differences;
    
    let output = '<div class="comparison-summary">';
    output += '<h4>Query Execution Summary</h4><div class="summary-grid">';
    output += `<div class="summary-item"><strong>Source Rows:</strong> ${summary.source_rows}</div>`;
    output += `<div class="summary-item"><strong>Target Rows:</strong> ${summary.target_rows}</div>`;
    output += `<div class="summary-item"><strong>Matching Rows:</strong> ${summary.matching_rows}</div>`;
    output += `<div class="summary-item ${summary.total_differences === 0 ? 'success' : 'warning'}">`;
    output += `<strong>Differences:</strong> ${summary.total_differences}</div></div></div>`;
    
    if (summary.total_differences === 0) {
        output += '<div class="success-message"><h3>✓ Data is Identical!</h3>';
        output += '<p>Query results are identical.</p></div>';
    } else {
        if (diffs.row_differences && diffs.row_differences.length > 0) {
            output += '<div class="diff-section">';
            output += `<h4>📊 Row Differences (${diffs.row_differences.length})</h4>`;
            output += '<table class="diff-table"><thead><tr><th>Row</th><th>Column</th><th>Source</th><th>Target</th></tr></thead><tbody>';
            const maxRows = Math.min(100, diffs.row_differences.length);
            for (let i = 0; i < maxRows; i++) {
                const diff = diffs.row_differences[i];
                output += `<tr><td>${diff.row_number}</td><td>${diff.column_name}</td>`;
                output += `<td>${diff.source_value || 'NULL'}</td><td>${diff.target_value || 'NULL'}</td></tr>`;
            }
            if (diffs.row_differences.length > 100) {
                output += `<tr><td colspan="4" class="info">... ${diffs.row_differences.length - 100} more (see Excel)</td></tr>`;
            }
            output += '</tbody></table></div>';
        }
        if (diffs.missing_in_target && diffs.missing_in_target.length > 0) {
            output += '<div class="diff-section">';
            output += `<h4>⚠️ Missing in Target (${diffs.missing_in_target.length})</h4></div>`;
        }
        if (diffs.missing_in_source && diffs.missing_in_source.length > 0) {
            output += '<div class="diff-section">';
            output += `<h4>⚠️ Missing in Source (${diffs.missing_in_source.length})</h4></div>`;
        }
    }
    
    content.innerHTML = output;
    document.getElementById('queryResults').style.display = 'block';
}

async function exportQueryComparison() {
    if (!queryComparisonData) {
        showQueryError('No data to export');
        return;
    }
    
    const apiResponse = await fetch('/api/export-query-comparison', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(queryComparisonData)
    });
    
    if (!apiResponse.ok) {
        showQueryError('Export failed');
        return;
    }
    
    const fileBlob = await apiResponse.blob();
    const downloadUrl = window.URL.createObjectURL(fileBlob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `query_comparison_${Date.now()}.xlsx`;
    document.body.appendChild(link);
    link.click();
    window.URL.revokeObjectURL(downloadUrl);
    document.body.removeChild(link);
}

function showQueryError(msg) {
    const errorElement = document.getElementById('queryError');
    errorElement.textContent = msg;
    errorElement.style.display = 'block';
}
