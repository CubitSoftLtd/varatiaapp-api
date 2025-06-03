const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { billService } = require('../services');

const createBill = catchAsync(async (req, res) => {
  const bill = await billService.createBill(req.body);
  res.status(httpStatus.CREATED).send(bill);
});

const getBills = catchAsync(async (req, res) => {
  const filter = {};
  if (req.query.tenantId) filter.tenantId = req.query.tenantId;
  if (req.query.unitId) filter.unitId = req.query.unitId;
  if (req.query.billingPeriod) filter.billingPeriod = req.query.billingPeriod;
  if (req.query.paymentStatus) filter.paymentStatus = req.query.paymentStatus;

  const options = {
    sortBy: req.query.sortBy,
    limit: req.query.limit,
    page: req.query.page,
  };

  const result = await billService.getAllBills(filter, options);
  res.send(result);
});

const getBillById = catchAsync(async (req, res) => {
  const bill = await billService.getBillById(req.params.id);
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

module.exports = {
  createBill,
  getBills,
  getBillById,
  updateBillById,
  deleteBillById,
};
