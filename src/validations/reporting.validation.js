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

const getBillPaymentPieByYear = {
  query: Joi.object().keys({
    year: Joi.number().integer().min(2000).max(2099).optional(),
  }),
};

const getMeterRechargeReport = {
  query: Joi.object().keys({
    propertyId: Joi.string().uuid().required(),
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().greater(Joi.ref('startDate')).required(),
    meterId: Joi.string().uuid().optional(),
  }),
};
const getSubmeterConsumptionReport = {
  query: Joi.object().keys({
    propertyId: Joi.string().uuid().required(),
    meterId: Joi.string().uuid().optional(),
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().greater(Joi.ref('startDate')).required(),
  }),
};
const getBillByPropertyAndDateRangeReport = {
  query: Joi.object().keys({
    propertyId: Joi.string().uuid().required(),
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().greater(Joi.ref('startDate')).required(),
  }),
};
const getPersonalExpenseReportV = {
  query: Joi.object().keys({
    beneficiary: Joi.string().required(),
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().greater(Joi.ref('startDate')).required(),
  }),
};
module.exports = {
  getFinancialSummary,
  getMaintenanceStats,
  getMonthlyFinancialReport,
  getBillPaymentPieByYear,
  getMeterRechargeReport,
  getSubmeterConsumptionReport,
  getBillByPropertyAndDateRangeReport,
  getPersonalExpenseReportV,
};
