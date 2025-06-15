const httpStatus = require('http-status');
const { Op } = require('sequelize');
const { MeterReading, Meter, Submeter, User } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Validates existence of Meter, Submeter, and User.
 * @param {string} [meterId] - Meter UUID
 * @param {string} [submeterId] - Submeter UUID
 * @param {string} [enteredByUserId] - User UUID
 * @throws {ApiError} If any ID is not found.
 */
const validateRelatedEntities = async (meterId, submeterId, enteredByUserId) => {
  if (meterId) {
    const meter = await Meter.findByPk(meterId);
    if (!meter) throw new ApiError(httpStatus.NOT_FOUND, `Meter with ID '${meterId}' not found.`);
  }
  if (submeterId) {
    const submeter = await Submeter.findByPk(submeterId);
    if (!submeter) throw new ApiError(httpStatus.NOT_FOUND, `Submeter with ID '${submeterId}' not found.`);
    // Optional: Validate submeter belongs to meter
    // if (meterId && submeter.meterId !== meterId) throw new ApiError(httpStatus.BAD_REQUEST, 'Submeter does not belong to the specified meter.');
  }
  if (enteredByUserId) {
    const user = await User.findByPk(enteredByUserId);
    if (!user) throw new ApiError(httpStatus.NOT_FOUND, `User with ID '${enteredByUserId}' not found.`);
  }
};

/**
 * Checks for existing meter reading duplicates based on provided criteria.
 * @param {Object} params - { readingDate, meterId, submeterId, excludeId }
 * @param {string} params.readingDate - Reading date
 * @param {string} [params.meterId] - Meter UUID
 * @param {string} [params.submeterId] - Submeter UUID
 * @param {string} [params.excludeId] - Optional ID to exclude from check
 * @returns {Promise<boolean>} True if a duplicate exists, false otherwise.
 */
const checkDuplicateReading = async ({ readingDate, meterId, submeterId, excludeId = null }) => {
  const whereClause = {
    readingDate,
    isDeleted: false,
  };

  // Define uniqueness based on meter or submeter context
  if (submeterId) {
    whereClause.meterId = meterId;
    whereClause.submeterId = submeterId;
  } else {
    whereClause.meterId = meterId;
    whereClause.submeterId = null;
  }

  if (excludeId) whereClause.id = { [Op.ne]: excludeId };

  const existingReading = await MeterReading.findOne({ where: whereClause });
  return !!existingReading;
};

/**
 * Create a meter reading with validation, transaction, and consumption calculation
 * @param {Object} meterReadingBody - { accountId, meterId, submeterId?, readingValue, readingDate, enteredByUserId?, consumption? }
 * @returns {Promise<MeterReading>}
 */
const createMeterReading = async (meterReadingBody) => {
  const { accountId, meterId, submeterId, readingValue, readingDate, enteredByUserId, consumption } = meterReadingBody;

  // 1. Basic input validation
  if (!meterId && !submeterId) throw new ApiError(httpStatus.BAD_REQUEST, 'At least meterId must be provided.');
  if (submeterId && !meterId) throw new ApiError(httpStatus.BAD_REQUEST, 'meterId is required when submeterId is provided.');
  if (readingValue == null) throw new ApiError(httpStatus.BAD_REQUEST, 'Reading value is required.');
  if (readingValue < 0) throw new ApiError(httpStatus.BAD_REQUEST, 'Reading value cannot be negative.');
  if (!readingDate) throw new ApiError(httpStatus.BAD_REQUEST, 'Reading date is required.');

  // 2. Validate foreign keys
  await validateRelatedEntities(meterId, submeterId, enteredByUserId);

  // 3. Check for duplicate reading
  const isDuplicate = await checkDuplicateReading({ meterId, submeterId, readingDate });
  if (isDuplicate)
    throw new ApiError(httpStatus.BAD_REQUEST, `A reading already exists for this meter/submeter on this date.`);

  // 4. Calculate consumption if not provided
  let calculatedConsumption = consumption;
  if (consumption == null) {
    const prevWhereClause = { isDeleted: false, readingDate: { [Op.lt]: readingDate } };
    if (meterId) prevWhereClause.meterId = meterId;
    if (submeterId) prevWhereClause.submeterId = submeterId;

    const previousReading = await MeterReading.findOne({
      where: prevWhereClause,
      order: [
        ['readingDate', 'DESC'],
        ['createdAt', 'DESC'],
      ],
    });

    if (previousReading && previousReading.readingValue > readingValue) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Reading value cannot be less than the previous reading value.');
    }
    calculatedConsumption = previousReading ? parseFloat(readingValue) - parseFloat(previousReading.readingValue) : 0;
  }

  // 5. Create in transaction
  const meterReading = await MeterReading.sequelize.transaction(async (t) => {
    return MeterReading.create(
      {
        accountId,
        meterId: meterId || null,
        submeterId: submeterId || null,
        readingValue,
        readingDate,
        consumption: calculatedConsumption,
        enteredByUserId: enteredByUserId || null,
        isDeleted: false,
      },
      { transaction: t }
    );
  });

  return meterReading;
};

/**
 * Query for all meter readings with pagination, sorting, and optional inclusion
 * @param {Object} filter - Sequelize filter
 * @param {Object} options - { sortBy, limit, page, include? }
 * @returns {Promise<{ results: MeterReading[], page: number, limit: number, totalPages: number, totalResults: number }>}
 */
const getAllMeterReadings = async (filter, options) => {
  const { limit = 10, page = 1, sortBy, include = [] } = options;
  const offset = (page - 1) * limit;

  const order = sortBy
    ? [[...sortBy.split(':'), 'ASC']]
    : [
        ['readingDate', 'DESC'],
        ['createdAt', 'DESC'],
      ];
  const { count, rows } = await MeterReading.findAndCountAll({
    where: { ...filter, isDeleted: false },
    limit,
    offset,
    order,
    include,
  });

  return { results: rows, page, limit, totalPages: Math.ceil(count / limit), totalResults: count };
};

/**
 * Get meter reading by ID
 * @param {string} id - Meter reading UUID
 * @param {Array} [include=[]] - Include options
 * @returns {Promise<MeterReading>}
 */
const getMeterReadingById = async (id, include = []) => {
  if (!id) throw new ApiError(httpStatus.BAD_REQUEST, 'Meter reading ID is required.');
  const meterReading = await MeterReading.findByPk(id, { include });
  if (!meterReading || meterReading.isDeleted)
    throw new ApiError(httpStatus.NOT_FOUND, `Meter reading with ID '${id}' not found or is deleted.`);
  return meterReading;
};

/**
 * Update an existing meter reading by ID
 * @param {string} meterReadingId - Meter reading UUID
 * @param {Object} updateBody - { meterId?, submeterId?, readingValue?, readingDate?, consumption?, enteredByUserId? }
 * @returns {Promise<MeterReading>}
 */
const updateMeterReading = async (meterReadingId, updateBody) => {
  const meterReading = await getMeterReadingById(meterReadingId);
  const { meterId, submeterId, readingValue, readingDate, consumption, enteredByUserId } = updateBody;

  const newMeterId = meterId ?? meterReading.meterId;
  const newSubmeterId = submeterId ?? meterReading.submeterId;
  const newReadingDate = readingDate ?? meterReading.readingDate;

  if (!newMeterId && !newSubmeterId) throw new ApiError(httpStatus.BAD_REQUEST, 'At least meterId must be provided.');
  if (newSubmeterId && !newMeterId)
    throw new ApiError(httpStatus.BAD_REQUEST, 'meterId is required when submeterId is provided.');
  if (readingValue != null && readingValue < 0)
    throw new ApiError(httpStatus.BAD_REQUEST, 'Reading value cannot be negative.');

  await validateRelatedEntities(meterId, submeterId, enteredByUserId);

  if (readingDate || meterId != null || submeterId != null) {
    const isDuplicate = await checkDuplicateReading({
      meterId: newMeterId,
      submeterId: newSubmeterId,
      readingDate: newReadingDate,
      excludeId: meterReadingId,
    });
    if (isDuplicate)
      throw new ApiError(httpStatus.BAD_REQUEST, `A reading already exists for this meter/submeter on this date.`);
  }

  let updatedConsumption = consumption ?? meterReading.consumption;
  if (consumption == null && (readingValue != null || readingDate != null || meterId != null || submeterId != null)) {
    const prevWhereClause = { isDeleted: false, readingDate: { [Op.lt]: newReadingDate } };
    if (newMeterId) prevWhereClause.meterId = newMeterId;
    if (newSubmeterId) prevWhereClause.submeterId = newSubmeterId;

    const previousReading = await MeterReading.findOne({
      where: { ...prevWhereClause, id: { [Op.ne]: meterReadingId } },
      order: [
        ['readingDate', 'DESC'],
        ['createdAt', 'DESC'],
      ],
    });

    const effectiveReadingValue = readingValue ?? meterReading.readingValue;
    if (previousReading && previousReading.readingValue > effectiveReadingValue) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Reading value cannot be less than the previous reading value.');
    }
    updatedConsumption = previousReading ? parseFloat(effectiveReadingValue) - parseFloat(previousReading.readingValue) : 0;
  }

  await MeterReading.sequelize.transaction(async (t) => {
    await meterReading.update(
      {
        meterId: newMeterId,
        submeterId: newSubmeterId,
        readingValue: readingValue ?? meterReading.readingValue,
        readingDate: newReadingDate,
        consumption: updatedConsumption,
        enteredByUserId: enteredByUserId ?? meterReading.enteredByUserId,
      },
      { transaction: t }
    );
  });

  return meterReading;
};

/**
 * Soft delete a meter reading by ID
 * @param {string} meterReadingId - Meter reading UUID
 * @returns {Promise<void>}
 */
const deleteMeterReading = async (meterReadingId) => {
  const meterReading = await getMeterReadingById(meterReadingId);
  await meterReading.update({ isDeleted: true });
};

/**
 * Hard delete a meter reading by ID
 * @param {string} meterReadingId - Meter reading UUID
 * @returns {Promise<void>}
 */
const hardDeleteMeterReading = async (meterReadingId) => {
  const meterReading = await MeterReading.findByPk(meterReadingId);
  if (!meterReading) throw new ApiError(httpStatus.NOT_FOUND, `Meter reading with ID '${meterReadingId}' not found.`);
  await meterReading.destroy();
};

/**
 * Calculate consumption for a meter or submeter between two dates
 * @param {string} [meterId] - Meter UUID
 * @param {string} [submeterId] - Submeter UUID
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Promise<number>} Calculated consumption
 */
const calculateConsumption = async (meterId, submeterId, startDate, endDate) => {
  if (!meterId && !submeterId) throw new ApiError(httpStatus.BAD_REQUEST, 'At least meterId must be provided.');
  if (submeterId && !meterId) throw new ApiError(httpStatus.BAD_REQUEST, 'meterId is required when submeterId is provided.');
  if (!startDate || !endDate) throw new ApiError(httpStatus.BAD_REQUEST, 'Start date and end date are required.');
  if (new Date(startDate) >= new Date(endDate))
    throw new ApiError(httpStatus.BAD_REQUEST, 'Start date must be before end date.');

  await validateRelatedEntities(meterId, submeterId);

  const startReading = await MeterReading.findOne({
    where: {
      readingDate: { [Op.gte]: startDate },
      isDeleted: false,
      [Op.or]: [
        { meterId, submeterId: null },
        { meterId, submeterId },
      ],
    },
    order: [
      ['readingDate', 'ASC'],
      ['createdAt', 'ASC'],
    ],
  });

  const endReading = await MeterReading.findOne({
    where: {
      readingDate: { [Op.lte]: endDate },
      isDeleted: false,
      [Op.or]: [
        { meterId, submeterId: null },
        { meterId, submeterId },
      ],
    },
    order: [
      ['readingDate', 'DESC'],
      ['createdAt', 'DESC'],
    ],
  });

  if (!startReading || !endReading) return 0;

  const calculatedConsumption = parseFloat(endReading.readingValue) - parseFloat(startReading.readingValue);
  if (calculatedConsumption < 0) throw new ApiError(httpStatus.BAD_REQUEST, 'Calculated consumption cannot be negative.');

  return calculatedConsumption;
};

module.exports = {
  createMeterReading,
  getAllMeterReadings,
  getMeterReadingById,
  updateMeterReading,
  deleteMeterReading,
  hardDeleteMeterReading,
  calculateConsumption,
};
