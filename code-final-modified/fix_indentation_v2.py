#!/usr/bin/env python3
"""
Fix the indentation error in app.py - Version 2
This script will correctly fix the structure
"""

# Read the file
with open('app.py', 'r', encoding='utf-8') as f:
    lines = f.readlines()

print("Fixing indentation...")

# The issue is that lines 3212-3220 got the indentation messed up
# Let's fix from line 3212 onwards

# Line 3212 should be at 16 spaces
lines[3211] = '                # Add AI best practices\n'
lines[3212] = '                if ai_result.get(\'best_practices\'):\n'
lines[3213] = '                    for practice in ai_result[\'best_practices\']:\n'
lines[3214] = '                        suggestions.append({\n'
lines[3215] = '                            \'priority\': \'info\',\n'
lines[3216] = '                            \'title\': \'✅ Best Practice\',\n'
lines[3217] = '                            \'description\': practice,\n'
lines[3218] = '                            \'example\': \'Applied in optimized query\'\n'
lines[3219] = '                        })\n'
lines[3220] = '\n'

# Lines 3222-3225 should be at 16 spaces (NOT inside the for loop)
lines[3221] = '                # Calculate AI-based performance gain\n'
lines[3222] = '                performance_gain = ai_result.get(\'performance_gain\', \'Unknown\')\n'
lines[3223] = '\n'
lines[3224] = '                logger.info(f"AI optimization completed successfully using {ai_result.get(\'ai_provider\', \'unknown\')}")\n'

# Line 3226 - else matching if ai_result.get('success') at line 3178 (12 spaces)
lines[3225] = '            else:\n'
lines[3226] = '                # AI failed, fall back to rule-based\n'
lines[3227] = '                logger.warning(f"AI optimization failed: {ai_result.get(\'error\', \'Unknown error\')}, using rule-based optimization")\n'
lines[3228] = '                optimized_query = original_query\n'
lines[3229] = '                suggestions.append({\n'
lines[3230] = '                    \'priority\': \'info\',\n'
lines[3231] = '                    \'title\': \'⚠️ AI Optimization Unavailable\',\n'
lines[3232] = '                    \'description\': ai_result.get(\'error\', \'AI model is not available\'),\n'
lines[3233] = '                    \'example\': \'Using rule-based optimization instead\'\n'
lines[3234] = '                })\n'

# Line 3236 - else matching if use_ai and AI_MODEL_AVAILABLE at line 3174 (8 spaces)
lines[3235] = '        else:\n'
lines[3236] = '            # AI not available or not requested, use rule-based optimization\n'
lines[3237] = '            optimized_query = original_query\n'
lines[3238] = '            if not AI_MODEL_AVAILABLE:\n'
lines[3239] = '                suggestions.append({\n'
lines[3240] = '                    \'priority\': \'info\',\n'
lines[3241] = '                    \'title\': \'ℹ️ AI Model Not Configured\',\n'
lines[3242] = '                    \'description\': \'Set AI_API_KEY environment variable to enable AI-powered optimization. Using rule-based optimization instead.\',\n'
lines[3243] = '                    \'example\': \'export AI_API_KEY="your-api-key-here"\'\n'
lines[3244] = '                })\n'
lines[3245] = '\n'

# Rule-based optimization section (8 spaces)
lines[3246] = '        # RULE-BASED OPTIMIZATION (Always run if AI is not used or as enhancement)\n'
lines[3247] = '        # STEP 1: AGGRESSIVE OPTIMIZATION - Actually rewrite the query\n'
lines[3248] = '        # Only run rule-based if AI was not successful\n'
lines[3249] = '        if not ai_used:\n'
lines[3250] = '            optimized_query, aggressive_changes = perform_aggressive_optimization(original_query, db_type, options)\n'
lines[3251] = '        else:\n'
lines[3252] = '            # AI was used, skip aggressive optimization to avoid conflicts\n'
lines[3253] = '            aggressive_changes = []\n'
lines[3254] = '\n'
lines[3255] = '        # Add aggressive optimization results\n'
lines[3256] = '        for change in aggressive_changes:\n'

# Write back
with open('app.py', 'w', encoding='utf-8') as f:
    f.writelines(lines)

print("✅ Indentation fixed successfully!")
print("Fixed lines 3212-3256 in app.py")
print("\nTesting Python compilation...")

import py_compile
try:
    py_compile.compile('app.py', doraise=True)
    print("✅ app.py compiles successfully - no syntax errors!")
except py_compile.PyCompileError as e:
    print(f"❌ Compilation error: {e}")
