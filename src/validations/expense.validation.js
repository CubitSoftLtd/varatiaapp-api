const Joi = require('joi');

// Reusable UUID v4 schema
const uuidV4Schema = Joi.string().uuid({ version: 'uuidv4' });

const createExpense = {
  body: Joi.object().keys({
    propertyId: uuidV4Schema.allow(null).messages({
      'string.base': 'Property ID must be a string',
      'string.uuid': 'Property ID must be a valid UUID',
    }),
    unitId: uuidV4Schema.allow(null).messages({
      'string.base': 'Unit ID must be a string',
      'string.uuid': 'Unit ID must be a valid UUID',
    }),
    billId: uuidV4Schema.allow(null).messages({
      'string.base': 'Bill ID must be a string',
      'string.uuid': 'Bill ID must be a valid UUID',
    }),
    categoryId: uuidV4Schema.required().messages({
      'string.base': 'Category ID must be a string',
      'string.empty': 'Category ID is required',
      'string.uuid': 'Category ID must be a valid UUID',
    }),
    amount: Joi.number().required().min(0.01).precision(2).messages({
      'number.base': 'Amount must be a number',
      'number.min': 'Amount must be at least 0.01',
      'number.precision': 'Amount must have at most 2 decimal places',
      'any.required': 'Amount is required',
    }),
    expenseDate: Joi.date().required().messages({
      'date.base': 'Expense date must be a valid date',
      'any.required': 'Expense date is required',
    }),
    description: Joi.string().max(1000).allow(null).messages({
      'string.base': 'Description must be a string',
      'string.max': 'Description cannot exceed 1000 characters',
    }),
  }),
};

const getExpenses = {
  query: Joi.object().keys({
    propertyId: uuidV4Schema.messages({
      'string.base': 'Property ID must be a string',
      'string.uuid': 'Property ID must be a valid UUID',
    }),
    unitId: uuidV4Schema.messages({
      'string.base': 'Unit ID must be a string',
      'string.uuid': 'Unit ID must be a valid UUID',
    }),
    billId: uuidV4Schema.messages({
      'string.base': 'Bill ID must be a string',
      'string.uuid': 'Bill ID must be a valid UUID',
    }),
    categoryId: uuidV4Schema.messages({
      'string.base': 'Category ID must be a string',
      'string.uuid': 'Category ID must be a valid UUID',
    }),
    amount: Joi.number().min(0.01).precision(2).messages({
      'number.base': 'Amount must be a number',
      'number.min': 'Amount must be at least 0.01',
      'number.precision': 'Amount must have at most 2 decimal places',
    }),
    expenseDate: Joi.date().messages({
      'date.base': 'Expense date must be a valid date',
    }),
    sortBy: Joi.string()
      .pattern(/^[a-zA-Z0-9_]+:(asc|desc)$/)
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
    deleted: Joi.string().valid('true', 'false', 'all').optional().messages({
      'string.base': 'Deleted must be a string',
      'any.only': 'Deleted must be one of "true", "false", or "all"',
    }),
  }),
};

const getExpense = {
  params: Joi.object().keys({
    id: uuidV4Schema.required().messages({
      'string.base': 'ID must be a string',
      'string.empty': 'ID is required',
      'string.uuid': 'ID must be a valid UUID',
    }),
  }),
  query: Joi.object().keys({
    include: Joi.string().optional().messages({
      'string.base': 'Include must be a string',
    }), // Added include parameter
  }),
};

const updateExpense = {
  params: Joi.object().keys({
    id: uuidV4Schema.required().messages({
      'string.base': 'ID must be a string',
      'string.empty': 'ID is required',
      'string.uuid': 'ID must be a valid UUID',
    }),
  }),
  body: Joi.object()
    .keys({
      propertyId: uuidV4Schema.allow(null).messages({
        'string.base': 'Property ID must be a string',
        'string.uuid': 'Property ID must be a valid UUID',
      }),
      unitId: uuidV4Schema.allow(null).messages({
        'string.base': 'Unit ID must be a string',
        'string.uuid': 'Unit ID must be a valid UUID',
      }),
      billId: uuidV4Schema.allow(null).messages({
        'string.base': 'Bill ID must be a string',
        'string.uuid': 'Bill ID must be a valid UUID',
      }),
      categoryId: uuidV4Schema.messages({
        'string.base': 'Category ID must be a string',
        'string.uuid': 'Category ID must be a valid UUID',
      }),
      amount: Joi.number().min(0.01).precision(2).messages({
        'number.base': 'Amount must be a number',
        'number.min': 'Amount must be at least 0.01',
        'number.precision': 'Amount must have at most 2 decimal places',
      }),
      expenseDate: Joi.date().messages({
        'date.base': 'Expense date must be a valid date',
      }),
      description: Joi.string().max(1000).allow(null).messages({
        'string.base': 'Description must be a string',
        'string.max': 'Description cannot exceed 1000 characters',
      }),
    })
    .min(1)
    .messages({
      'object.min': 'At least one field must be provided for update',
    }),
};

const deleteExpense = {
  params: Joi.object().keys({
    id: uuidV4Schema.required().messages({
      'string.base': 'ID must be a string',
      'string.empty': 'ID is required',
      'string.uuid': 'ID must be a valid UUID',
    }),
  }),
};
const restoreExpense = {
  params: Joi.object().keys({
    id: uuidV4Schema.required().messages({
      'string.base': 'ID must be a string',
      'string.empty': 'ID is required',
      'string.uuid': 'ID must be a valid UUID',
    }),
  }),
};

const deleteHardExpense = {
  params: Joi.object().keys({
    id: uuidV4Schema.required().messages({
      'string.base': 'ID must be a string',
      'string.empty': 'ID is required',
      'string.uuid': 'ID must be a valid UUID',
    }),
  }),
};

module.exports = {
  createExpense,
  getExpenses,
  getExpense,
  updateExpense,
  deleteExpense,
  restoreExpense,
  deleteHardExpense,
};
