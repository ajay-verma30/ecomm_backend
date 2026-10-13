const authService = require("../services/auth.services");

const addUser = async (req, res) => {
    try {
        const user = await authService.addUser(req.body);

        res.status(201).json({
            message: "User created successfully",
            data: user
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to create user"
        });
    }
};

const loginUser = async (req, res) => {
    try {
        console.log(req.body)
        const result = await authService.loginUser(req.body);

        res.status(200).json({
            message: "Login successful",
            data: result
        });
    } catch (error) {
    console.error("Login error:", error);

    const statusCode =
        error.message === "Invalid email or password" ? 401 : 500;

    res.status(statusCode).json({
        message:
            statusCode === 401
                ? "Invalid email or password"
                : "Login failed"
    });
}
};

module.exports = {
    loginUser,
    addUser
};
