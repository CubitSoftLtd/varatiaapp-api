const Joi = require('joi');

const createMeterReading = {
  body: Joi.object().keys({
    meterId: Joi.string().uuid().required(),
    submeterId: Joi.string().uuid().optional(),
    readingValue: Joi.number().positive().precision(2).required(),
    readingDate: Joi.date().iso().required(),
  }),
};

const getMeterReadings = {
  query: Joi.object().keys({
    meterId: Joi.string().uuid().optional(),
    submeterId: Joi.string().uuid().optional(),
    sortBy: Joi.string().optional(),
    limit: Joi.number().integer().min(1).default(10),
    page: Joi.number().integer().min(1).default(1),
  }),
};

const getMeterReading = {
  params: Joi.object().keys({
    id: Joi.string().uuid().required(),
  }),
};

const updateMeterReading = {
  params: Joi.object().keys({
    id: Joi.string().uuid().required(),
  }),
  body: Joi.object()
    .keys({
      readingValue: Joi.number().positive().precision(2).optional(),
      readingDate: Joi.date().iso().optional(),
    })
    .min(1), // At least one field must be provided for update
};

const deleteMeterReading = {
  params: Joi.object().keys({
    id: Joi.string().uuid().required(),
  }),
};

module.exports = {
  createMeterReading,
  getMeterReadings,
  getMeterReading,
  updateMeterReading,
  deleteMeterReading,
};
