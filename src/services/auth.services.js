const userModel = require("../models/users.model");
const jwt = require("jsonwebtoken");

const addUser = async (user) => {
    return await userModel.addUser(user);
};

const loginUser = async (user) => {
    const { email, password } = user;

    const existingUser = await userModel.getUserByEmail(email);

    if (!existingUser || password !== existingUser.password_hash) {
        throw new Error("Invalid email or password");
    }

    const token = jwt.sign(
        {
            id: existingUser.id,
            email: existingUser.email
        },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
    );

    return {
        token
    };
};

module.exports = {
    addUser,
    loginUser
};