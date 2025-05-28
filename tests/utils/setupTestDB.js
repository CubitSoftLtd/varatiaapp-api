const { sequelize } = require('../../src/models');

const setupTestDB = () => {
  beforeAll(async () => {
    await sequelize.authenticate(); // Ensure connection is valid
    await sequelize.sync({ force: true }); // Recreate tables for each test run
  });

  beforeEach(async () => {
    await sequelize.truncate({ cascade: true }); // Clear all data, including related records
  });

  afterAll(async () => {
    await sequelize.close(); // Close the connection
  });
};

module.exports = setupTestDB;
