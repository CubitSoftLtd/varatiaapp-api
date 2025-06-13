const Joi = require('joi');

const createUtilityType = {
  body: Joi.object().keys({
    name: Joi.string().required().min(1).max(100).messages({
      'string.base': 'Name must be a string',
      'string.empty': 'Name is required',
      'string.min': 'Name must be at least 1 character long',
      'string.max': 'Name cannot exceed 100 characters',
    }),
    unitRate: Joi.number().required().min(0).precision(6).messages({
      'number.base': 'Unit rate must be a number',
      'number.min': 'Unit rate cannot be negative',
      'number.precision': 'Unit rate must have at most 6 decimal places',
      'any.required': 'Unit rate is required',
    }),
    unitOfMeasurement: Joi.string().required().min(1).max(50).messages({
      'string.base': 'Unit of measurement must be a string',
      'string.empty': 'Unit of measurement is required',
      'string.min': 'Unit of measurement must be at least 1 character long',
      'string.max': 'Unit of measurement cannot exceed 50 characters',
    }),
    description: Joi.string().allow(null, '').messages({
      'string.base': 'Description must be a string',
    }),
  }),
};

const getUtilityTypes = {
  query: Joi.object().keys({
    name: Joi.string().min(1).max(100).messages({
      'string.base': 'Name must be a string',
      'string.min': 'Name must be at least 1 character long',
      'string.max': 'Name cannot exceed 100 characters',
    }),
    unitOfMeasurement: Joi.string().min(1).max(50).messages({
      'string.base': 'Unit of measurement must be a string',
      'string.min': 'Unit of measurement must be at least 1 character long',
      'string.max': 'Unit of measurement cannot exceed 50 characters',
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
  }),
};

const getUtilityType = {
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

const updateUtilityType = {
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
      unitRate: Joi.number().min(0).precision(6).messages({
        'number.base': 'Unit rate must be a number',
        'number.min': 'Unit rate cannot be negative',
        'number.precision': 'Unit rate must have at most 6 decimal places',
      }),
      unitOfMeasurement: Joi.string().min(1).max(50).messages({
        'string.base': 'Unit of measurement must be a string',
        'string.min': 'Unit of measurement must be at least 1 character long',
        'string.max': 'Unit of measurement cannot exceed 50 characters',
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

const deleteUtilityType = {
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

const deleteHardUtilityType = {
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
  createUtilityType,
  getUtilityTypes,
  getUtilityType,
  updateUtilityType,
  deleteUtilityType,
  deleteHardUtilityType,
};
