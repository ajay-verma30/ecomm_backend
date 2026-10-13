const addressServices = require("../services/addresses.services");

const addAddress = async (req, res) => {
    try {
        console.log(req.body);

        const address = await addressServices.addAddress({
            ...req.body,
            user_id: req.user_id
        });

        res.status(201).json({
            message: "Address created successfully",
            data: address
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to create address"
        });
    }
};

const getAddresses = async (req, res) => {
    try {
        const user_id = req.user_id;

        const result = await addressServices.getAddresses(user_id);

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    addAddress,
    getAddresses
};
