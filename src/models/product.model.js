
const pool = require("../../db/conn");
const { nanoid } = require("nanoid");

const addProducts = async (product) => {
    const id = nanoid(10);

    const {
        category_id,
        title,
        description,
        sku,
        stock,
        price
    } = product;

    const query = `
        INSERT INTO products
        (id, category_id, title, description, sku, stock, price)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
    `;

    const values = [
        id, category_id, title, description, sku, stock, price
    ];

    const result = await pool.query(query, values);

    return result.rows[0];
};


const addBulkProducts = async (products) => {
    const addedProducts = [];

    for (const product of products) {
        const addedProduct = await addProducts(product);
        addedProducts.push(addedProduct);
    }

    return addedProducts;
};

const getProducts = async (page, limit) => {
    const offset = (page - 1) * limit;
    const query = `
        SELECT id, category_id, title, description, sku, stock, price
        FROM products
         ORDER BY id
        LIMIT $1 OFFSET $2
    `;

      const values = [limit, offset];

    const result = await pool.query(query, values);

    return result.rows;
};

module.exports = { addProducts, getProducts, addBulkProducts };
