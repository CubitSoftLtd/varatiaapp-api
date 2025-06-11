const httpStatus = require('http-status');
const pick = require('../utils/pick');
const catchAsync = require('../utils/catchAsync');
const { meterReadingService } = require('../services');
const { Meter, Submeter, User } = require('../models');

// Helper function to parse include query parameter
const parseInclude = (include) => {
  if (!include) return [];
  return include
    .split('|')
    .map((item) => {
      const [model, attributes] = item.split(':');
      const modelMap = {
        meter: Meter,
        submeter: Submeter,
        user: User,
      };
      return {
        model: modelMap[model],
        as: model === 'user' ? 'enteredByUser' : model,
        attributes: attributes.split(','),
      };
    })
    .filter((item) => item.model); // Filter out invalid models
};

const createMeterReading = catchAsync(async (req, res) => {
  const meterReading = await meterReadingService.createMeterReading(req.body);
  res.status(httpStatus.CREATED).send(meterReading);
});

const getMeterReadings = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['meterId', 'submeterId', 'readingDate', 'enteredByUserId']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  options.include = parseInclude(req.query.include);
  const meterReadings = await meterReadingService.getAllMeterReadings(filter, options);
  res.send(meterReadings);
});

const getMeterReadingById = catchAsync(async (req, res) => {
  const meterReading = await meterReadingService.getMeterReadingById(req.params.id, parseInclude(req.query.include));
  res.send(meterReading);
});

const updateMeterReadingById = catchAsync(async (req, res) => {
  const meterReading = await meterReadingService.updateMeterReading(req.params.id, req.body);
  res.send(meterReading);
});

const deleteMeterReadingById = catchAsync(async (req, res) => {
  await meterReadingService.deleteMeterReading(req.params.id);
  res.status(httpStatus.NO_CONTENT).send();
});

const hardDeleteMeterReadingById = catchAsync(async (req, res) => {
  await meterReadingService.hardDeleteMeterReading(req.params.id);
  res.status(httpStatus.NO_CONTENT).send();
});

const calculateConsumption = catchAsync(async (req, res) => {
  const { meterId, submeterId, startDate, endDate } = req.body;
  const consumption = await meterReadingService.calculateConsumption(meterId, submeterId, startDate, endDate);
  res.send({ consumption });
});

module.exports = {
  createMeterReading,
  getMeterReadings,
  getMeterReadingById,
  updateMeterReadingById,
  deleteMeterReadingById,
  hardDeleteMeterReadingById,
  calculateConsumption,
};
