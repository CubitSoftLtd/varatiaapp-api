const httpStatus = require('http-status');
const { Op } = require('sequelize'); // <--- ADD THIS LINE: Import Op for date range queries
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
    issueDate, // This will be used to determine the year for sequential numbering
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
    const submeters = await unit.getSubmeters(); // Get all submeters associated with the unit
    let consumption = 0;

    if (submeters && submeters.length > 0) {
      const submeter = submeters[0]; // Use the first submeter (adjust logic if multiple submeters need handling)
      const associatedMeter = await submeter.getMeter(); // Assuming Submeter has a getMeter association
      if (!associatedMeter) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Submeter must be associated with a meter');
      }
      consumption = await meterReadingService.calculateConsumption(
        associatedMeter.id,
        submeter.id,
        billingPeriodStart,
        billingPeriodEnd
      );
      calculatedTotalUtilityAmount += consumption * (submeter.unitRate || 1); // Default unitRate to 1 if undefined
    } else {
      // NOTE: Original code threw an error here. Consider if this is the desired behavior
      // when a unit might not have a submeter but utility calculation isn't needed (e.g., only rent bill).
      // For now, retaining original behavior.
      throw new ApiError(httpStatus.BAD_REQUEST, 'Unit must have at least one submeter associated for utility calculation');
    }
  }

  // Calculate totalAmount
  const otherChargesAmount = 0.0; // Default to 0 as per model
  const totalAmount = parseFloat(rentAmount) + parseFloat(calculatedTotalUtilityAmount) + parseFloat(otherChargesAmount);

  // Determine the issue date. Default to current date if not provided.
  // This date is crucial for determining the year for sequential invoice numbering.
  const billIssueDate = issueDate ? new Date(issueDate) : new Date();
  const currentYear = billIssueDate.getFullYear();

  // Define the start and end of the current year for filtering bills
  // to find the last invoice number for the current account and year.
  const startOfYear = new Date(currentYear, 0, 1); // January 1st of the current year
  const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59, 999); // December 31st of the current year (end of day)

  // Create bill in a transaction to ensure atomic operations,
  // especially for sequential invoice number generation.
  const bill = await Bill.sequelize.transaction(async (t) => {
    // Step 1: Find the last invoice number for the given accountId within the current year.
    const lastBill = await Bill.findOne({
      where: {
        accountId,
        issueDate: {
          [Op.between]: [startOfYear, endOfYear], // Filter by the current year
        },
      },
      order: [['invoiceNo', 'DESC']], // Get the highest invoice number
      transaction: t, // Ensure this query is part of the same transaction for concurrency safety
    });

    // Step 2: Determine the next sequential invoice number.
    // If no bills exist for this account in this year, start with 1.
    const nextInvoiceNo = lastBill ? lastBill.invoiceNo + 1 : 1;

    try {
      // Step 3: Create the new bill record.
      const createdBill = await Bill.create(
        {
          accountId,
          tenantId,
          unitId,
          invoiceNo: nextInvoiceNo, // <--- Assign the newly generated sequential invoice number
          billingPeriodStart,
          billingPeriodEnd,
          rentAmount: parseFloat(rentAmount),
          totalUtilityAmount: parseFloat(calculatedTotalUtilityAmount),
          otherChargesAmount,
          totalAmount, // Explicitly set totalAmount
          amountPaid: 0.0,
          dueDate,
          issueDate: billIssueDate, // Use the determined issue date
          paymentStatus: 'unpaid',
          notes: notes || null,
          isDeleted: false,
        },
        { transaction: t } // Link the creation to the current transaction
      );

      // Step 4: Generate the full formatted invoice number for display purposes.
      // This 'fullInvoiceNumber' is not stored in the database but is added to the
      // returned object for convenience in the application layer.
      // Pad the invoice number with leading zeros (e.g., 1 becomes 0001, 15 becomes 0015).
      const formattedInvoiceNo = String(createdBill.invoiceNo).padStart(4, '0'); // Adjust '4' for desired padding length
      createdBill.dataValues.fullInvoiceNumber = `INV-${currentYear}-${formattedInvoiceNo}`;

      return createdBill;
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new ApiError(
          httpStatus.CONFLICT,
          'Ensures that there is only one bill per tenant and unit for a specific billing period'
        );
      } else {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'An error occurred while creating the bill');
      }
    }
  });

  return bill; // Return the created bill
};

/**
 * Query for all bills matching a filter
 * @param {Object} filter - Sequelize filter
 * @param {Object} options - { sortBy, limit, page, include? }
 * @returns {Promise<{ results: Bill[], page: number, limit: number, totalPages: number, totalResults: number }>}
 */
const getAllBills = async (filter, options, deleted = 'false') => {
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

  // Format invoice numbers for all results
  rows.forEach((bill) => {
    const billYear = new Date(bill.issueDate).getFullYear();
    const formattedInvoiceNo = String(bill.invoiceNo).padStart(4, '0');
    /* eslint-disable-next-line no-param-reassign */
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
  if (!bill || bill.isDeleted) {
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
    const submeters = await unit.getSubmeters(); // Get all submeters associated with the unit
    let consumption = 0;

    if (submeters && submeters.length > 0) {
      const submeter = submeters[0]; // Use the first submeter
      const associatedMeter = await submeter.getMeter(); // Assuming Submeter has a getMeter association
      if (!associatedMeter) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Submeter must be associated with a meter');
      }
      consumption = await meterReadingService.calculateConsumption(
        associatedMeter.id,
        submeter.id,
        billingPeriodStart || bill.billingPeriodStart,
        billingPeriodEnd || bill.billingPeriodEnd
      );

      calculatedTotalUtilityAmount = consumption * (submeter.unitRate || 1); // Default unitRate to 1 if undefined
    } else {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Unit must have at least one submeter associated for utility calculation');
    }
  }

  // Calculate totalAmount
  const { otherChargesAmount } = bill; // Retain existing value unless updated
  const totalAmount =
    parseFloat(rentAmount || bill.rentAmount) + parseFloat(calculatedTotalUtilityAmount) + parseFloat(otherChargesAmount);

  // If issueDate changes, and you're using Option 2 (with an issueYear column),
  // you would need to update issueYear here as well.
  // if (issueDate && new Date(issueDate).getFullYear() !== bill.issueYear) {
  //   updateBody.issueYear = new Date(issueDate).getFullYear();
  // }

  await bill.update({
    accountId: accountId !== undefined ? accountId : bill.accountId,
    tenantId: tenantId !== undefined ? tenantId : bill.tenantId,
    unitId: unitId !== undefined ? unitId : bill.unitId,
    billingPeriodStart: billingPeriodStart !== undefined ? billingPeriodStart : bill.billingPeriodStart,
    billingPeriodEnd: billingPeriodEnd !== undefined ? billingPeriodEnd : bill.billingPeriodEnd,
    rentAmount: rentAmount !== undefined ? parseFloat(rentAmount) : bill.rentAmount,
    totalUtilityAmount: totalUtilityAmount !== undefined ? parseFloat(totalUtilityAmount) : calculatedTotalUtilityAmount,
    otherChargesAmount: bill.otherChargesAmount, // Keep as is unless updated (add if needed in updateBody)
    totalAmount, // Explicitly set totalAmount
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
