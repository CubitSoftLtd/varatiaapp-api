const httpStatus = require('http-status');
const { Expense, Property, ExpenseCategory } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create an expense
 * @param {number} propertyId
 * @param {Object} expenseBody
 * @returns {Promise<Expense>}
 */
const createExpense = async (propertyId, expenseBody) => {
  const property = await Property.findByPk(propertyId);
  if (!property) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Property not found');
  }
  const expenseCategory = await ExpenseCategory.findByPk(expenseBody.expenseCategoryId);
  if (!expenseCategory) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Expense category not found');
  }
  return Expense.create({ ...expenseBody, propertyId });
};

/**
 * Query for expenses
 * @param {number} propertyId
 * @param {Object} filter - Sequelize filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<{ results: Expense[], page: number, limit: number, totalPages: number, totalResults: number }>}
 */
const getAllExpenses = async (propertyId, filter, options) => {
  const property = await Property.findByPk(propertyId);
  if (!property) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Property not found');
  }
  const limit = options.limit && parseInt(options.limit, 10) > 0 ? parseInt(options.limit, 10) : 10;
  const page = options.page && parseInt(options.page, 10) > 0 ? parseInt(options.page, 10) : 1;
  const offset = (page - 1) * limit;

  const sort = [];
  if (options.sortBy) {
    const [field, order] = options.sortBy.split(':');
    sort.push([field, order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC']);
  }

  const { count, rows } = await Expense.findAndCountAll({
    where: { ...filter, propertyId },
    limit,
    offset,
    order: sort.length ? sort : [['createdAt', 'DESC']],
    include: [{ model: Property }, { model: ExpenseCategory }],
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
 * Get expense by id
 * @param {number} id
 * @returns {Promise<Expense>}
 */
const getExpenseById = async (id) => {
  const expense = await Expense.findByPk(id, { include: [{ model: Property }, { model: ExpenseCategory }] });
  if (!expense) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Expense not found');
  }
  return expense;
};

/**
 * Update expense by id
 * @param {number} expenseId
 * @param {Object} updateBody
 * @returns {Promise<Expense>}
 */
const updateExpense = async (expenseId, updateBody) => {
  const expense = await getExpenseById(expenseId);
  if (updateBody.expenseCategoryId && !(await ExpenseCategory.findByPk(updateBody.expenseCategoryId))) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Expense category not found');
  }
  await expense.update(updateBody);
  return expense;
};

/**
 * Delete expense by id
 * @param {number} expenseId
 * @returns {Promise<void>}
 */
const deleteExpense = async (expenseId) => {
  const expense = await getExpenseById(expenseId);
  await expense.destroy();
};

module.exports = {
  createExpense,
  getAllExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
};
