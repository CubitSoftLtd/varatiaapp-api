const httpStatus = require('http-status');
const { UtilityType, Meter } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a new utility type with validation and transaction
 * @param {Object} utilityTypeBody - { name, unitRate, unitOfMeasurement, description? }
 * @returns {Promise<UtilityType>}
 */
const createUtilityType = async (utilityTypeBody) => {
  const { accountId, name, unitRate, unitOfMeasurement, description } = utilityTypeBody;

  // Validate required fields
  if (!name || unitRate === undefined || !unitOfMeasurement) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Name, unit rate, and unit of measurement are required');
  }

  // Validate unitRate
  if (unitRate < 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Unit rate cannot be negative');
  }

  // Validate unitOfMeasurement
  if (unitOfMeasurement.trim().length === 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Unit of measurement cannot be empty');
  }

  // Validate accountId
  if (!accountId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Account ID is required');
  }
  // Check if account exists
  const account = await UtilityType.sequelize.models.Account.findByPk(accountId);
  if (!account) {
    throw new ApiError(httpStatus.NOT_FOUND, `Account not found for ID: ${accountId}`);
  }
  // Check if account is active
  if (!account.isActive) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot create utility type under an inactive account');
  }

  // Check for existing utility type name
  const existingUtilityType = await UtilityType.findOne({ where: { name } });
  if (existingUtilityType) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Utility type name already exists');
  }

  // Create utility type in a transaction
  const utilityType = await UtilityType.sequelize.transaction(async (t) => {
    return UtilityType.create(
      {
        name,
        unitRate,
        unitOfMeasurement,
        description: description || null,
        accountId,
        isDeleted: false,
      },
      { transaction: t }
    );
  });

  return utilityType;
};

/**
 * Query for all utility types with pagination, sorting, and optional inclusion
 * @param {Object} filter - Sequelize filter
 * @param {Object} options - { sortBy, limit, page, include? }
 * @returns {Promise<{ results: UtilityType[], page: number, limit: number, totalPages: number, totalResults: number }>}
 */
const getAllUtilityTypes = async (filter, options, deleted = 'false') => {
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

  // Use provided include or default to empty array
  const include = options.include || [];

  const { count, rows } = await UtilityType.findAndCountAll({
    where: whereClause,
    limit,
    offset,
    order: sort.length ? sort : [['name', 'ASC']],
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
 * Get utility type by ID
 * @param {string} id - Utility type UUID
 * @param {Array} [include=[]] - Array of objects specifying models and attributes to include
 * @returns {Promise<UtilityType>}
 */
const getUtilityTypeById = async (id, include = []) => {
  const utilityType = await UtilityType.findByPk(id, { include });
  if (!utilityType || utilityType.isDeleted) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Utility type not found');
  }
  return utilityType;
};

/**
 * Update an existing utility type by ID
 * @param {string} utilityTypeId - Utility type UUID
 * @param {Object} updateBody - { name?, unitRate?, unitOfMeasurement?, description? }
 * @returns {Promise<UtilityType>}
 */
const updateUtilityType = async (utilityTypeId, updateBody) => {
  const utilityType = await getUtilityTypeById(utilityTypeId);
  const { name, unitRate, unitOfMeasurement, description } = updateBody;

  // Validate name uniqueness if provided
  if (name && name !== utilityType.name) {
    const existingUtilityType = await UtilityType.findOne({ where: { name } });
    if (existingUtilityType) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Utility type name already exists');
    }
  }

  // Validate unitRate if provided
  if (unitRate !== undefined && unitRate < 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Unit rate cannot be negative');
  }

  // Validate unitOfMeasurement if provided
  if (unitOfMeasurement !== undefined && unitOfMeasurement.trim().length === 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Unit of measurement cannot be empty');
  }

  await utilityType.update({
    name: name !== undefined ? name : utilityType.name,
    unitRate: unitRate !== undefined ? unitRate : utilityType.unitRate,
    unitOfMeasurement: unitOfMeasurement !== undefined ? unitOfMeasurement : utilityType.unitOfMeasurement,
    description: description !== undefined ? description : utilityType.description,
  });

  return utilityType;
};

/**
 * Soft delete a utility type by ID
 * @param {string} utilityTypeId - Utility type UUID
 * @returns {Promise<void>}
 */
const deleteUtilityType = async (utilityTypeId) => {
  const utilityType = await getUtilityTypeById(utilityTypeId);
  if (utilityType.isDeleted) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Utility type is already deleted');
  }
  const meters = await Meter.findAll({ where: { utilityTypeId } });
  if (meters.length > 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot delete utility type with associated meters');
  }
  await utilityType.update({ isDeleted: true });
};

/**
 * Hard delete a utility type by ID
 * @param {string} utilityTypeId - Utility type UUID
 * @returns {Promise<void>}
 */
const hardDeleteUtilityType = async (utilityTypeId) => {
  const utilityType = await getUtilityTypeById(utilityTypeId);
  const meters = await Meter.findAll({ where: { utilityTypeId } });
  if (meters.length > 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot delete utility type with associated meters');
  }
  await utilityType.destroy();
};

module.exports = {
  createUtilityType,
  getAllUtilityTypes,
  getUtilityTypeById,
  updateUtilityType,
  deleteUtilityType,
  hardDeleteUtilityType,
};
