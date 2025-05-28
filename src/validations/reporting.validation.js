// src/validations/reing.validation.js
const Joi = require('joi');

const getFinancialSummary = {
  query: Joi.object().keys({
    startDate: Joi.date().required(),
    endDate: Joi.date().required().greater(Joi.ref('startDate')),
  }),
};

const getMaintenanceStats = {
  query: Joi.object().keys({
    propertyId: Joi.number().integer().min(1),
  }),
};

module.exs = {
  getFinancialSummary,
  getMaintenanceStats,
};
