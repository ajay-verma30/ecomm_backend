const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");

const addressController = require("../controllers/addresses.controller");

router.post("/new", authMiddleware, addressController.addAddress);
router.get("/", authMiddleware, addressController.getAddresses);

module.exports = router;
