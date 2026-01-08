"""
DataBridge Suite - Database Access Verification Tool
Author: Amdocs Data Team
License: MIT
"""

import sys

def check_connection(host, port):
    """Verify if a host:port is reachable"""
    import socket
    try:
        s = socket.socket()
        s.settimeout(5)
        s.connect((host, int(port)))
        s.close()
        return True, f"Port {port} on {host} is accessible"
    except Exception as err:
        return False, f"Cannot reach {host}:{port} - {str(err)}"

def verify_oracle(host, port, user, pwd, svc):
    """Check Oracle database accessibility"""
    try:
        import oracledb
        dsn_str = f"{host}:{port}/{svc}"
        connection = oracledb.connect(user=user, password=pwd, dsn=dsn_str)
        connection.close()
        return True, "Oracle connection verified"
    except Exception as err:
        return False, f"Oracle error: {str(err)}"

def verify_databricks(workspace, path, token):
    """Check Databricks workspace accessibility"""
    try:
        from databricks import sql
        connection = sql.connect(
            server_hostname=workspace,
            http_path=path,
            access_token=token
        )
        connection.close()
        return True, "Databricks connection verified"
    except Exception as err:
        return False, f"Databricks error: {str(err)}"

def verify_snowflake(acct, user, pwd):
    """Check Snowflake account accessibility"""
    try:
        import snowflake.connector
        connection = snowflake.connector.connect(
            account=acct,
            user=user,
            password=pwd
        )
        connection.close()
        return True, "Snowflake connection verified"
    except Exception as err:
        return False, f"Snowflake error: {str(err)}"

if __name__ == "__main__":
    print("=" * 70)
    print(" DataBridge Suite - Database Connectivity Checker")
    print("=" * 70)
    print("\nSelect database to test:")
    print("1. Oracle")
    print("2. Databricks")
    print("3. Snowflake")
    
    choice = input("\nEnter choice (1-3): ").strip()
    
    if choice == "1":
        print("\n--- Oracle Connection Test ---")
        h = input("Host/IP: ").strip()
        p = input("Port (1521): ").strip() or "1521"
        u = input("Username: ").strip()
        pw = input("Password: ").strip()
        sv = input("Service: ").strip()
        
        # Test port
        ok, msg = check_connection(h, p)
        print(f"\nPort check: {msg}")
        
        if ok:
            ok2, msg2 = verify_oracle(h, p, u, pw, sv)
            print(f"Connection test: {msg2}")
            
    elif choice == "2":
        print("\n--- Databricks Connection Test ---")
        ws = input("Workspace URL: ").strip()
        hp = input("HTTP Path: ").strip()
        tk = input("Access Token: ").strip()
        
        ok, msg = verify_databricks(ws, hp, tk)
        print(f"\nConnection test: {msg}")
        
    elif choice == "3":
        print("\n--- Snowflake Connection Test ---")
        ac = input("Account ID: ").strip()
        u = input("Username: ").strip()
        pw = input("Password: ").strip()
        
        ok, msg = verify_snowflake(ac, u, pw)
        print(f"\nConnection test: {msg}")
    
    print("\n" + "=" * 70)
