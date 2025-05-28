const Joi = require('joi');
const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const config = require('../config/config');
const logger = require('../config/logger');

// Middleware to validate incoming requests using Joi schemas
const validate = (schema) => (req, res, next) => {
  // Extract relevant schema parts (params, query, body)
  const validSchema = pick(schema, ['params', 'query', 'body']);
  const object = pick(req, Object.keys(validSchema));

  // Compile and validate the schema
  const { value, error } = Joi.compile(validSchema)
    .prefs({
      errors: { label: 'key', wrap: { label: false } }, // Improved error formatting
      abortEarly: false, // Collect all validation errors
      stripUnknown: true, // Remove unknown fields
    })
    .validate(object, { allowUnknown: false });

  // Handle validation errors
  if (error) {
    // Format error messages for better readability
    const errorMessage = error.details.map((details) => details.message.replace(/"/g, "'")).join('; ');

    // Log validation errors in development mode for debugging
    if (config.env === 'development') {
      logger.error('Validation Error:', error.details); // Replaced console.error with logger.error
    }

    return next(new ApiError(httpStatus.BAD_REQUEST, `Validation failed: ${errorMessage}`));
  }

  // Assign validated values to the request object
  Object.assign(req, value);
  return next();
};

module.exports = validate;
