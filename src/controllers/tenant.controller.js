const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { tenantService } = require('../services');

/**
 * Create a tenant
 * @param {Object} req
 * @param {Object} res
 */
const createTenant = catchAsync(async (req, res) => {
  const tenant = await tenantService.createTenant(req.body);
  res.status(httpStatus.CREATED).json(tenant);
});

/**
 * Query tenants
 * @param {Object} req
 * @param {Object} res
 */
const getAllTenants = catchAsync(async (req, res) => {
  const filter = req.query.filter ? JSON.parse(req.query.filter) : {};
  const options = {
    sortBy: req.query.sortBy,
    limit: req.query.limit,
    page: req.query.page,
  };
  const result = await tenantService.getAllTenants(filter, options);
  res.json(result);
});

/**
 * Get tenant by ID
 * @param {Object} req
 * @param {Object} res
 */
const getTenantById = catchAsync(async (req, res) => {
  const tenant = await tenantService.getTenantById(req.params.id);
  res.json(tenant);
});

/**
 * Update tenant by ID
 * @param {Object} req
 * @param {Object} res
 */
const updateTenant = catchAsync(async (req, res) => {
  const tenant = await tenantService.updateTenant(req.params.id, req.body);
  res.json(tenant);
});

/**
 * Delete tenant by ID
 * @param {Object} req
 * @param {Object} res
 */
const deleteTenant = catchAsync(async (req, res) => {
  await tenantService.deleteTenant(req.params.id);
  res.status(httpStatus.NO_CONTENT).send();
});

/**
 * Get tenants by unit and property
 * @param {Object} req
 * @param {Object} res
 */
const getTenantsByUnitAndProperty = catchAsync(async (req, res) => {
  const { propertyId, unitId } = req.params;
  const tenants = await tenantService.getTenantsByUnitAndProperty(propertyId, unitId);
  res.json(tenants);
});

/**
 * Get historical tenants for a unit
 * @param {Object} req
 * @param {Object} res
 */
const getHistoricalTenantsByUnit = catchAsync(async (req, res) => {
  const { unitId } = req.params;
  const { startDate, endDate } = req.query;
  const result = await tenantService.getHistoricalTenantsByUnit(unitId, new Date(startDate), new Date(endDate));
  res.json(result);
});

module.exports = {
  createTenant,
  getAllTenants,
  getTenantById,
  updateTenant,
  deleteTenant,
  getTenantsByUnitAndProperty,
  getHistoricalTenantsByUnit,
};
