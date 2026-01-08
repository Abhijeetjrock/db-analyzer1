# Rate Limit Management Guide

## What Changed?

I've added intelligent rate limiting to prevent hitting the OpenAI API rate limits before they happen!

## New Features

### 1. **Proactive Rate Limiting**
- The app now **checks** if you can make a request **before** calling the API
- Prevents 429 (Rate Limit Exceeded) errors
- Shows how many requests you have remaining

### 2. **Automatic Request Tracking**
- Tracks all API calls in a rolling 60-second window
- Free tier: 3 requests per minute
- Automatically resets as time passes

### 3. **User-Friendly Messages**
- If rate limit is reached, you'll see exactly how long to wait
- Example: "Rate limit exceeded. Please wait 45.2 seconds before trying again."

## How It Works

### Before (Old Behavior):
```
You → Make Request → OpenAI API → 429 Error → Fallback to Rule-Based
```

### Now (New Behavior):
```
You → Check Rate Limit → ✓ Allowed → OpenAI API → Success!
                       → ✗ Wait 30s → Show Message → Fallback to Rule-Based
```

## API Endpoint

Check rate limit status anytime:
```javascript
fetch('/api/rate-limit-status')
  .then(response => response.json())
  .then(data => {
      console.log(data.message); 
      // Example: "3/3 requests remaining"
  });
```

## Response Format

```json
{
  "success": true,
  "ai_available": true,
  "provider": "openai",
  "status": {
    "remaining_requests": 2,
    "max_requests": 3,
    "time_window": 60,
    "reset_in_seconds": 23.5,
    "requests_made": 1
  },
  "message": "2/3 requests remaining"
}
```

## Testing

1. **Start the application:**
   ```bash
   python app.py
   ```

2. **Make multiple optimization requests quickly** (more than 3 in a minute)

3. **Observe the behavior:**
   - First 3 requests: Work normally
   - 4th request within 60 seconds: Shows wait message
   - After waiting: Works again!

## Upgrading Limits

### For Paid OpenAI Accounts

If you upgrade to a paid plan with higher limits, update `rate_limiter.py`:

```python
# Find this line:
openai_rate_limiter = RateLimiter(max_requests=3, time_window=60)

# Change to your plan's limit (e.g., 60 requests/minute):
openai_rate_limiter = RateLimiter(max_requests=60, time_window=60)
```

### Common Paid Tier Limits:
- **Tier 1**: 60 requests/min
- **Tier 2**: 3,500 requests/min
- **Tier 3**: 5,000 requests/min

## Logs

Watch the terminal for helpful messages:

```
INFO:__main__:Calling OpenAI API for query optimization... (Remaining requests: 3)
INFO:rate_limiter:API call recorded. Status: {'remaining_requests': 2, ...}
WARNING:__main__:Rate limit exceeded. Please wait 45.0 seconds before trying again.
```

## Best Practices

### 1. **Use AI Sparingly on Free Tier**
- 3 requests per minute = 180 requests per hour
- Uncheck "Use AI" for simple queries
- Reserve AI for complex optimizations

### 2. **Batch Your Testing**
- Test multiple queries, then wait a minute
- Don't spam the optimize button

### 3. **Monitor Your Usage**
- Check `/api/rate-limit-status` endpoint
- Watch for "remaining_requests" count

### 4. **Upgrade When Needed**
If you find yourself frequently hitting the limit:
- Add payment method to OpenAI account
- Limits increase automatically to Tier 1 (60/min)
- Cost is still very low (~$0.01 per query)

## Troubleshooting

### Still Getting 429 Errors?

1. **Check if rate limiter is imported:**
   ```bash
   python -c "from rate_limiter import check_rate_limit; print('✓ Working')"
   ```

2. **Verify imports in app.py:**
   - Line should exist: `from rate_limiter import check_rate_limit, record_api_call, get_rate_limit_status`

3. **Check logs for warnings:**
   - Look for: `WARNING:rate_limiter:Rate limit reached`

### False Positives?

If you're getting rate limit warnings when you shouldn't:

1. **Clear the rate limiter state:**
   - Restart the Flask app
   - Rate limiter state resets on restart

2. **Check system clock:**
   - Rate limiter uses `time.time()`
   - Ensure system time is accurate

## Alternative: Switch to Gemini

Google Gemini has more generous free tier limits:

1. **Get Gemini API key** from https://makersuite.google.com/app/apikey

2. **Update app.py:**
   ```python
   AI_MODEL_PROVIDER = 'gemini'
   AI_API_KEY = 'your-gemini-key'
   ```

3. **Gemini Free Tier:**
   - 60 requests per minute
   - No credit card required

## Summary

✅ **Proactive rate limiting** - Prevents errors before they happen  
✅ **Smart waiting** - Shows exact wait time  
✅ **Fallback ready** - Automatically uses rule-based optimization  
✅ **Easy monitoring** - Check status via API endpoint  
✅ **Scalable** - Update limits when you upgrade

---

**Need Help?**  
Check the terminal logs for detailed rate limit information, or test with `/api/rate-limit-status` endpoint.
