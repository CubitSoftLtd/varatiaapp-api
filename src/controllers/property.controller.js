const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { propertyService } = require('../services');

const createProperty = catchAsync(async (req, res) => {
  const property = await propertyService.createProperty(req.body, req.user);
  res.status(httpStatus.CREATED).send(property);
});

const getProperties = catchAsync(async (req, res) => {
  const filter = req.query.filter ? JSON.parse(req.query.filter) : {};
  const options = { sortBy: req.query.sortBy, limit: req.query.limit, page: req.query.page };
  const result = await propertyService.getAllProperties(filter, options, req.user);
  res.send(result);
});

const getPropertyById = catchAsync(async (req, res) => {
  const property = await propertyService.getPropertyById(req.params.id, req.user);
  res.send(property);
});

const updatePropertyById = catchAsync(async (req, res) => {
  const property = await propertyService.updateProperty(req.params.id, req.body, req.user);
  res.send(property);
});

const deletePropertyById = catchAsync(async (req, res) => {
  await propertyService.deleteProperty(req.params.id, req.user);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createProperty,
  getProperties,
  getPropertyById,
  updatePropertyById,
  deletePropertyById,
};
