const Joi = require('joi');

const createUtilityType = {
  body: Joi.object().keys({
    name: Joi.string().required().min(3).max(100).messages({
      'string.base': 'Name must be a string',
      'string.empty': 'Name is required',
      'string.min': 'Name must be at least 3 characters long',
      'string.max': 'Name cannot exceed 100 characters',
    }),
    unitRate: Joi.number().required().precision(2).min(0).messages({
      'number.base': 'Unit rate must be a number',
      'number.empty': 'Unit rate is required',
      'number.precision': 'Unit rate must have at most 2 decimal places',
      'number.min': 'Unit rate must be at least 0',
    }),
    unitOfMeasurement: Joi.string().min(1).max(50).default('unit').messages({
      'string.base': 'Unit of measurement must be a string',
      'string.min': 'Unit of measurement must be at least 1 character long',
      'string.max': 'Unit of measurement cannot exceed 50 characters',
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
      name: Joi.string().min(3).max(100).messages({
        'string.base': 'Name must be a string',
        'string.min': 'Name must be at least 3 characters long',
        'string.max': 'Name cannot exceed 100 characters',
      }),
      unitRate: Joi.number().precision(2).min(0).messages({
        'number.base': 'Unit rate must be a number',
        'number.precision': 'Unit rate must have at most 2 decimal places',
        'number.min': 'Unit rate must be at least 0',
      }),
      unitOfMeasurement: Joi.string().min(1).max(50).messages({
        'string.base': 'Unit of measurement must be a string',
        'string.min': 'Unit of measurement must be at least 1 character long',
        'string.max': 'Unit of measurement cannot exceed 50 characters',
      }),
    })
    .min(1)
    .messages({
      'object.min': 'At least one field (name, unitRate, or unitOfMeasurement) must be provided for update',
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

module.exports = {
  createUtilityType,
  getUtilityTypes,
  getUtilityType,
  updateUtilityType,
  deleteUtilityType,
};
