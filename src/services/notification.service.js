const { Notification } = require('../models');

const getUserNotifications = async (userId, options) => {
  const { limit = 10, page = 1, sortBy } = options;
  const offset = (page - 1) * limit;
  const order = sortBy ? [[sortBy.split(':')[0], sortBy.split(':')[1]]] : [['createdAt', 'DESC']];
  const { count, rows } = await Notification.findAndCountAll({
    where: { userId },
    limit,
    offset,
    order,
    attributes: ['id', 'message', 'isRead', 'createdAt'],
  });
  return {
    results: rows,
    page,
    limit,
    totalPages: Math.ceil(count / limit),
    totalResults: count,
  };
};

const markAsRead = async (notificationId, userId) => {
  const notification = await Notification.findOne({ where: { id: notificationId, userId } });
  if (!notification) {
    return null; // Will be handled as 404 by controller
  }
  await notification.update({ isRead: true });
  return notification;
};

module.exports = {
  getUserNotifications,
  markAsRead,
};
