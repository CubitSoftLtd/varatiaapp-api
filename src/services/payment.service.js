const httpStatus = require('http-status');
const { Payment, Bill, Lease } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a payment
 * @param {number} billId
 * @param {Object} paymentBody
 * @returns {Promise<Payment>}
 */
const createPayment = async (billId, paymentBody) => {
  const bill = await Bill.findByPk(billId);
  if (!bill) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Bill not found');
  }
  return Payment.create({ ...paymentBody, billId });
};

/**
 * Query for payments
 * @param {number} leaseId
 * @param {Object} filter - Sequelize filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<{ results: Payment[], page: number, limit: number, totalPages: number, totalResults: number }>}
 */
const getAllPayments = async (leaseId, filter, options) => {
  const lease = await Lease.findByPk(leaseId);
  if (!lease) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Lease not found');
  }
  const bills = await Bill.findAll({ where: { leaseId } });
  const billIds = bills.map((bill) => bill.id);

  const limit = options.limit && parseInt(options.limit, 10) > 0 ? parseInt(options.limit, 10) : 10;
  const page = options.page && parseInt(options.page, 10) > 0 ? parseInt(options.page, 10) : 1;
  const offset = (page - 1) * limit;

  const sort = [];
  if (options.sortBy) {
    const [field, order] = options.sortBy.split(':');
    sort.push([field, order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC']);
  }

  const { count, rows } = await Payment.findAndCountAll({
    where: { ...filter, billId: billIds },
    limit,
    offset,
    order: sort.length ? sort : [['createdAt', 'DESC']],
    include: [{ model: Bill }],
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
 * Get payment by id
 * @param {number} id
 * @returns {Promise<Payment>}
 */
const getPaymentById = async (id) => {
  const payment = await Payment.findByPk(id, { include: [{ model: Bill }] });
  if (!payment) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Payment not found');
  }
  return payment;
};

/**
 * Update payment by id
 * @param {number} paymentId
 * @param {Object} updateBody
 * @returns {Promise<Payment>}
 */
const updatePayment = async (paymentId, updateBody) => {
  const payment = await getPaymentById(paymentId);
  await payment.update(updateBody);
  return payment;
};

/**
 * Delete payment by id
 * @param {number} paymentId
 * @returns {Promise<void>}
 */
const deletePayment = async (paymentId) => {
  const payment = await getPaymentById(paymentId);
  await payment.destroy();
};

module.exports = {
  createPayment,
  getAllPayments,
  getPaymentById,
  updatePayment,
  deletePayment,
};
