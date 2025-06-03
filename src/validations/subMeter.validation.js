const Joi = require('joi');

const createSubmeter = {
  body: Joi.object().keys({
    meterId: Joi.string()
      .guid({ version: ['uuidv4'] })
      .required(),
    unitId: Joi.string()
      .guid({ version: ['uuidv4'] })
      .required(),
    submeterNumber: Joi.string().required().min(1).max(50).trim(),
    status: Joi.string().valid('active', 'inactive', 'maintenance').default('active'),
  }),
};

const getSubmeters = {
  query: Joi.object().keys({
    meterId: Joi.string().guid({ version: ['uuidv4'] }),
    unitId: Joi.string().guid({ version: ['uuidv4'] }),
    submeterNumber: Joi.string().min(1).max(50),
    status: Joi.string().valid('active', 'inactive', 'maintenance'),
    sortBy: Joi.string().pattern(/^[a-zA-Z]+:(asc|desc)$/),
    limit: Joi.number().integer().min(1).default(10),
    page: Joi.number().integer().min(1).default(1),
  }),
};

const getSubmeter = {
  params: Joi.object().keys({
    id: Joi.string()
      .guid({ version: ['uuidv4'] })
      .required(),
  }),
};

const updateSubmeter = {
  params: Joi.object().keys({
    id: Joi.string()
      .guid({ version: ['uuidv4'] })
      .required(),
  }),
  body: Joi.object()
    .keys({
      meterId: Joi.string().guid({ version: ['uuidv4'] }),
      unitId: Joi.string().guid({ version: ['uuidv4'] }),
      submeterNumber: Joi.string().min(1).max(50).trim(),
      status: Joi.string().valid('active', 'inactive', 'maintenance'),
    })
    .min(1), // At least one field must be provided for update
};

const deleteSubmeter = {
  params: Joi.object().keys({
    id: Joi.string()
      .guid({ version: ['uuidv4'] })
      .required(),
  }),
};

module.exports = {
  createSubmeter,
  getSubmeters,
  getSubmeter,
  updateSubmeter,
  deleteSubmeter,
};
