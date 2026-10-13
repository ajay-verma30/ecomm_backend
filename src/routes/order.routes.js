const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");
const orderController = require("../controllers/order.controllers");

router.post("/new", authMiddleware, orderController.createOrder);

module.exports = router;
