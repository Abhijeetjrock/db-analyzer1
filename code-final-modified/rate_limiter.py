"""
Rate Limiter for AI API Calls
Prevents exceeding API rate limits by tracking request timing
"""

import time
from collections import deque
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)


class RateLimiter:
    """
    Token bucket rate limiter for AI API calls
    
    Tracks request timing and enforces rate limits to prevent API errors
    """
    
    def __init__(self, max_requests=3, time_window=60):
        """
        Initialize rate limiter
        
        Args:
            max_requests: Maximum requests allowed in time window (default: 3 for free tier)
            time_window: Time window in seconds (default: 60 seconds)
        """
        self.max_requests = max_requests
        self.time_window = time_window
        self.requests = deque()  # Store timestamps of requests
        self.lock = False
        
    def can_make_request(self):
        """
        Check if a new request can be made without hitting rate limit
        
        Returns:
            tuple: (can_request: bool, wait_time: float)
                   If can_request is False, wait_time indicates seconds to wait
        """
        current_time = time.time()
        
        # Remove requests older than time window
        while self.requests and current_time - self.requests[0] > self.time_window:
            self.requests.popleft()
        
        # Check if we're under the limit
        if len(self.requests) < self.max_requests:
            return True, 0
        
        # Calculate wait time until oldest request expires
        oldest_request = self.requests[0]
        wait_time = self.time_window - (current_time - oldest_request)
        
        return False, max(0, wait_time)
    
    def record_request(self):
        """Record that a request was made"""
        self.requests.append(time.time())
        
    def get_status(self):
        """
        Get current rate limiter status
        
        Returns:
            dict: Status information including remaining requests and reset time
        """
        current_time = time.time()
        
        # Remove old requests
        while self.requests and current_time - self.requests[0] > self.time_window:
            self.requests.popleft()
        
        remaining = self.max_requests - len(self.requests)
        
        if self.requests:
            oldest = self.requests[0]
            reset_in = self.time_window - (current_time - oldest)
        else:
            reset_in = 0
            
        return {
            'remaining_requests': max(0, remaining),
            'max_requests': self.max_requests,
            'time_window': self.time_window,
            'reset_in_seconds': max(0, reset_in),
            'requests_made': len(self.requests)
        }
    
    def wait_if_needed(self):
        """
        Block execution if rate limit is exceeded
        Waits until a request slot becomes available
        """
        can_request, wait_time = self.can_make_request()
        
        if not can_request:
            logger.warning(f"Rate limit reached. Waiting {wait_time:.1f} seconds...")
            time.sleep(wait_time + 0.1)  # Add small buffer
            
        return True


# Global rate limiter instance for OpenAI API
# Free tier: 3 requests per minute
openai_rate_limiter = RateLimiter(max_requests=3, time_window=60)

# For paid tier, increase the limits:
# openai_rate_limiter = RateLimiter(max_requests=60, time_window=60)


def check_rate_limit(provider='openai'):
    """
    Check if we can make a request to the AI API
    
    Args:
        provider: AI provider name ('openai' or 'gemini')
        
    Returns:
        dict: {
            'allowed': bool,
            'wait_time': float (seconds to wait if not allowed),
            'message': str (user-friendly message)
        }
    """
    if provider.lower() == 'openai':
        can_request, wait_time = openai_rate_limiter.can_make_request()
        
        if can_request:
            return {
                'allowed': True,
                'wait_time': 0,
                'message': 'Request allowed'
            }
        else:
            return {
                'allowed': False,
                'wait_time': wait_time,
                'message': f'Rate limit exceeded. Please wait {wait_time:.1f} seconds. Free tier: 3 requests/min.'
            }
    
    # For other providers, allow by default (implement their limits as needed)
    return {'allowed': True, 'wait_time': 0, 'message': 'Request allowed'}


def record_api_call(provider='openai'):
    """
    Record that an API call was made
    
    Args:
        provider: AI provider name
    """
    if provider.lower() == 'openai':
        openai_rate_limiter.record_request()
        logger.info(f"API call recorded. Status: {openai_rate_limiter.get_status()}")


def get_rate_limit_status(provider='openai'):
    """
    Get current rate limit status
    
    Args:
        provider: AI provider name
        
    Returns:
        dict: Current status information
    """
    if provider.lower() == 'openai':
        return openai_rate_limiter.get_status()
    
    return {
        'remaining_requests': 'Unknown',
        'max_requests': 'Unknown',
        'time_window': 60,
        'reset_in_seconds': 0,
        'requests_made': 0
    }
