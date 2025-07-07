const httpStatus = require('http-status');
const { Sequelize } = require('sequelize');
const { Account } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create an account with additional validation and transaction
 * @param {Object} accountBody
 * @returns {Promise<Account>}
 */
const createAccount = async (accountBody) => {
  // Check for existing account with same name or email
  const existingAccount = await Account.findOne({
    where: {
      [Sequelize.Op.or]: [{ name: accountBody.name }, { contactEmail: accountBody.contactEmail }],
    },
  });
  if (existingAccount) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Account name or contact email already exists');
  }

  // Use a transaction for creating the account
  const account = await Account.sequelize.transaction(async (t) => {
    return Account.create(accountBody, { transaction: t });
  });

  return account;
};

/**
 * Query for accounts with pagination, sorting, and optional associations
 * @param {Object} filter - Sequelize filter
 * @param {Object} options - Query options
 * @returns {Promise<{ results: Account[], page: number, limit: number, totalPages: number, totalResults: number }>}
 */
const getAllAccounts = async (filter, options, isActive) => {
  const whereClause = { ...filter };

  // Apply the isDeleted filter based on the 'deleted' parameter
  if (isActive === 'true') {
    whereClause.isActive = true;
  } else if (isActive === 'false') {
    whereClause.isActive = false;
  } else if (isActive === 'all') {
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

  const { count, rows } = await Account.findAndCountAll({
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
 * Get account by id with optional associations
 * @param {string} id
 * @param {boolean} [includeAssociations=false] - Include related models
 * @returns {Promise<Account>}
 */
const getAccountById = async (id, include = []) => {
  const account = await Account.findByPk(id, { include });

  if (!account) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Account not found');
  }

  return account;
};

/**
 * Update account by id with validation
 * @param {string} accountId
 * @param {Object} updateBody
 * @returns {Promise<Account>}
 */
const updateAccount = async (accountId, updateBody) => {
  const account = await getAccountById(accountId);

  // Check for conflicts with other accounts if name or email is being updated
  if (updateBody.name || updateBody.contactEmail) {
    const existingAccount = await Account.findOne({
      where: {
        [Sequelize.Op.or]: [
          { name: updateBody.name || account.name },
          { contactEmail: updateBody.contactEmail || account.contactEmail },
        ],
        id: { [Sequelize.Op.ne]: accountId },
      },
    });
    if (existingAccount) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Account name or contact email already exists');
    }
  }

  await account.update(updateBody);
  return account;
};

/**
 * Soft delete account by id (set isActive to false)
 * @param {string} accountId
 * @returns {Promise<void>}
 */
const deleteAccount = async (accountId) => {
  const account = await getAccountById(accountId);
  if (!account.isActive) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Account is already inactive');
  }
  await account.update({ isActive: false });
};
const restoreAccount = async (accountId) => {
  const account = await getAccountById(accountId);
  if (account.isActive) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Account is already active');
  }
  await account.update({ isActive: true });
};

/**
 * Permanently delete account by id (hard delete)
 * @param {string} accountId
 * @returns {Promise<void>}
 */
const hardDeleteAccount = async (accountId) => {
  const account = await getAccountById(accountId);
  await account.destroy();
};

module.exports = {
  createAccount,
  getAllAccounts,
  getAccountById,
  updateAccount,
  deleteAccount,
  restoreAccount,
  hardDeleteAccount,
};
