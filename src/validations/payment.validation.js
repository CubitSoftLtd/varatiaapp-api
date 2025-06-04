const Joi = require('joi');

const createPayment = {
  body: Joi.object().keys({
    billId: Joi.string().required().uuid().messages({
      'string.base': 'Bill ID must be a string',
      'string.empty': 'Bill ID is required',
      'string.uuid': 'Bill ID must be a valid UUID',
    }),
    amountPaid: Joi.number().required().greater(0),
    paymentDate: Joi.date().required(),
    paymentMethod: Joi.string().valid('cash', 'credit_card', 'bank_transfer', 'mobile_payment', 'check').required(),
  }),
};

const getPayments = {
  query: Joi.object().keys({
    billId: Joi.string().uuid().messages({
      'string.base': 'Bill ID must be a string',
      'string.uuid': 'Bill ID must be a valid UUID',
    }),
    sortBy: Joi.string().pattern(/^[a-zA-Z]+:(asc|desc)$/),
    limit: Joi.number().integer().min(1).default(10),
    page: Joi.number().integer().min(1).default(1),
  }),
};

const getPaymentsByBillId = {
  params: Joi.object().keys({
    billId: Joi.string().required().uuid().messages({
      'string.base': 'Bill ID must be a string',
      'string.empty': 'Bill ID is required',
      'string.uuid': 'Bill ID must be a valid UUID',
    }),
  }),
};

const getPayment = {
  params: Joi.object().keys({
    id: Joi.string().required().uuid().messages({
      'string.base': 'Payment ID must be a string',
      'string.empty': 'Payment ID is required',
      'string.uuid': 'Payment ID must be a valid UUID',
    }),
  }),
};

const updatePayment = {
  params: Joi.object().keys({
    id: Joi.string().required().uuid().messages({
      'string.base': 'Payment ID must be a string',
      'string.empty': 'Payment ID is required',
      'string.uuid': 'Payment ID must be a valid UUID',
    }),
  }),
  body: Joi.object()
    .keys({
      amountPaid: Joi.number().greater(0),
      paymentDate: Joi.date(),
      paymentMethod: Joi.string().valid('cash', 'credit_card', 'bank_transfer', 'mobile_payment', 'check'),
    })
    .min(1),
};

const deletePayment = {
  params: Joi.object().keys({
    id: Joi.string().required().uuid().messages({
      'string.base': 'Payment ID must be a string',
      'string.empty': 'Payment ID is required',
      'string.uuid': 'Payment ID must be a valid UUID',
    }),
  }),
};

module.exports = {
  createPayment,
  getPayments,
  getPaymentsByBillId,
  getPayment,
  updatePayment,
  deletePayment,
};
