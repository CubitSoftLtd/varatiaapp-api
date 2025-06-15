const Joi = require('joi');

// Define reusable schemas and constants
const idSchema = Joi.string()
  .uuid({ version: ['uuidv4'] })
  .required()
  .messages({
    'string.base': 'ID must be a string',
    'string.empty': 'ID is required',
    'string.uuid': 'ID must be a valid UUID',
  });

const baseBillSchema = {
  tenantId: Joi.string()
    .uuid({ version: ['uuidv4'] })
    .required()
    .messages({
      'string.base': 'Tenant ID must be a string',
      'string.empty': 'Tenant ID is required',
      'string.uuid': 'Tenant ID must be a valid UUID',
    }),
  unitId: Joi.string()
    .uuid({ version: ['uuidv4'] })
    .required()
    .messages({
      'string.base': 'Unit ID must be a string',
      'string.empty': 'Unit ID is required',
      'string.uuid': 'Unit ID must be a valid UUID',
    }),
  billingPeriodStart: Joi.date().required().messages({
    'date.base': 'Billing period start must be a valid date',
    'any.required': 'Billing period start is required',
  }),
  billingPeriodEnd: Joi.date().required().messages({
    'date.base': 'Billing period end must be a valid date',
    'any.required': 'Billing period end is required',
  }),
  rentAmount: Joi.number().min(0).precision(2).required().messages({
    'number.base': 'Rent amount must be a number',
    'number.min': 'Rent amount cannot be negative',
    'number.precision': 'Rent amount must have at most 2 decimal places',
    'any.required': 'Rent amount is required',
  }),
  dueDate: Joi.date().required().messages({
    'date.base': 'Due date must be a valid date',
    'any.required': 'Due date is required',
  }),
  issueDate: Joi.date().messages({
    'date.base': 'Issue date must be a valid date',
  }),
  paymentStatus: Joi.string().valid('unpaid', 'partially_paid', 'paid', 'overdue', 'cancelled').messages({
    'string.base': 'Payment status must be a string',
    'any.only': 'Invalid payment status',
  }),
  notes: Joi.string().allow(null, '').messages({
    'string.base': 'Notes must be a string',
  }),
};

const createBill = {
  body: Joi.object()
    .keys(baseBillSchema)
    .custom((value, helpers) => {
      if (new Date(value.billingPeriodStart) > new Date(value.billingPeriodEnd)) {
        return helpers.error('date.order', {
          message: 'Billing period start must be before or equal to end',
        });
      }
      if (value.dueDate && value.issueDate && new Date(value.dueDate) < new Date(value.issueDate)) {
        return helpers.error('date.order', {
          message: 'Due date must be on or after issue date',
        });
      }
      if (!value.issueDate) {
        /* eslint-disable no-param-reassign */
        value.issueDate = new Date(); // Default to current date (June 15, 2025, 12:28 PM +06)
      }
      return value;
    })
    .messages({
      'date.order': '{{#message}}',
    }),
};

const getBills = {
  query: Joi.object().keys({
    tenantId: Joi.string()
      .uuid({ version: ['uuidv4'] })
      .messages({
        'string.base': 'Tenant ID must be a string',
        'string.uuid': 'Tenant ID must be a valid UUID',
      }),
    unitId: Joi.string()
      .uuid({ version: ['uuidv4'] })
      .messages({
        'string.base': 'Unit ID must be a string',
        'string.uuid': 'Unit ID must be a valid UUID',
      }),
    accountId: Joi.string()
      .uuid({ version: ['uuidv4'] })
      .messages({
        'string.base': 'Account ID must be a string',
        'string.uuid': 'Account ID must be a valid UUID',
      }),
    billingPeriodStart: Joi.date().messages({
      'date.base': 'Billing period start must be a valid date',
    }),
    billingPeriodEnd: Joi.date().messages({
      'date.base': 'Billing period end must be a valid date',
    }),
    dueDate: Joi.date().messages({
      'date.base': 'Due date must be a valid date',
    }),
    paymentStatus: Joi.string().valid('unpaid', 'partially_paid', 'paid', 'overdue', 'cancelled').messages({
      'string.base': 'Payment status must be a string',
      'any.only': 'Invalid payment status',
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
      'string.base': 'Include must be a string',
    }), // Added include parameter
  }),
};

const getBill = {
  params: Joi.object().keys({
    id: idSchema,
  }),
  query: Joi.object().keys({
    include: Joi.string().optional().messages({
      'string.base': 'Include must be a string',
    }), // Added include parameter
  }),
};

const updateBill = {
  params: Joi.object().keys({
    id: idSchema,
  }),
  body: Joi.object()
    .keys({
      tenantId: Joi.string()
        .uuid({ version: ['uuidv4'] })
        .messages({
          'string.base': 'Tenant ID must be a string',
          'string.uuid': 'Tenant ID must be a valid UUID',
        }),
      unitId: Joi.string()
        .uuid({ version: ['uuidv4'] })
        .messages({
          'string.base': 'Unit ID must be a string',
          'string.uuid': 'Unit ID must be a valid UUID',
        }),
      accountId: Joi.string()
        .uuid({ version: ['uuidv4'] })
        .messages({
          'string.base': 'Account ID must be a string',
          'string.uuid': 'Account ID must be a valid UUID',
        }),
      billingPeriodStart: Joi.date().messages({
        'date.base': 'Billing period start must be a valid date',
      }),
      billingPeriodEnd: Joi.date().messages({
        'date.base': 'Billing period end must be a valid date',
      }),
      rentAmount: Joi.number().min(0).precision(2).messages({
        'number.base': 'Rent amount must be a number',
        'number.min': 'Rent amount cannot be negative',
        'number.precision': 'Rent amount must have at most 2 decimal places',
      }),
      dueDate: Joi.date().messages({
        'date.base': 'Due date must be a valid date',
      }),
      issueDate: Joi.date().messages({
        'date.base': 'Issue date must be a valid date',
      }),
      paymentStatus: Joi.string().valid('unpaid', 'partially_paid', 'paid', 'overdue', 'cancelled').messages({
        'string.base': 'Payment status must be a string',
        'any.only': 'Invalid payment status',
      }),
      notes: Joi.string().allow(null, '').messages({
        'string.base': 'Notes must be a string',
      }),
    })
    .min(1)
    .custom((value, helpers) => {
      if (
        value.billingPeriodStart &&
        value.billingPeriodEnd &&
        new Date(value.billingPeriodStart) > new Date(value.billingPeriodEnd)
      ) {
        return helpers.error('date.order', {
          message: 'Billing period start must be before or equal to end date',
        });
      }
      if (value.dueDate && value.issueDate && new Date(value.dueDate) < new Date(value.issueDate)) {
        return helpers.error('date.order', {
          message: 'Due date must be on or after issue date',
        });
      }
      return value;
    })
    .messages({
      'object.min': 'At least one field must be provided for update',
      'date.order': '{{#message}}',
    }),
};

const deleteBill = {
  params: Joi.object().keys({
    id: idSchema,
  }),
};

module.exports = {
  createBill,
  getBills,
  getBill,
  updateBill,
  deleteBill,
};
