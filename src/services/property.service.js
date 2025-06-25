const httpStatus = require('http-status');
const { Sequelize } = require('sequelize');
const { Property, Account } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a property with validation and transaction
 * @param {Object} propertyBody
 * @returns {Promise<Property>}
 */
const createProperty = async (propertyBody) => {
  // eslint-disable-next-line no-console
  console.log(propertyBody);

  // Validate accountId
  const account = await Account.findByPk(propertyBody.accountId);
  if (!account) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Account not found');
  }

  // Check for existing property with same name and accountId
  const existingProperty = await Property.findOne({
    where: {
      name: propertyBody.name,
      accountId: propertyBody.accountId,
    },
  });
  if (existingProperty) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Property name already exists for this account');
  }

  // Use a transaction for creating the property
  const property = await Property.sequelize.transaction(async (t) => {
    return Property.create(
      {
        name: propertyBody.name,
        address: propertyBody.address,
        accountId: propertyBody.accountId,
        type: propertyBody.type,
        yearBuilt: propertyBody.yearBuilt,
        totalUnits: propertyBody.totalUnits,
        isActive: true,
      },
      { transaction: t }
    );
  });

  return property;
};

/**
 * Query for properties with pagination, sorting, and optional inclusion of specific columns from associated models
 * @param {Object} filter - Sequelize filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @param {Array} [options.include] - Array of objects specifying models and attributes to include
 * @returns {Promise<{ results: Property[], page: number, limit: number, totalPages: number, totalResults: number }>}
 */
const getAllProperties = async (filter, options, deleted = 'false') => {
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

  const { count, rows } = await Property.findAndCountAll({
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
 * Get property by id with optional inclusion of specific columns from associated models
 * @param {string} id
 * @param {Array} [include=[]] - Array of objects specifying models and attributes to include
 * @returns {Promise<Property>}
 */
const getPropertyById = async (id, include = []) => {
  const property = await Property.findByPk(id, { include });
  if (!property) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Property not found');
  }
  return property;
};

/**
 * Update property by id with validation
 * @param {string} propertyId
 * @param {Object} updateBody
 * @returns {Promise<Property>}
 */
const updateProperty = async (propertyId, updateBody) => {
  const property = await getPropertyById(propertyId);

  // Validate accountId if provided
  if (updateBody.accountId) {
    const account = await Account.findByPk(updateBody.accountId);
    if (!account) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Account not found');
    }
  }

  // Check for name uniqueness within account if either is updated
  if (updateBody.name || updateBody.accountId) {
    const existingProperty = await Property.findOne({
      where: {
        name: updateBody.name || property.name,
        accountId: updateBody.accountId || property.accountId,
        id: { [Sequelize.Op.ne]: propertyId },
      },
    });
    if (existingProperty) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Property name already exists for this account');
    }
  }

  await property.update(updateBody);
  return property;
};

/**
 * Soft delete property by id (set isActive to false)
 * @param {string} propertyId
 * @returns {Promise<void>}
 */
const deleteProperty = async (propertyId) => {
  const property = await getPropertyById(propertyId);
  if (property.isDeleted) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Property is already inactive');
  }

  await property.update({ isDeleted: true });
};

/**
 * Permanently delete property by id (hard delete)
 * @param {string} propertyId
 * @returns {Promise<void>}
 */
const hardDeleteProperty = async (propertyId) => {
  const property = await getPropertyById(propertyId);
  await property.destroy();
};

module.exports = {
  createProperty,
  getAllProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
  hardDeleteProperty,
};
