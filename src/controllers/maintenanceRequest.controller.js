const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { maintenanceRequestService } = require('../services');

const createMaintenanceRequest = catchAsync(async (req, res) => {
  const maintenanceRequest = await maintenanceRequestService.createMaintenanceRequest(req.params.unitId, req.body);
  res.status(httpStatus.CREATED).send(maintenanceRequest);
});

const getMaintenanceRequests = catchAsync(async (req, res) => {
  const maintenanceRequests = await maintenanceRequestService.getMaintenanceRequestsByUnitId(req.params.unitId);
  res.send(maintenanceRequests);
});

const getMaintenanceRequestById = catchAsync(async (req, res) => {
  const maintenanceRequest = await maintenanceRequestService.getMaintenanceRequestById(req.params.id);
  res.send(maintenanceRequest);
});

const updateMaintenanceRequestById = catchAsync(async (req, res) => {
  const maintenanceRequest = await maintenanceRequestService.updateMaintenanceRequestById(req.params.id, req.body);
  res.send(maintenanceRequest);
});

const deleteMaintenanceRequestById = catchAsync(async (req, res) => {
  await maintenanceRequestService.deleteMaintenanceRequestById(req.params.id);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createMaintenanceRequest,
  getMaintenanceRequests,
  getMaintenanceRequestById,
  updateMaintenanceRequestById,
  deleteMaintenanceRequestById,
};
