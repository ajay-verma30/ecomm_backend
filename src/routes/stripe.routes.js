const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");
const stripeController = require("../controllers/stripe.controller");

router.post(
    "/create-payment",
    authMiddleware,
    stripeController.createPayment
);

router.post(
    "/create-refund", 
    authMiddleware, 
    stripeController.createRefunds
);

module.exports = router;