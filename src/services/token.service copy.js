const jwt = require('jsonwebtoken');
const httpStatus = require('http-status');
const { Token } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Generate authentication tokens for a user
 * @param {User} user
 * @returns {Promise<{ accessToken: string, refreshToken: string }>}
 */
const generateAuthTokens = async (user) => {
  const accessToken = jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ sub: user.id }, process.env.JWT_SECRET, { expiresIn: '30d' });

  await Token.create({
    token: refreshToken,
    userId: user.id,
    type: 'refresh',
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    blacklisted: false,
  });

  return { accessToken, refreshToken };
};

/**
 * Verify a token
 * @param {string} token
 * @param {string} type
 * @returns {Promise<Token>}
 */
const verifyToken = async (token, type) => {
  const payload = jwt.verify(token, process.env.JWT_SECRET);
  const tokenDoc = await Token.findOne({ where: { token, type, userId: payload.sub, blacklisted: false } });
  if (!tokenDoc) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Token not found');
  }
  return tokenDoc;
};

/**
 * Revoke a token
 * @param {string} token
 * @returns {Promise<void>}
 */
const revokeToken = async (token) => {
  const tokenDoc = await Token.findOne({ where: { token, type: 'refresh', blacklisted: false } });
  if (!tokenDoc) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Token not found');
  }
  await tokenDoc.destroy();
};

module.exports = {
  generateAuthTokens,
  verifyToken,
  revokeToken,
};
