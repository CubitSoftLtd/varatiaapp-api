const httpStatus = require('http-status');
const pick = require('../utils/pick');
const catchAsync = require('../utils/catchAsync');
const { tenantService } = require('../services');
const { Unit, Bill, Payment } = require('../models');

// Helper function to parse include query parameter
const parseInclude = (include) => {
  // If no include string is provided, return an empty array.
  if (!include) {
    return [];
  }

  return (
    include
      .split('|') // Split the include string by '|' to process each individual item.
      .map((item) => {
        // Destructure each item into the model name string and the attributes string.
        // If there's no colon (':'), 'attributesString' will be undefined.
        const [modelName, attributesString] = item.split(':');

        // Define your map from string keys to actual Sequelize model objects.
        const modelMap = {
          unit: Unit,
          bills: Bill,
          payments: Payment,
        };

        // Get the Sequelize model from the map.
        const model = modelMap[modelName];

        // If the model name isn't found in your map, log a warning and return null.
        // This item will be filtered out in the next step.
        if (!model) {
          return null;
        }

        // Build the Sequelize include options object.
        const includeOptions = {
          model,
          as: modelName, // The alias for the association.
          // Consider setting 'required: false' here if you generally want LEFT JOINs (outer joins)
          // required: false,
        };

        // ONLY add the 'attributes' property if 'attributesString' is defined.
        // If 'attributesString' is undefined, Sequelize will include all attributes by default,
        // which is typically what you want when no specific attributes are requested.
        if (attributesString) {
          includeOptions.attributes = attributesString.split(',');
        }

        return includeOptions;
      })
      // Filter out any 'null' entries that resulted from unknown model names.
      .filter((item) => item !== null)
  );
};

const createTenant = catchAsync(async (req, res) => {
  const tenant = await tenantService.createTenant({ ...req.body, accountId: req.user.accountId });
  res.status(httpStatus.CREATED).send(tenant);
});

const getTenants = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['firstName', 'lastName', 'email', 'phoneNumber', 'unitId', 'status']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  options.include = parseInclude(req.query.include);

  if (req.user.role !== 'super_admin') {
    filter.accountId = req.user.accountId; // Ensure only properties for the user's account are fetched
  }

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
