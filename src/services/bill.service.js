/* eslint-disable prettier/prettier */
/* eslint-disable spaced-comment */
const httpStatus = require('http-status');
const { Op } = require('sequelize'); // <--- ADD THIS LINE: Import Op for date range queries
const { Bill, Account, Meter, Property, UtilityType, Unit, Tenant, Lease } = require('../models');
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
    issueDate = new Date(),
    notes,
  } = billBody;

  // **Validate Required Fields**
  if (!accountId || !tenantId || !unitId || !billingPeriodStart || !billingPeriodEnd || !rentAmount) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Missing required fields');
  }

  // **Validate Foreign Keys**
  const [account, tenant, unit] = await Promise.all([
    Account.findByPk(accountId),
    Tenant.findByPk(tenantId),
    Unit.findByPk(unitId),
  ]);
  if (!account) throw new ApiError(httpStatus.NOT_FOUND, `Account not found: ${accountId}`);
  if (!tenant) throw new ApiError(httpStatus.NOT_FOUND, `Tenant not found: ${tenantId}`);
  if (!unit) throw new ApiError(httpStatus.NOT_FOUND, `Unit not found: ${unitId}`);

  // **Validate Billing Period**
  if (new Date(billingPeriodStart) > new Date(billingPeriodEnd)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid billing period: start must be <= end');
  }
  //////
  const start = new Date(billingPeriodStart);
  const end = new Date(billingPeriodEnd);

  if (start.getFullYear() !== end.getFullYear() || start.getMonth() !== end.getMonth()) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Billing period must be within the same month and year');
  }

  // **Ensure billingPeriodEnd does not exceed last day of the month**
  const lastDayOfMonth = new Date(end.getFullYear(), end.getMonth() + 1, 0).getDate();
  if (end.getDate() > lastDayOfMonth) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Billing period end date cannot exceed ${lastDayOfMonth} for the selected month`
    );
  }
  ////
  // **Calculate totalUtilityAmount if not provided**
  let calculatedTotalUtilityAmount = totalUtilityAmount || 0;
  if (totalUtilityAmount === undefined) {
    const submeters = await unit.getSubmeters({
      include: [{ model: Meter, as: 'meter', include: [{ model: UtilityType, as: 'utilityType' }] }],
    });
    if (submeters.length === 0 && rentAmount > 0) {
      calculatedTotalUtilityAmount = 0; // Allow rent-only bills
    } else if (submeters.length === 0) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'No submeters found for utility calculation');
    } else {
      // Use Promise.all with map to parallelize consumption calculations
      const utilityCharges = await Promise.all(
        submeters.map(async (submeter) => {
          const { meter } = submeter;
          if (!meter) throw new ApiError(httpStatus.BAD_REQUEST, `Submeter ${submeter.id} lacks associated meter`);
          const { utilityType } = meter;
          if (!utilityType) throw new ApiError(httpStatus.BAD_REQUEST, `Meter ${meter.id} lacks utility type`);
          if (!utilityType.unitRate)
            throw new ApiError(httpStatus.BAD_REQUEST, `Utility type ${utilityType.id} missing unitRate`);

          const consumption = await meterReadingService.calculateConsumption(
            meter.id,
            submeter.id,
            billingPeriodStart,
            billingPeriodEnd
          );
          return parseFloat(consumption) * parseFloat(utilityType.unitRate);
        })
      );
      // Sum the charges using reduce
      calculatedTotalUtilityAmount = utilityCharges.reduce((sum, charge) => sum + charge, 0);
    }
  }

  // **Calculate totalAmount**
  const lease = await Lease.findOne({
    where: { tenantId, unitId, status: 'active' },
  });

  const deductedAmount = lease?.deductedAmount ? parseFloat(lease.deductedAmount) : 0;
  const depostieAmountLeftModify = lease?.depositAmountLeft ? parseFloat(lease.depositAmountLeft) : 0;
  const deductedAmountMofiy = lease?.depositAmountLeft> lease?.deductedAmount ? deductedAmount:depostieAmountLeftModify
  const otherChargesAmount = 0.0; // Placeholder: Update with expense logic if needed

  // rent থেকে deductedAmount বাদ
  const adjustedRentAmount = parseFloat(rentAmount) - deductedAmountMofiy; // Placeholder: Update with expense logic if needed
  const totalAmount =
    parseFloat(adjustedRentAmount) + parseFloat(calculatedTotalUtilityAmount) + parseFloat(otherChargesAmount);

  // **Issue Date and Invoice Number**
  const billIssueDate = new Date(issueDate);
  const currentYear = billIssueDate.getFullYear();
  const startOfYear = new Date(currentYear, 0, 1);
  const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59, 999);

  // **Transaction for Atomicity**
  const bill = await Bill.sequelize.transaction(async (t) => {
    const lastBill = await Bill.findOne({
      where: { accountId, issueDate: { [Op.between]: [startOfYear, endOfYear] } },
      order: [['invoiceNo', 'DESC']],
      transaction: t,
    });
    const nextInvoiceNo = lastBill ? lastBill.invoiceNo + 1 : 1;

    const createdBill = await Bill.create(
      {
        accountId,
        tenantId,
        unitId,
        invoiceNo: nextInvoiceNo,
        billingPeriodStart,
        billingPeriodEnd,
        deductedAmount:deductedAmountMofiy,
        rentAmount: parseFloat(rentAmount),
        totalUtilityAmount: parseFloat(calculatedTotalUtilityAmount),
        otherChargesAmount,
        totalAmount,
        amountPaid: 0.0,
        dueDate,
        issueDate: billIssueDate,
        paymentStatus: 'unpaid',
        notes: notes || null,
        isDeleted: false,
      },
      { transaction: t }
    );

    const formattedInvoiceNo = String(createdBill.invoiceNo).padStart(4, '0');
    createdBill.dataValues.fullInvoiceNumber = `INV-${currentYear}-${formattedInvoiceNo}`;
    return createdBill;
  });

  return bill;
};

/**
 * Query for all bills matching a filter
 * @param {Object} filter - Sequelize filter
 * @param {Object} options - { sortBy, limit, page, include? }
 * @param {string} deleted - 'true', 'false', or 'all'
 * @returns {Promise<{ results: Bill[], page: number, limit: number, totalPages: number, totalResults: number }>}
 */

const getAllBills = async (filter, options, deleted = 'false', excludePaid = false) => {
  const whereClause = { ...filter };

  // isDeleted filter
  if (deleted === 'true') whereClause.isDeleted = true;
  else if (deleted === 'false') whereClause.isDeleted = false;
  else if (deleted !== 'all') throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid deleted value');

  // excludePaid filter
  if (excludePaid) {
    // যদি paymentStatus already filter না থাকে, paid বাদ দিতে Op.ne use করি
    whereClause.paymentStatus = { [Op.ne]: 'paid' };
  }

  const limit = options.limit ? parseInt(options.limit, 10) : 10;
  const page = options.page ? parseInt(options.page, 10) : 1;
  const offset = (page - 1) * limit;

  const sort = [];
  if (options.sortBy) {
    const [field, order] = options.sortBy.split(':');
    sort.push([field, order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC']);
  }

  const include = options.include || [];

  const { count, rows } = await Bill.findAndCountAll({
    where: whereClause,
    limit,
    offset,
    order: sort.length ? sort : [['createdAt', 'DESC']],
    include,
  });

  rows.forEach((bill) => {
    const billYear = new Date(bill.issueDate).getFullYear();
    const formattedInvoiceNo = String(bill.invoiceNo).padStart(4, '0');
    bill.dataValues.fullInvoiceNumber = `INV-${billYear}-${formattedInvoiceNo}`;
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
  if (!bill) {
    throw new ApiError(httpStatus.NOT_FOUND, `Bill not found for ID: ${id}`);
  }
  // Optionally, format the invoiceNo here too
  const billYear = new Date(bill.issueDate).getFullYear();
  const formattedInvoiceNo = String(bill.invoiceNo).padStart(4, '0');
  bill.dataValues.fullInvoiceNumber = `INV-${billYear}-${formattedInvoiceNo}`;
  return bill;
};

/**
 * Update an existing bill by ID
 * @param {string} id - Bill UUID
 * @param {Object} updateBody - Fields to update
 * @returns {Promise<Bill>}
 */
const updateBill = async (id, updateBody) => {
  const bill = await getBillById(id);
  const {
    accountId = bill.accountId,
    tenantId = bill.tenantId,
    unitId = bill.unitId,
    billingPeriodStart = bill.billingPeriodStart,
    billingPeriodEnd = bill.billingPeriodEnd,
    rentAmount = bill.rentAmount,
    totalUtilityAmount,
    dueDate = bill.dueDate,
    issueDate = bill.issueDate,
    notes = bill.notes,
  } = updateBody;

  // **Validate Foreign Keys**
  if (accountId !== bill.accountId) {
    const account = await Account.findByPk(accountId);
    if (!account) throw new ApiError(httpStatus.NOT_FOUND, `Account not found: ${accountId}`);
  }
  if (tenantId !== bill.tenantId) {
    const tenant = await Tenant.findByPk(tenantId);
    if (!tenant) throw new ApiError(httpStatus.NOT_FOUND, `Tenant not found: ${tenantId}`);
  }
  if (unitId !== bill.unitId) {
    const unit = await Unit.findByPk(unitId);
    if (!unit) throw new ApiError(httpStatus.NOT_FOUND, `Unit not found: ${unitId}`);
  }

  // **Validate Billing Period**
  if (new Date(billingPeriodStart) > new Date(billingPeriodEnd)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid billing period: start must be <= end');
  }
  //////
  const start = new Date(billingPeriodStart);
  const end = new Date(billingPeriodEnd);

  if (start.getFullYear() !== end.getFullYear() || start.getMonth() !== end.getMonth()) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Billing period must be within the same month and year');
  }

  // **Ensure billingPeriodEnd does not exceed last day of the month**
  const lastDayOfMonth = new Date(end.getFullYear(), end.getMonth() + 1, 0).getDate();
  if (end.getDate() > lastDayOfMonth) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Billing period end date cannot exceed ${lastDayOfMonth} for the selected month`
    );
  }
  ////
  // **Recalculate totalUtilityAmount if billing period changes or totalUtilityAmount provided**
  let calculatedTotalUtilityAmount = totalUtilityAmount !== undefined ? totalUtilityAmount : bill.totalUtilityAmount;
  if (
    totalUtilityAmount === undefined &&
    (billingPeriodStart !== bill.billingPeriodStart || billingPeriodEnd !== bill.billingPeriodEnd || unitId !== bill.unitId)
  ) {
    const unit = await Unit.findByPk(unitId);
    const submeters = await unit.getSubmeters({
      include: [{ model: Meter, as: 'meter', include: [{ model: UtilityType, as: 'utilityType' }] }],
    });
    if (submeters.length === 0 && rentAmount > 0) {
      calculatedTotalUtilityAmount = 0; // Allow rent-only bills
    } else if (submeters.length === 0) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'No submeters found for utility calculation');
    } else {
      // Use Promise.all with map to parallelize consumption calculations
      const utilityCharges = await Promise.all(
        submeters.map(async (submeter) => {
          const { meter } = submeter;
          if (!meter) throw new ApiError(httpStatus.BAD_REQUEST, `Submeter ${submeter.id} lacks associated meter`);
          const { utilityType } = meter;
          if (!utilityType) throw new ApiError(httpStatus.BAD_REQUEST, `Meter ${meter.id} lacks utility type`);
          if (!utilityType.unitRate)
            throw new ApiError(httpStatus.BAD_REQUEST, `Utility type ${utilityType.id} missing unitRate`);

          const consumption = await meterReadingService.calculateConsumption(
            meter.id,
            submeter.id,
            billingPeriodStart,
            billingPeriodEnd
          );
          return parseFloat(consumption) * parseFloat(utilityType.unitRate);
        })
      );
      // Sum the charges using reduce
      calculatedTotalUtilityAmount = utilityCharges.reduce((sum, charge) => sum + charge, 0);
    }
  }

  // **Calculate totalAmount**
  // **Get deductedAmount from Lease**
    const [ tenant] = await Promise.all([
    Tenant.findByPk(tenantId),
  ]);
  const lease = await Lease.findOne({
    where: { tenantId, unitId, status: 'active' },
  });
  const deductedAmount = lease?.deductedAmount ? parseFloat(lease.deductedAmount) : 0;
  const depostieAmountLeftModify = lease?.depositAmountLeft ? parseFloat(lease.depositAmountLeft) : 0;
  const deductedAmountMofiy = lease?.depositAmountLeft> lease?.deductedAmount ? deductedAmount:depostieAmountLeftModify
  const otherChargesAmount = 0.0; // Placeholder: Update with expense logic if needed

  const adjustedRentAmount = parseFloat(rentAmount) - deductedAmountMofiy;
  const totalAmount = adjustedRentAmount + parseFloat(calculatedTotalUtilityAmount) + parseFloat(otherChargesAmount);

  // **Update Bill**
  await bill.update({
    accountId,
    tenantId,
    unitId,
    billingPeriodStart,
    billingPeriodEnd,

    rentAmount: parseFloat(rentAmount),
    totalUtilityAmount: parseFloat(calculatedTotalUtilityAmount),
    otherChargesAmount,
    deductedAmount:deductedAmountMofiy,
    totalAmount,
    dueDate,
    issueDate,
    notes,
  });

  // **Add Formatted Invoice Number**
  const billYear = new Date(bill.issueDate).getFullYear();
  const formattedInvoiceNo = String(bill.invoiceNo).padStart(4, '0');
  bill.dataValues.fullInvoiceNumber = `INV-${billYear}-${formattedInvoiceNo}`;

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
//restore
const restoreBill = async (id) => {
  const bill = await getBillById(id);
  if (!bill.isDeleted) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Bill is already activated');
  }
  await bill.update({ isDeleted: false });
};
/**
 * Hard delete a bill by ID
 * @param {string} id - Bill UUID
 * @returns {Promise<void>}
 */


const hardDeleteBill = async (id) => {
  const bill = await getBillById(id);
  if (!bill) {
    throw new Error("Bill not found");
  }
  if (bill.status === "paid") {
    const lease = await Lease.findByPk(bill.leaseId);
    if (!lease) {
      throw new Error("Lease not found");
    }
    const tenant = await Tenant.findByPk(lease.tenantId);
    if (!tenant) {
      throw new Error("Tenant not found");
    }
    if (bill.deductedAmount && bill.deductedAmount > 0) {
      lease.depositAmountLeft =
        Number(lease.depositAmountLeft) + Number(bill.deductedAmount);
      await lease.save();
    }
  }
  await bill.destroy();
};



/**
 * Get all bills for a property within a date range, formatted for printing
 * @param {string} propertyId - Property UUID
 * @param {Object} filter - { startDate, endDate, accountId? }
 * @param {Object} options - { sortBy, limit, page, include?, forPrint? }
 * @returns {Promise<{ results: Bill[], page: number, limit: number, totalPages: number, totalResults: number }>}
 */
const getBillsByPropertyAndDateRange = async (propertyId, filter, options) => {
  // Validate property exists
  const property = await Property.findByPk(propertyId);
  if (!property) throw new ApiError(httpStatus.NOT_FOUND, `Property not found: ${propertyId}`);

  // Build where clause
  const whereClause = {
    billingPeriodStart: { [Op.lte]: filter.endDate },
    billingPeriodEnd: { [Op.gte]: filter.startDate },
  };

  // Apply accountId filter if provided
  if (filter.accountId) whereClause.accountId = filter.accountId;

  // Get unit IDs for the property
  const units = await Unit.findAll({ where: { propertyId }, attributes: ['id'] });
  const unitIds = units.map((unit) => unit.id);
  if (unitIds.length === 0) {
    return { results: [], page: 1, limit: options.limit || 10, totalPages: 0, totalResults: 0 };
  }

  // Filter bills by unitIds
  whereClause.unitId = { [Op.in]: unitIds };

  // Pagination and sorting
  // const limit = Math.max(parseInt(options.limit, 10) || 10, 1);
  // const page = Math.max(parseInt(options.page, 10) || 1, 1);
  // const offset = (page - 1) * limit;
  const sort = options.sortBy
    ? [[options.sortBy.split(':')[0], options.sortBy.split(':')[1].toUpperCase() === 'DESC' ? 'DESC' : 'ASC']]
    : [['createdAt', 'DESC']];

  // Include associations for printing
  const defaultInclude = [
    { model: Tenant, as: 'tenant', attributes: ['id', 'name'] },
    {
      model: Unit,
      as: 'unit',
      attributes: ['id', 'name'],
      include: { model: Property, as: 'property', attributes: ['name'] },
    },
  ];
  const include = options.forPrint ? defaultInclude : [...defaultInclude, ...(options.include || [])];

  // Query bills
  const { count, rows } = await Bill.findAndCountAll({
    where: { ...whereClause, isDeleted: false },
    order: sort,
    include,
  });

  // Format bills for printing
  const formattedResults = await Promise.all(
    rows.map(async (bill) => {
      // Active lease থেকে deductedAmount নেওয়া
      // const lease = await Lease.findOne({
      //   where: { tenantId: bill.tenantId, unitId: bill.unitId, status: 'active' },
      // });
      // const deductedAmount = bill?.deductedAmount ? parseFloat(bill.deductedAmount) : 0;

      // // Adjusted total
      // const adjustedRentAmount = parseFloat(bill.rentAmount) - deductedAmount;
      // const adjustedTotalAmount =
      //   adjustedRentAmount + parseFloat(bill.totalUtilityAmount) + parseFloat(bill.otherChargesAmount);

      const billYear = new Date(bill.issueDate).getFullYear();
      const formattedInvoiceNo = String(bill.invoiceNo).padStart(4, '0');

      return {
        fullInvoiceNumber: `INV-${billYear}-${formattedInvoiceNo}`,
        rentAmountFormatted: bill.rentAmount,
        issueDate: bill.issueDate,
        totalUtilityAmountFormatted: bill.totalUtilityAmount,
        otherChargesAmount: bill.otherChargesAmount,
        deductedAmount:bill.deductedAmount,
        totalAmountFormatted: bill.totalAmount,
        tenantName: bill.tenant?.name || 'N/A',
        unitName: bill.unit?.name || 'N/A',
        propertyName: bill.unit?.property?.name || 'N/A',
        unitAddress: bill.unit?.address || 'N/A',
      };
    })
  );

  return {
    results: formattedResults,
    totalResults: count,
  };
};

module.exports = {
  createBill,
  getAllBills,
  getBillById,
  updateBill,
  deleteBill,
  restoreBill,
  hardDeleteBill,
  getBillsByPropertyAndDateRange,
};
