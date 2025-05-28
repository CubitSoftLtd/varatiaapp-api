const Joi = require('joi');

const createBill = {
  body: Joi.object().keys({
    tenantId: Joi.number().integer().required().min(1),
    unitId: Joi.number().integer().required().min(1),
    amount: Joi.number().required().min(0),
    dueDate: Joi.date().required(),
    issueDate: Joi.date().required().less(Joi.ref('dueDate')),
    status: Joi.string().valid('pending', 'paid', 'overdue').default('pending'),
  }),
};

const getBills = {
  query: Joi.object().keys({
    tenantId: Joi.number().integer().min(1),
    unitId: Joi.number().integer().min(1),
    status: Joi.string().valid('pending', 'paid', 'overdue'),
    sortBy: Joi.string().pattern(/^[a-zA-Z]+:(asc|desc)$/),
    limit: Joi.number().integer().min(1).default(10),
    page: Joi.number().integer().min(1).default(1),
  }),
};

const getBill = {
  params: Joi.object().keys({
    id: Joi.number().integer().required().min(1),
  }),
};

const updateBill = {
  params: Joi.object().keys({
    id: Joi.number().integer().required().min(1),
  }),
  body: Joi.object()
    .keys({
      amount: Joi.number().min(0),
      dueDate: Joi.date(),
      status: Joi.string().valid('pending', 'paid', 'overdue'),
    })
    .min(1),
};

const deleteBill = {
  params: Joi.object().keys({
    id: Joi.number().integer().required().min(1),
  }),
};

module.exs = {
  createBill,
  getBills,
  getBill,
  updateBill,
  deleteBill,
};
