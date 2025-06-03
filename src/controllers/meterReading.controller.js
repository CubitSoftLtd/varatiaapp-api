const httpStatus = require('http-status');
const pick = require('../utils/pick');
const catchAsync = require('../utils/catchAsync');
const { meterReadingService } = require('../services');

const createMeterReading = catchAsync(async (req, res) => {
  const meterReading = await meterReadingService.createMeterReading(req.body);
  res.status(httpStatus.CREATED).send(meterReading);
});

const getMeterReadings = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'type']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const meterReadings = await meterReadingService.getAllMeterReadings(filter, options);
  res.send(meterReadings);
});

const getMeterReadingById = catchAsync(async (req, res) => {
  const meterReading = await meterReadingService.getMeterReadingById(req.params.id);
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

module.exports = {
  createMeterReading,
  getMeterReadings,
  getMeterReadingById,
  updateMeterReadingById,
  deleteMeterReadingById,
};
