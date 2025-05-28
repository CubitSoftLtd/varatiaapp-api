const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { unitService } = require('../services');

const createUnit = catchAsync(async (req, res) => {
  const unit = await unitService.createUnit(req.params.propertyId, req.body);
  res.status(httpStatus.CREATED).send(unit);
});

const getUnits = catchAsync(async (req, res) => {
  const units = await unitService.getUnitsByPropertyId(req.params.propertyId);
  res.send(units);
});

const getUnitById = catchAsync(async (req, res) => {
  const unit = await unitService.getUnitById(req.params.id);
  res.send(unit);
});

const updateUnitById = catchAsync(async (req, res) => {
  const unit = await unitService.updateUnitById(req.params.id, req.body);
  res.send(unit);
});

const deleteUnitById = catchAsync(async (req, res) => {
  await unitService.deleteUnitById(req.params.id);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exs = {
  createUnit,
  getUnits,
  getUnitById,
  updateUnitById,
  deleteUnitById,
};
