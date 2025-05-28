const Joi = require('joi');

const createMeter = {
  body: Joi.object().keys({
    unitId: Joi.number().integer().required().min(1),
    meterType: Joi.string().required().valid('water', 'electricity', 'gas'),
    serialNumber: Joi.string().required().min(5).max(50),
    status: Joi.string().valid('active', 'inactive').default('active'),
  }),
};

const getMeters = {
  query: Joi.object().keys({
    unitId: Joi.number().integer().min(1),
    meterType: Joi.string().valid('water', 'electricity', 'gas'),
    status: Joi.string().valid('active', 'inactive'),
    sortBy: Joi.string().pattern(/^[a-zA-Z]+:(asc|desc)$/),
    limit: Joi.number().integer().min(1).default(10),
    page: Joi.number().integer().min(1).default(1),
  }),
};

const getMeter = {
  params: Joi.object().keys({
    id: Joi.number().integer().required().min(1),
  }),
};

const updateMeter = {
  params: Joi.object().keys({
    id: Joi.number().integer().required().min(1),
  }),
  body: Joi.object()
    .keys({
      meterType: Joi.string().valid('water', 'electricity', 'gas'),
      serialNumber: Joi.string().min(5).max(50),
      status: Joi.string().valid('active', 'inactive'),
    })
    .min(1),
};

const deleteMeter = {
  params: Joi.object().keys({
    id: Joi.number().integer().required().min(1),
  }),
};

module.exs = {
  createMeter,
  getMeters,
  getMeter,
  updateMeter,
  deleteMeter,
};
