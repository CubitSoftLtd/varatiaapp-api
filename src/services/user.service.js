const httpStatus = require('http-status');
const { User, Account } = require('../models');
const ApiError = require('../utils/ApiError');

const DefaultPass = 'Demo#$1234';

/**
 * Create a user
 * @param {Object} userBody
 * @returns {Promise<User>}
 */
const createUser = async (userBody) => {
  if (await User.isEmailTaken(userBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }

  const userData = { ...userBody };

  if (!userData.password) {
    userData.password = DefaultPass;
  }

  if (userData.role === 'super_admin' && userData.accountId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Super admin should not have an accountId');
  }
  if (['account_admin', 'property_manager', 'tenant'].includes(userData.role) && !userData.accountId) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Account ID is required for account_admin, property_manager, and tenant roles'
    );
  }

  if (userData.accountId) {
    const account = await Account.findByPk(userData.accountId);
    if (!account) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Account not found');
    }
    if (!account.isActive) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot create user under an inactive account');
    }
    userData.isActive = account.isActive;
  }

  const user = await User.create(userData);
  return user;
};

/**
 * Query for users
 * @param {Object} filter - Sequelize filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<{ results: User[], page: number, limit: number, totalPages: number, totalResults: number }>}
 */
const queryUsers = async (filter, options, deleted = 'false') => {
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

  const { count, rows } = await User.findAndCountAll({
    where: whereClause,
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
 * Get user by email
 * @param {string} email
 * @returns {Promise<User>}
 */
const getUserByEmail = async (email) => {
  if (!email) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email is required');
  }

  const user = await User.findOne({
    where: { email },
    include: [{ model: Account, as: 'account' }],
  });

  if (!user || (user.accountId && user.Account && !user.Account.isActive)) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found or account is inactive');
  }

  if (user.accountId && user.Account && user.isActive !== user.Account.isActive) {
    try {
      await user.update({ isActive: user.Account.isActive });
      /* eslint-disable-next-line no-console */
      console.log(
        `User ${user.isActive ? 'Activated' : 'Deactivated'} due to Account Status: ${user.name || 'Unknown'} (${
          user.email || 'No Email'
        })`
      );
    } catch (error) {
      /* eslint-disable-next-line no-console */
      console.error(`Error updating user ${user.id} status: ${error.message}`);
    }
  }

  return user;
};

/**
 * Get user by id
 * @param {string} id
 * @returns {Promise<User>}
 */
const getUserById = async (id) => {
  const user = await User.findByPk(id, {
    include: [{ model: Account, as: 'account' }],
  });
  if (!user || (user.accountId && user.Account && !user.Account.isActive)) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found or account is inactive');
  }

  if (user.accountId && user.Account && user.isActive !== user.Account.isActive) {
    try {
      await user.update({ isActive: user.Account.isActive });
      /* eslint-disable-next-line no-console */
      console.log(
        `User ${user.isActive ? 'Activated' : 'Deactivated'} due to Account Status: ${user.name || 'Unknown'} (${
          user.email || 'No Email'
        })`
      );
    } catch (error) {
      /* eslint-disable-next-line no-console */
      console.error(`Error updating user ${id} status: ${error.message}`);
    }
  }

  return user;
};

/**
 * Update user by id
 * @param {string} userId
 * @param {Object} updateBody
 * @returns {Promise<User>}
 */
const updateUserById = async (userId, updateBody) => {
  const user = await getUserById(userId);

  // Validate email uniqueness if email is being updated
  if (updateBody.email && updateBody.email !== user.email && (await User.isEmailTaken(updateBody.email, userId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }

  // Create a new object to avoid param reassignment
  const userData = { ...updateBody };

  // Determine new role and accountId, defaulting to existing values if not provided
  const newRole = userData.role || user.role;
  const newAccountId = userData.accountId !== undefined ? userData.accountId : user.accountId;

  // Validate role and accountId consistency
  if (newRole === 'super_admin' && newAccountId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Super admin should not have an accountId');
  }
  if (['account_admin', 'property_manager', 'tenant'].includes(newRole) && !newAccountId) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Account ID is required for account_admin, property_manager, and tenant roles'
    );
  }

  // Validate and update accountId if provided
  if (userData.accountId !== undefined) {
    const account = await Account.findByPk(userData.accountId);
    if (!account) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Account not found');
    }
    if (!account.isActive) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot assign user to an inactive account');
    }
    userData.isActive = account.isActive; // Sync isActive with account status
  } else if (user.accountId && user.Account) {
    userData.isActive = user.Account.isActive; // Maintain existing account status if unchanged
  }

  const updatedUser = await user.update(userData);

  return updatedUser;
};

/**
 * Delete user by id
 * @param {string} userId
 * @returns {Promise<void>}
 */
const deleteUserById = async (userId) => {
  const user = await getUserById(userId);
  await user.destroy();
};
const restoreUserById = async (userId) => {
  const user = await getUserById(userId);
  await user.destroy();
};

module.exports = {
  createUser,
  queryUsers,
  getUserByEmail,
  getUserById,
  updateUserById,
  restoreUserById,
  deleteUserById,
};
