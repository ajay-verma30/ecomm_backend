
const orderModel = require("../models/orders.model");

const createOrder = async (orderData) => {
    return await orderModel.createOrder(orderData);
};

module.exports = {
    createOrder
};
