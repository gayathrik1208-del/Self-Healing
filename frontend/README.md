# Module 2 — Admin Module

React components covering: admin login, add/update/delete product, view orders, view recovery logs.
Same design system as Module 1 (User Module) so the two feel like one product.

## Files

- `App.jsx` — sidebar nav + auth gate, wires everything together
- `AdminLogin.jsx` — admin sign-in (seed credentials below)
- `ProductManager.jsx` — table + inline form for add/edit, confirm dialog for delete
- `OrdersView.jsx` — read-only order list with status filter
- `RecoveryLogs.jsx` — feed of automated recovery actions from the health-checker, with status summary
- `mockData.js` — seed admin account, products, orders, recovery log entries
- `tokens.js` — shared colors/styles (identical palette to Module 1)

## Demo login

- Email: `admin@example.com`
- Password: `admin123`

## Recovery logs — where this data comes from

In the full project, the Python health-checker monitors each service, and when it detects and
auto-remediates an issue (restart, re-route, scale, retry), it writes an entry here. Right now
`RECOVERY_LOGS` in `mockData.js` is seeded with sample entries in that shape:

```js
{ id, service, issue, action, status, timestamp, durationSec }
// status: "recovered" | "monitoring" | "failed"
```

When the backend is wired up, this becomes a `GET /api/recovery-logs` call — the health-checker
writes to the same store the backend reads from (e.g. a MongoDB collection), so this screen just
needs its data source swapped.

## Running it

Drop this folder into your React project (Vite or CRA). Dependencies used: `lucide-react`.

```bash
npm install lucide-react
```

Import `App` from `./App` and render it as your root, or mount it under a route like `/admin`
alongside the Module 1 `App` under `/`.

## Connecting the Node.js backend

- Product CRUD → `POST /api/admin/products`, `PUT /api/admin/products/:id`, `DELETE /api/admin/products/:id`
- Orders → `GET /api/admin/orders` (all orders, not scoped to one user like Module 1's `/api/orders`)
- Recovery logs → `GET /api/recovery-logs`
- Admin login should issue a JWT with a `role: "admin"` claim, and admin routes should check for
  that role (the Module 1 backend's `requireAuth` middleware can be extended with a `requireAdmin`
  check) so a regular user token can't hit these endpoints.
