const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createRentSlip = {
  body: Joi.object().keys({
    rentId: Joi.string().custom(objectId).required(),
    tenantId: Joi.string().custom(objectId).required(),
    amountPaid: Joi.number().required(),
    paymentDate: Joi.date().required(),
  }),
};

const getAllRentSlips = {
  query: Joi.object().keys({
    tenantId: Joi.string().custom(objectId),
    rentId: Joi.string().custom(objectId),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getRentSlipById = {
  params: Joi.object().keys({
    id: Joi.string().custom(objectId).required(),
  }),
};

const updateRentSlip = {
  params: Joi.object().keys({
    id: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object()
    .keys({
      rentId: Joi.string().custom(objectId),
      tenantId: Joi.string().custom(objectId),
      amountPaid: Joi.number(),
      paymentDate: Joi.date(),
    })
    .min(1),
};

const deleteRentSlip = {
  params: Joi.object().keys({
    id: Joi.string().custom(objectId).required(),
  }),
};

module.exports = {
  createRentSlip,
  getAllRentSlips,
  getRentSlipById,
  updateRentSlip,
  deleteRentSlip,
};
