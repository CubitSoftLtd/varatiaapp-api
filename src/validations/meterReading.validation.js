const Joi = require('joi');

const createMeterReading = {
  body: Joi.object()
    .keys({
      meterId: Joi.string().uuid().required(), // meterId is always required
      submeterId: Joi.string().uuid().optional().allow(null), // submeterId is optional
      readingValue: Joi.number().required(),
      readingDate: Joi.date().required(),
      consumption: Joi.number(),
    })
    .custom((value, helpers) => {
      // Ensure submeterId is valid only with meterId
      if (value.submeterId && !value.meterId) {
        return helpers.error('any.invalid', {
          key: 'submeterId',
          message: 'meterId is required when submeterId is provided',
        });
      }
      return value;
    })
    .messages({
      'any.invalid': '{{#message}}',
    }),
};

const getMeterReadings = {
  query: Joi.object().keys({
    meterId: Joi.string().uuid().messages({
      'string.base': 'meterId must be a string',
      'string.uuid': 'meterId must be a valid UUID',
    }),
    submeterId: Joi.string().uuid().messages({
      'string.base': 'submeterId must be a string',
      'string.uuid': 'submeterId must be a valid UUID',
    }),
    readingDate: Joi.date().messages({
      'date.base': 'readingDate must be a valid date',
    }),
    sortBy: Joi.string()
      .pattern(/^[a-zA-Z]+:(asc|desc)$/)
      .messages({
        'string.base': 'sortBy must be a string',
        'string.pattern.base': 'sortBy must be in the format "field:asc" or "field:desc"',
      }),
    limit: Joi.number().integer().min(1).default(10).messages({
      'number.base': 'limit must be a number',
      'number.integer': 'limit must be an integer',
      'number.min': 'limit must be at least 1',
    }),
    page: Joi.number().integer().min(1).default(1).messages({
      'number.base': 'page must be a number',
      'number.integer': 'page must be an integer',
      'number.min': 'page must be at least 1',
    }),
    include: Joi.string().optional().messages({
      'string.base': 'include must be a string',
    }), // Added include parameter
  }),
};

const getMeterReading = {
  params: Joi.object().keys({
    id: Joi.string().uuid().required().messages({
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

const updateMeterReading = {
  params: Joi.object().keys({
    id: Joi.string().uuid().required().messages({
      'string.base': 'ID must be a string',
      'string.empty': 'ID is required',
      'string.uuid': 'ID must be a valid UUID',
    }),
  }),
  body: Joi.object()
    .keys({
      meterId: Joi.string().uuid().allow(null).messages({
        'string.base': 'meterId must be a string',
        'string.uuid': 'meterId must be a valid UUID',
      }),
      submeterId: Joi.string()
        .uuid()
        .when('meterId', {
          is: Joi.exist(),
          then: Joi.string().uuid().optional().allow(null).messages({
            'string.base': 'submeterId must be a string',
            'string.uuid': 'submeterId must be a valid UUID',
          }),
          otherwise: Joi.forbidden(),
        }),
      readingValue: Joi.number().messages({
        'number.base': 'readingValue must be a number',
      }),
      readingDate: Joi.date().messages({
        'date.base': 'readingDate must be a valid date',
      }),
      consumption: Joi.number().messages({
        'number.base': 'consumption must be a number',
      }),
    })
    .min(1)
    .custom((value, helpers) => {
      if (value.submeterId && !value.meterId) {
        return helpers.error('any.invalid', {
          key: 'submeterId',
          message: 'meterId is required when submeterId is provided',
        });
      }
      return value;
    })
    .messages({
      'object.min': 'At least one field must be provided for update',
      'any.invalid': '{{#message}}',
    }),
};

const deleteMeterReading = {
  params: Joi.object().keys({
    id: Joi.string().uuid().required().messages({
      'string.base': 'ID must be a string',
      'string.empty': 'ID is required',
      'string.uuid': 'ID must be a valid UUID',
    }),
  }),
};

const calculateConsumption = {
  body: Joi.object()
    .keys({
      meterId: Joi.string().uuid().allow(null).messages({
        'string.base': 'meterId must be a string',
        'string.uuid': 'meterId must be a valid UUID',
      }),
      submeterId: Joi.string()
        .uuid()
        .when('meterId', {
          is: Joi.exist(),
          then: Joi.string().uuid().required().messages({
            'string.base': 'submeterId must be a string',
            'string.empty': 'submeterId is required',
            'string.uuid': 'submeterId must be a valid UUID',
          }),
          otherwise: Joi.forbidden(),
        }),
      startDate: Joi.date().required().messages({
        'date.base': 'startDate must be a valid date',
        'any.required': 'startDate is required',
      }),
      endDate: Joi.date().required().messages({
        'date.base': 'endDate must be a valid date',
        'any.required': 'endDate is required',
      }),
    })
    .custom((value, helpers) => {
      if (new Date(value.startDate) > new Date(value.endDate)) {
        return helpers.error('date.order', {
          message: 'startDate must be before or equal to endDate',
        });
      }
      return value;
    })
    .messages({
      'date.order': '{{#message}}',
    }),
};

module.exports = {
  createMeterReading,
  getMeterReadings,
  getMeterReading,
  updateMeterReading,
  deleteMeterReading,
  calculateConsumption,
};
