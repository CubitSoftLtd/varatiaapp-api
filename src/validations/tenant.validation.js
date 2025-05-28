// src/validations/tenant.validation.js
const Joi = require('joi');

const createTenant = {
  body: Joi.object().keys({
    name: Joi.string().required().min(3).max(100),
    email: Joi.string().required().email(),
    phone: Joi.string().required().min(10).max(15),
  }),
};

const getTenants = {
  query: Joi.object().keys({
    name: Joi.string().min(1).max(100),
    sortBy: Joi.string().pattern(/^[a-zA-Z]+:(asc|desc)$/),
    limit: Joi.number().integer().min(1).default(10),
    page: Joi.number().integer().min(1).default(1),
  }),
};

const getTenant = {
  params: Joi.object().keys({
    id: Joi.number().integer().required().min(1),
  }),
};

const updateTenant = {
  params: Joi.object().keys({
    id: Joi.number().integer().required().min(1),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string().min(3).max(100),
      email: Joi.string().email(),
      phone: Joi.string().min(10).max(15),
    })
    .min(1), // At least one field must be provided for update
};

const deleteTenant = {
  params: Joi.object().keys({
    id: Joi.number().integer().required().min(1),
  }),
};

module.exs = {
  createTenant,
  getTenants,
  getTenant,
  updateTenant,
  deleteTenant,
};
