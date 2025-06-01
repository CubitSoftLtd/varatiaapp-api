const httpStatus = require('http-status');
const { Rent, Tenant, Unit } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a rent record
 * @param {Object} rentBody
 * @returns {Promise<Rent>}
 */
const createRent = async (rentBody) => {
  if (rentBody.tenantId) {
    const tenant = await Tenant.findByPk(rentBody.tenantId);
    if (!tenant) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Tenant not found');
    }
  }
  if (rentBody.unitId) {
    const unit = await Unit.findByPk(rentBody.unitId);
    if (!unit) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Unit not found');
    }
  }
  return Rent.create(rentBody);
};

/**
 * Query for rent records
 * @param {Object} filter - Sequelize filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<{ results: Rent[], page: number, limit: number, totalPages: number, totalResults: number }>}
 */
const getAllRents = async (filter, options) => {
  const limit = options.limit && parseInt(options.limit, 10) > 0 ? parseInt(options.limit, 10) : 10;
  const page = options.page && parseInt(options.page, 10) > 0 ? parseInt(options.page, 10) : 1;
  const offset = (page - 1) * limit;

  const sort = [];
  if (options.sortBy) {
    const [field, order] = options.sortBy.split(':');
    sort.push([field, order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC']);
  }

  const { count, rows } = await Rent.findAndCountAll({
    where: filter,
    limit,
    offset,
    order: sort.length ? sort : [['dueDate', 'DESC']],
    include: [
      { model: Tenant, as: 'Tenant' },
      { model: Unit, as: 'Unit' },
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
 * Get rent record by id
 * @param {string} id
 * @returns {Promise<Rent>}
 */
const getRentById = async (id) => {
  const rent = await Rent.findByPk(id, {
    include: [
      { model: Tenant, as: 'Tenant' },
      { model: Unit, as: 'Unit' },
    ],
  });
  if (!rent) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Rent record not found');
  }
  return rent;
};

/**
 * Update rent record by id
 * @param {string} rentId
 * @param {Object} updateBody
 * @returns {Promise<Rent>}
 */
const updateRent = async (rentId, updateBody) => {
  const rent = await getRentById(rentId);
  if (updateBody.tenantId) {
    const tenant = await Tenant.findByPk(updateBody.tenantId);
    if (!tenant) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Tenant not found');
    }
  }
  if (updateBody.unitId) {
    const unit = await Unit.findByPk(updateBody.unitId);
    if (!unit) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Unit not found');
    }
  }
  await rent.update(updateBody);
  return rent;
};

/**
 * Delete rent record by id
 * @param {string} rentId
 * @returns {Promise<void>}
 */
const deleteRent = async (rentId) => {
  const rent = await getRentById(rentId);
  await rent.destroy();
};

module.exports = {
  createRent,
  getAllRents,
  getRentById,
  updateRent,
  deleteRent,
};
