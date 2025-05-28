const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { paymentService } = require('../services');

const createPayment = catchAsync(async (req, res) => {
  const payment = await paymentService.createPayment(req.params.billId, req.body);
  res.status(httpStatus.CREATED).send(payment);
});

const getPaymentsByLease = catchAsync(async (req, res) => {
  const payments = await paymentService.getPaymentsByLeaseId(req.params.leaseId);
  res.send(payments);
});

const getPaymentById = catchAsync(async (req, res) => {
  const payment = await paymentService.getPaymentById(req.params.id);
  res.send(payment);
});

const updatePaymentById = catchAsync(async (req, res) => {
  const payment = await paymentService.updatePaymentById(req.params.id, req.body);
  res.send(payment);
});

const deletePaymentById = catchAsync(async (req, res) => {
  await paymentService.deletePaymentById(req.params.id);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createPayment,
  getPaymentsByLease,
  getPaymentById,
  updatePaymentById,
  deletePaymentById,
};
