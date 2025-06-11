const httpStatus = require('http-status');
const pick = require('../utils/pick');
const catchAsync = require('../utils/catchAsync');
const { unitService } = require('../services');
const { Property, Tenant, Bill, Submeter, Expense } = require('../models');

// Helper function to parse include query parameter
const parseInclude = (include) => {
  if (!include) return [];
  return include
    .split('|')
    .map((item) => {
      const [model, attributes] = item.split(':');
      const modelMap = {
        property: Property,
        tenants: Tenant,
        bills: Bill,
        submeters: Submeter,
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

const createUnit = catchAsync(async (req, res) => {
  const unit = await unitService.createUnit(req.body);
  res.status(httpStatus.CREATED).send(unit);
});

const getUnits = catchAsync(async (req, res) => {
  const filter = pick(req.query, [
    'name',
    'propertyId',
    'rentAmount',
    'status',
    'bedroomCount',
    'bathroomCount',
    'squareFootage',
  ]);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  options.include = parseInclude(req.query.include);
  const units = await unitService.getAllUnits(filter, options);
  res.send(units);
});

const getUnitById = catchAsync(async (req, res) => {
  const unit = await unitService.getUnitById(req.params.id, parseInclude(req.query.include));
  res.send(unit);
});

const updateUnitById = catchAsync(async (req, res) => {
  const unit = await unitService.updateUnit(req.params.id, req.body);
  res.send(unit);
});

const deleteUnitById = catchAsync(async (req, res) => {
  await unitService.deleteUnit(req.params.id);
  res.status(httpStatus.NO_CONTENT).send();
});

const hardDeleteUnitById = catchAsync(async (req, res) => {
  await unitService.hardDeleteUnit(req.params.id);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createUnit,
  getUnits,
  getUnitById,
  updateUnitById,
  deleteUnitById,
  hardDeleteUnitById,
};
