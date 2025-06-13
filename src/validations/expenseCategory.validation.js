const Joi = require('joi');

const categoryTypes = {
  PROPERTY_RELATED: 'property_related',
  TENANT_CHARGEABLE: 'tenant_chargeable',
  ADMINISTRATIVE: 'administrative',
  PERSONAL: 'personal',
};

const createExpenseCategory = {
  body: Joi.object().keys({
    name: Joi.string().required().min(1).max(100).messages({
      'string.base': 'Name must be a string',
      'string.empty': 'Name is required',
      'string.min': 'Name must be at least 1 character long',
      'string.max': 'Name cannot exceed 100 characters',
    }),
    categoryType: Joi.string()
      .valid(...Object.values(categoryTypes))
      .required()
      .messages({
        'string.base': 'Category type must be a string',
        'string.empty': 'Category type is required',
        'any.only': 'Category type must be one of: property_related, tenant_chargeable, administrative, personal',
      }),
    description: Joi.string().allow(null, '').messages({
      'string.base': 'Description must be a string',
    }),
  }),
};

const getExpenseCategories = {
  query: Joi.object().keys({
    name: Joi.string().min(1).max(100).messages({
      'string.base': 'Name must be a string',
      'string.min': 'Name must be at least 1 character long',
      'string.max': 'Name cannot exceed 100 characters',
    }),
    categoryType: Joi.string()
      .valid(...Object.values(categoryTypes))
      .messages({
        'string.base': 'Category type must be a string',
        'any.only': 'Category type must be one of: property_related, tenant_chargeable, administrative, personal',
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
    include: Joi.string().optional().messages({
      'string.base': 'Include must be a string',
    }), // Added include parameter
  }),
};

const getExpenseCategory = {
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
  query: Joi.object().keys({
    include: Joi.string().optional().messages({
      'string.base': 'Include must be a string',
    }), // Added include parameter
  }),
};

const updateExpenseCategory = {
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
      name: Joi.string().min(1).max(100).messages({
        'string.base': 'Name must be a string',
        'string.min': 'Name must be at least 1 character long',
        'string.max': 'Name cannot exceed 100 characters',
      }),
      categoryType: Joi.string()
        .valid(...Object.values(categoryTypes))
        .messages({
          'string.base': 'Category type must be a string',
          'any.only': 'Category type must be one of: property_related, tenant_chargeable, administrative, personal',
        }),
      description: Joi.string().allow(null, '').messages({
        'string.base': 'Description must be a string',
      }),
    })
    .min(1)
    .messages({
      'object.min': 'At least one field must be provided for update',
    }),
};

const deleteExpenseCategory = {
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

const deleteHardExpenseCategory = {
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
  createExpenseCategory,
  getExpenseCategories,
  getExpenseCategory,
  updateExpenseCategory,
  deleteExpenseCategory,
  deleteHardExpenseCategory,
};
