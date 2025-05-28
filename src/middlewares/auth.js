const pass = require('passport');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { roleRights } = require('../config/roles');
const config = require('../config/config');
const logger = require('../config/logger'); // Added logger im

// Callback function for pass authentication
const verifyCallback = (req, resolve, reject, requiredRights) => async (err, user, info) => {
  // Log errors in development mode for debugging
  if (config.env === 'development' && (err || info)) {
    logger.error('Auth Error:', err || info); // Replaced console.error with logger.error
  }

  // Check for authentication errors or missing user
  if (err || info || !user) {
    return reject(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
  }

  // Attach user to request object
  req.user = user;

  // Check for required rights if any are specified
  if (requiredRights.length) {
    const userRights = roleRights.get(user.role);
    // Ensure user role exists in roleRights map
    if (!userRights) {
      return reject(new ApiError(httpStatus.FORBIDDEN, `Role '${user.role}' not recognized`));
    }
    const hasRequiredRights = requiredRights.every((requiredRight) => userRights.includes(requiredRight));
    // Check if user has required rights or is accessing their own data
    if (!hasRequiredRights && req.params.userId !== user.id) {
      return reject(new ApiError(httpStatus.FORBIDDEN, 'Forbidden'));
    }
  }

  resolve();
};

// Middleware to authenticate and authorize requests
const auth =
  (...requiredRights) =>
  async (req, res, next) => {
    return new Promise((resolve, reject) => {
      pass.authenticate('jwt', { session: false }, verifyCallback(req, resolve, reject, requiredRights))(req, res, next);
    })
      .then(() => next())
      .catch((err) => next(err));
  };

module.exports = auth;
