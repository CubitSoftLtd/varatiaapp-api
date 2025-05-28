const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { subMeterService } = require('../services');

const createSubMeter = catchAsync(async (req, res) => {
  const subMeter = await subMeterService.createSubMeter(req.params.meterId, req.params.unitId, req.body);
  res.status(httpStatus.CREATED).send(subMeter);
});

const getSubMeters = catchAsync(async (req, res) => {
  const subMeters = await subMeterService.getSubMetersByUnitId(req.params.unitId);
  res.send(subMeters);
});

const getSubMeterById = catchAsync(async (req, res) => {
  const subMeter = await subMeterService.getSubMeterById(req.params.id);
  res.send(subMeter);
});

const updateSubMeterById = catchAsync(async (req, res) => {
  const subMeter = await subMeterService.updateSubMeterById(req.params.id, req.body);
  res.send(subMeter);
});

const deleteSubMeterById = catchAsync(async (req, res) => {
  await subMeterService.deleteSubMeterById(req.params.id);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exs = {
  createSubMeter,
  getSubMeters,
  getSubMeterById,
  updateSubMeterById,
  deleteSubMeterById,
};
