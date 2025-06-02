const Joi = require('joi');

const meterStatuses = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  MAINTENANCE: 'maintenance',
};

const createMeter = {
  params: Joi.object().keys({
    propertyId: Joi.string()
      .uuid({ version: ['uuidv4'] })
      .required()
      .messages({
        'string.base': 'Property ID must be a string',
        'string.empty': 'Property ID is required',
        'string.uuid': 'Property ID must be a valid UUID',
      }),
  }),
  body: Joi.object().keys({
    number: Joi.string().required().min(3).max(50).messages({
      'string.base': 'Number must be a string',
      'string.empty': 'Number is required',
      'string.min': 'Number must be at least 3 characters long',
      'string.max': 'Number cannot exceed 50 characters',
    }),
    propertyId: Joi.string()
      .uuid({ version: ['uuidv4'] })
      .required()
      .messages({
        'string.base': 'Property ID must be a string',
        'string.empty': 'Property ID is required',
        'string.uuid': 'Property ID must be a valid UUID',
      }),
    utilityTypeId: Joi.string()
      .required()
      .uuid({ version: ['uuidv4'] })
      .messages({
        'string.base': 'Utility type ID must be a string',
        'string.empty': 'Utility type ID is required',
        'string.uuid': 'Utility type ID must be a valid UUID',
      }),
    status: Joi.string()
      .valid(...Object.values(meterStatuses))
      .default('active')
      .messages({
        'string.base': 'Status must be a string',
        'any.only': 'Status must be one of: active, inactive, maintenance',
      }),
  }),
};

const getMeters = {
  params: Joi.object().keys({
    propertyId: Joi.string()
      .uuid({ version: ['uuidv4'] })
      .required()
      .messages({
        'string.base': 'Property ID must be a string',
        'string.empty': 'Property ID is required',
        'string.uuid': 'Property ID must be a valid UUID',
      }),
  }),
  query: Joi.object().keys({
    number: Joi.string().min(1).max(50).messages({
      'string.base': 'Number must be a string',
      'string.min': 'Number must be at least 1 character long',
      'string.max': 'Number cannot exceed 50 characters',
    }),
    status: Joi.string()
      .valid(...Object.values(meterStatuses))
      .messages({
        'string.base': 'Status must be a string',
        'any.only': 'Status must be one of: active, inactive, maintenance',
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

const getMeter = {
  params: Joi.object().keys({
    propertyId: Joi.string()
      .uuid({ version: ['uuidv4'] })
      .required()
      .messages({
        'string.base': 'Property ID must be a string',
        'string.empty': 'Property ID is required',
        'string.uuid': 'Property ID must be a valid UUID',
      }),
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

const updateMeter = {
  params: Joi.object().keys({
    propertyId: Joi.string()
      .uuid({ version: ['uuidv4'] })
      .required()
      .messages({
        'string.base': 'Property ID must be a string',
        'string.empty': 'Property ID is required',
        'string.uuid': 'Property ID must be a valid UUID',
      }),
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
      number: Joi.string().min(3).max(50).messages({
        'string.base': 'Number must be a string',
        'string.min': 'Number must be at least 3 characters long',
        'string.max': 'Number cannot exceed 50 characters',
      }),
      propertyId: Joi.string()
        .uuid({ version: ['uuidv4'] })
        .messages({
          'string.base': 'Property ID must be a string',
          'string.uuid': 'Property ID must be a valid UUID',
        }),
      utilityTypeId: Joi.string()
        .uuid({ version: ['uuidv4'] })
        .messages({
          'string.base': 'Utility type ID must be a string',
          'string.uuid': 'Utility type ID must be a valid UUID',
        }),
      status: Joi.string()
        .valid(...Object.values(meterStatuses))
        .messages({
          'string.base': 'Status must be a string',
          'any.only': 'Status must be one of: active, inactive, maintenance',
        }),
    })
    .min(1)
    .messages({
      'object.min': 'At least one field (number, propertyId, utilityTypeId, or status) must be provided for update',
    }),
};

const deleteMeter = {
  params: Joi.object().keys({
    propertyId: Joi.string()
      .uuid({ version: ['uuidv4'] })
      .required()
      .messages({
        'string.base': 'Property ID must be a string',
        'string.empty': 'Property ID is required',
        'string.uuid': 'Property ID must be a valid UUID',
      }),
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
  createMeter,
  getMeters,
  getMeter,
  updateMeter,
  deleteMeter,
};
