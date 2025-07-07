const httpStatus = require('http-status');
const pick = require('../utils/pick');
const catchAsync = require('../utils/catchAsync');
const { tenantService } = require('../services');
const { Tenant, Unit, Bill, Payment } = require('../models');

// Helper function to parse include query parameter
const parseInclude = (include) => {
  if (!include || typeof include !== 'string') {
    return [];
  }

  const modelMap = {
    unit: Unit,
    bills: Bill,
    payments: Payment,
  };

  const includes = include
    .split('|')
    .map((item) => {
      const [modelName, attributesString] = item.split(':');
      const model = modelMap[modelName];
      if (!model) {
        return null;
      }
      if (!Tenant.associations[modelName]) {
        return null;
      }
      const includeOptions = {
        model,
        as: modelName,
        required: false, // LEFT JOIN to still return Tenant
      };
      if (attributesString) includeOptions.attributes = attributesString.split(',');
      return includeOptions;
    })
    .filter(Boolean);

  return includes;
};

const createTenant = catchAsync(async (req, res) => {
  const tenant = await tenantService.createTenant({ ...req.body, accountId: req.user.accountId });
  res.status(httpStatus.CREATED).send(tenant);
});

// const getTenants = catchAsync(async (req, res) => {
//   const filter = pick(req.query, ['firstName', 'lastName', 'email', 'phoneNumber', 'unitId', 'status']);
//   const options = pick(req.query, ['sortBy', 'limit', 'page']);
//   options.include = parseInclude(req.query.include);
//   const deleted = req.query.deleted || 'false'; // Default to 'false'

//   if (req.user.role !== 'super_admin') filter.accountId = req.user.accountId;

//   const tenants = await tenantService.getAllTenants(filter, options, deleted);
//   res.send(tenants);
// });
const getTenants = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['firstName', 'lastName', 'email', 'phoneNumber', 'unitId', 'status']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  options.include = parseInclude(req.query.include);
  const deleted = req.query.deleted || 'false';

  if (req.user.role === 'super_admin') {
    // Do nothing, super_admin can see all tenants
  } else if (req.user.role === 'tenant') {
    // Show only the current tenant's own data
    filter.email = req.user.email;
  } else {
    // Other roles can see tenants from their own account only
    filter.accountId = req.user.accountId;
  }
  const tenants = await tenantService.getAllTenants(filter, options, deleted);
  res.send(tenants);
});
const getTenantById = catchAsync(async (req, res) => {
  const includes = parseInclude(req.query.include);
  const tenant = await tenantService.getTenantById(req.params.id, includes);
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
const restoreTenantById = catchAsync(async (req, res) => {
  await tenantService.restoreTenant(req.params.id);
  res.status(httpStatus.NO_CONTENT).send();
});

const hardDeleteTenantById = catchAsync(async (req, res) => {
  await tenantService.hardDeleteTenant(req.params.id);
  res.status(httpStatus.NO_CONTENT).send();
});

const getTenantsByUnitAndProperty = catchAsync(async (req, res) => {
  const includes = parseInclude(req.query.include);
  const tenants = await tenantService.getTenantsByUnitAndProperty(req.params.propertyId, req.params.unitId, includes);
  res.send(tenants);
});

const getHistoricalTenantsByUnit = catchAsync(async (req, res) => {
  const includes = parseInclude(req.query.include);
  const { startDate, endDate } = req.query;
  const tenants = await tenantService.getHistoricalTenantsByUnit(req.params.unitId, startDate, endDate, includes);
  res.send(tenants);
});

module.exports = {
  createTenant,
  getTenants,
  getTenantById,
  updateTenantById,
  deleteTenantById,
  restoreTenantById,
  hardDeleteTenantById,
  getTenantsByUnitAndProperty,
  getHistoricalTenantsByUnit,
};
