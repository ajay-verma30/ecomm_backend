const categoryModel = require('../models/category.model');

const addCategory = async(category) =>{
    return await categoryModel.addCategory(category)
}

const getCategories = async() =>{
    return await categoryModel.getCategories()
}

module.exports = {
    addCategory,
    getCategories
}