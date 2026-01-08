#!/bin/bash
# DataBridge Suite - Quick Deployment Script
# This script helps deploy the application in various environments

echo "========================================="
echo " DataBridge Suite - Deployment Helper"
echo "========================================="
echo ""

# Check if running as root (for production deployments)
if [ "$EUID" -eq 0 ]; then 
   echo "⚠️  WARNING: Running as root. Consider using a dedicated user."
fi

# Function to install dependencies
install_deps() {
    echo "Installing Python dependencies..."
    pip3 install -r requirements.txt
    if [ $? -eq 0 ]; then
        echo "✅ Dependencies installed successfully"
    else
        echo "❌ Failed to install dependencies"
        exit 1
    fi
}

# Function to test database connectivity
test_connectivity() {
    echo "Testing database connectivity..."
    python3 check_database_access.py
}

# Function to run in development mode
run_dev() {
    echo "Starting in DEVELOPMENT mode..."
    export IS_CLOUD_DEPLOYMENT=false
    python3 app.py
}

# Function to run in production mode
run_prod() {
    echo "Starting in PRODUCTION mode..."
    export IS_CLOUD_DEPLOYMENT=true
    
    # Check if gunicorn is available
    if command -v gunicorn &> /dev/null; then
        echo "Using Gunicorn..."
        gunicorn --bind 0.0.0.0:5000 --workers 4 --timeout 300 app:app
    elif command -v waitress-serve &> /dev/null; then
        echo "Using Waitress..."
        waitress-serve --host=0.0.0.0 --port=5000 app:app
    else
        echo "⚠️  Neither Gunicorn nor Waitress found. Installing Gunicorn..."
        pip3 install gunicorn
        gunicorn --bind 0.0.0.0:5000 --workers 4 --timeout 300 app:app
    fi
}

# Main menu
echo "Select deployment option:"
echo "1. Install dependencies"
echo "2. Test database connectivity"
echo "3. Run in development mode"
echo "4. Run in production mode"
echo "5. Exit"
echo ""

read -p "Enter choice (1-5): " choice

case $choice in
    1)
        install_deps
        ;;
    2)
        test_connectivity
        ;;
    3)
        run_dev
        ;;
    4)
        run_prod
        ;;
    5)
        echo "Goodbye!"
        exit 0
        ;;
    *)
        echo "Invalid choice"
        exit 1
        ;;
esac
