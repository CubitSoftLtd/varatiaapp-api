const Joi = require('joi');

const createMeterCharge = {
  body: Joi.object().keys({
    propertyId: Joi.string()
      .uuid({ version: ['uuidv4'] })
      .required()
      .messages({
        'string.base': 'Property ID must be a string',
        'string.uuid': 'Property ID must be a valid UUID',
      }),
    meterId: Joi.string()
      .uuid({ version: ['uuidv4'] })
      .required()
      .messages({
        'string.base': 'Meter ID must be a string',
        'string.uuid': 'Meter ID must be a valid UUID',
      }),
    expenseDate: Joi.date().required().messages({
      'date.base': 'Lease start date must be a valid date',
      'any.required': 'Lease start date is required',
    }),
    amount: Joi.number().required(),

    description: Joi.string().max(65535).allow(null).messages({
      'string.base': 'Notes must be a string',
      'string.max': 'Notes cannot exceed 65535 characters',
    }),
    expenseType: Joi.string().max(65535).allow(null).messages({
      'string.base': 'Notes must be a string',
      'string.max': 'Notes cannot exceed 65535 characters',
    }),
  }),
};

const getMeterCharges = {
  query: Joi.object().keys({
    propertyid: Joi.string()
      .uuid({ version: ['uuidv4'] })
      .messages({
        'string.base': ' Property ID must be a string',
        'string.uuid': 'Property ID must be a valid UUID',
      }),
    meterId: Joi.string()
      .uuid({ version: ['uuidv4'] })
      .messages({
        'string.base': 'Meter ID must be a string',
        'string.uuid': 'Meter ID must be a valid UUID',
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

const getMeterCharge = {
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

const updateMeterCharge = {
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
      propertyId: Joi.string()
        .uuid({ version: ['uuidv4'] })
        .required()
        .messages({
          'string.base': 'Property ID must be a string',
          'string.uuid': 'Property ID must be a valid UUID',
        }),
      meterId: Joi.string()
        .uuid({ version: ['uuidv4'] })
        .required()
        .messages({
          'string.base': 'Meter ID must be a string',
          'string.uuid': 'Meter ID must be a valid UUID',
        }),
      expenseDate: Joi.date().required().messages({
        'date.base': 'Lease start date must be a valid date',
        'any.required': 'Lease start date is required',
      }),
      amount: Joi.number().required(),

      description: Joi.string().max(65535).allow(null).messages({
        'string.base': 'Notes must be a string',
        'string.max': 'Notes cannot exceed 65535 characters',
      }),
      expenseType: Joi.string().max(65535).allow(null).messages({
        'string.base': 'Notes must be a string',
        'string.max': 'Notes cannot exceed 65535 characters',
      }),
    })
    .min(1)
    .messages({
      'object.min': 'At least one field must be provided for update',
    }),
};
const deleteMeterCharge = {
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

const deleteHardMeterChage = {
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
  createMeterCharge,
  getMeterCharges,
  getMeterCharge,
  updateMeterCharge,
  deleteMeterCharge,
  deleteHardMeterChage,
};
