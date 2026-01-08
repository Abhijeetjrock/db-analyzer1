// Compare Files - No authentication required
// This page doesn't need database login, so we skip the auth check

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

async function compareFiles() {
    const file1 = document.getElementById('file1').files[0];
    const file2 = document.getElementById('file2').files[0];
    
    const loadingDiv = document.getElementById('compareLoading');
    const resultsDiv = document.getElementById('compareResults');
    const errorDiv = document.getElementById('compareError');
    
    // Hide previous results
    resultsDiv.style.display = 'none';
    errorDiv.style.display = 'none';
    
    if (!file1 || !file2) {
        errorDiv.textContent = 'Please select both files to compare.';
        errorDiv.style.display = 'block';
        return;
    }
    
    // Show loading
    loadingDiv.style.display = 'block';
    
    try {
        const formData = new FormData();
        formData.append('file1', file1);
        formData.append('file2', file2);
        
        const response = await fetch('/api/compare', {
            method: 'POST',
            body: formData
        });
        
        loadingDiv.style.display = 'none';
        
        if (response.ok) {
            // Check if files are identical
            const contentType = response.headers.get('content-type');
            
            if (contentType && contentType.includes('application/json')) {
                // Files are identical
                const data = await response.json();
                resultsDiv.innerHTML = `
                    <div class="success-message">
                        <h3>✅ ${data.message}</h3>
                        <p>The two files have identical content.</p>
                    </div>
                `;
                resultsDiv.style.display = 'block';
            } else {
                // Files have differences - download result
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `comparison_result_${new Date().getTime()}.xlsx`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                
                resultsDiv.innerHTML = `
                    <div class="success-message">
                        <h3>✅ Comparison Complete</h3>
                        <p>Differences found! The comparison report has been downloaded.</p>
                        <p>Check your downloads folder for the Excel file.</p>
                    </div>
                `;
                resultsDiv.style.display = 'block';
            }
        } else {
            const data = await response.json();
            errorDiv.textContent = `Error: ${data.error || 'Comparison failed'}`;
            errorDiv.style.display = 'block';
        }
    } catch (error) {
        loadingDiv.style.display = 'none';
        errorDiv.textContent = `Error: ${error.message}`;
        errorDiv.style.display = 'block';
        console.error('Comparison error:', error);
    }
}

// Reset all fields
function resetFields() {
    if (confirm('Are you sure you want to reset all fields and clear results?')) {
        // Clear file inputs
        document.getElementById('file1').value = '';
        document.getElementById('file2').value = '';
        
        // Clear file name displays
        document.getElementById('file1Name').textContent = '';
        document.getElementById('file2Name').textContent = '';
        
        // Hide results and errors
        document.getElementById('compareResults').style.display = 'none';
        document.getElementById('compareError').style.display = 'none';
        document.getElementById('compareLoading').style.display = 'none';
        
        // Clear results content
        document.getElementById('compareResultsContent').innerHTML = '';
        document.getElementById('compareError').textContent = '';
        
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
        `;
        successMsg.innerHTML = '✓ All fields have been reset';
        document.body.appendChild(successMsg);
        
        setTimeout(() => successMsg.remove(), 2000);
    }
}
