# Use Python 3.11 slim image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements file
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV IS_CLOUD_DEPLOYMENT=true
ENV PORT=10000

# Expose port
EXPOSE 10000

# Run the application with gunicorn
CMD gunicorn --bind 0.0.0.0:$PORT --workers 4 --timeout 120 app:app
