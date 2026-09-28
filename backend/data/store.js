// In-memory "database" for this module. Everything resets on server restart.
// Swap these arrays/maps for real persistence (e.g. an ORM + Postgres/Mongo)
// when you move past prototyping — the rest of the code talks to this file only.

const users = []; // { id, name, email, passwordHash }
const carts = new Map(); // userId -> [{ productId, qty }]
const orders = []; // { id, userId, items: [{productId, qty, price}], total, createdAt }

let nextUserId = 1;
let nextOrderId = 1000;

module.exports = {
  users,
  carts,
  orders,
  nextUserId: () => nextUserId++,
  nextOrderId: () => `ORD-${nextOrderId++}`,
};
