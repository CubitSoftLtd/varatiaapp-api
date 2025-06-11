const httpStatus = require('http-status');
const { Op } = require('sequelize');
const { Unit, Property } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a unit with validation and transaction
 * @param {Object} unitBody
 * @returns {Promise<Unit>}
 */
const createUnit = async (unitBody) => {
  // Validate propertyId
  const property = await Property.findByPk(unitBody.propertyId);
  if (!property) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Property not found');
  }

  // Check for existing unit with same name and propertyId
  const existingUnit = await Unit.findOne({
    where: {
      name: unitBody.name,
      propertyId: unitBody.propertyId,
    },
  });
  if (existingUnit) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Unit name already exists for this property');
  }

  // Use a transaction for creating the unit
  const unit = await Unit.sequelize.transaction(async (t) => {
    return Unit.create(
      {
        name: unitBody.name,
        propertyId: unitBody.propertyId,
        rentAmount: unitBody.rentAmount,
        status: unitBody.status || 'vacant',
        bedroomCount: unitBody.bedroomCount,
        bathroomCount: unitBody.bathroomCount,
        squareFootage: unitBody.squareFootage,
        accountId: unitBody.accountId,
        isDeleted: false,
      },
      { transaction: t }
    );
  });

  return unit;
};

/**
 * Query for units with pagination, sorting, and optional inclusion of specific columns from associated models
 * @param {Object} filter - Sequelize filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @param {Array} [options.include] - Array of objects specifying models and attributes to include
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

  // Use the provided include array or default to an empty array (no associations)
  const include = options.include || [];

  const { count, rows } = await Unit.findAndCountAll({
    where: filter,
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
 * Get unit by id with optional inclusion of specific columns from associated models
 * @param {string} id
 * @param {Array} [include=[]] - Array of objects specifying models and attributes to include
 * @returns {Promise<Unit>}
 */
const getUnitById = async (id, include = []) => {
  const unit = await Unit.findByPk(id, { include });
  if (!unit) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Unit not found');
  }
  return unit;
};

/**
 * Update unit by id with validation
 * @param {string} unitId
 * @param {Object} updateBody
 * @returns {Promise<Unit>}
 */
const updateUnit = async (unitId, updateBody) => {
  const unit = await getUnitById(unitId);

  // Validate propertyId if provided
  if (updateBody.propertyId) {
    const property = await Property.findByPk(updateBody.propertyId);
    if (!property) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Property not found');
    }
  }

  // Check for name uniqueness within property if either is updated
  if (updateBody.name || updateBody.propertyId) {
    const existingUnit = await Unit.findOne({
      where: {
        name: updateBody.name || unit.name,
        propertyId: updateBody.propertyId || unit.propertyId,
        id: { [Op.ne]: unitId },
      },
    });
    if (existingUnit) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Unit name already exists for this property');
    }
  }

  await unit.update(updateBody);
  return unit;
};

/**
 * Soft delete unit by id (set status to inactive)
 * @param {string} unitId
 * @returns {Promise<void>}
 */
const deleteUnit = async (unitId) => {
  const unit = await getUnitById(unitId);
  if (unit.status === 'inactive') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Unit is already inactive');
  }
  await unit.update({ status: 'inactive' });
};

/**
 * Permanently delete unit by id (hard delete)
 * @param {string} unitId
 * @returns {Promise<void>}
 */
const hardDeleteUnit = async (unitId) => {
  const unit = await getUnitById(unitId);
  await unit.destroy();
};

module.exports = {
  createUnit,
  getAllUnits,
  getUnitById,
  updateUnit,
  deleteUnit,
  hardDeleteUnit,
};
