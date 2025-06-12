const Joi = require('joi');

const createMeterReading = {
  body: Joi.object()
    .keys({
      meterId: Joi.string().uuid().allow(null),
      submeterId: Joi.string().uuid().allow(null),
      readingValue: Joi.number().required(),
      readingDate: Joi.date().required(),
      consumption: Joi.number().allow(null),
      enteredByUserId: Joi.string().uuid().allow(null),
    })
    .xor('meterId', 'submeterId'), // Exactly one of meterId or submeterId must be provided
};

const getMeterReadings = {
  query: Joi.object().keys({
    meterId: Joi.string().uuid(),
    submeterId: Joi.string().uuid(),
    readingDate: Joi.date(),
    enteredByUserId: Joi.string().uuid(),
    sortBy: Joi.string().pattern(/^[a-zA-Z]+:(asc|desc)$/),
    limit: Joi.number().integer().min(1).default(10),
    page: Joi.number().integer().min(1).default(1),
    include: Joi.string(),
  }),
};

const getMeterReading = {
  params: Joi.object().keys({
    id: Joi.string().uuid().required(),
  }),
  query: Joi.object().keys({
    include: Joi.string(),
  }),
};

const updateMeterReading = {
  params: Joi.object().keys({
    id: Joi.string().uuid().required(),
  }),
  body: Joi.object()
    .keys({
      meterId: Joi.string().uuid().allow(null),
      submeterId: Joi.string().uuid().allow(null),
      readingValue: Joi.number(),
      readingDate: Joi.date(),
      consumption: Joi.number().allow(null),
      enteredByUserId: Joi.string().uuid().allow(null),
    })
    .min(1) // At least one field must be provided for update
    .xor('meterId', 'submeterId'), // Exactly one of meterId or submeterId if provided
};

const deleteMeterReading = {
  params: Joi.object().keys({
    id: Joi.string().uuid().required(),
  }),
};

const calculateConsumption = {
  body: Joi.object()
    .keys({
      meterId: Joi.string().uuid().allow(null),
      submeterId: Joi.string().uuid().allow(null),
      startDate: Joi.date().required(),
      endDate: Joi.date().required(),
    })
    .xor('meterId', 'submeterId'), // Exactly one of meterId or submeterId must be provided
};

module.exports = {
  createMeterReading,
  getMeterReadings,
  getMeterReading,
  updateMeterReading,
  deleteMeterReading,
  calculateConsumption,
};
