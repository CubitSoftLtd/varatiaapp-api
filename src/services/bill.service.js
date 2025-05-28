const httpStatus = require('http-status');
const { Bill, Lease } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a bill
 * @param {number} leaseId
 * @param {Object} billBody
 * @returns {Promise<Bill>}
 */
const createBill = async (leaseId, billBody) => {
  const lease = await Lease.findByPk(leaseId);
  if (!lease) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Lease not found');
  }
  return Bill.create({ ...billBody, leaseId });
};

/**
 * Query for bills
 * @param {number} leaseId
 * @param {Object} filter - Sequelize filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<{ results: Bill[], page: number, limit: number, totalPages: number, totalResults: number }>}
 */
const getAllBills = async (leaseId, filter, options) => {
  const lease = await Lease.findByPk(leaseId);
  if (!lease) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Lease not found');
  }
  const limit = options.limit && parseInt(options.limit, 10) > 0 ? parseInt(options.limit, 10) : 10;
  const page = options.page && parseInt(options.page, 10) > 0 ? parseInt(options.page, 10) : 1;
  const offset = (page - 1) * limit;

  const sort = [];
  if (options.sortBy) {
    const [field, order] = options.sortBy.split(':');
    sort.push([field, order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC']);
  }

  const { count, rows } = await Bill.findAndCountAll({
    where: { ...filter, leaseId },
    limit,
    offset,
    order: sort.length ? sort : [['createdAt', 'DESC']],
    include: [{ model: Lease }],
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
 * Get bill by id
 * @param {number} id
 * @returns {Promise<Bill>}
 */
const getBillById = async (id) => {
  const bill = await Bill.findByPk(id, { include: [{ model: Lease }] });
  if (!bill) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Bill not found');
  }
  return bill;
};

/**
 * Update bill by id
 * @param {number} billId
 * @param {Object} updateBody
 * @returns {Promise<Bill>}
 */
const updateBill = async (billId, updateBody) => {
  const bill = await getBillById(billId);
  await bill.update(updateBody);
  return bill;
};

/**
 * Delete bill by id
 * @param {number} billId
 * @returns {Promise<void>}
 */
const deleteBill = async (billId) => {
  const bill = await getBillById(billId);
  await bill.destroy();
};

module.exports = {
  createBill,
  getAllBills,
  getBillById,
  updateBill,
  deleteBill,
};
