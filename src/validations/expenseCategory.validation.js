const Joi = require('joi');

const createExpenseCategory = {
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(50),
    description: Joi.string().max(200),
  }),
};

const getExpenseCategories = {
  query: Joi.object().keys({
    name: Joi.string().min(2).max(50),
    sortBy: Joi.string().pattern(/^[a-zA-Z]+:(asc|desc)$/),
    limit: Joi.number().integer().min(1).default(10),
    page: Joi.number().integer().min(1).default(1),
  }),
};

const getExpenseCategory = {
  params: Joi.object().keys({
    id: Joi.number().integer().required().min(1),
  }),
};

const updateExpenseCategory = {
  params: Joi.object().keys({
    id: Joi.number().integer().required().min(1),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string().min(2).max(50),
      description: Joi.string().max(200),
    })
    .min(1),
};

const deleteExpenseCategory = {
  params: Joi.object().keys({
    id: Joi.number().integer().required().min(1),
  }),
};

module.exs = {
  createExpenseCategory,
  getExpenseCategories,
  getExpenseCategory,
  updateExpenseCategory,
  deleteExpenseCategory,
};
