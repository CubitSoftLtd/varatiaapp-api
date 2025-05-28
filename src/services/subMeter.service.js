const httpStatus = require('http-status');
const { SubMeter, Meter, Unit } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a sub-meter
 * @param {number} meterId
 * @param {number} unitId
 * @param {Object} subMeterBody
 * @returns {Promise<SubMeter>}
 */
const createSubMeter = async (meterId, unitId, subMeterBody) => {
  const meter = await Meter.findByPk(meterId);
  if (!meter) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Meter not found');
  }
  const unit = await Unit.findByPk(unitId);
  if (!unit) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Unit not found');
  }
  return SubMeter.create({ ...subMeterBody, meterId, unitId });
};

/**
 * Query for sub-meters
 * @param {number} unitId
 * @param {Object} filter - Sequelize filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<{ results: SubMeter[], page: number, limit: number, totalPages: number, totalResults: number }>}
 */
const getAllSubMeters = async (unitId, filter, options) => {
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

  const { count, rows } = await SubMeter.findAndCountAll({
    where: { ...filter, unitId },
    limit,
    offset,
    order: sort.length ? sort : [['createdAt', 'DESC']],
    include: [{ model: Meter }, { model: Unit }],
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
 * @returns {Promise<SubMeter>}
 */
const getSubMeterById = async (id) => {
  const subMeter = await SubMeter.findByPk(id, { include: [{ model: Meter }, { model: Unit }] });
  if (!subMeter) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Sub-meter not found');
  }
  return subMeter;
};

/**
 * Update sub-meter by id
 * @param {number} subMeterId
 * @param {Object} updateBody
 * @returns {Promise<SubMeter>}
 */
const updateSubMeter = async (subMeterId, updateBody) => {
  const subMeter = await getSubMeterById(subMeterId);
  await subMeter.update(updateBody);
  return subMeter;
};

/**
 * Delete sub-meter by id
 * @param {number} subMeterId
 * @returns {Promise<void>}
 */
const deleteSubMeter = async (subMeterId) => {
  const subMeter = await getSubMeterById(subMeterId);
  await subMeter.destroy();
};

module.exports = {
  createSubMeter,
  getAllSubMeters,
  getSubMeterById,
  updateSubMeter,
  deleteSubMeter,
};
