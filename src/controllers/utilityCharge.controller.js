const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { utilityChargeService } = require('../services');

const createUtilityCharge = catchAsync(async (req, res) => {
  const utilityCharge = await utilityChargeService.createUtilityCharge(req.params.utilityTypeId, req.body);
  res.status(httpStatus.CREATED).send(utilityCharge);
});

const getUtilityCharges = catchAsync(async (req, res) => {
  const utilityCharges = await utilityChargeService.getUtilityChargesByUtilityTypeId(req.params.utilityTypeId);
  res.send(utilityCharges);
});

const getUtilityChargeById = catchAsync(async (req, res) => {
  const utilityCharge = await utilityChargeService.getUtilityChargeById(req.params.id);
  res.send(utilityCharge);
});

const updateUtilityChargeById = catchAsync(async (req, res) => {
  const utilityCharge = await utilityChargeService.updateUtilityChargeById(req.params.id, req.body);
  res.send(utilityCharge);
});

const deleteUtilityChargeById = catchAsync(async (req, res) => {
  await utilityChargeService.deleteUtilityChargeById(req.params.id);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createUtilityCharge,
  getUtilityCharges,
  getUtilityChargeById,
  updateUtilityChargeById,
  deleteUtilityChargeById,
};
