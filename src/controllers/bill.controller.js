const httpStatus = require('http-status');
const pick = require('../utils/pick');
const catchAsync = require('../utils/catchAsync');
const { billService } = require('../services');
const { Tenant, Unit, Account, Payment, Expense } = require('../models');

// Helper function to parse include query parameter
const parseInclude = (include) => {
  if (!include) return [];

  return include
    .split('|')
    .map((item) => {
      const [modelName, attributesString] = item.split(':'); // Use modelName and attributesString for clarity

      const modelMap = {
        tenant: Tenant,
        unit: Unit,
        account: Account,
        payments: Payment,
        expenses: Expense,
      };

      const model = modelMap[modelName];

      if (!model) {
        // Log a warning or throw an error for unknown models to aid debugging
        return null; // Return null to be filtered out
      }

      const includeOptions = {
        model,
        as: modelName, // 'as' should typically match the singular or plural form expected by Sequelize association
        required: false, // Default to false (LEFT JOIN) unless explicitly needed
      };

      // Safely set attributes if provided
      if (attributesString) {
        includeOptions.attributes = attributesString.split(',');
      }

      // Conditionally add 'where' clause for specific models
      if (modelName === 'expenses') {
        includeOptions.where = { expenseType: 'tenant_charge' };
      }

      return includeOptions;
    })
    .filter((item) => item !== null); // Filter out any null entries from unknown models
};

const createBill = catchAsync(async (req, res) => {
  const bill = await billService.createBill({ ...req.body, accountId: req.user.accountId });
  res.status(httpStatus.CREATED).send(bill);
});

const getBills = catchAsync(async (req, res) => {
  const filter = pick(req.query, [
    'tenantId',
    'unitId',
    'accountId',
    'billingPeriodStart',
    'billingPeriodEnd',
    'dueDate',
    'paymentStatus',
  ]);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  options.include = parseInclude(req.query.include);
  const deleted = req.query.deleted || 'false'; // Default to 'false'
  // const excludePaid = req.query.excludePaid === 'true';
  if (req.user.role !== 'super_admin') {
    filter.accountId = req.user.accountId;
  }
  const { excludePaid } = req.query;
  const bills = await billService.getAllBills(filter, options, deleted, excludePaid);
  res.send(bills);
});

const getBillById = catchAsync(async (req, res) => {
  const bill = await billService.getBillById(req.params.id, parseInclude(req.query.include));
  res.send(bill);
});

const updateBillById = catchAsync(async (req, res) => {
  const bill = await billService.updateBill(req.params.id, req.body);
  res.send(bill);
});

const deleteBillById = catchAsync(async (req, res) => {
  await billService.deleteBill(req.params.id);
  res.status(httpStatus.NO_CONTENT).send();
});
const restoreBillById = catchAsync(async (req, res) => {
  await billService.restoreBill(req.params.id);
  res.status(httpStatus.NO_CONTENT).send();
});

const hardDeleteBillById = catchAsync(async (req, res) => {
  await billService.hardDeleteBill(req.params.id);
  res.status(httpStatus.NO_CONTENT).send();
});

/**
 * Get bills for a property within a date range, formatted for printing
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getBillsByPropertyForPrint = catchAsync(async (req, res) => {
  const { propertyId } = req.params;
  const filter = pick(req.query, ['startDate', 'endDate']);
  const options = pick(req.query, ['sortBy']);

  // Restrict non-super admins to their own account
  if (req.user.role !== 'super_admin') {
    filter.accountId = req.user.accountId;
  }

  // Set forPrint flag
  options.forPrint = true;

  const result = await billService.getBillsByPropertyAndDateRange(propertyId, filter, options);
  res.status(httpStatus.OK).send(result);
});

/**
 * Get bills for a property within a date range
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getBillsByPropertyAndDateRange = catchAsync(async (req, res) => {
  const { propertyId } = req.params;
  const filter = pick(req.query, ['startDate', 'endDate']);
  const options = pick(req.query, ['sortBy', 'limit', 'page', 'include']);

  if (req.user.role !== 'super_admin') {
    filter.accountId = req.user.accountId;
  }

  const result = await billService.getBillsByPropertyAndDateRange(propertyId, filter, options);
  res.status(httpStatus.OK).send(result);
});

module.exports = {
  createBill,
  getBills,
  getBillById,
  updateBillById,
  deleteBillById,
  restoreBillById,
  hardDeleteBillById,
  getBillsByPropertyAndDateRange,
  getBillsByPropertyForPrint,
};
