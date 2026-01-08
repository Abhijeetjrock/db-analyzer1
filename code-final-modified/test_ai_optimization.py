"""
Test script for AI-powered SQL Query Optimization
Run this script to test AI integration independently
"""

import os
import requests
import json

# =============================================================================
# CONFIGURATION - Set your AI API key here for testing
# =============================================================================

# Option 1: Set directly (TEMPORARY - for testing only)
AI_API_KEY = "sk-your-api-key-here"  # Replace with your actual key
AI_MODEL_PROVIDER = "openai"  # or "gemini"

# Option 2: Set as environment variable (RECOMMENDED)
# Windows CMD: set AI_API_KEY=sk-your-key
# Windows PowerShell: $env:AI_API_KEY="sk-your-key"
# Linux/Mac: export AI_API_KEY="sk-your-key"

# =============================================================================

# Use environment variable if available, otherwise use the direct value
API_KEY = os.getenv('AI_API_KEY', AI_API_KEY)
PROVIDER = os.getenv('AI_MODEL_PROVIDER', AI_MODEL_PROVIDER)

print("="*80)
print("AI SQL Query Optimizer - Test Script")
print("="*80)
print(f"Provider: {PROVIDER}")
print(f"API Key: {'[SET]' if API_KEY and API_KEY != 'sk-your-api-key-here' else '[NOT SET]'}")
print("="*80)

if not API_KEY or API_KEY == "sk-your-api-key-here":
    print("\n❌ ERROR: AI_API_KEY not set!")
    print("\nPlease set your API key in one of these ways:")
    print("\n1. Edit this file and replace 'sk-your-api-key-here' with your actual key")
    print("2. Set environment variable:")
    print("   Windows CMD: set AI_API_KEY=sk-your-actual-key")
    print("   Windows PowerShell: $env:AI_API_KEY=\"sk-your-actual-key\"")
    print("   Linux/Mac: export AI_API_KEY=\"sk-your-actual-key\"")
    print("\nGet your API key from:")
    print("   OpenAI: https://platform.openai.com/api-keys")
    print("   Google Gemini: https://makersuite.google.com/app/apikey")
    exit(1)

# Test SQL query
TEST_QUERY = """
SELECT * FROM employees e, departments d 
WHERE e.department_id = d.department_id 
AND e.salary > (SELECT AVG(salary) FROM employees WHERE department_id = e.department_id)
ORDER BY e.last_name
"""

print(f"\nTest Query:\n{TEST_QUERY}")
print("\n" + "="*80)
print("Calling AI API...")
print("="*80 + "\n")

# Test OpenAI
if PROVIDER == "openai":
    url = "https://api.openai.com/v1/chat/completions"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {API_KEY}"
    }
    
    prompt = f"""Optimize this SQL query for Oracle database:

{TEST_QUERY}

Provide optimized query and explain improvements."""
    
    payload = {
        "model": "gpt-4",
        "messages": [
            {"role": "system", "content": "You are an expert SQL optimization assistant."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.3,
        "max_tokens": 1000
    }
    
    try:
        response = requests.post(url, headers=headers, json=payload, timeout=30)
        response.raise_for_status()
        
        result = response.json()
        ai_response = result['choices'][0]['message']['content']
        
        print("✅ SUCCESS! AI API is working\n")
        print("="*80)
        print("AI Response:")
        print("="*80)
        print(ai_response)
        print("\n" + "="*80)
        print("✅ AI optimization is ready to use in your application!")
        print("="*80)
        
    except requests.exceptions.HTTPError as e:
        print(f"❌ HTTP Error: {e}")
        print(f"Response: {e.response.text if e.response else 'No response'}")
        if "401" in str(e):
            print("\n⚠️  Authentication failed - check your API key")
        elif "429" in str(e):
            print("\n⚠️  Rate limit or quota exceeded")
    except Exception as e:
        print(f"❌ Error: {e}")

# Test Google Gemini
elif PROVIDER == "gemini":
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key={API_KEY}"
    headers = {"Content-Type": "application/json"}
    
    prompt = f"""Optimize this SQL query for Oracle database:

{TEST_QUERY}

Provide optimized query and explain improvements."""
    
    payload = {
        "contents": [{
            "parts": [{"text": prompt}]
        }],
        "generationConfig": {
            "temperature": 0.3,
            "maxOutputTokens": 1000
        }
    }
    
    try:
        response = requests.post(url, headers=headers, json=payload, timeout=30)
        response.raise_for_status()
        
        result = response.json()
        ai_response = result['candidates'][0]['content']['parts'][0]['text']
        
        print("✅ SUCCESS! AI API is working\n")
        print("="*80)
        print("AI Response:")
        print("="*80)
        print(ai_response)
        print("\n" + "="*80)
        print("✅ AI optimization is ready to use in your application!")
        print("="*80)
        
    except requests.exceptions.HTTPError as e:
        print(f"❌ HTTP Error: {e}")
        print(f"Response: {e.response.text if e.response else 'No response'}")
        if "400" in str(e):
            print("\n⚠️  Invalid API key or request")
    except Exception as e:
        print(f"❌ Error: {e}")

else:
    print(f"❌ Unknown provider: {PROVIDER}")
    print("Set AI_MODEL_PROVIDER to 'openai' or 'gemini'")
