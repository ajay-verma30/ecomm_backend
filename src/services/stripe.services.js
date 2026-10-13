const Stripe = require('stripe');
const orderModel = require("../models/orders.model");
const pool = require("../../db/conn");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const createPayment = async(order_id, user_id) =>{
    const order = await orderModel.getOrderById(
        order_id, user_id
    );

    if(!order){
        throw new Error("Order not found");
    }
    if(order.payment_status !== "pending"){
        throw new Error("Order is not pending payment");
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

module.exports = {
    createPayment
};