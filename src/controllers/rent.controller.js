const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { rentService } = require('../services');

const createRent = catchAsync(async (req, res) => {
  const rent = await rentService.createRent(req.body);
  res.status(httpStatus.CREATED).send(rent);
});

const getRents = catchAsync(async (req, res) => {
  const rents = await rentService.getAllRents();
  res.send(rents);
});

const getRentById = catchAsync(async (req, res) => {
  const rent = await rentService.getRentById(req.params.id);
  res.send(rent);
});

const updateRentById = catchAsync(async (req, res) => {
  const rent = await rentService.updateRentById(req.params.id, req.body);
  res.send(rent);
});

const deleteRentById = catchAsync(async (req, res) => {
  await rentService.deleteRentById(req.params.id);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createRent,
  getRents,
  getRentById,
  updateRentById,
  deleteRentById,
};
