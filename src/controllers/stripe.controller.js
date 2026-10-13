const stripeService = require("../services/stripe.services");

const createPayment = async (req, res) =>{
    try{
        const {order_id} = req.body;
        if(!order_id){
             return res.status(400).json({
                message: "Order ID is required"
            });
        }

        const result  =await stripeService.createPayment(
            order_id,
            req.user_id
        )
        return res.status(200).json(result);

    }
    catch(error){
         console.error("Stripe payment error:", error.message);
         if (
            error.message === "Order not found" ||
            error.message === "Order is not pending payment"
        ) {
            return res.status(400).json({
                message: error.message
            });
        }
        return res.status(500).json({
            message: "Failed to create payment"
        });
    }
}

module.exports = { createPayment };