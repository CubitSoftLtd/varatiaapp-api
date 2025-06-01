const Joi = require('joi');

const subscriptionTypes = {
  FREE: 'free',
  BASIC: 'basic',
  PREMIUM: 'premium',
};

const createAccount = {
  body: Joi.object().keys({
    name: Joi.string().required().min(3).max(100).messages({
      'string.base': 'Name must be a string',
      'string.empty': 'Name is required',
      'string.min': 'Name must be at least 3 characters long',
      'string.max': 'Name cannot exceed 100 characters',
    }),
    subscriptionType: Joi.string()
      .valid(...Object.values(subscriptionTypes))
      .default('free')
      .messages({
        'string.base': 'Subscription type must be a string',
        'any.only': 'Subscription type must be one of: free, basic, premium',
      }),
    contactName: Joi.string().required().min(3).max(100).messages({
      'string.base': 'Contact name must be a string',
      'string.empty': 'Contact name is required',
      'string.min': 'Contact name must be at least 3 characters long',
      'string.max': 'Contact name cannot exceed 100 characters',
    }),
    contactEmail: Joi.string().required().email().messages({
      'string.base': 'Contact email must be a string',
      'string.empty': 'Contact email is required',
      'string.email': 'Contact email must be a valid email address',
    }),
    contactPhone: Joi.string().allow(null).min(5).max(20).messages({
      'string.base': 'Contact phone must be a string',
      'string.min': 'Contact phone must be at least 5 characters long',
      'string.max': 'Contact phone cannot exceed 20 characters',
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
    name: Joi.string().min(1).max(100).messages({
      'string.base': 'Name must be a string',
      'string.min': 'Name must be at least 1 character long',
      'string.max': 'Name cannot exceed 100 characters',
    }),
    subscriptionType: Joi.string()
      .valid(...Object.values(subscriptionTypes))
      .messages({
        'string.base': 'Subscription type must be a string',
        'any.only': 'Subscription type must be one of: free, basic, premium',
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
  }),
};

const getAccount = {
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

const updateAccount = {
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
  body: Joi.object()
    .keys({
      name: Joi.string().min(3).max(100).messages({
        'string.base': 'Name must be a string',
        'string.min': 'Name must be at least 3 characters long',
        'string.max': 'Name cannot exceed 100 characters',
      }),
      subscriptionType: Joi.string()
        .valid(...Object.values(subscriptionTypes))
        .messages({
          'string.base': 'Subscription type must be a string',
          'any.only': 'Subscription type must be one of: free, basic, premium',
        }),
      contactName: Joi.string().min(3).max(100).messages({
        'string.base': 'Contact name must be a string',
        'string.min': 'Contact name must be at least 3 characters long',
        'string.max': 'Contact name cannot exceed 100 characters',
      }),
      contactEmail: Joi.string().email().messages({
        'string.base': 'Contact email must be a string',
        'string.email': 'Contact email must be a valid email address',
      }),
      contactPhone: Joi.string().allow(null).min(5).max(20).messages({
        'string.base': 'Contact phone must be a string',
        'string.min': 'Contact phone must be at least 5 characters long',
        'string.max': 'Contact phone cannot exceed 20 characters',
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

module.exports = {
  createAccount,
  getAccounts,
  getAccount,
  updateAccount,
  deleteAccount,
};
