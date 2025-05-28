const httpStatus = require('http-status');
const { MaintenanceRequest, Unit } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a maintenance request
 * @param {number} unitId
 * @param {Object} maintenanceRequestBody
 * @returns {Promise<MaintenanceRequest>}
 */
const createMaintenanceRequest = async (unitId, maintenanceRequestBody) => {
  const unit = await Unit.findByPk(unitId);
  if (!unit) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Unit not found');
  }
  return MaintenanceRequest.create({ ...maintenanceRequestBody, unitId });
};

/**
 * Query for maintenance requests
 * @param {number} unitId
 * @param {Object} filter - Sequelize filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<{ results: MaintenanceRequest[], page: number, limit: number, totalPages: number, totalResults: number }>}
 */
const getAllMaintenanceRequests = async (unitId, filter, options) => {
  const unit = await Unit.findByPk(unitId);
  if (!unit) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Unit not found');
  }
  const limit = options.limit && parseInt(options.limit, 10) > 0 ? parseInt(options.limit, 10) : 10;
  const page = options.page && parseInt(options.page, 10) > 0 ? parseInt(options.page, 10) : 1;
  const offset = (page - 1) * limit;

  const sort = [];
  if (options.sortBy) {
    const [field, order] = options.sortBy.split(':');
    sort.push([field, order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC']);
  }

  const { count, rows } = await MaintenanceRequest.findAndCountAll({
    where: { ...filter, unitId },
    limit,
    offset,
    order: sort.length ? sort : [['createdAt', 'DESC']],
    include: [{ model: Unit }],
  });

  return {
    results: rows,
    page,
    limit,
    totalPages: Math.ceil(count / limit),
    totalResults: count,
  };
};

/**
 * Get maintenance request by id
 * @param {number} id
 * @returns {Promise<MaintenanceRequest>}
 */
const getMaintenanceRequestById = async (id) => {
  const maintenanceRequest = await MaintenanceRequest.findByPk(id, { include: [{ model: Unit }] });
  if (!maintenanceRequest) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Maintenance request not found');
  }
  return maintenanceRequest;
};

/**
 * Update maintenance request by id
 * @param {number} maintenanceRequestId
 * @param {Object} updateBody
 * @returns {Promise<MaintenanceRequest>}
 */
const updateMaintenanceRequest = async (maintenanceRequestId, updateBody) => {
  const maintenanceRequest = await getMaintenanceRequestById(maintenanceRequestId);
  await maintenanceRequest.update(updateBody);
  return maintenanceRequest;
};

/**
 * Delete maintenance request by id
 * @param {number} maintenanceRequestId
 * @returns {Promise<void>}
 */
const deleteMaintenanceRequest = async (maintenanceRequestId) => {
  const maintenanceRequest = await getMaintenanceRequestById(maintenanceRequestId);
  await maintenanceRequest.destroy();
};

module.exs = {
  createMaintenanceRequest,
  getAllMaintenanceRequests,
  getMaintenanceRequestById,
  updateMaintenanceRequest,
  deleteMaintenanceRequest,
};
