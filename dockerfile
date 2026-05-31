FROM python:3.12-slim

WORKDIR /app

# System dependencies
RUN apt-get update && apt-get install -y \
    gcc libpq-dev curl \
    && rm -rf /var/lib/apt/lists/*

# Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install gunicorn psycopg2-binary

# Copy project
COPY . .

# Static files
RUN python manage.py collectstatic --noinput

EXPOSE 8000

CMD ["gunicorn", "webcrm.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3"]