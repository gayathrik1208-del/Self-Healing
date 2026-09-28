# Module 1 — User Module Backend (Node.js / Express)

REST API covering: register, login, view products, search products, add to cart, place order.
Matches the React frontend module 1:1.

## Stack

- Express — HTTP server and routing
- bcryptjs — password hashing
- jsonwebtoken — auth tokens
- In-memory data store (`data/store.js`, `data/products.js`) — no database required to run

## Setup

```bash
npm install
npm run dev     # nodemon, auto-restarts on change
# or
npm start       # plain node
```

Server runs on `http://localhost:4000` by default (see `.env`).
**Change `JWT_SECRET` in `.env` before deploying anywhere real.**

## Folder structure

```
data/            in-memory "database" (users, products, carts, orders)
middleware/      JWT auth middleware
controllers/     route handler logic
routes/          route definitions, mounted in server.js
server.js        app entry point
```

## API reference

### Auth
| Method | Route              | Auth | Body                              | Notes                     |
|--------|---------------------|------|------------------------------------|---------------------------|
| POST   | /api/auth/register   | No   | `{ name, email, password }`        | Rejects duplicate emails  |
| POST   | /api/auth/login      | No   | `{ email, password }`              | Returns `{ token, user }` |
| GET    | /api/auth/me         | Yes  | —                                   | Current user info         |

### Products
| Method | Route                          | Auth | Notes                          |
|--------|----------------------------------|------|----------------------------------|
| GET    | /api/products                    | No   | List all                        |
| GET    | /api/products?q=scarf             | No   | Search by name                  |
| GET    | /api/products?category=Home       | No   | Filter by category              |
| GET    | /api/products/:id                 | No   | Single product                  |

### Cart (all require `Authorization: Bearer <token>`)
| Method | Route                    | Body                | Notes                         |
|--------|----------------------------|---------------------|----------------------------------|
| GET    | /api/cart                  | —                    | View cart + total                |
| POST   | /api/cart                  | `{ productId, qty }` | Adds item, merges qty if already present |
| PUT    | /api/cart/:productId        | `{ qty }`            | Set exact quantity               |
| DELETE | /api/cart/:productId        | —                    | Remove item                      |

### Orders (all require auth)
| Method | Route            | Notes                                             |
|--------|--------------------|----------------------------------------------------|
| POST   | /api/orders         | Places order from current cart, then clears cart   |
| GET    | /api/orders         | List your past orders                              |
| GET    | /api/orders/:id      | Single order                                       |

## Auth flow

1. `POST /api/auth/register` or `/login` returns a JWT.
2. Send it on every protected request: `Authorization: Bearer <token>`.
3. Token expires in 2 hours (`JWT_EXPIRES_IN` in `.env`).

## Connecting the React frontend

In the frontend module, replace the in-memory mock calls with `fetch`/`axios` calls to these
routes, store the returned `token` (e.g. in React state or a context), and attach it to every
cart/order request. CORS is already enabled for all origins for local development.

## Moving to a real database

Only `data/store.js` and `data/products.js` need to change — swap the in-memory arrays/Map for
queries against Postgres, MongoDB, etc. Controllers and routes don't need to change.

## Tested endpoints

All routes below were exercised end-to-end while building this (register, duplicate-email
rejection, login success/failure, product list/search/filter, cart add/merge/update, auth
rejection with no token, place order, cart-cleared-after-order, empty-cart rejection).
