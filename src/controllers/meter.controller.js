const httpStatus = require('http-status');
const pick = require('../utils/pick');
const catchAsync = require('../utils/catchAsync');
const { meterService } = require('../services');
const { Property, UtilityType, Submeter, MeterReading } = require('../models');

// Helper function to parse include query parameter
const parseInclude = (include) => {
  if (!include) return [];
  return include
    .split('|')
    .map((item) => {
      const [model, attributes] = item.split(':');
      const modelMap = {
        property: Property,
        utilityType: UtilityType,
        submeters: Submeter,
        readings: MeterReading,
      };
      return {
        model: modelMap[model],
        as: model,
        attributes: attributes.split(','),
      };
    })
    .filter((item) => item.model); // Filter out invalid models
};

const createMeter = catchAsync(async (req, res) => {
  const meter = await meterService.createMeter(req.body);
  res.status(httpStatus.CREATED).send(meter);
});

const getMeters = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['number', 'status', 'propertyId', 'utilityTypeId']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  options.include = parseInclude(req.query.include);
  const meters = await meterService.getAllMeters(filter, options);
  res.send(meters);
});

const getMeterById = catchAsync(async (req, res) => {
  const meter = await meterService.getMeterById(req.params.id, parseInclude(req.query.include));
  res.send(meter);
});

const updateMeterById = catchAsync(async (req, res) => {
  const meter = await meterService.updateMeter(req.params.id, req.body);
  res.send(meter);
});

const deleteMeterById = catchAsync(async (req, res) => {
  await meterService.deleteMeter(req.params.id);
  res.status(httpStatus.NO_CONTENT).send();
});

const hardDeleteMeterById = catchAsync(async (req, res) => {
  await meterService.hardDeleteMeter(req.params.id);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createMeter,
  getMeters,
  getMeterById,
  updateMeterById,
  deleteMeterById,
  hardDeleteMeterById,
};
