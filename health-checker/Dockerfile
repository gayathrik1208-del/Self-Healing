# ---- Health Checker Dockerfile (Python) ----
FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Prometheus scrapes metrics from here (Module 6 monitoring dashboard)
EXPOSE 9200

CMD ["python", "main.py"]
