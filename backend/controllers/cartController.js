const { carts } = require("../data/store");
const { products } = require("../data/products");

function getCartItems(userId) {
  const raw = carts.get(userId) || [];
  return raw
    .map((entry) => {
      const product = products.find((p) => p.id === entry.productId);
      if (!product) return null;
      return { product, qty: entry.qty };
    })
    .filter(Boolean);
}

function viewCart(req, res) {
  const items = getCartItems(req.user.id);
  const total = items.reduce((sum, i) => sum + i.product.price * i.qty, 0);
  return res.json({ items, total });
}

function addToCart(req, res) {
  const { productId, qty } = req.body;
  const quantity = Number(qty) > 0 ? Number(qty) : 1;

  const product = products.find((p) => p.id === productId);
  if (!product) return res.status(404).json({ error: "Product not found." });

  const cart = carts.get(req.user.id) || [];
  const existing = cart.find((c) => c.productId === productId);

  if (existing) {
    existing.qty += quantity;
  } else {
    cart.push({ productId, qty: quantity });
  }

  carts.set(req.user.id, cart);
  return res.status(201).json({ items: getCartItems(req.user.id) });
}

function updateCartItem(req, res) {
  const { productId } = req.params;
  const { qty } = req.body;

  if (!Number(qty) || Number(qty) < 1) {
    return res.status(400).json({ error: "Quantity must be at least 1." });
  }

  const cart = carts.get(req.user.id) || [];
  const entry = cart.find((c) => c.productId === productId);
  if (!entry) return res.status(404).json({ error: "Item not in cart." });

  entry.qty = Number(qty);
  carts.set(req.user.id, cart);
  return res.json({ items: getCartItems(req.user.id) });
}

function removeCartItem(req, res) {
  const { productId } = req.params;
  const cart = carts.get(req.user.id) || [];
  const next = cart.filter((c) => c.productId !== productId);
  carts.set(req.user.id, next);
  return res.json({ items: getCartItems(req.user.id) });
}

module.exports = { viewCart, addToCart, updateCartItem, removeCartItem, getCartItems };
