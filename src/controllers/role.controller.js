const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { roleService } = require('../services');

const getRoles = catchAsync(async (req, res) => {
  const roles = await roleService.getRoles();
  res.status(httpStatus.OK).json(roles);
});

const getMyPermissions = catchAsync(async (req, res) => {
  // Validate the roleName from request
  req.roleName = req.user.role.toLowerCase();

  // eslint-disable-next-line no-console
  console.log(req);

  if (!req.roleName) {
    return res.status(httpStatus.BAD_REQUEST).json({ message: 'Role name is required' });
  }
  if (!['super_admin', 'account_admin', 'property_manager', 'tenant'].includes(req.roleName)) {
    return res.status(httpStatus.BAD_REQUEST).json({ message: 'Invalid role name' });
  }
  // Fetch role permissions
  const roles = await roleService.getRoles({ roleName: req.roleName });
  res.status(httpStatus.OK).json(roles);
});

module.exports = {
  getRoles,
  getMyPermissions,
};
