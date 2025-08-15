/* eslint-disable prettier/prettier */
const Joi = require('joi');

const createBeneficiaryV = {
  body: Joi.object().keys({
    name: Joi.string().required().min(1).max(100).messages({
      'string.base': 'Name must be a string',
      'string.empty': 'Name is required',
      'string.min': 'Name must be at least 1 character long',
      'string.max': 'Name cannot exceed 100 characters',
    }),
    description: Joi.string().allow(null, '').messages({
      'string.base': 'Description must be a string',
    }),
  }),
};

const getBeneficiariesV = {
  query: Joi.object().keys({
    name: Joi.string().min(1).max(100).messages({
      'string.base': 'Name must be a string',
      'string.min': 'Name must be at least 1 character long',
      'string.max': 'Name cannot exceed 100 characters',
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
    deleted: Joi.string().valid('true', 'false', 'all').optional().messages({
      'string.base': 'Deleted must be a string',
      'any.only': 'Deleted must be one of "true", "false", or "all"',
    }),
  }),
};

const getBeneficiaryV = {
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

const updateBeneficiaryV = {
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
      description: Joi.string().allow(null, '').messages({
        'string.base': 'Description must be a string',
      }),
    })
    .min(1)
    .messages({
      'object.min': 'At least one field must be provided for update',
    }),
};

const deleteBeneficiaryV = {
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
const restoreBeneficiaryV = {
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

const deleteHardBeneficiaryV = {
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
  createBeneficiaryV,
  getBeneficiariesV,
  getBeneficiaryV,
  updateBeneficiaryV,
  deleteBeneficiaryV,
  restoreBeneficiaryV,
  deleteHardBeneficiaryV,
};
