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
      const [model, attributes] = item.split(':');
      const modelMap = {
        account: Account,
        units: Unit,
        expenses: Expense,
      };
      return {
        model: modelMap[model],
        as: model,
        attributes: attributes.split(','),
      };
    })
    .filter((item) => item.model); // Filter out invalid models
};

const createProperty = catchAsync(async (req, res) => {
  const property = await propertyService.createProperty(req.body);
  res.status(httpStatus.CREATED).send(property);
});

const getProperties = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'address', 'accountId', 'type', 'yearBuilt', 'totalUnits']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  options.include = parseInclude(req.query.include);
  const properties = await propertyService.getAllProperties(filter, options);
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
  hardDeletePropertyById,
};
