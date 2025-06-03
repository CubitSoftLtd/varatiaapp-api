const httpStatus = require('http-status');
const { ExpenseCategory, Expense } = require('../models');
const ApiError = require('../utils/ApiError');

const createExpenseCategory = async (categoryBody) => {
  const { name, type } = categoryBody;
  const existingCategory = await ExpenseCategory.findOne({ where: { name } });
  if (existingCategory) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Category name already exists');
  }
  if (!['utility', 'personal', 'tenant_charge'].includes(type)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid category type');
  }
  return ExpenseCategory.create(categoryBody);
};

const getAllExpenseCategories = async (filter, options) => {
  const limit = parseInt(options.limit, 10) || 10;
  const page = parseInt(options.page, 10) || 1;
  const offset = (page - 1) * limit;

  const sort = [];
  if (options.sortBy) {
    const [field, order] = options.sortBy.split(':');
    sort.push([field, order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC']);
  }

  const { count, rows } = await ExpenseCategory.findAndCountAll({
    where: filter,
    limit,
    offset,
    order: sort.length ? sort : [['name', 'ASC']],
  });

  return {
    results: rows,
    page,
    limit,
    totalPages: Math.ceil(count / limit),
    totalResults: count,
  };
};

const getExpenseCategoryById = async (id) => {
  const category = await ExpenseCategory.findByPk(id);
  if (!category) throw new ApiError(httpStatus.NOT_FOUND, 'Expense category not found');
  return category;
};

const updateExpenseCategory = async (categoryId, updateBody) => {
  const category = await getExpenseCategoryById(categoryId);
  if (updateBody.name && updateBody.name !== category.name) {
    const existingCategory = await ExpenseCategory.findOne({ where: { name: updateBody.name } });
    if (existingCategory) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Category name already exists');
    }
  }
  if (updateBody.type && !['utility', 'personal', 'tenant_charge'].includes(updateBody.type)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid category type');
  }
  await category.update(updateBody);
  return category;
};

const deleteExpenseCategory = async (categoryId) => {
  const category = await getExpenseCategoryById(categoryId);
  const expenses = await Expense.findAll({ where: { categoryId } });
  if (expenses.length > 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot delete category with associated expenses');
  }
  await category.destroy();
};

module.exports = {
  createExpenseCategory,
  getAllExpenseCategories,
  getExpenseCategoryById,
  updateExpenseCategory,
  deleteExpenseCategory,
};
