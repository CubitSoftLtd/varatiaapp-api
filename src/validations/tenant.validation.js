// src/validations/tenant.validation.js
const Joi = require('joi');

const createTenant = {
  body: Joi.object().keys({
    firstName: Joi.string().required().min(1).max(50),
    lastName: Joi.string().required().min(1).max(50),
    email: Joi.string().required().email(),
    phoneNumber: Joi.string()
      .required()
      .pattern(/^\+?[0-9\s\-()]{10,20}$/),
    emergencyContact: Joi.string()
      .allow(null)
      .pattern(/^\+?[0-9\s\-()]{10,20}$/),
    unitId: Joi.string()
      .guid({ version: ['uuidv4'] })
      .allow(null),
    leaseStartDate: Joi.date().required(),
    leaseEndDate: Joi.date().allow(null).min(Joi.ref('leaseStartDate')),
    depositAmount: Joi.number().precision(2).min(0).required(),
    status: Joi.string().valid('active', 'inactive', 'evicted').default('active'),
    nationalId: Joi.string()
      .required()
      .pattern(/^[A-Za-z0-9\-/]{5,20}$/),
  }),
};

const getTenants = {
  query: Joi.object().keys({
    firstName: Joi.string().min(1).max(50),
    lastName: Joi.string().min(1).max(50),
    email: Joi.string().email(),
    sortBy: Joi.string().pattern(/^[a-zA-Z]+:(asc|desc)$/),
    limit: Joi.number().integer().min(1).default(10),
    page: Joi.number().integer().min(1).default(1),
  }),
};

const getTenant = {
  params: Joi.object().keys({
    id: Joi.string()
      .guid({ version: ['uuidv4'] })
      .required(),
  }),
};

const updateTenant = {
  params: Joi.object().keys({
    id: Joi.string()
      .guid({ version: ['uuidv4'] })
      .required(),
  }),
  body: Joi.object()
    .keys({
      firstName: Joi.string().min(1).max(50),
      lastName: Joi.string().min(1).max(50),
      email: Joi.string().email(),
      phoneNumber: Joi.string().pattern(/^\+?[0-9\s\-()]{10,20}$/),
      emergencyContact: Joi.string()
        .allow(null)
        .pattern(/^\+?[0-9\s\-()]{10,20}$/),
      unitId: Joi.string()
        .guid({ version: ['uuidv4'] })
        .allow(null),
      leaseStartDate: Joi.date(),
      leaseEndDate: Joi.date().allow(null).min(Joi.ref('leaseStartDate')),
      depositAmount: Joi.number().precision(2).min(0),
      status: Joi.string().valid('active', 'inactive', 'evicted'),
      nationalId: Joi.string().pattern(/^[A-Za-z0-9\-/]{5,20}$/),
    })
    .min(1), // At least one field must be provided for update
};

const deleteTenant = {
  params: Joi.object().keys({
    id: Joi.string()
      .guid({ version: ['uuidv4'] })
      .required(),
  }),
};

const getTenantsByUnitAndProperty = {
  params: Joi.object().keys({
    propertyId: Joi.string()
      .guid({ version: ['uuidv4'] })
      .required(),
    unitId: Joi.string()
      .guid({ version: ['uuidv4'] })
      .required(),
  }),
};

const getHistoricalTenantsByUnit = {
  params: Joi.object().keys({
    unitId: Joi.string()
      .guid({ version: ['uuidv4'] })
      .required(),
  }),
  query: Joi.object().keys({
    startDate: Joi.date(),
    endDate: Joi.date().min(Joi.ref('startDate')),
  }),
};

module.exports = {
  createTenant,
  getTenants,
  getTenant,
  updateTenant,
  deleteTenant,
  getTenantsByUnitAndProperty,
  getHistoricalTenantsByUnit,
};
