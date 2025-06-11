const passport = require('passport');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { roleRights } = require('../config/roles');
const config = require('../config/config');
const logger = require('../config/logger');

// Callback function for passport authentication
const verifyCallback = (req, resolve, reject, requiredRights) => async (err, user, info) => {
  // Log errors and info in development mode for debugging
  if (config.env === 'development') {
    if (err) {
      logger.error('Passport Authentication Error:', err);
    }
    if (info) {
      const token = req.headers.authorization?.split(' ')[1] || 'no_token';
      const maskedToken = token.length > 10 ? `${token.slice(0, 5)}...${token.slice(-5)}` : token;
      logger.info(`Passport Info: ${info.message || info} | Token: ${maskedToken}`);
    }
  }

  // Check for authentication errors or missing user
  if (err || info || !user) {
    let message = 'Please authenticate';
    if (info && info.name === 'JsonWebTokenError') {
      message = 'Invalid or malformed JWT token';
    } else if (info && info.name === 'TokenExpiredError') {
      message = 'JWT token expired';
    }
    return reject(new ApiError(httpStatus.UNAUTHORIZED, message));
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
    // Validate Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      if (config.env === 'development') {
        logger.warn('Missing or invalid Authorization header:', authHeader || 'none');
      }
      return next(new ApiError(httpStatus.UNAUTHORIZED, 'Authorization header missing or invalid'));
    }

    return new Promise((resolve, reject) => {
      passport.authenticate('jwt', { session: false }, verifyCallback(req, resolve, reject, requiredRights))(req, res, next);
    })
      .then(() => next())
      .catch((err) => next(err));
  };

module.exports = auth;
