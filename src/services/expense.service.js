const httpStatus = require('http-status');
const { Expense, Property, Unit, ExpenseCategory } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create an expense
 * @param {Object} expenseBody
 * @returns {Promise<Expense>}
 */
const createExpense = async (expenseBody) => {
  if (expenseBody.propertyId) {
    const property = await Property.findByPk(expenseBody.propertyId);
    if (!property) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Property not found');
    }
  }
  if (expenseBody.unitId) {
    const unit = await Unit.findByPk(expenseBody.unitId);
    if (!unit) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Unit not found');
    }
  }
  if (expenseBody.expenseCategoryId) {
    const expenseCategory = await ExpenseCategory.findByPk(expenseBody.expenseCategoryId);
    if (!expenseCategory) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Expense category not found');
    }
  }
  return Expense.create(expenseBody);
};

/**
 * Query for expenses
 * @param {Object} filter - Sequelize filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<{ results: Expense[], page: number, limit: number, totalPages: number, totalResults: number }>}
 */
const getAllExpenses = async (filter, options) => {
  const limit = options.limit && parseInt(options.limit, 10) > 0 ? parseInt(options.limit, 10) : 10;
  const page = options.page && parseInt(options.page, 10) > 0 ? parseInt(options.page, 10) : 1;
  const offset = (page - 1) * limit;

  const sort = [];
  if (options.sortBy) {
    const [field, order] = options.sortBy.split(':');
    sort.push([field, order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC']);
  }

  const { count, rows } = await Expense.findAndCountAll({
    where: filter,
    limit,
    offset,
    order: sort.length ? sort : [['date', 'DESC']],
    include: [
      { model: Property, as: 'Property' },
      { model: Unit, as: 'Unit' },
      { model: ExpenseCategory, as: 'ExpenseCategory' },
    ],
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
 * @param {string} id
 * @returns {Promise<Expense>}
 */
const getExpenseById = async (id) => {
  const expense = await Expense.findByPk(id, {
    include: [
      { model: Property, as: 'Property' },
      { model: Unit, as: 'Unit' },
      { model: ExpenseCategory, as: 'ExpenseCategory' },
    ],
  });
  if (!expense) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Expense not found');
  }
  return expense;
};

/**
 * Update expense by id
 * @param {string} expenseId
 * @param {Object} updateBody
 * @returns {Promise<Expense>}
 */
const updateExpense = async (expenseId, updateBody) => {
  const expense = await getExpenseById(expenseId);
  if (updateBody.propertyId) {
    const property = await Property.findByPk(updateBody.propertyId);
    if (!property) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Property not found');
    }
  }
  if (updateBody.unitId) {
    const unit = await Unit.findByPk(updateBody.unitId);
    if (!unit) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Unit not found');
    }
  }
  if (updateBody.expenseCategoryId) {
    const expenseCategory = await ExpenseCategory.findByPk(updateBody.expenseCategoryId);
    if (!expenseCategory) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Expense category not found');
    }
  }
  await expense.update(updateBody);
  return expense;
};

/**
 * Delete expense by id
 * @param {string} expenseId
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
