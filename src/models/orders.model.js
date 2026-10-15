const pool = require("../../db/conn");
const { nanoid } = require("nanoid");

const createOrder = async (orderData) => {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const { user_id, address_id, items } = orderData;

        // Check that the address belongs to this user
        const addressResult = await client.query(
            `SELECT id FROM addresses
             WHERE id = $1 AND user_id = $2`,
            [address_id, user_id]
        );

        if (addressResult.rows.length === 0) {
            throw new Error("Address not found");
        }

        // Fetch actual prices from the database
        const productIds = items.map(item => item.product_id);

        const productResult = await client.query(
            `SELECT id, price
             FROM products
             WHERE id = ANY($1::varchar[])`,
            [productIds]
        );

        const products = productResult.rows;

        if (products.length !== new Set(productIds).size) {
            throw new Error("One or more products were not found");
        }

        const productMap = new Map(
            products.map(product => [product.id, product])
        );

        let totalCents = 0;

        for (const item of items) {
            const product = productMap.get(item.product_id);

            if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
                throw new Error("Invalid product quantity");
            }

            totalCents += Math.round(Number(product.price) * 100)
                * item.quantity;
        }

        const total = (totalCents / 100).toFixed(2);
        const orderId = nanoid(15);

        // Insert the main order
        const orderResult = await client.query(
            `INSERT INTO orders
             (id, user_id, address_id, total)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [orderId, user_id, address_id, total]
        );

        // Insert each item belonging to this order
        const orderItems = [];

        for (const item of items) {
            const product = productMap.get(item.product_id);

            const itemResult = await client.query(
                `INSERT INTO order_items
                 (order_id, product_id, quantity, unit_price)
                 VALUES ($1, $2, $3, $4)
                 RETURNING *`,
                [
                    orderId,
                    item.product_id,
                    item.quantity,
                    product.price
                ]
            );

            orderItems.push(itemResult.rows[0]);
        }

        await client.query("COMMIT");

        return {
            order: orderResult.rows[0],
            items: orderItems
        };
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};

const getOrderById = async(order_id, user_id) => {
    const result = await pool.query(
        `SELECT id, total, payment_status, stripe_payment_intent_id
        FROM orders 
        WHERE id = $1 and user_id = $2`,
        [order_id, user_id]
    );

    return result.rows[0];
}

const getOrderItemById = async(order_id, order_item_id, user_id) =>{
    const result = await pool.query(
        `SELECT
        oi.id,
        oi.unit_price,
        oi.order_id
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.id
    WHERE
        oi.order_id = $1
        AND oi.id = $2
        AND o.user_id = $3;`, [order_id, order_item_id, user_id]
    );
    return result.rows[0];
}

module.exports = {
    createOrder,
    getOrderById,
    getOrderItemById
};
