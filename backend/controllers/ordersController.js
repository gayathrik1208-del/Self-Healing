const { carts, orders, nextOrderId } = require("../data/store");
const { getCartItems } = require("./cartController");

function placeOrder(req, res) {
  const items = getCartItems(req.user.id);

  if (items.length === 0) {
    return res.status(400).json({ error: "Your cart is empty." });
  }

  const total = items.reduce((sum, i) => sum + i.product.price * i.qty, 0);
  const order = {
    id: nextOrderId(),
    userId: req.user.id,
    items: items.map((i) => ({ productId: i.product.id, name: i.product.name, price: i.product.price, qty: i.qty })),
    total,
    createdAt: new Date().toISOString(),
  };

  orders.push(order);
  carts.set(req.user.id, []); // clear cart after order

  return res.status(201).json({ order });
}

function listOrders(req, res) {
  const mine = orders.filter((o) => o.userId === req.user.id);
  return res.json({ orders: mine });
}

function getOrder(req, res) {
  const order = orders.find((o) => o.id === req.params.id && o.userId === req.user.id);
  if (!order) return res.status(404).json({ error: "Order not found." });
  return res.json({ order });
}

module.exports = { placeOrder, listOrders, getOrder };
