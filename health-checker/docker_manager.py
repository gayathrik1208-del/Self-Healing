"""
Handles restarting the unhealthy container. Two modes:
  - "sdk": talks to the Docker Engine API via the docker Python SDK
           (requires /var/run/docker.sock mounted into this container)
  - "cli": shells out to `docker restart <name>` (use when running this
           script directly on the host, outside a container)
"""

import logging
import subprocess

import config

logger = logging.getLogger("self-healing-engine")

_docker_client = None

if config.DOCKER_MODE == "sdk":
    import docker  # docker-py

    def _get_client():
        global _docker_client
        if _docker_client is None:
            _docker_client = docker.from_env()
        return _docker_client


def restart_container() -> bool:
    """Restarts the target container. Returns True if the restart command succeeded."""
    name = config.CONTAINER_NAME
    logger.warning("Restarting container '%s'...", name)

    if config.DOCKER_MODE == "sdk":
        try:
            client = _get_client()
            container = client.containers.get(name)
            container.restart(timeout=10)
            return True
        except Exception as exc:  # docker.errors.NotFound / APIError, kept broad on purpose
            logger.error("SDK restart of '%s' failed: %s", name, exc)
            return False
    else:
        try:
            result = subprocess.run(
                ["docker", "restart", name],
                capture_output=True,
                text=True,
                timeout=30,
            )
            if result.returncode != 0:
                logger.error("CLI restart of '%s' failed: %s", name, result.stderr.strip())
                return False
            return True
        except (subprocess.SubprocessError, OSError) as exc:
            logger.error("CLI restart of '%s' raised an exception: %s", name, exc)
            return False


def is_container_running() -> bool:
    """Extra signal alongside the HTTP health check: is the container itself up?"""
    name = config.CONTAINER_NAME

    if config.DOCKER_MODE == "sdk":
        try:
            client = _get_client()
            container = client.containers.get(name)
            return container.status == "running"
        except Exception as exc:
            logger.error("SDK status check of '%s' failed: %s", name, exc)
            return False
    else:
        try:
            result = subprocess.run(
                ["docker", "inspect", "-f", "{{.State.Running}}", name],
                capture_output=True,
                text=True,
                timeout=10,
            )
            return result.returncode == 0 and result.stdout.strip() == "true"
        except (subprocess.SubprocessError, OSError) as exc:
            logger.error("CLI status check of '%s' raised an exception: %s", name, exc)
            return False
