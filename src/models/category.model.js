const pool = require("../../db/conn");
const { nanoid } = require("nanoid");

const addCategory = async (category) => {
    const id = nanoid(5);
    const {
        title,
        description,
    } = category;

    const query = `
        INSERT INTO categories
        (id, title, description)
        VALUES ($1, $2, $3)
        RETURNING *
    `;

    const values = [
        id, title, description
    ];

    const result = await pool.query(query, values);

    return result.rows[0];
};


const getCategories = async()=>{
    const query = "SELECT id,title, description from categories";
     const result = await pool.query(query);

     return result.rows;
}

module.exports = { addCategory, getCategories };
