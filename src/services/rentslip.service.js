const httpStatus = require('http-status');
const { RentSlip, Rent, Tenant } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a rent slip
 * @param {Object} rentSlipBody
 * @returns {Promise<RentSlip>}
 */
const createRentSlip = async (rentSlipBody) => {
  if (rentSlipBody.rentId) {
    const rent = await Rent.findByPk(rentSlipBody.rentId);
    if (!rent) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Rent record not found');
    }
  }
  if (rentSlipBody.tenantId) {
    const tenant = await Tenant.findByPk(rentSlipBody.tenantId);
    if (!tenant) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Tenant not found');
    }
  }
  return RentSlip.create(rentSlipBody);
};

/**
 * Query for rent slips
 * @param {Object} filter - Sequelize filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<{ results: RentSlip[], page: number, limit: number, totalPages: number, totalResults: number }>}
 */
const getAllRentSlips = async (filter, options) => {
  const limit = options.limit && parseInt(options.limit, 10) > 0 ? parseInt(options.limit, 10) : 10;
  const page = options.page && parseInt(options.page, 10) > 0 ? parseInt(options.page, 10) : 1;
  const offset = (page - 1) * limit;

  const sort = [];
  if (options.sortBy) {
    const [field, order] = options.sortBy.split(':');
    sort.push([field, order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC']);
  }

  const { count, rows } = await RentSlip.findAndCountAll({
    where: filter,
    limit,
    offset,
    order: sort.length ? sort : [['paymentDate', 'DESC']],
    include: [
      { model: Rent, as: 'Rent' },
      { model: Tenant, as: 'Tenant' },
    ],
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
 * Get rent slip by id
 * @param {string} id
 * @returns {Promise<RentSlip>}
 */
const getRentSlipById = async (id) => {
  const rentSlip = await RentSlip.findByPk(id, {
    include: [
      { model: Rent, as: 'Rent' },
      { model: Tenant, as: 'Tenant' },
    ],
  });
  if (!rentSlip) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Rent slip not found');
  }
  return rentSlip;
};

/**
 * Update rent slip by id
 * @param {string} rentSlipId
 * @param {Object} updateBody
 * @returns {Promise<RentSlip>}
 */
const updateRentSlip = async (rentSlipId, updateBody) => {
  const rentSlip = await getRentSlipById(rentSlipId);
  if (updateBody.rentId) {
    const rent = await Rent.findByPk(updateBody.rentId);
    if (!rent) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Rent record not found');
    }
  }
  if (updateBody.tenantId) {
    const tenant = await Tenant.findByPk(updateBody.tenantId);
    if (!tenant) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Tenant not found');
    }
  }
  await rentSlip.update(updateBody);
  return rentSlip;
};

/**
 * Delete rent slip by id
 * @param {string} rentSlipId
 * @returns {Promise<void>}
 */
const deleteRentSlip = async (rentSlipId) => {
  const rentSlip = await getRentSlipById(rentSlipId);
  await rentSlip.destroy();
};

module.exports = {
  createRentSlip,
  getAllRentSlips,
  getRentSlipById,
  updateRentSlip,
  deleteRentSlip,
};
