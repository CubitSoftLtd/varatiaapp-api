// src/validations/unit.validation.js
const Joi = require('joi');

const createUnit = {
  body: Joi.object().keys({
    propertyId: Joi.string()
      .guid({ version: ['uuidv4'] })
      .required(),
    name: Joi.string().required().min(1).max(10),
    rentAmount: Joi.number().precision(2).positive().required(),
  }),
};

const getUnits = {
  query: Joi.object().keys({
    propertyId: Joi.string().guid({ version: ['uuidv4'] }),
    sortBy: Joi.string().pattern(/^[a-zA-Z]+:(asc|desc)$/),
    limit: Joi.number().integer().min(1).default(10),
    page: Joi.number().integer().min(1).default(1),
  }),
};

const getUnit = {
  params: Joi.object().keys({
    id: Joi.string()
      .guid({ version: ['uuidv4'] })
      .required(),
  }),
};

const updateUnit = {
  params: Joi.object().keys({
    id: Joi.string()
      .guid({ version: ['uuidv4'] })
      .required(),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string().min(1).max(10),
      rentAmount: Joi.number().precision(2).positive(),
    })
    .min(1), // At least one field must be provided for update
};

const deleteUnit = {
  params: Joi.object().keys({
    id: Joi.string()
      .guid({ version: ['uuidv4'] })
      .required(),
  }),
};

module.exports = {
  createUnit,
  getUnits,
  getUnit,
  updateUnit,
  deleteUnit,
};
