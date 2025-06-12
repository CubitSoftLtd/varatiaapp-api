const Joi = require('joi');

const createMeterReading = {
  body: Joi.object()
    .keys({
      meterId: Joi.string().uuid().required(), // meterId is always required
      submeterId: Joi.string().uuid().optional().allow(null), // submeterId is optional
      readingValue: Joi.number().required(),
      readingDate: Joi.date().required(),
      consumption: Joi.number().required(),
    })
    .custom((value, helpers) => {
      // Ensure at least meterId is provided (handled by required above)
      // Ensure submeterId is valid only with meterId
      if (value.submeterId && !value.meterId) {
        return helpers.error('any.invalid', {
          key: 'submeterId',
          message: 'meterId is required when submeterId is provided',
        });
      }
      // No need to check !meterId && !submeterId since meterId is required
      return value;
    }),
};

const getMeterReadings = {
  query: Joi.object().keys({
    meterId: Joi.string().uuid(),
    submeterId: Joi.string().uuid(),
    readingDate: Joi.date(),
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
      submeterId: Joi.string()
        .uuid()
        .when('meterId', {
          is: Joi.exist(),
          then: Joi.string().uuid().optional().allow(null), // submeterId is optional when meterId exists
          otherwise: Joi.forbidden(),
        }),
      readingValue: Joi.number(),
      readingDate: Joi.date(),
      consumption: Joi.number(),
    })
    .min(1)
    .custom((value, helpers) => {
      if (value.submeterId && !value.meterId) {
        return helpers.error('any.invalid', {
          key: 'submeterId',
          message: 'meterId is required when submeterId is provided',
        });
      }
      return value;
    }),
};

const deleteMeterReading = {
  params: Joi.object().keys({
    id: Joi.string().uuid().required(),
  }),
};

const calculateConsumption = {
  body: Joi.object().keys({
    meterId: Joi.string().uuid().allow(null),
    submeterId: Joi.string().uuid().when('meterId', {
      is: Joi.exist(),
      then: Joi.string().uuid().required(),
      otherwise: Joi.forbidden(),
    }),
    startDate: Joi.date().required(),
    endDate: Joi.date().required(),
  }),
};

module.exports = {
  createMeterReading,
  getMeterReadings,
  getMeterReading,
  updateMeterReading,
  deleteMeterReading,
  calculateConsumption,
};
