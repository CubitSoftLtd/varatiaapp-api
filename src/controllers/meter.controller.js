const httpStatus = require('http-status');
const pick = require('../utils/pick');
const catchAsync = require('../utils/catchAsync');
const { meterService } = require('../services');

const createMeter = catchAsync(async (req, res) => {
  const meter = await meterService.createMeter(req.body);
  res.status(httpStatus.CREATED).send(meter);
});

const getMeters = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'type']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const meters = await meterService.getAllMeters(filter, options);
  res.send(meters);
});

const getMeterById = catchAsync(async (req, res) => {
  const meter = await meterService.getMeterById(req.params.id);
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

module.exports = {
  createMeter,
  getMeters,
  getMeterById,
  updateMeterById,
  deleteMeterById,
};
