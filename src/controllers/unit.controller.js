const httpStatus = require('http-status');
const pick = require('../utils/pick');
const catchAsync = require('../utils/catchAsync');
const { unitService } = require('../services');

const createUnit = catchAsync(async (req, res) => {
  const unit = await unitService.createUnit(req.body);
  res.status(httpStatus.CREATED).send(unit);
});

const getUnits = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'type']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const units = await unitService.getAllUnits(filter, options);
  res.send(units);
});

const getUnitById = catchAsync(async (req, res) => {
  const unit = await unitService.getUnitById(req.params.id);
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

module.exports = {
  createUnit,
  getUnits,
  getUnitById,
  updateUnitById,
  deleteUnitById,
};
