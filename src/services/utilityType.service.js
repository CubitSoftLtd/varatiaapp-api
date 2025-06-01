const httpStatus = require('http-status');
const { UtilityType } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a utility type
 * @param {Object} utilityTypeBody
 * @returns {Promise<UtilityType>}
 */
const createUtilityType = async (utilityTypeBody) => {
  return UtilityType.create(utilityTypeBody);
};

/**
 * Query for utility types
 * @param {Object} filter - Sequelize filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<{ results: UtilityType[], page: number, limit: number, totalPages: number, totalResults: number }>}
 */
const getAllUtilityTypes = async (filter, options) => {
  const limit = options.limit && parseInt(options.limit, 10) > 0 ? parseInt(options.limit, 10) : 10;
  const page = options.page && parseInt(options.page, 10) > 0 ? parseInt(options.page, 10) : 1;
  const offset = (page - 1) * limit;

  const sort = [];
  if (options.sortBy) {
    const [field, order] = options.sortBy.split(':');
    sort.push([field, order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC']);
  }

  const { count, rows } = await UtilityType.findAndCountAll({
    where: filter,
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
 * Get utility type by id
 * @param {string} id
 * @returns {Promise<UtilityType>}
 */
const getUtilityTypeById = async (id) => {
  const utilityType = await UtilityType.findByPk(id);
  if (!utilityType) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Utility type not found');
  }
  return utilityType;
};

/**
 * Update utility type by id
 * @param {string} utilityTypeId
 * @param {Object} updateBody
 * @returns {Promise<UtilityType>}
 */
const updateUtilityType = async (utilityTypeId, updateBody) => {
  const utilityType = await getUtilityTypeById(utilityTypeId);
  await utilityType.update(updateBody);
  return utilityType;
};

/**
 * Delete utility type by id
 * @param {string} utilityTypeId
 * @returns {Promise<void>}
 */
const deleteUtilityType = async (utilityTypeId) => {
  const utilityType = await getUtilityTypeById(utilityTypeId);
  await utilityType.destroy();
};

module.exports = {
  createUtilityType,
  getAllUtilityTypes,
  getUtilityTypeById,
  updateUtilityType,
  deleteUtilityType,
};
