const Joi = require('joi');

const createAccount = {
  body: Joi.object().keys({
    name: Joi.string().required().min(3).max(100),
    accountNumber: Joi.string().required().min(5).max(50),
    type: Joi.string().required().valid('savings', 'checking'),
  }),
};

const getAccounts = {
  query: Joi.object().keys({
    name: Joi.string().min(1).max(100),
    type: Joi.string().valid('savings', 'checking'),
    sortBy: Joi.string().pattern(/^[a-zA-Z]+:(asc|desc)$/),
    limit: Joi.number().integer().min(1).default(10),
    page: Joi.number().integer().min(1).default(1),
  }),
};

const getAccount = {
  params: Joi.object().keys({
    id: Joi.number().integer().required().min(1),
  }),
};

const updateAccount = {
  params: Joi.object().keys({
    id: Joi.number().integer().required().min(1),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string().min(3).max(100),
      status: Joi.string().valid('active', 'inactive'),
    })
    .min(1), // At least one field must be provided for update
};

const deleteAccount = {
  params: Joi.object().keys({
    id: Joi.number().integer().required().min(1),
  }),
};

module.exports = {
  createAccount,
  getAccounts,
  getAccount,
  updateAccount,
  deleteAccount,
};
