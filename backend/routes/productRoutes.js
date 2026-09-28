const express = require("express");
const { listProducts, getProduct } = require("../controllers/productsController");

const router = express.Router();

// GET /api/products             -> view all products
// GET /api/products?q=scarf      -> search by name
// GET /api/products?category=Home -> filter by category
router.get("/", listProducts);
router.get("/:id", getProduct);

module.exports = router;
