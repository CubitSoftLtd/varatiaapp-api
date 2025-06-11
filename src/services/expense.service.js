const httpStatus = require('http-status');
const { Expense, Account, Property, Unit, Bill, ExpenseCategory } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a new expense with validation and transaction
 * @param {Object} expenseBody - { accountId, propertyId?, unitId?, billId?, categoryId, amount, expenseDate, description? }
 * @returns {Promise<Expense>}
 */
const createExpense = async (expenseBody) => {
  const { accountId, propertyId, unitId, billId, categoryId, amount, expenseDate, description } = expenseBody;

  // Validate required fields
  if (!accountId || !categoryId || !amount || !expenseDate) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Account ID, category ID, amount, and expense date are required');
  }

  // Validate foreign keys
  const account = await Account.findByPk(accountId);
  if (!account) {
    throw new ApiError(httpStatus.NOT_FOUND, `Account not found for ID: ${accountId}`);
  }

  if (propertyId) {
    const property = await Property.findByPk(propertyId);
    if (!property) {
      throw new ApiError(httpStatus.NOT_FOUND, `Property not found for ID: ${propertyId}`);
    }
  }

  if (unitId) {
    const unit = await Unit.findByPk(unitId);
    if (!unit) {
      throw new ApiError(httpStatus.NOT_FOUND, `Unit not found for ID: ${unitId}`);
    }
    if (propertyId && unit.propertyId !== propertyId) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Unit does not belong to the specified property');
    }
  }

  if (billId) {
    const bill = await Bill.findByPk(billId);
    if (!bill) {
      throw new ApiError(httpStatus.NOT_FOUND, `Bill not found for ID: ${billId}`);
    }
    if (unitId && bill.unitId !== unitId) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Bill does not belong to the specified unit');
    }
  }

  const category = await ExpenseCategory.findByPk(categoryId);
  if (!category) {
    throw new ApiError(httpStatus.NOT_FOUND, `Expense category not found for ID: ${categoryId}`);
  }

  // Create expense in a transaction
  const expense = await Expense.sequelize.transaction(async (t) => {
    return Expense.create(
      {
        accountId,
        propertyId: propertyId || null,
        unitId: unitId || null,
        billId: billId || null,
        categoryId,
        amount,
        expenseDate,
        description: description || null,
        isDeleted: false,
      },
      { transaction: t }
    );
  });

  return expense;
};

/**
 * Query for all expenses matching a filter
 * @param {Object} filter - Sequelize filter
 * @param {Object} options - { sortBy, limit, page, include? }
 * @returns {Promise<{ results: Expense[], page: number, limit: number, totalPages: number, totalResults: number }>}
 */
const getAllExpenses = async (filter, options) => {
  const limit = options.limit && parseInt(options.limit, 10) > 0 ? parseInt(options.limit, 10) : 10;
  const page = options.page && parseInt(options.page, 10) ? 10 : 1;
  const offset = (page - 1) * limit;

  const sort = [];
  if (options.sortBy) {
    const [field, order] = filter.sortBy.split(':');
    sort.push([field, order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC']);
  }

  // Use provided include or default to empty array
  const include = options.include || [];

  const { count, rows } = await Expense.findAndCountAll({
    where: filter,
    limit,
    offset,
    order: sort.length ? sort : [['createdAt', 'DESC']],
    include,
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
 * Get expense by ID
 * @param {string} id - Expense UUID
 * @param {Array} [include=[]] - Array of objects specifying models and attributes to include
 * @returns {Promise<Expense>}
 */
const getExpenseById = async (id, include = []) => {
  const expense = await Expense.findByPk(id, { include });
  if (!expense || expense.isDeleted) {
    throw new ApiError(httpStatus.NOT_FOUND, `Expense not found for ID: ${id}`);
  }
  return expense;
};

/**
 * Update an existing expense by ID
 * @param {string} id - Expense UUID
 * @param {Object} updateBody - { accountId?, propertyId?, unitId?, billId?, categoryId?, amount?, expenseDate?, description? }
 * @returns {Promise<Expense>}
 */
const updateExpense = async (id, updateBody) => {
  const expense = await getExpenseById(id);

  const { accountId, propertyId, unitId, billId, categoryId, amount, expenseDate, description } = updateBody;

  // Validate foreign keys if provided
  if (accountId && accountId !== expense.accountId) {
    const account = await Account.findByPk(accountId);
    if (!account) {
      throw new ApiError(httpStatus.NOT_FOUND, `Account not found for ID: ${accountId}`);
    }
  }

  if (propertyId !== undefined && propertyId !== expense.propertyId) {
    if (propertyId) {
      const property = await Property.findByPk(propertyId);
      if (!property) {
        throw new ApiError(httpStatus.NOT_FOUND, `Property not found for ID: ${propertyId}`);
      }
    }
  }

  if (unitId !== undefined && unitId !== expense.unitId) {
    if (unitId) {
      const unit = await Unit.findByPk(unitId);
      if (!unit) {
        throw new ApiError(httpStatus.NOT_FOUND, `Unit not found for ID: ${unitId}`);
      }
      if (propertyId && unit.propertyId !== propertyId) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Unit does not belong to the specified property');
      }
    }
  }

  if (billId !== undefined && billId !== expense.billId) {
    if (billId) {
      const bill = await Bill.findByPk(billId);
      if (!bill) {
        throw new ApiError(httpStatus.NOT_FOUND, `Bill not found for ID: ${billId}`);
      }
      if (unitId && bill.unitId !== unitId) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Bill does not belong to the specified unit');
      }
    }
  }

  if (categoryId && categoryId !== expense.categoryId) {
    const category = await ExpenseCategory.findByPk(categoryId);
    if (!category) {
      throw new ApiError(httpStatus.NOT_FOUND, `Expense category not found for ID: ${categoryId}`);
    }
  }

  // Perform the update
  await expense.update({
    accountId: accountId !== undefined ? accountId : expense.accountId,
    propertyId: propertyId !== undefined ? propertyId : expense.propertyId,
    unitId: unitId !== undefined ? unitId : expense.unitId,
    billId: billId !== undefined ? billId : expense.billId,
    categoryId: categoryId !== undefined ? categoryId : expense.categoryId,
    amount: amount !== undefined ? amount : expense.amount,
    expenseDate: expenseDate !== undefined ? expenseDate : expense.expenseDate,
    description: description !== undefined ? description : expense.description,
  });

  return expense;
};

/**
 * Soft delete an expense by ID
 * @param {string} id - Expense UUID
 * @returns {Promise<void>}
 */
const deleteExpense = async (id) => {
  const expense = await getExpenseById(id);
  if (expense.isDeleted) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Expense is already deleted');
  }
  await expense.update({ isDeleted: true });
};

/**
 * Hard delete an expense by ID
 * @param {string} id - Expense UUID
 * @returns {Promise<void>}
 */
const hardDeleteExpense = async (id) => {
  const expense = await getExpenseById(id);
  await expense.destroy();
};

module.exports = {
  createExpense,
  getAllExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  hardDeleteExpense,
};
