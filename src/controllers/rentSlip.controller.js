const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const rentSlipService = require('../services/rentSlip.service');

/**
 * Create a new rent slip
 */
const createRentSlip = catchAsync(async (req, res) => {
  const rentSlip = await rentSlipService.createRentSlip(req.body);
  res.status(httpStatus.CREATED).send(rentSlip);
});

/**
 * Get all rent slips (with filtering and pagination)
 */
const getAllRentSlips = catchAsync(async (req, res) => {
  const filter = {};
  if (req.query.tenantId) filter.tenantId = req.query.tenantId;
  if (req.query.rentId) filter.rentId = req.query.rentId;

  const options = {
    sortBy: req.query.sortBy,
    limit: req.query.limit,
    page: req.query.page,
  };

  const result = await rentSlipService.getAllRentSlips(filter, options);
  res.send(result);
});

/**
 * Get a rent slip by ID
 */
const getRentSlipById = catchAsync(async (req, res) => {
  const rentSlip = await rentSlipService.getRentSlipById(req.params.id);
  res.send(rentSlip);
});

/**
 * Update a rent slip by ID
 */
const updateRentSlip = catchAsync(async (req, res) => {
  const updated = await rentSlipService.updateRentSlip(req.params.id, req.body);
  res.send(updated);
});

/**
 * Delete a rent slip by ID
 */
const deleteRentSlip = catchAsync(async (req, res) => {
  await rentSlipService.deleteRentSlip(req.params.id);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createRentSlip,
  getAllRentSlips,
  getRentSlipById,
  updateRentSlip,
  deleteRentSlip,
};
