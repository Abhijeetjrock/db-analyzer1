# ============================================================================
# CORRECTED CODE SECTION FOR app.py lines 3220-3265
# Copy this and replace the broken section in app.py
# ============================================================================

# This is the continuation after line 3220:
#                         }})
#
# START COPYING FROM HERE (line 3222):

                # Calculate AI-based performance gain
                performance_gain = ai_result.get('performance_gain', 'Unknown')

                logger.info(f"AI optimization completed successfully using {ai_result.get('ai_provider', 'unknown')}")
            else:
                # AI failed, fall back to rule-based
                logger.warning(f"AI optimization failed: {ai_result.get('error', 'Unknown error')}, using rule-based optimization")
                optimized_query = original_query
                suggestions.append({
                    'priority': 'info',
                    'title': '⚠️ AI Optimization Unavailable',
                    'description': ai_result.get('error', 'AI model is not available'),
                    'example': 'Using rule-based optimization instead'
                })
        else:
            # AI not available or not requested, use rule-based optimization
            optimized_query = original_query
            if not AI_MODEL_AVAILABLE:
                suggestions.append({
                    'priority': 'info',
                    'title': 'ℹ️ AI Model Not Configured',
                    'description': 'Set AI_API_KEY environment variable to enable AI-powered optimization. Using rule-based optimization instead.',
                    'example': 'export AI_API_KEY="your-api-key-here"'
                })

        # RULE-BASED OPTIMIZATION (Always run if AI is not used or as enhancement)
        # STEP 1: AGGRESSIVE OPTIMIZATION - Actually rewrite the query
        # Only run rule-based if AI was not successful
        if not ai_used:
            optimized_query, aggressive_changes = perform_aggressive_optimization(original_query, db_type, options)
        else:
            # AI was used, skip aggressive optimization to avoid conflicts
            aggressive_changes = []
        
        # Add aggressive optimization results
        for change in aggressive_changes:
            optimizations_count += 1
            improvements.append({
                'title': change['description'],
                'description': change['description'],

# STOP COPYING HERE
# The above code should replace lines 3222 through approximately 3260
# Make sure to maintain proper indentation - count the spaces carefully!

# ============================================================================
# INDENTATION GUIDE:
# ============================================================================
# - Lines starting with 16 spaces (4 levels): Inside the "if ai_result.get('success'):" block
# - Lines starting with 12 spaces (3 levels): "else:" matching "if ai_result.get('success'):"
# - Lines starting with 8 spaces (2 levels): "else:" matching "if use_ai and AI_MODEL_AVAILABLE:"
# - Lines starting with 8 spaces: "# RULE-BASED OPTIMIZATION" and below
# ============================================================================
