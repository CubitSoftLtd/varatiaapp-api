// src/validations/unit.validation.js
const Joi = require('joi');

const createUnit = {
  body: Joi.object().keys({
    propertyId: Joi.number().integer().required().min(1),
    unitNumber: Joi.string().required().min(1).max(10),
    type: Joi.string().required().valid('apartment', 'office', 'retail'),
  }),
};

const getUnits = {
  query: Joi.object().keys({
    propertyId: Joi.number().integer().min(1),
    type: Joi.string().valid('apartment', 'office', 'retail'),
    sortBy: Joi.string().pattern(/^[a-zA-Z]+:(asc|desc)$/),
    limit: Joi.number().integer().min(1).default(10),
    page: Joi.number().integer().min(1).default(1),
  }),
};

const getUnit = {
  params: Joi.object().keys({
    id: Joi.number().integer().required().min(1),
  }),
};

const updateUnit = {
  params: Joi.object().keys({
    id: Joi.number().integer().required().min(1),
  }),
  body: Joi.object()
    .keys({
      unitNumber: Joi.string().min(1).max(10),
      type: Joi.string().valid('apartment', 'office', 'retail'),
    })
    .min(1), // At least one field must be provided for update
};

const deleteUnit = {
  params: Joi.object().keys({
    id: Joi.number().integer().required().min(1),
  }),
};

module.exports = {
  createUnit,
  getUnits,
  getUnit,
  updateUnit,
  deleteUnit,
};
