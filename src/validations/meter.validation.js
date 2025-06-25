const Joi = require('joi');

const statusTypes = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  MAINTENANCE: 'maintenance',
  RETIRED: 'retired',
};

const createMeter = {
  body: Joi.object().keys({
    number: Joi.string().required().min(1).max(100).messages({
      'string.base': 'Number must be a string',
      'string.empty': 'Number is required',
      'string.min': 'Number must be at least 1 character long',
      'string.max': 'Number cannot exceed 100 characters',
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
      .uuid({ version: ['uuidv4'] })
      .required()
      .messages({
        'string.base': 'Utility type ID must be a string',
        'string.empty': 'Utility type ID is required',
        'string.uuid': 'Utility type ID must be a valid UUID',
      }),
    status: Joi.string()
      .valid(...Object.values(statusTypes))
      .default('active')
      .messages({
        'string.base': 'Status must be a string',
        'any.only': 'Status must be one of: active, inactive, maintenance, retired',
      }),
    installedDate: Joi.date().allow(null).messages({
      'date.base': 'Installed date must be a valid date',
    }),
    lastReadingDate: Joi.date().allow(null).messages({
      'date.base': 'Last reading date must be a valid date',
    }),
    description: Joi.string().allow(null).max(65535).messages({
      'string.base': 'Description must be a string',
      'string.max': 'Description cannot exceed 65535 characters',
    }),
  }),
};

const getMeters = {
  query: Joi.object().keys({
    number: Joi.string().min(1).max(100).messages({
      'string.base': 'Number must be a string',
      'string.min': 'Number must be at least 1 character long',
      'string.max': 'Number cannot exceed 100 characters',
    }),
    status: Joi.string()
      .valid(...Object.values(statusTypes))
      .messages({
        'string.base': 'Status must be a string',
        'any.only': 'Status must be one of: active, inactive, maintenance, retired',
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
    deleted: Joi.string().valid('true', 'false', 'all').optional().messages({
      'string.base': 'Deleted must be a string',
      'any.only': 'Deleted must be one of "true", "false", or "all"',
    }),
  }),
};

const getMeter = {
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

const updateMeter = {
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
      number: Joi.string().min(1).max(100).messages({
        'string.base': 'Number must be a string',
        'string.min': 'Number must be at least 1 character long',
        'string.max': 'Number cannot exceed 100 characters',
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
        .valid(...Object.values(statusTypes))
        .messages({
          'string.base': 'Status must be a string',
          'any.only': 'Status must be one of: active, inactive, maintenance, retired',
        }),
      installedDate: Joi.date().allow(null).messages({
        'date.base': 'Installed date must be a valid date',
      }),
      lastReadingDate: Joi.date().allow(null).messages({
        'date.base': 'Last reading date must be a valid date',
      }),
      description: Joi.string().allow(null).max(65535).messages({
        'string.base': 'Description must be a string',
        'string.max': 'Description cannot exceed 65535 characters',
      }),
    })
    .min(1)
    .messages({
      'object.min': 'At least one field must be provided for update',
    }),
};

const deleteMeter = {
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

const deleteHardMeter = {
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
  createMeter,
  getMeters,
  getMeter,
  updateMeter,
  deleteMeter,
  deleteHardMeter,
};
