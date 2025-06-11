const Joi = require('joi');

const getRoles = {
  query: Joi.object().keys({
    roleName: Joi.string().valid('super_admin', 'account_admin', 'property_manager', 'tenant').messages({
      'string.base': 'Role name must be a string',
      'any.valid': 'Invalid role name',
    }),
  }),
};

module.exports = {
  getRoles,
};
