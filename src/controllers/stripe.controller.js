
const stripeService = require("../services/stripe.services");
const Stripe = require("stripe");

const getErrorStatus = (error) => {
    if (error.statusCode) {
        return error.statusCode;
    }

    if (error.type === "StripeRateLimitError") {
        return 429;
    }

    if (error.type === "StripeConnectionError") {
        return 503;
    }

    if (error.type === "StripeAuthenticationError") {
        return 500;
    }

    if (error.type === "StripeInvalidRequestError") {
        return 400;
    }

    if (error.type === "StripeCardError") {
        return 402;
    }

    return 500;
};

const createPayment = async (req, res) => {
    try {
        const { order_id } = req.body;

        if (!order_id) {
            return res.status(400).json({
                success: false,
                message: "Order ID is required"
            });
        }

        const result = await stripeService.createPayment(
            order_id,
            req.user_id
        );

        return res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error("Stripe payment error:", error.message);

        const statusCode = getErrorStatus(error);

        return res.status(statusCode).json({
            success: false,
            message: statusCode >= 500
                ? "Failed to create payment"
                : error.message
        });
    }
};


const createRefunds = async (req, res) => {
    try {
        const {
            order_id,
            refund_type,
            items
        } = req.body;

        if (!order_id) {
            return res.status(400).json({
                success: false,
                message: "Order ID is required"
            });
        }

        if (!refund_type) {
            return res.status(400).json({
                success: false,
                message: "Refund type is required"
            });
        }

        if (!["full", "partial"].includes(refund_type)) {
            return res.status(400).json({
                success: false,
                message: "Invalid refund type"
            });
        }

        if (
            refund_type === "partial" &&
            (!Array.isArray(items) || items.length === 0)
        ) {
            return res.status(400).json({
                success: false,
                message: "At least one item is required for partial refund"
            });
        }

        const result = await stripeService.createRefunds(
            order_id,
            req.user_id,
            refund_type,
            items
        );


        return res.status(200).json({
            success: true,
            data: result
        });

    } catch (error) {
        console.log(error);
        console.error("Stripe refund error:", error.message);
        const statusCode = getErrorStatus(error);

        return res.status(statusCode).json({
            success: false,
            message: statusCode >= 500
                ? "Failed to create refund"
                : error.message
        });
    }
};


module.exports = {
    createPayment,
    createRefunds
};
