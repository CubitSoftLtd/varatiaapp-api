const Joi = require('joi');

// Custom password validation (at least 8 chars, one letter, one number)
const password = (value, helpers) => {
  if (value.length < 8) {
    return helpers.error('string.min', { limit: 8 });
  }
  if (!/[a-zA-Z]/.test(value) || !/[0-9]/.test(value)) {
    return helpers.error('any.custom', {
      message: 'Password must contain at least one letter and one number',
    });
  }
  return value;
};

// Define user roles based on the model
const roles = {
  SUPER_ADMIN: 'super_admin',
  ACCOUNT_ADMIN: 'account_admin',
  PROPERTY_MANAGER: 'property_manager',
  TENANT: 'tenant',
};

// Reusable ID param schema for UUID v4
const idParamSchema = Joi.object().keys({
  userId: Joi.string()
    .uuid({ version: ['uuidv4'] })
    .required()
    .messages({
      'string.base': 'User ID must be a string',
      'string.empty': 'User ID is required',
      'string.uuid': 'User ID must be a valid UUID v4',
    }),
});

// Schema for creating a new user
const createUser = {
  body: Joi.object().keys({
    name: Joi.string().trim().required().max(200).messages({
      'string.base': 'Name must be a string',
      'string.empty': 'Name is required',
      'string.max': 'Name cannot exceed 200 characters',
    }),
    email: Joi.string().trim().required().email().max(255).messages({
      'string.base': 'Email must be a string',
      'string.empty': 'Email is required',
      'string.email': 'Email must be a valid email address',
      'string.max': 'Email cannot exceed 255 characters',
    }),
    password: Joi.string().required().custom(password).max(255).messages({
      'string.base': 'Password must be a string',
      'string.empty': 'Password is required',
      'string.min': 'Password must be at least 8 characters long',
      'string.max': 'Password cannot exceed 255 characters',
      'any.custom': 'Password must contain at least one letter and one number',
    }),
    role: Joi.string()
      .required()
      .valid(...Object.values(roles))
      .messages({
        'string.base': 'Role must be a string',
        'string.empty': 'Role is required',
        'any.only': `Role must be one of: ${Object.values(roles).join(', ')}`,
      }),
    phoneNumber: Joi.string().trim().max(50).allow(null).messages({
      'string.base': 'Phone number must be a string',
      'string.max': 'Phone number cannot exceed 50 characters',
    }),
    isEmailVerified: Joi.boolean().default(false).messages({
      'boolean.base': 'isEmailVerified must be a boolean',
    }),
  }),
};

// Schema for retrieving multiple users with filtering, sorting, and pagination
const getUsers = {
  query: Joi.object().keys({
    name: Joi.string().trim().max(200).messages({
      'string.base': 'Name must be a string',
      'string.max': 'Name cannot exceed 200 characters',
    }),
    role: Joi.string()
      .valid(...Object.values(roles))
      .messages({
        'string.base': 'Role must be a string',
        'any.only': `Role must be one of: ${Object.values(roles).join(', ')}`,
      }),
    sortBy: Joi.string()
      .pattern(/^[a-zA-Z]+:(asc|desc)$/)
      .messages({
        'string.base': 'SortBy must be a string',
        'string.pattern.base': 'SortBy must be in the format "field:asc" or "field:desc"',
      }),
    limit: Joi.number().integer().min(1).default(10).messages({
      'number.base': 'Limit must be a number',
      'number.integer': 'Limit must be an integer',
      'number.min': 'Limit must be at least 1',
    }),
    page: Joi.number().integer().min(1).default(1).messages({
      'number.base': 'Page must be a number',
      'number.integer': 'Page must be an integer',
      'number.min': 'Page must be at least 1',
    }),
    deleted: Joi.string().valid('true', 'false', 'all').optional().messages({
      'string.base': 'Deleted must be a string',
      'any.only': 'Deleted must be one of "true", "false", or "all"',
    }),
  }),
};

// Schema for retrieving a single user by ID
const getUser = {
  params: idParamSchema,
};

// Schema for updating a user
const updateUser = {
  params: idParamSchema,
  body: Joi.object()
    .keys({
      name: Joi.string().trim().max(200).messages({
        'string.base': 'Name must be a string',
        'string.max': 'Name cannot exceed 200 characters',
      }),
      email: Joi.string().trim().email().max(255).messages({
        'string.base': 'Email must be a string',
        'string.email': 'Email must be a valid email address',
        'string.max': 'Email cannot exceed 255 characters',
      }),
      role: Joi.string()
        .valid(...Object.values(roles))
        .messages({
          'string.base': 'Role must be a string',
          'any.only': `Role must be one of: ${Object.values(roles).join(', ')}`,
        }),

      phoneNumber: Joi.string().trim().max(50).allow(null).messages({
        'string.base': 'Phone number must be a string',
        'string.max': 'Phone number cannot exceed 50 characters',
      }),
      isEmailVerified: Joi.boolean().messages({
        'boolean.base': 'isEmailVerified must be a boolean',
      }),
    })
    .min(1)
    .messages({
      'object.min': 'At least one field must be provided for update',
    }),
};

// Schema for deleting a user
const deleteUser = {
  params: idParamSchema,
};

// Export all schemas and roles
module.exports = {
  roles,
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
};
