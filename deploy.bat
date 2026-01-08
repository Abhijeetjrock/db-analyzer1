@echo off
REM DataBridge Suite - Windows Deployment Script

echo =========================================
echo  DataBridge Suite - Deployment Helper
echo =========================================
echo.

:menu
echo Select deployment option:
echo 1. Install dependencies
echo 2. Test database connectivity
echo 3. Run in development mode
echo 4. Run in production mode
echo 5. Exit
echo.

set /p choice="Enter choice (1-5): "

if "%choice%"=="1" goto install
if "%choice%"=="2" goto test
if "%choice%"=="3" goto dev
if "%choice%"=="4" goto prod
if "%choice%"=="5" goto end
echo Invalid choice
goto menu

:install
echo Installing Python dependencies...
pip install -r requirements.txt
if %errorlevel% equ 0 (
    echo Dependencies installed successfully
) else (
    echo Failed to install dependencies
    pause
    exit /b 1
)
pause
goto menu

:test
echo Testing database connectivity...
python check_database_access.py
pause
goto menu

:dev
echo Starting in DEVELOPMENT mode...
set IS_CLOUD_DEPLOYMENT=false
python app.py
pause
goto menu

:prod
echo Starting in PRODUCTION mode...
set IS_CLOUD_DEPLOYMENT=true

REM Check if waitress is installed
pip show waitress >nul 2>&1
if %errorlevel% equ 0 (
    echo Using Waitress...
    waitress-serve --host=0.0.0.0 --port=5000 app:app
) else (
    echo Installing Waitress...
    pip install waitress
    waitress-serve --host=0.0.0.0 --port=5000 app:app
)
pause
goto menu

:end
echo Goodbye!
exit /b 0
