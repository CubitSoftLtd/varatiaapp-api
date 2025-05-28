const httpStatus = require('http-status');
const { Unit, Property } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a unit
 * @param {number} propertyId
 * @param {Object} unitBody
 * @param {User} user
 * @returns {Promise<Unit>}
 */
const createUnit = async (propertyId, unitBody, user) => {
  const property = await Property.findOne({ where: { id: propertyId, accountId: user.accountId } });
  if (!property) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Property not found');
  }
  return Unit.create({ ...unitBody, propertyId });
};

/**
 * Query for units
 * @param {number} propertyId
 * @param {Object} filter - Sequelize filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @param {User} user
 * @returns {Promise<{ results: Unit[], page: number, limit: number, totalPages: number, totalResults: number }>}
 */
const getAllUnits = async (propertyId, filter, options, user) => {
  const property = await Property.findOne({ where: { id: propertyId, accountId: user.accountId } });
  if (!property) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Property not found');
  }
  const limit = options.limit && parseInt(options.limit, 10) > 0 ? parseInt(options.limit, 10) : 10;
  const page = options.page && parseInt(options.page, 10) > 0 ? parseInt(options.page, 10) : 1;
  const offset = (page - 1) * limit;

  const sort = [];
  if (options.sortBy) {
    const [field, order] = options.sortBy.split(':');
    sort.push([field, order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC']);
  }

  const { count, rows } = await Unit.findAndCountAll({
    where: { ...filter, propertyId },
    limit,
    offset,
    order: sort.length ? sort : [['createdAt', 'DESC']],
    include: [{ model: Property }],
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
 * Get unit by id
 * @param {number} id
 * @param {User} user
 * @returns {Promise<Unit>}
 */
const getUnitById = async (id, user) => {
  const unit = await Unit.findByPk(id, { include: [{ model: Property }] });
  if (!unit || unit.Property.accountId !== user.accountId) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Unit not found');
  }
  return unit;
};

/**
 * Update unit by id
 * @param {number} unitId
 * @param {Object} updateBody
 * @param {User} user
 * @returns {Promise<Unit>}
 */
const updateUnit = async (unitId, updateBody, user) => {
  const unit = await getUnitById(unitId, user);
  await unit.update(updateBody);
  return unit;
};

/**
 * Delete unit by id
 * @param {number} unitId
 * @param {User} user
 * @returns {Promise<void>}
 */
const deleteUnit = async (unitId, user) => {
  const unit = await getUnitById(unitId, user);
  await unit.destroy();
};

module.exports = {
  createUnit,
  getAllUnits,
  getUnitById,
  updateUnit,
  deleteUnit,
};
