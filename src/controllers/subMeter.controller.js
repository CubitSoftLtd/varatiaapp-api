const httpStatus = require('http-status');
const pick = require('../utils/pick');
const catchAsync = require('../utils/catchAsync');
const { submeterService } = require('../services');
const { Meter, Unit } = require('../models');

// Helper function to parse include query parameter
const parseInclude = (include) => {
  if (!include) return [];
  return include
    .split('|')
    .map((item) => {
      const [model, attributes] = item.split(':');
      const modelMap = {
        meter: Meter,
        unit: Unit,
      };
      return {
        model: modelMap[model],
        as: model,
        attributes: attributes.split(','),
      };
    })
    .filter((item) => item.model); // Filter out invalid models
};

const createSubmeter = catchAsync(async (req, res) => {
  const submeter = await submeterService.createSubmeter(req.body);
  res.status(httpStatus.CREATED).send(submeter);
});

const getSubmeters = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['number', 'status', 'meterId', 'unitId']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  options.include = parseInclude(req.query.include);
  const submeters = await submeterService.getSubmeters(filter, options);
  res.send(submeters);
});

const getSubmeterById = catchAsync(async (req, res) => {
  const submeter = await submeterService.getSubmeter(req.params.id, parseInclude(req.query.include));
  res.send(submeter);
});

const updateSubmeterById = catchAsync(async (req, res) => {
  const submeter = await submeterService.updateSubmeter(req.params.id, req.body);
  res.send(submeter);
});

const deleteSubmeterById = catchAsync(async (req, res) => {
  await submeterService.deleteSubmeter(req.params.id);
  res.status(httpStatus.NO_CONTENT).send();
});

const hardDeleteSubmeterById = catchAsync(async (req, res) => {
  await submeterService.hardDeleteSubmeter(req.params.id);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createSubmeter,
  getSubmeters,
  getSubmeterById,
  updateSubmeterById,
  deleteSubmeterById,
  hardDeleteSubmeterById,
};
