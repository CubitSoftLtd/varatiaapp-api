const Joi = require('joi');

const createPropertyExpense = {
  params: Joi.object().keys({
    propertyId: Joi.string().uuid().required().messages({
      'string.base': 'Property ID must be a string',
      'string.empty': 'Property ID is required',
      'string.uuid': 'Property ID must be a valid UUID',
    }),
  }),
  body: Joi.object().keys({
    accountId: Joi.string().uuid().required().messages({
      'string.base': 'Account ID must be a string',
      'string.empty': 'Account ID is required',
      'string.uuid': 'Account ID must be a valid UUID',
    }),
    amount: Joi.number().required().min(0),
    expenseDate: Joi.date().required(),
    categoryId: Joi.string().uuid().required().messages({
      'string.base': 'Category ID must be a string',
      'string.empty': 'Category ID is required',
      'string.uuid': 'Category ID must be a valid UUID',
    }),
    expenseType: Joi.string().valid('utility').required(),
    description: Joi.string().allow('', null),
  }),
};

const createUnitExpense = {
  params: Joi.object().keys({
    unitId: Joi.string().uuid().required().messages({
      'string.base': 'Unit ID must be a string',
      'string.empty': 'Unit ID is required',
      'string.uuid': 'Unit ID must be a valid UUID',
    }),
  }),
  body: Joi.object().keys({
    accountId: Joi.string().uuid().required().messages({
      'string.base': 'Account ID must be a string',
      'string.empty': 'Account ID is required',
      'string.uuid': 'Account ID must be a valid UUID',
    }),
    amount: Joi.number().required().min(0),
    expenseDate: Joi.date().required(),
    categoryId: Joi.string().uuid().required().messages({
      'string.base': 'Category ID must be a string',
      'string.empty': 'Category ID is required',
      'string.uuid': 'Category ID must be a valid UUID',
    }),
    expenseType: Joi.string().valid('tenant_charge').required(),
    billId: Joi.string().uuid().required().messages({
      'string.base': 'Bill ID must be a string',
      'string.empty': 'Bill ID is required',
      'string.uuid': 'Bill ID must be a valid UUID',
    }),
    description: Joi.string().allow('', null),
  }),
};

const createUserExpense = {
  params: Joi.object().keys({
    userId: Joi.string().uuid().required().messages({
      'string.base': 'User ID must be a string',
      'string.empty': 'User ID is required',
      'string.uuid': 'User ID must be a valid UUID',
    }),
  }),
  body: Joi.object().keys({
    accountId: Joi.string().uuid().required().messages({
      'string.base': 'Account ID must be a string',
      'string.empty': 'Account ID is required',
      'string.uuid': 'Account ID must be a valid UUID',
    }),
    amount: Joi.number().required().min(0),
    expenseDate: Joi.date().required(),
    categoryId: Joi.string().uuid().required().messages({
      'string.base': 'Category ID must be a string',
      'string.empty': 'Category ID is required',
      'string.uuid': 'Category ID must be a valid UUID',
    }),
    expenseType: Joi.string().valid('personal').required(),
    description: Joi.string().allow('', null),
  }),
};

const getPropertyExpenses = {
  params: Joi.object().keys({
    propertyId: Joi.string().uuid().required().messages({
      'string.base': 'Property ID must be a string',
      'string.empty': 'Property ID is required',
      'string.uuid': 'Property ID must be a valid UUID',
    }),
  }),
  query: Joi.object().keys({
    categoryId: Joi.string().uuid().messages({
      'string.base': 'Category ID must be a string',
      'string.uuid': 'Category ID must be a valid UUID',
    }),
    billId: Joi.string().uuid().messages({
      'string.base': 'Bill ID must be a string',
      'string.uuid': 'Bill ID must be a valid UUID',
    }),
    expenseType: Joi.string().valid('utility', 'tenant_charge'),
    sortBy: Joi.string().pattern(/^[a-zA-Z]+:(asc|desc)$/),
    limit: Joi.number().integer().min(1).default(10),
    page: Joi.number().integer().min(1).default(1),
  }),
};

const getUnitExpenses = {
  params: Joi.object().keys({
    unitId: Joi.string().uuid().required().messages({
      'string.base': 'Unit ID must be a string',
      'string.empty': 'Unit ID is required',
      'string.uuid': 'Unit ID must be a valid UUID',
    }),
  }),
  query: Joi.object().keys({
    categoryId: Joi.string().uuid().messages({
      'string.base': 'Category ID must be a string',
      'string.uuid': 'Category ID must be a valid UUID',
    }),
    billId: Joi.string().uuid().messages({
      'string.base': 'Bill ID must be a string',
      'string.uuid': 'Bill ID must be a valid UUID',
    }),
    expenseType: Joi.string().valid('tenant_charge'),
    sortBy: Joi.string().pattern(/^[a-zA-Z]+:(asc|desc)$/),
    limit: Joi.number().integer().min(1).default(10),
    page: Joi.number().integer().min(1).default(1),
  }),
};

const getUserExpenses = {
  params: Joi.object().keys({
    userId: Joi.string().uuid().required().messages({
      'string.base': 'User ID must be a string',
      'string.empty': 'User ID is required',
      'string.uuid': 'User ID must be a valid UUID',
    }),
  }),
  query: Joi.object().keys({
    categoryId: Joi.string().uuid().messages({
      'string.base': 'Category ID must be a string',
      'string.uuid': 'Category ID must be a valid UUID',
    }),
    billId: Joi.string().uuid().messages({
      'string.base': 'Bill ID must be a string',
      'string.uuid': 'Bill ID must be a valid UUID',
    }),
    expenseType: Joi.string().valid('personal'),
    sortBy: Joi.string().pattern(/^[a-zA-Z]+:(asc|desc)$/),
    limit: Joi.number().integer().min(1).default(10),
    page: Joi.number().integer().min(1).default(1),
  }),
};

const getExpense = {
  params: Joi.object().keys({
    id: Joi.string().uuid().required().messages({
      'string.base': 'Expense ID must be a string',
      'string.empty': 'Expense ID is required',
      'string.uuid': 'Expense ID must be a valid UUID',
    }),
  }),
};

const updateExpense = {
  params: Joi.object().keys({
    id: Joi.string().uuid().required().messages({
      'string.base': 'Expense ID must be a string',
      'string.empty': 'Expense ID is required',
      'string.uuid': 'Expense ID must be a valid UUID',
    }),
  }),
  body: Joi.object()
    .keys({
      amount: Joi.number().min(0),
      expenseDate: Joi.date(),
      categoryId: Joi.string().uuid().messages({
        'string.base': 'Category ID must be a string',
        'string.uuid': 'Category ID must be a valid UUID',
      }),
      billId: Joi.string().uuid().messages({
        'string.base': 'Bill ID must be a string',
        'string.uuid': 'Bill ID must be a valid UUID',
      }),
      description: Joi.string().allow('', null),
    })
    .min(1),
};

const deleteExpense = {
  params: Joi.object().keys({
    id: Joi.string().uuid().required().messages({
      'string.base': 'Expense ID must be a string',
      'string.empty': 'Expense ID is required',
      'string.uuid': 'Expense ID must be a valid UUID',
    }),
  }),
};

module.exports = {
  createPropertyExpense,
  createUnitExpense,
  createUserExpense,
  getPropertyExpenses,
  getUnitExpenses,
  getUserExpenses,
  getExpense,
  updateExpense,
  deleteExpense,
};
