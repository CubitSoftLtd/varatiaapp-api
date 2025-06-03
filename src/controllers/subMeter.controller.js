const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const pick = require('../utils/pick');
const { subMeterService } = require('../services');

const createSubmeter = catchAsync(async (req, res) => {
  const subMeter = await subMeterService.createSubmeter(req.body);
  res.status(httpStatus.CREATED).send(subMeter);
});

const getSubmeters = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'type']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const subMeters = await subMeterService.getAllSubmeters(filter, options);
  res.send(subMeters);
});

const getSubmeterById = catchAsync(async (req, res) => {
  const subMeter = await subMeterService.getSubmeterById(req.params.id);
  res.send(subMeter);
});

const updateSubmeterById = catchAsync(async (req, res) => {
  const subMeter = await subMeterService.updateSubmeter(req.params.id, req.body);
  res.send(subMeter);
});

const deleteSubmeterById = catchAsync(async (req, res) => {
  await subMeterService.deleteSubmeter(req.params.id);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createSubmeter,
  getSubmeters,
  getSubmeterById,
  updateSubmeterById,
  deleteSubmeterById,
};
