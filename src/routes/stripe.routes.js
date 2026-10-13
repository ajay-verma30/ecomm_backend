const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");
const stripeController = require("../controllers/stripe.controller");

router.post(
    "/create-payment",
    authMiddleware,
    stripeController.createPayment
);

module.exports = router;