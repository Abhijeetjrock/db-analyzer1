"""
Natural Language to SQL API Endpoints
Add these endpoints to app.py before the final if __name__ == '__main__' block
"""

@app.route('/api/nl-to-sql', methods=['POST'])
def nl_to_sql_generate():
    """
    Generate SQL from natural language using AI
    Supports 0-shot, 1-shot, and few-shot learning
    """
    try:
        data = request.get_json()
        nl_prompt = data.get('nl_prompt', '').strip()
        learning_mode = data.get('learning_mode', 'zero-shot')
        use_ai = data.get('use_ai', True)
        target_databases = data.get('target_databases', {})
        example_prompt = data.get('example_prompt', '').strip()
        example_sql = data.get('example_sql', '').strip()
        
        if not nl_prompt:
            return jsonify({
                'success': False,
                'error': 'Natural language prompt is required'
            }), 400
        
        # Validate at least one target database is selected
        if not any(target_databases.values()):
            return jsonify({
                'success': False,
                'error': 'At least one target database must be selected'
            }), 400
        
        # Validate examples for 1-shot and few-shot modes
        if learning_mode != 'zero-shot':
            if not example_prompt or not example_sql:
                return jsonify({
                    'success': False,
                    'error': f'{learning_mode} mode requires both example prompt and SQL'
                }), 400
        
        generated_sql = {}
        ai_used = False
        explanation = ''
        
        # Generate SQL using AI if available and requested
        if use_ai and AI_MODEL_AVAILABLE:
            ai_result = call_ai_for_nl_to_sql(
                nl_prompt=nl_prompt,
                learning_mode=learning_mode,
                example_prompt=example_prompt,
                example_sql=example_sql,
                target_databases=target_databases
            )
            
            if ai_result.get('success'):
                ai_used = True
                generated_sql = ai_result.get('generated_sql', {})
                explanation = ai_result.get('explanation', '')
            else:
                # AI failed, fall back to rule-based
                logger.warning(f"AI generation failed: {ai_result.get('error')}, using rule-based")
                generated_sql = generate_sql_rule_based(nl_prompt, target_databases)
        else:
            # Use rule-based generation
            generated_sql = generate_sql_rule_based(nl_prompt, target_databases)
        
        return jsonify({
            'success': True,
            'generated_sql': generated_sql,
            'ai_used': ai_used,
            'ai_provider': AI_MODEL_PROVIDER if ai_used else None,
            'learning_mode': learning_mode,
            'explanation': explanation
        })
        
    except Exception as e:
        logger.error(f"NL to SQL generation error: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


def call_ai_for_nl_to_sql(nl_prompt, learning_mode, example_prompt, example_sql, target_databases):
    """Call AI model to generate SQL from natural language"""
    try:
        # Build the prompt based on learning mode
        system_prompt = """You are an expert SQL developer. Generate SQL queries from natural language descriptions.
Your task is to convert user requirements into correct, optimized SQL queries for different database platforms.

IMPORTANT:
- Generate syntactically correct SQL
- Use appropriate database-specific syntax
- Follow best practices for each database
- Return ONLY the SQL code, no explanations in the SQL itself
- Use proper formatting and indentation"""

        user_prompt = f"""Convert this natural language requirement into SQL queries:

Requirement: {nl_prompt}

"""

        # Add examples for 1-shot and few-shot learning
        if learning_mode == 'one-shot' and example_prompt and example_sql:
            user_prompt += f"""Example for reference:
Natural Language: {example_prompt}
SQL: {example_sql}

"""
        elif learning_mode == 'few-shot' and example_prompt and example_sql:
            user_prompt += f"""Examples for reference:
1. Natural Language: {example_prompt}
   SQL: {example_sql}

(You can provide more examples to improve accuracy)

"""

        # Add database-specific requests
        requested_dbs = []
        if target_databases.get('oracle'):
            requested_dbs.append('Oracle SQL')
        if target_databases.get('databricks'):
            requested_dbs.append('Databricks SQL')
        if target_databases.get('snowflake'):
            requested_dbs.append('Snowflake SQL')
        
        user_prompt += f"""Generate SQL for these database platforms:
{', '.join(requested_dbs)}

Provide the response in JSON format like this:
{{
    "oracle": "SELECT ... (Oracle-specific SQL)" or null,
    "databricks": "SELECT ... (Databricks-specific SQL)" or null,
    "snowflake": "SELECT ... (Snowflake-specific SQL)" or null,
    "explanation": "Brief explanation of the query logic"
}}

Generate only for the requested databases. Use null for others."""

        # Call AI model
        if AI_MODEL_PROVIDER == 'openai':
            headers = {
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {AI_API_KEY}'
            }
            
            payload = {
                'model': OPENAI_MODEL,
                'messages': [
                    {'role': 'system', 'content': system_prompt},
                    {'role': 'user', 'content': user_prompt}
                ],
                'temperature': 0.3,
                'max_tokens': 1500
            }
            
            logger.info("Calling OpenAI for NL to SQL generation...")
            session_req = requests.Session()
            session_req.verify = False
            
            try:
                response = session_req.post(
                    OPENAI_API_URL,
                    headers=headers,
                    json=payload,
                    timeout=30
                )
                
                # Handle different error codes with helpful messages
                if response.status_code == 429:
                    error_msg = "Rate limit exceeded. Free tier: 3 requests/min. Try again in a minute or upgrade your plan."
                    logger.warning(error_msg)
                    return {
                        'success': False,
                        'error': error_msg
                    }
                elif response.status_code == 401:
                    error_msg = "Invalid API key. Please check your OpenAI API key in .env file."
                    logger.error(error_msg)
                    return {
                        'success': False,
                        'error': error_msg
                    }
                elif response.status_code == 403:
                    error_msg = "Access forbidden. Your API key may not have permission for this model or the key is invalid."
                    logger.error(error_msg)
                    return {
                        'success': False,
                        'error': error_msg
                    }
                
                response.raise_for_status()
                result = response.json()
                ai_response = result['choices'][0]['message']['content']
            finally:
                session_req.close()
                
        elif AI_MODEL_PROVIDER == 'gemini':
            headers = {
                'Content-Type': 'application/json'
            }
            
            payload = {
                'contents': [{
                    'parts': [{
                        'text': f"{system_prompt}\n\n{user_prompt}"
                    }]
                }],
                'generationConfig': {
                    'temperature': 0.3,
                    'maxOutputTokens': 1500
                }
            }
            
            api_url = f"{GEMINI_API_URL}?key={AI_API_KEY}"
            
            logger.info("Calling Gemini for NL to SQL generation...")
            response = requests.post(api_url, headers=headers, json=payload, timeout=30, verify=False)
            response.raise_for_status()
            
            result = response.json()
            ai_response = result['candidates'][0]['content']['parts'][0]['text']
        
        else:
            return {
                'success': False,
                'error': f'Unsupported AI provider: {AI_MODEL_PROVIDER}'
            }
        
        # Parse AI response
        try:
            import re
            # Try to extract JSON from the response
            json_match = re.search(r'```(?:json)?\s*(\{.*\})\s*```', ai_response, re.DOTALL)
            if json_match:
                ai_data = json.loads(json_match.group(1))
            else:
                # Try to parse the entire response as JSON
                ai_data = json.loads(ai_response)
        except json.JSONDecodeError:
            # If JSON parsing fails, try to extract SQL manually
            logger.warning("AI response is not valid JSON, attempting manual extraction")
            ai_data = extract_sql_from_text(ai_response, target_databases)
        
        # Build final SQL dictionary
        generated_sql = {}
        if target_databases.get('oracle') and ai_data.get('oracle'):
            generated_sql['oracle'] = ai_data['oracle']
        if target_databases.get('databricks') and ai_data.get('databricks'):
            generated_sql['databricks'] = ai_data['databricks']
        if target_databases.get('snowflake') and ai_data.get('snowflake'):
            generated_sql['snowflake'] = ai_data['snowflake']
        
        return {
            'success': True,
            'generated_sql': generated_sql,
            'explanation': ai_data.get('explanation', 'SQL generated from natural language'),
            'ai_provider': AI_MODEL_PROVIDER
        }
        
    except Exception as e:
        logger.error(f"AI NL to SQL error: {str(e)}")
        return {
            'success': False,
            'error': str(e)
        }


def extract_sql_from_text(text, target_databases):
    """Extract SQL from AI response text when JSON parsing fails"""
    import re
    
    result = {}
    
    # Try to find SQL code blocks or SQL-like patterns
    sql_pattern = r'(?:SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP)\s+.*?(?:;|$)'
    sql_matches = re.findall(sql_pattern, text, re.IGNORECASE | re.DOTALL)
    
    if sql_matches:
        # Assign the first match to each requested database
        sql_query = sql_matches[0].strip()
        
        if target_databases.get('oracle'):
            result['oracle'] = sql_query
        if target_databases.get('databricks'):
            result['databricks'] = sql_query
        if target_databases.get('snowflake'):
            result['snowflake'] = sql_query
    
    return result


def generate_sql_rule_based(nl_prompt, target_databases):
    """Generate SQL using rule-based approach (fallback when AI not available)"""
    import re
    
    nl_lower = nl_prompt.lower()
    generated_sql = {}
    
    # Simple pattern matching for common queries
    sql_template = None
    
    # Pattern: Get all/select from table
    if re.search(r'get all|select all|show all|list all', nl_lower):
        table_match = re.search(r'from\s+(\w+)|in\s+(\w+)|\s+(\w+)\s+table', nl_lower)
        if table_match:
            table = table_match.group(1) or table_match.group(2) or table_match.group(3)
            sql_template = f"SELECT * FROM {table}"
    
    # Pattern: Count
    elif re.search(r'count|how many|number of', nl_lower):
        table_match = re.search(r'from\s+(\w+)|in\s+(\w+)|\s+(\w+)\s+table|\s+(\w+)s?\s', nl_lower)
        if table_match:
            table = table_match.group(1) or table_match.group(2) or table_match.group(3) or table_match.group(4)
            sql_template = f"SELECT COUNT(*) FROM {table}"
    
    # Pattern: Filter with WHERE
    elif re.search(r'where|with|having', nl_lower):
        # This is complex, provide a template
        sql_template = "SELECT * FROM table_name WHERE condition = 'value'"
    
    # Pattern: Top N
    elif re.search(r'top\s+(\d+)|first\s+(\d+)|limit\s+(\d+)', nl_lower):
        limit_match = re.search(r'top\s+(\d+)|first\s+(\d+)|limit\s+(\d+)', nl_lower)
        if limit_match:
            limit = limit_match.group(1) or limit_match.group(2) or limit_match.group(3)
            table_match = re.search(r'from\s+(\w+)|in\s+(\w+)|\s+(\w+)\s+table', nl_lower)
            table = table_match.group(1) if table_match else 'table_name'
            
            if target_databases.get('oracle'):
                generated_sql['oracle'] = f"SELECT * FROM {table} WHERE ROWNUM <= {limit}"
            if target_databases.get('databricks'):
                generated_sql['databricks'] = f"SELECT * FROM {table} LIMIT {limit}"
            if target_databases.get('snowflake'):
                generated_sql['snowflake'] = f"SELECT * FROM {table} LIMIT {limit}"
            
            return generated_sql
    
    # Default template
    if not sql_template:
        sql_template = f"-- TODO: Convert this requirement to SQL\n-- Requirement: {nl_prompt}\nSELECT * FROM table_name WHERE condition = 'value'"
    
    # Generate for each requested database
    if target_databases.get('oracle'):
        generated_sql['oracle'] = sql_template
    if target_databases.get('databricks'):
        generated_sql['databricks'] = sql_template
    if target_databases.get('snowflake'):
        generated_sql['snowflake'] = sql_template
    
    return generated_sql


@app.route('/api/export-nl-to-sql', methods=['POST'])
def export_nl_to_sql():
    """Export generated SQL queries to a text file"""
    try:
        data = request.get_json()
        nl_prompt = data.get('nl_prompt', '')
        generated_sql = data.get('generated_sql', {})
        learning_mode = data.get('learning_mode', 'zero-shot')
        ai_used = data.get('ai_used', False)
        ai_provider = data.get('ai_provider', 'N/A')
        explanation = data.get('explanation', '')
        
        # Create formatted text content
        content = f"""{'='*80}
NATURAL LANGUAGE TO SQL GENERATION REPORT
{'='*80}

Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
AI Provider: {ai_provider.upper() if ai_used else 'Rule-Based'}
Learning Mode: {learning_mode.upper().replace('-', ' ')}

{'='*80}
NATURAL LANGUAGE REQUIREMENT
{'='*80}

{nl_prompt}

"""

        # Add explanation if available
        if explanation:
            content += f"""{'='*80}
AI EXPLANATION
{'='*80}

{explanation}

"""

        # Add generated SQL for each database
        if generated_sql.get('oracle'):
            content += f"""{'='*80}
ORACLE SQL
{'='*80}

{generated_sql['oracle']}

"""

        if generated_sql.get('databricks'):
            content += f"""{'='*80}
DATABRICKS SQL
{'='*80}

{generated_sql['databricks']}

"""

        if generated_sql.get('snowflake'):
            content += f"""{'='*80}
SNOWFLAKE SQL
{'='*80}

{generated_sql['snowflake']}

"""

        content += f"""{'='*80}
USAGE NOTES
{'='*80}

- Review and test the generated SQL before using in production
- Modify table names, column names, and conditions as needed
- Add appropriate indexes for better performance
- Consider adding error handling and validation

{'='*80}
END OF REPORT
{'='*80}
"""

        # Create BytesIO object
        output = io.BytesIO(content.encode('utf-8'))
        output.seek(0)
        
        # Generate filename
        filename = f"nl_to_sql_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
        
        # Also save to backup directory
        backup_path = os.path.join(BACKUP_DIR, filename)
        with open(backup_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        logger.info(f"NL to SQL export saved to: {backup_path}")
        
        return send_file(
            output,
            mimetype='text/plain',
            as_attachment=True,
            download_name=filename
        )
        
    except Exception as e:
        logger.error(f"Error exporting NL to SQL: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
