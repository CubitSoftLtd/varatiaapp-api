const Joi = require('joi');

const createUtilityCharge = {
  params: Joi.object().keys({
    utilityTypeId: Joi.number().integer().required().min(1),
  }),
  body: Joi.object().keys({
    rate: Joi.number().required().min(0),
    effectiveDate: Joi.date().required(),
  }),
};

const getUtilityCharges = {
  params: Joi.object().keys({
    utilityTypeId: Joi.number().integer().required().min(1),
  }),
  query: Joi.object().keys({
    sortBy: Joi.string().pattern(/^[a-zA-Z]+:(asc|desc)$/),
    limit: Joi.number().integer().min(1).default(10),
    page: Joi.number().integer().min(1).default(1),
  }),
};

const getUtilityCharge = {
  params: Joi.object().keys({
    id: Joi.number().integer().required().min(1),
  }),
};

const updateUtilityCharge = {
  params: Joi.object().keys({
    id: Joi.number().integer().required().min(1),
  }),
  body: Joi.object()
    .keys({
      rate: Joi.number().min(0),
      effectiveDate: Joi.date(),
    })
    .min(1),
};

const deleteUtilityCharge = {
  params: Joi.object().keys({
    id: Joi.number().integer().required().min(1),
  }),
};

module.exports = {
  createUtilityCharge,
  getUtilityCharges,
  getUtilityCharge,
  updateUtilityCharge,
  deleteUtilityCharge,
};
