const mongoose = require('mongoose');
const app = require('./app');
const config = require('./config/config');
const logger = require('./config/logger');
const { sequelize } = require('./models');

let server;

const startServer = async () => {
  try {
    // Authenticate Sequelize connection
    await sequelize.authenticate();
    logger.info('Connected to MySQL database');

    // Sync models (optional, can be removed if using seed.js)
    await sequelize.sync({ force: false });
    logger.info('Database models synchronized');

    // Start the server
    server = app.listen(config.port, () => {
      logger.info(`Listening to port ${config.port} in ${config.env} mode`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info('Server closed');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error) => {
  logger.error(error);
  exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
  logger.info('SIGTERM received');
  if (server) {
    server.close();
  }
});

startServer();
