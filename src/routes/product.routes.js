const express = require("express");
const router = express.Router();

const productController = require("../controllers/product.controller");

router.post("/new", productController.addProducts);
router.post("/bulk", productController.addBulkProducts);
router.get("/", productController.getProducts);

module.exports = router;
