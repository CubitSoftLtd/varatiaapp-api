const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { tenantService } = require('../services');

const createTenant = catchAsync(async (req, res) => {
  const tenant = await tenantService.createTenant(req.body);
  res.status(httpStatus.CREATED).send(tenant);
});

const getTenants = catchAsync(async (req, res) => {
  const tenants = await tenantService.getAllTenants();
  res.send(tenants);
});

const getTenantById = catchAsync(async (req, res) => {
  const tenant = await tenantService.getTenantById(req.params.id);
  res.send(tenant);
});

const updateTenantById = catchAsync(async (req, res) => {
  const tenant = await tenantService.updateTenantById(req.params.id, req.body);
  res.send(tenant);
});

const deleteTenantById = catchAsync(async (req, res) => {
  await tenantService.deleteTenantById(req.params.id);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createTenant,
  getTenants,
  getTenantById,
  updateTenantById,
  deleteTenantById,
};
