const categoryService = require("../services/category.services");

const addCategory = async (req, res) => {
    try {
        console.log(req.body);
        const category = await categoryService.addCategory(req.body);

        res.status(201).json({
            message: "Category created successfully",
            data: category
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to create category",
            error: error.message
        });
    }
};


const getCategoryList = async (req, res) => {
    try {
        const categoryList = await categoryService.getCategories();

        res.status(201).json({
            data: categoryList
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to receive Categories",
            error: error.message
        });
    }
};


module.exports = {
    addCategory,
    getCategoryList
};
