# 🤖 AI-Powered SQL Query Optimizer Setup Guide

## Overview
This application now supports **live AI model integration** for intelligent SQL query optimization using:
- **OpenAI GPT-4** (Recommended)
- **Google Gemini Pro**

## Quick Setup Steps

### Option 1: OpenAI GPT (Recommended)

1. **Get your API Key:**
   - Visit: https://platform.openai.com/api-keys
   - Sign up/Login to OpenAI
   - Click "Create new secret key"
   - Copy the key (starts with `sk-...`)

2. **Set Environment Variable:**

   **Windows (Command Prompt):**
   ```cmd
   set AI_API_KEY=sk-your-actual-api-key-here
   set AI_MODEL_PROVIDER=openai
   ```

   **Windows (PowerShell):**
   ```powershell
   $env:AI_API_KEY="sk-your-actual-api-key-here"
   $env:AI_MODEL_PROVIDER="openai"
   ```

   **Linux/Mac:**
   ```bash
   export AI_API_KEY="sk-your-actual-api-key-here"
   export AI_MODEL_PROVIDER="openai"
   ```

3. **Or Edit app.py directly:**
   - Open `app.py`
   - Find line: `AI_API_KEY = os.getenv('AI_API_KEY', '')`
   - Replace with: `AI_API_KEY = os.getenv('AI_API_KEY', 'sk-your-actual-api-key-here')`

### Option 2: Google Gemini

1. **Get your API Key:**
   - Visit: https://makersuite.google.com/app/apikey
   - Sign in with Google account
   - Click "Create API Key"
   - Copy the key

2. **Set Environment Variable:**

   **Windows:**
   ```cmd
   set AI_API_KEY=your-gemini-api-key-here
   set AI_MODEL_PROVIDER=gemini
   ```

   **Linux/Mac:**
   ```bash
   export AI_API_KEY="your-gemini-api-key-here"
   export AI_MODEL_PROVIDER="gemini"
   ```

## Install Required Dependencies

```bash
pip install requests
```

This is already included in most Python installations, but if you get an error, install it.

## Restart the Application

After setting the environment variable:

1. **Stop** the Flask application (Ctrl+C)
2. **Restart** it:
   ```bash
   python app.py
   ```

## Verify AI is Working

1. Go to Query Optimizer page
2. You should see the "🤖 Use Live AI Model" checkbox
3. Enter a SQL query and click "Optimize Query"
4. If AI is configured correctly, you'll see:
   - **"🤖 AI-Powered Optimization"** badge in the summary
   - Provider name (OPENAI or GEMINI)
   - Intelligent optimization suggestions

## Pricing Information

### OpenAI GPT-4
- **Input:** ~$0.03 per 1K tokens
- **Output:** ~$0.06 per 1K tokens
- **Typical query optimization:** $0.01 - $0.05 per query

### OpenAI GPT-3.5-Turbo (Cheaper Alternative)
- **Input:** ~$0.0015 per 1K tokens
- **Output:** ~$0.002 per 1K tokens
- **Typical query optimization:** <$0.01 per query

To use GPT-3.5 instead of GPT-4, edit `app.py`:
```python
OPENAI_MODEL = "gpt-3.5-turbo"  # Change from "gpt-4"
```

### Google Gemini Pro
- **Free tier available**
- 60 requests per minute limit
- Good alternative to OpenAI

## Troubleshooting

### Issue: "AI Not Available" message
**Solution:**
1. Check environment variable is set: `echo %AI_API_KEY%` (Windows) or `echo $AI_API_KEY` (Linux/Mac)
2. Restart Flask app after setting env variable
3. Check API key is valid (no extra spaces)

### Issue: "API request failed"
**Solutions:**
1. Check your internet connection
2. Verify API key is correct and active
3. Check API quota/billing (OpenAI requires payment method)
4. Try the free Google Gemini alternative

### Issue: Request timeout
**Solution:**
- Increase timeout in `app.py` (line with `timeout=30`)
- Change to `timeout=60` for slower connections

## Fallback Mode

If AI is not configured, the application automatically falls back to **rule-based optimization** which includes:
- ✅ Join optimization
- ✅ Subquery improvements
- ✅ Index recommendations
- ✅ Database-specific hints
- ✅ Best practices

## Example: Complete Windows Setup

```cmd
# 1. Set environment variables
set AI_API_KEY=sk-proj-abc123xyz...
set AI_MODEL_PROVIDER=openai

# 2. Restart Flask
python app.py

# 3. Open browser
http://localhost:5000/query-optimizer

# 4. Test with a query
SELECT * FROM employees WHERE department_id = 10
```

## Security Best Practices

⚠️ **Never commit API keys to Git!**

1. Use environment variables (recommended)
2. Or create a `.env` file (add to `.gitignore`)
3. For production, use secrets management (Azure Key Vault, AWS Secrets Manager)

## Support

If you encounter issues:
1. Check application logs for error messages
2. Verify API key permissions and quota
3. Try the fallback rule-based optimization (uncheck AI option)

---

**Created for CrossDB Analyzer v2.0**
**Developed by Amdocs Data Team**
