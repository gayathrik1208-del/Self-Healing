const { products } = require("../data/products");

function listProducts(req, res) {
  const { q, category } = req.query;

  let result = products;

  if (q && q.trim()) {
    const term = q.trim().toLowerCase();
    result = result.filter((p) => p.name.toLowerCase().includes(term));
  }

  if (category && category.toLowerCase() !== "all") {
    result = result.filter((p) => p.category.toLowerCase() === category.toLowerCase());
  }

  return res.json({ products: result });
}

function getProduct(req, res) {
  const product = products.find((p) => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: "Product not found." });
  return res.json({ product });
}

module.exports = { listProducts, getProduct };
