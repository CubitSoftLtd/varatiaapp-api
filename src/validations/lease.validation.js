const Joi = require('joi');

const statusTypes = {
  ACTIVE: 'active',
  TERMINATED: 'terminated',
};
const createLease = {
  body: Joi.object().keys({
    unitId: Joi.string()
      .uuid({ version: ['uuidv4'] })
      .required()
      .messages({
        'string.base': 'Unit ID must be a string',
        'string.uuid': 'Unit ID must be a valid UUID',
      }),
    tenantId: Joi.string()
      .uuid({ version: ['uuidv4'] })
      .required()
      .messages({
        'string.base': 'Tenant ID must be a string',
        'string.uuid': 'Tenant ID must be a valid UUID',
      }),
    propertyId: Joi.string()
      .uuid({ version: ['uuidv4'] })
      .required()
      .messages({
        'string.base': 'propertyId ID must be a string',
        'string.uuid': 'propertyId ID must be a valid UUID',
      }),
    leaseStartDate: Joi.date().required().messages({
      'date.base': 'Lease start date must be a valid date',
      'any.required': 'Lease start date is required',
    }),
    startedMeterReading: Joi.number().required(),
    leaseEndDate: Joi.date().allow(null).messages({
      'date.base': 'Lease end date must be a valid date',
    }),

    moveInDate: Joi.date().allow(null).messages({
      'date.base': 'Move-in date must be a valid date',
    }),
    moveOutDate: Joi.date().allow(null).messages({
      'date.base': 'Move-out date must be a valid date',
    }),
    notes: Joi.string().max(65535).allow(null).messages({
      'string.base': 'Notes must be a string',
      'string.max': 'Notes cannot exceed 65535 characters',
    }),
  }),
};

const getLeases = {
  query: Joi.object().keys({
    unitId: Joi.string()
      .uuid({ version: ['uuidv4'] })
      .messages({
        'string.base': 'Unit ID must be a string',
        'string.uuid': 'Unit ID must be a valid UUID',
      }),
    tenantId: Joi.string()
      .uuid({ version: ['uuidv4'] })
      .messages({
        'string.base': 'Tenant ID must be a string',
        'string.uuid': 'Tenant ID must be a valid UUID',
      }),
    propertyId: Joi.string()
      .uuid({ version: ['uuidv4'] })
      .messages({
        'string.base': 'Property ID must be a string',
        'string.uuid': 'Property ID must be a valid UUID',
      }),
    status: Joi.string()
      .valid(...Object.values(statusTypes))
      // .default('active')
      .messages({
        'string.base': 'Status must be a string',
        'any.only': 'Status must be one of: active, terminated',
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

const getLease = {
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

const updateLease = {
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
      unitId: Joi.string()
        .uuid({ version: ['uuidv4'] })
        .allow(null)
        .messages({
          'string.base': 'Unit ID must be a string',
          'string.uuid': 'Unit ID must be a valid UUID',
        }),
      tenantId: Joi.string()
        .uuid({ version: ['uuidv4'] })
        .required()
        .messages({
          'string.base': 'Tenant ID must be a string',
          'string.uuid': 'Tenant ID must be a valid UUID',
        }),
      propertyId: Joi.string()
        .uuid({ version: ['uuidv4'] })
        .required()
        .messages({
          'string.base': 'Property ID must be a string',
          'string.uuid': 'Property ID must be a valid UUID',
        }),
      leaseStartDate: Joi.date().messages({
        'date.base': 'Lease start date must be a valid date',
      }),
      leaseEndDate: Joi.date().allow(null).messages({
        'date.base': 'Lease end date must be a valid date',
      }),

      moveInDate: Joi.date().allow(null).messages({
        'date.base': 'Move-in date must be a valid date',
      }),
      moveOutDate: Joi.date().allow(null).messages({
        'date.base': 'Move-out date must be a valid date',
      }),
      notes: Joi.string().max(65535).allow(null).messages({
        'string.base': 'Notes must be a string',
        'string.max': 'Notes cannot exceed 65535 characters',
      }),
    })
    .min(1)
    .messages({
      'object.min': 'At least one field must be provided for update',
    }),
};

const deleteLease = {
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

const deleteHardLease = {
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
  createLease,
  getLeases,
  getLease,
  updateLease,
  deleteLease,
  deleteHardLease,
};
