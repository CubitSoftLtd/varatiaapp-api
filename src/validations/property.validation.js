const Joi = require('joi');

const createProperty = {
  body: Joi.object().keys({
    name: Joi.string().required().min(3).max(100).messages({
      'string.base': 'Name must be a string',
      'string.empty': 'Name is required',
      'string.min': 'Name must be at least 3 characters long',
      'string.max': 'Name cannot exceed 100 characters',
    }),
    address: Joi.string().required().min(5).max(255).messages({
      'string.base': 'Address must be a string',
      'string.empty': 'Address is required',
      'string.min': 'Address must be at least 5 characters long',
      'string.max': 'Address cannot exceed 255 characters',
    }),
    accountId: Joi.string()
      .required()
      .uuid({ version: ['uuidv4'] })
      .messages({
        'string.base': 'Account ID must be a string',
        'string.empty': 'Account ID is required',
        'string.uuid': 'Account ID must be a valid UUID',
      }),
  }),
};

const getProperties = {
  query: Joi.object().keys({
    filter: Joi.string().allow('').max(500).messages({
      'string.base': 'Filter must be a string',
      'string.max': 'Filter cannot exceed 500 characters',
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

const getProperty = {
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

const updateProperty = {
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
      address: Joi.string().min(5).max(255).messages({
        'string.base': 'Address must be a string',
        'string.min': 'Address must be at least 5 characters long',
        'string.max': 'Address cannot exceed 255 characters',
      }),
      accountId: Joi.string()
        .uuid({ version: ['uuidv4'] })
        .messages({
          'string.base': 'Account ID must be a string',
          'string.uuid': 'Account ID must be a valid UUID',
        }),
    })
    .min(1)
    .messages({
      'object.min': 'At least one field (name, address, or accountId) must be provided for update',
    }),
};

const deleteProperty = {
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
  createProperty,
  getProperties,
  getProperty,
  updateProperty,
  deleteProperty,
};
