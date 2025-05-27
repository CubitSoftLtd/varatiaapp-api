const httpStatus = require('http-status');
const { Meter, Property } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a meter
 * @param {number} propertyId
 * @param {Object} meterBody
 * @returns {Promise<Meter>}
 */
const createMeter = async (propertyId, meterBody) => {
  const property = await Property.findByPk(propertyId);
  if (!property) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Property not found');
  }
  return Meter.create({ ...meterBody, propertyId });
};

/**
 * Query for meters
 * @param {number} propertyId
 * @param {Object} filter - Sequelize filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<{ results: Meter[], page: number, limit: number, totalPages: number, totalResults: number }>}
 */
const getAllMeters = async (propertyId, filter, options) => {
  const property = await Property.findByPk(propertyId);
  if (!property) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Property not found');
  }
  const limit = options.limit && parseInt(options.limit, 10) > 0 ? parseInt(options.limit, 10) : 10;
  const page = options.page && parseInt(options.page, 10) > 0 ? parseInt(options.page, 10) : 1;
  const offset = (page - 1) * limit;

  const sort = [];
  if (options.sortBy) {
    const [field, order] = options.sortBy.split(':');
    sort.push([field, order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC']);
  }

  const { count, rows } = await Meter.findAndCountAll({
    where: { ...filter, propertyId },
    limit,
    offset,
    order: sort.length ? sort : [['createdAt', 'DESC']],
    include: [{ model: Property }],
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
 * Get meter by id
 * @param {number} id
 * @returns {Promise<Meter>}
 */
const getMeterById = async (id) => {
  const meter = await Meter.findByPk(id, { include: [{ model: Property }] });
  if (!meter) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Meter not found');
  }
  return meter;
};

/**
 * Update meter by id
 * @param {number} meterId
 * @param {Object} updateBody
 * @returns {Promise<Meter>}
 */
const updateMeter = async (meterId, updateBody) => {
  const meter = await getMeterById(meterId);
  await meter.update(updateBody);
  return meter;
};

/**
 * Delete meter by id
 * @param {number} meterId
 * @returns {Promise<void>}
 */
const deleteMeter = async (meterId) => {
  const meter = await getMeterById(meterId);
  await meter.destroy();
};

module.exports = {
  createMeter,
  getAllMeters,
  getMeterById,
  updateMeter,
  deleteMeter,
};
