const httpStatus = require('http-status');
const { Op } = require('sequelize');
const { Bill, Tenant, Unit, Meter, Submeter, Payment, Expense, UtilityType, Property, Account } = require('../models');
const meterReadingService = require('./meterReading.service');
const ApiError = require('../utils/ApiError');

/**
 * Calculate utility cost for a meter or submeter
 * @param {string} meterId - Meter UUID (optional)
 * @param {string} submeterId - Submeter UUID (optional)
 * @param {number} consumption - Consumption value
 * @returns {Promise<number>} - Calculated cost
 */
const calculateUtilityCost = async (meterId, submeterId, consumption) => {
  if ((meterId && submeterId) || (!meterId && !submeterId)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Exactly one of meterId or submeterId must be provided');
  }

  let utilityType;
  if (meterId) {
    const meter = await Meter.findByPk(meterId, { include: [{ model: UtilityType, as: 'utilityType' }] });
    if (!meter) {
      throw new ApiError(httpStatus.NOT_FOUND, `Meter not found for ID: ${meterId}`);
    }
    utilityType = meter.utilityType;
  } else {
    const submeter = await Submeter.findByPk(submeterId, { include: [{ model: UtilityType, as: 'utilityType' }] });
    if (!submeter) {
      throw new ApiError(httpStatus.NOT_FOUND, `Submeter not found for ID: ${submeterId}`);
    }
    utilityType = submeter.utilityType;
  }

  if (!utilityType || !utilityType.unitRate) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Unit rate missing for utility type`);
  }

  return parseFloat(consumption) * parseFloat(utilityType.unitRate);
};

/**
 * Create a bill with validation and transaction
 * @param {Object} billBody - { tenantId, unitId, accountId, billingPeriodStart, billingPeriodEnd, rentAmount, dueDate, issueDate?, notes? }
 * @returns {Promise<Bill>}
 */
const createBill = async (billBody) => {
  const { tenantId, unitId, accountId, billingPeriodStart, billingPeriodEnd, rentAmount, dueDate, issueDate, notes } =
    billBody;

  // Validate required fields
  if (
    !tenantId ||
    !unitId ||
    !accountId ||
    !billingPeriodStart ||
    !billingPeriodEnd ||
    rentAmount === undefined ||
    !dueDate
  ) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Required fields: tenantId, unitId, accountId, billingPeriodStart, billingPeriodEnd, rentAmount, dueDate'
    );
  }

  // Validate non-negative amounts
  if (rentAmount < 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Rent amount cannot be negative');
  }

  // Validate dates
  const start = new Date(billingPeriodStart);
  const end = new Date(billingPeriodEnd);
  const due = new Date(dueDate);
  const issue = issueDate ? new Date(issueDate) : new Date();
  if (start > end) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Billing period start must be before or equal to end');
  }
  if (due < issue) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Due date must be on or after issue date');
  }

  // Validate foreign keys
  const tenant = await Tenant.findByPk(tenantId);
  if (!tenant) {
    throw new ApiError(httpStatus.NOT_FOUND, `Tenant not found for ID: ${tenantId}`);
  }

  const unit = await Unit.findByPk(unitId, { include: [{ model: Property, as: 'property' }] });
  if (!unit) {
    throw new ApiError(httpStatus.NOT_FOUND, `Unit not found for ID: ${unitId}`);
  }

  const account = await Account.findByPk(accountId);
  if (!account) {
    throw new ApiError(httpStatus.NOT_FOUND, `Account not found for ID: ${accountId}`);
  }

  // Validate tenant-unit association
  if (unit.tenantId !== tenantId) {
    throw new ApiError(httpStatus.BAD_REQUEST, `Tenant ${tenantId} is not assigned to unit ${unitId}`);
  }

  // Check for duplicate bill
  const existingBill = await Bill.findOne({
    where: { tenantId, unitId, billingPeriodStart, billingPeriodEnd, isDeleted: false },
  });
  if (existingBill) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Bill already exists for tenant ${tenantId}, unit ${unitId}, and period ${billingPeriodStart} to ${billingPeriodEnd}`
    );
  }

  // Calculate utility expenses
  let totalUtilityAmount = 0;
  const meters = await Meter.findAll({
    where: { propertyId: unit.propertyId },
  });
  const submeters = await Submeter.findAll({
    where: { unitId },
  });

  // eslint-disable-next-line no-restricted-syntax
  for (const meter of meters) {
    // eslint-disable-next-line no-await-in-loop
    const consumption = await meterReadingService.calculateConsumption(meter.id, null, start, end);
    if (consumption > 0) {
      // eslint-disable-next-line no-await-in-loop
      const utilityCost = await calculateUtilityCost(meter.id, null, consumption);
      totalUtilityAmount += utilityCost;
    }
  }

  // eslint-disable-next-line no-restricted-syntax
  for (const submeter of submeters) {
    // eslint-disable-next-line no-await-in-loop
    const consumption = await meterReadingService.calculateConsumption(null, submeter.id, start, end);
    if (consumption > 0) {
      // eslint-disable-next-line no-await-in-loop
      const utilityCost = await calculateUtilityCost(null, submeter.id, consumption);
      totalUtilityAmount += utilityCost;
    }
  }

  // Calculate other charges from tenant_charge expenses
  const expenses = await Expense.findAll({
    where: {
      unitId,
      expenseType: 'tenant_charge',
      billId: null,
      expenseDate: { [Op.between]: [start, end] },
    },
  });
  const otherChargesAmount = expenses.reduce((sum, charge) => sum + parseFloat(charge.amount), 0);

  // Create bill in a transaction
  const bill = await Bill.sequelize.transaction(async (t) => {
    const newBill = Bill.create(
      {
        tenantId,
        unitId,
        accountId,
        billingPeriodStart,
        billingPeriodEnd,
        rentAmount,
        totalUtilityAmount,
        otherChargesAmount,
        dueDate,
        issueDate: issueDate || new Date(),
        paymentStatus: 'unpaid',
        amountPaid: 0.0,
        notes: notes || null,
        isDeleted: false,
      },
      { transaction: t }
    );

    // Link expenses to the new bill
    if (expenses.length > 0) {
      await Expense.update(
        { billId: newBill.id },
        { where: { id: expenses.map((e) => e.id), billId: null }, transaction: t }
      );
    }

    return newBill;
  });

  return bill;
};

/**
 * Query for all bills with pagination, sorting, and optional inclusion
 * @param {Object} filter - Sequelize filter
 * @param {Object} options - { sortBy, limit, page, include? }
 * @returns {Promise<{ results: Bill[], page: number, limit: number, totalPages: number, totalResults: number }>}
 */
const getAllBills = async (filter, options) => {
  const limit = options.limit && parseInt(options.limit, 10) > 0 ? parseInt(options.limit, 10) : 10;
  const page = options.page && parseInt(options.page, 10) > 0 ? parseInt(options.page, 10) : 1;
  const offset = (page - 1) * limit;

  const sort = [];
  if (options.sortBy) {
    const [field, order] = options.sortBy.split(':');
    sort.push([field, order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC']);
  }

  // Update overdue status
  await Bill.update(
    { paymentStatus: 'overdue' },
    {
      where: {
        paymentStatus: { [Op.in]: ['unpaid', 'partially_paid'] },
        dueDate: { [Op.lt]: new Date() },
        isDeleted: false,
      },
    }
  );

  // Use provided include or default to empty array
  const include = options.include || [];

  const { count, rows } = await Bill.findAndCountAll({
    where: { ...filter, isDeleted: false },
    limit,
    offset,
    order: sort.length ? sort : [['dueDate', 'DESC']],
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
 * Get bill by ID
 * @param {string} id - Bill UUID
 * @param {Array} [include=[]] - Array of objects specifying models and attributes to include
 * @returns {Promise<Bill>}
 */
const getBillById = async (id, include = []) => {
  const bill = await Bill.findByPk(id, { include });
  if (!bill || bill.isDeleted) {
    throw new ApiError(httpStatus.NOT_FOUND, `Bill not found for ID: ${id}`);
  }

  if (['unpaid', 'partially_paid'].includes(bill.paymentStatus) && new Date(bill.dueDate) < new Date()) {
    await bill.update({ paymentStatus: 'overdue' });
  }

  return bill;
};

/**
 * Update an existing bill by ID
 * @param {string} billId - Bill UUID
 * @param {Object} updateBody - { tenantId?, unitId?, accountId?, billingPeriodStart?, billingPeriodEnd?, rentAmount?, dueDate?, issueDate?, notes?, paymentStatus? }
 * @returns {Promise<Bill>}
 */
const updateBill = async (billId, updateBody) => {
  const bill = await getBillById(billId);
  const {
    tenantId,
    unitId,
    accountId,
    billingPeriodStart,
    billingPeriodEnd,
    rentAmount,
    dueDate,
    issueDate,
    notes,
    paymentStatus,
    totalUtilityAmount,
    otherChargesAmount,
    amountPaid,
  } = updateBody;

  // Prevent direct updates to calculated fields
  if (totalUtilityAmount !== undefined || otherChargesAmount !== undefined || amountPaid !== undefined) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Cannot directly update totalUtilityAmount, otherChargesAmount, or amountPaid'
    );
  }

  // Validate paymentStatus if provided
  if (paymentStatus && !['unpaid', 'partially_paid', 'paid', 'overdue', 'cancelled'].includes(paymentStatus)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid payment status');
  }

  // Validate foreign keys if provided
  const newTenantId = tenantId || bill.tenantId;
  const newUnitId = unitId || bill.unitId;

  if (tenantId && tenantId !== bill.tenantId) {
    const tenant = await Tenant.findByPk(tenantId);
    if (!tenant) {
      throw new ApiError(httpStatus.NOT_FOUND, `Tenant not found for ID: ${tenantId}`);
    }
  }

  if (unitId && unitId !== bill.unitId) {
    const unit = await Unit.findByPk(unitId, { include: [{ model: Property, as: 'property' }] });
    if (!unit) {
      throw new ApiError(httpStatus.NOT_FOUND, `Unit not found for ID: ${unitId}`);
    }
  }

  if (accountId && accountId !== bill.accountId) {
    const account = await Account.findByPk(accountId);
    if (!account) {
      throw new ApiError(httpStatus.NOT_FOUND, `Account not found for ID: ${accountId}`);
    }
  }

  // Validate tenant-unit association
  if (tenantId || unitId) {
    const unit = await Unit.findByPk(newUnitId);
    if (unit.tenantId !== newTenantId) {
      throw new ApiError(httpStatus.BAD_REQUEST, `Tenant ${newTenantId} is not assigned to unit ${newUnitId}`);
    }
  }

  // Validate dates if provided
  const newStart = billingPeriodStart ? new Date(billingPeriodStart) : new Date(bill.billingPeriodStart);
  const newEnd = billingPeriodEnd ? new Date(billingPeriodEnd) : new Date(bill.billingPeriodEnd);
  const newDue = dueDate ? new Date(dueDate) : new Date(bill.dueDate);
  const newIssue = issueDate ? new Date(issueDate) : new Date(bill.issueDate);

  if (billingPeriodStart || billingPeriodEnd) {
    if (newStart > newEnd) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Billing period start must be before or equal to end');
    }
  }

  if (dueDate || issueDate) {
    if (newDue < newIssue) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Due date must be on or after issue date');
    }
  }

  // Check for duplicate bill if period changes
  if (billingPeriodStart || billingPeriodEnd || tenantId || unitId) {
    const existingBill = await Bill.findOne({
      where: {
        id: { [Op.ne]: billId },
        tenantId: newTenantId,
        unitId: newUnitId,
        billingPeriodStart: billingPeriodStart || bill.billingPeriodStart,
        billingPeriodEnd: billingPeriodEnd || bill.billingPeriodEnd,
        isDeleted: false,
      },
    });
    if (existingBill) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `Bill already exists for tenant ${newTenantId}, unit ${newUnitId}, and period`
      );
    }
  }

  // Recalculate utility expenses if unitId or period changes
  let newTotalUtilityAmount = bill.totalUtilityAmount;
  if (unitId || billingPeriodStart || billingPeriodEnd) {
    const meters = await Meter.findAll({
      where: { propertyId: (await Unit.findByPk(newUnitId)).propertyId },
    });
    const submeters = await Submeter.findAll({
      where: { unitId: newUnitId },
    });

    newTotalUtilityAmount = 0;
    // eslint-disable-next-line no-restricted-syntax
    for (const meter of meters) {
      // eslint-disable-next-line no-await-in-loop
      const consumption = await meterReadingService.calculateConsumption(meter.id, null, newStart, newEnd);
      if (consumption > 0) {
        // eslint-disable-next-line no-await-in-loop
        const utilityCost = await calculateUtilityCost(meter.id, null, consumption);
        newTotalUtilityAmount += utilityCost;
      }
    }

    // eslint-disable-next-line no-restricted-syntax
    for (const submeter of submeters) {
      // eslint-disable-next-line no-await-in-loop
      const consumption = await meterReadingService.calculateConsumption(null, submeter.id, newStart, newEnd);
      if (consumption > 0) {
        // eslint-disable-next-line no-await-in-loop
        const utilityCost = await calculateUtilityCost(null, submeter.id, consumption);
        newTotalUtilityAmount += utilityCost;
      }
    }
  }

  // Recalculate other charges
  const expenses = await Expense.findAll({
    where: {
      unitId: newUnitId,
      expenseType: 'tenant_charge',
      billId: { [Op.or]: [billId, null] },
      expenseDate: { [Op.between]: [newStart, newEnd] },
    },
  });
  const newOtherChargesAmount = expenses.reduce((sum, charge) => sum + parseFloat(charge.amount), 0);

  // Update payment status based on payments
  const payments = await Payment.findAll({ where: { billId } });
  const totalPaid = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
  let newPaymentStatus = paymentStatus || bill.paymentStatus;
  if (!paymentStatus) {
    // eslint-disable-next-line no-nested-ternary
    newPaymentStatus = totalPaid >= parseFloat(bill.totalAmount) ? 'paid' : totalPaid > 0 ? 'partially_paid' : 'unpaid';
    if (newPaymentStatus === 'unpaid' || newPaymentStatus === 'partially_paid') {
      if (newDue < new Date()) {
        newPaymentStatus = 'overdue';
      }
    }
  }

  // Update bill in a transaction
  await Bill.sequelize.transaction(async (t) => {
    await bill.update(
      {
        tenantId: tenantId || bill.tenantId,
        unitId: unitId || bill.unitId,
        accountId: accountId || bill.accountId,
        billingPeriodStart: billingPeriodStart || bill.billingPeriodStart,
        billingPeriodEnd: billingPeriodEnd || bill.billingPeriodEnd,
        rentAmount: rentAmount !== undefined ? rentAmount : bill.rentAmount,
        totalUtilityAmount: newTotalUtilityAmount,
        otherChargesAmount: newOtherChargesAmount,
        dueDate: dueDate || bill.dueDate,
        issueDate: issueDate || bill.issueDate,
        paymentStatus: newPaymentStatus,
        notes: notes !== undefined ? notes : bill.notes,
      },
      { transaction: t }
    );

    // Link expenses to the bill
    if (expenses.length > 0) {
      await Expense.update({ billId }, { where: { id: expenses.map((e) => e.id), billId: null }, transaction: t });
    }
  });

  return bill;
};

/**
 * Soft delete a bill by ID
 * @param {string} billId - Bill UUID
 * @returns {Promise<void>}
 */
const deleteBill = async (billId) => {
  const bill = await getBillById(billId);
  if (bill.isDeleted) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Bill is already deleted');
  }

  const payments = await Payment.findAll({ where: { billId } });
  if (payments.length > 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot delete bill with associated payments');
  }

  await Bill.sequelize.transaction(async (t) => {
    await Expense.update({ billId: null }, { where: { billId }, transaction: t });
    await bill.update({ isDeleted: true }, { transaction: t });
  });
};

/**
 * Hard delete a bill by ID
 * @param {string} billId - Bill UUID
 * @returns {Promise<void>}
 */
const hardDeleteBill = async (billId) => {
  const bill = await getBillById(billId);
  const payments = await Payment.findAll({ where: { billId } });
  if (payments.length > 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot delete bill with associated payments');
  }

  await Bill.sequelize.transaction(async (t) => {
    await Expense.update({ billId: null }, { where: { billId }, transaction: t });
    await bill.destroy({ transaction: t });
  });
};

module.exports = {
  calculateUtilityCost,
  createBill,
  getAllBills,
  getBillById,
  updateBill,
  deleteBill,
  hardDeleteBill,
};
