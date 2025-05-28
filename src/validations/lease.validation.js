const Joi = require('joi');

const createLease = {
  body: Joi.object().keys({
    unitId: Joi.number().integer().required().min(1),
    tenantId: Joi.number().integer().required().min(1),
    startDate: Joi.date().required(),
    endDate: Joi.date().required().greater(Joi.ref('startDate')),
    rentAmount: Joi.number().required().min(0),
    status: Joi.string().valid('active', 'expired', 'terminated').default('active'),
  }),
};

const getLeases = {
  query: Joi.object().keys({
    unitId: Joi.number().integer().min(1),
    tenantId: Joi.number().integer().min(1),
    status: Joi.string().valid('active', 'expired', 'terminated'),
    sortBy: Joi.string().pattern(/^[a-zA-Z]+:(asc|desc)$/),
    limit: Joi.number().integer().min(1).default(10),
    page: Joi.number().integer().min(1).default(1),
  }),
};

const getLease = {
  params: Joi.object().keys({
    id: Joi.number().integer().required().min(1),
  }),
};

const updateLease = {
  params: Joi.object().keys({
    id: Joi.number().integer().required().min(1),
  }),
  body: Joi.object()
    .keys({
      endDate: Joi.date().greater(Joi.ref('startDate', { adjust: (value, { original }) => original.startDate })),
      rentAmount: Joi.number().min(0),
      status: Joi.string().valid('active', 'expired', 'terminated'),
    })
    .min(1),
};

const deleteLease = {
  params: Joi.object().keys({
    id: Joi.number().integer().required().min(1),
  }),
};

module.exs = {
  createLease,
  getLeases,
  getLease,
  updateLease,
  deleteLease,
};
