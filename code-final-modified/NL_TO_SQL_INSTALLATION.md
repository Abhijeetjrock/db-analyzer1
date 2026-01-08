# Natural Language to SQL Feature - Installation Instructions

## 📋 Overview

This feature adds **AI-Powered Natural Language to SQL Generator** to your CrossDB Analyzer application.

## ✅ What's Included

1. ✨ **Frontend UI** (`nl-to-sql.html`) - Beautiful interface with:
   - Natural language input
   - 0-shot, 1-shot, Few-shot learning modes
   - Support for Oracle, Databricks, Snowflake
   - AI-powered optimization
   - Export to .txt functionality

2. ⚙️ **Backend API** (`nl_to_sql_api.py`) - Contains:
   - `/api/nl-to-sql` - Main generation endpoint
   - `/api/export-nl-to-sql` - Export functionality
   - AI integration (Gemini/OpenAI)
   - Rule-based fallback

3. 🔗 **Route Addition** - Already added to app.py:
   - `/nl-to-sql` route for serving the HTML page

## 📦 Installation Steps

### Step 1: Files Already Created
✅ `templates/nl-to-sql.html` - Frontend interface
✅ `nl_to_sql_api.py` - Backend API code  
✅ Route `/nl-to-sql` - Already added to app.py

### Step 2: Add API Endpoints to app.py

**IMPORTANT:** Copy the contents of `nl_to_sql_api.py` and add them to `app.py` **BEFORE** the line:

```python
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
```

**How to do it:**

1. Open `nl_to_sql_api.py`
2. **Copy ALL the code** from lines after the docstring (starting from `@app.route('/api/nl-to-sql'...`)
3. Open `app.py`
4. **Scroll to the bottom** and find `if __name__ == '__main__':`
5. **Paste the copied code** just above that line
6. **Save the file**

### Step 3: Update Home Page Navigation (Optional)

Add a link to the Natural Language to SQL page in your `templates/home.html`:

```html
<div class="feature-card">
    <div class="feature-icon">🤖</div>
    <h3>NL to SQL Generator</h3>
    <p>Convert natural language to optimized SQL for Oracle, Databricks & Snowflake</p>
    <a href="/nl-to-sql" class="feature-link">Generate SQL →</a>
</div>
```

## 🚀 Usage

### Access the Feature:
```
http://localhost:5000/nl-to-sql
```

### Example Workflow:

1. **Enter Natural Language:**
   ```
   Get all employees who joined in the last 30 days and have a salary greater than 50000
   ```

2. **Select Learning Mode:**
   - **0-Shot**: Direct generation (no examples)
   - **1-Shot**: Provide 1 example for guidance
   - **Few-Shot**: Provide multiple examples

3. **Select Target Databases:**
   - ☑️ Oracle SQL
   - ☑️ Databricks SQL
   - ☑️ Snowflake SQL

4. **Enable AI Optimization:**
   - ☑️ Use AI-Powered Optimization (uses Gemini or OpenAI)

5. **Click "Generate SQL Queries"**

6. **Review & Export:**
   - Copy individual SQL queries
   - Export all as `.txt` file

## 🎯 Features

### ✨ 0-Shot Learning
- AI generates SQL without examples
- Best for simple, standard queries
- Fastest generation

### 🎯 1-Shot Learning
- Provide 1 example to guide AI
- Better accuracy for complex patterns
- AI learns from your example

### 🚀 Few-Shot Learning
- Provide multiple examples
- Highest accuracy
- Best for domain-specific queries

### 🗄️ Multi-Database Support
Generates database-specific SQL:
- **Oracle**: `ROWNUM`, `LISTAGG`, `CONNECT BY`
- **Databricks**: `LIMIT`, `ARRAY`, Delta Lake syntax
- **Snowflake**: `QUALIFY`, `FLATTEN`, Time Travel

### 🤖 AI Providers
- **Google Gemini** (Free tier: 60 req/min)
- **OpenAI GPT** (Requires billing)
- **Rule-Based Fallback** (No AI key needed)

## 📝 API Endpoints

### Generate SQL
```http
POST /api/nl-to-sql
Content-Type: application/json

{
  "nl_prompt": "Get all orders from last week",
  "learning_mode": "zero-shot",
  "use_ai": true,
  "target_databases": {
    "oracle": true,
    "databricks": true,
    "snowflake": true
  },
  "example_prompt": "",
  "example_sql": ""
}
```

**Response:**
```json
{
  "success": true,
  "generated_sql": {
    "oracle": "SELECT * FROM orders WHERE order_date >= SYSDATE - 7",
    "databricks": "SELECT * FROM orders WHERE order_date >= CURRENT_DATE() - INTERVAL 7 DAYS",
    "snowflake": "SELECT * FROM orders WHERE order_date >= DATEADD(day, -7, CURRENT_DATE())"
  },
  "ai_used": true,
  "ai_provider": "gemini",
  "learning_mode": "zero-shot",
  "explanation": "Query retrieves all orders from the past 7 days using database-specific date functions"
}
```

### Export SQL
```http
POST /api/export-nl-to-sql
Content-Type: application/json

{
  "nl_prompt": "...",
  "generated_sql": { ... },
  "learning_mode": "zero-shot",
  "ai_used": true,
  "ai_provider": "gemini",
  "explanation": "..."
}
```

**Response:** Downloads a `.txt` file with all generated SQL queries.

## 🔧 Configuration

### AI Model Settings (app.py)
```python
AI_MODEL_PROVIDER = 'gemini'  # or 'openai'
AI_API_KEY = 'your-api-key-here'
```

### Get Free Gemini API Key:
1. Visit: https://makersuite.google.com/app/apikey
2. Sign in with Google
3. Click "Create API Key"
4. Copy and paste into `app.py`

## 🎨 UI Features

- **Modern Gradient Design**
- **Responsive Layout** (mobile-friendly)
- **Real-time Loading Indicators**
- **Syntax-highlighted SQL Output**
- **Copy to Clipboard** functionality
- **Example Prompts** for quick start
- **Color-coded Alerts**

## 🐛 Troubleshooting

### Issue: "AI Model not configured"
**Solution:** Set `AI_API_KEY` in app.py

### Issue: "Rate limit exceeded"
**Solution:** Wait 1 minute or uncheck "Use AI"

### Issue: Generated SQL is generic
**Solution:** Use 1-shot or few-shot mode with examples

### Issue: Export not working
**Solution:** Check `BACKUP_DIR` path in app.py

## 📚 Example Prompts

Try these to get started:

1. **Simple Query:**
   ```
   Get all active users
   ```

2. **Filtered Query:**
   ```
   Find customers who placed more than 5 orders in 2024
   ```

3. **Aggregation:**
   ```
   Calculate total sales by product category
   ```

4. **Join Query:**
   ```
   List employees with their department names and managers
   ```

5. **Time-based:**
   ```
   Show sales from the last 30 days grouped by week
   ```

## ✅ Verification

After installation, verify everything works:

1. **Start Flask app:**
   ```bash
   python app.py
   ```

2. **Open browser:**
   ```
   http://localhost:5000/nl-to-sql
   ```

3. **Test generation:**
   - Enter: "Get all products"
   - Select: Oracle, Databricks, Snowflake
   - Click: "Generate SQL Queries"

4. **Expected Result:**
   - 3 SQL queries generated
   - Export button appears
   - Can copy each SQL

## 🎉 You're Done!

Your **Natural Language to SQL Generator** is now fully functional!

---

**Need Help?**
- Check console logs for errors
- Verify AI API key is valid
- Test with "Use AI" unchecked (rule-based mode)
- Review generated logs in `BACKUP_DIR`

**Developed by:** Amdocs Data Team  
**Version:** 2.0 - CrossDB Analyzer
