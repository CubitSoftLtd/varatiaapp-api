const httpStatus = require('http-status');
const { Account } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create an account
 * @param {Object} accountBody
 * @returns {Promise<Account>}
 */
const createAccount = async (accountBody) => {
  return Account.create(accountBody);
};

/**
 * Query for accounts
 * @param {Object} filter - Sequelize filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<{ results: Account[], page: number, limit: number, totalPages: number, totalResults: number }>}
 */
const getAllAccounts = async (filter, options) => {
  const limit = options.limit && parseInt(options.limit, 10) > 0 ? parseInt(options.limit, 10) : 10;
  const page = options.page && parseInt(options.page, 10) > 0 ? parseInt(options.page, 10) : 1;
  const offset = (page - 1) * limit;

  const sort = [];
  if (options.sortBy) {
    const [field, order] = options.sortBy.split(':');
    sort.push([field, order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC']);
  }

  const { count, rows } = await Account.findAndCountAll({
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
 * Get account by id
 * @param {number} id
 * @returns {Promise<Account>}
 */
const getAccountById = async (id) => {
  const account = await Account.findByPk(id);
  if (!account) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Account not found');
  }
  return account;
};

/**
 * Update account by id
 * @param {number} accountId
 * @param {Object} updateBody
 * @returns {Promise<Account>}
 */
const updateAccount = async (accountId, updateBody) => {
  const account = await getAccountById(accountId);
  await account.update(updateBody);
  return account;
};

/**
 * Delete account by id
 * @param {number} accountId
 * @returns {Promise<void>}
 */
const deleteAccount = async (accountId) => {
  const account = await getAccountById(accountId);
  await account.destroy();
};

module.exports = {
  createAccount,
  getAllAccounts,
  getAccountById,
  updateAccount,
  deleteAccount,
};
