const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { meterService } = require('../services');

const createMeter = catchAsync(async (req, res) => {
  // eslint-disable-next-line no-console
  console.log(req);
  const meter = await meterService.createMeter(req.params.propertyId, req.body);
  res.status(httpStatus.CREATED).send(meter);
});

const getMeters = catchAsync(async (req, res) => {
  const meters = await meterService.getMetersByPropertyId(req.params.propertyId);
  res.send(meters);
});

const getMeterById = catchAsync(async (req, res) => {
  const meter = await meterService.getMeterById(req.params.id);
  res.send(meter);
});

const updateMeterById = catchAsync(async (req, res) => {
  const meter = await meterService.updateMeterById(req.params.id, req.body);
  res.send(meter);
});

const deleteMeterById = catchAsync(async (req, res) => {
  await meterService.deleteMeterById(req.params.id);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createMeter,
  getMeters,
  getMeterById,
  updateMeterById,
  deleteMeterById,
};
