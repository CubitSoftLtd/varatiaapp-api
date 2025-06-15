const httpStatus = require('http-status');
const { Bill, Account, Unit, Tenant } = require('../models');
const ApiError = require('../utils/ApiError');
const meterReadingService = require('./meterReading.service');

/**
 * Create a new bill with validation and transaction
 * @param {Object} billBody - { accountId, tenantId, unitId, billingPeriodStart, billingPeriodEnd, rentAmount, totalUtilityAmount?, dueDate, issueDate?, notes? }
 * @returns {Promise<Bill>}
 */
const createBill = async (billBody) => {
  const {
    accountId,
    tenantId,
    unitId,
    billingPeriodStart,
    billingPeriodEnd,
    rentAmount,
    totalUtilityAmount,
    dueDate,
    issueDate,
    notes,
  } = billBody;

  // Validate required fields
  if (!accountId || !tenantId || !unitId || !billingPeriodStart || !billingPeriodEnd || !rentAmount || !dueDate) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Account ID, tenant ID, unit ID, billing period start, billing period end, rent amount, and due date are required'
    );
  }

  // Validate foreign keys
  const account = await Account.findByPk(accountId);
  if (!account) {
    throw new ApiError(httpStatus.NOT_FOUND, `Account not found for ID: ${accountId}`);
  }

  const tenant = await Tenant.findByPk(tenantId);
  if (!tenant) {
    throw new ApiError(httpStatus.NOT_FOUND, `Tenant not found for ID: ${tenantId}`);
  }

  const unit = await Unit.findByPk(unitId);
  if (!unit) {
    throw new ApiError(httpStatus.NOT_FOUND, `Unit not found for ID: ${unitId}`);
  }

  // Validate billing period
  if (new Date(billingPeriodStart) > new Date(billingPeriodEnd)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Billing period start must be before or equal to billing period end');
  }

  // Calculate totalUtilityAmount if not provided
  let calculatedTotalUtilityAmount = totalUtilityAmount || 0;
  if (!totalUtilityAmount) {
    const meter = await unit.getMeter(); // Assuming Unit has a getMeter association for a single meter
    const submeter = await unit.getSubmeter(); // Assuming Unit has a getSubmeter association for a single submeter

    if (meter) {
      const consumption = await meterReadingService.calculateConsumption(
        meter.id,
        null,
        billingPeriodStart,
        billingPeriodEnd
      );
      calculatedTotalUtilityAmount += consumption * (meter.unitRate || 1); // Default unitRate to 1 if undefined
    } else if (submeter) {
      const associatedMeter = await submeter.getMeter(); // Assuming Submeter has a getMeter association
      const consumption = await meterReadingService.calculateConsumption(
        associatedMeter.id,
        submeter.id,
        billingPeriodStart,
        billingPeriodEnd
      );
      calculatedTotalUtilityAmount += consumption * (submeter.unitRate || 1); // Default unitRate to 1 if undefined
    } else {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Unit must have a meter or submeter associated.');
    }
  }

  // Create bill in a transaction
  const bill = await Bill.sequelize.transaction(async (t) => {
    return Bill.create(
      {
        accountId,
        tenantId,
        unitId,
        billingPeriodStart,
        billingPeriodEnd,
        rentAmount: parseFloat(rentAmount),
        totalUtilityAmount: parseFloat(calculatedTotalUtilityAmount),
        dueDate,
        issueDate: issueDate || new Date(), // Default to current date (June 15, 2025, 1:04 PM +06)
        paymentStatus: 'unpaid',
        amountPaid: 0.0,
        notes: notes || null,
        isDeleted: false,
      },
      { transaction: t }
    );
  });

  return bill;
};

/**
 * Query for all bills matching a filter
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

  const include = options.include || [];

  const { count, rows } = await Bill.findAndCountAll({
    where: { ...filter, isDeleted: false },
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
  return bill;
};

/**
 * Update an existing bill by ID
 * @param {string} id - Bill UUID
 * @param {Object} updateBody - { accountId?, tenantId?, unitId?, billingPeriodStart?, billingPeriodEnd?, rentAmount?, totalUtilityAmount?, dueDate?, issueDate?, notes? }
 * @returns {Promise<Bill>}
 */
const updateBill = async (id, updateBody) => {
  const bill = await getBillById(id);

  const {
    accountId,
    tenantId,
    unitId,
    billingPeriodStart,
    billingPeriodEnd,
    rentAmount,
    totalUtilityAmount,
    dueDate,
    issueDate,
    notes,
  } = updateBody;

  // Validate foreign keys if provided
  if (accountId && accountId !== bill.accountId) {
    const account = await Account.findByPk(accountId);
    if (!account) {
      throw new ApiError(httpStatus.NOT_FOUND, `Account not found for ID: ${accountId}`);
    }
  }

  if (tenantId && tenantId !== bill.tenantId) {
    const tenant = await Tenant.findByPk(tenantId);
    if (!tenant) {
      throw new ApiError(httpStatus.NOT_FOUND, `Tenant not found for ID: ${tenantId}`);
    }
  }

  if (unitId && unitId !== bill.unitId) {
    const unit = await Unit.findByPk(unitId);
    if (!unit) {
      throw new ApiError(httpStatus.NOT_FOUND, `Unit not found for ID: ${unitId}`);
    }
  }

  if (billingPeriodStart && billingPeriodEnd && new Date(billingPeriodStart) > new Date(billingPeriodEnd)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Billing period start must be before or equal to billing period end');
  }

  // Recalculate totalUtilityAmount if billing period changes
  let calculatedTotalUtilityAmount = totalUtilityAmount || bill.totalUtilityAmount;
  if (
    (billingPeriodStart || billingPeriodEnd) &&
    (billingPeriodStart !== bill.billingPeriodStart || billingPeriodEnd !== bill.billingPeriodEnd)
  ) {
    const unit = await Unit.findByPk(bill.unitId);
    const meter = await unit.getMeter(); // Assuming Unit has a getMeter association
    const submeter = await unit.getSubmeter(); // Assuming Unit has a getSubmeter association

    calculatedTotalUtilityAmount = 0;
    if (meter) {
      const consumption = await meterReadingService.calculateConsumption(
        meter.id,
        null,
        billingPeriodStart || bill.billingPeriodStart,
        billingPeriodEnd || bill.billingPeriodEnd
      );
      calculatedTotalUtilityAmount += consumption * (meter.unitRate || 1); // Default unitRate to 1 if undefined
    } else if (submeter) {
      const associatedMeter = await submeter.getMeter(); // Assuming Submeter has a getMeter association
      const consumption = await meterReadingService.calculateConsumption(
        associatedMeter.id,
        submeter.id,
        billingPeriodStart || bill.billingPeriodStart,
        billingPeriodEnd || bill.billingPeriodEnd
      );
      calculatedTotalUtilityAmount += consumption * (submeter.unitRate || 1); // Default unitRate to 1 if undefined
    } else {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Unit must have a meter or submeter associated.');
    }
  }

  await bill.update({
    accountId: accountId !== undefined ? accountId : bill.accountId,
    tenantId: tenantId !== undefined ? tenantId : bill.tenantId,
    unitId: unitId !== undefined ? unitId : bill.unitId,
    billingPeriodStart: billingPeriodStart !== undefined ? billingPeriodStart : bill.billingPeriodStart,
    billingPeriodEnd: billingPeriodEnd !== undefined ? billingPeriodEnd : bill.billingPeriodEnd,
    rentAmount: rentAmount !== undefined ? parseFloat(rentAmount) : bill.rentAmount,
    totalUtilityAmount: totalUtilityAmount !== undefined ? parseFloat(totalUtilityAmount) : calculatedTotalUtilityAmount,
    dueDate: dueDate !== undefined ? dueDate : bill.dueDate,
    issueDate: issueDate !== undefined ? issueDate : bill.issueDate,
    notes: notes !== undefined ? notes : bill.notes,
  });

  return bill;
};

/**
 * Soft delete a bill by ID
 * @param {string} id - Bill UUID
 * @returns {Promise<void>}
 */
const deleteBill = async (id) => {
  const bill = await getBillById(id);
  if (bill.isDeleted) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Bill is already deleted');
  }
  await bill.update({ isDeleted: true });
};

/**
 * Hard delete a bill by ID
 * @param {string} id - Bill UUID
 * @returns {Promise<void>}
 */
const hardDeleteBill = async (id) => {
  const bill = await getBillById(id);
  await bill.destroy();
};

module.exports = {
  createBill,
  getAllBills,
  getBillById,
  updateBill,
  deleteBill,
  hardDeleteBill,
};
