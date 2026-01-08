@echo off
REM ============================================================================
REM Start Flask App with AI-Powered Query Optimization
REM ============================================================================

echo ========================================
echo SQL Query Optimizer with AI
echo ========================================
echo.

REM Set your AI API key here (TEMPORARY - for quick testing)
REM Get your key from:
REM   - OpenAI: https://platform.openai.com/api-keys
REM   - Google Gemini: https://makersuite.google.com/app/apikey

set AI_MODEL_PROVIDER=openai
set AI_API_KEY=sk-your-openai-api-key-here

REM Uncomment below for Google Gemini instead:
REM set AI_MODEL_PROVIDER=gemini
REM set AI_API_KEY=your-gemini-api-key-here

REM ============================================================================

if "%AI_API_KEY%"=="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" (
    echo.
    echo [WARNING] AI_API_KEY is not set!
    echo.
    echo Please edit run_with_ai.bat and set your API key on line 15
    echo OR set it as an environment variable before running this script:
    echo.
    echo   set AI_API_KEY=sk-your-actual-key
    echo.
    echo Get your API key from:
    echo   - OpenAI: https://platform.openai.com/api-keys
    echo   - Google Gemini: https://makersuite.google.com/app/apikey
    echo.
    echo The app will still run with rule-based optimization only.
    echo.
    pause
)

echo AI Provider: %AI_MODEL_PROVIDER%
echo AI API Key: [%AI_API_KEY:~0,7%...]
echo.
echo Starting Flask application...
echo.
echo Once started, open: http://localhost:5000/query-optimizer
echo.
echo ========================================
echo.

python app.py

pause
