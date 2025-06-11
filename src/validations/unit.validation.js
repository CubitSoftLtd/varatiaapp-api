const Joi = require('joi');

const statusTypes = {
  OCCUPIED: 'occupied',
  VACANT: 'vacant',
  MAINTENANCE: 'maintenance',
  INACTIVE: 'inactive',
};

const createUnit = {
  body: Joi.object().keys({
    name: Joi.string().required().min(1).max(100).messages({
      'string.base': 'Name must be a string',
      'string.empty': 'Name is required',
      'string.min': 'Name must be at least 1 character long',
      'string.max': 'Name cannot exceed 100 characters',
    }),
    propertyId: Joi.string()
      .uuid({ version: ['uuidv4'] })
      .required()
      .messages({
        'string.base': 'Property ID must be a string',
        'string.empty': 'Property ID is required',
        'string.uuid': 'Property ID must be a valid UUID',
      }),
    rentAmount: Joi.number().required().min(0).precision(2).messages({
      'number.base': 'Rent amount must be a number',
      'number.min': 'Rent amount cannot be negative',
      'number.precision': 'Rent amount must have at most 2 decimal places',
      'any.required': 'Rent amount is required',
    }),
    status: Joi.string()
      .valid(...Object.values(statusTypes))
      .default('vacant')
      .messages({
        'string.base': 'Status must be a string',
        'any.only': 'Status must be one of: occupied, vacant, maintenance, inactive',
      }),
    bedroomCount: Joi.number().integer().min(0).allow(null).messages({
      'number.base': 'Bedroom count must be a number',
      'number.integer': 'Bedroom count must be an integer',
      'number.min': 'Bedroom count cannot be negative',
    }),
    bathroomCount: Joi.number().min(0).precision(1).allow(null).messages({
      'number.base': 'Bathroom count must be a number',
      'number.min': 'Bathroom count cannot be negative',
      'number.precision': 'Bathroom count must have at most 1 decimal place',
    }),
    squareFootage: Joi.number().min(0).precision(2).allow(null).messages({
      'number.base': 'Square footage must be a number',
      'number.min': 'Square footage cannot be negative',
      'number.precision': 'Square footage must have at most 2 decimal places',
    }),
  }),
};

const getUnits = {
  query: Joi.object().keys({
    name: Joi.string().min(1).max(100).messages({
      'string.base': 'Name must be a string',
      'string.min': 'Name must be at least 1 character long',
      'string.max': 'Name cannot exceed 100 characters',
    }),
    propertyId: Joi.string()
      .uuid({ version: ['uuidv4'] })
      .messages({
        'string.base': 'Property ID must be a string',
        'string.uuid': 'Property ID must be a valid UUID',
      }),
    rentAmount: Joi.number().min(0).precision(2).messages({
      'number.base': 'Rent amount must be a number',
      'number.min': 'Rent amount cannot be negative',
      'number.precision': 'Rent amount must have at most 2 decimal places',
    }),
    status: Joi.string()
      .valid(...Object.values(statusTypes))
      .messages({
        'string.base': 'Status must be a string',
        'any.only': 'Status must be one of: occupied, vacant, maintenance, inactive',
      }),
    bedroomCount: Joi.number().integer().min(0).messages({
      'number.base': 'Bedroom count must be a number',
      'number.integer': 'Bedroom count must be an integer',
      'number.min': 'Bedroom count cannot be negative',
    }),
    bathroomCount: Joi.number().min(0).precision(1).messages({
      'number.base': 'Bathroom count must be a number',
      'number.min': 'Bathroom count cannot be negative',
      'number.precision': 'Bathroom count must have at most 1 decimal place',
    }),
    squareFootage: Joi.number().min(0).precision(2).messages({
      'number.base': 'Square footage must be a number',
      'number.min': 'Square footage cannot be negative',
      'number.precision': 'Square footage must have at most 2 decimal places',
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

const getUnit = {
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

const updateUnit = {
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
      propertyId: Joi.string()
        .uuid({ version: ['uuidv4'] })
        .messages({
          'string.base': 'Property ID must be a string',
          'string.uuid': 'Property ID must be a valid UUID',
        }),
      rentAmount: Joi.number().min(0).precision(2).messages({
        'number.base': 'Rent amount must be a number',
        'number.min': 'Rent amount cannot be negative',
        'number.precision': 'Rent amount must have at most 2 decimal places',
      }),
      status: Joi.string()
        .valid(...Object.values(statusTypes))
        .messages({
          'string.base': 'Status must be a string',
          'any.only': 'Status must be one of: occupied, vacant, maintenance, inactive',
        }),
      bedroomCount: Joi.number().integer().min(0).allow(null).messages({
        'number.base': 'Bedroom count must be a number',
        'number.integer': 'Bedroom count must be an integer',
        'number.min': 'Bedroom count cannot be negative',
      }),
      bathroomCount: Joi.number().min(0).precision(1).allow(null).messages({
        'number.base': 'Bathroom count must be a number',
        'number.min': 'Bathroom count cannot be negative',
        'number.precision': 'Bathroom count must have at most 1 decimal place',
      }),
      squareFootage: Joi.number().min(0).precision(2).allow(null).messages({
        'number.base': 'Square footage must be a number',
        'number.min': 'Square footage cannot be negative',
        'number.precision': 'Square footage must have at most 2 decimal places',
      }),
    })
    .min(1)
    .messages({
      'object.min': 'At least one field must be provided for update',
    }),
};

const deleteUnit = {
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

const deleteHardUnit = {
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
  createUnit,
  getUnits,
  getUnit,
  updateUnit,
  deleteUnit,
  deleteHardUnit,
};
