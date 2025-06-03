const Joi = require('joi');

const createBill = {
  body: Joi.object().keys({
    tenantId: Joi.string().uuid({ version: 'uuidv4' }).required().messages({
      'string.base': 'Tenant ID must be a string',
      'string.empty': 'Tenant ID is required',
      'string.uuid': 'Tenant ID must be a valid UUID',
    }),
    unitId: Joi.string().uuid({ version: 'uuidv4' }).required().messages({
      'string.base': 'Unit ID must be a string',
      'string.empty': 'Unit ID is required',
      'string.uuid': 'Unit ID must be a valid UUID',
    }),
    billingPeriod: Joi.string()
      .required()
      .pattern(/^\d{4}-\d{2}$/)
      .messages({
        'string.base': 'Billing period must be a string',
        'string.empty': 'Billing period is required',
        'string.pattern.base': 'Billing period must be in YYYY-MM format',
      }),
    rentAmount: Joi.number().precision(2).required().min(0).messages({
      'number.base': 'Rent amount must be a number',
      'number.empty': 'Rent amount is required',
      'number.min': 'Rent amount must be at least 0',
      'number.precision': 'Rent amount must have at most 2 decimal places',
    }),
    totalUtilityAmount: Joi.number().precision(2).required().min(0).messages({
      'number.base': 'Total utility amount must be a number',
      'number.empty': 'Total utility amount is required',
      'number.min': 'Total utility amount must be at least 0',
      'number.precision': 'Total utility amount must have at most 2 decimal places',
    }),
    dueDate: Joi.date().required().messages({
      'date.base': 'Due date must be a valid date',
      'date.empty': 'Due date is required',
    }),
    paymentStatus: Joi.string().valid('unpaid', 'partially_paid', 'paid', 'overdue').default('unpaid').messages({
      'string.base': 'Payment status must be a string',
      'any.only': 'Payment status must be one of: unpaid, partially_paid, paid, overdue',
    }),
    paymentDate: Joi.date().allow(null).messages({
      'date.base': 'Payment date must be a valid date',
    }),
    notes: Joi.string().allow(null, '').messages({
      'string.base': 'Notes must be a string',
    }),
  }),
};

const getBills = {
  query: Joi.object().keys({
    tenantId: Joi.string().uuid({ version: 'uuidv4' }).messages({
      'string.base': 'Tenant ID must be a string',
      'string.uuid': 'Tenant ID must be a valid UUID',
    }),
    unitId: Joi.string().uuid({ version: 'uuidv4' }).messages({
      'string.base': 'Unit ID must be a string',
      'string.uuid': 'Unit ID must be a valid UUID',
    }),
    billingPeriod: Joi.string()
      .pattern(/^\d{4}-\d{2}$/)
      .messages({
        'string.base': 'Billing period must be a string',
        'string.pattern.base': 'Billing period must be in YYYY-MM format',
      }),
    paymentStatus: Joi.string().valid('unpaid', 'partially_paid', 'paid', 'overdue').messages({
      'string.base': 'Payment status must be a string',
      'any.only': 'Payment status must be one of: unpaid, partially_paid, paid, overdue',
    }),
    sortBy: Joi.string()
      .pattern(/^[a-zA-Z]+:(asc|desc)$/i)
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

const getBill = {
  params: Joi.object().keys({
    id: Joi.string().uuid({ version: 'uuidv4' }).required().messages({
      'string.base': 'ID must be a string',
      'string.empty': 'ID is required',
      'string.uuid': 'ID must be a valid UUID',
    }),
  }),
};

const updateBill = {
  params: Joi.object().keys({
    id: Joi.string().uuid({ version: 'uuidv4' }).required().messages({
      'string.base': 'ID must be a string',
      'string.empty': 'ID is required',
      'string.uuid': 'ID must be a valid UUID',
    }),
  }),
  body: Joi.object()
    .keys({
      rentAmount: Joi.number().precision(2).min(0).messages({
        'number.base': 'Rent amount must be a number',
        'number.min': 'Rent amount must be at least 0',
        'number.precision': 'Rent amount must have at most 2 decimal places',
      }),
      totalUtilityAmount: Joi.number().precision(2).min(0).messages({
        'number.base': 'Total utility amount must be a number',
        'number.min': 'Total utility amount must be at least 0',
        'number.precision': 'Total utility amount must have at most 2 decimal places',
      }),
      dueDate: Joi.date().messages({
        'date.base': 'Due date must be a valid date',
      }),
      paymentStatus: Joi.string().valid('unpaid', 'partially_paid', 'paid', 'overdue').messages({
        'string.base': 'Payment status must be a string',
        'any.only': 'Payment status must be one of: unpaid, partially_paid, paid, overdue',
      }),
      paymentDate: Joi.date().allow(null).messages({
        'date.base': 'Payment date must be a valid date',
      }),
      notes: Joi.string().allow(null, '').messages({
        'string.base': 'Notes must be a string',
      }),
    })
    .min(1)
    .messages({
      'object.min': 'At least one field must be provided for update',
    }),
};

const deleteBill = {
  params: Joi.object().keys({
    id: Joi.string().uuid({ version: 'uuidv4' }).required().messages({
      'string.base': 'ID must be a string',
      'string.empty': 'ID is required',
      'string.uuid': 'ID must be a valid UUID',
    }),
  }),
};

module.exports = {
  createBill,
  getBills,
  getBill,
  updateBill,
  deleteBill,
};
