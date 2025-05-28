const Sequelize = require('sequelize'); // Im Sequelize for error types
const httpStatus = require('http-status');
const config = require('../config/config');
const logger = require('../config/logger');
const ApiError = require('../utils/ApiError');

const errorConverter = (err, req, res, next) => {
  let error = err;
  if (!(error instanceof ApiError)) {
    let statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    let message = error.message || httpStatus[statusCode];

    // Handle Sequelize-specific errors
    if (error instanceof Sequelize.Error) {
      if (error instanceof Sequelize.ValidationError) {
        statusCode = httpStatus.BAD_REQUEST;
        message = error.errors.map((e) => e.message).join('; ');
      } else if (error instanceof Sequelize.UniqueConstraintError) {
        statusCode = httpStatus.CONFLICT;
        message = `Duplicate entry: ${error.errors.map((e) => e.message).join('; ')}`;
      } else if (error instanceof Sequelize.ForeignKeyConstraintError) {
        statusCode = httpStatus.BAD_REQUEST;
        message = 'Foreign key constraint violation';
      } else {
        statusCode = httpStatus.BAD_REQUEST; // Default for other Sequelize errors
      }
    } else if (!error.statusCode) {
      statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    }

    error = new ApiError(statusCode, message, false, err.stack);
  }
  next(error);
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let { statusCode, message } = err;
  if (config.env === 'production' && !err.isOperational) {
    statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    message = httpStatus[httpStatus.INTERNAL_SERVER_ERROR];
  }

  res.locals.errorMessage = err.message;

  const response = {
    code: statusCode,
    message,
    ...(config.env === 'development' && { stack: err.stack }),
  };

  if (config.env === 'development') {
    logger.error(err);
  }

  res.status(statusCode).send(response);
};

module.exs = {
  errorConverter,
  errorHandler,
};
