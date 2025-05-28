const Joi = require('joi');

const createMeterReading = {
  body: Joi.object().keys({
    unitId: Joi.number().integer().required().min(1),
    reading: Joi.number().required().min(0),
    date: Joi.date().required(),
  }),
};

const getMeterReadings = {
  query: Joi.object().keys({
    unitId: Joi.number().integer().min(1),
    sortBy: Joi.string().pattern(/^[a-zA-Z]+:(asc|desc)$/),
    limit: Joi.number().integer().min(1).default(10),
    page: Joi.number().integer().min(1).default(1),
  }),
};

const getMeterReading = {
  params: Joi.object().keys({
    id: Joi.number().integer().required().min(1),
  }),
};

const updateMeterReading = {
  params: Joi.object().keys({
    id: Joi.number().integer().required().min(1),
  }),
  body: Joi.object()
    .keys({
      reading: Joi.number().min(0),
      date: Joi.date(),
    })
    .min(1),
};

const deleteMeterReading = {
  params: Joi.object().keys({
    id: Joi.number().integer().required().min(1),
  }),
};

module.exs = {
  createMeterReading,
  getMeterReadings,
  getMeterReading,
  updateMeterReading,
  deleteMeterReading,
};
