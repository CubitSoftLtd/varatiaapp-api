const Joi = require('joi');

const createPropertyExpense = {
  params: Joi.object().keys({
    propertyId: Joi.string().guid({ version: 'uuidv4' }).required(),
  }),
  body: Joi.object().keys({
    amount: Joi.number().required().min(0),
    expenseDate: Joi.date().required(),
    categoryId: Joi.string().guid({ version: 'uuidv4' }).required(),
    description: Joi.string().allow('', null),
  }),
};

const createUnitExpense = {
  params: Joi.object().keys({
    unitId: Joi.string().guid({ version: 'uuidv4' }).required(),
  }),
  body: Joi.object().keys({
    amount: Joi.number().required().min(0),
    expenseDate: Joi.date().required(),
    categoryId: Joi.string().guid({ version: 'uuidv4' }).required(),
    description: Joi.string().allow('', null),
  }),
};

const createUserExpense = {
  params: Joi.object().keys({
    userId: Joi.string().guid({ version: 'uuidv4' }).required(),
  }),
  body: Joi.object().keys({
    amount: Joi.number().required().min(0),
    expenseDate: Joi.date().required(),
    categoryId: Joi.string().guid({ version: 'uuidv4' }).required(),
    description: Joi.string().allow('', null),
  }),
};

const getPropertyExpenses = {
  params: Joi.object().keys({
    propertyId: Joi.string().guid({ version: 'uuidv4' }).required(),
  }),
  query: Joi.object().keys({
    categoryId: Joi.string().guid({ version: 'uuidv4' }).required(),
    sortBy: Joi.string().pattern(/^[a-zA-Z]+:(asc|desc)$/),
    limit: Joi.number().integer().min(1).default(10),
    page: Joi.number().integer().min(1).default(1),
  }),
};

const getUnitExpenses = {
  params: Joi.object().keys({
    unitId: Joi.string().guid({ version: 'uuidv4' }).required(),
  }),
  query: Joi.object().keys({
    categoryId: Joi.string().guid({ version: 'uuidv4' }),
    sortBy: Joi.string().pattern(/^[a-zA-Z]+:(asc|desc)$/),
    limit: Joi.number().integer().min(1).default(10),
    page: Joi.number().integer().min(1).default(1),
  }),
};

const getUserExpenses = {
  params: Joi.object().keys({
    userId: Joi.string().guid({ version: 'uuidv4' }).required(),
  }),
  query: Joi.object().keys({
    categoryId: Joi.string().guid({ version: 'uuidv4' }).required(),
    sortBy: Joi.string().pattern(/^[a-zA-Z]+:(asc|desc)$/),
    limit: Joi.number().integer().min(1).default(10),
    page: Joi.number().integer().min(1).default(1),
  }),
};

const getExpense = {
  params: Joi.object().keys({
    id: Joi.string().guid({ version: 'uuidv4' }).required(),
  }),
};

const updateExpense = {
  params: Joi.object().keys({
    id: Joi.string().guid({ version: 'uuidv4' }).required(),
  }),
  body: Joi.object()
    .keys({
      amount: Joi.number().min(0),
      expenseDate: Joi.date(),
      description: Joi.string().allow('', null),
    })
    .min(1),
};

const deleteExpense = {
  params: Joi.object().keys({
    id: Joi.string().guid({ version: 'uuidv4' }).required(),
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
