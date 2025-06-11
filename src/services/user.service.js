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
  // Validate email uniqueness
  if (await User.isEmailTaken(userBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }

  // Create a new object to avoid param reassignment
  const userData = { ...userBody };

  // Set default password if not provided
  if (!userData.password) {
    userData.password = DefaultPass;
  }

  // Validate accountId based on role
  if (userData.role === 'super_admin' && userData.accountId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Super admin should not have an accountId');
  }
  if ((userData.role === 'admin' || userData.role === 'tenant') && !userData.accountId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Admin and tenant must have an accountId');
  }

  // Verify the account exists and is active
  if (userData.accountId) {
    const account = await Account.findByPk(userData.accountId);
    if (!account) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Account not found');
    }
    if (!account.isActive) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot create user under an inactive account');
    }
    // Set user status based on account status
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
const queryUsers = async (filter, options) => {
  const limit = options.limit && parseInt(options.limit, 10) > 0 ? parseInt(options.limit, 10) : 10;
  const page = options.page && parseInt(options.page, 10) > 0 ? parseInt(options.page, 10) : 1;
  const offset = (page - 1) * limit;

  const sort = [];
  if (options.sortBy) {
    const [field, order] = options.sortBy.split(':');
    sort.push([field, order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC']);
  }

  const { count, rows } = await User.findAndCountAll({
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

  if (!user && user.account.isActive === false) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  // Sync user status with account status
  if (user.accountId && user.Account && user.isActive !== user.Account.isActive) {
    try {
      await user.update({ isActive: user.Account.isActive });
      /* eslint-disable */
      console.log(
        `User ${user.isActive ? 'Activated' : 'Deactivated'} due to Account Status: ${user.name || 'Unknown'} (${
          user.email || 'No Email'
        })`
      );
    } catch (error) {
      console.error(`Error updating user ${user.id} status: ${error}`);
    }
    /* eslint-disable */
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
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  // Sync user status with account status
  if (user.accountId && user.Account && user.isActive !== user.Account.isActive) {
    try {
      await user.update({ isActive: user.Account.isActive });
      /* eslint-disable no-console */
      console.log(
        `User ${user.isActive ? 'Activated' : 'Deactivated'} due to Account Status: ${user.name || 'Unknown'} (${
          user.email || 'No Email'
        })`
      );
    } catch (error) {
      console.error(`Error updating user ${id} status: ${error.message}`);
    }
    /* eslint-enable no-console */
  }

  return user;
};

/**
 * Update user by id
 * @param {string} userId
 * @param {Object} updateBody
 * @returns {Promise<User>}
 */
const updateUser = async (userId, updateBody) => {
  const user = await getUserById(userId);

  // Validate email uniqueness if email is being updated
  if (updateBody.email && updateBody.email !== user.email && (await User.isEmailTaken(updateBody.email, userId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }

  // Create a new object to avoid param reassignment
  const userData = { ...updateBody };

  // Validate accountId based on role
  const newAccountId = userData.accountId !== undefined ? userData.accountId : user.accountId;
  const newRole = userData.role || user.role;
  if (newRole === 'super_admin' && newAccountId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Super admin should not have an accountId');
  }
  if ((newRole === 'admin' || newRole === 'tenant') && !newAccountId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Admin and tenant must have an accountId');
  }

  // Verify the new account exists and is active
  if (userData.accountId) {
    const account = await Account.findByPk(userData.accountId);
    if (!account) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Account not found');
    }
    if (!account.isActive) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot assign user to an inactive account');
    }
    userData.isActive = account.isActive;
  }

  const updatedUser = await user.update(userData);

  /* eslint-disable no-console */
  try {
    console.log(`User Updated: ${updatedUser.name || 'Unknown'} (${updatedUser.email || 'No Email'})`);
  } catch (error) {
    console.error(`Error logging user update for ${userId}: ${error.message}`);
  }
  /* eslint-enable no-console */

  return updatedUser;
};

/**
 * Delete user by id
 * @param {string} userId
 * @returns {Promise<void>}
 */
const deleteUser = async (userId) => {
  const user = await getUserById(userId);
  await user.destroy();

  /* eslint-disable no-console */
  try {
    console.log(`User Deleted: ${user.name || 'Unknown'} (${user.email || 'No Email'})`);
  } catch (error) {
    console.error(`Error logging user deletion for ${userId}: ${error.message}`);
  }
  /* eslint-enable no-console */
};

module.exports = {
  createUser,
  queryUsers,
  getUserByEmail,
  getUserById,
  updateUser,
  deleteUser,
};
