const httpStatus = require('http-status');
const { Submeter, Meter, Unit } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a sub-meter
 * @param {number} meterId
 * @param {number} unitId
 * @param {Object} submeterBody
 * @returns {Promise<Submeter>}
 */
const createSubmeter = async (submeterBody) => {
  // Check if the meter exists
  const meter = await Meter.findByPk(submeterBody.meterId);
  if (!meter) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Meter not found');
  }

  // Check if the unit exists
  const unit = await Unit.findByPk(submeterBody.unitId);
  if (!unit) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Unit not found');
  }

  // Create submeter
  try {
    const submeter = await Submeter.create({
      meterId: submeterBody.meterId,
      unitId: submeterBody.unitId,
      submeterNumber: submeterBody.submeterNumber,
      status: submeterBody.status || 'active',
    });
    return submeter;
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Sub Meter number already exists');
    }
    throw error;
  }
};

/**
 * Query for sub-meters
 * @param {number} unitId
 * @param {Object} filter - Sequelize filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<{ results: Submeter[], page: number, limit: number, totalPages: number, totalResults: number }>}
 */
const getAllSubmeters = async (filter, options) => {
  const limit = options.limit && parseInt(options.limit, 10) > 0 ? parseInt(options.limit, 10) : 10;
  const page = options.page && parseInt(options.page, 10) > 0 ? parseInt(options.page, 10) : 1;
  const offset = (page - 1) * limit;

  const sort = [];
  if (options.sortBy) {
    const [field, order] = options.sortBy.split(':');
    sort.push([field, order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC']);
  }

  const { count, rows } = await Submeter.findAndCountAll({
    where: filter,
    limit,
    offset,
    order: sort.length ? sort : [['createdAt', 'DESC']],
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
 * Get sub-meter by id
 * @param {number} id
 * @returns {Promise<Submeter>}
 */
const getSubmeterById = async (id) => {
  const submeter = await Submeter.findByPk(id);
  if (!submeter) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Sub-meter not found');
  }
  return submeter;
};

/**
 * Update sub-meter by id
 * @param {number} submeterId
 * @param {Object} updateBody
 * @returns {Promise<Submeter>}
 */
const updateSubmeter = async (submeterId, updateBody) => {
  const submeter = await getSubmeterById(submeterId);
  await submeter.update(updateBody);
  return submeter;
};

/**
 * Delete sub-meter by id
 * @param {number} submeterId
 * @returns {Promise<void>}
 */
const deleteSubmeter = async (submeterId) => {
  const submeter = await getSubmeterById(submeterId);
  await submeter.destroy();
};

module.exports = {
  createSubmeter,
  getAllSubmeters,
  getSubmeterById,
  updateSubmeter,
  deleteSubmeter,
};
