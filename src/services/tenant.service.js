const httpStatus = require('http-status');
const { Op } = require('sequelize');
const { Tenant, Unit, Property } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a tenant with validation and transaction
 * @param {Object} tenantBody
 * @returns {Promise<Tenant>}
 */
const createTenant = async (tenantBody) => {
  // Validate unitId if provided
  if (tenantBody.unitId) {
    const unit = await Unit.findByPk(tenantBody.unitId);
    if (!unit) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Unit not found');
    }
  }

  // Check for existing tenant with same email, phoneNumber, or nationalId
  const existingTenant = await Tenant.findOne({
    where: {
      [Op.or]: [
        { email: tenantBody.email },
        { phoneNumber: tenantBody.phoneNumber },
        tenantBody.nationalId ? { nationalId: tenantBody.nationalId } : null,
      ].filter(Boolean),
    },
  });
  if (existingTenant) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Tenant with this email, phone number, or national ID already exists');
  }

  // Use a transaction for creating the tenant
  const tenant = await Tenant.sequelize.transaction(async (t) => {
    return Tenant.create(
      {
        firstName: tenantBody.firstName,
        lastName: tenantBody.lastName,
        name: `${tenantBody.firstName} ${tenantBody.lastName}`,
        email: tenantBody.email,
        phoneNumber: tenantBody.phoneNumber,
        emergencyContactName: tenantBody.emergencyContactName,
        emergencyContactPhone: tenantBody.emergencyContactPhone,
        unitId: tenantBody.unitId,
        leaseStartDate: tenantBody.leaseStartDate,
        leaseEndDate: tenantBody.leaseEndDate,
        depositAmount: tenantBody.depositAmount,
        status: tenantBody.status || 'current',
        nationalId: tenantBody.nationalId,
        moveInDate: tenantBody.moveInDate,
        moveOutDate: tenantBody.moveOutDate,
        notes: tenantBody.notes,
        accountId: tenantBody.accountId,
      },
      { transaction: t }
    );
  });

  return tenant;
};

/**
 * Query for tenants with pagination, sorting, and optional inclusion of specific columns from associated models
 * @param {Object} filter - Sequelize filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @param {Array} [options.include] - Array of objects specifying models and attributes to include
 * @returns {Promise<{ results: Tenant[], page: number, limit: number, totalPages: number, totalResults: number }>}
 */
const getAllTenants = async (filter, options, deleted = 'false') => {
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

  const { count, rows } = await Tenant.findAndCountAll({
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
 * Get tenant by id with optional inclusion of specific columns from associated models
 * @param {string} id
 * @param {Array} [include=[]] - Array of objects specifying models and attributes to include
 * @returns {Promise<Tenant>}
 */
const getTenantById = async (id, include = []) => {
  const tenant = await Tenant.findByPk(id, { include });
  if (!tenant) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Tenant not found');
  }
  return tenant;
};

/**
 * Update tenant by id with validation
 * @param {string} tenantId
 * @param {Object} updateBody
 * @returns {Promise<Tenant>}
 */
const updateTenant = async (tenantId, updateBody) => {
  const tenant = await getTenantById(tenantId);

  // Validate unitId if provided
  if (updateBody.unitId) {
    const unit = await Unit.findByPk(updateBody.unitId);
    if (!unit) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Unit not found');
    }
  }

  // Check for uniqueness of email, phoneNumber, or nationalId if updated
  if (updateBody.email || updateBody.phoneNumber || updateBody.nationalId) {
    const existingTenant = await Tenant.findOne({
      where: {
        [Op.or]: [
          updateBody.email ? { email: updateBody.email } : null,
          updateBody.phoneNumber ? { phoneNumber: updateBody.phoneNumber } : null,
          updateBody.nationalId ? { nationalId: updateBody.nationalId } : null,
        ].filter(Boolean),
        id: { [Op.ne]: tenantId },
      },
    });
    if (existingTenant) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'Another tenant with this email, phone number, or national ID already exists'
      );
    }
  }

  await tenant.update(updateBody);
  return tenant;
};

/**
 * Soft delete tenant by id (set status to inactive)
 * @param {string} tenantId
 * @returns {Promise<void>}
 */
const deleteTenant = async (tenantId) => {
  const tenant = await getTenantById(tenantId);
  if (tenant.isDeleted) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Tenant is already inactive');
  }
  await tenant.update({ isDeleted: true });
};

/**
 * Permanently delete tenant by id (hard delete)
 * @param {string} tenantId
 * @returns {Promise<void>}
 */
const hardDeleteTenant = async (tenantId) => {
  const tenant = await getTenantById(tenantId);
  await tenant.destroy();
};

/**
 * Get tenants by unit and property
 * @param {string} propertyId
 * @param {string} unitId
 * @param {Array} [include=[]] - Array of objects specifying models and attributes to include
 * @returns {Promise<Tenant[]>}
 */
const getTenantsByUnitAndProperty = async (propertyId, unitId, include = []) => {
  const property = await Property.findByPk(propertyId);
  if (!property) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Property not found');
  }

  const unit = await Unit.findByPk(unitId);
  if (!unit) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Unit not found');
  }
  if (unit.propertyId !== propertyId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Unit does not belong to the specified property');
  }

  const tenants = await Tenant.findAll({
    where: { unitId },
    include,
  });

  return tenants;
};

/**
 * Get historical tenants for a unit within a date range
 * @param {string} unitId
 * @param {Date} startDate
 * @param {Date} endDate
 * @param {Array} [include=[]] - Array of objects specifying models and attributes to include
 * @returns {Promise<{ results: Tenant[], totalResults: number }>}
 */
const getHistoricalTenantsByUnit = async (unitId, startDate, endDate, include = []) => {
  // Validate unit existence
  const unit = await Unit.findByPk(unitId);
  if (!unit) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Unit not found');
  }

  // Validate dates
  if (!startDate || !endDate) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Start date and end date are required');
  }

  const parsedStartDate = new Date(startDate);
  const parsedEndDate = new Date(endDate);

  // eslint-disable-next-line no-restricted-globals
  if (isNaN(parsedStartDate) || isNaN(parsedEndDate)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid date format');
  }

  // Query tenants with lease dates overlapping the range
  const tenants = await Tenant.findAll({
    where: {
      unitId,
      leaseStartDate: { [Op.lte]: parsedEndDate },
      [Op.or]: [{ leaseEndDate: { [Op.gte]: parsedStartDate } }, { leaseEndDate: null }],
    },
    include,
  });

  return {
    results: tenants,
    totalResults: tenants.length,
  };
};

module.exports = {
  createTenant,
  getAllTenants,
  getTenantById,
  updateTenant,
  deleteTenant,
  hardDeleteTenant,
  getTenantsByUnitAndProperty,
  getHistoricalTenantsByUnit,
};
