const httpStatus = require('http-status');
const { Payment, RentSlip, Tenant } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a payment
 * @param {Object} paymentBody
 * @returns {Promise<Payment>}
 */
const createPayment = async (paymentBody) => {
  if (paymentBody.rentSlipId) {
    const rentSlip = await RentSlip.findByPk(paymentBody.rentSlipId);
    if (!rentSlip) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Rent slip not found');
    }
  }
  if (paymentBody.tenantId) {
    const tenant = await Tenant.findByPk(paymentBody.tenantId);
    if (!tenant) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Tenant not found');
    }
  }
  return Payment.create(paymentBody);
};

/**
 * Query for payments
 * @param {Object} filter - Sequelize filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<{ results: Payment[], page: number, limit: number, totalPages: number, totalResults: number }>}
 */
const getAllPayments = async (filter, options) => {
  const limit = options.limit && parseInt(options.limit, 10) > 0 ? parseInt(options.limit, 10) : 10;
  const page = options.page && parseInt(options.page, 10) > 0 ? parseInt(options.page, 10) : 1;
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
    include: [
      { model: RentSlip, as: 'RentSlip' },
      { model: Tenant, as: 'Tenant' },
    ],
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
 * @param {string} id
 * @returns {Promise<Payment>}
 */
const getPaymentById = async (id) => {
  const payment = await Payment.findByPk(id, {
    include: [
      { model: RentSlip, as: 'RentSlip' },
      { model: Tenant, as: 'Tenant' },
    ],
  });
  if (!payment) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Payment not found');
  }
  return payment;
};

/**
 * Update payment by id
 * @param {string} paymentId
 * @param {Object} updateBody
 * @returns {Promise<Payment>}
 */
const updatePayment = async (paymentId, updateBody) => {
  const payment = await getPaymentById(paymentId);
  if (updateBody.rentSlipId) {
    const rentSlip = await RentSlip.findByPk(updateBody.rentSlipId);
    if (!rentSlip) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Rent slip not found');
    }
  }
  if (updateBody.tenantId) {
    const tenant = await Tenant.findByPk(updateBody.tenantId);
    if (!tenant) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Tenant not found');
    }
  }
  await payment.update(updateBody);
  return payment;
};

/**
 * Delete payment by id
 * @param {string} paymentId
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
