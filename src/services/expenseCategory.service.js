const httpStatus = require('http-status');
const { ExpenseCategory } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create an expense category
 * @param {Object} expenseCategoryBody
 * @returns {Promise<ExpenseCategory>}
 */
const createExpenseCategory = async (expenseCategoryBody) => {
  return ExpenseCategory.create(expenseCategoryBody);
};

/**
 * Query for expense categories
 * @param {Object} filter - Sequelize filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<{ results: ExpenseCategory[], page: number, limit: number, totalPages: number, totalResults: number }>}
 */
const getAllExpenseCategories = async (filter, options) => {
  const limit = options.limit && parseInt(options.limit, 10) > 0 ? parseInt(options.limit, 10) : 10;
  const page = options.page && parseInt(options.page, 10) > 0 ? parseInt(options.page, 10) : 1;
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
    order: sort.length ? sort : [['createdAt', 'DESC']],
  });

  return {
    results: rows,
    page,
    limit,
    totalPages: Math.ceil(count / limit),
    totalResults: count,
  };
};

/**
 * Get expense category by id
 * @param {number} id
 * @returns {Promise<ExpenseCategory>}
 */
const getExpenseCategoryById = async (id) => {
  const expenseCategory = await ExpenseCategory.findByPk(id);
  if (!expenseCategory) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Expense category not found');
  }
  return expenseCategory;
};

/**
 * Update expense category by id
 * @param {number} expenseCategoryId
 * @param {Object} updateBody
 * @returns {Promise<ExpenseCategory>}
 */
const updateExpenseCategory = async (expenseCategoryId, updateBody) => {
  const expenseCategory = await getExpenseCategoryById(expenseCategoryId);
  await expenseCategory.update(updateBody);
  return expenseCategory;
};

/**
 * Delete expense category by id
 * @param {number} expenseCategoryId
 * @returns {Promise<void>}
 */
const deleteExpenseCategory = async (expenseCategoryId) => {
  const expenseCategory = await getExpenseCategoryById(expenseCategoryId);
  await expenseCategory.destroy();
};

module.exports = {
  createExpenseCategory,
  getAllExpenseCategories,
  getExpenseCategoryById,
  updateExpenseCategory,
  deleteExpenseCategory,
};
