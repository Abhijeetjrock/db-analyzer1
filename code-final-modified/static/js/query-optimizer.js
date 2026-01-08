/**
 * SQL Query Optimizer - Client-side Logic
 */

// Global variable to store current optimization result for export
let currentOptimizationResult = null;

async function optimizeQuery() {
    const originalQuery = document.getElementById('originalQuery').value.trim();
    const dbType = document.getElementById('dbType').value;
    
    if (!originalQuery) {
        showError('Please enter a SQL query to optimize');
        return;
    }
    
    // Get optimization options
    const options = {
        hints: document.getElementById('optHints').checked,
        joins: document.getElementById('optJoins').checked,
        indexes: document.getElementById('optIndexes').checked,
        subqueries: document.getElementById('optSubqueries').checked,
        bestPractices: document.getElementById('optBestPractices').checked
    };
    
    // Get AI usage option (check if checkbox exists)
    const useAiCheckbox = document.getElementById('useAI');
    const useAI = useAiCheckbox ? useAiCheckbox.checked : true;
    
    // Show loading
    document.getElementById('loading').style.display = 'block';
    document.getElementById('results').style.display = 'none';
    document.getElementById('error').style.display = 'none';
    
    try {
        const response = await fetch('/api/optimize-query', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                query: originalQuery,
                db_type: dbType,
                options: options,
                use_ai: useAI
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Store result for export
            currentOptimizationResult = data;
            displayResults(data, originalQuery);
        } else {
            showError(data.error || 'Failed to optimize query');
        }
    } catch (error) {
        showError('Error: ' + error.message);
    } finally {
        document.getElementById('loading').style.display = 'none';
    }
}

function displayResults(data, originalQuery) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.style.display = 'block';
    
    // Show AI indicator if AI was used
    const aiIndicator = data.ai_used ? 
        `<div class="summary-item" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
            <strong>🤖 AI-Powered Optimization</strong><br>
            <small>Provider: ${data.ai_provider ? data.ai_provider.toUpperCase() : 'AI Model'}</small>
        </div>` : '';
    
    const aiWarning = !data.ai_available ? 
        `<div class="summary-item warning">
            <strong>⚠️ AI Not Available</strong><br>
            <small>Using rule-based optimization</small>
        </div>` : '';
    
    // Display summary
    const summaryDiv = document.getElementById('optimizationSummary');
    summaryDiv.innerHTML = `
        <h4>📈 Optimization Summary</h4>
        <div class="summary-grid">
            <div class="summary-item success">
                <strong>Optimizations Applied:</strong> ${data.optimizations_count || 0}
            </div>
            <div class="summary-item ${data.estimated_improvement > 20 ? 'success' : 'warning'}">
                <strong>Estimated Improvement:</strong> ${typeof data.estimated_improvement === 'number' ? data.estimated_improvement + '%' : data.estimated_improvement}
            </div>
            <div class="summary-item">
                <strong>Database Type:</strong> ${data.db_type.toUpperCase()}
            </div>
            <div class="summary-item">
                <strong>Query Complexity:</strong> ${data.complexity || 'Medium'}
            </div>
            ${aiIndicator}
            ${aiWarning}
        </div>
    `;
    
    // Display optimized query
    document.getElementById('optimizedQuery').textContent = data.optimized_query;
    
    // Display suggestions
    const suggestionsDiv = document.getElementById('suggestions');
    if (data.suggestions && data.suggestions.length > 0) {
        suggestionsDiv.innerHTML = data.suggestions.map((suggestion, index) => `
            <div style="background: ${getSuggestionColor(suggestion.priority)}; padding: 15px; border-radius: 6px; margin-bottom: 10px; border-left: 4px solid ${getSuggestionBorderColor(suggestion.priority)};">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                    <span style="font-size: 20px;">${getSuggestionIcon(suggestion.priority)}</span>
                    <strong style="font-size: 16px;">${suggestion.title}</strong>
                    <span style="margin-left: auto; background: white; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: bold; color: ${getSuggestionBorderColor(suggestion.priority)};">
                        ${suggestion.priority.toUpperCase()}
                    </span>
                </div>
                <div style="color: #495057; margin-bottom: 8px;">${suggestion.description}</div>
                ${suggestion.example ? `<div style="background: white; padding: 10px; border-radius: 4px; margin-top: 8px; font-family: 'Consolas', monospace; font-size: 13px;">${suggestion.example}</div>` : ''}
            </div>
        `).join('');
    } else {
        suggestionsDiv.innerHTML = '<p style="color: #28a745;">✅ No major issues found. Your query is already well-optimized!</p>';
    }
    
    // Display improvements
    const improvementsDiv = document.getElementById('improvements');
    if (data.improvements && data.improvements.length > 0) {
        improvementsDiv.innerHTML = `
            <ul style="list-style: none; padding: 0;">
                ${data.improvements.map(improvement => `
                    <li style="padding: 12px; background: #e8f5e9; margin-bottom: 8px; border-radius: 6px; border-left: 4px solid #4caf50;">
                        <strong style="color: #2e7d32;">✓ ${improvement.title}</strong><br>
                        <span style="color: #495057; font-size: 14px;">${improvement.description}</span>
                        ${improvement.impact ? `<br><small style="color: #666; font-style: italic;">Expected impact: ${improvement.impact}</small>` : ''}
                    </li>
                `).join('')}
            </ul>
        `;
    } else {
        improvementsDiv.innerHTML = '<p>No specific performance improvements identified.</p>';
    }
    
    // Display index recommendations
    if (data.index_recommendations && data.index_recommendations.length > 0) {
        document.getElementById('indexSection').style.display = 'block';
        const indexDiv = document.getElementById('indexRecommendations');
        indexDiv.innerHTML = `
            <div class="diff-table" style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background: #f5f5f5;">
                            <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Table</th>
                            <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Column(s)</th>
                            <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Index Type</th>
                            <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Reason</th>
                            <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">DDL Statement</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.index_recommendations.map(idx => `
                            <tr>
                                <td style="padding: 10px; border-bottom: 1px solid #eee;">${idx.table}</td>
                                <td style="padding: 10px; border-bottom: 1px solid #eee;"><code>${idx.columns}</code></td>
                                <td style="padding: 10px; border-bottom: 1px solid #eee;">${idx.type}</td>
                                <td style="padding: 10px; border-bottom: 1px solid #eee;">${idx.reason}</td>
                                <td style="padding: 10px; border-bottom: 1px solid #eee;">
                                    <code style="background: #f8f9fa; padding: 4px 8px; border-radius: 4px; font-size: 12px;">${idx.ddl}</code>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } else {
        document.getElementById('indexSection').style.display = 'none';
    }
    
    // Display comparison
    document.getElementById('originalQueryDisplay').textContent = originalQuery;
    document.getElementById('optimizedQueryDisplay').textContent = data.optimized_query;
    
    // Scroll to results
    resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function getSuggestionIcon(priority) {
    const icons = {
        high: '🔴',
        medium: '🟡',
        low: '🟢',
        info: 'ℹ️'
    };
    return icons[priority] || icons.info;
}

function getSuggestionColor(priority) {
    const colors = {
        high: '#ffebee',
        medium: '#fff3e0',
        low: '#e8f5e9',
        info: '#e3f2fd'
    };
    return colors[priority] || colors.info;
}

function getSuggestionBorderColor(priority) {
    const colors = {
        high: '#f44336',
        medium: '#ff9800',
        low: '#4caf50',
        info: '#2196f3'
    };
    return colors[priority] || colors.info;
}

function copyOptimizedQuery() {
    const optimizedQuery = document.getElementById('optimizedQuery').textContent;
    
    navigator.clipboard.writeText(optimizedQuery).then(() => {
        // Show success notification
        const notification = document.createElement('div');
        notification.className = 'success-toast';
        notification.textContent = 'Optimized query copied to clipboard!';
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('hiding');
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }).catch(err => {
        showError('Failed to copy: ' + err.message);
    });
}

async function exportOptimizedQueryToTXT() {
    if (!currentOptimizationResult) {
        showError('No optimization result to export. Please optimize a query first.');
        return;
    }
    
    try {
        const response = await fetch('/api/export-optimized-query', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(currentOptimizationResult)
        });
        
        if (!response.ok) {
            throw new Error('Export failed');
        }
        
        // Get the file
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        
        // Get filename from response header or generate one
        const contentDisposition = response.headers.get('content-disposition');
        let filename = `optimized_query_${currentOptimizationResult.db_type}_${new Date().toISOString().slice(0,10)}.txt`;
        if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
            if (filenameMatch && filenameMatch[1]) {
                filename = filenameMatch[1].replace(/['"]/g, '');
            }
        }
        
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        // Show success notification
        const notification = document.createElement('div');
        notification.className = 'success-toast';
        notification.textContent = `✅ Optimized query exported to ${filename}`;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('hiding');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
        
    } catch (error) {
        showError('Export failed: ' + error.message);
    }
}

function analyzeExecutionPlan() {
    showError('Execution plan analysis is coming soon!');
}

function showError(message) {
    const errorDiv = document.getElementById('error');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}
