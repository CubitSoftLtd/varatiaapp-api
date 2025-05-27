const Joi = require('joi');

const createMaintenanceRequest = {
  params: Joi.object().keys({
    unitId: Joi.number().integer().required().min(1),
  }),
  body: Joi.object().keys({
    description: Joi.string().required().max(500),
    requestDate: Joi.date().required(),
  }),
};

const getMaintenanceRequests = {
  params: Joi.object().keys({
    unitId: Joi.number().integer().required().min(1),
  }),
  query: Joi.object().keys({
    sortBy: Joi.string().pattern(/^[a-zA-Z]+:(asc|desc)$/),
    limit: Joi.number().integer().min(1).default(10),
    page: Joi.number().integer().min(1).default(1),
  }),
};

const getMaintenanceRequest = {
  params: Joi.object().keys({
    id: Joi.number().integer().required().min(1),
  }),
};

const updateMaintenanceRequest = {
  params: Joi.object().keys({
    id: Joi.number().integer().required().min(1),
  }),
  body: Joi.object()
    .keys({
      description: Joi.string().max(500),
      status: Joi.string().valid('open', 'in-progress', 'closed'),
    })
    .min(1),
};

const deleteMaintenanceRequest = {
  params: Joi.object().keys({
    id: Joi.number().integer().required().min(1),
  }),
};

module.exports = {
  createMaintenanceRequest,
  getMaintenanceRequests,
  getMaintenanceRequest,
  updateMaintenanceRequest,
  deleteMaintenanceRequest,
};
