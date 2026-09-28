"""
Exposes the self-healing engine's own state as Prometheus metrics on
:METRICS_PORT/metrics. CPU and memory usage per container come from
cAdvisor (see monitoring/prometheus/prometheus.yml) — this module only
covers the things cAdvisor can't know: application health, restart
counts, and restart timestamps.
"""

import logging
import time

from prometheus_client import Gauge, Counter, start_http_server

import config

logger = logging.getLogger("self-healing-engine")

# 1 = last check was healthy, 0 = unhealthy
APP_UP = Gauge(
    "app_health_status",
    "Application health status as seen by the self-healing engine (1=healthy, 0=unhealthy)",
    ["container"],
)

# 1 = container running, 0 = not running / not found
CONTAINER_RUNNING = Gauge(
    "container_running_status",
    "Docker container running status (1=running, 0=not running)",
    ["container"],
)

# Unix timestamp of the most recent restart triggered by the engine
LAST_RESTART_TIMESTAMP = Gauge(
    "container_last_restart_timestamp_seconds",
    "Unix timestamp of the last restart triggered by the self-healing engine",
    ["container"],
)

# Cumulative count of restarts the engine has triggered
RESTART_TOTAL = Counter(
    "container_restart_total",
    "Total number of automatic restarts triggered by the self-healing engine",
    ["container"],
)


def start_metrics_server():
    start_http_server(config.METRICS_PORT)
    logger.info("Prometheus metrics available on :%d/metrics", config.METRICS_PORT)


def record_health_check(container: str, healthy: bool):
    APP_UP.labels(container=container).set(1 if healthy else 0)


def record_container_status(container: str, running: bool):
    CONTAINER_RUNNING.labels(container=container).set(1 if running else 0)


def record_restart(container: str):
    RESTART_TOTAL.labels(container=container).inc()
    LAST_RESTART_TIMESTAMP.labels(container=container).set(time.time())
