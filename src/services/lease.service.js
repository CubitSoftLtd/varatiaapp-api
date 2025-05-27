const httpStatus = require('http-status');
const { Lease, Tenant, Unit } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a lease
 * @param {Object} leaseBody
 * @returns {Promise<Lease>}
 */
const createLease = async (leaseBody) => {
  const tenant = await Tenant.findByPk(leaseBody.tenantId);
  if (!tenant) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Tenant not found');
  }
  const unit = await Unit.findByPk(leaseBody.unitId);
  if (!unit) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Unit not found');
  }
  return Lease.create(leaseBody);
};

/**
 * Query for leases
 * @param {Object} filter - Sequelize filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<{ results: Lease[], page: number, limit: number, totalPages: number, totalResults: number }>}
 */
const getAllLeases = async (filter, options) => {
  const limit = options.limit && parseInt(options.limit, 10) > 0 ? parseInt(options.limit, 10) : 10;
  const page = options.page && parseInt(options.page, 10) > 0 ? parseInt(options.page, 10) : 1;
  const offset = (page - 1) * limit;

  const sort = [];
  if (options.sortBy) {
    const [field, order] = options.sortBy.split(':');
    sort.push([field, order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC']);
  }

  const { count, rows } = await Lease.findAndCountAll({
    where: filter,
    limit,
    offset,
    order: sort.length ? sort : [['createdAt', 'DESC']],
    include: [{ model: Tenant }, { model: Unit }],
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
 * Get lease by id
 * @param {number} id
 * @returns {Promise<Lease>}
 */
const getLeaseById = async (id) => {
  const lease = await Lease.findByPk(id, { include: [{ model: Tenant }, { model: Unit }] });
  if (!lease) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Lease not found');
  }
  return lease;
};

/**
 * Update lease by id
 * @param {number} leaseId
 * @param {Object} updateBody
 * @returns {Promise<Lease>}
 */
const updateLease = async (leaseId, updateBody) => {
  const lease = await getLeaseById(leaseId);
  if (updateBody.tenantId && !(await Tenant.findByPk(updateBody.tenantId))) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Tenant not found');
  }
  if (updateBody.unitId && !(await Unit.findByPk(updateBody.unitId))) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Unit not found');
  }
  await lease.update(updateBody);
  return lease;
};

/**
 * Delete lease by id
 * @param {number} leaseId
 * @returns {Promise<void>}
 */
const deleteLease = async (leaseId) => {
  const lease = await getLeaseById(leaseId);
  await lease.destroy();
};

module.exports = {
  createLease,
  getAllLeases,
  getLeaseById,
  updateLease,
  deleteLease,
};
