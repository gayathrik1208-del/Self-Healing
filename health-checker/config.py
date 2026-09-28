"""
Central configuration for the self-healing engine.
Every value can be overridden via environment variables (see .env.example).
"""

import os


def _bool(env_val, default=False):
    if env_val is None:
        return default
    return env_val.strip().lower() in ("1", "true", "yes", "on")


# --- Target application to watch ---
HEALTH_CHECK_URL = os.getenv("HEALTH_CHECK_URL", "http://backend:5000/api/health")
CONTAINER_NAME = os.getenv("TARGET_CONTAINER_NAME", "ecommerce-backend")

# --- Timing ---
CHECK_INTERVAL_SECONDS = int(os.getenv("CHECK_INTERVAL_SECONDS", "30"))
HTTP_TIMEOUT_SECONDS = int(os.getenv("HTTP_TIMEOUT_SECONDS", "5"))
POST_RESTART_WAIT_SECONDS = int(os.getenv("POST_RESTART_WAIT_SECONDS", "8"))
VERIFY_RETRY_COUNT = int(os.getenv("VERIFY_RETRY_COUNT", "3"))
VERIFY_RETRY_DELAY_SECONDS = int(os.getenv("VERIFY_RETRY_DELAY_SECONDS", "5"))

# --- Consecutive-failure threshold before we actually restart ---
# Avoids restarting on a single transient blip.
FAILURE_THRESHOLD = int(os.getenv("FAILURE_THRESHOLD", "2"))

# --- MongoDB (for recovery logs, read by the Admin Module's "View Recovery Logs" page) ---
MONGO_URI = os.getenv(
    "MONGO_URI",
    "mongodb://admin:adminpassword@mongo:27017/ecommerce?authSource=admin",
)
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "ecommerce")
RECOVERY_LOG_COLLECTION = os.getenv("RECOVERY_LOG_COLLECTION", "recovery_logs")

# --- Email alerts (SMTP) ---
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USE_TLS = _bool(os.getenv("SMTP_USE_TLS"), True)
SMTP_USERNAME = os.getenv("SMTP_USERNAME", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
ALERT_FROM_EMAIL = os.getenv("ALERT_FROM_EMAIL", SMTP_USERNAME)
ALERT_TO_EMAILS = [
    e.strip() for e in os.getenv("ALERT_TO_EMAILS", "").split(",") if e.strip()
]

# --- Prometheus metrics endpoint (Module 6 monitoring dashboard) ---
METRICS_PORT = int(os.getenv("METRICS_PORT", "9200"))

# --- Docker access mode ---
# "sdk"  -> use the docker Python SDK against /var/run/docker.sock (recommended in Compose)
# "cli"  -> shell out to the `docker` CLI (use when running the checker directly on the host)
DOCKER_MODE = os.getenv("DOCKER_MODE", "sdk")
