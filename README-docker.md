# Module 3 — Docker Deployment

Containerizes the Self-Healing E-Commerce Platform into three services: `frontend` (React, served by Nginx), `backend` (Node.js/Express), and `mongo` (MongoDB).

## File layout to drop into your repo

```
your-project/
├── docker-compose.yml
├── .env.example
├── backend/
│   ├── Dockerfile
│   ├── .dockerignore
│   └── ... (your existing Express app: server.js, routes/, models/, package.json)
└── frontend/
    ├── Dockerfile
    ├── nginx.conf
    ├── .dockerignore
    └── ... (your existing React app: src/, public/, package.json)
```

Place `backend/Dockerfile` and `backend/.dockerignore` inside your existing backend folder, and `frontend/Dockerfile`, `frontend/nginx.conf`, `frontend/.dockerignore` inside your existing frontend folder. `docker-compose.yml` and `.env.example` go at the project root, one level above both.

## Before you run it

1. **Backend entry file** — the backend Dockerfile runs `node server.js`. If your entry file has a different name (e.g. `index.js`, `app.js`), update the `CMD` line in `backend/Dockerfile`.
2. **Health route** — the backend healthcheck pings `GET /api/health`. Add a trivial route like:
   ```js
   app.get("/api/health", (req, res) => res.status(200).json({ status: "ok" }));
   ```
   if you don't already have one — useful for Module 4's Prometheus/health-checker work too.
3. **Mongo connection** — make sure your backend reads the connection string from `process.env.MONGO_URI` instead of a hardcoded local URI.
4. **React build output** — if your frontend was scaffolded with Vite (not Create React App), change `COPY --from=build /app/build` to `/app/dist` in `frontend/Dockerfile`.
5. **Env file** — copy `.env.example` to `.env` in the project root and set real values (at minimum change `JWT_SECRET`).

## Running it

```bash
# from the project root, where docker-compose.yml lives
docker compose up --build
```

- Frontend → http://localhost
- Backend API → http://localhost:5000/api/...
- MongoDB → localhost:27017 (credentials from `.env`)

Stop everything:
```bash
docker compose down
```

Stop and wipe the Mongo volume (fresh database next time):
```bash
docker compose down -v
```

## Notes for your write-up

- **Frontend** is built in a multi-stage image: Node builds the static assets, then Nginx serves them — keeps the final image small and production-like.
- **Nginx config** also proxies `/api/` calls to the backend container, so the frontend can call relative API paths (`/api/products`) without hardcoding a hostname — handy if you later add an Nginx reverse proxy step per the project brief.
- **Healthchecks** on `mongo` and `backend` mean `depends_on: condition: service_healthy` — the backend won't start until Mongo is actually accepting connections, not just "container running." This dovetails nicely with the "self-healing" theme when you get to the Python health-checker module.
- **Named volume** (`mongo-data`) persists your database across `docker compose down`/`up` cycles; it's only wiped with `-v`.
