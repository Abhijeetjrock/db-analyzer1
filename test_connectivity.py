#!/usr/bin/env python3
"""
Database Connectivity Test Script
Tests network connectivity to Oracle, Databricks, and Snowflake before deployment
"""

import socket
import sys
import time
from urllib.parse import urlparse

def print_header(text):
    """Print formatted header"""
    print("\n" + "="*60)
    print(f"  {text}")
    print("="*60)

def test_tcp_connection(host, port, timeout=10):
    """Test TCP connection to a host and port"""
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(timeout)
        result = sock.connect_ex((host, port))
        sock.close()
        
        if result == 0:
            return True, f"✅ SUCCESS: Can connect to {host}:{port}"
        else:
            return False, f"❌ FAILED: Cannot connect to {host}:{port} (Error code: {result})"
    except socket.gaierror:
        return False, f"❌ FAILED: Cannot resolve hostname {host}"
    except socket.timeout:
        return False, f"❌ FAILED: Connection timeout to {host}:{port}"
    except Exception as e:
        return False, f"❌ FAILED: {str(e)}"

def test_dns_resolution(hostname):
    """Test DNS resolution"""
    try:
        ip = socket.gethostbyname(hostname)
        return True, f"✅ SUCCESS: {hostname} resolves to {ip}"
    except socket.gaierror:
        return False, f"❌ FAILED: Cannot resolve {hostname}"
    except Exception as e:
        return False, f"❌ FAILED: {str(e)}"

def test_https_host(url):
    """Test HTTPS connectivity"""
    try:
        import urllib.request
        parsed = urlparse(url if url.startswith('http') else f'https://{url}')
        host = parsed.netloc or parsed.path
        
        # Test DNS
        success, msg = test_dns_resolution(host)
        if not success:
            return False, msg
        
        # Test HTTPS port
        return test_tcp_connection(host, 443)
    except Exception as e:
        return False, f"❌ FAILED: {str(e)}"

def main():
    """Main test function"""
    print_header("DataBridge Suite - Database Connectivity Test")
    print("\nThis script tests network connectivity to your databases.")
    print("Run this BEFORE deploying to identify connectivity issues.\n")
    
    results = []
    
    # Test Oracle
    print_header("Testing Oracle Database")
    oracle_host = input("Enter Oracle hostname or IP (e.g., 192.168.1.100): ").strip()
    oracle_port = input("Enter Oracle port (default 1521): ").strip() or "1521"
    
    if oracle_host:
        # Test DNS resolution
        success, msg = test_dns_resolution(oracle_host)
        print(msg)
        results.append(('Oracle DNS', success))
        
        # Test port connectivity
        success, msg = test_tcp_connection(oracle_host, int(oracle_port))
        print(msg)
        results.append(('Oracle Port', success))
        
        # Test actual Oracle connection
        try:
            print("\nTesting Oracle database connection...")
            username = input("Enter Oracle username (or press Enter to skip): ").strip()
            if username:
                password = input("Enter Oracle password: ").strip()
                dsn = f"{oracle_host}:{oracle_port}/SERVICE"
                service = input("Enter Oracle service name: ").strip()
                dsn = f"{oracle_host}:{oracle_port}/{service}"
                
                try:
                    import oracledb
                    conn = oracledb.connect(user=username, password=password, dsn=dsn)
                    cursor = conn.cursor()
                    cursor.execute("SELECT 'Connected!' FROM DUAL")
                    result = cursor.fetchone()[0]
                    conn.close()
                    print(f"✅ SUCCESS: Oracle connection successful! Result: {result}")
                    results.append(('Oracle Connection', True))
                except ImportError:
                    print("⚠️  WARNING: oracledb module not installed. Run: pip install oracledb")
                    results.append(('Oracle Connection', False))
                except Exception as e:
                    print(f"❌ FAILED: Oracle connection failed: {str(e)}")
                    results.append(('Oracle Connection', False))
        except KeyboardInterrupt:
            print("\nSkipped Oracle connection test.")
    
    # Test Databricks
    print_header("Testing Databricks")
    databricks_host = input("Enter Databricks workspace URL (e.g., your-workspace.cloud.databricks.com): ").strip()
    
    if databricks_host:
        success, msg = test_https_host(databricks_host)
        print(msg)
        results.append(('Databricks HTTPS', success))
        
        # Test actual Databricks connection
        try:
            print("\nTesting Databricks connection...")
            http_path = input("Enter HTTP path (or press Enter to skip): ").strip()
            if http_path:
                token = input("Enter access token: ").strip()
                
                try:
                    from databricks import sql as databricks_sql
                    conn = databricks_sql.connect(
                        server_hostname=databricks_host,
                        http_path=http_path,
                        access_token=token
                    )
                    cursor = conn.cursor()
                    cursor.execute("SELECT 'Connected!' as test")
                    result = cursor.fetchone()[0]
                    conn.close()
                    print(f"✅ SUCCESS: Databricks connection successful! Result: {result}")
                    results.append(('Databricks Connection', True))
                except ImportError:
                    print("⚠️  WARNING: databricks-sql-connector not installed. Run: pip install databricks-sql-connector")
                    results.append(('Databricks Connection', False))
                except Exception as e:
                    print(f"❌ FAILED: Databricks connection failed: {str(e)}")
                    results.append(('Databricks Connection', False))
        except KeyboardInterrupt:
            print("\nSkipped Databricks connection test.")
    
    # Test Snowflake
    print_header("Testing Snowflake")
    snowflake_account = input("Enter Snowflake account (e.g., abc12345.us-east-1.aws): ").strip()
    
    if snowflake_account:
        # Extract hostname
        if '.snowflakecomputing.com' not in snowflake_account:
            snowflake_host = f"{snowflake_account}.snowflakecomputing.com"
        else:
            snowflake_host = snowflake_account
        
        success, msg = test_https_host(snowflake_host)
        print(msg)
        results.append(('Snowflake HTTPS', success))
        
        # Test actual Snowflake connection
        try:
            print("\nTesting Snowflake connection...")
            username = input("Enter Snowflake username (or press Enter to skip): ").strip()
            if username:
                password = input("Enter Snowflake password: ").strip()
                
                try:
                    import snowflake.connector
                    conn = snowflake.connector.connect(
                        user=username,
                        password=password,
                        account=snowflake_account.replace('.snowflakecomputing.com', '')
                    )
                    cursor = conn.cursor()
                    cursor.execute("SELECT 'Connected!' as test")
                    result = cursor.fetchone()[0]
                    conn.close()
                    print(f"✅ SUCCESS: Snowflake connection successful! Result: {result}")
                    results.append(('Snowflake Connection', True))
                except ImportError:
                    print("⚠️  WARNING: snowflake-connector-python not installed. Run: pip install snowflake-connector-python")
                    results.append(('Snowflake Connection', False))
                except Exception as e:
                    print(f"❌ FAILED: Snowflake connection failed: {str(e)}")
                    results.append(('Snowflake Connection', False))
        except KeyboardInterrupt:
            print("\nSkipped Snowflake connection test.")
    
    # Summary
    print_header("Test Summary")
    passed = sum(1 for _, success in results if success)
    total = len(results)
    
    print(f"\nTotal Tests: {total}")
    print(f"Passed: {passed}")
    print(f"Failed: {total - passed}\n")
    
    for test_name, success in results:
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name}")
    
    # Recommendations
    print_header("Recommendations")
    
    if passed == total:
        print("\n✅ All tests passed! Your deployment should work.")
        print("   You can proceed with deployment.\n")
    else:
        print("\n⚠️  Some tests failed. Review the following:")
        print("")
        print("1. Network Connectivity:")
        print("   - Ensure firewall allows outbound connections")
        print("   - Check if VPN is required")
        print("   - Verify database server IPs are accessible")
        print("")
        print("2. Use IP Addresses:")
        print("   - For Oracle: Use IP instead of hostname")
        print("   - Example: 192.168.1.100:1521/SERVICE")
        print("")
        print("3. Firewall Rules:")
        print("   - Oracle: Allow TCP port 1521")
        print("   - Databricks: Allow HTTPS (443)")
        print("   - Snowflake: Allow HTTPS (443)")
        print("")
        print("4. Credentials:")
        print("   - Verify username/password are correct")
        print("   - Check access tokens are not expired")
        print("   - Ensure accounts have necessary permissions")
        print("")
    
    print_header("Next Steps")
    print("\n1. Fix any connectivity issues identified above")
    print("2. Run this test again from your deployment server")
    print("3. Once all tests pass, proceed with application deployment")
    print("4. Refer to DEPLOYMENT_GUIDE.md for detailed instructions\n")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\nTest interrupted by user.")
        sys.exit(0)
    except Exception as e:
        print(f"\n\n❌ ERROR: {str(e)}")
        sys.exit(1)
