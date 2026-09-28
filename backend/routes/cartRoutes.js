const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { viewCart, addToCart, updateCartItem, removeCartItem } = require("../controllers/cartController");

const router = express.Router();

router.use(requireAuth);

router.get("/", viewCart);
router.post("/", addToCart);
router.put("/:productId", updateCartItem);
router.delete("/:productId", removeCartItem);

module.exports = router;
