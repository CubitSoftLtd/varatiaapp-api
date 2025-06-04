const httpStatus = require('http-status');
const { ExpenseCategory, Expense, Property, Unit, User, Bill } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a new Expense
 *
 * @param {Object} context      – an object containing exactly one of { propertyId, unitId, userId }
 * @param {Object} expenseBody  – { accountId, userId?, unitId?, propertyId?, categoryId, expenseType, amount, expenseDate, description?, billId? }
 * @returns {Promise<Expense>}
 */
const createExpense = async (context, expenseBody) => {
  const { propertyId: ctxPropertyId, unitId: ctxUnitId, userId: ctxUserId } = context;
  const {
    accountId = '6dcab049-58b3-4f02-a089-694da59f8052',
    userId: bodyUserId,
    unitId: bodyUnitId,
    propertyId: bodyPropertyId,
    categoryId,
    expenseType,
    amount,
    expenseDate,
    description,
    billId,
  } = expenseBody;

  // Determine final associations:
  //   If propertyId comes from URL, use ctxPropertyId and ignore bodyPropertyId.
  //   If unitId comes from URL, use ctxUnitId and ignore bodyUnitId.
  //   If userId comes from URL, use ctxUserId and ignore bodyUserId.
  // (But still allow body to override if URL param is absent.)
  const finalPropertyId = ctxPropertyId || bodyPropertyId || null;
  const finalUnitId = ctxUnitId || bodyUnitId || null;
  const finalUserId = ctxUserId || bodyUserId || null;

  // 1) Validate expenseType ↔ required ID:
  if (expenseType === 'utility' && !finalPropertyId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Utility expenses must be associated with a property');
  }
  if (expenseType === 'personal' && !finalUserId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Personal expenses must be associated with a user');
  }
  if (expenseType === 'tenant_charge' && !finalUnitId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Tenant charges must be associated with a unit');
  }
  // 2) Validate billId based on expenseType
  if (expenseType === 'tenant_charge' && !billId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Tenant charge expenses must be associated with a bill');
  }
  if (billId && expenseType !== 'tenant_charge') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Only tenant charge expenses can be associated with a bill');
  }

  // 3) Existence checks for each ID (if present)
  if (finalPropertyId) {
    const property = await Property.findByPk(finalPropertyId);
    if (!property) {
      throw new ApiError(httpStatus.NOT_FOUND, `Property not found for ID: ${finalPropertyId}`);
    }
  }
  if (finalUnitId) {
    const unit = await Unit.findByPk(finalUnitId);
    if (!unit) {
      throw new ApiError(httpStatus.NOT_FOUND, `Unit not found for ID: ${finalUnitId}`);
    }
  }
  if (finalUserId) {
    const user = await User.findByPk(finalUserId);
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, `User not found for ID: ${finalUserId}`);
    }
  }
  if (categoryId) {
    const category = await ExpenseCategory.findByPk(categoryId);
    if (!category) {
      throw new ApiError(httpStatus.NOT_FOUND, `Expense category not found for ID: ${categoryId}`);
    }
  }
  if (billId) {
    const bill = await Bill.findByPk(billId);
    if (!bill) {
      throw new ApiError(httpStatus.NOT_FOUND, `Bill not found for ID: ${billId}`);
    }
  }

  // 4) Create the Expense
  const expense = await Expense.create({
    accountId,
    userId: finalUserId,
    unitId: finalUnitId,
    propertyId: finalPropertyId,
    categoryId,
    billId: billId || null,
    expenseType,
    amount,
    expenseDate,
    description: description || null,
  });

  return expense;
};

/**
 * Query for all expenses matching a filter
 *
 * @param {Object} filterOptions  – may contain { propertyId, unitId, userId, categoryId, expenseType, billId, ... }
 * @param {Object} options        – { sortBy, limit, page }
 * @returns {Promise<Object>}     – { results, page, limit, totalPages, totalResults }
 */
const getAllExpenses = async (filterOptions, options) => {
  // Parse pagination + sorting
  const limit = parseInt(options.limit, 10) || 10;
  const page = parseInt(options.page, 10) || 1;
  const offset = (page - 1) * limit;

  const sort = [];
  if (options.sortBy) {
    const [field, order] = options.sortBy.split(':');
    sort.push([field, order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC']);
  }

  // Build the WHERE clause by picking only valid keys from filterOptions
  // (Sequelize will ignore null/undefined or invalid fields if they aren't in the model)
  const whereClause = {};
  if (filterOptions.propertyId) whereClause.propertyId = filterOptions.propertyId;
  if (filterOptions.unitId) whereClause.unitId = filterOptions.unitId;
  if (filterOptions.userId) whereClause.userId = filterOptions.userId;
  if (filterOptions.categoryId) whereClause.categoryId = filterOptions.categoryId;
  if (filterOptions.expenseType) whereClause.expenseType = filterOptions.expenseType;
  if (filterOptions.billId) whereClause.billId = filterOptions.billId;

  const { count, rows } = await Expense.findAndCountAll({
    where: whereClause,
    limit,
    offset,
    order: sort.length ? sort : [['expenseDate', 'DESC']],
    include: [
      { model: Property, as: 'property' },
      { model: Unit, as: 'unit' },
      { model: User, as: 'user' },
      { model: ExpenseCategory, as: 'category' },
      { model: Bill, as: 'bill' },
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
 * Get a single expense by its ID
 *
 * @param {string} id
 * @returns {Promise<Expense>}
 */
const getExpenseById = async (id) => {
  const expense = await Expense.findByPk(id, {
    include: [
      { model: Property, as: 'property' },
      { model: Unit, as: 'unit' },
      { model: User, as: 'user' },
      { model: ExpenseCategory, as: 'category' },
      { model: Bill, as: 'bill' },
    ],
  });
  if (!expense) {
    throw new ApiError(httpStatus.NOT_FOUND, `Expense not found for ID: ${id}`);
  }
  return expense;
};

/**
 * Update an existing expense by ID
 *
 * @param {string} id              – expense UUID
 * @param {Object} updateBody      – may contain { accountId?, userId?, unitId?, propertyId?, categoryId?, billId?, expenseType?, amount?, expenseDate?, description? }
 * @returns {Promise<Expense>}
 */
const updateExpense = async (id, updateBody) => {
  const expense = await getExpenseById(id);
  const {
    accountId,
    userId: newUserId,
    unitId: newUnitId,
    propertyId: newPropertyId,
    categoryId: newCategoryId,
    billId: newBillId,
    expenseType: newExpenseType,
    amount: newAmount,
    expenseDate: newExpenseDate,
    description: newDescription,
  } = updateBody;

  // 1) Prevent changing of expenseType once set
  if (newExpenseType && newExpenseType !== expense.expenseType) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Expense type cannot be changed');
  }

  // 2) Conditional associations based on existing expenseType
  if (newPropertyId && expense.expenseType === 'personal') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Personal expenses cannot be associated with a property');
  }
  if (newUnitId && expense.expenseType === 'personal') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Personal expenses cannot be associated with a unit');
  }
  if (newUserId && (expense.expenseType === 'utility' || expense.expenseType === 'tenant_charge')) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Utility or tenant charge expenses cannot be associated with a user');
  }
  if (newBillId && expense.expenseType !== 'tenant_charge') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Only tenant charge expenses can be associated with a bill');
  }
  if (expense.expenseType === 'tenant_charge' && newBillId === null) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Tenant charge expenses must be associated with a bill');
  }

  // 3) Existence checks for any updated foreign keys
  if (newPropertyId && newPropertyId !== expense.propertyId) {
    const property = await Property.findByPk(newPropertyId);
    if (!property) {
      throw new ApiError(httpStatus.NOT_FOUND, `Property not found for ID: ${newPropertyId}`);
    }
  }

  if (newUnitId && newUnitId !== expense.unitId) {
    const unit = await Unit.findByPk(newUnitId);
    if (!unit) {
      throw new ApiError(httpStatus.NOT_FOUND, `Unit not found for ID: ${newUnitId}`);
    }
  }

  if (newUserId && newUserId !== expense.userId) {
    const user = await User.findByPk(newUserId);
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, `User not found for ID: ${newUserId}`);
    }
  }

  if (newCategoryId && newCategoryId !== expense.categoryId) {
    const category = await ExpenseCategory.findByPk(newCategoryId);
    if (!category) {
      throw new ApiError(httpStatus.NOT_FOUND, `Expense category not found for ID: ${newCategoryId}`);
    }
  }

  if (newBillId && newBillId !== expense.billId) {
    const bill = await Bill.findByPk(newBillId);
    if (!bill) {
      throw new ApiError(httpStatus.NOT_FOUND, `Bill not found for ID: ${newBillId}`);
    }
  }

  // 4) Perform the update
  await expense.update({
    accountId: accountId !== undefined ? accountId : expense.accountId,
    userId: newUserId !== undefined ? newUserId : expense.userId,
    unitId: newUnitId !== undefined ? newUnitId : expense.unitId,
    propertyId: newPropertyId !== undefined ? newPropertyId : expense.propertyId,
    categoryId: newCategoryId !== undefined ? newCategoryId : expense.categoryId,
    billId: newBillId !== undefined ? newBillId : expense.billId,
    // expenseType cannot change
    amount: newAmount !== undefined ? newAmount : expense.amount,
    expenseDate: newExpenseDate !== undefined ? newExpenseDate : expense.expenseDate,
    description: newDescription !== undefined ? newDescription : expense.description,
  });

  return expense;
};

/**
 * Delete an expense by ID
 *
 * @param {string} id
 * @returns {Promise<void>}
 */
const deleteExpense = async (id) => {
  const expense = await getExpenseById(id);
  // If this expense is tied to a Bill, unlink it first (per original logic)
  if (expense.billId) {
    await expense.update({ billId: null });
  }
  await expense.destroy();
};

module.exports = {
  createExpense,
  getAllExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
};
