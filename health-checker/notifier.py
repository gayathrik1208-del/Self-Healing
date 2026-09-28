"""
Sends email alerts over SMTP when the self-healing engine detects an
unhealthy application and takes action.
"""

import logging
import smtplib
from email.message import EmailMessage

import config

logger = logging.getLogger("self-healing-engine")


def send_alert(subject: str, body: str):
    if not config.ALERT_TO_EMAILS:
        logger.warning("No ALERT_TO_EMAILS configured; skipping email alert.")
        return
    if not config.SMTP_USERNAME or not config.SMTP_PASSWORD:
        logger.warning("SMTP credentials not configured; skipping email alert.")
        return

    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = config.ALERT_FROM_EMAIL
    msg["To"] = ", ".join(config.ALERT_TO_EMAILS)
    msg.set_content(body)

    try:
        with smtplib.SMTP(config.SMTP_HOST, config.SMTP_PORT, timeout=10) as server:
            if config.SMTP_USE_TLS:
                server.starttls()
            server.login(config.SMTP_USERNAME, config.SMTP_PASSWORD)
            server.send_message(msg)
        logger.info("Alert email sent: %s", subject)
    except (smtplib.SMTPException, OSError) as exc:
        logger.error("Failed to send alert email: %s", exc)


def alert_unhealthy(container: str):
    send_alert(
        subject=f"[Self-Healing Engine] {container} is unhealthy — restarting",
        body=(
            f"The health checker detected that '{container}' failed its "
            f"health check and is triggering an automatic restart.\n\n"
            f"This is an automated message from the Self-Healing E-Commerce Platform."
        ),
    )


def alert_recovery_success(container: str):
    send_alert(
        subject=f"[Self-Healing Engine] {container} recovered successfully",
        body=(
            f"'{container}' was restarted after failing its health check and "
            f"is now responding normally.\n\n"
            f"This is an automated message from the Self-Healing E-Commerce Platform."
        ),
    )


def alert_recovery_failed(container: str):
    send_alert(
        subject=f"[Self-Healing Engine] URGENT: {container} failed to recover",
        body=(
            f"'{container}' was restarted after failing its health check, but "
            f"it is STILL not responding after the configured retries. "
            f"Manual intervention is required.\n\n"
            f"This is an automated message from the Self-Healing E-Commerce Platform."
        ),
    )
