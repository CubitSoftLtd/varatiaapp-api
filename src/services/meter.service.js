const httpStatus = require('http-status');
const { Meter, Property, Unit, UtilityType } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a meter
 * @param {Object} meterBody
 * @returns {Promise<Meter>}
 */
const createMeter = async (propertyId, meterBody) => {
  // eslint-disable-next-line no-console
  console.log(propertyId);
  // eslint-disable-next-line no-console
  console.log(meterBody);

  // Validate propertyId
  const property = await Property.findByPk(meterBody.propertyId);
  if (!property) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Property not found');
  }

  // Validate utilityTypeId
  const utilityType = await UtilityType.findByPk(meterBody.utilityTypeId);
  if (!utilityType) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Utility type not found');
  }

  // Verify propertyId from params matches body
  if (propertyId !== meterBody.propertyId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Property ID in URL and body must match');
  }

  // Create meter
  try {
    const meter = await Meter.create({
      number: meterBody.number,
      propertyId: meterBody.propertyId,
      utilityTypeId: meterBody.utilityTypeId,
      status: meterBody.status || 'active',
    });
    return meter;
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Meter number already exists');
    }
    throw error;
  }
};

/**
 * Query for meters
 * @param {Object} filter - Sequelize filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<{ results: Meter[], page: number, limit: number, totalPages: number, totalResults: number }>}
 */
const getAllMeters = async (filter, options) => {
  const limit = options.limit && parseInt(options.limit, 10) > 0 ? parseInt(options.limit, 10) : 10;
  const page = options.page && parseInt(options.page, 10) > 0 ? parseInt(options.page, 10) : 1;
  const offset = (page - 1) * limit;

  const sort = [];
  if (options.sortBy) {
    const [field, order] = options.sortBy.split(':');
    sort.push([field, order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC']);
  }

  const { count, rows } = await Meter.findAndCountAll({
    where: filter,
    limit,
    offset,
    order: sort.length ? sort : [['createdAt', 'DESC']],
    include: [{ model: Unit, as: 'Unit' }],
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
 * @param {string} id
 * @returns {Promise<Meter>}
 */
const getMeterById = async (id) => {
  const meter = await Meter.findByPk(id, {
    include: [{ model: Unit, as: 'Unit' }],
  });
  if (!meter) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Meter not found');
  }
  return meter;
};

/**
 * Update meter by id
 * @param {string} meterId
 * @param {Object} updateBody
 * @returns {Promise<Meter>}
 */
const updateMeter = async (meterId, updateBody) => {
  const meter = await getMeterById(meterId);
  if (updateBody.unitId) {
    const unit = await Unit.findByPk(updateBody.unitId);
    if (!unit) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Unit not found');
    }
  }
  await meter.update(updateBody);
  return meter;
};

/**
 * Delete meter by id
 * @param {string} meterId
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
