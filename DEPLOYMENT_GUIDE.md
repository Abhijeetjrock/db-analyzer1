# DataBridge Suite - Deployment Guide

## 🎯 Overview

This guide helps you deploy DataBridge Suite to connect to Oracle, Databricks, and Snowflake databases in **any network environment** (on-premises, cloud, hybrid).

---

## 📋 Prerequisites

### Required Software:
- Python 3.11+
- Docker (optional, recommended)
- Network access to your databases

### Database Requirements:
- **Oracle**: Accessible via IP:PORT/SERVICE or HOSTNAME:PORT/SERVICE
- **Databricks**: Workspace URL and HTTP Path accessible
- **Snowflake**: Account identifier accessible

---

## 🚀 Deployment Options

### **Option 1: Docker Deployment (RECOMMENDED)**

#### Step 1: Build Docker Image
```bash
docker build -t databridge-suite .
```

#### Step 2: Run Container
```bash
docker run -d \
  --name databridge \
  -p 5000:5000 \
  -e IS_CLOUD_DEPLOYMENT=true \
  -e AI_API_KEY=your-api-key \
  --network host \
  databridge-suite
```

**Note**: `--network host` allows the container to access databases on the host network.

#### Step 3: Access Application
```
http://localhost:5000
```

---

### **Option 2: Direct Python Deployment**

#### Step 1: Install Dependencies
```bash
pip install -r requirements.txt
```

#### Step 2: Set Environment Variables
```bash
# Windows
set IS_CLOUD_DEPLOYMENT=true
set AI_API_KEY=your-api-key

# Linux/Mac
export IS_CLOUD_DEPLOYMENT=true
export AI_API_KEY=your-api-key
```

#### Step 3: Run Application
```bash
# For development
python app.py

# For production (with Gunicorn on Linux)
gunicorn --bind 0.0.0.0:5000 --workers 4 --timeout 300 app:app

# For production (with Waitress on Windows)
waitress-serve --host=0.0.0.0 --port=5000 app:app
```

---

### **Option 3: Cloud Platform with VPN**

Deploy on Render/Heroku/Azure/AWS with VPN connection to client network:

#### Render with Tailscale VPN
1. Sign up for Tailscale: https://tailscale.com
2. Add Tailscale to your Render service
3. Connect to client's network via Tailscale
4. Use internal database hostnames/IPs

---

## 🔧 Database Connectivity Solutions

### **Problem: Cannot Connect to Databases After Deployment**

#### Solution 1: Use IP Addresses Instead of Hostnames

**Oracle Example:**
```
# DON'T USE (only works internally):
indlin3909:1521/ENS3SST

# USE THIS (works from anywhere):
10.123.45.67:1521/ENS3SST
```

**How to find IP:**
```bash
# Windows
ping indlin3909
nslookup indlin3909

# Linux/Mac
dig indlin3909
host indlin3909
```

#### Solution 2: Configure Network Access

**Firewall Rules Needed:**
```
Source: Your deployment server IP
Destination: Database server IP
Ports:
  - Oracle: 1521
  - Databricks: 443 (HTTPS)
  - Snowflake: 443 (HTTPS)
Protocol: TCP
Action: ALLOW
```

#### Solution 3: Use Database Proxy/Gateway

Deploy a database proxy in client network:
```
Internet → VPN → Proxy Server → Internal Databases
```

#### Solution 4: SSH Tunnel (For temporary access)

```bash
# Create SSH tunnel to Oracle
ssh -L 1521:oracle-internal-ip:1521 user@gateway-server

# Then connect using
localhost:1521/SERVICE
```

---

## 🌐 Network Architecture Options

### **Architecture 1: On-Premises Deployment**
```
[Client Network]
    ├── DataBridge Suite (Server)
    ├── Oracle Database
    ├── Databricks Workspace
    └── Snowflake Account
```
✅ **Best for**: Full control, no network issues
❌ **Drawback**: Requires client infrastructure

---

### **Architecture 2: Cloud with VPN**
```
[Cloud Platform - Render/AWS/Azure]
    └── DataBridge Suite
         |
         | (VPN Tunnel)
         ↓
[Client Network]
    ├── Oracle Database
    ├── Databricks Workspace
    └── Snowflake Account
```
✅ **Best for**: Scalability + Security
❌ **Drawback**: VPN configuration needed

---

### **Architecture 3: Hybrid with Proxy**
```
[Cloud Platform]
    └── DataBridge Suite
         |
         | (HTTPS)
         ↓
[Client Network DMZ]
    └── Database Proxy/Gateway
         |
         ↓
[Internal Network]
    ├── Oracle Database
    └── Other Databases
```
✅ **Best for**: Security compliance
❌ **Drawback**: Additional proxy setup

---

## 🔐 Security Checklist

### Before Deployment:
- [ ] Change `SECRET_KEY` in app.py
- [ ] Enable HTTPS/SSL
- [ ] Configure firewall rules
- [ ] Use environment variables for secrets
- [ ] Enable database connection encryption
- [ ] Set up authentication (LDAP/SSO)
- [ ] Configure session timeout
- [ ] Enable audit logging

### Database Connection Security:
- [ ] Use SSL/TLS for Oracle (tcps://)
- [ ] Use HTTPS for Databricks/Snowflake
- [ ] Rotate access tokens regularly
- [ ] Use least-privilege database accounts
- [ ] Enable IP whitelisting

---

## 📊 Connection Configuration Examples

### **Oracle Configuration**

#### Option A: Direct Connection (Internal Network)
```python
DSN: oracleserver.company.local:1521/PRODDB
Username: app_user
Password: secure_password
```

#### Option B: IP-based Connection (Works Anywhere)
```python
DSN: 192.168.10.50:1521/PRODDB
Username: app_user
Password: secure_password
```

#### Option C: SSL Connection (Secure)
```python
DSN: (DESCRIPTION=(ADDRESS=(PROTOCOL=TCPS)(HOST=192.168.10.50)(PORT=2484))(CONNECT_DATA=(SERVICE_NAME=PRODDB)))
Username: app_user
Password: secure_password
```

---

### **Databricks Configuration**

#### Option A: Personal Access Token
```python
Server Hostname: your-workspace.cloud.databricks.com
HTTP Path: /sql/1.0/warehouses/abc123
Access Token: dapi...
```

#### Option B: Azure AD Authentication
```python
Server Hostname: adb-1234567890.azuredatabricks.net
HTTP Path: /sql/1.0/warehouses/xyz789
Authenticator: azuread
```

**Network Access Required:**
- Allow HTTPS (443) to *.databricks.com
- Allow *.cloud.databricks.com
- Allow *.azuredatabricks.net (for Azure)

---

### **Snowflake Configuration**

#### Option A: Username/Password
```python
Account: abc12345.us-east-1.aws
Username: app_user
Password: secure_password
Warehouse: COMPUTE_WH
Database: PROD_DB
```

#### Option B: SSO Authentication
```python
Account: mycompany.snowflakecomputing.com
Username: user@company.com
Authenticator: externalbrowser
```

**Network Access Required:**
- Allow HTTPS (443) to *.snowflakecomputing.com
- Allow your Snowflake account URL

---

## 🐛 Troubleshooting

### Issue 1: "Cannot connect to database" (Oracle)

**Symptoms:**
```
ERROR: DPY-6005: cannot connect to database
CONNECTION_ID=... Name or service not known
```

**Solutions:**
1. **Use IP address instead of hostname**
   ```bash
   # Find IP
   ping oracle-hostname
   
   # Use in DSN
   192.168.1.100:1521/SERVICE
   ```

2. **Check network connectivity**
   ```bash
   # Test port access
   telnet 192.168.1.100 1521
   
   # Or use nc
   nc -zv 192.168.1.100 1521
   ```

3. **Verify firewall rules**
   - Allow outbound TCP port 1521
   - Add deployment server IP to Oracle firewall whitelist

---

### Issue 2: "No valid authentication settings" (Databricks)

**Symptoms:**
```
ERROR: Databricks login failed: No valid authentication settings!
```

**Solutions:**
1. **Verify access token is not expired**
   - Generate new token from Databricks workspace
   - User Settings → Access Tokens → Generate New Token

2. **Check workspace URL format**
   ```
   ✅ CORRECT: your-workspace.cloud.databricks.com
   ❌ WRONG: https://your-workspace.cloud.databricks.com
   ```

3. **Verify HTTP Path**
   ```
   ✅ CORRECT: /sql/1.0/warehouses/abc123
   ❌ WRONG: sql/1.0/warehouses/abc123
   ```

---

### Issue 3: Connection Timeout

**Symptoms:**
```
ERROR: Connection timeout after 30 seconds
```

**Solutions:**
1. **Increase timeout in app**
   ```python
   # Add to environment variables
   DB_CONNECTION_TIMEOUT=120
   ```

2. **Check network latency**
   ```bash
   ping database-server
   traceroute database-server
   ```

3. **Verify no network proxy issues**

---

## 📈 Production Deployment Checklist

### Pre-Deployment:
- [ ] Test all database connections locally
- [ ] Verify firewall rules are configured
- [ ] Set up SSL certificates for HTTPS
- [ ] Configure environment variables
- [ ] Test with production database credentials
- [ ] Set up backup/export directory
- [ ] Configure logging

### Deployment:
- [ ] Deploy application to server
- [ ] Start application service
- [ ] Test database connectivity from server
- [ ] Verify all features work
- [ ] Monitor logs for errors
- [ ] Set up health checks

### Post-Deployment:
- [ ] Monitor application performance
- [ ] Check error logs daily
- [ ] Verify database connections remain stable
- [ ] Set up alerts for failures
- [ ] Document any issues and solutions

---

## 🆘 Getting Help

### Common Issues & Solutions:

| Issue | Cause | Solution |
|-------|-------|----------|
| Hostname not found | Internal DNS | Use IP address |
| Connection refused | Firewall blocking | Open required ports |
| Authentication failed | Wrong credentials | Verify username/password |
| SSL/TLS error | Certificate issue | Install proper certificates |
| Timeout | Network latency | Increase timeout, check network |

### Support Contacts:
- Oracle: DBA team for connection strings
- Databricks: Admin console for workspace URLs
- Snowflake: Admin for account identifiers
- Network: IT team for firewall rules

---

## 🎓 Best Practices

1. **Always use IP addresses in production** (more reliable than hostnames)
2. **Enable SSL/TLS for all database connections**
3. **Use environment variables for secrets** (never hardcode)
4. **Set up monitoring and alerting**
5. **Test in staging environment first**
6. **Document all connection details**
7. **Regular security audits**
8. **Keep credentials rotated**

---

## 📝 Example Deployment Commands

### Docker with Custom Network
```bash
# Create custom network
docker network create databridge-net

# Run with custom network
docker run -d \
  --name databridge \
  --network databridge-net \
  -p 5000:5000 \
  -e IS_CLOUD_DEPLOYMENT=true \
  -v $(pwd)/exports:/app/exports \
  databridge-suite
```

### Kubernetes Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: databridge-suite
spec:
  replicas: 2
  template:
    spec:
      containers:
      - name: databridge
        image: databridge-suite:latest
        ports:
        - containerPort: 5000
        env:
        - name: IS_CLOUD_DEPLOYMENT
          value: "true"
        - name: AI_API_KEY
          valueFrom:
            secretKeyRef:
              name: databridge-secrets
              key: ai-api-key
```

### Systemd Service (Linux)
```bash
# Create service file
sudo nano /etc/systemd/system/databridge.service

[Unit]
Description=DataBridge Suite
After=network.target

[Service]
Type=simple
User=appuser
WorkingDirectory=/opt/databridge
Environment="IS_CLOUD_DEPLOYMENT=true"
ExecStart=/usr/bin/gunicorn --bind 0.0.0.0:5000 --workers 4 app:app
Restart=always

[Install]
WantedBy=multi-user.target

# Enable and start
sudo systemctl enable databridge
sudo systemctl start databridge
```

---

## 🔑 Quick Start for Common Scenarios

### Scenario 1: Deploy on Client's Windows Server
```powershell
# Install Python 3.11
# Install dependencies
pip install -r requirements.txt waitress

# Set environment
$env:IS_CLOUD_DEPLOYMENT="true"

# Run
waitress-serve --host=0.0.0.0 --port=5000 app:app
```

### Scenario 2: Deploy on Client's Linux Server
```bash
# Install dependencies
pip3 install -r requirements.txt gunicorn

# Set environment
export IS_CLOUD_DEPLOYMENT=true

# Run
gunicorn --bind 0.0.0.0:5000 --workers 4 --timeout 300 app:app
```

### Scenario 3: Deploy on Cloud with VPN
```bash
# 1. Set up VPN connection to client network
# 2. Deploy using Docker
docker run -d \
  --name databridge \
  --network host \
  -e IS_CLOUD_DEPLOYMENT=true \
  databridge-suite

# 3. Connect using client's internal database IPs
```

---

## 📞 Need More Help?

Contact your client's IT team for:
- Database server IP addresses
- Firewall configuration
- VPN access (if deploying to cloud)
- SSL certificates
- Network security requirements

---

**Version**: 2.0  
**Last Updated**: 2024  
**Maintained by**: Amdocs Data Team
