const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { notificationService } = require('../services');

const getUserNotifications = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['limit', 'page', 'sortBy']);
  const options = pick(filter, ['limit', 'page', 'sortBy']);
  const result = await notificationService.getUserNotifications(req.user.id, options);
  res.send(result);
});

const markAsRead = catchAsync(async (req, res) => {
  const notification = await notificationService.markAsRead(req.params.id, req.user.id);
  if (!notification) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Notification not found');
  }
  res.send(notification);
});

module.exports = {
  getUserNotifications,
  markAsRead,
};
