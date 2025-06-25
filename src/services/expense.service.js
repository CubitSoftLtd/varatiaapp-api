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

  // Create expense and update bill in a transaction
  const expense = await Expense.sequelize.transaction(async (t) => {
    const createdExpense = await Expense.create(
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

    // If linked to a bill, update its amounts
    if (billId) {
      const bill = await Bill.findByPk(billId, { transaction: t });
      bill.otherChargesAmount = parseFloat(bill.otherChargesAmount || 0) + parseFloat(amount);
      bill.totalAmount =
        parseFloat(bill.rentAmount || 0) + parseFloat(bill.totalUtilityAmount || 0) + parseFloat(bill.otherChargesAmount);
      await bill.save({ transaction: t });
    }

    return createdExpense;
  });

  return expense;
};

/**
 * Query for all expenses matching a filter
 * @param {Object} filter - Sequelize filter
 * @param {Object} options - { sortBy, limit, page, include? }
 * @returns {Promise<{ results: Expense[], page: number, limit: number, totalPages: number, totalResults: number }>}
 */
const getAllExpenses = async (filter, options, deleted = 'false') => {
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

  // Clone include to avoid mutating options
  let include = options.include || [];
  if (include.some((item) => item.model === Bill && item.attributes.includes('invoiceNo'))) {
    include = include.map((item) => {
      if (item.model === Bill) {
        return {
          ...item,
          attributes: [...(item.attributes || []), 'issueDate'],
        };
      }
      return item;
    });
  }

  const { count, rows } = await Expense.findAndCountAll({
    where: whereClause,
    limit,
    offset,
    order: sort.length ? sort : [['createdAt', 'DESC']],
    include,
  });

  const results = rows.map((expense) => {
    const clonedExpense = expense.toJSON();

    if (clonedExpense.bill?.issueDate && clonedExpense.bill?.invoiceNo !== undefined) {
      const billYear = new Date(clonedExpense.bill.issueDate).getFullYear();
      const formattedInvoiceNo = String(clonedExpense.bill.invoiceNo).padStart(4, '0');
      clonedExpense.bill.invoiceNo = `INV-${billYear}-${formattedInvoiceNo}`;
      delete clonedExpense.bill.issueDate;
    }

    return clonedExpense;
  });

  return {
    results,
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
  if (include.find((item) => item.model === Bill && item.attributes.includes('invoiceNo'))) {
    /* If the Bill model is included but does not have issueDate, add it to attributes */
    /* eslint-disable-next-line no-param-reassign */
    include = include.map((item) => {
      if (item.model === Bill) {
        return {
          ...item,
          attributes: [...(item.attributes || []), 'issueDate'],
        };
      }
      return item;
    });
  }

  const expense = await Expense.findByPk(id, { include });
  if (!expense) {
    throw new ApiError(httpStatus.NOT_FOUND, `Expense not found for ID: ${id}`);
  }
  // If the expense has a bill, ensure it is included in the result
  if (expense.bill) {
    const billYear = new Date(expense.bill.dataValues.issueDate).getFullYear();
    const formattedInvoiceNo = String(expense.bill.dataValues.invoiceNo).padStart(4, '0');
    expense.bill.dataValues.invoiceNo = `INV-${billYear}-${formattedInvoiceNo}`;
    delete expense.bill.issueDate;
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

  // Store old values for bill updates
  const oldBillId = expense.billId;
  const oldAmount = parseFloat(expense.amount);

  // Perform update and adjust bills in a transaction
  await Expense.sequelize.transaction(async (t) => {
    await expense.update(
      {
        accountId: accountId !== undefined ? accountId : expense.accountId,
        propertyId: propertyId !== undefined ? propertyId : expense.propertyId,
        unitId: unitId !== undefined ? unitId : expense.unitId,
        billId: billId !== undefined ? billId : expense.billId,
        categoryId: categoryId !== undefined ? categoryId : expense.categoryId,
        amount: amount !== undefined ? amount : expense.amount,
        expenseDate: expenseDate !== undefined ? expenseDate : expense.expenseDate,
        description: description !== undefined ? description : expense.description,
      },
      { transaction: t }
    );

    const newBillId = expense.billId;
    const newAmount = parseFloat(expense.amount);

    // Case 1: Bill ID changed
    if (oldBillId && oldBillId !== newBillId) {
      const oldBill = await Bill.findByPk(oldBillId, { transaction: t });
      if (oldBill) {
        oldBill.otherChargesAmount = parseFloat(oldBill.otherChargesAmount || 0) - oldAmount;
        oldBill.totalAmount =
          parseFloat(oldBill.rentAmount || 0) +
          parseFloat(oldBill.totalUtilityAmount || 0) +
          parseFloat(oldBill.otherChargesAmount);
        await oldBill.save({ transaction: t });
      }
    }
    if (newBillId) {
      const newBill = await Bill.findByPk(newBillId, { transaction: t });
      if (newBill) {
        newBill.otherChargesAmount = parseFloat(newBill.otherChargesAmount || 0) + newAmount;
        newBill.totalAmount =
          parseFloat(newBill.rentAmount || 0) +
          parseFloat(newBill.totalUtilityAmount || 0) +
          parseFloat(newBill.otherChargesAmount);
        await newBill.save({ transaction: t });
      }
    }
    // Case 2: Bill ID unchanged, but amount changed
    else if (oldBillId === newBillId && oldAmount !== newAmount && newBillId) {
      const bill = await Bill.findByPk(newBillId, { transaction: t });
      if (bill) {
        bill.otherChargesAmount = parseFloat(bill.otherChargesAmount || 0) - oldAmount + newAmount;
        bill.totalAmount =
          parseFloat(bill.rentAmount || 0) + parseFloat(bill.totalUtilityAmount || 0) + parseFloat(bill.otherChargesAmount);
        await bill.save({ transaction: t });
      }
    }
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
