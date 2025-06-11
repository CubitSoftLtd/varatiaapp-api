const httpStatus = require('http-status');
const pick = require('../utils/pick');
const catchAsync = require('../utils/catchAsync');
const { tenantService } = require('../services');
const { Unit, Bill, Payment } = require('../models');

// Helper function to parse include query parameter
const parseInclude = (include) => {
  if (!include) return [];
  return include
    .split('|')
    .map((item) => {
      const [model, attributes] = item.split(':');
      const modelMap = {
        unit: Unit,
        bills: Bill,
        payments: Payment,
      };
      return {
        model: modelMap[model],
        as: model,
        attributes: attributes.split(','),
      };
    })
    .filter((item) => item.model); // Filter out invalid models
};

const createTenant = catchAsync(async (req, res) => {
  const tenant = await tenantService.createTenant(req.body);
  res.status(httpStatus.CREATED).send(tenant);
});

const getTenants = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['firstName', 'lastName', 'email', 'phoneNumber', 'unitId', 'status']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  options.include = parseInclude(req.query.include);
  const tenants = await tenantService.getAllTenants(filter, options);
  res.send(tenants);
});

const getTenantById = catchAsync(async (req, res) => {
  const tenant = await tenantService.getTenantById(req.params.id, parseInclude(req.query.include));
  res.send(tenant);
});

const updateTenantById = catchAsync(async (req, res) => {
  const tenant = await tenantService.updateTenant(req.params.id, req.body);
  res.send(tenant);
});

const deleteTenantById = catchAsync(async (req, res) => {
  await tenantService.deleteTenant(req.params.id);
  res.status(httpStatus.NO_CONTENT).send();
});

const hardDeleteTenantById = catchAsync(async (req, res) => {
  await tenantService.hardDeleteTenant(req.params.id);
  res.status(httpStatus.NO_CONTENT).send();
});

const getTenantsByUnitAndProperty = catchAsync(async (req, res) => {
  const tenants = await tenantService.getTenantsByUnitAndProperty(
    req.params.propertyId,
    req.params.unitId,
    parseInclude(req.query.include)
  );
  res.send(tenants);
});

const getHistoricalTenantsByUnit = catchAsync(async (req, res) => {
  const { startDate, endDate } = req.query;
  const tenants = await tenantService.getHistoricalTenantsByUnit(
    req.params.unitId,
    startDate,
    endDate,
    parseInclude(req.query.include)
  );
  res.send(tenants);
});

module.exports = {
  createTenant,
  getTenants,
  getTenantById,
  updateTenantById,
  deleteTenantById,
  hardDeleteTenantById,
  getTenantsByUnitAndProperty,
  getHistoricalTenantsByUnit,
};
