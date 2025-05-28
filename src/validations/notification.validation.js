const Joi = require('joi');

const getNotifications = {
  query: Joi.object().keys({
    limit: Joi.number().integer().min(1).default(10),
    page: Joi.number().integer().min(1).default(1),
    sortBy: Joi.string()
      .pattern(/^[a-zA-Z]+:(asc|desc)$/)
      .default('createdAt:desc'),
  }),
};

const markAsRead = {
  params: Joi.object().keys({
    id: Joi.number().integer().required().min(1),
  }),
};

module.exports = {
  getNotifications,
  markAsRead,
};
