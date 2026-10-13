
const addressModel = require("../models/addresses.model");

const addAddress = async (user_address) => {
    return await addressModel.addAddress(user_address);
};

const getAddresses = async (user_id) => {
    return await addressModel.getAddresses(user_id);
};

module.exports = {
    addAddress,
    getAddresses
};
