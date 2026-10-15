const Stripe = require('stripe');
const orderModel = require("../models/orders.model");
const pool = require("../../db/conn");
const { nanoid } = require("nanoid");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const createPayment = async(order_id, user_id) =>{
    const order = await orderModel.getOrderById(
        order_id, user_id
    );

    if (!order) {
    const error = new Error("Order not found");
    error.statusCode = 404;
    throw error;
}

if (order.payment_status !== "pending") {
    const error = new Error("Order is not pending payment");
    error.statusCode = 409;
    throw error;
}
    const idempotentKey = `payment-order-${order.id}`
    const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(Number(order.total) * 100),
        currency: "inr",
        automatic_payment_methods:{
            enabled: true
        },
        metadata:{
            order_id: order.id
        }
    },{
        idempotencyKey: idempotentKey
    });

    const orderUpdate = "UPDATE orders SET stripe_payment_intent_id = $1, idempotent_key = $2 WHERE id = $3"

    await pool.query(orderUpdate, [paymentIntent.id, idempotentKey, order_id])

    return {
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret
    }
};



const createRefunds = async (
    order_id,
    user_id,
    refund_type,
    items = []
) => {
    const order = await orderModel.getOrderById(
        order_id,
        user_id
    );

    if (!order) {
        const error = new Error("Order not found");
        error.statusCode = 404;
        throw error;
    }

    if (order.payment_status !== "paid") {
        const error = new Error(
            "Payment is not eligible for refund"
        );
        error.statusCode = 409;
        throw error;
    }

    if (!order.stripe_payment_intent_id) {
        const error = new Error(
            "No PaymentIntent found for this order"
        );
        error.statusCode = 409;
        throw error;
    }

    let refundAmount;
    let selectedItems = [];

    if (refund_type === "full") {
        refundAmount = Math.round(
            Number(order.total) * 100
        );
    } else if (refund_type === "partial") {
        if (!Array.isArray(items) || items.length === 0) {
            const error = new Error(
                "At least one item is required for partial refund"
            );
            error.statusCode = 400;
            throw error;
        }

        const seenItemIds = new Set();
        let totalCents = 0;

        for (const item of items) {
            const { order_item_id, quantity } = item;

            if (
                !Number.isInteger(order_item_id) ||
                !Number.isInteger(quantity) ||
                quantity <= 0
            ) {
                const error = new Error(
                    "Invalid order item ID or quantity"
                );
                error.statusCode = 400;
                throw error;
            }

            if (seenItemIds.has(order_item_id)) {
                const error = new Error(
                    "Duplicate order item IDs are not allowed"
                );
                error.statusCode = 400;
                throw error;
            }

            seenItemIds.add(order_item_id);

            const orderItem = await orderModel.getOrderItemById(
                order_id,
                order_item_id,
                user_id
            );

            if (!orderItem) {
                const error = new Error(
                    `Order item ${order_item_id} not found`
                );
                error.statusCode = 404;
                throw error;
            }

            if (quantity > orderItem.quantity) {
                const error = new Error(
                    `Refund quantity exceeds purchased quantity for item ${order_item_id}`
                );
                error.statusCode = 400;
                throw error;
            }

            const itemCents =
                Math.round(Number(orderItem.unit_price) * 100)
                * quantity;

            totalCents += itemCents;

            selectedItems.push({
                order_item_id: orderItem.id,
                quantity,
                amount: itemCents
            });
        }

        refundAmount = totalCents;
    } else {
        const error = new Error("Invalid refund type");
        error.statusCode = 400;
        throw error;
    }

    // Stable key for retrying the same refund request.
    const idempotentKey =
        refund_type === "full"
            ? `refund-full-${order.id}`
            : `refund-items-${order.id}-${selectedItems
                .map(item => `${item.order_item_id}x${item.quantity}`)
                .sort()
                .join("-")}`;

    const refund = await stripe.refunds.create(
        {
            payment_intent: order.stripe_payment_intent_id,
            amount: refundAmount,
            metadata: {
                order_id: order.id,
                refund_type,
                items: JSON.stringify(selectedItems)
            }
        },
        {
            idempotencyKey: idempotentKey
        }
    );

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        await client.query(
            `INSERT INTO refunds
            (
                id,
                order_id,
                order_item_id,
                user_id,
                stripe_refund_id,
                amount,
                reason,
                status,
                refund_type,
                idempotent_key
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            ON CONFLICT (stripe_refund_id) DO NOTHING`,
            [
                nanoid(16),
                order.id,
                refund_type === "partial" && selectedItems.length === 1
                    ? selectedItems[0].order_item_id
                    : null,
                user_id,
                refund.id,
                refund.amount,
                "requested_by_customer",
                "initiated",
                refund_type,
                idempotentKey
            ]
        );

        if (refund.status === "succeeded") {
            if (refund_type === "full") {
                await client.query(
                    `UPDATE orders
                     SET payment_status = 'refunded',
                         refund_type = 'full'
                     WHERE id = $1 AND user_id = $2`,
                    [order.id, user_id]
                );
            } else {
                await client.query(
                    `UPDATE orders
                     SET refund_type = 'partial'
                     WHERE id = $1 AND user_id = $2`,
                    [order.id, user_id]
                );
            }
        }

        await client.query("COMMIT");
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }

    return {
        message: "Refund request processed",
        refund: {
            stripeRefundId: refund.id,
            amount: refund.amount,
            currency: refund.currency,
            status: refund.status,
            refund_type,
            items: selectedItems
        }
    };
};



module.exports = {
    createPayment,
    createRefunds
};