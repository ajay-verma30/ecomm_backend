const productModel = require('../models/product.model');

const addProducts = async(product) =>{
    return await productModel.addProducts(product)
}

const addBulkProducts = async (products) => {
    return await productModel.addBulkProducts(products);
};

const getProducts = async (page, limit) => {
    return await productModel.getProducts(page, limit);
};

module.exports = {
    addProducts,
    getProducts,
    addBulkProducts
}