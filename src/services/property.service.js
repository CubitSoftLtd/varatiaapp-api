const httpStatus = require('http-status');
const { Property } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a property
 * @param {Object} propertyBody
 * @param {User} user
 * @returns {Promise<Property>}
 */
const createProperty = async (propertyBody, user) => {
  if (!['owner', 'manager'].includes(user.role)) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Access denied');
  }
  return Property.create({ ...propertyBody, accountId: user.accountId });
};

/**
 * Query for properties
 * @param {Object} filter - Sequelize filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @param {User} user
 * @returns {Promise<{ results: Property[], page: number, limit: number, totalPages: number, totalResults: number }>}
 */
const getAllProperties = async (filter, options, user) => {
  const limit = options.limit && parseInt(options.limit, 10) > 0 ? parseInt(options.limit, 10) : 10;
  const page = options.page && parseInt(options.page, 10) > 0 ? parseInt(options.page, 10) : 1;
  const offset = (page - 1) * limit;

  const sort = [];
  if (options.sortBy) {
    const [field, order] = options.sortBy.split(':');
    sort.push([field, order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC']);
  }

  const { count, rows } = await Property.findAndCountAll({
    where: { ...filter, accountId: user.accountId },
    limit,
    offset,
    order: sort.length ? sort : [['createdAt', 'DESC']],
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
 * Get property by id
 * @param {number} id
 * @param {User} user
 * @returns {Promise<Property>}
 */
const getPropertyById = async (id, user) => {
  const property = await Property.findOne({ where: { id, accountId: user.accountId } });
  if (!property) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Property not found');
  }
  return property;
};

/**
 * Update property by id
 * @param {number} propertyId
 * @param {Object} updateBody
 * @param {User} user
 * @returns {Promise<Property>}
 */
const updateProperty = async (propertyId, updateBody, user) => {
  const property = await getPropertyById(propertyId, user);
  await property.update(updateBody);
  return property;
};

/**
 * Delete property by id
 * @param {number} propertyId
 * @param {User} user
 * @returns {Promise<void>}
 */
const deleteProperty = async (propertyId, user) => {
  const property = await getPropertyById(propertyId, user);
  await property.destroy();
};

module.exports = {
  createProperty,
  getAllProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
};
