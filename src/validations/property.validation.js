const Joi = require('joi');

const createProperty = {
  body: Joi.object().keys({
    name: Joi.string().required().min(3).max(100),
    address: Joi.string().required().min(5).max(200),
    type: Joi.string().required().valid('residential', 'commercial'),
  }),
};

const getProperties = {
  query: Joi.object().keys({
    name: Joi.string().min(1).max(100),
    type: Joi.string().valid('residential', 'commercial'),
    sortBy: Joi.string().pattern(/^[a-zA-Z]+:(asc|desc)$/),
    limit: Joi.number().integer().min(1).default(10),
    page: Joi.number().integer().min(1).default(1),
  }),
};

const getProperty = {
  params: Joi.object().keys({
    id: Joi.number().integer().required().min(1),
  }),
};

const updateProperty = {
  params: Joi.object().keys({
    id: Joi.number().integer().required().min(1),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string().min(3).max(100),
      address: Joi.string().min(5).max(200),
      type: Joi.string().valid('residential', 'commercial'),
    })
    .min(1),
};

const deleteProperty = {
  params: Joi.object().keys({
    id: Joi.number().integer().required().min(1),
  }),
};

module.exs = {
  createProperty,
  getProperties,
  getProperty,
  updateProperty,
  deleteProperty,
};
