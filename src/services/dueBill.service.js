/* eslint-disable prettier/prettier */
const httpStatus = require('http-status');
const { Op } = require('sequelize');
const { DueBill, Tenant, Bill, Account } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a DueBill with validation
 * @param {Object} dueBillBody
 * @returns {Promise<DueBill>}
 */
const createDueBill = async (dueBillBody) => {
  if (dueBillBody.tenantId) {
    const tenant = await Tenant.findByPk(dueBillBody.tenantId);
    if (!tenant) throw new ApiError(httpStatus.NOT_FOUND, 'Tenant not found');
  }

  if (dueBillBody.billId) {
    const bill = await Bill.findByPk(dueBillBody.billId);
    if (!bill) throw new ApiError(httpStatus.NOT_FOUND, 'Bill not found');
  }

  if (dueBillBody.accountId) {
    const account = await Account.findByPk(dueBillBody.accountId);
    if (!account) throw new ApiError(httpStatus.NOT_FOUND, 'Account not found');
  }

  return DueBill.create({
    tenantId: dueBillBody.tenantId,
    billId: dueBillBody.billId || null,
    dueMonth: dueBillBody.dueMonth,
    amount: dueBillBody.amount,
    notes: dueBillBody.notes,
    accountId: dueBillBody.accountId,
  });
};

/**
 * Get all DueBills with pagination, sorting, and filtering
 */
const getAllDueBills = async (filter, options) => {
  const whereClause = { ...filter };
  const limit = options.limit && parseInt(options.limit, 10) > 0 ? parseInt(options.limit, 10) : 10;
  const page = options.page && parseInt(options.page, 10) > 0 ? parseInt(options.page, 10) : 1;
  const offset = (page - 1) * limit;

  const sort = [];
  if (options.sortBy) {
    const [field, order] = options.sortBy.split(':');
    sort.push([field, order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC']);
  }

  const include = options.include || [];

  const { count, rows } = await DueBill.findAndCountAll({
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
 * Get DueBill by ID
 */
const getDueBillById = async (id, include = []) => {
  const dueBill = await DueBill.findByPk(id, { include });
  if (!dueBill) {
    throw new ApiError(httpStatus.NOT_FOUND, 'DueBill not found');
  }
  return dueBill;
};

/**
 * Update DueBill
 */
const updateDueBill = async (id, updateBody) => {
  const dueBill = await getDueBillById(id);

  if (updateBody.tenantId) {
    const tenant = await Tenant.findByPk(updateBody.tenantId);
    if (!tenant) throw new ApiError(httpStatus.NOT_FOUND, 'Tenant not found');
  }

  if (updateBody.billId) {
    const bill = await Bill.findByPk(updateBody.billId);
    if (!bill) throw new ApiError(httpStatus.NOT_FOUND, 'Bill not found');
  }

  await dueBill.update(updateBody);
  return dueBill;
};

/**
 * Soft delete (mark as deleted)
 */
const deleteDueBill = async (id) => {
  const dueBill = await getDueBillById(id);
  if (dueBill.isDeleted) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'DueBill already deleted');
  }
  await dueBill.update({ isDeleted: true });
};

/**
 * Restore a soft-deleted DueBill
 */
const restoreDueBill = async (id) => {
  const dueBill = await getDueBillById(id);
  if (!dueBill.isDeleted) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'DueBill is not deleted');
  }
  await dueBill.update({ isDeleted: false });
};

/**
 * Hard delete DueBill
 */
const hardDeleteDueBill = async (id) => {
  const dueBill = await getDueBillById(id);
  await dueBill.destroy();
};

module.exports = {
  createDueBill,
  getAllDueBills,
  getDueBillById,
  updateDueBill,
  deleteDueBill,
  restoreDueBill,
  hardDeleteDueBill,
};
