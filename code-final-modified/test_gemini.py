import requests
import json

API_KEY = "AIzaSyAuhNWDCsHNhZDPL-hvTw4gVTRb6pcmQeo"

# List available models
print("=" * 60)
print("AVAILABLE GEMINI MODELS")
print("=" * 60)

try:
    r = requests.get(f'https://generativelanguage.googleapis.com/v1/models?key={API_KEY}', verify=False)
    r.raise_for_status()
    models = r.json()['models']
    
    for m in models:
        if 'generateContent' in m.get('supportedGenerationMethods', []):
            model_name = m['name'].split('/')[-1]
            display_name = m['displayName']
            print(f"✓ {model_name}")
            print(f"  Display Name: {display_name}")
            print(f"  Description: {m.get('description', 'N/A')[:80]}")
            print()
except Exception as e:
    print(f"Error: {e}")

# Test a simple query with gemini-2.0-flash-001
print("=" * 60)
print("TESTING GEMINI-2.0-FLASH-001")
print("=" * 60)

test_url = f"https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash-001:generateContent?key={API_KEY}"

payload = {
    'contents': [{
        'parts': [{
            'text': 'Say "Hello, I am working!" in one sentence.'
        }]
    }]
}

try:
    response = requests.post(test_url, json=payload, verify=False, timeout=10)
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        result = response.json()
        text = result['candidates'][0]['content']['parts'][0]['text']
        print(f"✓ SUCCESS! Response: {text}")
    else:
        print(f"✗ FAILED: {response.text}")
except Exception as e:
    print(f"✗ ERROR: {e}")
