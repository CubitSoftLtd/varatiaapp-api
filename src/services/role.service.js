const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { roleRights, roles } = require('../config/roles');

const getRoles = async (filter = {}) => {
  let roleList = roles;
  if (filter.roleName) {
    roleList = roleList.filter((name) => name === filter.roleName);
  }
  const rolesData = roleList.map((name) => ({
    name,
    permissions: roleRights.get(name) || [],
  }));
  if (!rolesData.length) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No roles found');
  }
  return { roles: rolesData };
};

module.exports = {
  getRoles,
};
