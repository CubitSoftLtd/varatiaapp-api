const Joi = require('joi');

const createSubmeter = {
  body: Joi.object().keys({
    unitId: Joi.number().integer().required().min(1),
    parentMeterId: Joi.number().integer().required().min(1),
    submeterType: Joi.string().required().valid('water', 'electricity', 'gas'),
    serialNumber: Joi.string().required().min(5).max(50),
    status: Joi.string().valid('active', 'inactive').default('active'),
  }),
};

const getSubmeters = {
  query: Joi.object().keys({
    unitId: Joi.number().integer().min(1),
    parentMeterId: Joi.number().integer().min(1),
    submeterType: Joi.string().valid('water', 'electricity', 'gas'),
    status: Joi.string().valid('active', 'inactive'),
    sortBy: Joi.string().pattern(/^[a-zA-Z]+:(asc|desc)$/),
    limit: Joi.number().integer().min(1).default(10),
    page: Joi.number().integer().min(1).default(1),
  }),
};

const getSubmeter = {
  params: Joi.object().keys({
    id: Joi.number().integer().required().min(1),
  }),
};

const updateSubmeter = {
  params: Joi.object().keys({
    id: Joi.number().integer().required().min(1),
  }),
  body: Joi.object()
    .keys({
      submeterType: Joi.string().valid('water', 'electricity', 'gas'),
      serialNumber: Joi.string().min(5).max(50),
      status: Joi.string().valid('active', 'inactive'),
    })
    .min(1),
};

const deleteSubmeter = {
  params: Joi.object().keys({
    id: Joi.number().integer().required().min(1),
  }),
};

module.exs = {
  createSubmeter,
  getSubmeters,
  getSubmeter,
  updateSubmeter,
  deleteSubmeter,
};
