const httpStatus = require('http-status');
const { MeterReading, Meter, Unit } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a meter reading
 * @param {Object} meterReadingBody
 * @returns {Promise<MeterReading>}
 */
const createMeterReading = async (meterReadingBody) => {
  if (meterReadingBody.meterId) {
    const meter = await Meter.findByPk(meterReadingBody.meterId);
    if (!meter) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Meter not found');
    }
  }
  return MeterReading.create(meterReadingBody);
};

/**
 * Query for meter readings
 * @param {Object} filter - Sequelize filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<{ results: MeterReading[], page: number, limit: number, totalPages: number, totalResults: number }>}
 */
const getAllMeterReadings = async (filter, options) => {
  const limit = options.limit && parseInt(options.limit, 10) > 0 ? parseInt(options.limit, 10) : 10;
  const page = options.page && parseInt(options.page, 10) > 0 ? parseInt(options.page, 10) : 1;
  const offset = (page - 1) * limit;

  const sort = [];
  if (options.sortBy) {
    const [field, order] = options.sortBy.split(':');
    sort.push([field, order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC']);
  }

  const { count, rows } = await MeterReading.findAndCountAll({
    where: filter,
    limit,
    offset,
    order: sort.length ? sort : [['readingDate', 'DESC']],
    include: [{ model: Meter, as: 'Meter', include: [{ model: Unit, as: 'Unit' }] }],
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
 * Get meter reading by id
 * @param {string} id
 * @returns {Promise<MeterReading>}
 */
const getMeterReadingById = async (id) => {
  const meterReading = await MeterReading.findByPk(id, {
    include: [{ model: Meter, as: 'Meter', include: [{ model: Unit, as: 'Unit' }] }],
  });
  if (!meterReading) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Meter reading not found');
  }
  return meterReading;
};

/**
 * Update meter reading by id
 * @param {string} meterReadingId
 * @param {Object} updateBody
 * @returns {Promise<MeterReading>}
 */
const updateMeterReading = async (meterReadingId, updateBody) => {
  const meterReading = await getMeterReadingById(meterReadingId);
  if (updateBody.meterId) {
    const meter = await Meter.findByPk(updateBody.meterId);
    if (!meter) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Meter not found');
    }
  }
  await meterReading.update(updateBody);
  return meterReading;
};

/**
 * Delete meter reading by id
 * @param {string} meterReadingId
 * @returns {Promise<void>}
 */
const deleteMeterReading = async (meterReadingId) => {
  const meterReading = await getMeterReadingById(meterReadingId);
  await meterReading.destroy();
};

module.exports = {
  createMeterReading,
  getAllMeterReadings,
  getMeterReadingById,
  updateMeterReading,
  deleteMeterReading,
};
