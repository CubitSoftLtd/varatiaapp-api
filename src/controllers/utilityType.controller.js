const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { utilityTypeService } = require('../services');

const createUtilityType = catchAsync(async (req, res) => {
  const utilityType = await utilityTypeService.createUtilityType(req.body);
  res.status(httpStatus.CREATED).send(utilityType);
});

const getUtilityTypes = catchAsync(async (req, res) => {
  const utilityTypes = await utilityTypeService.getAllUtilityTypes();
  res.send(utilityTypes);
});

const getUtilityTypeById = catchAsync(async (req, res) => {
  const utilityType = await utilityTypeService.getUtilityTypeById(req.params.id);
  res.send(utilityType);
});

const updateUtilityTypeById = catchAsync(async (req, res) => {
  const utilityType = await utilityTypeService.updateUtilityTypeById(req.params.id, req.body);
  res.send(utilityType);
});

const deleteUtilityTypeById = catchAsync(async (req, res) => {
  await utilityTypeService.deleteUtilityTypeById(req.params.id);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createUtilityType,
  getUtilityTypes,
  getUtilityTypeById,
  updateUtilityTypeById,
  deleteUtilityTypeById,
};
