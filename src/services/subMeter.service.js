const httpStatus = require('http-status');
const { Sequelize } = require('sequelize');
const { Submeter, Meter, Unit } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a submeter with validation and transaction
 * @param {Object} submeterBody
 * @returns {Promise<Submeter>}
 */
const createSubmeter = async (submeterBody) => {
  // Validate meterId
  const meter = await Meter.findByPk(submeterBody.meterId);
  if (!meter) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Meter not found');
  }

  // Validate unitId
  const unit = await Unit.findByPk(submeterBody.unitId);
  if (!unit) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Unit not found');
  }

  // Check for existing submeter with same number and meterId
  const existingSubmeter = await Submeter.findOne({
    where: {
      number: submeterBody.number,
      meterId: submeterBody.meterId,
      unitId: submeterBody.unitId,
    },
  });
  if (existingSubmeter) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Submeter number already exists for this meter');
  }
  const existingSubmeterUnit = await Submeter.findOne({
    where: {
      unitId: submeterBody.unitId,
    },
  });

  if (existingSubmeterUnit) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Submeter already asign for this Unit');
  }
  // Use a transaction for creating the submeter
  const submeter = await Submeter.sequelize.transaction(async (t) => {
    return Submeter.create(
      {
        meterId: submeterBody.meterId,
        unitId: submeterBody.unitId,
        propertyId: submeterBody.propertyId,
        number: submeterBody.number,
        status: submeterBody.status || 'active',
        installedDate: submeterBody.installedDate,
        adjustedConsumption: submeterBody.adjustedConsumption,
        adjustedUnitRate: submeterBody.adjustedUnitRate,
        accountId: submeterBody.accountId,
        isDeleted: false,
      },
      { transaction: t }
    );
  });

  return submeter;
};

/**
 * Query for submeters with pagination, sorting, and optional inclusion of specific columns from associated models
 * @param {Object} filter - Sequelize filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page number (default = 1)
 * @param {Array} [options.include] - Array of associations and attributes, e.g., [{ model: Meter, as: 'meter', attributes: ['id', 'number'] }]
 * @returns {Promise<{ results: Submeter[], page: number, limit: number, totalPages: number, totalItems: number }>}
 */
const getSubmeters = async (filter, options, deleted = 'false') => {
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

  const sortBy = [];
  if (options.sortBy) {
    const [field, order] = options.sortBy.split(':');
    sortBy.push([field, order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC']);
  }

  // Use the provided include array or default to an empty array (no associations)
  const include = options.include || [];

  const { count, rows } = await Submeter.findAndCountAll({
    where: whereClause,
    limit,
    offset,
    order: sortBy.length ? sortBy.length : [['createdAt', 'DESC']],
    include,
  });

  return {
    results: rows,
    page,
    limit,
    totalPages: Math.ceil(count / limit),
    totalItems: count,
  };
};

/**
 * Get submeter by ID with optional inclusion of by specific columns from associated models
 * @param {string} id
 * @param {Array} [include=[]] - Array of associations and attributes, e.g., [{ model: Meter, as: 'meter', attributes: ['id', 'number'] }]
 * @returns {Promise<Submeter>}
 */
const getSubmeter = async (id, include = []) => {
  const submeter = await Submeter.findByPk(id, { include });
  if (!submeter) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Submeter not found');
  }
  return submeter;
};

/**
 * Update submeter by ID with validation
 * @param {string} id
 * @param {Object} updateBody
 * @returns {Promise<Submeter>}
 */
const updateSubmeter = async (submeterId, updateBody) => {
  const submeter = await getSubmeter(submeterId);

  // Validate meterId if provided
  if (updateBody.meterId) {
    const meter = await Meter.findByPk(updateBody.meterId);
    if (!meter) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Meter not found');
    }
  }

  // Validate unitId if provided
  if (updateBody.unitId) {
    const unit = await Unit.findByPk(updateBody.unitId);
    if (!unit) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Unit not found');
    }
  }

  // Check for number uniqueness within meter if either is updated
  if (updateBody.number || updateBody.meterId) {
    const existingSubmeter = await Submeter.findOne({
      where: {
        number: updateBody.number || submeter.number,
        meterId: updateBody.meterId || submeter.meterId,
        id: { [Sequelize.Op.ne]: submeterId },
      },
    });
    if (existingSubmeter) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Submeter number already exists for this meter');
    }
  }

  await submeter.update(updateBody);
  return submeter;
};

/**
 * Soft delete submeter by ID (set status to inactive)
 * @param {string} submeterId
 * @returns {Promise<void>}
 */
const deleteSubmeter = async (submeterId) => {
  const submeter = await getSubmeter(submeterId);
  if (submeter.isDeleted) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Submeter is already inactive');
  }

  await submeter.update({ status: 'inactive', isDeleted: true });
};
const restoreSubmeter = async (submeterId) => {
  const submeter = await getSubmeter(submeterId);
  if (!submeter.isDeleted) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Submeter is already activated');
  }

  await submeter.update({ status: 'inactive', isDeleted: false });
};

/**
 * Permanently delete submeter by ID (hard delete)
 * @param {string} submeterId
 * @returns {Promise<void>}
 */
const hardDeleteSubmeter = async (submeterId) => {
  const submeter = await getSubmeter(submeterId);
  if (!submeter.isDeleted) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Submeter can not be deleted');
  }

  // Ensure the submeter is not associated with any unit before hard deleting
  const unit = await Unit.findByPk(submeter.unitId);
  if (unit && !unit.isDeleted) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot hard delete submeter associated with a unit');
  }

  await submeter.destroy();
};

module.exports = {
  createSubmeter,
  getSubmeters,
  getSubmeter,
  updateSubmeter,
  deleteSubmeter,
  restoreSubmeter,
  hardDeleteSubmeter,
};
