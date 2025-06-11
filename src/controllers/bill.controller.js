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
      const [model, attributes] = item.split(':');
      const modelMap = {
        tenant: Tenant,
        unit: Unit,
        account: Account,
        payments: Payment,
        expenses: Expense,
      };
      return {
        model: modelMap[model],
        as: model,
        attributes: attributes.split(','),
        where: model === 'expenses' ? { expenseType: 'tenant_charge' } : undefined,
        required: false,
      };
    })
    .filter((item) => item.model);
};

const createBill = catchAsync(async (req, res) => {
  const bill = await billService.createBill(req.body);
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
  const bills = await billService.getAllBills(filter, options);
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

const hardDeleteBillById = catchAsync(async (req, res) => {
  await billService.hardDeleteBill(req.params.id);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createBill,
  getBills,
  getBillById,
  updateBillById,
  deleteBillById,
  hardDeleteBillById,
};
