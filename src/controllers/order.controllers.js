
const orderService = require("../services/orders.services");

const createOrder = async (req, res) => {
    try {
        const { address_id, items } = req.body;

        if (
            !address_id ||
            !Array.isArray(items) ||
            items.length === 0
        ) {
            return res.status(400).json({
                message: "Address and order items are required"
            });
        }

        const result = await orderService.createOrder({
            user_id: req.user_id,
            address_id,
            items
        });

        res.status(201).json({
            message: "Order created successfully",
            data: result
        });
    } catch (error) {
        console.error("Create order error:", error);

        if (
            error.message === "Address not found" ||
            error.message === "One or more products were not found" ||
            error.message === "Invalid product quantity"
        ) {
            return res.status(400).json({
                message: error.message
            });
        }

        res.status(500).json({
            message: "Failed to create order"
        });
    }
};

module.exports = {
    createOrder
};
