const httpStatus = require('http-status');
const { Op } = require('sequelize');
const { Bill, Tenant, Unit, Meter, Payment, Expense, UtilityType, Property } = require('../models');
const meterReadingService = require('./meterReading.service');
const ApiError = require('../utils/ApiError');

/**
 * Calculate utility cost for a meter
 * @param {string} meterId
 * @param {number} consumption
 * @returns {Promise<number>}
 */
const calculateUtilityCost = async (meterId, consumption) => {
  const meter = await Meter.findByPk(meterId, {
    include: [{ model: UtilityType, as: 'utilityType' }],
  });
  if (!meter) {
    throw new ApiError(httpStatus.NOT_FOUND, `Meter not found for ID: ${meterId}`);
  }
  if (!meter.utilityType || !meter.utilityType.unitRate) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Unit rate missing for utility type of meter: ${meterId}`);
  }
  return parseFloat(consumption) * parseFloat(meter.utilityType.unitRate);
};

/**
 * Create a bill
 * @param {Object} billBody
 * @returns {Promise<Bill>}
 */
const createBill = async (billBody) => {
  const { tenantId, unitId, billingPeriod, rentAmount, dueDate, notes } = billBody;

  // Validate tenant
  const tenant = await Tenant.findByPk(tenantId);
  if (!tenant) {
    throw new ApiError(httpStatus.NOT_FOUND, `Tenant not found for ID: ${tenantId}`);
  }

  // Validate unit
  const unit = await Unit.findByPk(unitId);
  if (!unit) {
    throw new ApiError(httpStatus.NOT_FOUND, `Unit not found for ID: ${unitId}`);
  }

  // Validate tenant-unit associationnam
  const tenantUnit = await Unit.findOne({ where: { id: unitId } });
  if (!tenantUnit) {
    throw new ApiError(httpStatus.BAD_REQUEST, `Tenant ${tenantId} is not assigned to unit ${unitId}`);
  }

  // Validate billing period
  if (!/^\d{4}-\d{2}$/.test(billingPeriod)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Billing period must be in YYYY-MM format (e.g., 2025-06)');
  }

  // Check for duplicate bill
  const existingBill = await Bill.findOne({ where: { tenantId, unitId, billingPeriod } });
  if (existingBill) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Bill already exists for tenant ${tenantId}, unit ${unitId}, and period ${billingPeriod}`
    );
  }

  // Calculate utility expense
  const billingStart = new Date(`${billingPeriod}-01`);
  const billingEnd = new Date(billingStart);
  billingEnd.setMonth(billingEnd.getMonth() + 1);
  billingEnd.setDate(billingEnd.getDate() - 1); // Last day of the month

  const meters = await Meter.findAll({
    include: [
      {
        model: Property,
        as: 'property',
        where: { id: unit.propertyId },
      },
    ],
  });

  let totalUtilityAmount = 0;
  // eslint-disable-next-line no-restricted-syntax
  for (const meter of meters) {
    // eslint-disable-next-line no-await-in-loop
    const consumption = await meterReadingService.calculateConsumption(meter.id, billingStart, billingEnd);
    if (consumption > 0) {
      // eslint-disable-next-line no-await-in-loop
      const utilityCost = await calculateUtilityCost(meter.id, consumption);
      totalUtilityAmount += utilityCost;
    }
  }

  // Calculate other expense from tenant_charge expenses
  const expense = await Expense.findAll({
    where: {
      unitId,
      expenseType: 'tenant_charge',
      [Op.or]: [
        { billId: null }, // Unassigned expenses
        { billId: { [Op.eq]: null } }, // Ensure no conflict with previous logic
      ],
      expenseDate: { [Op.lte]: billingEnd },
    },
  });
  const otherChargesAmount = expense.reduce((sum, charge) => sum + parseFloat(charge.amount), 0);

  // Create bill
  const bill = await Bill.create({
    tenantId,
    unitId,
    billingPeriod,
    rentAmount,
    totalUtilityAmount,
    otherChargesAmount,
    dueDate,
    paymentStatus: 'unpaid',
    notes,
  });

  // Link unassigned expense to the new bill
  if (expense.length > 0) {
    await Expense.update({ billId: bill.id }, { where: { id: expense.map((c) => c.id), billId: null } });
  }

  // Recalculate otherChargesAmount to include any pre-existing expenses with this billId
  const existingCharges = await Expense.findAll({
    where: {
      unitId,
      expenseType: 'tenant_charge',
      billId: bill.id,
    },
  });
  const totalOtherCharges = otherChargesAmount + existingCharges.reduce((sum, charge) => sum + parseFloat(charge.amount), 0);
  await bill.update({ otherChargesAmount: totalOtherCharges });

  return bill;
};

/**
 * Query for bills
 * @param {Object} filter
 * @param {Object} options
 * @returns {Promise<Object>}
 */
const getAllBills = async (filter, options) => {
  const limit = parseInt(options.limit, 10) || 10;
  const page = parseInt(options.page, 10) || 1;
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
      },
    }
  );

  const { count, rows } = await Bill.findAndCountAll({
    where: filter,
    limit,
    offset,
    order: sort.length ? sort : [['dueDate', 'DESC']],
    include: [
      { model: Tenant, as: 'tenant' },
      { model: Unit, as: 'unit' },
      { model: Payment, as: 'payment' },
      { model: Expense, as: 'expense', where: { expenseType: 'tenant_charge' }, required: false },
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
 * Get bill by id
 * @param {string} id
 * @returns {Promise<Bill>}
 */
const getBillById = async (id) => {
  const bill = await Bill.findByPk(id, {
    include: [
      { model: Tenant, as: 'tenant' },
      { model: Unit, as: 'unit' },
      { model: Payment, as: 'payment' },
      { model: Expense, as: 'expense', where: { expenseType: 'tenant_charge' }, required: false },
    ],
  });
  if (!bill) {
    throw new ApiError(httpStatus.NOT_FOUND, `Bill not found for ID: ${id}`);
  }

  if (['unpaid', 'partially_paid'].includes(bill.paymentStatus) && bill.dueDate < new Date()) {
    await bill.update({ paymentStatus: 'overdue' });
  }

  return bill;
};

/**
 * Update bill by id
 * @param {string} billId
 * @param {Object} updateBody
 * @returns {Promise<Bill>}
 */
const updateBill = async (billId, updateBody) => {
  const bill = await getBillById(billId);

  const { tenantId, unitId, billingPeriod, rentAmount, dueDate, notes } = updateBody;

  // Validate tenant and unit consistency
  if (tenantId && tenantId !== bill.tenantId) {
    const tenant = await Tenant.findByPk(tenantId);
    if (!tenant) throw new ApiError(httpStatus.NOT_FOUND, `Tenant not found for ID: ${tenantId}`);
    const tenantUnit = await Unit.findOne({ where: { tenantId, unitId: bill.unitId } });
    if (!tenantUnit) throw new ApiError(httpStatus.BAD_REQUEST, `Tenant ${tenantId} is not assigned to unit ${bill.unitId}`);
  }
  if (unitId && unitId !== bill.unitId) {
    const unit = await Unit.findByPk(unitId);
    if (!unit) throw new ApiError(httpStatus.NOT_FOUND, `Unit not found for ID: ${unitId}`);
    const tenantUnit = await Unit.findOne({ where: { tenantId: bill.tenantId, unitId } });
    if (!tenantUnit) throw new ApiError(httpStatus.BAD_REQUEST, `Tenant ${bill.tenantId} is not assigned to unit ${unitId}`);
  }

  if (billingPeriod && !/^\d{4}-\d{2}$/.test(billingPeriod)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Billing period must be in YYYY-MM format (e.g., 2025-06)');
  }

  if (updateBody.totalAmount) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Total amount cannot be updated directly');
  }

  if (rentAmount !== undefined) {
    await bill.update({ rentAmount });
  }
  if (dueDate !== undefined) {
    await bill.update({ dueDate });
  }

  // Recalculate utility expense if unitId changes
  if (unitId && unitId !== bill.unitId) {
    const billingStart = new Date(`${bill.billingPeriod}-01`);
    const billingEnd = new Date(billingStart);
    billingEnd.setMonth(billingEnd.getMonth() + 1);
    billingEnd.setDate(billingEnd.getDate() - 1);

    const meters = await Meter.findAll({
      include: [
        {
          model: Property,
          as: 'property',
          where: { id: unitId },
        },
      ],
    });

    let totalUtilityAmount = 0;
    // eslint-disable-next-line no-restricted-syntax
    for (const meter of meters) {
      // eslint-disable-next-line no-await-in-loop
      const consumption = await meterReadingService.calculateConsumption(meter.id, billingStart, billingEnd);
      if (consumption > 0) {
        // eslint-disable-next-line no-await-in-loop
        const utilityCost = await calculateUtilityCost(meter.id, consumption);
        totalUtilityAmount += utilityCost;
      }
    }
    await bill.update({ totalUtilityAmount });
  }

  // Recalculate otherChargesAmount based on linked expenses
  const expense = await Expense.findAll({
    where: {
      unitId,
      expenseType: 'tenant_charge',
    },
  });
  const otherChargesAmount = expense.reduce((sum, charge) => sum + parseFloat(charge.amount), 0);
  await bill.update({ otherChargesAmount });

  if (notes !== undefined) {
    await bill.update({ notes });
  }

  const payments = await Payment.findAll({ where: { billId } });
  const totalPaid = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
  // eslint-disable-next-line no-nested-ternary
  const paymentStatus = totalPaid >= parseFloat(bill.totalAmount) ? 'paid' : totalPaid > 0 ? 'partially_paid' : 'unpaid';
  await bill.update({ paymentStatus });

  return bill;
};

/**
 * Delete bill by id
 * @param {string} billId
 * @returns {Promise<void>}
 */
const deleteBill = async (billId) => {
  const bill = await getBillById(billId);

  // Unlink expenses before deletion
  await Expense.update({ billId: null }, { where: { billId } });

  await bill.destroy();
};

// Last updated: June 03, 2025, 02:48 PM +06
module.exports = {
  createBill,
  getAllBills,
  getBillById,
  updateBill,
  deleteBill,
};
