/**
 * Session Management System
 * Handles session timeout, warnings, and automatic logout
 */

class SessionManager {
    constructor() {
        this.sessionTimeout = 30 * 60 * 1000; // 30 minutes in milliseconds
        this.warningTime = 2 * 60 * 1000; // Show warning 2 minutes before timeout
        this.checkInterval = 30 * 1000; // Check every 30 seconds
        this.warningShown = false;
        this.timerInterval = null;
        this.warningTimeout = null;
        this.logoutTimeout = null;
        this.lastActivity = Date.now();
        
        this.init();
    }
    
    init() {
        // Get session info from server
        this.fetchSessionInfo();
        
        // Track user activity
        this.trackActivity();
        
        // Start checking session
        this.startSessionCheck();
        
        // Add visibility change listener
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.checkSession();
            }
        });
    }
    
    async fetchSessionInfo() {
        try {
            const response = await fetch('/api/session-info');
            const data = await response.json();
            
            if (data.authenticated) {
                this.sessionTimeout = data.session_lifetime_seconds * 1000;
                console.log(`Session timeout: ${data.timeout_minutes} minutes`);
            }
        } catch (error) {
            console.error('Error fetching session info:', error);
        }
    }
    
    trackActivity() {
        // Track mouse movements, clicks, key presses
        const events = ['mousedown', 'keypress', 'scroll', 'touchstart', 'click'];
        
        events.forEach(event => {
            document.addEventListener(event, () => {
                this.resetTimer();
            }, true);
        });
    }
    
    resetTimer() {
        this.lastActivity = Date.now();
        this.warningShown = false;
        
        // Clear existing timers
        if (this.warningTimeout) clearTimeout(this.warningTimeout);
        if (this.logoutTimeout) clearTimeout(this.logoutTimeout);
        
        // Hide warning if shown
        this.hideWarning();
        
        // Set new timers
        const timeToWarning = this.sessionTimeout - this.warningTime;
        
        this.warningTimeout = setTimeout(() => {
            this.showWarning();
        }, timeToWarning);
        
        this.logoutTimeout = setTimeout(() => {
            this.logout('Session expired due to inactivity');
        }, this.sessionTimeout);
        
        // Keep session alive on server
        this.keepAlive();
    }
    
    async keepAlive() {
        try {
            await fetch('/api/keepalive', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
        } catch (error) {
            console.error('Error keeping session alive:', error);
        }
    }
    
    startSessionCheck() {
        // Periodically check if session is still valid
        this.timerInterval = setInterval(() => {
            this.checkSession();
        }, this.checkInterval);
    }
    
    async checkSession() {
        try {
            const response = await fetch('/api/check-auth');
            const data = await response.json();
            
            if (!data.authenticated && window.location.pathname !== '/login' && window.location.pathname !== '/') {
                this.logout('Session expired');
            }
        } catch (error) {
            console.error('Error checking session:', error);
        }
    }
    
    showWarning() {
        if (this.warningShown) return;
        
        this.warningShown = true;
        
        const timeRemaining = Math.floor(this.warningTime / 1000 / 60);
        
        const warning = document.createElement('div');
        warning.id = 'session-warning';
        warning.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
            color: white;
            padding: 20px 30px;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(238, 90, 111, 0.4);
            z-index: 10001;
            min-width: 400px;
            text-align: center;
            animation: slideDown 0.3s ease-out;
        `;
        
        warning.innerHTML = `
            <div style="font-size: 18px; font-weight: bold; margin-bottom: 10px;">
                ⚠️ Session Timeout Warning
            </div>
            <div style="font-size: 14px; margin-bottom: 15px;">
                Your session will expire in ${timeRemaining} minutes due to inactivity
            </div>
            <div style="display: flex; gap: 10px; justify-content: center;">
                <button onclick="sessionManager.extendSession()" style="
                    background: white;
                    color: #ff6b6b;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 6px;
                    font-weight: bold;
                    cursor: pointer;
                    font-size: 14px;
                ">
                    Stay Logged In
                </button>
                <button onclick="sessionManager.logout('User logged out')" style="
                    background: rgba(255, 255, 255, 0.2);
                    color: white;
                    border: 1px solid white;
                    padding: 10px 20px;
                    border-radius: 6px;
                    font-weight: bold;
                    cursor: pointer;
                    font-size: 14px;
                ">
                    Logout Now
                </button>
            </div>
        `;
        
        // Add animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideDown {
                from {
                    opacity: 0;
                    transform: translateX(-50%) translateY(-20px);
                }
                to {
                    opacity: 1;
                    transform: translateX(-50%) translateY(0);
                }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(warning);
    }
    
    hideWarning() {
        const warning = document.getElementById('session-warning');
        if (warning) {
            warning.remove();
        }
    }
    
    extendSession() {
        this.hideWarning();
        this.resetTimer();
        
        // Show success message
        const success = document.createElement('div');
        success.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
            color: white;
            padding: 15px 25px;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(76, 175, 80, 0.4);
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
        `;
        success.innerHTML = '✓ Session extended';
        document.body.appendChild(success);
        
        setTimeout(() => success.remove(), 3000);
    }
    
    async logout(message) {
        // Clear all timers
        if (this.timerInterval) clearInterval(this.timerInterval);
        if (this.warningTimeout) clearTimeout(this.warningTimeout);
        if (this.logoutTimeout) clearTimeout(this.logoutTimeout);
        
        this.hideWarning();
        
        try {
            await fetch('/api/logout', { method: 'POST' });
        } catch (error) {
            console.error('Logout error:', error);
        }
        
        // Show logout message
        const logoutMsg = document.createElement('div');
        logoutMsg.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px 50px;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(102, 126, 234, 0.4);
            z-index: 10002;
            text-align: center;
            font-size: 18px;
            font-weight: bold;
        `;
        logoutMsg.innerHTML = `🚪 ${message}<br><small style="font-weight: normal; font-size: 14px; margin-top: 10px; display: block;">Redirecting to login...</small>`;
        document.body.appendChild(logoutMsg);
        
        // Redirect to login
        setTimeout(() => {
            window.location.href = '/login';
        }, 2000);
    }
    
    destroy() {
        if (this.timerInterval) clearInterval(this.timerInterval);
        if (this.warningTimeout) clearTimeout(this.warningTimeout);
        if (this.logoutTimeout) clearTimeout(this.logoutTimeout);
        this.hideWarning();
    }
}

// Global instance
let sessionManager;

// Initialize on page load for authenticated pages
document.addEventListener('DOMContentLoaded', async () => {
    // Check if user is authenticated
    try {
        const response = await fetch('/api/check-auth');
        const data = await response.json();
        
        if (data.authenticated && window.location.pathname !== '/login') {
            sessionManager = new SessionManager();
            console.log('Session manager initialized');
        }
    } catch (error) {
        console.error('Error initializing session manager:', error);
    }
});
