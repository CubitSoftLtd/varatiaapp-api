const httpStatus = require('http-status');
const pick = require('../utils/pick');
const catchAsync = require('../utils/catchAsync');
const { utilityTypeService } = require('../services');

const createUtilityType = catchAsync(async (req, res) => {
  // eslint-disable-next-line no-console
  console.log(req.body);
  const utilityType = await utilityTypeService.createUtilityType(req.body);
  res.status(httpStatus.CREATED).send(utilityType);
});

const getUtilityTypes = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'type']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const utilityTypes = await utilityTypeService.getAllUtilityTypes(filter, options);
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
