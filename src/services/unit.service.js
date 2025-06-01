const httpStatus = require('http-status');
const { Unit, Property } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a unit
 * @param {Object} unitBody
 * @returns {Promise<Unit>}
 */
const createUnit = async (unitBody) => {
  if (unitBody.propertyId) {
    const property = await Property.findByPk(unitBody.propertyId);
    if (!property) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Property not found');
    }
  }
  return Unit.create(unitBody);
};

/**
 * Query for units
 * @param {Object} filter - Sequelize filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<{ results: Unit[], page: number, limit: number, totalPages: number, totalResults: number }>}
 */
const getAllUnits = async (filter, options) => {
  const limit = options.limit && parseInt(options.limit, 10) > 0 ? parseInt(options.limit, 10) : 10;
  const page = options.page && parseInt(options.page, 10) > 0 ? parseInt(options.page, 10) : 1;
  const offset = (page - 1) * limit;

  const sort = [];
  if (options.sortBy) {
    const [field, order] = options.sortBy.split(':');
    sort.push([field, order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC']);
  }

  const { count, rows } = await Unit.findAndCountAll({
    where: filter,
    limit,
    offset,
    order: sort.length ? sort : [['createdAt', 'DESC']],
    include: [{ model: Property, as: 'Property' }],
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
 * @param {string} id
 * @returns {Promise<Unit>}
 */
const getUnitById = async (id) => {
  const unit = await Unit.findByPk(id, {
    include: [{ model: Property, as: 'Property' }],
  });
  if (!unit) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Unit not found');
  }
  return unit;
};

/**
 * Update unit by id
 * @param {string} unitId
 * @param {Object} updateBody
 * @returns {Promise<Unit>}
 */
const updateUnit = async (unitId, updateBody) => {
  const unit = await getUnitById(unitId);
  if (updateBody.propertyId) {
    const property = await Property.findByPk(updateBody.propertyId);
    if (!property) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Property not found');
    }
  }
  await unit.update(updateBody);
  return unit;
};

/**
 * Delete unit by id
 * @param {string} unitId
 * @returns {Promise<void>}
 */
const deleteUnit = async (unitId) => {
  const unit = await getUnitById(unitId);
  await unit.destroy();
};

module.exports = {
  createUnit,
  getAllUnits,
  getUnitById,
  updateUnit,
  deleteUnit,
};
