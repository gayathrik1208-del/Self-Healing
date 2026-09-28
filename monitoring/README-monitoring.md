# Module 6 — Monitoring Dashboard

Prometheus + Grafana, wired to the metrics already exposed by the self-healing engine
(Module 5) and cAdvisor.

## What gets shown, and where each metric comes from

| Requirement | Metric | Source |
|---|---|---|
| Application status | `app_health_status{container="ecommerce-backend"}` | health-checker (`metrics.py`), set on every 30s check |
| CPU usage | `container_cpu_usage_seconds_total` (rate, %) | cAdvisor |
| Memory usage | `container_memory_usage_bytes` | cAdvisor |
| Docker container status | `container_running_status` | health-checker (`docker_manager.is_container_running()`) |
| Last restart time | `container_last_restart_timestamp_seconds` | health-checker, set on every restart |
| Total restart count | `container_restart_total` | health-checker, incremented on every restart |

## New services (already added to `docker-compose.yml`)

- **cadvisor** (`gcr.io/cadvisor/cadvisor`) — reads container CPU/memory stats straight from
  the Docker Engine; needs read-only access to `/rootfs`, `/sys`, `/var/lib/docker`. Exposed
  on `:8080`.
- **prometheus** — scrapes `health-checker:9200/metrics` and `cadvisor:8080/metrics` every
  15s, per `monitoring/prometheus/prometheus.yml`. Exposed on `:9090`.
- **grafana** — auto-provisioned with a Prometheus datasource and the dashboard below, so
  it's ready to view with zero manual setup. Exposed on `:3000`.

## Files

```
monitoring/
├── prometheus/
│   └── prometheus.yml                          # scrape targets
└── grafana/
    ├── provisioning/
    │   ├── datasources/datasource.yml           # points Grafana at Prometheus
    │   └── dashboards/dashboard.yml             # tells Grafana to load dashboards from disk
    └── dashboards/
        └── self-healing-dashboard.json          # the 6 panels above, ready to go
```

Also touched: `health-checker/metrics.py` (exports the four custom metrics on `:9200`),
`health-checker/config.py` (`METRICS_PORT`), and `main.py` (calls `metrics.start_metrics_server()`
and records a value on every check/restart) — these were already in place from Module 5.

## Running it

```bash
docker compose up --build
```

Then open:
- **Grafana** → http://localhost:3000 (login: `admin` / `admin` by default — override with
  `GRAFANA_ADMIN_USER` / `GRAFANA_ADMIN_PASSWORD` in your `.env`). The "Self-Healing
  E-Commerce — Monitoring" dashboard is already there, no manual import needed.
- **Prometheus** → http://localhost:9090 — useful for checking targets are `UP` under
  Status → Targets, or running ad-hoc queries.
- **cAdvisor** → http://localhost:8080 — raw per-container metrics, mostly useful for
  debugging if a panel looks empty.

## If a panel looks empty

- **CPU/Memory panels blank** → check `container_cpu_usage_seconds_total` exists at all in
  Prometheus (Graph tab, http://localhost:9090/graph). cAdvisor's `name` label matches the
  Docker `container_name`, so the dashboard filters on `name=~"ecommerce-.+"` — if your
  containers use different names, update the queries or the `container_name` values in
  `docker-compose.yml` to match.
- **Application Status / Restart panels blank** → confirm `health-checker` is actually
  reachable at `:9200/metrics` (`docker compose logs health-checker` should show "Prometheus
  metrics available on :9200/metrics").
