"""
Self-Healing Engine — the centerpiece of the project.

Every CHECK_INTERVAL_SECONDS (default 30s):
  1. Hit the application's /health endpoint.
  2. If healthy       -> keep monitoring, reset failure counter.
  3. If unhealthy      -> restart the Docker container, verify it recovered,
                          record the event, and send an email alert.

Run with:  python main.py
"""

import logging
import time

import requests

import config
import docker_manager
import metrics
import notifier
import recovery_log

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
logger = logging.getLogger("self-healing-engine")


def check_health() -> bool:
    """Returns True if the application's /health endpoint reports healthy."""
    try:
        response = requests.get(config.HEALTH_CHECK_URL, timeout=config.HTTP_TIMEOUT_SECONDS)
        healthy = response.status_code == 200
    except requests.RequestException as exc:
        logger.warning("Health check request failed: %s", exc)
        healthy = False

    metrics.record_health_check(config.CONTAINER_NAME, healthy)
    return healthy


def verify_recovery() -> bool:
    """After a restart, poll the health endpoint a few times before giving up."""
    for attempt in range(1, config.VERIFY_RETRY_COUNT + 1):
        time.sleep(config.VERIFY_RETRY_DELAY_SECONDS)
        if check_health():
            logger.info("Recovery verified on attempt %d/%d", attempt, config.VERIFY_RETRY_COUNT)
            return True
        logger.warning("Recovery not yet verified (attempt %d/%d)", attempt, config.VERIFY_RETRY_COUNT)
    return False


def handle_unhealthy():
    container = config.CONTAINER_NAME
    logger.error("'%s' failed its health check.", container)
    recovery_log.record_event(
        event="unhealthy_detected",
        status="failure",
        details=f"Health check against {config.HEALTH_CHECK_URL} failed.",
    )
    notifier.alert_unhealthy(container)

    restarted = docker_manager.restart_container()
    if restarted:
        metrics.record_restart(container)
    recovery_log.record_event(
        event="restart_triggered",
        status="success" if restarted else "failure",
        details="docker restart command issued" if restarted else "docker restart command failed to execute",
    )
    metrics.record_container_status(container, docker_manager.is_container_running())

    if not restarted:
        notifier.alert_recovery_failed(container)
        recovery_log.record_event(
            event="recovery_failed",
            status="failure",
            details="Could not issue restart command; manual intervention required.",
        )
        return

    time.sleep(config.POST_RESTART_WAIT_SECONDS)

    if verify_recovery():
        recovery_log.record_event(
            event="recovery_verified",
            status="success",
            details="Application responded healthy after restart.",
        )
        notifier.alert_recovery_success(container)
    else:
        recovery_log.record_event(
            event="recovery_failed",
            status="failure",
            details=f"Still unhealthy after {config.VERIFY_RETRY_COUNT} verification attempts.",
        )
        notifier.alert_recovery_failed(container)


def main():
    metrics.start_metrics_server()

    logger.info(
        "Self-healing engine started. Watching %s every %ds (target container: %s)",
        config.HEALTH_CHECK_URL,
        config.CHECK_INTERVAL_SECONDS,
        config.CONTAINER_NAME,
    )

    consecutive_failures = 0

    while True:
        healthy = check_health()
        metrics.record_container_status(config.CONTAINER_NAME, docker_manager.is_container_running())

        if healthy:
            if consecutive_failures > 0:
                logger.info("Application recovered on its own; resetting failure counter.")
            consecutive_failures = 0
            logger.info("Health check OK.")
        else:
            consecutive_failures += 1
            logger.warning(
                "Health check failed (%d/%d consecutive failures).",
                consecutive_failures,
                config.FAILURE_THRESHOLD,
            )
            if consecutive_failures >= config.FAILURE_THRESHOLD:
                handle_unhealthy()
                consecutive_failures = 0

        time.sleep(config.CHECK_INTERVAL_SECONDS)


if __name__ == "__main__":
    main()
