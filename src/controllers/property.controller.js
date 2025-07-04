const httpStatus = require('http-status');
const pick = require('../utils/pick');
const catchAsync = require('../utils/catchAsync');
const { propertyService } = require('../services');
const { Account, Unit, Expense } = require('../models');

// Helper function to parse include query parameter
const parseInclude = (include) => {
  if (!include) return [];

  return include
    .split('|')
    .map((item) => {
      const [modelName, attributesString] = item.split(':'); // Destructure into distinct variables

      const modelMap = {
        account: Account,
        units: Unit,
        expenses: Expense,
      };

      const model = modelMap[modelName];

      // If the model name isn't found in the map, return null to be filtered out
      if (!model) {
        return null;
      }

      const includeOptions = {
        model,
        as: modelName,
      };

      // Only add attributes if attributesString is provided (not undefined or empty)
      if (attributesString) {
        includeOptions.attributes = attributesString.split(',');
      }

      return includeOptions;
    })
    .filter((item) => item !== null); // Filter out any `null` entries created from unknown models
};

const createProperty = catchAsync(async (req, res) => {
  const property = await propertyService.createProperty({
    ...req.body,
    accountId: req.user.accountId,
  });
  res.status(httpStatus.CREATED).send(property);
});

const getProperties = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'address', 'accountId', 'type', 'yearBuilt', 'totalUnits']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  options.include = parseInclude(req.query.include);
  const deleted = req.query.deleted || 'false'; // Default to 'false'

  if (req.user.role !== 'super_admin') {
    filter.accountId = req.user.accountId; // Ensure only properties for the user's account are fetched
  }

  const properties = await propertyService.getAllProperties(filter, options, deleted);
  res.send(properties);
});

const getPropertyById = catchAsync(async (req, res) => {
  const property = await propertyService.getPropertyById(req.params.id, parseInclude(req.query.include));
  res.send(property);
});

const updatePropertyById = catchAsync(async (req, res) => {
  const property = await propertyService.updateProperty(req.params.id, req.body);
  res.send(property);
});

const deletePropertyById = catchAsync(async (req, res) => {
  await propertyService.deleteProperty(req.params.id);
  res.status(httpStatus.NO_CONTENT).send();
});
const restorePropertyById = catchAsync(async (req, res) => {
  await propertyService.restoreProperty(req.params.id);
  res.status(httpStatus.NO_CONTENT).send();
});

const hardDeletePropertyById = catchAsync(async (req, res) => {
  await propertyService.hardDeleteProperty(req.params.id);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createProperty,
  getProperties,
  getPropertyById,
  updatePropertyById,
  deletePropertyById,
  restorePropertyById,
  hardDeletePropertyById,
};
