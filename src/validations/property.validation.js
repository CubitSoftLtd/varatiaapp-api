const Joi = require('joi');

const typeTypes = {
  RESIDENTIAL: 'residential',
  COMMERCIAL: 'commercial',
  MIXED_USE: 'mixed-use',
};

const createProperty = {
  body: Joi.object().keys({
    name: Joi.string().required().min(1).max(255).messages({
      'string.base': 'Name must be a string',
      'string.empty': 'Name is required',
      'string.min': 'Name must be at least 1 character long',
      'string.max': 'Name cannot exceed 255 characters',
    }),
    address: Joi.string().required().min(1).max(500).messages({
      'string.base': 'Address must be a string',
      'string.empty': 'Address is required',
      'string.min': 'Address must be at least 1 character long',
      'string.max': 'Address cannot exceed 500 characters',
    }),
    accountId: Joi.string()
      .uuid({ version: ['uuidv4'] })
      .required()
      .messages({
        'string.base': 'Account ID must be a string',
        'string.empty': 'Account ID is required',
        'string.uuid': 'Account ID must be a valid UUID',
      }),
    type: Joi.string()
      .valid(...Object.values(typeTypes))
      .allow(null)
      .messages({
        'string.base': 'Type must be a string',
        'any.only': 'Type must be one of: residential, commercial, mixed-use',
      }),
    yearBuilt: Joi.number()
      .integer()
      .min(1800)
      .max(new Date().getFullYear())
      .allow(null)
      .messages({
        'number.base': 'Year built must be a number',
        'number.integer': 'Year built must be an integer',
        'number.min': 'Year built must be at least 1800',
        'number.max': `Year built cannot be later than ${new Date().getFullYear()}`,
      }),
    totalUnits: Joi.number().integer().min(1).allow(null).messages({
      'number.base': 'Total units must be a number',
      'number.integer': 'Total units must be an integer',
      'number.min': 'Total units must be at least 1',
    }),
  }),
};

const getProperties = {
  query: Joi.object().keys({
    name: Joi.string().min(1).max(255).messages({
      'string.base': 'Name must be a string',
      'string.min': 'Name must be at least 1 character long',
      'string.max': 'Name cannot exceed 255 characters',
    }),
    address: Joi.string().min(1).max(500).messages({
      'string.base': 'Address must be a string',
      'string.min': 'Address must be at least 1 character long',
      'string.max': 'Address cannot exceed 500 characters',
    }),
    accountId: Joi.string()
      .uuid({ version: ['uuidv4'] })
      .messages({
        'string.base': 'Account ID must be a string',
        'string.uuid': 'Account ID must be a valid UUID',
      }),
    type: Joi.string()
      .valid(...Object.values(typeTypes))
      .messages({
        'string.base': 'Type must be a string',
        'any.only': 'Type must be one of: residential, commercial, mixed-use',
      }),
    yearBuilt: Joi.number()
      .integer()
      .min(1800)
      .max(new Date().getFullYear())
      .messages({
        'number.base': 'Year built must be a number',
        'number.integer': 'Year built must be an integer',
        'number.min': 'Year built must be at least 1800',
        'number.max': `Year built cannot be later than ${new Date().getFullYear()}`,
      }),
    totalUnits: Joi.number().integer().min(1).messages({
      'number.base': 'Total units must be a number',
      'number.integer': 'Total units must be an integer',
      'number.min': 'Total units must be at least 1',
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
      name: Joi.string().min(1).max(255).messages({
        'string.base': 'Name must be a string',
        'string.min': 'Name must be at least 1 character long',
        'string.max': 'Name cannot exceed 255 characters',
      }),
      address: Joi.string().min(1).max(500).messages({
        'string.base': 'Address must be a string',
        'string.min': 'Address must be at least 1 character long',
        'string.max': 'Address cannot exceed 500 characters',
      }),
      accountId: Joi.string()
        .uuid({ version: ['uuidv4'] })
        .messages({
          'string.base': 'Account ID must be a string',
          'string.uuid': 'Account ID must be a valid UUID',
        }),
      type: Joi.string()
        .valid(...Object.values(typeTypes))
        .allow(null)
        .messages({
          'string.base': 'Type must be a string',
          'any.only': 'Type must be one of: residential, commercial, mixed-use',
        }),
      yearBuilt: Joi.number()
        .integer()
        .min(1800)
        .max(new Date().getFullYear())
        .allow(null)
        .messages({
          'number.base': 'Year built must be a number',
          'number.integer': 'Year built must be an integer',
          'number.min': 'Year built must be at least 1800',
          'number.max': `Year built cannot be later than ${new Date().getFullYear()}`,
        }),
      totalUnits: Joi.number().integer().min(1).allow(null).messages({
        'number.base': 'Total units must be a number',
        'number.integer': 'Total units must be an integer',
        'number.min': 'Total units must be at least 1',
      }),
    })
    .min(1)
    .messages({
      'object.min': 'At least one field must be provided for update',
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

const deleteHardProperty = {
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
  deleteHardProperty,
};
