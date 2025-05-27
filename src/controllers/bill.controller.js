const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { billService } = require('../services');

const createBill = catchAsync(async (req, res) => {
  const bill = await billService.createBill(req.params.leaseId, req.body);
  res.status(httpStatus.CREATED).send(bill);
});

const getBills = catchAsync(async (req, res) => {
  const bills = await billService.getBillsByLeaseId(req.params.leaseId);
  res.send(bills);
});

const getBillById = catchAsync(async (req, res) => {
  const bill = await billService.getBillById(req.params.id);
  res.send(bill);
});

const updateBillById = catchAsync(async (req, res) => {
  const bill = await billService.updateBillById(req.params.id, req.body);
  res.send(bill);
});

const deleteBillById = catchAsync(async (req, res) => {
  await billService.deleteBillById(req.params.id);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createBill,
  getBills,
  getBillById,
  updateBillById,
  deleteBillById,
};
