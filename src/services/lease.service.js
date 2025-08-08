const httpStatus = require('http-status');
const { Op } = require('sequelize');
const { Tenant, Unit, Lease, Property } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a lease with validation and transaction
 * @param {Object} leaseBody
 * @returns {Promise<Lease>}
 */

const createLease = async (leaseBody) => {
  if (leaseBody.unitId) {
    const unit = await Unit.findByPk(leaseBody.unitId);
    if (!unit) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Unit not found');
    }
  }

  if (leaseBody.tenantId) {
    const tenant = await Tenant.findByPk(leaseBody.tenantId);
    if (!tenant) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Tenant not found');
    }
  }
  if (leaseBody.propertyId) {
    const tenant = await Property.findByPk(leaseBody.propertyId);
    if (!tenant) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Property not found');
    }
  }

  const existingActiveLease = await Lease.findOne({
    where: {
      unitId: leaseBody.unitId,
      status: 'active',
    },
  });

  if (existingActiveLease) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'This unit already has an active lease.');
  }
  const leaseStart = new Date(leaseBody?.leaseStartDate);
  const currentYear = leaseStart.getFullYear();
  const startOfYear = new Date(currentYear, 0, 1);
  const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59, 999);
  const lease = await Lease.sequelize.transaction(async (t) => {
    // Step 1: Create Lease
    const { accountId } = leaseBody;
    const lastLease = await Lease.findOne({
      where: { accountId, leaseStartDate: { [Op.between]: [startOfYear, endOfYear] } },
      order: [['leaseNo', 'DESC']],
      transaction: t,
    });
    const nextLeaseNumber = lastLease ? lastLease.leaseNo + 1 : 1;

    const createdLease = await Lease.create(
      {
        unitId: leaseBody.unitId,
        propertyId: leaseBody.propertyId,
        leaseNo: nextLeaseNumber,
        tenantId: leaseBody.tenantId,
        leaseStartDate: leaseBody.leaseStartDate,
        leaseEndDate: leaseBody.leaseEndDate,
        moveInDate: leaseBody.moveInDate,
        moveOutDate: leaseBody.moveOutDate,
        status: 'active',
        startedMeterReading: leaseBody.startedMeterReading,
        notes: leaseBody.notes,
        accountId: leaseBody.accountId,
      },
      { transaction: t }
    );

    await Unit.update(
      { status: 'occupied' },
      {
        where: { id: leaseBody.unitId },
        transaction: t,
      }
    );
    const formattedLeaseNo = String(createdLease.leaseNo).padStart(4, '0');
    createdLease.dataValues.fullLeaseNo = `LSE-${currentYear}-${formattedLeaseNo}`;
    return createdLease;
  });

  return lease;
};
/**
 * Query for lease with pagination, sorting, and optional inclusion of specific columns from associated models
 * @param {Object} filter - Sequelize filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @param {Array} [options.include] - Array of objects specifying models and attributes to include
 * @returns {Promise<{ results: Lease[], page: number, limit: number, totalPages: number, totalResults: number }>}
 */

const getAllLeases = async (filter, options) => {
  const whereClause = { ...filter };
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

  const { count, rows } = await Lease.findAndCountAll({
    where: whereClause,
    limit,
    offset,
    order: sort.length ? sort : [['createdAt', 'DESC']],
    include,
  });
  rows.forEach((lease) => {
    const leaseYear = new Date(lease.leaseStartDate).getFullYear();
    const formattedLeaseNo = String(lease.leaseNo).padStart(4, '0');
    /* eslint-disable-next-line no-param-reassign */
    lease.dataValues.fullLeaseNo = `LSE-${leaseYear}-${formattedLeaseNo}`;
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
 * Get lease by id with optional inclusion of specific columns from associated models
 * @param {string} id
 * @param {Array} [include=[]] - Array of objects specifying models and attributes to include
 * @returns {Promise<Lease>}
 */
const getLeaseById = async (id, include = []) => {
  const lease = await Lease.findByPk(id, { include });
  if (!lease) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Lease not found');
  }
  const leaseYear = new Date(lease.leaseStartDate).getFullYear();
  const formattedLeaseNo = String(lease.leaseNo).padStart(4, '0');
  lease.dataValues.fullLeaseNo = `LSE-${leaseYear}-${formattedLeaseNo}`;
  return lease;
};

/**
 * Update tenant by id with validation
 * @param {string} leaseId
 * @param {Object} updateBody
 * @returns {Promise<Lease>}
 */
const updateLease = async (leaseId, updateBody) => {
  const lease = await getLeaseById(leaseId);

  // Validate unitId if provided
  if (updateBody.unitId) {
    const unit = await Unit.findByPk(updateBody.unitId);
    if (!unit) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Unit not found');
    }
  }
  if (updateBody.tenantId) {
    const tenant = await Tenant.findByPk(updateBody.tenantId);
    if (!tenant) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Tenant not found');
    }
  }

  await lease.update(updateBody);
  const leaseYear = new Date(lease.leaseStartDate).getFullYear();
  const formattedLeaseNo = String(lease.leaseNo).padStart(4, '0');
  lease.dataValues.fullLeaseNo = `LSE-${leaseYear}-${formattedLeaseNo}`;
  return lease;
};

/**
 * Soft delete tenant by id (set status to inactive)
 * @param {string} leaseId
 * @returns {Promise<void>}
 */
const deleteLease = async (leaseId) => {
  const lease = await getLeaseById(leaseId);
  if (lease.isDeleted) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Lease is already inactive');
  }
  await lease.update({ isDeleted: true });
};
const restoreLease = async (leaseId) => {
  const lease = await getLeaseById(leaseId);
  if (!lease.isDeleted) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Lease is already inactive');
  }
  await lease.update({ isDeleted: false });
};

/**
 * Permanently delete tenant by id (hard delete)
 * @param {string} leaseId
 * @returns {Promise<void>}
 */
// const hardDeleteLease = async (leaseId) => {
//   const lease = await getLeaseById(leaseId);
//   await lease.destroy();
// };
const hardDeleteLease = async (leaseId) => {
  const lease = await getLeaseById(leaseId);
  if (!lease) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Lease not found');
  }

  await Lease.sequelize.transaction(async (t) => {
    const { unitId } = lease;

    // Step 1: Delete the lease
    await lease.destroy({ transaction: t });

    // Step 2: Check if the unit has any other active leases
    const otherActiveLease = await Lease.findOne({
      where: {
        unitId,
        status: 'active',
      },
      transaction: t,
    });

    // Step 3: If no other active lease, update the unit status to "vacant"
    if (!otherActiveLease) {
      await Unit.update(
        { status: 'vacant' },
        {
          where: { id: unitId },
          transaction: t,
        }
      );
    }
  });
};

/**
 * Terminate an active lease and set unit status to vacant
 * @param {string} leaseId
 * @returns {Promise<Lease>}
 */
const terminateLease = async (leaseId) => {
  const lease = await getLeaseById(leaseId);
  if (!lease) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Lease not found');
  }
  if (lease.status !== 'active') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Only active leases can be terminated');
  }
  await Lease.sequelize.transaction(async (t) => {
    // Step 1: Update lease status to terminated
    await lease.update({ status: 'terminated' }, { transaction: t });
    // Step 2: Update unit status to vacant
    await Unit.update(
      { status: 'vacant' },
      {
        where: { id: lease.unitId },
        transaction: t,
      }
    );
  });
  return lease;
};

module.exports = {
  createLease,
  getAllLeases,
  getLeaseById,
  updateLease,
  deleteLease,
  restoreLease,
  hardDeleteLease,
  terminateLease,
};
