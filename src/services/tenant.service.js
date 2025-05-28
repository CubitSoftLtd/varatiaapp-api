const httpStatus = require('http-status');
const { Tenant } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a tenant
 * @param {Object} tenantBody
 * @returns {Promise<Tenant>}
 */
const createTenant = async (tenantBody) => {
  return Tenant.create(tenantBody);
};

/**
 * Query for tenants
 * @param {Object} filter - Sequelize filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<{ results: Tenant[], page: number, limit: number, totalPages: number, totalResults: number }>}
 */
const getAllTenants = async (filter, options) => {
  const limit = options.limit && parseInt(options.limit, 10) > 0 ? parseInt(options.limit, 10) : 10;
  const page = options.page && parseInt(options.page, 10) > 0 ? parseInt(options.page, 10) : 1;
  const offset = (page - 1) * limit;

  const sort = [];
  if (options.sortBy) {
    const [field, order] = options.sortBy.split(':');
    sort.push([field, order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC']);
  }

  const { count, rows } = await Tenant.findAndCountAll({
    where: filter,
    limit,
    offset,
    order: sort.length ? sort : [['createdAt', 'DESC']],
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
 * Get tenant by id
 * @param {number} id
 * @returns {Promise<Tenant>}
 */
const getTenantById = async (id) => {
  const tenant = await Tenant.findByPk(id);
  if (!tenant) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Tenant not found');
  }
  return tenant;
};

/**
 * Update tenant by id
 * @param {number} tenantId
 * @param {Object} updateBody
 * @returns {Promise<Tenant>}
 */
const updateTenant = async (tenantId, updateBody) => {
  const tenant = await getTenantById(tenantId);
  await tenant.update(updateBody);
  return tenant;
};

/**
 * Delete tenant by id
 * @param {number} tenantId
 * @returns {Promise<void>}
 */
const deleteTenant = async (tenantId) => {
  const tenant = await getTenantById(tenantId);
  await tenant.destroy();
};

module.exs = {
  createTenant,
  getAllTenants,
  getTenantById,
  updateTenant,
  deleteTenant,
};
