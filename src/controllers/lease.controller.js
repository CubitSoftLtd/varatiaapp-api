const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { leaseService } = require('../services');

const createLease = catchAsync(async (req, res) => {
  const lease = await leaseService.createLease(req.body);
  res.status(httpStatus.CREATED).send(lease);
});

const getLeases = catchAsync(async (req, res) => {
  const leases = await leaseService.getAllLeases();
  res.send(leases);
});

const getLeaseById = catchAsync(async (req, res) => {
  const lease = await leaseService.getLeaseById(req.params.id);
  res.send(lease);
});

const updateLeaseById = catchAsync(async (req, res) => {
  const lease = await leaseService.updateLeaseById(req.params.id, req.body);
  res.send(lease);
});

const deleteLeaseById = catchAsync(async (req, res) => {
  await leaseService.deleteLeaseById(req.params.id);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exs = {
  createLease,
  getLeases,
  getLeaseById,
  updateLeaseById,
  deleteLeaseById,
};
