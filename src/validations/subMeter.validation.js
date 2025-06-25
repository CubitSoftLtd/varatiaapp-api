const Joi = require('joi');

const statusTypes = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  MAINTENANCE: 'maintenance',
  RETIRED: 'retired',
};

const createSubmeter = {
  body: Joi.object().keys({
    number: Joi.string().required().min(1).max(100).messages({
      'string.base': 'Number must be a string',
      'string.empty': 'Number is required',
      'string.min': 'Number must be at least 1 character long',
      'string.max': 'Number cannot exceed 100 characters',
    }),
    meterId: Joi.string()
      .uuid({ version: ['uuidv4'] })
      .required()
      .messages({
        'string.base': 'Meter ID must be a string',
        'string.empty': 'Meter ID is required',
        'string.uuid': 'Meter ID must be a valid UUID',
      }),
    unitId: Joi.string()
      .uuid({ version: ['uuidv4'] })
      .required()
      .messages({
        'string.base': 'Unit ID must be a string',
        'string.empty': 'Unit ID is required',
        'string.uuid': 'Unit ID must be a valid UUID',
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
  }),
};

const getSubmeters = {
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
    meterId: Joi.string()
      .uuid({ version: ['uuidv4'] })
      .messages({
        'string.base': 'Meter ID must be a string',
        'string.uuid': 'Meter ID must be a valid UUID',
      }),
    unitId: Joi.string()
      .uuid({ version: ['uuidv4'] })
      .messages({
        'string.base': 'Unit ID must be a string',
        'string.uuid': 'Unit ID must be a valid UUID',
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
      'string.base': 'include must be a string',
    }), // Added include parameter
    deleted: Joi.string().valid('true', 'false', 'all').optional().messages({
      'string.base': 'Deleted must be a string',
      'any.only': 'Deleted must be one of "true", "false", or "all"',
    }),
  }),
};

const getSubmeter = {
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
      'string.base': 'include must be a string',
    }), // Added include parameter
  }),
};

const updateSubmeter = {
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
      meterId: Joi.string()
        .uuid({ version: ['uuidv4'] })
        .messages({
          'string.base': 'Meter ID must be a string',
          'string.uuid': 'Meter ID must be a valid UUID',
        }),
      unitId: Joi.string()
        .uuid({ version: ['uuidv4'] })
        .messages({
          'string.base': 'Unit ID must be a string',
          'string.uuid': 'Unit ID must be a valid UUID',
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
    })
    .min(1)
    .messages({
      'object.min': 'At least one field must be provided for update',
    }),
};

const deleteSubmeter = {
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

const deleteHardSubmeter = {
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
  createSubmeter,
  getSubmeters,
  getSubmeter,
  updateSubmeter,
  deleteSubmeter,
  deleteHardSubmeter,
};
