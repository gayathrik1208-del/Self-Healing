# Module 5 — Self-Healing Engine

The core, unique feature of the project: a Python loop that watches the backend's
`/health` endpoint every 30 seconds and automatically restarts it if it goes down.

## How the loop works (`main.py`)

1. **Check** — `GET` the backend's health endpoint (`HEALTH_CHECK_URL`).
2. **Healthy** → log it, keep monitoring, reset the failure counter.
3. **Unhealthy** (after `FAILURE_THRESHOLD` consecutive failures, default 2, to avoid
   overreacting to one transient blip):
   - Record an `unhealthy_detected` event.
   - Send an email alert.
   - **Restart** the target Docker container (`docker_manager.py`).
   - Wait, then **verify** recovery by polling `/health` again (`VERIFY_RETRY_COUNT` attempts).
   - Record `recovery_verified` (success) or `recovery_failed` (still down) in MongoDB.
   - Send a follow-up email — recovery confirmed, or an urgent "still down" alert.

Every event is written to the `recovery_logs` collection in MongoDB, which is exactly what
your Admin Module's "View Recovery Logs" page reads from. If Mongo itself is unreachable,
events fall back to a local `recovery_events.log` file so nothing is silently lost.

## Files

| File | Purpose |
|---|---|
| `main.py` | The monitoring loop — start here |
| `config.py` | All settings, driven by environment variables |
| `docker_manager.py` | Restarts/inspects the container (Docker SDK or CLI) |
| `notifier.py` | Sends the three email alerts (unhealthy, recovered, still-down) |
| `recovery_log.py` | Writes events to MongoDB (with a file fallback) |
| `requirements.txt` | `requests`, `pymongo`, `docker` |
| `Dockerfile` | Runs the loop as its own container |
| `.env.example` | All the environment variables below, with defaults |

## Wiring it in

This is already added as a `health-checker` service in the Module 3 `docker-compose.yml`,
sitting alongside `frontend`, `backend`, and `mongo`. It:
- depends on `backend` and `mongo` being up first
- mounts `/var/run/docker.sock` so it can issue restart commands to the `backend`
  container from inside its own container (this is what `DOCKER_MODE=sdk` needs)
- reads the same Mongo credentials as the rest of the stack

Add the SMTP values to your root `.env` file (see the Module 3 `.env.example` — extend it
with `SMTP_USERNAME`, `SMTP_PASSWORD`, `ALERT_TO_EMAILS`, etc. from
`health-checker/.env.example`).

**Gmail note:** if `SMTP_HOST=smtp.gmail.com`, `SMTP_PASSWORD` must be a 16-character
[App Password](https://myaccount.google.com/apppasswords), not your normal Gmail password
(Google blocks plain password SMTP logins).

## Before you run it

1. Confirm `HEALTH_CHECK_URL` matches the route you added in Module 3
   (`http://backend:5000/api/health`, inside the Compose network).
2. Confirm `TARGET_CONTAINER_NAME` matches the backend's `container_name` in
   `docker-compose.yml` (`ecommerce-backend`).
3. Set real SMTP credentials and at least one `ALERT_TO_EMAILS` recipient, or emails will
   be skipped (logged, not fatal).
4. `docker compose up --build` — the health-checker starts alongside the rest of the stack.

## Testing it works

Force a failure to watch the full cycle end-to-end:
```bash
# stop the backend without touching the health-checker
docker stop ecommerce-backend
```
Within ~30–60s (one check interval plus the failure threshold) you should see the
health-checker's logs show `unhealthy_detected` → `restart_triggered` → `recovery_verified`,
a new document in `recovery_logs`, and two emails (unhealthy alert, then recovery alert).

```bash
docker compose logs -f health-checker
```
