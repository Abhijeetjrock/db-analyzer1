#!/usr/bin/env python3
"""
Fix the indentation error in app.py
This script will correct the indentation on lines 3220-3260
"""

# Read the file
with open('app.py', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Fix line 3220 (currently 48 spaces, should be 24)
lines[3219] = '                        })\n'

# Fix lines 3222-3225 (currently 40 spaces, should be 16)
lines[3221] = '                # Calculate AI-based performance gain\n'
lines[3222] = '                performance_gain = ai_result.get(\'performance_gain\', \'Unknown\')\n'
lines[3223] = '\n'
lines[3224] = '                logger.info(f"AI optimization completed successfully using {ai_result.get(\'ai_provider\', \'unknown\')}")\n'

# Fix line 3226 (currently 36 spaces, should be 12 for else matching line 3178)
lines[3225] = '            else:\n'

# Fix lines 3227-3235 (currently 40 spaces, should be 16)
lines[3226] = '                # AI failed, fall back to rule-based\n'
lines[3227] = '                logger.warning(f"AI optimization failed: {ai_result.get(\'error\', \'Unknown error\')}, using rule-based optimization")\n'
lines[3228] = '                optimized_query = original_query\n'
lines[3229] = '                suggestions.append({\n'
lines[3230] = '                    \'priority\': \'info\',\n'
lines[3231] = '                    \'title\': \'⚠️ AI Optimization Unavailable\',\n'
lines[3232] = '                    \'description\': ai_result.get(\'error\', \'AI model is not available\'),\n'
lines[3233] = '                    \'example\': \'Using rule-based optimization instead\'\n'
lines[3234] = '                })\n'

# Fix line 3236 (currently 24 spaces, should be 8 for else matching line 3174)
lines[3235] = '        else:\n'

# Fix lines 3237-3245 (adjust to proper indentation)
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

# Fix lines 3247-3254 (rule-based optimization section - should be at 8 spaces)
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
print("Fixed lines 3220-3256 in app.py")
print("\nPlease restart your Python server and test the query optimizer.")
