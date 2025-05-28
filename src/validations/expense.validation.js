const Joi = require('joi');

const createExpense = {
  params: Joi.object().keys({
    propertyId: Joi.number().integer().required().min(1),
  }),
  body: Joi.object().keys({
    amount: Joi.number().required().min(0),
    expenseDate: Joi.date().required(),
    categoryId: Joi.number().integer().required().min(1),
  }),
};

const getExpenses = {
  params: Joi.object().keys({
    propertyId: Joi.number().integer().required().min(1),
  }),
  query: Joi.object().keys({
    categoryId: Joi.number().integer().min(1),
    sortBy: Joi.string().pattern(/^[a-zA-Z]+:(asc|desc)$/),
    limit: Joi.number().integer().min(1).default(10),
    page: Joi.number().integer().min(1).default(1),
  }),
};

const getExpense = {
  params: Joi.object().keys({
    id: Joi.number().integer().required().min(1),
  }),
};

const updateExpense = {
  params: Joi.object().keys({
    id: Joi.number().integer().required().min(1),
  }),
  body: Joi.object()
    .keys({
      amount: Joi.number().min(0),
      expenseDate: Joi.date(),
    })
    .min(1),
};

const deleteExpense = {
  params: Joi.object().keys({
    id: Joi.number().integer().required().min(1),
  }),
};

module.exs = {
  createExpense,
  getExpenses,
  getExpense,
  updateExpense,
  deleteExpense,
};
