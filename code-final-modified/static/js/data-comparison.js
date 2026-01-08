// SQL Query Dual Database Connection and Comparison - FIXED VERSION
// With strict validation

let sourceConnected = false;
let targetConnected = false;
let sourceSessionId = null;
let targetSessionId = null;
let comparisonData = null;
let sourceDbType = null;
let targetDbType = null;

// Switch source database type
function switchSourceDbType() {
    const dbType = document.getElementById('sourceDbType').value;
    document.getElementById('sourceOracleFields').style.display = dbType === 'oracle' ? 'block' : 'none';
    document.getElementById('sourceDatabricksFields').style.display = dbType === 'databricks' ? 'block' : 'none';
    document.getElementById('sourceSnowflakeFields').style.display = dbType === 'snowflake' ? 'block' : 'none';
}

// Switch target database type  
function switchTargetDbType() {
    const dbType = document.getElementById('targetDbType').value;
    document.getElementById('targetOracleFields').style.display = dbType === 'oracle' ? 'block' : 'none';
    document.getElementById('targetDatabricksFields').style.display = dbType === 'databricks' ? 'block' : 'none';
    document.getElementById('targetSnowflakeFields').style.display = dbType === 'snowflake' ? 'block' : 'none';
}

// Toggle SSO for Source Databricks
function toggleSourceDatabricksAuth() {
    const useAzureAD = document.getElementById('sourceUseAzureAD').checked;
    const tokenField = document.getElementById('sourceTokenField');
    tokenField.style.display = useAzureAD ? 'none' : 'block';
}

// Toggle SSO for Source Snowflake
function toggleSourceSnowflakeAuth() {
    const useSSO = document.getElementById('sourceUseSSO').checked;
    const passwordField = document.getElementById('sourcePasswordField');
    const warehouseField = document.getElementById('sourceWarehouseField');
    const databaseField = document.getElementById('sourceDatabaseField');
    
    passwordField.style.display = useSSO ? 'none' : 'block';
    warehouseField.style.display = useSSO ? 'block' : 'none';
    databaseField.style.display = useSSO ? 'block' : 'none';
}

// Toggle SSO for Target Databricks
function toggleTargetDatabricksAuth() {
    const useAzureAD = document.getElementById('targetUseAzureAD').checked;
    const tokenField = document.getElementById('targetTokenField');
    tokenField.style.display = useAzureAD ? 'none' : 'block';
}

// Toggle SSO for Target Snowflake
function toggleTargetSnowflakeAuth() {
    const useSSO = document.getElementById('targetUseSSO').checked;
    const passwordField = document.getElementById('targetPasswordField');
    const warehouseField = document.getElementById('targetWarehouseField');
    const databaseField = document.getElementById('targetDatabaseField');
    
    passwordField.style.display = useSSO ? 'none' : 'block';
    warehouseField.style.display = useSSO ? 'block' : 'none';
    databaseField.style.display = useSSO ? 'block' : 'none';
}

// Connect to Source Database
async function connectSourceDb() {
    const dbType = document.getElementById('sourceDbType').value;
    const statusDiv = document.getElementById('sourceStatus');
    const btn = document.getElementById('sourceConnectBtn');
    
    statusDiv.textContent = 'Connecting...';
    statusDiv.className = 'connection-status connecting';
    btn.disabled = true;
    
    let credentials = { db_type: dbType, connection_name: 'source' };
    
    if (dbType === 'oracle') {
        credentials.username = document.getElementById('sourceUsername').value.trim();
        credentials.password = document.getElementById('sourcePassword').value;
        credentials.dsn = document.getElementById('sourceDsn').value.trim();
    } else if (dbType === 'databricks') {
        credentials.server_hostname = document.getElementById('sourceServerHostname').value.trim();
        credentials.http_path = document.getElementById('sourceHttpPath').value.trim();
        
        const useAzureAD = document.getElementById('sourceUseAzureAD').checked;
        if (useAzureAD) {
            credentials.authenticator = 'azuread';
            statusDiv.textContent = 'Opening browser for Azure AD authentication...';
        } else {
            credentials.access_token = document.getElementById('sourceAccessToken').value.trim();
        }
    } else if (dbType === 'snowflake') {
        credentials.username = document.getElementById('sourceSnowflakeUsername').value.trim();
        credentials.account = document.getElementById('sourceAccount').value.trim();
        
        const useSSO = document.getElementById('sourceUseSSO').checked;
        if (useSSO) {
            credentials.authenticator = 'externalbrowser';
            const warehouse = document.getElementById('sourceWarehouse').value.trim();
            const database = document.getElementById('sourceDatabase').value.trim();
            if (warehouse) credentials.warehouse = warehouse;
            if (database) credentials.database = database;
            statusDiv.textContent = 'Opening browser for SSO authentication...';
        } else {
            credentials.password = document.getElementById('sourceSnowflakePassword').value;
        }
    }
    
    try {
        const response = await fetch('/api/dual-login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
        });
        
        const data = await response.json();
        
        if (data.success) {
            sourceConnected = true;
            sourceSessionId = data.session_id;
            sourceDbType = dbType;
            statusDiv.textContent = `✓ Connected to ${dbType.toUpperCase()}`;
            statusDiv.className = 'connection-status success';
            document.querySelector('.db-connection-card').classList.add('connected');
            checkBothConnections();
        } else {
            statusDiv.textContent = `✗ ${data.error}`;
            statusDiv.className = 'connection-status error';
            btn.disabled = false;
        }
    } catch (error) {
        statusDiv.textContent = `✗ Connection failed: ${error.message}`;
        statusDiv.className = 'connection-status error';
        btn.disabled = false;
    }
}

// Connect to Target Database
async function connectTargetDb() {
    const dbType = document.getElementById('targetDbType').value;
    const statusDiv = document.getElementById('targetStatus');
    const btn = document.getElementById('targetConnectBtn');
    
    statusDiv.textContent = 'Connecting...';
    statusDiv.className = 'connection-status connecting';
    btn.disabled = true;
    
    let credentials = { db_type: dbType, connection_name: 'target' };
    
    if (dbType === 'oracle') {
        credentials.username = document.getElementById('targetUsername').value.trim();
        credentials.password = document.getElementById('targetPassword').value;
        credentials.dsn = document.getElementById('targetDsn').value.trim();
    } else if (dbType === 'databricks') {
        credentials.server_hostname = document.getElementById('targetServerHostname').value.trim();
        credentials.http_path = document.getElementById('targetHttpPath').value.trim();
        
        const useAzureAD = document.getElementById('targetUseAzureAD').checked;
        if (useAzureAD) {
            credentials.authenticator = 'azuread';
            statusDiv.textContent = 'Opening browser for Azure AD authentication...';
        } else {
            credentials.access_token = document.getElementById('targetAccessToken').value.trim();
        }
    } else if (dbType === 'snowflake') {
        credentials.username = document.getElementById('targetSnowflakeUsername').value.trim();
        credentials.account = document.getElementById('targetAccount').value.trim();
        
        const useSSO = document.getElementById('targetUseSSO').checked;
        if (useSSO) {
            credentials.authenticator = 'externalbrowser';
            const warehouse = document.getElementById('targetWarehouse').value.trim();
            const database = document.getElementById('targetDatabase').value.trim();
            if (warehouse) credentials.warehouse = warehouse;
            if (database) credentials.database = database;
            statusDiv.textContent = 'Opening browser for SSO authentication...';
        } else {
            credentials.password = document.getElementById('targetSnowflakePassword').value;
        }
    }
    
    try {
        const response = await fetch('/api/dual-login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
        });
        
        const data = await response.json();
        
        if (data.success) {
            targetConnected = true;
            targetSessionId = data.session_id;
            targetDbType = dbType;
            statusDiv.textContent = `✓ Connected to ${dbType.toUpperCase()}`;
            statusDiv.className = 'connection-status success';
            document.querySelectorAll('.db-connection-card')[1].classList.add('connected');
            checkBothConnections();
        } else {
            statusDiv.textContent = `✗ ${data.error}`;
            statusDiv.className = 'connection-status error';
            btn.disabled = false;
        }
    } catch (error) {
        statusDiv.textContent = `✗ Connection failed: ${error.message}`;
        statusDiv.className = 'connection-status error';
        btn.disabled = false;
    }
}

// Check if both databases are connected
function checkBothConnections() {
    if (sourceConnected && targetConnected) {
        // Both databases connected - show comparison section
        // Note: Cross-database query comparisons are now supported (Oracle to Databricks, etc.)
        const comparisonSection = document.getElementById('comparisonSection');
        
        // Reset any previous error messages and restore the comparison form
        if (comparisonSection.innerHTML.includes('Database Type Mismatch')) {
            // Reload the page to restore the original comparison section
            location.reload();
            return;
        }
        
        comparisonSection.style.display = 'block';
        comparisonSection.scrollIntoView({ behavior: 'smooth' });
        
        // Show info banner if databases are different types
        if (sourceDbType !== targetDbType) {
            const infoBanner = document.createElement('div');
            infoBanner.style.cssText = `
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                color: white; 
                padding: 15px; 
                border-radius: 8px; 
                margin-bottom: 20px; 
                text-align: center;
                box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
            `;
            infoBanner.innerHTML = `
                <p style="margin: 0; font-size: 1em;">
                    ℹ️ <strong>Cross-Database Query Comparison:</strong> 
                    ${sourceDbType.toUpperCase()} ➜ ${targetDbType.toUpperCase()}
                </p>
            `;
            
            // Insert banner at the top of comparison section if not already present
            const card = comparisonSection.querySelector('.card');
            if (card && !card.querySelector('.cross-db-banner')) {
                infoBanner.className = 'cross-db-banner';
                card.insertBefore(infoBanner, card.firstChild);
            }
        }
    }
}

// Compare Query Data
async function compareQueryData() {
    const sourceQuery = document.getElementById('sourceQuery').value.trim();
    const targetQuery = document.getElementById('targetQuery').value.trim();
    
    const loadingDiv = document.getElementById('queryLoading');
    const resultsDiv = document.getElementById('queryResults');
    const resultsContent = document.getElementById('queryResultsContent');
    const errorDiv = document.getElementById('queryError');
    
    resultsDiv.style.display = 'none';
    errorDiv.style.display = 'none';
    
    if (!sourceQuery || !targetQuery) {
        errorDiv.textContent = 'Please enter both source and target SQL queries.';
        errorDiv.style.display = 'block';
        return;
    }
    
    loadingDiv.style.display = 'block';
    
    try {
        const response = await fetch('/api/compare-query-dual', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                source_session: sourceSessionId,
                target_session: targetSessionId,
                source_query: sourceQuery,
                target_query: targetQuery
            })
        });
        
        const data = await response.json();
        loadingDiv.style.display = 'none';
        
        if (data.success) {
            comparisonData = data;
            displayQueryResults(data);
            document.getElementById('exportQueryBtn').disabled = false;
        } else {
            errorDiv.textContent = `Error: ${data.error}`;
            errorDiv.style.display = 'block';
        }
    } catch (error) {
        loadingDiv.style.display = 'none';
        errorDiv.textContent = `Error: ${error.message}`;
        errorDiv.style.display = 'block';
    }
}

// Display query comparison results - ENHANCED VERSION
function displayQueryResults(data) {
    const resultsContent = document.getElementById('queryResultsContent');
    const summary = data.summary;
    const diffs = data.differences;
    
    let html = `
        <div class="comparison-summary">
            <h3>📊 Comparison Summary</h3>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 15px 0;">
                <div><strong>Source Rows:</strong> ${summary.source_rows}</div>
                <div><strong>Target Rows:</strong> ${summary.target_rows}</div>
                <div><strong>Source Columns:</strong> ${summary.source_columns}</div>
                <div><strong>Target Columns:</strong> ${summary.target_columns}</div>
                <div><strong>Matching Rows:</strong> ${summary.matching_rows}</div>
                <div><strong>Total Differences:</strong> <span style="color: ${summary.total_differences > 0 ? '#d32f2f' : '#2e7d32'}; font-weight: bold;">${summary.total_differences}</span></div>
            </div>
        </div>
    `;
    
    // Column Structure Differences
    if (diffs.column_structure && diffs.column_structure.length > 0) {
        html += `
            <div class="diff-section" style="margin-top: 20px;">
                <h4 style="color: #d32f2f;">⚠️ Column Structure Differences (${diffs.column_structure.length})</h4>
                <table class="diff-table">
                    <thead>
                        <tr>
                            <th>Issue Type</th>
                            <th>Column Name</th>
                            <th>Details</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        diffs.column_structure.forEach(diff => {
            html += `
                <tr style="background-color: #ffebee;">
                    <td><strong>${diff.type.replace(/_/g, ' ')}</strong></td>
                    <td>${diff.column_name || 'N/A'}</td>
                    <td>${diff.message}</td>
                </tr>
            `;
        });
        html += `</tbody></table></div>`;
    }
    
    // Row Count Difference
    if (summary.has_row_count_difference) {
        html += `
            <div class="diff-section" style="margin-top: 20px;">
                <h4 style="color: #f57c00;">⚠️ Row Count Mismatch</h4>
                <p style="background: #fff3e0; padding: 10px; border-left: 4px solid #f57c00;">
                    <strong>Source:</strong> ${summary.source_rows} rows<br>
                    <strong>Target:</strong> ${summary.target_rows} rows<br>
                    <strong>Difference:</strong> ${Math.abs(summary.source_rows - summary.target_rows)} rows
                </p>
            </div>
        `;
    }
    
    // Rows only in Source
    if (diffs.rows_only_in_source && diffs.rows_only_in_source.length > 0) {
        html += `
            <div class="diff-section" style="margin-top: 20px;">
                <h4 style="color: #d32f2f;">🔴 Rows Only in Source (${diffs.rows_only_in_source.length})</h4>
                <p style="background: #ffebee; padding: 10px;">
                    Row numbers: ${diffs.rows_only_in_source.slice(0, 20).join(', ')}
                    ${diffs.rows_only_in_source.length > 20 ? ` ... and ${diffs.rows_only_in_source.length - 20} more` : ''}
                </p>
            </div>
        `;
    }
    
    // Rows only in Target
    if (diffs.rows_only_in_target && diffs.rows_only_in_target.length > 0) {
        html += `
            <div class="diff-section" style="margin-top: 20px;">
                <h4 style="color: #d32f2f;">🔴 Rows Only in Target (${diffs.rows_only_in_target.length})</h4>
                <p style="background: #ffebee; padding: 10px;">
                    Row numbers: ${diffs.rows_only_in_target.slice(0, 20).join(', ')}
                    ${diffs.rows_only_in_target.length > 20 ? ` ... and ${diffs.rows_only_in_target.length - 20} more` : ''}
                </p>
            </div>
        `;
    }
    
    // Value Differences
    if (diffs.row_differences && diffs.row_differences.length > 0) {
        html += `
            <div class="diff-section" style="margin-top: 20px;">
                <h4 style="color: #d32f2f;">📝 Value Differences (showing first 100 of ${diffs.row_differences.length})</h4>
                <table class="diff-table">
                    <thead>
                        <tr>
                            <th>Row #</th>
                            <th>Column</th>
                            <th>Source Value</th>
                            <th>Target Value</th>
                            <th>Type</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        diffs.row_differences.slice(0, 100).forEach(diff => {
            let bgColor = '#fff3e0'; // Default yellow
            if (diff.diff_type === 'column_missing') {
                bgColor = '#ffebee'; // Red for missing columns
            }
            html += `
                <tr style="background-color: ${bgColor};">
                    <td>${diff.row_number}</td>
                    <td><strong>${diff.column_name}</strong></td>
                    <td>${diff.source_value}</td>
                    <td>${diff.target_value}</td>
                    <td>${diff.diff_type.replace(/_/g, ' ')}</td>
                </tr>
            `;
        });
        html += `</tbody></table></div>`;
    }
    
    // Success message if identical
    if (summary.total_differences === 0) {
        html = `
            <div class="success-message" style="background: #e8f5e9; padding: 30px; border-radius: 8px; border-left: 4px solid #4caf50;">
                <h3 style="color: #2e7d32; margin: 0;">✅ Query results are identical!</h3>
                <p style="margin: 10px 0 0 0; color: #555;">
                    Both queries returned the same structure and data:<br>
                    • Same columns (${summary.source_columns})<br>
                    • Same row count (${summary.source_rows})<br>
                    • All values match
                </p>
            </div>
        `;
    }
    
    resultsContent.innerHTML = html;
    document.getElementById('queryResults').style.display = 'block';
}

// Export query comparison
async function exportQueryComparison() {
    if (!comparisonData) return;
    
    try {
        const response = await fetch('/api/export-query-comparison', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(comparisonData)
        });
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `query_comparison_${new Date().getTime()}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    } catch (error) {
        alert(`Export failed: ${error.message}`);
    }
}

// Reset all fields and connections
function resetAllFields() {
    if (confirm('Are you sure you want to reset all fields and disconnect from databases?')) {
        // Reset connection state
        sourceConnected = false;
        targetConnected = false;
        sourceSessionId = null;
        targetSessionId = null;
        sourceDbType = null;
        targetDbType = null;
        comparisonData = null;
        
        // Clear all Oracle fields
        document.getElementById('sourceUsername').value = '';
        document.getElementById('sourcePassword').value = '';
        document.getElementById('sourceDsn').value = '';
        document.getElementById('targetUsername').value = '';
        document.getElementById('targetPassword').value = '';
        document.getElementById('targetDsn').value = '';
        
        // Clear all Databricks fields
        document.getElementById('sourceServerHostname').value = '';
        document.getElementById('sourceHttpPath').value = '';
        document.getElementById('sourceAccessToken').value = '';
        document.getElementById('targetServerHostname').value = '';
        document.getElementById('targetHttpPath').value = '';
        document.getElementById('targetAccessToken').value = '';
        
        // Clear all Snowflake fields
        document.getElementById('sourceSnowflakeUsername').value = '';
        document.getElementById('sourceSnowflakePassword').value = '';
        document.getElementById('sourceAccount').value = '';
        document.getElementById('sourceWarehouse').value = '';
        document.getElementById('sourceDatabase').value = '';
        document.getElementById('targetSnowflakeUsername').value = '';
        document.getElementById('targetSnowflakePassword').value = '';
        document.getElementById('targetAccount').value = '';
        document.getElementById('targetWarehouse').value = '';
        document.getElementById('targetDatabase').value = '';
        
        // Clear query fields
        document.getElementById('sourceQuery').value = '';
        document.getElementById('targetQuery').value = '';
        
        // Uncheck authentication checkboxes
        document.getElementById('sourceUseAzureAD').checked = false;
        document.getElementById('sourceUseSSO').checked = false;
        document.getElementById('targetUseAzureAD').checked = false;
        document.getElementById('targetUseSSO').checked = false;
        
        // Reset database type selectors to Oracle
        document.getElementById('sourceDbType').value = 'oracle';
        document.getElementById('targetDbType').value = 'oracle';
        switchSourceDbType();
        switchTargetDbType();
        
        // Clear status messages
        document.getElementById('sourceStatus').textContent = '';
        document.getElementById('sourceStatus').className = 'connection-status';
        document.getElementById('targetStatus').textContent = '';
        document.getElementById('targetStatus').className = 'connection-status';
        
        // Remove connected class from cards
        document.querySelectorAll('.db-connection-card').forEach(card => {
            card.classList.remove('connected');
        });
        
        // Re-enable connect buttons
        document.getElementById('sourceConnectBtn').disabled = false;
        document.getElementById('targetConnectBtn').disabled = false;
        
        // Hide comparison section
        document.getElementById('comparisonSection').style.display = 'none';
        
        // Hide results and errors
        document.getElementById('queryResults').style.display = 'none';
        document.getElementById('queryError').style.display = 'none';
        document.getElementById('queryLoading').style.display = 'none';
        
        // Disable export button
        document.getElementById('exportQueryBtn').disabled = true;
        
        // Show success message
        const successMsg = document.createElement('div');
        successMsg.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px 25px;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
        `;
        successMsg.innerHTML = '✓ All fields have been reset';
        document.body.appendChild(successMsg);
        
        setTimeout(() => {
            successMsg.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => successMsg.remove(), 300);
        }, 2000);
    }
}
