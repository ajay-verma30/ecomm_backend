const productService = require("../services/products.services");

const addProducts = async (req, res) => {
    try {
        const product = await productService.addProducts(req.body);

        res.status(201).json({
            message: "Product created successfully",
            data: product
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to create product",
            error: error.message
        });
    }
};

const addBulkProducts = async (req, res) => {
    try {
        const products = await productService.addBulkProducts(req.body);

        res.status(201).json({
            message: "Products uploaded successfully",
            count: products.length,
            data: products
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to upload products",
            error: error.message
        });
    }
};


const getProducts = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(
            100,
            Math.max(1, parseInt(req.query.limit) || 10)
        );

        const products = await productService.getProducts(page, limit);

        res.status(200).json({
            page,
            limit,
            data: products
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch products",
            error: error.message
        });
    }
};


module.exports = {
    addProducts,
    getProducts,
    addBulkProducts
};
