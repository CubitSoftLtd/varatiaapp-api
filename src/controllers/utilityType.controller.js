const httpStatus = require('http-status');
const pick = require('../utils/pick');
const catchAsync = require('../utils/catchAsync');
const { utilityTypeService } = require('../services');
const { Meter } = require('../models');

// Helper function to parse include query parameter
const parseInclude = (include) => {
  if (!include) return [];
  return include
    .split('|')
    .map((item) => {
      const [model, attributes] = item.split(':');
      const modelMap = {
        meters: Meter,
      };
      return {
        model: modelMap[model],
        as: model,
        attributes: attributes.split(','),
      };
    })
    .filter((item) => item.model); // Filter out invalid models
};

const createUtilityType = catchAsync(async (req, res) => {
  const utilityType = await utilityTypeService.createUtilityType(req.body);
  res.status(httpStatus.CREATED).send(utilityType);
});

const getUtilityTypes = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'unitOfMeasurement']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  options.include = parseInclude(req.query.include);
  const utilityTypes = await utilityTypeService.getAllUtilityTypes(filter, options);
  res.send(utilityTypes);
});

const getUtilityTypeById = catchAsync(async (req, res) => {
  const utilityType = await utilityTypeService.getUtilityTypeById(req.params.id, parseInclude(req.query.include));
  res.send(utilityType);
});

const updateUtilityTypeById = catchAsync(async (req, res) => {
  const utilityType = await utilityTypeService.updateUtilityType(req.params.id, req.body);
  res.send(utilityType);
});

const deleteUtilityTypeById = catchAsync(async (req, res) => {
  await utilityTypeService.deleteUtilityType(req.params.id);
  res.status(httpStatus.NO_CONTENT).send();
});

const hardDeleteUtilityTypeById = catchAsync(async (req, res) => {
  await utilityTypeService.hardDeleteUtilityType(req.params.id);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createUtilityType,
  getUtilityTypes,
  getUtilityTypeById,
  updateUtilityTypeById,
  deleteUtilityTypeById,
  hardDeleteUtilityTypeById,
};
