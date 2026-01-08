#!/usr/bin/env python3
"""Fix indentation for SSL bypass code"""

with open('app.py', 'r', encoding='utf-8') as f:
    lines = f.readlines()

print("Fixing indentation for SSL bypass code...")

# Lines 3057-3080 should be at 12 spaces (inside the if AI_MODEL_PROVIDER == 'openai':)
lines[3056] = '            logger.info(f"Calling OpenAI API for query optimization...")\n'
lines[3057] = '\n'
lines[3058] = '            # Create a session with retry logic and SSL bypass\n'
lines[3059] = '            session = requests.Session()\n'
lines[3060] = '            session.verify = False  # Disable SSL verification\n'
lines[3061] = '\n'
lines[3062] = '            # Disable SSL warnings for this session\n'
lines[3063] = '            import warnings\n'
lines[3064] = '            from urllib3.exceptions import InsecureRequestWarning\n'
lines[3065] = '            warnings.filterwarnings(\'ignore\', category=InsecureRequestWarning)\n'
lines[3066] = '\n'
lines[3067] = '            try:\n'
lines[3068] = '                response = session.post(\n'
lines[3069] = '                    OPENAI_API_URL,\n'
lines[3070] = '                    headers=headers,\n'
lines[3071] = '                    json=payload,\n'
lines[3072] = '                    timeout=30\n'
lines[3073] = '                )\n'
lines[3074] = '                response.raise_for_status()\n'
lines[3075] = '\n'
lines[3076] = '                result = response.json()\n'
lines[3077] = '                ai_response = result[\'choices\'][0][\'message\'][\'content\']\n'
lines[3078] = '            finally:\n'
lines[3079] = '                session.close()\n'
lines[3080] = '\n'

with open('app.py', 'w', encoding='utf-8') as f:
    f.writelines(lines)

print("✅ Fixed!")

# Test compilation
import py_compile
try:
    py_compile.compile('app.py', doraise=True)
    print("✅ app.py compiles successfully!")
except py_compile.PyCompileError as e:
    print(f"❌ Compilation error: {e}")
