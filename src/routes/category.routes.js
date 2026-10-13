const express = require("express");
const router = express.Router();

const categoryController = require("../controllers/category.controller");

router.post("/new", categoryController.addCategory);
router.get("/", categoryController.getCategoryList);

module.exports = router;
