# 🔍 DB Analyzer - Cross-Platform Database Analysis Tool

<div align="center">

![Version](https://img.shields.io/badge/version-2.0-blue)
![Python](https://img.shields.io/badge/python-3.8+-green)
![License](https://img.shields.io/badge/license-MIT-orange)
![Status](https://img.shields.io/badge/status-production-success)

**A powerful tool for analyzing and comparing database tables across multiple platforms**

[Features](#-features) • [Quick Start](#-quick-start) • [Deploy to Cloud](#-deploy-to-cloud) • [Demo](#-demo)

</div>

---

## 📋 Table of Contents

- [Features](#-features)
- [Supported Databases](#-supported-databases)
- [Quick Start](#-quick-start)
- [Deploy to Cloud](#-deploy-to-cloud)
- [Usage](#-usage)
- [Screenshots](#-screenshots)
- [Tech Stack](#-tech-stack)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### 🔍 **Core Features:**
- **Analyze Tables**: Get detailed insights about table structure, indexes, and constraints
- **Compare Files**: Compare Excel exports to identify differences between table analyses
- **Source-Target Compare**: Compare source and target tables to validate migration or replication
- **Data Comparison**: Execute and compare query results across databases

### 🚀 **AI-Powered Features:**
- **SQL Query Optimizer**: AI-powered query optimization with hints, join improvements, index recommendations
- **Natural Language to SQL**: Convert natural language questions into SQL queries using AI
- **SQL Script Generator**: Generate INSERT and MERGE scripts for database migration without DB connection

### 📊 **Database Support:**
- ✅ Oracle Database
- ✅ Databricks
- ✅ Snowflake

---

## 🗄️ Supported Databases

| Database | Connection Method | Features |
|----------|------------------|----------|
| **Oracle** | Username/Password + DSN | Full support (thin mode in cloud) |
| **Databricks** | Azure AD / Token / Username-Password | Full support |
| **Snowflake** | Password / SSO (Browser) | Full support |

---

## 🚀 Quick Start

### **Local Development:**

1. **Clone the repository:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/db-analyzer.git
   cd db-analyzer
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables:**
   Create a `.env` file:
   ```env
   AI_MODEL_PROVIDER=gemini
   AI_API_KEY=your-gemini-api-key-here
   ```

4. **Run the application:**
   ```bash
   python app.py
   ```

5. **Open in browser:**
   ```
   http://localhost:5000
   ```

---

## ☁️ Deploy to Cloud

### **⚡ Quick Deploy (2 minutes):**

[![Deploy to Railway](https://railway.app/button.svg)](https://railway.app/new)

1. Click the button above
2. Connect your GitHub account
3. Select this repository
4. Add environment variables (see `deploy.md`)
5. Deploy!

### **📦 Other Platforms:**

| Platform | Time | Cost | Instructions |
|----------|------|------|--------------|
| **Railway** | 2 min | $5/mo free credit | See `deploy.md` |
| **Render** | 5 min | Free tier available | See `DEPLOYMENT_GUIDE.md` |
| **Fly.io** | 10 min | Free tier available | See `DEPLOYMENT_GUIDE.md` |

**Full deployment guide:** See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)

---

## 💻 Usage

### **1. Analyze Single Table:**
```
1. Login with your database credentials
2. Enter table name (e.g., EMPLOYEES or SCHEMA.TABLE_NAME)
3. Click "Analyze Table"
4. View detailed analysis
5. Export to Excel
```

### **2. Compare Two Tables:**
```
1. Go to "Source-Target Compare"
2. Connect to source database
3. Connect to target database (can be different type!)
4. Select comparison options
5. View differences
6. Export comparison report
```

### **3. Generate SQL Scripts:**
```
1. Go to "SQL Script Generator"
2. Enter source and target table details
3. Select database type (Oracle/Databricks/Snowflake)
4. Generate INSERT or MERGE script
5. Copy or download script
```

### **4. AI Query Optimizer:**
```
1. Go to "SQL Query Optimizer"
2. Paste your SQL query
3. Click "Optimize Query"
4. Get AI-powered suggestions:
   - Performance hints
   - Index recommendations
   - Join improvements
   - Best practices
```

### **5. Natural Language to SQL:**
```
1. Go to "Natural Language to SQL"
2. Describe what data you need in plain English
   Example: "Show me all employees hired in 2023 with salary > 50000"
3. Get generated SQL query
4. Copy and use in your database
```

---

## 📱 Mobile Support

### **Fully Responsive Design:**
- ✅ Works on phones, tablets, and desktops
- ✅ Touch-friendly interface
- ✅ Optimized for small screens
- ✅ Can be added to home screen as app

### **Add to Home Screen:**

**iOS:**
1. Open in Safari
2. Tap Share → "Add to Home Screen"

**Android:**
1. Open in Chrome
2. Tap Menu → "Add to Home screen"

---

## 🛠️ Tech Stack

| Category | Technologies |
|----------|--------------|
| **Backend** | Python 3.8+, Flask, Gunicorn |
| **Database Connectors** | oracledb, databricks-sql-connector, snowflake-connector |
| **AI Integration** | OpenAI GPT, Google Gemini |
| **Frontend** | HTML5, CSS3, JavaScript (Vanilla) |
| **File Processing** | openpyxl (Excel handling) |
| **Security** | Flask sessions, CORS |

---

## 📸 Screenshots

### Home Page
![Home Page](screenshots/home.png)

### SQL Script Generator
![SQL Generator](screenshots/script-generator.png)

### AI Query Optimizer
![Query Optimizer](screenshots/optimizer.png)

### Table Analysis
![Analysis](screenshots/analysis.png)

---

## 🔒 Security

### **Best Practices:**
- ✅ Environment variables for sensitive data
- ✅ Session-based authentication
- ✅ No credentials stored in code
- ✅ CORS protection
- ✅ Secure database connections

### **For Production:**
1. Change `app.secret_key` in `app.py`
2. Use environment variables for all sensitive data
3. Enable HTTPS (automatic on Render/Railway)
4. Set up proper firewall rules
5. Regularly update dependencies

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

**Developed by:** Amdocs Data Team

**Version:** 2.0

**Last Updated:** January 2025

---

## 🆘 Support

### **Need Help?**
- 📖 Check [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed instructions
- 🚀 See [deploy.md](deploy.md) for quick deployment
- 🐛 Open an issue on GitHub
- 📧 Contact: [your-email@example.com]

### **Common Issues:**
- **Oracle connection fails in cloud**: Normal, thin mode limitations
- **App sleeps on free tier**: Use UptimeRobot to keep it awake
- **AI features not working**: Check API key in environment variables

---

## 🎉 Acknowledgments

- Oracle for oracledb package
- Databricks for SQL connector
- Snowflake for Python connector
- OpenAI and Google for AI models
- Flask community for excellent documentation

---

## 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=YOUR_USERNAME/db-analyzer&type=Date)](https://star-history.com/#YOUR_USERNAME/db-analyzer&Date)

---

<div align="center">

**Made with ❤️ by Amdocs Data Team**

[Report Bug](https://github.com/YOUR_USERNAME/db-analyzer/issues) • [Request Feature](https://github.com/YOUR_USERNAME/db-analyzer/issues)

</div>
