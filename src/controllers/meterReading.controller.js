const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { meterReadingService } = require('../services');

const createMeterReading = catchAsync(async (req, res) => {
  const meterReading = await meterReadingService.createMeterReading(req.params.meterId, req.params.subMeterId, req.body);
  res.status(httpStatus.CREATED).send(meterReading);
});

const getMeterReadings = catchAsync(async (req, res) => {
  const meterReadings = await meterReadingService.getMeterReadingsByMeterAndSubMeterId(req.params.meterId, req.params.subMeterId);
  res.send(meterReadings);
});

const getMeterReadingById = catchAsync(async (req, res) => {
  const meterReading = await meterReadingService.getMeterReadingById(req.params.id);
  res.send(meterReading);
});

const updateMeterReadingById = catchAsync(async (req, res) => {
  const meterReading = await meterReadingService.updateMeterReadingById(req.params.id, req.body);
  res.send(meterReading);
});

const deleteMeterReadingById = catchAsync(async (req, res) => {
  await meterReadingService.deleteMeterReadingById(req.params.id);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createMeterReading,
  getMeterReadings,
  getMeterReadingById,
  updateMeterReadingById,
  deleteMeterReadingById,
};
