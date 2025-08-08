/* eslint-disable prettier/prettier */

const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const { Account, ExpenseCategory, PersonalExpense } = require("../models");

/**
 * Create a new expense with validation and transaction
 * @param {Object} expenseBody - { accountId, propertyId?, unitId?, billId?, categoryId, amount, expenseDate, description? }
 * @returns {Promise<Expense>}
 */
const createPersonalExpense = async (expenseBody) => {
  const { accountId,beneficiary,categoryId, amount, expenseDate, description } = expenseBody;

  // Validate required fields
  if (!accountId ||!beneficiary || !categoryId || !amount || !expenseDate) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Account ID, Beneficiary, category ID, amount, and expense date are required');
  }
  // Validate foreign keys
  const account = await Account.findByPk(accountId);
  if (!account) {
    throw new ApiError(httpStatus.NOT_FOUND, `Account not found for ID: ${accountId}`);
  }
  const category = await ExpenseCategory.findByPk(categoryId);
  if (!category) {
    throw new ApiError(httpStatus.NOT_FOUND, `Expense category not found for ID: ${categoryId}`);
  }

  // Create expense and update bill in a transaction
  const personalExpense = await PersonalExpense.sequelize.transaction(async (t) => {
    const createdPersonalExpense = await PersonalExpense.create(
      {
        accountId,
        beneficiary,
        categoryId,
        amount,
        expenseDate,
        description: description || null,
        isDeleted: false,
      },
      { transaction: t }
    );

    // If linked to a bill, update its amounts
    return createdPersonalExpense;
  });

  return personalExpense;
};


/**
 * Query for all expenses matching a filter
 * @param {Object} filter - Sequelize filter
 * @param {Object} options - { sortBy, limit, page, include? }
 * @returns {Promise<{ results: Expense[], page: number, limit: number, totalPages: number, totalResults: number }>}
 */
const getAllPersonalExpenses = async (filter, options, deleted = 'false') => {
  const whereClause = { ...filter };

  // Apply the isDeleted filter based on the 'deleted' parameter
  if (deleted === 'true') {
    whereClause.isDeleted = true;
  } else if (deleted === 'false') {
    whereClause.isDeleted = false;
  } else if (deleted === 'all') {
    // No filter on isDeleted, allowing all bills to be returned
  } else {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid value for deleted parameter');
  }

  const limit = options.limit && parseInt(options.limit, 10) > 0 ? parseInt(options.limit, 10) : 10;
  const page = options.page && parseInt(options.page, 10) > 0 ? parseInt(options.page, 10) : 1;
  const offset = (page - 1) * limit;

  // Sorting
  const sort = [];
  if (options.sortBy) {
    const [field, order] = options.sortBy.split(':');
    sort.push([field, order?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC']);
  }


  const { count, rows } = await PersonalExpense.findAndCountAll({
    where: whereClause,
    limit,
    offset,
    order: sort.length ? sort : [['createdAt', 'DESC']],
  });


  return {
    results:rows,
    page,
    limit,
    totalPages: Math.ceil(count / limit),
    totalResults: count,
  };
};

/**
 * Get lease by id with optional inclusion of specific columns from associated models
 * @param {string} id
 * @param {Array} [include=[]] - Array of objects specifying models and attributes to include
 * @returns {Promise<Lease>}
 */
const getPersonalExpenseById = async (id) => {
  const personalExpense = await PersonalExpense.findByPk(id);
  if (!personalExpense) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Expense not found');
  }

  return personalExpense;
};

/**
 * Update tenant by id with validation
 * @param {string} personalExpenseId
 * @param {Object} updateBody
 * @returns {Promise<PersonalExpense>}
 */
const updatePesonalExpense = async (personalExpenseId, updateBody) => {
  const expense = await getPersonalExpenseById(personalExpenseId);
  if (updateBody.categoryId) {
    const category = await ExpenseCategory.findByPk(updateBody.categoryId);
    if (!category) {
      throw new ApiError(httpStatus.NOT_FOUND, `Expense category not found for ID: ${updateBody.categoryId}`);
    }
  }
  await expense.update(updateBody);
  return expense;
};

/**
 * Soft delete an expense by ID
 * @param {string} id - Expense UUID
 * @returns {Promise<void>}
 */
const deletePersonalExpense = async (id) => {
  const expense = await getPersonalExpenseById(id);
  if (expense.isDeleted) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Expense is already deleted');
  }
  await expense.update({ isDeleted: true });
};
const restorePersonalExpense = async (id) => {
  const expense = await getPersonalExpenseById(id);
  if (!expense.isDeleted) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Expense is already restored');
  }
  await expense.update({ isDeleted: false });
};

/**
 * Hard delete an expense by ID
 * @param {string} id - Expense UUID
 * @returns {Promise<void>}
 */
const hardDeletePersonalExpense = async (id) => {
  const expense = await getPersonalExpenseById(id);
  await expense.destroy();
};


module.exports = {
  createPersonalExpense,
  getAllPersonalExpenses,
  getPersonalExpenseById,
  updatePesonalExpense,
  restorePersonalExpense,
  deletePersonalExpense,
  hardDeletePersonalExpense,
};
