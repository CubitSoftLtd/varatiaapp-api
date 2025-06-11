const Joi = require('joi');

const paymentSchema = {
  billId: Joi.string()
    .uuid({ version: ['uuidv4'] })
    .required()
    .messages({
      'string.base': 'Bill ID must be a string',
      'string.empty': 'Bill ID is required',
      'string.uuid': 'Bill ID must be a valid UUID',
    }),
  tenantId: Joi.string()
    .uuid({ version: ['uuidv4'] })
    .allow(null)
    .messages({
      'string.base': 'Tenant ID must be a string',
      'string.uuid': 'Tenant ID must be a valid UUID',
    }),
  accountId: Joi.string()
    .uuid({ version: ['uuidv4'] })
    .required()
    .messages({
      'string.base': 'Account ID must be a string',
      'string.empty': 'Account ID is required',
      'string.uuid': 'Account ID must be a valid UUID',
    }),
  amountPaid: Joi.number().min(0.01).precision(2).required().messages({
    'number.base': 'Amount paid must be a number',
    'number.min': 'Amount paid must be at least 0.01',
    'number.precision': 'Amount paid must have at most 2 decimal places',
    'any.required': 'Amount paid is required',
  }),
  paymentDate: Joi.date().messages({
    'date.base': 'Payment date must be a valid date',
  }),
  paymentMethod: Joi.string()
    .valid('cash', 'credit_card', 'bank_transfer', 'mobile_payment', 'check', 'online')
    .required()
    .messages({
      'string.base': 'Payment method must be a string',
      'any.valid': 'Invalid payment method',
      'any.required': 'Payment method is required',
    }),
  transactionId: Joi.string().max(255).allow(null).messages({
    'string.base': 'Transaction ID must be a string',
    'string.max': 'Transaction ID must not exceed 255 characters',
  }),
  notes: Joi.string().allow(null, '').messages({
    'string.base': 'Notes must be a string',
  }),
};

const createPayment = {
  body: Joi.object().keys(paymentSchema),
};

const getPayments = {
  query: Joi.object().keys({
    billId: Joi.string()
      .uuid({ version: ['uuidv4'] })
      .messages({
        'string.base': 'Bill ID must be a string',
        'string.uuid': 'Bill ID must be a valid UUID',
      }),
    tenantId: Joi.string()
      .uuid({ version: ['uuidv4'] })
      .messages({
        'string.base': 'Tenant ID must be a string',
        'string.uuid': 'Tenant ID must be a valid UUID',
      }),
    accountId: Joi.string()
      .uuid({ version: ['uuidv4'] })
      .messages({
        'string.base': 'Account ID must be a string',
        'string.uuid': 'Account ID must be a valid UUID',
      }),
    paymentDate: Joi.date().messages({
      'date.base': 'Payment date must be a valid date',
    }),
    paymentMethod: Joi.string().valid('cash', 'credit_card', 'bank_transfer', 'mobile_payment', 'check', 'online').messages({
      'string.base': 'Payment method must be a string',
      'any.valid': 'Invalid payment method',
    }),
    sortBy: Joi.string()
      .pattern(/^[a-zA-Z]+:(asc|desc)$/)
      .messages({
        'string.base': 'SortBy must be a string',
        'string.pattern.base': 'SortBy must be in the format "field:asc|desc"',
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

const getPayment = {
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

const getPaymentsByBillId = {
  params: Joi.object().keys({
    billId: Joi.string()
      .uuid({ version: ['uuidv4'] })
      .required()
      .messages({
        'string.base': 'Bill ID must be a string',
        'string.empty': 'Bill ID is required',
        'string.uuid': 'Bill ID must be a valid UUID',
      }),
  }),
};

const updatePayment = {
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
      tenantId: Joi.string()
        .uuid({ version: ['uuidv4'] })
        .allow(null)
        .messages({
          'string.base': 'Tenant ID must be a string',
          'string.uuid': 'Tenant ID must be a valid UUID',
        }),
      amountPaid: Joi.number().min(0.01).precision(2).messages({
        'number.base': 'Amount paid must be a number',
        'number.min': 'Amount paid must be at least 0.01',
        'number.precision': 'Amount paid must have at most 2 decimal places',
      }),
      paymentDate: Joi.date().messages({
        'date.base': 'Payment date must be a valid date',
      }),
      paymentMethod: Joi.string()
        .valid('cash', 'credit_card', 'bank_transfer', 'mobile_payment', 'check', 'online')
        .messages({
          'string.base': 'Payment method must be a string',
          'any.valid': 'Invalid payment method',
        }),
      transactionId: Joi.string().max(255).allow(null).messages({
        'string.base': 'Transaction ID must be a string',
        'string.max': 'Transaction ID must not exceed 255 characters',
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

const deletePayment = {
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
  createPayment,
  getPayments,
  getPayment,
  getPaymentsByBillId,
  updatePayment,
  deletePayment,
};
