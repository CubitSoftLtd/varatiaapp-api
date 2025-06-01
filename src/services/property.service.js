const httpStatus = require('http-status');
const { Property, Account } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a property
 * @param {Object} propertyBody
 * @returns {Promise<Property>}
 */
const createProperty = async (propertyBody) => {
  if (propertyBody.accountId) {
    const account = await Account.findByPk(propertyBody.accountId);
    if (!account) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Account not found');
    }
  }
  return Property.create(propertyBody);
};

/**
 * Query for properties
 * @param {Object} filter - Sequelize filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<{ results: Property[], page: number, limit: number, totalPages: number, totalResults: number }>}
 */
const getAllProperties = async (filter, options) => {
  const limit = options.limit && parseInt(options.limit, 10) > 0 ? parseInt(options.limit, 10) : 10;
  const page = options.page && parseInt(options.page, 10) > 0 ? parseInt(options.page, 10) : 1;
  const offset = (page - 1) * limit;

  const sort = [];
  if (options.sortBy) {
    const [field, order] = options.sortBy.split(':');
    sort.push([field, order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC']);
  }

  const { count, rows } = await Property.findAndCountAll({
    where: filter,
    limit,
    offset,
    order: sort.length ? sort : [['createdAt', 'DESC']],
    include: [{ model: Account, as: 'Account' }],
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
 * @param {string} id
 * @returns {Promise<Property>}
 */
const getPropertyById = async (id) => {
  const property = await Property.findByPk(id, {
    include: [{ model: Account, as: 'Account' }],
  });
  if (!property) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Property not found');
  }
  return property;
};

/**
 * Update property by id
 * @param {string} propertyId
 * @param {Object} updateBody
 * @returns {Promise<Property>}
 */
const updateProperty = async (propertyId, updateBody) => {
  const property = await getPropertyById(propertyId);
  if (updateBody.accountId) {
    const account = await Account.findByPk(updateBody.accountId);
    if (!account) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Account not found');
    }
  }
  await property.update(updateBody);
  return property;
};

/**
 * Delete property by id
 * @param {string} propertyId
 * @returns {Promise<void>}
 */
const deleteProperty = async (propertyId) => {
  const property = await getPropertyById(propertyId);
  await property.destroy();
};

module.exports = {
  createProperty,
  getAllProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
};
