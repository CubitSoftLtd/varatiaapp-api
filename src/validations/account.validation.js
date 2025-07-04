const Joi = require('joi');

const subscriptionTypes = {
  FREE: 'free',
  BASIC: 'basic',
  PREMIUM: 'premium',
  ENTERPRISE: 'enterprise',
};

// Reusable ID param schema for UUID v4
const idParamSchema = Joi.object().keys({
  id: Joi.string()
    .uuid({ version: ['uuidv4'] })
    .required()
    .messages({
      'string.base': 'ID must be a string',
      'string.empty': 'ID is required',
      'string.uuid': 'ID must be a valid UUID',
    }),
});

const createAccount = {
  body: Joi.object().keys({
    name: Joi.string().trim().required().min(3).max(255).messages({
      'string.base': 'Name must be a string',
      'string.empty': 'Name is required',
      'string.min': 'Name must be at least 3 characters long',
      'string.max': 'Name cannot exceed 255 characters',
    }),
    subscriptionType: Joi.string()
      .valid(...Object.values(subscriptionTypes))
      .default(subscriptionTypes.FREE)
      .messages({
        'string.base': 'Subscription type must be a string',
        'any.only': `Subscription type must be one of: ${Object.values(subscriptionTypes).join(', ')}`,
      }),
    contactName: Joi.string().trim().required().min(3).max(255).messages({
      'string.base': 'Contact name must be a string',
      'string.empty': 'Contact name is required',
      'string.min': 'Contact name must be at least 3 characters long',
      'string.max': 'Contact name cannot exceed 255 characters',
    }),
    contactEmail: Joi.string().trim().required().email().messages({
      'string.base': 'Contact email must be a string',
      'string.empty': 'Contact email is required',
      'string.email': 'Contact email must be a valid email address',
    }),
    contactPhone: Joi.string()
      .trim()
      .pattern(/^\+?[0-9\s-]{5,50}$/)
      .required()
      .messages({
        'string.base': 'Contact phone must be a string',
        'string.empty': 'Contact phone is required',
        'string.pattern.base': 'Contact phone must contain only numbers, spaces, dashes, or a leading plus',
        'any.required': 'Contact phone is required',
      }),
    isActive: Joi.boolean().default(true).messages({
      'boolean.base': 'isActive must be a boolean',
    }),
    subscriptionExpiry: Joi.date().allow(null).messages({
      'date.base': 'Subscription expiry must be a valid date',
    }),
  }),
};

const getAccounts = {
  query: Joi.object().keys({
    name: Joi.string().trim().min(1).max(255).messages({
      'string.base': 'Name must be a string',
      'string.min': 'Name must be at least 1 character long',
      'string.max': 'Name cannot exceed 255 characters',
    }),
    subscriptionType: Joi.string()
      .valid(...Object.values(subscriptionTypes))
      .messages({
        'string.base': 'Subscription type must be a string',
        'any.only': `Subscription type must be one of: ${Object.values(subscriptionTypes).join(', ')}`,
      }),
    sortBy: Joi.string()
      .pattern(/^[a-zA-Z]+:(asc|desc)$/)
      .messages({
        'string.base': 'SortBy must be a string',
        'string.pattern.base':
          'SortBy must be one or more fields in the format "field:asc" or "field:desc", comma-separated',
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
    include: Joi.string().optional().messages({
      'string.base': 'Include must be a string',
    }), // Added include parameter
    isActive: Joi.string().valid('true', 'false', 'all').optional().messages({
      'string.base': 'isActive must be a string',
      'any.only': 'isActive must be one of "true", "false", or "all"',
    }),
  }),
};

const getAccount = {
  params: idParamSchema,
  query: Joi.object().keys({
    include: Joi.string().optional().messages({
      'string.base': 'Include must be a string',
    }), // Added include parameter
  }),
};

const updateAccount = {
  params: idParamSchema,
  body: Joi.object()
    .keys({
      name: Joi.string().trim().min(3).max(255).messages({
        'string.base': 'Name must be a string',
        'string.min': 'Name must be at least 3 characters long',
        'string.max': 'Name cannot exceed 255 characters',
      }),
      subscriptionType: Joi.string()
        .valid(...Object.values(subscriptionTypes))
        .messages({
          'string.base': 'Subscription type must be a string',
          'any.only': `Subscription type must be one of: ${Object.values(subscriptionTypes).join(', ')}`,
        }),
      contactName: Joi.string().trim().min(3).max(255).messages({
        'string.base': 'Contact name must be a string',
        'string.min': 'Contact name must be at least 3 characters long',
        'string.max': 'Contact name cannot exceed 255 characters',
      }),
      contactEmail: Joi.string().trim().email().messages({
        'string.base': 'Contact email must be a string',
        'string.email': 'Contact email must be a valid email address',
      }),
      contactPhone: Joi.string()
        .trim()
        .pattern(/^\+?[0-9\s-]{5,50}$/)
        .messages({
          'string.base': 'Contact phone must be a string',
          'string.pattern.base': 'Contact phone must contain only numbers, spaces, dashes, or a leading plus',
        }),
      isActive: Joi.boolean().messages({
        'boolean.base': 'isActive must be a boolean',
      }),
      subscriptionExpiry: Joi.date().allow(null).messages({
        'date.base': 'Subscription expiry must be a valid date',
      }),
    })
    .min(1)
    .messages({
      'object.min': 'At least one field must be provided for update',
    }),
};

// Both soft and hard delete use the same schema
const deleteAccount = {
  params: Joi.object().keys({
    id: Joi.string()
      .uuid({ version: ['uuidv4'] })
      .required()
      .messages({
        'string.base': 'ID must be a string',
        'string.empty': 'ID is required',
        'string.uuid': 'ID must be a valid UUID',
      }),
  }),
};
const restoreAccount = {
  params: Joi.object().keys({
    id: Joi.string()
      .uuid({ version: ['uuidv4'] })
      .required()
      .messages({
        'string.base': 'ID must be a string',
        'string.empty': 'ID is required',
        'string.uuid': 'ID must be a valid UUID',
      }),
  }),
};

module.exports = {
  subscriptionTypes,
  createAccount,
  getAccounts,
  getAccount,
  updateAccount,
  restoreAccount,
  deleteAccount,
};
