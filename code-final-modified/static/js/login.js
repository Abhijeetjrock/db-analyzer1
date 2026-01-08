// Switch between database type fields
function switchDatabaseType() {
    const dbType = document.getElementById('dbType').value;
    
    // Hide all fields
    document.getElementById('oracleFields').style.display = 'none';
    document.getElementById('databricksFields').style.display = 'none';
    document.getElementById('snowflakeFields').style.display = 'none';
    
    // Show selected database fields
    if (dbType === 'oracle') {
        document.getElementById('oracleFields').style.display = 'block';
    } else if (dbType === 'databricks') {
        document.getElementById('databricksFields').style.display = 'block';
    } else if (dbType === 'snowflake') {
        document.getElementById('snowflakeFields').style.display = 'block';
    }
}

// Handle form submission
document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const dbType = document.getElementById('dbType').value;
    const loginBtn = document.getElementById('loginBtn');
    const btnText = loginBtn.querySelector('.btn-text');
    const spinner = loginBtn.querySelector('.spinner');
    const errorMessage = document.getElementById('error-message');
    
    // Hide error message
    errorMessage.classList.remove('show');
    errorMessage.textContent = '';
    
    // Disable button and show spinner
    loginBtn.disabled = true;
    btnText.textContent = 'Logging in...';
    spinner.style.display = 'inline-block';
    
    // Prepare credentials based on database type
    let credentials = { db_type: dbType };
    
    if (dbType === 'oracle') {
        credentials.username = document.getElementById('username').value.trim();
        credentials.password = document.getElementById('password').value;
        credentials.dsn = document.getElementById('dsn').value.trim();
        
        if (!credentials.username || !credentials.password || !credentials.dsn) {
            showError('Please fill in all Oracle fields');
            resetButton();
            return;
        }
    } else if (dbType === 'databricks') {
        const serverHostname = document.getElementById('serverHostname').value.trim();
        const httpPath = document.getElementById('httpPath').value.trim();
        const useAzureAd = document.getElementById('useAzureAd').checked;
        
        if (!serverHostname || !httpPath) {
            showError('Server hostname and HTTP path are required for Databricks');
            resetButton();
            return;
        }
        
        credentials.server_hostname = serverHostname;
        credentials.http_path = httpPath;
        
        if (useAzureAd) {
            // Azure AD / Entra ID authentication
            credentials.authenticator = 'azuread';
        } else {
            // Check if either token OR username/password is provided
            const accessToken = document.getElementById('accessToken').value.trim();
            const dbUsername = document.getElementById('dbUsername').value.trim();
            const dbPassword = document.getElementById('dbPassword').value.trim();
            
            const hasToken = accessToken.length > 0;
            const hasCredentials = dbUsername && dbPassword;
            
            if (!hasToken && !hasCredentials) {
                showError('Please provide Access Token OR Username/Password, or check Azure AD option');
                resetButton();
                return;
            }
            
            // Add authentication credentials
            if (hasToken) {
                credentials.access_token = accessToken;
            }
            if (hasCredentials) {
                credentials.username = dbUsername;
                credentials.password = dbPassword;
            }
        }
    } else if (dbType === 'snowflake') {
        credentials.username = document.getElementById('sfUsername').value.trim();
        credentials.account = document.getElementById('account').value.trim();
        credentials.warehouse = document.getElementById('warehouse').value.trim();
        credentials.database = document.getElementById('database').value.trim();
        credentials.schema = document.getElementById('schema').value.trim();
        
        const useSso = document.getElementById('useSso').checked;
        
        if (!credentials.username || !credentials.account) {
            showError('Please fill in username and account for Snowflake');
            resetButton();
            return;
        }
        
        if (useSso) {
            // SSO authentication
            credentials.authenticator = 'externalbrowser';
        } else {
            // Password authentication
            credentials.password = document.getElementById('sfPassword').value;
            if (!credentials.password) {
                showError('Please enter password or check "Use SSO" for SSO login');
                resetButton();
                return;
            }
        }
    }
    
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(credentials)
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Get the selected feature from sessionStorage
            const selectedFeature = sessionStorage.getItem('selectedFeature');
            
            // Redirect based on selected feature
            if (selectedFeature === 'analyze') {
                window.location.href = '/analyze';
            } else if (selectedFeature === 'compare') {
                window.location.href = '/compare-files';
            } else if (selectedFeature === 'source-target') {
                window.location.href = '/source-target';
            } else if (selectedFeature === 'sql-query') {
                window.location.href = '/sql-query';
            } else {
                // Default fallback
                window.location.href = '/analyze';
            }
        } else {
            // Show error message
            showError(data.error || 'Login failed. Please try again.');
            resetButton();
        }
    } catch (error) {
        console.error('Login error:', error);
        showError('Connection error. Please check your network and try again.');
        resetButton();
    }
    
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.classList.add('show');
    }
    
    function resetButton() {
        loginBtn.disabled = false;
        btnText.textContent = 'Login';
        spinner.style.display = 'none';
    }
});

// Auto-hide error message after 5 seconds
document.addEventListener('DOMContentLoaded', function() {
    const errorMessage = document.getElementById('error-message');
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.target.classList.contains('show')) {
                setTimeout(function() {
                    errorMessage.classList.remove('show');
                }, 5000);
            }
        });
    });
    
    observer.observe(errorMessage, { attributes: true, attributeFilter: ['class'] });
});
