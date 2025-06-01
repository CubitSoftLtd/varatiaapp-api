const httpStatus = require('http-status');
const { Tenant, Unit, Property, TenancyHistory } = require('../models');
const ApiError = require('../utils/ApiError');
const sequelize = require('../models');
/**
 * Create a tenant
 * @param {Object} tenantBody
 * @returns {Promise<Tenant>}
 */
const createTenant = async (tenantBody) => {
  if (tenantBody.unitId) {
    const unit = await Unit.findByPk(tenantBody.unitId);
    if (!unit) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Unit not found');
    }
  }
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
    include: [{ model: Unit, as: 'Unit', include: [{ model: Property, as: 'Property' }] }],
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
 * @param {string} id
 * @returns {Promise<Tenant>}
 */
const getTenantById = async (id) => {
  const tenant = await Tenant.findByPk(id, {
    include: [{ model: Unit, as: 'Unit', include: [{ model: Property, as: 'Property' }] }],
  });
  if (!tenant) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Tenant not found');
  }
  return tenant;
};

/**
 * Update tenant by id
 * @param {string} tenantId
 * @param {Object} updateBody
 * @returns {Promise<Tenant>}
 */
const updateTenant = async (tenantId, updateBody) => {
  const tenant = await getTenantById(tenantId);
  if (updateBody.unitId) {
    const unit = await Unit.findByPk(updateBody.unitId);
    if (!unit) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Unit not found');
    }
  }
  await tenant.update(updateBody);
  return tenant;
};

/**
 * Delete tenant by id
 * @param {string} tenantId
 * @returns {Promise<void>}
 */
const deleteTenant = async (tenantId) => {
  const tenant = await getTenantById(tenantId);
  await tenant.destroy();
};

/**
 * Get tenants by unit and property
 * @param {string} propertyId
 * @param {string} unitId
 * @returns {Promise<Tenant[]>}
 */
const getTenantsByUnitAndProperty = async (propertyId, unitId) => {
  const property = await Property.findByPk(propertyId);
  if (!property) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Property not found');
  }

  const unit = await Unit.findByPk(unitId);
  if (!unit) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Unit not found');
  }
  if (unit.propertyId !== propertyId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Unit does not belong to the specified property');
  }

  const tenants = await Tenant.findAll({
    where: { unitId },
    include: [{ model: Unit, as: 'Unit', include: [{ model: Property, as: 'Property' }] }],
  });

  return tenants;
};

/**
 * Get historical tenants for a unit within a date range
 * @param {string} unitId
 * @param {Date} startDate
 * @param {Date} endDate
 * @returns {Promise<{ results: TenancyHistory[], totalResults: number }>}
 */
const getHistoricalTenantsByUnit = async (unitId, startDate, endDate) => {
  const unit = await Unit.findByPk(unitId);
  if (!unit) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Unit not found');
  }

  const histories = await TenancyHistory.findAll({
    where: {
      unitId,
      startDate: { [sequelize.Op.lte]: endDate },
      [sequelize.Op.or]: [{ endDate: { [sequelize.Op.gte]: startDate } }, { endDate: null }],
    },
    include: [
      { model: Tenant, as: 'Tenant' },
      { model: Unit, as: 'Unit', include: [{ model: Property, as: 'Property' }] },
    ],
  });

  return {
    results: histories,
    totalResults: histories.length,
  };
};

module.exports = {
  createTenant,
  getAllTenants,
  getTenantById,
  updateTenant,
  deleteTenant,
  getTenantsByUnitAndProperty,
  getHistoricalTenantsByUnit,
};
