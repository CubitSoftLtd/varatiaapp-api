const httpStatus = require('http-status');
const { Sequelize } = require('sequelize');
const { Meter, Property, UtilityType, Submeter } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a meter with validation and transaction
 * @param {Object} meterBody
 * @returns {Promise<Meter>}
 */
const createMeter = async (meterBody) => {
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

  // Check for existing meter with same number and propertyId
  const existingMeter = await Meter.findOne({
    where: {
      number: meterBody.number,
      propertyId: meterBody.propertyId,
    },
  });
  if (existingMeter) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Meter number already exists for this property');
  }

  // Use a transaction for creating the meter
  const meter = await Meter.sequelize.transaction(async (t) => {
    return Meter.create(
      {
        number: meterBody.number,
        propertyId: meterBody.propertyId,
        utilityTypeId: meterBody.utilityTypeId,
        status: meterBody.status || 'active',
        installedDate: meterBody.installedDate,
        lastReadingDate: meterBody.lastReadingDate,
        description: meterBody.description,
        accountId: meterBody.accountId,
        isDeleted: false,
      },
      { transaction: t }
    );
  });

  return meter;
};

/**
 * Query for meters with pagination, sorting, and optional inclusion of specific columns from associated models
 * @param {Object} filter - Sequelize filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @param {Array} [options.include] - Array of objects specifying models and attributes to include, e.g., [{ model: Property, as: 'property', attributes: ['id', 'name'] }]
 * @returns {Promise<{ results: Meter[], page: number, limit: number, totalPages: number, totalResults: number }>}
 */
const getAllMeters = async (filter, options, deleted = 'false') => {
  const whereClause = { ...filter };

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

  const sort = [];
  if (options.sortBy) {
    const [field, order] = options.sortBy.split(':');
    sort.push([field, order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC']);
  }

  // Use the provided include array or default to an empty array (no associations)
  const include = options.include || [];

  const { count, rows } = await Meter.findAndCountAll({
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
 * Get meter by id with optional inclusion of specific columns from associated models
 * @param {string} id
 * @param {Array} [include=[]] - Array of objects specifying models and attributes to include, e.g., [{ model: Property, as: 'property', attributes: ['id', 'name'] }]
 * @returns {Promise<Meter>}
 */
const getMeterById = async (id, include = []) => {
  const meter = await Meter.findByPk(id, { include });
  if (!meter) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Meter not found');
  }
  return meter;
};

/**
 * Update meter by id with validation
 * @param {string} meterId
 * @param {Object} updateBody
 * @returns {Promise<Meter>}
 */
const updateMeter = async (meterId, updateBody) => {
  const meter = await getMeterById(meterId);

  // Validate propertyId if provided
  if (updateBody.propertyId) {
    const property = await Property.findByPk(updateBody.propertyId);
    if (!property) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Property not found');
    }
  }

  // Validate utilityTypeId if provided
  if (updateBody.utilityTypeId) {
    const utilityType = await UtilityType.findByPk(updateBody.utilityTypeId);
    if (!utilityType) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Utility type not found');
    }
  }

  // Check for number uniqueness within property if either is updated
  if (updateBody.number || updateBody.propertyId) {
    const existingMeter = await Meter.findOne({
      where: {
        number: updateBody.number || meter.number,
        propertyId: updateBody.propertyId || meter.propertyId,
        id: { [Sequelize.Op.ne]: meterId },
      },
    });
    if (existingMeter) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Meter number already exists for this property');
    }
  }

  await meter.update(updateBody);
  return meter;
};

/**
 * Soft delete meter by id (set status to inactive)
 * @param {string} meterId
 * @returns {Promise<void>}
 */
// const deleteMeter = async (meterId) => {
//   const meter = await getMeterById(meterId);
//   if (meter.isDeleted) {
//     throw new ApiError(httpStatus.BAD_REQUEST, 'Meter is already inactive');
//   }
//   await meter.update({ status: 'inactive', isDeleted: true });
// };
const deleteMeter = async (meterId) => {
  const meter = await getMeterById(meterId);

  if (meter.isDeleted) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Meter is already inactive');
  }

  // Check for existing (not deleted) submeters
  const submeterCount = await Submeter.count({
    where: {
      meterId,
      isDeleted: false, // optional: only check for non-deleted submeters
    },
  });

  if (submeterCount > 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot Archived meter with existing submeters');
  }

  await meter.update({ status: 'inactive', isDeleted: true });
};

const restoreMeter = async (meterId) => {
  const meter = await getMeterById(meterId);
  if (!meter.isDeleted) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Meter is already activated');
  }
  await meter.update({ status: 'inactive', isDeleted: false });
};

/**
 * Permanently delete meter by id (hard delete)
 * @param {string} meterId
 * @returns {Promise<void>}
 */
// const hardDeleteMeter = async (meterId) => {
//   const meter = await getMeterById(meterId);
//   await meter.destroy();
// };
const hardDeleteMeter = async (meterId) => {
  const meter = await getMeterById(meterId);

  // Check for any submeters, even soft-deleted ones
  const submeterCount = await Submeter.count({
    where: { meterId },
  });

  if (submeterCount > 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot hard delete meter with existing submeters');
  }

  await meter.destroy();
};
module.exports = {
  createMeter,
  getAllMeters,
  getMeterById,
  updateMeter,
  deleteMeter,
  restoreMeter,
  hardDeleteMeter,
};
