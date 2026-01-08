# DataBridge Suite - Quick Start Guide

## 🚀 Connect to Databases from ANYWHERE

This guide shows you how to deploy DataBridge Suite and connect to Oracle, Databricks, and Snowflake databases regardless of network location.

---

## ⚡ 3-Step Quick Start

### Step 1: Test Connectivity (IMPORTANT!)

Before deploying, test if you can reach the databases:

```bash
# Run the connectivity checker
python check_database_access.py
```

This will help identify network issues before deployment.

### Step 2: Deploy the Application

**Linux/Mac:**
```bash
chmod +x deploy.sh
./deploy.sh
# Choose option 4 (Production mode)
```

**Windows:**
```cmd
deploy.bat
REM Choose option 4 (Production mode)
```

**Docker:**
```bash
docker build -t databridge .
docker run -d -p 5000:5000 --name databridge databridge
```

### Step 3: Access the Application

Open browser: `http://localhost:5000`

---

## 🔧 Database Connection Tips

### Oracle - Use IP Instead of Hostname

❌ **DON'T USE** (won't work in cloud):
```
DSN: oracleserver:1521/PRODDB
```

✅ **USE THIS** (works everywhere):
```
DSN: 192.168.1.100:1521/PRODDB
```

**Find your Oracle IP:**
```bash
# Windows
ping oracleserver

# Linux/Mac
host oracleserver
```

### Databricks - Get Connection Details

1. Open Databricks workspace
2. Go to SQL Warehouses
3. Click your warehouse → Connection Details
4. Copy:
   - Server hostname: `your-workspace.cloud.databricks.com`
   - HTTP path: `/sql/1.0/warehouses/abc123`
5. Generate access token: User Settings → Access Tokens

### Snowflake - Get Account Identifier

1. Look at your Snowflake URL: `https://ABC12345.snowflakecomputing.com`
2. Your account is: `ABC12345`
3. Or use full format: `ABC12345.us-east-1.aws`

---

## 🌐 Deployment Scenarios

### Scenario A: Deploy on Client's Network (EASIEST)

```
Your App Server (same network as databases)
  ↓
Oracle/Databricks/Snowflake (direct access)
```

**No special configuration needed** - just deploy and connect!

### Scenario B: Deploy on Cloud Platform

```
Cloud Platform (Render/AWS/Azure)
  ↓ (via Internet)
Oracle/Databricks/Snowflake
```

**Requirements:**
- Use IP addresses for Oracle
- Ensure Databricks/Snowflake are accessible via internet
- Configure firewall to allow your cloud platform's IPs

### Scenario C: Cloud with VPN

```
Cloud Platform
  ↓ (VPN Tunnel)
Client Network
  ↓
Databases
```

**Best for:** Secure enterprise deployments

---

## 🐛 Common Issues & Fixes

### Issue: "Cannot connect to Oracle"

**Error Message:**
```
DPY-6005: cannot connect to database
Name or service not known
```

**Solution:**
```bash
# 1. Find Oracle IP address
ping your-oracle-server

# 2. Use IP in DSN field
192.168.1.100:1521/SERVICE

# 3. Test connectivity
telnet 192.168.1.100 1521
```

### Issue: "Databricks authentication failed"

**Error Message:**
```
No valid authentication settings!
```

**Solution:**
1. Generate new access token in Databricks
2. Check token hasn't expired
3. Verify workspace URL format (no https://)
4. Verify HTTP path starts with `/sql/`

### Issue: "Connection timeout"

**Solution:**
1. Check firewall allows outbound connections
2. Verify database ports are not blocked:
   - Oracle: 1521
   - Databricks: 443 (HTTPS)
   - Snowflake: 443 (HTTPS)
3. Test from deployment server:
   ```bash
   python check_database_access.py
   ```

---

## 📋 Pre-Deployment Checklist

- [ ] Python 3.11+ installed
- [ ] All dependencies installed (`pip install -r requirements.txt`)
- [ ] Database connectivity tested
- [ ] Firewall rules configured (if needed)
- [ ] Oracle IP address obtained (not hostname)
- [ ] Databricks workspace URL and token ready
- [ ] Snowflake account identifier ready
- [ ] SSL certificates configured (for production)

---

## 🔐 Security Best Practices

1. **Change the secret key** in `app.py`:
   ```python
   app.secret_key = 'your-random-secret-key-here'
   ```

2. **Use HTTPS** in production (not HTTP)

3. **Use environment variables** for secrets:
   ```bash
   export AI_API_KEY=your-key
   export DB_PASSWORD=your-password
   ```

4. **Enable database SSL**:
   - Oracle: Use `tcps://` instead of standard DSN
   - Databricks/Snowflake: Already use HTTPS

---

## 📞 Need Help?

**Check these resources:**
1. `DEPLOYMENT_GUIDE.md` - Detailed deployment instructions
2. `check_database_access.py` - Test connectivity
3. Application logs - Check for error details

**Common Questions:**

**Q: Can I deploy on Render/Heroku?**  
A: Yes, but only if your databases are publicly accessible. For internal databases, deploy on-premises or use VPN.

**Q: Why use IP instead of hostname?**  
A: Cloud platforms can't resolve internal company hostnames. IPs work universally.

**Q: Which deployment method is best?**  
A: 
- Internal databases → Deploy on client's network
- Cloud databases → Any deployment works
- Hybrid → Use VPN

---

## 🎯 Next Steps

1. ✅ Run connectivity test: `python check_database_access.py`
2. ✅ Fix any connectivity issues
3. ✅ Deploy application: `./deploy.sh` or `deploy.bat`
4. ✅ Access application: `http://localhost:5000`
5. ✅ Connect to databases and start analyzing!

---

**Version**: 2.0  
**Support**: Amdocs Data Team  
**Documentation**: See `DEPLOYMENT_GUIDE.md` for advanced topics
