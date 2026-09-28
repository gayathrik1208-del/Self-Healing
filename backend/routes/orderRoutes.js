const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { placeOrder, listOrders, getOrder } = require("../controllers/ordersController");

const router = express.Router();

router.use(requireAuth);

router.post("/", placeOrder);
router.get("/", listOrders);
router.get("/:id", getOrder);

module.exports = router;
