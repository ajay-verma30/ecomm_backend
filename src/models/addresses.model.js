
const pool = require("../../db/conn");
const { nanoid } = require("nanoid");

const addAddress = async (user_address) => {
    const id = nanoid(13);

    const {
        country,
        city,
        address,
        pincode,
        user_id
    } = user_address;

    const query = `
        INSERT INTO addresses
        (id, country, city, address, pincode, user_id)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
    `;

    const values = [
        id, country, city, address, pincode, user_id
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
};

const getAddresses = async (user_id) => {
    const query = `
        SELECT * FROM addresses
        WHERE user_id = $1
    `;

    const values = [user_id];

    const result = await pool.query(query, values);
    return result.rows;
};

module.exports = {
    addAddress,
    getAddresses
};
