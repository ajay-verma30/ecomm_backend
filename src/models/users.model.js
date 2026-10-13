
const pool = require("../../db/conn");
const { nanoid } = require("nanoid");

const addUser = async (user) => {
    const id = nanoid(12);

    const {
        f_name,
        l_name,
        email,
        password
    } = user;

    const query = `
        INSERT INTO users
        (id, f_name, l_name, email, password_hash)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, f_name, l_name, email, created_at
    `;

    const values = [
        id,
        f_name,
        l_name,
        email,
        password
    ];

    const result = await pool.query(query, values);

    return result.rows[0];
};

const getUserByEmail = async (email) => {
    const query = `
        SELECT id, f_name, l_name, email, password_hash
        FROM users
        WHERE email = $1
    `;

    const result = await pool.query(query, [email]);

    return result.rows[0];
};


module.exports = {
    addUser,
    getUserByEmail
};
