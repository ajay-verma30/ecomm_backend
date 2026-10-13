const express = require('express');
require('dotenv').config();
const morgan = require("morgan");
const cors = require("cors"); 

// Routes import
const productRoutes = require("./src/routes/product.routes");
const categoryRoutes = require("./src/routes/category.routes");
const authRoutes = require("./src/routes/auth.routes");
const addressRoutes = require("./src/routes/addresses.routes");
const orderRoutes = require("./src/routes/order.routes");
const stripeRoutes = require("./src/routes/stripe.routes");

const app = express();

// 2. Enable CORS (Allows requests from your React app)
app.use(cors({
    origin: "http://localhost:3000", // Allow your React frontend
    credentials: true                // Allow cookies/authorization headers if needed
}));

app.use(express.json());
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));

app.use("/api/v1/products", productRoutes);
app.use("/api/v1/category", categoryRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/address", addressRoutes);
app.use("/api/v1/order", orderRoutes);
app.use("/api/v1/payments", stripeRoutes);

const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});