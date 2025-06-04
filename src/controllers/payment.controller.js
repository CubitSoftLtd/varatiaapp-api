const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const pick = require('../utils/pick');
const { paymentService } = require('../services');

const createPayment = catchAsync(async (req, res) => {
  const payment = await paymentService.createPayment(req.params.billId, req.body);
  res.status(httpStatus.CREATED).send(payment);
});

const getPaymentsByBillId = catchAsync(async (req, res) => {
  const payments = await paymentService.getPaymentsByBillId(req.params.billId);
  res.send(payments);
});

const getAllPayments = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['limit', 'page', 'sortBy']);
  const options = pick(filter, ['limit', 'page', 'sortBy']);
  const payments = await paymentService.getAllPayments(filter, options);
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
  getAllPayments,
  getPaymentsByBillId,
  getPaymentById,
  updatePaymentById,
  deletePaymentById,
};
