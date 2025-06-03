const Joi = require('joi');

const createExpenseCategory = {
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(50),
    type: Joi.string().valid('utility', 'personal', 'tenant_charge').required(),
    description: Joi.string().max(200),
  }),
};

const getExpenseCategories = {
  query: Joi.object().keys({
    name: Joi.string().min(2).max(50),
    type: Joi.string().valid('utility', 'personal', 'tenant_charge'),
    sortBy: Joi.string().pattern(/^[a-zA-Z]+:(asc|desc)$/),
    limit: Joi.number().integer().min(1).default(10),
    page: Joi.number().integer().min(1).default(1),
  }),
};

const getExpenseCategory = {
  params: Joi.object().keys({
    id: Joi.string().guid({ version: 'uuidv4' }).required(),
  }),
};

const updateExpenseCategory = {
  params: Joi.object().keys({
    id: Joi.string().guid({ version: 'uuidv4' }).required(),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string().min(2).max(50),
      type: Joi.string().valid('utility', 'personal', 'tenant_charge'),
      description: Joi.string().max(200),
    })
    .min(1),
};

const deleteExpenseCategory = {
  params: Joi.object().keys({
    id: Joi.string().guid({ version: 'uuidv4' }).required(),
  }),
};

module.exports = {
  createExpenseCategory,
  getExpenseCategories,
  getExpenseCategory,
  updateExpenseCategory,
  deleteExpenseCategory,
};
