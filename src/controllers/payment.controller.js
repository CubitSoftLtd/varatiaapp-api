const httpStatus = require('http-status');
const pick = require('../utils/pick');
const catchAsync = require('../utils/catchAsync');
const { paymentService } = require('../services');
const { Bill, Tenant, Account } = require('../models');

// Helper function to parse include query parameter
const parseInclude = (include) => {
  if (!include) return [];
  return include
    .split('|')
    .map((item) => {
      const [model, attributes] = item.split(':');
      const modelMap = {
        bill: Bill,
        tenant: Tenant,
        account: Account,
      };
      if (!modelMap[model]) return null;
      return {
        model: modelMap[model],
        as: model,
        attributes: attributes.split(','),
      };
    })
    .filter((item) => item);
};

const createPayment = catchAsync(async (req, res) => {
  const payment = await paymentService.createPayment(req.body);
  res.status(httpStatus.CREATED).json(payment);
});

const getPayments = catchAsync(async (req, res) => {
  const filter = pick(req.query.filterBy, ['billId', 'tenantId', 'accountId', 'paymentDate', 'paymentMethod']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  options.include = parseInclude(req.query.include);
  const payments = await paymentService.getAllPayments(filter, options);
  res.json(payments);
});

const getPaymentById = catchAsync(async (req, res) => {
  const payment = await paymentService.getPaymentById(req.params.id, parseInclude(req.query.include));
  res.json(payment);
});

const getPaymentsByBillId = catchAsync(async (req, res) => {
  const payments = await paymentService.getPaymentsByBillId(req.params.billId, parseInclude(req.query.include));
  res.json(payments);
});

const updatePaymentById = catchAsync(async (req, res) => {
  const payment = await paymentService.updatePayment(req.params.id, req.body);
  res.json(payment);
});

const deletePaymentById = catchAsync(async (req, res) => {
  await paymentService.deletePayment(req.params.id);
  res.status(httpStatus.NO_CONTENT).send();
});

const hardDeletePaymentById = catchAsync(async (req, res) => {
  await paymentService.hardDeletePayment(req.params.id);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createPayment,
  getPayments,
  getPaymentById,
  getPaymentsByBillId,
  updatePaymentById,
  deletePaymentById,
  hardDeletePaymentById,
};
