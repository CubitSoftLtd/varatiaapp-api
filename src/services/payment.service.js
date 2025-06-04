const { Op } = require('sequelize');
const httpStatus = require('http-status');
const { Payment, Bill } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a new payment
 * @param {Object} paymentData - Payment data including billId, amountPaid, paymentDate, and paymentMethod
 * @returns {Promise<Payment>} - Created payment object
 */
const createPayment = async (paymentData) => {
  const { billId, amountPaid, paymentDate, paymentMethod } = paymentData;

  // Validate amountPaid
  if (amountPaid <= 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Payment amount must be greater than 0');
  }

  // Validate paymentDate
  /* eslint-disable-next-line no-restricted-globals */
  if (paymentDate && isNaN(Date.parse(paymentDate))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid payment date');
  }

  // Verify bill exists
  const bill = await Bill.findByPk(billId);
  if (!bill) throw new ApiError(httpStatus.NOT_FOUND, 'Bill not found');

  // Calculate total payments including the new one
  const payments = await Payment.findAll({ where: { billId } });
  const totalPaid = payments.reduce((sum, p) => sum + parseFloat(p.amountPaid), 0) + parseFloat(amountPaid);
  if (totalPaid > parseFloat(bill.totalAmount)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Total payment exceeds bill amount');
  }

  // Create payment
  const payment = await Payment.create({
    billId,
    amountPaid,
    paymentDate: paymentDate || new Date(),
    paymentMethod,
  });

  // Update bill status
  let newStatus;
  if (totalPaid >= parseFloat(bill.totalAmount)) {
    newStatus = 'paid';
  } else if (totalPaid > 0) {
    newStatus = 'partially_paid';
  } else {
    newStatus = 'unpaid';
  }
  const paymentDateUpdate = newStatus === 'paid' ? payment.paymentDate : bill.paymentDate;
  await bill.update({
    paymentStatus: newStatus,
    paymentDate: paymentDateUpdate,
  });

  return payment;
};

/**
 * Get all payments based on filter and options
 * @param {Object} filter - Sequelize filter object
 * @param {Object} options - Sequelize query options
 * @returns {Promise<Payment[]>} - Array of payment objects
 */
const getAllPayments = async (filter, options) => {
  return Payment.findAll({
    where: filter,
    ...options,
    include: [{ model: Bill }],
  });
};

/**
 * Get payments by bill ID
 * @param {string} billId - UUID of the bill
 * @returns {Promise<Payment[]>} - Array of payment objects
 */
const getPaymentsByBillId = async (billId) => {
  const bill = await Bill.findByPk(billId);
  if (!bill) {
    throw new ApiError(httpStatus.NOT_FOUND, `Bill not found for ID: ${billId}`);
  }

  const payments = await Payment.findAll({
    where: { billId },
    order: [['paymentDate', 'DESC']],
    include: [{ model: Bill, as: 'bill' }],
  });
  return payments;
};

/**
 * Get a payment by ID
 * @param {string} paymentId - UUID of the payment
 * @returns {Promise<Payment>} - Payment object
 */
const getPaymentById = async (paymentId) => {
  const payment = await Payment.findByPk(paymentId, { include: [{ model: Bill }] });
  if (!payment) throw new ApiError(httpStatus.NOT_FOUND, 'Payment not found');
  return payment;
};

/**
 * Update a payment
 * @param {string} paymentId - UUID of the payment to update
 * @param {Object} updateBody - Fields to update (e.g., amountPaid, paymentDate)
 * @returns {Promise<Payment>} - Updated payment object
 */
const updatePayment = async (paymentId, updateBody) => {
  const payment = await getPaymentById(paymentId);

  // Validate amountPaid if provided
  if (updateBody.amountPaid) {
    if (updateBody.amountPaid <= 0) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Payment amount must be greater than 0');
    }
    const payments = await Payment.findAll({
      where: { billId: payment.billId, id: { [Op.ne]: paymentId } },
    });
    const totalPaid = payments.reduce((sum, p) => sum + parseFloat(p.amountPaid), 0) + parseFloat(updateBody.amountPaid);
    const bill = await Bill.findByPk(payment.billId);
    if (totalPaid > parseFloat(bill.totalAmount)) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Total payment exceeds bill amount');
    }
  }

  // Validate paymentDate if provided
  /* eslint-disable-next-line no-restricted-globals */
  if (updateBody.paymentDate && isNaN(Date.parse(updateBody.paymentDate))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid payment date');
  }

  // Update payment
  await payment.update(updateBody);

  // Recalculate total payments and update bill status
  /* eslint-disable-next-line no-restricted-globals */
  const allPayments = await Payment.findAll({ where: { billId: payment.billId } });
  const totalPaid = allPayments.reduce((sum, p) => sum + parseFloat(p.amountPaid), 0);
  const bill = await Bill.findByPk(payment.billId);
  let newStatus;
  if (totalPaid >= parseFloat(bill.totalAmount)) {
    newStatus = 'paid';
  } else if (totalPaid > 0) {
    newStatus = 'partially_paid';
  } else {
    newStatus = 'unpaid';
  }
  const paymentDateUpdate = newStatus === 'paid' ? payment.paymentDate : bill.paymentDate;
  await bill.update({
    paymentStatus: newStatus,
    paymentDate: paymentDateUpdate,
  });

  return payment;
};

/**
 * Delete a payment
 * @param {string} paymentId - UUID of the payment to delete
 * @returns {Promise<void>}
 */
const deletePayment = async (paymentId) => {
  const payment = await getPaymentById(paymentId);
  await payment.destroy();

  // Recalculate total payments and update bill status
  const payments = await Payment.findAll({ where: { billId: payment.billId } });
  const totalPaid = payments.reduce((sum, p) => sum + parseFloat(p.amountPaid), 0);
  const bill = await Bill.findByPk(payment.billId);
  let newStatus;
  if (totalPaid >= parseFloat(bill.totalAmount)) {
    newStatus = 'paid';
  } else if (totalPaid > 0) {
    newStatus = 'partially_paid';
  } else {
    newStatus = 'unpaid';
  }
  const paymentDateUpdate = newStatus === 'paid' ? null : bill.paymentDate;
  await bill.update({
    paymentStatus: newStatus,
    paymentDate: paymentDateUpdate,
  });
};

module.exports = {
  createPayment,
  getAllPayments,
  getPaymentsByBillId,
  getPaymentById,
  updatePayment,
  deletePayment,
};
