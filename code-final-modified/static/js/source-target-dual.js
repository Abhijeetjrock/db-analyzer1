// Source-Target Dual Database Connection
let sourceConnected = false;
let targetConnected = false;
let sourceSessionId = null;
let targetSessionId = null;
let sourceDbType = null;
let targetDbType = null;

// Switch database type for source
function switchSourceDbType() {
    const dbType = document.getElementById('sourceDbType').value;
    
    document.getElementById('sourceOracleFields').style.display = 'none';
    document.getElementById('sourceDatabricksFields').style.display = 'none';
    document.getElementById('sourceSnowflakeFields').style.display = 'none';
    
    if (dbType === 'oracle') {
        document.getElementById('sourceOracleFields').style.display = 'block';
    } else if (dbType === 'databricks') {
        document.getElementById('sourceDatabricksFields').style.display = 'block';
    } else if (dbType === 'snowflake') {
        document.getElementById('sourceSnowflakeFields').style.display = 'block';
    }
}

// Switch database type for target
function switchTargetDbType() {
    const dbType = document.getElementById('targetDbType').value;
    
    document.getElementById('targetOracleFields').style.display = 'none';
    document.getElementById('targetDatabricksFields').style.display = 'none';
    document.getElementById('targetSnowflakeFields').style.display = 'none';
    
    if (dbType === 'oracle') {
        document.getElementById('targetOracleFields').style.display = 'block';
    } else if (dbType === 'databricks') {
        document.getElementById('targetDatabricksFields').style.display = 'block';
    } else if (dbType === 'snowflake') {
        document.getElementById('targetSnowflakeFields').style.display = 'block';
    }
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
        const comparisonSection = document.getElementById('comparisonSection');
        
        // VALIDATION: Check if both databases are of the same type
        if (sourceDbType !== targetDbType) {
            // Show error message - databases must be of the same type
            comparisonSection.style.display = 'block';
            comparisonSection.innerHTML = `
                <div class="card">
                    <div style="
                        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                        color: white;
                        padding: 30px;
                        border-radius: 12px;
                        text-align: center;
                        box-shadow: 0 8px 25px rgba(245, 87, 108, 0.4);
                    ">
                        <h2 style="margin: 0 0 15px 0; font-size: 24px;">
                            ⚠️ Database Type Mismatch
                        </h2>
                        <p style="font-size: 18px; margin: 10px 0; line-height: 1.6;">
                            <strong>Source Database:</strong> ${sourceDbType.toUpperCase()}<br>
                            <strong>Target Database:</strong> ${targetDbType.toUpperCase()}
                        </p>
                        <p style="font-size: 16px; margin: 20px 0 0 0; opacity: 0.95;">
                            Cross-database comparisons are not supported.<br>
                            Both source and target databases must be of the same type.
                        </p>
                        <p style="font-size: 14px; margin: 15px 0 0 0; opacity: 0.85;">
                            Please disconnect and reconnect with matching database types.
                        </p>
                    </div>
                </div>
            `;
            comparisonSection.scrollIntoView({ behavior: 'smooth' });
            return;
        }
        
        // Reset any previous error messages and restore the comparison form
        if (comparisonSection.innerHTML.includes('Database Type Mismatch')) {
            // Reload the page to restore the original comparison section
            location.reload();
            return;
        }
        
        // Both databases are the same type - show comparison section
        comparisonSection.style.display = 'block';
        comparisonSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// Compare Source and Target Tables
async function compareSourceTarget() {
    const sourceTable = document.getElementById('sourceTableName').value.trim();
    const sourceSchema = document.getElementById('sourceSchema').value.trim();
    const targetTable = document.getElementById('targetTableName').value.trim();
    const targetSchema = document.getElementById('targetSchema').value.trim();
    
    const loadingDiv = document.getElementById('stLoading');
    const resultsDiv = document.getElementById('stResults');
    const resultsContent = document.getElementById('stResultsContent');
    const errorDiv = document.getElementById('stError');
    
    // Hide previous results
    resultsDiv.style.display = 'none';
    errorDiv.style.display = 'none';
    
    if (!sourceTable || !targetTable) {
        errorDiv.textContent = 'Please enter both source and target table names.';
        errorDiv.style.display = 'block';
        return;
    }
    
    loadingDiv.style.display = 'block';
    
    try {
        const response = await fetch('/api/compare-source-target-dual', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                source_session: sourceSessionId,
                target_session: targetSessionId,
                source: {
                    table: sourceTable,
                    schema: sourceSchema
                },
                target: {
                    table: targetTable,
                    schema: targetSchema
                },
                options: {
                    structure: document.getElementById('compareStructure').checked,
                    rowCount: document.getElementById('compareRowCount').checked,
                    indexes: document.getElementById('compareIndexes').checked,
                    constraints: document.getElementById('compareConstraints').checked
                }
            })
        });
        
        const data = await response.json();
        loadingDiv.style.display = 'none';
        
        if (data.success) {
            displayComparisonResults(data);
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

// Display comparison results
function displayComparisonResults(data) {
    const resultsContent = document.getElementById('stResultsContent');
    const diffs = data.differences;
    
    let html = `
        <div class="comparison-summary">
            <h3>Summary</h3>
            <p><strong>Source:</strong> ${data.source_table}</p>
            <p><strong>Target:</strong> ${data.target_table}</p>
            <p><strong>Total Differences:</strong> ${diffs.total_count}</p>
        </div>
    `;
    
    // Structure differences
    if (diffs.structure && diffs.structure.length > 0) {
        html += `
            <div class="diff-section">
                <h4>Structure Differences (${diffs.structure.length})</h4>
                <table class="diff-table">
                    <thead>
                        <tr>
                            <th>Column</th>
                            <th>Difference Type</th>
                            <th>Source</th>
                            <th>Target</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        diffs.structure.forEach(diff => {
            html += `
                <tr class="${diff.type}">
                    <td>${diff.column_name}</td>
                    <td>${diff.diff_type}</td>
                    <td>${diff.source_value || 'N/A'}</td>
                    <td>${diff.target_value || 'N/A'}</td>
                </tr>
            `;
        });
        html += `</tbody></table></div>`;
    }
    
    // Row count difference
    if (diffs.row_count && diffs.row_count.different) {
        html += `
            <div class="diff-section">
                <h4>Row Count Difference</h4>
                <p><strong>Source:</strong> ${diffs.row_count.source} rows</p>
                <p><strong>Target:</strong> ${diffs.row_count.target} rows</p>
                <p><strong>Difference:</strong> ${diffs.row_count.difference} rows</p>
            </div>
        `;
    }
    
    // Index differences
    if (diffs.indexes && diffs.indexes.length > 0) {
        html += `
            <div class="diff-section">
                <h4>Index Differences (${diffs.indexes.length})</h4>
                <table class="diff-table">
                    <thead>
                        <tr>
                            <th>Index Name</th>
                            <th>Type</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        diffs.indexes.forEach(diff => {
            const statusClass = diff.status === 'missing_in_target' ? 'removed' : 'added';
            html += `
                <tr class="${statusClass}">
                    <td>${diff.index_name}</td>
                    <td>${diff.diff_type}</td>
                    <td>${diff.status.replace(/_/g, ' ').toUpperCase()}</td>
                </tr>
            `;
        });
        html += `</tbody></table></div>`;
    }
    
    // Constraint differences
    if (diffs.constraints && diffs.constraints.length > 0) {
        html += `
            <div class="diff-section">
                <h4>Constraint Differences (${diffs.constraints.length})</h4>
                <table class="diff-table">
                    <thead>
                        <tr>
                            <th>Constraint Name</th>
                            <th>Type</th>
                            <th>Source Value</th>
                            <th>Target Value</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        diffs.constraints.forEach(diff => {
            let statusClass = 'modified';
            if (diff.status === 'missing_in_target') statusClass = 'removed';
            if (diff.status === 'missing_in_source') statusClass = 'added';
            
            html += `
                <tr class="${statusClass}">
                    <td>${diff.constraint_name}</td>
                    <td>${diff.constraint_type}</td>
                    <td>${diff.source_value || 'N/A'}</td>
                    <td>${diff.target_value || 'N/A'}</td>
                    <td>${diff.status.replace(/_/g, ' ').toUpperCase()}</td>
                </tr>
            `;
        });
        html += `</tbody></table></div>`;
    }
    
    if (diffs.total_count === 0) {
        html = '<div class="success-message"><h3>✅ Tables are identical!</h3></div>';
    }
    
    resultsContent.innerHTML = html;
    document.getElementById('stResults').style.display = 'block';
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
        
        // Clear table comparison fields
        document.getElementById('sourceTableName').value = '';
        document.getElementById('sourceSchema').value = '';
        document.getElementById('targetTableName').value = '';
        document.getElementById('targetSchema').value = '';
        
        // Reset checkboxes to default
        document.getElementById('compareStructure').checked = true;
        document.getElementById('compareRowCount').checked = true;
        document.getElementById('compareIndexes').checked = false;
        document.getElementById('compareConstraints').checked = false;
        
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
        document.getElementById('stResults').style.display = 'none';
        document.getElementById('stError').style.display = 'none';
        document.getElementById('stLoading').style.display = 'none';
        
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
