const Joi = require('joi');

const createAdmin = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8),
    role: Joi.string().required().valid('admin', 'super-admin'),
  }),
};

const getAdmins = {
  query: Joi.object().keys({
    role: Joi.string().valid('admin', 'super-admin'),
    sortBy: Joi.string().pattern(/^[a-zA-Z]+:(asc|desc)$/),
    limit: Joi.number().integer().min(1).default(10),
    page: Joi.number().integer().min(1).default(1),
  }),
};

const getAdmin = {
  params: Joi.object().keys({
    id: Joi.number().integer().required().min(1),
  }),
};

const updateAdmin = {
  params: Joi.object().keys({
    id: Joi.number().integer().required().min(1),
  }),
  body: Joi.object()
    .keys({
      email: Joi.string().email(),
      role: Joi.string().valid('admin', 'super-admin'),
    })
    .min(1),
};

const deleteAdmin = {
  params: Joi.object().keys({
    id: Joi.number().integer().required().min(1),
  }),
};

module.exs = {
  createAdmin,
  getAdmins,
  getAdmin,
  updateAdmin,
  deleteAdmin,
};
