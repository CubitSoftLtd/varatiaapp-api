const Joi = require('joi');

const createPayment = {
  body: Joi.object().keys({
    billId: Joi.number().integer().required().min(1),
    tenantId: Joi.number().integer().required().min(1),
    amount: Joi.number().required().min(0),
    paymentDate: Joi.date().required(),
    status: Joi.string().valid('completed', 'pending', 'failed').default('completed'),
  }),
};

const getPayments = {
  query: Joi.object().keys({
    billId: Joi.number().integer().min(1),
    tenantId: Joi.number().integer().min(1),
    status: Joi.string().valid('completed', 'pending', 'failed'),
    sortBy: Joi.string().pattern(/^[a-zA-Z]+:(asc|desc)$/),
    limit: Joi.number().integer().min(1).default(10),
    page: Joi.number().integer().min(1).default(1),
  }),
};

const getPayment = {
  params: Joi.object().keys({
    id: Joi.number().integer().required().min(1),
  }),
};

const updatePayment = {
  params: Joi.object().keys({
    id: Joi.number().integer().required().min(1),
  }),
  body: Joi.object()
    .keys({
      amount: Joi.number().min(0),
      status: Joi.string().valid('completed', 'pending', 'failed'),
    })
    .min(1),
};

const deletePayment = {
  params: Joi.object().keys({
    id: Joi.number().integer().required().min(1),
  }),
};

module.exports = {
  createPayment,
  getPayments,
  getPayment,
  updatePayment,
  deletePayment,
};
