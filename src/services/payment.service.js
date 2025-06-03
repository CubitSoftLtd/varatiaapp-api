const { Op } = require('sequelize');
const httpStatus = require('http-status');
const { Payment, Bill } = require('../models');
const ApiError = require('../utils/ApiError');

const createRentPayment = async (paymentData) => {
  const { billId, amountPaid, paymentDate, paymentMethod } = paymentData;

  // Verify bill
  const bill = await Bill.findByPk(billId);
  if (!bill) throw new ApiError(httpStatus.NOT_FOUND, 'Bill not found');

  // Validate payment amount
  const payments = await Payment.findAll({ where: { billId } });
  const totalPaid = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0) + parseFloat(amountPaid);
  if (totalPaid > parseFloat(bill.totalAmount)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Total payment exceeds bill amount');
  }

  // Create payment
  const payment = await Payment.create({
    billId,
    amount: amountPaid,
    paymentDate: paymentDate || new Date(),
    paymentMethod,
  });

  // Update bill status
  // eslint-disable-next-line no-nested-ternary
  const newStatus = totalPaid >= parseFloat(bill.totalAmount) ? 'paid' : totalPaid > 0 ? 'partially_paid' : 'unpaid';
  await bill.update({
    paymentStatus: newStatus,
    paymentDate: newStatus === 'paid' ? payment.paymentDate : bill.paymentDate,
  });

  return payment;
};

const getAllPayments = async (filter, options) => {
  const limit = parseInt(options.limit, 10) || 10;
  const page = parseInt(options.page, 10) || 1;
  const offset = (page - 1) * limit;

  const sort = [];
  if (options.sortBy) {
    const [field, order] = options.sortBy.split(':');
    sort.push([field, order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC']);
  }

  const { count, rows } = await Payment.findAndCountAll({
    where: filter,
    limit,
    offset,
    order: sort.length ? sort : [['paymentDate', 'DESC']],
    include: [{ model: Bill, as: 'bill' }],
  });

  return {
    results: rows,
    page,
    limit,
    totalPages: Math.ceil(count / limit),
    totalResults: count,
  };
};

const getPaymentById = async (id) => {
  const payment = await Payment.findByPk(id, {
    include: [{ model: Bill, as: 'bill' }],
  });
  if (!payment) throw new ApiError(httpStatus.NOT_FOUND, 'Payment not found');
  return payment;
};

const updateRentPayment = async (paymentId, updateBody) => {
  const payment = await getPaymentById(paymentId);
  const bill = await Bill.findByPk(payment.billId);

  if (updateBody.amount) {
    const payments = await Payment.findAll({ where: { billId: payment.billId, id: { [Op.ne]: paymentId } } });
    const totalPaid = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0) + parseFloat(updateBody.amount);
    if (totalPaid > parseFloat(bill.totalAmount)) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Total payment exceeds bill amount');
    }
  }

  await payment.update(updateBody);

  const allPayments = await Payment.findAll({ where: { billId: payment.billId } });
  const totalPaid = allPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
  // eslint-disable-next-line no-nested-ternary
  const newStatus = totalPaid >= parseFloat(bill.totalAmount) ? 'paid' : totalPaid > 0 ? 'partially_paid' : 'unpaid';
  await bill.update({
    paymentStatus: newStatus,
    paymentDate: newStatus === 'paid' && !bill.paymentDate ? updateBody.paymentDate || new Date() : bill.paymentDate,
  });

  return payment;
};

const deleteRentPayment = async (paymentId) => {
  const payment = await getPaymentById(paymentId);
  const bill = await Bill.findByPk(payment.billId);

  await payment.destroy();

  const payments = await Payment.findAll({ where: { billId: payment.billId } });
  const totalPaid = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
  // eslint-disable-next-line no-nested-ternary
  const newStatus = totalPaid >= parseFloat(bill.totalAmount) ? 'paid' : totalPaid > 0 ? 'partially_paid' : 'unpaid';
  await bill.update({
    paymentStatus: newStatus,
    paymentDate: newStatus === 'paid' ? bill.paymentDate : null,
  });
};

module.exports = {
  createRentPayment,
  getAllPayments,
  getPaymentById,
  updateRentPayment,
  deleteRentPayment,
};
