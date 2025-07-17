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
const getMonthlyFinancialReport = {
  query: Joi.object().keys({
    year: Joi.number().integer().min(2000).max(2100).optional(),
  }),
};
module.exports = {
  getFinancialSummary,
  getMaintenanceStats,
  getMonthlyFinancialReport,
};
