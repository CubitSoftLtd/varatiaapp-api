const httpStatus = require('http-status');
const { Op } = require('sequelize');
const { MeterReading, Meter, Submeter, User } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a meter reading with validation, transaction, and consumption calculation
 * @param {Object} meterReadingBody - { meterId?, submeterId?, readingValue, readingDate, enteredByUserId?, consumption? }
 * @returns {Promise<MeterReading>}
 */
const createMeterReading = async (meterReadingBody) => {
  const { meterId, submeterId, readingValue, readingDate, enteredByUserId, consumption } = meterReadingBody;

  // Validate mutual exclusivity of meterId and submeterId
  if ((meterId && submeterId) || (!meterId && !submeterId)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Exactly one of meterId or submeterId must be provided');
  }

  // Validate foreign keys
  if (meterId) {
    const meter = await Meter.findByPk(meterId);
    if (!meter) {
      throw new ApiError(httpStatus.NOT_FOUND, `Meter not found for ID: ${meterId}`);
    }
  }

  if (submeterId) {
    const submeter = await Submeter.findByPk(submeterId);
    if (!submeter) {
      throw new ApiError(httpStatus.NOT_FOUND, `Submeter not found for ID: ${submeterId}`);
    }
  }

  if (enteredByUserId) {
    const user = await User.findByPk(enteredByUserId);
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, `User not found for ID: ${enteredByUserId}`);
    }
  }

  // Validate readingValue
  if (readingValue < 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Reading value cannot be negative');
  }

  // Check for duplicate reading on the same date
  const existingReading = await MeterReading.findOne({
    where: {
      [Op.or]: [{ meterId }, { submeterId }],
      readingDate,
      isDeleted: false,
    },
  });
  if (existingReading) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'A reading already exists for this meter/submeter on this date');
  }

  // Calculate consumption if not provided
  let calculatedConsumption = consumption;
  if (!consumption) {
    const previousReading = await MeterReading.findOne({
      where: {
        [Op.or]: [{ meterId }, { submeterId }],
        readingDate: { [Op.lt]: readingDate },
        isDeleted: false,
      },
      order: [['readingDate', 'DESC']],
    });

    if (previousReading) {
      calculatedConsumption = parseFloat(readingValue) - parseFloat(previousReading.readingValue);
      if (calculatedConsumption < 0) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Calculated consumption cannot be negative. Check reading value.');
      }
    }
  }

  // Create meter reading in a transaction
  const meterReading = await MeterReading.sequelize.transaction(async (t) => {
    return MeterReading.create(
      {
        meterId: meterId || null,
        submeterId: submeterId || null,
        readingValue,
        readingDate,
        consumption: calculatedConsumption || null,
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
  const limit = options.limit && parseInt(options.limit, 10) > 0 ? parseInt(options.limit, 10) : 10;
  const page = options.page && parseInt(options.page, 10) > 0 ? parseInt(options.page, 10) : 1;
  const offset = (page - 1) * limit;

  const sort = [];
  if (options.sortBy) {
    const [field, order] = options.sortBy.split(':');
    sort.push([field, order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC']);
  }

  // Use provided include or default to empty array
  const include = options.include || [];

  const { count, rows } = await MeterReading.findAndCountAll({
    where: { ...filter, isDeleted: false },
    limit,
    offset,
    order: sort.length ? sort : [['readingDate', 'DESC']],
    include,
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
 * Get meter reading by ID
 * @param {string} id - Meter reading UUID
 * @param {Array} [include=[]] - Array of objects specifying models and attributes to include
 * @returns {Promise<MeterReading>}
 */
const getMeterReadingById = async (id, include = []) => {
  const meterReading = await MeterReading.findByPk(id, { include });
  if (!meterReading || meterReading.isDeleted) {
    throw new ApiError(httpStatus.NOT_FOUND, `Meter reading not found for ID: ${id}`);
  }
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
  const { meterId, submeterId, readingValue, readingDate, enteredByUserId, consumption } = updateBody;

  // Validate mutual exclusivity of meterId and submeterId
  const newMeterId = meterId !== undefined ? meterId : meterReading.meterId;
  const newSubmeterId = submeterId !== undefined ? submeterId : meterReading.submeterId;
  if ((newMeterId && newSubmeterId) || (!newMeterId && !newSubmeterId)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Exactly one of meterId or submeterId must be provided');
  }

  // Validate foreign keys if provided
  if (meterId && meterId !== meterReading.meterId) {
    const meter = await Meter.findByPk(meterId);
    if (!meter) {
      throw new ApiError(httpStatus.NOT_FOUND, `Meter not found for ID: ${meterId}`);
    }
  }

  if (submeterId && submeterId !== meterReading.submeterId) {
    const submeter = await Submeter.findByPk(submeterId);
    if (!submeter) {
      throw new ApiError(httpStatus.NOT_FOUND, `Submeter not found for ID: ${submeterId}`);
    }
  }

  if (enteredByUserId !== undefined && enteredByUserId !== meterReading.enteredByUserId) {
    if (enteredByUserId) {
      const user = await User.findByPk(enteredByUserId);
      if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, `User not found for ID: ${enteredByUserId}`);
      }
    }
  }

  // Validate readingValue if provided
  if (readingValue !== undefined && readingValue < 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Reading value cannot be negative');
  }

  // Check for duplicate reading on the same date if readingDate or meterId/submeterId changes
  if (readingDate || meterId !== undefined || submeterId !== undefined) {
    const checkDate = readingDate || meterReading.readingDate;
    const checkMeterId = newMeterId || null;
    const checkSubmeterId = newSubmeterId || null;
    const existingReading = await MeterReading.findOne({
      where: {
        id: { [Op.ne]: meterReadingId },
        [Op.or]: [{ meterId: checkMeterId }, { submeterId: checkSubmeterId }],
        readingDate: checkDate,
        isDeleted: false,
      },
    });
    if (existingReading) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'A reading already exists for this meter/submeter on this date');
    }
  }

  // Update in a transaction
  await MeterReading.sequelize.transaction(async (t) => {
    await meterReading.update(
      {
        meterId: meterId !== undefined ? meterId : meterReading.meterId,
        submeterId: submeterId !== undefined ? submeterId : meterReading.submeterId,
        readingValue: readingValue !== undefined ? readingValue : meterReading.readingValue,
        readingDate: readingDate !== undefined ? readingDate : meterReading.readingDate,
        consumption: consumption !== undefined ? consumption : meterReading.consumption,
        enteredByUserId: enteredByUserId !== undefined ? enteredByUserId : meterReading.enteredByUserId,
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
  if (meterReading.isDeleted) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Meter reading is already deleted');
  }
  await meterReading.update({ isDeleted: true });
};

/**
 * Hard delete a meter reading by ID
 * @param {string} meterReadingId - Meter reading UUID
 * @returns {Promise<void>}
 */
const hardDeleteMeterReading = async (meterReadingId) => {
  const meterReading = await getMeterReadingById(meterReadingId);
  await meterReading.destroy();
};

/**
 * Calculate consumption for a meter or submeter between two dates
 * @param {string} meterId - Meter UUID (optional)
 * @param {string} submeterId - Submeter UUID (optional)
 * @param {Date} startDate - Start date for consumption calculation
 * @param {Date} endDate - End date for consumption calculation
 * @returns {Promise<number>} - Calculated consumption
 */
const calculateConsumption = async (meterId, submeterId, startDate, endDate) => {
  // Validate mutual exclusivity
  if ((meterId && submeterId) || (!meterId && !submeterId)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Exactly one of meterId or submeterId must be provided');
  }

  // Validate dates
  if (startDate >= endDate) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Start date must be before end date');
  }

  // Validate foreign key
  if (meterId) {
    const meter = await Meter.findByPk(meterId);
    if (!meter) {
      throw new ApiError(httpStatus.NOT_FOUND, `Meter not found for ID: ${meterId}`);
    }
  }

  if (submeterId) {
    const submeter = await Submeter.findByPk(submeterId);
    if (!submeter) {
      throw new ApiError(httpStatus.NOT_FOUND, `Submeter not found for ID: ${submeterId}`);
    }
  }

  // Find the most recent reading on or before startDate
  const startReading = await MeterReading.findOne({
    where: {
      [Op.or]: [{ meterId }, { submeterId }],
      readingDate: { [Op.lte]: startDate },
      isDeleted: false,
    },
    order: [['readingDate', 'DESC']],
  });

  // Find the most recent reading on or before endDate
  const endReading = await MeterReading.findOne({
    where: {
      [Op.or]: [{ meterId }, { submeterId }],
      readingDate: { [Op.lte]: endDate },
      isDeleted: false,
    },
    order: [['readingDate', 'DESC']],
  });

  // If no readings are found, return 0 consumption
  if (!startReading || !endReading) {
    return 0;
  }

  // Calculate consumption
  const calculatedConsumption = parseFloat(endReading.readingValue) - parseFloat(startReading.readingValue);
  if (calculatedConsumption < 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Consumption cannot be negative. Check reading dates and values.');
  }

  // Update consumption in the endReading record in a transaction
  await MeterReading.sequelize.transaction(async (t) => {
    await endReading.update({ consumption: calculatedConsumption }, { transaction: t });
  });

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
