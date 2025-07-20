const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { Property, MeterCharge, UtilityType } = require('../models');
/**
 * Create a new expense with validation and transaction
 * @param {Object} meterChargeBody - { accountId, propertyId, expenseType, amount, description, expenseDate }
 * @returns {Promise<MeterCharge>}
 */
const createMeterCharge = async (meterChargeBody) => {
  const { accountId, propertyId, category, amount, description, expenseDate, meterId } = meterChargeBody;

  // Validate foreign keys
  if (meterChargeBody.propertyId) {
    const property = await Property.findByPk(meterChargeBody.propertyId);
    if (!property) {
      throw new ApiError(httpStatus.NOT_FOUND, 'property not found');
    }
  }

  // Create expense and update bill in a transaction
  const meterCharge = await MeterCharge.sequelize.transaction(async (t) => {
    const createdMeterCharge = await MeterCharge.create(
      {
        accountId,
        meterId,
        propertyId: propertyId || null,
        amount,
        expenseDate,
        category: category || 'Utility',
        description: description || null,
        isDeleted: false,
      },
      { transaction: t }
    );

    return createdMeterCharge;
  });

  return meterCharge;
};

/**
 * Query for all Meter Charge matching a filter
 * @param {Object} filter - Sequelize filter
 * @param {Object} options - { sortBy, limit, page, include? }
 * @returns {Promise<{ results: MeterCharge[], page: number, limit: number, totalPages: number, totalResults: number }>}
 */

const getAllMeterCharge = async (filter, options, deleted = 'false') => {
  const whereClause = { ...filter };
  // console.log('whereClause',UtilityType.id)
  // Apply the isDeleted filter based on the 'deleted' parameter
  if (deleted === 'true') {
    whereClause.isDeleted = true;
  } else if (deleted === 'false') {
    whereClause.isDeleted = false;
  } else if (deleted === 'all') {
    // No filter on isDeleted, allowing all bills to be returned
  } else {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid value for deleted parameter');
  }

  const limit = options.limit && parseInt(options.limit, 10) > 0 ? parseInt(options.limit, 10) : 10;
  const page = options.page && parseInt(options.page, 10) > 0 ? parseInt(options.page, 10) : 1;
  const offset = (page - 1) * limit;

  // Sorting
  const sort = [];
  if (options.sortBy) {
    const [field, order] = options.sortBy.split(':');
    sort.push([field, order?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC']);
  }

  // Clone include to avoid mutating options
  const include = options.include || [];

  const { count, rows } = await MeterCharge.findAndCountAll({
    where: whereClause,
    limit,
    offset,
    order: sort.length ? sort : [['createdAt', 'DESC']],
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
 * Get Meter Charge by ID
 * @param {string} id - Meter Charge UUID
 * @param {Array} [include=[]] - Array of objects specifying models and attributes to include
 * @returns {Promise<MeterCharge>}
 */

const getMeterCharge = async (id, include = []) => {
  const meterCharge = await MeterCharge.findByPk(id, { include });
  if (!meterCharge) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Meter Charge not found');
  }
  return meterCharge;
};

/**
 * Update tenant by id with validation
 * @param {string} meterChargeId
 * @param {Object} updateBody
 * @returns {Promise<Lease>}
 */
const updateMeterCharge = async (meterChargeId, updateBody) => {
  const meterCharge = await getMeterCharge(meterChargeId);

  // Validate unitId if provided
  if (updateBody.propertyId) {
    const property = await Property.findByPk(updateBody.propertyId);
    if (!property) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Property not found');
    }
  }

  await meterCharge.update(updateBody);
  return meterCharge;
};

/**
 * Soft delete tenant by id (set status to inactive)
 * @param {string} meterChargeId
 * @returns {Promise<void>}
 */
const deleteMeterCharge = async (meterChargeId) => {
  const lease = await getMeterCharge(meterChargeId);
  if (lease.isDeleted) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Meter Charge is already inactive');
  }
  await lease.update({ isDeleted: true });
};
const restoreMeterCharge = async (meterChargeId) => {
  const lease = await getMeterCharge(meterChargeId);
  if (!lease.isDeleted) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Meter Charge is already inactive');
  }
  await lease.update({ isDeleted: false });
};

/**
 * Permanently delete tenant by id (hard delete)
 * @param {string} meterChargeId
 * @returns {Promise<void>}
 */
const hardDeleteMeterCharge = async (meterChargeId) => {
  const lease = await getMeterCharge(meterChargeId);
  await lease.destroy();
};

module.exports = {
  createMeterCharge,
  getAllMeterCharge,
  getMeterCharge,
  updateMeterCharge,
  deleteMeterCharge,
  restoreMeterCharge,
  hardDeleteMeterCharge,
};
