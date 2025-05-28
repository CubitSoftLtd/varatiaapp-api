const httpStatus = require('http-status');
const { UtilityCharge, UtilityType } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a utility charge
 * @param {number} utilityTypeId
 * @param {Object} utilityChargeBody
 * @returns {Promise<UtilityCharge>}
 */
const createUtilityCharge = async (utilityTypeId, utilityChargeBody) => {
  const utilityType = await UtilityType.findByPk(utilityTypeId);
  if (!utilityType) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Utility type not found');
  }
  return UtilityCharge.create({ ...utilityChargeBody, utilityTypeId });
};

/**
 * Query for utility charges
 * @param {number} utilityTypeId
 * @param {Object} filter - Sequelize filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<{ results: UtilityCharge[], page: number, limit: number, totalPages: number, totalResults: number }>}
 */
const getAllUtilityCharges = async (utilityTypeId, filter, options) => {
  const utilityType = await UtilityType.findByPk(utilityTypeId);
  if (!utilityType) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Utility type not found');
  }
  const limit = options.limit && parseInt(options.limit, 10) > 0 ? parseInt(options.limit, 10) : 10;
  const page = options.page && parseInt(options.page, 10) > 0 ? parseInt(options.page, 10) : 1;
  const offset = (page - 1) * limit;

  const sort = [];
  if (options.sortBy) {
    const [field, order] = options.sortBy.split(':');
    sort.push([field, order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC']);
  }

  const { count, rows } = await UtilityCharge.findAndCountAll({
    where: { ...filter, utilityTypeId },
    limit,
    offset,
    order: sort.length ? sort : [['createdAt', 'DESC']],
    include: [{ model: UtilityType }],
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
 * Get utility charge by id
 * @param {number} id
 * @returns {Promise<UtilityCharge>}
 */
const getUtilityChargeById = async (id) => {
  const utilityCharge = await UtilityCharge.findByPk(id, { include: [{ model: UtilityType }] });
  if (!utilityCharge) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Utility charge not found');
  }
  return utilityCharge;
};

/**
 * Update utility charge by id
 * @param {number} utilityChargeId
 * @param {Object} updateBody
 * @returns {Promise<UtilityCharge>}
 */
const updateUtilityCharge = async (utilityChargeId, updateBody) => {
  const utilityCharge = await getUtilityChargeById(utilityChargeId);
  await utilityCharge.update(updateBody);
  return utilityCharge;
};

/**
 * Delete utility charge by id
 * @param {number} utilityChargeId
 * @returns {Promise<void>}
 */
const deleteUtilityCharge = async (utilityChargeId) => {
  const utilityCharge = await getUtilityChargeById(utilityChargeId);
  await utilityCharge.destroy();
};

module.exports = {
  createUtilityCharge,
  getAllUtilityCharges,
  getUtilityChargeById,
  updateUtilityCharge,
  deleteUtilityCharge,
};
