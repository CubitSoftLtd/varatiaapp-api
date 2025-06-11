const Joi = require('joi');

const meterReadingSchema = {
  meterId: Joi.string()
    .uuid({ version: ['uuidv4'] })
    .allow(null)
    .messages({
      'string.base': 'Meter ID must be a string',
      'string.uuid': 'Meter ID must be a valid UUID',
    }),
  submeterId: Joi.string()
    .uuid({ version: ['uuidv4'] })
    .allow(null)
    .messages({
      'string.base': 'Submeter ID must be a string',
      'string.uuid': 'Submeter ID must be a valid UUID',
    }),
  readingValue: Joi.number().required().min(0).precision(6).messages({
    'number.base': 'Reading value must be a number',
    'number.min': 'Reading value cannot be negative',
    'number.precision': 'Reading value must have at most 6 decimal places',
    'any.required': 'Reading value is required',
  }),
  readingDate: Joi.date().required().messages({
    'date.base': 'Reading date must be a valid date',
    'any.required': 'Reading date is required',
  }),
  consumption: Joi.number().min(0).precision(6).allow(null).messages({
    'number.base': 'Consumption must be a number',
    'number.min': 'Consumption cannot be negative',
    'number.precision': 'Consumption must have at most 6 decimal places',
  }),
  enteredByUserId: Joi.string()
    .uuid({ version: ['uuidv4'] })
    .allow(null)
    .messages({
      'string.base': 'Entered by user ID must be a string',
      'string.uuid': 'Entered by user ID must be a valid UUID',
    }),
};

const createMeterReading = {
  body: Joi.object()
    .keys(meterReadingSchema)
    .custom((value, helpers) => {
      if ((value.meterId && value.submeterId) || (!value.meterId && !value.submeterId)) {
        return helpers.error('object.mutualExclusivity', {
          message: 'Exactly one of meterId or submeterId must be provided',
        });
      }
      return value;
    })
    .messages({
      'object.mutualExclusivity': 'Exactly one of meterId or submeterId must be provided',
    }),
};

const getMeterReadings = {
  query: Joi.object().keys({
    meterId: meterReadingSchema.meterId,
    submeterId: meterReadingSchema.submeterId,
    readingDate: Joi.date().messages({
      'date.base': 'Reading date must be a valid date',
    }),
    enteredByUserId: meterReadingSchema.enteredByUserId,
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

const getMeterReading = {
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

const updateMeterReading = {
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
    .keys(meterReadingSchema)
    .custom((value, helpers) => {
      const meterId = value.meterId !== undefined ? value.meterId : null;
      const submeterId = value.submeterId !== undefined ? value.submeterId : null;
      if ((meterId && submeterId) || (!meterId && !submeterId)) {
        return helpers.error('object.mutualExclusivity', {
          message: 'Exactly one of meterId or submeterId must be provided',
        });
      }
      return value;
    })
    .min(1)
    .messages({
      'object.mutualExclusivity': 'Exactly one of meterId or submeterId must be provided',
      'object.min': 'At least one field must be provided for update',
    }),
};

const deleteMeterReading = {
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

const deleteHardMeterReading = {
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

const calculateConsumption = {
  body: Joi.object()
    .keys({
      meterId: meterReadingSchema.meterId,
      submeterId: meterReadingSchema.submeterId,
      startDate: Joi.date().required().messages({
        'date.base': 'Start date must be a valid date',
        'any.required': 'Start date is required',
      }),
      endDate: Joi.date().required().messages({
        'date.base': 'End date must be a valid date',
        'any.required': 'End date is required',
      }),
    })
    .custom((value, helpers) => {
      if ((value.meterId && value.submeterId) || (!value.meterId && !value.submeterId)) {
        return helpers.error('object.mutualExclusivity', {
          message: 'Exactly one of meterId or submeterId must be provided',
        });
      }
      if (value.startDate >= value.endDate) {
        return helpers.error('date.order', {
          message: 'Start date must be before end date',
        });
      }
      return value;
    })
    .messages({
      'object.mutualExclusivity': 'Exactly one of meterId or submeterId must be provided',
      'date.order': 'Start date must be before end date',
    }),
};

module.exports = {
  createMeterReading,
  getMeterReadings,
  getMeterReading,
  updateMeterReading,
  deleteMeterReading,
  deleteHardMeterReading,
  calculateConsumption,
};
